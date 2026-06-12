# DATA_MODEL.md — Entities & Relationships (AIMA)

> Section 8 of the original requirements notes this is "under consideration, not finalized" — use as a reference; it may be adjusted during implementation.

---

## Entities & main attributes

### BrandProfile
`BrandProfileID, UserID, BrandName, Industry, Description, BrandVoice, TargetAudience, ContentGoal, CreatedAt, UpdatedAt`
(plus: PlatformList, PostingFrequency, PreferredTime per FR-05)

### ContentStrategy
`StrategyID, BrandProfileID, Goal, Frequency, PreferredTime, PlatformList, ContentStyle, CTAType, Status`

### PlatformAccount
`PlatformAccountID, UserID, PlatformName, AccountName, AccessToken, RefreshToken, TokenExpiredAt, ConnectionStatus`
- `ConnectionStatus`: Active / Expired / Disconnected
- ⚠️ Tokens must be encrypted and never returned to the frontend (SEC-03).

### TrendResearchSession
`ResearchSessionID, BrandProfileID, Industry, Platform, ResearchTime, Status`

### Trend
`TrendID, ResearchSessionID, TrendName, Platform, RelevanceScore, Description`

### ContentIdea
`ContentIdeaID, TrendID, IdeaTitle, IdeaDescription, Platform, SuitabilityLevel`

### ContentItem (original content)
`ContentItemID, BrandProfileID, ContentIdeaID, Script, Caption, Hashtag, CTA, Status, CreatedAt`

### ContentVersion (formatted per platform)
`ContentVersionID, ContentItemID, PlatformName, FormattedCaption, FormattedHashtag, MediaFormat, Status`

### MediaAsset
`MediaAssetID, ContentItemID, MediaType, MediaURL, MediaPrompt, Format, Size, Duration`
(MVP: primarily stores `MediaPrompt` — a text description; no media generation)

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

## Entity Relationships

| Relationship | Type | Notes |
|---------|------|---------|
| User → BrandProfile | 1–N | One user can have multiple brand profiles |
| BrandProfile → ContentStrategy | 1–N | |
| User → PlatformAccount | 1–N | |
| BrandProfile → ContentItem | 1–N | |
| ContentItem → ContentVersion | 1–N | One original → multiple platform versions |
| ContentItem → MediaAsset | 1–N | |
| ContentVersion → PostSchedule | 1–1 | |
| PostSchedule → Post | 1–1 | |
| Post → PostingJob | 1–N | Multiple retries |
| Post → PostAnalytics | 1–N | Collected multiple times |
| PostAnalytics → OptimizationInsight | 1–N | |
| ContentIdea → ContentItem | 1–N | |
| Trend → ContentIdea | 1–N | |

---

## Data Deletion Rules (Soft Delete by default — `deleted_at`)

| Action | Cascade | Notes |
|-----------|---------|---------|
| Delete BrandProfile | ContentStrategy, ContentItem, ContentVersion, **unpublished** PostSchedule | Do NOT delete `Posted` posts (keep the history) |
| Delete ContentStrategy | No cascade | Content & schedules are kept |
| Delete ContentItem | Related ContentVersion, MediaAsset | Only deletable when `Draft`/`Generated` |
| Delete PlatformAccount | `Scheduled` PostSchedules → move to `On Hold` | Do NOT delete `Posted` posts |
| Delete User | All data (soft delete) | Keep anonymized data for aggregate analytics |

> Hard delete only when the user requests full account deletion under GDPR.
