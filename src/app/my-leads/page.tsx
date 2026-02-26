"use client";

import React, { useEffect, useState } from "react";
import { 
  Loader2, Sparkles, X, Zap, MailCheck, Send, Play 
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";

export default function MyLeadsPage() {
  const { user, isLoaded } = useUser();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectedAccount, setConnectedAccount] = useState<any>(null);
  
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [isBulkSending, setIsBulkSending] = useState(false);
  const [currentProcessingIndex, setCurrentProcessingIndex] = useState(0);
  const [bulkStatus, setBulkStatus] = useState("Idle");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      fetchLeads();
      fetchSmtpSettings();
    }
  }, [user, isLoaded]);

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });
    if (!error) setLeads(data || []);
    setLoading(false);
  };

  const fetchSmtpSettings = async () => {
    const { data } = await supabase.from("email_accounts").select("*").eq("user_id", user?.id).limit(1).single();
    if (data) setConnectedAccount(data);
  };

  const openMagicWrite = (lead: any) => {
    setSelectedLead(lead);
    setGeneratedEmail("");
    setIsModalOpen(true);
  };

  const handleGenerateEmail = async () => {
    if (!selectedLead) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName: selectedLead.name, category: selectedLead.category, location: selectedLead.address, userId: user?.id }),
      });
      const data = await res.json();
      setGeneratedEmail(data.email || "AI failed to generate.");
    } catch (err) {
      setGeneratedEmail("Error connecting to AI.");
    } finally { setIsGenerating(false); }
  };

  const handleSendSingleEmail = async () => {
    if (!generatedEmail) return alert("Write something first!");
    setIsSending(true);
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: selectedLead.email, leadId: selectedLead.id, subject: `Inquiry: ${selectedLead.name}`, message: generatedEmail }),
      });
      if (res.ok) {
        await supabase.from('leads').update({ status: 'Contacted' }).eq('id', selectedLead.id);
        setIsModalOpen(false);
        fetchLeads();
      }
    } finally { setIsSending(false); }
  };

  const handleBulkSend = async () => {
    if (selectedLeadIds.length === 0) return alert("Please select leads first!");
    if (!connectedAccount) return alert("Connect SMTP first!");
    if (!confirm("Start Automation?")) return;

    setIsBulkSending(true);
    for (let i = 0; i < selectedLeadIds.length; i++) {
      setCurrentProcessingIndex(i + 1);
      const lead = leads.find(l => l.id === selectedLeadIds[i]);
      if (lead?.email) {
        setBulkStatus(`Processing ${lead.name}...`);
        try {
          const aiRes = await fetch("/api/generate-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ businessName: lead.name, category: lead.category, location: lead.address, userId: user?.id }),
          });
          const aiData = await aiRes.json();
          await fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ to: lead.email, leadId: lead.id, subject: `Inquiry`, message: aiData.email }),
          });
          await supabase.from('leads').update({ status: 'Contacted' }).eq('id', lead.id);
        } catch (e) { console.error(e); }
      }
      await new Promise(r => setTimeout(r, 2000));
    }
    setIsBulkSending(false);
    setBulkStatus("Idle");
    setCurrentProcessingIndex(0);
    fetchLeads();
    alert("Automation Finished!");
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-red-600" /></div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* AUTOMATION HEADER */}
        <div className="bg-[#0A0A0A] p-8 rounded-[2.5rem] border border-white/5 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl font-black uppercase italic">Lead <span className="text-red-600">Database</span></h1>
            <p className="text-[10px] text-zinc-500 uppercase mt-1 tracking-widest">Selected: {selectedLeadIds.length}</p>
          </div>

          <div className="flex flex-col items-end gap-3">
            <button 
              onClick={handleBulkSend} 
              disabled={isBulkSending || selectedLeadIds.length === 0}
              className="bg-white text-black px-8 py-4 rounded-2xl font-black text-[10px] uppercase hover:bg-red-600 hover:text-white transition-all flex items-center gap-2"
            >
              {isBulkSending ? <Loader2 className="animate-spin" size={16}/> : <Play size={16}/>}
              {isBulkSending ? 'Campaign Running...' : 'Launch Automation'}
            </button>
            
            {/* 🚀 PROGRESS PERCENTAGE ADDED HERE */}
            {isBulkSending && (
              <div className="w-full flex items-center gap-3">
                <span className="text-[10px] font-black text-red-600">{Math.round((currentProcessingIndex / selectedLeadIds.length) * 100)}%</span>
                <div className="w-48 bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-red-600 h-full transition-all duration-500" 
                    style={{ width: `${(currentProcessingIndex / selectedLeadIds.length) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 🚀 CURRENT STATUS BAR ADDED HERE */}
        {isBulkSending && (
          <div className="mb-8 p-4 bg-red-600/5 border border-red-600/20 rounded-2xl animate-pulse">
            <p className="text-[10px] font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
              <Sparkles size={14} /> Current Task: <span className="text-white">{bulkStatus}</span>
            </p>
          </div>
        )}

        {/* TABLE */}
        <div className="bg-[#0A0A0A] rounded-[2.5rem] border border-white/5 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-zinc-500 text-[10px] uppercase font-black">
                <th className="p-8 w-12 text-center">
                    <input type="checkbox" onChange={(e) => e.target.checked ? setSelectedLeadIds(leads.map(l => l.id)) : setSelectedLeadIds([])} className="accent-red-600" />
                </th>
                <th className="p-8">Company</th>
                <th className="p-8 text-center">Action</th>
                <th className="p-8 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-white/[0.01]">
                  <td className="p-8 text-center">
                    <input 
                      type="checkbox" 
                      checked={selectedLeadIds.includes(lead.id)} 
                      onChange={() => setSelectedLeadIds(prev => prev.includes(lead.id) ? prev.filter(i => i !== lead.id) : [...prev, lead.id])}
                      className="accent-red-600"
                    />
                  </td>
                  <td className="p-8">
                    <div className="font-black text-lg uppercase italic">{lead.name}</div>
                    <div className="text-[10px] text-zinc-500 font-bold">{lead.email}</div>
                  </td>
                  <td className="p-8 text-center">
                    <button 
                      onClick={() => openMagicWrite(lead)}
                      className="bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl hover:bg-red-600 text-[10px] font-black uppercase transition-all"
                    >
                      Magic Write
                    </button>
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex flex-col items-end gap-1">
                        <span className={`text-[9px] font-black px-4 py-1.5 rounded-full uppercase border ${lead.status === 'Opened' ? 'text-green-500 border-green-500/20 bg-green-500/5' : 'text-red-500 border-red-600/20 bg-red-600/5'}`}>
                            {lead.status === 'Opened' ? 'Read' : lead.status || 'New'}
                        </span>
                        {lead.status === 'Opened' && lead.opened_at && (
                            <span className="text-[8px] text-zinc-600 font-bold uppercase">Seen at {new Date(lead.opened_at).toLocaleTimeString()}</span>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL (Magic Write) - No changes needed here */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="bg-[#0F0F0F] rounded-[2.5rem] w-full max-w-2xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <h2 className="text-sm font-black uppercase italic flex items-center gap-2">
                <Sparkles size={18} className="text-red-600"/> AI Content Generator
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="bg-white/5 p-2 rounded-full hover:bg-red-600 transition-colors">
                <X size={18}/>
              </button>
            </div>
            
            <div className="p-10 text-center">
              {isGenerating ? (
                <div className="py-10">
                    <Loader2 className="animate-spin mx-auto text-red-600" size={32} />
                    <p className="mt-4 text-[9px] font-black uppercase tracking-tighter text-zinc-500">Generating SEO Pitch...</p>
                </div>
              ) : generatedEmail ? (
                <div className="text-left animate-in fade-in zoom-in duration-300">
                  <textarea 
                    className="w-full h-64 p-5 bg-black/40 border border-white/10 rounded-2xl text-zinc-300 text-sm focus:outline-none focus:border-red-600" 
                    value={generatedEmail} 
                    onChange={(e) => setGeneratedEmail(e.target.value)} 
                  />
                  <button 
                    onClick={handleSendSingleEmail} 
                    disabled={isSending} 
                    className="w-full mt-6 bg-red-600 py-4 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2"
                  >
                    {isSending ? <Loader2 className="animate-spin" size={16}/> : <Send size={16}/>}
                    Send Now
                  </button>
                </div>
              ) : (
                <button onClick={handleGenerateEmail} className="bg-white text-black px-10 py-4 rounded-xl font-black text-[10px] uppercase hover:scale-105 transition-transform">
                  Generate AI Draft
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}