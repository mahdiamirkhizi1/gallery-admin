import { Navigate, Outlet } from "react-router-dom";
import { getAdminUser, type AdminRole } from "./auth";

export function ProtectedRoute({ roles }: { roles: AdminRole[] }) {
  const token = localStorage.getItem("goldino_admin_token");
  const user = getAdminUser();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/login" replace />;
  return <Outlet />;
}
