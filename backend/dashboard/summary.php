<?php
// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Include database connection
require_once '../connection/connection.php';

// Prepare response
$response = array();

try {
    // 1. Get total count of raw materials
    $sql_total = "SELECT COUNT(*) AS total_count FROM raw_materials";
    $result_total = $conn->query($sql_total);
    $total_count = $result_total->fetch_assoc()['total_count'];

    // 2. Get count of raw materials with quantity < 20
    $sql_low_count = "SELECT COUNT(*) AS low_stock_count FROM raw_materials WHERE quantity < 20";
    $result_low_count = $conn->query($sql_low_count);
    $low_stock_count = $result_low_count->fetch_assoc()['low_stock_count'];

    // 3. Get list of raw materials with quantity < 20
    $sql_low_list = "SELECT * FROM raw_materials WHERE quantity < 20";
    $result_low_list = $conn->query($sql_low_list);
    $low_stock_list = [];
    while ($row = $result_low_list->fetch_assoc()) {
        $low_stock_list[] = $row;
    }

    // Response
    $response = [
        "status" => "success",
        "total_count" => $total_count,
        "low_stock_count" => $low_stock_count,
        "low_stock_list" => $low_stock_list
    ];

} catch (Exception $e) {
    $response = [
        "status" => "error",
        "message" => $e->getMessage()
    ];
}

// Output JSON
header('Content-Type: application/json');
echo json_encode($response);
?>
