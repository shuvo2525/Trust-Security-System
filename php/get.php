<?php
/**
 * Trust Security System - Multi-Backend Universal Get API
 * Fetches latest content from MySQL Database or data/site-data.json
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

// 1. Try MySQL Database
try {
    $dbData = getSiteDataFromDB();
    if ($dbData !== null && is_array($dbData) && !empty($dbData)) {
        echo json_encode($dbData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }
} catch (Exception $e) {
    error_log("DB Read Exception: " . $e->getMessage());
}

// 2. Try site-data.json
$jsonFile = __DIR__ . '/../data/site-data.json';
if (file_exists($jsonFile)) {
    $raw = file_get_contents($jsonFile);
    if (!empty($raw)) {
        echo $raw;
        exit;
    }
}

// 3. Fallback: Parse default-content.js if json missing
$jsFile = __DIR__ . '/../data/default-content.js';
if (file_exists($jsFile)) {
    $js = file_get_contents($jsFile);
    if (preg_match('/window\.DEFAULT_SITE_DATA\s*=\s*(\{.*\});/s', $js, $matches)) {
        echo $matches[1];
        exit;
    }
}

http_response_code(404);
echo json_encode(['error' => 'No site data found']);
