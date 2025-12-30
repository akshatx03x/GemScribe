import api from "./apiService";

export const generateContent = async (prompt) => {
  try {
    // 🔥 CHANGE: Ensure the path matches your backend route (/api/gemini/generate)
    const response = await api.post("/gemini/generate", { prompt });

    // Based on your controller, we need 'response.data.response'
    return response.data.response; 
  } catch (error) {
    console.error("Service Error:", error);
    throw error;
  }
};