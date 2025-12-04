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