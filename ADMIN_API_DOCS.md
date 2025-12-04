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