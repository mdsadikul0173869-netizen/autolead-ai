"use client";

import React, { useState } from 'react';
import { Search, MapPin, Loader2, Zap, Mail, Sparkles, ExternalLink, X, Copy } from 'lucide-react';

export default function ScraperPage() {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  
  // এডিটিং এর জন্য নতুন স্টেট
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEmail, setCurrentEmail] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword || !location) return;
    setLoading(true);
    try {
      const response = await fetch('/api/scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, location }),
      });
      const data = await response.json();
      setResults(data.leads || []);
    } catch (err) {
      alert("Search failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleMagicWrite = async (leadName: string) => {
    setIsGenerating(true);
    setIsModalOpen(true);
    setCurrentEmail("AI is writing your masterpiece... Please wait.");
    
    try {
      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName: leadName, category: keyword, location }),
      });
      const data = await response.json();
      if (data.email) {
        setCurrentEmail(data.email);
      } else {
        setCurrentEmail("Failed to generate. You can write your own message here.");
      }
    } catch (error) {
      setCurrentEmail("Error occurred. Please type your email manually.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentEmail);
    alert("Email copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="max-w-5xl mx-auto">
        {/* SEARCH FORM (সংক্ষিপ্ত) */}
        <form onSubmit={handleSearch} className="bg-[#0A0A0A] p-8 rounded-[2rem] border border-white/5 mb-12 flex gap-4">
          <input 
            type="text" placeholder="Niche" value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 text-sm outline-none focus:border-red-600"
          />
          <input 
            type="text" placeholder="Location" value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 text-sm outline-none focus:border-red-600"
          />
          <button className="bg-red-600 px-8 rounded-xl font-bold uppercase text-[10px]">
            {loading ? <Loader2 className="animate-spin" /> : "Scrape"}
          </button>
        </form>

        {/* RESULTS */}
        <div className="space-y-4">
          {results.map((lead, i) => (
            <div key={i} className="p-6 bg-[#0A0A0A] border border-white/5 rounded-2xl flex justify-between items-center">
              <div>
                <h3 className="font-bold italic uppercase">{lead.name}</h3>
                <p className="text-[10px] text-zinc-500">{lead.website}</p>
              </div>
              <button 
                onClick={() => handleMagicWrite(lead.name)}
                className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-red-600 transition-all"
              >
                <Sparkles size={14} /> Magic Write
              </button>
            </div>
          ))}
        </div>

        {/* --- EDITABLE MODAL (পপ-আপ উইন্ডো) --- */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-[#0F0F0F] border border-white/10 w-full max-w-2xl rounded-[2rem] overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <Mail size={16} className="text-red-600" /> Edit Outreach Email
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={20}/></button>
              </div>
              
              <div className="p-6">
                <textarea 
                  value={currentEmail}
                  onChange={(e) => setCurrentEmail(e.target.value)}
                  className="w-full h-64 bg-black/40 border border-white/5 rounded-xl p-4 text-sm text-zinc-300 focus:outline-none focus:border-red-600/50 resize-none leading-relaxed"
                  placeholder="Type or edit your email here..."
                  disabled={isGenerating}
                />
                
                <div className="mt-6 flex gap-3">
                  <button 
                    onClick={copyToClipboard}
                    className="flex-1 bg-white/5 border border-white/10 py-4 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                  >
                    <Copy size={14} /> Copy to Clipboard
                  </button>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-red-600 py-4 rounded-xl text-[10px] font-black uppercase hover:bg-red-700 transition-all"
                  >
                    Save & Close
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