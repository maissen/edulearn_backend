# API Contract - School Platform

Base URL: `http://79.137.34.134:5000`

## Authentication
Most endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 1. Index Routes

### GET `/`
- **Description**: Health check endpoint
- **Auth**: None
- **Success**: `200 OK`
- **Response**:
```json
{
  "message": "API School Platform Running 🚀"
}
```

---

## 2. Authentication Routes

### POST `/auth/register`
- **Description**: Register a new user
- **Auth**: None
- **Body**:
```json
{
  "fullname": "string",
  "email": "string",
  "password": "string",
  "role": "string (admin|enseignant|etudiant)"
}
```
- **Success**: `200 OK`
- **Response**: User created confirmation

### POST `/auth/login`
- **Description**: Login user
- **Auth**: None
- **Body**:
```json
{
  "email": "string",
  "password": "string"
}
```
- **Success**: `200 OK`
- **Response**:
```json
{
  "token": "string",
  "user": {
    "id": "number",
    "fullname": "string",
    "email": "string",
    "role": "string"
  }
}
```

---

## 3. Profile Routes

### GET `/profile`
- **Description**: Get current user profile
- **Auth**: Required (any role)
- **Success**: `200 OK`
- **Response**:
```json
{
  "id": "number",
  "fullname": "string",
  "email": "string",
  "role": "string"
}
```

---

## 4. Cours Routes

### GET `/cours`
- **Description**: Get all courses
- **Auth**: None
- **Success**: `200 OK`
- **Response**:
```json
[
  {
    "id": "number",
    "titre": "string",
    "description": "string",
    "enseignant_id": "number"
  }
]
```

### GET `/cours/:id`
- **Description**: Get course by ID
- **Auth**: None
- **Success**: `200 OK`
- **Response**:
```json
{
  "id": "number",
  "titre": "string",
  "description": "string",
  "enseignant_id": "number"
}
```

### POST `/cours`
- **Description**: Create a new course
- **Auth**: Required (enseignant or admin)
- **Body**:
```json
{
  "titre": "string",
  "description": "string",
  "enseignant_id": "number"
}
```
- **Success**: `200 OK`
- **Response**:
```json
{
  "message": "Cours ajouté"
}
```

### PUT `/cours/:id`
- **Description**: Update a course
- **Auth**: Required (enseignant or admin)
- **Body**:
```json
{
  "titre": "string",
  "description": "string"
}
```
- **Success**: `200 OK`
- **Response**:
```json
{
  "message": "Cours modifié"
}
```

### DELETE `/cours/:id`
- **Description**: Delete a course
- **Auth**: Required (enseignant or admin)
- **Success**: `200 OK`
- **Response**:
```json
{
  "message": "Cours supprimé"
}
```

---

## 5. Forum Routes

### GET `/forum`
- **Description**: Get all forum posts
- **Auth**: None
- **Success**: `200 OK`
- **Response**:
```json
[
  {
    "id": "number",
    "titre": "string",
    "contenu": "string",
    "user_id": "number",
    "fullname": "string"
  }
]
```

### POST `/forum`
- **Description**: Create a new forum post
- **Auth**: Required (any role)
- **Body**:
```json
{
  "titre": "string",
  "contenu": "string"
}
```
- **Success**: `200 OK`
- **Response**:
```json
{
  "message": "Post ajouté"
}
```

### POST `/forum/:postId/comment`
- **Description**: Add a comment to a post
- **Auth**: Required (any role)
- **Body**:
```json
{
  "contenu": "string"
}
```
- **Success**: `200 OK`
- **Response**:
```json
{
  "message": "Commentaire ajouté"
}
```

---

## 6. Images Routes

### POST `/images`
- **Description**: Upload an image
- **Auth**: None
- **Body**: multipart/form-data with `image` field
- **Success**: `200 OK`
- **Response**:
```json
{
  "message": "Image uploadée",
  "url": "string (uploads/filename)"
}
```

### GET `/images`
- **Description**: Get all uploaded images
- **Auth**: None
- **Success**: `200 OK`
- **Response**:
```json
[
  {
    "id": "number",
    "url": "string"
  }
]
```

---

## 7. Enseignant Routes

### GET `/enseignant`
- **Description**: Get all teachers
- **Auth**: None
- **Success**: `200 OK`
- **Response**:
```json
[
  {
    "id": "number",
    "fullname": "string",
    "email": "string",
    "module": "string"
  }
]
```

### POST `/enseignant`
- **Description**: Add a new teacher
- **Auth**: Required (admin)
- **Body**:
```json
{
  "fullname": "string",
  "email": "string",
  "module": "string"
}
```
- **Success**: `200 OK`
- **Response**:
```json
{
  "message": "Enseignant ajouté"
}
```

### PUT `/enseignant/:id`
- **Description**: Update a teacher
- **Auth**: Required (admin)
- **Body**:
```json
{
  "fullname": "string",
  "email": "string",
  "module": "string"
}
```
- **Success**: `200 OK`
- **Response**:
```json
{
  "message": "Enseignant modifié"
}
```

### DELETE `/enseignant/:id`
- **Description**: Delete a teacher
- **Auth**: Required (admin)
- **Success**: `200 OK`
- **Response**:
```json
{
  "message": "Enseignant supprimé"
}
```

---

## 8. Etudiant Routes

### GET `/etudiant`
- **Description**: Get all students
- **Auth**: None
- **Success**: `200 OK`
- **Response**:
```json
[
  {
    "id": "number",
    "fullname": "string",
    "email": "string",
    "classe_id": "number"
  }
]
```

