<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../connection/connection.php';

try {
    $input = json_decode(file_get_contents("php://input"), true);

    if (!$input || !isset($input['id'])) {
        throw new Exception("Batch ID is required");
    }

    $batchId   = intval($input['id']);
    $batchDate = $input['batchDate'];
    $batchName = $input['batchName'];
    $batchSize = $input['batchSize'];
    $batchUnit = $input['batchUnit'];
    $materials = $input['materials'];

    // ✅ Start transaction
    $conn->begin_transaction();

    // ✅ Update main batch table
    $stmt = $conn->prepare("UPDATE standard_batch 
                            SET batchDate=?, batchName=?, batchSize=?, batchUnit=? 
                            WHERE id=?");
    $stmt->bind_param("ssisi", $batchDate, $batchName, $batchSize, $batchUnit, $batchId);
    $stmt->execute();
    $stmt->close();

    // ✅ Step 1: Fetch old materials (store them first)
    $res = $conn->prepare("SELECT name, quantity FROM standard_batch_materials WHERE batch_id=?");
    $res->bind_param("i", $batchId);
    $res->execute();
    $res->bind_result($oldName, $oldQty);

    $oldMaterials = [];
    while ($res->fetch()) {
        $oldMaterials[] = ['name' => $oldName, 'quantity' => $oldQty];
    }
    $res->close();

    // ✅ Step 2: Return old materials back to stock
    foreach ($oldMaterials as $om) {
        $updStock = $conn->prepare("UPDATE raw_materials SET quantity = quantity + ? WHERE raw_material_name=?");
        $updStock->bind_param("ds", $om['quantity'], $om['name']);
        $updStock->execute();
        $updStock->close();
    }

    // ✅ Step 3: Delete old batch materials
    $delStmt = $conn->prepare("DELETE FROM standard_batch_materials WHERE batch_id=?");
    $delStmt->bind_param("i", $batchId);
    $delStmt->execute();
    $delStmt->close();

    // ✅ Step 4: Validate new stock availability
    foreach ($materials as $mat) {
        $name       = $mat['name'];
        $payloadQty = floatval($mat['quantity']);

        $stockRes = $conn->prepare("SELECT quantity FROM raw_materials WHERE raw_material_name=? FOR UPDATE");
        $stockRes->bind_param("s", $name);
        $stockRes->execute();
        $stockRes->bind_result($currentStock);
        $stockRes->fetch();
        $stockRes->close();

        if ($currentStock === null) {
            throw new Exception("Raw material '$name' not found");
        }

        if ($currentStock < $payloadQty) {
            throw new Exception("Insufficient stock for '$name'. Required: $payloadQty, Available: $currentStock");
        }
    }

    // ✅ Step 5: Insert new materials & deduct stock
    foreach ($materials as $mat) {
        $name       = $mat['name'];
        $payloadQty = floatval($mat['quantity']);
        $percentage = floatval($mat['percentage']);
        $unit       = $mat['unit'];

        // Insert into batch materials
        $insStmt = $conn->prepare("INSERT INTO standard_batch_materials 
            (batch_id, name, quantity, percentage, unit) 
            VALUES (?, ?, ?, ?, ?)");
        $insStmt->bind_param("isdss", $batchId, $name, $payloadQty, $percentage, $unit);
        $insStmt->execute();
        $insStmt->close();

        // Deduct from stock
        $rmStmt = $conn->prepare("UPDATE raw_materials SET quantity = quantity - ? WHERE raw_material_name = ?");
        $rmStmt->bind_param("ds", $payloadQty, $name);
        $rmStmt->execute();
        $rmStmt->close();
    }

    // ✅ Commit transaction
    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "Batch updated successfully"
    ]);

} catch (Exception $e) {
    if ($conn->errno === 0) { 
        // rollback only if transaction is open
        $conn->rollback();
    }

    http_response_code(400);
    error_log("Batch Update Error: " . $e->getMessage());
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
} finally {
    $conn->close();
}
