# Course Management Guide

This guide explains how the course management system works in the EduLearn platform.

## Overview

The course management system allows teachers to create and manage courses, students to enroll in courses, and administrators to oversee all course content.

## Key Components

### Controllers
- `src/controllers/coursController.js` - Main course management logic
- `src/controllers/enseignantController.js` - Teacher-specific course operations

### Models
- `src/models/Cours.js` - Course model
- `src/models/Enseignant.js` - Teacher model
- `src/models/Etudiant.js` - Student model
- `src/models/StudentEnrollment.js` - Student enrollment tracking

### Routes
- `src/routes/cours.js` - Course-related endpoints

## Course Structure

Each course contains:
- Title and description
- Category (e.g., Python, Cloud Computing, DevOps)
- YouTube video URL for content delivery
- Image URL for course thumbnail
- Associated teacher (foreign key)

## Course Completion System

Students can:
1. Enroll in courses
2. Track progress through `student_enrollments` table
3. Complete courses and receive grades
4. Take associated tests

Completion is tracked in the `finished_courses` table with:
- Completion timestamp
- Final grade

## API Endpoints

### Public Endpoints
- `GET /cours` - Get all courses
- `GET /cours/categories` - Get all course categories
- `GET /cours/grouped` - Get courses grouped by category
- `GET /cours/:id` - Get specific course by ID
- `GET /cours/:id/content` - Get detailed course content

### Teacher Endpoints
- `POST /enseignant/cours` - Create a new course
- `PUT /enseignant/cours/:id` - Update a course
- `DELETE /enseignant/cours/:id` - Delete a course

### Student Endpoints
- `POST /etudiant/enroll/:courseId` - Enroll in a course
- `POST /etudiant/finish/:courseId` - Mark course as completed

## Database Schema

### Courses Table (`cours`)
- `id` - Primary key
- `titre` - Course title
- `description` - Course description
- `category` - Course category
- `youtube_vd_url` - YouTube video URL
- `image_url` - Thumbnail image URL
- `enseignant_id` - Foreign key to teacher

### Student Enrollments (`student_enrollments`)
- `id` - Primary key
- `etudiant_id` - Foreign key to student
- `cours_id` - Foreign key to course
- `status` - Enrollment status (in_progress/completed)
- `progress_percentage` - Progress tracking
- `started_at` - Enrollment timestamp

### Finished Courses (`finished_courses`)
- `id` - Primary key
- `etudiant_id` - Foreign key to student
- `cours_id` - Foreign key to course
- `completed_at` - Completion timestamp
- `final_grade` - Final grade for the course

## Best Practices

1. Always validate course data before saving
2. Ensure proper foreign key relationships
3. Handle file uploads securely for course images
4. Implement proper pagination for course listings
5. Use transactions when updating related course data
6. Log course management activities for audit purposes