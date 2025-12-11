import { NextResponse } from "next/server";
import { z } from "zod";
import { sendConfirmationEmail } from "../../../lib/email";
import { verifyIdCard } from "../../../lib/verifyId";

const memberSchema = z.object({
  name: z.string().min(2, "Name is required"),
  contactNumber: z.string().min(10, "Valid contact number is required"),
  email: z.string().email("Valid email required"),
  usn: z.string().min(3, "USN is required"),
});

const schema = z.object({
  teamSize: z.enum(["2", "3", "4"], {
    errorMap: () => ({ message: "Team size must be between 2-4 members" }),
  }),
  humanToken: z.string().min(3, "Human verification required"),
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const payload: Record<string, unknown> = {};
    const members: Array<Record<string, string>> = [];
    const idFiles: File[] = [];

    // Extract team size and other non-member fields
    for (const [key, value] of formData.entries()) {
      if (key === "teamSize" || key === "humanToken") {
        payload[key] = value.toString();
      } else if (key.startsWith("members[")) {
        // Parse member fields: members[0][name], members[0][email], etc.
        const match = key.match(/members\[(\d+)\]\[(\w+)\]/);
        if (match) {
          const index = parseInt(match[1]);
          const field = match[2];
          if (!members[index]) {
            members[index] = {};
          }
          members[index][field] = value.toString();
        }
      } else if (key.startsWith("idCards[")) {
        // Parse ID card files: idCards[0], idCards[1], etc.
        const match = key.match(/idCards\[(\d+)\]/);
        if (match && value instanceof File) {
          const index = parseInt(match[1]);
          idFiles[index] = value;
        }
      }
    }

    const parsed = schema.parse(payload);

    // Validate team size matches number of members
    const expectedSize = parseInt(parsed.teamSize);
    
    // Ensure we have all members (indices 0 to expectedSize-1)
    const validMembers: Array<Record<string, string>> = [];
    for (let i = 0; i < expectedSize; i++) {
      if (!members[i] || Object.keys(members[i]).length === 0) {
        return NextResponse.json(
          { message: `Team member ${i + 1} data is missing` },
          { status: 400 }
        );
      }
      validMembers.push(members[i]);
    }

    // Validate all members
    const validatedMembers = validMembers.map((member, idx) => {
      try {
        return memberSchema.parse(member);
      } catch (err) {
        if (err instanceof z.ZodError) {
          throw new Error(`Member ${idx + 1}: ${err.errors[0].message}`);
        }
        throw err;
      }
    });

    // Validate ID cards - ensure we have files for all members (indices 0 to expectedSize-1)
    const validIdFiles: File[] = [];
    for (let i = 0; i < expectedSize; i++) {
      if (!idFiles[i] || !(idFiles[i] instanceof File)) {
        return NextResponse.json(
          { message: `ID card missing for team member ${i + 1}` },
          { status: 400 }
        );
      }
      validIdFiles.push(idFiles[i]);
    }

    // Verify all ID cards
    for (let i = 0; i < validIdFiles.length; i++) {
      const verification = await verifyIdCard(validIdFiles[i]);
      if (!verification.valid) {
        return NextResponse.json(
          { message: `Member ${i + 1} ID card: ${verification.reason ?? "Verification failed"}` },
          { status: 400 }
        );
      }
    }

    const teamId = `TEAM-${crypto.randomUUID().split("-")[0].toUpperCase()}`;

    // Send confirmation email to the first member's email
    const primaryEmail = validatedMembers[0].email;
    const primaryName = validatedMembers[0].name;

    const mailResult = await sendConfirmationEmail({
      to: primaryEmail,
      teamName: primaryName,
      teamId,
    });

    return NextResponse.json({
      ok: true,
      teamId,
      email: primaryEmail,
      members: validatedMembers.length,
      emailSent: mailResult.ok,
      emailSkipped: mailResult.skipped,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: err.errors[0].message }, { status: 400 });
    }
    if (err instanceof Error) {
      return NextResponse.json({ message: err.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

