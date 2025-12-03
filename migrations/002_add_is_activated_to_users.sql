-- Migration to add isActivated column to enseignants and etudiants tables
ALTER TABLE enseignants ADD COLUMN isActivated BOOLEAN NOT NULL DEFAULT TRUE AFTER biography;
ALTER TABLE etudiants ADD COLUMN isActivated BOOLEAN NOT NULL DEFAULT TRUE AFTER biography;