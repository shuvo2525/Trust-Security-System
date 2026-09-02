<?php
/**
 * Trust Security System - Database & Platform Configuration
 * Compatible with cPanel, InfinityFree, Shared Hosting, and Localhost
 */

// MySQL Database Credentials (Leave blank if using JSON file storage mode)
define('DB_HOST', 'localhost');
define('DB_USER', '');        // e.g. 'root' or 'epiz_12345678' or 'cpanel_user'
define('DB_PASS', '');        // e.g. 'your_db_password'
define('DB_NAME', '');        // e.g. 'trust_security_db' or 'epiz_12345678_db'
define('DB_PORT', 3306);

// Storage Engine: 'auto' (tries MySQL first, falls back to JSON), 'mysql', or 'json'
define('STORAGE_MODE', 'auto');

// Security Key for Admin API (Optional)
define('API_SECRET_KEY', 'trust_security_secret_2026');
