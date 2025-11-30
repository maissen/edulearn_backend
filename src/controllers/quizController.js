import { db } from "../../config/db.js";
import TestResult from "../models/QuizResult.js"; // This model now handles all test result logic
import Etudiant from "../models/Etudiant.js"; // Import Etudiant model to get student ID

// Get test for a course, with all questions
export const getTestByCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    // Get test for this course with course details
    const [testRows] = await db.query(
      `SELECT t.id, t.titre, t.description, t.cours_id, c.image_url as cover_image_url, c.category 
       FROM test t 
       JOIN cours c ON t.cours_id = c.id 
       WHERE t.cours_id = ?`,
      [courseId]
    );
    if (testRows.length === 0) {
      return res.json({});
    }
    const test = testRows[0];
    // Get questions for this test
    const [questionRows] = await db.query(
      `SELECT id, test_id, question, option_a, option_b, option_c, option_d FROM test_questions WHERE test_id = ? ORDER BY id`,
      [test.id]
    );
    test.questions = questionRows.map(q => ({
      id: q.id,
      question: q.question,
      options: {
        a: q.option_a,
        b: q.option_b,
        c: q.option_c,
        d: q.option_d
      }
    }));
    res.json(test);
  } catch (error) {
    console.error('Error fetching test for course:', error);
    res.status(500).json({ error: 'Failed to fetch test for course' });
  }
};

// Create a new test with questions for a course
export const createTest = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { titre, description, cours_id, questions } = req.body;
    if (!titre || !cours_id || !Array.isArray(questions) || questions.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        message: "Invalid request: 'titre', 'cours_id', and non-empty 'questions' are required."
      });
    }
    // Validate that this course doesn't already have a test
    const [testRows] = await connection.query("SELECT id FROM test WHERE cours_id = ?", [cours_id]);
    if (testRows.length > 0) {
      await connection.rollback();
      return res.status(409).json({ message: "Test already exists for this course." });
    }
    // Insert test
    const [testResult] = await connection.query(
      "INSERT INTO test (titre, description, cours_id) VALUES (?, ?, ?)",
      [titre, description || '', cours_id]
    );
    const testId = testResult.insertId;
    for (const q of questions) {
      const { question, option_a, option_b, option_c, option_d, answer } = q;
      if (!question || !option_a || !option_b || !option_c || !option_d || !answer) {
        await connection.rollback();
        return res.status(400).json({ message: "Each question must have 'question', 'option_a', 'option_b', 'option_c', 'option_d', and 'answer' fields." });
      }
      if (!["a", "b", "c", "d"].includes(answer.toLowerCase())) {
        await connection.rollback();
        return res.status(400).json({ message: "Answer must be one of: a, b, c, d" });
      }
      await connection.query(
        `INSERT INTO test_questions (test_id, question, option_a, option_b, option_c, option_d, answer)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [testId, question, option_a, option_b, option_c, option_d, answer.toLowerCase()]
      );
    }
    await connection.commit();
    res.json({ message: "Test created with questions", testId, questionsCount: questions.length });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating test:', error);
    res.status(500).json({ error: 'Failed to create test' });
  } finally {
    connection.release();
  }
};

// Delete a test
export const deleteTest = async (req, res) => {
  try {
    const testId = req.params.id;
    // Delete test and cascade delete its questions (handled by FK)
    await db.query("DELETE FROM test WHERE id = ?", [testId]);
    res.json({ message: 'Test deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Student submits answers to a test
export const submitTest = async (req, res) => {
  try {
    // Get the user ID and email from the JWT token
    const userId = req.user.id;
    const userEmail = req.user.email;
    
    console.log(`Processing test submission for user ID: ${userId}, email: ${userEmail}`);
    
    // Look up the student ID using the email (email is unique and should match between users and etudiants tables)
    const student = await Etudiant.findByEmail(userEmail);
    if (!student) {
      console.error(`Student not found for email: ${userEmail}, userId: ${userId}`);
      return res.status(400).json({ error: `Student record not found for email: ${userEmail}` });
    }
    
    console.log(`Found student ID: ${student.id} for email: ${userEmail}`);
    
    const etudiantId = student.id;
    const { testID, submissions } = req.body;
    
    if (!testID || !Array.isArray(submissions) || submissions.length === 0) {
      return res.status(400).json({ error: "testID and non-empty submissions are required" });
    }
    
    const result = await TestResult.submitTest(etudiantId, testID, submissions);
    
    // If the score is greater than 12, automatically complete the course
    if (result.score > 12) {
      // Get the course ID from the test ID
      const [testRows] = await db.query("SELECT cours_id FROM test WHERE id = ?", [testID]);
      if (testRows.length > 0) {
        const courseId = testRows[0].cours_id;
        
        // Import StudentEnrollment model
        const StudentEnrollment = (await import('../models/StudentEnrollment.js')).default;
        
        try {
          // Complete the course for the student
          await StudentEnrollment.completeCourse(etudiantId, courseId);
          console.log(`Course ${courseId} automatically completed for student ${etudiantId} due to high test score (${result.score})`);
        } catch (completionError) {
          console.error('Error automatically completing course:', completionError);
          // Don't fail the test submission if course completion fails
        }
      }
    }
    
    res.json({ message: "Submission successful", result });
  } catch (error) {
    if (error.message.includes("already submitted")) {
      return res.status(409).json({ error: error.message });
    }
    console.error('Error submitting test:', error);
    res.status(500).json({ error: error.message });
  }
};