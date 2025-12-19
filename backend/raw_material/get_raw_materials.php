<?php
include '../connection/connection.php';

$query = "SELECT raw_material_name FROM raw_materials";
$result = mysqli_query($conn, $query);

$materials = [];

if ($result && mysqli_num_rows($result) > 0) {
    while ($row = mysqli_fetch_assoc($result)) {
        $materials[] = $row['raw_material_name'];
    }
}

header('Content-Type: application/json');
echo json_encode([
    'success' => true,
    'data' => $materials
]);
?>
