import express from "express";

import auth from "../middleware/auth.js";
import {
  getPostsBySearch,
  getPosts,
  createPost,
  updatePost,
  deletePost,
  upvotePost,
  downvote,
  getPost,
} from "../controllers/posts.js";

const router = express.Router();

router.get("/search", getPostsBySearch);

router.get("/:id", getPost);
router.get("/", getPosts);
router.post("/", auth, createPost);
router.patch("/:id", auth, updatePost);
router.delete("/:id", auth, deletePost);
router.patch("/:id/upvotePost", auth, upvotePost);
router.patch("/:id/downvote", auth, downvote);

export default router;
