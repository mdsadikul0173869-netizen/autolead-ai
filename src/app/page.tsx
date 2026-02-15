"use client";

import React from 'react';
import { Zap, Search, Target, Mail, ArrowRight, Shield, Globe, Star, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-red-600/30">
      
      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-red-600 p-1.5 rounded-lg"><Zap size={18} fill="white"/></div>
            <span className="font-black italic uppercase tracking-tighter text-xl">AutoLead <span className="text-red-600">Pro</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <Link href="/dashboard" className="bg-white text-black px-6 py-2.5 rounded-full hover:bg-red-600 hover:text-white transition-all shadow-xl shadow-white/5">Launch App</Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-red-600/10 blur-[120px] rounded-full -z-10 opacity-50"></div>
        
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 animate-bounce">
            <Star size={12} className="text-yellow-500 fill-yellow-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Next-Gen Lead Generation</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.9] mb-8">
            Stop Searching. <br />
            <span className="text-red-600">Start Closing.</span>
          </h1>
          
          <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            The all-in-one AI engine that scrapes Google Maps, enriches lead data, and sends hyper-personalized outreach—all on autopilot.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard" className="w-full sm:w-auto bg-red-600 px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-2xl shadow-red-600/20 group">
              Get Started Free <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/scraper" className="w-full sm:w-auto bg-white/5 border border-white/10 px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-all">
              Live Demo
            </Link>
          </div>
        </div>
      </section>

      {/* --- FEATURE GRID (Section A, B, C from BRD) --- */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Search className="text-red-600" />}
            title="Maps Scraper"
            desc="Extract thousands of B2B leads from Google Maps with emails and phone numbers in seconds."
          />
          <FeatureCard 
            icon={<Zap className="text-yellow-500" />}
            title="AI Magic Write"
            desc="Our AI analyzes the lead's business and writes a unique, personalized email for every prospect."
          />
          <FeatureCard 
            icon={<Mail className="text-blue-500" />}
            title="Direct SMTP"
            desc="Connect your own Gmail or Outlook and send outreach directly from the dashboard."
          />
        </div>
      </section>

      {/* --- SOCIAL PROOF / TRUST --- */}
      <section className="py-20 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
           <span className="text-2xl font-black italic uppercase tracking-tighter">TRUSTED BY AGENCIES</span>
           <span className="text-2xl font-black italic uppercase tracking-tighter text-red-600">SMMA PRO</span>
           <span className="text-2xl font-black italic uppercase tracking-tighter">LEAD GEN MASTERS</span>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-red-600 p-1.5 rounded-lg"><Zap size={18} fill="white"/></div>
            <span className="font-black italic uppercase tracking-tighter text-xl text-white">AutoLead</span>
          </div>
          <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">© 2026 Built for High-Performance Teams</p>
          <div className="flex gap-6">
            <Shield size={20} className="text-zinc-700 hover:text-white transition-colors cursor-pointer" />
            <Globe size={20} className="text-zinc-700 hover:text-white transition-colors cursor-pointer" />
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="p-10 bg-[#0A0A0A] border border-white/5 rounded-[3rem] hover:border-red-600/30 transition-all group">
      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
        {React.cloneElement(icon, { size: 28 })}
      </div>
      <h3 className="text-xl font-black uppercase italic mb-4">{title}</h3>
      <p className="text-zinc-500 text-sm font-medium leading-relaxed">{desc}</p>
    </div>
  );
}