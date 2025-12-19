<?php

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight (OPTIONS) requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


session_start();
include '../connection/connection.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    // Get the JSON input
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['id'])) {
        throw new Exception('Supplier ID is required');
    }

    $supplierId = intval($data['id']);
    
    if ($supplierId <= 0) {
        throw new Exception('Invalid supplier ID');
    }

    // Prepare SQL statement
    $sql = "DELETE FROM suppliers WHERE id = ?";
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception('Database error: ' . $conn->error);
    }

    // Bind parameters
    $stmt->bind_param('i', $supplierId);

    // Execute the statement
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Supplier deleted successfully'
            ]);
        } else {
            throw new Exception('Supplier not found or already deleted');
        }
    } else {
        throw new Exception('Failed to delete supplier: ' . $stmt->error);
    }

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
