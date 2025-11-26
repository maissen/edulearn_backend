import { db } from "../../config/db.js";
import Quiz from "./Quiz.js"; // Use new Quiz model

export default class TestResult {
  // Submit a full test as a student
  static async submitTest(etudiantId, testID, submissions) {
    // submissions: [{quizId, answer}]
    const quizzes = await Quiz.findByTest(testID);
    const answerMap = {};
    quizzes.forEach(q => {
      answerMap[q.id] = q.answer;
    });

    let correct = 0;
    submissions.forEach(sub => {
      if (
        answerMap[sub.quizId] &&
        answerMap[sub.quizId].toLowerCase() === sub.answer.toLowerCase()
      ) {
        correct++;
      }
    });

    const totalQuestions = quizzes.length;
    const pointsPerQuestion = totalQuestions > 0 ? 20 / totalQuestions : 0;
    const score = Math.round(correct * pointsPerQuestion * 100) / 100;

    // Only one attempt per student per test
    const [existingRows] = await db.query(
      "SELECT id FROM test_results WHERE etudiant_id = ? AND test_id = ?",
      [etudiantId, testID]
    );
    if (existingRows.length > 0) {
      throw new Error("Test already submitted by this student");
    }

    const [result] = await db.query(
      "INSERT INTO test_results (etudiant_id, test_id, score, total_questions, correct_answers, responses) VALUES (?, ?, ?, ?, ?, ?)",
      [etudiantId, testID, score, totalQuestions, correct, JSON.stringify(submissions)]
    );
    return {
      id: result.insertId,
      score,
      totalQuestions,
      correctAnswers: correct,
      maxScore: 20,
      pointsPerQuestion
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
