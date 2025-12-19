<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include '../connection/connection.php';  

error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        throw new Exception("Invalid JSON input");
    }

    $requiredBatchFields = ['batchName', 'batchDate', 'batchSize', 'batchUnit', 'materials'];
    foreach ($requiredBatchFields as $field) {
        if (empty($data[$field])) {
            throw new Exception("Missing required field: $field");
        }
    }

    if (!is_array($data['materials']) || count($data['materials']) === 0) {
        throw new Exception("Materials must be a non-empty array");
    }

    // Start transaction
    $conn->begin_transaction();

    // Insert batch
    $stmtBatch = $conn->prepare("INSERT INTO standard_batch (batchDate, batchName, batchSize, batchUnit) VALUES (?, ?, ?, ?)");
    if (!$stmtBatch) {
        throw new Exception("Prepare failed: " . $conn->error);
    }

    $stmtBatch->bind_param(
        "ssds",
        $data['batchDate'],
        $data['batchName'],
        $data['batchSize'],
        $data['batchUnit']
    );

    if (!$stmtBatch->execute()) {
        throw new Exception("Batch insert failed: " . $stmtBatch->error);
    }

    $batchId = $stmtBatch->insert_id;
    $stmtBatch->close();

    // Prepare statements
    $stmtGetStock = $conn->prepare("SELECT quantity FROM raw_materials WHERE id = ?");
    $stmtUpdateStock = $conn->prepare("UPDATE raw_materials SET quantity = ? WHERE id = ?");
    $stmtMaterial = $conn->prepare("INSERT INTO standard_batch_materials (batch_id, name, notes, percentage, quantity, unit) VALUES (?, ?, ?, ?, ?, ?)");

    if (!$stmtGetStock || !$stmtUpdateStock || !$stmtMaterial) {
        throw new Exception("Prepare failed: " . $conn->error);
    }

    foreach ($data['materials'] as $material) {
        $requiredMaterialFields = ['rawMaterial', 'quantity', 'percentage', 'unit', 'materialId'];
        foreach ($requiredMaterialFields as $mfield) {
            if (!isset($material[$mfield]) || $material[$mfield] === '') {
                throw new Exception("Missing material field: $mfield");
            }
        }

        $materialId = intval($material['materialId']);
        $requestedQty = floatval($material['quantity']);

        // 🔎 Check current stock
        $stmtGetStock->bind_param("i", $materialId);
        $stmtGetStock->execute();
        $result = $stmtGetStock->get_result();
        $row = $result->fetch_assoc();

        if (!$row) {
            throw new Exception("Material with ID $materialId not found");
        }

        $currentQty = floatval($row['quantity']);
$materialName = $material['rawMaterial'];

        if ($requestedQty > $currentQty) {
            // Not enough stock → rollback
            $conn->rollback();
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => "Insufficient stock for material '$materialName'. Current quantity: $currentQty, Requested: $requestedQty"
            ]);
            exit();
        }

        // ✅ Subtract from stock
        $newQty = $currentQty - $requestedQty;
        $stmtUpdateStock->bind_param("di", $newQty, $materialId);
        if (!$stmtUpdateStock->execute()) {
            throw new Exception("Failed to update stock: " . $stmtUpdateStock->error);
        }

        // ✅ Insert into batch_materials
        $name = $material['rawMaterial'];
        $notes = $material['notes'] ?? '';
        $percentage = floatval($material['percentage']);
        $unit = $material['unit'];

        $stmtMaterial->bind_param("issdds", $batchId, $name, $notes, $percentage, $requestedQty, $unit);
        if (!$stmtMaterial->execute()) {
            throw new Exception("Material insert failed: " . $stmtMaterial->error);
        }
    }

    // Cleanup
    $stmtGetStock->close();
    $stmtUpdateStock->close();
    $stmtMaterial->close();

    // Commit
    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Batch and materials saved successfully, inventory updated',
        'batchId' => $batchId
    ]);

} catch (Exception $e) {
    if ($conn->errno) {
        $conn->rollback();
    }
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
