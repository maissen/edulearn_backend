import { db } from "../../config/db.js";
import QuizResult from "../models/QuizResult.js";

export const getAllQuiz = async (req, res) => {
  const [rows] = await db.query("SELECT id, titre, cours_id FROM quiz");
  res.json(rows);
};

export const getQuizByCourse = async (req, res) => {
  try {
    // Get quizzes for the course
    const [quizRows] = await db.query("SELECT id, titre, cours_id FROM quiz WHERE cours_id = ?", [req.params.courseId]);

    if (quizRows.length === 0) {
      return res.json([]);
    }

    // Get questions for all quizzes in this course
    const quizIds = quizRows.map(quiz => quiz.id);
    const placeholders = quizIds.map(() => '?').join(',');
    const [questionRows] = await db.query(
      `SELECT id, quiz_id, question, option_a, option_b, option_c, option_d, correct
       FROM questions
       WHERE quiz_id IN (${placeholders})
       ORDER BY quiz_id, id`,
      quizIds
    );

    // Group questions by quiz_id
    const questionsByQuiz = {};
    questionRows.forEach(question => {
      if (!questionsByQuiz[question.quiz_id]) {
        questionsByQuiz[question.quiz_id] = [];
      }
      questionsByQuiz[question.quiz_id].push({
        id: question.id,
        question: question.question,
        options: {
          a: question.option_a,
          b: question.option_b,
          c: question.option_c,
          d: question.option_d
        },
        // Note: We're not exposing the correct answer for security reasons
        // The correct answer will only be used server-side for scoring
      });
    });

    // For this structure, each quiz represents a single question
    // So we'll transform quizzes into direct question objects
    const quizzesAsQuestions = quizRows.map(quiz => {
      const questions = questionsByQuiz[quiz.id] || [];

      // Since each quiz should have exactly one question,
      // we'll take the first question or create a structure that treats the quiz title as the question
      if (questions.length > 0) {
        // Use the actual question from the database
        const question = questions[0]; // Take the first (and presumably only) question
        return {
          id: quiz.id,
          titre: quiz.titre, // This is like "Python Test 1", "Python Test 2", etc.
          cours_id: quiz.cours_id,
          question: question.question,
          options: question.options
        };
      } else {
        // Fallback if no questions found (though this shouldn't happen with proper data)
        return {
          id: quiz.id,
          titre: quiz.titre,
          cours_id: quiz.cours_id,
          question: quiz.titre, // Use quiz title as fallback
          options: { a: "", b: "", c: "", d: "" }
        };
      }
    });

    res.json(quizzesAsQuestions);
  } catch (error) {
    console.error('Error fetching quizzes for course:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes for course' });
  }
};

export const createQuiz = async (req, res) => {
  try {
    const { titre, cours_id } = req.body;

    // Check if the course belongs to the authenticated teacher
    const [courseRows] = await db.query(
      "SELECT enseignant_id FROM cours WHERE id = ?",
      [cours_id]
    );

    if (courseRows.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (courseRows[0].enseignant_id !== req.user.id) {
      return res.status(403).json({
        message: "Access denied. You can only create quizzes for your own courses."
      });
    }

    await db.query("INSERT INTO quiz(titre, cours_id) VALUES (?, ?)", [
      titre,
      cours_id
    ]);

    res.json({ message: "Quiz créé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    // First, get the quiz and check if it exists, also get the course_id
    const [quizRows] = await db.query(
      "SELECT q.id, q.cours_id, c.enseignant_id FROM quiz q JOIN cours c ON q.cours_id = c.id WHERE q.id = ?",
      [req.params.id]
    );

    if (quizRows.length === 0) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const quiz = quizRows[0];

    // Check if the authenticated teacher owns the course
    if (quiz.enseignant_id !== req.user.id) {
      return res.status(403).json({
        message: "Access denied. You can only delete quizzes from your own courses."
      });
    }

    // Delete the quiz
    await db.query("DELETE FROM quiz WHERE id = ?", [req.params.id]);
    res.json({ message: "Quiz supprimé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const { submissions } = req.body;
    const etudiantId = req.user.id;

    // Support both single quiz and batch submissions
    let submissionsArray = [];

    if (submissions && Array.isArray(submissions)) {
      // Batch submission
      submissionsArray = submissions;
    } else if (req.body.quizId && req.body.responses) {
      // Single quiz submission (backward compatibility)
      submissionsArray = [{
        quizId: req.body.quizId,
        responses: req.body.responses
      }];
    } else {
      return res.status(400).json({
        error: 'Invalid request. Either provide submissions array or quizId with responses.'
      });
    }

    // Validate submissions
    if (submissionsArray.length === 0) {
      return res.status(400).json({
        error: 'No submissions provided.'
      });
    }

    // Process each submission
    const results = [];
    const errors = [];

    for (let i = 0; i < submissionsArray.length; i++) {
      const submission = submissionsArray[i];
      const { quizId, responses } = submission;

      try {
        // Validate individual submission
        if (!quizId || !responses || typeof responses !== 'object') {
          errors.push({
            index: i,
            quizId: quizId,
            error: 'Invalid submission format. quizId and responses are required.'
          });
          continue;
        }

        // Submit quiz and calculate score
        const result = await QuizResult.submitQuiz(etudiantId, quizId, responses);
        results.push({
          quizId: quizId,
          result: result
        });

      } catch (error) {
        console.error(`Error submitting quiz ${quizId}:`, error);

        let errorMessage = 'Failed to submit quiz';
        if (error.message === 'Student has already submitted this quiz') {
          errorMessage = error.message;
        } else if (error.message === 'No questions found for this quiz') {
          errorMessage = error.message;
        }

        errors.push({
          index: i,
          quizId: quizId,
          error: errorMessage
        });
      }
    }

    // Prepare response
    const response = {
      message: `Processed ${submissionsArray.length} quiz submission(s)`,
      successful: results.length,
      failed: errors.length,
      results: results
    };

    if (errors.length > 0) {
      response.errors = errors;
    }

    // Return appropriate status code
    const statusCode = errors.length === 0 ? 200 :
                      results.length > 0 ? 207 : 400; // 207 = Multi-Status

    res.status(statusCode).json(response);

  } catch (error) {
    console.error('Error processing quiz submissions:', error);
    res.status(500).json({ error: 'Failed to process quiz submissions' });
  }
};
