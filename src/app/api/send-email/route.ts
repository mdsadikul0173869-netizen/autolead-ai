import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // frontend থেকে leadId-ও পাঠাতে হবে এখন
    const { to, subject, message, leadId } = body; 

    // ১. ভেরিয়েবলগুলো চেক করে নেওয়া
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error("SMTP Credentials missing in Environment Variables");
    }

    // ২. ট্র্যাকিং পিক্সেল তৈরি করা (যদি leadId থাকে)
    // মনে রাখবেন: Vercel-এ হোস্ট করার পর .env ফাইলে NEXT_PUBLIC_APP_URL দিতে হবে
    const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/track-email?leadId=${leadId}`;
    const trackingPixel = leadId 
      ? `<img src="${trackingUrl}" width="1" height="1" style="display:none;" />` 
      : "";

    // ৩. ট্রান্সপোর্টার সেটআপ
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: "smtp.gmail.com",
      port: 465,
      secure: true, 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, 
      },
    });

    // ৪. ইমেইল অপশন (HTML বডিতে পিক্সেল যোগ করা হয়েছে)
    const mailOptions = {
      from: `"AutoLead Pro" <${process.env.SMTP_USER}>`,
      to: to,
      subject: subject,
      text: message, // প্লেইন টেক্সট ভার্সন
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
          ${message.replace(/\n/g, '<br>')}
          ${trackingPixel}
        </div>
      `,
    };

    // ৫. ইমেইল পাঠানো
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "Email sent successfully!" });

  } catch (error: any) {
    console.error("SMTP FULL ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send email." },
      { status: 500 }
    );
  }
}