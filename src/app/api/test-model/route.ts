import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "API Key missing in .env.local" });

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // গুগল থেকে আপনার কি (Key) এর আন্ডারে থাকা সব মডেলের লিস্ট আনবে
    // উল্লেখ্য: এই মেথডটি কাজ করার জন্য SDK লেটেস্ট হওয়া জরুরি
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    console.log("--- AVAILABLE MODELS ---");
    console.log(data);

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}