-- Seed: 10 Fächer + Test-Programm Rechtskunde
-- • 10 Fächer: Betriebswirtschaftslehre, Italienisch, Deutsch, Englisch, Sport,
--   Informationstechnologie, Rechtskunde, Geschichte, Volkswirtschaftskunde, Mathematik
-- • Farben: Rosé-Abstufungen (#e4a8b0 und Varianten)
-- • Rechtskunde: 5 Themen (erste 2 erledigt → 40 %), Rest Platzhalter-Themen → 50 gesamt → 4 % Gesamt
--
-- Im Supabase SQL-Editor ausführen. Verwendet den ersten User aus auth.users.
-- Bei mehreren Usern: v_user_id im Skript auf deine user_id setzen.
--
-- Erwartung nach dem Lauf:
-- • Dashboard „Schule“-Kachel: Gesamtdurchschnitt 4 % (2 von 50 Themen)
-- • /dashboard/schule: Rechtskunde mit 40 %-Balken
-- • /dashboard/schule/[Rechtskunde-id]: 5 Themen mit Checkboxen (2 abgehakt)

DO $$
DECLARE
  v_user_id UUID;
  v_subject_id UUID;
  v_name TEXT;
  v_color TEXT;
  faecher TEXT[] := ARRAY[
    'Betriebswirtschaftslehre', 'Italienisch', 'Deutsch', 'Englisch', 'Sport',
    'Informationstechnologie', 'Rechtskunde', 'Geschichte', 'Volkswirtschaftskunde', 'Mathematik'
  ];
  farben TEXT[] := ARRAY[
    '#e4a8b0', '#e8b0b8', '#ecb8c0', '#e0a0a8', '#d898a0',
    '#d09098', '#dca8b0', '#e4b0b8', '#d8a0a8', '#e4a8b0'
  ];
  i INT;
BEGIN
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Kein User in auth.users. Bitte zuerst registrieren.';
  END IF;

  -- 10 Fächer einfügen (nur wenn für diesen User noch nicht vorhanden)
  FOR i IN 1..array_length(faecher, 1) LOOP
    INSERT INTO public.subjects (user_id, name, color)
    SELECT v_user_id, faecher[i], farben[i]
    WHERE NOT EXISTS (
      SELECT 1 FROM public.subjects s
      WHERE s.user_id = v_user_id AND s.name = faecher[i]
    );
  END LOOP;

  -- Rechtskunde: ID holen
  SELECT id INTO v_subject_id
  FROM public.subjects
  WHERE user_id = v_user_id AND name = 'Rechtskunde'
  LIMIT 1;

  IF v_subject_id IS NOT NULL THEN
    -- 5 Test-Themen für Rechtskunde (erste 2 erledigt = 40%)
    INSERT INTO public.curriculum_items (subject_id, title, is_completed)
    SELECT v_subject_id, v.title, v.done
    FROM (VALUES
      ('Grundlagen des Rechts & Rechtssystem', true),
      ('Personenrecht & Handlungsfähigkeit', true),
      ('Vertragslehre (Allgemeiner Teil)', false),
      ('Kaufvertrag & Mietvertrag', false),
      ('Haftpflichtrecht', false)
    ) AS v(title, done)
    WHERE NOT EXISTS (
      SELECT 1 FROM public.curriculum_items c
      WHERE c.subject_id = v_subject_id AND c.title = v.title
    );
  END IF;

  -- Platzhalter-Themen für die anderen 9 Fächer (je 5), damit Gesamt 50 Themen → 4% bei 2 erledigt
  FOR i IN 1..array_length(faecher, 1) LOOP
    IF faecher[i] <> 'Rechtskunde' THEN
      SELECT id INTO v_subject_id
      FROM public.subjects
      WHERE user_id = v_user_id AND name = faecher[i]
      LIMIT 1;
      IF v_subject_id IS NOT NULL THEN
        INSERT INTO public.curriculum_items (subject_id, title, is_completed)
        SELECT v_subject_id, 'Thema ' || g::text, false
        FROM generate_series(1, 5) g
        WHERE NOT EXISTS (
          SELECT 1 FROM public.curriculum_items c
          WHERE c.subject_id = v_subject_id AND c.title = 'Thema ' || g::text
        );
      END IF;
    END IF;
  END LOOP;
END $$;
