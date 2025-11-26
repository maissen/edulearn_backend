-- ====================[ SCHOOL PLATFORM FULL DB SCHEMA + DATA ]========================

USE school_db;

-- ====================[ TABLE SCHEMA ]========================

-- Users table
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

-- Classes
CREATE TABLE IF NOT EXISTS classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    niveau VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_niveau (niveau)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Teachers
CREATE TABLE IF NOT EXISTS enseignants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    module VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Students
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

-- Courses
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

-- Test table
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

-- Test questions
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

-- Test results
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

-- Student course enrollments
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

-- Images
CREATE TABLE IF NOT EXISTS images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ====================[ INITIAL DATA INSERTS ]========================

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
('Python Fundamentals', 'Learn the basics of Python programming', 'Python', 1),
('Advanced Python', 'Deep dive into advanced Python concepts', 'Python', 1),
('Python Data Science', 'Use Python for data analysis and ML', 'Python', 1),
('AWS Cloud Fundamentals', 'Introduction to Amazon Web Services', 'Cloud Computing', 2),
('Azure Cloud Services', 'Microsoft Azure cloud platform overview', 'Cloud Computing', 2),
('Google Cloud Platform', 'Google Cloud Platform services overview', 'Cloud Computing', 2),
('Docker & Containerization', 'Master Docker and containers', 'DevOps', 3),
('CI/CD with Jenkins', 'Continuous integration/deployment with Jenkins', 'DevOps', 3),
('Kubernetes Orchestration', 'Kubernetes orchestration basics', 'DevOps', 3),
('Data Structures Fundamentals', 'Learn arrays, lists, stacks, queues', 'Algorithms', 4),
('Sorting & Searching Algorithms', 'Sorting and search algorithm techniques', 'Algorithms', 4),
('Graph Algorithms', 'Graph theory algorithms and traversal', 'Algorithms', 4),
('HTML & CSS Fundamentals', 'Building responsive web pages', 'Web Development', 5),
('JavaScript & DOM Manipulation', 'Client-side programming with JS', 'Web Development', 5),
('React.js Framework', 'Modern web applications with React', 'Web Development', 5),
('SQL Database Design', 'Database design and normalization', 'Database', 6),
('NoSQL with MongoDB', 'Document database with MongoDB', 'Database', 6),
('Redis Caching', 'In-memory caching strategies with Redis', 'Database', 6),
('Network Security Basics', 'Network security fundamentals', 'Cybersecurity', 7),
('Ethical Hacking', 'Penetration testing and vulnerability assessment', 'Cybersecurity', 7),
('Cryptography Fundamentals', 'Encryption, hashing, and security protocols', 'Cybersecurity', 7),
('React Native Basics', 'Cross-platform mobile development', 'Mobile Development', 8),
('iOS Development with Swift', 'Native iOS app development with Swift', 'Mobile Development', 8),
('Android Development', 'Native Android app development', 'Mobile Development', 8);


-- ====================[ TESTS ]========================
-- One test per course
INSERT IGNORE INTO test (titre, description, cours_id) VALUES
('Python Fundamentals Test', 'Test on Python basics', 1),
('Advanced Python Test', 'Test on advanced Python topics', 2),
('Python Data Science Test', 'Test on Python data analysis and ML', 3),
('AWS Cloud Fundamentals Test', 'Test on AWS services', 4),
('Azure Cloud Services Test', 'Test on Azure cloud services', 5),
('GCP Test', 'Test on Google Cloud Platform', 6),
('Docker & Containerization Test', 'Test on Docker basics', 7),
('CI/CD with Jenkins Test', 'Test on Jenkins CI/CD pipelines', 8),
('Kubernetes Orchestration Test', 'Test on Kubernetes basics', 9),
('Data Structures Test', 'Test on arrays and lists', 10),
('Sorting & Searching Test', 'Test on sorting and searching algorithms', 11),
('Graph Algorithms Test', 'Test on graph algorithms', 12),
('HTML & CSS Test', 'Test on HTML & CSS', 13),
('JavaScript & DOM Test', 'Test on JS & DOM manipulation', 14),
('React.js Test', 'Test on React framework', 15),
('SQL Test', 'Test on SQL database design', 16),
('MongoDB Test', 'Test on MongoDB basics', 17),
('Redis Test', 'Test on Redis caching', 18),
('Network Security Test', 'Test on network security basics', 19),
('Ethical Hacking Test', 'Test on ethical hacking techniques', 20),
('Cryptography Test', 'Test on cryptography fundamentals', 21),
('React Native Test', 'Test on React Native basics', 22),
('iOS Swift Test', 'Test on iOS Swift basics', 23),
('Android Test', 'Test on Android development', 24);

