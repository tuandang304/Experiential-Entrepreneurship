# WORKFLOWS.md — Use Cases & Business Flows (AIMA)

---

## Main Use Cases

| UC | Name | Actor | Result |
|----|-----|-------|---------|
| UC-01 | Configure Brand Persona | User | Brand profile saved |
| UC-02 | Define Content Strategy | User | Strategy saved, usable by the AI |
| UC-03 | Connect Social Account | User | Social account linked |
| UC-04 | Research Trends | Agent AI | List of trends + content ideas |
| UC-05 | Generate Content | Agent AI | Draft content |
| UC-06 | Review Generated Content | User | Approve / regenerate |
| UC-07 | Format Content by Platform | Agent AI | ContentVersion per platform |
| UC-08 | Schedule Post | Agent AI + User | Post added to the calendar |
| UC-09 | Auto Publish Post | Agent AI + Platforms | Posted or Failed |
| UC-10 | Analyze Performance | Analytics + Agent AI | Insights |
| UC-11 | Optimize Future Strategy | Agent AI | Improved strategy |
| UC-12 | Manage Failed Posts | User + Admin | Edit / repost / cancel |

---

## Business Flows (BF)

### BF01 — Brand Persona Setup
User opens the configuration → enters brand information → selects platforms → sets frequency/schedule → system validates → saves → AI creates the internal brand profile.

### BF02 — Strategy Configuration
Choose goals → content types → platforms → frequency → time slots → save the strategy.

### BF03 — Content Generation
AI receives brand profile + strategy + trend/idea → writes script → caption → hashtags → CTA → media prompt → checks brand voice → saves draft.

### BF04 — Platform Formatting
Check connected platforms → fetch the original content → adapt caption/hashtags/media per platform → create ContentVersion → save.

### BF05 — Schedule & Posting
Check the calendar → select a post → determine the golden hour → enqueue → at the scheduled time call the platform API → receive the result → save the status. Success → track analytics. Failure → log the error + notify.

### BF06 — Trend Research
At the scheduled time (or manually) → collect trends from the platforms → filter by industry → rate relevance → select promising trends → create content ideas → save.

### BF07 — Performance Analysis
After publishing, wait a period → fetch engagement data → store analytics → AI compares posts → identifies the best performers → analyzes the success factors → produces insights.

### BF08 — Strategy Optimization
AI takes analytics + insights → identifies what to improve → proposes adjustments → user accepts/rejects → if accepted, the strategy is updated.

### BF09 — Error Handling
Detect the error → log it → move the post to `Failed` → if temporary, retry → if user action is needed, notify → user edits / reconnects / reposts.

---

## Exception Flows

| EX | Situation | Handling |
|----|-----------|-------|
| EX-01 | Social account not connected | Block posting, show a connection prompt, resume after connecting |
| EX-02 | Content violates platform policy (HTTP 400/403) | `Failed`, **no retry**, store the error code + message, notify the user, allow edit/regenerate then repost |
| EX-03 | Publishing failed (token/API/media/account limit) | `Failed`, store the error; temporary → retry; not self-resolvable → notify the user |
| EX-04 | Content doesn't match the brand | User regenerates (with notes), a new version is saved |
| EX-05 | Analytics unavailable | Log the error, retry later; still failing → report "not yet available"; the post stays `Posted` |

---

## Post State Machine

```
Normal:        Draft → Generated → Formatted → Scheduled → Posting → Posted → Analyzing → Optimized
Review:        Generated → Need Review → Approved → Scheduled
Failure:       Posting → Failed → Retrying → Posted
Token expired: Scheduled → On Hold (waiting for the user to reconnect)
```

| State | Meaning |
|-----------|---------|
| Draft | Draft content |
| Generated | Created by the AI |
| Need Review | Awaiting review |
| Approved | Approved |
| Formatted | Formatted per platform |
| Scheduled | Scheduled for posting |
| Posting | Being published |
| Posted | Published successfully |
| Failed | Failed |
| Retrying | Being retried |
| Analyzing | Being analyzed |
| Optimized | Used to optimize the strategy |
