import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import * as api from "../api/endpoints";

const AuthContext = createContext(null);

const DIRECTORY_KEY = "rategate_user_directory"; // { [email]: name }

function decodePayload(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function decodeRole(token) {
  return decodePayload(token)?.role || "USER";
}

// JWT `exp` is seconds-since-epoch. Returns ms remaining, or 0 if the
// token is missing/malformed/already expired.
function msUntilExpiry(token) {
  const payload = decodePayload(token);
  if (!payload?.exp) return 0;
  return Math.max(0, payload.exp * 1000 - Date.now());
}

function readDirectory() {
  try {
    return JSON.parse(localStorage.getItem(DIRECTORY_KEY)) || {};
  } catch {
    return {};
  }
}

function rememberName(email, name) {
  const directory = readDirectory();
  directory[email.toLowerCase()] = name;
  localStorage.setItem(DIRECTORY_KEY, JSON.stringify(directory));
}

function lookupName(email) {
  const directory = readDirectory();
  return directory[email.toLowerCase()] || null;
}

function fallbackName(email) {
  // Best effort for accounts created before we started remembering names.
  const local = email.split("@")[0];
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem("rategate_token");
    // Wipe an already-expired token on load instead of treating the user
    // as logged in and letting the first API call fail.
    if (stored && msUntilExpiry(stored) <= 0) {
      localStorage.removeItem("rategate_token");
      localStorage.removeItem("rategate_name");
      return null;
    }
    return stored;
  });
  const [name, setName] = useState(() =>
    localStorage.getItem("rategate_name")
  );

  const role = token ? decodeRole(token) : null;
  const logoutTimer = useRef(null);

  const doLogout = useCallback(() => {
    if (logoutTimer.current) {
      clearTimeout(logoutTimer.current);
      logoutTimer.current = null;
    }
    localStorage.removeItem("rategate_token");
    localStorage.removeItem("rategate_name");
    setToken(null);
    setName(null);
  }, []);

  // Log the user out the instant the JWT hits its 2-hour expiry, even if
  // they're just sitting idle on a page and never trigger a failed API
  // call. Re-armed any time the token changes (login, refresh, etc).
  useEffect(() => {
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
    if (!token) return;

    const remaining = msUntilExpiry(token);
    if (remaining <= 0) {
      doLogout();
      return;
    }

    logoutTimer.current = setTimeout(() => {
      doLogout();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login?expired=1";
      }
    }, remaining);

    return () => clearTimeout(logoutTimer.current);
  }, [token, doLogout]);

  const doLogin = useCallback(async (email, password) => {
    const { data } = await api.login({ email, password });
    localStorage.setItem("rategate_token", data.token);
    setToken(data.token);

    const resolvedName = lookupName(email) || fallbackName(email);
    localStorage.setItem("rategate_name", resolvedName);
    setName(resolvedName);

    return data;
  }, []);

  const doSignup = useCallback(async (payload) => {
    const { data } = await api.signup(payload);
    // The backend hands back the exact name that was submitted — remember
    // it so login (which only returns a token) can show it later.
    const returnedName = data.user?.name || payload.name;
    if (returnedName) rememberName(payload.email, returnedName);
    return data;
  }, []);

  const value = {
    token,
    name,
    role,
    isAuthenticated: Boolean(token),
    login: doLogin,
    signup: doSignup,
    logout: doLogout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
