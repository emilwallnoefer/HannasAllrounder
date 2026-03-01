-- Tabellen: subjects + curriculum_items (Schul-Jahresprogramm)
-- subjects: Fächer pro User
-- curriculum_items: Themen pro Fach mit Erledigt-Status

CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#e4a8b0'
);

CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON public.subjects(user_id);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subjects"
  ON public.subjects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subjects"
  ON public.subjects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subjects"
  ON public.subjects FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own subjects"
  ON public.subjects FOR DELETE USING (auth.uid() = user_id);

-- curriculum_items: gehört zu einem Fach
CREATE TABLE IF NOT EXISTS public.curriculum_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_curriculum_items_subject_id ON public.curriculum_items(subject_id);

ALTER TABLE public.curriculum_items ENABLE ROW LEVEL SECURITY;

-- User darf nur Items von eigenen Fächern sehen/bearbeiten
CREATE POLICY "Users can read own curriculum_items"
  ON public.curriculum_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.subjects s WHERE s.id = subject_id AND s.user_id = auth.uid())
  );
CREATE POLICY "Users can insert own curriculum_items"
  ON public.curriculum_items FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.subjects s WHERE s.id = subject_id AND s.user_id = auth.uid())
  );
CREATE POLICY "Users can update own curriculum_items"
  ON public.curriculum_items FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.subjects s WHERE s.id = subject_id AND s.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.subjects s WHERE s.id = subject_id AND s.user_id = auth.uid())
  );
CREATE POLICY "Users can delete own curriculum_items"
  ON public.curriculum_items FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.subjects s WHERE s.id = subject_id AND s.user_id = auth.uid())
  );
