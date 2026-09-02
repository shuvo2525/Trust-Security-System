<?php
/**
 * Trust Security System - Database Connection & Abstraction Layer
 * Auto-creates tables, supports MySQL & PDO, graceful fallback to flat-file JSON
 */

require_once __DIR__ . '/config.php';

function getDBConnection() {
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    if (!defined('DB_NAME') || empty(DB_NAME) || !defined('DB_USER') || empty(DB_USER)) {
        return null;
    }

    try {
        $host = defined('DB_HOST') && !empty(DB_HOST) ? DB_HOST : 'localhost';
        $port = defined('DB_PORT') && !empty(DB_PORT) ? DB_PORT : 3306;
        $dbname = DB_NAME;
        $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4";
        
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
        ];

        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        
        // Ensure tables exist
        initDatabaseTables($pdo);

        return $pdo;
    } catch (Exception $e) {
        error_log("MySQL Connection failed: " . $e->getMessage());
        return null;
    }
}

function initDatabaseTables($pdo) {
    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `trust_site_data` (
              `id` int(11) NOT NULL AUTO_INCREMENT,
              `key_name` varchar(64) NOT NULL UNIQUE,
              `data_content` longtext NOT NULL,
              `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              PRIMARY KEY (`id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `trust_inquiries` (
              `id` int(11) NOT NULL AUTO_INCREMENT,
              `inquiry_id` varchar(64) NOT NULL,
              `client_name` varchar(255) NOT NULL,
              `phone` varchar(64) NOT NULL,
              `branch` varchar(64) DEFAULT 'General',
              `service_type` varchar(128) DEFAULT 'General',
              `message` text DEFAULT NULL,
              `status` varchar(32) DEFAULT 'New',
              `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
              PRIMARY KEY (`id`),
              KEY `idx_inq_status` (`status`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
    } catch (Exception $e) {
        error_log("Table creation error: " . $e->getMessage());
    }
}

function getSiteDataFromDB() {
    $pdo = getDBConnection();
    if (!$pdo) return null;

    try {
        $stmt = $pdo->prepare("SELECT `data_content` FROM `trust_site_data` WHERE `key_name` = 'site_main_data' LIMIT 1");
        $stmt->execute();
        $row = $stmt->fetch();
        if ($row && !empty($row['data_content'])) {
            return json_decode($row['data_content'], true);
        }
    } catch (Exception $e) {
        error_log("DB Read Error: " . $e->getMessage());
    }
    return null;
}

function saveSiteDataToDB($data) {
    $pdo = getDBConnection();
    if (!$pdo) return false;

    try {
        $json = json_encode($data, JSON_UNESCAPED_UNICODE);
        $stmt = $pdo->prepare("
            INSERT INTO `trust_site_data` (`key_name`, `data_content`) 
            VALUES ('site_main_data', :content) 
            ON DUPLICATE KEY UPDATE `data_content` = :content_update
        ");
        return $stmt->execute([
            ':content' => $json,
            ':content_update' => $json
        ]);
    } catch (Exception $e) {
        error_log("DB Save Error: " . $e->getMessage());
        return false;
    }
}

function getInquiriesFromDB() {
    $pdo = getDBConnection();
    if (!$pdo) return null;

    try {
        $stmt = $pdo->query("SELECT * FROM `trust_inquiries` ORDER BY `id` DESC");
        $rows = $stmt->fetchAll();
        $inquiries = [];
        foreach ($rows as $r) {
            $inquiries[] = [
                'id' => $r['inquiry_id'],
                'date' => $r['created_at'],
                'name' => $r['client_name'],
                'phone' => $r['phone'],
                'branch' => $r['branch'],
                'service' => $r['service_type'],
                'message' => $r['message'],
                'status' => $r['status']
            ];
        }
        return $inquiries;
    } catch (Exception $e) {
        error_log("DB Inquiries Error: " . $e->getMessage());
        return null;
    }
}

function saveInquiryToDB($inq) {
    $pdo = getDBConnection();
    if (!$pdo) return false;

    try {
        $stmt = $pdo->prepare("
            INSERT INTO `trust_inquiries` (`inquiry_id`, `client_name`, `phone`, `branch`, `service_type`, `message`, `status`)
            VALUES (:inq_id, :name, :phone, :branch, :service, :message, :status)
        ");
        return $stmt->execute([
            ':inq_id' => $inq['id'] ?? 'INQ-' . time(),
            ':name' => $inq['name'] ?? 'Anonymous',
            ':phone' => $inq['phone'] ?? 'N/A',
            ':branch' => $inq['branch'] ?? 'General',
            ':service' => $inq['service'] ?? 'General',
            ':message' => $inq['message'] ?? '',
            ':status' => $inq['status'] ?? 'New'
        ]);
    } catch (Exception $e) {
        error_log("DB Save Inquiry Error: " . $e->getMessage());
        return false;
    }
}
