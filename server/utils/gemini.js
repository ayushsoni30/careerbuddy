const systemPrompt = require("./systemPrompt");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const callGemini = async (prompt, systemPrompt) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    const text = response.text;
    return text;
  } catch (err) {
    throw err;
  }
};

module.exports = { callGemini };
