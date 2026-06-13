import client, { ApiResponse } from "./client";
import { Platform } from "./brandProfile";

export type ContentStatus =
  | "Draft"
  | "Generated"
  | "Need Review"
  | "Approved"
  | "Formatted"
  | "Scheduled"
  | "Posting"
  | "Posted"
  | "Analyzing"
  | "Optimized"
  | "Failed";

// ContentVersion — formatted per platform (FR-40/46).
export interface ContentVersion {
  id: string;
  platform: Platform;
  formattedCaption: string;
  formattedHashtags: string;
  mediaFormat: string | null;
  status: string;
}

export interface ContentItem {
  id: string;
  brandProfileId: string;
  contentIdeaId: string | null;
  script: string | null;
  caption: string;
  hashtags: string;
  cta: string;
  mediaPrompt: string | null;
  status: ContentStatus;
  aiGenerated: boolean;
  versions: ContentVersion[];
  createdAt: string;
}

export interface ContentItemUpdate {
  caption?: string;
  hashtags?: string;
  cta?: string;
  script?: string;
  mediaPrompt?: string;
}

export interface GenerateRequest {
  brandProfileId: string;
  contentIdeaId?: string;
  platforms: Platform[];
  regenerateFrom?: string; // FR-88 reuse: regenerate creates a new item
}

export async function listContentItems(
  brandProfileId: string,
  params?: { status?: ContentStatus; q?: string }
): Promise<ContentItem[]> {
  const { data } = await client.get<ApiResponse<ContentItem[]>>("/content-items", {
    params: { brandProfileId, ...params },
  });
  return data.result;
}

export async function getContentItem(id: string): Promise<ContentItem> {
  const { data } = await client.get<ApiResponse<ContentItem>>(`/content-items/${id}`);
  return data.result;
}

// FR-24 Generate (async job on the backend).
export async function generateContent(req: GenerateRequest): Promise<ContentItem> {
  const { data } = await client.post<ApiResponse<ContentItem>>("/content-items/generate", req);
  return data.result;
}

// FR-33 Manual edit.
export async function updateContentItem(
  id: string,
  update: ContentItemUpdate
): Promise<ContentItem> {
  const { data } = await client.put<ApiResponse<ContentItem>>(`/content-items/${id}`, update);
  return data.result;
}

// FR-32 Regenerate (creates a new draft from the same idea).
export async function regenerateContent(id: string): Promise<ContentItem> {
  const { data } = await client.post<ApiResponse<ContentItem>>(`/content-items/${id}/regenerate`);
  return data.result;
}

// FR-34 Review before posting → Approved.
export async function approveContentItem(id: string): Promise<ContentItem> {
  const { data } = await client.patch<ApiResponse<ContentItem>>(`/content-items/${id}/status`, {
    status: "Approved",
  });
  return data.result;
}

// FR-89 Delete (only Draft / Generated).
export async function deleteContentItem(id: string): Promise<void> {
  await client.delete(`/content-items/${id}`);
}
