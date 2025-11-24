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
    category VARCHAR(100),
    enseignant_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (enseignant_id) REFERENCES enseignants(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_enseignant_id (enseignant_id),
    INDEX idx_category (category)
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

-- Quiz Results table
CREATE TABLE IF NOT EXISTS quiz_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    etudiant_id INT NOT NULL,
    quiz_id INT NOT NULL,
    score DECIMAL(5,2) NOT NULL, -- Score out of 20
    total_questions INT NOT NULL,
    correct_answers INT NOT NULL,
    responses JSON, -- Store student's answers as JSON
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (etudiant_id) REFERENCES etudiants(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quiz(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY unique_quiz_attempt (etudiant_id, quiz_id), -- One attempt per student per quiz
    INDEX idx_etudiant_id (etudiant_id),
    INDEX idx_quiz_id (quiz_id),
    INDEX idx_submitted_at (submitted_at)
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

-- Student Course Enrollments table
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

-- Insert sample teachers (enseignants)
INSERT IGNORE INTO enseignants (username, email, module) VALUES
('prof_python', 'python.teacher@school.com', 'Python Programming'),
('prof_cloud', 'cloud.teacher@school.com', 'Cloud Computing'),
('prof_devops', 'devops.teacher@school.com', 'DevOps & CI/CD'),
('prof_algorithms', 'algorithms.teacher@school.com', 'Data Structures & Algorithms'),
('prof_webdev', 'webdev.teacher@school.com', 'Web Development'),
('prof_database', 'database.teacher@school.com', 'Database Design'),
('prof_security', 'security.teacher@school.com', 'Cybersecurity'),
('prof_mobile', 'mobile.teacher@school.com', 'Mobile Development');

-- Insert sample courses with IT categories
INSERT IGNORE INTO cours (titre, description, category, enseignant_id) VALUES
-- Python Programming Course
('Python Fundamentals', 'Learn the basics of Python programming language including syntax, data types, and control structures', 'Python', 1),
('Advanced Python', 'Deep dive into advanced Python concepts like decorators, generators, and object-oriented programming', 'Python', 1),
('Python Data Science', 'Use Python for data analysis, visualization, and machine learning with libraries like Pandas and NumPy', 'Python', 1),

-- Cloud Computing Course
('AWS Cloud Fundamentals', 'Introduction to Amazon Web Services including EC2, S3, and basic cloud architecture', 'Cloud Computing', 2),
('Azure Cloud Services', 'Microsoft Azure cloud platform covering virtual machines, storage, and networking', 'Cloud Computing', 2),
('Google Cloud Platform', 'Google Cloud services including Compute Engine, Cloud Storage, and BigQuery', 'Cloud Computing', 2),

-- DevOps Course
('Docker & Containerization', 'Master Docker containers, Docker Compose, and container orchestration basics', 'DevOps', 3),
('CI/CD with Jenkins', 'Continuous Integration and Continuous Deployment using Jenkins pipelines', 'DevOps', 3),
('Kubernetes Orchestration', 'Container orchestration with Kubernetes, pods, services, and deployments', 'DevOps', 3),

-- Algorithms Course
('Data Structures Fundamentals', 'Arrays, linked lists, stacks, queues, and basic data structure operations', 'Algorithms', 4),
('Sorting & Searching Algorithms', 'Implementation and analysis of sorting algorithms (quick, merge, heap) and search techniques', 'Algorithms', 4),
('Graph Algorithms', 'Graph theory, traversal algorithms (DFS/BFS), shortest paths, and minimum spanning trees', 'Algorithms', 4),

-- Web Development Course
('HTML & CSS Fundamentals', 'Building responsive web pages with HTML5 and modern CSS techniques', 'Web Development', 5),
('JavaScript & DOM Manipulation', 'Client-side programming with JavaScript, DOM manipulation, and event handling', 'Web Development', 5),
('React.js Framework', 'Building modern web applications with React, components, and state management', 'Web Development', 5),

-- Database Course
('SQL Database Design', 'Relational database design, normalization, and SQL query optimization', 'Database', 6),
('NoSQL with MongoDB', 'Document-based databases, MongoDB operations, and data modeling', 'Database', 6),
('Redis Caching', 'In-memory data structures, caching strategies, and Redis operations', 'Database', 6),

-- Cybersecurity Course
('Network Security Basics', 'Network security principles, firewalls, and intrusion detection systems', 'Cybersecurity', 7),
('Ethical Hacking', 'Penetration testing, vulnerability assessment, and security auditing', 'Cybersecurity', 7),
('Cryptography Fundamentals', 'Encryption algorithms, digital signatures, and secure communication protocols', 'Cybersecurity', 7),

-- Mobile Development Course
('React Native Basics', 'Cross-platform mobile development with React Native framework', 'Mobile Development', 8),
('iOS Development with Swift', 'Native iOS app development using Swift programming language', 'Mobile Development', 8),
('Android Development', 'Native Android app development with Java/Kotlin and Android SDK', 'Mobile Development', 8);

-- Insert quizzes for each course (at least 5 quizzes per course)
INSERT IGNORE INTO quiz (titre, cours_id) VALUES
-- Python Course Quizzes (Course IDs: 1, 2, 3)
('Python Basics Quiz', 1),
('Variables & Data Types', 1),
('Control Structures', 1),
('Functions & Modules', 1),
('Error Handling', 1),
('Object-Oriented Programming', 2),
('Decorators & Generators', 2),
('File I/O Operations', 2),
('Regular Expressions', 2),
('Multithreading', 2),
('Pandas DataFrames', 3),
('NumPy Arrays', 3),
('Data Visualization', 3),
('Machine Learning Basics', 3),
('Data Cleaning', 3),

-- Cloud Computing Quizzes (Course IDs: 4, 5, 6)
('AWS EC2 Fundamentals', 4),
('S3 Storage Solutions', 4),
('VPC Networking', 4),
('IAM Security', 4),
('CloudWatch Monitoring', 4),
('Azure VMs', 5),
('Azure Storage', 5),
('Azure Networking', 5),
('Azure Active Directory', 5),
('Azure Monitoring', 5),
('GCP Compute Engine', 6),
('Cloud Storage', 6),
('BigQuery Analytics', 6),
('GCP Networking', 6),
('Cloud Functions', 6),

-- DevOps Quizzes (Course IDs: 7, 8, 9)
('Docker Images', 7),
('Docker Containers', 7),
('Docker Compose', 7),
('Docker Volumes', 7),
('Docker Networking', 7),
('Jenkins Pipelines', 8),
('Build Triggers', 8),
('Test Automation', 8),
('Deployment Strategies', 8),
('Pipeline Security', 8),
('Kubernetes Pods', 9),
('Services & Ingress', 9),
('ConfigMaps & Secrets', 9),
('Deployments', 9),
('Helm Charts', 9),

-- Algorithms Quizzes (Course IDs: 10, 11, 12)
('Arrays & Strings', 10),
('Linked Lists', 10),
('Stacks & Queues', 10),
('Hash Tables', 10),
('Trees & Graphs', 10),
('Bubble Sort', 11),
('Quick Sort', 11),
('Merge Sort', 11),
('Binary Search', 11),
('Search Algorithms', 11),
('Graph Traversal', 12),
('Shortest Path', 12),
('Minimum Spanning Tree', 12),
('Topological Sort', 12),
('Graph Algorithms', 12),

-- Web Development Quizzes (Course IDs: 13, 14, 15)
('HTML Elements', 13),
('CSS Selectors', 13),
('Responsive Design', 13),
('CSS Grid & Flexbox', 13),
('HTML Forms', 13),
('JavaScript Variables', 14),
('DOM Manipulation', 14),
('Event Handling', 14),
('Async Programming', 14),
('JavaScript Objects', 14),
('React Components', 15),
('State Management', 15),
('Props & Children', 15),
('Hooks & Effects', 15),
('React Router', 15),

-- Database Quizzes (Course IDs: 16, 17, 18)
('SQL Joins', 16),
('Normalization', 16),
('Indexes', 16),
('Stored Procedures', 16),
('Database Security', 16),
('MongoDB Documents', 17),
('CRUD Operations', 17),
('Aggregation Pipeline', 17),
('Indexing in MongoDB', 17),
('Data Modeling', 17),
('Redis Data Types', 18),
('Caching Strategies', 18),
('Redis Commands', 18),
('Pub/Sub Pattern', 18),
('Redis Persistence', 18),

-- Cybersecurity Quizzes (Course IDs: 19, 20, 21)
('Firewall Types', 19),
('Network Protocols', 19),
('VPN Security', 19),
('Intrusion Detection', 19),
('Network Security', 19),
('Reconnaissance', 20),
('Scanning Techniques', 20),
('Exploitation', 20),
('Post-Exploitation', 20),
('Reporting', 20),
('Symmetric Encryption', 21),
('Asymmetric Encryption', 21),
('Hash Functions', 21),
('Digital Signatures', 21),
('SSL/TLS', 21),

-- Mobile Development Quizzes (Course IDs: 22, 23, 24)
('React Native Components', 22),
('Navigation', 22),
('State Management', 22),
('API Integration', 22),
('Platform Specific Code', 22),
('Swift Variables', 23),
('iOS UI Components', 23),
('Auto Layout', 23),
('Core Data', 23),
('App Store Deployment', 23),
('Android Activities', 24),
('Fragments', 24),
('Material Design', 24),
('SQLite Database', 24),
('Google Play Store', 24);

-- Insert sample questions for quizzes (covering a good sample of quizzes)
INSERT IGNORE INTO questions (quiz_id, question, option_a, option_b, option_c, option_d, correct) VALUES
-- Python Basics Quiz (Quiz ID: 1)
(1, 'What is the correct file extension for Python files?', '.py', '.python', '.pyt', '.pt', 'a'),
(1, 'Which of the following is used to define a function in Python?', 'function', 'def', 'func', 'define', 'b'),
(1, 'What will print(len("hello")) output?', '5', '6', '4', 'Error', 'a'),
(1, 'Which data type is immutable in Python?', 'List', 'Dictionary', 'Tuple', 'Set', 'c'),
(1, 'What is the output of 3 + 4 * 2 in Python?', '14', '11', '10', '7', 'b'),

-- Variables & Data Types (Quiz ID: 2)
(2, 'Which of these is NOT a valid Python variable name?', 'my_var', '2var', '_private', 'var2', 'b'),
(2, 'What is the result of type(42)?', '<class int>', '<class float>', '<class str>', '<class bool>', 'a'),
(2, 'Which method converts a string to lowercase?', 'lower()', 'down()', 'small()', 'min()', 'a'),
(2, 'What does the len() function return for a dictionary?', 'Number of keys', 'Number of values', 'Total items', 'Memory size', 'a'),
(2, 'Which of these creates an empty list?', '[]', '{}', '()', 'set()', 'a'),

-- Cloud Computing - AWS EC2 (Quiz ID: 16)
(16, 'What does EC2 stand for in AWS?', 'Elastic Compute Cloud', 'Elastic Container Cloud', 'Enterprise Compute Cloud', 'Elastic Cloud Computing', 'a'),
(16, 'Which EC2 instance type is best for general-purpose workloads?', 't3', 'c5', 'r5', 'm5', 'd'),
(16, 'What is the maximum number of EC2 instances you can launch in a region by default?', '20', '100', 'Unlimited', '1000', 'c'),
(16, 'Which storage type provides the highest IOPS for EC2 instances?', 'EBS', 'EFS', 'S3', 'Instance Store', 'd'),
(16, 'What is Amazon Machine Image (AMI)?', 'A virtual machine template', 'A storage volume', 'A network configuration', 'A security group', 'a'),

-- DevOps - Docker Images (Quiz ID: 31)
(31, 'What is a Docker image?', 'A running container', 'A blueprint for containers', 'A storage volume', 'A network configuration', 'b'),
(31, 'Which command is used to build a Docker image?', 'docker run', 'docker build', 'docker create', 'docker pull', 'b'),
(31, 'What is the default tag for a Docker image?', 'latest', 'main', 'master', 'default', 'a'),
(31, 'Which file contains Docker image build instructions?', 'Dockerfile', 'docker-compose.yml', 'package.json', 'requirements.txt', 'a'),
(31, 'What does the FROM instruction do in a Dockerfile?', 'Specifies base image', 'Sets working directory', 'Copies files', 'Runs commands', 'a'),

-- Algorithms - Arrays & Strings (Quiz ID: 46)
(46, 'What is the time complexity of accessing an element in an array by index?', 'O(1)', 'O(log n)', 'O(n)', 'O(n²)', 'a'),
(46, 'Which of these is NOT an advantage of arrays?', 'Random access', 'Fixed size', 'Memory efficiency', 'Cache friendly', 'b'),
(46, 'What happens when you try to access an array element beyond its bounds in most languages?', 'Returns null', 'Returns undefined', 'Throws exception', 'Returns garbage value', 'c'),
(46, 'Which operation is most efficient on arrays?', 'Insertion in middle', 'Deletion from beginning', 'Random access', 'Searching unsorted', 'c'),
(46, 'What is a jagged array?', 'Array of arrays with different sizes', 'Array with gaps', 'Sorted array', 'Circular array', 'a'),

-- Web Development - HTML Elements (Quiz ID: 61)
(61, 'Which tag is used to create a hyperlink in HTML?', '<link>', '<a>', '<href>', '<url>', 'b'),
(61, 'What does the <p> tag represent?', 'Paragraph', 'Page', 'Picture', 'Panel', 'a'),
(61, 'Which attribute specifies the destination of a link?', 'src', 'href', 'link', 'url', 'b'),
(61, 'What is the correct HTML for inserting an image?', '<img src="image.jpg">', '<image src="image.jpg">', '<pic src="image.jpg">', '<photo src="image.jpg">', 'a'),
(61, 'Which tag is used to define a table row?', '<tr>', '<td>', '<th>', '<table>', 'a'),

-- Database - SQL Joins (Quiz ID: 76)
(76, 'What type of join returns only matching rows from both tables?', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN', 'a'),
(76, 'Which join returns all rows from the left table and matching rows from the right table?', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'CROSS JOIN', 'b'),
(76, 'What does the ON clause specify in a JOIN?', 'Join condition', 'Table names', 'Column names', 'Sort order', 'a'),
(76, 'Which join can produce a Cartesian product?', 'INNER JOIN', 'LEFT JOIN', 'CROSS JOIN', 'SELF JOIN', 'c'),
(76, 'What is a self-join?', 'Joining a table with itself', 'Joining two different tables', 'Joining three tables', 'No such thing', 'a'),

-- Cybersecurity - Firewall Types (Quiz ID: 91)
(91, 'Which firewall operates at the network layer?', 'Application Gateway', 'Circuit-level Gateway', 'Packet Filtering', 'Proxy Server', 'c'),
(91, 'What is a stateful firewall?', 'Tracks connection state', 'Filters by port only', 'Blocks all traffic', 'Allows all traffic', 'a'),
(91, 'Which firewall type can inspect application layer data?', 'Packet Filter', 'Circuit Level', 'Application Layer', 'Network Layer', 'c'),
(91, 'What is the main disadvantage of proxy firewalls?', 'Slow performance', 'No security', 'Too expensive', 'Complex setup', 'a'),
(91, 'Which firewall is also known as a dual-homed gateway?', 'Screened Host', 'Screened Subnet', 'Bastion Host', 'DMZ', 'c'),

-- Mobile Development - React Native Components (Quiz ID: 106)
(106, 'What is the root component in React Native?', '<App>', '<View>', '<div>', '<Container>', 'b'),
(106, 'Which component is used for text display?', '<Text>', '<p>', '<span>', '<label>', 'a'),
(106, 'What does StyleSheet.create() do?', 'Creates inline styles', 'Creates style objects', 'Creates CSS files', 'Validates styles', 'b'),
(106, 'Which prop controls component layout?', 'style', 'layout', 'position', 'flex', 'a'),
(106, 'What is the equivalent of <div> in React Native?', '<View>', '<Container>', '<Box>', '<Div>', 'a');