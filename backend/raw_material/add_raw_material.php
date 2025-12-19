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

// Enable error reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Sanitize helper
function test_input($data) {
    return htmlspecialchars(stripslashes(trim($data)));
}

try {
    // Read JSON input
    $json = file_get_contents('php://input');
    $payload = json_decode($json, true);

    if (!isset($payload['data']) || !is_array($payload['data'])) {
        throw new Exception('Invalid payload format: expected "data" array');
    }

    $stmt = $conn->prepare("
        INSERT INTO raw_materials (
            purchase_code,
            raw_material_name,
            raw_material_code,
            rate_landed,
            date_in,
            expiry_date,
            category_id,
            quantity,
            quantity_unit,
            purchase_price,
            supplier_id,
            created_at,
            updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ");

    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }

    $successCount = 0;

    foreach ($payload['data'] as $item) {
        // Validate required fields
        $required = [
            'purchaseCode', 'rawMaterial', 'rawMaterialCode', 'rateLanded',
            'dateIn', 'expiryDate', 'category', 'quantity',
            'quantityUnit', 'purchasePrice', 'supplier'
        ];
        foreach ($required as $field) {
            if (!isset($item[$field]) || $item[$field] === '') {
                throw new Exception("Missing field: $field");
            }
        }

        // Sanitize and typecast
        $purchaseCode    = test_input($item['purchaseCode']);
        $rawMaterial     = test_input($item['rawMaterial']);
        $rawMaterialCode = test_input($item['rawMaterialCode']);
        $rateLanded      = floatval($item['rateLanded']);
        $dateIn          = test_input($item['dateIn']);
        $expiryDate      = test_input($item['expiryDate']);
        $categoryId      = test_input($item['category']);   // store string
        $quantity        = floatval($item['quantity']);
        $quantityUnit    = test_input($item['quantityUnit']);
        $purchasePrice   = floatval($item['purchasePrice']);
        $supplierId      = test_input($item['supplier']);   // store string

        // All string except numbers → fix binding
        $stmt->bind_param(
            "sssdsssdsds",
            $purchaseCode,
            $rawMaterial,
            $rawMaterialCode,
            $rateLanded,
            $dateIn,
            $expiryDate,
            $categoryId,
            $quantity,
            $quantityUnit,
            $purchasePrice,
            $supplierId
        );

        if ($stmt->execute()) {
            $successCount++;
        } else {
            throw new Exception("Insert failed: " . $stmt->error);
        }
    }

    echo json_encode([
        'success' => true,
        'message' => "$successCount raw materials added successfully"
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
