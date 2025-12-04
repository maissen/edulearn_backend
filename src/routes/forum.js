import express from "express";
import {
  getAllPosts,
  createPost,
  addComment
} from "../controllers/forumController.js";

import { verifyToken } from "../middlewares/authMiddleware.js";
import { isAccountActivated } from "../middlewares/activationMiddleware.js";

const router = express.Router();

router.get("/", getAllPosts);
router.post("/", verifyToken, isAccountActivated, createPost);
router.post("/:postId/comment", verifyToken, isAccountActivated, addComment);

export default router;
