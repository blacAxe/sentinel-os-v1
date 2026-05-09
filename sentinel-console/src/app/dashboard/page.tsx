"use client";

import { login, getUserDataSafe as getUserData, logout, register } from "@/lib/api";
import MouseGlow from "@/components/ui/MouseGlow";
import { useState, useEffect } from "react";
import SystemMetrics from "@/components/system/SystemMetrics";
import Terminal from "@/components/system/Terminal";
import ProjectPanel from "@/components/system/ProjectPanel";
import { projects } from "@/lib/projects";

const colorMap: Record<string, string> = {
  idp: "border-blue-500/40 hover:shadow-blue-500/20",
  sentinel: "border-red-500/40 hover:shadow-red-500/20",
  lumenlog: "border-purple-500/40 hover:shadow-purple-500/20",
  vortex: "border-gray-500/40 hover:shadow-gray-500/20",
  lab: "border-red-400/40 hover:shadow-red-400/20",
  cracker: "border-yellow-400/40 hover:shadow-yellow-400/20",
  kernel: "border-red-600/40 hover:shadow-red-600/20",
};

export default function DashboardPage() {
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [flowStep, setFlowStep] = useState(0);
  const [response, setResponse] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [username, setUsername] = useState("bob");
  const [status, setStatus] = useState(""); // For registration status

  useEffect(() => {
    let mounted = true;
    const interval = setInterval(() => {
      if (!mounted) return;
      setFlowStep((prev) => (prev + 1) % 3);
    }, 6000);

    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleProxyTest = async () => {
    if (loading) return;
    setLoading(true);
    setResponse("⏳ Sending request...");
    try {
      await getUserData();
      setResponse("✅ Request allowed");
    } catch (err: any) {
      setResponse(err.message === "Rate limited" ? "🚫 Blocked by Sentinel (rate limit)" : "❌ Proxy request failed");
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  const handleRegister = async () => {
    try {
      setStatus("Creating passkey...");
      await register(username);
      setStatus("✅ Registered! You can now login.");
    } catch (err: any) {
      console.error(err);
      setStatus(`❌ Error: ${err.message}`);
    }
  };

  const handleLogin = async () => {
    try {
      setAuthLoading(true);
      const data = await login(username);
      setIsAuthenticated(true);
      setResponse(data);
      alert("✅ Login success");
    } catch (err: any) {
      console.error(err);
      setResponse(err.message);
      alert("❌ Login failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsAuthenticated(false);
    setResponse(null);
    alert("Logged out");
  };

const handleSimulateAttack = async () => {
  setLoading(true);
  setResponse("🚀 Launching SQLi Attack...");
  
  try {
    // Send the attack to the root. The WAF should catch "UNION SELECT" 
    // before the request even reaches the IDP.
    const attackUrl = `http://localhost:8081/?attack=true&id=1' UNION SELECT NULL--`;
    
    const res = await fetch(attackUrl, { method: "GET" });

    if (res.status === 403) {
      setResponse("✅ Sentinel successfully blocked the attack!");
    } else {
      setResponse("❌ Attack Bypassed the Proxy. Status: " + res.status);
    }
  } catch (err) {
    setResponse("❌ Connection failed.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen px-6 py-12 bg-gradient-to-b from-black via-black to-gray-950 text-white">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-10">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-400 text-sm">Real-time system activity and project status</p>
      </div>

      <div className="relative max-w-6xl mx-auto space-y-10 pl-10">
        {/* --- SYSTEM FLOW SVG --- */}
        <svg className="pointer-events-none absolute left-[-120px] top-0 h-full w-[120px]" viewBox="0 0 120 800" preserveAspectRatio="none">
          <path id="path-metrics-terminal" d="M110 60 C40 120, 40 260, 110 320" stroke="rgba(255,255,255,0.15)" strokeWidth="2" fill="none" className={`transition-opacity duration-500 ${flowStep === 0 ? "opacity-80" : "opacity-10"}`} style={{ strokeDasharray: "6 6", animation: flowStep === 0 ? "flow 1s linear" : "none" }} />
          <path id="path-terminal-projects" d="M110 320 C40 380, 40 540, 110 600" stroke="rgba(255,255,255,0.15)" strokeWidth="2" fill="none" className={`transition-opacity duration-500 ${flowStep === 1 ? "opacity-80" : "opacity-10"}`} style={{ strokeDasharray: "6 6", animation: "flow 1s linear infinite" }} />
          {flowStep === 0 && (
            <circle r="4" fill="#60a5fa" opacity="0.9">
              <animateMotion dur="3.5s" repeatCount="indefinite"><mpath href="#path-metrics-terminal" /></animateMotion>
            </circle>
          )}
          {flowStep === 1 && (
            <circle r="4" fill="#c084fc" opacity="0.9">
              <animateMotion dur="3.5s" repeatCount="indefinite"><mpath href="#path-terminal-projects" /></animateMotion>
            </circle>
          )}
          <circle cx="110" cy={flowStep === 0 ? 60 : flowStep === 1 ? 320 : 600} r="6" fill="white" className="transition-all duration-700" />
        </svg>

        <div className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white/70 blur-sm transition-all duration-700" style={{ top: flowStep === 0 ? "5%" : flowStep === 1 ? "40%" : "75%" }} />

        {/* --- ACTIONS SECTION --- */}
        <div className="flex flex-wrap gap-4 items-center">
          <button onClick={handleProxyTest} disabled={loading} className={`px-4 py-2 rounded border transition ${loading ? "opacity-50 cursor-not-allowed border-gray-700" : "border-white/20 hover:bg-white/10"}`}>
            {loading ? "Sending..." : "Test Proxy Route"}
          </button>

          <button 
            onClick={handleSimulateAttack} 
            className="px-4 py-2 rounded border border-red-500/30 hover:bg-red-500/10"
          >
            Simulate Attack
          </button>
        </div>

        {/* --- REGISTRATION CARD --- */}
        <div className="p-4 border border-white/10 rounded-lg bg-black/20 max-w-md">
          <h2 className="text-xl font-bold mb-4">Identity Setup</h2>
          <div className="flex gap-2">
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="flex-1 bg-gray-800 text-white p-2 rounded outline-none border border-white/5 focus:border-blue-500" />
            <button onClick={handleRegister} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded transition font-semibold">Register</button>
          </div>
          {status && <p className="mt-2 text-sm text-blue-400 animate-pulse">{status}</p>}
        </div>

        {/* --- LOGIN SECTION --- */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <button onClick={handleLogout} className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded hover:bg-red-500/30">Logout</button>
          ) : (
            <button onClick={handleLogin} className="px-4 py-2 bg-white/10 border border-white/20 rounded hover:bg-white/20">
              {authLoading ? "Logging in..." : "Login with Passkey"}
            </button>
          )}
        </div>

        {/* --- RESPONSE BOX --- */}
        <div className="mt-4 text-sm font-mono">
          {response && (
            <div className={`p-3 rounded border transition-all ${typeof response === "string" && response.includes("Blocked") ? "border-red-500/40 text-red-400 bg-red-500/5" : typeof response === "string" && response.includes("allowed") ? "border-green-500/40 text-green-400 bg-green-500/5" : "border-gray-700 text-gray-400"}`}>
              {typeof response === "string" ? response : JSON.stringify(response, null, 2)}
            </div>
          )}
        </div>

        {/* --- SECTIONS (METRICS, TERMINAL, PROJECTS) --- */}
        <div className={`relative ${flowStep === 0 ? "animate-pulse" : ""}`}>
          <div className="absolute -left-8 top-2 w-2 h-2 rounded-full bg-blue-400" />
          <h2 className="text-sm text-gray-400 mb-4 uppercase tracking-wide">System Metrics</h2>
          <SystemMetrics active={flowStep === 0} />
        </div>

        <div className={`relative ${flowStep === 1 ? "animate-pulse" : ""}`}>
          <div className="absolute -left-8 top-2 w-2 h-2 rounded-full bg-green-400" />
          <h2 className="text-sm text-gray-400 mb-4 uppercase tracking-wide">Live Activity</h2>
          <Terminal active={flowStep === 1} />
        </div>

        <div className={`relative ${flowStep === 2 ? "animate-pulse" : ""}`}>
          <div className="absolute -left-8 top-2 w-2 h-2 rounded-full bg-purple-400" />
          <h2 className="text-sm text-gray-400 mb-4 uppercase tracking-wide">Project Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(projects).map(([key, project]) => (
              <div key={key} onClick={() => setActiveProject(key)} className={`cursor-pointer group relative border rounded-xl p-5 bg-black/60 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${colorMap[key] || "border-white/10"} ${flowStep === 2 ? "shadow-[0_0_20px_rgba(255,255,255,0.05)]" : ""}`}>
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition blur-xl bg-white/5" />
                <div className="relative">
                  <p className="text-xs text-gray-500 mb-1 uppercase">{key}</p>
                  <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
                  <p className="text-sm text-gray-400 line-clamp-2">{project.description}</p>
                  <div className="mt-4 text-xs text-gray-500">Status: <span className="text-green-400">Active</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ProjectPanel project={activeProject} onClose={() => setActiveProject(null)} />
    </div>
  );
}