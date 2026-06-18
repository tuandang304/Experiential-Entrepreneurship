import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { updateProfile } from "../api/auth";
import { useAuth } from "../auth/AuthContext";

export default function CompleteProfilePage() {
  const { user, loading, setUser } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }
  // Phải đăng nhập mới vào được; đã hoàn tất hồ sơ thì không cần trang này.
  if (!user) return <Navigate to="/login" replace />;
  if (user.profileCompleted) return <Navigate to="/profile" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const updated = await updateProfile({ fullName, phone, dateOfBirth });
      setUser(updated);
      navigate("/profile", { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Hoàn tất hồ sơ</h1>
        <p className="text-sm text-gray-600 mb-6">
          Vui lòng bổ sung thông tin cá nhân để tiếp tục sử dụng AIMA.
        </p>
        {error && (
          <p className="mb-4 rounded bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Họ và tên
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại
            </label>
            <input
              id="phone"
              type="tel"
              required
              pattern="[0-9]{10,11}"
              placeholder="0901234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
              Ngày sinh
            </label>
            <input
              id="dateOfBirth"
              type="date"
              required
              max={new Date().toISOString().split("T")[0]}
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded bg-blue-600 text-white py-2 font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Đang lưu..." : "Lưu và tiếp tục"}
          </button>
        </form>
      </div>
    </div>
  );
}
