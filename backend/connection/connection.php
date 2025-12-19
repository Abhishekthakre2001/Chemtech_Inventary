<?php
$host = "localhost";
$username = "chemtech_chemtech_inventory";
$password = "1pIR-5rK[1I}=oYf";
$database = "chemtech_chemtech_inventory"; // change this to your DB name

$conn = new mysqli($host, $username, $password, $database);
$conn->set_charset("utf8mb4");

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
