"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  // detect scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItem = (label: string, path: string) => {
    const isActive = pathname === path;

    return (
      <button
        onClick={() => router.push(path)}
        className={`relative px-1 transition ${
          isActive ? "text-white" : "text-gray-400 hover:text-white"
        }`}
      >
        {label}

        {/* underline animation */}
        <span
          className={`absolute left-0 -bottom-1 h-[2px] w-full bg-white transition-all duration-300 ${
            isActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0 group-hover:scale-x-100"
          }`}
        />
      </button>
    );
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 border-b transition-all duration-300
        ${scrolled ? "py-3 bg-black/90 backdrop-blur-xl border-gray-700" : "py-5 bg-black/70 backdrop-blur-md border-gray-800"}
      `}
    >
      <div className="flex justify-between items-center px-10">
        
        {/* LOGO */}
        <div
          onClick={() => router.push("/")}
          className="text-xl font-semibold tracking-wide cursor-pointer hover:text-white transition"
        >
          Sentinel OS
        </div>

        {/* LINKS */}
        <div className="flex items-center gap-8 text-base font-medium">

          {navItem("System", "/")}

          {navItem("Dashboard", "/dashboard")}

          {navItem("Vortex", "/vortex")}

          {navItem("Projects", "/projects")}

          {navItem("About", "/about")}

        </div>
      </div>
    </nav>
  );
}