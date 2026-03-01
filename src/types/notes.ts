export type Note = {
  id: string;
  user_id: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
};

export type NoteInsert = Pick<Note, "content"> & {
  user_id: string;
  is_pinned?: boolean;
};

export type NoteUpdate = Partial<Pick<Note, "content" | "is_pinned">>;
