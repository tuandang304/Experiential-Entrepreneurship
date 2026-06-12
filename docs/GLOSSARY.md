# GLOSSARY.md — Terminology, Assumptions, Constraints (AIMA)

---

## Glossary

| Term | Definition |
|-----------|-----------|
| **Agent AI** | Autonomous AI agent: researches, generates, formats, analyzes — without requiring user intervention at every step |
| **Brand Profile** | Brand profile: industry, brand voice, target audience, content goals. The foundation for all AI-generated content |
| **Brand Voice** | The brand's tone of voice (professional, humorous, youthful, luxurious...) |
| **CTA** | Call To Action — a prompt for the audience to act (Buy now, Follow, Comment to receive the guide...) |
| **Content Strategy** | Content strategy: goals, frequency, platforms, style |
| **ContentItem** | Original AI-generated content (script, caption, hashtags, CTA) before formatting |
| **ContentVersion** | A version formatted for a specific platform |
| **Golden hour** | The time slots with the highest engagement on a platform |
| **Hook** | The opening line/scene that grabs attention within the first 1–3 seconds |
| **MVP** | Minimum Viable Product — the smallest version with the core features |
| **Posting Job** | The process that calls a platform API to publish a post; can be retried |
| **Rate Limit** | The maximum number of API calls allowed within a time window |
| **Refresh Token** | A token used to obtain a new Access Token without logging in again |
| **Scheduler** | The component that checks the calendar and triggers posting at the right time |
| **SME** | Small and Medium Enterprise — the primary customer segment |
| **Soft Delete** | Deletion by setting `deleted_at`, without physically removing the record |
| **Trend** | A content trend currently popular (format, topic, hashtag) |
| **Watch Time** | Total video viewing time — a quality metric for video content |

---

## Assumptions

- **AS-01** The user already has valid social media accounts to connect.
- **AS-02** The platforms provide the APIs needed for posting and analytics.
- **AS-03** The AI generates content based on the user's input.
- **AS-04** The user bears final responsibility for the content published to their accounts.
- **AS-05** Some platforms restrict auto-posting → the system works within what each platform's API actually allows.

---

## Constraints

- **CON-01** Dependent on the social media platforms' APIs.
- **CON-02** Platforms may change their API policies, affecting auto-posting.
- **CON-03** The AI may generate inaccurate content → a review mechanism is required.
- **CON-04** Analytics may not be real-time.
- **CON-05** Auto-posting must comply with each platform's policies.

---

## Scope Reminders (for Claude Code)

1. Platforms: **Facebook → Instagram → Threads** (in that order).
2. Do **not** generate images/videos — only produce media prompts (text).
3. Do **not** build a custom content filter — only handle violation responses from the platforms.
4. AI/posting tasks are always **async**.
5. **Soft delete** by default.
6. Follow the **retry policy** (3 attempts, at 5/15/30 minutes, temporary errors only).
