<?php


// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight (OPTIONS) requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();
include '../connection/connection.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers for JSON response
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
    // Get the JSON input
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        throw new Exception('Invalid input data: ' . json_last_error_msg());
    }

    // Validate required fields
    $requiredFields = ['id', 'supplierName', 'contactPerson', 'contactNumber', 'address'];
    $missingFields = [];
    
    foreach ($requiredFields as $field) {
        if (empty($data[$field])) {
            $missingFields[] = $field;
        } else {
            $data[$field] = test_input($data[$field]);
        }
    }

    if (!empty($missingFields)) {
        throw new Exception('Missing required fields: ' . implode(', ', $missingFields));
    }

    // Prepare SQL statement
    $sql = "UPDATE suppliers SET 
        supplier_name = ?, 
        contact_person = ?, 
        contact_number = ?, 
        email = ?, 
        address = ?, 
        products_provided = ?,
        bank_name = ?,
        bank_branch = ?,
        bank_city = ?,
        account_number = ?,
        ifsc_code = ?,
        updated_at = NOW()
        WHERE id = ?";

    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception('Database error: ' . $conn->error);
    }

    // Debug: Log the received data
    error_log('Received data for update: ' . print_r($data, true));
    
    // Assign values to variables first (can't use null coalescing directly in bind_param)
    $supplierName = $data['supplierName'];
    $contactPerson = $data['contactPerson'];
    $contactNumber = $data['contactNumber'];
    $email = $data['email'] ?? null;
    $address = $data['address'];
    $productsProvided = $data['provideproduct'] ?? null;
    $bankName = $data['bankName'] ?? null;
    $bankBranch = $data['bankBranch'] ?? null;
    $bankCity = $data['bankCity'] ?? null;
    $accountNumber = $data['bankAccount'] ?? null;
    $ifscCode = $data['ifscCode'] ?? null;
    $id = $data['id'];
    
    // Bind parameters - make sure the order matches the SQL statement
    $stmt->bind_param(
        'sssssssssssi',
        $supplierName,
        $contactPerson,
        $contactNumber,
        $email,
        $address,
        $productsProvided,
        $bankName,
        $bankBranch,
        $bankCity,
        $accountNumber,
        $ifscCode,
        $id
    );
    
    // Debug: Log the bound parameters
    error_log('Bound parameters: ' . print_r([
        'supplierName' => $data['supplierName'],
        'contactPerson' => $data['contactPerson'],
        'contactNumber' => $data['contactNumber'],
        'email' => $data['email'] ?? null,
        'address' => $data['address'],
        'provideproduct' => $data['provideproduct'] ?? null,
        'bankName' => $data['bankName'] ?? null,
        'bankBranch' => $data['bankBranch'] ?? null,
        'bankCity' => $data['bankCity'] ?? null,
        'bankAccount' => $data['bankAccount'] ?? null,
        'ifscCode' => $data['ifscCode'] ?? null,
        'id' => $data['id']
    ], true));

    // Execute the statement
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Supplier updated successfully'
            ]);
        } else {
            throw new Exception('No changes made or supplier not found');
        }
    } else {
        throw new Exception('Failed to update supplier: ' . $stmt->error);
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
