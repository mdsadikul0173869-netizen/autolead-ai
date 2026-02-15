"use client";

import React, { useState, useEffect } from 'react';
import { Mail, Shield, Server, Key, Save, Trash2, CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useUser } from "@clerk/nextjs";
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function SettingsPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    email_address: '',
    smtp_host: '',
    smtp_port: '465',
    smtp_user: '',
    smtp_pass: '',
  });

  // Fetch connected accounts
  useEffect(() => {
    if (user) fetchAccounts();
  }, [user]);

  const fetchAccounts = async () => {
    const { data } = await supabase.from('email_accounts').select('*').eq('user_id', user?.id);
    setAccounts(data || []);
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.from('email_accounts').insert([{
        user_id: user?.id,
        ...formData,
        smtp_port: parseInt(formData.smtp_port)
      }]);

      if (error) throw error;
      
      alert("Email account connected successfully!");
      setFormData({ email_address: '', smtp_host: '', smtp_port: '465', smtp_user: '', smtp_pass: '' });
      fetchAccounts();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <Link href="/dashboard" className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all text-zinc-400">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter">System <span className="text-red-600">Settings</span></h1>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Manage outreach accounts & security</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left Column: Connection Form (BRD C.14) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#111111] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-red-600/20 text-red-600 rounded-lg"><Server size={20}/></div>
                <h2 className="text-xl font-black uppercase italic">Connect SMTP Account</h2>
              </div>

              <form onSubmit={handleConnect} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Email Address</label>
                    <input 
                      required
                      type="email" 
                      placeholder="you@company.com"
                      className="w-full p-4 bg-black border border-white/10 rounded-2xl focus:border-red-600 outline-none transition-all text-sm"
                      value={formData.email_address}
                      onChange={(e) => setFormData({...formData, email_address: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">SMTP Host</label>
                    <input 
                      required
                      type="text" 
                      placeholder="smtp.gmail.com"
                      className="w-full p-4 bg-black border border-white/10 rounded-2xl focus:border-red-600 outline-none transition-all text-sm"
                      value={formData.smtp_host}
                      onChange={(e) => setFormData({...formData, smtp_host: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">SMTP User / Username</label>
                    <input 
                      required
                      type="text" 
                      className="w-full p-4 bg-black border border-white/10 rounded-2xl focus:border-red-600 outline-none transition-all text-sm"
                      value={formData.smtp_user}
                      onChange={(e) => setFormData({...formData, smtp_user: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">App Password / Pass</label>
                    <input 
                      required
                      type="password" 
                      className="w-full p-4 bg-black border border-white/10 rounded-2xl focus:border-red-600 outline-none transition-all text-sm"
                      value={formData.smtp_pass}
                      onChange={(e) => setFormData({...formData, smtp_pass: e.target.value})}
                    />
                  </div>
                </div>

                <button 
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 mt-4"
                >
                  {loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                  Verify & Save Account
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Active Accounts (BRD C.18) */}
          <div className="space-y-6">
            <div className="bg-[#111111] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
              <h3 className="text-sm font-black uppercase italic mb-6 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-500"/> Connected Accounts
              </h3>
              
              <div className="space-y-3">
                {accounts.length === 0 ? (
                  <p className="text-zinc-600 text-[10px] font-bold uppercase text-center py-10 border border-dashed border-white/5 rounded-2xl">No accounts linked</p>
                ) : (
                  accounts.map((acc) => (
                    <div key={acc.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center group">
                      <div>
                        <p className="text-xs font-bold">{acc.email_address}</p>
                        <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mt-1">Status: Active</p>
                      </div>
                      <button className="text-zinc-600 hover:text-red-500 transition-colors p-2">
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-red-600/5 p-6 rounded-[2rem] border border-red-600/10">
              <div className="flex gap-3">
                <AlertCircle className="text-red-600 shrink-0" size={20}/>
                <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                  <strong className="text-white block mb-1 uppercase tracking-widest">Security Tip:</strong>
                  For Gmail, use an "App Password" instead of your main password. Enable 2FA in Google Settings.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}