import { db } from "../../config/db.js";
import bcrypt from "bcryptjs";

// Get all users (admins, teachers, students) with all details
export const getAllUsers = async (req, res) => {
  try {
    // Fetch all admins
    const [admins] = await db.query("SELECT id, username, email, created_at, updated_at FROM admins");
    
    // Fetch all teachers
    const [teachers] = await db.query("SELECT id, username, email, module, biography, isActivated, created_at, updated_at FROM enseignants");
    
    // Fetch all students
    const [students] = await db.query("SELECT id, username, email, classe_id, biography, isActivated, created_at, updated_at FROM etudiants");
    
    // Return categorized response
    res.json({
      admins: admins,
      teachers: teachers,
      students: students
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Toggle activation status for a teacher
export const toggleTeacherActivation = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActivated } = req.body;

    // Check if teacher exists
    const [teacher] = await db.query("SELECT * FROM enseignants WHERE id = ?", [id]);
    if (teacher.length === 0) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Update activation status
    await db.query("UPDATE enseignants SET isActivated = ? WHERE id = ?", [isActivated, id]);

    res.json({ 
      message: `Teacher ${isActivated ? 'activated' : 'deactivated'} successfully`,
      isActivated: isActivated
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Toggle activation status for a student
export const toggleStudentActivation = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActivated } = req.body;

    // Check if student exists
    const [student] = await db.query("SELECT * FROM etudiants WHERE id = ?", [id]);
    if (student.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Update activation status
    await db.query("UPDATE etudiants SET isActivated = ? WHERE id = ?", [isActivated, id]);

    res.json({ 
      message: `Student ${isActivated ? 'activated' : 'deactivated'} successfully`,
      isActivated: isActivated
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new teacher account
export const createTeacher = async (req, res) => {
  try {
    const { username, email, password, module } = req.body;

    // Check if teacher already exists
    const [existingTeacher] = await db.query("SELECT * FROM enseignants WHERE email = ?", [email]);
    if (existingTeacher.length > 0) {
      return res.status(400).json({ message: "Teacher with this email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new teacher
    const [result] = await db.query(
      "INSERT INTO enseignants (username, email, password, module, isActivated) VALUES (?, ?, ?, ?, ?)",
      [username, email, hashedPassword, module || "General", true]
    );

    // Fetch the newly created teacher
    const [newTeacher] = await db.query(
      "SELECT id, username, email, module, isActivated, created_at, updated_at FROM enseignants WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({ 
      message: "Teacher account created successfully",
      teacher: newTeacher[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new student account
export const createStudent = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if student already exists
    const [existingStudent] = await db.query("SELECT * FROM etudiants WHERE email = ?", [email]);
    if (existingStudent.length > 0) {
      return res.status(400).json({ message: "Student with this email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // For student creation, we'll assign them to the first available class (class ID 1 as default)
    const [result] = await db.query(
      "INSERT INTO etudiants (username, email, password, classe_id, isActivated) VALUES (?, ?, ?, ?, ?)",
      [username, email, hashedPassword, 1, true]
    );

    // Fetch the newly created student
    const [newStudent] = await db.query(
      "SELECT id, username, email, classe_id, isActivated, created_at, updated_at FROM etudiants WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({ 
      message: "Student account created successfully",
      student: newStudent[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a teacher account and all related data
export const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if teacher exists
    const [teacher] = await db.query("SELECT * FROM enseignants WHERE id = ?", [id]);
    if (teacher.length === 0) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Start transaction
    await db.query("START TRANSACTION");

    try {
      // Delete all courses created by this teacher (this will cascade delete tests, test questions, etc.)
      await db.query("DELETE FROM cours WHERE enseignant_id = ?", [id]);
      
      // Delete forum posts by this teacher
      await db.query("DELETE FROM forum WHERE user_id = ? AND user_role = 'enseignant'", [id]);
      
      // Delete comments by this teacher
      await db.query("DELETE FROM comments WHERE user_id = ? AND user_role = 'enseignant'", [id]);
      
      // Finally, delete the teacher account
      await db.query("DELETE FROM enseignants WHERE id = ?", [id]);

      // Commit transaction
      await db.query("COMMIT");

      res.json({ 
        message: "Teacher account and all related data deleted successfully"
      });
    } catch (err) {
      // Rollback transaction in case of error
      await db.query("ROLLBACK");
      throw err;
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a student account and all related data
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if student exists
    const [student] = await db.query("SELECT * FROM etudiants WHERE id = ?", [id]);
    if (student.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Start transaction
    await db.query("START TRANSACTION");

    try {
      // Delete test results for this student
      await db.query("DELETE FROM test_results WHERE etudiant_id = ?", [id]);
      
      // Delete student enrollments
      await db.query("DELETE FROM student_enrollments WHERE etudiant_id = ?", [id]);
      
      // Delete finished courses records
      await db.query("DELETE FROM finished_courses WHERE etudiant_id = ?", [id]);
      
      // Delete forum posts by this student
      await db.query("DELETE FROM forum WHERE user_id = ? AND user_role = 'etudiant'", [id]);
      
      // Delete comments by this student
      await db.query("DELETE FROM comments WHERE user_id = ? AND user_role = 'etudiant'", [id]);
      
      // Finally, delete the student account
      await db.query("DELETE FROM etudiants WHERE id = ?", [id]);

      // Commit transaction
      await db.query("COMMIT");

      res.json({ 
        message: "Student account and all related data deleted successfully"
      });
    } catch (err) {
      // Rollback transaction in case of error
      await db.query("ROLLBACK");
      throw err;
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all courses of teachers with all details
export const getAllTeacherCourses = async (req, res) => {
  try {
    // Get all teachers with their courses
    const query = `
      SELECT 
        e.id as teacher_id,
        e.username as teacher_username,
        e.email as teacher_email,
        e.module as teacher_module,
        c.id as course_id,
        c.titre as course_title,
        c.description as course_description,
        c.category as course_category,
        c.youtube_vd_url,
        c.image_url,
        c.created_at as course_created_at,
        c.updated_at as course_updated_at,
        t.id as test_id,
        t.titre as test_title,
        t.description as test_description,
        COUNT(tq.id) as test_question_count,
        COUNT(DISTINCT se.etudiant_id) as enrolled_student_count,
        AVG(tr.score) as average_test_score
      FROM enseignants e
      LEFT JOIN cours c ON e.id = c.enseignant_id
      LEFT JOIN test t ON c.id = t.cours_id
      LEFT JOIN test_questions tq ON t.id = tq.test_id
      LEFT JOIN student_enrollments se ON c.id = se.cours_id
      LEFT JOIN test_results tr ON t.id = tr.test_id
      GROUP BY e.id, c.id, t.id
      ORDER BY e.id, c.id
    `;

    const [results] = await db.query(query);

    // Organize data by teacher and course
    const teachersData = {};
    
    results.forEach(row => {
      const teacherId = row.teacher_id;
      
      // Initialize teacher data if not exists
      if (!teachersData[teacherId]) {
        teachersData[teacherId] = {
          id: row.teacher_id,
          username: row.teacher_username,
          email: row.teacher_email,
          module: row.teacher_module,
          courses: []
        };
      }
      
      // Add course data if course exists
      if (row.course_id) {
        // Check if course already exists in teacher's courses
        let course = teachersData[teacherId].courses.find(c => c.id === row.course_id);
        
        if (!course) {
          course = {
            id: row.course_id,
            title: row.course_title,
            description: row.course_description,
            category: row.course_category,
            youtube_url: row.youtube_vd_url,
            image_url: row.image_url,
            created_at: row.course_created_at,
            updated_at: row.course_updated_at,
            test: row.test_id ? {
              id: row.test_id,
              title: row.test_title,
              description: row.test_description,
              question_count: row.test_question_count
            } : null,
            enrolled_student_count: row.enrolled_student_count,
            average_test_score: row.average_test_score ? parseFloat(row.average_test_score.toFixed(2)) : null
          };
          teachersData[teacherId].courses.push(course);
        } else {
          // Update enrolled student count and average test score (they might differ per test)
          course.enrolled_student_count = Math.max(course.enrolled_student_count, row.enrolled_student_count);
          if (row.average_test_score && (!course.average_test_score || row.average_test_score > course.average_test_score)) {
            course.average_test_score = parseFloat(row.average_test_score.toFixed(2));
          }
        }
      }
    });

    // Convert to array
    const teachersArray = Object.values(teachersData);

    res.json({
      teachers: teachersArray
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a course and all related data
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if course exists
    const [course] = await db.query("SELECT * FROM cours WHERE id = ?", [id]);
    if (course.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Start transaction
    await db.query("START TRANSACTION");

    try {
      // Delete test results for this course
      await db.query(`
        DELETE tr FROM test_results tr
        JOIN test t ON tr.test_id = t.id
        WHERE t.cours_id = ?
      `, [id]);
      
      // Delete test questions for this course
      await db.query(`
        DELETE tq FROM test_questions tq
        JOIN test t ON tq.test_id = t.id
        WHERE t.cours_id = ?
      `, [id]);
      
      // Delete tests for this course
      await db.query("DELETE FROM test WHERE cours_id = ?", [id]);
      
      // Delete student enrollments for this course
      await db.query("DELETE FROM student_enrollments WHERE cours_id = ?", [id]);
      
      // Delete finished courses records for this course
      await db.query("DELETE FROM finished_courses WHERE cours_id = ?", [id]);
      
      // Finally, delete the course
      await db.query("DELETE FROM cours WHERE id = ?", [id]);

      // Commit transaction
      await db.query("COMMIT");

      res.json({ 
        message: "Course and all related data deleted successfully"
      });
    } catch (err) {
      // Rollback transaction in case of error
      await db.query("ROLLBACK");
      throw err;
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};