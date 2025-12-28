import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateContent = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Gemini API key missing",
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // ✅ ONLY VALID MODEL FOR v1beta
    const model = genAI.getGenerativeModel({
      model: "models/gemini-1.0-pro",
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return res.status(200).json({
      success: true,
      response: text,
    });
  } catch (error) {
    console.error("Gemini API FINAL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
