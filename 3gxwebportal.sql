-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 03, 2025 at 03:17 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `3gxwebportal`
--

-- --------------------------------------------------------

--
-- Table structure for table `requests`
--

CREATE TABLE `requests` (
  `requestID` varchar(36) NOT NULL,
  `userID` varchar(36) NOT NULL,
  `RFQNo` varchar(36) NOT NULL,
  `requestDate` datetime(6) NOT NULL,
  `validity` datetime(6) NOT NULL,
  `totalBudget` varchar(100) NOT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`details`)),
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`items`)),
  `requestStatus` varchar(36) NOT NULL,
  `attachment` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `quotationStatus` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`quotationStatus`)),
  `purchaseOrder` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`purchaseOrder`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `response`
--

CREATE TABLE `response` (
  `responseID` varchar(36) NOT NULL,
  `requestID` varchar(36) NOT NULL,
  `quotationNo` varchar(36) NOT NULL,
  `quotationDate` datetime(6) NOT NULL,
  `totalValue` varchar(100) NOT NULL,
  `supplierDetails` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`supplierDetails`)),
  `supattachment` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `userID` varchar(36) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `companyName` varchar(500) NOT NULL,
  `companyAddress` varchar(500) NOT NULL,
  `companyEmail` varchar(100) NOT NULL,
  `repNames` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`repNames`)),
  `repNum` varchar(15) NOT NULL,
  `businessPermit` varchar(255) DEFAULT NULL,
  `validID` varchar(255) DEFAULT NULL,
  `userRole` varchar(100) NOT NULL,
  `accountStatus` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `accCreated` datetime NOT NULL,
  `profilepic` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userID`, `username`, `password`, `companyName`, `companyAddress`, `companyEmail`, `repNames`, `repNum`, `businessPermit`, `validID`, `userRole`, `accountStatus`, `accCreated`, `profilepic`) VALUES
('KCsFHXipt0KT', 'admin3gx', '$2b$10$uLEXcyjl6GrW3dWDvktxKOPYOLw.FSPjTUREsATSUiynR9hGUVg.a', 'A1 Prime Corp', 'Purok 5 Mantabog, Sto. Domingo, Vinzons, Camarines Norte', '3gxcompany@gmail.com', '[{\"name\":\"Roselyn Morilla\",\"position\":\"Authorized Representative\"},{\"name\":\"Manel\",\"position\":\"Sub Representative\",\"department\":\"Research and Dev\"}]', '09925969694', 'uploads/users/KCsFHXipt0KT/business_permit/1757303978372-447551288_497496775962730_7523087800079067087_n.jpg', 'uploads/users/KCsFHXipt0KT/valid_id/1757303978373-470051883_758187849846513_8137394635273003306_n.jpg', 'Admin', '{\"status\":\"Approved\",\"remarks\":\"\"}', '2025-09-08 11:59:38', ''),
('xC1jOf7ZHAt9', 'magomanell', '$2b$10$juCrXAfiVdZT9P54vq39xOniUbJwbtJOFqEu1lN8XAFKMmMPCn.oG', 'Manel Mago Company', 'Purok 5 Mantabog, Sto. Domingo, Vinzons', 'magocompany@gmail.com', '[{\"name\":\"Neca Duladfs\",\"position\":\"IT Department\"},{\"name\":\"Yana\",\"department\":\"Depart\"},{\"name\":\"qwer\",\"position\":\"Sub Representative\",\"department\":\"qwerty\"},{\"name\":\"werty\",\"position\":\"Sub Representative\",\"department\":\"qwert\"}]', '09925969694', 'uploads/users/xC1jOf7ZHAt9/business_permit/1744353520444-Screenshot (1).png', 'uploads/users/xC1jOf7ZHAt9/valid_id/1744353520444-Screenshot (8).png', 'Client', '{\"status\":\"Approved\",\"remarks\":\"\"}', '2025-04-11 14:38:40', 'uploads/users/xC1jOf7ZHAt9/profile_pic/profile.png'),
('XlY8LGfu0Pr5', 'a1primecorp', '$2b$10$Vs854vNaxmDzuOMUI3u9aOadRZuYBSbC3QCmZSoGEQDRya0lYIsbq', 'A1 PRIME CORP', 'Concepcion Grande', 'a1primecorp@gmail.com', '[{\"name\":\"Sample Name\",\"position\":\"Authorized Representative\"}]', '09925000789', 'uploads/users/XlY8LGfu0Pr5/business_permit/1759304466864-447551288_497496775962730_7523087800079067087_n.jpg', 'uploads/users/XlY8LGfu0Pr5/valid_id/1759304466864-363574483_1456482038482481_4631462409457308716_n.jpg', 'Client', '{\"status\":\"Approved\",\"remarks\":\"\"}', '2025-10-01 15:41:06', '');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `requests`
--
ALTER TABLE `requests`
  ADD PRIMARY KEY (`requestID`),
  ADD KEY `requests_ibfk_1` (`userID`);

--
-- Indexes for table `response`
--
ALTER TABLE `response`
  ADD PRIMARY KEY (`responseID`),
  ADD KEY `requestID` (`requestID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userID`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `requests`
--
ALTER TABLE `requests`
  ADD CONSTRAINT `requests_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`);

--
-- Constraints for table `response`
--
ALTER TABLE `response`
  ADD CONSTRAINT `response_ibfk_1` FOREIGN KEY (`requestID`) REFERENCES `requests` (`requestID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
