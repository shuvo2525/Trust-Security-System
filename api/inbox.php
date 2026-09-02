<?php
/**
 * Trust Security System - Inquiries & Quotations Multi-Backend API
 * Saves to MySQL table `trust_inquiries` + data/inbox.json
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

$dataDir = __DIR__ . '/../data';
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0777, true);
}
$inboxFile = $dataDir . '/inbox.json';

// GET: Fetch all inquiries
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // 1. Try DB
    $dbInquiries = getInquiriesFromDB();
    if ($dbInquiries !== null && is_array($dbInquiries)) {
        echo json_encode($dbInquiries, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }

    // 2. Try JSON file
    if (file_exists($inboxFile)) {
        echo file_get_contents($inboxFile);
    } else {
        echo json_encode([]);
    }
    exit;
}

// POST: Save new inquiry
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $inquiry = null;

    if (!empty($rawInput)) {
        $inquiry = json_decode($rawInput, true);
    }

    if ($inquiry === null && isset($_POST['data'])) {
        $inquiry = json_decode($_POST['data'], true);
    }

    if (!$inquiry || !is_array($inquiry)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid inquiry data']);
        exit;
    }

    $inquiry['id'] = $inquiry['id'] ?? ('INQ-' . time());
    $inquiry['date'] = $inquiry['date'] ?? date('Y-m-d H:i:s');

    // 1. Save to DB
    $dbSaved = saveInquiryToDB($inquiry);

    // 2. Save to JSON file
    $inbox = [];
    if (file_exists($inboxFile)) {
        $existing = json_decode(file_get_contents($inboxFile), true);
        if (is_array($existing)) $inbox = $existing;
    }
    array_unshift($inbox, $inquiry);
    $jsonSaved = @file_put_contents($inboxFile, json_encode($inbox, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) !== false;

    echo json_encode([
        'success' => true,
        'message' => 'Quotation inquiry received and recorded successfully!',
        'id' => $inquiry['id']
    ]);
    exit;
}
