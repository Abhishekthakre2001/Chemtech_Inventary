<?php

// CORS headers - allow from any origin
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
session_start();
include '../connection/connection.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

$response = ['success' => false, 'data' => [], 'message' => ''];

try {
    // Prepare SQL statement to fetch all categories
    $sql = "SELECT 
        id,
        name
        FROM category 
        ORDER BY id DESC";

    $result = $conn->query($sql);
    
    if (!$result) {
        throw new Exception('Database error: ' . $conn->error);
    }
    
    $categories = [];
    while ($row = $result->fetch_assoc()) {
        $categories[] = [
            'id' => (int)$row['id'],
            'name' => $row['name']
        ];
    }
    
    $response['success'] = true;
    $response['data'] = $categories;
    
} catch (Exception $e) {
    http_response_code(500);
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
