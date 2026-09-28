import nodemailer from "nodemailer";

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

type Transport = ReturnType<typeof nodemailer.createTransport>;
let cached: Transport | null = null;

async function transport(): Promise<Transport> {
  if (cached) return cached;
  if (process.env.SMTP_HOST) {
    cached = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: Number(process.env.SMTP_PORT ?? 587) === 465,
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
    });
  } else {
    // Dev default: disposable Ethereal inbox (no signup). Returns a preview URL.
    const testAccount = await nodemailer.createTestAccount();
    cached = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  }
  return cached;
}

export type SentEmail = { previewUrl?: string };

export async function sendVerificationEmail(
  to: string,
  token: string,
): Promise<SentEmail> {
  const link = `${appUrl()}/verify?token=${token}`;
  return send(to, "Verify your Umoya account", `
    <p>Welcome to Umoya. Confirm your email to activate your account:</p>
    <p><a href="${link}">${link}</a></p>
    <p>This link expires in 24 hours.</p>
  `);
}

export async function sendPasswordResetEmail(
  to: string,
  token: string,
): Promise<SentEmail> {
  const link = `${appUrl()}/reset?token=${token}`;
  return send(to, "Reset your Umoya password", `
    <p>Someone requested a password reset for this account.</p>
    <p><a href="${link}">${link}</a></p>
    <p>This link expires in 1 hour. Ignore this email if it wasn't you.</p>
  `);
}

async function send(to: string, subject: string, html: string): Promise<SentEmail> {
  const tx = await transport();
  const from = process.env.EMAIL_FROM ?? "Umoya <no-reply@umoya.example>";
  const info = await tx.sendMail({ from, to, subject, html });
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) console.log(`[auth] dev email preview: ${previewUrl}`);
  return previewUrl ? { previewUrl } : {};
}
