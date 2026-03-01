# Hannas Allrounder – Erklärung der Dateien (für Anfänger)

Diese Übersicht erklärt, welche Dateien es gibt und wofür sie da sind.

---

## Projekt-Root (HannasAllrounder/)

| Datei | Zweck |
|-------|--------|
| **package.json** | Liste aller NPM-Pakete (Next.js, React, Tailwind, Supabase usw.) und die Skripte `npm run dev`, `npm run build`, `npm run start`. |
| **tsconfig.json** | TypeScript-Konfiguration: Pfade wie `@/*` und wie streng der Compiler prüft. |
| **next.config.ts** | Einstellungen für Next.js (z.B. Platzhalter-Env für den Build). |
| **tailwind.config.ts** | Tailwind: z.B. Akzentfarbe Rosé (`#e4a8b0`), abgerundete Ecken, Glow-Shadow. |
| **postcss.config.mjs** | Konfiguration für PostCSS (wird von Tailwind genutzt). |
| **.env.local.example** | Vorlage für Umgebungsvariablen. Du kopierst sie nach `.env.local` und trägst dort deine echten Supabase-Werte ein. |
| **.gitignore** | Sagt Git, welche Dateien/Ordner nicht mit ins Repo sollen (z.B. `node_modules`, `.env.local`). |

---

## src/app/ (Seiten & Layouts – App Router)

| Datei/Ordner | Zweck |
|--------------|--------|
| **layout.tsx** | Wurzel-Layout für die ganze App: HTML-Grundgerüst, globale Styles, Titel „Hannas Allrounder“. |
| **page.tsx** | Startseite `/`: Prüft, ob jemand eingeloggt ist → dann Weiterleitung zu `/dashboard`, sonst zu `/login`. |
| **globals.css** | Globale Styles: Dark Mode, Glassmorphism-Klassen (`.glass-card`, `.glass-card-hover`), Rosé-Hover/Glow. |
| **login/page.tsx** | Login-Seite `/login`: Formular (E-Mail, Passwort), Anmeldung über Supabase Auth, bei Erfolg Weiterleitung zum Dashboard. |
| **signup/page.tsx** | Registrierung `/signup`: Konto anlegen, Bestätigungshinweis, Link zur Anmeldung. |
| **auth/callback/route.ts** | Route für den E-Mail-Bestätigungslink von Supabase. Tauscht den Code gegen eine Session und leitet z.B. zum Dashboard weiter. |
| **dashboard/layout.tsx** | Layout nur für `/dashboard/*`: Prüft, ob ein User eingeloggt ist (sonst → Login), zeigt die seitliche Navigation. |
| **dashboard/page.tsx** | Dashboard-Seite `/dashboard`: Überschrift, Kurztext und die Kacheln (über die Komponente). |
| **dashboard/settings/page.tsx** | Einstellungsseite `/dashboard/settings`: Platzhalter für spätere Einstellungen. |

---

## src/components/

| Datei | Zweck |
|-------|--------|
| **DashboardNav.tsx** | Seitliche Navigation im Dashboard: Links (Dashboard, Einstellungen), Anzeige der User-E-Mail, Abmelden-Button. |
| **DashboardTiles.tsx** | Die Kacheln auf dem Dashboard: Glassmorphism, abgerundete Ecken, Rosé-Border und leichter Glow beim Hover. |

---

## src/lib/supabase/

| Datei | Zweck |
|-------|--------|
| **client.ts** | Supabase-Client für den **Browser** (z.B. Login-Formular, Abmelden). Wird in Client Components genutzt. |
| **server.ts** | Supabase-Client für den **Server** (z.B. „ist jemand eingeloggt?“ in Layouts/Seiten). Nutzt die Cookie-API von Next.js. |
| **middleware.ts** | Hilfsfunktion für die **Middleware**: Session-Cookies aktuell halten, damit die Anmeldung über Seitenaufrufe hinweg funktioniert. |

---

## src/middleware.ts

| Datei | Zweck |
|-------|--------|
| **middleware.ts** | Next.js Middleware: wird bei (fast) jedem Request ausgeführt und ruft die Supabase-Session-Aktualisierung auf. So bleiben Login-Status und Cookies synchron. |

---

## Ablauf in Kurzform

1. **Besuch von /**  
   `src/app/page.tsx` prüft per Supabase (Server), ob ein User da ist → Redirect zu `/dashboard` oder `/login`.

2. **Login**  
   Auf `/login` gibst du E-Mail und Passwort ein. `login/page.tsx` (Client) ruft Supabase Auth auf. Bei Erfolg: Redirect zu `/dashboard`.

3. **Dashboard**  
   `dashboard/layout.tsx` prüft wieder auf dem Server, ob ein User eingeloggt ist. Wenn nicht → Redirect zu `/login`. Wenn ja: Navigation und Inhalt (z.B. Kacheln) werden angezeigt.

4. **Design**  
   Dark Background, Glassmorphism (halbtransparente Karten mit Backdrop-Blur), Rosé `#e4a8b0` als Akzent. Die Kacheln nutzen die Klassen aus `globals.css` für den dezenten Rosé-Rand und leichten Glow beim Hover.

Wenn du eine bestimmte Datei genauer verstehen willst, kannst du sie im Editor öffnen und nach dieser Übersicht die passende Zeile/Stelle ansehen.
