<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Handle preflight request
    http_response_code(200);
    exit();
}

require_once '../connection/connection.php';

try {
    if (!isset($_GET['batch_id']) || empty($_GET['batch_id'])) {
        throw new Exception("Batch ID is required");
    }

    $batchId = intval($_GET['batch_id']);

    // Fetch materials for this batch
    $stmt = $conn->prepare("
        SELECT rm.id, rm.raw_material_name as name, 
               brm.quantity_used as quantity, brm.unit_used as unit, 
               brm.notes, brm.percentage
        FROM batch_raw_material_map brm
        JOIN raw_materials rm ON brm.raw_material_id = rm.id
        WHERE brm.batch_id = ?
    ");
    $stmt->bind_param("i", $batchId);
    $stmt->execute();
    $result = $stmt->get_result();

    $materials = [];
    while ($row = $result->fetch_assoc()) {
        $materials[] = $row;
    }
    $stmt->close();

    echo json_encode([
        'success' => true,
        'data' => $materials
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>
