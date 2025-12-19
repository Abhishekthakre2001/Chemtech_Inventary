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
    // Get id from query string
    if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
        throw new Exception("Invalid or missing id");
    }

    $id = (int)$_GET['id'];

    // Query to fetch raw material by id
    $sql = "SELECT * FROM raw_materials WHERE id = $id";
    $result = $conn->query($sql);

    if (!$result) {
        throw new Exception('Database error: ' . $conn->error);
    }

    if ($row = $result->fetch_assoc()) {
        echo json_encode([
            'success' => true,
            'data' => $row   // ✅ return full row (all columns)
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Raw material not found'
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>
