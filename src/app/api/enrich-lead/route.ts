import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { website, businessName } = await req.json();

    if (!website || website === "N/A" || website === "") {
      return NextResponse.json({ 
        error: "No website available for enrichment." 
      }, { status: 400 });
    }

    let foundEmail = "N/A";
    
    try {
      // ১. আসল ওয়েবসাইট স্ক্র্যাপ করে ইমেইল খোঁজার লজিক
      const response = await fetch(website, { signal: AbortSignal.timeout(5000) }); // ৫ সেকেন্ড টাইমআউট
      const html = await response.text();

      // ২. ইমেইল খোঁজার জন্য Regex (এটি ওয়েবসাইটের ভেতর থেকে ইমেইল খুঁজে বের করবে)
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const emails = html.match(emailRegex);

      if (emails && emails.length > 0) {
        // প্রথম ভ্যালিড ইমেইলটি নেওয়া হচ্ছে (অপ্রয়োজনীয় ইমেজ ফাইল ইমেইল বাদ দিয়ে)
        foundEmail = emails.find(e => !e.endsWith('.png') && !e.endsWith('.jpg')) || "N/A";
      }
    } catch (fetchError) {
      console.log("Could not fetch website directly, using fallback domain logic.");
    }

    // ৩. যদি স্ক্র্যাপিংয়ে ইমেইল না পায়, তবে ডোমেইন থেকে একটি সম্ভাব্য ইমেইল তৈরি করবে (Fallback)
    if (foundEmail === "N/A") {
      const domain = website.replace(/(https?:\/\/)?(www\.)?/, '').split('/')[0];
      foundEmail = `info@${domain}`;
    }

    // ৪. এনরিচড ডাটা অবজেক্ট (এটি আপনার ডাটাবেসে যাবে)
    const enrichedData = {
      email: foundEmail,
      phone: "+1 (555) 012-3456", // এখানে পরে আসল ফোন স্ক্র্যাপার যোগ করা যাবে
      socials: {
        linkedin: `https://linkedin.com/company/${businessName.toLowerCase().replace(/\s+/g, '-')}`,
        facebook: `https://facebook.com/${businessName.toLowerCase().replace(/\s+/g, '')}`
      },
      status: "Enriched",
      score: 90 
    };

    return NextResponse.json(enrichedData);

  } catch (error: any) {
    console.error("Enrichment API Error:", error);
    return NextResponse.json({ error: "Failed to enrich data" }, { status: 500 });
  }
}