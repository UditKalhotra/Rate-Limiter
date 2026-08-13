import { useState } from "react";
import * as api from "../api/endpoints";

const BURST_OPTIONS = [5, 10, 15, 20, 25, 50];

export default function TestConsole() {
  const [apiKey, setApiKey] = useState("");
  const [method, setMethod] = useState("GET");
  const [log, setLog] = useState([]);
  const [sending, setSending] = useState(false);

  const [burstCount, setBurstCount] = useState(10);
  const [bursting, setBursting] = useState(false);
  const [burstSummary, setBurstSummary] = useState(null);

  const [resource, setResource] = useState("/api/test");
  const [checkMethod, setCheckMethod] = useState("GET");
  const [clientId, setClientId] = useState("");
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [checkError, setCheckError] = useState("");

  const pushLog = (entry) => setLog((prev) => [entry, ...prev].slice(0, 20));

  const fire = async () => {
    if (!apiKey) return;
    setSending(true);
    try {
      const res = await api.runTest(apiKey, method);
      pushLog({
        time: new Date().toLocaleTimeString(),
        method,
        status: res.status,
        ok: true,
        message: res.data?.message
      });
    } catch (err) {
      pushLog({
        time: new Date().toLocaleTimeString(),
        method,
        status: err.response?.status || "—",
        ok: false,
        message: err.message
      });
    } finally {
      setSending(false);
    }
  };

  const fireBurst = async () => {
    if (!apiKey) return;
    setBursting(true);
    setBurstSummary(null);

    const count = Number(burstCount);
    const results = await Promise.allSettled(
      Array.from({ length: count }, () => api.runTest(apiKey, method))
    );

    let allowed = 0;
    let blocked = 0;
    const entries = results.map((r, i) => {
      const time = new Date().toLocaleTimeString();
      if (r.status === "fulfilled") {
        allowed += 1;
        return {
          time,
          method: `${method} #${i + 1}`,
          status: r.value.status,
          ok: true,
          message: r.value.data?.message
        };
      }
      blocked += 1;
      return {
        time,
        method: `${method} #${i + 1}`,
        status: r.reason?.response?.status || "—",
        ok: false,
        message: r.reason?.message
      };
    });

    // Newest first, same order as single sends.
    setLog((prev) => [...entries.reverse(), ...prev].slice(0, 40));
    setBurstSummary({ count, allowed, blocked });
    setBursting(false);
  };

  const runCheck = async (e) => {
    e.preventDefault();
    if (!apiKey) return;
    setChecking(true);
    setCheckError("");
    setCheckResult(null);
    try {
      const res = await api.checkLimit(apiKey, {
        resource,
        method: checkMethod,
        clientId: clientId || undefined
      });
      setCheckResult(res.data);
    } catch (err) {
      setCheckError(err.message);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Test console</h1>
        <p>Fire requests at your live rate limiter and watch the results</p>
      </div>

      <div className="card card-pad section-gap">
        <div className="field">
          <label htmlFor="test-key">API key value</label>
          <input
            id="test-key"
            className="input mono"
            placeholder="Paste a raw API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <span className="hint">Sent as the x-api-key header on every request below.</span>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="card card-pad">
          <h3 style={{ marginBottom: 4 }}>Hit /api/test</h3>
          <p className="text-muted" style={{ fontSize: 13, marginBottom: 16 }}>
            Runs through the live rateLimiter middleware and returns 429 once you're over the
            configured limit.
          </p>

          <div className="field">
            <label htmlFor="test-method">Method</label>
            <select
              id="test-method"
              className="input"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
            </select>
          </div>

          <button className="btn btn-primary btn-block" onClick={fire} disabled={!apiKey || sending}>
            {sending && <span className="spinner" />}
            {sending ? "Sending" : "Send 1 request"}
          </button>

          <div
            style={{
              margin: "18px 0",
              paddingTop: 16,
              borderTop: "1px solid var(--color-border)"
            }}
          >
            <label htmlFor="burst-count" style={{ fontSize: 12.5, fontWeight: 600 }}>
              Send multiple at once
            </label>
            <p className="text-muted" style={{ fontSize: 12.5, margin: "4px 0 10px" }}>
              Fires that many requests together so you can actually see the limit kick in.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <select
                id="burst-count"
                className="input"
                style={{ maxWidth: 140 }}
                value={burstCount}
                onChange={(e) => setBurstCount(e.target.value)}
              >
                {BURST_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n} requests
                  </option>
                ))}
              </select>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={fireBurst}
                disabled={!apiKey || bursting}
              >
                {bursting && <span className="spinner spinner-dark" />}
                {bursting ? `Sending ${burstCount}` : `Send ${burstCount} requests`}
              </button>
            </div>

            {burstSummary && (
              <div
                className="flex-between"
                style={{
                  marginTop: 12,
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "var(--color-accent-soft)",
                  fontSize: 12.5
                }}
              >
                <span>Burst of {burstSummary.count} complete</span>
                <span style={{ display: "flex", gap: 6 }}>
                  <span className="badge badge-success">{burstSummary.allowed} allowed</span>
                  <span className="badge badge-danger">{burstSummary.blocked} blocked</span>
                </span>
              </div>
            )}
          </div>

          <div style={{ marginTop: 18 }}>
            {log.length === 0 ? (
              <p className="text-muted" style={{ fontSize: 13 }}>
                Requests you send will show up here.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {log.map((entry, i) => (
                  <div
                    key={i}
                    className="flex-between"
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      background: entry.ok ? "#e8f5ee" : "#fbeae8",
                      fontSize: 12.5
                    }}
                  >
                    <span className="mono">
                      {entry.time} · {entry.method}
                    </span>
                    <span
                      className={`badge ${entry.ok ? "badge-success" : "badge-danger"}`}
                      style={{ marginLeft: 8 }}
                    >
                      {entry.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card card-pad">
          <h3 style={{ marginBottom: 4 }}>Check /api/v1/check</h3>
          <p className="text-muted" style={{ fontSize: 13, marginBottom: 16 }}>
            The external-facing endpoint other services call to ask "would this request be
            allowed?" without it actually counting against app logic.
          </p>

          <form onSubmit={runCheck}>
            <div className="field">
              <label htmlFor="resource">Resource</label>
              <input
                id="resource"
                className="input mono"
                value={resource}
                onChange={(e) => setResource(e.target.value)}
              />
            </div>
            <div className="form-row">
              <div className="field">
                <label htmlFor="check-method">Method</label>
                <select
                  id="check-method"
                  className="input"
                  value={checkMethod}
                  onChange={(e) => setCheckMethod(e.target.value)}
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="client-id">Client ID (optional)</label>
                <input
                  id="client-id"
                  className="input"
                  placeholder="user_123"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                />
              </div>
            </div>

            <button className="btn btn-primary btn-block" disabled={!apiKey || checking}>
              {checking && <span className="spinner" />}
              {checking ? "Checking" : "Run check"}
            </button>
          </form>

          {checkError && <div className="banner banner-error" style={{ marginTop: 14 }}>{checkError}</div>}

          {checkResult && (
            <div style={{ marginTop: 14 }}>
              <div className="flex-between" style={{ marginBottom: 8 }}>
                <span className="text-muted" style={{ fontSize: 13 }}>
                  Result
                </span>
                <span
                  className={`badge ${checkResult.allowed ? "badge-success" : "badge-danger"}`}
                >
                  {checkResult.allowed ? "Allowed" : "Blocked"}
                </span>
              </div>
              <table className="table">
                <tbody>
                  <tr>
                    <td className="text-muted">Remaining</td>
                    <td className="mono">{checkResult.remaining}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Resets at</td>
                    <td className="mono">
                      {checkResult.reset ? new Date(checkResult.reset).toLocaleTimeString() : "—"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
