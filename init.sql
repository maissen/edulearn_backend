-- ============================
-- SCHOOL PLATFORM FULL SQL FILE
-- Schema + Data + Tests + Questions
-- ============================

USE school_db;

-- ============================
-- USERS
-- ============================
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

-- ============================
-- CLASSES
-- ============================
CREATE TABLE IF NOT EXISTS classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    niveau VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_niveau (niveau)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================
-- ENSEIGNANTS
-- ============================
CREATE TABLE IF NOT EXISTS enseignants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    module VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================
-- ETUDIANTS
-- ============================
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

-- ============================
-- COURSES
-- ============================
CREATE TABLE IF NOT EXISTS cours (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    enseignant_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (enseignant_id) REFERENCES enseignants(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_enseignant_id (enseignant_id),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================
-- TEST
-- ============================
CREATE TABLE IF NOT EXISTS test (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    cours_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cours_id) REFERENCES cours(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY unique_cours_id (cours_id),
    INDEX idx_cours_id (cours_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================
-- TEST QUESTIONS
-- ============================
CREATE TABLE IF NOT EXISTS test_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_id INT NOT NULL,
    question TEXT NOT NULL,
    option_a VARCHAR(500) NOT NULL,
    option_b VARCHAR(500) NOT NULL,
    option_c VARCHAR(500) NOT NULL,
    option_d VARCHAR(500) NOT NULL,
    answer ENUM('a','b','c','d') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (test_id) REFERENCES test(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_test_id (test_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================
-- TEST RESULTS
-- ============================
CREATE TABLE IF NOT EXISTS test_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    etudiant_id INT NOT NULL,
    test_id INT NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    total_questions INT NOT NULL,
    correct_answers INT NOT NULL,
    responses JSON,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (etudiant_id) REFERENCES etudiants(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (test_id) REFERENCES test(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY unique_test_submission (etudiant_id, test_id),
    INDEX idx_etudiant_id (etudiant_id),
    INDEX idx_test_id (test_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================
-- STUDENT ENROLLMENTS
-- ============================
CREATE TABLE IF NOT EXISTS student_enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    etudiant_id INT NOT NULL,
    cours_id INT NOT NULL,
    status ENUM('in_progress', 'completed') NOT NULL DEFAULT 'in_progress',
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (etudiant_id) REFERENCES etudiants(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (cours_id) REFERENCES cours(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY unique_enrollment (etudiant_id, cours_id),
    INDEX idx_etudiant_id (etudiant_id),
    INDEX idx_cours_id (cours_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================
-- IMAGES
-- ============================
CREATE TABLE IF NOT EXISTS images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================
-- INSERT DEFAULT CLASS + TEACHERS + COURSES
-- =======================================================

INSERT IGNORE INTO classes (nom, niveau) VALUES
('Classe A', 'Primaire'),
('Classe B', 'Primaire'),
('Classe C', 'Collège'),
('Classe D', 'Collège'),
('Classe E', 'Lycée'),
('Classe F', 'Lycée');

INSERT IGNORE INTO enseignants (username, email, module) VALUES
('prof_python', 'python.teacher@school.com', 'Python Programming'),
('prof_cloud', 'cloud.teacher@school.com', 'Cloud Computing'),
('prof_devops', 'devops.teacher@school.com', 'DevOps & CI/CD'),
('prof_algorithms', 'algorithms.teacher@school.com', 'Data Structures & Algorithms'),
('prof_webdev', 'webdev.teacher@school.com', 'Web Development'),
('prof_database', 'database.teacher@school.com', 'Database Design'),
('prof_security', 'security.teacher@school.com', 'Cybersecurity'),
('prof_mobile', 'mobile.teacher@school.com', 'Mobile Development');

INSERT IGNORE INTO cours (titre, description, category, enseignant_id) VALUES
('Python Fundamentals', 'Learn the basics...', 'Python', 1),
('Advanced Python', 'Deep dive...', 'Python', 1),
('Python Data Science', 'Use Python for DS...', 'Python', 1),

('AWS Cloud Fundamentals', 'Introduction to AWS...', 'Cloud Computing', 2),
('Azure Cloud Services', 'Microsoft Azure...', 'Cloud Computing', 2),
('Google Cloud Platform', 'GCP services...', 'Cloud Computing', 2),

('Docker & Containerization', 'Master Docker...', 'DevOps', 3),
('CI/CD with Jenkins', 'CI/CD using Jenkins...', 'DevOps', 3),
('Kubernetes Orchestration', 'Kubernetes basics...', 'DevOps', 3),

('Data Structures Fundamentals', 'Arrays, lists...', 'Algorithms', 4),
('Sorting & Searching Algorithms', 'Implementation...', 'Algorithms', 4),
('Graph Algorithms', 'Graph theory...', 'Algorithms', 4),

('HTML & CSS Fundamentals', 'Building responsive pages', 'Web Development', 5),
('JavaScript & DOM Manipulation', 'Client-side JS...', 'Web Development', 5),
('React.js Framework', 'Modern web apps...', 'Web Development', 5),

('SQL Database Design', 'Database design...', 'Database', 6),
('NoSQL with MongoDB', 'Document DB...', 'Database', 6),
('Redis Caching', 'In-memory structures...', 'Database', 6),

('Network Security Basics', 'Firewalls, IDS...', 'Cybersecurity', 7),
('Ethical Hacking', 'Penetration testing...', 'Cybersecurity', 7),
('Cryptography Fundamentals', 'Encryption algorithms...', 'Cybersecurity', 7),

('React Native Basics', 'Cross-platform dev...', 'Mobile Development', 8),
('iOS Development with Swift', 'Native iOS apps...', 'Mobile Development', 8),
('Android Development', 'Android apps...', 'Mobile Development', 8);

-- =======================================================
-- INSERT TESTS (ONE PER COURSE)
-- =======================================================
INSERT IGNORE INTO test (titre, description, cours_id) VALUES
('Python Fundamentals Test', 'Final assessment for Python Fundamentals', 1),
('Advanced Python Test', 'Final assessment for Advanced Python', 2),
('Python Data Science Test', 'Final assessment for Python Data Science', 3),

('AWS Cloud Fundamentals Test', 'Final assessment for AWS Cloud Fundamentals', 4),
('Azure Cloud Services Test', 'Final assessment for Azure Cloud Services', 5),
('Google Cloud Platform Test', 'Final assessment for Google Cloud Platform', 6),

('Docker & Containerization Test', 'Final assessment for Docker & Containerization', 7),
('CI/CD with Jenkins Test', 'Final assessment for CI/CD with Jenkins', 8),
('Kubernetes Orchestration Test', 'Final assessment for Kubernetes Orchestration', 9),

('Data Structures Fundamentals Test', 'Final assessment for Data Structures Fundamentals', 10),
('Sorting & Searching Algorithms Test', 'Final assessment for Sorting & Searching Algorithms', 11),
('Graph Algorithms Test', 'Final assessment for Graph Algorithms', 12),

('HTML & CSS Fundamentals Test', 'Final assessment for HTML & CSS Fundamentals', 13),
('JavaScript & DOM Manipulation Test', 'Final assessment for JavaScript & DOM Manipulation', 14),
('React.js Framework Test', 'Final assessment for React.js Framework', 15),

('SQL Database Design Test', 'Final assessment for SQL Database Design', 16),
('NoSQL with MongoDB Test', 'Final assessment for NoSQL with MongoDB', 17),
('Redis Caching Test', 'Final assessment for Redis Caching', 18),

('Network Security Basics Test', 'Final assessment for Network Security Basics', 19),
('Ethical Hacking Test', 'Final assessment for Ethical Hacking', 20),
('Cryptography Fundamentals Test', 'Final assessment for Cryptography Fundamentals', 21),

('React Native Basics Test', 'Final assessment for React Native Basics', 22),
('iOS Development with Swift Test', 'Final assessment for iOS Development with Swift', 23),
('Android Development Test', 'Final assessment for Android Development', 24);

-- =======================================================
-- INSERT TEST QUESTIONS (CONVERTED FROM OLD QUIZZES)
-- =======================================================

-- Python Basics Quiz (quiz 1) → course 1 → test_id 1
INSERT IGNORE INTO test_questions (test_id, question, option_a, option_b, option_c, option_d, answer) VALUES
(1, 'What is the correct file extension for Python files?', '.py', '.python', '.pyt', '.pt', 'a'),
(1, 'Which keyword defines a function?', 'function', 'def', 'func', 'define', 'b'),
(1, 'Output of len("hello")?', '5', '6', '4', 'Error', 'a'),
(1, 'Immutable data type?', 'List', 'Dictionary', 'Tuple', 'Set', 'c'),
(1, 'Result of 3 + 4 * 2?', '14', '11', '10', '7', 'b');

-- Variables & Data Types (quiz 2) → still course 1 → test_id 1
INSERT IGNORE INTO test_questions VALUES
(1, 'Invalid variable name?', 'my_var', '2var', '_private', 'var2', 'b'),
(1, 'Result of type(42)?', '<class int>', '<class float>', '<class str>', '<class bool>', 'a'),
(1, 'Lowercase method?', 'lower()', 'down()', 'small()', 'min()', 'a'),
(1, 'len() of dictionary returns?', 'Number of keys', 'Number of values', 'Total items', 'Memory size', 'a'),
(1, 'Empty list?', '[]', '{}', '()', 'set()', 'a');

-- AWS EC2 (quiz 16) → course 4 → test_id 4
INSERT IGNORE INTO test_questions VALUES
(4, 'EC2 stands for?', 'Elastic Compute Cloud', 'Elastic Container Cloud', 'Enterprise Compute Cloud', 'Elastic Cloud Computing', 'a'),
(4, 'General-purpose instance?', 't3', 'c5', 'r5', 'm5', 'd'),
(4, 'Max default instances?', '20', '100', 'Unlimited', '1000', 'c'),
(4, 'Highest IOPS?', 'EBS', 'EFS', 'S3', 'Instance Store', 'd'),
(4, 'AMI is?', 'VM template', 'Storage volume', 'Network config', 'Security group', 'a');

-- Docker (quiz 31) → course 7 → test_id 7
INSERT IGNORE INTO test_questions VALUES
(7, 'What is a Docker image?', 'Running container', 'Blueprint for containers', 'Storage volume', 'Network config', 'b'),
(7, 'Command to build image?', 'docker run', 'docker build', 'docker create', 'docker pull', 'b'),
(7, 'Default tag?', 'latest', 'main', 'master', 'default', 'a'),
(7, 'Build instructions file?', 'Dockerfile', 'docker-compose.yml', 'package.json', 'requirements.txt', 'a'),
(7, 'FROM instruction does?', 'Specifies base image', 'Sets working directory', 'Copies files', 'Runs commands', 'a');

-- Arrays (quiz 46) → course 10 → test_id 10
INSERT IGNORE INTO test_questions VALUES
(10, 'Access array index complexity?', 'O(1)', 'O(log n)', 'O(n)', 'O(n²)', 'a'),
(10, 'NOT advantage of arrays?', 'Random access', 'Fixed size', 'Memory efficiency', 'Cache friendly', 'b'),
(10, 'Access out of bounds?', 'null', 'undefined', 'Exception', 'Garbage value', 'c'),
(10, 'Most efficient array op?', 'Insert middle', 'Delete beginning', 'Random access', 'Search unsorted', 'c'),
(10, 'Jagged array?', 'Array of arrays with different sizes', 'Array with gaps', 'Sorted array', 'Circular array', 'a');

-- HTML Elements (quiz 61) → course 13 → test_id 13
INSERT IGNORE INTO test_questions VALUES
(13, 'Hyperlink tag?', '<link>', '<a>', '<href>', '<url>', 'b'),
(13, 'What is <p>?', 'Paragraph', 'Page', 'Picture', 'Panel', 'a'),
(13, 'Link destination attribute?', 'src', 'href', 'link', 'url', 'b'),
(13, 'Insert an image?', '<img src="image.jpg">', '<image src="image.jpg">', '<pic>', '<photo>', 'a'),
(13, '<tr> defines?', 'Table row', 'Table data', 'Header', 'Table', 'a');

-- SQL JOINS (quiz 76) → course 16 → test_id 16
INSERT IGNORE INTO test_questions VALUES
(16, 'Matching rows only?', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN', 'a'),
(16, 'All left + matching right?', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'CROSS JOIN', 'b'),
(16, 'ON clause defines?', 'Join condition', 'Table names', 'Column names', 'Sort order', 'a'),
(16, 'Cartesian product?', 'INNER JOIN', 'LEFT JOIN', 'CROSS JOIN', 'SELF JOIN', 'c'),
(16, 'Self-join is?', 'Table joins itself', 'Two different tables', 'Three tables', 'Not real', 'a');

-- Firewalls (quiz 91) → course 19 → test_id 19
INSERT IGNORE INTO test_questions VALUES
(19, 'Network layer firewall?', 'Application Gateway', 'Circuit-level', 'Packet Filtering', 'Proxy Server', 'c'),
(19, 'Stateful firewall?', 'Tracks connection state', 'Filters by port only', 'Blocks all', 'Allows all', 'a'),
(19, 'Inspect application layer?', 'Packet Filter', 'Circuit Level', 'Application Layer', 'Network Layer', 'c'),
(19, 'Disadvantage of proxy?', 'Slow', 'No security', 'Expensive', 'Complex', 'a'),
(19, 'Dual-homed gateway?', 'Screened Host', 'Screened Subnet', 'Bastion Host', 'DMZ', 'c');

-- React Native (quiz 106) → course 22 → test_id 22
INSERT IGNORE INTO test_questions VALUES
(22, 'Root component?', '<App>', '<View>', '<div>', '<Container>', 'b'),
(22, 'Text display component?', '<Text>', '<p>', '<span>', '<label>', 'a'),
(22, 'StyleSheet.create?', 'Inline styles', 'Style objects', 'CSS files', 'Validate styles', 'b'),
(22, 'Layout prop?', 'style', 'layout', 'position', 'flex', 'a'),
(22, 'div equivalent?', '<View>', '<Container>', '<Box>', '<Div>', 'a');

