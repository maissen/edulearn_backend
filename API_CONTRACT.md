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
  "biography": "string",
  "coursesInProgress": "number",
  "coursesCompleted": "number"
}
```
- **Note:** For students (`role: "etudiant"`), `coursesInProgress` and `coursesCompleted` show actual enrollment counts. For other roles (teachers, admins), these values are 0.

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
    "category": "string",
    "enseignant_id": "number"
  }
]
```

### GET /cours/categories
- **Description:** Get all unique course categories
- **Auth:** None
- **Success:** 200 OK
- **Response:**
```json
[
  "Mathematics",
  "Literature",
  "Science",
  "History"
]
```

### GET /cours/grouped-by-category
- **Description:** Get all courses grouped by their categories with enrollment statistics
- **Auth:** None
- **Success:** 200 OK
- **Response:**
```json
{
  "Python": {
    "courses": [
      {
        "id": "number",
        "titre": "string",
        "description": "string",
        "enseignant_id": "number",
        "teacher_username": "string",
        "teacher_email": "string"
      }
    ],
    "enrolledStudents": "number"
  },
  "Cloud Computing": {
    "courses": [
      {
        "id": "number",
        "titre": "string",
        "description": "string",
        "enseignant_id": "number",
        "teacher_username": "string",
        "teacher_email": "string"
      }
    ],
    "enrolledStudents": "number"
  }
}
```
- **Note:** `enrolledStudents` counts all distinct students who have enrolled in any course within that category, including those who have completed the courses.

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
  "category": "string",
  "enseignant_id": "number",
  "imageUrl": "string",
  "duration": "string",
  "videoUrl": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

### GET /cours/:id/content
- **Description:** Get complete course content including course details and all quizzes as a single test object
- **Auth:** None
- **Success:** 200 OK
- **Response:**
```json
{
  "id": "number",
  "titre": "string",
  "description": "string",
  "category": "string",
  "enseignant_id": "number",
  "teacher_username": "string",
  "teacher_email": "string",
  "test": {
    "title": "string",          // e.g., "Python quizzes test"
    "id": "number",             // Same as course id
    "cours_id": "number",
    "quizzes": [
      {
        "id": "number",         // Question ID (used for submissions)
        "question": "string",   // The actual question text
        "options": {
          "a": "string",
          "b": "string",
          "c": "string",
          "d": "string"
        }
      }
    ]
  }
}
```
- **Error:** 404 Not Found if course doesn't exist
- **Note:** All quizzes for the course are combined into a single test object. The test title is generated as "{Category} quizzes test".

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
  "category": "string",
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
  "description": "string",
  "category": "string"
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

### GET /etudiant/courses/in-progress
- **Description:** Get all courses currently in progress for the authenticated student
- **Auth:** Required (etudiant only)
- **Success:** 200 OK
- **Response:**
```json
[
  {
    "enrollment_id": "number",
    "progress_percentage": "number",
    "started_at": "string",
    "updated_at": "string",
    "id": "number",
    "titre": "string",
    "description": "string",
    "category": "string",
    "teacher_username": "string"
  }
]
```

### GET /etudiant/courses/completed
- **Description:** Get all completed courses for the authenticated student
- **Auth:** Required (etudiant only)
- **Success:** 200 OK
- **Response:**
```json
[
  {
    "enrollment_id": "number",
    "progress_percentage": "number",
    "started_at": "string",
    "completed_at": "string",
    "updated_at": "string",
    "id": "number",
    "titre": "string",
    "description": "string",
    "category": "string",
    "teacher_username": "string"
  }
]
```

### GET /etudiant/quiz-results
- **Description:** Get all quiz results for the authenticated student including scores and course information
- **Auth:** Required (etudiant only)
- **Success:** 200 OK
- **Response:**
```json
[
  {
    "id": "number",
    "etudiant_id": "number",
    "quiz_id": "number",
    "score": "number",
    "total_questions": "number",
    "correct_answers": "number",
    "submitted_at": "string",
    "quiz_title": "string",
    "course_title": "string",
    "course_category": "string"
  }
]
```

