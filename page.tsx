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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}