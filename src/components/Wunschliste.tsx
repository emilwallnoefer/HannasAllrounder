"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import type { WishlistItem, WishlistStatus } from "@/types/wishlist";
import { WISHLIST_STATUSES } from "@/types/wishlist";
import { Plus, X, ExternalLink } from "lucide-react";

export function Wunschliste() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchItems = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("wishlist")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3);
    if (!error) setItems((data as WishlistItem[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          {loading ? "Lade…" : items.length === 0 ? "Noch keine Wünsche." : "Letzte 3 Wünsche"}
        </p>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="shrink-0 p-2.5 rounded-2xl bg-rose/20 border border-rose/30 text-rose hover:bg-rose/30 hover:border-rose/50 hover:shadow-rose-glow transition-all duration-300 flex items-center justify-center"
          aria-label="Neuen Wunsch hinzufügen"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="glass-card glass-card-hover flex items-center justify-between gap-3 p-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-rose/50 hover:shadow-rose-glow"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-white truncate">{item.name}</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                {item.price != null && !Number.isNaN(Number(item.price)) && (
                  <span className="text-sm text-rose">{Number(item.price).toFixed(2)} €</span>
                )}
                <span className="text-xs text-gray-500 px-2 py-0.5 rounded-lg bg-white/5 border border-white/10">
                  {item.status}
                </span>
              </div>
            </div>
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 p-2 rounded-xl text-gray-400 hover:text-rose hover:bg-rose/10 transition-colors"
                aria-label="Link öffnen"
                title="In neuem Tab öffnen"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </li>
        ))}
      </ul>

      {modalOpen &&
        createPortal(
          <WunschlisteModal
            onClose={() => setModalOpen(false)}
            onSaved={() => {
              setModalOpen(false);
              fetchItems();
            }}
            supabase={supabase}
          />,
          document.body
        )}
    </div>
  );
}

type ModalProps = {
  onClose: () => void;
  onSaved: () => void;
  supabase: ReturnType<typeof createClient>;
};

function WunschlisteModal({ onClose, onSaved, supabase }: ModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<WishlistStatus>("Idee");
  const [link, setLink] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Name ist Pflicht.");
      return;
    }
    setError(null);
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSubmitting(false);
      return;
    }
    const { error: insertError } = await supabase.from("wishlist").insert({
      user_id: user.id,
      name: trimmedName,
      description: description.trim() || null,
      price: price === "" ? null : parseFloat(price.replace(",", ".")),
      link: link.trim() || null,
      status,
      image_url: imageUrl.trim() || null,
    });
    setSubmitting(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    onSaved();
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="glass-card w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0f0f0f]/95 backdrop-blur-xl p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 id="modal-title" className="text-lg font-semibold text-white">
            Neuer Wunsch
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-2">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="wish-name" className="block text-sm font-medium text-gray-400 mb-1.5">
              Name <span className="text-rose">*</span>
            </label>
            <input
              id="wish-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="z. B. neues Headset"
              className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-rose/50 focus:ring-1 focus:ring-rose/30 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="wish-price" className="block text-sm font-medium text-gray-400 mb-1.5">
              Preis (€)
            </label>
            <input
              id="wish-price"
              type="text"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-rose/50 focus:ring-1 focus:ring-rose/30 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="wish-status" className="block text-sm font-medium text-gray-400 mb-1.5">
              Status
            </label>
            <select
              id="wish-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as WishlistStatus)}
              className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-rose/50 focus:ring-1 focus:ring-rose/30 transition-colors"
            >
              {WISHLIST_STATUSES.map((s) => (
                <option key={s} value={s} className="bg-[#1a1a1a] text-white">
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="wish-link" className="block text-sm font-medium text-gray-400 mb-1.5">
              Link
            </label>
            <input
              id="wish-link"
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://…"
              className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-rose/50 focus:ring-1 focus:ring-rose/30 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="wish-description" className="block text-sm font-medium text-gray-400 mb-1.5">
              Weitere Infos
            </label>
            <textarea
              id="wish-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Notizen, Größe, Modell…"
              className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-rose/50 focus:ring-1 focus:ring-rose/30 transition-colors resize-none"
            />
          </div>

          <div>
            <label htmlFor="wish-image" className="block text-sm font-medium text-gray-400 mb-1.5">
              Bild-URL <span className="text-gray-600">(optional)</span>
            </label>
            <input
              id="wish-image"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://…"
              className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-rose/50 focus:ring-1 focus:ring-rose/30 transition-colors"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-white/20 text-gray-400 hover:bg-white/5 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 rounded-2xl bg-rose/20 border border-rose/30 text-rose font-medium hover:bg-rose/30 hover:border-rose/50 hover:shadow-rose-glow transition-all duration-300 disabled:opacity-50"
            >
              {submitting ? "Speichern…" : "Speichern"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
