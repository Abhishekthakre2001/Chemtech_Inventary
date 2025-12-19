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

// Function to validate input
function test_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

try {
    // Get the JSON input
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        throw new Exception('Invalid input data');
    }

    // Validate required fields
    if (empty($data['name'])) {
        throw new Exception('Category name is required');
    }
    
    $name = test_input($data['name']);
    
    // Check if category already exists
    $checkStmt = $conn->prepare("SELECT id FROM category WHERE name = ?");
    $checkStmt->bind_param('s', $name);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows > 0) {
        throw new Exception('Category already exists');
    }
    
    // Insert new category
    $stmt = $conn->prepare("INSERT INTO category (name) VALUES (?)");
    $stmt->bind_param('s', $name);
    
    if ($stmt->execute()) {
        $response = [
            'success' => true,
            'message' => 'Category added successfully',
            'data' => [
                'id' => $stmt->insert_id,
                'name' => $name
            ]
        ];
    } else {
        throw new Exception('Failed to add category: ' . $conn->error);
    }
    
} catch (Exception $e) {
    http_response_code(400);
    $response = [
        'success' => false,
        'message' => $e->getMessage()
    ];
}

echo json_encode($response);
