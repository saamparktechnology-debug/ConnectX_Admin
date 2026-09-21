-- ConnectX Dating App - Migration for new features
-- Run this against existing connecto_dating_app database

USE connecto_dating_app;

-- =====================================================
-- 1. NEW TABLES
-- =====================================================

-- KYC documents for female users (number entry only, no photos)
CREATE TABLE IF NOT EXISTS user_kyc (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    aadhar_number VARCHAR(20) DEFAULT NULL,
    pan_number VARCHAR(20) DEFAULT NULL,
    bank_account_number VARCHAR(50) DEFAULT NULL,
    bank_ifsc VARCHAR(20) DEFAULT NULL,
    bank_name VARCHAR(200) DEFAULT NULL,
    bank_holder_name VARCHAR(200) DEFAULT NULL,
    upi_id VARCHAR(200) DEFAULT NULL,
    voice_note_url VARCHAR(500) DEFAULT NULL,
    voice_note_language VARCHAR(50) DEFAULT NULL,
    verification_status ENUM('pending','approved','rejected') DEFAULT 'pending',
    rejection_reason TEXT DEFAULT NULL,
    verified_by INT DEFAULT NULL,
    verified_at DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Withdrawal requests for female users
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('bank','upi') NOT NULL,
    account_number VARCHAR(50) DEFAULT NULL,
    ifsc_code VARCHAR(20) DEFAULT NULL,
    bank_name VARCHAR(200) DEFAULT NULL,
    upi_id VARCHAR(200) DEFAULT NULL,
    status ENUM('pending','approved','rejected','completed') DEFAULT 'pending',
    admin_id INT DEFAULT NULL,
    rejection_reason TEXT DEFAULT NULL,
    processed_at DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Call queue for auto-redirect system
CREATE TABLE IF NOT EXISTS call_queue (
    id INT PRIMARY KEY AUTO_INCREMENT,
    caller_id INT NOT NULL,
    status ENUM('waiting','ringing','connected','completed','cancelled') DEFAULT 'waiting',
    current_female_id INT DEFAULT NULL,
    female_queue JSON DEFAULT NULL,
    attempt_count INT DEFAULT 0,
    max_attempts INT DEFAULT 5,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    connected_at DATETIME DEFAULT NULL,
    ended_at DATETIME DEFAULT NULL,
    FOREIGN KEY (caller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- 2. ALTER EXISTING TABLES
-- =====================================================

SET @exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'connecto_dating_app' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'is_kyc_submitted');
SET @sql = IF(@exists = 0, 'ALTER TABLE users ADD COLUMN is_kyc_submitted BOOLEAN DEFAULT FALSE', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists2 = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'connecto_dating_app' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'is_female_verified');
SET @sql2 = IF(@exists2 = 0, 'ALTER TABLE users ADD COLUMN is_female_verified BOOLEAN DEFAULT FALSE', 'SELECT 1');
PREPARE stmt2 FROM @sql2; EXECUTE stmt2; DEALLOCATE PREPARE stmt2;

-- Change voice_note_language from ENUM to VARCHAR to support all Indian languages
SET @colType = (SELECT DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'connecto_dating_app' AND TABLE_NAME = 'user_kyc' AND COLUMN_NAME = 'voice_note_language');
SET @sql3 = IF(@colType = 'enum', 'ALTER TABLE user_kyc MODIFY COLUMN voice_note_language VARCHAR(50) DEFAULT NULL', 'SELECT 1');
PREPARE stmt3 FROM @sql3; EXECUTE stmt3; DEALLOCATE PREPARE stmt3;

-- Add dating_id column to users table
SET @exists3 = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'connecto_dating_app' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'dating_id');
SET @sql4 = IF(@exists3 = 0, 'ALTER TABLE users ADD COLUMN dating_id VARCHAR(20) UNIQUE DEFAULT NULL', 'SELECT 1');
PREPARE stmt4 FROM @sql4; EXECUTE stmt4; DEALLOCATE PREPARE stmt4;

-- Auto-generate dating_id for existing users
UPDATE users SET dating_id = CONCAT('CX', LPAD(@row_num := @row_num + 1, 4, '0'))
WHERE dating_id IS NULL
ORDER BY id ASC;
SET @row_num := 0;

-- =====================================================
-- 3. NEW APP SETTINGS
-- =====================================================

INSERT IGNORE INTO app_settings (setting_key, setting_value, setting_type, description) VALUES
('call_rate_per_minute', '3.00', 'number', 'Call rate per minute in INR for male caller'),
('ring_timeout_seconds', '10', 'number', 'Ring timeout before auto-redirect'),
('max_ring_attempts', '5', 'number', 'Max females to try before failing'),
('min_withdrawal_amount', '100', 'number', 'Minimum withdrawal amount in INR'),
('voice_note_duration', '10', 'number', 'Voice note duration in seconds');

-- =====================================================
-- 4. FEMALE EARNINGS BONUS SYSTEM
-- =====================================================

-- Bonus rules created by admin for individual females
CREATE TABLE IF NOT EXISTS female_bonus_rules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    female_user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL DEFAULT 'Bonus Offer',
    target_minutes INT NOT NULL,
    bonus_amount DECIMAL(10,2) NOT NULL,
    validity_days INT NOT NULL DEFAULT 30,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_accepted BOOLEAN DEFAULT FALSE,
    accepted_at DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (female_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Track minutes talked per call for each female (for bonus progress)
CREATE TABLE IF NOT EXISTS female_call_minutes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    female_user_id INT NOT NULL,
    call_id INT DEFAULT NULL,
    caller_id INT DEFAULT NULL,
    minutes_talked INT NOT NULL DEFAULT 0,
    earned_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    call_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (female_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Track bonus claims (when female achieves target)
CREATE TABLE IF NOT EXISTS female_bonus_claims (
    id INT PRIMARY KEY AUTO_INCREMENT,
    female_user_id INT NOT NULL,
    rule_id INT NOT NULL,
    total_minutes_achieved INT NOT NULL DEFAULT 0,
    bonus_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending','approved','rejected','expired') DEFAULT 'pending',
    claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME DEFAULT NULL,
    FOREIGN KEY (female_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (rule_id) REFERENCES female_bonus_rules(id) ON DELETE CASCADE
);

-- Update existing call rate to 3.00
UPDATE app_settings SET setting_value = '3.00', description = 'Call rate per minute in INR for male caller' WHERE setting_key = 'call_rate_per_minute';

-- Cashfree Payment Gateway
CREATE TABLE IF NOT EXISTS cf_orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  cf_order_id VARCHAR(100) NOT NULL,
  order_id VARCHAR(100) NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  payment_status ENUM('ACTIVE','PAID','FAILED','EXPIRED') DEFAULT 'ACTIVE',
  payment_method VARCHAR(50) DEFAULT NULL,
  cf_payment_id VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
