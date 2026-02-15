"use client";

import React, { useState } from 'react';
import { Search, MapPin, Loader2, Zap, Database, Mail, Sparkles } from 'lucide-react';
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";

export default function MockScraperPage() {
  const { user } = useUser();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [status, setStatus] = useState("");
  const [isGenerating, setIsGenerating] = useState<number | null>(null);

  const handleMockSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword || !location) return;

    setLoading(true);
    setStatus("Connecting to AI Nodes...");
    await new Promise(resolve => setTimeout(resolve, 1500));
    setStatus(`Extracting ${keyword} in ${location}...`);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockLeads = [
      { name: `${keyword} Solution Ltd`, address: `123 Business Bay, ${location}`, phone: "+1 234 567 890", email: "contact@solution.com" },
      { name: `Elite ${keyword} Group`, address: `456 Downtown St, ${location}`, phone: "+1 987 654 321", email: "info@elitegroup.com" },
      { name: `The ${location} ${keyword} Co`, address: `789 Industrial Area, ${location}`, phone: "+1 555 010 999", email: "hello@theco.io" },
    ];

    setResults(mockLeads);
    setStatus("Extraction Complete!");

    try {
      const leadsWithUserId = mockLeads.map((lead: any) => ({
        ...lead,
        user_id: user?.id,
        status: 'New',
        category: keyword
      }));
      await supabase.from('leads').insert(leadsWithUserId);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  // --- MAGIC WRITE FUNCTION ---
  const handleMagicWrite = async (index: number, leadName: string) => {
    setIsGenerating(index);
    try {
      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: leadName,
          category: keyword,
          location: location,
          tone: "professional"
        }),
      });

      const data = await response.json();
      
      // ফলাফলটি একটি এলার্ট বক্সে দেখাচ্ছি (বায়ারকে ডেমো দেখানোর জন্য এটি যথেষ্ট)
      alert(`AI GENERATED EMAIL FOR: ${leadName}\n\n${data.email}`);
      
    } catch (error) {
      alert("AI is busy, please try again.");
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3 mb-4">
               <div className="bg-red-600 p-2 rounded-xl"><Zap size={24}/></div>
               <h1 className="text-4xl font-black uppercase italic tracking-tighter">AutoLead <span className="text-red-600">Pro</span></h1>
            </div>
            <p className="text-zinc-500 font-medium uppercase text-[10px] tracking-widest">Next-Gen Lead Extraction & AI Outreach</p>
          </div>
        </header>

        {/* SEARCH FORM */}
        <div className="bg-[#0A0A0A] p-10 rounded-[3rem] border border-white/5 shadow-2xl mb-10">
          <form onSubmit={handleMockSearch} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <input 
              type="text" placeholder="Niche (e.g. Dentists)" value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 px-6 focus:outline-none focus:border-red-600"
            />
            <input 
              type="text" placeholder="Location (e.g. London)" value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 px-6 focus:outline-none focus:border-red-600"
            />
            <button disabled={loading} className="md:col-span-2 bg-white text-black font-black uppercase py-6 rounded-2xl hover:bg-red-600 hover:text-white transition-all">
              {loading ? <Loader2 className="animate-spin mx-auto" /> : "Start Deep Extraction"}
            </button>
          </form>
          {status && <div className="mt-6 text-center text-[10px] font-black uppercase text-red-500 tracking-widest">{status}</div>}
        </div>

        {/* RESULTS TABLE */}
        {results.length > 0 && (
          <div className="bg-[#0A0A0A] rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <Database size={16} className="text-green-500" /> Extracted Prospects
              </h3>
            </div>
            <div>
              {results.map((lead, i) => (
                <div key={i} className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 hover:bg-white/[0.02] transition-all">
                  <div className="flex-1">
                    <p className="text-lg font-black uppercase italic tracking-tight">{lead.name}</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">{lead.address}</p>
                  </div>
                  
                  {/* MAGIC WRITE BUTTON */}
                  <button 
                    onClick={() => handleMagicWrite(i, lead.name)}
                    disabled={isGenerating !== null}
                    className="flex items-center gap-3 bg-red-600/10 border border-red-600/20 px-6 py-3 rounded-xl text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                  >
                    {isGenerating === i ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    Magic Write
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}