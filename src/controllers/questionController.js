import { db } from "../../config/db.js";

export const addQuestion = async (req, res) => {
  const { quiz_id, question, option_a, option_b, option_c, option_d, correct } = req.body;

  await db.query(
    `INSERT INTO test_questions(test_id, question, option_a, option_b, option_c, option_d, answer)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [quiz_id, question, option_a, option_b, option_c, option_d, correct]
  );

  res.json({ message: "Question ajoutée" });
};

export const getQuestionsByQuiz = async (req, res) => {
  const [rows] = await db.query("SELECT id, test_id, question, option_a, option_b, option_c, option_d, answer FROM test_questions WHERE test_id = ?", [
    req.params.quizId
  ]);

  res.json(rows);
};