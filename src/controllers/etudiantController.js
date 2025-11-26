import { db } from "../../config/db.js";
import StudentEnrollment from "../models/StudentEnrollment.js";
import TestResult from "../models/QuizResult.js"; // unified test result model

export const getAllEtudiants = async (req, res) => {
  const [rows] = await db.query("SELECT id, username, email, classe_id FROM etudiants");
  res.json(rows);
};

export const addEtudiant = async (req, res) => {
  const { username, email, classe_id } = req.body;

  await db.query(
    "INSERT INTO etudiants(username, email, classe_id) VALUES (?, ?, ?)",
    [username, email, classe_id]
  );

  res.json({ message: "Étudiant ajouté" });
};

export const updateEtudiant = async (req, res) => {
  const { username, email, classe_id } = req.body;

  await db.query(
    "UPDATE etudiants SET username = ?, email = ?, classe_id = ? WHERE id = ?",
    [username, email, classe_id, req.params.id]
  );

  res.json({ message: "Étudiant modifié" });
};

export const deleteEtudiant = async (req, res) => {
  await db.query("DELETE FROM etudiants WHERE id = ?", [req.params.id]);
  res.json({ message: "Étudiant supprimé" });
};

// Course enrollment endpoints for students
export const startCourse = async (req, res) => {
  try {
    const { coursId } = req.body;
    const etudiantId = req.user.id; // From auth middleware

    const result = await StudentEnrollment.enrollStudent(etudiantId, coursId);
    res.json(result);
  } catch (error) {
    console.error('Error starting course:', error);
    res.status(400).json({ error: error.message });
  }
};

export const completeCourse = async (req, res) => {
  try {
    const { coursId } = req.body;
    const etudiantId = req.user.id; // From auth middleware

    const result = await StudentEnrollment.completeCourse(etudiantId, coursId);
    res.json(result);
  } catch (error) {
    console.error('Error completing course:', error);
    res.status(400).json({ error: error.message });
  }
};

export const getCoursesInProgress = async (req, res) => {
  try {
    const etudiantId = req.user.id; // From auth middleware

    const [rows] = await db.query(`
      SELECT
        se.id as enrollment_id,
        se.progress_percentage,
        se.started_at,
        se.updated_at,
        c.id,
        c.titre,
        c.description,
        c.category,
        e.username as teacher_username
      FROM student_enrollments se
      JOIN cours c ON se.cours_id = c.id
      JOIN enseignants e ON c.enseignant_id = e.id
      WHERE se.etudiant_id = ? AND se.status = 'in_progress'
      ORDER BY se.updated_at DESC
    `, [etudiantId]);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching courses in progress:', error);
    res.status(500).json({ error: 'Failed to fetch courses in progress' });
  }
};

export const getCompletedCourses = async (req, res) => {
  try {
    const etudiantId = req.user.id; // From auth middleware

    const [rows] = await db.query(`
      SELECT
        se.id as enrollment_id,
        se.progress_percentage,
        se.started_at,
        se.completed_at,
        se.updated_at,
        c.id,
        c.titre,
        c.description,
        c.category,
        e.username as teacher_username
      FROM student_enrollments se
      JOIN cours c ON se.cours_id = c.id
      JOIN enseignants e ON c.enseignant_id = e.id
      WHERE se.etudiant_id = ? AND se.status = 'completed'
      ORDER BY se.completed_at DESC
    `, [etudiantId]);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching completed courses:', error);
    res.status(500).json({ error: 'Failed to fetch completed courses' });
  }
};

export const checkEnrollmentStatus = async (req, res) => {
  try {
    const etudiantId = req.user.id; // From auth middleware
    const { courseId } = req.params;

    const [rows] = await db.query(`
      SELECT
        se.id as enrollment_id,
        se.status,
        se.progress_percentage,
        se.started_at,
        se.completed_at
      FROM student_enrollments se
      WHERE se.etudiant_id = ? AND se.cours_id = ?
    `, [etudiantId, courseId]);

    if (rows.length === 0) {
      return res.json({
        isEnrolled: false,
        status: null,
        enrollmentId: null,
        progressPercentage: 0,
        startedAt: null,
        completedAt: null
      });
    }

    const enrollment = rows[0];
    res.json({
      isEnrolled: true,
      status: enrollment.status,
      enrollmentId: enrollment.enrollment_id,
      progressPercentage: enrollment.progress_percentage,
      startedAt: enrollment.started_at,
      completedAt: enrollment.completed_at
    });
  } catch (error) {
    console.error('Error checking enrollment status:', error);
    res.status(500).json({ error: 'Failed to check enrollment status' });
  }
};

export const checkCompletionStatus = async (req, res) => {
  try {
    const etudiantId = req.user.id; // From auth middleware
    const { courseId } = req.params;

    const [rows] = await db.query(`
      SELECT
        se.id as enrollment_id,
        se.status,
        se.completed_at
      FROM student_enrollments se
      WHERE se.etudiant_id = ? AND se.cours_id = ? AND se.status = 'completed'
    `, [etudiantId, courseId]);

    res.json({
      hasCompleted: rows.length > 0,
      enrollmentId: rows.length > 0 ? rows[0].enrollment_id : null,
      completedAt: rows.length > 0 ? rows[0].completed_at : null
    });
  } catch (error) {
    console.error('Error checking completion status:', error);
    res.status(500).json({ error: 'Failed to check completion status' });
  }
};

export const getStudentTestResults = async (req, res) => {
  try {
    const etudiantId = req.user.id;
    const testResults = await TestResult.getStudentTestResults(etudiantId);
    res.json(testResults);
  } catch (error) {
    console.error('Error fetching student test results:', error);
    res.status(500).json({ error: 'Failed to fetch test results' });
  }
};

export const checkTestResult = async (req, res) => {
  try {
    const etudiantId = req.user.id;
    const { testId } = req.params;

    // Get the test result for this student and test
    const testResult = await TestResult.getResultByStudentAndTest(etudiantId, testId);

    if (!testResult) {
      return res.json({
        hasTakenTest: false,
        message: "Student has not taken this test"
      });
    }

    // Calculate if student passed (assuming passing score is 10 out of 20)
    const hasPassed = testResult.score >= 10;

    res.json({
      hasTakenTest: true,
      hasPassed: hasPassed,
      score: testResult.score,
      totalScore: 20, // Max score is always 20
      correctAnswers: testResult.correct_answers,
      totalQuestions: testResult.total_questions,
      submittedAt: testResult.submitted_at
    });
  } catch (error) {
    console.error('Error checking test result:', error);
    res.status(500).json({ error: 'Failed to check test result' });
  }
};
