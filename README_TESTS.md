# Test Management Guide

This guide explains how the test and assessment system works in the EduLearn platform.

## Overview

The test system allows teachers to create assessments for their courses and students to take tests to demonstrate their knowledge.

## Key Components

### Controllers
- `src/controllers/examenController.js` - Exam management
- `src/controllers/quizController.js` - Quiz/test functionality
- `src/controllers/questionController.js` - Question management

### Models
- `src/models/Examen.js` - Exam model
- `src/models/Quiz.js` - Quiz model
- `src/models/Question.js` - Question model
- `src/models/QuizResult.js` - Test results tracking

### Routes
- `src/routes/examen.js` - Exam-related endpoints
- `src/routes/quiz.js` - Quiz/test endpoints
- `src/routes/question.js` - Question endpoints

## Test Structure

Each course can have one associated test with:
- Title and description
- Multiple choice questions (4 options each)
- Correct answers stored as 'a', 'b', 'c', or 'd'

## Test Results System

Student test results are stored in the `test_results` table with:
- Student ID
- Test ID
- Score (out of 20)
- Total questions
- Number of correct answers
- JSON array of student responses
- Submission timestamp

Students can retake tests until they achieve a passing score (>12).

## API Endpoints

### Test Creation (Teacher)
- `POST /examen` - Create a new exam
- `POST /question` - Add questions to an exam
- `PUT /question/:id` - Update a question
- `DELETE /question/:id` - Delete a question

### Test Taking (Student)
- `GET /quiz/:courseId` - Get test for a specific course
- `POST /test/submit` - Submit test answers
- `GET /quiz/results/:testId` - Get own test results
- `GET /quiz/results/student/:studentId` - Get all test results for a student

### Test Review (Teacher/Admin)
- `GET /examen/course/:courseId` - Get exam for a course
- `GET /quiz/results/all/:testId` - Get all results for a test

## Database Schema

### Tests Table (`test`)
- `id` - Primary key
- `titre` - Test title
- `description` - Test description
- `cours_id` - Foreign key to course

### Questions Table (`test_questions`)
- `id` - Primary key
- `test_id` - Foreign key to test
- `question` - Question text
- `option_a` - First choice
- `option_b` - Second choice
- `option_c` - Third choice
- `option_d` - Fourth choice
- `answer` - Correct answer ('a', 'b', 'c', or 'd')

### Test Results (`test_results`)
- `id` - Primary key
- `etudiant_id` - Foreign key to student
- `test_id` - Foreign key to test
- `score` - Student's score (decimal)
- `total_questions` - Number of questions
- `correct_answers` - Number of correct answers
- `responses` - JSON array of student responses
- `submitted_at` - Submission timestamp

## Test Scoring

Tests are automatically scored based on the number of correct answers:
- Each question is worth equal points
- Maximum score is 20 points
- Passing score is >12 points
- Students can retake tests until they pass

## Best Practices

1. Ensure all questions have exactly one correct answer
2. Validate test data before saving
3. Implement proper access controls for test creation/modification
4. Sanitize user input for question text and options
5. Log test activities for security monitoring
6. Handle test submissions atomically to prevent data corruption
7. Use transactions when updating test results