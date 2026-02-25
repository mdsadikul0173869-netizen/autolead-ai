import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { keyword, location } = await req.json();
    const query = `${keyword} in ${location}`;
    const apiKey = process.env.SERPER_API_KEY;

    console.log("--- SCANNING STARTED ---");
    console.log("Searching for:", query);

    // আমরা Serper-কে বলছি ২০টি রেজাল্ট দিতে (num: 20) 
    // আপনি চাইলে লুপ চালিয়ে আরও বেশি আনতে পারেন, তবে Serper-এ ক্রেডিট খরচ বাড়বে
    const response = await fetch('https://google.serper.dev/maps', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        q: query,
        num: 20    
      }),
    });

    const data = await response.json();

    if (!data.places || data.places.length === 0) {
      console.log("RESULT: No leads found.");
      return NextResponse.json({ leads: [] });
    }

    console.log(`RESULT: Found ${data.places.length} potential leads.`);

    // ডাটা ফরম্যাট ঠিক করা
    const leads = data.places.map((place: any) => ({
      name: place.title || "Unknown Business",
      address: place.address || "No Address",
      phone: place.phoneNumber || "No Phone",
      website: place.website || "",
      category: keyword,
      rating: place.rating || 0, // বায়ারকে দেখানোর জন্য এক্সট্রা ডাটা
      reviews: place.ratingCount || 0
    }));

    console.log("--- SCANNING COMPLETE ---");
    
    // মনে রাখবেন: এই ফাইলটি শুধু ডাটা খুঁজে আনছে (Scrape করছে)। 
    // ডাটাবেসে সেভ করার কাজটা আপনার Frontend (Dashboard.js) বা অন্য একটি API-তে হতে হবে।
    return NextResponse.json({ leads });

  } catch (error: any) {
    console.error("CRITICAL ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}