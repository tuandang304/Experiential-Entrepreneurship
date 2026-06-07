# Technology Stack

## Front-end

The AIMA system's front-end is built using TypeScript, JavaScript, and UI support libraries. It is responsible for displaying the interface, handling user interaction, and calling APIs from the back-end.

| Technology | Purpose |
|---|---|
| TypeScript / JavaScript | Interface logic and type safety |
| React.js | Component-based UI, reusable and maintainable |
| Tailwind CSS | Fast, modern, responsive styling |
| React Router DOM | Client-side navigation |
| Axios / Fetch API | RESTful API communication |
| UI & Animation Libraries | Effects, icons, and smooth UX |

---

## Back-end

The AIMA system's back-end is built using Java 21 and Spring Boot, responsible for business logic, data management, authentication, and serving APIs to the front-end.

**Core**
- **Java 21** — Primary programming language
- **Spring Boot** — Fast, stable, and scalable application framework
- **Spring Web / RESTful API** — API layer for front-end communication

**Data**
- **PostgreSQL** — Stores users, content, schedules, and analytics
- **Spring Data JPA / Hibernate** — ORM and database operations

**Security & Auth**
- **Spring Security + JWT** — Authentication, authorization, and API protection
- **OAuth2** — Google login and external service integration

**Utilities**
- **Lombok** — Eliminates boilerplate (getters, setters, constructors)
- **MapStruct** — Entity ↔ DTO mapping
- **Validation** — Input data validation
- **Email Service** — Auth emails, password recovery, and system notifications

---

## AI

The AI system is built using Python 3.10, with dependencies managed via `uv`. It coordinates AI Agents using LangChain and the Antigravity SDK (more integrations planned).
