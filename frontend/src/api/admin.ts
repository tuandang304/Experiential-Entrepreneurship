import client, { ApiResponse } from "./client";

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: "USER" | "ADMIN";
  status: "Active" | "Suspended";
  createdAt: string;
}

export interface SystemStatus {
  totalUsers: number;
  activePosts: number;
  failedPosts: number;
  pendingReview: number;
  queuedJobs: number;
}

export interface SystemLog {
  id: string;
  level: "INFO" | "WARN" | "ERROR";
  source: string;
  message: string;
  createdAt: string;
}

export interface RejectedContent {
  id: string;
  brandName: string;
  platform: string;
  reason: string;
  createdAt: string;
}

export async function listUsers(): Promise<AdminUser[]> {
  const { data } = await client.get<ApiResponse<AdminUser[]>>("/admin/users");
  return data.result;
}

export async function setUserStatus(
  id: string,
  status: "Active" | "Suspended"
): Promise<AdminUser> {
  const { data } = await client.patch<ApiResponse<AdminUser>>(`/admin/users/${id}/status`, {
    status,
  });
  return data.result;
}

export async function getSystemStatus(): Promise<SystemStatus> {
  const { data } = await client.get<ApiResponse<SystemStatus>>("/admin/system-status");
  return data.result;
}

export async function listSystemLogs(): Promise<SystemLog[]> {
  const { data } = await client.get<ApiResponse<SystemLog[]>>("/admin/logs");
  return data.result;
}

export async function listRejectedContent(): Promise<RejectedContent[]> {
  const { data } = await client.get<ApiResponse<RejectedContent[]>>("/admin/rejected-content");
  return data.result;
}
