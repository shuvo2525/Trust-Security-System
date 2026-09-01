<?php
/**
 * Trust Security System - CMS Get API
 * Returns latest site data from data/site-data.json
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$jsonFile = __DIR__ . '/../data/site-data.json';

if (file_exists($jsonFile)) {
    echo file_get_contents($jsonFile);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Data file not found']);
}
