export type CalendarEvent = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  category: string | null;
};

export type CalendarEventInsert = {
  user_id: string;
  title: string;
  description?: string | null;
  start_time: string;
  end_time: string;
  category?: string | null;
};
