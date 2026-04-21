import { GoogleGenAI } from '@google/genai';

// Initialize the SDK. It automatically picks up process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });

export const runAgentTask = async (
  systemInstruction: string,
  inputContent: string,
  previousContext?: string
): Promise<string> => {
  try {
    let prompt = `Task Input:\n${inputContent}\n`;
    
    if (previousContext) {
      prompt = `Previous Context/Input Material:\n---\n${previousContext}\n---\n\nBased on the material above, complete your specific task.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7, // Slight creativity, but mostly focused
      },
    });

    if (!response.text) {
      throw new Error("Received empty response from the model.");
    }

    return response.text;
  } catch (error: any) {
    console.error("Error in runAgentTask:", error);
    throw new Error(error.message || "An unexpected error occurred during generation.");
  }
};
