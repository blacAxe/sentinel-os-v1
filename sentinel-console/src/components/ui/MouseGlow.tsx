"use client";

import { useState } from "react";

export default function MouseGlow() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  return (
    <div
      onMouseMove={(e) =>
        setMouse({ x: e.clientX, y: e.clientY })
      }
      className="fixed inset-0 z-0"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(
            600px at ${mouse.x}px ${mouse.y}px,
            rgba(59,130,246,0.15),
            transparent 80%
          )`,
        }}
      />
    </div>
  );
}