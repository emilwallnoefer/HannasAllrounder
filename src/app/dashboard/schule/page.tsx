"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Subject } from "@/types/school";
import type { CurriculumItem } from "@/types/school";
import { getProgressPercent, DEFAULT_SUBJECTS } from "@/types/school";
import { ChevronRight } from "lucide-react";

type SubjectWithItems = Subject & { curriculum_items: CurriculumItem[] };

export default function SchulePage() {
  const [subjects, setSubjects] = useState<SubjectWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: subjectsData, error: subError } = await supabase
      .from("subjects")
      .select("*")
      .eq("user_id", user.id)
      .order("name");
    if (subError) {
      setLoading(false);
      return;
    }
    const list = (subjectsData as Subject[]) ?? [];
    if (list.length === 0) {
      for (const s of DEFAULT_SUBJECTS) {
        await supabase.from("subjects").insert({
          user_id: user.id,
          name: s.name,
          color: s.color,
        });
      }
      const { data: refetched } = await supabase
        .from("subjects")
        .select("*")
        .eq("user_id", user.id)
        .order("name");
      const ids = (refetched as Subject[] ?? []).map((s) => s.id);
      if (ids.length > 0) {
        const { data: items } = await supabase
          .from("curriculum_items")
          .select("*")
          .in("subject_id", ids);
        const itemsList = (items as CurriculumItem[]) ?? [];
        setSubjects(
          (refetched as Subject[]).map((s) => ({
            ...s,
            curriculum_items: itemsList.filter((i) => i.subject_id === s.id),
          }))
        );
      }
    } else {
      const ids = list.map((s) => s.id);
      const { data: items } = await supabase
        .from("curriculum_items")
        .select("*")
        .in("subject_id", ids);
      const itemsList = (items as CurriculumItem[]) ?? [];
      setSubjects(
        list.map((s) => ({
          ...s,
          curriculum_items: itemsList.filter((i) => i.subject_id === s.id),
        }))
      );
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white mb-1">Schul-Jahresprogramm</h2>
        <p className="text-gray-500 text-sm">
          Fächer auswählen und Themen abhaken.
        </p>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Lade Fächer…</p>
      ) : (
        <ul className="space-y-4">
          {subjects.map((subject) => {
            const total = subject.curriculum_items.length;
            const completed = subject.curriculum_items.filter((i) => i.is_completed).length;
            const percent = getProgressPercent(completed, total);
            const color = subject.color || "#e4a8b0";
            return (
              <li key={subject.id}>
                <Link
                  href={`/dashboard/schule/${subject.id}`}
                  className="glass-card glass-card-hover flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-[var(--card-color)] hover:shadow-[0_0_20px_var(--card-glow)] block"
                  style={
                    {
                      "--card-color": `${color}80`,
                      "--card-glow": `${color}30`,
                    } as React.CSSProperties
                  }
                >
                  <div
                    className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-white font-semibold text-sm"
                    style={{ backgroundColor: `${color}30`, border: `1px solid ${color}50` }}
                  >
                    {subject.name.slice(0, 1)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white">{subject.name}</p>
                    <div className="mt-1.5 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${percent}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-gray-400 shrink-0">{percent} %</span>
                  <ChevronRight className="w-5 h-5 text-gray-500 shrink-0" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
