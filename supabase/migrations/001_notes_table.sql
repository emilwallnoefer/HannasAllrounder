-- Tabelle: notes (Gedanken-Deponie)
-- Verknüpft mit auth.users über user_id

CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index für schnelle Abfragen nach User und Sortierung
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_is_pinned ON public.notes(is_pinned) WHERE is_pinned = TRUE;

-- Row Level Security (RLS) aktivieren
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Policy: User darf nur eigene Zeilen lesen
CREATE POLICY "Users can read own notes"
  ON public.notes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: User darf nur eigene Notizen anlegen
CREATE POLICY "Users can insert own notes"
  ON public.notes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: User darf nur eigene Notizen aktualisieren (z.B. is_pinned)
CREATE POLICY "Users can update own notes"
  ON public.notes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: User darf nur eigene Notizen löschen
CREATE POLICY "Users can delete own notes"
  ON public.notes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Realtime (optional): In Supabase Dashboard → Database → Replication
-- die Tabelle "notes" für Realtime aktivieren, dann werden Änderungen live angezeigt.
