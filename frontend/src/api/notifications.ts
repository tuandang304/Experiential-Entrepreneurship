import client, { ApiResponse } from "./client";

export type NotificationType =
  | "POST_PUBLISHED"
  | "POST_FAILED"
  | "REVIEW_NEEDED"
  | "RECONNECT_NEEDED"
  | "NEW_INSIGHT"
  | "POLICY_VIOLATION";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  // Optional deep link target (e.g. content item / social account).
  link: string | null;
  createdAt: string;
}

export async function listNotifications(): Promise<AppNotification[]> {
  const { data } = await client.get<ApiResponse<AppNotification[]>>("/notifications");
  return data.result;
}

export async function markNotificationRead(id: string): Promise<void> {
  await client.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await client.post("/notifications/read-all");
}
