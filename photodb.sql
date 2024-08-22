-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Aug 22, 2024 at 07:08 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

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
-- Table structure for table `eventkind`
--

CREATE TABLE `eventkind` (
  `EventName` varchar(255) NOT NULL,
  `EventSerial` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `eventkind`
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
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `OrderNumber` int(11) NOT NULL,
  `EventName` varchar(255) DEFAULT NULL,
  `EventSerial` varchar(255) DEFAULT NULL,
  `TotalPrice` decimal(10,2) DEFAULT NULL,
  `EventPlace` varchar(255) DEFAULT NULL,
  `Email` varchar(255) DEFAULT NULL,
  `OrderDate` date DEFAULT NULL,
  `OrderHour` time DEFAULT NULL,
  `DateOfEvent` date DEFAULT NULL,
  `HourOfEvent` time DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`OrderNumber`, `EventName`, `EventSerial`, `TotalPrice`, `EventPlace`, `Email`, `OrderDate`, `OrderHour`, `DateOfEvent`, `HourOfEvent`) VALUES
(1001, 'Wedding Party', '101', 4455.00, 'Kala', 'sapiredri16@gmail.com', '2024-08-20', '20:03:01', '2027-01-12', '16:00:00'),
(1002, 'Birth Son Party', '107', 7862.50, 'Benuz events', 'sapiredri16@gmail.com', '2024-08-20', '20:05:18', '2025-01-20', '15:00:00'),
(1003, 'Birthday Party', '108', 2850.00, 'TLV Mall', 'sapiredri16@gmail.com', '2024-08-20', '20:09:08', '2025-07-16', '18:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `OrderNumber` int(11) NOT NULL,
  `ProductPackSerial` int(11) NOT NULL,
  `Quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`OrderNumber`, `ProductPackSerial`, `Quantity`) VALUES
(1001, 901, 1),
(1001, 902, 1),
(1001, 202, 1),
(1002, 903, 1),
(1002, 904, 1),
(1002, 203, 1),
(1003, 902, 1),
(1003, 904, 1),
(1003, 908, 1),
(1003, 201, 1);

-- --------------------------------------------------------

--
-- Table structure for table `packs`
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
-- Dumping data for table `packs`
--

INSERT INTO `packs` (`SerialPack`, `PackDescription`, `PricePack`, `PackName`, `SteelsPhotographers`, `VideoPhotographers`, `Albums30X80`, `Albums40X60`, `Magnets10X12`, `Magnets20X24`, `Canvas50X70`, `Canvas60X90`) VALUES
(201, 'Includes: 1 Steels Photographers, 1 Video Photographer, 2 Albums 30X80 CM, 500 Magnets 10X12.', 3000.00, 'Bronze Simply', 1, 1, 2, 0, 500, 0, 0, 0),
(202, 'Includes: 2 Steels Photographers, 1 Video Photographer, 2 Albums 30X80 CM, 1 Album 40X60, 1000 Magnets 10X12 CM, 1 Canvas 50X70.', 4950.00, 'Silver Plus', 2, 1, 2, 1, 1000, 0, 1, 0),
(203, 'Includes: 3 Steels Photographers, 2 Video Photographers, 3 Albums 30X80, 2 Albums 40X60 CM, 1000 Magnets 10X12, 500 Magnets 20X24, 2 Canvas 50X70, 1 Canvas 60X90 CM.', 9250.00, 'Gold Premium', 3, 2, 3, 2, 1000, 500, 2, 1);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `ProductSerial` int(11) NOT NULL,
  `ProductDescription` varchar(255) DEFAULT NULL,
  `ProductPrice` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
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
-- Table structure for table `products_packs`
--

CREATE TABLE `products_packs` (
  `ProductPackSerial` int(11) NOT NULL,
  `Description` varchar(255) DEFAULT NULL,
  `Price` decimal(10,2) DEFAULT NULL,
  `ItemType` enum('Product','Pack') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products_packs`
--

INSERT INTO `products_packs` (`ProductPackSerial`, `Description`, `Price`, `ItemType`) VALUES
(201, 'Includes: 1 Steels Photographers, 1 Video Photographer, 2 Albums 30X80 CM, 500 Magnets 10X12.', 3000.00, 'Pack'),
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
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `Email` varchar(255) NOT NULL,
  `Password` varchar(255) DEFAULT NULL,
  `FirstName` varchar(255) DEFAULT NULL,
  `LastName` varchar(255) DEFAULT NULL,
  `PhoneNumber` varchar(20) DEFAULT NULL,
  `StreetAddress` varchar(255) DEFAULT NULL,
  `RoleID` int(11) NOT NULL,
  `RoleName` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`Email`, `Password`, `FirstName`, `LastName`, `PhoneNumber`, `StreetAddress`, `RoleID`, `RoleName`) VALUES
