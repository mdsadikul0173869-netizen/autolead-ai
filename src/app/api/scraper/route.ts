import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { keyword, location } = await req.json();
    const query = `${keyword} in ${location}`;
    const apiKey = process.env.SERPER_API_KEY;

    // --- DEBUG START ---
    console.log("--- SCANNING STARTED ---");
    console.log("Searching for:", query);
    // --- DEBUG END ---

    const response = await fetch('https://google.serper.dev/maps', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: query }),
    });

    const data = await response.json();

    // --- DEBUG DATA ---
    console.log("API Response Keys:", Object.keys(data));
    
    // Serper এখন 'places' কি (key) ব্যবহার করে, তাই আমরা সেটি চেক করছি
    if (!data.places || data.places.length === 0) {
      console.log("RESULT: No leads found in 'places' array.");
      return NextResponse.json({ leads: [] });
    }

    console.log(`RESULT: Found ${data.places.length} potential leads.`);

    const leads = data.places.map((place: any) => ({
      name: place.title || "Unknown Business",
      address: place.address || "No Address",
      phone: place.phoneNumber || "No Phone",
      website: place.website || "",
      category: keyword
    }));

    console.log("--- SCANNING COMPLETE ---");
    return NextResponse.json({ leads });

  } catch (error: any) {
    console.error("CRITICAL ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}