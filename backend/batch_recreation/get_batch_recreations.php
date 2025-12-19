<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database connection
require_once '../connection/connection.php';

// Function to log errors to a file
function logError($message) {
    $logFile = __DIR__ . '/batch_recreation_errors.log';
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($logFile, "[$timestamp] $message\n", FILE_APPEND);
}

try {
    // Log the request
    logError("Fetching batch recreations...");
    
    // First, check if the tables exist
    $tables = ['batch_recreation', 'batch', 'batch_recreation_raw_material_map'];
    $missingTables = [];
    
    foreach ($tables as $table) {
        $result = $conn->query("SHOW TABLES LIKE '$table'");
        if ($result->num_rows === 0) {
            $missingTables[] = $table;
        }
    }
    
    if (!empty($missingTables)) {
        $errorMsg = "Missing tables: " . implode(', ', $missingTables);
        logError($errorMsg);
        throw new Exception($errorMsg);
    }
    
    // Fetch all batch recreations with count of raw materials
    $query = "
        SELECT 
            br.id, 
            br.original_batch_id, 
            br.recreated_batch_name, 
            br.recreated_batch_date, 
            br.recreated_batch_size, 
            br.recreated_batch_unit, 
            br.created_at, 
            br.updated_at,
            b.batch_name as original_batch_name,
            (SELECT COUNT(*) FROM batch_recreation_raw_material_map WHERE batch_recreation_id = br.id) as raw_material_count
        FROM batch_recreation br
        LEFT JOIN batch b ON br.original_batch_id = b.id AND b.id IS NOT NULL
        WHERE br.id IS NOT NULL
        ORDER BY br.created_at DESC
    ";
    
    logError("Executing query: " . $query);
    
    $result = $conn->query($query);
    
    if ($result === false) {
        $errorMsg = "Query failed: " . $conn->error;
        logError($errorMsg);
        throw new Exception($errorMsg);
    }
    
    $batch_recreations = [];
    while ($row = $result->fetch_assoc()) {
        // Handle null values and escape output
        $escapedRow = [];
        foreach ($row as $key => $value) {
            if ($value === null) {
                $escapedRow[$key] = '';
            } else {
                $escapedRow[$key] = htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
            }
        }
        $batch_recreations[] = $escapedRow;
    }
    
    // Log the number of records found
    logError("Found " . count($batch_recreations) . " batch recreations");
    
    // Return success response
    $response = [
        'success' => true,
        'data' => $batch_recreations,
        'debug' => [
            'tables_checked' => $tables,
            'query_executed' => $query,
            'record_count' => count($batch_recreations)
        ]
    ];
    
    echo json_encode($response, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    $errorResponse = [
        'success' => false,
        'message' => 'Error fetching batch recreations: ' . $e->getMessage(),
        'error_details' => [
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString()
        ]
    ];
    
    http_response_code(500);
    echo json_encode($errorResponse, JSON_PRETTY_PRINT);
    
} finally {
    // Close connection
    if (isset($conn) && $conn) {
        $conn->close();
    }
}
