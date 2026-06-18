import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function LandingPage() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    // Ở lại landing; view sẽ tự chuyển sang trạng thái chưa đăng nhập.
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-xl font-bold text-blue-700">AIMA</span>
        <div className="flex items-center gap-2">
          {loading ? null : user ? (
            <>
              <button
                onClick={() => navigate("/profile")}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Vào trang cá nhân
              </button>
              <button
                onClick={handleLogout}
                className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Đăng nhập
              </button>
              <button
                onClick={() => navigate("/register")}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Đăng ký
              </button>
            </>
          )}
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <h1 className="max-w-2xl text-4xl font-bold text-gray-900 sm:text-5xl">
          Trợ lý marketing AI cho mọi nền tảng
        </h1>
        <p className="mt-4 max-w-xl text-lg text-gray-600">
          AIMA tự động nghiên cứu xu hướng, tạo nội dung, lên lịch và đăng bài đa nền
          tảng — bạn chỉ cần cấu hình thương hiệu một lần.
        </p>
        <div className="mt-8 flex gap-3">
          {loading ? null : user ? (
            <button
              onClick={() => navigate("/profile")}
              className="rounded bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
            >
              Tiếp tục
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="rounded bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
              >
                Bắt đầu — Đăng nhập
              </button>
              <button
                onClick={() => navigate("/register")}
                className="rounded border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-100"
              >
                Tạo tài khoản
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
