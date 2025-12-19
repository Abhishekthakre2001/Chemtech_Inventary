<?php
// Get the origin of the request
$origin = $_SERVER['HTTP_ORIGIN'] ?? "";

// Allowed origins
$allowed_origins = [
    "http://localhost:5173",
    "https://inventary.chemtechengineers.in"
];

// If the origin is allowed, echo it back
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
}

// Always send these
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}


require_once '../connection/connection.php';

try {
    // 1. Fetch all batches
    $batchStmt = $conn->prepare("SELECT * FROM standard_batch ORDER BY id DESC");
    $batchStmt->execute();
    $batchResult = $batchStmt->get_result();

    $batches = [];

    while ($batch = $batchResult->fetch_assoc()) {
        $batchId = $batch['id'];

        // 2. Fetch materials for this batch
        $materialsStmt = $conn->prepare("SELECT id, name, notes, percentage, quantity, unit FROM standard_batch_materials WHERE batch_id = ?");
        $materialsStmt->bind_param("i", $batchId);
        $materialsStmt->execute();
        $materialsResult = $materialsStmt->get_result();

        $materials = [];
        while ($material = $materialsResult->fetch_assoc()) {
            $materials[] = $material;
        }
        $materialsStmt->close();

        // Attach materials array to the batch
        $batch['materials'] = $materials;

        $batches[] = $batch;
    }
    $batchStmt->close();

    echo json_encode([
        'success' => true,
        'data' => $batches
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching batches: ' . $e->getMessage()
    ]);
} finally {
    $conn->close();
}
?>
