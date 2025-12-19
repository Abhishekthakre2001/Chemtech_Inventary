<?php
session_start();
include '../connection/connection.php';

error_reporting(E_ALL);
ini_set('display_errors', 1);

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = [
    "http://localhost:5173",
    "https://inventary.chemtechengineers.in"
];

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
}

header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

try {
    $sql = "SELECT id, raw_material_name as name, quantity, quantity_unit 
            FROM raw_materials 
            WHERE quantity > 0
            ORDER BY raw_material_name ASC";
    $result = $conn->query($sql);
    
    if (!$result) {
        throw new Exception('Database error: ' . $conn->error);
    }
    
    $materials = [];
    while ($row = $result->fetch_assoc()) {
        $materials[] = [
            'id' => (int)$row['id'],
            'name' => $row['name'],
            'quantity' => (float)$row['quantity'],
            'quantity_unit' => $row['quantity_unit']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'data' => $materials
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
