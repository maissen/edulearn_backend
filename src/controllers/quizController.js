import { db } from "../../config/db.js";
import QuizResult from "../models/QuizResult.js";

export const getAllQuiz = async (req, res) => {
  const [rows] = await db.query("SELECT id, titre, cours_id FROM quiz");
  res.json(rows);
};

export const getQuizByCourse = async (req, res) => {
  const [rows] = await db.query("SELECT id, titre, cours_id FROM quiz WHERE cours_id = ?", [req.params.courseId]);
  res.json(rows);
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
    const { quizId, responses } = req.body;
    const etudiantId = req.user.id;

    // Validate input
    if (!quizId || !responses || typeof responses !== 'object') {
      return res.status(400).json({
        error: 'Invalid request. quizId and responses are required.'
      });
    }

    // Submit quiz and calculate score
    const result = await QuizResult.submitQuiz(etudiantId, quizId, responses);

    res.json({
      message: 'Quiz submitted successfully',
      result: result
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);

    if (error.message === 'Student has already submitted this quiz') {
      return res.status(409).json({ error: error.message });
    }

    if (error.message === 'No questions found for this quiz') {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to submit quiz' });
  }
};
