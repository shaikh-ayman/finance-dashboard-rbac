import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children, requiredPermission }) {
  const { user, can } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (requiredPermission && !can(requiredPermission)) return <Navigate to="/dashboard" replace />;
  return children;
}
