import { db } from "../../config/db.js";
import StudentEnrollment from "../../models/StudentEnrollment.js";

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
