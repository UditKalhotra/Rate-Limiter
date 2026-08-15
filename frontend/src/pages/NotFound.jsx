import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="auth-shell">
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: 40, marginBottom: 8 }}>404</h1>
        <p className="text-muted" style={{ marginBottom: 20 }}>
          This page doesn't exist.
        </p>
        <Link to="/" className="btn btn-primary">
          Back home
        </Link>
      </div>
    </div>
  );
}
