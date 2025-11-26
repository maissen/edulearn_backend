import { db } from "../../config/db.js";

export const getAllCours = async (req, res) => {
  const [rows] = await db.query("SELECT id, titre, description, category, enseignant_id FROM cours");
  res.json(rows);
};

export const getCourseCategories = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT DISTINCT category FROM cours WHERE category IS NOT NULL AND category != '' ORDER BY category"
    );
    const categories = rows.map(row => row.category);
    res.json(categories);
  } catch (error) {
    console.error('Error fetching course categories:', error);
    res.status(500).json({ error: 'Failed to fetch course categories' });
  }
};

export const getCoursesGroupedByCategory = async (req, res) => {
  try {
    // First, get enrollment counts per category
    const [enrollmentCounts] = await db.query(`
      SELECT
        c.category,
        COUNT(DISTINCT se.etudiant_id) as enrolled_students
      FROM cours c
      LEFT JOIN student_enrollments se ON c.id = se.cours_id
      WHERE c.category IS NOT NULL AND c.category != ''
      GROUP BY c.category
    `);

    // Create a map of category to enrollment count
    const enrollmentMap = {};
    enrollmentCounts.forEach(row => {
      enrollmentMap[row.category] = row.enrolled_students || 0;
    });

    // Get courses with teacher information
    const [rows] = await db.query(`
      SELECT
        c.id,
        c.titre,
        c.description,
        c.category,
        c.enseignant_id,
        e.username as teacher_username,
        e.email as teacher_email
      FROM cours c
      LEFT JOIN enseignants e ON c.enseignant_id = e.id
      WHERE c.category IS NOT NULL AND c.category != ''
      ORDER BY c.category, c.titre
    `);

    // Group courses by category
    const groupedCourses = {};
    rows.forEach(course => {
      const category = course.category;
      if (!groupedCourses[category]) {
        groupedCourses[category] = {
          courses: [],
          enrolledStudents: enrollmentMap[category] || 0
        };
      }
      // Remove category from individual course object since it's redundant
      const { category: cat, ...courseData } = course;
      groupedCourses[category].courses.push(courseData);
    });

    res.json(groupedCourses);
  } catch (error) {
    console.error('Error fetching courses grouped by category:', error);
    res.status(500).json({ error: 'Failed to fetch courses grouped by category' });
  }
};

export const getCoursById = async (req, res) => {
  const [rows] = await db.query("SELECT id, titre, description, category, enseignant_id FROM cours WHERE id = ?", [req.params.id]);
  res.json(rows[0]);
};

