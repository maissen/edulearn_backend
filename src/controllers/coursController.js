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

      // Remove the old quizzes field
      delete course.quizzes;
    } else {
      course.test = {
        title: `${course.category} quizzes test`,
        id: course.id,
        cours_id: course.id,
        quizzes: []
      };
    }

    res.json(course);

  } catch (error) {
    console.error('Error fetching course content:', error);
    res.status(500).json({ error: 'Failed to fetch course content' });
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
