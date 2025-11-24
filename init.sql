-- Initialize database schema for School Platform
-- This script creates all tables with proper relationships and constraints

USE school_db;

-- Users table (for authentication and forum)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'enseignant', 'etudiant') NOT NULL DEFAULT 'etudiant',
    biography TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    niveau VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_niveau (niveau)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Teachers (Enseignants) table
CREATE TABLE IF NOT EXISTS enseignants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    module VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Students (Etudiants) table
CREATE TABLE IF NOT EXISTS etudiants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    classe_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (classe_id) REFERENCES classes(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_email (email),
    INDEX idx_classe_id (classe_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Courses (Cours) table
CREATE TABLE IF NOT EXISTS cours (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    enseignant_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (enseignant_id) REFERENCES enseignants(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_enseignant_id (enseignant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quizzes table
CREATE TABLE IF NOT EXISTS quiz (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    cours_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cours_id) REFERENCES cours(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_cours_id (cours_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT NOT NULL,
    question TEXT NOT NULL,
    option_a VARCHAR(500) NOT NULL,
    option_b VARCHAR(500) NOT NULL,
    option_c VARCHAR(500) NOT NULL,
    option_d VARCHAR(500) NOT NULL,
    correct ENUM('a', 'b', 'c', 'd') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quiz(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_quiz_id (quiz_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exams (Examens) table
CREATE TABLE IF NOT EXISTS examens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    classe_id INT NOT NULL,
    date DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (classe_id) REFERENCES classes(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_classe_id (classe_id),
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Forum posts table
CREATE TABLE IF NOT EXISTS forum (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    contenu TEXT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Forum comments table
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    contenu TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES forum(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_post_id (post_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Images table
CREATE TABLE IF NOT EXISTS images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Data for Testing
-- Note: Users can be created through registration endpoints, which will automatically
-- create entries in both users and respective role tables (enseignants/etudiants)
-- Sample enseignants and etudiants data is provided for testing existing functionality

-- Insert sample classes
INSERT IGNORE INTO classes (nom, niveau) VALUES
('Classe A', 'Primaire'),
('Classe B', 'Primaire'),
('Classe C', 'Collège'),
('Classe D', 'Collège'),
('Classe E', 'Lycée'),
('Classe F', 'Lycée');

-- -- Insert sample teachers
-- INSERT IGNORE INTO enseignants (username, email, module) VALUES
-- ('prof_math', 'math.prof@school.com', 'Mathématiques'),
-- ('prof_francais', 'francais.prof@school.com', 'Français'),
-- ('prof_anglais', 'anglais.prof@school.com', 'Anglais'),
-- ('prof_histoire', 'histoire.prof@school.com', 'Histoire-Géographie'),
-- ('prof_sciences', 'sciences.prof@school.com', 'Sciences de la Vie et de la Terre'),
-- ('prof_physique', 'physique.prof@school.com', 'Physique-Chimie');

-- -- Insert sample students
-- INSERT IGNORE INTO etudiants (username, email, classe_id) VALUES
-- ('alice_dupont', 'alice.dupont@school.com', 1),
-- ('bob_martin', 'bob.martin@school.com', 1),
-- ('charlie_garcia', 'charlie.garcia@school.com', 2),
-- ('diana_lopez', 'diana.lopez@school.com', 2),
-- ('emma_roux', 'emma.roux@school.com', 3),
-- ('felix_moreau', 'felix.moreau@school.com', 3),
-- ('gabriel_fournier', 'gabriel.fournier@school.com', 4),
-- ('hannah_durand', 'hannah.durand@school.com', 4),
-- ('ivan_petit', 'ivan.petit@school.com', 5),
-- ('julia_leroy', 'julia.leroy@school.com', 5),
-- ('kevin_bernard', 'kevin.bernard@school.com', 6),
-- ('lisa_robert', 'lisa.robert@school.com', 6);

-- -- Insert sample courses
-- INSERT IGNORE INTO cours (titre, description, enseignant_id) VALUES
-- ('Mathématiques - Algèbre', 'Cours d\'algèbre pour les élèves de collège', 1),
-- ('Mathématiques - Géométrie', 'Cours de géométrie dans l\'espace', 1),
-- ('Français - Littérature', 'Étude de la littérature française', 2),
-- ('Français - Grammaire', 'Règles grammaticales et conjugaison', 2),
-- ('Anglais - Conversation', 'Pratique de la langue anglaise orale', 3),
-- ('Anglais - Écriture', 'Rédaction et expression écrite en anglais', 3),
-- ('Histoire - Antiquité', 'Histoire de l\'Antiquité romaine et grecque', 4),
-- ('Géographie - Monde contemporain', 'Étude du monde actuel', 4),
-- ('SVT - Biologie', 'Sciences de la vie et biologie cellulaire', 5),
-- ('SVT - Écologie', 'Protection de l\'environnement', 5),
-- ('Physique - Mécanique', 'Étude des forces et mouvements', 6),
-- ('Chimie - Réactions', 'Chimie organique et réactions chimiques', 6);

-- -- Insert sample exams
-- INSERT IGNORE INTO examens (titre, classe_id, date) VALUES
-- ('Contrôle Mathématiques - Algèbre', 3, '2024-12-15 10:00:00'),
-- ('Interrogation Français - Littérature', 4, '2024-12-16 14:00:00'),
-- ('Test Anglais - Vocabulaire', 3, '2024-12-17 11:00:00'),
-- ('Devoir Histoire - Moyen Âge', 5, '2024-12-18 09:00:00'),
-- ('Évaluation SVT - Reproduction', 4, '2024-12-19 13:30:00'),
-- ('Contrôle Physique - Électricité', 6, '2024-12-20 10:30:00'),
-- ('DS Mathématiques - Géométrie', 5, '2024-12-21 08:00:00'),
-- ('Test Français - Grammaire', 3, '2024-12-22 15:00:00');

-- -- Insert sample quizzes
-- INSERT IGNORE INTO quiz (titre, cours_id) VALUES
-- ('Quiz Algèbre - Équations', 1),
-- ('Quiz Géométrie - Triangles', 2),
-- ('Quiz Littérature - Molière', 3),
-- ('Quiz Grammaire - Verbes', 4),
-- ('Quiz Anglais - Present Perfect', 5),
-- ('Quiz Vocabulaire - Travel', 6),
-- ('Quiz Antiquité - Rome', 7),
-- ('Quiz Géographie - Europe', 8),
-- ('Quiz Biologie - Cellule', 9),
-- ('Quiz Écologie - Climat', 10),
-- ('Quiz Mécanique - Forces', 11),
-- ('Quiz Chimie - Acides-Bases', 12);

-- -- Insert sample questions for quizzes
-- INSERT IGNORE INTO questions (quiz_id, question, option_a, option_b, option_c, option_d, correct) VALUES
-- -- Quiz 1: Algèbre
-- (1, 'Résoudre l\'équation: 2x + 3 = 7', 'x = 2', 'x = 1', 'x = 3', 'x = 4', 'a'),
-- (1, 'Quel est le résultat de (x + 2)(x - 3) ?', 'x² - x - 6', 'x² + x - 6', 'x² - 6', 'x² + 6', 'a'),
-- (1, 'La factorisation de x² - 9 est:', '(x - 3)(x + 3)', '(x - 3)²', '(x + 3)²', 'x(x - 9)', 'a'),

-- -- Quiz 2: Géométrie
-- (2, 'Dans un triangle rectangle, le théorème de Pythagore dit que:', 'a² + b² = c²', 'a + b = c', 'a² - b² = c²', 'a × b = c', 'a'),
-- (2, 'Un triangle ayant deux côtés égaux est:', 'isocèle', 'équilatéral', 'rectangle', 'scalène', 'a'),

-- -- Quiz 3: Littérature
-- (3, 'Quel est le titre de la pièce de Molière qui critique les médecins ?', 'Le Médecin malgré lui', 'Le Malade imaginaire', 'Les Femmes savantes', 'Tartuffe', 'b'),
-- (3, 'Dans "Le Cid" de Corneille, Rodrigue doit:', 'Tuer son père', 'Épouser Chimène', 'Venger son père', 'Partir en guerre', 'c'),

-- -- Quiz 4: Grammaire
-- (4, 'Quel temps utilise-t-on pour "hier, j\'ai mangé" ?', 'Passé composé', 'Imparfait', 'Futur simple', 'Présent', 'a'),
-- (4, 'La phrase "Il mange une pomme" est à quel temps ?', 'Présent', 'Passé composé', 'Futur', 'Imparfait', 'a'),

-- -- Quiz 5: Anglais
-- (5, 'Quel est le past participle de "go" ?', 'gone', 'went', 'going', 'goed', 'a'),
-- (5, '"I have been to Paris" utilise quel temps ?', 'Present Perfect', 'Past Simple', 'Present Continuous', 'Past Perfect', 'a'),

-- -- Quiz 6: Vocabulaire
-- (6, 'Que signifie "luggage" en français ?', 'Bagages', 'Aéroport', 'Avion', 'Train', 'a'),
-- (6, '"Where is the train station?" se traduit par:', 'Où est la gare ?', 'Où est l\'aéroport ?', 'Où est le bus ?', 'Où est le taxi ?', 'a'),

-- -- Quiz 7: Histoire
-- (7, 'Qui était le premier empereur romain ?', 'Auguste', 'César', 'Néron', 'Trajan', 'a'),
-- (7, 'Quelle bataille marqua la fin de la République romaine ?', 'Zama', 'Philippes', 'Actium', 'Cannae', 'c'),

-- -- Quiz 8: Géographie
-- (8, 'Quelle est la capitale de l\'Allemagne ?', 'Berlin', 'Paris', 'Rome', 'Madrid', 'a'),
-- (8, 'Quel est le plus long fleuve d\'Europe ?', 'Volga', 'Rhin', 'Danube', 'Seine', 'a'),

-- -- Quiz 9: Biologie
-- (9, 'Quel organite contient l\'ADN cellulaire ?', 'Noyau', 'Mitochondrie', 'Ribosome', 'Lysosome', 'a'),
-- (9, 'La photosynthèse se déroule dans quel organite ?', 'Chloroplaste', 'Mitochondrie', 'Noyau', 'Vacuole', 'a'),

-- -- Quiz 10: Écologie
-- (10, 'Quel gaz contribue le plus au réchauffement climatique ?', 'CO2', 'O2', 'N2', 'H2', 'a'),
-- (10, 'Le recyclage permet de:', 'Réduire les déchets', 'Créer de l\'énergie', 'Nettoyer l\'air', 'Produire de l\'eau', 'a'),

-- -- Quiz 11: Physique
-- (11, 'Quelle est l\'unité de la force ?', 'Newton', 'Joule', 'Watt', 'Volt', 'a'),
-- (11, 'La loi de Newton sur l\'inertie dit que:', 'Un corps au repos reste au repos', 'La force égale la masse', 'L\'énergie se conserve', 'La vitesse est constante', 'a'),

-- -- Quiz 12: Chimie
-- (12, 'Quelle est la formule de l\'eau ?', 'H2O', 'CO2', 'O2', 'NaCl', 'a'),
-- (12, 'Un acide a un pH:', 'Inférieur à 7', 'Égal à 7', 'Supérieur à 7', 'Variable', 'a');

-- -- Insert sample images
-- INSERT IGNORE INTO images (url) VALUES
-- ('uploads/sample-classroom.jpg'),
-- ('uploads/school-building.jpg'),
-- ('uploads/students-study.jpg'),
-- ('uploads/teacher-board.jpg'),
-- ('uploads/library-books.jpg'),
-- ('uploads/school-courtyard.jpg');

-- -- Note: Forum posts and comments require user IDs, so they should be created after users are registered
-- -- Example forum data (uncomment and modify user_id after creating users):
-- --
-- -- INSERT INTO forum (titre, contenu, user_id) VALUES
-- -- ('Bienvenue sur le forum !', 'N\'hésitez pas à poser vos questions ici.', 1),
-- -- ('Aide en mathématiques', 'Je ne comprends pas les équations du second degré. Quelqu\'un peut m\'expliquer ?', 2);
-- --
-- -- INSERT INTO comments (post_id, user_id, contenu) VALUES
-- -- (1, 2, 'Bienvenue à toi aussi !'),
-- -- (2, 1, 'Les équations du second degré ont la forme ax² + bx + c = 0...');