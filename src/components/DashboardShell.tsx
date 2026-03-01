"use client";

import { useState, useEffect } from "react";
import { DashboardNav } from "./DashboardNav";
import { Menu, X } from "lucide-react";

type Props = { userEmail: string; children: React.ReactNode };

export function DashboardShell({ userEmail, children }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        className="lg:hidden fixed z-30 p-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors min-w-[44px] min-h-[44px]"
        style={{ top: "max(1rem, env(safe-area-inset-top))", left: "max(1rem, env(safe-area-inset-left))" }}
        aria-label="Menü öffnen"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay when sidebar open on mobile */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-20 transition-opacity ${
          menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar: drawer on mobile, static on desktop */}
      <aside
        className={`
          w-64 shrink-0 border-r border-white/10 bg-black/95 backdrop-blur-xl
          fixed lg:relative inset-y-0 left-0 z-20
          transform transition-transform duration-300 ease-out lg:transform-none
          ${menuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="p-4 lg:p-6 flex items-center justify-between lg:block">
          <h1 className="text-lg lg:text-xl font-semibold text-white flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-rose/20 border border-rose/30 flex items-center justify-center text-rose font-bold text-sm">
              H
            </span>
            <span className="truncate">Hannas Allrounder</span>
          </h1>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10"
            aria-label="Menü schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <DashboardNav userEmail={userEmail} onNavigate={() => setMenuOpen(false)} />
      </aside>

      {/* Main content: extra padding on mobile for menu button */}
      <main className="flex-1 overflow-auto p-4 pt-20 lg:pt-6 lg:p-8 min-w-0">
        {children}
      </main>
    </div>
  );
}
