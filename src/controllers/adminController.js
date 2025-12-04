import { db } from "../../config/db.js";
import logger from "../utils/logger.js";
import bcrypt from "bcryptjs";

// Get all users (admins, teachers, students) with all details (admin only)
export const getAllUsers = async (req, res) => {
  try {
    logger.info('Admin requesting all users', { adminId: req.user?.id });
    
    // Get all admins
    const [admins] = await db.query(
      "SELECT id, username, email, created_at, updated_at FROM admins ORDER BY created_at DESC"
    );

    // Get all teachers
    const [teachers] = await db.query(
      "SELECT id, username, email, module, biography, isActivated, created_at, updated_at FROM enseignants ORDER BY created_at DESC"
    );

    // Get all students
    const [students] = await db.query(
      "SELECT id, username, email, classe_id, biography, isActivated, created_at, updated_at FROM etudiants ORDER BY created_at DESC"
    );

    res.json({
      admins,
      teachers,
      students
    });
  } catch (err) {
    logger.error('Error fetching all users', { error: err.message, stack: err.stack, adminId: req.user?.id });
    res.status(500).json({ error: err.message });
  }
};

// Get statistics (counts of admins, teachers, students, tests, etc.)
export const getStatistics = async (req, res) => {
  try {
    logger.info('Admin requesting statistics', { adminId: req.user?.id });
    
    // Get count of admins
    const [adminsCount] = await db.query("SELECT COUNT(*) as count FROM admins");
    
    // Get count of teachers
    const [teachersCount] = await db.query("SELECT COUNT(*) as count FROM enseignants");
    
    // Get count of students
    const [studentsCount] = await db.query("SELECT COUNT(*) as count FROM etudiants");
    
    // Get count of courses
    const [coursesCount] = await db.query("SELECT COUNT(*) as count FROM cours");
    
    // Get count of tests
    const [testsCount] = await db.query("SELECT COUNT(*) as count FROM test");
    
    // Get count of questions
    const [questionsCount] = await db.query("SELECT COUNT(*) as count FROM test_questions");
    
    // Get count of classes
    const [classesCount] = await db.query("SELECT COUNT(*) as count FROM classes");
    
    // Get count of forum posts (handle case where table might not exist)
    let forumPostsCount = [{ count: 0 }];
    try {
      [forumPostsCount] = await db.query("SELECT COUNT(*) as count FROM forum_posts");
    } catch (err) {
      // If forum_posts table doesn't exist, return 0
      logger.warn('forum_posts table not found, returning 0 count', { error: err.message });
    }
    
    res.json({
      users: {
        admins: adminsCount[0].count,
        teachers: teachersCount[0].count,
        students: studentsCount[0].count
      },
      content: {
        courses: coursesCount[0].count,
        tests: testsCount[0].count,
        questions: questionsCount[0].count,
        classes: classesCount[0].count
      },
      interactions: {
        forumPosts: forumPostsCount[0].count
      }
    });
  } catch (err) {
    logger.error('Error fetching statistics', { error: err.message, stack: err.stack, adminId: req.user?.id });
    res.status(500).json({ error: err.message });
  }
};

// Get all courses of teachers with all details (admin only)
export const getAllTeacherCourses = async (req, res) => {
  try {
    logger.info('Admin requesting all teacher courses', { adminId: req.user?.id });
    
    // Get all teachers with their courses
    const [teachers] = await db.query(`
      SELECT 
        e.id,
        e.username,
        e.email,
        e.module,
        e.biography,
        e.isActivated,
        e.created_at,
        e.updated_at
      FROM enseignants e
      ORDER BY e.created_at DESC
    `);
    
    // For each teacher, get their courses with test info
    for (const teacher of teachers) {
      const [courses] = await db.query(`
        SELECT 
          c.id,
          c.titre,
          c.description,
          c.category,
          c.youtube_vd_url,
          c.image_url,
          c.created_at,
          c.updated_at,
          t.id as test_id,
          t.titre as test_title,
          t.description as test_description
        FROM cours c
        LEFT JOIN test t ON c.id = t.cours_id
        WHERE c.enseignant_id = ?
        ORDER BY c.created_at DESC
      `, [teacher.id]);
      
      // For each course, get additional stats
      for (const course of courses) {
        // Get question count for the test
        if (course.test_id) {
          const [questionCount] = await db.query(
            "SELECT COUNT(*) as count FROM test_questions WHERE test_id = ?",
            [course.test_id]
          );
          course.test = {
            id: course.test_id,
            title: course.test_title,
            description: course.test_description,
            question_count: questionCount[0].count
          };
        }
        
        // Get enrolled student count
        const [enrollmentCount] = await db.query(
          "SELECT COUNT(*) as count FROM student_enrollments WHERE cours_id = ?",
          [course.id]
        );
        course.enrolled_student_count = enrollmentCount[0].count;
        
        // Get average test score
        if (course.test_id) {
          const [avgScore] = await db.query(`
            SELECT AVG(score) as average_score 
            FROM test_results 
            WHERE test_id = ?
          `, [course.test_id]);
          
          // Fix the average score calculation
          if (avgScore[0].average_score !== null) {
            course.average_test_score = parseFloat(avgScore[0].average_score);
            if (!isNaN(course.average_test_score)) {
              course.average_test_score = parseFloat(course.average_test_score.toFixed(2));
            }
          } else {
            course.average_test_score = 0;
          }
        }
        
        // Clean up temporary fields
        delete course.test_id;
        delete course.test_title;
        delete course.test_description;
      }
      
      teacher.courses = courses;
    }
    
    res.json({ teachers });
  } catch (err) {
    logger.error('Error fetching teacher courses', { error: err.message, stack: err.stack, adminId: req.user?.id });
    res.status(500).json({ error: err.message });
  }
};

