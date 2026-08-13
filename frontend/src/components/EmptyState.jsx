export default function EmptyState({ title, description, action }) {
  return (
    <div className="empty">
      <h4>{title}</h4>
      <p>{description}</p>
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}
