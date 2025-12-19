<?php

// ======================
// CORS SETTINGS
// ======================
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

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['id'])) {
        throw new Exception('Raw material ID is required');
    }

    $id = intval($data['id']);
    if ($id <= 0) {
        throw new Exception('Invalid raw material ID');
    }

    $sql = "DELETE FROM raw_materials WHERE id = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception('Database error: ' . $conn->error);
    }

    $stmt->bind_param('i', $id);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(['success' => true, 'message' => 'Raw material deleted successfully']);
        } else {
            throw new Exception('Raw material not found or already deleted');
        }
    } else {
        throw new Exception('Failed to delete raw material: ' . $stmt->error);
    }

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>