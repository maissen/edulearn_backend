# Admin API Documentation

**Base URL:** `http://79.137.34.134:5000`

All admin routes require a valid JWT token with admin role in the Authorization header:

```
Authorization: Bearer <token>
```

---

## Admin User Management Routes

### GET /admin/users
- **Description:** Get all users (admins, teachers, and students) with all their details, categorized in the response
- **Auth:** Required (admin only)
- **Success:** 200 OK
- **Response:**
```json
{
  "admins": [
    {
      "id": "number",
      "username": "string",
      "email": "string",
      "created_at": "string",
      "updated_at": "string"
    }
  ],
  "teachers": [
    {
      "id": "number",
      "username": "string",
      "email": "string",
      "module": "string",
      "biography": "string",
      "isActivated": "boolean",
      "created_at": "string",
      "updated_at": "string"
    }
  ],
  "students": [
    {
      "id": "number",
      "username": "string",
      "email": "string",
      "classe_id": "number",
      "biography": "string",
      "isActivated": "boolean",
      "created_at": "string",
      "updated_at": "string"
    }
  ]
}
```

### GET /admin/statistics
- **Description:** Get system statistics including counts of users, content, and interactions
- **Auth:** Required (admin only)
- **Success:** 200 OK
- **Response:**
```json
{
  "users": {
    "admins": "number",
    "teachers": "number",
    "students": "number"
  },
  "content": {
    "courses": "number",
    "tests": "number",
    "questions": "number",
    "classes": "number"
  },
  "interactions": {
    "forumPosts": "number"
  }
}
```

### GET /admin/teacher-courses
- **Description:** Get all courses of teachers with all details including test numbers, enrolled students, and average test scores
- **Auth:** Required (admin only)
- **Success:** 200 OK
- **Response:**
```json
{
  "teachers": [
    {
      "id": "number",
      "username": "string",
      "email": "string",
      "module": "string",
      "courses": [
        {
          "id": "number",
          "title": "string",
          "description": "string",
          "category": "string",
          "youtube_url": "string",
          "image_url": "string",
          "created_at": "string",
          "updated_at": "string",
          "test": {
            "id": "number",
            "title": "string",
            "description": "string",
            "question_count": "number"
          },
          "enrolled_student_count": "number",
          "average_test_score": "number"
        }
      ]
    }
  ]
}
```

### POST /admin/teachers
- **Description:** Create a new teacher account
- **Auth:** Required (admin)
- **Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "module": "string" // Optional, defaults to "General" if not provided
}
```
- **Success:** 201 Created
- **Response:**
```json
{
  "message": "Teacher account created successfully",
  "teacher": {
    "id": "number",
    "username": "string",
    "email": "string",
    "module": "string",
    "isActivated": "boolean",
    "created_at": "string",
    "updated_at": "string"
  }
}
```

### POST /admin/students
- **Description:** Create a new student account (students are assigned to class ID 1 by default)
- **Auth:** Required (admin)
- **Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```
- **Success:** 201 Created
- **Response:**
```json
{
  "message": "Student account created successfully",
  "student": {
    "id": "number",
    "username": "string",
    "email": "string",
    "classe_id": "number",
    "isActivated": "boolean",
    "created_at": "string",
    "updated_at": "string"
  }
}
```

### DELETE /admin/teachers/:id
- **Description:** Delete a teacher account and all related data (courses, tests, forum posts, etc.)
- **Auth:** Required (admin)
- **Success:** 200 OK
- **Response:**
```json
{
  "message": "Teacher account and all related data deleted successfully"
}
```

### DELETE /admin/students/:id
- **Description:** Delete a student account and all related data (test results, enrollments, forum posts, etc.)
- **Auth:** Required (admin)
- **Success:** 200 OK
- **Response:**
```json
{
  "message": "Student account and all related data deleted successfully"
}
```

### DELETE /admin/courses/:id
- **Description:** Delete a course and all related data (tests, test questions, student enrollments, test results, etc.)
- **Auth:** Required (admin)
- **Success:** 200 OK
- **Response:**
```json
{
  "message": "Course and all related data deleted successfully"
}
```

