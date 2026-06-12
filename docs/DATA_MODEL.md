# DATA_MODEL.md — Entities & Relationships (AIMA)

> Mục 8 trong requirement gốc ghi "cần cân nhắc, chưa chốt" — dùng làm tham khảo, có thể điều chỉnh khi implement.

---

## Entities & thuộc tính chính

### BrandProfile
`BrandProfileID, UserID, BrandName, Industry, Description, BrandVoice, TargetAudience, ContentGoal, CreatedAt, UpdatedAt`
(thêm: PlatformList, PostingFrequency, PreferredTime theo FR-05)

### ContentStrategy
`StrategyID, BrandProfileID, Goal, Frequency, PreferredTime, PlatformList, ContentStyle, CTAType, Status`

### PlatformAccount
`PlatformAccountID, UserID, PlatformName, AccountName, AccessToken, RefreshToken, TokenExpiredAt, ConnectionStatus`
- `ConnectionStatus`: Active / Expired / Disconnected
- ⚠️ Token phải được mã hóa, không trả ra frontend (SEC-03).

### TrendResearchSession
`ResearchSessionID, BrandProfileID, Industry, Platform, ResearchTime, Status`

### Trend
`TrendID, ResearchSessionID, TrendName, Platform, RelevanceScore, Description`

### ContentIdea
`ContentIdeaID, TrendID, IdeaTitle, IdeaDescription, Platform, SuitabilityLevel`

### ContentItem (nội dung gốc)
`ContentItemID, BrandProfileID, ContentIdeaID, Script, Caption, Hashtag, CTA, Status, CreatedAt`

### ContentVersion (đã format theo platform)
`ContentVersionID, ContentItemID, PlatformName, FormattedCaption, FormattedHashtag, MediaFormat, Status`

### MediaAsset
`MediaAssetID, ContentItemID, MediaType, MediaURL, MediaPrompt, Format, Size, Duration`
(MVP: chủ yếu lưu `MediaPrompt` — text mô tả, không tự sinh media)

### PostSchedule
`ScheduleID, ContentVersionID, PlatformAccountID, ScheduledTime, Status`

### Post
`PostID, ScheduleID, PlatformName, PlatformPostID, PublishedAt, Status`

### PostingJob
`PostingJobID, PostID, StartTime, EndTime, RetryCount, ErrorMessage, Status`

### PublishResult
`PublishResultID, PostID, IsSuccess, ResponseCode, ResponseMessage, CreatedAt`

### PostAnalytics
`AnalyticsID, PostID, Views, Likes, Comments, Shares, Saves, CTR, Conversion, WatchTime, CollectedAt`

### OptimizationInsight
`InsightID, AnalyticsID, InsightContent, Recommendation, CreatedAt`

### StrategyAdjustment
`AdjustmentID, StrategyID, InsightID, AdjustmentContent, AppliedStatus, CreatedAt`

---

## Quan hệ giữa các entity

| Quan hệ | Loại | Ghi chú |
|---------|------|---------|
| User → BrandProfile | 1–N | 1 user nhiều brand profile |
| BrandProfile → ContentStrategy | 1–N | |
| User → PlatformAccount | 1–N | |
| BrandProfile → ContentItem | 1–N | |
| ContentItem → ContentVersion | 1–N | 1 gốc → nhiều bản theo platform |
| ContentItem → MediaAsset | 1–N | |
| ContentVersion → PostSchedule | 1–1 | |
| PostSchedule → Post | 1–1 | |
| Post → PostingJob | 1–N | nhiều lần retry |
| Post → PostAnalytics | 1–N | thu thập nhiều lần |
| PostAnalytics → OptimizationInsight | 1–N | |
| ContentIdea → ContentItem | 1–N | |
| Trend → ContentIdea | 1–N | |

---

## Quy tắc xóa dữ liệu (Soft Delete mặc định — `deleted_at`)

| Hành động | Cascade | Ghi chú |
|-----------|---------|---------|
| Xóa BrandProfile | ContentStrategy, ContentItem, ContentVersion, PostSchedule **chưa đăng** | KHÔNG xóa Post đã `Posted` (giữ lịch sử) |
| Xóa ContentStrategy | Không cascade | Content & lịch vẫn giữ |
| Xóa ContentItem | ContentVersion, MediaAsset liên quan | Chỉ xóa khi `Draft`/`Generated` |
| Xóa PlatformAccount | PostSchedule đang `Scheduled` → chuyển `On Hold` | KHÔNG xóa Post đã `Posted` |
| Xóa User | Toàn bộ dữ liệu (soft delete) | Giữ anonymized data cho analytics tổng hợp |

> Hard delete chỉ khi user yêu cầu xóa tài khoản hoàn toàn theo GDPR.
