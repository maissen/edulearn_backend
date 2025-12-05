# Authentication System Guide

This guide explains how the authentication system works in the EduLearn platform.

## Overview

The authentication system supports three user roles:
- **Students** (etudiants)
- **Teachers** (enseignants)
- **Administrators** (admins)

Each role has dedicated registration and login endpoints.

## Key Components

### Controllers
- `src/controllers/authController.js` - Handles all authentication logic
- `src/controllers/profileController.js` - Manages user profiles
- `src/middlewares/authMiddleware.js` - Verifies JWT tokens
- `src/middlewares/roleMiddleware.js` - Checks user roles
- `src/middlewares/activationMiddleware.js` - Ensures accounts are activated

### Models
- `src/models/User.js` - Base user model
- Individual models for each user type in `src/models/`

### Routes
- `src/routes/auth.js` - Authentication endpoints
- `src/routes/profile.js` - Profile management endpoints

## Authentication Flow

1. **Registration**: Users register through role-specific endpoints
2. **Login**: Users authenticate and receive a JWT token
3. **Verification**: Middleware verifies tokens on protected routes
4. **Authorization**: Role middleware ensures proper access control

## API Endpoints

### Student Authentication
- `POST /auth/register/student` - Register a new student
- `POST /auth/login/student` - Login as a student

### Teacher Authentication
- `POST /auth/register/teacher` - Register a new teacher
- `POST /auth/login/teacher` - Login as a teacher

### Admin Authentication
- `POST /auth/register/admin` - Register a new admin
- `POST /auth/login/admin` - Login as an admin

## Token Management

Tokens are JWTs with a 70-day expiration period. They contain:
- User ID
- Email
- Role

Tokens must be included in the `Authorization` header as a Bearer token for protected endpoints.

## Account Activation

Teachers and students have an `isActivated` flag that can be toggled by administrators. Deactivated accounts cannot log in.

## Best Practices

1. Always use the appropriate middleware for route protection
2. Validate tokens before processing requests
3. Handle authentication errors gracefully
4. Log authentication events for security monitoring