### PATCH /admin/teachers/:id/activation
- **Description:** Toggle activation status for a teacher
- **Auth:** Required (admin)
- **Body:**
```json
{
  "isActivated": "boolean"
}
```
- **Success:** 200 OK
- **Response:**
```json
{
  "message": "Teacher activated/deactivated successfully",
  "isActivated": "boolean"
}
```

### PATCH /admin/students/:id/activation
- **Description:** Toggle activation status for a student
- **Auth:** Required (admin)
- **Body:**
```json
{
  "isActivated": "boolean"
}
```
- **Success:** 200 OK
- **Response:**
```json
{
  "message": "Student activated/deactivated successfully",
  "isActivated": "boolean"
}
```

## Admin Log Management Routes

### GET /admin/logs
- **Description:** Get recent log entries from the application logs
- **Auth:** Required (admin only)
- **Query Parameters:**
  - `count` (optional): Number of log entries to return (default: 50, max: 1000)
  - `type` (optional): Type of logs to retrieve ('combined' or 'error', default: 'combined')
- **Success:** 200 OK
- **Response:**
```json
{
  "success": true,
  "count": 50,
  "logs": [
    {
      "timestamp": "2025-12-04T14:30:00.000Z",
      "level": "info",
      "message": "User logged in",
      "service": "school-platform-backend",
      "userId": 123
    }
  ]
}
```

### DELETE /admin/logs
- **Description:** Clear all application logs (empties log files)
- **Auth:** Required (admin only)
- **Success:** 200 OK
- **Response:**
```json
{
  "success": true,
  "message": "All logs cleared successfully"
}
```

### GET /admin/logs/export
- **Description:** Export application logs as a CSV file
- **Auth:** Required (admin only)
- **Query Parameters:**
  - `type` (optional): Type of logs to export ('combined' or 'error', default: 'combined')
- **Success:** 200 OK (CSV file download)
- **Response:** Binary CSV file content with columns: Timestamp, Level, Message, Service, Metadata

### GET /admin/log-stats
- **Description:** Get statistics about log files including sizes and modification dates
- **Auth:** Required (admin only)
- **Success:** 200 OK
- **Response:**
```json
{
  "success": true,
  "stats": {
    "combined": {
      "size": 102400,
      "modified": "2025-12-04T14:30:00.000Z"
    },
    "error": {
      "size": 20480,
      "modified": "2025-12-04T14:25:00.000Z"
    }
  }
}
```

## Admin Backup Management Routes

### POST /admin/backup
- **Description:** Create a gzipped SQL backup of the entire database
- **Auth:** Required (admin only)
- **Success:** 200 OK
- **Response:**
```json
{
  "success": true,
  "message": "Backup created successfully",
  "filename": "backup-2025-12-04T14-30-00.000Z.sql.gz",
  "size": 102400,
  "createdAt": "2025-12-04T14:30:00.000Z"
}
```

### GET /admin/backups
- **Description:** List all available database backups
- **Auth:** Required (admin only)
- **Success:** 200 OK
- **Response:**
```json
{
  "success": true,
  "backups": [
    {
      "filename": "backup-2025-12-04T14-30-00.000Z.sql.gz",
      "size": 102400,
      "sizeFormatted": "100 KB",
      "createdAt": "2025-12-04T14:30:00.000Z",
      "modifiedAt": "2025-12-04T14:30:00.000Z"
    }
  ]
}
```

### GET /admin/backups/:filename
- **Description:** Download a specific database backup file
- **Auth:** Required (admin only)
- **Parameters:**
  - `filename`: Name of the backup file to download
- **Success:** 200 OK (file download)
- **Response:** Binary gzip file content

### DELETE /admin/backups/:filename
- **Description:** Delete a specific database backup file
- **Auth:** Required (admin only)
- **Parameters:**
  - `filename`: Name of the backup file to delete
- **Success:** 200 OK
- **Response:**
```json
{
  "success": true,
  "message": "Backup file deleted successfully",
  "filename": "backup-2025-12-04T14-30-00.000Z.sql.gz"
}
```