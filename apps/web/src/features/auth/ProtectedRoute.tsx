import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "./AuthContext.js";

export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthContext();
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};
