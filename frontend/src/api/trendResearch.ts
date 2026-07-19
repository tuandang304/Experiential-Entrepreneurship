import client, { type ApiResponse } from "./apiClient";

// Trend Research gọi backend thật qua api/apiClient.ts (envelope { code, message, result }).
// Endpoint: /trend-research (controller backend, context-path đã ở baseURL).
//
// NFR-04: research chạy nền — POST /trend-research/sessions trả phiên PENDING ngay,
// FE poll GET /trend-research/sessions/{id} tới khi status là COMPLETED hoặc FAILED.

export type ResearchStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
export type ResearchSuitability = "LOW" | "MEDIUM" | "HIGH";
export type ResearchPlatform = "FACEBOOK" | "INSTAGRAM" | "THREADS";

export interface ResearchContentIdea {
  id: string;
  ideaTitle: string;
  ideaDescription: string | null;
  platform: ResearchPlatform;
  suitabilityLevel: ResearchSuitability | null;
}

export interface ResearchTrend {
  id: string;
  trendName: string;
  platform: ResearchPlatform;
  relevanceScore: number | null;
  description: string | null;
  contentIdeas: ResearchContentIdea[];
}

export interface ResearchSessionDetail {
  id: string;
  industry: string;
  platform: ResearchPlatform;
  strategyName: string | null; // chiến lược user chọn lúc bắt đầu (phiên cũ: null)
  articleCount: number | null; // số ý tưởng user yêu cầu (null = mặc định backend)
  researchTime: string; // ISO datetime
  status: ResearchStatus;
  summary: string | null;
  errorMessage: string | null;
  trends: ResearchTrend[];
}

export interface ResearchSessionSummary {
  id: string;
  industry: string;
  platform: ResearchPlatform;
  researchTime: string;
  status: ResearchStatus;
  trendsFound: number;
  ideasCreated: number;
}

export interface TrendResearchInput {
  brandProfileId?: string; // mặc định: brand profile đang hoạt động
  platform?: ResearchPlatform; // mặc định: FACEBOOK
  strategyId?: string; // mặc định: chiến lược ACTIVE mới nhất của brand
  articleCount?: number; // số ý tưởng mong muốn 1–20; mặc định backend = 10
}

// POST /trend-research/sessions — "Research ngay" (FR-19)
export async function startTrendResearch(input?: TrendResearchInput): Promise<ResearchSessionDetail> {
  const { data } = await client.post<ApiResponse<ResearchSessionDetail>>("/trend-research/sessions", input ?? {});
  return data.result;
}

// GET /trend-research/sessions/{sessionId} — poll trạng thái + kết quả
export async function getTrendResearchSession(sessionId: string): Promise<ResearchSessionDetail> {
  const { data } = await client.get<ApiResponse<ResearchSessionDetail>>(`/trend-research/sessions/${sessionId}`);
  return data.result;
}

// GET /trend-research/sessions — lịch sử phiên (FR-23), mới nhất trước
export async function listTrendResearchSessions(): Promise<ResearchSessionSummary[]> {
  const { data } = await client.get<ApiResponse<ResearchSessionSummary[]>>("/trend-research/sessions");
  return data.result;
}

// DELETE /trend-research/trends — xóa (soft delete) nhiều trend không phù hợp; trả số đã xóa
export async function deleteTrends(trendIds: string[]): Promise<number> {
  const { data } = await client.delete<ApiResponse<number>>("/trend-research/trends", { data: { trendIds } });
  return data.result;
}
