# Gedanken-Deponie: Wie die Daten vom Textfeld in die Datenbank kommen

## Kurzüberblick

1. **Eingabe** → Du tippst im Textfeld „Was geht dir durch den Kopf?“ und drückst **Enter** oder klickst auf den **Senden-Button**.
2. **Client** → Die React-Komponente `GedankenDeponie` ruft `handleSubmit` auf und liest den aktuellen User von Supabase Auth (`supabase.auth.getUser()`).
3. **Supabase** → Mit dem Browser-Client wird ein **INSERT** an die Tabelle `notes` geschickt: `user_id` (vom eingeloggten User), `content` (dein Text), `is_pinned: false`.
4. **Datenbank** → Supabase schreibt die Zeile in die Tabelle `notes`. Durch **Row Level Security (RLS)** darf nur dein eigener `user_id` gespeichert werden.
5. **Anzeige** → Die Liste der Notizen wird entweder durch **Realtime** (Supabase Channel) aktualisiert oder durch erneutes Laden nach dem Speichern. Gepinnte Notizen stehen oben, darunter die neuesten zuerst.

## Ablauf im Detail

```
[Textfeld] → Enter/Button
    ↓
handleSubmit() in GedankenDeponie.tsx
    ↓
supabase.auth.getUser()  →  user.id
    ↓
supabase.from("notes").insert({ user_id: user.id, content: text, is_pinned: false })
    ↓
Supabase API (HTTPS)  →  Postgres: INSERT INTO notes (...)
    ↓
RLS prüft: auth.uid() = user_id  →  erlaubt nur eigene Zeilen
    ↓
Neue Zeile in der Tabelle  →  Realtime (falls aktiv) oder fetchNotes() aktualisiert die Liste
```

## Wichtige Stellen im Code

- **Speichern:** `GedankenDeponie.tsx` → `handleSubmit` → `supabase.from("notes").insert(...)`.
- **Laden:** `fetchNotes()` → `supabase.from("notes").select("*").eq("user_id", user.id).order(...)`.
- **Echtzeit:** `useEffect` mit `supabase.channel("notes-changes").on("postgres_changes", ...)` – sobald sich in `notes` etwas ändert (INSERT/UPDATE/DELETE), wird `fetchNotes()` erneut aufgerufen.
- **Sicherheit:** In der Datenbank sorgen die RLS-Policies dafür, dass jeder User nur eigene Zeilen sieht und ändert.

## Realtime aktivieren (optional)

Damit Änderungen sofort in der Liste erscheinen (ohne Reload), muss die Tabelle `notes` in Supabase für Realtime freigegeben sein:

**Supabase Dashboard** → **Database** → **Replication** → Tabelle `notes` aktivieren.

Wenn Realtime nicht aktiv ist, werden die Notizen trotzdem beim Laden der Seite und nach jedem Speichern/Löschen/Pinnen korrekt angezeigt.
