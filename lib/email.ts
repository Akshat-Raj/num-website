import nodemailer from "nodemailer";

type MailPayload = {
  to: string;
  teamName: string;
  teamId: string;
};

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM = "no-reply@numerano.ai",
} = process.env;

export async function sendConfirmationEmail({ to, teamName, teamId }: MailPayload) {
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.log("SMTP not configured:", { SMTP_HOST, SMTP_PORT, SMTP_USER: !!SMTP_USER, SMTP_PASS: !!SMTP_PASS });
    return {
      ok: false,
      skipped: true,
      message: "SMTP credentials not configured; skipping email send.",
    };
  }
  
  console.log("SMTP Config:", { host: SMTP_HOST, port: SMTP_PORT, from: SMTP_FROM });

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const html = `
    <div style="font-family: Inter, system-ui, sans-serif; padding: 16px; color: #0b0b14;">
      <h2>Welcome to Numerano Teams</h2>
      <p>Your registration was received and verified.</p>
      <p><strong>Team:</strong> ${teamName}</p>
      <p><strong>Team ID:</strong> ${teamId}</p>
      <p>Save this Team ID for future access.</p>
      <p style="margin-top: 18px;">— Numerano Team</p>
    </div>
  `;

  try {
    console.log("Sending email to:", to);
    const result = await transporter.sendMail({
      from: SMTP_FROM,
      to,
      subject: `Your Numerano Team ID: ${teamId}`,
      html,
    });
    console.log("Email sent successfully:", result.messageId);

    return { ok: true, skipped: false };
  } catch (error) {
    console.error("Email send error:", error);
    return {
      ok: false,
      skipped: false,
      message: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

