-- MySQL dump 10.13  Distrib 8.0.42, for Linux (x86_64)
--
-- Host: localhost    Database: order_tracking
-- ------------------------------------------------------
-- Server version	8.0.42-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `deployed_items`
--

DROP TABLE IF EXISTS `deployed_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `deployed_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `original_order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `order_id` int NOT NULL,
  `order_date` datetime NOT NULL,
  `confirm_date` datetime DEFAULT NULL,
  `deploy_date` datetime NOT NULL,
  `comment` text,
  `item_comment` text,
  `ordered_by` varchar(255) DEFAULT NULL,
  `serial_number` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_serial_number` (`serial_number`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_deploy_date` (`deploy_date`),
  KEY `idx_original_order_id` (`original_order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deployed_items`
--

LOCK TABLES `deployed_items` WRITE;
/*!40000 ALTER TABLE `deployed_items` DISABLE KEYS */;
INSERT INTO `deployed_items` VALUES (1,2,9,'Lenovo ThinkPad P15v Gen 3','/images/1725651039026.jpg',123,'2025-07-21 00:00:00','2025-07-21 15:27:35','2025-07-21 15:27:50',NULL,NULL,'a@g.c','123','2025-07-21 15:27:50'),(2,1,8,'Lenovo K14 Gen 2','/images/1725650991363.jpg',1,'2025-07-21 00:00:00','2025-07-21 15:37:24','2025-07-21 15:37:34',NULL,NULL,'a@gmail.com','1234','2025-07-21 15:37:34'),(3,1,8,'Lenovo K14 Gen 2','/images/1725650991363.jpg',1,'2025-07-21 00:00:00','2025-07-21 15:49:27','2025-07-21 15:49:32',NULL,NULL,'a@gmail.com','12345','2025-07-21 15:49:32'),(4,1,8,'Lenovo K14 Gen 2','/images/1725650991363.jpg',1,'2025-07-21 00:00:00','2025-07-21 15:54:33','2025-07-21 15:54:39',NULL,NULL,'a@gmail.com','123456','2025-07-21 15:54:39');
/*!40000 ALTER TABLE `deployed_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `order_date` date NOT NULL,
  `confirmed_quantity` int DEFAULT '0',
  `order_id` varchar(255) DEFAULT NULL,
  `confirm_date` varchar(255) DEFAULT NULL,
  `serial_numbers` varchar(255) DEFAULT NULL,
  `comment` text,
  `item_comment` text,
  `ordered_by` varchar(255) DEFAULT NULL,
  `confirmed_items` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,8,0,'2025-07-21',3,'1','2025-07-21 15:54:33.125','[\"1234\",\"12345\",\"123456\"]',NULL,NULL,'a@gmail.com',NULL),(2,9,0,'2025-07-21',1,'123','2025-07-21 15:27:34.909','[\"123\"]',NULL,NULL,'a@g.c',NULL),(3,8,1,'2025-07-21',0,'124',NULL,NULL,NULL,NULL,'abc@g.c',NULL),(4,9,1,'2025-07-21',0,'124',NULL,NULL,NULL,NULL,'abc@g.c',NULL),(5,10,1,'2025-07-21',0,'124',NULL,NULL,NULL,NULL,'abc@g.c',NULL),(6,11,1,'2025-07-21',0,'124',NULL,NULL,NULL,NULL,'abc@g.c',NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  `image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_price` (`price`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (8,'Lenovo K14 Gen 2','Notebooks',100.00,'/images/1725650991363.jpg'),(9,'Lenovo ThinkPad P15v Gen 3','Notebooks',0.00,'/images/1725651039026.jpg'),(10,'TOUGHBOOK FZ55','Notebooks',0.00,'/images/1725651054692.jpg'),(11,'ThinkPad L14 Gen 4','Notebooks',0.00,'/images/1725651069920.jpg'),(12,'ThinkPad L13 Yoga Gen 4 (Intel)','Notebooks',0.00,'/images/1725651084988.jpg'),(14,'Extra Large 4K Monitor ThinkVision T27p-30','Monitors',89.00,'/images/1725651149115.jpg'),(15,'Ultra Wide 4K Monitor ThinkVision T32p-30','Monitors',101.00,'/images/1725651163748.jpg'),(16,'Large Monitor ThinkVision T23i-30','Monitors',0.00,'/images/1725651186330.jpg'),(17,'Standard Monitor ThinkVision T22i-30','Monitors',39.00,'/images/1725651202385.jpg'),(18,'Extra Large Monitor ThinkVision T27i-30','Monitors',0.00,'/images/1725651336706.jpg'),(19,'ThinkPad Thunderbolt 4 Workstation Dock - US','Accessories',0.00,'/images/1725651719381.jpg'),(20,'ThinkPad Universal USB-C Dock','Accessories',0.00,'/images/1725651747307.jpg'),(21,'Jabra Evolve 20 Microsoft Lync Stereo','Accessories',0.00,'/images/1725651774352.png'),(24,'MS Surface','Notebooks',0.00,'/images/1725916595235.jpg'),(26,'Thunderbolt 4 Cable 40Gbps High Speed USB C Cable','Accessories',0.00,'/images/1725994268818.jpg');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-25 14:30:14
