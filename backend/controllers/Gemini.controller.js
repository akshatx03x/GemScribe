import fetch from "node-fetch";

export const generateContent = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ success: false, message: "Prompt is required" });
    }

    // 2025 STABLE FREE MODEL (No card required in India)
    const MODEL = "gemini-2.5-flash-lite"; 
    const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 2500 },
        // IMPORTANT: Safety settings prevent empty responses on code/technical prompts
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
      console.error("Gemini Error:", data);
      return res.status(response.status).json({
        success: false,
        message: data.error?.message || "Gemini API failed",
      });
    }
// Inside your backend controller success block
const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

if (aiText) {
  // Clean the text: remove the backticks if the AI added them
  const cleanText = aiText.replace(/^```markdown\n|```$/g, '');
  return res.status(200).json({
    success: true,
    response: cleanText,
  });
}

    // We send back 'success: true' and 'response: aiText'
    return res.status(200).json({
      success: true,
      response: aiText || "AI returned no text.",
    });

  } catch (error) {
    console.error("Controller Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};