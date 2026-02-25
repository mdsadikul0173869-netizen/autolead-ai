import { NextResponse } from 'next/server';
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const leadId = searchParams.get('leadId');

  if (leadId) {
    // ডাটাবেসে স্ট্যাটাস আপডেট করা
    await supabase
      .from('leads')
      .update({ status: 'Opened', opened_at: new Date().toISOString() })
      .eq('id', leadId);
  }

  // একটি অদৃশ্য ১x১ পিক্সেল স্বচ্ছ ইমেজ রিটার্ন করা
  const pixel = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
  );

  return new NextResponse(pixel, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    },
  });
}