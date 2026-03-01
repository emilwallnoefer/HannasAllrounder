"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";

const ROSE = "#e4a8b0";
const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function getMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startDow = first.getDay() === 0 ? 6 : first.getDay() - 1;
  const daysInMonth = last.getDate();
  const grid: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) grid.push(null);
  for (let d = 1; d <= daysInMonth; d++) grid.push(d);
  return grid;
}

export function KalenderVorschau() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const grid = getMonthGrid(year, month);
  const monthName = now.toLocaleDateString("de-DE", { month: "long" });

  return (
    <Link
      href="/dashboard/kalender"
      className="glass-card glass-card-hover block p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-rose/50 hover:shadow-rose-glow"
    >
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-rose" style={{ color: ROSE }} />
        <span className="text-sm font-medium text-white capitalize">{monthName} {year}</span>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-[10px] text-gray-500 py-0.5">
            {d}
          </div>
        ))}
        {grid.map((d, i) => {
          const isToday = d === today;
          return (
            <div
              key={i}
              className={`aspect-square flex items-center justify-center rounded-lg text-xs ${
                d == null ? "invisible" : "text-gray-400"
              } ${isToday ? "ring-2 ring-rose font-semibold text-rose" : ""}`}
            >
              {d ?? ""}
            </div>
          );
        })}
      </div>
    </Link>
  );
}
