<?php
// Enable error reporting for debugging
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Set headers first to prevent any output before them
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Origin, Accept');

// Handle CORS preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Function to send JSON response and exit
function sendResponse($success, $message = '', $data = null) {
    // Clear any previous output
    if (ob_get_length()) ob_clean();
    
    $response = [
        'success' => (bool)$success,
        'message' => (string)$message
    ];
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    // Ensure no output before this
    if (headers_sent()) {
        error_log('Headers already sent when trying to send response');
    }
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// Include database connection
require_once '../connection/connection.php';

// Log errors to a file
function logError($message, $data = null) {
    $logMessage = '[' . date('Y-m-d H:i:s') . '] ' . $message . PHP_EOL;
    if ($data !== null) {
        $logMessage .= 'Data: ' . print_r($data, true) . PHP_EOL;
    }
    error_log($logMessage, 3, __DIR__ . '/batch_recreation_errors.log');
}

try {
    // Get PUT data
    $json = file_get_contents('php://input');
    if ($json === false) {
        throw new Exception('Failed to read input data');
    }
    
    $data = json_decode($json, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON data: ' . json_last_error_msg());
    }
    
    // Log received data for debugging
    logError('Received update data:', $data);
    
    // Validate required fields
    $requiredFields = [
        'id',
        'recreated_batch_name',
        'recreated_batch_date',
        'recreated_batch_size',
        'recreated_batch_unit',
        'materials',
        'original_batch_id'
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
    
    $batch_recreation_id = (int)$data['id'];
    $recreated_batch_name = $data['recreated_batch_name'];
    $recreated_batch_date = $data['recreated_batch_date'];
    $recreated_batch_size = (float)$data['recreated_batch_size'];
    $recreated_batch_unit = $data['recreated_batch_unit'];
    $materials = $data['materials'];
    
    // Start transaction
    $conn->begin_transaction();
    
    // STEP 1: Get existing materials to restore their quantities back to inventory
    $stmt = $conn->prepare(
        "SELECT raw_material_id, quantity_used 
         FROM batch_recreation_raw_material_map 
         WHERE batch_recreation_id = ?"
    );
    $stmt->bind_param("i", $batch_recreation_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $existing_materials = [];
    while ($row = $result->fetch_assoc()) {
        $existing_materials[] = $row;
    }
    $stmt->close();
    
    // STEP 2: Restore previous quantities back to inventory (only for existing materials)
    foreach ($existing_materials as $existing_material) {
        $raw_material_id = (int)$existing_material['raw_material_id'];
        $quantity_to_restore = (float)$existing_material['quantity_used'];
        
        // Check if material still exists before restoring
        $checkStmt = $conn->prepare("SELECT id FROM raw_materials WHERE id = ?");
        $checkStmt->bind_param("i", $raw_material_id);
        $checkStmt->execute();
        $checkStmt->bind_result($exists);
        $checkStmt->fetch();
        $checkStmt->close();
        
        if ($exists) {
            $stmt = $conn->prepare("UPDATE raw_materials SET quantity = quantity + ? WHERE id = ?");
            $stmt->bind_param("di", $quantity_to_restore, $raw_material_id);
            if (!$stmt->execute()) {
                throw new Exception("Error restoring inventory for material ID $raw_material_id: " . $stmt->error);
            }
            $stmt->close();
        } else {
            // Log that we couldn't restore inventory for deleted material
            logError("Cannot restore inventory for deleted material ID: $raw_material_id, quantity: $quantity_to_restore");
        }
    }
    
    // STEP 3: Validate and map materials from standard_batch_materials to raw_materials
    $validatedMaterials = [];
    foreach ($materials as $index => $material) {
        if (empty($material['raw_material_id'])) {
            throw new Exception("Invalid material data at index $index: Missing raw_material_id");
        }
        
        $material_id = (int)$material['raw_material_id'];
        $quantity_used = (float)($material['quantity_used'] ?? 0);
        
        if ($material_id <= 0 || $quantity_used <= 0) {
            throw new Exception("Invalid raw material or quantity at index $index");
        }
        
        // First check if this is a standard_batch_materials ID that needs to be mapped to raw_materials
        $mappingStmt = $conn->prepare("SELECT name FROM standard_batch_materials WHERE id = ?");
        $mappingStmt->bind_param("i", $material_id);
        $mappingStmt->execute();
        $mappingStmt->bind_result($standardMaterialName);
        $mappingStmt->fetch();
        $mappingStmt->close();
        
        $actual_raw_material_id = null;
        $materialName = '';
        
        if ($standardMaterialName) {
            // This is a standard_batch_materials ID, find corresponding raw_material
            $findRawStmt = $conn->prepare("SELECT id, raw_material_name, quantity FROM raw_materials WHERE raw_material_name = ? FOR UPDATE");
            $findRawStmt->bind_param("s", $standardMaterialName);
            $findRawStmt->execute();
            $findRawStmt->bind_result($actual_raw_material_id, $materialName, $currentStock);
            $findRawStmt->fetch();
            $findRawStmt->close();
            
            if (!$actual_raw_material_id) {
                throw new Exception("Raw material '$standardMaterialName' (Standard ID: $material_id) not found in inventory. Please ensure this material exists in raw materials.");
            }
        } else {
            // This might be a direct raw_materials ID
            $stockStmt = $conn->prepare("SELECT id, raw_material_name, quantity FROM raw_materials WHERE id = ? FOR UPDATE");
            $stockStmt->bind_param("i", $material_id);
            $stockStmt->execute();
            $stockStmt->bind_result($actual_raw_material_id, $materialName, $currentStock);
            $stockStmt->fetch();
            $stockStmt->close();
            
            if (!$actual_raw_material_id) {
                throw new Exception("Raw material not found (ID: $material_id). This material may have been deleted from the system or is a template material that doesn't exist in inventory.");
            }
        }
        
        // Validate stock availability
        if ($currentStock < $quantity_used) {
            throw new Exception("Insufficient stock for raw material '$materialName' (ID: $actual_raw_material_id). Required: $quantity_used, Available: $currentStock");
        }
        
        // Store the validated material with actual raw_material_id
        $validatedMaterials[] = [
            'original_id' => $material_id,
            'raw_material_id' => $actual_raw_material_id,
            'quantity_used' => $quantity_used,
            'unit_used' => $material['unit_used'],
            'percentage' => $material['percentage']
        ];
    }
    
    // STEP 4: Update batch recreation record
    $stmt = $conn->prepare(
        "UPDATE batch_recreation 
         SET recreated_batch_name = ?, 
             recreated_batch_date = ?, 
             recreated_batch_size = ?, 
             recreated_batch_unit = ?, 
             original_batch_id = ?,
             updated_at = NOW() 
         WHERE id = ?"
    );
    
    if (!$stmt) {
        throw new Exception('Failed to prepare batch recreation update statement: ' . $conn->error);
    }
    
    $original_batch_id = (int)$data['original_batch_id'];
    $stmt->bind_param(
        "ssdsii", 
        $recreated_batch_name, 
        $recreated_batch_date, 
        $recreated_batch_size, 
        $recreated_batch_unit,
        $original_batch_id,
        $batch_recreation_id
    );
    
    if (!$stmt->execute()) {
        throw new Exception("Error updating batch recreation: " . $stmt->error);
    }
    $stmt->close();
    
    // STEP 5: Delete existing materials and insert new ones
    $deleteStmt = $conn->prepare("DELETE FROM batch_recreation_raw_material_map WHERE batch_recreation_id = ?");
    $deleteStmt->bind_param("i", $batch_recreation_id);
    if (!$deleteStmt->execute()) {
        throw new Exception("Error deleting existing materials: " . $deleteStmt->error);
    }
    $deleteStmt->close();
    
    // Insert new materials using validated raw_material_ids
    $insertStmt = $conn->prepare(
        "INSERT INTO batch_recreation_raw_material_map 
         (batch_recreation_id, raw_material_id, quantity_used, unit_used, percentage) 
         VALUES (?, ?, ?, ?, ?)"
    );
    
    foreach ($validatedMaterials as $material) {
        $raw_material_id = (int)$material['raw_material_id']; // Use the actual raw_material_id
        $quantity_used = (float)$material['quantity_used'];
        $unit_used = $material['unit_used'];
        $percentage = (float)$material['percentage'];
        
        $insertStmt->bind_param("iidsd", $batch_recreation_id, $raw_material_id, $quantity_used, $unit_used, $percentage);
        if (!$insertStmt->execute()) {
            throw new Exception("Error inserting material (ID: $raw_material_id): " . $insertStmt->error);
        }
    }
    $insertStmt->close();
    
    // Deduct stock from raw_materials
    foreach ($validatedMaterials as $material) {
        $raw_material_id = (int)$material['raw_material_id'];
        $quantity_used = (float)$material['quantity_used'];
        
        $updStmt = $conn->prepare("UPDATE raw_materials SET quantity = quantity - ? WHERE id = ?");
        $updStmt->bind_param("di", $quantity_used, $raw_material_id);
        if (!$updStmt->execute()) {
            throw new Exception("Error deducting inventory for material ID $raw_material_id: " . $updStmt->error);
        }
        $updStmt->close();
    }
    
    // Commit transaction
    $conn->commit();
    
    // Return success response
    sendResponse(true, 'Batch recreation updated successfully', [
        'id' => $batch_recreation_id,
        'name' => $recreated_batch_name,
        'date' => $recreated_batch_date,
        'size' => $recreated_batch_size,
        'unit' => $recreated_batch_unit,
        'material_count' => count($materials)
    ]);
    
} catch (Exception $e) {
    // Log the error
    logError('Error in update_batch_recreation: ' . $e->getMessage(), [
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ]);
    
    // Rollback transaction on error
    if (isset($conn)) {
        $conn->rollback();
    }
    
    // Send error response
    http_response_code(500);
    sendResponse(false, 'Error updating batch recreation: ' . $e->getMessage());
} finally {
    // Close statement and connection
    if (isset($stmt)) {
        $stmt->close();
    }
    if (isset($conn)) {
        $conn->close();
    }
}
