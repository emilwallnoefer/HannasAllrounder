import { DashboardTiles } from "@/components/DashboardTiles";
import { GedankenDeponie } from "@/components/GedankenDeponie";
import { HaushaltsTracker } from "@/components/HaushaltsTracker";
import { Wunschliste } from "@/components/Wunschliste";
import { SchuleKachel } from "@/components/SchuleKachel";
import { KalenderVorschau } from "@/components/KalenderVorschau";
import { WasserTracker } from "@/components/WasserTracker";

export default function DashboardPage() {
  return (
    <div className="space-y-6 sm:space-y-10">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">Dashboard</h2>
        <p className="text-gray-500 mb-4 sm:mb-8 text-sm sm:text-base">
          Willkommen. Hier siehst du später deine Übersicht.
        </p>
        <DashboardTiles />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <section className="glass-card glass-card-hover p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-rose/50 hover:shadow-rose-glow">
          <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
            <span className="text-rose">Kalender</span>
          </h3>
          <p className="text-sm text-gray-500 mb-4">Monatsübersicht. Klick öffnet die Wochenansicht.</p>
          <KalenderVorschau />
        </section>
        <section className="glass-card glass-card-hover p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-rose/50 hover:shadow-rose-glow">
          <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
            <span className="text-rose">Wasser</span>
          </h3>
          <p className="text-sm text-gray-500 mb-4">Tagesziel 2000 ml. +250 ml / Rückgängig.</p>
          <WasserTracker />
        </section>
      </div>

      <section className="glass-card glass-card-hover p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-rose/50 hover:shadow-rose-glow">
        <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
          <span className="text-rose">Schule</span>
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Jahresprogramm: Gesamtfortschritt über alle Fächer. Klick öffnet die Fächerliste.
        </p>
        <SchuleKachel />
      </section>

      <section className="glass-card glass-card-hover p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-rose/50 hover:shadow-rose-glow">
        <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
          <span className="text-rose">Haushalts-Tracker</span>
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Countdown bis zur nächsten Aufgabe. „Erledigt“ setzt den Timer zurück.
        </p>
        <HaushaltsTracker />
      </section>

      <section className="glass-card glass-card-hover p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-rose/50 hover:shadow-rose-glow">
        <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
          <span className="text-rose">Wunschliste</span>
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Wünsche und Bedarf sammeln. Mit dem +-Button neue Einträge anlegen.
        </p>
        <Wunschliste />
      </section>

      <section className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
          <span className="text-rose">Gedanken-Deponie</span>
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Schnell Gedanken notieren, pinnen oder löschen.
        </p>
        <GedankenDeponie />
      </section>
    </div>
  );
}
