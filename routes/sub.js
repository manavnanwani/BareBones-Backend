import express from "express";

import { getAll, createSub } from "../controllers/sub.js";

const router = express.Router();

router.get("/all", getAll);
router.post("/create", createSub);

export default router;
