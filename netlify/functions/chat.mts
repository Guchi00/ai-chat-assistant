import { GoogleGenAI } from "@google/genai";

export default async (request: Request) => {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { message } = await request.json();

    if (
      typeof message !== "string" ||
      !message.trim() ||
      message.length > 2000
    ) {
      return Response.json({ error: "Invalid message" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing");
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert career mentor focused on software engineering paths.
    Respond with:
    - A short, empathetic intro (1–2 sentences).
    - Section headings using **bold**.
    - Bullet points for steps, lists, or recommendations.
    - Very minimal bold emphasis inside paragraphs.
    - No overuse of formatting symbols.
    Make the tone supportive, professional, and actionable.

    User question: ${message}`;

    const result = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    if (!result.text) {
      throw new Error("Gemini returned an empty response");
    }

    return Response.json({ reply: result.text });
  } catch (error) {
    console.error("Gemini function error:", error);

    return Response.json(
      { error: "Unable to generate a response" },
      { status: 500 },
    );
  }
};
