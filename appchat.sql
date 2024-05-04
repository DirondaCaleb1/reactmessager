-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : sam. 04 mai 2024 à 00:18
-- Version du serveur : 8.0.31
-- Version de PHP : 8.0.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `appchat`
--

-- --------------------------------------------------------

--
-- Structure de la table `hystorycalls`
--

DROP TABLE IF EXISTS `hystorycalls`;
CREATE TABLE IF NOT EXISTS `hystorycalls` (
  `id` int NOT NULL AUTO_INCREMENT,
  `outgoingCallId` int NOT NULL,
  `incomingCallId` int NOT NULL,
  `typeCall` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `callerStatus` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'missed',
  `totalDuration` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `startCallingTime` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `endCallingTime` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `HystoryCalls_outgoingCallId_fkey` (`outgoingCallId`),
  KEY `HystoryCalls_incomingCallId_fkey` (`incomingCallId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `messages`
--

DROP TABLE IF EXISTS `messages`;
CREATE TABLE IF NOT EXISTS `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `senderId` int NOT NULL,
  `recieverId` int NOT NULL,
  `type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'text',
  `message` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `messageStatus` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'sent',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Messages_recieverId_fkey` (`recieverId`),
  KEY `Messages_senderId_fkey` (`senderId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `about` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `profilePicture` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `connectWithLogin` tinyint(1) NOT NULL DEFAULT '0',
  `password` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `isConnect` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `Users_email_key` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `email`, `phone`, `about`, `name`, `profilePicture`, `connectWithLogin`, `password`, `isConnect`) VALUES
(1, 'gajild@gmail.com', '', 'Je suis Gajild', 'Gajild', '/avatars/1.png', 0, '$2b$12$U3P9woP05VSgxyVN52K82e.Ehu/jw1SCaX4v5ccuBOIQCS0ez4TWe', 0),
(5, 'quan@gmail.com', '', 'Je suis Quan', 'Quan', '/avatars/5.png', 0, '$2b$12$be97nmkH08TTadO7vp2yKexxbk7AusV7GShknbnqvbtHkW28VCdEu', 0),
(2, 'juno@gmail.com', '', 'Je suis Juno', 'Juno', '/avatars/2.png', 0, '$2b$12$MvZyC9CvWd1N9ENmmr2eYe/lxZBcIdFkoWLzddPhglPe02QXwAL7W', 0),
(3, 'cdirondaissalou@gmail.com', '', 'Je suis Dironda', 'Dironda', '/avatars/3.png', 0, '$2b$12$tP9DlvQ0pqOr65Le0aBzPefqcItihi4Des2Dcgvsk7hwurUz3cPTu', 0),
(4, 'issalou@gmail.com', '', 'Je suis Issalou', 'Issalou', '/avatars/4.png', 0, '$2b$12$yFOwAzQ0iPhZijOWpL9sxOOyZeG8S571uE5I2yT4ePUq56nYMKlyy', 0);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
