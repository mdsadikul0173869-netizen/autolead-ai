"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Shield, ArrowLeft, User, Zap, Edit3, X, Save } from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newCreditValue, setNewCreditValue] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    setUsers(data || []);
    setLoading(false);
  }

  // মোডাল খোলার ফাংশন
  const openEditModal = (user: any) => {
    setSelectedUser(user);
    setNewCreditValue(user.credits.toString());
    setIsModalOpen(true);
  };

  async function handleUpdate() {
    if (!selectedUser) return;
    
    setUpdating(selectedUser.id);
    const response = await fetch('/api/admin/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        targetUserId: selectedUser.id, 
        newCredits: parseInt(newCreditValue),
        makeAdmin: selectedUser.is_admin 
      }),
    });

    if (response.ok) {
      fetchUsers();
      setIsModalOpen(false);
    } else {
      alert("Failed to update.");
    }
    setUpdating(null);
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-[#050505]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div></div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-10 relative">
      
      {/* HEADER SECTION */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">User <span className="text-red-600">Control</span></h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Admin Authority Panel</p>
        </div>
        <Link href="/">
          <button className="bg-white/5 hover:bg-white/10 p-3 rounded-full border border-white/10 transition-all"><ArrowLeft size={20}/></button>
        </Link>
      </div>

      {/* TABLE SECTION */}
      <div className="max-w-6xl mx-auto bg-[#0A0A0A] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-zinc-500 font-black">
            <tr>
              <th className="p-6">Identity</th>
              <th className="p-6">Credits</th>
              <th className="p-6">Role</th>
              <th className="p-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-white/[0.02] transition-all group">
                <td className="p-6 font-mono text-[10px] text-zinc-500">{user.id}</td>
                <td className="p-6">
                   <div className="flex items-center gap-2">
                      <Zap size={14} className="text-yellow-500 fill-yellow-500" />
                      <span className="font-black italic text-lg">{user.credits}</span>
                   </div>
                </td>
                <td className="p-6">
                  {user.is_admin ? 
                    <span className="bg-red-600/10 text-red-500 text-[9px] font-black px-3 py-1 rounded-full border border-red-600/20">ADMINISTRATOR</span> 
                    : <span className="text-zinc-600 text-[9px] font-black px-3 py-1">USER</span>
                  }
                </td>
                <td className="p-6 text-right">
                  <button 
                    onClick={() => openEditModal(user)}
                    className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase px-5 py-2 rounded-xl transition-all active:scale-95 shadow-lg shadow-red-600/20"
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CUSTOM PREMIUM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative bg-[#0F0F0F] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(220,38,38,0.15)] overflow-hidden">
            {/* Modal Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-600/20 blur-[80px]" />
            
            <div className="flex justify-between items-center mb-8 relative">
              <h3 className="text-xl font-black uppercase italic italic">Update <span className="text-red-600">Credits</span></h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={20}/></button>
            </div>

            <div className="space-y-6 relative">
               <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 block mb-3">User ID</label>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-[10px] font-mono text-zinc-400">
                    {selectedUser?.id}
                  </div>
               </div>

               <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 block mb-3">New Credit Amount</label>
                  <div className="relative">
                    <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500" size={18} />
                    <input 
                      type="number"
                      value={newCreditValue}
                      onChange={(e) => setNewCreditValue(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-black text-xl focus:border-red-600 outline-none transition-all"
                      placeholder="0"
                    />
                  </div>
               </div>

               <button 
                onClick={handleUpdate}
                disabled={updating === selectedUser?.id}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-red-600/20"
               >
                 {updating === selectedUser?.id ? "Syncing..." : <><Save size={18}/> Save Changes</>}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}