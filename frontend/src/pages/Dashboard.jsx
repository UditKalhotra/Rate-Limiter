import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
import * as api from "../api/endpoints";
import StatCard from "../components/StatCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const { name, logout } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .getDashboard()
      .then(({ data }) => {
        if (active) setData(data);
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const overview = data?.overview || {
    totalRequests: 0,
    allowedRequests: 0,
    blockedRequests: 0
  };
  const traffic = (data?.traffic || []).map((t) => ({
    hour: `${t.hour}:00`,
    requests: t.requests
  }));
  const topAPIs = data?.topAPIs || [];
  const abusiveKeys = data?.abusiveKeys || [];

  return (
    <div>
      <div className="page-header page-header-row">
        <div>
          <h1>Dashboard</h1>
          <p>
            {name ? `Welcome back, ${name}` : "Welcome back"} — live traffic
            across every rate-limited endpoint
          </p>
        </div>
        <button className="btn btn-secondary" onClick={logout}>
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Log out
        </button>
      </div>

      {error && <div className="banner banner-error section-gap">{error}</div>}

      <div className="grid grid-stats section-gap">
        <StatCard
          label="Total requests"
          value={loading ? "—" : overview.totalRequests.toLocaleString()}
          dot="dot-accent"
        />
        <StatCard
          label="Allowed"
          value={loading ? "—" : overview.allowedRequests.toLocaleString()}
          dot="dot-success"
        />
        <StatCard
          label="Blocked"
          value={loading ? "—" : overview.blockedRequests.toLocaleString()}
          dot="dot-danger"
        />
      </div>

      <div className="card section-gap">
        <div className="table-toolbar">
          <h3>Requests by hour</h3>
        </div>
        <div style={{ padding: "20px 22px" }}>
          {!loading && traffic.length === 0 ? (
            <EmptyState
              title="No traffic yet"
              description="Once requests start hitting your protected endpoints, hourly volume will appear here."
            />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={traffic}>
                <defs>
                  <linearGradient id="trafficFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3654a6" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#3654a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3e6ea" vertical={false} />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 11, fill: "#98a2b3" }}
                  axisLine={{ stroke: "#e3e6ea" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#98a2b3" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 12.5,
                    borderRadius: 8,
                    border: "1px solid #e3e6ea"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="#3654a6"
                  strokeWidth={2}
                  fill="url(#trafficFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="card">
          <div className="table-toolbar">
            <h3>Top endpoints</h3>
          </div>
          {!loading && topAPIs.length === 0 ? (
            <EmptyState
              title="No endpoint activity"
              description="Endpoints will rank here once they start receiving traffic."
            />
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Endpoint</th>
                  <th>Method</th>
                  <th>Requests</th>
                </tr>
              </thead>
              <tbody>
                {topAPIs.map((row, i) => (
                  <tr key={i}>
                    <td className="mono">{row.endpoint}</td>
                    <td>
                      <span className="badge badge-neutral">{row.method}</span>
                    </td>
                    <td>{row.requests}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <div className="table-toolbar">
            <h3>Most blocked keys</h3>
          </div>
          {!loading && abusiveKeys.length === 0 ? (
            <EmptyState
              title="No blocked traffic"
              description="Keys that repeatedly hit their limit will show up here."
            />
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>API key ID</th>
                  <th>Blocked %</th>
                </tr>
              </thead>
              <tbody>
                {abusiveKeys.map((row, i) => (
                  <tr key={i}>
                    <td className="mono">{String(row.apiKey || "").slice(-10)}</td>
                    <td>
                      <span className="badge badge-danger">
                        {Math.round(row.blockedPercentage || 0)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
