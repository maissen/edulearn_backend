import { db } from "../../config/db.js";
import { isTeacherOrAdmin } from "../middlewares/roleMiddleware.js";


export const getAllEnseignants = async (req, res) => {
  const [rows] = await db.query("SELECT id, username, email, module FROM enseignants");
  res.json(rows);
};

// Get all tests created by a teacher with student results
export const getTeacherTests = async (req, res) => {
  try {
    const teacherId = req.user.id;
    
    // Get all tests created by this teacher
    const [tests] = await db.query(`
      SELECT 
        t.id as test_id,
        t.titre as test_title,
        t.description as test_description,
        t.created_at as test_created_at,
        t.updated_at as test_updated_at,
        c.id as course_id,
        c.titre as course_title,
        c.description as course_description,
        c.category as course_category
      FROM test t
      JOIN cours c ON t.cours_id = c.id
      WHERE c.enseignant_id = ?
      ORDER BY t.created_at DESC
    `, [teacherId]);
    
    // For each test, get the students who took it and their results
    for (const test of tests) {
      const [students] = await db.query(`
        SELECT 
          tr.etudiant_id,
          e.username as student_username,
          e.email as student_email,
          tr.score,
          tr.total_questions,
          tr.correct_answers,
          tr.submitted_at
        FROM test_results tr
        JOIN etudiants e ON tr.etudiant_id = e.id
        WHERE tr.test_id = ?
        ORDER BY tr.score DESC
      `, [test.test_id]);
      
      test.students = students;
    }
    
    res.json(tests);
  } catch (error) {
    console.error('Erreur lors de la récupération des tests de l\'enseignant:', error);
    res.status(500).json({ error: 'Échec de la récupération des tests de l\'enseignant' });
  }
};

export const addEnseignant = async (req, res) => {
  const { username, email, module } = req.body;

  await db.query(
    "INSERT INTO enseignants(username, email, module) VALUES (?, ?, ?)",
    [username, email, module]
  );

  res.json({ message: "Enseignant ajouté" });
};

export const updateEnseignant = async (req, res) => {
  const { username, email, module } = req.body;

  await db.query(
    "UPDATE enseignants SET username = ?, email = ?, module = ? WHERE id = ?",
    [username, email, module, req.params.id]
  );

  res.json({ message: "Enseignant modifié" });
};

export const deleteEnseignant = async (req, res) => {
  await db.query("DELETE FROM enseignants WHERE id = ?", [req.params.id]);
  res.json({ message: "Enseignant supprimé" });
};