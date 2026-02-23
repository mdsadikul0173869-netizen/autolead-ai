"use client";

import React, { useEffect, useState } from "react";
import { Download, Loader2, Database, Sparkles, Copy, X, CheckCircle, Zap, MessageSquare, Send, MailCheck, Trash2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";

export default function MyLeadsPage() {
  const { user, isLoaded } = useUser();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectedAccount, setConnectedAccount] = useState<any>(null);
  
  // Bulk Selection States
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [isBulkSending, setIsBulkSending] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);

  // AI Modal States
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

  // --- BULK SEND LOGIC (New Feature) ---
  const handleBulkSend = async () => {
    if (selectedLeadIds.length === 0) return alert("Select leads first!");
    if (!confirm(`Are you sure you want to send AI emails to ${selectedLeadIds.length} leads?`)) return;

    setIsBulkSending(true);
    setBulkProgress(0);

    for (let i = 0; i < selectedLeadIds.length; i++) {
      const leadId = selectedLeadIds[i];
      const lead = leads.find(l => l.id === leadId);

      if (lead && lead.email && lead.email !== "N/A") {
        try {
          // ১. AI ইমেইল জেনারেট করা
          const aiRes = await fetch("/api/generate-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ businessName: lead.name, category: lead.category, location: lead.address, tone: "professional" }),
          });
          const aiData = await aiRes.json();

          // ২. ইমেইল পাঠানো
          await fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: lead.email,
              subject: `Inquiry for ${lead.name}`,
              message: aiData.email,
              smtpConfig: connectedAccount ? {
                host: connectedAccount.smtp_host,
                port: connectedAccount.smtp_port,
                user: connectedAccount.smtp_user,
                pass: connectedAccount.smtp_pass,
                senderName: user?.fullName || "AutoLead Pro"
              } : null
            }),
          });

          // ৩. স্ট্যাটাস আপডেট
          await supabase.from('leads').update({ status: 'Contacted' }).eq('id', lead.id);
        } catch (err) {
          console.error(`Failed to send to ${lead.name}`);
        }
      }
      setBulkProgress(Math.round(((i + 1) / selectedLeadIds.length) * 100));
    }

    setIsBulkSending(false);
    alert("Bulk outreach complete!");
    fetchLeads();
    setSelectedLeadIds([]);
  };

  const toggleSelectAll = () => {
    if (selectedLeadIds.length === leads.length) setSelectedLeadIds([]);
    else setSelectedLeadIds(leads.map(l => l.id));
  };

  const toggleLeadSelection = (id: string) => {
    setSelectedLeadIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // --- SINGLE SEND LOGIC (Keep existing) ---
  const handleGenerateEmail = async () => {
    if (!selectedLead) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName: selectedLead.name, category: selectedLead.category, location: selectedLead.address, tone: selectedTone }),
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
          subject: `Inquiry: ${selectedLead.name}`,
          message: generatedEmail,
          smtpConfig: connectedAccount ? {
            host: connectedAccount.smtp_host, port: connectedAccount.smtp_port, 
            user: connectedAccount.smtp_user, pass: connectedAccount.smtp_pass,
            senderName: user?.fullName || "AutoLead Pro"
          } : null
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
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Bulk Action Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-red-600/5 p-6 rounded-3xl border border-red-600/10">
            <div>
              <h2 className="text-xl font-black italic uppercase tracking-tighter">Bulk <span className="text-red-600">Outreach</span></h2>
              <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1 tracking-widest">{selectedLeadIds.length} leads selected</p>
            </div>
            <div className="flex gap-4">
              <button onClick={handleBulkSend} disabled={isBulkSending || selectedLeadIds.length === 0} className="bg-red-600 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 disabled:opacity-20 transition-all flex items-center gap-2">
                {isBulkSending ? <Loader2 className="animate-spin" size={14}/> : <Zap size={14}/>}
                {isBulkSending ? `Sending (${bulkProgress}%)` : "Launch Bulk Campaign"}
              </button>
            </div>
        </div>

        {/* Table Controls */}
        <div className="flex justify-between items-center mb-6 px-4">
          <div className="flex items-center gap-3">
             <input type="checkbox" checked={selectedLeadIds.length === leads.length} onChange={toggleSelectAll} className="w-4 h-4 rounded accent-red-600" />
             <span className="text-[10px] font-black uppercase text-zinc-500">Select All</span>
          </div>
          <button onClick={() => {if(confirm('Clear database?')) supabase.from('leads').delete().eq('user_id', user?.id).then(()=>fetchLeads())}} className="text-zinc-600 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
        </div>

        {/* Lead Table */}
        <div className="bg-[#111111] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 border-b border-white/5 text-zinc-500">
                  <th className="p-6 w-12"></th>
                  <th className="p-6 font-black text-[10px] uppercase tracking-widest">Prospect</th>
                  <th className="p-6 font-black text-[10px] uppercase tracking-widest">Contact Info</th>
                  <th className="p-6 font-black text-[10px] uppercase tracking-widest text-center">Action</th>
                  <th className="p-6 font-black text-[10px] uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leads.map((lead) => (
                  <tr key={lead.id} className={`hover:bg-white/[0.01] transition-all group ${selectedLeadIds.includes(lead.id) ? 'bg-red-600/[0.02]' : ''}`}>
                    <td className="p-6">
                      <input type="checkbox" checked={selectedLeadIds.includes(lead.id)} onChange={() => toggleLeadSelection(lead.id)} className="w-4 h-4 rounded accent-red-600" />
                    </td>
                    <td className="p-6">
                      <div className="font-black text-white text-lg group-hover:text-red-500 italic uppercase leading-none">{lead.name}</div>
                      <div className="text-[9px] text-zinc-600 font-bold uppercase mt-1">{lead.category} • {lead.address?.slice(0, 20)}...</div>
                    </td>
                    <td className="p-6">
                      <div className="text-xs font-bold text-zinc-400 flex items-center gap-1"><MailCheck size={12} className="text-red-600"/> {lead.email || "—"}</div>
                      <div className="text-[10px] text-zinc-600 mt-1">{lead.phone || "No Phone"}</div>
                    </td>
                    <td className="p-6 text-center">
                      <button onClick={() => {setSelectedLead(lead); setIsModalOpen(true);}} className="bg-white/5 text-zinc-400 border border-white/10 px-4 py-2 rounded-xl hover:bg-red-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest">
                        Magic Write
                      </button>
                    </td>
                    <td className="p-6">
                       <span className={`text-[8px] font-black px-2 py-1 rounded-md uppercase border ${lead.status === 'Contacted' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-zinc-900 text-zinc-600 border-white/5'}`}>
                         {lead.status || 'New'}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Single Email Modal (Keep existing logic) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="bg-[#111111] rounded-[2.5rem] w-full max-w-2xl shadow-2xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2"><Sparkles size={16} className="text-red-600"/> AI Draft for {selectedLead?.name}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={20}/></button>
            </div>
            <div className="p-8">
              {!generatedEmail && !isGenerating ? (
                <button onClick={handleGenerateEmail} className="w-full py-20 border-2 border-dashed border-white/5 rounded-3xl text-zinc-600 font-black uppercase text-xs hover:border-red-600/50 hover:text-red-500 transition-all">Generate AI Message</button>
              ) : isGenerating ? (
                <div className="py-20 text-center"><Loader2 className="animate-spin text-red-600 mx-auto mb-4" /><p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">AI is thinking...</p></div>
              ) : (
                <>
                  <textarea className="w-full h-64 p-6 bg-black/50 border border-white/5 rounded-2xl text-sm text-zinc-300 focus:outline-none focus:border-red-600/30" value={generatedEmail} onChange={(e) => setGeneratedEmail(e.target.value)} />
                  <button onClick={handleSendEmail} disabled={isSending} className="w-full mt-6 bg-red-600 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-2">
                    {isSending ? <Loader2 className="animate-spin" size={16}/> : <Send size={16}/>} Send Now
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}