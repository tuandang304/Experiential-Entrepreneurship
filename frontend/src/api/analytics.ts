import client, { ApiResponse } from "./client";
import { Platform } from "./brandProfile";

export interface PostAnalytics {
  postId: string;
  platform: Platform;
  caption: string;
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  ctr: number;
  conversion: number;
  watchTime: number;
}

export interface OptimizationInsight {
  id: string;
  insightContent: string;
  recommendation: string;
  createdAt: string;
}

// FR-65/66/68 — strategy adjustment proposal the user can accept/reject.
export interface StrategyAdjustment {
  id: string;
  strategyId: string;
  adjustmentContent: string;
  appliedStatus: "Pending" | "Accepted" | "Rejected";
  createdAt: string;
}

export async function listPostAnalytics(brandProfileId: string): Promise<PostAnalytics[]> {
  const { data } = await client.get<ApiResponse<PostAnalytics[]>>("/analytics/posts", {
    params: { brandProfileId },
  });
  return data.result;
}

export async function listInsights(brandProfileId: string): Promise<OptimizationInsight[]> {
  const { data } = await client.get<ApiResponse<OptimizationInsight[]>>("/analytics/insights", {
    params: { brandProfileId },
  });
  return data.result;
}

export async function listAdjustments(brandProfileId: string): Promise<StrategyAdjustment[]> {
  const { data } = await client.get<ApiResponse<StrategyAdjustment[]>>("/analytics/adjustments", {
    params: { brandProfileId },
  });
  return data.result;
}

export async function decideAdjustment(
  id: string,
  decision: "Accepted" | "Rejected"
): Promise<StrategyAdjustment> {
  const { data } = await client.patch<ApiResponse<StrategyAdjustment>>(
    `/analytics/adjustments/${id}`,
    { decision }
  );
  return data.result;
}
