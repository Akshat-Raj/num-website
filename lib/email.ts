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
    return {
      ok: false,
      skipped: true,
      message: "SMTP credentials not configured; skipping email send.",
    };
  }

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

  await transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject: `Your Reflect Team ID: ${teamId}`,
    html,
  });

  return { ok: true, skipped: false };
}

