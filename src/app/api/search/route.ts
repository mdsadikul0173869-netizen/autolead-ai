import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  
  // SerpApi Key (এটি আপনার SerpApi ড্যাশবোর্ড থেকে পাবেন)
  // আপাতত সরাসরি দিচ্ছি, পরে আমরা এটাকে সিকিউর করব
  const API_KEY = "521e30d90042175fad451c1153e92a87f42522d333733a1879e3cf42e23d10c8"; 

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(query)}&api_key=${API_KEY}`
    );
    
    const data = await response.json();

    // গুগল ম্যাপস থেকে আসা ডাটাগুলোকে আমাদের UI-এর জন্য সাজানো
    const formattedData = data.local_results?.map((item: any, index: number) => ({
      id: index,
      name: item.title,
      address: item.address || "Address not available",
      phone: item.phone || "No phone",
      website: item.website || "No website",
      email: "N/A", // গুগল সরাসরি ইমেইল দেয় না
    })) || [];

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Scraping Error:", error);
    return NextResponse.json({ error: 'Failed to fetch live data' }, { status: 500 });
  }
}