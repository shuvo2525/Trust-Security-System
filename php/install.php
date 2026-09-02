<?php
/**
 * Trust Security System - Database & Platform Installer
 * Web UI for configuring MySQL Database and Storage on cPanel, InfinityFree, and Shared Hosts
 */

header('Content-Type: text/html; charset=utf-8');

$message = '';
$status = '';
$configFile = __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $db_host = trim($_POST['db_host'] ?? 'localhost');
    $db_name = trim($_POST['db_name'] ?? '');
    $db_user = trim($_POST['db_user'] ?? '');
    $db_pass = trim($_POST['db_pass'] ?? '');
    $db_port = intval($_POST['db_port'] ?? 3306);
    $storage_mode = trim($_POST['storage_mode'] ?? 'auto');

    if ($storage_mode === 'mysql' || (!empty($db_name) && !empty($db_user))) {
        // Test connection
        try {
            $dsn = "mysql:host={$db_host};port={$db_port};dbname={$db_name};charset=utf8mb4";
            $pdo = new PDO($dsn, $db_user, $db_pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);

            // Create tables
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS `trust_site_data` (
                  `id` int(11) NOT NULL AUTO_INCREMENT,
                  `key_name` varchar(64) NOT NULL UNIQUE,
                  `data_content` longtext NOT NULL,
                  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  PRIMARY KEY (`id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

            // Seed initial data if table empty
            $stmt = $pdo->query("SELECT COUNT(*) FROM `trust_site_data` WHERE `key_name` = 'site_main_data'");
            if ($stmt->fetchColumn() == 0) {
                $jsonFile = __DIR__ . '/../data/site-data.json';
                if (file_exists($jsonFile)) {
                    $initJson = file_get_contents($jsonFile);
                    $ins = $pdo->prepare("INSERT INTO `trust_site_data` (`key_name`, `data_content`) VALUES ('site_main_data', :content)");
                    $ins->execute([':content' => $initJson]);
                }
            }

            // Write to config.php
            $configCode = "<?php\n"
                . "/**\n * Trust Security System - Database & Platform Configuration\n */\n\n"
                . "define('DB_HOST', " . var_export($db_host, true) . ");\n"
                . "define('DB_USER', " . var_export($db_user, true) . ");\n"
                . "define('DB_PASS', " . var_export($db_pass, true) . ");\n"
                . "define('DB_NAME', " . var_export($db_name, true) . ");\n"
                . "define('DB_PORT', {$db_port});\n\n"
                . "define('STORAGE_MODE', " . var_export($storage_mode, true) . ");\n"
                . "define('API_SECRET_KEY', 'trust_security_secret_2026');\n";

            file_put_contents($configFile, $configCode);

            $message = "Database connected successfully! Tables created and seeded.";
            $status = "success";
        } catch (Exception $e) {
            $message = "MySQL Connection Error: " . $e->getMessage();
            $status = "danger";
        }
    } else {
        // Flat file JSON mode
        $configCode = "<?php\n"
            . "/**\n * Trust Security System - Database & Platform Configuration\n */\n\n"
            . "define('DB_HOST', 'localhost');\n"
            . "define('DB_USER', '');\n"
            . "define('DB_PASS', '');\n"
            . "define('DB_NAME', '');\n"
            . "define('DB_PORT', 3306);\n\n"
            . "define('STORAGE_MODE', 'json');\n"
            . "define('API_SECRET_KEY', 'trust_security_secret_2026');\n";

        file_put_contents($configFile, $configCode);
        $message = "Configured in Flat-File JSON Mode! Ready for file-based shared hosting.";
        $status = "success";
    }
}

// Current config values
require_once $configFile;
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Database & Platform Installer - Trust Security System</title>
  <link rel="stylesheet" href="../assets/css/plugins/bootstrap.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    body {
      background: radial-gradient(circle at 10% 20%, #0d1f47 0%, #040915 90%);
      font-family: 'Plus Jakarta Sans', sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .install-card {
      background: #ffffff;
      border-radius: 20px;
      padding: 36px;
      max-width: 580px;
      width: 100%;
      box-shadow: 0 25px 60px rgba(0,0,0,0.4);
    }
    .install-card h2 {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
    }
    .form-label {
      font-weight: 700;
      font-size: 13px;
      color: #334155;
    }
    .form-control, .form-select {
      border-radius: 10px;
      padding: 10px 14px;
      border: 1.5px solid #cbd5e1;
    }
    .btn-install {
      background: linear-gradient(135deg, #0ea5e9, #0284c7);
      color: #ffffff;
      font-weight: 800;
      border: none;
      padding: 12px 24px;
      border-radius: 10px;
      width: 100%;
    }
  </style>
</head>
<body>
  <div class="install-card">
    <div class="d-flex align-items-center gap-3 mb-3">
      <img src="../assets/img/logo/logo1.png" alt="Logo" style="max-height: 48px; background: #f8fafc; padding: 6px; border-radius: 8px;">
      <div>
        <h2 class="mb-0">Database & Hosting Installer</h2>
        <small class="text-muted">cPanel, InfinityFree, Apache & Shared Hosting Setup</small>
      </div>
    </div>

    <?php if (!empty($message)): ?>
      <div class="alert alert-<?= $status ?> d-flex align-items-center gap-2">
        <i class="fa-solid <?= $status === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation' ?>"></i>
        <div><?= htmlspecialchars($message) ?></div>
      </div>
    <?php endif; ?>

    <form method="POST">
      <div class="mb-3">
        <label class="form-label">Storage Architecture Mode</label>
        <select name="storage_mode" class="form-select" id="storageSelect" onchange="toggleDbFields()">
          <option value="auto" <?= (defined('STORAGE_MODE') && STORAGE_MODE === 'auto') ? 'selected' : '' ?>>Auto-Detect (MySQL with JSON Fallback - Recommended)</option>
          <option value="mysql" <?= (defined('STORAGE_MODE') && STORAGE_MODE === 'mysql') ? 'selected' : '' ?>>MySQL Database (cPanel / phpMyAdmin / InfinityFree)</option>
          <option value="json" <?= (defined('STORAGE_MODE') && STORAGE_MODE === 'json') ? 'selected' : '' ?>>Flat-File JSON Storage (No MySQL required)</option>
        </select>
      </div>

      <div id="dbFields">
        <div class="row g-2 mb-3">
          <div class="col-8">
            <label class="form-label">Database Host</label>
            <input type="text" name="db_host" class="form-control" value="<?= defined('DB_HOST') ? htmlspecialchars(DB_HOST) : 'localhost' ?>" placeholder="localhost or sqlXXX.infinityfree.com">
          </div>
          <div class="col-4">
            <label class="form-label">Port</label>
            <input type="number" name="db_port" class="form-control" value="<?= defined('DB_PORT') ? DB_PORT : 3306 ?>">
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Database Name</label>
          <input type="text" name="db_name" class="form-control" value="<?= defined('DB_NAME') ? htmlspecialchars(DB_NAME) : '' ?>" placeholder="e.g. cpaneluser_trustdb">
        </div>

        <div class="row g-2 mb-3">
          <div class="col-6">
            <label class="form-label">Database Username</label>
            <input type="text" name="db_user" class="form-control" value="<?= defined('DB_USER') ? htmlspecialchars(DB_USER) : '' ?>" placeholder="e.g. cpaneluser_admin">
          </div>
          <div class="col-6">
            <label class="form-label">Database Password</label>
            <input type="password" name="db_pass" class="form-control" value="<?= defined('DB_PASS') ? htmlspecialchars(DB_PASS) : '' ?>" placeholder="••••••••">
          </div>
        </div>
      </div>

      <button type="submit" class="btn btn-install mb-3">
        <i class="fa-solid fa-bolt me-1"></i> Save Configuration & Test Connection
      </button>
    </form>

    <div class="d-flex justify-content-between align-items-center pt-2 border-top">
      <a href="../admin.html" class="text-decoration-none fw-bold small text-primary"><i class="fa-solid fa-arrow-left me-1"></i> Open Admin Panel</a>
      <a href="../index.html" class="text-decoration-none fw-bold small text-muted">Visit Website <i class="fa-solid fa-arrow-right ms-1"></i></a>
    </div>
  </div>

  <script>
    function toggleDbFields() {
      const mode = document.getElementById("storageSelect").value;
      const dbFields = document.getElementById("dbFields");
      if (mode === "json") {
        dbFields.style.display = "none";
      } else {
        dbFields.style.display = "block";
      }
    }
    toggleDbFields();
  </script>
</body>
</html>
