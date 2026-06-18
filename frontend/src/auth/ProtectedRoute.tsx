import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

interface Props {
  children: ReactNode;
  // Khi true (mặc định): hồ sơ chưa hoàn tất sẽ bị đẩy sang /complete-profile.
  requireCompleteProfile?: boolean;
}

export default function ProtectedRoute({
  children,
  requireCompleteProfile = true,
}: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (requireCompleteProfile && !user.profileCompleted) {
    return <Navigate to="/complete-profile" replace />;
  }
  return <>{children}</>;
}
