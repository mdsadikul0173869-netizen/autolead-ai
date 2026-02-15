"use client";

import React, { useEffect, useState } from 'react';
import { 
  Users, Zap, Target, Mail, ArrowUpRight, 
  BarChart3, LayoutDashboard, Settings, LogOut, Search
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import Link from 'next/link';

export default function MasterDashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState({
    total: 0,
    contacted: 0,
    conversion: 0,
    growth: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchRealtimeStats();
  }, [user]);

  const fetchRealtimeStats = async () => {
    try {
      // Fetch all leads for this user
      const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user?.id);

      if (leads) {
        const total = leads.length;
        const contacted = leads.filter(l => l.status === 'Contacted').length;
        
        // Group data for the chart (Simple Logic: counting by day)
        const chartMap = leads.reduce((acc: any, curr: any) => {
          const date = new Date(curr.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});

        const chartData = Object.keys(chartMap).map(date => ({
          name: date,
          leads: chartMap[date]
        })).slice(-7); // Last 7 data points

        setStats({
          total,
          contacted,
          conversion: total > 0 ? Math.round((contacted / total) * 100) : 0,
          growth: chartData
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      
      {/* SIDEBAR - BRD Section 2 (Modular Layout) */}
      <aside className="w-64 border-r border-white/5 bg-[#0A0A0A] hidden md:flex flex-col p-6 fixed h-full">
        <div className="flex items-center gap-2 mb-12">
          <div className="bg-red-600 p-2 rounded-lg shadow-lg shadow-red-600/20"><Zap size={20}/></div>
          <span className="font-black italic uppercase tracking-tighter text-xl">AutoLead <span className="text-red-600">Pro</span></span>
        </div>
        
        <nav className="space-y-2 flex-1">
          <Link href="/"><NavItem icon={<LayoutDashboard size={18}/>} label="Overview" active /></Link>
          <Link href="/scraper"><NavItem icon={<Search size={18}/>} label="Scraper Engine" /></Link>
          <Link href="/my-leads"><NavItem icon={<Users size={18}/>} label="Lead Database" /></Link>
          <Link href="/settings"><NavItem icon={<Settings size={18}/>} label="SMTP Config" /></Link>
        </nav>

        <div className="pt-6 border-t border-white/5 opacity-50">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">v1.0 Enterprise</p>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-64 p-8 overflow-y-auto">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter">System <span className="text-red-600">Analytics</span></h1>
            <p className="text-zinc-500 text-sm font-medium">Welcome back, <span className="text-white">{user?.firstName || 'Admin'}</span>. Here is your real-time performance.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/scraper" className="bg-white text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase hover:bg-red-600 hover:text-white transition-all tracking-widest shadow-xl">
              Start New Hunt
            </Link>
          </div>
        </header>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total Leads" value={stats.total} growth="+Live" icon={<Users className="text-red-500"/>}/>
          <StatCard title="AI Outreach" value={stats.contacted} growth="Active" icon={<Zap className="text-yellow-500"/>}/>
          <StatCard title="Efficiency" value={`${stats.conversion}%`} growth="Optimal" icon={<Target className="text-green-500"/>}/>
          <StatCard title="Server Status" value="Online" growth="100%" icon={<BarChart3 className="text-blue-500"/>}/>
        </div>

        {/* CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 bg-[#0A0A0A] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><BarChart3 size={80}/></div>
            <h3 className="text-lg font-black uppercase italic mb-8 relative z-10">Extraction Velocity</h3>
            <div className="h-72 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.growth.length > 0 ? stats.growth : [{name: 'Empty', leads: 0}]}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#111" vertical={false} />
                  <XAxis dataKey="name" stroke="#333" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#333" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{backgroundColor: '#000', border: '1px solid #222', borderRadius: '12px'}} />
                  <Area type="monotone" dataKey="leads" stroke="#dc2626" fillOpacity={1} fill="url(#colorLeads)" strokeWidth={4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="bg-[#0A0A0A] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-black uppercase italic mb-6">Quick Actions</h3>
              <div className="space-y-3">
                <QuickLink href="/scraper" label="Open Lead Scraper" desc="Find new prospects" />
                <QuickLink href="/my-leads" label="View Lead Database" desc="Manage your saved leads" />
                <QuickLink href="/settings" label="Mail Settings" desc="Setup SMTP/Gmail" />
              </div>
            </div>
            <div className="mt-8 p-4 bg-red-600/5 border border-red-600/10 rounded-2xl">
              <p className="text-[10px] text-zinc-500 font-bold uppercase leading-relaxed tracking-widest">
                AI Engine is running at optimal speed. All systems green.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Helper Components
function QuickLink({ href, label, desc }: any) {
  return (
    <Link href={href} className="block p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-red-600/30 transition-all group">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-tight group-hover:text-red-500">{label}</p>
          <p className="text-[9px] text-zinc-500 font-bold uppercase mt-1">{desc}</p>
        </div>
        <ArrowUpRight size={14} className="text-zinc-700 group-hover:text-red-500" />
      </div>
    </Link>
  );
}

function StatCard({ title, value, growth, icon }: any) {
  return (
    <div className="bg-[#0A0A0A] p-8 rounded-[2rem] border border-white/5 hover:border-red-600/20 transition-all group shadow-xl">
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-white/5 rounded-xl group-hover:scale-110 transition-all group-hover:bg-red-600/10">{icon}</div>
        <span className="text-green-500 text-[9px] font-black uppercase tracking-widest bg-green-500/5 px-2 py-1 rounded-md">{growth}</span>
      </div>
      <h4 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">{title}</h4>
      <p className="text-3xl font-black mt-2 italic tracking-tighter">{value}</p>
    </div>
  );
}

function NavItem({ icon, label, active = false }: any) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-all ${active ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-zinc-500 hover:bg-white/5 hover:text-white'}`}>
      {icon}
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
  );
}