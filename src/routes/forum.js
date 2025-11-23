import express from "express";
import {
  getAllPosts,
  createPost,
  addComment
} from "../controllers/forumController.js";

import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getAllPosts);
router.post("/", verifyToken, createPost);
router.post("/:postId/comment", verifyToken, addComment);

export default router;
