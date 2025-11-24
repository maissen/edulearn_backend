import { db } from "../../config/db.js";
import Question from "./Question.js";

export default class QuizResult {
  // Submit quiz responses and calculate score
  static async submitQuiz(etudiantId, quizId, studentResponses) {
    // First, check if student has already submitted this quiz
    const [existing] = await db.query(
      "SELECT id FROM quiz_results WHERE etudiant_id = ? AND quiz_id = ?",
      [etudiantId, quizId]
    );

    if (existing.length > 0) {
      throw new Error('Student has already submitted this quiz');
    }

    // Get all questions for this quiz with correct answers
    const questions = await Question.findByQuiz(quizId);

    if (questions.length === 0) {
      throw new Error('No questions found for this quiz');
    }

    // Calculate score
    let correctAnswers = 0;
    const totalQuestions = questions.length;
    const maxScore = 20;
    const pointsPerQuestion = maxScore / totalQuestions;

    // Validate responses and count correct answers
    const validatedResponses = {};

    questions.forEach((question, index) => {
      // Try different possible keys for the answer
      let studentAnswer = studentResponses[question.id]; // Actual question ID

      // If not found, try alternative formats that frontend might use
      if (!studentAnswer) {
        studentAnswer = studentResponses[`questionId${question.id}`]; // questionId1, questionId2, etc.
      }
      if (!studentAnswer) {
        studentAnswer = studentResponses[`questionId${index + 1}`]; // questionId1, questionId2, etc. (by index)
      }
      if (!studentAnswer) {
        studentAnswer = studentResponses[`${index + 1}`]; // "1", "2", "3", etc.
      }

      // Check if student provided an answer for this question
      if (studentAnswer && ['a', 'b', 'c', 'd'].includes(studentAnswer.toLowerCase())) {
        validatedResponses[question.id] = studentAnswer.toLowerCase();

        // Check if answer is correct
        if (studentAnswer.toLowerCase() === question.correct.toLowerCase()) {
          correctAnswers++;
        }
      } else {
        // Student didn't answer or provided invalid answer
        validatedResponses[question.id] = null;
      }
    });

    // Calculate final score
    const score = Math.round((correctAnswers * pointsPerQuestion) * 100) / 100; // Round to 2 decimal places

    // Save result to database
    const [result] = await db.query(
      `INSERT INTO quiz_results(etudiant_id, quiz_id, score, total_questions, correct_answers, responses)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [etudiantId, quizId, score, totalQuestions, correctAnswers, JSON.stringify(validatedResponses)]
    );

    return {
      id: result.insertId,
      score: score,
      totalQuestions: totalQuestions,
      correctAnswers: correctAnswers,
      maxScore: maxScore,
      pointsPerQuestion: pointsPerQuestion
    };
  }

  // Get quiz result for a student
  static async getQuizResult(etudiantId, quizId) {
    const [rows] = await db.query(`
      SELECT
        qr.*,
        q.titre as quiz_title,
        c.titre as course_title
      FROM quiz_results qr
      JOIN quiz q ON qr.quiz_id = q.id
      JOIN cours c ON q.cours_id = c.id
      WHERE qr.etudiant_id = ? AND qr.quiz_id = ?
    `, [etudiantId, quizId]);

    return rows[0] || null;
  }

  // Get all quiz results for a student
  static async getStudentQuizResults(etudiantId) {
    const [rows] = await db.query(`
      SELECT
        qr.*,
        q.titre as quiz_title,
        c.titre as course_title,
        c.category as course_category
      FROM quiz_results qr
      JOIN quiz q ON qr.quiz_id = q.id
      JOIN cours c ON q.cours_id = c.id
      WHERE qr.etudiant_id = ?
      ORDER BY qr.submitted_at DESC
    `, [etudiantId]);

    return rows;
  }

  // Check if student has completed a quiz
  static async hasCompletedQuiz(etudiantId, quizId) {
    const [rows] = await db.query(
      "SELECT id FROM quiz_results WHERE etudiant_id = ? AND quiz_id = ?",
      [etudiantId, quizId]
    );

    return rows.length > 0;
  }
}
