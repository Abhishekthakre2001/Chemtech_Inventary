<?php
include '../connection/connection.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !is_array($data)) {
    echo "Invalid or empty input.";
    exit;
}

$successCount = 0;
$failCount = 0;

foreach ($data as $row) {
    $product = mysqli_real_escape_string($conn, $row['product']);
    $quantity = (int) $row['quantity'];
    $unit = mysqli_real_escape_string($conn, $row['unit']);
    $date = mysqli_real_escape_string($conn, $row['date']);
    $remark = mysqli_real_escape_string($conn, $row['remark']);

    if ($product && $quantity && $unit && $date) {
        // Step 1: Get current quantity from raw_materials
        $selectQuery = "SELECT quantity FROM raw_materials WHERE LOWER(raw_material_name) = LOWER('$product')";
        $result = mysqli_query($conn, $selectQuery);

        if ($result && mysqli_num_rows($result) > 0) {
            $rowData = mysqli_fetch_assoc($result);
            $currentQuantity = (float) $rowData['quantity'];

            // Step 2: Calculate new quantity
            $newQuantity = $currentQuantity - $quantity;
            if ($newQuantity < 0) {
                $failCount++;
                continue; // Skip if quantity goes negative
            }

            // Step 3: Update raw_materials quantity
            $updateQuery = "UPDATE raw_materials SET quantity = $newQuantity WHERE LOWER(raw_material_name) = LOWER('$product')";
            $updateResult = mysqli_query($conn, $updateQuery);

            if ($updateResult) {
                // Step 4: Insert into product_out
                $insertQuery = "INSERT INTO product_out (Product, Quantity, Unit, Date, Remark)
                                VALUES ('$product', $quantity, '$unit', '$date', '$remark')";

                if (mysqli_query($conn, $insertQuery)) {
                    $successCount++;
                } else {
                    $failCount++;
                }
            } else {
                $failCount++;
            }
        } else {
            $failCount++;
        }
    } else {
        $failCount++;
    }
}

echo "Inserted: $successCount, Failed: $failCount";
?>
