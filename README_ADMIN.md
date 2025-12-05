# Admin Panel Guide

This guide explains how the admin panel and administrative functions work in the EduLearn platform.

## Overview

The admin panel provides comprehensive oversight and management capabilities for the entire platform, allowing administrators to manage users, content, and monitor system activity.

## Key Components

### Controllers
- `src/controllers/adminController.js` - Main admin functionality
- `src/controllers/logController.js` - Log management
- `src/controllers/backupController.js` - Database backup operations

### Routes
- `src/routes/admin.js` - Admin endpoints

### Utilities
- `src/utils/logger.js` - Logging system

## Admin Responsibilities

Administrators can:
1. View all users (students, teachers, admins)
2. Manage user accounts (activate/deactivate)
3. View platform statistics
4. Monitor all courses and content
5. Access system logs
6. Perform database backups

## API Endpoints

### User Management
- `GET /admin/users` - Get all users
- `PATCH /admin/teacher/:id/toggle-activation` - Toggle teacher activation status
- `PATCH /admin/student/:id/toggle-activation` - Toggle student activation status

### Statistics and Monitoring
- `GET /admin/statistics` - Get platform statistics
- `GET /admin/teachers/courses` - Get all teachers with their courses
- `GET /admin/logs` - Get system logs
- `GET /admin/logs/:level` - Get logs filtered by level

### Backup Operations
- `POST /admin/backup` - Create database backup
- `GET /admin/backups` - List available backups
- `GET /admin/backup/:filename` - Download a backup
- `DELETE /admin/backup/:filename` - Delete a backup

## Database Access

Administrators have unrestricted access to all database tables:
- Users (admins, teachers, students)
- Courses and course content
- Tests and questions
- Student enrollments and completions
- Test results
- Forum posts and comments
- System logs

## Logging System

The platform uses Winston for structured logging with:
- Console output for development
- File logging (error.log, combined.log)
- Loki integration for production environments

Log levels:
- error: Critical issues requiring immediate attention
- warn: Potential problems to investigate
- info: General operational information
- debug: Detailed debugging information (development only)

## Backup System

Administrators can create and manage database backups:
- Automated backup scheduling
- Manual backup creation
- Backup file management
- Backup restoration procedures

## Security Considerations

1. Admin endpoints are protected with authentication and role middleware
2. All admin actions are logged for audit purposes
3. Sensitive operations require explicit confirmation
4. Database backups are stored securely
5. Access to logs is restricted to administrators only

## Best Practices

1. Regularly review user accounts and deactivate unused ones
2. Monitor platform statistics for unusual activity
3. Maintain regular database backups
4. Review logs periodically for security issues
5. Document significant administrative actions
6. Ensure proper password policies for admin accounts
7. Limit the number of active administrator accounts