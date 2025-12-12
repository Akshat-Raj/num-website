import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_CONTEXT = `You are a helpful assistant for the Numerano Team Registration website. Here's what you should know:

**About Numerano Team Registration:**
- This is a platform for teams (2-4 members) to register and receive unique Team IDs
- Teams must complete human verification (reCAPTCHA or checkbox fallback)
- Each team member needs to provide: name, contact number, email, and optionally a USN (University Serial Number)
- Each team member must upload an ID card (accepted formats: PDF, JPEG, PNG, WebP, HEIC - max 5MB)

**Registration Process:**
1. Complete human verification first
2. Select team size (2-4 members)
3. Fill in details for each team member
4. Upload ID cards for each member
5. Submit to receive a unique Team ID (format: TEAM-XXXXXXXX)
6. Confirmation email sent to the first team member's email

**ID Card Requirements:**
- Accepted formats: PDF or images (JPEG, PNG, WebP, HEIC)
- Maximum file size: 5MB per file
- One ID card required per team member
- Files are verified for type and size

**Important Notes:**
- Team size must be between 2-4 members
- All fields except USN are required
- Email confirmation is sent after successful registration
- Teams receive a unique Team ID for future reference

Keep responses concise, friendly, and focused on helping users with the registration process.`;

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { message: "Chat service is not configured. Please set GEMINI_API_KEY." },
      { status: 503 }
    );
  }

  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
    });

    // Simple single-turn generation without chat history for now
    const prompt = `${SYSTEM_CONTEXT}\n\nUser: ${messages[messages.length - 1].content}\n\nAssistant:`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ message: text });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { message: "Sorry, I encountered an error processing your request." },
      { status: 500 }
    );
  }
}
