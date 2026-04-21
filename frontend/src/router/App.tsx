import { Navigate, Route, Routes } from "react-router-dom";
import { getAuth } from "../auth/auth";
import LoginPage from "../pages/LoginPage";
import AdminPage from "../pages/AdminPage";
import HrPage from "../pages/HrPage";
import EmployeePage from "../pages/EmployeePage";
import HomePage from "../pages/HomePage";

function AuthedRedirect() {
  const auth = getAuth();
  if (!auth) return <HomePage />;
  if (auth.role === "ROLE_ADMIN") return <Navigate to="/admin" replace />;
  if (auth.role === "ROLE_HR") return <Navigate to="/hr" replace />;
  return <Navigate to="/employee" replace />;
}

function RequireRole(props: { role: string; children: JSX.Element }) {
  const auth = getAuth();
  if (!auth) return <Navigate to="/login" replace />;
  if (auth.role !== props.role) return <Navigate to="/" replace />;
  return props.children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthedRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <RequireRole role="ROLE_ADMIN">
            <AdminPage />
          </RequireRole>
        }
      />
      <Route
        path="/hr"
        element={
          <RequireRole role="ROLE_HR">
            <HrPage />
          </RequireRole>
        }
      />
      <Route
        path="/employee"
        element={
          <RequireRole role="ROLE_EMPLOYEE">
            <EmployeePage />
          </RequireRole>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
