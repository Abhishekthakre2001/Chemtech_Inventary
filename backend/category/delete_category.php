<?php
session_start();
include '../connection/connection.php';
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

try {
    // Get the JSON input
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        throw new Exception('Invalid input data');
    }
    
    // Validate required fields
    if (empty($data['id'])) {
        throw new Exception('Category ID is required');
    }
    
    $id = (int)$data['id'];
    
    // First check if category exists and get its name for the response
    $checkStmt = $conn->prepare("SELECT id, name FROM category WHERE id = ?");
    $checkStmt->bind_param('i', $id);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows === 0) {
        throw new Exception('Category not found');
    }
    
    $category = $checkResult->fetch_assoc();
    
    // Check if category is in use (optional: add this check if you have foreign key constraints)
    // $inUseStmt = $conn->prepare("SELECT COUNT(*) as count FROM products WHERE category_id = ?");
    // $inUseStmt->bind_param('i', $id);
    // $inUseStmt->execute();
    // $inUseResult = $inUseStmt->get_result()->fetch_assoc();
    // 
    // if ($inUseResult['count'] > 0) {
    //     throw new Exception('Cannot delete category: it is being used by one or more products');
    // }
    
    // Delete category
    $deleteStmt = $conn->prepare("DELETE FROM category WHERE id = ?");
    $deleteStmt->bind_param('i', $id);
    
    if ($deleteStmt->execute()) {
        if ($deleteStmt->affected_rows > 0) {
            $response = [
                'success' => true,
                'message' => 'Category deleted successfully',
                'data' => [
                    'id' => $id,
                    'name' => $category['name']
                ]
            ];
        } else {
            throw new Exception('No category was deleted');
        }
    } else {
        throw new Exception('Failed to delete category: ' . $conn->error);
    }
    
} catch (Exception $e) {
    http_response_code(400);
    $response = [
        'success' => false,
        'message' => $e->getMessage()
    ];
}

echo json_encode($response);
