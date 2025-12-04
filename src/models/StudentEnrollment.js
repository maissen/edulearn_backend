import { db } from "../../config/db.js";

export default class StudentEnrollment {
  // Add a course to student's in-progress list
  static async enrollStudent(etudiantId, coursId) {
    // First check if enrollment already exists
    const [existing] = await db.query(
      "SELECT id, status FROM student_enrollments WHERE etudiant_id = ? AND cours_id = ?",
      [etudiantId, coursId]
    );

    if (existing.length > 0) {
      // If already completed, don't change status
      if (existing[0].status === 'completed') {
        throw new Error('L\'étudiant a déjà terminé ce cours');
      }
      // If in progress, just return success
      return { message: 'L\'étudiant est déjà inscrit à ce cours' };
    }

    // Create new enrollment
    await db.query(
      "INSERT INTO student_enrollments(etudiant_id, cours_id, status, progress_percentage) VALUES (?, ?, 'in_progress', 0)",
      [etudiantId, coursId]
    );

    return { message: 'Cours ajouté à la liste en cours avec succès' };
  }

  // Mark a course as completed
  static async completeCourse(etudiantId, coursId) {
    // Check if enrollment exists and is in progress
    const [existing] = await db.query(
      "SELECT id, status, progress_percentage FROM student_enrollments WHERE etudiant_id = ? AND cours_id = ?",
      [etudiantId, coursId]
    );

    if (existing.length === 0) {
      throw new Error('L\'étudiant n\'est pas inscrit à ce cours');
    }

    if (existing[0].status === 'completed') {
      throw new Error('Le cours est déjà terminé');
    }

    // Get the progress percentage to store in finished_courses
    const progressPercentage = existing[0].progress_percentage;

    // Delete from student_enrollments
    await db.query(
      "DELETE FROM student_enrollments WHERE etudiant_id = ? AND cours_id = ?",
      [etudiantId, coursId]
    );

    // Insert into finished_courses with the final grade based on progress
    await db.query(
      "INSERT INTO finished_courses (etudiant_id, cours_id, final_grade) VALUES (?, ?, ?)",
      [etudiantId, coursId, progressPercentage]
    );

    return { message: 'Cours marqué comme terminé avec succès et déplacé vers les cours terminés' };
  }

  // Get all enrollments for a student
  static async getStudentEnrollments(etudiantId) {
    const [rows] = await db.query(`
      SELECT
        se.*,
        c.titre,
        c.description,
        e.username as teacher_username
      FROM student_enrollments se
      JOIN cours c ON se.cours_id = c.id
      JOIN enseignants e ON c.enseignant_id = e.id
      WHERE se.etudiant_id = ?
      ORDER BY se.updated_at DESC
    `, [etudiantId]);

    return rows;
  }

  // Get enrollment by student and course IDs
  static async getEnrollment(etudiantId, coursId) {
    const [rows] = await db.query(`
      SELECT
        se.*,
        c.titre,
        c.description,
        e.username as teacher_username
      FROM student_enrollments se
      JOIN cours c ON se.cours_id = c.id
      JOIN enseignants e ON c.enseignant_id = e.id
      WHERE se.etudiant_id = ? AND se.cours_id = ?
    `, [etudiantId, coursId]);

    return rows[0];
  }
}