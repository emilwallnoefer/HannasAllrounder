"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Subject } from "@/types/school";
import type { CurriculumItem } from "@/types/school";
import { getProgressPercent, DEFAULT_SUBJECTS } from "@/types/school";
import { GraduationCap } from "lucide-react";

type SubjectWithItems = Subject & { curriculum_items: CurriculumItem[] };

const ROSE = "#e4a8b0";

export function SchuleKachel() {
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
        const withItems = (refetched as Subject[]).map((s) => ({
          ...s,
          curriculum_items: itemsList.filter((i) => i.subject_id === s.id),
        }));
        setSubjects(withItems);
      }
    } else {
      const ids = list.map((s) => s.id);
      const { data: items } = await supabase
        .from("curriculum_items")
        .select("*")
        .in("subject_id", ids);
      const itemsList = (items as CurriculumItem[]) ?? [];
      const withItems = list.map((s) => ({
        ...s,
        curriculum_items: itemsList.filter((i) => i.subject_id === s.id),
      }));
      setSubjects(withItems);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalItems = subjects.reduce((acc, s) => acc + s.curriculum_items.length, 0);
  const totalCompleted = subjects.reduce(
    (acc, s) => acc + s.curriculum_items.filter((i) => i.is_completed).length,
    0
  );
  const overallPercent = getProgressPercent(totalCompleted, totalItems);

  return (
    <Link
      href="/dashboard/schule"
      className="glass-card glass-card-hover block p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-rose/50 hover:shadow-rose-glow"
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="p-2.5 rounded-2xl border border-rose/30 flex items-center justify-center"
          style={{ backgroundColor: `${ROSE}20` }}
        >
          <GraduationCap className="w-5 h-5 text-rose" style={{ color: ROSE }} />
        </div>
        <p className="text-sm text-gray-400">
          {loading ? "Lade…" : `Gesamtfortschritt: ${overallPercent} %`}
        </p>
      </div>
      <div className="h-3 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${overallPercent}%`,
            backgroundColor: ROSE,
          }}
        />
      </div>
    </Link>
  );
}