-- ====================[ TEST QUESTIONS EXTENDED +5 EACH ]========================
-- Python Fundamentals (test_id: 1)
INSERT IGNORE INTO test_questions (test_id, question, option_a, option_b, option_c, option_d, answer) VALUES
(1, 'Which operator is used for exponentiation?', '**', '^', 'exp()', '%', 'a'),
(1, 'Which keyword is used for loops over a sequence?', 'for', 'loop', 'iterate', 'while', 'a'),
(1, 'Which of these is mutable?', 'Tuple', 'List', 'String', 'Int', 'b'),
(1, 'What is the output of bool(0)?', 'True', 'False', '0', 'None', 'b'),
(1, 'Which function returns the largest number?', 'min()', 'max()', 'top()', 'big()', 'b');

-- Advanced Python (test_id: 2)
INSERT IGNORE INTO test_questions (test_id, question, option_a, option_b, option_c, option_d, answer) VALUES
(2, 'What does the @ symbol represent?', 'Decorator', 'Generator', 'Function call', 'Lambda', 'a'),
(2, 'Which method reads a file line by line?', 'read()', 'readlines()', 'open()', 'file()', 'b'),
(2, 'Which statement creates a generator?', '[]', '{}', '()', 'yield', 'd'),
(2, 'How do you handle exceptions?', 'try-except', 'if-else', 'catch', 'handle', 'a'),
(2, 'What is a lambda function?', 'Anonymous function', 'Class', 'Module', 'Package', 'a');

-- Python Data Science (test_id: 3)
INSERT IGNORE INTO test_questions (test_id, question, option_a, option_b, option_c, option_d, answer) VALUES
(3, 'Which library is used for numerical arrays?', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'b'),
(3, 'Which function creates a DataFrame?', 'DataFrame()', 'Array()', 'Series()', 'Table()', 'a'),
(3, 'Which plot type shows distribution?', 'Scatter', 'Line', 'Histogram', 'Pie', 'c'),
(3, 'What does df.head() return?', 'Last 5 rows', 'First 5 rows', 'All rows', 'Random rows', 'b'),
(3, 'Which method removes NaN values?', 'dropna()', 'fillna()', 'remove()', 'clean()', 'a');

-- AWS Cloud Fundamentals (test_id: 4)
INSERT IGNORE INTO test_questions (test_id, question, option_a, option_b, option_c, option_d, answer) VALUES
(4, 'Which AWS service is used for object storage?', 'EC2', 'S3', 'RDS', 'Lambda', 'b'),
(4, 'What does IAM stand for?', 'Identity Access Management', 'Internet Access Module', 'Internal Application Manager', 'Integrated Account Monitor', 'a'),
(4, 'Which service provides serverless computing?', 'EC2', 'S3', 'RDS', 'Lambda', 'd'),
(4, 'What is an Availability Zone?', 'Data center', 'Geographic region', 'Edge location', 'Content delivery network', 'a'),
(4, 'Which database service is relational?', 'DynamoDB', 'S3', 'RDS', 'Redshift', 'c');

-- Azure Cloud Services (test_id: 5)
INSERT IGNORE INTO test_questions (test_id, question, option_a, option_b, option_c, option_d, answer) VALUES
(5, 'Which Azure service is for virtual machines?', 'App Service', 'Virtual Machines', 'Functions', 'Storage', 'b'),
(5, 'What is Azure Active Directory?', 'Database service', 'Identity service', 'Networking service', 'Storage service', 'b'),
(5, 'Which service offers serverless functions?', 'App Service', 'Virtual Machines', 'Functions', 'Storage', 'c'),
(5, 'What is a Resource Group?', 'Virtual network', 'Container for resources', 'Load balancer', 'Security group', 'b'),
(5, 'Which service provides blob storage?', 'SQL Database', 'Cosmos DB', 'Storage Account', 'Key Vault', 'c');

