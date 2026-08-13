import { useEffect, useMemo, useState } from "react";
import * as api from "../api/endpoints";
import EmptyState from "../components/EmptyState.jsx";
import Modal from "../components/Modal.jsx";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

const emptyForm = {
  endpoint: "",
  method: "GET",
  algorithm: "sliding_window",
  limit: 100,
  window: 60,
  capacity: 10,
  refillRate: 1
};

export default function Rules() {
  const [apiKeys, setApiKeys] = useState([]);
  const [selectedKeyId, setSelectedKeyId] = useState("");
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  // The backend authenticates rule writes with the raw x-api-key value,
  // which is only ever shown once at creation time (see the ApiKeys page).
  // Since we can't recover that value later, ask for it inline before a
  // create/update/delete so the request can carry the right header.
  const [pendingPlainKey, setPendingPlainKey] = useState("");

  const selectedKey = useMemo(
    () => apiKeys.find((k) => k._id === selectedKeyId),
    [apiKeys, selectedKeyId]
  );

  useEffect(() => {
    api
      .getApiKeys()
      .then(({ data }) => {
        const active = (data.apiKeys || []).filter((k) => k.status !== "revoked");
        setApiKeys(active);
        if (active.length) setSelectedKeyId(active[0]._id);
      })
      .catch((err) => setError(err.message));
  }, []);

  const loadRules = () => {
    setLoading(true);
    setError("");
    api
      .getRules(pendingPlainKey)
      .then(({ data }) => {
        const list = data.Rules || [];
        setRules(
          selectedKeyId
            ? list.filter((r) => r.apikey === selectedKeyId || r.apikey?._id === selectedKeyId)
            : list
        );
      })
      .catch((err) =>
        setError("Failed to load rules: " + err.message)
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (selectedKeyId && pendingPlainKey) loadRules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKeyId,pendingPlainKey]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (rule) => {
    setEditingId(rule._id);
    setForm({
      endpoint: rule.endpoint,
      method: rule.method,
      algorithm: rule.algorithm,
      limit: rule.limit ?? 100,
      window: rule.window ?? 60,
      capacity: rule.capacity ?? 10,
      refillRate: rule.refillRate ?? 1
    });
    setModalOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!selectedKey) return;
    setSaving(true);
    setError("");

    const payload = {
      endpoint: form.endpoint,
      method: form.method,
      algorithm: form.algorithm,
      ...(form.algorithm === "sliding_window"
        ? { limit: Number(form.limit), window: Number(form.window) }
        : { capacity: Number(form.capacity), refillRate: Number(form.refillRate) })
    };

    try {
      if (editingId) {
        await api.updateRule(pendingPlainKey, editingId, payload);
      } else {
        await api.createRule(pendingPlainKey, payload);
      }
      setModalOpen(false);
      loadRules();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this rule?")) return;
    try {
      await api.deleteRule(pendingPlainKey, id);
      loadRules();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-header page-header-row">
        <div>
          <h1>Rules</h1>
          <p>Attach a rate limit rule to an endpoint, per API key</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} disabled={!apiKeys.length}>
          + New rule
        </button>
      </div>

      <div className="card card-pad section-gap">
        <div className="field" style={{ marginBottom: 0, maxWidth: 320 }}>
          <label htmlFor="key-select">API key</label>
          {apiKeys.length ? (
            <select
              id="key-select"
              className="input"
              value={selectedKeyId}
              onChange={(e) => setSelectedKeyId(e.target.value)}
            >
              {apiKeys.map((k) => (
                <option key={k._id} value={k._id}>
                  {k.name}
                </option>
              ))}
            </select>
          ) : (
            <span className="hint">Create an API key first to attach rules to it.</span>
          )}
        </div>
      </div>

      <div className="card card-pad section-gap">
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="plain-key">API key value</label>
          <input
            id="plain-key"
            className="input mono"
            placeholder="Paste the raw key shown when you created it"
            value={pendingPlainKey}
            onChange={(e) => setPendingPlainKey(e.target.value)}
          />
          <span className="hint">
            Rule writes are authenticated with the actual key string (the x-api-key header), not
            its ID, so paste it here before creating, editing, or deleting a rule.
          </span>
        </div>
      </div>

      {error && <div className="banner banner-error section-gap">{error}</div>}

      <div className="card">
        {!loading && rules.length === 0 ? (
          <EmptyState
            title="No rules for this key"
            description="Add a rule to start limiting requests to a specific endpoint and method."
            action={
              apiKeys.length ? (
                <button className="btn btn-primary btn-sm" onClick={openCreate}>
                  + New rule
                </button>
              ) : null
            }
          />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Endpoint</th>
                <th>Method</th>
                <th>Algorithm</th>
                <th>Limits</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r._id}>
                  <td className="mono">{r.endpoint}</td>
                  <td>
                    <span className="badge badge-neutral">{r.method}</span>
                  </td>
                  <td className="text-muted">
                    {r.algorithm === "token_bucket" ? "Token bucket" : "Sliding window"}
                  </td>
                  <td className="text-muted">
                    {r.algorithm === "token_bucket"
                      ? `${r.capacity} cap · ${r.refillRate}/s refill`
                      : `${r.limit} req / ${r.window}s`}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(r)}>
                        Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => remove(r._id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <Modal title={editingId ? "Edit rule" : "New rule"} onClose={() => setModalOpen(false)}>
          <form onSubmit={submit}>
            <div className="field">
              <label htmlFor="endpoint">Endpoint</label>
              <input
                id="endpoint"
                className="input mono"
                placeholder="/api/test"
                value={form.endpoint}
                onChange={(e) => setForm({ ...form, endpoint: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <div className="field">
                <label htmlFor="method">Method</label>
                <select
                  id="method"
                  className="input"
                  value={form.method}
                  onChange={(e) => setForm({ ...form, method: e.target.value })}
                >
                  {METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="algorithm">Algorithm</label>
                <select
                  id="algorithm"
                  className="input"
                  value={form.algorithm}
                  onChange={(e) => setForm({ ...form, algorithm: e.target.value })}
                >
                  <option value="sliding_window">Sliding window</option>
                  <option value="token_bucket">Token bucket</option>
                </select>
              </div>
            </div>

            {form.algorithm === "sliding_window" ? (
              <div className="form-row">
                <div className="field">
                  <label htmlFor="limit">Request limit</label>
                  <input
                    id="limit"
                    type="number"
                    min="1"
                    className="input"
                    value={form.limit}
                    onChange={(e) => setForm({ ...form, limit: e.target.value })}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="window">Window (seconds)</label>
                  <input
                    id="window"
                    type="number"
                    min="1"
                    className="input"
                    value={form.window}
                    onChange={(e) => setForm({ ...form, window: e.target.value })}
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="form-row">
                <div className="field">
                  <label htmlFor="capacity">Bucket capacity</label>
                  <input
                    id="capacity"
                    type="number"
                    min="1"
                    className="input"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="refillRate">Refill rate (tokens/s)</label>
                  <input
                    id="refillRate"
                    type="number"
                    min="1"
                    className="input"
                    value={form.refillRate}
                    onChange={(e) => setForm({ ...form, refillRate: e.target.value })}
                    required
                  />
                </div>
              </div>
            )}

            <button className="btn btn-primary btn-block" disabled={saving}>
              {saving && <span className="spinner" />}
              {saving ? "Saving" : editingId ? "Save changes" : "Create rule"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
