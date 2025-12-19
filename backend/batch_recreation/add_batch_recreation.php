<?php
// Enable output buffering to prevent any accidental output
ob_start();

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle CORS preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Include database connection
require_once '../connection/connection.php';

// Function to log errors
function logError($message, $data = null) {
    $logMessage = '[' . date('Y-m-d H:i:s') . '] ' . $message . "\n";
    if ($data) {
        $logMessage .= 'Data: ' . print_r($data, true) . "\n";
    }
    error_log($logMessage, 3, __DIR__ . '/batch_recreation_errors.log');
}

// Function to send JSON response and exit
function sendJsonResponse($success, $message, $data = null, $statusCode = 200) {
    // Clear any previous output
    while (ob_get_level() > 0) {
        ob_end_clean();
    }

    http_response_code($statusCode);
    header('Content-Type: application/json');

    $response = [
        'success' => $success,
        'message' => $message
    ];

    if ($data !== null) {
        $response['data'] = $data;
    }

    echo json_encode($response);
    exit;
}

try {
    // Get POST data
    $jsonData = file_get_contents('php://input');
    $data = json_decode($jsonData, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON data: ' . json_last_error_msg());
    }

    // Log received data for debugging
    logError('Received data:', $data);

    // Validate required fields
    $requiredFields = [
        'original_batch_id', 
        'recreated_batch_name', 
        'recreated_batch_date', 
        'recreated_batch_size', 
        'recreated_batch_unit', 
        'materials'
    ];

    $missingFields = [];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || (is_string($data[$field]) && trim($data[$field]) === '')) {
            $missingFields[] = $field;
        }
    }

    if (!empty($missingFields)) {
        throw new Exception('Missing required fields: ' . implode(', ', $missingFields));
    }

    $original_batch_id    = (int)$data['original_batch_id'];
    $recreated_batch_name = trim($data['recreated_batch_name']);
    $recreated_batch_date = date("Y-m-d");
    $recreated_batch_size = (float)$data['recreated_batch_size'];
    $recreated_batch_unit = trim($data['recreated_batch_unit']);
    $materials            = $data['materials'];

    if ($original_batch_id <= 0) {
        throw new Exception('Invalid original batch ID');
    }
    if ($recreated_batch_size <= 0) {
        throw new Exception('Batch size must be greater than 0');
    }
    if (!is_array($materials) || empty($materials)) {
        throw new Exception('No materials provided');
    }

    // Start transaction
    if (!$conn->begin_transaction()) {
        throw new Exception('Failed to start transaction: ' . $conn->error);
    }

    try {
        // STEP 1: Validate stock first for ALL materials
        foreach ($materials as $index => $material) {
            if (empty($material['raw_material_id'])) {
                throw new Exception("Invalid material data at index $index: Missing raw_material_id");
            }

            $raw_material_id = (int)$material['raw_material_id'];
            $quantity_used   = (float)($material['quantity_used'] ?? 0);

            if ($raw_material_id <= 0 || $quantity_used <= 0) {
                throw new Exception("Invalid raw material or quantity at index $index");
            }

            // Lock row FOR UPDATE so no race condition
            $stockStmt = $conn->prepare("SELECT quantity FROM raw_materials WHERE id = ? FOR UPDATE");
            $stockStmt->bind_param("i", $raw_material_id);
            $stockStmt->execute();
            $stockStmt->bind_result($currentStock);
            $stockStmt->fetch();
            $stockStmt->close();

            if ($currentStock === null) {
                throw new Exception("Raw material not found (ID: $raw_material_id)");
            }
            if ($currentStock < $quantity_used) {
                throw new Exception("Insufficient stock for raw material ID $raw_material_id. Required: $quantity_used, Available: $currentStock");
            }
        }

        // STEP 2: Insert batch recreation record
        $stmt = $conn->prepare(
            "INSERT INTO batch_recreation 
             (original_batch_id, recreated_batch_name, recreated_batch_date, recreated_batch_size, recreated_batch_unit) 
             VALUES (?, ?, ?, ?, ?)"
        );
        $stmt->bind_param("issds", $original_batch_id, $recreated_batch_name, $recreated_batch_date, $recreated_batch_size, $recreated_batch_unit);
        $stmt->execute();
        $batch_recreation_id = $conn->insert_id;
        $stmt->close();

        // STEP 3: Insert batch materials + Deduct stock
        $materialStmt = $conn->prepare(
            "INSERT INTO batch_recreation_raw_material_map 
             (batch_recreation_id, raw_material_id, quantity_used, unit_used, percentage) 
             VALUES (?, ?, ?, ?, ?)"
        );

        foreach ($materials as $material) {
            $raw_material_id = (int)$material['raw_material_id'];
            $quantity_used   = (float)$material['quantity_used'];
            $unit_used       = $material['unit_used'] ?? 'kg';
            $percentage      = (float)($material['percentage'] ?? 0);

            // Insert into batch material map
            $materialStmt->bind_param("iidsd", $batch_recreation_id, $raw_material_id, $quantity_used, $unit_used, $percentage);
            $materialStmt->execute();

            // Deduct stock from raw_materials
            $updStmt = $conn->prepare("UPDATE raw_materials SET quantity = quantity - ? WHERE id = ?");
            $updStmt->bind_param("di", $quantity_used, $raw_material_id);
            $updStmt->execute();
            $updStmt->close();
        }
        $materialStmt->close();

        // Commit transaction
        $conn->commit();

        sendJsonResponse(true, "Batch recreation created successfully", [
            "id"             => $batch_recreation_id,
            "batch_name"     => $recreated_batch_name,
            "materials_count"=> count($materials)
        ]);

    } catch (Exception $e) {
        $conn->rollback();
        throw $e;
    }

} catch (Exception $e) {
    logError("Error in add_batch_recreation: " . $e->getMessage(), $data ?? null);
    sendJsonResponse(false, "Error: " . $e->getMessage(), null, 400);
}
