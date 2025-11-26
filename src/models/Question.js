import { db } from "../../config/db.js";

export default class Question {
  static async create(data) {
    const { quiz_id, question, option_a, option_b, option_c, option_d, correct } = data;

    await db.query(
      `INSERT INTO test_questions(test_id, question, option_a, option_b, option_c, option_d, answer)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [quiz_id, question, option_a, option_b, option_c, option_d, correct]
    );
  }

  static async findByQuiz(quiz_id) {
    const [rows] = await db.query("SELECT * FROM test_questions WHERE test_id = ?", [quiz_id]);
    return rows;
  }
}