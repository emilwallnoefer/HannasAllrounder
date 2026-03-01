-- Tabelle: household_tasks (Haushalts-Tracker)
-- Verknüpft mit auth.users über user_id

CREATE TABLE IF NOT EXISTS public.household_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  interval_days INTEGER NOT NULL CHECK (interval_days > 0),
  last_completed TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_household_tasks_user_id ON public.household_tasks(user_id);

ALTER TABLE public.household_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own household_tasks"
  ON public.household_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own household_tasks"
  ON public.household_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own household_tasks"
  ON public.household_tasks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own household_tasks"
  ON public.household_tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Standard-Aufgaben für jeden neu registrierten User anlegen
CREATE OR REPLACE FUNCTION public.handle_new_user_household_tasks()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.household_tasks (user_id, name, interval_days, last_completed)
  VALUES
    (NEW.id, 'Bettwäsche', 14, now()),
    (NEW.id, 'Zimmer aufräumen', 7, now()),
    (NEW.id, 'Blumen gießen', 7, now());
  RETURN NEW;
END;
$$;

-- Trigger: Nach Insert in auth.users die 3 Standard-Aufgaben anlegen
DROP TRIGGER IF EXISTS on_auth_user_created_household ON auth.users;
CREATE TRIGGER on_auth_user_created_household
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_household_tasks();
