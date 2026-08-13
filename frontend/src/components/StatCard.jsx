export default function StatCard({ label, value, dot }) {
  return (
    <div className="card stat-card">
      <div className="stat-label">
        {dot && <span className={`dot ${dot}`} />}
        {label}
      </div>
      <div className="stat-value">{value}</div>
    </div>
  );
}
