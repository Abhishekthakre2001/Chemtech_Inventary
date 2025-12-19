<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Include database connection
require_once '../connection/connection.php';

try {
    // Get all batches
    $stmt = $conn->prepare(
        "SELECT id, batch_name, batch_date, batch_size, batch_unit, created_at, updated_at 
         FROM batch 
         ORDER BY batch_date DESC"
    );
    $stmt->execute();
    $result = $stmt->get_result();
    
    $batches = [];
    while ($row = $result->fetch_assoc()) {
        $batches[] = $row;
    }
    
    // Return success response
    echo json_encode([
        'success' => true,
        'data' => $batches
    ]);
    
} catch (Exception $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching batches: ' . $e->getMessage()
    ]);
    
} finally {
    // Close statement and connection
    if (isset($stmt)) {
        $stmt->close();
    }
    $conn->close();
}
