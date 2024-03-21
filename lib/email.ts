import nodemailer from "nodemailer";

const user = process.env.GMAIL_USER;
const pass = process.env.GMAIL_PASSWORD;

if (!user || !pass) {
  console.error("Email user or password env not set.");
  process.exit(0);
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: { user, pass },
});

export async function SendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const info = await transporter.sendMail({
    from: `"Carlton Win8" <${user}>`,
    to,
    subject,
    html,
  });

  console.log("EMail Message sent: %s", info.messageId);
}
