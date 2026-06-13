import client, { ApiResponse } from "./client";
import { Platform } from "./brandProfile";

export type StrategyStatus = "Active" | "Paused";

export interface ContentStrategy {
  id: string;
  brandProfileId: string;
  goal: string;
  frequency: string;
  preferredTimes: string[];
  platforms: Platform[];
  contentTypes: string[];
  targetAudience: string | null;
  contentStyle: string | null;
  ctaType: string | null;
  status: StrategyStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ContentStrategyInput {
  brandProfileId: string;
  goal: string;
  frequency: string;
  preferredTimes: string[];
  platforms: Platform[];
  contentTypes: string[];
  targetAudience?: string;
  contentStyle?: string;
  ctaType?: string;
}

export async function listStrategies(brandProfileId: string): Promise<ContentStrategy[]> {
  const { data } = await client.get<ApiResponse<ContentStrategy[]>>("/strategies", {
    params: { brandProfileId },
  });
  return data.result;
}

export async function createStrategy(input: ContentStrategyInput): Promise<ContentStrategy> {
  const { data } = await client.post<ApiResponse<ContentStrategy>>("/strategies", input);
  return data.result;
}

export async function updateStrategy(
  id: string,
  input: ContentStrategyInput
): Promise<ContentStrategy> {
  const { data } = await client.put<ApiResponse<ContentStrategy>>(`/strategies/${id}`, input);
  return data.result;
}

// FR-13 Activate / Pause.
export async function setStrategyStatus(
  id: string,
  status: StrategyStatus
): Promise<ContentStrategy> {
  const { data } = await client.patch<ApiResponse<ContentStrategy>>(`/strategies/${id}/status`, {
    status,
  });
  return data.result;
}

export async function deleteStrategy(id: string): Promise<void> {
  await client.delete(`/strategies/${id}`);
}
