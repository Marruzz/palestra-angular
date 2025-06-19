-- Script per aggiornare la tabella Utenti con i campi per i certificati medici

-- Verifica se le colonne esistono già
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'palestra-angular' 
  AND TABLE_NAME = 'Utenti' 
  AND COLUMN_NAME IN ('certificato_medico', 'certificato_scadenza');

-- Aggiungi le colonne se non esistono
ALTER TABLE Utenti 
ADD COLUMN IF NOT EXISTS certificato_medico VARCHAR(255) NULL COMMENT 'Nome del file del certificato medico';

ALTER TABLE Utenti 
ADD COLUMN IF NOT EXISTS certificato_scadenza DATE NULL COMMENT 'Data di scadenza del certificato medico';

-- Verifica che le colonne siano state create
DESCRIBE Utenti;
