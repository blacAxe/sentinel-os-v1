"use client";

import { useEffect, useState } from "react";

const PROXY_URL = process.env.NEXT_PUBLIC_PROXY_URL || "http://localhost:8081";

export default function SystemMetrics({ active }: { active?: boolean }) {
  const [requests, setRequests] = useState(0);
  const [blocked, setBlocked] = useState(0);
  const [allowed, setAllowed] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        const res = await fetch(`${PROXY_URL}/stats`);
        if (!res.ok) throw new Error("Network response was not ok");
        
        const data = await res.json();

        if (!isMounted) return;

        // Map Go backend metrics to React state
        setRequests(data.total || 0);
        setBlocked(data.blocked || 0);
        setAllowed(data.allowed || 0);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricCard
        title="Total Requests"
        value={requests}
        color="text-blue-400"
        active={active}
      />
      <MetricCard
        title="Blocked"
        value={blocked}
        color="text-red-400"
        active={active}
      />
      <MetricCard
        title="Allowed"
        value={allowed}
        color="text-green-400"
        active={active}
      />
    </div>
  );
}

function MetricCard({ title, value, color, active }: { 
  title: string; value: number; color: string; active?: boolean; 
}) {
  return (
    <div className={`bg-black border border-gray-800 rounded-xl p-6 shadow-md transition 
      hover:shadow-lg hover:shadow-blue-500/10 ${active ? "shadow-blue-500/20 scale-[1.02]" : ""}`}>
      <p className="text-gray-400 text-sm mb-2">{title}</p>
      <h3 className={`text-3xl font-bold ${color}`}>{value.toLocaleString()}</h3>
    </div>
  );
}