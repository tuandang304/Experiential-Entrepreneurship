import client, { ApiResponse } from "./client";
import { Platform } from "./brandProfile";

export type Relevance = "High" | "Medium" | "Low";

export interface Trend {
  id: string;
  trendName: string;
  platform: Platform;
  relevance: Relevance;
  description: string;
}

export interface ContentIdea {
  id: string;
  trendId: string;
  title: string;
  description: string;
  platform: Platform;
  suitability: Relevance;
}

export interface ResearchSession {
  id: string;
  brandProfileId: string;
  industry: string;
  researchTime: string;
  status: string;
  trends: Trend[];
}

export async function listResearchSessions(brandProfileId: string): Promise<ResearchSession[]> {
  const { data } = await client.get<ApiResponse<ResearchSession[]>>("/research-sessions", {
    params: { brandProfileId },
  });
  return data.result;
}

// FR-19 "Research now" — kicks off a background research job for the brand.
export async function researchNow(brandProfileId: string): Promise<ResearchSession> {
  const { data } = await client.post<ApiResponse<ResearchSession>>("/research-sessions", {
    brandProfileId,
  });
  return data.result;
}

export async function listIdeasForTrend(trendId: string): Promise<ContentIdea[]> {
  const { data } = await client.get<ApiResponse<ContentIdea[]>>(`/trends/${trendId}/ideas`);
  return data.result;
}
