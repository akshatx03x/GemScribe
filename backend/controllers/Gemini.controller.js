import fetch from "node-fetch";

export const generateContent = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ success: false, message: "Prompt is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, message: "Gemini API key missing" });
    }

    // 🔥 CHANGE 1: Use gemini-2.5-flash-lite (Stable card-free model for Dec 2025)
    const MODEL = "gemini-2.5-flash-lite"; 
    const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        },
        // 🔥 CHANGE 2: Safety settings prevent empty responses on code/technical prompts
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        ]
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini Error Detail:", data);
      return res.status(response.status).json({
        success: false,
        message: data.error?.message || "Gemini API failed",
      });
    }

    // Extract text safely from the nested Google JSON
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    // 🔥 CHANGE 3: Ensure the response field name matches exactly what your frontend expects
    return res.status(200).json({
      success: true,
      response: aiText || "AI returned no text. Please try rephrasing your prompt.",
    });

  } catch (error) {
    console.error("Gemini Controller Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};