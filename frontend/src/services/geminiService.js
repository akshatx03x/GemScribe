import api from "./apiService";

export const generateContent = async (prompt) => {
  const response = await api.post("/gemini/generate", {
    prompt,
  });

  return response.data.response;
};
