"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Subject } from "@/types/school";
import type { CurriculumItem } from "@/types/school";
import { getProgressPercent } from "@/types/school";
import { ArrowLeft, Check, Plus } from "lucide-react";

export default function SchuleFachPage() {
  const params = useParams();
  const id = params.id as string;
  const [subject, setSubject] = useState<Subject | null>(null);
  const [items, setItems] = useState<CurriculumItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    if (!id) return;
    const { data: subData, error: subError } = await supabase
      .from("subjects")
      .select("*")
      .eq("id", id)
      .single();
    if (subError || !subData) {
      setLoading(false);
      return;
    }
    setSubject(subData as Subject);
    const { data: itemsData } = await supabase
      .from("curriculum_items")
      .select("*")
      .eq("subject_id", id)
      .order("id");
    setItems((itemsData as CurriculumItem[]) ?? []);
    setLoading(false);
  }, [id, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function toggleItem(item: CurriculumItem) {
    setTogglingId(item.id);
    await supabase
      .from("curriculum_items")
      .update({ is_completed: !item.is_completed })
      .eq("id", item.id);
    await fetchData();
    setTogglingId(null);
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title || !id) return;
    setAdding(true);
    await supabase.from("curriculum_items").insert({ subject_id: id, title, is_completed: false });
    setNewTitle("");
    await fetchData();
    setAdding(false);
  }

  const color = subject?.color ?? "#e4a8b0";
  const total = items.length;
  const completed = items.filter((i) => i.is_completed).length;
  const percent = getProgressPercent(completed, total);

  if (loading || !subject) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/schule"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Zurück zu Fächern
        </Link>
        <p className="text-gray-500">Lade…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Link
        href="/dashboard/schule"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Zurück zu Fächern
      </Link>

      <div className="glass-card p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
        <h2 className="text-xl font-semibold text-white mb-2">{subject.name}</h2>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-3 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${percent}%`, backgroundColor: color }}
            />
          </div>
          <span className="text-sm font-medium shrink-0" style={{ color }}>
            {percent} %
          </span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-4 mb-3">
          <h3 className="text-sm font-medium text-gray-400">Themen</h3>
          <form onSubmit={addItem} className="flex gap-2 flex-1 max-w-sm">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Neues Thema"
              className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[var(--input-color)]"
              style={{ "--input-color": `${color}60` } as React.CSSProperties}
            />
            <button
              type="submit"
              disabled={adding || !newTitle.trim()}
              className="p-2 rounded-xl border transition-all disabled:opacity-50 shrink-0"
              style={{
                borderColor: `${color}50`,
                backgroundColor: `${color}20`,
                color: color,
              }}
              aria-label="Thema hinzufügen"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>
        </div>
        <ul className="space-y-2">
          {items.length === 0 && (
            <li className="text-gray-500 text-sm py-4">Noch keine Themen. Über das Feld oben hinzufügen.</li>
          )}
          {items.map((item) => (
            <li
              key={item.id}
              className="glass-card glass-card-hover flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-[var(--card-color)]"
              style={
                {
                  "--card-color": `${color}60`,
                } as React.CSSProperties
              }
            >
              <button
                type="button"
                onClick={() => toggleItem(item)}
                disabled={togglingId === item.id}
                className="shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all disabled:opacity-50"
                style={{
                  borderColor: item.is_completed ? color : "rgba(255,255,255,0.3)",
                  backgroundColor: item.is_completed ? color : "transparent",
                }}
                aria-label={item.is_completed ? "Als offen markieren" : "Als erledigt markieren"}
              >
                {item.is_completed && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
              </button>
              <span
                className={`flex-1 text-left text-sm ${
                  item.is_completed ? "text-gray-500 line-through" : "text-white"
                }`}
              >
                {item.title}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
