# API Contract - School Platform

**Base URL:** `http://79.137.34.134:5000`

## Authentication

Most endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## 1. Index Routes

### GET /
- **Description:** Health check endpoint
- **Auth:** None
- **Success:** 200 OK
- **Response:**
```json
{
  "message": "API School Platform Running 🚀"
}
```

---

## 2. Authentication Routes

### POST /auth/register/student
- **Description:** Register a new student (creates both user account and student record)
- **Auth:** None
- **Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```
- **Success:** 200 OK
- **Response:**
```json
{
  "message": "Student registered successfully"
}
```
- **Note:** Creates entry in both `users` table (for authentication) and `etudiants` table (with default class_id = 1)

### POST /auth/register/teacher
- **Description:** Register a new teacher (creates both user account and teacher record)
- **Auth:** None
- **Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```
- **Success:** 200 OK
- **Response:**
```json
{
  "message": "Teacher registered successfully"
}
```
- **Note:** Creates entry in both `users` table (for authentication) and `enseignants` table (with default module = "General")

### POST /auth/login/student
- **Description:** Login as a student
- **Auth:** None
- **Body:**
```json
{
  "email": "string",
  "password": "string"
}
```
- **Success:** 200 OK
- **Response:**
```json
{
  "token": "string",
  "expiration_date": "number",
  "user": {
    "id": "number",
    "username": "string",
    "email": "string",
    "role": "string"
  }
}
```
- **Error:** 403 Forbidden if user is not a student

### POST /auth/login/teacher
- **Description:** Login as a teacher
- **Auth:** None
- **Body:**
```json
{
  "email": "string",
  "password": "string"
}
```
- **Success:** 200 OK
- **Response:**
```json
{
  "token": "string",
  "expiration_date": "number",
  "user": {
    "id": "number",
    "username": "string",
    "email": "string",
    "role": "string"
  }
}
```
- **Error:** 403 Forbidden if user is not a teacher

### POST /auth/login/admin
- **Description:** Login as an admin
- **Auth:** None
- **Body:**
```json
{
  "email": "string",
  "password": "string"
}
```
- **Success:** 200 OK
- **Response:**
```json
{
  "token": "string",
  "expiration_date": "number",
  "user": {
    "id": "number",
    "username": "string",
    "email": "string",
    "role": "string"
  }
}
```
- **Error:** 403 Forbidden if user is not an admin

---

## 3. Profile Routes

### GET /profile
- **Description:** Get current user profile
- **Auth:** Required (any role)
- **Success:** 200 OK
- **Response:**
```json
{
  "id": "number",
  "username": "string",
  "email": "string",
  "role": "string",
  "biography": "string"
}
```

### PUT /profile
- **Description:** Update current user profile (username and biography)
- **Auth:** Required (any role)
- **Body:**
```json
{
  "username": "string",
  "biography": "string"
}
```
- **Success:** 200 OK
- **Response:**
```json
{
  "message": "Profile updated successfully"
}
```
- **Error:** 400 Bad Request if both fields are empty or username is already taken
- **Note:** Biography can be set to empty string to clear it, or omitted to leave unchanged

---

## 4. Cours Routes

### GET /cours
- **Description:** Get all courses
- **Auth:** None
- **Success:** 200 OK
- **Response:**
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

