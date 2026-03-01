"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CalendarEvent } from "@/types/calendar";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { createPortal } from "react-dom";

const ROSE = "#e4a8b0";
const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function getWeekDates(anchor: Date) {
  const d = new Date(anchor);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  const out: Date[] = [];
  for (let i = 0; i < 7; i++) {
    out.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

function toDateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function KalenderPage() {
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const n = new Date();
    const day = n.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const m = new Date(n);
    m.setDate(m.getDate() + diff);
    return m;
  });
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const weekDates = getWeekDates(weekStart);

  const fetchEvents = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const dates = getWeekDates(weekStart);
    const start = new Date(dates[0]);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dates[6]);
    end.setHours(23, 59, 59, 999);
    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("user_id", user.id)
      .gte("start_time", start.toISOString())
      .lte("start_time", end.toISOString());
    setEvents((data as CalendarEvent[]) ?? []);
    setLoading(false);
  }, [supabase, weekStart.getTime()]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const eventsByDay: Record<string, CalendarEvent[]> = {};
  weekDates.forEach((d) => {
    eventsByDay[toDateKey(d)] = events.filter((e) => toDateKey(new Date(e.start_time)) === toDateKey(d));
  });

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
    setLoading(true);
  };
  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
    setLoading(true);
  };

  const todayKey = toDateKey(new Date());

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-semibold text-white">Kalender</h2>
        <div className="flex items-center justify-between sm:justify-end gap-2">
          <button
            type="button"
            onClick={prevWeek}
            className="p-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Vorherige Woche"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs sm:text-sm text-gray-400 min-w-0 sm:min-w-[180px] text-center truncate">
            {weekDates[0].toLocaleDateString("de-DE", { day: "numeric", month: "short" })} –{" "}
            {weekDates[6].toLocaleDateString("de-DE", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <button
            type="button"
            onClick={nextWeek}
            className="p-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Nächste Woche"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2 min-w-0">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[10px] sm:text-sm text-gray-500 py-1 sm:py-2">
            {d}
          </div>
        ))}
        {weekDates.map((d) => {
          const key = toDateKey(d);
          const dayEvents = eventsByDay[key] ?? [];
          const isToday = key === todayKey;
          return (
            <div
              key={key}
              className={`glass-card glass-card-hover min-h-[80px] sm:min-h-[120px] p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-rose/50 hover:shadow-rose-glow cursor-pointer ${
                isToday ? "ring-2 ring-rose" : ""
              }`}
              onClick={() => setSelectedDate(key)}
            >
              <p className={`text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 ${isToday ? "text-rose" : "text-white"}`}>
                {d.getDate()}
              </p>
              <ul className="space-y-0.5 sm:space-y-1">
                {dayEvents.slice(0, 3).map((e) => (
                  <li
                    key={e.id}
                    className="text-[10px] sm:text-xs truncate px-1 sm:px-1.5 py-0.5 rounded border border-rose/30 bg-rose/10 text-rose"
                    style={{ boxShadow: "0 0 12px rgba(228,168,176,0.2)" }}
                  >
                    {e.title}
                  </li>
                ))}
                {dayEvents.length > 3 && (
                  <li className="text-xs text-gray-500">+{dayEvents.length - 3}</li>
                )}
              </ul>
            </div>
          );
        })}
      </div>

      {selectedDate &&
        createPortal(
          <TerminModal
            date={selectedDate}
            onClose={() => setSelectedDate(null)}
            onSaved={() => {
              setSelectedDate(null);
              fetchEvents();
            }}
            supabase={supabase}
          />,
          document.body
        )}
    </div>
  );
}

type TerminModalProps = {
  date: string;
  onClose: () => void;
  onSaved: () => void;
  supabase: ReturnType<typeof createClient>;
};

function TerminModal({ date, onClose, onSaved, supabase }: TerminModalProps) {
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showBookIcon = title.trim().toLowerCase().includes("lernen");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) {
      setError("Titel fehlt.");
      return;
    }
    setError(null);
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSubmitting(false);
      return;
    }
    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(`${date}T${endTime}:00`);
    if (end <= start) {
      setError("Endzeit muss nach Startzeit liegen.");
      setSubmitting(false);
      return;
    }
    const { error: err } = await supabase.from("events").insert({
      user_id: user.id,
      title: t,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      category: "Privat",
    });
    setSubmitting(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSaved();
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="termin-modal-title"
    >
      <div
        className="glass-card w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl border border-white/10 bg-[#0f0f0f]/95 backdrop-blur-xl p-4 sm:p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="termin-modal-title" className="text-lg font-semibold text-white mb-4">
          Termin am {new Date(date + "T12:00").toLocaleDateString("de-DE", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-2">
              {error}
            </p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Titel</label>
            <div className="relative">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="z. B. Lernen, Meeting …"
                className="w-full pl-4 pr-10 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-rose/50 focus:ring-1 focus:ring-rose/30"
              />
              {showBookIcon && (
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-rose"
                  title="Lernen"
                >
                  <BookOpen className="w-5 h-5" />
                </span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Start</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-rose/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Ende</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-rose/50"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-white/20 text-gray-400 hover:bg-white/5"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 rounded-2xl bg-rose/20 border border-rose/30 text-rose font-medium hover:bg-rose/30 hover:border-rose/50 hover:shadow-rose-glow transition-all disabled:opacity-50"
            >
              {submitting ? "Speichern…" : "Speichern"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
