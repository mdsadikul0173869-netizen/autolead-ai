"use client";

import React, { useState } from 'react';
import { Search, MapPin, Loader2, Zap, Mail, Sparkles, X, Copy, Database } from 'lucide-react';
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";

export default function ScraperPage() {
  const { user } = useUser();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEmail, setCurrentEmail] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword || !location || !user) return;
    setLoading(true);
    setResults([]);

    try {
      // ১. স্ক্র্যাপার ইঞ্জিন কল
      const response = await fetch('/api/scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, location }),
      });
      const data = await response.json();
      const rawLeads = data.leads || [];

      const processedLeads = [];

      for (const lead of rawLeads) {
        let enrichedEmail = "Searching...";
        let statusText = "Pending";

        // ২. ইমেইল ফাইন্ডার কল (যদি ওয়েবসাইট থাকে)
        if (lead.website && lead.website !== "") {
          try {
            const enrichRes = await fetch('/api/enrich-lead', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ website: lead.website, businessName: lead.name }),
            });
            const enrichedData = await enrichRes.json();
            if (enrichedData.email) {
              enrichedEmail = enrichedData.email;
              statusText = "Enriched";
            } else {
              enrichedEmail = "N/A";
              statusText = "Not Found";
            }
          } catch (err) {
            enrichedEmail = "N/A";
          }
        } else {
          enrichedEmail = "N/A";
          statusText = "No Website";
        }

        // ৩. সুপাবেস (Supabase) এ ডাটা সেভ - একদম নিখুঁত কলাম ম্যাপিং
        const finalLeadData = {
          user_id: user.id,
          name: lead.name || "Unknown Business",
          website: lead.website || "",
          email: enrichedEmail,
          phone: lead.phone || "No Phone",
          address: lead.address || location,
          category: keyword,
          status: statusText,
          // rating এবং reviews কলাম ফিক্স - Number এ কনভার্ট করা হয়েছে
          rating: lead.rating ? Number(lead.rating) : 0,
          reviews: lead.reviews ? Number(lead.reviews) : 0,
          created_at: new Date().toISOString(),
        };

        const { error: dbError } = await supabase
          .from('leads')
          .insert([finalLeadData]);

        if (dbError) {
          console.error("Database error for", lead.name, ":", dbError.message);
        }

        // রিয়েল-টাইম স্ক্রিনে দেখানোর জন্য
        processedLeads.push(finalLeadData);
        setResults([...processedLeads]); 
      }

    } catch (err) {
      console.error("Scraper crash:", err);
      alert("Search failed! Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleMagicWrite = async (leadName: string) => {
    setIsGenerating(true);
    setIsModalOpen(true);
    setCurrentEmail("AI is writing your masterpiece...");
    try {
      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName: leadName, category: keyword, location }),
      });
      const data = await response.json();
      setCurrentEmail(data.email || "Error generating email.");
    } catch (error) {
      setCurrentEmail("Manual entry required.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">Lead <span className="text-red-600">Extraction</span></h1>
          <p className="text-zinc-500 text-sm mt-2 font-bold uppercase tracking-widest">Find, Enrich, and Save leads automatically.</p>
        </div>

        <form onSubmit={handleSearch} className="bg-[#0A0A0A] p-6 rounded-[2.5rem] border border-white/5 mb-10 flex flex-wrap md:flex-nowrap gap-4 shadow-2xl">
          <div className="flex-1 flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 focus-within:border-red-600 transition-all">
            <Zap size={18} className="text-red-600" />
            <input type="text" placeholder="Niche (e.g. Roofers)" value={keyword} onChange={(e) => setKeyword(e.target.value)} className="bg-transparent w-full p-4 text-sm outline-none" required />
          </div>
          <div className="flex-1 flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 focus-within:border-red-600 transition-all">
            <MapPin size={18} className="text-zinc-500" />
            <input type="text" placeholder="Location (e.g. Miami)" value={location} onChange={(e) => setLocation(e.target.value)} className="bg-transparent w-full p-4 text-sm outline-none" required />
          </div>
          <button disabled={loading} className="bg-red-600 hover:bg-red-700 px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50 w-full md:w-auto">
            {loading ? <Loader2 className="animate-spin" /> : <><Search size={16}/> Start Hunt</>}
          </button>
        </form>

        <div className="grid grid-cols-1 gap-4">
          {results.map((lead, i) => (
            <div key={i} className="p-6 bg-[#0A0A0A] border border-white/5 rounded-[2rem] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-red-600/30 transition-all group shadow-lg">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold uppercase italic text-lg tracking-tight">{lead.name}</h3>
                  <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase ${lead.status === 'Enriched' ? 'bg-green-500/10 text-green-500' : 'bg-white/5 text-zinc-500'}`}>
                    {lead.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1"><Mail size={12} className="text-red-600"/> {lead.email}</span>
                  <span className="flex items-center gap-1 text-zinc-400"><Database size={12}/> Auto-Saved</span>
                </div>
              </div>
              <button onClick={() => handleMagicWrite(lead.name)} className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-white hover:text-black transition-all flex items-center gap-2 w-full md:w-auto justify-center">
                <Sparkles size={14} className="text-yellow-500" /> Magic Write
              </button>
            </div>
          ))}
          
          {results.length === 0 && !loading && (
            <div className="text-center py-24 border-2 border-dashed border-white/5 rounded-[3rem]">
              <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-zinc-700" size={30} />
              </div>
              <p className="text-zinc-600 uppercase font-black tracking-widest text-xs">Ready for extraction. Enter a niche & location.</p>
            </div>
          )}
        </div>

        {/* --- AI EMAIL MODAL --- */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-[#0F0F0F] border border-white/10 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  <Mail size={16} className="text-red-600" /> Outreach Designer
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors"><X size={20}/></button>
              </div>
              <div className="p-8">
                <textarea 
                  value={currentEmail} 
                  onChange={(e) => setCurrentEmail(e.target.value)} 
                  className="w-full h-80 bg-black/50 border border-white/5 rounded-[2rem] p-8 text-sm text-zinc-300 focus:border-red-600/50 outline-none resize-none leading-relaxed font-medium" 
                  disabled={isGenerating} 
                />
                <div className="mt-8 flex gap-4">
                  <button 
                    onClick={() => {navigator.clipboard.writeText(currentEmail); alert("Copied to clipboard!");}} 
                    className="flex-1 bg-white/5 border border-white/10 py-5 rounded-2xl text-[10px] font-black uppercase hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                  >
                    <Copy size={16} /> Copy Text
                  </button>
                  <button 
                    onClick={() => setIsModalOpen(false)} 
                    className="flex-1 bg-red-600 py-5 rounded-2xl text-[10px] font-black uppercase hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                  >
                    Close Editor
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}