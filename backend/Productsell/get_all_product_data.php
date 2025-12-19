<?php
include '../connection/connection.php';

$query = "SELECT id, Product, Quantity, Unit, Date, Remark FROM product_out ORDER BY id DESC";


$result = mysqli_query($conn, $query);

$sr = 1;
$html = '';

if ($result && mysqli_num_rows($result) > 0) {
    while ($row = mysqli_fetch_assoc($result)) {
        echo '<tr class="hover:bg-gray-50">';
        echo '<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">' . $sr++ . '</td>';
        echo '<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#PRD-' . str_pad($row['id'], 3, '0', STR_PAD_LEFT) . '</td>';
        echo '<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">' . htmlspecialchars($row['Product']) . '</td>';
        echo '<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">' . date('d/m/Y', strtotime($row['Date'])) . '</td>';
        echo '<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">' . $row['Quantity'] . ' ' . $row['Unit'] . '</td>';

        echo '</tr>';
    }

} else {
    $html .= '<tr><td colspan="12" class="text-center py-4 text-sm text-gray-500">No data found.</td></tr>';
}

echo $html;
?>