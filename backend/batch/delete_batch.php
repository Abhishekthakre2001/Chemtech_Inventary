<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include '../connection/connection.php'; // Adjust the path

// Enable error reporting (for debugging)
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['data']['id'])) {
        throw new Exception("Batch ID is required in payload");
    }

    $batchId = intval($data['data']['id']);

    // Start transaction
    $conn->begin_transaction();

    // Delete materials first (child table)
    $stmtMaterials = $conn->prepare("DELETE FROM standard_batch_materials WHERE batch_id = ?");
    $stmtMaterials->bind_param("i", $batchId);

    if (!$stmtMaterials->execute()) {
        throw new Exception("Failed to delete batch materials: " . $stmtMaterials->error);
    }
    $stmtMaterials->close();

    // Delete the batch itself (parent table)
    $stmtBatch = $conn->prepare("DELETE FROM standard_batch WHERE id = ?");
    $stmtBatch->bind_param("i", $batchId);

    if (!$stmtBatch->execute()) {
        throw new Exception("Failed to delete batch: " . $stmtBatch->error);
    }
    $stmtBatch->close();

    // Commit transaction
    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "Batch and related materials deleted successfully",
        "batchId" => $batchId
    ]);

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
} finally {
    $conn->close();
}