### GET /etudiant/is-enrolled/:courseId
- **Description:** Check if the authenticated student is enrolled in a specific course
- **Auth:** Required (etudiant only)
- **Success:** 200 OK
- **Response:**
```json
{
  "isEnrolled": "boolean",
  "status": "string", // "in_progress" or "completed" or null
  "enrollmentId": "number", // null if not enrolled
  "progressPercentage": "number",
  "startedAt": "string", // ISO date string or null
  "completedAt": "string" // ISO date string or null
}
```

### GET /etudiant/has-completed/:courseId
- **Description:** Check if the authenticated student has completed a specific course
- **Auth:** Required (etudiant only)
- **Success:** 200 OK
- **Response:**
```json
{
  "hasCompleted": "boolean",
  "enrollmentId": "number", // null if not completed
  "completedAt": "string" // ISO date string or null
}
```

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
- **Description:** Get all quizzes for a specific course (each quiz is a single question with 4 answer options)
- **Auth:** None
- **Success:** 200 OK
- **Response:**
```json
[
  {
    "id": "number",
    "titre": "string",        // Quiz title (e.g., "Python Test 1")
    "cours_id": "number",
    "question": "string",     // The actual question text
    "options": {
      "a": "string",
      "b": "string",
      "c": "string",
      "d": "string"
    }
  }
]
```
- **Note:** Each "quiz" is a single question with 4 multiple-choice options. The correct answers are not included in the response for security reasons - they're only used server-side during quiz submission and scoring.

### POST /quiz
- **Description:** Create a new quiz with questions (only the teacher who owns the course can create quizzes for their courses)
- **Auth:** Required (enseignant only - must own the course)
- **Body:**
```json
{
  "titre": "string",
  "cours_id": "number",
  "questions": [
    {
      "question": "string",
      "option_a": "string",
      "option_b": "string",
      "option_c": "string",
      "option_d": "string",
      "correct": "string (a|b|c|d)"
    }
  ]
}
```
- **Success:** 200 OK
- **Response:**
```json
{
  "message": "Quiz created with questions",
  "quizId": "number",
  "questionsCount": "number"
}
```
- **Error:** 400 Bad Request if required fields are missing or question format is invalid
- **Error:** 403 Forbidden if teacher doesn't own the course
- **Error:** 404 Not Found if course doesn't exist
- **Note:** All fields (titre, cours_id, questions) are required. Questions array must be non-empty. All questions are validated and created atomically with the quiz.

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

### POST /quiz/submit
- **Description:** Submit quiz responses and calculate scores (supports both single quiz and batch submissions)
- **Auth:** Required (etudiant only)
- **Body (Single Quiz - Backward Compatible):**
```json
{
  "quizId": "number",
  "responses": {
    "questionId1": "a",
    "questionId2": "b",
    "questionId3": "c"
  }
}
```
- **Body (Batch Submission - Multiple Quizzes):**
```json
{
  "submissions": [
    {
      "quizId": "number",
      "responses": {
        "questionId1": "a",
        "questionId2": "b"
      }
    },
    {
      "quizId": "number",
      "responses": {
        "questionId1": "c",
        "questionId2": "a"
      }
    }
  ]
}
```
- **Success:** 200 OK (all successful), 207 Multi-Status (partial success)
- **Response (Single Quiz):**
```json
{
  "message": "Quiz submitted successfully",
  "result": {
    "id": "number",
    "score": "number",
    "totalQuestions": "number",
    "correctAnswers": "number",
    "maxScore": "number",
    "pointsPerQuestion": "number"
  }
}
```
- **Response (Batch Submission):**
```json
{
  "message": "Processed X quiz submission(s)",
  "successful": "number",
  "failed": "number",
  "results": [
    {
      "quizId": "number",
      "result": {
        "id": "number",
        "score": "number",
        "totalQuestions": "number",
        "correctAnswers": "number",
        "maxScore": "number",
        "pointsPerQuestion": "number"
      }
    }
  ],
  "errors": [
    {
      "index": "number",
      "quizId": "number",
      "error": "string"
    }
  ]
}
```
- **Error:** 400 Bad Request if request format is invalid
- **Error:** 409 Conflict if student has already submitted a quiz (individual errors in batch)
- **Error:** 404 Not Found if quiz has no questions (individual errors in batch)
- **Note:** Students can only submit each quiz once. Score is calculated as (correct_answers × points_per_question) where points_per_question = 20 ÷ total_questions.

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

