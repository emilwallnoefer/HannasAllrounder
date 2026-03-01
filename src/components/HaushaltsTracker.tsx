"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { HouseholdTask } from "@/types/household";
import { getCountdown } from "@/types/household";
import { Check, Sparkles } from "lucide-react";

const DEFAULT_TASKS: { name: string; interval_days: number }[] = [
  { name: "Bettwäsche", interval_days: 14 },
  { name: "Zimmer aufräumen", interval_days: 7 },
  { name: "Blumen gießen", interval_days: 7 },
];

export function HaushaltsTracker() {
  const [tasks, setTasks] = useState<HouseholdTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const supabase = createClient();

  const fetchTasks = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("household_tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("name");
    if (error) {
      setLoading(false);
      return;
    }
    const list = data ?? [];
    if (list.length === 0) {
      for (const t of DEFAULT_TASKS) {
        await supabase.from("household_tasks").insert({
          user_id: user.id,
          name: t.name,
          interval_days: t.interval_days,
          last_completed: new Date().toISOString(),
        });
      }
      const { data: refetched } = await supabase
        .from("household_tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("name");
      setTasks(refetched ?? []);
    } else {
      setTasks(list);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  async function markDone(task: HouseholdTask) {
    setUpdatingId(task.id);
    await supabase
      .from("household_tasks")
      .update({ last_completed: new Date().toISOString() })
      .eq("id", task.id)
      .eq("user_id", task.user_id);
    await fetchTasks();
    setUpdatingId(null);
  }

  if (loading) {
    return (
      <div className="text-gray-500 text-sm py-4">Lade Haushalts-Aufgaben…</div>
    );
  }

  return (
    <ul className="space-y-4">
      {tasks.length === 0 && (
        <li className="text-gray-500 text-sm py-4">Keine Aufgaben angelegt.</li>
      )}
      {tasks.map((task) => {
        const { daysLeft, isOverdue } = getCountdown(task);
        const countdownText =
          daysLeft < 0
            ? "Überfällig!"
            : daysLeft === 0
              ? "Heute fällig"
              : `Noch ${daysLeft} ${daysLeft === 1 ? "Tag" : "Tage"}`;
        return (
          <li
            key={task.id}
            className="glass-card glass-card-hover group flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-rose/50 hover:shadow-rose-glow"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-white truncate">{task.name}</p>
              <p
                className={`text-sm mt-0.5 ${
                  isOverdue
                    ? "text-rose font-semibold drop-shadow-[0_0_8px_rgba(228,168,176,0.5)]"
                    : "text-gray-400"
                }`}
              >
                {countdownText}
              </p>
            </div>
            <button
              type="button"
              onClick={() => markDone(task)}
              disabled={updatingId === task.id}
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose/20 border border-rose/30 text-rose text-sm font-medium hover:bg-rose/30 hover:border-rose/50 hover:shadow-rose-glow transition-all duration-300 disabled:opacity-50"
              aria-label={`${task.name} erledigt`}
            >
              {updatingId === task.id ? (
                <Sparkles className="w-4 h-4 animate-pulse" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Erledigt
            </button>
          </li>
        );
      })}
    </ul>
  );
}
