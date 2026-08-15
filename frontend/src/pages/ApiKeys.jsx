import { useEffect, useState } from "react";
import * as api from "../api/endpoints";
import EmptyState from "../components/EmptyState.jsx";
import Modal from "../components/Modal.jsx";

function formatDate(value) {
  if (!value) return "Never";
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

export default function ApiKeys() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [revealedKey, setRevealedKey] = useState(null);
  const [copied, setCopied] = useState(false);

  const [busyId, setBusyId] = useState(null);

  // Existing keys revealed via the "Show key" button, keyed by _id.
  const [shownKeys, setShownKeys] = useState({});
  const [revealError, setRevealError] = useState("");

  const load = () => {
    setLoading(true);
    api
      .getApiKeys()
      .then(({ data }) => setKeys(data.apiKeys || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const createKey = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const { data } = await api.createApiKey(newName.trim());
      setRevealedKey(data.apiKey);
      setShowCreate(false);
      setNewName("");
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const revoke = async (id) => {
    setBusyId(id);
    try {
      await api.revokeApiKey(id);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this API key? This can't be undone.")) return;
    setBusyId(id);
    try {
      await api.deleteApiKey(id);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const copyKey = async () => {
    try {
      await navigator.clipboard.writeText(revealedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard not available, ignore */
    }
  };

  const toggleShowKey = async (id) => {
    setRevealError("");

    // Already fetched — just toggle visibility off, no need to re-fetch.
    if (shownKeys[id]?.value) {
      setShownKeys((prev) => ({
        ...prev,
        [id]: { ...prev[id], visible: !prev[id].visible }
      }));
      return;
    }

    setShownKeys((prev) => ({ ...prev, [id]: { loading: true, visible: true } }));
    try {
      const { data } = await api.revealApiKey(id);
      setShownKeys((prev) => ({
        ...prev,
        [id]: { value: data.apiKey, visible: true, loading: false }
      }));
    } catch (err) {
      setRevealError(err.message);
      setShownKeys((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const copyShownKey = async (id) => {
    const value = shownKeys[id]?.value;
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setShownKeys((prev) => ({ ...prev, [id]: { ...prev[id], justCopied: true } }));
      setTimeout(
        () =>
          setShownKeys((prev) =>
            prev[id] ? { ...prev, [id]: { ...prev[id], justCopied: false } } : prev
          ),
        1500
      );
    } catch {
      /* clipboard not available, ignore */
    }
  };

  return (
    <div>
      <div className="page-header page-header-row">
        <div>
          <h1>API keys</h1>
          <p>Issue keys to authenticate requests against your rate limiter</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + New API key
        </button>
      </div>

      {error && <div className="banner banner-error section-gap">{error}</div>}
      {revealError && <div className="banner banner-error section-gap">{revealError}</div>}

      <div className="card">
        {!loading && keys.length === 0 ? (
          <EmptyState
            title="No API keys yet"
            description="Create a key to start authenticating requests, then attach rate limit rules to it."
            action={
              <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
                + New API key
              </button>
            }
          />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Key</th>
                <th>Status</th>
                <th>Requests</th>
                <th>Last used</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => {
                const shown = shownKeys[k._id];
                return (
                <tr key={k._id}>
                  <td style={{ fontWeight: 600 }}>{k.name}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <code className="mono text-muted">
                        {shown?.loading
                          ? "Loading…"
                          : shown?.visible && shown?.value
                          ? shown.value
                          : "••••••••••••••••"}
                      </code>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        disabled={shown?.loading}
                        onClick={() => toggleShowKey(k._id)}
                      >
                        {shown?.visible && shown?.value ? "Hide" : "Show"}
                      </button>
                      {shown?.visible && shown?.value && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => copyShownKey(k._id)}
                        >
                          {shown?.justCopied ? "Copied" : "Copy"}
                        </button>
                      )}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        k.status === "revoked" ? "badge-danger" : "badge-success"
                      }`}
                    >
                      {k.status}
                    </span>
                  </td>
                  <td>{k.requestCount ?? 0}</td>
                  <td className="text-muted">{formatDate(k.lastUsed)}</td>
                  <td className="text-muted">{formatDate(k.createdAt)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      {k.status !== "revoked" && (
                        <button
                          className="btn btn-secondary btn-sm"
                          disabled={busyId === k._id}
                          onClick={() => revoke(k._id)}
                        >
                          Revoke
                        </button>
                      )}
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={busyId === k._id}
                        onClick={() => remove(k._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && (
        <Modal title="New API key" onClose={() => setShowCreate(false)}>
          <form onSubmit={createKey}>
            <div className="field">
              <label htmlFor="key-name">Name</label>
              <input
                id="key-name"
                className="input"
                placeholder="e.g. Production backend"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
                required
              />
              <span className="hint">Something you'll recognize later — this doesn't affect the key itself.</span>
            </div>
            <button className="btn btn-primary btn-block" disabled={creating}>
              {creating && <span className="spinner" />}
              {creating ? "Creating" : "Create key"}
            </button>
          </form>
        </Modal>
      )}

      {revealedKey && (
        <Modal title="Save your API key" onClose={() => setRevealedKey(null)}>
          <div className="banner banner-neutral">
            Copy this now. You can view it again anytime from the "Show" button next to the key.
          </div>
          <div className="key-reveal">
            <code>{revealedKey}</code>
            <button className="btn btn-secondary btn-sm" onClick={copyKey}>
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <button
            className="btn btn-primary btn-block"
            style={{ marginTop: 16 }}
            onClick={() => setRevealedKey(null)}
          >
            Done
          </button>
        </Modal>
      )}
    </div>
  );
}
