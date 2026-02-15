import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// ১. ডাটার জন্য একটি টাইপ ডিফাইন করা (টাইপস্ক্রিপ্টকে শান্ত করার জন্য)
interface RequestBody {
  businessName?: string;
  category?: string;
  location?: string;
}

export async function POST(req: Request) {
  // ২. ভেরিয়েবলগুলোকে নিরাপদভাবে ডিফল্ট ভ্যালুসহ ডিফাইন করা
  let bizName: string = "Valued Business";
  let bizCat: string = "your niche";
  let bizLoc: string = "your area";

  try {
    const apiKey = "AIzaSyBvQNnnBi-Ep8DBDbcpdPxPb3ikl0nLHQc";
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // ৩. বডি রিড করার সময় টাইপ কাস্টিং করা
    const body = (await req.json()) as RequestBody;
    
    bizName = body.businessName || bizName;
    bizCat = body.category || bizCat;
    bizLoc = body.location || bizLoc;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Write a professional cold email for ${bizName} in ${bizCat} at ${bizLoc}. Keep it short.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ 
      email: text,
      status: "Success"
    });

  } catch (error: any) {
    console.error("Gemini Error:", error);

    // ৪. ফলব্যাক ইমেইল লজিক (সব ভেরিয়েবল এখন এখানে কাজ করবে)
    const fallbackEmail = `Subject: Strategic Growth for ${bizName}

Hi Team, 
I noticed your work in ${bizCat}. We help businesses like yours scale with AI. 
Would you be open to a quick chat?

Best regards,
AutoLead Pro Team`;

    return NextResponse.json({ 
      email: fallbackEmail,
      status: "Fallback",
      error: error.message
    });
  }
}