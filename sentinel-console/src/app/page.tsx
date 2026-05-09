"use client";

import Hero from "@/components/system/Hero";
import ProjectPanel from "@/components/system/ProjectPanel";
import SystemGraph from "@/components/system/SystemGraph";
import SectionCard from "@/components/ui/SectionCard";
import { useEffect, useState } from "react";

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // ✅ KEEP your mouse glow (unchanged)
  useEffect(() => {
    const move = (e: MouseEvent) => {
      document.documentElement.style.setProperty("--x", `${e.clientX - 300}px`);
      document.documentElement.style.setProperty("--y", `${e.clientY - 300}px`);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <main
      className={`pt-24 mx-auto transition-all duration-300 ${
        selectedProject ? "max-w-[calc(100%-400px)]" : "max-w-7xl"
      }`}
    >

      {/* HERO */}
      <Hero />

      {/* spacing so graph is BELOW fold */}
      <div className="h-20" />

      {/* SYSTEM GRAPH SECTION */}
      <section
        id="system"
        className="px-6 lg:px-12 xl:px-20 py-20 text-white"
      >
        <SectionCard>
          <h2 className="text-xl font-semibold mb-1 text-white">
            System Architecture
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Real-time distributed security pipeline
          </p>

          <div className="mt-6 h-[460px]">
            <SystemGraph onNodeClick={setSelectedProject} />
          </div>
        </SectionCard>
      </section>

      {/* SIDE PANEL (KEEP) */}
      <ProjectPanel
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      {/* MOUSE GLOW (KEEP EXACTLY) */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute w-[600px] h-[600px] bg-blue-500/10 blur-3xl rounded-full"
          style={{
            transform: "translate(var(--x), var(--y))",
          }}
        />
      </div>

    </main>
  );
}