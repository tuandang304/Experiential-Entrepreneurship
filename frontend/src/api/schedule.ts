import client, { ApiResponse } from "./client";
import { Platform } from "./brandProfile";

export type ScheduleStatus =
  | "Scheduled"
  | "Posting"
  | "Posted"
  | "Failed"
  | "Retrying"
  | "On Hold";

export interface PostSchedule {
  id: string;
  contentVersionId: string;
  contentItemId: string;
  platform: Platform;
  caption: string;
  scheduledTime: string;
  status: ScheduleStatus;
  errorMessage: string | null;
}

export interface ScheduleInput {
  contentVersionId: string;
  platformAccountId: string;
  scheduledTime: string;
}

export async function listSchedules(
  brandProfileId: string,
  range?: { from?: string; to?: string }
): Promise<PostSchedule[]> {
  const { data } = await client.get<ApiResponse<PostSchedule[]>>("/schedules", {
    params: { brandProfileId, ...range },
  });
  return data.result;
}

export async function createSchedule(input: ScheduleInput): Promise<PostSchedule> {
  const { data } = await client.post<ApiResponse<PostSchedule>>("/schedules", input);
  return data.result;
}

// FR-50 Update schedule.
export async function updateSchedule(
  id: string,
  input: { scheduledTime: string }
): Promise<PostSchedule> {
  const { data } = await client.put<ApiResponse<PostSchedule>>(`/schedules/${id}`, input);
  return data.result;
}

// FR-51 Cancel schedule (unpublished only).
export async function cancelSchedule(id: string): Promise<void> {
  await client.delete(`/schedules/${id}`);
}

// FR-48 Golden-hour suggestions for a platform.
export async function getGoldenHours(
  brandProfileId: string,
  platform: Platform
): Promise<string[]> {
  const { data } = await client.get<ApiResponse<{ slots: string[] }>>("/schedules/golden-hours", {
    params: { brandProfileId, platform },
  });
  return data.result.slots;
}
