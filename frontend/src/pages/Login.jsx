import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-mark">RG</div>
          <span className="auth-brand-name">RateGate</span>
        </div>

        <div className="card card-pad">
          <div className="auth-heading">
            <h1>Log in</h1>
            <p>Access your rate limiting dashboard</p>
          </div>

          {error && <div className="banner banner-error">{error}</div>}

          <form onSubmit={submit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="you@company.com"
                value={form.email}
                onChange={update("email")}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={update("password")}
                required
              />
            </div>
            <button className="btn btn-primary btn-block" disabled={loading}>
              {loading && <span className="spinner" />}
              {loading ? "Logging in" : "Log in"}
            </button>
          </form>
        </div>

        <div className="auth-switch">
          Don't have an account? <Link to="/signup">Create one</Link>
        </div>
      </div>
    </div>
  );
}
