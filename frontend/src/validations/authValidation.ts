// Validation dùng chung cho các form xác thực (đăng nhập/đăng ký/quên mật khẩu/đổi
// mật khẩu). Gom các rule trước đây bị lặp inline ở nhiều page về một nguồn duy nhất.

// Email hợp lệ: có phần local, @, domain và TLD (không chứa khoảng trắng).
export const validEmail = (v: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// OTP gồm đúng 6 chữ số (khớp với mã backend gửi qua email).
export const otpValid = (v: string): boolean => /^\d{6}$/.test(v);

// Mật khẩu và xác nhận khớp nhau.
export const passwordsMatch = (password: string, confirm: string): boolean =>
  password === confirm;