-- Google Cloud Platform (test_id: 6)
INSERT IGNORE INTO test_questions (test_id, question, option_a, option_b, option_c, option_d, answer) VALUES
(6, 'Which GCP service is for virtual machines?', 'Compute Engine', 'App Engine', 'Cloud Functions', 'Kubernetes Engine', 'a'),
(6, 'What is Google Cloud Storage?', 'Database service', 'Object storage', 'Compute service', 'Networking service', 'b'),
(6, 'Which service provides serverless functions?', 'Compute Engine', 'App Engine', 'Cloud Functions', 'Kubernetes Engine', 'c'),
(6, 'What is BigQuery?', 'Relational database', 'Data warehouse', 'NoSQL database', 'Stream processing', 'b'),
(6, 'Which service manages containers?', 'Compute Engine', 'App Engine', 'Cloud Functions', 'Kubernetes Engine', 'd');

-- Docker & Containerization (test_id: 7)
INSERT IGNORE INTO test_questions (test_id, question, option_a, option_b, option_c, option_d, answer) VALUES
(7, 'What is a Docker image?', 'Running container', 'Template for containers', 'Network configuration', 'Storage volume', 'b'),
(7, 'Which file defines Docker image?', 'docker.conf', 'Dockerfile', 'docker.yaml', 'container.config', 'b'),
(7, 'What is a Docker container?', 'Template for images', 'Running instance of image', 'Network configuration', 'Storage volume', 'b'),
(7, 'Which command builds an image?', 'docker create', 'docker build', 'docker run', 'docker start', 'b'),
(7, 'What is Docker Hub?', 'Local registry', 'Public registry', 'Private network', 'Storage service', 'b');

-- CI/CD with Jenkins (test_id: 8)
INSERT IGNORE INTO test_questions (test_id, question, option_a, option_b, option_c, option_d, answer) VALUES
(8, 'What is Jenkins primarily used for?', 'Containerization', 'CI/CD', 'Monitoring', 'Logging', 'b'),
(8, 'Which file defines Jenkins pipeline?', 'jenkins.xml', 'pipeline.yml', 'Jenkinsfile', 'build.conf', 'c'),
(8, 'What is a Jenkins job?', 'Docker container', 'Task or workflow', 'Network configuration', 'Storage volume', 'b'),
(8, 'Which plugin system does Jenkins use?', 'Modules', 'Extensions', 'Plugins', 'Add-ons', 'c'),
(8, 'What triggers a Jenkins build?', 'Manual start', 'SCM changes', 'Scheduled time', 'All of the above', 'd');

-- Kubernetes Orchestration (test_id: 9)
INSERT IGNORE INTO test_questions (test_id, question, option_a, option_b, option_c, option_d, answer) VALUES
(9, 'What is a Kubernetes pod?', 'Node group', 'Container group', 'Service', 'Namespace', 'b'),
(9, 'Which object manages pods?', 'Service', 'Deployment', 'Namespace', 'ConfigMap', 'b'),
(9, 'What is a Kubernetes service?', 'Container', 'Network endpoint', 'Storage', 'Node', 'b'),
(9, 'Which command-line tool interacts with Kubernetes?', 'kubectl', 'kubectrl', 'kubecli', 'kubernetes', 'a'),
(9, 'What is a Kubernetes node?', 'Container', 'Worker machine', 'Service', 'Namespace', 'b');

-- Data Structures Fundamentals (test_id: 10)
INSERT IGNORE INTO test_questions (test_id, question, option_a, option_b, option_c, option_d, answer) VALUES
(10, 'What is the time complexity of array access?', 'O(1)', 'O(n)', 'O(log n)', 'O(n²)', 'a'),
(10, 'Which data structure uses LIFO?', 'Queue', 'Stack', 'Array', 'LinkedList', 'b'),
(10, 'What is a linked list node?', 'Index', 'Element with data and pointer', 'Sorted element', 'Hashed value', 'b'),
(10, 'Which structure allows duplicates?', 'Set', 'List', 'Map', 'Tree', 'b'),
(10, 'What is the space complexity of an array?', 'O(1)', 'O(n)', 'O(log n)', 'O(n²)', 'b');

