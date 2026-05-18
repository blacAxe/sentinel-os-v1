"use client";

import MouseGlow from "@/components/ui/MouseGlow";
import { useEffect, useRef, useState } from "react";

const sections = [
  { id: "hero", label: "About" },
  { id: "pillars", label: "Pillars" },
  { id: "timeline", label: "Evolution" },
  { id: "vision", label: "Vision" },
];

export default function AboutPage() {
  const [active, setActive] = useState("hero");
  const [timelineStep, setTimelineStep] = useState(0);

  const refs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);

            if (entry.target.id === "timeline") {
              setTimelineStep(0);
            }
          }
        });
      },
      { threshold: 0.6 }
    );

    Object.values(refs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (active !== "timeline") return;

    let i = 0;
    const interval = setInterval(() => {
      setTimelineStep((prev) => {
        if (prev >= 4) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
      i++;
    }, 400);

    return () => clearInterval(interval);
  }, [active]);

  const scrollTo = (id: string) => {
    refs.current[id]?.scrollIntoView({ behavior: "smooth" });
  };

  const baseSection =
    "snap-start h-screen flex items-center px-6 transition-all duration-700";

  const activeStyle = "opacity-100 translate-y-0";
  const inactiveStyle = "opacity-30 translate-y-10";

  return (
    <main className="h-screen overflow-y-scroll snap-y snap-mandatory text-white relative">
    
      <MouseGlow />
      {/* ================= SIDE TRACKER ================= */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center">

        {/* vertical line */}
        <div className="absolute w-[2px] h-full bg-white/10" />

        {sections.map((s, i) => (
          <button
            key={s.id}
            onClick={() => scrollTo(s.id)}
            className={`relative z-10 w-3 h-3 my-4 rounded-full transition-all duration-300
              ${active === s.id ? "bg-white scale-150" : "bg-white/30"}
            `}
          />
        ))}
      </div>

      {/* ================= HERO ================= */}
      <section
        id="hero"
        ref={(el) => (refs.current["hero"] = el)}
        className={`${baseSection} ${
          active === "hero" ? activeStyle : inactiveStyle
        }`}
      >
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl font-bold mb-6">
            About Sentinel OS
          </h1>
          <p className="text-gray-400 max-w-2xl text-lg">
            A unified platform for building, securing, and observing distributed systems.
          </p>
        </div>
      </section>

      {/* ================= PILLARS ================= */}
      <section
        id="pillars"
        ref={(el) => (refs.current["pillars"] = el)}
        className={`${baseSection} ${
          active === "pillars" ? activeStyle : inactiveStyle
        }`}
      >
        <div className="max-w-6xl mx-auto w-full">
          <h2 className="text-2xl text-gray-400 mb-10">Core Pillars</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Security", color: "red-400" },
              { title: "Distributed", color: "yellow-400" },
              { title: "Observability", color: "purple-400" },
            ].map((p) => (
              <div
                key={p.title}
                className={`p-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl
                  transition-all duration-500
                  ${active === "pillars" ? "scale-100 opacity-100" : "scale-95 opacity-60"}
                `}
              >
                <h3 className={`text-${p.color} font-semibold mb-2`}>
                  {p.title}
                </h3>
                <p className="text-sm text-gray-400">
                  Core system capability powering Sentinel OS.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TIMELINE ================= */}
      <section
        id="timeline"
        ref={(el) => (refs.current["timeline"] = el)}
        className={`${baseSection} ${
          active === "timeline" ? activeStyle : inactiveStyle
        }`}
      >
        <div className="max-w-4xl mx-auto w-full">
          <h2 className="text-2xl text-gray-400 mb-10">Evolution</h2>

          <div className="space-y-8 border-l border-white/10 pl-6">
            {[
              { text: "Identity → Zero Trust", color: "blue-400" },
              { text: "Security → Sentinel Proxy", color: "red-400" },
              { text: "Observability → LumenLog", color: "purple-400" },
              { text: "Distributed → Workers", color: "yellow-400" },
            ].map((step, i) => (
              <div
                key={i}
                className={`transition-all duration-500 ${
                  timelineStep > i
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-4"
                }`}
              >
                <p className={`text-${step.color}`}>
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= VISION ================= */}
      <section
        id="vision"
        ref={(el) => (refs.current["vision"] = el)}
        className={`${baseSection} ${
          active === "vision" ? activeStyle : inactiveStyle
        }`}
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl text-gray-400 mb-6">Vision</h2>

          <p className="text-gray-400 text-lg">
            A unified system where identity, security, observability,
            and compute operate as one cohesive platform.
          </p>
        </div>
      </section>
    </main>
  );
}