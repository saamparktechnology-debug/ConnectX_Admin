CREATE DATABASE IF NOT EXISTS connecto_dating_app;
USE connecto_dating_app;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) DEFAULT NULL,
    gender ENUM('male','female','other') DEFAULT NULL,
    date_of_birth DATE DEFAULT NULL,
    bio TEXT DEFAULT NULL,
    occupation VARCHAR(200) DEFAULT NULL,
    company VARCHAR(200) DEFAULT NULL,
    school VARCHAR(200) DEFAULT NULL,
    looking_for ENUM('relationship','casual','friends','networking') DEFAULT 'relationship',
    relationship_goal ENUM('long_term','short_term','marriage','unsure') DEFAULT 'long_term',
    height INT DEFAULT NULL,
    lifestyle_smoke ENUM('no','sometimes','yes') DEFAULT NULL,
    lifestyle_drink ENUM('no','sometimes','yes') DEFAULT NULL,
    lifestyle_exercise ENUM('never','sometimes','often','daily') DEFAULT NULL,
    location_lat DECIMAL(10,8) DEFAULT NULL,
    location_lng DECIMAL(11,8) DEFAULT NULL,
    city VARCHAR(100) DEFAULT NULL,
    state VARCHAR(100) DEFAULT NULL,
    country VARCHAR(100) DEFAULT NULL,
    last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    premium_expiry DATETIME DEFAULT NULL,
    is_online BOOLEAN DEFAULT FALSE,
    is_banned BOOLEAN DEFAULT FALSE,
    is_deactivated BOOLEAN DEFAULT FALSE,
    anonymous_mode BOOLEAN DEFAULT FALSE,
    language VARCHAR(50) DEFAULT 'English',
    dating_id VARCHAR(20) UNIQUE DEFAULT NULL,
    primary_photo VARCHAR(500) DEFAULT NULL,
    fcm_token VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE user_photos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    photo_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE interests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(100) DEFAULT NULL,
    category VARCHAR(100) DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_interests (
    user_id INT NOT NULL,
    interest_id INT NOT NULL,
    PRIMARY KEY (user_id, interest_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (interest_id) REFERENCES interests(id) ON DELETE CASCADE
);

CREATE TABLE user_preferences (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    min_age INT DEFAULT 18,
    max_age INT DEFAULT 50,
    preferred_gender ENUM('male','female','both') DEFAULT 'both',
    max_distance_km INT DEFAULT 50,
    show_me BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE swipes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    swiper_id INT NOT NULL,
    swiped_id INT NOT NULL,
    action ENUM('like','dislike','super_like','boost') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (swiper_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (swiped_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_swipe (swiper_id, swiped_id)
);

CREATE TABLE matches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user1_id INT NOT NULL,
    user2_id INT NOT NULL,
    matched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    unmatched_by INT DEFAULT NULL,
    FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_match (user1_id, user2_id)
);

CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    match_id INT NOT NULL,
    sender_id INT NOT NULL,
    message_text TEXT DEFAULT NULL,
    message_type ENUM('text','image','audio','gif','sticker','ice_breaker') DEFAULT 'text',
    media_url VARCHAR(500) DEFAULT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE voice_rooms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    description TEXT DEFAULT NULL,
    host_id INT NOT NULL,
    max_members INT DEFAULT 8,
    is_active BOOLEAN DEFAULT TRUE,
    category ENUM('dating','friendship','support','fun','language') DEFAULT 'dating',
    language VARCHAR(50) DEFAULT 'English',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE voice_room_members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    room_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('host','moderator','member') DEFAULT 'member',
    is_muted BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at DATETIME DEFAULT NULL,
    FOREIGN KEY (room_id) REFERENCES voice_rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE user_blocks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    blocker_id INT NOT NULL,
    blocked_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_block (blocker_id, blocked_id)
);

CREATE TABLE user_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reporter_id INT NOT NULL,
    reported_id INT NOT NULL,
    reason ENUM('fake_profile','inappropriate_content','harassment','spam','underage','other') NOT NULL,
    description TEXT DEFAULT NULL,
    status ENUM('pending','reviewed','warning_issued','suspended','dismissed') DEFAULT 'pending',
    admin_id INT DEFAULT NULL,
    reviewed_at DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE subscription_plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT DEFAULT NULL,
    duration_days INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    features JSON DEFAULT NULL,
    swipe_limit INT DEFAULT NULL,
    super_like_limit INT DEFAULT NULL,
    boost_available BOOLEAN DEFAULT FALSE,
    see_who_liked BOOLEAN DEFAULT FALSE,
    unlimited_likes BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE user_subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    plan_id INT NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    payment_status ENUM('pending','completed','failed','refunded','cancelled') DEFAULT 'pending',
    payment_id VARCHAR(255) DEFAULT NULL,
    payment_method VARCHAR(100) DEFAULT NULL,
    amount_paid DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    auto_renew BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE
);

CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('match','message','like','super_like','voice_room','premium','system','verification') DEFAULT 'system',
    reference_id INT DEFAULT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE ice_breakers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    text VARCHAR(500) NOT NULL,
    category VARCHAR(100) DEFAULT 'general',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) DEFAULT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('super_admin','admin','moderator') DEFAULT 'admin',
    avatar VARCHAR(500) DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE app_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT DEFAULT NULL,
    setting_type ENUM('string','number','boolean','json') DEFAULT 'string',
    description VARCHAR(500) DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO interests (name, icon, category) VALUES
('Travel', '✈️', 'Lifestyle'),
('Music', '🎵', 'Entertainment'),
('Movies', '🎬', 'Entertainment'),
('Cooking', '🍳', 'Food'),
('Photography', '📸', 'Creative'),
('Fitness', '💪', 'Health'),
('Reading', '📚', 'Learning'),
('Gaming', '🎮', 'Entertainment'),
('Dancing', '💃', 'Entertainment'),
('Art', '🎨', 'Creative'),
('Technology', '💻', 'Learning'),
('Nature', '🌿', 'Lifestyle'),
('Sports', '⚽', 'Health'),
('Yoga', '🧘', 'Health'),
('Foodie', '🍕', 'Food'),
('Coffee', '☕', 'Food'),
('Wine', '🍷', 'Food'),
('Pets', '🐕', 'Lifestyle'),
('Fashion', '👗', 'Lifestyle'),
('Volunteering', '🤝', 'Social'),
('Music Production', '🎧', 'Creative'),
('Writing', '✍️', 'Creative'),
('Hiking', '🥾', 'Lifestyle'),
('Cycling', '🚴', 'Health'),
('Swimming', '🏊', 'Health'),
('Meditation', '🧠', 'Health'),
('Coding', '⌨️', 'Learning'),
('Design', '✏️', 'Creative'),
('Podcasts', '🎙️', 'Entertainment'),
('Stand-up Comedy', '😂', 'Entertainment');

INSERT INTO subscription_plans (name, description, duration_days, price, features, swipe_limit, super_like_limit, boost_available, see_who_liked, unlimited_likes, display_order) VALUES
('Connecto Plus', 'Basic premium features', 30, 299.00, '{"unlimited_swipes": true, "5_super_likes": true, "1_boost": true}', 5, 3, FALSE, FALSE, TRUE, 1),
('Connecto Gold', 'Advanced premium features', 30, 599.00, '{"unlimited_swipes": true, "unlimited_super_likes": true, "3_boosts": true, "see_who_liked": true}', NULL, NULL, TRUE, TRUE, TRUE, 2),
('Connecto Platinum', 'All premium features', 30, 999.00, '{"unlimited_swipes": true, "unlimited_super_likes": true, "5_boosts": true, "see_who_liked": true, "priority_likes": true, "profile_boost": true}', NULL, NULL, TRUE, TRUE, TRUE, 3),
('Connecto Plus 3M', '3 months plus plan', 90, 699.00, '{"unlimited_swipes": true, "5_super_likes": true, "1_boost": true}', 5, 3, FALSE, FALSE, TRUE, 4),
('Connecto Gold 3M', '3 months gold plan', 90, 1399.00, '{"unlimited_swipes": true, "unlimited_super_likes": true, "3_boosts": true, "see_who_liked": true}', NULL, NULL, TRUE, TRUE, TRUE, 5);

