"use client";
import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [query, setQuery] = useState("");
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLeads = async () => {
    if (!query) return alert("Please type something!");
    setLoading(true);
    try {
      const res = await axios.get("https://jsonplaceholder.typicode.com/users");
      setLeads(res.data.slice(0, 5));
    } catch (err) {
      alert("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10 text-black">
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4 text-blue-600">AutoLead AI 🚀</h1>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for leads..." 
          className="w-full p-3 border rounded-md mb-4"
        />
        <button 
          onClick={fetchLeads}
          className="w-full bg-blue-500 text-white p-3 rounded-md font-semibold"
        >
          {loading ? "Searching..." : "Generate Leads"}
        </button>

        <div className="mt-6 text-left">
          {leads.map((lead: any) => (
            <div key={lead.id} className="border-b py-2">
              <p className="font-bold">{lead.name}</p>
              <p className="text-sm text-gray-500">{lead.email}</p>
            {/* Floating Chat Window */}
<div className="fixed bottom-6 right-6 z-50">
  <div className="bg-red-600 p-4 rounded-full shadow-lg cursor-pointer hover:bg-red-700 transition-all">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  </div>
  </div></div>
          ))}
        </div>
      </div>
    </div>
  );
}