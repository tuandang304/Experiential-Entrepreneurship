import type { Platform } from "./brandProfile";
import type { ContentItemResponse, ContentLifecycle, ContentVersionResponse } from "./contentGeneration";
import {
  createContentItem as apiCreateContentItem,
  startContentGeneration,
  getContentGenerationJob,
  updateContentVersion,
  updateContentItemStatus,
  listContentItems,
  getContentItem,
  deleteContentItem,
} from "./contentGeneration";
import { listTrendResearchSessions, getTrendResearchSession } from "./trendResearch";
import type { PageResponse } from "./apiClient";
import { useAppStore } from "../store/useAppStore";
import {
  mockContentList,
  mockBrandVoice,
  placeholderImage,
  draftListTitle,
} from "../createData";

// ===== Lớp service THỐNG NHẤT cho màn Tạo nội dung (list + wizard) =====
//
// ĐÃ NỐI API THẬT:
// - createContentItem (B2: tạo bài shell DRAFT) + generateVersion (mỗi nền tảng một job
//   ghi ContentVersion GIÀU vào bài; start + poll qua api/contentGeneration.ts, NFR-04).
// - saveContent (PUT từng bản nền tảng + PATCH trạng thái bài).
// - listContents / getContentDetail / deleteContent (FR-87/FR-89, đợt 3) — GET/DELETE thật.
// - listAttachableTrends (dữ liệu research thật từ api/trendResearch.ts).
// - brandVoice trong toContentVersion đọc THẬT từ backend (FR-30).
//
// CÒN MOCK (đánh dấu TODO(api) ở từng hàm — backend chưa có endpoint):
// nháp wizard (saveWizardDraft/getWizardDraft) / checkBrandVoice (nút "Kiểm tra lại") / generateImage.
// Lang chỉ dùng cho phần mock (đọc từ useAppStore) — backend thật tự sinh theo brand profile.

// ---- Kiểu dữ liệu dùng chung ----

/** Nội dung bài viết dạng đoạn văn: mở đầu (hook) → thân bài → kêu gọi hành động. */
export interface PostContent {
  hook: string;
  body: string;
  cta: string;
}

/** Kết quả "Kiểm tra brand voice" — % phù hợp + nhận xét từng khía cạnh. */
export interface BrandVoiceCheck {
  score: number; // 0–100
  tone: string;
  wording: string;
  message: string;
  summary: string;
}

/** Một phiên bản nội dung theo TỪNG nền tảng (BR-04: format riêng mỗi platform). */
export interface ContentVersion {
  id: string;
  platform: Platform;
  post: PostContent;
  caption: string;
  hashtags: string[];
  cta: string;
  mediaPrompt: string;
  imageUrl: string | null;
  brandVoice: BrandVoiceCheck;
  createdAt: string;
}

/** Một lượt AI sinh nội dung (mốc 2). "Tạo lại" tạo GenerationResult MỚI, không ghi đè. */
export interface GenerationResult {
  id: string;
  note?: string; // ghi chú người dùng nhập khi "Tạo lại"
  createdAt: string;
  versions: ContentVersion[]; // 1 phần tử / nền tảng
}

/** Mục trong danh sách nội dung đã tạo (lớp 1). */
export interface ContentListItem {
  id: string;
  title: string;
  excerpt: string;
  platforms: Platform[];
  status: ContentLifecycle;
  brandVoice: number; // % — 0 nếu chưa kiểm tra (bản nháp)
  brandId: string;
  brandName: string;
  updatedAt: string;
  /** Bản nháp dở dang trong wizard → hiện nút "Tiếp tục". */
  isDraft: boolean;
  /** Bước wizard đang dừng (chỉ có ở bản nháp) — card hiện "Dừng ở: …". */
  draftStep?: 1 | 2 | 3 | 4;
}

/** Sắp xếp danh sách: mới nhất / brand voice cao nhất / theo thứ tự trạng thái. */
export type ContentSort = "newest" | "voice" | "status";

export interface ContentListParams {
  q?: string;
  platform?: Platform;
  status?: ContentLifecycle;
  brandId?: string;
  sort?: ContentSort;
  /** Trang 0-based (theo Pageable của backend). */
  page?: number;
  size?: number;
}

