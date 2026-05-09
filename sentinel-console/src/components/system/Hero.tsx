"use client";

import { useRouter } from "next/navigation";

export default function Hero() {

  const router = useRouter();

  return (
    <section className="relative h-[55vh] w-full bg-black text-white flex items-center justify-center overflow-hidden py-8">
      
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 blur-2xl" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Content */}
      <div className="relative z-10 text-center space-y-6">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
          Sentinel OS
        </h1>

        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          A unified platform for building, securing, and observing distributed systems.
        </p>

        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => {
              document
                .getElementById("system")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition hover:scale-105 active:scale-95"
          >
            Explore System
          </button>

          <button
            onClick={() => router.push("/projects")}
            className="px-6 py-2 border border-gray-700 rounded-lg hover:border-white transition hover:scale-105 active:scale-95"
          >
            View Projects
          </button>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-black pointer-events-none" />
    </section>
  );
}