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
        throw new Error('Student has already completed this course');
      }
      // If in progress, just return success
      return { message: 'Student already enrolled in this course' };
    }

    // Create new enrollment
    await db.query(
      "INSERT INTO student_enrollments(etudiant_id, cours_id, status, progress_percentage) VALUES (?, ?, 'in_progress', 0)",
      [etudiantId, coursId]
    );

    return { message: 'Course added to in-progress list successfully' };
  }

  // Mark a course as completed
  static async completeCourse(etudiantId, coursId) {
    // Check if enrollment exists and is in progress
    const [existing] = await db.query(
      "SELECT id, status FROM student_enrollments WHERE etudiant_id = ? AND cours_id = ?",
      [etudiantId, coursId]
    );

    if (existing.length === 0) {
      throw new Error('Student is not enrolled in this course');
    }

    if (existing[0].status === 'completed') {
      throw new Error('Course is already completed');
    }

    // Update enrollment to completed
    await db.query(
      "UPDATE student_enrollments SET status = 'completed', progress_percentage = 100.00, completed_at = NOW() WHERE etudiant_id = ? AND cours_id = ?",
      [etudiantId, coursId]
    );

    return { message: 'Course marked as completed successfully' };
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