INSERT INTO ice_breakers (text, category) VALUES
('What''s the best trip you''ve ever taken?', 'travel'),
('If you could have any superpower, what would it be?', 'fun'),
('What''s your go-to comfort food?', 'food'),
('Are you a morning person or night owl?', 'lifestyle'),
('What''s the last show you binged?', 'entertainment'),
('If you could live anywhere in the world, where would it be?', 'travel'),
('What''s a skill you''d love to learn?', 'learning'),
('What''s your idea of a perfect date?', 'dating'),
('Dogs or cats? Or both?', 'lifestyle'),
('What''s your most unpopular opinion?', 'fun'),
('What makes you laugh the most?', 'fun'),
('If you won the lottery, what''s the first thing you''d do?', 'fun'),
('What''s your favorite way to spend a Sunday?', 'lifestyle'),
('Coffee or tea? And how do you take it?', 'food'),
('What''s a hobby you''ve always wanted to try?', 'learning'),
('What''s the best compliment you''ve ever received?', 'fun'),
('What song have you had on repeat lately?', 'entertainment'),
('What''s your love language?', 'dating'),
('What''s the most adventurous thing you''ve done?', 'lifestyle'),
('If you could meet any person, living or dead, who would it be?', 'fun');

INSERT INTO app_settings (setting_key, setting_value, setting_type, description) VALUES
('min_age', '18', 'number', 'Minimum user age'),
('max_age', '80', 'number', 'Maximum user age'),
('max_distance', '100', 'number', 'Maximum distance in km'),
('daily_like_limit', '50', 'number', 'Daily like limit for free users'),
('daily_super_like_limit', '3', 'number', 'Daily super like limit for free users'),
('max_photos', '9', 'number', 'Maximum photos per profile'),
('min_photos', '2', 'number', 'Minimum photos required'),
('min_bio_length', '50', 'number', 'Minimum bio length'),
('report_threshold', '3', 'number', 'Auto-review after N reports'),
('voice_room_max_members', '8', 'number', 'Max members in voice room'),
('min_swipe_age', '24', 'number', 'Hours before new user can swipe'),
('match_expiry_hours', '72', 'number', 'Hours before unmatched conversation expires'),
('typing_timeout', '5000', 'number', 'Typing indicator timeout in ms'),
('online_threshold', '300', 'number', 'Seconds before user shown offline');

CREATE TABLE wallets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    balance DECIMAL(10,2) DEFAULT 0.00,
    total_recharged DECIMAL(10,2) DEFAULT 0.00,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE wallet_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM('recharge','call_payment','refund','bonus') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description VARCHAR(255) DEFAULT NULL,
    reference_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE otp_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    phone VARCHAR(20) NOT NULL UNIQUE,
    request_id VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_phone (phone),
    INDEX idx_expires (expires_at)
);

CREATE TABLE experts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    category ENUM('star','relationship','marriage','confidence') DEFAULT 'confidence',
    price_per_minute DECIMAL(10,2) DEFAULT 5.00,
    rating DECIMAL(3,2) DEFAULT 4.50,
    total_calls INT DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0.00,
    is_available BOOLEAN DEFAULT TRUE,
    quote TEXT DEFAULT NULL,
    languages VARCHAR(255) DEFAULT 'Hindi,English',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE calls (
    id INT PRIMARY KEY AUTO_INCREMENT,
    caller_id INT NOT NULL,
    expert_id INT NOT NULL,
    status ENUM('connecting','connected','ended','missed','rejected') DEFAULT 'connecting',
    duration INT DEFAULT 0,
    cost DECIMAL(10,2) DEFAULT 0.00,
    started_at DATETIME DEFAULT NULL,
    ended_at DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (caller_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (expert_id) REFERENCES experts(id) ON DELETE CASCADE
);

INSERT INTO experts (user_id, category, price_per_minute, rating, quote, languages) VALUES
(1, 'confidence', 5.00, 4.80, 'Ghar se door ho? Ghar jaisa feel chahiye? Baat karo, sab theek ho jayega!', 'Bangla-Hindi'),
(1, 'relationship', 5.00, 4.60, 'Breakup ho chuka hai? Dobara zindagi shuru. Tumhe need hai ek ache listener ki.', 'Hindi-English'),
(1, 'marriage', 5.00, 4.90, 'Shaadi ke baare mein soch rahe ho? Chalo baat karte hain expectations ke baare mein.', 'Hindi'),
(1, 'star', 5.00, 4.70, 'Life mein kuch naya try karna hai? Main hoon tumhare saath!', 'Bangla-Hindi');

INSERT INTO admin_users (email, password_hash, name, role) VALUES
('admin@connecto.com', '$2a$10$id97679LMcpWfIvch06vKeILHk19k.0oTI7OE1h/1RsogxIEfRf/W', 'Super Admin', 'super_admin');