// Toggle teacher activation status (admin only)
export const toggleTeacherActivation = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActivated } = req.body;
    
    logger.info('Admin toggling teacher activation', { teacherId: id, isActivated, adminId: req.user?.id });
    
    const [result] = await db.query(
      "UPDATE enseignants SET isActivated = ? WHERE id = ?",
      [isActivated, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    
    res.json({
      message: `Teacher ${isActivated ? 'activated' : 'deactivated'} successfully`,
      isActivated
    });
  } catch (err) {
    logger.error('Error toggling teacher activation', { error: err.message, stack: err.stack, adminId: req.user?.id });
    res.status(500).json({ error: err.message });
  }
};

// Toggle student activation status (admin only)
export const toggleStudentActivation = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActivated } = req.body;
    
    logger.info('Admin toggling student activation', { studentId: id, isActivated, adminId: req.user?.id });
    
    const [result] = await db.query(
      "UPDATE etudiants SET isActivated = ? WHERE id = ?",
      [isActivated, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    res.json({
      message: `Student ${isActivated ? 'activated' : 'deactivated'} successfully`,
      isActivated
    });
  } catch (err) {
    logger.error('Error toggling student activation', { error: err.message, stack: err.stack, adminId: req.user?.id });
    res.status(500).json({ error: err.message });
  }
};

// Create a new teacher account (admin only)
export const createTeacher = async (req, res) => {
  try {
    const { username, email, password, module = "General" } = req.body;
    
    logger.info('Admin creating teacher account', { email, username, adminId: req.user?.id });
    
    // Check if teacher already exists
    const [existingTeacher] = await db.query(
      "SELECT id FROM enseignants WHERE email = ?",
      [email]
    );
    
    if (existingTeacher.length > 0) {
      return res.status(400).json({ message: "Teacher with this email already exists" });
    }
    
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new teacher
    const [result] = await db.query(
      "INSERT INTO enseignants (username, email, password, module, isActivated) VALUES (?, ?, ?, ?, ?)",
      [username, email, hashedPassword, module, true] // Activate by default
    );
    
    const [newTeacher] = await db.query(
      "SELECT id, username, email, module, isActivated, created_at, updated_at FROM enseignants WHERE id = ?",
      [result.insertId]
    );
    
    res.status(201).json({
      message: "Teacher account created successfully",
      teacher: newTeacher[0]
    });
  } catch (err) {
    logger.error('Error creating teacher account', { error: err.message, stack: err.stack, adminId: req.user?.id });
    res.status(500).json({ error: err.message });
  }
};

// Create a new student account (admin only)
export const createStudent = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    logger.info('Admin creating student account', { email, username, adminId: req.user?.id });
    
    // Check if student already exists
    const [existingStudent] = await db.query(
      "SELECT id FROM etudiants WHERE email = ?",
      [email]
    );
    
    if (existingStudent.length > 0) {
      return res.status(400).json({ message: "Student with this email already exists" });
    }
    
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new student (assign to class ID 1 by default)
    const [result] = await db.query(
      "INSERT INTO etudiants (username, email, password, classe_id, isActivated) VALUES (?, ?, ?, ?, ?)",
      [username, email, hashedPassword, 1, true] // Assign to class 1 and activate by default
    );
    
    const [newStudent] = await db.query(
      "SELECT id, username, email, classe_id, isActivated, created_at, updated_at FROM etudiants WHERE id = ?",
      [result.insertId]
    );
    
    res.status(201).json({
      message: "Student account created successfully",
      student: newStudent[0]
    });
  } catch (err) {
    logger.error('Error creating student account', { error: err.message, stack: err.stack, adminId: req.user?.id });
    res.status(500).json({ error: err.message });
  }
};

// Create a new admin account (admin only)
export const createAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    logger.info('Admin creating admin account', { email, username, adminId: req.user?.id });
    
    // Check if admin already exists
    const [existingAdmin] = await db.query(
      "SELECT id FROM admins WHERE email = ?",
      [email]
    );
    
    if (existingAdmin.length > 0) {
      return res.status(400).json({ message: "Admin with this email already exists" });
    }
    
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new admin
    const [result] = await db.query(
      "INSERT INTO admins (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );
    
    const [newAdmin] = await db.query(
      "SELECT id, username, email, created_at, updated_at FROM admins WHERE id = ?",
      [result.insertId]
    );
    
    res.status(201).json({
      message: "Admin account created successfully",
      admin: newAdmin[0]
    });
  } catch (err) {
    logger.error('Error creating admin account', { error: err.message, stack: err.stack, adminId: req.user?.id });
    res.status(500).json({ error: err.message });
  }
};

