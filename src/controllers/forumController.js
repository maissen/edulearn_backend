import { db } from "../../config/db.js";

export const getAllPosts = async (req, res) => {
  const [rows] = await db.query(
    "SELECT f.id, f.titre, f.contenu, f.user_id, u.username FROM forum f JOIN users u ON f.user_id = u.id ORDER BY f.id DESC"
  );
  res.json(rows);
};

export const createPost = async (req, res) => {
  const { titre, contenu } = req.body;

  await db.query(
    "INSERT INTO forum(titre, contenu, user_id) VALUES (?, ?, ?)",
    [titre, contenu, req.user.id]
  );

  res.json({ message: "Post ajouté" });
};

export const addComment = async (req, res) => {
  const { contenu } = req.body;
  await db.query(
    "INSERT INTO comments(post_id, user_id, contenu) VALUES (?, ?, ?)",
    [req.params.postId, req.user.id, contenu]
  );

  res.json({ message: "Commentaire ajouté" });
};
