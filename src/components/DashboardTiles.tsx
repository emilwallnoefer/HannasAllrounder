export function DashboardTiles() {
  const tiles = [
    { title: "Übersicht 1", value: "—", desc: "Platzhalter" },
    { title: "Übersicht 2", value: "—", desc: "Platzhalter" },
    { title: "Übersicht 3", value: "—", desc: "Platzhalter" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {tiles.map((tile) => (
        <div
          key={tile.title}
          className="glass-card glass-card-hover p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-rose/50 hover:shadow-rose-glow"
        >
          <h3 className="text-sm font-medium text-gray-400 mb-1">
            {tile.title}
          </h3>
          <p className="text-2xl font-semibold text-white mb-1">{tile.value}</p>
          <p className="text-sm text-gray-500">{tile.desc}</p>
        </div>
      ))}
    </div>
  );
}
