"use client";

import { useState, useEffect, useRef } from "react";

declare global {
  interface WindowEventMap {
    "terminal-command": CustomEvent<string>;
  }
}

function typeLine(
  text: string,
  setHistory: React.Dispatch<React.SetStateAction<string[]>>
) {
  let i = 0;
  // Initialize the new line
  setHistory((prev) => [...prev, ""]);

  const interval = setInterval(() => {
    i++;
    setHistory((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = text.slice(0, i);
      return updated;
    });

    if (i >= text.length) clearInterval(interval);
  }, 15);
}

export default function Terminal({ active }: { active?: boolean }) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([
    "Sentinel OS Terminal [Version 1.0.42]",
    "Establishing secure link to Proxy Gateway...",
  ]);

  const endRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // Keeps the connection alive across renders
  const eventSourceRef = useRef<EventSource | null>(null);

  // --- LIVE SSE LOGIC ---
  useEffect(() => {
    const proxyUrl = process.env.NEXT_PUBLIC_PROXY_URL || 'http://localhost:8081';
    
    if (!eventSourceRef.current) {
      console.log("🚀 Terminal: Connecting to", `${proxyUrl}/logs`);
      const es = new EventSource(`${proxyUrl}/logs`);
      eventSourceRef.current = es;

      es.onopen = () => {
        setHistory(prev => [...prev, "🟢 SYSTEM: Log stream connected."]);
      };

      es.onmessage = (event) => {
        try {
          console.log("SSE EVENT:", event.data);

          const data = JSON.parse(event.data);
          // Only show traffic events
          if (
              data.event_type === "request_allowed" ||
              data.event_type === "request_blocked" ||
              data.event_type === "rate_limited"
            ) {
            const time = new Date().toLocaleTimeString([], { hour12: false });
            let status = "[ALLOWED]";

            if (
              data.event_type === "request_blocked" ||
              data.event_type === "rate_limited"
            ) {
              status = "[BLOCKED]";
            }
            const logEntry = `[${time}] ${status} ${data.method} ${data.path} - ${data.ip}`;
            
            setHistory(prev => [...prev.slice(-100), logEntry]);
          }
        } catch (e) {
          // Ignore heartbeat/parsing noise
        }
      };

      es.onerror = () => {
        setHistory(prev => [
          ...prev,
          "🔴 SYSTEM: Connection interrupted..."
        ]);
      };
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  const handleCommand = (cmd: string) => {
    let output = "";
    const cleanCmd = cmd.toLowerCase().trim();

    setHistory((prev) => [...prev, `admin@sentinel:~$ ${cmd}`]);

    switch (cleanCmd) {
      case "help":
        output = "Available: status, clear, logs, whoami, flush, analyze";
        break;
      case "status":
        output = "Sentinel Proxy: ACTIVE | Health: 100% | CPU: 0.2%";
        break;
      case "clear":
        setHistory([]);
        return;
      case "whoami":
        output = "Level 7 Security Administrator - Root Privileges";
        break;
      case "logs":
        output = "Current log buffer is active and streaming...";
        break;
      case "flush":
        output = "Flushing temporary cache... Done.";
        break;
      case "analyze":
        output = "Heuristic engine: No active anomalies detected.";
        break;
      default:
        output = `Command not found: ${cmd}. Type 'help' for options.`;
    }

    typeLine(output, setHistory);
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  return (
    <div
      ref={containerRef}
      className={`
        relative w-full bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-5 font-mono text-[13px] h-[400px] overflow-y-auto shadow-2xl transition-all duration-500
        ${active ? "border-green-500/30 shadow-green-500/5" : ""}
      `}
    >
      {/* Decorative dots for that "App" feel */}
      <div className="flex gap-1.5 mb-4 sticky top-0 bg-black/50 py-1 backdrop-blur-sm">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
        <span className="text-[10px] text-gray-600 ml-2 uppercase tracking-tighter">sentinel_tty0</span>
      </div>

      {history.map((line, i) => {
        const isBlocked = line.includes("[BLOCKED]");
        const isAllowed = line.includes("[ALLOWED]");
        const isSystem = line.includes("SYSTEM:");

        let color = "text-gray-400";
        if (isBlocked) color = "text-red-400 font-bold";
        if (isAllowed) color = "text-emerald-400";
        if (isSystem) color = "text-blue-400 italic";
        if (line.startsWith("admin@")) color = "text-white";

        return (
          <div key={i} className={`${color} leading-relaxed animate-in fade-in slide-in-from-left-2 duration-300`}>
            {line}
          </div>
        );
      })}

      <div ref={endRef} />

      <div className="flex mt-4 items-center">
        <span className="text-green-500 font-bold mr-2 whitespace-nowrap">admin@sentinel:~$</span>
        <input
          autoFocus
          className="bg-transparent outline-none text-gray-200 min-w-[20px]"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && input.trim()) {
              handleCommand(input);
              setInput("");
            }
          }}
        />
        <span className="animate-pulse text-green-500 ml-1 shrink-0">▊</span>
      </div>
    </div>
  );
}