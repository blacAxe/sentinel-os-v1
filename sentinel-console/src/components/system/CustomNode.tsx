"use client";

import { Handle, Position } from "reactflow";

type Props = {
  data: {
    label: string;
    type?: string;
    active?: boolean;
  };
};


export default function CustomNode({ data }: Props) {
  const isActive = data?.active;
  const type = data?.type;
  const styles: Record<string, string> = {
    identity: "border-blue-500/60 shadow-[0_0_20px_rgba(59,130,246,0.25)]",
    security: "border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.25)]",
    observability: "border-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.25)]",
    distributed: "border-yellow-500/60 shadow-[0_0_20px_rgba(234,179,8,0.25)]",
    system: "border-gray-500/50 shadow-[0_0_15px_rgba(156,163,175,0.2)]",
  };

  const glow = styles[data.type || "system"];

  const glowColor =
    type === "security"
      ? "rgba(248,113,113,0.6)" // red
      : type === "observability"
      ? "rgba(192,132,252,0.6)" // purple
      : type === "identity"
      ? "rgba(96,165,250,0.6)" // blue
      : "rgba(156,163,175,0.5)"; // default

  return (
    <div
      className="relative group cursor-pointer transition-transform duration-300"
      onMouseEnter={() => console.log(data.label)}
    >
      
      {/* glow background */}
      <div className={`absolute inset-0 rounded-xl blur-md opacity-40 group-hover:opacity-70 transition ${glow}`} />

      {/* main node */}
      <div
        className={`
          relative px-4 py-2 rounded-xl border text-sm font-medium
          transition-all duration-300
          ${isActive ? "scale-105" : "scale-100"}
        `}
        style={{
          borderColor: isActive ? glowColor : "rgba(255,255,255,0.1)",
          boxShadow: isActive
            ? `0 0 12px ${glowColor}, 0 0 30px ${glowColor}`
            : "none",
        }}
      >
        <div className="flex flex-col">
          <span className="text-xs text-gray-400 uppercase tracking-wide">
            {data.type}
          </span> 

          <span
            className="transition-all duration-300"
            style={{
              opacity: isActive ? 1 : 0.9,
            }}
          >
            {data.label}
          </span>
        </div>

      </div>

      {/* handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-gray-400 !border-none"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-gray-400 !border-none"
      />
    </div>
  );
}