import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // ১. ফ্রন্টএন্ড থেকে পাঠানো Keyword এবং Location রিসিভ করা
    const { keyword, location } = await req.json();
    
    if (!keyword || !location) {
      return NextResponse.json({ error: "Keyword and location are required" }, { status: 400 });
    }

    const query = `${keyword} in ${location}`;

    // ২. Serper.dev (Google Maps API) এ রিকোয়েস্ট পাঠানো
    const response = await fetch('https://google.serper.dev/maps', {
      method: 'POST',
      headers: {
        'X-API-KEY': process.env.SERPER_API_KEY || '', // আপনার .env থেকে কী নিবে
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: query }),
    });

    if (!response.ok) {
      throw new Error(`Serper API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // ৩. গুগল থেকে আসা অগোছালো ডাটাকে আমাদের অ্যাপের ফরম্যাটে সাজানো
    const leads = data.maps?.map((place: any) => ({
      name: place.title || "Unknown Business",
      address: place.address || "No Address Provided",
      phone: place.phoneNumber || "No Phone",
      email: "Finding email...", // গুগল ম্যাপ সরাসরি ইমেইল দেয় না, আমরা ডেমো টেক্সট রাখছি
      website: place.website || "",
      rating: place.rating || 0,
      category: keyword
    })) || [];

    // ৪. সাজানো ডাটাগুলো ফ্রন্টএন্ডে পাঠানো
    return NextResponse.json({ leads });

  } catch (error: any) {
    console.error("Scraper Error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch data from Google Maps", details: error.message }, 
      { status: 500 }
    );
  }
}