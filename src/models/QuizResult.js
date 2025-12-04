import { db } from "../../config/db.js";
import TestQuestion from "./Quiz.js"; // now represents test_questions

export default class TestResult {
  // Submit a full test as a student
  static async submitTest(etudiantId, testID, submissions) {
    const questions = await TestQuestion.findByQuiz(testID);
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
    
    // Check if student has already passed this test (score > 12)
    const [existingRows] = await db.query(
      "SELECT score FROM test_results WHERE etudiant_id = ? AND test_id = ? ORDER BY score DESC LIMIT 1",
      [etudiantId, testID]
    );
    
    // If student has already passed the test, prevent new submissions
    if (existingRows.length > 0 && existingRows[0].score > 12) {
      throw new Error("Test déjà passé par cet étudiant (note > 12)");
    }
    
    // If student hasn't passed yet, allow them to retake the test
    // We'll replace the existing record with the new one
    const [result] = await db.query(
      `INSERT INTO test_results (etudiant_id, test_id, score, total_questions, correct_answers, responses) 
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       score = VALUES(score),
       total_questions = VALUES(total_questions),
       correct_answers = VALUES(correct_answers),
       responses = VALUES(responses),
       submitted_at = CURRENT_TIMESTAMP`,
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

  // Get the highest score a student achieved on a test
  static async getHighestScore(etudiantId, testID) {
    const [rows] = await db.query(
      "SELECT MAX(score) as highest_score FROM test_results WHERE etudiant_id = ? AND test_id = ?",
      [etudiantId, testID]
    );
    return rows[0]?.highest_score || 0;
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