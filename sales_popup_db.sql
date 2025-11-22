-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 22, 2025 at 08:56 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sales_popup_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `countdown_timers`
--

CREATE TABLE `countdown_timers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `shop_id` bigint(20) UNSIGNED NOT NULL,
  `timer_id` char(36) NOT NULL,
  `timer_name` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `sub_heading` varchar(255) NOT NULL,
  `timer_labels` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`timer_labels`)),
  `timer_type` enum('fixed','generic','daily') NOT NULL,
  `timer_config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`timer_config`)),
  `design_config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`design_config`)),
  `placement_config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`placement_config`)),
  `is_published` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `countdown_timers`
--

INSERT INTO `countdown_timers` (`id`, `shop_id`, `timer_id`, `timer_name`, `title`, `sub_heading`, `timer_labels`, `timer_type`, `timer_config`, `design_config`, `placement_config`, `is_published`, `created_at`, `updated_at`) VALUES
(2, 1, '27ac73c7-fda4-43f6-abe0-5dbb7f9ac4e8', 'Countdown Timer', 'Hurry Up!', 'Sale ends in:', '{\"days\":\"Days\",\"hours\":\"Hrs\",\"minutes\":\"Mins\",\"seconds\":\"Secs\"}', 'fixed', '{\"fixed_minutes\":60,\"once_it_ends\":\"hide\",\"custom_end_title\":\"Sales Ends\"}', '{\"backgroundColor\":{\"hue\":0,\"saturation\":0.8944791793823242,\"brightness\":0.8603124618530273,\"alpha\":1},\"hexColor\":\"#db1717\",\"borderColor\":{\"hue\":0,\"saturation\":0,\"brightness\":0.8},\"cardBorderRadius\":12,\"cardBorderSize\":2,\"cardBorderColor\":\"#333333\",\"borderHexColor\":\"#cccccc\",\"insideTop\":10,\"insideBottom\":10,\"outsideTop\":0,\"outsideBottom\":0,\"titleSize\":28,\"titleColor\":{\"hue\":0,\"saturation\":0,\"brightness\":0.13},\"titleHexColor\":\"#202223\",\"subheadingSize\":16,\"subheadingColor\":{\"hue\":0,\"saturation\":0,\"brightness\":0.13},\"subheadingHexColor\":\"#202223\",\"timerSize\":40,\"timerColor\":{\"hue\":0,\"saturation\":0,\"brightness\":0.13},\"timerHexColor\":\"#202223\",\"legendSize\":14,\"legendColor\":{\"hue\":0,\"saturation\":0,\"brightness\":0.13},\"legendHexColor\":\"#202223\",\"borderRadius\":6,\"borderWidth\":1}', '{\"display_position\":\"before-title\",\"display_pages\":\"product-only\"}', 1, '2025-10-31 23:49:57', '2025-11-06 01:57:53'),
(5, 2, '5ef1b4ea-d6ea-4428-984c-a71682b2a8c3', 'gfdgh', 'Hurry Up!', 'Sale ends in:', '{\"days\":\"Days\",\"hours\":\"Hrs\",\"minutes\":\"Mins\",\"seconds\":\"Secs\"}', 'fixed', '{\"fixed_minutes\":423,\"once_it_ends\":\"hide\",\"custom_end_title\":\"Sales Ends\"}', '{\"backgroundColor\":{\"hue\":0,\"saturation\":0.9262500047683716,\"brightness\":0.8774999618530274,\"alpha\":1},\"hexColor\":\"#e01111\",\"borderColor\":{\"hue\":0,\"saturation\":0,\"brightness\":0.8},\"cardBorderRadius\":0,\"cardBorderSize\":2,\"cardBorderColor\":\"#333333\",\"borderHexColor\":\"#cccccc\",\"insideTop\":10,\"insideBottom\":10,\"outsideTop\":0,\"outsideBottom\":0,\"titleSize\":28,\"titleColor\":{\"hue\":0,\"saturation\":0,\"brightness\":0.13},\"titleHexColor\":\"#202223\",\"subheadingSize\":16,\"subheadingColor\":{\"hue\":0,\"saturation\":0,\"brightness\":0.13},\"subheadingHexColor\":\"#202223\",\"timerSize\":40,\"timerColor\":{\"hue\":0,\"saturation\":0,\"brightness\":0.13},\"timerHexColor\":\"#202223\",\"legendSize\":14,\"legendColor\":{\"hue\":114.985082825618,\"saturation\":0.8950000047683716,\"brightness\":0.8949999809265137,\"alpha\":1},\"legendHexColor\":\"#29e418\",\"borderRadius\":6,\"borderWidth\":1}', '{\"display_position\":\"top\",\"display_pages\":\"all\"}', 1, '2025-11-17 04:59:15', '2025-11-17 04:59:15'),
(6, 3, '6101d0ee-4fe0-42be-8082-ef8debf928dd', 'Countdown Timer', 'Hurry Up!', 'Sale ends in:', '{\"days\":\"DAYS\",\"hours\":\"HOURS\",\"minutes\":\"MINUTES\",\"seconds\":\"SECONDS\"}', 'fixed', '{\"fixed_minutes\":188,\"once_it_ends\":\"hide\",\"custom_end_title\":\"Sales Ends\"}', '{\"backgroundColor\":{\"hue\":211.16419550198228,\"saturation\":0.8950000047683716,\"brightness\":0.8462499618530274,\"alpha\":1},\"hexColor\":\"#1773d8\",\"borderColor\":{\"hue\":0,\"saturation\":0,\"brightness\":0.8},\"cardBorderRadius\":0,\"cardBorderSize\":0,\"cardBorderColor\":\"#333333\",\"borderHexColor\":\"#cccccc\",\"insideTop\":10,\"insideBottom\":10,\"outsideTop\":0,\"outsideBottom\":0,\"titleSize\":28,\"titleColor\":{\"hue\":0,\"saturation\":0,\"brightness\":1,\"alpha\":1},\"titleHexColor\":\"#ffffff\",\"subheadingSize\":16,\"subheadingColor\":{\"hue\":0,\"saturation\":0,\"brightness\":1,\"alpha\":1},\"subheadingHexColor\":\"#ffffff\",\"timerSize\":40,\"timerColor\":{\"hue\":0,\"saturation\":0,\"brightness\":1,\"alpha\":1},\"timerHexColor\":\"#ffffff\",\"legendSize\":14,\"legendColor\":{\"hue\":0,\"saturation\":0,\"brightness\":1,\"alpha\":1},\"legendHexColor\":\"#ffffff\",\"borderRadius\":6,\"borderWidth\":1}', '{\"display_position\":\"before-title\",\"display_pages\":\"all\"}', 1, '2025-11-18 03:14:54', '2025-11-18 03:14:54');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2019_08_19_000000_create_failed_jobs_table', 1),
(2, '2021_05_03_050717_create_sessions_table', 1),
(3, '2021_05_05_071311_add_scope_expires_access_token_to_sessions', 1),
(4, '2021_05_11_151158_add_online_access_info_to_sessions', 1),
(5, '2021_05_17_152611_change_sessions_user_id_type', 1),
(6, '2025_10_30_092757_create_shops_table', 2),
(7, '2025_10_30_093543_create_countdown_timers_table', 3),
(8, '2025_10_30_123715_create_stock_countdowns_table', 4);

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `session_id` varchar(255) NOT NULL,
  `shop` varchar(255) NOT NULL,
  `is_online` tinyint(1) NOT NULL,
  `state` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `scope` varchar(255) DEFAULT NULL,
  `access_token` varchar(255) DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `user_first_name` varchar(255) DEFAULT NULL,
  `user_last_name` varchar(255) DEFAULT NULL,
  `user_email` varchar(255) DEFAULT NULL,
  `user_email_verified` tinyint(1) DEFAULT NULL,
  `account_owner` tinyint(1) DEFAULT NULL,
  `locale` varchar(255) DEFAULT NULL,
  `collaborator` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `session_id`, `shop`, `is_online`, `state`, `created_at`, `updated_at`, `scope`, `access_token`, `expires_at`, `user_id`, `user_first_name`, `user_last_name`, `user_email`, `user_email_verified`, `account_owner`, `locale`, `collaborator`) VALUES
