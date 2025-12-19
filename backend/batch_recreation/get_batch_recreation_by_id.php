<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle CORS preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Include database connection
require_once '../connection/connection.php';

try {
    // Validate and read ID parameter
    if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Missing or invalid id'
        ]);
        exit;
    }
    $id = (int)$_GET['id'];

    // Fetch single batch recreation details by ID
    $stmt = $conn->prepare(
        "SELECT br.id, br.original_batch_id, br.recreated_batch_name, br.recreated_batch_date,
                br.recreated_batch_size, br.recreated_batch_unit, br.created_at, br.updated_at,
                b.batch_name AS original_batch_name
         FROM batch_recreation br
         LEFT JOIN batch b ON br.original_batch_id = b.id
         WHERE br.id = ?"
    );
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $batch_recreation = $result->fetch_assoc();
    $stmt->close();
    $stmt = null;

    if (!$batch_recreation) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Batch recreation not found'
        ]);
        exit;
    }

    // Fetch materials for this batch recreation with collation fix
    $stmt = $conn->prepare(
        "SELECT 
            COALESCE(rm.id, rm_by_name.id) AS raw_material_id,
            COALESCE(rm.raw_material_name, rm_by_name.raw_material_name, sbm.name) AS name,
            m.quantity_used,
            m.unit_used,
            m.percentage
         FROM batch_recreation_raw_material_map m
         LEFT JOIN raw_materials rm ON rm.id = m.raw_material_id
         LEFT JOIN standard_batch_materials sbm ON sbm.id = m.raw_material_id
         LEFT JOIN raw_materials rm_by_name 
            ON rm_by_name.raw_material_name COLLATE utf8mb4_general_ci 
               = sbm.name COLLATE utf8mb4_general_ci
         WHERE m.batch_recreation_id = ?"
    );
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $materialsResult = $stmt->get_result();
    $materials = [];
    while ($row = $materialsResult->fetch_assoc()) {
        $materials[] = $row;
    }
    $stmt->close();
    $stmt = null;

    $batch_recreation['materials'] = $materials;

    // Return success response with single record
    echo json_encode([
        'success' => true,
        'data' => $batch_recreation
    ]);

} catch (Exception $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching batch recreations: ' . $e->getMessage()
    ]);

} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
    $conn->close();
}
