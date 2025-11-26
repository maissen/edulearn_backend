import { db } from "../../config/db.js";
import TestQuestion from "./Quiz.js"; // now represents test_questions

export default class TestResult {
  // Submit a full test as a student
  static async submitTest(etudiantId, testID, submissions) {
    const questions = await TestQuestion.findByTest(testID);
    const answerMap = {};
    questions.forEach(q => {
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
    const totalQuestions = questions.length;
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

  // Optionally: get result for a student's test
  static async getResultByStudentAndTest(etudiantId, testID) {
    const [rows] = await db.query(
      `SELECT * FROM test_results WHERE etudiant_id = ? AND test_id = ?`,
      [etudiantId, testID]
    );
    return rows[0] || null;
  }

  // Optionally: get all test submissions for a student
  static async getStudentTestResults(etudiantId) {
    const [rows] = await db.query(
      `SELECT tr.*, t.titre as test_title, t.cours_id FROM test_results tr JOIN test t ON tr.test_id = t.id WHERE tr.etudiant_id = ? ORDER BY tr.submitted_at DESC`,
      [etudiantId]
    );
    return rows;
  }

  // Optionally: check if student completed a test
  static async hasCompletedTest(etudiantId, testID) {
    const [rows] = await db.query(
      "SELECT id FROM test_results WHERE etudiant_id = ? AND test_id = ?",
      [etudiantId, testID]
    );
    return rows.length > 0;
  }
}
