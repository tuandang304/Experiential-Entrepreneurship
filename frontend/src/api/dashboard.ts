import client, { ApiResponse } from "./client";

export interface DashboardSummary {
  postsCreated: number;
  postsScheduled: number;
  postsPublished: number;
  postsFailed: number;
  totalViews: number;
  totalEngagement: number;
  // FR-86 onboarding/setup progress flags.
  setup: {
    hasBrandProfile: boolean;
    hasConnectedAccount: boolean;
    hasStrategy: boolean;
    hasGeneratedContent: boolean;
  };
  recentInsights: { id: string; recommendation: string; createdAt: string }[];
}

export async function getDashboardSummary(brandProfileId: string): Promise<DashboardSummary> {
  const { data } = await client.get<ApiResponse<DashboardSummary>>("/dashboard/summary", {
    params: { brandProfileId },
  });
  return data.result;
}
