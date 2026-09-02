-- ========================================================
-- Trust Security System - Database Schema for MySQL / phpMyAdmin
-- Compatible with MySQL 5.7+, MySQL 8.0+, MariaDB, cPanel, InfinityFree
-- ========================================================

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