-- Sorting & Searching Algorithms (test_id: 11)
INSERT IGNORE INTO test_questions (test_id, question, option_a, option_b, option_c, option_d, answer) VALUES
(11, 'What is the time complexity of bubble sort?', 'O(1)', 'O(n)', 'O(log n)', 'O(n²)', 'd'),
(11, 'Which algorithm uses divide and conquer?', 'Bubble Sort', 'Merge Sort', 'Insertion Sort', 'Selection Sort', 'b'),
(11, 'What is binary search time complexity?', 'O(1)', 'O(n)', 'O(log n)', 'O(n²)', 'c'),
(11, 'Which search works on unsorted data?', 'Binary Search', 'Linear Search', 'Jump Search', 'Interpolation Search', 'b'),
(11, 'What is the best case for quicksort?', 'O(1)', 'O(n)', 'O(log n)', 'O(n log n)', 'd');

-- Graph Algorithms (test_id: 12)
INSERT IGNORE INTO test_questions (test_id, question, option_a, option_b, option_c, option_d, answer) VALUES
(12, 'Which data structure represents graphs?', 'Array', 'LinkedList', 'Adjacency Matrix', 'All of the above', 'd'),
(12, 'What does BFS stand for?', 'Best First Search', 'Breadth First Search', 'Binary First Search', 'Backward First Search', 'b'),
(12, 'Which algorithm finds shortest path?', 'DFS', 'BFS', 'Dijkstra', 'All of the above', 'c'),
(12, 'What is a directed graph edge?', 'Bidirectional', 'One-way', 'Weighted', 'Unweighted', 'b'),
(12, 'Which traversal uses stack?', 'BFS', 'DFS', 'Dijkstra', 'Prim', 'b');

-- HTML & CSS Fundamentals (test_id: 13)
INSERT IGNORE INTO test_questions (test_id, question, option_a, option_b, option_c, option_d, answer) VALUES
(13, 'Which tag defines a hyperlink?', '<link>', '<a>', '<href>', '<url>', 'b'),
(13, 'What does CSS stand for?', 'Computer Style Sheets', 'Creative Style Sheets', 'Cascading Style Sheets', 'Colorful Style Sheets', 'c'),
(13, 'Which property changes text color?', 'color', 'background-color', 'font-color', 'text-color', 'a'),
(13, 'Which tag defines a paragraph?', '<p>', '<para>', '<paragraph>', '<text>', 'a'),
(13, 'What is the correct CSS syntax?', '{property:value;}', '[property:value;]', '(property:value;)', 'property:value;', 'a');

-- JavaScript & DOM Manipulation (test_id: 14)
INSERT IGNORE INTO test_questions (test_id, question, option_a, option_b, option_c, option_d, answer) VALUES
(14, 'Which keyword declares a variable?', 'var', 'let', 'const', 'All of the above', 'd'),
(14, 'What is the DOM?', 'Document Object Model', 'Data Object Model', 'Design Object Method', 'Direct Object Management', 'a'),
(14, 'Which method gets element by ID?', 'getElementById()', 'getElementsByClassName()', 'getElementsByTagName()', 'querySelector()', 'a'),
(14, 'What is an event in JS?', 'Function', 'Action', 'Object', 'Method', 'b'),
(14, 'Which operator compares value and type?', '==', '===', '=', '!=', 'b');

-- React.js Framework (test_id: 15)
INSERT IGNORE INTO test_questions (test_id, question, option_a, option_b, option_c, option_d, answer) VALUES
(15, 'What is JSX?', 'JavaScript XML', 'Java Syntax Extension', 'JSON XML', 'JavaScript Extension', 'a'),
(15, 'Which hook manages state?', 'useEffect', 'useState', 'useContext', 'useReducer', 'b'),
(15, 'What is a React component?', 'HTML element', 'CSS class', 'Reusable UI piece', 'JavaScript function', 'c'),
(15, 'Which method renders component?', 'render()', 'display()', 'show()', 'view()', 'a'),
(15, 'What is the virtual DOM?', 'Real DOM', 'Lightweight copy', 'Physical DOM', 'Browser DOM', 'b');