/** Input tạo MỘT phiên bản cho MỘT nền tảng (PA1: mỗi nền tảng một job backend). */
export interface GenerateVersionInput {
  strategyId: string;
  /** B2: bài (ContentItem) mà bản nền tảng này ghi vào — tạo trước bằng createContentItem. */
  contentItemId: string;
  platform: Platform;
  /** Trend gắn kèm — gửi id, backend resolve NỘI DUNG (ownership check, id lạ bị bỏ qua). */
  trendId?: string;
  /** Ý tưởng content gắn kèm — như trendId. */
  ideaId?: string;
  /** Ghi chú của user (mốc 1 + ghi chú "Tạo lại" nếu có) — vào thẳng prompt AI. */
  note?: string;
  /** TEXT bản trước cần cải thiện khi tạo lại (FR-32) — KHÔNG phải id. */
  regenerateFrom?: string;
}

/** Trend/idea gắn được vào bài — lấy từ phiên research THẬT của tab Xu hướng. */
export interface AttachableTrend {
  id: string;
  kind: "trend" | "idea";
  title: string;
}

export interface GenerateImageInput {
  platform: Platform;
  mediaPrompt: string;
}

export interface CheckBrandVoiceInput {
  brandId: string;
  platform: Platform;
  post: PostContent;
  caption: string;
}

/** Nội dung cuối của MỘT bản nền tảng cần lưu — ghi đè vào version đang active của bài. */
export interface SaveVersionInput {
  /** Id bản nền tảng đang active trên backend (PUT target). */
  versionId: string;
  script: string;
  caption: string;
  hashtags: string[];
  cta: string;
  mediaPrompt: string;
}

export interface SaveContentInput {
  itemId: string;
  /** Trạng thái khi lưu: giữ Nháp (không PATCH) / gửi duyệt / phê duyệt. */
  status: "DRAFT" | "NEED_REVIEW" | "APPROVED";
  versions: SaveVersionInput[];
}

/** Bản nháp phiên wizard — lưu ngầm khi người dùng rời wizard giữa chừng (kể cả mốc 1). */
export interface WizardDraft {
  draftId: string;
  step: 1 | 2 | 3 | 4;
  brandId?: string;
  brandName?: string;
  strategyId?: string;
  trendId?: string;
  ideaId?: string;
  /** Nền tảng đã chọn riêng cho bài này (subset platform của chiến lược). */
  platforms?: Platform[];
  /** Ghi chú thêm cho AI đã nhập ở mốc 1. */
  note?: string;
}

export type WizardDraftInput = Omit<WizardDraft, "draftId"> & { draftId?: string };

// ---- Helpers mock ----

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const lang = () => useAppStore.getState().lang;

// Danh sách mock giữ trong module để Xóa/Lưu phản ánh ngay trên UI trong phiên làm việc.
let store: ContentListItem[] | null = null;
let storeLang: string | null = null;
const ensureStore = (): ContentListItem[] => {
  if (!store || storeLang !== lang()) {
    store = mockContentList(lang());
    storeLang = lang();
  }
  return store;
};

// ---- API của service ----

// Thứ tự nền tảng cố định trên card (FB → IG → TH), không phụ thuộc thứ tự backend trả version.
const PLATFORM_ORDER: Platform[] = ["FACEBOOK", "INSTAGRAM", "THREADS"];

