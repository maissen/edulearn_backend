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
    console.error('Erreur lors du démarrage du cours:', error);
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
    console.error('Erreur lors de l\'achèvement du cours:', error);
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
        c.youtube_vd_url,
        c.image_url,
        e.username as teacher_username
      FROM student_enrollments se
      JOIN cours c ON se.cours_id = c.id
      JOIN enseignants e ON c.enseignant_id = e.id
      WHERE se.etudiant_id = ? AND se.status = 'in_progress'
      ORDER BY se.updated_at DESC
    `, [etudiantId]);

    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des cours en cours:', error);
    res.status(500).json({ error: 'Échec de la récupération des cours en cours' });
  }
};

export const getCompletedCourses = async (req, res) => {
  try {
    const etudiantId = req.user.id; // From auth middleware

    const [rows] = await db.query(`
      SELECT
        fc.id as finished_course_id,
        fc.completed_at,
        fc.final_grade,
        fc.created_at,
        c.id,
        c.titre,
        c.description,
        c.category,
        c.youtube_vd_url,
        c.image_url,
        e.username as teacher_username
      FROM finished_courses fc
      JOIN cours c ON fc.cours_id = c.id
      JOIN enseignants e ON c.enseignant_id = e.id
      WHERE fc.etudiant_id = ?
      ORDER BY fc.completed_at DESC
    `, [etudiantId]);

    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des cours terminés:', error);
    res.status(500).json({ error: 'Échec de la récupération des cours terminés' });
  }
};

export const checkEnrollmentStatus = async (req, res) => {
  try {
    const etudiantId = req.user.id; // From auth middleware
    const { courseId } = req.params;

    // First check if the course is in finished_courses
    const [finished] = await db.query(`
      SELECT
        fc.id as finished_course_id,
        fc.completed_at
      FROM finished_courses fc
      WHERE fc.etudiant_id = ? AND fc.cours_id = ?
    `, [etudiantId, courseId]);

    if (finished.length > 0) {
      // Course is finished, not just enrolled
      return res.json({
        isEnrolled: false,
        status: 'completed',
        enrollmentId: null,
        finishedCourseId: finished[0].finished_course_id,
        progressPercentage: finished[0].final_grade,
        startedAt: null,
        completedAt: finished[0].completed_at
      });
    }

    // Check if the course is in student_enrollments
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
        finishedCourseId: null,
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
      finishedCourseId: null,
      progressPercentage: enrollment.progress_percentage,
      startedAt: enrollment.started_at,
      completedAt: enrollment.completed_at
    });
  } catch (error) {
    console.error('Erreur lors de la vérification du statut d\'inscription:', error);
    res.status(500).json({ error: 'Échec de la vérification du statut d\'inscription' });
  }
};

export const checkCompletionStatus = async (req, res) => {
  try {
    const etudiantId = req.user.id; // From auth middleware
    const { courseId } = req.params;

    const [rows] = await db.query(`
      SELECT
        fc.id as finished_course_id,
        fc.completed_at
      FROM finished_courses fc
      WHERE fc.etudiant_id = ? AND fc.cours_id = ?
    `, [etudiantId, courseId]);

    res.json({
      hasCompleted: rows.length > 0,
      finishedCourseId: rows.length > 0 ? rows[0].finished_course_id : null,
      completedAt: rows.length > 0 ? rows[0].completed_at : null
    });
  } catch (error) {
    console.error('Erreur lors de la vérification du statut d\'achèvement:', error);
    res.status(500).json({ error: 'Échec de la vérification du statut d\'achèvement' });
  }
};

export const getStudentTestResults = async (req, res) => {
  try {
    const etudiantId = req.user.id;
    const testResults = await TestResult.getStudentTestResults(etudiantId);
    res.json(testResults);
  } catch (error) {
    console.error('Erreur lors de la récupération des résultats des tests de l\'étudiant:', error);
    res.status(500).json({ error: 'Échec de la récupération des résultats des tests' });
  }
};