import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export async function GET() {
  if (!genAI) {
    return NextResponse.json(
      { message: "Chat service is not configured. Please set GEMINI_API_KEY." },
      { status: 503 }
    );
  }

  try {
    const models = await genAI.listModels();
    const modelNames = models.map((model) => ({
      name: model.name,
      displayName: model.displayName,
      supportedGenerationMethods: model.supportedGenerationMethods,
    }));
    
    return NextResponse.json({ models: modelNames });
  } catch (error) {
    console.error("List models error:", error);
    return NextResponse.json(
      { message: "Error listing models", error: String(error) },
      { status: 500 }
    );
  }
}
