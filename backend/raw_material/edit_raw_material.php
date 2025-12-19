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

function test_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        throw new Exception('Invalid input data');
    }

    $required = ['id', 'purchaseCode', 'rawMaterialName', 'rawMaterialCode', 'rateLanded', 'dateIn', 'categoryId', 'quantity', 'quantityUnit', 'purchasePrice', 'supplierId'];
    $missing = [];
    foreach ($required as $field) {
        if (!isset($data[$field]) || $data[$field] === '') {
            $missing[] = $field;
        } else {
            $data[$field] = test_input($data[$field]);
        }
    }
    if ($missing) {
        throw new Exception('Missing required fields: ' . implode(', ', $missing));
    }

  // Assign vars
$id              = intval($data['id']);
$purchaseCode    = $data['purchaseCode'];
$rawMaterialName = $data['rawMaterialName'];
$rawMaterialCode = $data['rawMaterialCode'];
$rateLanded      = floatval($data['rateLanded']);
$dateIn          = $data['dateIn'];
$expiryDate      = $data['expiryDate'] ?? null;
$categoryId      = test_input($data['categoryId']); 
$quantity        = floatval($data['quantity']);
$quantityUnit    = $data['quantityUnit'];
$purchasePrice   = floatval($data['purchasePrice']);
$supplierId      = test_input($data['supplierId']);


    $sql = "UPDATE raw_materials SET 
                purchase_code = ?,
                raw_material_name = ?,
                raw_material_code = ?,
                rate_landed = ?,
                date_in = ?,
                expiry_date = ?,
                category_id = ?,
                quantity = ?,
                quantity_unit = ?,
                purchase_price = ?,
                supplier_id = ?,
                updated_at = NOW()
            WHERE id = ?";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception('Database error: ' . $conn->error);
    }

    $stmt->bind_param(
        'sssdsssdsdsi',
        $purchaseCode,
        $rawMaterialName,
        $rawMaterialCode,
        $rateLanded,
        $dateIn,
        $expiryDate,
        $categoryId,
        $quantity,
        $quantityUnit,
        $purchasePrice,
        $supplierId,
        $id
    );

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(['success' => true, 'message' => 'Raw material updated successfully']);
        } else {
            throw new Exception('No changes made or raw material not found');
        }
    } else {
        throw new Exception('Failed to update raw material: ' . $stmt->error);
    }

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>