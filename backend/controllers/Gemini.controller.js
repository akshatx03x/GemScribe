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

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini REST error:", data);
      return res.status(500).json({
        success: false,
        message: data.error?.message || "Gemini REST API failed",
      });
    }

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

    return res.status(200).json({
      success: true,
      response: text,
    });
  } catch (error) {
    console.error("Gemini FINAL error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