-- SQL Database Design (test_id: 16)
INSERT IGNORE INTO test_questions (test_id, question, option_a, option_b, option_c, option_d, answer) VALUES
(16, 'What does SQL stand for?', 'Structured Query Language', 'Simple Query Language', 'Standard Query Language', 'System Query Language', 'a'),
(16, 'Which command retrieves data?', 'GET', 'FETCH', 'SELECT', 'RETRIEVE', 'c'),
(16, 'What is a primary key?', 'Unique identifier', 'Foreign key', 'Index', 'Constraint', 'a'),
(16, 'Which clause filters results?', 'SORT', 'FILTER', 'WHERE', 'GROUP', 'c'),
(16, 'What does JOIN combine?', 'Tables', 'Rows', 'Columns', 'Databases', 'a');

-- NoSQL with MongoDB (test_id: 17)
INSERT IGNORE INTO test_questions (test_id, question, option_a, option_b, option_c, option_d, answer) VALUES
(17, 'What type of database is MongoDB?', 'Relational', 'Document', 'Graph', 'Key-Value', 'b'),
(17, 'Which query language does MongoDB use?', 'SQL', 'MongoQL', 'MongoDB Query Language', 'NoSQL', 'c'),
(17, 'What is a MongoDB collection?', 'Table', 'Row', 'Column', 'Database', 'a'),
(17, 'Which command inserts document?', 'ADD', 'INSERT', 'CREATE', 'SAVE', 'b'),
(17, 'What is the _id field?', 'User ID', 'Document ID', 'Collection ID', 'Database ID', 'b');

-- Redis Caching (test_id: 18)
INSERT IGNORE INTO test_questions (test_id, question, option_a, option_b, option_c, option_d, answer) VALUES
(18, 'What type of database is Redis?', 'Relational', 'Document', 'Graph', 'Key-Value', 'd'),
(18, 'What is Redis primarily used for?', 'Storage', 'Caching', 'Backup', 'Analytics', 'b'),
(18, 'Which data type does Redis support?', 'Strings', 'Lists', 'Sets', 'All of the above', 'd'),
(18, 'What does TTL mean in Redis?', 'Time To Live', 'Total Time Limit', 'Temporary Time Lock', 'Time To Leave', 'a'),
(18, 'Which command sets a key?', 'SET', 'PUT', 'STORE', 'SAVE', 'a');

-- Network Security Basics (test_id: 19)
INSERT IGNORE INTO test_questions (test_id, question, option_a, option_b, option_c, option_d, answer) VALUES
(19, 'What is a firewall?', 'Antivirus software', 'Network security system', 'Encryption tool', 'Authentication system', 'b'),
(19, 'Which protocol is secure?', 'HTTP', 'FTP', 'HTTPS', 'Telnet', 'c'),
(19, 'What is encryption?', 'Data compression', 'Data scrambling', 'Data backup', 'Data transfer', 'b'),
(19, 'Which attack targets passwords?', 'DDoS', 'Phishing', 'Brute Force', 'Man-in-the-Middle', 'c'),
(19, 'What is two-factor authentication?', 'One password', 'Two passwords', 'Two verification methods', 'Two user accounts', 'c');

-- Ethical Hacking (test_id: 20)
INSERT IGNORE INTO test_questions (test_id, question, option_a, option_b, option_c, option_d, answer) VALUES
(20, 'What is penetration testing?', 'Malicious hacking', 'Authorized hacking', 'System monitoring', 'Data backup', 'b'),
(20, 'Which tool scans networks?', 'Wireshark', 'Nmap', 'Metasploit', 'Burp Suite', 'b'),
(20, 'What is social engineering?', 'Technical attack', 'Psychological manipulation', 'Network attack', 'System attack', 'b'),
(20, 'Which attack intercepts communication?', 'DDoS', 'Phishing', 'Brute Force', 'Man-in-the-Middle', 'd'),
(20, 'What is vulnerability assessment?', 'Finding weaknesses', 'Exploiting vulnerabilities', 'Fixing bugs', 'Testing software', 'a');

