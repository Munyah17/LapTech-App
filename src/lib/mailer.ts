import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

let transport: Transporter | null | undefined;
let warned = false;

export function getTransport(): Transporter | null {
  if (transport !== undefined) return transport;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    if (!warned) {
      console.warn("SMTP is not configured; email notifications are disabled.");
      warned = true;
    }
    transport = null;
    return transport;
  }

  transport = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: process.env.SMTP_SECURE !== "false",
    auth: { user, pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 10_000,
  });
  return transport;
}

export async function sendMail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<boolean> {
  if (!to) return false;
  const mailer = getTransport();
  if (!mailer) return false;

  try {
    await mailer.sendMail({
      from: process.env.SMTP_FROM ?? "LapTech <info@laptech.co.zw>",
      to,
      subject,
      html,
      text,
    });
    return true;
  } catch (error) {
    console.error("email send failed", error);
    return false;
  }
}
