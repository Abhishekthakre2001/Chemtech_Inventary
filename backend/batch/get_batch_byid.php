<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Handle preflight request
    http_response_code(200);
    exit();
}

require_once '../connection/connection.php';

try {
    if (!isset($_GET['id']) || empty($_GET['id'])) {
        throw new Exception("Batch id is required");
    }

    $batchId = intval($_GET['id']);

    // Fetch batch by id
    $batchStmt = $conn->prepare("SELECT * FROM standard_batch WHERE id = ?");
    $batchStmt->bind_param("i", $batchId);
    $batchStmt->execute();
    $batchResult = $batchStmt->get_result();

    if ($batchResult->num_rows === 0) {
        throw new Exception("Batch not found");
    }

    $batch = $batchResult->fetch_assoc();
    $batchStmt->close();

    // Fetch materials for this batch
    $materialsStmt = $conn->prepare("SELECT id, name, notes, percentage, quantity, unit FROM standard_batch_materials WHERE batch_id = ?");
    $materialsStmt->bind_param("i", $batchId);
    $materialsStmt->execute();
    $materialsResult = $materialsStmt->get_result();

    $materials = [];
    while ($material = $materialsResult->fetch_assoc()) {
        $materials[] = $material;
    }
    $materialsStmt->close();

    $batch['materials'] = $materials;

    echo json_encode([
        'success' => true,
        'data' => $batch
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
} finally {
    $conn->close();
}
?>
