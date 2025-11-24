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

export const updateProfile = async (req, res) => {
  try {
    const { username } = req.body;

    // Validate input
    if (!username || username.trim().length === 0) {
      return res.status(400).json({ message: "Username is required" });
    }

    // Check if username is already taken by another user
    const [existingUser] = await db.query(
      "SELECT id FROM users WHERE username = ? AND id != ?",
      [username, req.user.id]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Update the username
    await db.query(
      "UPDATE users SET username = ? WHERE id = ?",
      [username, req.user.id]
    );

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
