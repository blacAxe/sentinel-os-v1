"use client";

import { useEffect, useState } from "react";
import CustomNode from "./CustomNode";
import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
} from "reactflow";
import "reactflow/dist/style.css";
import AnimatedEdge from "./AnimatedEdge";

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  animated: AnimatedEdge,
};

// STATIC NODES (NO PHYSICS)
const initialNodes: Node[] = [
  { id: "idp", position: { x: 100, y: 200 }, type: "custom", data: { label: "Identity Provider", type: "identity" } },
  { id: "sentinel", position: { x: 350, y: 200 }, type: "custom", data: { label: "Sentinel Proxy", type: "security" } },
  { id: "lumenlog", position: { x: 650, y: 200 }, type: "custom", data: { label: "LumenLog Pipeline", type: "observability" } },
  { id: "vortex", position: { x: 900, y: 200 }, type: "custom", data: { label: "Vortex Jobs", type: "system" } },

  { id: "kernel", position: { x: 100, y: 400 }, type: "custom", data: { label: "Kernel Security", type: "security" } },
  { id: "lab", position: { x: 350, y: 400 }, type: "custom", data: { label: "OWASP Lab", type: "security" } },
  { id: "cracker", position: { x: 650, y: 400 }, type: "custom", data: { label: "Distributed Cracker", type: "distributed" } },
];

// STATIC EDGES
const baseEdges: Edge[] = [
  { id: "e1", source: "idp", target: "sentinel" },
  { id: "e2", source: "sentinel", target: "lumenlog" },
  { id: "e3", source: "sentinel", target: "lab" },
  { id: "e4", source: "sentinel", target: "cracker" },
  { id: "e5", source: "kernel", target: "sentinel" },
  { id: "e6", source: "lumenlog", target: "vortex" },
];

export default function SystemGraph({
  onNodeClick,
}: {
  onNodeClick: (id: string) => void;
}) {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [flowStep, setFlowStep] = useState(0);

  useEffect(() => {
    const order = ["idp", "sentinel", "lumenlog", "vortex"];
    let i = 0;

    const interval = setInterval(() => {
      if (!isHovering) {
        setFlowStep(0); // reset before switching
        setActiveNode(order[i]);
        i = (i + 1) % order.length;
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isHovering]);

  useEffect(() => {
    if (!activeNode) return;

    const steps = [1, 2, 3, 4];
    let i = 0;

    const interval = setInterval(() => {
      setFlowStep(steps[i]);
      i++;

      if (i >= steps.length) {
        clearInterval(interval);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [activeNode]);

  return (
    <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-xl p-4 shadow-[0_0_40px_rgba(0,0,0,0.6)]">

      {/* glow background */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/3 via-purple-500/3 to-transparent pointer-events-none" />
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.15),transparent_40%)] animate-pulse" />
      </div>

      <div className="h-[460px] w-full rounded-xl overflow-hidden relative z-10">
        <ReactFlow
          nodes={initialNodes.map((node) => ({
            ...node,
            data: {
              ...node.data,
              active: node.id === activeNode,
            },
          }))}

          edges={baseEdges.map((e) => {
            const isConnected =
              e.source === activeNode || e.target === activeNode;

            // staged activation rules
            let isActive = false;

            if (activeNode === "sentinel") {
              if (flowStep >= 1 && e.id === "e1") isActive = true; // idp -> sentinel
              if (flowStep >= 2 && e.id === "e2") isActive = true; // sentinel -> lumenlog
              if (flowStep >= 3 && (e.id === "e3" || e.id === "e4")) isActive = true; // branches
              if (flowStep >= 4 && e.id === "e6") isActive = true; // lumenlog -> vortex
            } else {
              // fallback (other nodes)
              isActive = isConnected;
            }
            return {
              ...e,
              type: "animated",
              animated: false,
              data: {
                active: isActive, // THIS is the key
              },
              style: {
                stroke: isActive
                  ? e.source === "sentinel"
                    ? "#f87171" // security
                    : e.source === "lumenlog"
                    ? "#c084fc" // observability
                    : "#60a5fa" // default
                  : "#1f2937",
                strokeWidth: isActive ? 3 : 1.5,
                opacity: isActive ? 1 : 0.1,
              },
            };
          })}

          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}

          fitView
          minZoom={0.7}
          maxZoom={1.6}
          panOnDrag
          zoomOnScroll

          proOptions={{ hideAttribution: true }}

          // HOVER = GROUPING EFFECT
          onNodeMouseEnter={(_, node) => {
            setIsHovering(true);
            setFlowStep(0); // reset HERE instead
            setActiveNode(node.id);
          }}

          onNodeMouseLeave={() => {
            setIsHovering(false);
            setActiveNode(null);
          }}

          // CLICK = ACTION
          onNodeClick={(_, node) => {
            setActiveNode(node.id);
            onNodeClick(node.id);

            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("terminal-command", {
                  detail: node.id,
                })
              );
            }
          }}
        >
          <Background gap={20} size={1} color="#111827" />
          <Controls className="!bg-black/70 !border !border-white/10 !rounded-lg" />
        </ReactFlow>
      </div>
    </div>
  );
}