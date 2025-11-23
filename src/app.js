import express from "express";
import cors from "cors";

import indexRoutes from "./routes/index.js";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import coursRoutes from "./routes/cours.js";
import forumRoutes from "./routes/forum.js";
import imagesRoutes from "./routes/images.js";
import enseignantRoutes from "./routes/enseignant.js";
import etudiantRoutes from "./routes/etudiant.js";
import classeRoutes from "./routes/classe.js";
import examenRoutes from "./routes/examen.js";
import quizRoutes from "./routes/quiz.js";
import questionRoutes from "./routes/question.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("src/uploads"));

// ROUTES
app.use("/", indexRoutes);
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/cours", coursRoutes);
app.use("/forum", forumRoutes);
app.use("/images", imagesRoutes);
app.use("/enseignant", enseignantRoutes);
app.use("/etudiant", etudiantRoutes);
app.use("/classe", classeRoutes);
app.use("/examen", examenRoutes);
app.use("/quiz", quizRoutes);
app.use("/question", questionRoutes);

export default app;
