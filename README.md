# Hannas Allrounder

Sichere Web-App mit Next.js (App Router), Tailwind CSS, Lucide Icons und Supabase.

## Voraussetzungen

- Node.js 18+
- Supabase-Projekt ([supabase.com](https://supabase.com))

## Einrichtung

1. **Abhängigkeiten installieren**
   ```bash
   npm install
   ```

2. **Umgebungsvariablen**
   - Datei `.env.local.example` nach `.env.local` kopieren
   - In der [Supabase Dashboard](https://supabase.com/dashboard) unter **Settings → API** die Werte eintragen:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Entwicklungsserver starten**
   ```bash
   npm run dev
   ```
   App: [http://localhost:3000](http://localhost:3000)

4. **Ersten Nutzer anlegen**
   - `/signup` aufrufen und E-Mail/Passwort registrieren
   - E-Mail bestätigen (falls in Supabase aktiviert), dann unter `/login` anmelden

5. **Gedanken-Deponie (Modul „notes“)**
   - Im [Supabase Dashboard](https://supabase.com/dashboard) → **SQL Editor** das Script aus `supabase/migrations/001_notes_table.sql` ausführen, um die Tabelle `notes` und RLS anzulegen.
   - Optional: Unter **Database → Replication** die Tabelle `notes` für Realtime aktivieren.
   - Außerdem `supabase/migrations/002_household_tasks.sql` ausführen (Haushalts-Tracker).
   - Für das Schul-Jahresprogramm: `supabase/migrations/005_school_curriculum.sql` (Fächer + Themen).
   - Kalender & Wasser: `supabase/migrations/007_events_water.sql` (events, water_logs).

## Projektstruktur (Überblick)

- `src/app/` – Seiten und Layouts (App Router)
- `src/components/` – Wiederverwendbare UI-Komponenten
- `src/lib/supabase/` – Supabase-Clients für Browser, Server und Middleware

## Deployment (Vercel)

1. **Projekt bei Vercel anmelden**
   - [vercel.com](https://vercel.com) → Login (z. B. mit GitHub).
   - Im Projektordner: `npx vercel` ausführen und den Anweisungen folgen (Login im Browser bei Bedarf).

2. **Umgebungsvariablen in Vercel setzen**
   - Vercel Dashboard → dein Projekt → **Settings** → **Environment Variables**
   - Hinzufügen:
     - `NEXT_PUBLIC_SUPABASE_URL` = deine Supabase Project URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = dein Supabase anon/public Key
   - Für alle Umgebungen (Production, Preview, Development) aktivieren.

3. **Supabase für Produktion**
   - In Supabase unter **Authentication → URL Configuration** die Vercel-URL (z. B. `https://dein-projekt.vercel.app`) unter **Site URL** und bei **Redirect URLs** eintragen, damit Login/Logout und E-Mail-Links funktionieren.

## Skripte

- `npm run dev` – Entwicklung mit Hot Reload
- `npm run build` – Produktions-Build
- `npm run start` – Produktions-Server
- `npm run lint` – ESLint
