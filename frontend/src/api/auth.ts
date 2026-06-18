import client, { ApiResponse } from "./client";

export interface User {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  fullName: string;
  phone: string | null;
  dateOfBirth: string | null; // ISO date, e.g. "1998-05-20"
  provider: string | null; // "LOCAL" | "GOOGLE"
  avatarUrl: string | null;
  profileCompleted: boolean;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  phone: string;
  dateOfBirth: string;
}

export interface ResetPasswordRequest {
  email: string;
  otpCode: string;
  newPassword: string;
  confirmPassword: string;
}

// Đăng nhập Google: điều hướng toàn trang tới endpoint OAuth2 của backend.
// Backend xử lý redirect Google rồi set cookie và quay về app.
export const GOOGLE_LOGIN_URL = "/oauth2/authorization/google";

export async function register(request: RegisterRequest): Promise<void> {
  await client.post<ApiResponse<unknown>>("/users/register", request);
}

// Backend chỉ set cookie HttpOnly và không trả user trong body, nên sau khi
// đăng nhập ta gọi /users/me để lấy hồ sơ.
export async function login(email: string, password: string): Promise<User> {
  await client.post<ApiResponse<unknown>>("/auth/login", { email, password });
  return getProfile();
}

export async function logout(): Promise<void> {
  await client.post("/auth/logout");
}

export async function getProfile(): Promise<User> {
  const { data } = await client.get<ApiResponse<User>>("/users/me");
  return data.result;
}

export async function updateProfile(request: UpdateProfileRequest): Promise<User> {
  const { data } = await client.put<ApiResponse<User>>("/users/me", request);
  return data.result;
}

// ----- Quên mật khẩu (3 bước) -----

export async function forgotPassword(email: string): Promise<void> {
  await client.post<ApiResponse<unknown>>("/users/forgot-password", { email });
}

export async function verifyOtp(email: string, otpCode: string): Promise<void> {
  await client.post<ApiResponse<unknown>>("/users/verify-otp", { email, otpCode });
}

export async function resetPassword(request: ResetPasswordRequest): Promise<void> {
  await client.post<ApiResponse<unknown>>("/users/reset-password", request);
}
