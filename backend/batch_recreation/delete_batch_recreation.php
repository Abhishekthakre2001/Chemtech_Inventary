<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['id'])) {
        echo json_encode(['success' => false, 'message' => 'ID is required']);
        exit;
    }
    
    $id = (int)$input['id'];
    
    if ($id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Valid ID required']);
        exit;
    }
    
    require_once '../connection/connection.php';
    
    $conn->begin_transaction();
    
    // Delete materials mapping first
    $stmt = $conn->prepare("DELETE FROM batch_recreation_raw_material_map WHERE batch_recreation_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    
    // Delete main record
    $stmt = $conn->prepare("DELETE FROM batch_recreation WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    
    if ($stmt->affected_rows === 0) {
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => 'Record not found']);
        exit;
    }
    
    $conn->commit();
    echo json_encode(['success' => true, 'message' => 'Deleted successfully']);
    
} catch (Exception $e) {
    if (isset($conn)) $conn->rollback();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>