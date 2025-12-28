import express from "express";
import { generateContent } from "../controllers/Gemini.controller.js";

const router = express.Router();

router.post("/generate", generateContent);

export default router;