export const getCourseContent = async (req, res) => {
  try {
    const courseId = req.params.id;

    // Get course details with teacher information
    const [courseRows] = await db.query(`
      SELECT
        c.id,
        c.titre,
        c.description,
        c.category,
        c.enseignant_id,
        e.username as teacher_username,
        e.email as teacher_email
      FROM cours c
      LEFT JOIN enseignants e ON c.enseignant_id = e.id
      WHERE c.id = ?
    `, [courseId]);

    if (courseRows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const course = courseRows[0];

    // Check if student has taken the test (if authenticated)
    let hasTakenTest = false;
    let studentScore = null;
    let totalScore = null;
    // Check if user is authenticated and has 'etudiant' role
    if (req.user && req.user.role === 'etudiant') {
      try {
        // First, get the student ID using the email from the token
        const [studentRows] = await db.query(
          "SELECT id FROM etudiants WHERE email = ?",
          [req.user.email]
        );
        
        if (studentRows.length > 0) {
          const studentId = studentRows[0].id;
          
          // Check if there's a test for this course
          const [testRows] = await db.query(
            "SELECT id FROM test WHERE cours_id = ?",
            [courseId]
          );
          
          if (testRows.length > 0) {
            const testId = testRows[0].id;
            
            // Check if student has taken this test and get their score
            const [resultRows] = await db.query(
              "SELECT score, total_questions FROM test_results WHERE etudiant_id = ? AND test_id = ?",
              [studentId, testId]
            );
            
            if (resultRows.length > 0) {
              hasTakenTest = true;
              studentScore = resultRows[0].score;
              totalScore = 20; // Tests are scored out of 20
            }
          }
        }
      } catch (error) {
        console.error('Error checking test completion status:', error);
        // Don't fail the request if we can't determine test status
      }
    }
    // Also check if an authenticated teacher/admin is viewing a student's test results
    // This would require passing a student ID as a query parameter
    else if (req.user && (req.user.role === 'enseignant' || req.user.role === 'admin') && req.query.studentId) {
      try {
        const studentId = req.query.studentId;
        
        // Check if there's a test for this course
        const [testRows] = await db.query(
          "SELECT id FROM test WHERE cours_id = ?",
          [courseId]
        );
        
        if (testRows.length > 0) {
          const testId = testRows[0].id;
          
          // Check if student has taken this test and get their score
          const [resultRows] = await db.query(
            "SELECT score, total_questions FROM test_results WHERE etudiant_id = ? AND test_id = ?",
            [studentId, testId]
          );
          
          if (resultRows.length > 0) {
            hasTakenTest = true;
            studentScore = resultRows[0].score;
            totalScore = 20; // Tests are scored out of 20
          }
        }
      } catch (error) {
        console.error('Error checking test completion status:', error);
        // Don't fail the request if we can't determine test status
      }
    }

    // Get all tests for this course (changed from 'quiz' to 'test')
    const [testRows] = await db.query("SELECT id, titre, cours_id FROM test WHERE cours_id = ?", [courseId]);

    // Get questions for all tests in this course (changed from 'questions' to 'test_questions')
    if (testRows.length > 0) {
      const testIds = testRows.map(test => test.id);
      const placeholders = testIds.map(() => '?').join(',');
      const [questionRows] = await db.query(
        `SELECT id, test_id, question, option_a, option_b, option_c, option_d
         FROM test_questions
         WHERE test_id IN (${placeholders})
         ORDER BY test_id, id`,
        testIds
      );

      // Group questions by test_id
      const questionsByTest = {};
      questionRows.forEach(question => {
        if (!questionsByTest[question.test_id]) {
          questionsByTest[question.test_id] = [];
        }
        questionsByTest[question.test_id].push({
          id: question.id,
          question: question.question,
          options: {
            a: question.option_a,
            b: question.option_b,
            c: question.option_c,
            d: question.option_d
          }
        });
      });

      // Create a single test object containing all questions
      const allQuestions = [];
      testRows.forEach(test => {
        const questions = questionsByTest[test.id] || [];
        questions.forEach(question => {
          allQuestions.push({
            id: question.id,  // Include question ID for submissions
            question: question.question,
            options: question.options
          });
        });
      });

      // Create test object with course info
      course.test = {
        title: `${course.category} quizzes test`,
        id: course.id,
        cours_id: course.id,
        quizzes: allQuestions
      };

      // Add test result fields
      course.test.hasTakenTest = hasTakenTest;
      course.test.studentScore = studentScore;
      course.test.totalScore = totalScore;

      // Remove the old quizzes field
      delete course.quizzes;
    } else {
      course.test = {
        title: `${course.category} quizzes test`,
        id: course.id,
        cours_id: course.id,
        quizzes: [],
        hasTakenTest: hasTakenTest,
        studentScore: studentScore,
        totalScore: totalScore
      };
    }

    res.json(course);

  } catch (error) {
    console.error('Error fetching course content:', error);
    res.status(500).json({ error: 'Failed to fetch course content' });
  }
};

// Get related courses for recommendations
export const getRelatedCourses = async (req, res) => {
  try {
    const courseId = req.params.id;

    // First, get the category of the current course
    const [currentCourse] = await db.query(
      "SELECT category FROM cours WHERE id = ?",
      [courseId]
    );

    if (currentCourse.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const category = currentCourse[0].category;

    // Get related courses from the same category (excluding the current course)
    const [rows] = await db.query(`
      SELECT 
        c.id,
        c.titre,
        '' as imageUrl,
        0 as price,
        0 as rating,
        e.username as instructor
      FROM cours c
      LEFT JOIN enseignants e ON c.enseignant_id = e.id
      WHERE c.category = ? AND c.id != ?
      LIMIT 5
    `, [category, courseId]);

    res.json(rows);

  } catch (error) {
    console.error('Error fetching related courses:', error);
    res.status(500).json({ error: 'Failed to fetch related courses' });
  }
};

export const createCours = async (req, res) => {
  const { titre, description, category, enseignant_id } = req.body;

  await db.query(
    "INSERT INTO cours(titre, description, category, enseignant_id) VALUES (?, ?, ?, ?)",
    [titre, description, category, enseignant_id]
  );

  res.json({ message: "Cours ajouté" });
};

export const updateCours = async (req, res) => {
  const { titre, description, category } = req.body;

  await db.query(
    "UPDATE cours SET titre = ?, description = ?, category = ? WHERE id = ?",
    [titre, description, category, req.params.id]
  );

  res.json({ message: "Cours modifié" });
};

export const deleteCours = async (req, res) => {
  await db.query("DELETE FROM cours WHERE id = ?", [req.params.id]);
  res.json({ message: "Cours supprimé" });
};
