"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Droplets, Plus, Minus } from "lucide-react";

const GOAL_ML = 2000;
const STEP_ML = 250;
const ROSE = "#e4a8b0";

export function WasserTracker() {
  const [totalToday, setTotalToday] = useState(0);
  const [logs, setLogs] = useState<{ id: string; amount: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const today = new Date().toISOString().slice(0, 10);

  const fetchToday = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("water_logs")
      .select("id, amount")
      .eq("user_id", user.id)
      .eq("created_at", today)
      .order("id", { ascending: true });
    const list = data ?? [];
    setLogs(list);
    setTotalToday(list.reduce((s, l) => s + l.amount, 0));
    setLoading(false);
  }, [supabase, today]);

  useEffect(() => {
    fetchToday();
  }, [fetchToday]);

  async function add250() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("water_logs").insert({
      user_id: user.id,
      amount: STEP_ML,
      created_at: today,
    });
    await fetchToday();
  }

  async function removeLast() {
    if (logs.length === 0) return;
    const last = logs[logs.length - 1];
    await supabase.from("water_logs").delete().eq("id", last.id);
    await fetchToday();
  }

  const percent = Math.min(100, (totalToday / GOAL_ML) * 100);

  return (
    <div className="glass-card glass-card-hover p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-rose/50 hover:shadow-rose-glow">
      <div className="flex items-center gap-2 mb-3">
        <Droplets className="w-4 h-4 text-rose" style={{ color: ROSE }} />
        <span className="text-sm font-medium text-white">Wasser</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative w-12 h-24 rounded-b-xl border-2 border-white/20 overflow-hidden shrink-0">
          <div
            className="absolute bottom-0 left-0 right-0 rounded-b-[10px] transition-all duration-500"
            style={{
              height: `${percent}%`,
              backgroundColor: ROSE,
              opacity: 0.85,
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold text-white">
            {loading ? "…" : `${totalToday} / ${GOAL_ML} ml`}
          </p>
          <p className="text-xs text-gray-500">Ziel: 2000 ml</p>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={add250}
              className="p-2 rounded-xl bg-rose/20 border border-rose/30 text-rose hover:bg-rose/30 hover:shadow-rose-glow transition-all"
              aria-label="250 ml hinzufügen"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={removeLast}
              disabled={logs.length === 0}
              className="p-2 rounded-xl border border-white/20 text-gray-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-40 disabled:pointer-events-none"
              aria-label="Letzte Portion rückgängig"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
