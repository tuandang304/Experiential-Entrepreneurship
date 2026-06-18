import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword, resetPassword, verifyOtp } from "../api/auth";

type Step = "email" | "otp" | "reset";

// Khớp otp.ttl-seconds mặc định ở backend (90s).
const OTP_TTL = 90;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Đếm ngược hiệu lực OTP.
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  const sendOtp = async () => {
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      await forgotPassword(email);
      setStep("otp");
      setSecondsLeft(OTP_TTL);
      setMessage("Mã OTP đã được gửi tới email của bạn.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmail = (e: FormEvent) => {
    e.preventDefault();
    sendOtp();
  };

  const handleOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      await verifyOtp(email, otpCode);
      setStep("reset");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword({ email, otpCode, newPassword, confirmPassword });
      navigate("/login", {
        replace: true,
        state: { notice: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập." },
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Quên mật khẩu</h1>
        {message && (
          <p className="mb-4 rounded bg-green-50 border border-green-200 text-green-700 px-3 py-2 text-sm">
            {message}
          </p>
        )}
        {error && (
          <p className="mb-4 rounded bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
            {error}
          </p>
        )}

        {step === "email" && (
          <form onSubmit={handleEmail} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded bg-blue-600 text-white py-2 font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Đang gửi..." : "Gửi mã OTP"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleOtp} className="space-y-4">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                Mã OTP (6 chữ số)
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                required
                maxLength={6}
                pattern="[0-9]{6}"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-gray-500">
                {secondsLeft > 0
                  ? `Mã hết hạn sau ${secondsLeft}s`
                  : "Mã đã hết hạn, vui lòng gửi lại."}
              </p>
            </div>
            <button
              type="submit"
              disabled={submitting || secondsLeft <= 0}
              className="w-full rounded bg-blue-600 text-white py-2 font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Đang xác thực..." : "Xác thực OTP"}
            </button>
            <button
              type="button"
              onClick={sendOtp}
              disabled={submitting || secondsLeft > 0}
              className="w-full rounded border border-gray-300 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              Gửi lại mã
            </button>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu mới
              </label>
              <input
                id="newPassword"
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Xác nhận mật khẩu
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded bg-blue-600 text-white py-2 font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
            </button>
          </form>
        )}

        <p className="mt-4 text-sm text-gray-600">
          <Link to="/login" className="text-blue-600 hover:underline">
            Quay lại đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
