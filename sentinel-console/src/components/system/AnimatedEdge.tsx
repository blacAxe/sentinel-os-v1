"use client";

import { BaseEdge, EdgeProps, getBezierPath } from "reactflow";

export default function AnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <>
    <defs>
    <filter id="glow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
        <feMerge>
        <feMergeNode in="coloredBlur" />
        <feMergeNode in="SourceGraphic" />
        </feMerge>
    </filter>
    </defs>
      {/* main edge */}
      <BaseEdge id={id} path={edgePath} style={style} />

      {/* moving particle */}
      {data?.active && (
        <circle r="4" fill="#60a5fa" filter="url(#glow)">
            <animateMotion dur="2s" repeatCount="indefinite">
            <mpath href={`#path-${id}`} />
            </animateMotion>
        </circle>
        )}

      {/* invisible path for animation reference */}
      <path id={`path-${id}`} d={edgePath}  fill="none" stroke="none" />
    </>
  );
}