import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  const { userId, email } = await req.json();

  // ইউজার প্রোফাইল চেক বা তৈরি
  let { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (!profile) {
    const { data: newProfile } = await supabase
      .from('profiles')
      .insert([{ id: userId, email, credits: 10 }])
      .select()
      .single();
    profile = newProfile;
  }

  return NextResponse.json(profile);
}