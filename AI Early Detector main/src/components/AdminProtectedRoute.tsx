import { Navigate } from "react-router-dom";

const AdminProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const adminAuth = sessionStorage.getItem("admin_auth");
  if (!adminAuth) return <Navigate to="/admin-login" replace />;
  return children;
};

export default AdminProtectedRoute;