(25, 'offline_ordevs-count.myshopify.com', 'ordevs-count.myshopify.com', 0, '', '2025-11-16 23:54:30', '2025-11-16 23:54:30', 'read_inventory,read_products', 'shpua_49e56727137fd18ad2131f228fc30925', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(28, 'offline_sales-popup-1123.myshopify.com', 'sales-popup-1123.myshopify.com', 0, '', '2025-11-17 06:05:11', '2025-11-17 06:05:11', 'read_inventory,read_products', 'shpua_a88798250b361f2b2f7324f6799e6567', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(30, 'offline_mohammaddali.myshopify.com', 'mohammaddali.myshopify.com', 0, '', '2025-11-18 05:45:47', '2025-11-18 05:45:47', 'read_inventory,read_products', 'shpua_33e46f580e27ebb8e9f078b8f9807a54', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `shops`
--

CREATE TABLE `shops` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `shop` varchar(255) NOT NULL,
  `access_token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `shops`
--

INSERT INTO `shops` (`id`, `shop`, `access_token`, `created_at`, `updated_at`) VALUES
(1, 'ordevs-count.myshopify.com', 'shpua_0bfb519e0dfdb5bbc4033ce863e4d17e', '2025-10-30 04:39:34', '2025-10-31 23:49:56'),
(2, 'sales-popup-1123.myshopify.com', 'shpua_a88798250b361f2b2f7324f6799e6567', '2025-11-02 05:55:41', '2025-11-17 06:05:11'),
(3, 'mohammaddali.myshopify.com', 'shpua_33e46f580e27ebb8e9f078b8f9807a54', '2025-11-17 00:54:56', '2025-11-18 05:45:47');

-- --------------------------------------------------------

--
-- Table structure for table `stock_countdowns`
--

CREATE TABLE `stock_countdowns` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `shop_id` bigint(20) UNSIGNED NOT NULL,
  `stock_id` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT 0,
  `stock_limit` int(11) NOT NULL,
  `message_template` text NOT NULL,
  `selected_variants` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`selected_variants`)),
  `show_progress_bar` tinyint(1) NOT NULL DEFAULT 0,
  `bar_color` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`bar_color`)),
  `bar_hex_color` varchar(255) NOT NULL,
  `progress_bar_style` enum('rounded','flat') NOT NULL DEFAULT 'rounded',
  `progress_bar_position` enum('above','below') NOT NULL DEFAULT 'below',
  `progress_bar_width` int(11) NOT NULL DEFAULT 100,
  `progress_bar_height` int(11) NOT NULL DEFAULT 8,
  `progress_bar_background_color` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`progress_bar_background_color`)),
  `progress_bar_background_hex_color` varchar(255) NOT NULL,
  `design_config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`design_config`)),
  `placement_config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`placement_config`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stock_countdowns`
--

INSERT INTO `stock_countdowns` (`id`, `shop_id`, `stock_id`, `title`, `is_published`, `stock_limit`, `message_template`, `selected_variants`, `show_progress_bar`, `bar_color`, `bar_hex_color`, `progress_bar_style`, `progress_bar_position`, `progress_bar_width`, `progress_bar_height`, `progress_bar_background_color`, `progress_bar_background_hex_color`, `design_config`, `placement_config`, `created_at`, `updated_at`) VALUES
(6, 1, '2fab0344-4788-4886-95fd-c1ea7ad649fa', 'Stock Countdown Alert', 1, 100, 'Only {{stock}} left.', '[{\"id\":\"gid:\\/\\/shopify\\/Product\\/7824218619983\",\"title\":\"Selling Plans Ski Wax\",\"handle\":\"selling-plans-ski-wax\",\"image\":\"https:\\/\\/cdn.shopify.com\\/s\\/files\\/1\\/0656\\/2539\\/1183\\/files\\/snowboard_wax.png?v=1755094041\",\"price\":\"24.95\",\"totalVariants\":3,\"variants\":[{\"id\":\"gid:\\/\\/shopify\\/ProductVariant\\/43510940598351\",\"title\":\"Selling Plans Ski Wax\",\"sku\":null,\"price\":\"24.95\",\"inventoryQuantity\":10},{\"id\":\"gid:\\/\\/shopify\\/ProductVariant\\/43510940631119\",\"title\":\"Special Selling Plans Ski Wax\",\"sku\":null,\"price\":\"49.95\",\"inventoryQuantity\":10},{\"id\":\"gid:\\/\\/shopify\\/ProductVariant\\/43510940663887\",\"title\":\"Sample Selling Plans Ski Wax\",\"sku\":null,\"price\":\"9.95\",\"inventoryQuantity\":10}]},{\"id\":\"gid:\\/\\/shopify\\/Product\\/7831085285455\",\"title\":\"t-shirt\",\"handle\":\"t-shirt\",\"image\":\"https:\\/\\/cdn.shopify.com\\/s\\/files\\/1\\/0656\\/2539\\/1183\\/files\\/product5.jpg?v=1756282763\",\"price\":\"1500.00\",\"totalVariants\":3,\"variants\":[{\"id\":\"gid:\\/\\/shopify\\/ProductVariant\\/43546683965519\",\"title\":\"Black\",\"sku\":null,\"price\":\"1500.00\",\"inventoryQuantity\":95},{\"id\":\"gid:\\/\\/shopify\\/ProductVariant\\/43546683998287\",\"title\":\"Bronze\",\"sku\":null,\"price\":\"1500.00\",\"inventoryQuantity\":25},{\"id\":\"gid:\\/\\/shopify\\/ProductVariant\\/43546684031055\",\"title\":\"Blue\",\"sku\":null,\"price\":\"1500.00\",\"inventoryQuantity\":30}]},{\"id\":\"gid:\\/\\/shopify\\/Product\\/7824218423375\",\"title\":\"The Complete Snowboard\",\"handle\":\"the-complete-snowboard\",\"image\":\"https:\\/\\/cdn.shopify.com\\/s\\/files\\/1\\/0656\\/2539\\/1183\\/files\\/Main_589fc064-24a2-4236-9eaf-13b2bd35d21d.jpg?v=1755094041\",\"price\":\"699.95\",\"totalVariants\":5,\"variants\":[{\"id\":\"gid:\\/\\/shopify\\/ProductVariant\\/43510940303439\",\"title\":\"Ice\",\"sku\":null,\"price\":\"699.95\",\"inventoryQuantity\":10},{\"id\":\"gid:\\/\\/shopify\\/ProductVariant\\/43510940336207\",\"title\":\"Dawn\",\"sku\":null,\"price\":\"699.95\",\"inventoryQuantity\":10},{\"id\":\"gid:\\/\\/shopify\\/ProductVariant\\/43510940467279\",\"title\":\"Powder\",\"sku\":null,\"price\":\"699.95\",\"inventoryQuantity\":10},{\"id\":\"gid:\\/\\/shopify\\/ProductVariant\\/43510940532815\",\"title\":\"Electric\",\"sku\":null,\"price\":\"699.95\",\"inventoryQuantity\":10},{\"id\":\"gid:\\/\\/shopify\\/ProductVariant\\/43510940565583\",\"title\":\"Sunset\",\"sku\":null,\"price\":\"699.95\",\"inventoryQuantity\":10}]}]', 1, '{\"hue\":120,\"saturation\":1,\"brightness\":1}', '#00ff00', 'rounded', 'below', 100, 17, '{\"hue\":221.1939751923974,\"saturation\":0.9694791793823242,\"brightness\":0.9479167938232422,\"alpha\":1}', '#0751f2', '{\"backgroundColor\":{\"hue\":0,\"saturation\":0.9382291793823242,\"brightness\":0.9103124618530274,\"alpha\":1},\"hexColor\":\"#e80e0e\",\"borderColor\":{\"hue\":0,\"saturation\":0,\"brightness\":0.8},\"cardBorderRadius\":3,\"cardBorderSize\":4,\"cardBorderColor\":\"#333333\",\"borderHexColor\":\"#cccccc\",\"insideTop\":10,\"insideBottom\":10,\"outsideTop\":0,\"outsideBottom\":0,\"messageSize\":23,\"messageColor\":{\"hue\":0,\"saturation\":0,\"brightness\":0.13},\"messageHexColor\":\"#202223\"}', '{\"display_position\":\"top\",\"display_pages\":\"product-only\"}', '2025-11-12 00:43:27', '2025-11-12 00:43:27');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `countdown_timers`
--
ALTER TABLE `countdown_timers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `countdown_timers_timer_id_unique` (`timer_id`),
  ADD KEY `countdown_timers_shop_id_is_published_index` (`shop_id`,`is_published`),
  ADD KEY `countdown_timers_timer_type_index` (`timer_type`),
  ADD KEY `countdown_timers_timer_id_index` (`timer_id`),
  ADD KEY `countdown_timers_created_at_index` (`created_at`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sessions_session_id_unique` (`session_id`);

--
-- Indexes for table `shops`
--
ALTER TABLE `shops`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `shops_shop_unique` (`shop`);

--
-- Indexes for table `stock_countdowns`
--
ALTER TABLE `stock_countdowns`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `stock_countdowns_stock_id_unique` (`stock_id`),
  ADD KEY `stock_countdowns_shop_id_is_published_index` (`shop_id`,`is_published`),
  ADD KEY `stock_countdowns_stock_id_index` (`stock_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `countdown_timers`
--
ALTER TABLE `countdown_timers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `shops`
--
ALTER TABLE `shops`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `stock_countdowns`
--
ALTER TABLE `stock_countdowns`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `stock_countdowns`
--
ALTER TABLE `stock_countdowns`
  ADD CONSTRAINT `stock_countdowns_shop_id_foreign` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
