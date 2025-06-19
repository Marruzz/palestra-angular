-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: db:3306
-- Creato il: Giu 17, 2025 alle 09:08
-- Versione del server: 8.0.42
-- Versione PHP: 8.2.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `palestra-angular`
--

-- --------------------------------------------------------

--
-- Struttura della tabella `Abbonamenti`
--

CREATE TABLE `Abbonamenti` (
  `id` int NOT NULL,
  `id_utente` int NOT NULL,
  `id_corso` int NOT NULL,
  `data_inizio` date NOT NULL,
  `durata_mesi` int NOT NULL,
  `data_fine` date GENERATED ALWAYS AS ((`data_inizio` + interval `durata_mesi` month)) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


--
-- Struttura della tabella `Corsi`
--

CREATE TABLE `Corsi` (
  `id` int NOT NULL,
  `nome_corso` varchar(50) NOT NULL,
  `descrizione` text,
  `durata_mesi_default` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


--
-- Struttura della tabella `Ingressi`
--

CREATE TABLE `Ingressi` (
  `id` int NOT NULL,
  `id_utente` int NOT NULL,
  `data_ora` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


--
-- Struttura della tabella `Utenti`
--

CREATE TABLE `Utenti` (
  `id` int NOT NULL,
  `nome` varchar(50) NOT NULL,
  `cognome` varchar(50) NOT NULL,
  `data_nascita` date NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `codice_fiscale` varchar(16) NOT NULL,
  `certificato_medico` varchar(255) DEFAULT NULL,
  `certificato_scadenza` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
ALTER TABLE `Abbonamenti`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_utente` (`id_utente`),
  ADD KEY `id_corso` (`id_corso`);

--
-- Indici per le tabelle `Corsi`
--
ALTER TABLE `Corsi`
  ADD PRIMARY KEY (`id`);

--
-- Indici per le tabelle `Ingressi`
--
ALTER TABLE `Ingressi`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_utente` (`id_utente`);

--
-- Indici per le tabelle `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indici per le tabelle `Utenti`
--
ALTER TABLE `Utenti`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codice_fiscale` (`codice_fiscale`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `Abbonamenti`
--
ALTER TABLE `Abbonamenti`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=455;

--
-- AUTO_INCREMENT per la tabella `Corsi`
--
ALTER TABLE `Corsi`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT per la tabella `Ingressi`
--
ALTER TABLE `Ingressi`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2851;

--
-- AUTO_INCREMENT per la tabella `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT per la tabella `Utenti`
--
ALTER TABLE `Utenti`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=301;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `Abbonamenti`
--
ALTER TABLE `Abbonamenti`
  ADD CONSTRAINT `Abbonamenti_ibfk_1` FOREIGN KEY (`id_utente`) REFERENCES `Utenti` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `Abbonamenti_ibfk_2` FOREIGN KEY (`id_corso`) REFERENCES `Corsi` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `Ingressi`
--
ALTER TABLE `Ingressi`
  ADD CONSTRAINT `Ingressi_ibfk_1` FOREIGN KEY (`id_utente`) REFERENCES `Utenti` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
