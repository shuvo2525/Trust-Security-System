<?php
/**
 * Trust Security System - Customer Inquiries & Quotations API
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dataDir = __DIR__ . '/../data';
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}
$inboxFile = $dataDir . '/inbox.json';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($inboxFile)) {
        echo file_get_contents($inboxFile);
    } else {
        echo json_encode([]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $inquiry = json_decode($input, true);
    if (!$inquiry) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid data']);
        exit;
    }

    $inbox = [];
    if (file_exists($inboxFile)) {
        $existing = json_decode(file_get_contents($inboxFile), true);
        if (is_array($existing)) $inbox = $existing;
    }

    array_unshift($inbox, $inquiry);
    file_put_contents($inboxFile, json_encode($inbox, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    echo json_encode(['success' => true, 'message' => 'Inquiry submitted successfully!']);
}
