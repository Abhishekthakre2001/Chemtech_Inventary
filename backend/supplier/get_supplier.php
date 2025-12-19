<?php
// Set headers for JSON response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

// Include database connection
require_once('../connection/connection.php');

// Initialize response array
$response = [
    'success' => false,
    'message' => 'Invalid request',
    'data' => null
];

// Check if supplier ID is provided
if (isset($_GET['id']) && !empty($_GET['id'])) {
    $supplierId = intval($_GET['id']);
    
    try {
        // Prepare and execute the query
        $stmt = $conn->prepare("SELECT * FROM suppliers WHERE id = ?");
        $stmt->bind_param("i", $supplierId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $supplierData = $result->fetch_assoc();
            
            // Format the response
            $response = [
                'success' => true,
                'message' => 'Supplier data retrieved successfully',
                'data' => [
                    'id' => $supplierData['id'],
                    'supplier_name' => $supplierData['supplier_name'],
                    'contact_person' => $supplierData['contact_person'],
                    'contact_number' => $supplierData['contact_number'],
                    'email' => $supplierData['email'],
                    'address' => $supplierData['address'],
                    'products_provided' => $supplierData['products_provided'],
                    'bank_name' => $supplierData['bank_name'],
                    'bank_branch' => $supplierData['bank_branch'],
                    'bank_city' => $supplierData['bank_city'],
                    'account_number' => $supplierData['account_number'],
                    'ifsc_code' => $supplierData['ifsc_code']
                ]
            ];
        } else {
            $response['message'] = 'Supplier not found';
        }
        
        $stmt->close();
    } catch (Exception $e) {
        $response['message'] = 'Error: ' . $e->getMessage();
    }
} else {
    $response['message'] = 'Supplier ID is required';
}

// Close the database connection
$conn->close();

// Return the JSON response
echo json_encode($response);
?>