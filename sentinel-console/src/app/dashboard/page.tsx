"use client";

import { login, getUserDataSafe as getUserData, logout, register } from "@/lib/api";
import MouseGlow from "@/components/ui/MouseGlow";
import { useState, useEffect } from "react";
import SystemMetrics from "@/components/system/SystemMetrics";

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
  const [flowStep, setFlowStep] = useState(0);
  const [response, setResponse] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [username, setUsername] = useState("bob");
  const [status, setStatus] = useState(""); 
  const [events, setEvents] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    const interval = setInterval(() => {
      if (!mounted) return;
      setFlowStep((prev) => (prev + 1) % 2);
    }, 6000);

    const token = localStorage.getItem("sentinel_token");
    const storedUser = localStorage.getItem("sentinel_user");

    if (token && storedUser) {
      setIsAuthenticated(true);
      setUsername(storedUser);
    }

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const addEvent = (message: string) => {
    const time = new Date().toLocaleTimeString();

    setEvents((prev) => [
      `[${time}] ${message}`,
      ...prev.slice(0, 7),
    ]);
  };

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

  const handleProtectedRequest = async () => {
  try {
    const token = localStorage.getItem("sentinel_token");

    if (!token) {
      setResponse("❌ No JWT found");
      return;
    }

    const res = await fetch("http://localhost:8081/api/secret-data", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Protected route failed (${res.status})`);
    }

    const data = await res.json();

    setResponse(`🔐 Access Granted\nRole: ${data.role}\nUser: ${data.username}`);
    addEvent(`Protected API accessed by ${data.username}`);

  } catch (err: any) {
    setResponse(`❌ ${err.message}`);
  }
};

  const handleRegister = async () => {
    try {
      setStatus("Creating passkey...");
      await register(username);
      setStatus("✅ Registered! You can now login.");
      addEvent(`Passkey registered for ${username}`);
    } catch (err: any) {
      console.error(err);
      setStatus(`❌ Error: ${err.message}`);
    }
  };

  const handleLogin = async () => {
    try {
      setAuthLoading(true);
      const data = await login(username);

      if (data?.token) {
        localStorage.setItem("sentinel_token", data.token);
        localStorage.setItem("sentinel_user", username);
      }

      setIsAuthenticated(true);
      setResponse("✅ Authenticated successfully");
      setStatus(`Authenticated as ${username}`);
      addEvent(`JWT authenticated for ${username}`);
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

    localStorage.removeItem("sentinel_token");
    localStorage.removeItem("sentinel_user");

    setIsAuthenticated(false);
    setResponse("Logged out");
    addEvent(`Session cleared for ${username}`);
    setStatus("");
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
      addEvent("Blocked SQL injection attempt");
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
          {flowStep === 0 && (
            <circle r="4" fill="#60a5fa" opacity="0.9">
              <animateMotion dur="3.5s" repeatCount="indefinite"><mpath href="#path-metrics-terminal" /></animateMotion>
            </circle>
          )}
          <circle cx="110" cy={flowStep === 0 ? 60 : 600} r="6" fill="white" className="transition-all duration-700" />
        </svg>

        <div className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white/70 blur-sm transition-all duration-700" style={{ top: flowStep === 0 ? "5%" : "75%", }} />

        {/* --- ACTIONS SECTION --- */}
        {/* --- COMMAND CENTER --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT SIDE */}
          <div className="lg:col-span-2 border border-cyan-500/10 rounded-2xl bg-black/40 backdrop-blur-xl p-6">

            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-cyan-400/70">
                  Sentinel Control Center
                </p>

                <h2 className="text-2xl font-bold mt-2">
                  Security Operations
                </h2>
              </div>

              <div className="px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs">
                SYSTEM ONLINE
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <button
                onClick={handleProxyTest}
                disabled={loading}
                className={`group relative overflow-hidden rounded-xl border p-5 text-left transition-all duration-300 ${
                  loading
                    ? "opacity-50 cursor-not-allowed border-gray-700"
                    : "border-cyan-500/20 hover:border-cyan-400/40 hover:bg-cyan-500/5"
                }`}
              >
                <div className="text-xs uppercase tracking-wide text-cyan-400 mb-2">
                  Proxy
                </div>

                <div className="text-lg font-semibold mb-1">
                  Test Route
                </div>

                <div className="text-sm text-gray-400">
                  Send request through Sentinel proxy stack
                </div>
              </button>

              <button
                onClick={handleSimulateAttack}
                className="group relative overflow-hidden rounded-xl border border-red-500/20 hover:border-red-400/40 hover:bg-red-500/5 p-5 text-left transition-all duration-300"
              >
                <div className="text-xs uppercase tracking-wide text-red-400 mb-2">
                  WAF
                </div>

                <div className="text-lg font-semibold mb-1">
                  Simulate Attack
                </div>

                <div className="text-sm text-gray-400">
                  Trigger SQL injection detection pipeline
                </div>
              </button>

              <button
                onClick={handleProtectedRequest}
                disabled={!isAuthenticated}
                className={`group relative overflow-hidden rounded-xl border p-5 text-left transition-all duration-300 ${
                  isAuthenticated
                    ? "border-emerald-500/20 hover:border-emerald-400/40 hover:bg-emerald-500/5"
                    : "border-gray-700 text-gray-600 cursor-not-allowed"
                }`}
              >
                <div className="text-xs uppercase tracking-wide text-emerald-400 mb-2">
                  Zero Trust
                </div>

                <div className="text-lg font-semibold mb-1">
                  Protected API
                </div>

                <div className="text-sm text-gray-400">
                  Validate JWT and identity-aware access
                </div>
              </button>

            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="border border-white/10 rounded-2xl bg-black/40 backdrop-blur-xl p-6">

            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-gray-500">
                  Identity
                </p>

                <h2 className="text-xl font-bold mt-2">
                  Authentication
                </h2>
              </div>

              <div className={`w-3 h-3 rounded-full ${
                isAuthenticated ? "bg-emerald-400" : "bg-red-400"
              }`} />
            </div>

            <div className="space-y-4">

              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full bg-gray-900/80 text-white p-3 rounded-xl outline-none border border-white/5 focus:border-cyan-500"
              />

              <button
                onClick={handleRegister}
                className="w-full bg-blue-600 hover:bg-blue-500 px-4 py-3 rounded-xl transition font-semibold"
              >
                Register Passkey
              </button>

              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={handleLogin}
                  disabled={authLoading}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition"
                >
                  {authLoading ? "Authenticating..." : "Login with Passkey"}
                </button>
              )}

              {status && (
                <div className="text-sm text-cyan-400 border border-cyan-500/10 bg-cyan-500/5 rounded-xl p-3">
                  {status}
                </div>
              )}

            </div>
          </div>

        </div>

        {/* --- LIVE SYSTEM STATUS --- */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

          <div className="rounded-xl border border-cyan-500/10 bg-cyan-500/5 p-4">
            <div className="text-xs uppercase tracking-wide text-cyan-400 mb-2">
              Proxy
            </div>

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-white">Operational</span>
            </div>
          </div>

          <div className="rounded-xl border border-purple-500/10 bg-purple-500/5 p-4">
            <div className="text-xs uppercase tracking-wide text-purple-400 mb-2">
              LumenLog
            </div>

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-white">Streaming</span>
            </div>
          </div>

          <div className="rounded-xl border border-red-500/10 bg-red-500/5 p-4">
            <div className="text-xs uppercase tracking-wide text-red-400 mb-2">
              WAF Engine
            </div>

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-white">Active</span>
            </div>
          </div>

          <div className="rounded-xl border border-yellow-500/10 bg-yellow-500/5 p-4">
            <div className="text-xs uppercase tracking-wide text-yellow-400 mb-2">
              Event Bus
            </div>

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-white">Connected</span>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4">
            <div className="text-xs uppercase tracking-wide text-emerald-400 mb-2">
              Identity
            </div>

            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                isAuthenticated ? "bg-emerald-400 animate-pulse" : "bg-red-400"
              }`} />

              <span className="text-sm text-white">
                {isAuthenticated ? "Authenticated" : "Anonymous"}
              </span>
            </div>
          </div>

        </div>

        {/* --- RESPONSE BOX --- */}
        <div className="mt-4 text-sm font-mono">
          {response && (
            <div className={`p-3 rounded border transition-all ${typeof response === "string" && response.includes("Blocked") ? "border-red-500/40 text-red-400 bg-red-500/5" : typeof response === "string" && response.includes("allowed") ? "border-green-500/40 text-green-400 bg-green-500/5" : "border-gray-700 text-gray-400"}`}>
              {typeof response === "string" ? response : JSON.stringify(response, null, 2)}
            </div>
          )}
        </div>

        {/* --- LIVE EVENT FEED --- */}
        <div className="relative">
          <div className="absolute -left-8 top-2 w-2 h-2 rounded-full bg-red-400" />

          <h2 className="text-sm text-gray-400 mb-4 uppercase tracking-wide">
            Security Event Feed
          </h2>

          <div className="border border-white/10 rounded-xl bg-black/40 backdrop-blur-md p-4 space-y-2 max-w-4xl">
            
            {events.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No events captured yet.
              </p>
            ) : (
              events.map((event, idx) => (
                <div
                  key={idx}
                  className="font-mono text-sm text-green-400 border-b border-white/5 pb-2 animate-in fade-in slide-in-from-top-1 duration-300"
                >
                  {event}
                </div>
              ))
            )}

          </div>
        </div>

        {/* --- SECTIONS (METRICS, TERMINAL, PROJECTS) --- */}
        <div className={`relative ${flowStep === 0 ? "animate-pulse" : ""}`}>
          <div className="absolute -left-8 top-2 w-2 h-2 rounded-full bg-blue-400" />
          <h2 className="text-sm text-gray-400 mb-4 uppercase tracking-wide">System Metrics</h2>
          <SystemMetrics active={flowStep === 0} />
        </div>
      </div>
    </div>
  );
}