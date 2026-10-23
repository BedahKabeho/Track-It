type Stat = { value: string; label: string; note: string };

export default function StatsCard({ stats }: { stats: Stat[] }) {
  return (
    <section className="stats" aria-label="Overview">
      {stats.map((s) => (
        <div key={s.label} className="stat">
          <span className="stat-value">{s.value}</span>
          <div className="stat-text">
            <strong>{s.label}</strong>
            <small>{s.note}</small>
          </div>
        </div>
      ))}
    </section>
  );
}
