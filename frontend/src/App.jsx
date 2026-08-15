import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ApiKeys from "./pages/ApiKeys.jsx";
import Rules from "./pages/Rules.jsx";
import TestConsole from "./pages/TestConsole.jsx";
import NotFound from "./pages/NotFound.jsx";

function Protected({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Home />}
      />

      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup />}
      />

      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="api-keys" element={<ApiKeys />} />
        <Route path="rules" element={<Rules />} />
        <Route path="test-console" element={<TestConsole />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
