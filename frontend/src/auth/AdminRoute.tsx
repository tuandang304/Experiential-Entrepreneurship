import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Loader } from "../components/ui";

/**
 * Chặn cụm route Quản trị hệ thống: chỉ user có role ADMIN mới vào được.
 * Dùng *bên trong* AppLayout (đã qua ProtectedRoute) nên chắc chắn đã đăng nhập;
 * ở đây chỉ kiểm tra thêm vai trò. User thường bị đẩy về /dashboard.
 */
export default function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen />;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
