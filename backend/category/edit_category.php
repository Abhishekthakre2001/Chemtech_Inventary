<?php
session_start();
include '../connection/connection.php';
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

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
    if (empty($data['id']) || empty($data['name'])) {
        throw new Exception('Category ID and name are required');
    }
    
    $id = (int)$data['id'];
    $name = test_input($data['name']);
    
    // Check if category exists
    $checkStmt = $conn->prepare("SELECT id, name FROM category WHERE id = ?");
    $checkStmt->bind_param('i', $id);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows === 0) {
        throw new Exception('Category not found');
    }
    
    // Check if new name already exists
    $nameCheckStmt = $conn->prepare("SELECT id FROM category WHERE name = ? AND id != ?");
    $nameCheckStmt->bind_param('si', $name, $id);
    $nameCheckStmt->execute();
    $nameCheckResult = $nameCheckStmt->get_result();
    
    if ($nameCheckResult->num_rows > 0) {
        throw new Exception('Another category with this name already exists');
    }
    
    // Update category
    $updateStmt = $conn->prepare("UPDATE category SET name = ? WHERE id = ?");
    $updateStmt->bind_param('si', $name, $id);
    
    if ($updateStmt->execute()) {
        if ($updateStmt->affected_rows > 0) {
            $response = [
                'success' => true,
                'message' => 'Category updated successfully',
                'data' => [
                    'id' => $id,
                    'name' => $name
                ]
            ];
        } else {
            throw new Exception('No changes made to the category');
        }
    } else {
        throw new Exception('Failed to update category: ' . $conn->error);
    }
    
} catch (Exception $e) {
    http_response_code(400);
    $response = [
        'success' => false,
        'message' => $e->getMessage()
    ];
}

echo json_encode($response);
