import { db } from "../../config/db.js";

export const getAllCours = async (req, res) => {
  const [rows] = await db.query("SELECT id, titre, description, category, youtube_vd_url, image_url, enseignant_id FROM cours");
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
        c.youtube_vd_url,
        c.image_url,
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
  const [rows] = await db.query("SELECT id, titre, description, category, youtube_vd_url, image_url, enseignant_id FROM cours WHERE id = ?", [req.params.id]);
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
        c.youtube_vd_url,
        c.image_url,
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
    
    // Check if student has finished the course
    let hasFinishedCourse = false;
    let hasStartedCourse = false; // New attribute
    let finishedCourseId = null;
    let finishedAt = null;
    let finalGrade = null;
    
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
          
          // Check if student has started this course
          const [enrollmentRows] = await db.query(
            "SELECT id, status FROM student_enrollments WHERE etudiant_id = ? AND cours_id = ?",
            [studentId, courseId]
          );
          
          if (enrollmentRows.length > 0) {
            hasStartedCourse = true;
          }
          
          // Check if student has finished this course
          const [finishedRows] = await db.query(
            "SELECT id, completed_at, final_grade FROM finished_courses WHERE etudiant_id = ? AND cours_id = ?",
            [studentId, courseId]
          );
          
          if (finishedRows.length > 0) {
            hasFinishedCourse = true;
            finishedCourseId = finishedRows[0].id;
            finishedAt = finishedRows[0].completed_at;
            finalGrade = finishedRows[0].final_grade;
          }
          
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
        
        // Check if student has started this course
        const [enrollmentRows] = await db.query(
          "SELECT id, status FROM student_enrollments WHERE etudiant_id = ? AND cours_id = ?",
          [studentId, courseId]
        );
        
        if (enrollmentRows.length > 0) {
          hasStartedCourse = true;
        }
        
        // Check if student has finished this course
        const [finishedRows] = await db.query(
          "SELECT id, completed_at, final_grade FROM finished_courses WHERE etudiant_id = ? AND cours_id = ?",
          [studentId, courseId]
        );
        
        if (finishedRows.length > 0) {
          hasFinishedCourse = true;
          finishedCourseId = finishedRows[0].id;
          finishedAt = finishedRows[0].completed_at;
          finalGrade = finishedRows[0].final_grade;
        }
        
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
        title: `${course.category} questions test`,
        id: course.id,
        cours_id: course.id,
        questions: allQuestions
      };

      // Add test result fields
      course.test.hasTakenTest = hasTakenTest;
      course.test.studentScore = studentScore;
      course.test.totalScore = totalScore;
      
      // Add course completion fields
      course.test.hasStartedCourse = hasStartedCourse;
      course.test.hasFinishedCourse = hasFinishedCourse;
      course.test.finishedCourseId = finishedCourseId;
      course.test.finishedAt = finishedAt;
      course.test.finalGrade = finalGrade;

      // Remove the old quizzes field
      delete course.quizzes;
    } else {
      course.test = {
        title: `${course.category} questions test`,
        id: course.id,
        cours_id: course.id,
        questions: [],
        hasTakenTest: hasTakenTest,
        studentScore: studentScore,
        totalScore: totalScore,
        hasStartedCourse: false,
        hasFinishedCourse: false,
        finishedCourseId: null,
        finishedAt: null,
        finalGrade: null
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
        c.image_url as imageUrl,
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
  const { titre, description, category, youtube_vd_url, image_url, enseignant_id } = req.body;

  await db.query(
    "INSERT INTO cours(titre, description, category, youtube_vd_url, image_url, enseignant_id) VALUES (?, ?, ?, ?, ?, ?)",
    [titre, description, category, youtube_vd_url, image_url, enseignant_id]
  );

  res.json({ message: "Cours ajouté" });
};

export const createCoursWithTest = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { 
      titre, 
      description, 
      category, 
      youtube_vd_url,
      image_url,
      enseignant_id,
      test_titre,
      questions 
    } = req.body;

    // Create course
    const [courseResult] = await connection.query(
      "INSERT INTO cours(titre, description, category, youtube_vd_url, image_url, enseignant_id) VALUES (?, ?, ?, ?, ?, ?)",
      [titre, description, category, youtube_vd_url, image_url, enseignant_id]
    );
    
    const courseId = courseResult.insertId;

    // Create test for the course
    const [testResult] = await connection.query(
      "INSERT INTO test (titre, description, cours_id) VALUES (?, ?, ?)",
      [test_titre || `${category} questions test`, "", courseId]
    );
    
    const testId = testResult.insertId;

    // Handle questions creation
    if (Array.isArray(questions)) {
      // Insert questions
      for (const question of questions) {
        const { question: questionText, options } = question;
        const { a, b, c, d } = options;
        
        // Insert new question
        await connection.query(
          `INSERT INTO test_questions 
           (test_id, question, option_a, option_b, option_c, option_d, answer)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [testId, questionText, a, b, c, d, 'a'] // Default answer to 'a'
        );
      }
    }

    await connection.commit();
    res.json({ message: "Course and test created successfully", courseId });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating course with test:', error);
    res.status(500).json({ error: 'Failed to create course and test' });
  } finally {
    connection.release();
  }
};

export const updateCours = async (req, res) => {
  const { titre, description, category, youtube_vd_url, image_url } = req.body;

  await db.query(
    "UPDATE cours SET titre = ?, description = ?, category = ?, youtube_vd_url = ?, image_url = ? WHERE id = ?",
    [titre, description, category, youtube_vd_url, image_url, req.params.id]
  );

  res.json({ message: "Cours modifié" });
};

export const updateCoursWithTest = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const courseId = req.params.id;
    const { 
      titre, 
      description, 
      category, 
      youtube_vd_url,
      image_url,
      test_titre,
      questions 
    } = req.body;

    // Update course details
    await connection.query(
      "UPDATE cours SET titre = ?, description = ?, category = ?, youtube_vd_url = ?, image_url = ? WHERE id = ?",
      [titre, description, category, youtube_vd_url, image_url, courseId]
    );

    // Check if a test exists for this course
    const [testRows] = await connection.query(
      "SELECT id FROM test WHERE cours_id = ?",
      [courseId]
    );

    let testId;
    if (testRows.length > 0) {
      // Test exists, use its ID
      testId = testRows[0].id;
      // Update test title if provided
      if (test_titre) {
        await connection.query(
          "UPDATE test SET titre = ? WHERE id = ?",
          [test_titre, testId]
        );
      }
    } else {
      // No test exists, create one
      const [testResult] = await connection.query(
        "INSERT INTO test (titre, description, cours_id) VALUES (?, ?, ?)",
        [test_titre || `${category} questions test`, "", courseId]
      );
      testId = testResult.insertId;
    }

    // Handle questions update
    if (Array.isArray(questions)) {
      // Get existing question IDs for this test
      const [existingQuestions] = await connection.query(
        "SELECT id FROM test_questions WHERE test_id = ?",
        [testId]
      );
      
      const existingQuestionIds = existingQuestions.map(q => q.id);
      const updatedQuestionIds = questions.filter(q => q.id).map(q => q.id);
      
      // Delete questions that are not in the updated list
      const questionsToDelete = existingQuestionIds.filter(id => !updatedQuestionIds.includes(id));
      if (questionsToDelete.length > 0) {
        const placeholders = questionsToDelete.map(() => '?').join(',');
        await connection.query(
          `DELETE FROM test_questions WHERE id IN (${placeholders})`,
          questionsToDelete
        );
      }
      
      // Update or insert questions
      for (const question of questions) {
        const { id, question: questionText, options } = question;
        const { a, b, c, d } = options;
        
        if (id) {
          // Update existing question
          await connection.query(
            `UPDATE test_questions 
             SET question = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?
             WHERE id = ?`,
            [questionText, a, b, c, d, id]
          );
        } else {
          // Insert new question
          await connection.query(
            `INSERT INTO test_questions 
             (test_id, question, option_a, option_b, option_c, option_d, answer)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [testId, questionText, a, b, c, d, 'a'] // Default answer to 'a'
          );
        }
      }
    }

    await connection.commit();
    res.json({ message: "Course and test updated successfully" });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating course with test:', error);
    res.status(500).json({ error: 'Failed to update course and test' });
  } finally {
    connection.release();
  }
};

export const deleteCours = async (req, res) => {
  await db.query("DELETE FROM cours WHERE id = ?", [req.params.id]);
  res.json({ message: "Cours supprimé" });
};

export const getRecentCourses = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        c.id,
        c.titre,
        c.description,
        c.category,
        c.youtube_vd_url,
        c.image_url,
        c.enseignant_id,
        c.created_at,
        c.updated_at,
        e.username as teacher_username,
        e.email as teacher_email
      FROM cours c
      LEFT JOIN enseignants e ON c.enseignant_id = e.id
      ORDER BY c.created_at DESC
      LIMIT 6
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching recent courses:', error);
    res.status(500).json({ error: 'Failed to fetch recent courses' });
  }
};
