-- Aggiungi colonne per i certificati medici
ALTER TABLE Utenti
ADD COLUMN certificato_medico VARCHAR(255) NULL,
ADD COLUMN certificato_scadenza DATE NULL;