-- Cryptography Fundamentals (test_id: 21)
INSERT IGNORE INTO test_questions (test_id, question, option_a, option_b, option_c, option_d, answer) VALUES
(21, 'What is symmetric encryption?', 'One key', 'Two keys', 'Public key', 'Private key', 'a'),
(21, 'What is hashing used for?', 'Encryption', 'Data integrity', 'Compression', 'Transmission', 'b'),
(21, 'Which algorithm is asymmetric?', 'AES', 'DES', 'RSA', 'Blowfish', 'c'),
(21, 'What is a digital signature?', 'Scanned signature', 'Encrypted hash', 'Digital photo', 'Electronic document', 'b'),
(21, 'What protects data in transit?', 'Antivirus', 'Firewall', 'Encryption', 'Backup', 'c');

-- React Native Basics (test_id: 22)
INSERT IGNORE INTO test_questions (test_id, question, option_a, option_b, option_c, option_d, answer) VALUES
(22, 'What is React Native used for?', 'Web development', 'Mobile development', 'Desktop development', 'Game development', 'b'),
(22, 'Which language is used?', 'Java', 'Swift', 'JavaScript', 'Kotlin', 'c'),
(22, 'What is JSX in React Native?', 'Java XML', 'JavaScript XML', 'JSON XML', 'JavaScript Extension', 'b'),
(22, 'Which component displays text?', '<Text>', '<Label>', '<Input>', '<View>', 'a'),
(22, 'What is StyleSheet used for?', 'Styling components', 'Creating databases', 'Handling events', 'Managing state', 'a');

-- iOS Development with Swift (test_id: 23)
INSERT IGNORE INTO test_questions (test_id, question, option_a, option_b, option_c, option_d, answer) VALUES
(23, 'Which language is used for iOS?', 'Java', 'Kotlin', 'Swift', 'C#', 'c'),
(23, 'What is Xcode?', 'Text editor', 'IDE', 'Compiler', 'Debugger', 'b'),
(23, 'Which file extension for Swift?', '.swift', '.ios', '.apple', '.mobile', 'a'),
(23, 'What is a ViewController?', 'Data model', 'UI controller', 'Network manager', 'Database handler', 'b'),
(23, 'Which company developed Swift?', 'Google', 'Microsoft', 'Apple', 'Facebook', 'c');

-- Android Development (test_id: 24)
INSERT IGNORE INTO test_questions (test_id, question, option_a, option_b, option_c, option_d, answer) VALUES
(24, 'Which language is used for Android?', 'Swift', 'Kotlin', 'JavaScript', 'C++', 'b'),
(24, 'What is Android Studio?', 'Text editor', 'IDE', 'Compiler', 'Debugger', 'b'),
(24, 'Which file format for layouts?', '.xml', '.layout', '.ui', '.design', 'a'),
(24, 'What is an Activity in Android?', 'Background service', 'UI screen', 'Database', 'Network manager', 'b'),
(24, 'Which company developed Android?', 'Apple', 'Microsoft', 'Google', 'Samsung', 'c');

-- ====================[ SAMPLE USERS ]========================
INSERT IGNORE INTO users (username, email, password, role) VALUES
('admin_user', 'admin@school.com', '$2b$10$rVHMO/JrxDMM6QlDyzo7kOjBv.LvgF.hy.B11HGM5Ea6PXCsP2kW2', 'admin'),
('teacher_user', 'teacher@school.com', '$2b$10$rVHMO/JrxDMM6QlDyzo7kOjBv.LvgF.hy.B11HGM5Ea6PXCsP2kW2', 'enseignant'),
('student_one', 'student1@school.com', '$2b$10$rVHMO/JrxDMM6QlDyzo7kOjBv.LvgF.hy.B11HGM5Ea6PXCsP2kW2', 'etudiant'),
('student_two', 'student2@school.com', '$2b$10$rVHMO/JrxDMM6QlDyzo7kOjBv.LvgF.hy.B11HGM5Ea6PXCsP2kW2', 'etudiant'),
('student_three', 'student3@school.com', '$2b$10$rVHMO/JrxDMM6QlDyzo7kOjBv.LvgF.hy.B11HGM5Ea6PXCsP2kW2', 'etudiant');

