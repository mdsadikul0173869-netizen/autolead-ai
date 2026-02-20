import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { businessName, category, location } = await req.json();

    // AI এর পরিবর্তে একটি সুন্দর প্রফেশনাল ডেমো মেসেজ
    const demoEmail = `Subject: Business Proposal for ${businessName}

Hi ${businessName} Team,

I noticed your impressive work in the ${category} industry in ${location}. 

We specialize in helping businesses like yours scale through high-quality lead generation and automated outreach systems. I would love to share how we can help you get more clients this month.

Are you available for a quick 5-minute chat next week?

Best regards,
[Your Name]`;

    // একটু সময় নিয়ে রেসপন্স পাঠানো যাতে মনে হয় AI প্রসেস করছে
    await new Promise(resolve => setTimeout(resolve, 800));

    return NextResponse.json({ email: demoEmail });

  } catch (error: any) {
    return NextResponse.json({ error: "Failed to generate demo" }, { status: 500 });
  }
}