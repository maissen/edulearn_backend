import { db } from "../../config/db.js";

export const getProfile = async (req, res) => {
  try {
    // Determine which table to query based on user role
    let query = "";
    switch (req.user.role) {
      case "admin":
        query = "SELECT id, username, email, 'admin' as role, biography FROM admins WHERE id = ?";
        break;
      case "enseignant":
        query = "SELECT id, username, email, 'enseignant' as role, biography FROM enseignants WHERE id = ?";
        break;
      case "etudiant":
        query = "SELECT id, username, email, 'etudiant' as role, biography FROM etudiants WHERE id = ?";
        break;
      default:
        return res.status(404).json({ message: "User not found" });
    }

    const [rows] = await db.query(query, [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const profile = rows[0];
    let courseStats = {};

    // If user is a student, get course statistics
    if (profile.role === 'etudiant') {
      try {
        // Get count of courses in progress
        const [inProgressResult] = await db.query(`
          SELECT COUNT(*) as count FROM student_enrollments
          WHERE etudiant_id = ? AND status = 'in_progress'
        `, [req.user.id]);

        // Get count of completed courses
        const [completedResult] = await db.query(`
          SELECT COUNT(*) as count FROM student_enrollments
          WHERE etudiant_id = ? AND status = 'completed'
        `, [req.user.id]);

        courseStats = {
          coursesInProgress: inProgressResult[0].count || 0,
          coursesCompleted: completedResult[0].count || 0
        };
      } catch (statsError) {
        console.error('Error fetching course statistics:', statsError);
        // Continue without course stats if there's an error
        courseStats = {
          coursesInProgress: 0,
          coursesCompleted: 0
        };
      }
    } 
    // If user is a teacher, get teacher-specific statistics
    else if (profile.role === 'enseignant') {
      try {
        // Get total number of created courses
        const [coursesCountResult] = await db.query(`
          SELECT COUNT(*) as count FROM cours
          WHERE enseignant_id = ?
        `, [req.user.id]);

        // Get all students enrolled in all courses of this teacher
        const [studentsCountResult] = await db.query(`
          SELECT COUNT(DISTINCT se.etudiant_id) as count 
          FROM student_enrollments se
          JOIN cours c ON se.cours_id = c.id
          WHERE c.enseignant_id = ?
        `, [req.user.id]);

        // Get average score of all tests of this teacher
        const [avgScoreResult] = await db.query(`
          SELECT AVG(tr.score) as avgScore
          FROM test_results tr
          JOIN test t ON tr.test_id = t.id
          JOIN cours c ON t.cours_id = c.id
          WHERE c.enseignant_id = ?
        `, [req.user.id]);

        // Get list of courses created by this teacher with all details
        const [coursesResult] = await db.query(`
          SELECT 
            c.id,
            c.titre,
            c.description,
            c.category,
            c.youtube_vd_url,
            c.created_at,
            c.updated_at,
            COUNT(se.id) as enrolled_students
          FROM cours c
          LEFT JOIN student_enrollments se ON c.id = se.cours_id
          WHERE c.enseignant_id = ?
          GROUP BY c.id, c.titre, c.description, c.category, c.youtube_vd_url, c.created_at, c.updated_at
          ORDER BY c.created_at DESC
        `, [req.user.id]);

        courseStats = {
          totalCoursesCreated: coursesCountResult[0].count || 0,
          totalStudentsEnrolled: studentsCountResult[0].count || 0,
          averageTestScore: avgScoreResult[0].avgScore ? Math.round(avgScoreResult[0].avgScore * 100) / 100 : 0,
          courses: coursesResult
        };
      } catch (statsError) {
        console.error('Error fetching teacher statistics:', statsError);
        // Continue with default stats if there's an error
        courseStats = {
          totalCoursesCreated: 0,
          totalStudentsEnrolled: 0,
          averageTestScore: 0,
          courses: []
        };
      }
    } 
    // For admins, set course counts to 0
    else {
      courseStats = {
        coursesInProgress: 0,
        coursesCompleted: 0
      };
    }

    // Return profile with course statistics
    res.json({
      ...profile,
      ...courseStats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { username, biography } = req.body;

    // Validate input - at least one field must be provided
    if ((!username || username.trim().length === 0) && (!biography || biography.trim().length === 0)) {
      return res.status(400).json({ message: "At least username or biography must be provided" });
    }

    // Check if username is provided and validate it
    if (username) {
      if (username.trim().length === 0) {
        return res.status(400).json({ message: "Username cannot be empty" });
      }

      // Check if username is already taken by another user in the appropriate table
      let existingUserQuery = "";
      switch (req.user.role) {
        case "admin":
          existingUserQuery = "SELECT id FROM admins WHERE username = ? AND id != ?";
          break;
        case "enseignant":
          existingUserQuery = "SELECT id FROM enseignants WHERE username = ? AND id != ?";
          break;
        case "etudiant":
          existingUserQuery = "SELECT id FROM etudiants WHERE username = ? AND id != ?";
          break;
        default:
          return res.status(400).json({ message: "Invalid user role" });
      }

      const [existingUser] = await db.query(existingUserQuery, [username, req.user.id]);

      if (existingUser.length > 0) {
        return res.status(400).json({ message: "Username already taken" });
      }
    }

    // Build dynamic update query based on user role
    let updateFields = [];
    let updateValues = [];
    let updateQuery = "";

    if (username) {
      updateFields.push("username = ?");
      updateValues.push(username);
    }

    if (biography !== undefined) {
      updateFields.push("biography = ?");
      updateValues.push(biography || null); // Allow empty biography to clear it
    }

    updateValues.push(req.user.id);

    // Determine which table to update based on user role
    switch (req.user.role) {
      case "admin":
        updateQuery = `UPDATE admins SET ${updateFields.join(", ")} WHERE id = ?`;
        break;
      case "enseignant":
        updateQuery = `UPDATE enseignants SET ${updateFields.join(", ")} WHERE id = ?`;
        break;
      case "etudiant":
        updateQuery = `UPDATE etudiants SET ${updateFields.join(", ")} WHERE id = ?`;
        break;
      default:
        return res.status(400).json({ message: "Invalid user role" });
    }

    await db.query(updateQuery, updateValues);

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};