"use client";

import MouseGlow from "@/components/ui/MouseGlow";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { projects } from "@/lib/projects";
import SectionCard from "@/components/ui/SectionCard";
import ProjectPanel from "@/components/system/ProjectPanel";

export default function ProjectsPage() {
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [highlightedProject, setHighlightedProject] = useState<string | null>(null);

  const searchParams = useSearchParams(); 
  const router = useRouter(); 
  const activeNode = searchParams.get("node");

  const projectList = Object.entries(projects);

  // FILTER 
  const filteredProjects = activeNode
    ? projectList.filter(([key]) => key === activeNode)
    : projectList;

  // staggered entrance trigger
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!activeNode) return;

    if (filteredProjects.length === 1) {
      const [key] = filteredProjects[0];

      // highlight first
      setHighlightedProject(key);

      // then open panel after delay
      const t = setTimeout(() => {
        setActiveProject(key);
        setHighlightedProject(null); 
      }, 700);

      return () => clearTimeout(t);
    }
  }, [activeNode]);

  // system color mapping
  const getColor = (key: string) => {
    if (key.includes("idp")) return "#60a5fa"; // identity
    if (key.includes("sentinel") || key.includes("kernel") || key.includes("lab"))
      return "#f87171"; // security
    if (key.includes("lumen")) return "#c084fc"; // observability
    if (key.includes("cracker")) return "#facc15"; // distributed
    if (key.includes("vortex")) return "#9ca3af"; // system
    return "#60a5fa";
  };

  return (
    
    <div className="min-h-screen px-6 py-20 text-white relative overflow-hidden">
      <MouseGlow />
      
      {/* subtle background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent pointer-events-none" />

      {/* header */}
      <div className="max-w-6xl mx-auto mb-12 relative z-10">
        <h1 className="text-3xl font-bold mb-2">Projects</h1>

        <p className="text-gray-400">
          Systems, security infrastructure, and distributed architectures
        </p>

        {/* ✅ FILTER INDICATOR (non-invasive) */}
        {activeNode && (
          <div className="mt-3 text-sm text-blue-400">
            Showing: {activeNode}
            <button
              onClick={() => router.push("/projects")}
              className="ml-3 text-gray-400 hover:text-white underline"
            >
              clear
            </button>
          </div>
        )}
      </div>

      {/* grid */}
      <div className="
        max-w-6xl mx-auto
        grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
        gap-6
        relative z-10
      ">
        {filteredProjects.map(([key, project], i) => {
          const isActive = activeProject === key;
          const isHighlighted = highlightedProject === key;
          const color = getColor(key);

          return (
            <div
              key={key}
              onClick={() => setActiveProject(key)}
              className={`
                cursor-pointer group relative
                transition-all duration-500
                ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
                ${isHighlighted ? "scale-105" : ""}
              `}
              style={{
                transitionDelay: `${i * 80}ms`,
              }}
            >
              {/* fake connection lines (on hover) */}
              <div className="absolute inset-0 pointer-events-none">
                <div className={`
                  absolute top-1/2 left-0 w-full h-[1px]
                  bg-gradient-to-r from-transparent via-white/20 to-transparent
                  opacity-0 group-hover:opacity-100 transition
                `} />
              </div>

              <SectionCard>
                {/* glow layer */}
                <div
                  className={`
                    absolute inset-0 rounded-2xl blur-xl
                    transition-all duration-300
                    ${isActive || isHighlighted
                      ? "opacity-70"
                      : "opacity-0 group-hover:opacity-40"}
                  `}
                  style={{ background: color }}
                />

                {/* content */}
                <div className="relative">
                  {/* type badge */}
                  <div
                    className="text-[10px] uppercase tracking-wider mb-2"
                    style={{ color }}
                  >
                    {project.type || "system"}
                  </div>

                  {/* title */}
                  <h2
                    className="text-lg font-semibold mb-2 transition"
                    style={{
                      color: isActive || isHighlighted ? color : "white",
                    }}
                  >
                    {project.title}
                  </h2>

                  {/* description */}
                  <p className="text-sm text-gray-400 mb-4">
                    {project.description}
                  </p>

                  {/* details */}
                  <ul className="text-xs text-gray-500 space-y-1 mb-4">
                    {project.details.map((d, i) => (
                      <li key={i}>• {d}</li>
                    ))}
                  </ul>

                  {/* link */}
                  <span
                    className="text-sm transition"
                    style={{ color }}
                  >
                    View Project →
                  </span>
                </div>
              </SectionCard>
            </div>
          );
        })}
      </div>

      {/* panel */}
      <ProjectPanel
        project={activeProject}
        onClose={() => setActiveProject(null)}
      />
    </div>
  );
}