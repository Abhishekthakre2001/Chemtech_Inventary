<?php

// ------------------------------
// CORS HEADERS (MUST BE FIRST)
// ------------------------------
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 86400"); // cache for 1 day
header("Content-Type: application/json; charset=UTF-8");

include '../connection/connection.php';

header('Content-Type: application/json');

// IMPORTANT: charset
$conn->set_charset("utf8mb4");

$response = [
    "success" => false,
    "data" => []
];

$sql = "SELECT * FROM suppliers ORDER BY id DESC";
$result = $conn->query($sql);

if (!$result) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $conn->error
    ]);
    exit;
}

while ($row = $result->fetch_assoc()) {

    // UTF-8 clean
    foreach ($row as $key => $value) {
        if (is_string($value)) {
            $row[$key] = mb_convert_encoding($value, 'UTF-8', 'UTF-8');
        }
    }

    // MAP DB → API RESPONSE
    $response['data'][] = [
        "id" => (string)$row['id'],
        "supplierName" => $row['supplier_name'],
        "contactPerson" => $row['contact_person'],
        "contactNumber" => $row['contact_number'],
        "email" => $row['email'],
        "address" => $row['address'],
        "provideproduct" => $row['products_provided'],
        "bankName" => $row['bank_name'],
        "bankBranch" => $row['bank_branch'],
        "bankCity" => $row['bank_city'],
        "bankAccount" => $row['account_number'],
        "ifscCode" => $row['ifsc_code'],
        "createdAt" => $row['created_at'],
        "updatedAt" => $row['updated_at']
    ];
}

$response['success'] = true;

echo json_encode($response, JSON_UNESCAPED_UNICODE);
$conn->close();
exit;
