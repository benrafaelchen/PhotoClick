-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: ינואר 11, 2026 בזמן 01:41 PM
-- גרסת שרת: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `photodb`
--

-- --------------------------------------------------------

--
-- מבנה טבלה עבור טבלה `eventkind`
--

CREATE TABLE `eventkind` (
  `EventName` varchar(255) NOT NULL,
  `EventSerial` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- הוצאת מידע עבור טבלה `eventkind`
--

INSERT INTO `eventkind` (`EventName`, `EventSerial`) VALUES
('Bar Mitzvah Party', 104),
('Bat Mitzvah Party', 105),
('Birth Daughter Party', 106),
('Birth Son Party', 107),
('Birthday Party', 108),
('Henna Party', 102),
('Save The Date', 103),
('Wedding Party', 101);

-- --------------------------------------------------------

--
-- מבנה טבלה עבור טבלה `faq`
--

CREATE TABLE `faq` (
  `faq_id` int(11) NOT NULL,
  `faq_title` varchar(255) NOT NULL,
  `faq_content` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- הוצאת מידע עבור טבלה `faq`
--

INSERT INTO `faq` (`faq_id`, `faq_title`, `faq_content`, `created_at`) VALUES
(10, 'Do you offer videography services in addition to photography?', 'Yes, we offer professional videography services alongside our photography packages. Our skilled videographers are equipped to capture your event in stunning high-definition video, preserving every moment and emotion for you to cherish for years to come. W', '2025-12-28 05:38:49'),
(11, 'How do I place an order for photography services?', 'Placing an order with PhotoClick is easy! Simply visit our website and navigate to the \'Create New Order\' section. Follow the prompts to provide details about your event, select your desired package, and complete the booking process.', '2025-12-28 05:39:00'),
(12, 'What types of events do you cover?', 'PhotoClick specializes in capturing a wide range of events, including weddings, birthday parties, corporate events, family gatherings, and more. Whatever the occasion, our experienced photographers and videographers are ready to preserve your special mome', '2025-12-28 05:39:11'),
(13, 'Can I customize my photography package?', 'Yes, we offer customizable photography packages to suit your specific needs and preferences. Whether you need additional hours of coverage, extra prints, or special editing services, we can tailor a package that meets your requirements.', '2025-12-28 05:39:21'),
(14, 'How long does it take to receive my photos and videos after the event?', 'Our turnaround time for delivering photos and videos varies depending on the scope of the project and our current workload. However, we strive to provide a quick and efficient service, and you can expect to receive your edited photos and videos within [in', '2025-12-28 05:39:30'),
(15, 'What safety measures do you have in place during the COVID-19 pandemic?', 'At PhotoClick, the health and safety of our clients and staff are our top priority. We strictly adhere to all local health guidelines and regulations to ensure a safe and enjoyable experience for everyone involved. Our photographers and videographers wear', '2025-12-28 05:39:41');

-- --------------------------------------------------------

--
-- מבנה טבלה עבור טבלה `images`
--

CREATE TABLE `images` (
  `id` int(11) NOT NULL,
  `image_name` varchar(255) NOT NULL,
  `image_type` varchar(100) NOT NULL,
  `image_data` varchar(255) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `event_type` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- הוצאת מידע עבור טבלה `images`
--

INSERT INTO `images` (`id`, `image_name`, `image_type`, `image_data`, `uploaded_at`, `event_type`) VALUES
(56, '1767158807014-LS1_1503.JPG', 'image/jpeg', '', '2025-12-31 05:26:47', 'bar-mitzvah'),
(57, '1767158807058-LS1_1504.JPG', 'image/jpeg', '', '2025-12-31 05:26:47', 'bar-mitzvah'),
(58, '1767158807092-LS1_1505.JPG', 'image/jpeg', '', '2025-12-31 05:26:47', 'bar-mitzvah'),
(59, '1767158807132-LS1_1506.JPG', 'image/jpeg', '', '2025-12-31 05:26:47', 'bar-mitzvah'),
(60, '1767158807168-LS1_1507.JPG', 'image/jpeg', '', '2025-12-31 05:26:47', 'bar-mitzvah'),
(62, '1767158807242-LS1_1511.JPG', 'image/jpeg', '', '2025-12-31 05:26:47', 'bar-mitzvah'),
(64, '1767158807320-LS1_1513.JPG', 'image/jpeg', '', '2025-12-31 05:26:47', 'bar-mitzvah'),
(66, '1767158877942-DSC_3497.JPG', 'image/jpeg', '', '2025-12-31 05:27:58', 'wedding'),
(67, '1767158877971-DSC_3536.JPG', 'image/jpeg', '', '2025-12-31 05:27:58', 'wedding'),
(68, '1767158878005-DSC_3575.JPG', 'image/jpeg', '', '2025-12-31 05:27:58', 'wedding'),
(70, '1767163022266-LS1_6104.JPG', 'image/jpeg', '', '2025-12-31 06:37:02', 'wedding'),
(72, '1767512139824-3E5A8066.jpg', 'image/jpeg', '', '2026-01-04 07:35:39', 'henna'),
(73, '1767512139843-3E5A8130.jpg', 'image/jpeg', '', '2026-01-04 07:35:39', 'henna'),
(74, '1767512139864-3E5A8141.jpg', 'image/jpeg', '', '2026-01-04 07:35:40', 'henna'),
(75, '1767512139887-3E5A8155.jpg', 'image/jpeg', '', '2026-01-04 07:35:40', 'henna'),
(76, '1767512139911-3E5A8157.jpg', 'image/jpeg', '', '2026-01-04 07:35:40', 'henna'),
(78, '1767512139963-×××××.jpg', 'image/jpeg', '', '2026-01-04 07:35:40', 'henna'),
(82, '1767598034483-1.jpeg', 'image/jpeg', '', '2026-01-05 07:27:14', 'shabat-hatan'),
(83, '1767598034487-2.jpeg', 'image/jpeg', '', '2026-01-05 07:27:14', 'shabat-hatan'),
(84, '1767598034490-3.jpeg', 'image/jpeg', '', '2026-01-05 07:27:14', 'shabat-hatan'),
(85, '1767598034493-4.jpeg', 'image/jpeg', '', '2026-01-05 07:27:14', 'shabat-hatan'),
(86, '1767598034495-5.jpeg', 'image/jpeg', '', '2026-01-05 07:27:14', 'shabat-hatan'),
(87, '1767954166242-3E5A8066.jpg', 'image/jpeg', '', '2026-01-09 10:22:46', 'henna'),
(92, '1768067980560-LS1_4612.JPG', 'image/jpeg', '', '2026-01-10 17:59:40', 'henna'),
(93, '1768068051649-DSC_4513.JPG', 'image/jpeg', '', '2026-01-10 18:00:51', 'birthday'),
(94, '1768068051698-DSC_4518.JPG', 'image/jpeg', '', '2026-01-10 18:00:51', 'birthday'),
(96, '1768068051780-DSC_4560.JPG', 'image/jpeg', '', '2026-01-10 18:00:51', 'birthday'),
(97, '1768068051815-DSC_4596.JPG', 'image/jpeg', '', '2026-01-10 18:00:51', 'birthday'),
(99, '1768068070446-DSC_6340.JPG', 'image/jpeg', '', '2026-01-10 18:01:11', 'brit'),
(100, '1768068070499-DSC_6345.JPG', 'image/jpeg', '', '2026-01-10 18:01:11', 'brit'),
(101, '1768068070538-LS1_1396.JPG', 'image/jpeg', '', '2026-01-10 18:01:11', 'brit'),
(102, '1768068070621-LS1_1564.JPG', 'image/jpeg', '', '2026-01-10 18:01:11', 'brit'),
(103, '1768068070716-LS1_1569.JPG', 'image/jpeg', '', '2026-01-10 18:01:11', 'brit'),
(104, '1768068070811-LS1_1607.JPG', 'image/jpeg', '', '2026-01-10 18:01:11', 'brit'),
(105, '1768068070937-LS1_2359.JPG', 'image/jpeg', '', '2026-01-10 18:01:11', 'brit'),
(106, '1768068070989-LS1_2387.JPG', 'image/jpeg', '', '2026-01-10 18:01:11', 'brit'),
(107, '1768068071025-LS1_2400.JPG', 'image/jpeg', '', '2026-01-10 18:01:11', 'brit'),
(108, '1768068071065-LS1_2404.JPG', 'image/jpeg', '', '2026-01-10 18:01:11', 'brit'),
(109, '1768068071105-LS1_2408.JPG', 'image/jpeg', '', '2026-01-10 18:01:11', 'brit');

-- --------------------------------------------------------

--
-- מבנה טבלה עבור טבלה `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `Email` varchar(255) DEFAULT NULL,
  `Message_Content` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- מבנה טבלה עבור טבלה `orders`
--

CREATE TABLE `orders` (
  `OrderNumber` int(11) NOT NULL,
  `SerialPack` int(11) NOT NULL,
  `OrderDescription` varchar(500) NOT NULL,
  `EventName` varchar(255) DEFAULT NULL,
  `EventSerial` varchar(255) DEFAULT NULL,
  `TotalPrice` decimal(10,2) DEFAULT NULL,
  `EventPlace` varchar(255) DEFAULT NULL,
  `Email` varchar(255) DEFAULT NULL,
  `OrderDate` date DEFAULT NULL,
  `OrderHour` time DEFAULT NULL,
  `DateOfEvent` date DEFAULT NULL,
  `HourOfEvent` time DEFAULT NULL,
  `Status` enum('Pending','Approved','Rejected') DEFAULT 'Pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- הוצאת מידע עבור טבלה `orders`
--

INSERT INTO `orders` (`OrderNumber`, `SerialPack`, `OrderDescription`, `EventName`, `EventSerial`, `TotalPrice`, `EventPlace`, `Email`, `OrderDate`, `OrderHour`, `DateOfEvent`, `HourOfEvent`, `Status`) VALUES
(1038, 201, 'Includes: 1 Photographers Stills, 1 Photographers Video, 2 Albums (30X80 CM), 500 Magnets (10X12 CM). ', 'Bat Mitzvah Party', '105', 2850.00, 'Kala', 'her42@gmail.com', '2026-01-08', '16:48:23', '2026-01-15', '18:48:00', 'Approved'),
(1039, 201, 'Includes: 1 Photographers Stills, 1 Photographers Video, 2 Albums (30X80 CM), 500 Magnets (10X12 CM). ', 'Bar Mitzvah Party', '104', 2850.00, 'Kala', 'her42@gmail.com', '2026-01-08', '16:48:48', '2026-01-31', '18:48:00', 'Approved'),
(1040, 202, 'Includes: 2 Photographers Stills, 1 Photographers Video, 2 Albums (30X80 CM), 1 Album (40X60 CM), 1000 Magnets (10X12 CM), 1 Canvas (50X70 CM). ', 'Bat Mitzvah Party', '105', 4455.00, 'Kalaniyot Campground', 'her42@gmail.com', '2026-01-08', '16:49:33', '2026-01-29', '19:49:00', 'Pending'),
(1041, 201, 'Includes: 1 Photographers Stills, 1 Photographers Video, 2 Albums (30X80 CM), 500 Magnets (10X12 CM). ', 'Bar Mitzvah Party', '104', 2850.00, 'Kohi isfiya', 'her42@gmail.com', '2026-01-09', '12:21:28', '2026-01-17', '14:21:00', 'Pending'),
(1042, 202, 'Includes: 2 Photographers Stills, 1 Photographers Video, 2 Albums (30X80 CM), 1 Album (40X60 CM), 1000 Magnets (10X12 CM), 1 Canvas (50X70 CM). ', 'Bar Mitzvah Party', '104', 4455.00, 'Kala', 'or45@gmail.com', '2026-01-09', '12:26:09', '2026-01-20', '14:26:00', 'Pending'),
(1043, 201, 'Includes: 1 Photographers Stills, 1 Photographers Video, 2 Albums (30X80 CM), 500 Magnets (10X12 CM). ', 'Bar Mitzvah Party', '104', 2850.00, 'Kala', 'her42@gmail.com', '2026-01-10', '19:49:03', '2026-01-30', '21:48:00', 'Pending'),
(1044, 201, 'Includes: 1 Photographers Stills, 1 Photographers Video, 2 Albums (30X80 CM), 500 Magnets (10X12 CM). ', 'Wedding Party', '101', 2850.00, 'Kala', 'sapiredri16@gmail.com', '2026-01-11', '08:02:11', '2026-01-26', '11:02:00', 'Pending'),
(1045, 202, 'Includes: 2 Photographers Stills, 1 Photographers Video, 2 Albums (30X80 CM), 1 Album (40X60 CM), 1000 Magnets (10X12 CM), 1 Canvas (50X70 CM). Additional Includes: 3 Photographers Stills, 3 Photographers Video.', 'Save The Date', '103', 9855.00, 'Kala', 'sapiredri16@gmail.com', '2026-01-11', '08:02:38', '2026-01-26', '11:02:00', 'Pending'),
(1046, 202, 'Includes: 2 Photographers Stills, 1 Photographers Video, 2 Albums (30X80 CM), 1 Album (40X60 CM), 1000 Magnets (10X12 CM), 1 Canvas (50X70 CM). ', 'Birth Son Party', '107', 4455.00, 'Kala', 'sapiredri16@gmail.com', '2026-01-11', '08:02:59', '2026-01-27', '11:02:00', 'Pending'),
(1047, 201, 'Includes: 1 Photographers Stills, 1 Photographers Video, 2 Albums (30X80 CM), 500 Magnets (10X12 CM). ', 'Bar Mitzvah Party', '104', 2850.00, 'Kala', 'sapiredri16@gmail.com', '2026-01-11', '09:12:13', '2026-01-11', '13:12:00', 'Pending'),
(1048, 203, 'Includes: 3 Photographers Stills, 2 Photographers Video, 3 Albums (30X80 CM), 2 Albums (40X60 CM), 1000 Magnets (10X12 CM), 500 Magnets (20X24 CM), 2 Canvas (50X70 CM), 1 Canvas (60X90 CM). ', 'Bat Mitzvah Party', '105', 7862.50, 'Kala', 'sapiredri16@gmail.com', '2026-01-11', '14:07:56', '2026-01-11', '15:07:00', 'Pending'),
(1049, 201, 'Includes: 1 Photographers Stills, 1 Photographers Video, 2 Albums (30X80 CM), 500 Magnets (10X12 CM). ', 'Bar Mitzvah Party', '104', 2850.00, 'Kslsi Saadia Transport Ltd.', 'sapiredri16@gmail.com', '2026-01-11', '14:16:12', '2026-01-14', '16:16:00', 'Pending');

-- --------------------------------------------------------

--
-- מבנה טבלה עבור טבלה `orders_workers`
--

CREATE TABLE `orders_workers` (
  `table_id` int(11) NOT NULL,
  `OrderNumber` int(11) NOT NULL,
  `Personal_id` varchar(64) DEFAULT 'unknown'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- הוצאת מידע עבור טבלה `orders_workers`
--

INSERT INTO `orders_workers` (`table_id`, `OrderNumber`, `Personal_id`) VALUES
(1, 1001, '123456789'),
(2, 1002, '222222222'),
(3, 1002, '111111111'),
(4, 1003, '222222222'),
(5, 1003, '444444444'),
(6, 1003, '777777777'),
(7, 1003, '888888888'),
(8, 1003, '101010101'),
(9, 1003, '111111111'),
(10, 1003, '555555555'),
(11, 1003, '121212121'),
(12, 1005, '101010101'),
(13, 1005, '555555555'),
(14, 1007, '222222222'),
(15, 1007, '111111111'),
(16, 1008, '222222222'),
(17, 1008, '111111111'),
(18, 1016, '222222222'),
(19, 1016, '111111111'),
(20, 1016, '222222222'),
(21, 1016, '111111111'),
(22, 1016, '222222222'),
(23, 1016, '111111111'),
(24, 1016, '222222222'),
(25, 1016, '111111111'),
(26, 1016, '222222222'),
(27, 1016, '111111111'),
(28, 1016, '222222222'),
(29, 1016, '111111111'),
(30, 1012, '444444444'),
(31, 1012, '555555555'),
(32, 1009, '101010101'),
(33, 1009, '111111111'),
(34, 1011, '444444444'),
(35, 1011, '555555555'),
(36, 1015, '222222222'),
(37, 1015, '111111111'),
(38, 1018, '222222222'),
(39, 1018, '111111111'),
(40, 1017, '444444444'),
(41, 1017, '555555555'),
(42, 1013, '222222222'),
(43, 1013, '111111111'),
(44, 1014, '444444444'),
(45, 1014, '555555555'),
(46, 1019, '222222222'),
(47, 1019, '111111111'),
(48, 1010, '444444444'),
(49, 1010, '555555555'),
(50, 1020, '222222222'),
(51, 1020, '555555555'),
(52, 1021, '444444444'),
(53, 1021, '111111111'),
(54, 1025, '222222222'),
(55, 1025, '111111111'),
(56, 1026, '444444444'),
(57, 1026, '555555555'),
(58, 1024, '222222222'),
(59, 1024, '555555555'),
(60, 1027, '222222222'),
(61, 1027, '111111111'),
(62, 1031, '314578596'),
(63, 1031, '111111111'),
(64, 1032, '101010101'),
(65, 1032, '308070111'),
(66, 1033, '222222222'),
(67, 1033, '555555555'),
(68, 1034, '101010101'),
(69, 1034, '308070111'),
(70, 1035, '222222222'),
(71, 1035, '308070111'),
(72, 1036, '222222222'),
(73, 1036, '111111111'),
(74, 1038, '101010101'),
(75, 1038, '308070111'),
(76, 1038, '101010101'),
(77, 1038, '308070111'),
(78, 1039, '222222222'),
(79, 1039, '308070111');

-- --------------------------------------------------------

--
-- מבנה טבלה עבור טבלה `order_items`
--

CREATE TABLE `order_items` (
  `OrderNumber` int(11) NOT NULL,
  `ProductPackSerial` int(11) NOT NULL,
  `Quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- הוצאת מידע עבור טבלה `order_items`
--

INSERT INTO `order_items` (`OrderNumber`, `ProductPackSerial`, `Quantity`) VALUES
(1001, 201, 1),
(1002, 901, 1),
(1002, 908, 1),
(1002, 202, 1),
(1003, 901, 1),
(1003, 902, 1),
(1003, 905, 100),
(1004, 903, 1),
(1004, 904, 1),
(1005, 901, 1),
(1005, 902, 1),
(1005, 201, 1),
(1006, 902, 1),
(1006, 907, 1),
(1006, 908, 1),
(1006, 202, 1),
(1007, 201, 1),
(1001, 201, 1),
(1002, 201, 1),
(1003, 201, 1),
(1004, 201, 1),
(1005, 201, 1),
(1006, 201, 1),
(1007, 201, 1),
(1008, 201, 1),
(1009, 201, 1),
(1010, 201, 1),
(1011, 201, 1),
(1012, 201, 1),
(1013, 201, 1),
(1014, 201, 1),
(1015, 201, 1),
(1016, 201, 1),
(1017, 201, 1),
(1018, 201, 1),
(1019, 201, 1),
(1020, 201, 1),
(1021, 201, 1),
(1022, 201, 1),
(1023, 201, 1),
(1024, 201, 1),
(1025, 201, 1),
(1026, 201, 1),
(1027, 201, 1),
(1028, 201, 1),
(1029, 202, 1),
(1030, 201, 1),
(1031, 201, 1),
(1032, 201, 1),
(1033, 201, 1),
(1034, 201, 1),
(1035, 201, 1),
(1036, 201, 1),
(1037, 201, 1),
(1038, 201, 1),
(1039, 201, 1),
(1040, 202, 1),
(1041, 201, 1),
(1042, 202, 1),
(1043, 201, 1),
(1044, 201, 1),
(1045, 202, 1),
(1046, 202, 1),
(1047, 201, 1),
(1048, 203, 1),
(1049, 201, 1);

-- --------------------------------------------------------

--
-- מבנה טבלה עבור טבלה `packs`
--

CREATE TABLE `packs` (
  `SerialPack` int(11) NOT NULL,
  `PackDescription` varchar(255) NOT NULL,
  `PricePack` decimal(10,2) NOT NULL,
  `PackName` varchar(255) DEFAULT NULL,
  `SteelsPhotographers` int(11) DEFAULT NULL,
  `VideoPhotographers` int(11) DEFAULT NULL,
  `Albums30X80` int(11) DEFAULT NULL,
  `Albums40X60` int(11) DEFAULT NULL,
  `Magnets10X12` int(11) DEFAULT NULL,
  `Magnets20X24` int(11) DEFAULT NULL,
  `Canvas50X70` int(11) DEFAULT NULL,
  `Canvas60X90` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- הוצאת מידע עבור טבלה `packs`
--

INSERT INTO `packs` (`SerialPack`, `PackDescription`, `PricePack`, `PackName`, `SteelsPhotographers`, `VideoPhotographers`, `Albums30X80`, `Albums40X60`, `Magnets10X12`, `Magnets20X24`, `Canvas50X70`, `Canvas60X90`) VALUES
(201, 'Includes: 1 Photographers Stills, 1 Photographers Video, 2 Albums (30X80 CM), 500 Magnets (10X12 CM).', 3000.00, 'Bronze Simply', 1, 1, 2, 0, 500, 0, 0, 0),
(202, 'Includes: 2 Photographers Stills, 1 Photographers Video, 2 Albums (30X80 CM), 1 Album (40X60 CM), 1000 Magnets (10X12 CM), 1 Canvas (50X70 CM).', 4950.00, 'Silver Plus', 2, 1, 2, 1, 1000, 0, 1, 0),
(203, 'Includes: 3 Photographers Stills, 2 Photographers Video, 3 Albums (30X80 CM), 2 Albums (40X60 CM), 1000 Magnets (10X12 CM), 500 Magnets (20X24 CM), 2 Canvas (50X70 CM), 1 Canvas (60X90 CM).', 9250.00, 'Gold Premium', 3, 2, 3, 2, 1000, 500, 2, 1);

-- --------------------------------------------------------

--
-- מבנה טבלה עבור טבלה `page_content`
--

CREATE TABLE `page_content` (
  `page_id` int(11) NOT NULL,
  `page_name` varchar(255) NOT NULL,
  `page_title` varchar(255) NOT NULL,
  `page_content` varchar(8000) NOT NULL,
  `page_info` varchar(1000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- הוצאת מידע עבור טבלה `page_content`
--

INSERT INTO `page_content` (`page_id`, `page_name`, `page_title`, `page_content`, `page_info`) VALUES
(1, 'AboutUs', 'About our company', 'PhotoClick is your premier destination for professional event photography and videography services.\n\nWe specialize in capturing unforgettable moments and creating lasting memories for all types of events, including weddings, parties, corporate events, and more.\n\nOur team of experienced photographers and videographers is dedicated to providing exceptional service and delivering stunning visuals that exceed your expectations.\n\nWith PhotoClick, you can trust that your special moments will be beautifully documented for you to cherish for years to come.\n\nOur company values customer satisfaction above all else.\n\nWe strive to ensure that every client receives personalized attention and a tailored service that meets their unique needs.\n\nWith our commitment to excellence and attention to detail, we have earned a reputation as one of the leading photography and videography providers in the industry.\n\nAt PhotoClick, we believe that every moment is precious and deserves to be captured with care and expertise.\n\nWhether it\'s a wedding, a birthday party, or a corporate event, our team is dedicated to preserving your memories in a way that truly reflects the essence of the occasion.\n\nWith our creative vision and technical skill, we go above and beyond to deliver exceptional results that you\'ll cherish for a lifetime.\n\nAt PhotoClick, we understand the importance of capturing not just moments, but emotions.\n\nOur passion for storytelling through imagery drives us to meticulously craft each shot, ensuring that every photograph and video reflects the genuine emotions and atmosphere of your event.\n\nWith our dedication to authenticity and professionalism, we strive to exceed your expectations and deliver a truly unforgettable visual narrative.\n\nThank you for considering PhotoClick for your photography and videography needs.\n\nWe look forward to the opportunity to work with you and create stunning visuals that tell your unique story.\n\nIf you have any inquiries or would like to book our services, feel free to get in touch with us using the contact information below:\n\n', 'Email: photoclickteam@gmail.com\n\nPhone: 0545411683\n\nAddress: Natan Elbaz 1, Haifa, North, Israel.\n\n');

-- --------------------------------------------------------

--
-- מבנה טבלה עבור טבלה `products`
--

CREATE TABLE `products` (
  `ProductSerial` int(11) NOT NULL,
  `ProductDescription` varchar(255) DEFAULT NULL,
  `ProductPrice` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- הוצאת מידע עבור טבלה `products`
--

INSERT INTO `products` (`ProductSerial`, `ProductDescription`, `ProductPrice`) VALUES
(901, 'Photographers Stills', 800.00),
(902, 'Photographers Video', 1200.00),
(903, 'Albums (30X80 CM)', 250.00),
(904, 'Albums (40X60 CM)', 300.00),
(905, 'Magnets (10X12 CM)', 1.00),
(906, 'Magnets (20X24 CM)', 2.00),
(907, 'Canvas (50X70 CM)', 350.00),
(908, 'Canvas (60X90 CM)', 400.00);

-- --------------------------------------------------------

--
-- מבנה טבלה עבור טבלה `products_packs`
--

CREATE TABLE `products_packs` (
  `ProductPackSerial` int(11) NOT NULL,
  `Description` varchar(255) DEFAULT NULL,
  `Price` decimal(10,2) DEFAULT NULL,
  `ItemType` enum('Product','Pack') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- הוצאת מידע עבור טבלה `products_packs`
--

INSERT INTO `products_packs` (`ProductPackSerial`, `Description`, `Price`, `ItemType`) VALUES
(201, 'Bronze Simply = 3000.00₪ + 5% Discount (Includes: 1 Steels Photographers, 1 Video Photographer, 2 Albums 30X80 CM, 500 Magnets 10X12.)', 3000.00, 'Pack'),
(202, 'Includes: 2 Steels Photographers, 1 Video Photographer, 2 Albums 30X80 CM, 1 Album 40X60, 1000 Magnets 10X12 CM, 1 Canvas 50X70.', 4950.00, 'Pack'),
(203, 'Includes: 3 Steels Photographers, 2 Video Photographers, 3 Albums 30X80, 2 Albums 40X60 CM, 1000 Magnets 10X12, 500 Magnets 20X24, 2 Canvas 50X70, 1 Canvas 60X90 CM.', 9250.00, 'Pack'),
(901, 'Photographers Stills', 800.00, 'Product'),
(902, 'Photographers Video', 1200.00, 'Product'),
(903, 'Albums (30X80 CM)', 250.00, 'Product'),
(904, 'Albums (40X60 CM)', 300.00, 'Product'),
(905, 'Magnets (10X12 CM)', 1.00, 'Product'),
(906, 'Magnets (20X24 CM)', 2.00, 'Product'),
(907, 'Canvas (50X70 CM)', 350.00, 'Product'),
(908, 'Canvas (60X90 CM)', 400.00, 'Product');

-- --------------------------------------------------------

--
-- מבנה טבלה עבור טבלה `users`
--

CREATE TABLE `users` (
  `table_id` int(11) NOT NULL,
  `Personal_id` varchar(64) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `FirstName` varchar(255) DEFAULT NULL,
  `LastName` varchar(255) DEFAULT NULL,
  `PhoneNumber` varchar(20) DEFAULT NULL,
  `StreetAddress` varchar(255) DEFAULT NULL,
  `RoleID` int(11) NOT NULL,
  `RoleName` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- הוצאת מידע עבור טבלה `users`
--

INSERT INTO `users` (`table_id`, `Personal_id`, `Email`, `Password`, `FirstName`, `LastName`, `PhoneNumber`, `StreetAddress`, `RoleID`, `RoleName`) VALUES
(1, '111111111', 'aviv77ab@gmail.com', 'Aviv1234!', 'Aviv', 'Abudi', '0504220593', 'Weizmann 34, Nahariya, Israel, 2238412', 4, 'Photographer-Video'),
(2, '222222222', 'ben.amar1507@gmail.com', 'Ben1234!', 'Ben', 'Amar', '0545811088', 'Tennis 7, Akko, Israel, 2455327', 3, 'Photographer-Stills'),
(3, '333333333', 'djbenbass@gmail.com', 'Benchen224!', 'Ben Rafael', 'Chen', '0503620039', 'Ramhal 30, Akko, Israel, 2461123', 1, 'Admin'),
(4, '444444444', 'djdavidmark1@gmail.com', 'David1234!', 'David', 'Mark', '0547838465', 'Yaffe Nof 14, Akko, Israel, 2472138', 3, 'Photographer-Stills'),
(5, '555555555', 'djofekyomtove@gmail.com', 'Ofek1234!', 'Ofek', 'Yomtov', '0542334179', 'Dotan 2, Akko, Israel, 2404344', 4, 'Photographer-Video'),
(6, '666666666', 'eladatias18@gmail.com', 'Atias555!', 'Elad', 'Atias', '0542843103', 'Orchid 4, Kiryat Tivon, Israel, 3652001', 2, 'Customer'),
(7, '777777777', 'ilanedri1@gmail.com', 'Edri1234!', 'Ilan', 'Edri', '0546393903', 'Balfur 48, Tel Aviv, Israel, 6522606', 3, 'Photographer-Stills'),
(8, '888888888', 'liadazo22@gmail.com', 'Liad1234!', 'Liad', 'Azulay', '0526024168', 'HaShalom Road 31, Akko, Israel, 2404357', 3, 'Photographer-Stills'),
(9, '999999999', 'lior53685954@gmail.com', 'Shushi1234!', 'Lior', 'Shushan', '0545411683', 'Ha-Histadrut St, Afula, Israel', 1, 'Admin'),
(10, '101010101', 'ofirbin12@gmail.com', 'Bindi1234!', 'Ofir', 'Binder', '0528728577', 'Six Days 58, Haifa, Israel, 2625102', 3, 'Photographer-Stills'),
(11, '121212121', 'saharpanijel1@gmail.com', 'Sahar1234!', 'Sahar', 'Panijel', '0505509575', 'Ramhal 40, Akko, Israel, 2461138', 4, 'Photographer-Video'),
(12, '131313131', 'sapiredri16@gmail.com', 'Ariel1607!', 'Sapir', 'Edri', '0546499269', 'Aharon St 34, Kiryat Motzkin, Israel', 2, 'Customer'),
(17, '308070111', 'benrafaelchen@gmail.com', 'Bens1234!', 'ben', 'adri', '0546200272', 'Diskin St, Jerusalem, Israel', 4, 'Photographer-Video'),
(18, '055568315', 'djbassiiofficial@gmail.com', 'Bass1235!', 'Beber', 'Chen', '0546416380', 'Gershon Agron St, Jerusalem, Israel', 2, 'Customer'),
(19, '032646200', 'her42@gmail.com', 'Hersomri42!', 'her', 'somri', '0545899687', 'Bir Al Sabil St, Jerusalem', 2, 'Customer'),
(20, '304587489', 'or45@gmail.com', 'Orshushai18!', 'or', 'shushai', '0525477896', 'Ytskhak ha-Nadiv Street, Jerusalem', 2, 'Customer');

--
-- Indexes for dumped tables
--

--
-- אינדקסים לטבלה `eventkind`
--
ALTER TABLE `eventkind`
  ADD PRIMARY KEY (`EventName`);

--
-- אינדקסים לטבלה `faq`
--
ALTER TABLE `faq`
  ADD PRIMARY KEY (`faq_id`);

--
-- אינדקסים לטבלה `images`
--
ALTER TABLE `images`
  ADD PRIMARY KEY (`id`);

--
-- אינדקסים לטבלה `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`);

--
-- אינדקסים לטבלה `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`OrderNumber`);

--
-- אינדקסים לטבלה `orders_workers`
--
ALTER TABLE `orders_workers`
  ADD PRIMARY KEY (`table_id`),
  ADD KEY `Personal_id` (`Personal_id`),
  ADD KEY `OrderNumber` (`OrderNumber`);

--
-- אינדקסים לטבלה `order_items`
--
ALTER TABLE `order_items`
  ADD KEY `ProductPackSerial` (`ProductPackSerial`);

--
-- אינדקסים לטבלה `packs`
--
ALTER TABLE `packs`
  ADD PRIMARY KEY (`SerialPack`);

--
-- אינדקסים לטבלה `page_content`
--
ALTER TABLE `page_content`
  ADD PRIMARY KEY (`page_id`),
  ADD UNIQUE KEY `page_name` (`page_name`);

--
-- אינדקסים לטבלה `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`ProductSerial`);

--
-- אינדקסים לטבלה `products_packs`
--
ALTER TABLE `products_packs`
  ADD PRIMARY KEY (`ProductPackSerial`);

--
-- אינדקסים לטבלה `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`table_id`),
  ADD UNIQUE KEY `Personal_id` (`Personal_id`),
  ADD UNIQUE KEY `Email` (`Email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `faq`
--
ALTER TABLE `faq`
  MODIFY `faq_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `images`
--
ALTER TABLE `images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=113;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `OrderNumber` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1050;

--
-- AUTO_INCREMENT for table `orders_workers`
--
ALTER TABLE `orders_workers`
  MODIFY `table_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=80;

--
-- AUTO_INCREMENT for table `page_content`
--
ALTER TABLE `page_content`
  MODIFY `page_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `table_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- הגבלות לטבלאות שהוצאו
--

--
-- הגבלות לטבלה `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`ProductPackSerial`) REFERENCES `products_packs` (`ProductPackSerial`);

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
