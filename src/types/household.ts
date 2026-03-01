export type HouseholdTask = {
  id: string;
  user_id: string;
  name: string;
  interval_days: number;
  last_completed: string;
};

export function getCountdown(task: HouseholdTask): { daysLeft: number; isOverdue: boolean } {
  const last = new Date(task.last_completed);
  const nextDue = new Date(last);
  nextDue.setDate(nextDue.getDate() + task.interval_days);
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const nextDueStart = new Date(nextDue.getFullYear(), nextDue.getMonth(), nextDue.getDate());
  const diffMs = nextDueStart.getTime() - todayStart.getTime();
  const daysLeft = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return { daysLeft, isOverdue: daysLeft < 0 };
}
