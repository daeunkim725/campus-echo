import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT ?? "587"),
    secure: process.env.SMTP_PORT === "465",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendVerificationCode(
    to: string,
    code: string
): Promise<void> {
    await transporter.sendMail({
        from: process.env.SMTP_FROM ?? "Campus Echo <noreply@campusecho.app>",
        to,
        subject: "Verify your school email — Campus Echo",
        text: [
            "Hi!",
            "",
            "Your verification code for Campus Echo is:",
            "",
            `    ${code}`,
            "",
            "This code expires in 15 minutes.",
            "",
            "If you didn't request this, please ignore this email.",
        ].join("\n"),
        html: `
      <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:32px">
        <h2 style="margin-bottom:8px">🦇 Campus Echo</h2>
        <p>Your school email verification code is:</p>
        <div style="font-size:36px;font-weight:700;letter-spacing:8px;margin:24px 0;color:#1e293b">
          ${code}
        </div>
        <p style="color:#64748b;font-size:14px">Expires in 15 minutes. If you didn't request this, ignore this email.</p>
      </div>
    `,
    });
}