// Bài (B2) → mục danh sách. Nội dung nằm ở các version (row bài thường rỗng), nên title/excerpt
// lấy từ bản nền tảng đầu tiên; brand voice của card = điểm cao nhất trong các bản.
// isDraft LUÔN false: nháp DRAFT thật hiển thị như bài (badge trạng thái "Nháp" tự phân biệt) —
// KHÁC "nháp wizard" (resume) vẫn là tính năng mock riêng, không surface vào danh sách thật.
function toContentListItem(r: ContentItemResponse): ContentListItem {
  const versions = r.versions ?? [];
  const first = versions[0];
  const scriptLines = (first?.script ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
  const caption = first?.formattedCaption?.trim() ?? "";
  const title = scriptLines[0] || caption || draftListTitle(lang());
  const excerpt = caption || scriptLines.slice(1).join(" ") || "";
  const platforms = PLATFORM_ORDER.filter((p) => versions.some((v) => v.platformName === p));
  const scores = versions
    .map((v) => v.voiceScore)
    .filter((n): n is number => typeof n === "number");
  return {
    id: r.id,
    title,
    excerpt,
    platforms,
    status: r.status,
    brandVoice: scores.length ? Math.max(...scores) : 0,
    brandId: r.brandProfileId ?? "",
    brandName: r.brandName ?? "",
    updatedAt: r.updatedAt ?? new Date().toISOString(),
    isDraft: false,
  };
}

// FR-87: GET /content-items — filter/sort/phân trang server-side (Pageable 0-based, mặc định mới nhất).
export async function listContents(params: ContentListParams = {}): Promise<PageResponse<ContentListItem>> {
  const pg = await listContentItems({
    q: params.q?.trim() || undefined,
    platform: params.platform,
    status: params.status,
    brandProfileId: params.brandId,
    sort: params.sort ?? "newest",
    page: params.page ?? 0,
    size: params.size ?? 6,
  });
  return { ...pg, content: pg.content.map(toContentListItem) };
}

// FR-87: GET /content-items/{id} — bài kèm các bản nền tảng còn hiệu lực (tab theo version thật).
export async function getContentDetail(id: string): Promise<{ item: ContentListItem; versions: ContentVersion[] }> {
  const r = await getContentItem(id);
  return { item: toContentListItem(r), versions: (r.versions ?? []).map(toContentVersion) };
}

// FR-89: DELETE /content-items/{id} — xóa mềm; backend chặn nếu bài không ở DRAFT/GENERATED.
export async function deleteContent(id: string): Promise<void> {
  await deleteContentItem(id);
}

// Nháp wizard lưu trong module cho phiên làm việc (API thật sẽ lưu ở backend).
const drafts = new Map<string, WizardDraft>();

// TODO(api): POST /content-items/drafts (tạo) | PUT /content-items/drafts/{id} (cập nhật) —
// lưu ngầm trạng thái wizard (bước hiện tại + brandId/strategyId/trendId) để "Tiếp tục"
// từ danh sách quay lại đúng bước đang dở.
export async function saveWizardDraft(input: WizardDraftInput): Promise<WizardDraft> {
  await delay(300);
  const draftId = input.draftId ?? `mock-draft-${Date.now()}`;
  const draft: WizardDraft = { ...input, draftId };
  drafts.set(draftId, draft);
  // Upsert vào danh sách nội dung với trạng thái Nháp để người dùng thấy và "Tiếp tục".
  const title = input.brandName ? `${draftListTitle(lang())} · ${input.brandName}` : draftListTitle(lang());
  const item: ContentListItem = {
    id: draftId,
    title,
    excerpt: '',
    platforms: [],
    status: 'DRAFT',
    brandVoice: 0,
    brandId: input.brandId ?? '',
    brandName: input.brandName ?? '',
    updatedAt: new Date().toISOString(),
    isDraft: true,
    draftStep: input.step,
  };
  const rest = ensureStore().filter((it) => it.id !== draftId);
  store = [item, ...rest];
  return draft;
}

// TODO(api): GET /content-items/drafts/{id} — trả null nếu nháp không còn.
export async function getWizardDraft(draftId: string): Promise<WizardDraft | null> {
  await delay(300);
  return drafts.get(draftId) ?? null;
}

// ---- Tạo nội dung: API THẬT (PA1 — mỗi nền tảng một job async, NFR-04) ----

// script backend trả là các DÒNG: hook \n thân bài + gợi ý cảnh \n ... \n CTA
// (ContentItemMapper.formatScript nối bằng '\n') → tách lại thành hook/thân/kết cho UI.
function splitScript(script: string, fallbackCta: string): PostContent {
  const lines = script.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return { hook: "", body: "", cta: fallbackCta };
  if (lines.length === 1) return { hook: lines[0], body: "", cta: fallbackCta };
  return { hook: lines[0], body: lines.slice(1, -1).join("\n"), cta: lines[lines.length - 1] };
}

// Map bản nền tảng GIÀU từ backend → ContentVersion cho UI. Brand voice đọc THẬT
// (FR-30: backend trả voiceScore + voiceNotes; tone/wording/message backend không có nên để trống).
function toContentVersion(v: ContentVersionResponse): ContentVersion {
  return {
    id: v.id,
    platform: v.platformName,
    post: splitScript(v.script ?? "", v.cta ?? ""),
    caption: v.formattedCaption ?? "",
    hashtags: (v.formattedHashtags ?? []).map((h) => (h.startsWith("#") ? h : `#${h}`)),
    cta: v.cta ?? "",
    mediaPrompt: v.mediaPrompt ?? "",
    // Ảnh chưa sinh (tính năng chưa làm); imagePrompt backend đã lưu, đón cho lượt sau.
    imageUrl: null,
    brandVoice: {
      score: v.voiceScore ?? 0,
      summary: v.voiceNotes ?? "",
      tone: "",
      wording: "",
      message: "",
    },
    createdAt: new Date().toISOString(),
  };
}

// B2: tạo BÀI shell (DRAFT) — trả itemId để bắn các job generate ghi version vào.
export async function createContentItem(strategyId: string, ideaId?: string): Promise<string> {
  const item = await apiCreateContentItem({ strategyId, ideaId });
  return item.id;
}

/**
 * Tạo MỘT ContentVersion cho MỘT nền tảng bằng backend THẬT (ghi vào bài contentItemId):
 * POST /content-items/generate → poll GET /content-items/jobs/{id} tới SUCCESS/FAILED.
 * Lỗi (job FAILED, hoặc START trả mã 1905/1906/1920) đẩy ra ngoài — UI hiển thị trạng
 * thái lỗi + "Thử lại" riêng nền tảng đó, không làm đứng wizard.
 */
export async function generateVersion(input: GenerateVersionInput): Promise<ContentVersion> {
  let job = await startContentGeneration({
    strategyId: input.strategyId,
    contentItemId: input.contentItemId,
    platform: input.platform,
    trendId: input.trendId,
    ideaId: input.ideaId,
    note: input.note,
    regenerateFrom: input.regenerateFrom,
  });
  while (job.status === "PENDING" || job.status === "RUNNING") {
    await delay(2000);
    job = await getContentGenerationJob(job.id);
  }
  if (job.status !== "SUCCESS" || !job.contentVersion) {
    throw new Error(job.errorMessage ?? "AI_SERVICE_ERROR");
  }
  return toContentVersion(job.contentVersion);
}

/**
 * Trend/idea gắn được vào bài — dữ liệu THẬT từ phiên research COMPLETED gần nhất
 * của user (tab Xu hướng; backend đã scope theo user đăng nhập). Chưa có phiên nào → [].
 */
export async function listAttachableTrends(): Promise<AttachableTrend[]> {
  const sessions = await listTrendResearchSessions();
  const latest = sessions.find((s) => s.status === "COMPLETED");
  if (!latest) return [];
  const detail = await getTrendResearchSession(latest.id);
  const out: AttachableTrend[] = [];
  for (const tr of detail.trends) {
    out.push({ id: tr.id, kind: "trend", title: tr.trendName });
    for (const idea of tr.contentIdeas) {
      out.push({ id: idea.id, kind: "idea", title: idea.ideaTitle });
    }
  }
  return out;
}

// TODO(api): POST /content-items/generate-image { platform, mediaPrompt } → { imageUrl }.
// Backend chưa có endpoint này (MVP gốc chỉ tạo media prompt — FR-29); cần bổ sung.
export async function generateImage(input: GenerateImageInput): Promise<{ imageUrl: string }> {
  await delay(1400);
  return { imageUrl: placeholderImage(input.mediaPrompt.length + input.platform.length) };
}

// TODO(api): POST /content-items/check-brand-voice { brandId, platform, post, caption }
// → BrandVoiceCheck. Backend cần bổ sung endpoint.
export async function checkBrandVoice(input: CheckBrandVoiceInput): Promise<BrandVoiceCheck> {
  await delay(900);
  return mockBrandVoice(lang(), (input.post.hook.length + input.caption.length) % 4);
}

/**
 * Lưu bài ở mốc 4 (B2, API THẬT): PUT nội dung cuối vào TỪNG bản nền tảng đang active
 * (đẩy cả sửa tay lẫn "chọn bản khác"), rồi PATCH trạng thái bài.
 * - DRAFT: bài đã ở DRAFT → không PATCH.
 * - NEED_REVIEW: PATCH một bước (DRAFT→NEED_REVIEW).
 * - APPROVED: PATCH hai bước (DRAFT→NEED_REVIEW→APPROVED) vì backend chỉ duyệt từ NEED_REVIEW.
 */
export async function saveContent(input: SaveContentInput): Promise<void> {
  for (const v of input.versions) {
    await updateContentVersion(input.itemId, v.versionId, {
      script: v.script,
      caption: v.caption,
      // Backend lưu hashtag không '#' (Python trả không '#') → cắt '#' trước khi gửi, tránh nhân đôi.
      hashtags: v.hashtags.map((h) => h.replace(/^#+/, "")),
      cta: v.cta,
      mediaPrompt: v.mediaPrompt,
    });
  }
  if (input.status === "NEED_REVIEW") {
    await updateContentItemStatus(input.itemId, "NEED_REVIEW");
  } else if (input.status === "APPROVED") {
    await updateContentItemStatus(input.itemId, "NEED_REVIEW");
    await updateContentItemStatus(input.itemId, "APPROVED");
  }
}
