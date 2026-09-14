-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: bd4tzige601ij0h2dr2p-mysql.services.clever-cloud.com:3306
-- Generation Time: Sep 14, 2026 at 07:22 AM
-- Server version: 8.0.22-13
-- PHP Version: 8.2.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bd4tzige601ij0h2dr2p`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_users`
--

CREATE TABLE `admin_users` (
  `id` int NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `role` enum('super_admin','admin','moderator') DEFAULT 'admin',
  `avatar` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`id`, `email`, `password_hash`, `name`, `role`, `avatar`, `is_active`, `last_login`, `created_at`) VALUES
(1, 'pankajnandi91@gmail.com', '$2a$12$seV3Eo.ryeAVPcl/5.I7/eEGpa7sO.nIvo85ZKFHFYO23eS5HjKLm', 'Super Admin', 'super_admin', NULL, 1, '2026-09-03 07:50:39', '2026-08-29 02:18:16');

-- --------------------------------------------------------

--
-- Table structure for table `app_settings`
--

CREATE TABLE `app_settings` (
  `id` int NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text,
  `setting_type` enum('string','number','boolean','json') DEFAULT 'string',
  `description` varchar(500) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `app_settings`
--

INSERT INTO `app_settings` (`id`, `setting_key`, `setting_value`, `setting_type`, `description`, `updated_at`) VALUES
(1, 'min_age', '18', 'number', 'Minimum user age', '2026-08-29 02:18:16'),
(2, 'max_age', '80', 'number', 'Maximum user age', '2026-08-29 02:18:16'),
(3, 'max_distance', '100', 'number', 'Maximum distance in km', '2026-08-29 02:18:16'),
(4, 'daily_like_limit', '50', 'number', 'Daily like limit for free users', '2026-08-29 02:18:16'),
(5, 'daily_super_like_limit', '3', 'number', 'Daily super like limit for free users', '2026-08-29 02:18:16'),
(6, 'max_photos', '9', 'number', 'Maximum photos per profile', '2026-08-29 02:18:16'),
(7, 'min_photos', '2', 'number', 'Minimum photos required', '2026-08-29 02:18:16'),
(8, 'min_bio_length', '50', 'number', 'Minimum bio length', '2026-08-29 02:18:16'),
(9, 'report_threshold', '3', 'number', 'Auto-review after N reports', '2026-08-29 02:18:16'),
(10, 'voice_room_max_members', '8', 'number', 'Max members in voice room', '2026-08-29 02:18:16'),
(11, 'min_swipe_age', '24', 'number', 'Hours before new user can swipe', '2026-08-29 02:18:16'),
(12, 'match_expiry_hours', '72', 'number', 'Hours before unmatched conversation expires', '2026-08-29 02:18:16'),
(13, 'typing_timeout', '5000', 'number', 'Typing indicator timeout in ms', '2026-08-29 02:18:16'),
(14, 'online_threshold', '300', 'number', 'Seconds before user shown offline', '2026-08-29 02:18:16'),
(15, 'call_rate_per_minute', '1.50', 'string', NULL, '2026-09-10 12:36:29'),
(16, 'ring_timeout_seconds', '10', 'string', NULL, '2026-09-10 12:36:29'),
(17, 'max_ring_attempts', '5', 'string', NULL, '2026-09-10 12:36:30');

-- --------------------------------------------------------

--
-- Table structure for table `calls`
--

CREATE TABLE `calls` (
  `id` int NOT NULL,
  `caller_id` int NOT NULL,
  `expert_id` int NOT NULL,
  `status` enum('connecting','connected','ended','missed','rejected') DEFAULT 'connecting',
  `duration` int DEFAULT '0',
  `cost` decimal(10,2) DEFAULT '0.00',
  `started_at` datetime DEFAULT NULL,
  `ended_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `calls`
--

INSERT INTO `calls` (`id`, `caller_id`, `expert_id`, `status`, `duration`, `cost`, `started_at`, `ended_at`, `created_at`) VALUES
(9, 10, 12, 'ended', 0, 0.00, '2026-08-29 12:31:41', '2026-08-29 12:31:45', '2026-08-29 12:31:41'),
(10, 23, 5, 'ended', 24, 2.00, '2026-08-29 22:33:49', '2026-08-29 22:34:17', '2026-08-29 22:33:49'),
(11, 23, 6, 'ended', 2, 0.17, '2026-08-29 22:34:25', '2026-08-29 22:34:31', '2026-08-29 22:34:25'),
(12, 23, 9, 'connected', 0, 0.00, '2026-08-30 09:04:22', NULL, '2026-08-30 09:04:22'),
(13, 23, 9, 'connected', 0, 0.00, '2026-08-30 09:04:32', NULL, '2026-08-30 09:04:32'),
(14, 23, 9, 'ended', 1, 0.08, '2026-08-30 09:04:41', '2026-08-30 09:04:47', '2026-08-30 09:04:41'),
(15, 23, 9, 'ended', 16, 1.33, '2026-08-30 12:49:39', '2026-08-30 12:50:00', '2026-08-30 12:49:39'),
(16, 23, 9, 'ended', 13, 1.08, '2026-09-01 17:57:11', '2026-09-01 17:57:28', '2026-09-01 17:57:11'),
(17, 23, 9, 'ended', 0, 0.00, '2026-09-01 17:57:45', '2026-09-01 17:57:50', '2026-09-01 17:57:45');

-- --------------------------------------------------------

--
-- Table structure for table `call_queue`
--

CREATE TABLE `call_queue` (
  `id` int NOT NULL,
  `caller_id` int NOT NULL,
  `status` enum('waiting','ringing','connected','completed','cancelled') DEFAULT 'waiting',
  `current_female_id` int DEFAULT NULL,
  `female_queue` json DEFAULT NULL,
  `attempt_count` int DEFAULT '0',
  `max_attempts` int DEFAULT '5',
  `started_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `connected_at` datetime DEFAULT NULL,
  `ended_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `call_queue`
--

INSERT INTO `call_queue` (`id`, `caller_id`, `status`, `current_female_id`, `female_queue`, `attempt_count`, `max_attempts`, `started_at`, `connected_at`, `ended_at`) VALUES
(1, 32, 'cancelled', 5, '[5, 3, 1, 6, 2]', 0, 5, '2026-09-10 12:05:59', NULL, '2026-09-10 12:06:10'),
(2, 32, 'cancelled', 5, '[5, 3, 1, 6, 2]', 0, 5, '2026-09-10 12:08:52', NULL, '2026-09-10 12:09:02'),
(3, 32, 'cancelled', 5, '[5, 3, 1, 6, 2]', 0, 5, '2026-09-10 12:20:40', NULL, '2026-09-10 12:20:51'),
(4, 32, 'cancelled', 5, '[5, 3, 1, 6, 2]', 0, 5, '2026-09-10 12:21:44', NULL, '2026-09-10 12:21:55'),
(5, 32, 'cancelled', 5, '[5, 3, 1, 6, 2]', 0, 5, '2026-09-10 12:28:03', NULL, '2026-09-10 12:28:13'),
(6, 32, 'cancelled', 5, '[5, 3, 1, 6, 2]', 0, 5, '2026-09-10 12:29:34', NULL, '2026-09-10 12:29:44'),
(7, 32, 'cancelled', 5, '[5, 3, 1, 6, 2]', 0, 5, '2026-09-10 12:31:20', NULL, '2026-09-10 12:31:30'),
(8, 32, 'ringing', 4, '[4]', 0, 5, '2026-09-10 12:37:49', NULL, NULL),
(9, 32, 'ringing', 4, '[4]', 0, 5, '2026-09-10 12:38:21', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `experts`
--

CREATE TABLE `experts` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `category` enum('star','relationship','marriage','confidence') DEFAULT 'confidence',
  `price_per_minute` decimal(10,2) DEFAULT '5.00',
  `rating` decimal(3,2) DEFAULT '4.50',
  `total_calls` int DEFAULT '0',
  `total_earnings` decimal(10,2) DEFAULT '0.00',
  `is_available` tinyint(1) DEFAULT '1',
  `quote` text,
  `languages` varchar(255) DEFAULT 'Hindi,English',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `experts`
--

INSERT INTO `experts` (`id`, `user_id`, `category`, `price_per_minute`, `rating`, `total_calls`, `total_earnings`, `is_available`, `quote`, `languages`, `created_at`, `updated_at`) VALUES
(5, 1, 'confidence', 5.00, 4.80, 120, 0.00, 1, 'Ghar se door ho? Ghar jaisa feel chahiye? Baat karo, sab theek ho jayega!', 'Bangla-Hindi', '2026-08-29 12:23:46', '2026-08-29 12:23:46'),
(6, 2, 'confidence', 5.00, 4.60, 95, 0.00, 1, 'Breakup ho chuka hai? Dobara zindagi shuru. Tumhe need hai ek ache listener ki.', 'Hindi-English', '2026-08-29 12:23:46', '2026-08-29 12:23:46'),
(7, 3, 'relationship', 8.00, 4.90, 200, 0.00, 1, 'Relationship mein problems aa rahi hain? Chalo saath mein solve karte hain.', 'Hindi-English', '2026-08-29 12:23:46', '2026-08-29 12:23:46'),
(8, 4, 'marriage', 5.00, 4.70, 80, 0.00, 1, 'Shaadi ke baare mein soch rahe ho? Chalo baat karte hain expectations ke baare mein.', 'Bangla-Hindi', '2026-08-29 12:23:46', '2026-08-29 12:23:46'),
(9, 5, 'star', 10.00, 4.95, 350, 0.00, 1, 'Life mein kuch naya try karna hai? Main hoon tumhare saath!', 'Hindi-English', '2026-08-29 12:23:46', '2026-08-29 12:23:46'),
(10, 6, 'relationship', 7.00, 4.65, 110, 0.00, 1, 'Confidence badhana hai? Chalo practice karte hain!', 'Hindi', '2026-08-29 12:23:46', '2026-08-29 12:23:46'),
(11, 7, 'confidence', 6.00, 4.85, 150, 0.00, 1, 'Anxiety ho rahi hai? Main hoon na, baat karte hain.', 'English-Hindi', '2026-08-29 12:23:46', '2026-08-29 12:23:46'),
(12, 8, 'marriage', 5.00, 4.55, 75, 0.00, 1, 'Life partner dhundh rahe ho? Main help karta hain.', 'Tamil-Hindi', '2026-08-29 12:23:46', '2026-08-29 12:23:46'),
(14, 23, 'relationship', 1.50, 4.50, 0, 0.00, 1, NULL, 'Hindi,English', '2026-09-10 12:36:27', '2026-09-10 12:36:27'),
(15, 27, 'relationship', 1.50, 4.50, 0, 0.00, 1, NULL, 'Hindi,English', '2026-09-10 12:36:27', '2026-09-10 12:36:27'),
(16, 28, 'relationship', 1.50, 4.50, 0, 0.00, 1, NULL, 'Hindi,English', '2026-09-10 12:36:27', '2026-09-10 12:36:27'),
(17, 29, 'relationship', 1.50, 4.50, 0, 0.00, 1, NULL, 'Hindi,English', '2026-09-10 12:36:27', '2026-09-10 12:36:27'),
(18, 30, 'relationship', 1.50, 4.50, 0, 0.00, 1, NULL, 'Hindi,English', '2026-09-10 12:36:27', '2026-09-10 12:36:27'),
(19, 31, 'relationship', 1.50, 4.50, 0, 0.00, 1, NULL, 'Hindi,English', '2026-09-10 12:36:28', '2026-09-10 12:36:28'),
(20, 34, 'relationship', 1.50, 4.50, 0, 0.00, 1, NULL, 'Hindi,English', '2026-09-10 12:36:28', '2026-09-10 12:36:28'),
(21, 9, 'confidence', 1.50, 4.50, 0, 0.00, 1, NULL, 'Hindi,English', '2026-09-10 12:36:28', '2026-09-10 12:36:28'),
(22, 10, 'confidence', 1.50, 4.50, 0, 0.00, 1, NULL, 'Hindi,English', '2026-09-10 12:36:28', '2026-09-10 12:36:28'),
(23, 24, 'confidence', 1.50, 4.50, 0, 0.00, 1, NULL, 'Hindi,English', '2026-09-10 12:36:28', '2026-09-10 12:36:28'),
(24, 25, 'confidence', 1.50, 4.50, 0, 0.00, 1, NULL, 'Hindi,English', '2026-09-10 12:36:29', '2026-09-10 12:36:29'),
(25, 26, 'confidence', 1.50, 4.50, 0, 0.00, 1, NULL, 'Hindi,English', '2026-09-10 12:36:29', '2026-09-10 12:36:29'),
(26, 32, 'confidence', 1.50, 4.50, 0, 0.00, 1, NULL, 'Hindi,English', '2026-09-10 12:36:29', '2026-09-10 12:36:29');

-- --------------------------------------------------------

--
-- Table structure for table `ice_breakers`
--

CREATE TABLE `ice_breakers` (
  `id` int NOT NULL,
  `text` varchar(500) NOT NULL,
  `category` varchar(100) DEFAULT 'general',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `ice_breakers`
--

INSERT INTO `ice_breakers` (`id`, `text`, `category`, `is_active`, `created_at`) VALUES
(1, 'What\'s the best trip you\'ve ever taken?', 'travel', 1, '2026-08-29 02:18:16'),
(2, 'If you could have any superpower, what would it be?', 'fun', 1, '2026-08-29 02:18:16'),
(3, 'What\'s your go-to comfort food?', 'food', 1, '2026-08-29 02:18:16'),
(4, 'Are you a morning person or night owl?', 'lifestyle', 1, '2026-08-29 02:18:16'),
(5, 'What\'s the last show you binged?', 'entertainment', 1, '2026-08-29 02:18:16'),
(6, 'If you could live anywhere in the world, where would it be?', 'travel', 1, '2026-08-29 02:18:16'),
(7, 'What\'s a skill you\'d love to learn?', 'learning', 1, '2026-08-29 02:18:16'),
(8, 'What\'s your idea of a perfect date?', 'dating', 1, '2026-08-29 02:18:16'),
(9, 'Dogs or cats? Or both?', 'lifestyle', 1, '2026-08-29 02:18:16'),
(10, 'What\'s your most unpopular opinion?', 'fun', 1, '2026-08-29 02:18:16'),
(11, 'What makes you laugh the most?', 'fun', 1, '2026-08-29 02:18:16'),
(12, 'If you won the lottery, what\'s the first thing you\'d do?', 'fun', 1, '2026-08-29 02:18:16'),
(13, 'What\'s your favorite way to spend a Sunday?', 'lifestyle', 1, '2026-08-29 02:18:16'),
(14, 'Coffee or tea? And how do you take it?', 'food', 1, '2026-08-29 02:18:16'),
(15, 'What\'s a hobby you\'ve always wanted to try?', 'learning', 1, '2026-08-29 02:18:16'),
(16, 'What\'s the best compliment you\'ve ever received?', 'fun', 1, '2026-08-29 02:18:16'),
(17, 'What song have you had on repeat lately?', 'entertainment', 1, '2026-08-29 02:18:16'),
(18, 'What\'s your love language?', 'dating', 1, '2026-08-29 02:18:16'),
(19, 'What\'s the most adventurous thing you\'ve done?', 'lifestyle', 1, '2026-08-29 02:18:16'),
(20, 'If you could meet any person, living or dead, who would it be?', 'fun', 1, '2026-08-29 02:18:16');

-- --------------------------------------------------------

--
-- Table structure for table `interests`
--

CREATE TABLE `interests` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `icon` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `interests`
--

INSERT INTO `interests` (`id`, `name`, `icon`, `category`, `is_active`, `created_at`) VALUES
(61, 'Travel', '✈️', 'Lifestyle', 1, '2026-08-29 02:26:24'),
(62, 'Music', '🎵', 'Entertainment', 1, '2026-08-29 02:26:24'),
(63, 'Movies', '🎬', 'Entertainment', 1, '2026-08-29 02:26:24'),
(64, 'Cooking', '🍳', 'Food', 1, '2026-08-29 02:26:24'),
(65, 'Photography', '📸', 'Creative', 1, '2026-08-29 02:26:24'),
(66, 'Fitness', '💪', 'Health', 1, '2026-08-29 02:26:24'),
(67, 'Reading', '📚', 'Learning', 1, '2026-08-29 02:26:24'),
(68, 'Gaming', '🎮', 'Entertainment', 1, '2026-08-29 02:26:24'),
(69, 'Dancing', '💃', 'Entertainment', 1, '2026-08-29 02:26:24'),
(70, 'Art', '🎨', 'Creative', 1, '2026-08-29 02:26:24'),
(71, 'Technology', '💻', 'Learning', 1, '2026-08-29 02:26:24'),
(72, 'Nature', '🌿', 'Lifestyle', 1, '2026-08-29 02:26:24'),
(73, 'Sports', '⚽', 'Health', 1, '2026-08-29 02:26:24'),
(74, 'Yoga', '🧘', 'Health', 1, '2026-08-29 02:26:24'),
(75, 'Foodie', '🍕', 'Food', 1, '2026-08-29 02:26:24'),
(76, 'Coffee', '☕', 'Food', 1, '2026-08-29 02:26:24'),
(77, 'Wine', '🍷', 'Food', 1, '2026-08-29 02:26:24'),
(78, 'Pets', '🐕', 'Lifestyle', 1, '2026-08-29 02:26:24'),
(79, 'Fashion', '👗', 'Lifestyle', 1, '2026-08-29 02:26:24'),
(80, 'Volunteering', '🤝', 'Social', 1, '2026-08-29 02:26:24'),
(81, 'Music Production', '🎧', 'Creative', 1, '2026-08-29 02:26:24'),
(82, 'Writing', '✍️', 'Creative', 1, '2026-08-29 02:26:24'),
(83, 'Hiking', '🥾', 'Lifestyle', 1, '2026-08-29 02:26:24'),
(84, 'Cycling', '🚴', 'Health', 1, '2026-08-29 02:26:24'),
(85, 'Swimming', '🏊', 'Health', 1, '2026-08-29 02:26:24'),
(86, 'Meditation', '🧠', 'Health', 1, '2026-08-29 02:26:24'),
(87, 'Coding', '⌨️', 'Learning', 1, '2026-08-29 02:26:24'),
(88, 'Design', '✏️', 'Creative', 1, '2026-08-29 02:26:24'),
(89, 'Podcasts', '🎙️', 'Entertainment', 1, '2026-08-29 02:26:24'),
(90, 'Stand-up Comedy', '😂', 'Entertainment', 1, '2026-08-29 02:26:24');

-- --------------------------------------------------------

--
-- Table structure for table `matches`
--

CREATE TABLE `matches` (
  `id` int NOT NULL,
  `user1_id` int NOT NULL,
  `user2_id` int NOT NULL,
  `matched_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1',
  `unmatched_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int NOT NULL,
  `match_id` int NOT NULL,
  `sender_id` int NOT NULL,
  `message_text` text,
  `message_type` enum('text','image','audio','gif','sticker','ice_breaker') DEFAULT 'text',
  `media_url` varchar(500) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `is_deleted` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('match','message','like','super_like','voice_room','premium','system','verification') DEFAULT 'system',
  `reference_id` int DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `subscription_plans`
--

CREATE TABLE `subscription_plans` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `duration_days` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'INR',
  `features` json DEFAULT NULL,
  `swipe_limit` int DEFAULT NULL,
  `super_like_limit` int DEFAULT NULL,
  `boost_available` tinyint(1) DEFAULT '0',
  `see_who_liked` tinyint(1) DEFAULT '0',
  `unlimited_likes` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `display_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `subscription_plans`
--

INSERT INTO `subscription_plans` (`id`, `name`, `description`, `duration_days`, `price`, `currency`, `features`, `swipe_limit`, `super_like_limit`, `boost_available`, `see_who_liked`, `unlimited_likes`, `is_active`, `display_order`, `created_at`, `updated_at`) VALUES
(1, 'Connecto Plus', 'Basic premium features', 30, 299.00, 'INR', '{\"1_boost\": true, \"5_super_likes\": true, \"unlimited_swipes\": true}', 5, 3, 0, 0, 1, 1, 1, '2026-08-29 02:18:16', '2026-08-29 02:18:16'),
(2, 'Connecto Gold', 'Advanced premium features', 30, 599.00, 'INR', '{\"3_boosts\": true, \"see_who_liked\": true, \"unlimited_swipes\": true, \"unlimited_super_likes\": true}', NULL, NULL, 1, 1, 1, 1, 2, '2026-08-29 02:18:16', '2026-08-29 02:18:16'),
(3, 'Connecto Platinum', 'All premium features', 30, 999.00, 'INR', '{\"5_boosts\": true, \"profile_boost\": true, \"see_who_liked\": true, \"priority_likes\": true, \"unlimited_swipes\": true, \"unlimited_super_likes\": true}', NULL, NULL, 1, 1, 1, 1, 3, '2026-08-29 02:18:16', '2026-08-29 02:18:16'),
(4, 'Connecto Plus 3M', '3 months plus plan', 90, 699.00, 'INR', '{\"1_boost\": true, \"5_super_likes\": true, \"unlimited_swipes\": true}', 5, 3, 0, 0, 1, 1, 4, '2026-08-29 02:18:16', '2026-08-29 02:18:16'),
(5, 'Connecto Gold 3M', '3 months gold plan', 90, 1399.00, 'INR', '{\"3_boosts\": true, \"see_who_liked\": true, \"unlimited_swipes\": true, \"unlimited_super_likes\": true}', NULL, NULL, 1, 1, 1, 1, 5, '2026-08-29 02:18:16', '2026-08-29 02:18:16');

-- --------------------------------------------------------

--
-- Table structure for table `swipes`
--

CREATE TABLE `swipes` (
  `id` int NOT NULL,
  `swiper_id` int NOT NULL,
  `swiped_id` int NOT NULL,
  `action` enum('like','dislike','super_like','boost') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `dating_id` varchar(20) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `bio` text,
  `occupation` varchar(200) DEFAULT NULL,
  `company` varchar(200) DEFAULT NULL,
  `school` varchar(200) DEFAULT NULL,
  `looking_for` enum('relationship','casual','friends','networking') DEFAULT 'relationship',
  `relationship_goal` enum('long_term','short_term','marriage','unsure') DEFAULT 'long_term',
  `height` int DEFAULT NULL,
  `lifestyle_smoke` enum('no','sometimes','yes') DEFAULT NULL,
  `lifestyle_drink` enum('no','sometimes','yes') DEFAULT NULL,
  `lifestyle_exercise` enum('never','sometimes','often','daily') DEFAULT NULL,
  `location_lat` decimal(10,8) DEFAULT NULL,
  `location_lng` decimal(11,8) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `last_active` datetime DEFAULT CURRENT_TIMESTAMP,
  `is_verified` tinyint(1) DEFAULT '0',
  `is_premium` tinyint(1) DEFAULT '0',
  `premium_expiry` datetime DEFAULT NULL,
  `is_online` tinyint(1) DEFAULT '0',
  `is_banned` tinyint(1) DEFAULT '0',
  `is_deactivated` tinyint(1) DEFAULT '0',
  `anonymous_mode` tinyint(1) DEFAULT '0',
  `language` varchar(50) DEFAULT 'English',
  `primary_photo` varchar(500) DEFAULT NULL,
  `fcm_token` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_kyc_submitted` tinyint(1) DEFAULT '0',
  `is_female_verified` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `dating_id`, `name`, `email`, `phone`, `password_hash`, `gender`, `date_of_birth`, `bio`, `occupation`, `company`, `school`, `looking_for`, `relationship_goal`, `height`, `lifestyle_smoke`, `lifestyle_drink`, `lifestyle_exercise`, `location_lat`, `location_lng`, `city`, `state`, `country`, `last_active`, `is_verified`, `is_premium`, `premium_expiry`, `is_online`, `is_banned`, `is_deactivated`, `anonymous_mode`, `language`, `primary_photo`, `fcm_token`, `created_at`, `updated_at`, `is_kyc_submitted`, `is_female_verified`) VALUES
(1, NULL, 'Rani', 'rani@test.com', '9000000001', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'female', '2004-01-15', NULL, NULL, NULL, NULL, 'relationship', 'long_term', NULL, NULL, NULL, NULL, NULL, NULL, 'Kolkata', 'West Bengal', 'India', '2026-08-29 12:23:46', 1, 0, NULL, 1, 0, 0, 0, 'English', 'https://api.dicebear.com/7.x/avataaars/svg?seed=rani', NULL, '2026-08-29 12:23:46', '2026-09-10 12:36:26', 0, 1),
(2, NULL, 'Sumiboudi', 'sumi@test.com', '9000000002', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'female', '2003-06-20', NULL, NULL, NULL, NULL, 'relationship', 'long_term', NULL, NULL, NULL, NULL, NULL, NULL, 'Kolkata', 'West Bengal', 'India', '2026-08-29 12:23:46', 1, 0, NULL, 1, 0, 0, 0, 'English', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sumi', NULL, '2026-08-29 12:23:46', '2026-09-10 12:36:26', 0, 1),
(3, NULL, 'Mou', 'mou@test.com', '9000000003', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'female', '2001-03-10', NULL, NULL, NULL, NULL, 'relationship', 'long_term', NULL, NULL, NULL, NULL, NULL, NULL, 'Kolkata', 'West Bengal', 'India', '2026-08-29 12:23:46', 1, 0, NULL, 1, 0, 0, 0, 'English', 'https://api.dicebear.com/7.x/avataaars/svg?seed=mou', NULL, '2026-08-29 12:23:46', '2026-09-10 12:36:26', 0, 1),
(4, NULL, 'Sona', 'sona@test.com', '9000000004', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'female', '2005-09-25', NULL, NULL, NULL, NULL, 'relationship', 'long_term', NULL, NULL, NULL, NULL, NULL, NULL, 'Kolkata', 'West Bengal', 'India', '2026-08-29 12:23:46', 1, 0, NULL, 0, 0, 0, 0, 'English', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sona', NULL, '2026-08-29 12:23:46', '2026-09-10 12:36:26', 0, 1),
(5, NULL, 'Priya', 'priya@test.com', '9000000005', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'female', '1999-12-05', NULL, NULL, NULL, NULL, 'relationship', 'long_term', NULL, NULL, NULL, NULL, NULL, NULL, 'Mumbai', 'Maharashtra', 'India', '2026-08-29 12:23:46', 1, 0, NULL, 1, 0, 0, 0, 'English', 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya', NULL, '2026-08-29 12:23:46', '2026-09-10 12:36:26', 0, 1),
(6, NULL, 'Anita', 'anita@test.com', '9000000006', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'female', '2000-07-18', NULL, NULL, NULL, NULL, 'relationship', 'long_term', NULL, NULL, NULL, NULL, NULL, NULL, 'Delhi', 'Delhi', 'India', '2026-08-29 12:23:46', 1, 0, NULL, 1, 0, 0, 0, 'English', 'https://api.dicebear.com/7.x/avataaars/svg?seed=anita', NULL, '2026-08-29 12:23:46', '2026-09-10 12:36:26', 0, 1),
(7, NULL, 'Neha', 'neha@test.com', '9000000007', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'female', '2002-04-22', NULL, NULL, NULL, NULL, 'relationship', 'long_term', NULL, NULL, NULL, NULL, NULL, NULL, 'Bangalore', 'Karnataka', 'India', '2026-08-29 12:23:46', 1, 0, NULL, 0, 0, 0, 0, 'English', 'https://api.dicebear.com/7.x/avataaars/svg?seed=neha', NULL, '2026-08-29 12:23:46', '2026-09-10 12:36:26', 0, 1),
(8, NULL, 'Deepa', 'deepa@test.com', '9000000008', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'female', '2001-11-30', NULL, NULL, NULL, NULL, 'relationship', 'long_term', NULL, NULL, NULL, NULL, NULL, NULL, 'Chennai', 'Tamil Nadu', 'India', '2026-08-29 12:23:46', 1, 0, NULL, 1, 0, 0, 0, 'English', 'https://api.dicebear.com/7.x/avataaars/svg?seed=deepa', NULL, '2026-08-29 12:23:46', '2026-09-10 12:36:26', 0, 1),
(9, NULL, 'Rahul', 'rahul@test.com', '9000000009', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'male', '2000-08-14', NULL, NULL, NULL, NULL, 'relationship', 'long_term', NULL, NULL, NULL, NULL, NULL, NULL, 'Mumbai', 'Maharashtra', 'India', '2026-08-29 12:23:46', 1, 0, NULL, 1, 0, 0, 0, 'English', 'https://api.dicebear.com/7.x/avataaars/svg?seed=rahul', NULL, '2026-08-29 12:23:46', '2026-08-29 12:23:46', 0, 0),
(10, NULL, 'Amit', 'amit@test.com', '9000000010', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'male', '1999-05-20', NULL, NULL, NULL, NULL, 'relationship', 'long_term', NULL, NULL, NULL, NULL, NULL, NULL, 'Delhi', 'Delhi', 'India', '2026-08-29 12:23:46', 1, 0, NULL, 1, 0, 0, 0, 'English', 'https://api.dicebear.com/7.x/avataaars/svg?seed=amit', NULL, '2026-08-29 12:23:46', '2026-08-29 12:23:46', 0, 0),
(21, NULL, 'User', NULL, '6295480440', '$2a$10$U.XjItMrvvO4lPxwi8o0zeRy3j4R3Dp21NOU6isTlfPPzrWeLGAEa', NULL, NULL, NULL, NULL, NULL, NULL, 'relationship', 'long_term', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-29 16:53:16', 0, 0, NULL, 0, 0, 0, 0, 'English', NULL, NULL, '2026-08-29 16:53:16', '2026-08-29 16:53:16', 0, 0),
(22, NULL, 'User', NULL, '7908907101', '$2a$10$..u1evpct4/bWPOk9KDRB.PX61sP3QSts6PMvZ8HZWFWgPyPRBKtm', NULL, NULL, NULL, NULL, NULL, NULL, 'relationship', 'long_term', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-29 17:12:11', 0, 0, NULL, 0, 0, 0, 0, 'English', NULL, NULL, '2026-08-29 17:12:11', '2026-08-29 17:12:11', 0, 0),
(23, NULL, 'Pankaj Nandi', 'pankajnandi91@gmail.com', '8250766738', '$2a$12$MRRhOuZL.yC5B5q3WehsZ.p2nVbiFRhPiYoJaOGobvlKEcWFOlxbG', 'female', NULL, NULL, NULL, NULL, NULL, 'relationship', 'long_term', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-29 22:09:13', 0, 0, NULL, 0, 0, 0, 0, 'English', NULL, NULL, '2026-08-29 22:09:13', '2026-09-10 12:36:26', 0, 1),
(24, NULL, 'John Doe', 'johndoe@example.com', '1234567890', '$2a$12$uy81DzmReS6K41E6Oa1B/u190n.Gs6swG4RNvjXkYfs83YoQGGftm', 'male', NULL, NULL, NULL, NULL, NULL, 'relationship', 'long_term', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-03 10:54:27', 0, 0, NULL, 0, 0, 0, 0, 'English', NULL, NULL, '2026-09-03 10:54:27', '2026-09-03 10:54:27', 0, 0),
(25, NULL, 'John Doe', 'johndoe9876@example.com', '9876543210', '$2a$12$qTbWnMqrbRwcHHhqIomVFef3b8ngcphUX.949225Hz7tVcempsfM.', 'male', NULL, NULL, NULL, NULL, NULL, 'relationship', 'long_term', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-03 10:55:33', 0, 0, NULL, 0, 0, 0, 0, 'English', NULL, NULL, '2026-09-03 10:55:33', '2026-09-03 10:55:33', 0, 0),
(26, NULL, 'John Doe', 'testuser_cx_99@gmail.com', '1234509876', '$2a$12$JsurFssJmrAYgjuduVe7r.NeEubciR8MjtpXHrqX2oTGjA2fj4wtO', 'male', NULL, NULL, NULL, NULL, NULL, 'relationship', 'long_term', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-03 11:25:19', 0, 0, NULL, 0, 0, 0, 0, 'English', NULL, NULL, '2026-09-03 11:25:19', '2026-09-03 11:25:19', 0, 0),
(27, NULL, 'Sruti kar', 'sruti@gmail.com', '9051333786', '$2a$12$DaVIHdgl0FPhA4JtbC3eqecBTB5gC3pg/Mbb5YwxJSCSthuoppN8m', 'female', NULL, NULL, NULL, NULL, NULL, 'relationship', 'long_term', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-04 12:31:11', 0, 0, NULL, 0, 0, 0, 0, 'English', NULL, NULL, '2026-09-04 12:31:11', '2026-09-10 12:36:26', 0, 1),
(28, NULL, 'Sruti kar ', 'sruti512@gmail.com', '9051333787', '$2a$12$abGnM1pU.fz5B6BeXPd5Ou.JJPTEYtH.8mFv5FeyauM124UeCwPAy', 'female', NULL, NULL, NULL, NULL, NULL, 'relationship', 'long_term', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-04 13:32:40', 0, 0, NULL, 0, 0, 0, 0, 'English', NULL, NULL, '2026-09-04 13:32:40', '2026-09-10 12:36:26', 0, 1),
(29, NULL, 'Sruti kar', 'sruti2026@gmail.com', '9051333754', '$2a$12$ESYdW5NUGp.2cj4LS2UeWelbL9FyKy3TqTRdMRkpS/6RjtuhZIOm2', 'female', NULL, NULL, NULL, NULL, NULL, 'relationship', 'long_term', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-04 13:38:45', 0, 0, NULL, 0, 0, 0, 0, 'English', NULL, NULL, '2026-09-04 13:38:45', '2026-09-10 12:36:26', 0, 1),
(30, 'CX1001', 'Anu pal', 'anu72@gmail.com', '9051333783', '$2a$12$/ZvqWB3jF550G27Vr8sf1enGfrx1P7SfYfhLod/yq6d6xiAkajSFK', 'female', NULL, NULL, NULL, NULL, NULL, 'relationship', 'long_term', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-04 14:12:44', 0, 0, NULL, 0, 0, 0, 0, 'English', NULL, NULL, '2026-09-04 14:12:44', '2026-09-10 12:36:26', 1, 1),
(31, NULL, 'Pankaj Nandi', 'connectx24.in@gmail.com', '6294743492', '$2a$12$dObSX6P2wdJO362Ge6zE1uXPSa7hqDGl9hN6xehWljlKwgW1eUEYK', 'female', NULL, NULL, NULL, NULL, NULL, 'relationship', 'long_term', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-04 19:59:21', 0, 0, NULL, 0, 0, 0, 0, 'English', NULL, NULL, '2026-09-04 19:59:21', '2026-09-10 12:36:26', 0, 1),
(32, NULL, 'Pradip', 'pradip@gmaip.com', '9652438071', NULL, 'male', NULL, NULL, NULL, NULL, NULL, 'relationship', 'long_term', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-09 12:00:29', 0, 0, NULL, 1, 0, 0, 0, 'English', NULL, NULL, '2026-09-09 12:00:29', '2026-09-10 12:37:48', 0, 0),
(34, NULL, 'Riya', 'riya@gmail.com', '9065448664', NULL, 'female', '1993-07-14', NULL, NULL, NULL, NULL, 'relationship', 'long_term', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-09 12:17:49', 0, 0, NULL, 0, 0, 0, 0, 'bengali', NULL, NULL, '2026-09-09 12:17:49', '2026-09-10 12:36:26', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `user_blocks`
--

CREATE TABLE `user_blocks` (
  `id` int NOT NULL,
  `blocker_id` int NOT NULL,
  `blocked_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `user_interests`
--

CREATE TABLE `user_interests` (
  `user_id` int NOT NULL,
  `interest_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `user_kyc`
--

CREATE TABLE `user_kyc` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `aadhar_number` varchar(20) DEFAULT NULL,
  `pan_number` varchar(20) DEFAULT NULL,
  `bank_account_number` varchar(50) DEFAULT NULL,
  `bank_ifsc` varchar(20) DEFAULT NULL,
  `bank_name` varchar(200) DEFAULT NULL,
  `bank_holder_name` varchar(200) DEFAULT NULL,
  `upi_id` varchar(200) DEFAULT NULL,
  `voice_note_url` varchar(500) DEFAULT NULL,
  `voice_note_language` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `verification_status` enum('pending','approved','rejected') DEFAULT 'pending',
  `rejection_reason` text,
  `verified_by` int DEFAULT NULL,
  `verified_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `user_kyc`
--

INSERT INTO `user_kyc` (`id`, `user_id`, `aadhar_number`, `pan_number`, `bank_account_number`, `bank_ifsc`, `bank_name`, `bank_holder_name`, `upi_id`, `voice_note_url`, `voice_note_language`, `verification_status`, `rejection_reason`, `verified_by`, `verified_at`, `created_at`, `updated_at`) VALUES
(1, 29, '123456789012', 'BHFFG6895H', NULL, NULL, NULL, NULL, 'srutu22@hdfc', 'https://res.cloudinary.com/drwaqb1pr/video/upload/v1788529127/connectX/kyc/voice_notes/pcsqolqby3byyyzsdeol.m4a', 'bengali', 'pending', NULL, NULL, NULL, '2026-09-04 13:38:49', '2026-09-04 13:38:49'),
(2, 30, '123456789012', 'BHGYJ3467G', NULL, NULL, NULL, NULL, 'anu12upi.axis', 'https://res.cloudinary.com/drwaqb1pr/video/upload/v1788531166/connectX/kyc/voice_notes/w3iozagus5yhefparwfs.m4a', 'bengali', 'pending', NULL, NULL, NULL, '2026-09-04 14:12:48', '2026-09-04 14:12:48'),
(3, 34, '123458587896', 'FSFGHYG576', NULL, NULL, NULL, NULL, 'riya@sbi', 'https://res.cloudinary.com/drwaqb1pr/video/upload/v1788958544/connectX/kyc/voice_notes/ktuj17ozr2oc0yrywba2.m4a', 'bengali', 'pending', NULL, NULL, NULL, '2026-09-09 12:55:46', '2026-09-09 12:55:46');

-- --------------------------------------------------------

--
-- Table structure for table `user_photos`
--

CREATE TABLE `user_photos` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `photo_url` varchar(500) NOT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  `display_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `user_preferences`
--

CREATE TABLE `user_preferences` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `min_age` int DEFAULT '18',
  `max_age` int DEFAULT '50',
  `preferred_gender` enum('male','female','both') DEFAULT 'both',
  `max_distance_km` int DEFAULT '50',
  `show_me` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `user_preferences`
--

INSERT INTO `user_preferences` (`id`, `user_id`, `min_age`, `max_age`, `preferred_gender`, `max_distance_km`, `show_me`, `created_at`, `updated_at`) VALUES
(1, 21, 18, 50, 'both', 50, 1, '2026-08-29 16:53:16', '2026-08-29 16:53:16'),
(2, 22, 18, 50, 'both', 50, 1, '2026-08-29 17:12:11', '2026-08-29 17:12:11'),
(3, 23, 18, 50, 'both', 50, 1, '2026-08-29 22:09:14', '2026-08-29 22:09:14'),
(4, 24, 18, 50, 'both', 50, 1, '2026-09-03 10:54:27', '2026-09-03 10:54:27'),
(5, 25, 18, 50, 'both', 50, 1, '2026-09-03 10:55:34', '2026-09-03 10:55:34'),
(6, 26, 18, 50, 'both', 50, 1, '2026-09-03 11:25:20', '2026-09-03 11:25:20'),
(7, 27, 18, 50, 'both', 50, 1, '2026-09-04 12:31:11', '2026-09-04 12:31:11'),
(8, 28, 18, 50, 'both', 50, 1, '2026-09-04 13:32:41', '2026-09-04 13:32:41'),
(9, 29, 18, 50, 'both', 50, 1, '2026-09-04 13:38:45', '2026-09-04 13:38:45'),
(10, 30, 18, 50, 'both', 50, 1, '2026-09-04 14:12:44', '2026-09-04 14:12:44'),
(11, 31, 18, 50, 'both', 50, 1, '2026-09-04 19:59:21', '2026-09-04 19:59:21'),
(12, 32, 18, 50, 'both', 50, 1, '2026-09-09 12:00:29', '2026-09-09 12:00:29'),
(14, 34, 18, 50, 'both', 50, 1, '2026-09-09 12:17:49', '2026-09-09 12:17:49');

-- --------------------------------------------------------

--
-- Table structure for table `user_reports`
--

CREATE TABLE `user_reports` (
  `id` int NOT NULL,
  `reporter_id` int NOT NULL,
  `reported_id` int NOT NULL,
  `reason` enum('fake_profile','inappropriate_content','harassment','spam','underage','other') NOT NULL,
  `description` text,
  `status` enum('pending','reviewed','warning_issued','suspended','dismissed') DEFAULT 'pending',
  `admin_id` int DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `user_subscriptions`
--

CREATE TABLE `user_subscriptions` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `plan_id` int NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `payment_status` enum('pending','completed','failed','refunded','cancelled') DEFAULT 'pending',
  `payment_id` varchar(255) DEFAULT NULL,
  `payment_method` varchar(100) DEFAULT NULL,
  `amount_paid` decimal(10,2) DEFAULT '0.00',
  `is_active` tinyint(1) DEFAULT '1',
  `auto_renew` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `voice_rooms`
--

CREATE TABLE `voice_rooms` (
  `id` int NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` text,
  `host_id` int NOT NULL,
  `max_members` int DEFAULT '8',
  `is_active` tinyint(1) DEFAULT '1',
  `category` enum('dating','friendship','support','fun','language') DEFAULT 'dating',
  `language` varchar(50) DEFAULT 'English',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `voice_room_members`
--

CREATE TABLE `voice_room_members` (
  `id` int NOT NULL,
  `room_id` int NOT NULL,
  `user_id` int NOT NULL,
  `role` enum('host','moderator','member') DEFAULT 'member',
  `is_muted` tinyint(1) DEFAULT '0',
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `left_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `wallets`
--

CREATE TABLE `wallets` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `balance` decimal(10,2) DEFAULT '0.00',
  `total_recharged` decimal(10,2) DEFAULT '0.00',
  `total_spent` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `wallets`
--

INSERT INTO `wallets` (`id`, `user_id`, `balance`, `total_recharged`, `total_spent`, `created_at`, `updated_at`) VALUES
(1, 1, 80.00, 244.00, 0.00, '2026-08-29 12:23:46', '2026-08-29 12:23:46'),
(2, 2, 85.00, 222.00, 0.00, '2026-08-29 12:23:46', '2026-08-29 12:23:46'),
(3, 3, 14.00, 176.00, 0.00, '2026-08-29 12:23:46', '2026-08-29 12:23:46'),
(4, 4, 13.00, 107.00, 0.00, '2026-08-29 12:23:46', '2026-08-29 12:23:46'),
(5, 5, 41.00, 194.00, 0.00, '2026-08-29 12:23:46', '2026-08-29 12:23:46'),
(6, 6, 76.00, 79.00, 0.00, '2026-08-29 12:23:46', '2026-08-29 12:23:46'),
(7, 7, 85.00, 117.00, 0.00, '2026-08-29 12:23:46', '2026-08-29 12:23:46'),
(8, 8, 52.00, 69.00, 0.00, '2026-08-29 12:23:46', '2026-08-29 12:23:46'),
(9, 9, 32.00, 216.00, 0.00, '2026-08-29 12:23:46', '2026-08-29 12:23:46'),
(10, 10, 108.00, 283.00, 0.00, '2026-08-29 12:23:46', '2026-08-29 12:31:30'),
(16, 21, 0.00, 0.00, 0.00, '2026-08-29 16:53:16', '2026-08-29 16:53:16'),
(17, 22, 200.00, 200.00, 0.00, '2026-08-29 17:12:11', '2026-08-29 17:12:41'),
(18, 23, 1344.09, 1350.00, 5.91, '2026-08-29 22:09:14', '2026-09-01 17:57:28'),
(19, 25, 0.00, 0.00, 0.00, '2026-09-03 10:55:37', '2026-09-03 10:55:37'),
(20, 26, 0.00, 0.00, 0.00, '2026-09-03 11:25:22', '2026-09-03 11:25:22'),
(21, 28, 0.00, 0.00, 0.00, '2026-09-04 13:34:46', '2026-09-04 13:34:46'),
(22, 29, 0.00, 0.00, 0.00, '2026-09-04 14:04:35', '2026-09-04 14:04:35'),
(23, 30, 0.00, 0.00, 0.00, '2026-09-04 14:12:50', '2026-09-04 14:12:50'),
(24, 31, 1000.00, 1000.00, 0.00, '2026-09-04 19:59:23', '2026-09-04 20:00:25'),
(25, 34, 0.00, 0.00, 0.00, '2026-09-09 12:58:56', '2026-09-09 12:58:56'),
(26, 32, 50.00, 50.00, 0.00, '2026-09-10 09:46:24', '2026-09-10 10:44:43');

-- --------------------------------------------------------

--
-- Table structure for table `wallet_transactions`
--

CREATE TABLE `wallet_transactions` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `type` enum('recharge','call_payment','refund','bonus') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `reference_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `wallet_transactions`
--

INSERT INTO `wallet_transactions` (`id`, `user_id`, `type`, `amount`, `description`, `reference_id`, `created_at`) VALUES
(1, 10, 'recharge', 50.00, 'Recharged ₹50', NULL, '2026-08-29 12:31:30'),
(2, 22, 'recharge', 200.00, 'Recharged ₹200', NULL, '2026-08-29 17:12:41'),
(3, 23, 'recharge', 50.00, 'Recharged ₹50', NULL, '2026-08-29 22:09:27'),
(4, 23, 'call_payment', 2.00, 'Call cost - 24s', NULL, '2026-08-29 22:34:17'),
(5, 23, 'call_payment', 0.17, 'Call cost - 2s', NULL, '2026-08-29 22:34:32'),
(6, 23, 'call_payment', 0.08, 'Call cost - 1s', NULL, '2026-08-30 09:04:47'),
(7, 23, 'call_payment', 1.25, 'Call cost - 15s', NULL, '2026-08-30 12:49:59'),
(8, 23, 'call_payment', 1.33, 'Call cost - 16s', NULL, '2026-08-30 12:50:00'),
(9, 23, 'recharge', 200.00, 'Recharged ₹200', NULL, '2026-08-30 12:50:10'),
(10, 23, 'recharge', 100.00, 'Recharged ₹100', NULL, '2026-08-30 12:50:27'),
(11, 23, 'recharge', 1000.00, 'Recharged ₹1000', NULL, '2026-08-30 12:50:34'),
(12, 23, 'call_payment', 1.08, 'Call cost - 13s', NULL, '2026-09-01 17:57:28'),
(13, 31, 'recharge', 1000.00, 'Recharged ₹1000', NULL, '2026-09-04 20:00:25'),
(14, 32, 'recharge', 50.00, 'Recharged ₹50', NULL, '2026-09-10 10:44:44');

-- --------------------------------------------------------

--
-- Table structure for table `withdrawal_requests`
--

CREATE TABLE `withdrawal_requests` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('bank','upi') NOT NULL,
  `account_number` varchar(50) DEFAULT NULL,
  `ifsc_code` varchar(20) DEFAULT NULL,
  `bank_name` varchar(200) DEFAULT NULL,
  `upi_id` varchar(200) DEFAULT NULL,
  `status` enum('pending','approved','rejected','completed') DEFAULT 'pending',
  `admin_id` int DEFAULT NULL,
  `rejection_reason` text,
  `processed_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_users`
--
ALTER TABLE `admin_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `app_settings`
--
ALTER TABLE `app_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`);

--
-- Indexes for table `calls`
--
ALTER TABLE `calls`
  ADD PRIMARY KEY (`id`),
  ADD KEY `caller_id` (`caller_id`),
  ADD KEY `expert_id` (`expert_id`);

--
-- Indexes for table `call_queue`
--
ALTER TABLE `call_queue`
  ADD PRIMARY KEY (`id`),
  ADD KEY `caller_id` (`caller_id`);

--
-- Indexes for table `experts`
--
ALTER TABLE `experts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `ice_breakers`
--
ALTER TABLE `ice_breakers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `interests`
--
ALTER TABLE `interests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `matches`
--
ALTER TABLE `matches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_match` (`user1_id`,`user2_id`),
  ADD KEY `user2_id` (`user2_id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `match_id` (`match_id`),
  ADD KEY `sender_id` (`sender_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `subscription_plans`
--
ALTER TABLE `subscription_plans`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `swipes`
--
ALTER TABLE `swipes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_swipe` (`swiper_id`,`swiped_id`),
  ADD KEY `swiped_id` (`swiped_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone` (`phone`),
  ADD UNIQUE KEY `dating_id` (`dating_id`);

--
-- Indexes for table `user_blocks`
--
ALTER TABLE `user_blocks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_block` (`blocker_id`,`blocked_id`),
  ADD KEY `blocked_id` (`blocked_id`);

--
-- Indexes for table `user_interests`
--
ALTER TABLE `user_interests`
  ADD PRIMARY KEY (`user_id`,`interest_id`),
  ADD KEY `interest_id` (`interest_id`);

--
-- Indexes for table `user_kyc`
--
ALTER TABLE `user_kyc`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `user_photos`
--
ALTER TABLE `user_photos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `user_preferences`
--
ALTER TABLE `user_preferences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `user_reports`
--
ALTER TABLE `user_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reporter_id` (`reporter_id`),
  ADD KEY `reported_id` (`reported_id`);

--
-- Indexes for table `user_subscriptions`
--
ALTER TABLE `user_subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `plan_id` (`plan_id`);

--
-- Indexes for table `voice_rooms`
--
ALTER TABLE `voice_rooms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `host_id` (`host_id`);

--
-- Indexes for table `voice_room_members`
--
ALTER TABLE `voice_room_members`
  ADD PRIMARY KEY (`id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `wallets`
--
ALTER TABLE `wallets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `withdrawal_requests`
--
ALTER TABLE `withdrawal_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_users`
--
ALTER TABLE `admin_users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `app_settings`
--
ALTER TABLE `app_settings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT for table `calls`
--
ALTER TABLE `calls`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `call_queue`
--
ALTER TABLE `call_queue`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `experts`
--
ALTER TABLE `experts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `ice_breakers`
--
ALTER TABLE `ice_breakers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `interests`
--
ALTER TABLE `interests`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=91;

--
-- AUTO_INCREMENT for table `matches`
--
ALTER TABLE `matches`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subscription_plans`
--
ALTER TABLE `subscription_plans`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `swipes`
--
ALTER TABLE `swipes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `user_blocks`
--
ALTER TABLE `user_blocks`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_kyc`
--
ALTER TABLE `user_kyc`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `user_photos`
--
ALTER TABLE `user_photos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_preferences`
--
ALTER TABLE `user_preferences`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `user_reports`
--
ALTER TABLE `user_reports`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_subscriptions`
--
ALTER TABLE `user_subscriptions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `voice_rooms`
--
ALTER TABLE `voice_rooms`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `voice_room_members`
--
ALTER TABLE `voice_room_members`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `wallets`
--
ALTER TABLE `wallets`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `withdrawal_requests`
--
ALTER TABLE `withdrawal_requests`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `calls`
--
ALTER TABLE `calls`
  ADD CONSTRAINT `calls_ibfk_1` FOREIGN KEY (`caller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `calls_ibfk_2` FOREIGN KEY (`expert_id`) REFERENCES `experts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `call_queue`
--
ALTER TABLE `call_queue`
  ADD CONSTRAINT `call_queue_ibfk_1` FOREIGN KEY (`caller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `experts`
--
ALTER TABLE `experts`
  ADD CONSTRAINT `experts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `matches`
--
ALTER TABLE `matches`
  ADD CONSTRAINT `matches_ibfk_1` FOREIGN KEY (`user1_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `matches_ibfk_2` FOREIGN KEY (`user2_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`match_id`) REFERENCES `matches` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `swipes`
--
ALTER TABLE `swipes`
  ADD CONSTRAINT `swipes_ibfk_1` FOREIGN KEY (`swiper_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `swipes_ibfk_2` FOREIGN KEY (`swiped_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_blocks`
--
ALTER TABLE `user_blocks`
  ADD CONSTRAINT `user_blocks_ibfk_1` FOREIGN KEY (`blocker_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_blocks_ibfk_2` FOREIGN KEY (`blocked_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_interests`
--
ALTER TABLE `user_interests`
  ADD CONSTRAINT `user_interests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_interests_ibfk_2` FOREIGN KEY (`interest_id`) REFERENCES `interests` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_kyc`
--
ALTER TABLE `user_kyc`
  ADD CONSTRAINT `user_kyc_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_photos`
--
ALTER TABLE `user_photos`
  ADD CONSTRAINT `user_photos_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_preferences`
--
ALTER TABLE `user_preferences`
  ADD CONSTRAINT `user_preferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_reports`
--
ALTER TABLE `user_reports`
  ADD CONSTRAINT `user_reports_ibfk_1` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_reports_ibfk_2` FOREIGN KEY (`reported_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_subscriptions`
--
ALTER TABLE `user_subscriptions`
  ADD CONSTRAINT `user_subscriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_subscriptions_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `voice_rooms`
--
ALTER TABLE `voice_rooms`
  ADD CONSTRAINT `voice_rooms_ibfk_1` FOREIGN KEY (`host_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `voice_room_members`
--
ALTER TABLE `voice_room_members`
  ADD CONSTRAINT `voice_room_members_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `voice_rooms` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `voice_room_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wallets`
--
ALTER TABLE `wallets`
  ADD CONSTRAINT `wallets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  ADD CONSTRAINT `wallet_transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `withdrawal_requests`
--
ALTER TABLE `withdrawal_requests`
  ADD CONSTRAINT `withdrawal_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
