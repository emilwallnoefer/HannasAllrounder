export type Subject = {
  id: string;
  user_id: string;
  name: string;
  color: string;
};

export type CurriculumItem = {
  id: string;
  subject_id: string;
  title: string;
  is_completed: boolean;
};

/** Fortschritt in Prozent: (erledigt / gesamt) * 100 */
export function getProgressPercent(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export const DEFAULT_SUBJECTS: { name: string; color: string }[] = [
  { name: "Mathematik", color: "#e4a8b0" },
  { name: "Deutsch", color: "#94a3b8" },
  { name: "Englisch", color: "#86efac" },
  { name: "BWL", color: "#fcd34d" },
  { name: "Rechnungswesen", color: "#a78bfa" },
  { name: "Geschichte", color: "#f97316" },
  { name: "Geografie", color: "#22d3ee" },
  { name: "Naturwissenschaften", color: "#4ade80" },
  { name: "Informatik", color: "#c084fc" },
  { name: "Sport", color: "#fb7185" },
];
