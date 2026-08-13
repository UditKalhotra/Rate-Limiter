import { createContext, useContext, useState, useCallback } from "react";
import * as api from "../api/endpoints";

const AuthContext = createContext(null);

const DIRECTORY_KEY = "rategate_user_directory"; // { [email]: name }

function decodeRole(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role || "USER";
  } catch {
    return "USER";
  }
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
  const [token, setToken] = useState(() =>
    localStorage.getItem("rategate_token")
  );
  const [name, setName] = useState(() =>
    localStorage.getItem("rategate_name")
  );

  const role = token ? decodeRole(token) : null;

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

  const doLogout = useCallback(() => {
    localStorage.removeItem("rategate_token");
    localStorage.removeItem("rategate_name");
    setToken(null);
    setName(null);
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
