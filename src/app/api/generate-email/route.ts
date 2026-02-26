import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server"; 
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { businessName, category, location } = await req.json();

    const { data: profiles, error: dbError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId) 
      .limit(1);

    if (dbError || !profiles || profiles.length === 0) {
      return NextResponse.json({ error: "No profile found!" }, { status: 403 });
    }

    const profile = profiles[0];

    if (profile.credits <= 0) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 403 });
    }

    // ✅ মডেলের নাম gemini-1.5-flash ব্যবহার করুন
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // ✅ SEO স্পেসিফিক প্রোম্পট
    const prompt = `Write a high-converting 2-line cold email for a business named ${businessName} in ${location}. 
    They are in the ${category} industry. 
    Pitch: I help businesses like yours dominate local search results. 
    Offer: A free 10-minute SEO audit. 
    Include a short Subject line at the beginning.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    if (text) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ credits: profile.credits - 1 })
        .eq('id', userId);
      
      return NextResponse.json({ email: text });
    } else {
      throw new Error("AI returned empty text");
    }

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}