-- Connecto App Sample Data
-- Run this AFTER schema.sql

USE connecto_dating_app;

-- Sample Users (password: password123)
INSERT INTO users (name, email, phone, password_hash, gender, date_of_birth, city, state, country, is_verified, primary_photo, is_online) VALUES
('Rani', 'rani@test.com', '9000000001', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'female', '2004-01-15', 'Kolkata', 'West Bengal', 'India', TRUE, 'https://api.dicebear.com/7.x/avataaars/svg?seed=rani', TRUE),
('Sumiboudi', 'sumi@test.com', '9000000002', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'female', '2003-06-20', 'Kolkata', 'West Bengal', 'India', TRUE, 'https://api.dicebear.com/7.x/avataaars/svg?seed=sumi', TRUE),
('Mou', 'mou@test.com', '9000000003', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'female', '2001-03-10', 'Kolkata', 'West Bengal', 'India', TRUE, 'https://api.dicebear.com/7.x/avataaars/svg?seed=mou', TRUE),
('Sona', 'sona@test.com', '9000000004', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'female', '2005-09-25', 'Kolkata', 'West Bengal', 'India', TRUE, 'https://api.dicebear.com/7.x/avataaars/svg?seed=sona', FALSE),
('Priya', 'priya@test.com', '9000000005', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'female', '1999-12-05', 'Mumbai', 'Maharashtra', 'India', TRUE, 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya', TRUE),
('Anita', 'anita@test.com', '9000000006', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'female', '2000-07-18', 'Delhi', 'Delhi', 'India', TRUE, 'https://api.dicebear.com/7.x/avataaars/svg?seed=anita', TRUE),
('Neha', 'neha@test.com', '9000000007', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'female', '2002-04-22', 'Bangalore', 'Karnataka', 'India', TRUE, 'https://api.dicebear.com/7.x/avataaars/svg?seed=neha', FALSE),
('Deepa', 'deepa@test.com', '9000000008', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'female', '2001-11-30', 'Chennai', 'Tamil Nadu', 'India', TRUE, 'https://api.dicebear.com/7.x/avataaars/svg?seed=deepa', TRUE),
('Rahul', 'rahul@test.com', '9000000009', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'male', '2000-08-14', 'Mumbai', 'Maharashtra', 'India', TRUE, 'https://api.dicebear.com/7.x/avataaars/svg?seed=rahul', TRUE),
('Amit', 'amit@test.com', '9000000010', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'male', '1999-05-20', 'Delhi', 'Delhi', 'India', TRUE, 'https://api.dicebear.com/7.x/avataaars/svg?seed=amit', TRUE);

-- Create wallets for all users
INSERT INTO wallets (user_id, balance, total_recharged)
SELECT id, FLOOR(RAND() * 100) + 10, FLOOR(RAND() * 200) + 50
FROM users
WHERE id NOT IN (SELECT user_id FROM wallets);

-- Create expert profiles for female users
INSERT INTO experts (user_id, category, price_per_minute, rating, total_calls, quote, languages, is_available)
VALUES
(1, 'confidence', 5.00, 4.80, 120, 'Ghar se door ho? Ghar jaisa feel chahiye? Baat karo, sab theek ho jayega!', 'Bangla-Hindi', TRUE),
(2, 'confidence', 5.00, 4.60, 95, 'Breakup ho chuka hai? Dobara zindagi shuru. Tumhe need hai ek ache listener ki.', 'Hindi-English', TRUE),
(3, 'relationship', 8.00, 4.90, 200, 'Relationship mein problems aa rahi hain? Chalo saath mein solve karte hain.', 'Hindi-English', TRUE),
(4, 'marriage', 5.00, 4.70, 80, 'Shaadi ke baare mein soch rahe ho? Chalo baat karte hain expectations ke baare mein.', 'Bangla-Hindi', TRUE),
(5, 'star', 10.00, 4.95, 350, 'Life mein kuch naya try karna hai? Main hoon tumhare saath!', 'Hindi-English', TRUE),
(6, 'relationship', 7.00, 4.65, 110, 'Confidence badhana hai? Chalo practice karte hain!', 'Hindi', TRUE),
(7, 'confidence', 6.00, 4.85, 150, 'Anxiety ho rahi hai? Main hoon na, baat karte hain.', 'English-Hindi', TRUE),
(8, 'marriage', 5.00, 4.55, 75, 'Life partner dhundh rahe ho? Main help karta hain.', 'Tamil-Hindi', TRUE);

-- Sample calls history
INSERT INTO calls (caller_id, expert_id, status, duration, cost, started_at, ended_at)
VALUES
(9, 1, 'ended', 300, 25.00, DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 55 MINUTE)),
(10, 3, 'ended', 600, 80.00, DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(9, 5, 'ended', 180, 30.00, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 3 MINUTE),
(10, 2, 'ended', 420, 35.00, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 7 MINUTE);

-- Sample wallet transactions
INSERT INTO wallet_transactions (user_id, type, amount, description)
VALUES
(9, 'recharge', 100.00, 'Recharged ₹100'),
(9, 'call_payment', 25.00, 'Call with Rani - 5 min'),
(10, 'recharge', 200.00, 'Recharged ₹200'),
(10, 'call_payment', 80.00, 'Call with Mou - 10 min'),
(9, 'bonus', 10.00, 'Welcome bonus');
