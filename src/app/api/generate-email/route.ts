import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server"; 
import { createClient } from "@supabase/supabase-js";

// সুপাবেস ক্লায়েন্ট সেটআপ
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: Request) {
  try {
    // ১. ক্লার্ক থেকে ইউজার আইডি চেক
    const { userId } = await auth();
    
    // টার্মিনালে চেক করার জন্য (ডিবাগিং)
    console.log("Current Logged-in User ID:", userId);

    if (!userId) {
      console.error("Clerk: No User ID found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { businessName, category, location } = await req.json();

    // ২. প্রোফাইল থেকে ক্রেডিট চেক
    const { data: profiles, error: dbError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId) // আপনার ডাটাবেস অনুযায়ী 'id' কলামে userId চেক হচ্ছে
      .limit(1);

    // ডাটা না পাওয়ার এরর হ্যান্ডলিং
    if (dbError || !profiles || profiles.length === 0) {
      console.error("Supabase Error:", dbError?.message);
      return NextResponse.json({ 
        error: "No profile found!", 
        details: dbError?.message,
        triedId: userId 
      }, { status: 403 });
    }

    const profile = profiles[0];

    // ক্রেডিট চেক
    if (profile.credits <= 0) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 403 });
    }

    // ৩. AI জেনারেশন (আপনার এভেলেবল লেটেস্ট মডেল)
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `Write a professional 2-line cold email for ${businessName} in ${location} regarding ${category} SEO. Offer a free audit. Start with Subject:`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    if (text) {
      // ৪. সফল হলে ক্রেডিট ১ কমিয়ে দেওয়া
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ credits: profile.credits - 1 })
        .eq('id', userId);
      
      if (updateError) {
        console.error("Update Credit Error:", updateError.message);
      }

      return NextResponse.json({ email: text });
    } else {
      throw new Error("AI returned empty text");
    }

  } catch (error: any) {
    console.error("FULL ERROR LOG:", error.message);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}