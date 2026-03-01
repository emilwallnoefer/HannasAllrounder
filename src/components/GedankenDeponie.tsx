"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Note } from "@/types/notes";
import { Send, Trash2, Star } from "lucide-react";

export function GedankenDeponie() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [lastAddedNoteId, setLastAddedNoteId] = useState<string | null>(null);
  const supabase = createClient();

  const fetchNotes = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });
    if (!error) setNotes(data ?? []);
  }, [supabase]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel("notes-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notes",
          filter: `user_id=eq.${userId}`,
        },
        () => fetchNotes()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase, fetchNotes]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setLoading(true);
    setInput("");
    const { data: newNote, error } = await supabase
      .from("notes")
      .insert({
        user_id: user.id,
        content: text,
        is_pinned: false,
      })
      .select()
      .single();
    setLoading(false);
    if (error) {
      await fetchNotes();
      return;
    }
    if (newNote) {
      setNotes((prev) => {
        const next = [newNote as Note, ...prev];
        return next.sort((a, b) => {
          if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
      });
      setLastAddedNoteId(newNote.id);
      setTimeout(() => {
        setLastAddedNoteId(null);
        fetchNotes();
      }, 500);
      return;
    }
    await fetchNotes();
  }

  async function togglePin(note: Note) {
    await supabase
      .from("notes")
      .update({ is_pinned: !note.is_pinned })
      .eq("id", note.id)
      .eq("user_id", note.user_id);
    await fetchNotes();
  }

  async function deleteNote(id: string) {
    if (!userId) return;
    await supabase.from("notes").delete().eq("id", id).eq("user_id", userId);
    await fetchNotes();
  }

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Was geht dir durch den Kopf?"
          className="flex-1 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-rose/50 focus:ring-1 focus:ring-rose/30 transition-colors"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-3 rounded-2xl bg-rose/20 border border-rose/30 text-rose hover:bg-rose/30 hover:border-rose/50 hover:shadow-rose-glow transition-all duration-300 disabled:opacity-50 disabled:hover:shadow-none"
          aria-label="Notiz speichern"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>

      <ul className="space-y-4">
        {sortedNotes.length === 0 && (
          <li className="text-gray-500 text-sm py-4 text-center">
            Noch keine Gedanken deponiert. Schreib etwas rein.
          </li>
        )}
        {sortedNotes.map((note) => (
          <li
            key={note.id}
            className={`glass-card glass-card-hover group flex items-start gap-3 p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-rose/50 hover:shadow-rose-glow ${lastAddedNoteId === note.id ? "note-slide-in" : ""}`}
          >
            <p className="flex-1 text-gray-200 text-sm whitespace-pre-wrap break-words min-w-0">
              {note.content}
            </p>
            <div className="flex items-center gap-1 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => togglePin(note)}
                className="p-2 rounded-xl text-gray-400 hover:text-rose hover:bg-rose/10 transition-colors"
                aria-label={note.is_pinned ? "Loslösen" : "Pinnen"}
                title={note.is_pinned ? "Loslösen" : "Pinnen"}
              >
                <Star
                  className={`w-4 h-4 ${note.is_pinned ? "fill-rose text-rose" : ""}`}
                />
              </button>
              <button
                type="button"
                onClick={() => deleteNote(note.id)}
                className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                aria-label="Löschen"
                title="Löschen"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
