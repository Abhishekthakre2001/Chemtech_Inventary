<?php
session_start();
include '../connection/connection.php';

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// If OPTIONS request (preflight), stop here
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

error_reporting(E_ALL);
ini_set('display_errors', 1);

function test_input($data) {
    return htmlspecialchars(stripslashes(trim($data)));
}

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        throw new Exception('Invalid input data');
    }

    // Validate required fields
    $requiredFields = ['name', 'contactPerson', 'contactNumber', 'address'];
    foreach ($requiredFields as $field) {
        if (empty($data[$field])) {
            throw new Exception("Missing required field: $field");
        }
        $data[$field] = test_input($data[$field]);
    }

    // Prepare SQL
    $sql = "INSERT INTO suppliers (
        supplier_name,
        contact_person,
        contact_number,
        email,
        address,
        products_provided,
        bank_name,
        bank_branch,
        bank_city,
        account_number,
        ifsc_code,
        created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }

    // Map frontend keys to DB fields
    $supplierName    = $data['name'];
    $contactPerson   = $data['contactPerson'];
    $contactNumber   = $data['contactNumber'];
    $email           = $data['email'] ?? '';
    $address         = $data['address'];
    $products        = $data['products'] ?? '';
    $bankName        = $data['bankName'] ?? '';
    $bankBranch      = $data['branch'] ?? '';
    $bankCity        = $data['city'] ?? '';
    $accountNumber   = $data['accountNumber'] ?? '';
    $ifscCode        = $data['ifscCode'] ?? '';

    // Bind params
    $stmt->bind_param(
        'sssssssssss',
        $supplierName,
        $contactPerson,
        $contactNumber,
        $email,
        $address,
        $products,
        $bankName,
        $bankBranch,
        $bankCity,
        $accountNumber,
        $ifscCode
    );

    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Supplier added successfully',
            'supplier_id' => $stmt->insert_id
        ]);
    } else {
        throw new Exception('Execute failed: ' . $stmt->error);
    }

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
