"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Mail, Lock, Loader2 } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let signUpError: Error | null = null;
    try {
      const result = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      signUpError = result.error;
    } catch (err) {
      signUpError = err instanceof Error ? err : new Error("Netzwerkfehler");
    }

    setLoading(false);

    if (signUpError) {
      const msg = signUpError.message || String(signUpError);
      if (msg.toLowerCase().includes("fetch") || msg.toLowerCase().includes("network")) {
        setError(
          "Verbindung zu Supabase fehlgeschlagen. Bitte in .env.local die echten Werte für NEXT_PUBLIC_SUPABASE_URL und NEXT_PUBLIC_SUPABASE_ANON_KEY eintragen (Supabase Dashboard → Projekt → Settings → API)."
        );
      } else {
        setError(msg);
      }
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0a]">
        <div className="glass-card p-8 rounded-3xl max-w-md text-center">
          <h2 className="text-xl font-semibold text-white mb-2">
            E-Mail bestätigen
          </h2>
          <p className="text-gray-400 mb-6">
            Wir haben dir einen Bestätigungslink geschickt. Bitte prüfe dein
            Postfach.
          </p>
          <Link
            href="/login"
            className="inline-block py-2 px-4 rounded-2xl text-rose border border-rose/30 hover:bg-rose/10 transition-colors"
          >
            Zur Anmeldung
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0a]">
      <div className="w-full max-w-md">
        <div className="glass-card glass-card-hover p-8 rounded-3xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-2xl bg-rose/10 border border-rose/20">
              <UserPlus className="w-6 h-6 text-rose" />
            </div>
            <h1 className="text-2xl font-semibold text-white">
              Hannas Allrounder
            </h1>
          </div>

          <h2 className="text-lg font-medium text-gray-300 mb-6">
            Konto erstellen
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div
                className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                role="alert"
              >
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                E-Mail
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="name@beispiel.de"
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-rose/50 focus:ring-1 focus:ring-rose/30 transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Passwort (min. 6 Zeichen)
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-rose/50 focus:ring-1 focus:ring-rose/30 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-rose/20 border border-rose/30 text-rose font-medium hover:bg-rose/30 hover:border-rose/50 hover:shadow-rose-glow transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Registrieren"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Bereits registriert?{" "}
            <Link
              href="/login"
              className="text-rose hover:text-rose/80 transition-colors"
            >
              Anmelden
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
