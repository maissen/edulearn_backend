# Database Guide

This guide explains the database schema and management practices for the EduLearn platform.

## Overview

The EduLearn platform uses MySQL 8.0 as its primary database, with a normalized schema designed for educational platforms.

## Database Schema

### Core Tables

#### Users
1. **admins** - Platform administrators
2. **enseignants** - Teachers/instructors
3. **etudiants** - Students
4. **classes** - Student classes/groups

#### Content
1. **cours** - Courses created by teachers
2. **test** - Tests associated with courses
3. **test_questions** - Questions for tests
4. **images** - Uploaded images

#### Interactions
1. **student_enrollments** - Tracks student course enrollment
2. **finished_courses** - Records completed courses
3. **test_results** - Stores student test scores
4. **forum** - Forum posts
5. **comments** - Comments on forum posts

### Entity Relationship Diagram

```
admins[1]          enseignants[1]          classes[1]
   |                     |                     |
   |                     |                     |
   |               cours[*] -------------- etudiants[*]
   |                     |                     |
   |                     |                     |
   |                test[1]              student_enrollments[1]
   |                     |                     |
   |           test_questions[*]         finished_courses[0..1]
   |                     |                     |
   |                test_results[*]      forum[*]
   |                                           |
   |                                      comments[*]
   |                                           |
 images[*]                                images[*]

```

### Detailed Table Structures

#### Users Tables

**admins**
- `id` (Primary Key)
- `username` (VARCHAR)
- `email` (VARCHAR, Unique)
- `password` (VARCHAR)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**enseignants**
- `id` (Primary Key)
- `username` (VARCHAR)
- `email` (VARCHAR, Unique)
- `password` (VARCHAR)
- `module` (VARCHAR)
- `biography` (TEXT)
- `isActivated` (BOOLEAN, Default: TRUE)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**etudiants**
- `id` (Primary Key)
- `username` (VARCHAR)
- `email` (VARCHAR, Unique)
- `password` (VARCHAR)
- `classe_id` (Foreign Key to classes)
- `biography` (TEXT)
- `isActivated` (BOOLEAN, Default: TRUE)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**classes**
- `id` (Primary Key)
- `nom` (VARCHAR)
- `niveau` (VARCHAR)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### Content Tables

**cours**
- `id` (Primary Key)
- `titre` (VARCHAR)
- `description` (TEXT)
- `category` (VARCHAR)
- `youtube_vd_url` (VARCHAR)
- `image_url` (VARCHAR)
- `enseignant_id` (Foreign Key to enseignants)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**test**
- `id` (Primary Key)
- `titre` (VARCHAR)
- `description` (TEXT)
- `cours_id` (Foreign Key to cours, Unique)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**test_questions**
- `id` (Primary Key)
- `test_id` (Foreign Key to test)
- `question` (TEXT)
- `option_a` (VARCHAR)
- `option_b` (VARCHAR)
- `option_c` (VARCHAR)
- `option_d` (VARCHAR)
- `answer` (ENUM: 'a', 'b', 'c', 'd')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**images**
- `id` (Primary Key)
- `url` (VARCHAR)
- `created_at` (TIMESTAMP)

#### Interaction Tables

**student_enrollments**
- `id` (Primary Key)
- `etudiant_id` (Foreign Key to etudiants)
- `cours_id` (Foreign Key to cours)
- `status` (ENUM: 'in_progress', 'completed', Default: 'in_progress')
- `progress_percentage` (DECIMAL, Default: 0.00)
- `started_at` (TIMESTAMP)
- `completed_at` (TIMESTAMP, Nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**finished_courses**
- `id` (Primary Key)
- `etudiant_id` (Foreign Key to etudiants)
- `cours_id` (Foreign Key to cours)
- `completed_at` (TIMESTAMP)
- `final_grade` (DECIMAL, Nullable)
- `created_at` (TIMESTAMP)

**test_results**
- `id` (Primary Key)
- `etudiant_id` (Foreign Key to etudiants)
- `test_id` (Foreign Key to test)
- `score` (DECIMAL)
- `total_questions` (INT)
- `correct_answers` (INT)
- `responses` (JSON)
- `submitted_at` (TIMESTAMP)

**forum**
- `id` (Primary Key)
- `titre` (VARCHAR)
- `contenu` (TEXT)
- `user_id` (INT)
- `user_role` (ENUM: 'admin', 'enseignant', 'etudiant')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**comments**
- `id` (Primary Key)
- `contenu` (TEXT)
- `post_id` (Foreign Key to forum)
- `user_id` (INT)
- `user_role` (ENUM: 'admin', 'enseignant', 'etudiant')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Indexes and Constraints

### Primary Keys
All tables have auto-incrementing integer primary keys.

### Foreign Keys
- Cascade deletes and updates where appropriate
- Proper indexing for foreign key columns

### Unique Constraints
- Email addresses in user tables
- One test per course (test.cours_id)
- One enrollment per student-course combination
- One completion record per student-course combination
- One test result per student-test combination (with retake capability)

### Indexes
- Email indexes on user tables for fast lookups
- Foreign key indexes for join performance
- Category indexes on courses
- Created at indexes for sorting

## Migrations

The database schema evolves through migration files in the `migrations/` directory:

1. `001_add_image_url_to_cours.sql` - Added image_url column to cours table
2. `002_add_is_activated_to_users.sql` - Added isActivated column to enseignants and etudiants
3. `003_add_is_activated_default_values.sql` - Ensured proper default values for isActivated
4. `004_remove_unique_constraint_test_results.sql` - Modified test_results to allow retakes

## Initial Data

The `init.sql` file contains:
- Schema definition for all tables
- Sample data for classes, teachers, and courses
- Sample tests with questions for all courses
- Sample users (admin, teacher, students)
- Sample enrollments and test results

## Database Connections

The application uses connection pooling through mysql2 library:
- Configured in `config/db.js`
- Pool settings optimized for concurrent requests
- Automatic connection recovery

## Best Practices

### Schema Design
1. Use appropriate data types for each column
2. Apply proper normalization to reduce redundancy
3. Add indexes for frequently queried columns
4. Use foreign key constraints to maintain data integrity
5. Implement soft deletes where appropriate

### Performance
1. Use prepared statements to prevent SQL injection
2. Implement proper pagination for large datasets
3. Optimize queries with EXPLAIN
4. Monitor slow query logs
5. Use connection pooling for efficient resource usage

### Security
1. Store passwords securely with bcrypt
2. Use parameterized queries
3. Implement proper access controls
4. Regularly backup the database
5. Encrypt sensitive data at rest when necessary

### Maintenance
1. Regularly analyze and optimize tables
2. Monitor database size and growth
3. Implement automated backup strategies
4. Test backup restoration procedures
5. Monitor database performance metrics

## Backup and Recovery

### Backup Strategy
- Daily full backups
- Point-in-time recovery capability
- Automated backup scheduling
- Secure storage of backup files

### Recovery Procedures
1. Identify the point of failure
2. Select appropriate backup file
3. Restore database from backup
4. Apply transaction logs if needed
5. Verify data integrity after restoration

## Monitoring

### Key Metrics
- Connection pool utilization
- Query response times
- Database size and growth rate
- Error rates and failed queries
- Lock contention

### Tools
- Built-in MySQL performance schema
- Custom logging in application code
- Grafana dashboards for visualization
- Alerting for critical metrics