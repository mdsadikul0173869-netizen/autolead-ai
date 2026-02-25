"use client";

import React, { useEffect, useState } from "react";
import { 
  Download, Loader2, Database, Sparkles, Copy, X, CheckCircle, 
  Zap, MessageSquare, Send, MailCheck, Trash2, Play, Pause, AlertCircle 
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
  const [selectedTone, setSelectedTone] = useState("professional");

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

  // --- 🚀 BULK AUTOMATION WITH TRACKING ---
  const handleBulkSend = async () => {
    if (selectedLeadIds.length === 0) return alert("Select leads first!");
    if (!connectedAccount) return alert("Please connect an SMTP account in settings!");
    
    if (!confirm(`Launch AI Automation for ${selectedLeadIds.length} leads?`)) return;

    setIsBulkSending(true);
    setBulkStatus("Running");

    for (let i = 0; i < selectedLeadIds.length; i++) {
      setCurrentProcessingIndex(i + 1);
      const leadId = selectedLeadIds[i];
      const lead = leads.find(l => l.id === leadId);

      if (lead && lead.email && lead.email !== "N/A") {
        try {
          setBulkStatus(`Drafting for ${lead.name}...`);
          
          const aiRes = await fetch("/api/generate-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              businessName: lead.name, category: lead.category, 
              location: lead.address, tone: "professional", userId: user?.id 
            }),
          });
          const aiData = await aiRes.json();
          if (!aiRes.ok) throw new Error("AI Failed");

          setBulkStatus(`Sending to ${lead.name}...`);

          const sendRes = await fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: lead.email,
              leadId: lead.id, // ট্র্যাকিং এর জন্য leadId পাঠানো হচ্ছে
              subject: `Inquiry for ${lead.name}`,
              message: aiData.email,
            }),
          });

          if (sendRes.ok) {
            await supabase.from('leads').update({ status: 'Contacted' }).eq('id', lead.id);
            setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: 'Contacted' } : l));
          }
        } catch (err) { console.error(err); }
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    setIsBulkSending(false);
    setBulkStatus("Completed");
    setSelectedLeadIds([]);
    fetchLeads(); // স্ট্যাটাস রিফ্রেশ
  };

  const toggleSelectAll = () => {
    if (selectedLeadIds.length === leads.length) setSelectedLeadIds([]);
    else setSelectedLeadIds(leads.map(l => l.id));
  };

  const toggleLeadSelection = (id: string) => {
    setSelectedLeadIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // --- SINGLE SEND WITH TRACKING ---
  const handleGenerateEmail = async () => {
    if (!selectedLead) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName: selectedLead.name, category: selectedLead.category, location: selectedLead.address, tone: selectedTone, userId: user?.id }),
      });
      const data = await res.json();
      setGeneratedEmail(data.email || "Failed to generate.");
    } finally { setIsGenerating(false); }
  };

  const handleSendEmail = async () => {
    if (!selectedLead.email || selectedLead.email === "N/A") return alert("No email.");
    setIsSending(true);
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: selectedLead.email,
          leadId: selectedLead.id, // ট্র্যাকিং পিক্সেল জেনারেট করার জন্য
          subject: `Inquiry: ${selectedLead.name}`,
          message: generatedEmail,
        }),
      });
      if (res.ok) {
        await supabase.from('leads').update({ status: 'Contacted' }).eq('id', selectedLead.id);
        setIsModalOpen(false);
        fetchLeads();
      }
    } finally { setIsSending(false); }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* AUTOMATION HEADER */}
        <div className="bg-[#0A0A0A] p-8 rounded-[2.5rem] border border-white/5 mb-8 shadow-2xl relative overflow-hidden group">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
            <div>
               <div className="flex items-center gap-2 text-red-600 mb-2">
                  <Zap size={18} className="fill-red-600 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">AI Outreach Engine</span>
               </div>
               <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Lead <span className="text-red-600">Database</span></h1>
            </div>

            <div className="flex flex-col items-end gap-3">
               <button onClick={handleBulkSend} disabled={isBulkSending || selectedLeadIds.length === 0} className={`px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${isBulkSending ? 'bg-zinc-800 text-zinc-500' : 'bg-white text-black hover:bg-red-600 hover:text-white shadow-[0_0_30px_rgba(220,38,38,0.2)]'}`}>
                 {isBulkSending ? <Loader2 className="animate-spin" size={16}/> : <Play size={16}/>}
                 {isBulkSending ? 'Campaign in Progress...' : 'Launch AI Automation'}
               </button>
               {isBulkSending && (
                 <div className="w-full flex items-center gap-3 mt-2">
                    <span className="text-[9px] font-black text-red-500 uppercase">{Math.round((currentProcessingIndex/selectedLeadIds.length)*100)}%</span>
                    <div className="flex-1 bg-white/5 h-1.5 rounded-full overflow-hidden w-48"><div className="bg-red-600 h-full transition-all duration-500" style={{ width: `${(currentProcessingIndex / selectedLeadIds.length) * 100}%` }}/></div>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Status Tracker */}
        {isBulkSending && (
          <div className="flex items-center gap-3 mb-6 bg-red-600/10 border border-red-600/20 p-4 rounded-2xl">
             <Loader2 size={16} className="text-red-600 animate-spin" />
             <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Current Action: <span className="text-white">{bulkStatus}</span></p>
          </div>
        )}

        {/* Table */}
        <div className="bg-[#0A0A0A] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 border-b border-white/5 text-zinc-500">
                  <th className="p-8 w-12"><input type="checkbox" checked={selectedLeadIds.length === leads.length && leads.length > 0} onChange={toggleSelectAll} className="w-4 h-4 rounded accent-red-600" /></th>
                  <th className="p-8 font-black text-[10px] uppercase tracking-[0.2em]">Prospect Identity</th>
                  <th className="p-8 font-black text-[10px] uppercase tracking-[0.2em]">Communication</th>
                  <th className="p-8 font-black text-[10px] uppercase tracking-[0.2em] text-center">AI Logic</th>
                  <th className="p-8 font-black text-[10px] uppercase tracking-[0.2em] text-right">Outreach Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/[0.02] transition-all group">
                    <td className="p-8"><input type="checkbox" checked={selectedLeadIds.includes(lead.id)} onChange={() => toggleLeadSelection(lead.id)} className="w-4 h-4 rounded accent-red-600" /></td>
                    <td className="p-8">
                      <div className="font-black text-white text-xl italic uppercase tracking-tighter group-hover:text-red-500 transition-colors">{lead.name}</div>
                      <div className="text-[9px] text-zinc-500 font-bold uppercase mt-1">{lead.category}</div>
                    </td>
                    <td className="p-8">
                      <div className="text-xs font-bold text-zinc-300 flex items-center gap-2"><MailCheck size={14} className="text-red-600"/> {lead.email || "N/A"}</div>
                    </td>
                    <td className="p-8 text-center">
                      <button onClick={() => {setSelectedLead(lead); setIsModalOpen(true);}} className="bg-white/5 text-white border border-white/10 px-6 py-3 rounded-2xl hover:bg-red-600 transition-all font-black text-[10px] uppercase tracking-widest">Magic Write</button>
                    </td>
                    <td className="p-8 text-right">
                       <div className="flex flex-col items-end gap-1">
                          <span className={`text-[9px] font-black px-4 py-1.5 rounded-full uppercase border transition-all ${
                            lead.status === 'Opened' 
                            ? 'bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
                            : lead.status === 'Contacted' 
                            ? 'bg-red-600/10 text-red-500 border-red-600/20 shadow-[0_0_15px_rgba(220,38,38,0.1)]' 
                            : 'bg-zinc-900 text-zinc-600 border-white/5'
                          }`}>
                            {lead.status === 'Opened' ? 'Read / Opened' : lead.status || 'New'}
                          </span>
                          {lead.opened_at && (
                            <span className="text-[8px] text-zinc-600 mt-1 uppercase font-bold">
                              Seen at: {new Date(lead.opened_at).toLocaleTimeString()}
                            </span>
                          )}
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL (Same as before but with leadId logic) */}
      {/* ... (Modal content unchanged from previous logic) ... */}
    </div>
  );
}