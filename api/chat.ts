
import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { history, prompt, systemInstruction, model: requestedModel, config: aiConfig } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API Key not configured' }), { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
        model: requestedModel || "gemini-1.5-flash",
        systemInstruction: systemInstruction
    });

    // Handle different types of requests (chat vs content generation)
    let result;
    if (history && history.length > 0) {
        const chat = model.startChat({
            history: history,
            generationConfig: aiConfig
        });
        result = await chat.sendMessage(prompt || "");
    } else {
        result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: aiConfig
        });
    }

    const response = await result.response;
    const text = response.text();
    const functionCalls = response.functionCalls();

    return new Response(JSON.stringify({ text, functionCalls }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { status: 500 });
  }
}
