import Icon, { type IconName } from "./Icon";

export type StatItem = {
  label: string;
  value: string | number;
  note?: string;
  icon?: IconName;
};

export default function StatsCard({
  stats,
  className = "",
}: {
  stats: StatItem[];
  className?: string;
}) {
  const gridColsClass = stats.length === 3 ? "grid-3" : stats.length === 4 ? "grid-4" : "";

  return (
    <section className={`stat-cards-grid ${gridColsClass} ${className}`.trim()} aria-label="Overview statistics">
      {stats.map((s, idx) => (
        <article key={`${s.label}-${idx}`} className="stat-card">
          <div className="stat-card-head">
            <div className="stat-card-label-wrap">
              {s.icon && (
                <span className="stat-card-icon">
                  <Icon name={s.icon} size={18} strokeWidth={2} />
                </span>
              )}
              <span className="stat-card-label">{s.label}</span>
            </div>
          </div>
          <div className="stat-card-value">{s.value}</div>
          {s.note ? <div className="stat-card-note">{s.note}</div> : <div className="stat-card-note-empty" />}
        </article>
      ))}
    </section>
  );
}