-- ====================[ SAMPLE STUDENTS ]========================
INSERT IGNORE INTO etudiants (username, email, classe_id) VALUES
('student_one', 'student1@school.com', 1),
('student_two', 'student2@school.com', 2),
('student_three', 'student3@school.com', 3);

-- ====================[ SAMPLE STUDENT ENROLLMENTS ]========================
INSERT IGNORE INTO student_enrollments (etudiant_id, cours_id, status, progress_percentage) VALUES
-- Student 1 enrolled in several courses
(1, 1, 'in_progress', 25.00),
(1, 2, 'in_progress', 50.00),
(1, 4, 'completed', 100.00),
(1, 7, 'in_progress', 75.00),
(1, 13, 'completed', 100.00),
-- Student 2 enrolled in several courses
(2, 3, 'in_progress', 30.00),
(2, 5, 'completed', 100.00),
(2, 8, 'in_progress', 60.00),
(2, 10, 'completed', 100.00),
(2, 14, 'in_progress', 40.00),
-- Student 3 enrolled in several courses
(3, 6, 'in_progress', 20.00),
(3, 9, 'completed', 100.00),
(3, 11, 'in_progress', 70.00),
(3, 15, 'completed', 100.00),
(3, 17, 'in_progress', 50.00);

-- ====================[ SAMPLE TEST RESULTS ]========================
INSERT IGNORE INTO test_results (etudiant_id, test_id, score, total_questions, correct_answers, responses) VALUES
-- Student 1 test results
(1, 4, 16.00, 5, 4, '[{\"quizId\": 16, \"answer\": \"a\"}, {\"quizId\": 17, \"answer\": \"b\"}, {\"quizId\": 18, \"answer\": \"d\"}, {\"quizId\": 19, \"answer\": \"a\"}, {\"quizId\": 20, \"answer\": \"c\"}]'),
(1, 13, 18.00, 5, 5, '[{\"quizId\": 65, \"answer\": \"b\"}, {\"quizId\": 66, \"answer\": \"a\"}, {\"quizId\": 67, \"answer\": \"b\"}, {\"quizId\": 68, \"answer\": \"b\"}, {\"quizId\": 69, \"answer\": \"a\"}]'),
-- Student 2 test results
(2, 5, 14.00, 5, 3, '[{\"quizId\": 21, \"answer\": \"a\"}, {\"quizId\": 22, \"answer\": \"d\"}, {\"quizId\": 23, \"answer\": \"a\"}, {\"quizId\": 24, \"answer\": \"c\"}, {\"quizId\": 25, \"answer\": \"a\"}]'),
(2, 10, 20.00, 5, 5, '[{\"quizId\": 46, \"answer\": \"a\"}, {\"quizId\": 47, \"answer\": \"b\"}, {\"quizId\": 48, \"answer\": \"c\"}, {\"quizId\": 49, \"answer\": \"c\"}, {\"quizId\": 50, \"answer\": \"a\"}]'),
-- Student 3 test results
(3, 9, 18.00, 5, 4, '[{\"quizId\": 41, \"answer\": \"a\"}, {\"quizId\": 42, \"answer\": \"a\"}, {\"quizId\": 43, \"answer\": \"a\"}, {\"quizId\": 44, \"answer\": \"a\"}, {\"quizId\": 45, \"answer\": \"a\"}]'),
(3, 15, 16.00, 5, 4, '[{\"quizId\": 71, \"answer\": \"d\"}, {\"quizId\": 72, \"answer\": \"c\"}, {\"quizId\": 73, \"answer\": \"a\"}, {\"quizId\": 74, \"answer\": \"a\"}, {\"quizId\": 75, \"answer\": \"c\"}]');

-- ====================[ END FULL FILE ]========================
