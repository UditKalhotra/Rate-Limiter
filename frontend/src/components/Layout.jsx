import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const icons = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  key: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="7.5" cy="15.5" r="4.5" />
      <path d="M11 12l8-8M16 5l3 3M13 8l2.5 2.5" strokeLinecap="round" />
    </svg>
  ),
  rules: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16M4 12h10M4 18h13" strokeLinecap="round" />
    </svg>
  ),
  console: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 9l3 3-3 3M13 15h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
};

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: icons.dashboard, end: true },
  { to: "/api-keys", label: "API Keys", icon: icons.key },
  { to: "/rules", label: "Rules", icon: icons.rules },
  { to: "/test-console", label: "Test Console", icon: icons.console }
];

export default function Layout() {
  const { name, role, logout } = useAuth();

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">RG</div>
          <span className="sidebar-brand-name">RateGate</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                "sidebar-link" + (isActive ? " active" : "")
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div>
              <div className="sidebar-user-name">{name || "Account"}</div>
              <div className="sidebar-user-role">{role || "USER"}</div>
            </div>
            <button
              className="sidebar-logout"
              onClick={logout}
              title="Log out"
              aria-label="Log out"
            >
              {icons.logout}
            </button>
          </div>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
