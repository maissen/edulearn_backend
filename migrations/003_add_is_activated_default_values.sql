-- Migration to ensure isActivated column has correct default values
ALTER TABLE enseignants MODIFY COLUMN isActivated BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE etudiants MODIFY COLUMN isActivated BOOLEAN NOT NULL DEFAULT TRUE;