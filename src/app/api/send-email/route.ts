import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, subject, message } = body;

    // সরাসরি Vercel Environment Variables থেকে ডাটা নিচ্ছে
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 465,
      secure: process.env.SMTP_PORT === "465", 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      // SMTP_USER টাই আপনার প্রেরক ইমেইল
      from: `"AutoLead Pro" <${process.env.SMTP_USER}>`,
      to: to,
      subject: subject,
      text: message,
      html: `<div>${message.replace(/\n/g, '<br>')}</div>`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "Email sent successfully!" });

  } catch (error: any) {
    console.error("SMTP Error Details:", error);
    return NextResponse.json(
      { error: "Failed to send email. Check Vercel Env Variables or App Password." },
      { status: 500 }
    );
  }
}