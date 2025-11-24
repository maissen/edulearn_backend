import { db } from "../../config/db.js";

export const getProfile = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, username, email, role, biography FROM users WHERE id = ?", [req.user.id]);
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
    const { username, biography } = req.body;

    // Validate input - at least one field must be provided
    if ((!username || username.trim().length === 0) && (!biography || biography.trim().length === 0)) {
      return res.status(400).json({ message: "At least username or biography must be provided" });
    }

    // Check if username is provided and validate it
    if (username) {
      if (username.trim().length === 0) {
        return res.status(400).json({ message: "Username cannot be empty" });
      }

      // Check if username is already taken by another user
      const [existingUser] = await db.query(
        "SELECT id FROM users WHERE username = ? AND id != ?",
        [username, req.user.id]
      );

      if (existingUser.length > 0) {
        return res.status(400).json({ message: "Username already taken" });
      }
    }

    // Build dynamic update query
    let updateFields = [];
    let updateValues = [];

    if (username) {
      updateFields.push("username = ?");
      updateValues.push(username);
    }

    if (biography !== undefined) {
      updateFields.push("biography = ?");
      updateValues.push(biography || null); // Allow empty biography to clear it
    }

    updateValues.push(req.user.id);

    const updateQuery = `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`;

    await db.query(updateQuery, updateValues);

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