### POST `/etudiant`
- **Description**: Add a new student
- **Auth**: Required (admin)
- **Body**:
```json
{
  "fullname": "string",
  "email": "string",
  "classe_id": "number"
}
```
- **Success**: `200 OK`
- **Response**:
```json
{
  "message": "Étudiant ajouté"
}
```

### PUT `/etudiant/:id`
- **Description**: Update a student
- **Auth**: Required (admin)
- **Body**:
```json
{
  "fullname": "string",
  "email": "string",
  "classe_id": "number"
}
```
- **Success**: `200 OK`
- **Response**:
```json
{
  "message": "Étudiant modifié"
}
```

### DELETE `/etudiant/:id`
- **Description**: Delete a student
- **Auth**: Required (admin)
- **Success**: `200 OK`
- **Response**:
```json
{
  "message": "Étudiant supprimé"
}
```

---

## 9. Classe Routes

### GET `/classe`
- **Description**: Get all classes
- **Auth**: None
- **Success**: `200 OK`
- **Response**:
```json
[
  {
    "id": "number",
    "nom": "string",
    "niveau": "string"
  }
]
```

### POST `/classe`
- **Description**: Add a new class
- **Auth**: Required (admin)
- **Body**:
```json
{
  "nom": "string",
  "niveau": "string"
}
```
- **Success**: `200 OK`
- **Response**:
```json
{
  "message": "Classe ajoutée"
}
```

### PUT `/classe/:id`
- **Description**: Update a class
- **Auth**: Required (admin)
- **Body**:
```json
{
  "nom": "string",
  "niveau": "string"
}
```
- **Success**: `200 OK`
- **Response**:
```json
{
  "message": "Classe modifiée"
}
```

### DELETE `/classe/:id`
- **Description**: Delete a class
- **Auth**: Required (admin)
- **Success**: `200 OK`
- **Response**:
```json
{
  "message": "Classe supprimée"
}
```

---

## 10. Examen Routes

### GET `/examen`
- **Description**: Get all exams
- **Auth**: None
- **Success**: `200 OK`
- **Response**:
```json
[
  {
    "id": "number",
    "titre": "string",
    "classe_id": "number",
    "date": "string (datetime)"
  }
]
```

### POST `/examen`
- **Description**: Add a new exam
- **Auth**: Required (enseignant or admin)
- **Body**:
```json
{
  "titre": "string",
  "classe_id": "number",
  "date": "string (datetime)"
}
```
- **Success**: `200 OK`
- **Response**:
```json
{
  "message": "Examen ajouté"
}
```

### PUT `/examen/:id`
- **Description**: Update an exam
- **Auth**: Required (enseignant or admin)
- **Body**:
```json
{
  "titre": "string",
  "classe_id": "number",
  "date": "string (datetime)"
}
```
- **Success**: `200 OK`
- **Response**:
```json
{
  "message": "Examen modifié"
}
```

### DELETE `/examen/:id`
- **Description**: Delete an exam
- **Auth**: Required (enseignant or admin)
- **Success**: `200 OK`
- **Response**:
```json
{
  "message": "Examen supprimé"
}
```

---

## 11. Quiz Routes

### GET `/quiz`
- **Description**: Get all quizzes
- **Auth**: None
- **Success**: `200 OK`
- **Response**:
```json
[
  {
    "id": "number",
    "titre": "string",
    "cours_id": "number"
  }
]
```

### POST `/quiz`
- **Description**: Create a new quiz
- **Auth**: Required (enseignant or admin)
- **Body**:
```json
{
  "titre": "string",
  "cours_id": "number"
}
```
- **Success**: `200 OK`
- **Response**:
```json
{
  "message": "Quiz créé"
}
```

### DELETE `/quiz/:id`
- **Description**: Delete a quiz
- **Auth**: Required (enseignant or admin)
- **Success**: `200 OK`
- **Response**:
```json
{
  "message": "Quiz supprimé"
}
```

---

## 12. Question Routes

### POST `/question`
- **Description**: Add a question to a quiz
- **Auth**: Required (enseignant or admin)
- **Body**:
```json
{
  "quiz_id": "number",
  "question": "string",
  "option_a": "string",
  "option_b": "string",
  "option_c": "string",
  "option_d": "string",
  "correct": "string (a|b|c|d)"
}
```
- **Success**: `200 OK`
- **Response**:
```json
{
  "message": "Question ajoutée"
}
```

### GET `/question/:quizId`
- **Description**: Get all questions for a quiz
- **Auth**: None
- **Success**: `200 OK`
- **Response**:
```json
[
  {
    "id": "number",
    "quiz_id": "number",
    "question": "string",
    "option_a": "string",
    "option_b": "string",
    "option_c": "string",
    "option_d": "string",
    "correct": "string"
  }
]
```

---

## Static Files

### GET `/uploads/:filename`
- **Description**: Access uploaded images
- **Auth**: None
- **Success**: `200 OK`
- **Response**: Image file

---

## Role-Based Access Control

- **Public**: Can access GET endpoints (except profile)
- **Any authenticated user**: Can access profile, create forum posts/comments
- **Admin**: Full access to all endpoints, can manage enseignants, etudiants, and classes
- **Enseignant (Teacher)**: Can create/update/delete cours, examen, quiz, and questions
- **Etudiant (Student)**: Can view content and participate in forums