import { db } from "../../config/db.js";

export const getAllPosts = async (req, res) => {
  // We need to join with the appropriate user table based on user_role
  const [rows] = await db.query(`
    SELECT 
      f.id, 
      f.titre, 
      f.contenu, 
      f.user_id, 
      CASE 
        WHEN f.user_role = 'admin' THEN a.username
        WHEN f.user_role = 'enseignant' THEN e.username
        WHEN f.user_role = 'etudiant' THEN s.username
      END as username
    FROM forum f
    LEFT JOIN admins a ON (f.user_id = a.id AND f.user_role = 'admin')
    LEFT JOIN enseignants e ON (f.user_id = e.id AND f.user_role = 'enseignant')
    LEFT JOIN etudiants s ON (f.user_id = s.id AND f.user_role = 'etudiant')
    ORDER BY f.id DESC
  `);
  res.json(rows);
};

export const createPost = async (req, res) => {
  const { titre, contenu } = req.body;

  await db.query(
    "INSERT INTO forum(titre, contenu, user_id, user_role) VALUES (?, ?, ?, ?)",
    [titre, contenu, req.user.id, req.user.role]
  );

  res.json({ message: "Post ajouté" });
};

export const addComment = async (req, res) => {
  const { contenu } = req.body;
  await db.query(
    "INSERT INTO comments(contenu, post_id, user_id, user_role) VALUES (?, ?, ?, ?)",
    [contenu, req.params.postId, req.user.id, req.user.role]
  );

  res.json({ message: "Commentaire ajouté" });
};