('aviv77ab@gmail.com', 'Aviv1234!', 'Aviv', 'Abudi', '0504220593', 'Weizmann 34, Nahariya, Israel, 2238412', 4, 'Photographer-Video'),
('ben.amar1507@gmail.com', 'Ben1234!', 'Ben', 'Amar', '0545811088', 'Tennis 7, Akko, Israel, 2455327', 3, 'Photographer-Stills'),
('djbenbass@gmail.com', 'Benchen224!', 'Ben Rafael', 'Chen', '0503620039', 'Ramhal 30, Akko, Israel, 2461123', 1, 'Admin'),
('djdavidmark1@gmail.com', 'David1234!', 'David', 'Mark', '0547838465', 'Yaffe Nof 14, Akko, Israel, 2472138', 3, 'Photographer-Stills'),
('djofekyomtove@gmail.com', 'Ofek1234!', 'Ofek', 'Yomtov', '0542334179', 'Dotan 2, Akko, Israel, 2404344', 4, 'Photographer-Video'),
('eladatias18@gmail.com', 'Atias555!', 'Elad', 'Atias', '0542843103', 'Orchid 4, Kiryat Tivon, Israel, 3652001', 2, 'Customer'),
('ilanedri1@gmail.com', 'Edri1234!', 'Ilan', 'Edri', '0546393903', 'Balfur 48, Tel Aviv, Israel, 6522606', 3, 'Photographer-Stills'),
('liadazo22@gmail.com', 'Liad1234!', 'Liad', 'Azulay', '0526024168', 'HaShalom Road 31, Akko, Israel, 2404357', 3, 'Photographer-Stills'),
('lior53685954@gmail.com', 'Shushi1234!', 'Lior', 'Shushan', '0545411683', 'Dafna 14, Afula, Israel, 1834254', 1, 'Admin'),
('ofirbin12@gmail.com', 'Bindi1234!', 'Ofir', 'Binder', '0528728577', 'Six Days 58, Haifa, Israel, 2625102', 3, 'Photographer-Stills'),
('saharpanijel1@gmail.com', 'Sahar1234!', 'Sahar', 'Panijel', '0505509575', 'Ramhal 40, Akko, Israel, 2461138', 4, 'Photographer-Video'),
('sapiredri16@gmail.com', 'Ariel1607!', 'Sapir', 'Edri', '0546499269', 'Aharon St 34, Kiryat Motzkin, Israel', 2, 'Customer');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `eventkind`
--
ALTER TABLE `eventkind`
  ADD PRIMARY KEY (`EventName`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`OrderNumber`),
  ADD KEY `LocationPostalCode` (`EventPlace`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD KEY `OrderNumber` (`OrderNumber`),
  ADD KEY `ProductPackSerial` (`ProductPackSerial`);

--
-- Indexes for table `packs`
--
ALTER TABLE `packs`
  ADD PRIMARY KEY (`SerialPack`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`ProductSerial`);

--
-- Indexes for table `products_packs`
--
ALTER TABLE `products_packs`
  ADD PRIMARY KEY (`ProductPackSerial`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`Email`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`OrderNumber`) REFERENCES `orders` (`OrderNumber`),
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`ProductPackSerial`) REFERENCES `products_packs` (`ProductPackSerial`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
