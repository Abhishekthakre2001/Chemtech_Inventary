<?php
// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Include DB connection
require_once '../connection/connection.php';

// Read JSON input
$data = json_decode(file_get_contents("php://input"), true);

$email = isset($data['email']) ? trim($data['email']) : '';
$password = isset($data['password']) ? trim($data['password']) : '';

$response = [];

if ($email === '' || $password === '') {
    echo json_encode([
        "status" => "error",
        "message" => "Email and Password are required"
    ]);
    exit;
}

try {
    // Prepare statement to prevent SQL injection
    $stmt = $conn->prepare("SELECT * FROM login WHERE email = ? LIMIT 1");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();

        // Here we're comparing plain text (change to password_hash/verify for security)
        if ($password === $user['password']) {
            // Generate token
            $token = bin2hex(random_bytes(16));

            // Set cookie (valid for 1 day, accessible via HTTP only)
            setcookie("auth_token", $token, time() + 86400, "/", "", false, true);

            // Send response
            $response = [
                "status" => "success",
                "message" => "Login successful",
                "token" => $token,
                "user" => [
                    "id" => $user['id'],
                    "name" => $user['name'],
                    "email" => $user['email']
                ]
            ];
        } else {
            $response = [
                "status" => "error",
                "message" => "Invalid password"
            ];
        }
    } else {
        $response = [
            "status" => "error",
            "message" => "User not found"
        ];
    }
} catch (Exception $e) {
    $response = [
        "status" => "error",
        "message" => $e->getMessage()
    ];
}

echo json_encode($response);
?>
