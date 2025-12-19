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
    // Simple query to fetch all raw materials with category & supplier ids (joins can be added later)
    $sql = "SELECT 
               *
            FROM raw_materials
            ORDER BY id DESC";

    $result = $conn->query($sql);
    if (!$result) {
        throw new Exception('Database error: ' . $conn->error);
    }

    $materials = [];
    while ($row = $result->fetch_assoc()) {
        // Calculate Stock Status
        $quantity = isset($row['quantity']) ? (float)$row['quantity'] : 0;
        $row['stockStatus'] = $quantity > 0 ? 'In Stock' : 'Out of Stock';

        // Calculate Expiry Status
        $expiryDate = $row['expiry_date'];
        if ($expiryDate === null || $expiryDate === '' || $expiryDate === '0000-00-00') {
            $row['expiryStatus'] = 'N/A';
        } else {
            $today = new DateTime();
            $exp   = new DateTime($expiryDate);
            $row['expiryStatus'] = $exp < $today ? 'Expired' : 'Not Expired';
        }

        $materials[] = $row;
    }

    echo json_encode([
        'success' => true,
        'data' => $materials
    ]);

    $conn->close();

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>