import express from "express";
import { generateContent } from "../controllers/Gemini.controller.js";

const router = express.Router();

// This endpoint will be http://localhost:5000/api/gemini/generate 
// (depending on your main server.js prefix)
router.post("/generate", generateContent);

export default router;