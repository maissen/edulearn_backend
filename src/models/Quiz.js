import { db } from "../../config/db.js";

export default class Quiz {
  // Fetch all questions for a given quiz
  static async findByQuiz(quizId) {
    const [rows] = await db.query(
      `SELECT id, test_id, question, option_a, option_b, option_c, option_d, answer
       FROM test_questions WHERE test_id = ? ORDER BY id`,
      [quizId]
    );
    return rows;
  }
}