import axios from "axios";

// Unified backend response format (API-01)
export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

// Auth dùng cookie HttpOnly do backend set (access_token / refresh_token).
// FE không đọc/ghi token — chỉ cần gửi kèm cookie trong mọi request.
const client = axios.create({ baseURL: "/api", withCredentials: true });

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ?? "Cannot reach the server. Please try again.";
    return Promise.reject(new Error(message));
  }
);

export default client;
