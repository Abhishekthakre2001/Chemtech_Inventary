<?php
session_start();
require_once '../connection/connection.php';

header('Content-Type: application/json');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    // Get all batches with their raw material counts
    $query = "SELECT b.*, COUNT(brm.id) as raw_material_count 
              FROM batch b 
              LEFT JOIN batch_raw_material_map brm ON b.id = brm.batch_id 
              GROUP BY b.id 
              ORDER BY b.batch_date DESC, b.id DESC";
    
    $result = $conn->query($query);
    
    if ($result === false) {
        throw new Exception("Error executing query: " . $conn->error);
    }
    
    $batches = [];
    while ($row = $result->fetch_assoc()) {
        $batches[] = [
            'id' => $row['id'],
            'batch_name' => $row['batch_name'],
            'batch_date' => $row['batch_date'],
            'batch_size' => $row['batch_size'],
            'batch_unit' => $row['batch_unit'],
            'raw_material_count' => $row['raw_material_count'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at']
        ];
    }
    
    echo json_encode(['success' => true, 'data' => $batches]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

$conn->close();
?>
