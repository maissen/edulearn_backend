import { db } from "../../config/db.js";

export default class Question {
  static async create(data) {
    const { quiz_id, question, option_a, option_b, option_c, option_d, correct } = data;

    await db.query(
      `INSERT INTO questions(quiz_id, question, option_a, option_b, option_c, option_d, correct)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [quiz_id, question, option_a, option_b, option_c, option_d, correct]
    );
  }

  static async findByQuiz(quiz_id) {
    const [rows] = await db.query("SELECT * FROM questions WHERE quiz_id = ?", [quiz_id]);
    return rows;
  }
}