### GET /cours/:id
- **Description:** Get course by ID (ENHANCED)
- **Auth:** None
- **Success:** 200 OK
- **Response:**
```json
{
  "id": "number",
  "titre": "string",
  "description": "string",
  "enseignant_id": "number",
  "imageUrl": "string",
  "duration": "string",
  "videoUrl": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

### GET /cours/:id/content
- **Description:** Get full course content including video, duration, and detailed information
- **Auth:** None (or authenticated for enrolled students)
- **Success:** 200 OK
- **Response:**
```json
{
  "id": "number",
  "titre": "string",
  "description": "string",
  "duration": "string",
  "videoUrl": "string",
  "imageUrl": "string",
  "targetAudience": "string",
  "prerequisites": "string",
  "learningObjectives": ["string"],
  "instructor": {
    "name": "string",
    "avatarUrl": "string",
    "bio": "string",
    "rating": "number"
  }
}
```

### GET /cours/:id/related
- **Description:** Get related courses for recommendations
- **Auth:** None
- **Success:** 200 OK
- **Response:**
```json
[
  {
    "id": "number",
    "titre": "string",
    "imageUrl": "string",
    "price": "number",
    "rating": "number",
    "instructor": "string"
  }
]
```

### GET /cours/:id/enrollments
- **Description:** Get enrollment statistics for a course
- **Auth:** Required (enseignant or admin)
- **Success:** 200 OK
- **Response:**
```json
{
  "totalEnrolled": "number",
  "activeStudents": "number",
  "completionRate": "number",
  "averageRating": "number",
  "lastActivity": "string"
}
```

### POST /cours
- **Description:** Create a new course
- **Auth:** Required (enseignant only)
- **Body:**
```json
{
  "titre": "string",
  "description": "string",
  "enseignant_id": "number"
}
```
- **Success:** 200 OK
- **Response:**
```json
{
  "message": "Cours ajouté"
}
```

### PUT /cours/:id
- **Description:** Update a course
- **Auth:** Required (enseignant only - own courses)
- **Body:**
```json
{
  "titre": "string",
  "description": "string"
}
```
- **Success:** 200 OK
- **Response:**
```json
{
  "message": "Cours modifié"
}
```

### DELETE /cours/:id
- **Description:** Delete a course
- **Auth:** Required (enseignant only - own courses)
- **Success:** 200 OK
- **Response:**
```json
{
  "message": "Cours supprimé"
}
```

---

## 5. Forum Routes

### GET /forum
- **Description:** Get all forum posts
- **Auth:** None
- **Success:** 200 OK
- **Response:**
```json
[
  {
    "id": "number",
    "titre": "string",
    "contenu": "string",
    "user_id": "number",
    "username": "string"
  }
]
```

### POST /forum
- **Description:** Create a new forum post
- **Auth:** Required (any role)
- **Body:**
```json
{
  "titre": "string",
  "contenu": "string"
}
```
- **Success:** 200 OK
- **Response:**
```json
{
  "message": "Post ajouté"
}
```

### POST /forum/:postId/comment
- **Description:** Add a comment to a post
- **Auth:** Required (any role)
- **Body:**
```json
{
  "contenu": "string"
}
```
- **Success:** 200 OK
- **Response:**
```json
{
  "message": "Commentaire ajouté"
}
```

---

## 6. Images Routes

### POST /images
- **Description:** Upload an image
- **Auth:** None
- **Body:** multipart/form-data with image field
- **Success:** 200 OK
- **Response:**
```json
{
  "message": "Image uploadée",
  "url": "string (uploads/filename)"
}
```

### GET /images
- **Description:** Get all uploaded images
- **Auth:** None
- **Success:** 200 OK
- **Response:**
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

### GET /enseignant
- **Description:** Get all teachers
- **Auth:** None
- **Success:** 200 OK
- **Response:**
```json
[
  {
    "id": "number",
    "username": "string",
    "email": "string",
    "module": "string"
  }
]
```

### GET /enseignant/stats/:teacherId
- **Description:** Get comprehensive statistics for a specific teacher
- **Auth:** Required (enseignant or admin)
- **Success:** 200 OK
- **Response:**
```json
{
  "totalStudents": "number",
  "successRate": "number",
  "activeCourses": "number",
  "totalCourses": "number",
  "averageRating": "number",
  "satisfactionRate": "number",
  "totalEnrollments": "number"
}
```

### GET /enseignant/:teacherId/courses
- **Description:** Get detailed courses for a specific teacher
- **Auth:** Required (enseignant or admin)
- **Success:** 200 OK
- **Response:**
```json
[
  {
    "id": "number",
    "titre": "string",
    "description": "string",
    "status": "string",
    "enrolledStudents": "number",
    "completionRate": "number",
    "averageRating": "number"
  }
]
```

### POST /enseignant
- **Description:** Add a new teacher
- **Auth:** Required (admin)
- **Body:**
```json
{
  "username": "string",
  "email": "string",
  "module": "string"
}
```
- **Success:** 200 OK
- **Response:**
```json
{
  "message": "Enseignant ajouté"
}
```

### PUT /enseignant/:id
- **Description:** Update a teacher
- **Auth:** Required (admin)
- **Body:**
```json
{
  "username": "string",
  "email": "string",
  "module": "string"
}
```
- **Success:** 200 OK
- **Response:**
```json
{
  "message": "Enseignant modifié"
}
```

### DELETE /enseignant/:id
- **Description:** Delete a teacher
- **Auth:** Required (admin)
- **Success:** 200 OK
- **Response:**
```json
{
  "message": "Enseignant supprimé"
}
```

---

## 8. Etudiant Routes

### GET /etudiant
- **Description:** Get all students
- **Auth:** None
- **Success:** 200 OK
- **Response:**
```json
[
  {
    "id": "number",
    "username": "string",
    "email": "string",
    "classe_id": "number"
  }
]
```

### GET /etudiant/:studentId/stats
- **Description:** Get comprehensive statistics for a specific student
- **Auth:** Required (etudiant or admin)
- **Success:** 200 OK
- **Response:**
```json
{
  "coursesInProgress": "number",
  "completedCourses": "number",
  "overallProgress": "number",
  "averageGrade": "number",
  "totalHoursLearned": "number"
}
```

### GET /etudiant/:studentId/courses
- **Description:** Get detailed course enrollment data for a student
- **Auth:** Required (etudiant or admin)
- **Success:** 200 OK
- **Response:**
```json
{
  "inProgress": [
    {
      "id": "number",
      "titre": "string",
      "category": "string",
      "progress": "number",
      "lastLesson": "string",
      "imageUrl": "string"
    }
  ],
  "completed": [
    {
      "id": "number",
      "titre": "string",
      "category": "string",
      "completionDate": "string",
      "grade": "number",
      "imageUrl": "string"
    }
  ],
  "recommended": [
    {
      "id": "number",
      "titre": "string",
      "category": "string",
      "imageUrl": "string"
    }
  ]
}
```

### POST /etudiant
- **Description:** Add a new student
- **Auth:** Required (admin)
- **Body:**
```json
{
  "username": "string",
  "email": "string",
  "classe_id": "number"
}
```
- **Success:** 200 OK
- **Response:**
```json
{
  "message": "Étudiant ajouté"
}
```

### PUT /etudiant/:id
- **Description:** Update a student
- **Auth:** Required (admin)
- **Body:**
```json
{
  "username": "string",
  "email": "string",
  "classe_id": "number"
}
```
- **Success:** 200 OK
- **Response:**
```json
{
  "message": "Étudiant modifié"
}
```

### DELETE /etudiant/:id
- **Description:** Delete a student
- **Auth:** Required (admin)
- **Success:** 200 OK
- **Response:**
```json
{
  "message": "Étudiant supprimé"
}
```

### POST /etudiant/start-course
- **Description:** Add a course to the student's in-progress courses list
- **Auth:** Required (etudiant only)
- **Body:**
```json
{
  "coursId": "number"
}
```
- **Success:** 200 OK
- **Response:**
```json
{
  "message": "Course added to in-progress list successfully"
}
```
- **Error:** 400 Bad Request if student already enrolled or course doesn't exist

### POST /etudiant/complete-course
- **Description:** Mark an in-progress course as completed and move it to finished courses
- **Auth:** Required (etudiant only)
- **Body:**
```json
{
  "coursId": "number"
}
```
- **Success:** 200 OK
- **Response:**
```json
{
  "message": "Course marked as completed successfully"
}
```
- **Error:** 400 Bad Request if student not enrolled in course or course already completed

---

## 9. Classe Routes

### GET /classe
- **Description:** Get all classes
- **Auth:** None
- **Success:** 200 OK
- **Response:**
```json
[
  {
    "id": "number",
    "nom": "string",
    "niveau": "string"
  }
]
```

### POST /classe
- **Description:** Add a new class
- **Auth:** Required (admin)
- **Body:**
```json
{
  "nom": "string",
  "niveau": "string"
}
```
- **Success:** 200 OK
- **Response:**
```json
{
  "message": "Classe ajoutée"
}
```

### PUT /classe/:id
- **Description:** Update a class
- **Auth:** Required (admin)
- **Body:**
```json
{
  "nom": "string",
  "niveau": "string"
}
```
- **Success:** 200 OK
- **Response:**
```json
{
  "message": "Classe modifiée"
}
```

### DELETE /classe/:id
- **Description:** Delete a class
- **Auth:** Required (admin)
- **Success:** 200 OK
- **Response:**
```json
{
  "message": "Classe supprimée"
}
```

---

## 10. Examen Routes

### GET /examen
- **Description:** Get all exams
- **Auth:** None
- **Success:** 200 OK
- **Response:**
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

### POST /examen
- **Description:** Add a new exam
- **Auth:** Required (enseignant or admin)
- **Body:**
```json
{
  "titre": "string",
  "classe_id": "number",
  "date": "string (datetime)"
}
```
- **Success:** 200 OK
- **Response:**
```json
{
  "message": "Examen ajouté"
}
```

### PUT /examen/:id
- **Description:** Update an exam
- **Auth:** Required (enseignant or admin)
- **Body:**
```json
{
  "titre": "string",
  "classe_id": "number",
  "date": "string (datetime)"
}
```
- **Success:** 200 OK
- **Response:**
```json
{
  "message": "Examen modifié"
}
```

### DELETE /examen/:id
- **Description:** Delete an exam
- **Auth:** Required (enseignant or admin)
- **Success:** 200 OK
- **Response:**
```json
{
  "message": "Examen supprimé"
}
```

---

## 11. Quiz Routes

### GET /quiz
- **Description:** Get all quizzes
- **Auth:** None
- **Success:** 200 OK
- **Response:**
```json
[
  {
    "id": "number",
    "titre": "string",
    "cours_id": "number"
  }
]
```

### GET /quiz/course/:courseId
- **Description:** Get all quizzes for a specific course
- **Auth:** None
- **Success:** 200 OK
- **Response:**
```json
[
  {
    "id": "number",
    "titre": "string",
    "cours_id": "number"
  }
]
```

### POST /quiz
- **Description:** Create a new quiz (only the teacher who owns the course can create quizzes for their courses)
- **Auth:** Required (enseignant only - must own the course)
- **Body:**
```json
{
  "titre": "string",
  "cours_id": "number"
}
```
- **Success:** 200 OK
- **Response:**
```json
{
  "message": "Quiz créé"
}
```
- **Error:** 403 Forbidden if teacher doesn't own the course
- **Error:** 404 Not Found if course doesn't exist

### DELETE /quiz/:id
- **Description:** Delete a quiz (only the teacher who owns the course can delete quizzes from their courses)
- **Auth:** Required (enseignant only - must own the course)
- **Success:** 200 OK
- **Response:**
```json
{
  "message": "Quiz supprimé"
}
```
- **Error:** 403 Forbidden if teacher doesn't own the course
- **Error:** 404 Not Found if quiz doesn't exist

---

## 12. Question Routes

### POST /question
- **Description:** Add a question to a quiz
- **Auth:** Required (enseignant or admin)
- **Body:**
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
- **Success:** 200 OK
- **Response:**
```json
{
  "message": "Question ajoutée"
}
```

### GET /question/:quizId
- **Description:** Get all questions for a quiz
- **Auth:** None
- **Success:** 200 OK
- **Response:**
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

## 13. Admin Routes

### GET /admin/stats
- **Description:** Get overall platform statistics
- **Auth:** Required (admin)
- **Success:** 200 OK
- **Response:**
```json
{
  "totalUsers": "number",
  "totalStudents": "number",
  "totalTeachers": "number",
  "totalCourses": "number",
  "totalEnrollments": "number",
  "averageRating": "number",
  "activeCourses": "number"
}
```

---

## Static Files

### GET /uploads/:filename
- **Description:** Access uploaded images
- **Auth:** None
- **Success:** 200 OK
- **Response:** Image file

---

## Role-Based Access Control

- **Public:** Can access GET endpoints (except profile)
- **Any authenticated user:** Can access profile, create forum posts/comments
- **Admin:** Full access to all endpoints, can manage enseignants, etudiants, and classes
- **Enseignant (Teacher):** Can create/update/delete cours, examen, quiz, and questions
- **Etudiant (Student):** Can view content and participate in forums

