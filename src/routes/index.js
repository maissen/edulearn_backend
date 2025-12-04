import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "API Plateforme Scolaire en cours d'exécution 🚀" });
});

export default router;