// Delete a teacher account and all related data (admin only)
export const deleteTeacher = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    
    logger.info('Admin deleting teacher account', { teacherId: id, adminId: req.user?.id });
    
    // Check if teacher exists
    const [teacher] = await connection.query("SELECT id FROM enseignants WHERE id = ?", [id]);
    if (teacher.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Teacher not found" });
    }
    
    // Delete teacher's forum posts
    await connection.query("DELETE FROM forum_posts WHERE author_id = ? AND author_type = 'enseignant'", [id]);
    
    // Get teacher's courses
    const [courses] = await connection.query("SELECT id FROM cours WHERE enseignant_id = ?", [id]);
    
    // For each course, delete related data
    for (const course of courses) {
      // Get course tests
      const [tests] = await connection.query("SELECT id FROM test WHERE cours_id = ?", [course.id]);
      
      // For each test, delete related data
      for (const test of tests) {
        // Delete test results
        await connection.query("DELETE FROM test_results WHERE test_id = ?", [test.id]);
        
        // Delete test questions
        await connection.query("DELETE FROM test_questions WHERE test_id = ?", [test.id]);
      }
      
      // Delete tests
      await connection.query("DELETE FROM test WHERE cours_id = ?", [course.id]);
      
      // Delete student enrollments
      await connection.query("DELETE FROM student_enrollments WHERE cours_id = ?", [course.id]);
      
      // Delete course completions
      await connection.query("DELETE FROM finished_courses WHERE cours_id = ?", [course.id]);
    }
    
    // Delete courses
    await connection.query("DELETE FROM cours WHERE enseignant_id = ?", [id]);
    
    // Delete teacher account
    await connection.query("DELETE FROM enseignants WHERE id = ?", [id]);
    
    await connection.commit();
    
    res.json({ message: "Teacher account and all related data deleted successfully" });
  } catch (err) {
    await connection.rollback();
    logger.error('Error deleting teacher account', { error: err.message, stack: err.stack, adminId: req.user?.id });
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
};

// Delete a student account and all related data (admin only)
export const deleteStudent = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    
    logger.info('Admin deleting student account', { studentId: id, adminId: req.user?.id });
    
    // Check if student exists
    const [student] = await connection.query("SELECT id FROM etudiants WHERE id = ?", [id]);
    if (student.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Student not found" });
    }
    
    // Delete student's forum posts
    await connection.query("DELETE FROM forum_posts WHERE author_id = ? AND author_type = 'etudiant'", [id]);
    
    // Delete test results
    await connection.query("DELETE FROM test_results WHERE etudiant_id = ?", [id]);
    
    // Delete student enrollments
    await connection.query("DELETE FROM student_enrollments WHERE etudiant_id = ?", [id]);
    
    // Delete course completions
    await connection.query("DELETE FROM finished_courses WHERE etudiant_id = ?", [id]);
    
    // Delete student account
    await connection.query("DELETE FROM etudiants WHERE id = ?", [id]);
    
    await connection.commit();
    
    res.json({ message: "Student account and all related data deleted successfully" });
  } catch (err) {
    await connection.rollback();
    logger.error('Error deleting student account', { error: err.message, stack: err.stack, adminId: req.user?.id });
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
};

// Delete a course and all related data (admin only)
export const deleteCourse = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    
    logger.info('Admin deleting course', { courseId: id, adminId: req.user?.id });
    
    // Check if course exists
    const [course] = await connection.query("SELECT id FROM cours WHERE id = ?", [id]);
    if (course.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Course not found" });
    }
    
    // Get course tests
    const [tests] = await connection.query("SELECT id FROM test WHERE cours_id = ?", [id]);
    
    // For each test, delete related data
    for (const test of tests) {
      // Delete test results
      await connection.query("DELETE FROM test_results WHERE test_id = ?", [test.id]);
      
      // Delete test questions
      await connection.query("DELETE FROM test_questions WHERE test_id = ?", [test.id]);
    }
    
    // Delete tests
    await connection.query("DELETE FROM test WHERE cours_id = ?", [id]);
    
    // Delete student enrollments
    await connection.query("DELETE FROM student_enrollments WHERE cours_id = ?", [id]);
    
    // Delete course completions
    await connection.query("DELETE FROM finished_courses WHERE cours_id = ?", [id]);
    
    // Delete course
    await connection.query("DELETE FROM cours WHERE id = ?", [id]);
    
    await connection.commit();
    
    res.json({ message: "Course and all related data deleted successfully" });
  } catch (err) {
    await connection.rollback();
    logger.error('Error deleting course', { error: err.message, stack: err.stack, adminId: req.user?.id });
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
};