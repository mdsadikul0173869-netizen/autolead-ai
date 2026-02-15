"use client";

import React, { useEffect, useState } from "react";
import { Download, Loader2, Database, Sparkles, Copy, X, CheckCircle, Zap, MessageSquare, Send, MailCheck } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";

export default function MyLeadsPage() {
  const { user, isLoaded } = useUser();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectedAccount, setConnectedAccount] = useState<any>(null);
  
  // AI Modal & Outreach States
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
    const { data } = await supabase
      .from("email_accounts")
      .select("*")
      .eq("user_id", user?.id)
      .limit(1)
      .single();
    if (data) setConnectedAccount(data);
  };

  const handleGenerateEmail = async () => {
    if (!selectedLead) return;
    setIsGenerating(true);
    setGeneratedEmail("");
    try {
      const res = await fetch("/api/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: selectedLead.name,
          category: selectedLead.category,
          location: selectedLead.address,
          tone: selectedTone
        }),
      });
      const data = await res.json();
      setGeneratedEmail(data.email || "Failed to generate email.");
    } catch (err) {
      setGeneratedEmail("AI Error. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Section C.15: Updated to use Global Env if Database setting is missing
  const handleSendEmail = async () => {
    // recipient email চেক করা
    if (!selectedLead.email || selectedLead.email === "—" || selectedLead.email === "N/A") {
      return alert("No recipient email address found for this lead.");
    }
    
    setIsSending(true);
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: selectedLead.email,
          subject: `Inquiry: ${selectedLead.name}`,
          message: generatedEmail,
          // যদি ডাটাবেসে সেটিংস না থাকে তবে null পাঠাবে, API তখন server env ব্যবহার করবে
          smtpConfig: connectedAccount ? {
            host: connectedAccount.smtp_host,
            port: connectedAccount.smtp_port,
            user: connectedAccount.smtp_user,
            pass: connectedAccount.smtp_pass,
            senderName: user?.fullName || "AutoLead Pro"
          } : null
        }),
      });

      const data = await res.json();

      if (res.ok) {
        await supabase.from('leads').update({ status: 'Contacted' }).eq('id', selectedLead.id);
        alert("Success! Magic email is on the way.");
        setIsModalOpen(false);
        fetchLeads();
      } else {
        alert(data.error || "SMTP Error. Check your App Password.");
      }
    } catch (err) {
      alert("Failed to connect to email server.");
    } finally {
      setIsSending(false);
    }
  };

  const openMagicWrite = (lead: any) => {
    setSelectedLead(lead);
    setGeneratedEmail("");
    setIsModalOpen(true);
  };

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Status", "Category"];
    const csvContent = [headers, ...leads.map(l => [l.name, l.email, l.status, l.category])].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "leads.csv";
    link.click();
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 bg-[#111111] p-8 rounded-[2rem] border border-white/5 shadow-2xl relative group">
           <div className="absolute top-0 right-0 p-8 opacity-5">
               <Zap size={120} className="text-red-600" />
           </div>
           <div className="relative z-10">
             <h1 className="text-3xl font-black italic uppercase tracking-tighter">Lead <span className="text-red-600">Command Center</span></h1>
             <p className="text-zinc-500 font-bold uppercase text-[10px] mt-1 tracking-widest">Active Leads: {leads.length}</p>
           </div>
           <button onClick={exportToCSV} className="relative z-10 flex items-center gap-2 bg-white text-black hover:bg-red-600 hover:text-white px-7 py-3 rounded-2xl font-black transition-all text-xs uppercase tracking-widest">
             <Download size={16} /> Export Data
           </button>
        </div>

        {/* Table */}
        <div className="bg-[#111111] rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 border-b border-white/5 text-zinc-500">
                  <th className="p-6 font-black text-[10px] uppercase tracking-widest">Prospect</th>
                  <th className="p-6 font-black text-[10px] uppercase tracking-widest">Contact Info</th>
                  <th className="p-6 font-black text-[10px] uppercase tracking-widest text-center">Engagement</th>
                  <th className="p-6 font-black text-[10px] uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/[0.01] transition-all group">
                    <td className="p-6">
                      <div className="font-black text-white text-lg group-hover:text-red-500 italic uppercase">{lead.name}</div>
                      <div className="text-[10px] text-zinc-600 font-bold uppercase mt-1">{lead.category}</div>
                    </td>
                    <td className="p-6">
                      <div className="text-xs font-bold text-zinc-400">{lead.email || "—"}</div>
                      <div className="text-[10px] text-zinc-600 mt-1">{lead.phone || "No Phone"}</div>
                    </td>
                    <td className="p-6 text-center">
                      <button onClick={() => openMagicWrite(lead)} className="bg-red-600/10 text-red-500 border border-red-600/20 px-5 py-2 rounded-xl hover:bg-red-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest">
                        <Sparkles size={12} className="inline mr-2" /> Magic Write
                      </button>
                    </td>
                    <td className="p-6">
                       <span className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase border ${lead.status === 'Contacted' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-zinc-900 text-zinc-500 border-white/10'}`}>
                         {lead.status || 'Scraped'}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className="bg-[#111111] rounded-[3rem] w-full max-w-3xl shadow-2xl border border-white/10 overflow-hidden">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-600 rounded-2xl text-white">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">AI Direct Mail</h2>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                    {connectedAccount ? `Inbox: ${connectedAccount.smtp_user}` : "Using System SMTP"}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white p-2"><X size={24}/></button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-3 gap-3">
                {['professional', 'friendly', 'persuasive'].map((tone) => (
                  <button key={tone} onClick={() => setSelectedTone(tone)} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedTone === tone ? 'bg-red-600 border-red-600 text-white' : 'bg-white/5 border-white/10 text-zinc-500 hover:border-white/20'}`}>
                    {tone}
                  </button>
                ))}
              </div>

              {!generatedEmail && !isGenerating ? (
                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                  <button onClick={handleGenerateEmail} className="bg-white text-black px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-600 transition-all shadow-2xl">
                    Draft AI Email
                  </button>
                </div>
              ) : isGenerating ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="animate-spin text-red-600 mb-6" size={64} />
                  <p className="text-white font-black text-sm uppercase tracking-widest animate-pulse italic">Thinking...</p>
                </div>
              ) : (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                  <textarea readOnly className="w-full h-80 p-8 bg-black/50 border border-white/10 rounded-[2rem] text-zinc-300 focus:outline-none resize-none text-sm font-medium leading-relaxed" value={generatedEmail} />
                  
                  <div className="mt-6 flex gap-4">
                    <button 
                      onClick={handleSendEmail} 
                      disabled={isSending} 
                      className="flex-[2] flex items-center justify-center gap-3 bg-red-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl disabled:opacity-50"
                    >
                      {isSending ? <Loader2 className="animate-spin" size={18}/> : <Send size={18}/>}
                      {isSending ? "Transmitting..." : "Send to Inbox"}
                    </button>
                    <button onClick={handleGenerateEmail} className="flex-1 bg-white/5 rounded-2xl font-black text-zinc-500 uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all">
                      Re-Draft
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}