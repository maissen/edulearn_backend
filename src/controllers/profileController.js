import { db } from "../../config/db.js";

export const getProfile = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, username, email, role FROM users WHERE id = ?", [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
