"use client";
import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [query, setQuery] = useState("");
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const fetchLeads = async () => {
    if (!query) return alert("Please enter a search term!");
    setLoading(true);
    try {
      // Replace this URL with your actual lead generation API endpoint
      const res = await axios.get("https://jsonplaceholder.typicode.com/users");
      setLeads(res.data.slice(0, 5));
    } catch (err) {
      alert("Something went wrong while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans relative">
      {/* --- Dashboard Header --- */}
      <nav className="bg-gray-800 p-4 border-b border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-red-500">AutoLead AI 🚀</h1>
          <div className="space-x-6 text-sm font-medium">
            <span className="cursor-pointer hover:text-red-400 transition-colors">Dashboard</span>
            <span className="cursor-pointer hover:text-red-400 transition-colors">Leads Inventory</span>
            <span className="cursor-pointer hover:text-red-400 transition-colors">Settings</span>
          </div>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="p-10">
        <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
          <h2 className="text-3xl font-extrabold mb-6 text-center text-white">Generate High-Quality Leads</h2>
          
          <div className="space-y-4">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex: Car Dealerships in Florida..." 
              className="w-full p-4 bg-gray-900 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-red-500 transition-all"
            />
            <button 
              onClick={fetchLeads}
              className="w-full bg-red-600 hover:bg-red-700 text-white p-4 rounded-xl font-bold text-lg shadow-lg transform active:scale-95 transition-all"
            >
              {loading ? "Searching Database..." : "Find Leads Now"}
            </button>
          </div>

          {/* --- Results Section --- */}
          <div className="mt-8">
            {leads.length > 0 && <h3 className="text-xl font-semibold mb-4 border-b border-gray-600 pb-2">Verified Results:</h3>}
            {leads.map((lead: any) => (
              <div key={lead.id} className="bg-gray-900 p-4 rounded-lg mb-3 border-l-4 border-red-500 hover:bg-gray-700 transition-all">
                <p className="font-bold text-lg">{lead.name}</p>
                <p className="text-sm text-gray-400">{lead.email}</p>
                <p className="text-xs text-red-400 mt-1">Verified Lead</p>
              </div>
            ))}
            
            {leads.length === 0 && !loading && query && (
                <p className="text-center text-gray-500 mt-4">No results found. Try a different keyword.</p>
            )}
          </div>
        </div>
      </main>

      {/* --- Floating Chat System --- */}
      <div className="fixed bottom-6 right-6 z-50">
        {isChatOpen && (
          <div className="bg-white text-black w-72 h-96 rounded-2xl mb-4 shadow-2xl flex flex-col overflow-hidden border-2 border-red-600 animate-in fade-in zoom-in duration-200">
            <div className="bg-red-600 p-4 text-white font-bold flex justify-between items-center">
              <span>AI Sales Assistant</span>
              <button onClick={() => setIsChatOpen(false)} className="hover:bg-red-700 rounded p-1">✕</button>
            </div>
            <div className="flex-1 p-4 text-sm overflow-y-auto bg-gray-50">
              <p className="bg-gray-200 p-2 rounded-lg mb-2">Hello! How can I help you grow your business today?</p>
            </div>
            <div className="p-3 border-t bg-white">
              <input 
                type="text" 
                placeholder="Type your message..." 
                className="w-full p-2 text-sm border rounded-lg outline-none focus:border-red-500" 
              />
            </div>
          </div>
        )}
        
        <div 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="bg-red-600 p-4 rounded-full shadow-2xl cursor-pointer hover:bg-red-700 hover:scale-110 transition-all flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
      </div>
    </div>
  );
}