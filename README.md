# EcoSphere – Enterprise ESG Management Platform
![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-blue?logo=postgresql) ![License: MIT](https://img.shields.io/badge/License-MIT-yellow)
---
## 🚀 Project Overview
**Problem statement** – Modern enterprises must track, report, and improve their environmental, social, and governance (ESG) performance. Existing solutions are often fragmented, lack real‑time analytics, and do not integrate with internal HR/ERP data, making compliance and stakeholder reporting cumbersome.
**EcoSphere solution** – A unified, end‑to‑end SaaS‑style platform that lets organizations manage **environmental**, **governance**, **social**, and **gamification** data from a single source. The system provides:
- Secure role‑based access (RBAC) via JWT.
- Robust CRUD APIs for all ESG entities.
- Automated calculations, approval workflows, and activity logging.
- Real‑time dashboards with an aggregate ESG score.
- Swagger‑generated API documentation for rapid integration.
---
## 🌟 Key Features
| Feature | Description |
|--------|-------------|
| 🔐 **Authentication & RBAC** | JWT‑based login, refresh tokens, role‑specific permissions (Admin, ESG Manager, Department Head). |
| 🌱 **Environmental Management** | Emission factors, carbon transactions, environmental goals, automated CO₂ calculations, approval workflow. |
| 📜 **Governance Management** | ESG policies, acknowledgements, audits, compliance issues with lifecycle & severity tracking. |
| 🤝 **Social Management** | CSR activities, volunteer participation, social goals, evidence upload. |
| 🏆 **Gamification** | Challenges, XP, badges, rewards, leaderboard, reward‑approval workflow. |
| 🔔 **Notifications** | Real‑time alerts for pending approvals, overdue issues, policy reminders. |
| 📋 **Activity Logs** | Immutable audit trail for every create, update, and delete operation across modules. |
| 📈 **Dashboard & ESG Score** | Consolidated view of Environmental, Governance, and Social KPIs plus composite ESG score. |
| 📚 **Swagger API Documentation** | Interactive OpenAPI UI at `/api/docs`. |
---
## 🛠️ Tech Stack
### Frontend
| Technology | Version |
|------------|---------|
| React | 18.x |
| Vite | 5.x |
| Tailwind CSS | 3.x |
| Axios | 1.x |
### Backend
| Technology | Version |
|------------|---------|
| Node.js | 18.x |
| Express.js | 4.x |
| TypeScript | 5.x |
| Prisma ORM | 5.x |
| PostgreSQL | 15.x |
| JWT Authentication | `jsonwebtoken` |
| Zod Validation | 3.x |
---
## 📐 System Architecture
```mermaid
flowchart TD
    subgraph FE[Frontend (React/Vite)]
        A[UI Components] --> B[Axios API Client]
    end
    subgraph BE[Backend (Express/TS)]
        B --> C[Controllers]
        C --> D[Services]
        D --> E[Repositories]
        E --> F[Prisma Client]
    end
    F --> G[(PostgreSQL)]
    style FE fill:#f9f,stroke:#333,stroke-width:2px
    style BE fill:#9cf,stroke:#333,stroke-width:2px
```
**Flow**: React UI → Axios client → `/api/v1/...` controllers → services → repositories → Prisma → PostgreSQL.
---
## 📂 Folder Structure
```
EcoSphere/
├─ backend/
│   ├─ prisma/
│   │   └─ schema.prisma
│   ├─ src/
│   │   ├─ config/
│   │   ├─ controllers/
│   │   │   ├─ environmental/
│   │   │   ├─ governance/
│   │   │   ├─ social/
│   │   │   └─ gamification/
│   │   ├─ middlewares/
│   │   ├─ repositories/
│   │   ├─ routes/
│   │   │   └─ v1/
│   │   ├─ services/
│   │   └─ utils/
│   └─ tsconfig.json
├─ frontend/
│   ├─ src/
│   │   ├─ api/
│   │   │   └─ axios.js
│   │   ├─ components/
│   │   ├─ context/
│   │   │   └─ AuthContext.jsx
│   │   ├─ pages/
│   │   ├─ styles/
│   │   └─ App.jsx
│   ├─ public/
│   ├─ vite.config.js
│   └─ package.json
└─ README.md
```
* **backend/** – Server‑side code, Prisma schema, config.
* **frontend/** – React app, API client, context, UI.
* **README.md** – This documentation.
---
## 🗄️ Database Design
**Why PostgreSQL?**
- Strong ACID guarantees for reliable ESG data.
- Rich relational features (foreign keys, cascading updates) simplify entity relationships.
- Native JSON support for flexible metadata (e.g., evidence URLs).
### Core Entities
| Entity | Purpose |
|--------|---------|
| User | Authentication credentials, linked to an Employee. |
| Employee | Business user, belongs to a Department, can have many roles. |
| Department | Organizational unit; aggregates emissions, goals, and scores. |
| Role | RBAC definitions (Admin, ESG Manager, Department Head). |
| Environmental (EmissionFactor, CarbonTransaction, EnvironmentalGoal) | Track emissions, calculate CO₂, set reduction targets. |
| Governance (ESGPolicy, PolicyAcknowledgement, Audit, ComplianceIssue) | Policy compliance, audit tracking, issue lifecycle. |
| Social (CSRActivity, VolunteerParticipation, SocialGoal) | CSR initiatives, volunteer hours, social objectives. |
| Gamification (Challenge, ChallengeParticipation, Badge, EmployeeBadge, Reward, RewardRedemption, Leaderboard) | Employee engagement, XP, badges, rewards, leaderboards. |
| Notification | System‑generated alerts for approvals, overdue items, etc. |
| ActivityLog | Immutable log of every CREATE/UPDATE/DELETE operation across modules. |
---
## ⚙️ Feature Details
### Environmental
- CRUD for emission factors, carbon transactions, goals.
- Automatic CO₂ calculation (`quantity × emissionFactor`).
- Approval workflow (Pending → Approved/Rejected).
### Governance
- Policy management, employee acknowledgements, audit checklists, compliance issue lifecycle with severity & priority.
- Automated overdue‑issue detection & notifications.
### Social
- CSR activity catalog, volunteer participation tracking, evidence upload, social‑goal management.
### Gamification
- Challenges with XP, badge unlocking, reward catalog, redemption workflow with approval states, and global leaderboard.
### Authentication & RBAC
- JWT access & refresh tokens, password hashing (bcrypt).
- Role‑based access control enforced by middleware.
### Dashboard & ESG Score
- Aggregated KPIs and composite ESG score (e.g., 40 % Env, 30 % Social, 30 % Gov).
### Notifications & Activity Logs
- Real‑time API notifications stored in `Notification` table.
- `ActivityLog` captures every mutable operation for auditability.
---
## 📦 Installation
### Backend
```bash
cd backend
npm install
# create a .env (see below)
npm run dev
```
### Frontend
```bash
cd frontend
npm install
npm run dev
```
Default ports: backend `http://localhost:3000`, frontend `http://localhost:5173` (proxying API calls).
---
## 🔧 Environment Variables
| Variable | Description |
|----------|-------------|
| DATABASE_URL | PostgreSQL connection string. |
| JWT_SECRET | Secret for signing access tokens. |
| JWT_REFRESH_SECRET | Secret for refresh tokens. |
| ACCESS_TOKEN_EXPIRES_IN | Access token TTL (e.g., `15m`). |
| REFRESH_TOKEN_EXPIRES_IN | Refresh token TTL (e.g., `7d`). |
| PORT | Backend HTTP port (default `3000`). |
| CORS_ORIGIN | Allowed origin for the frontend (`http://localhost:5173`). |
| SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS | Optional email settings for notifications. |
| FILE_STORAGE_PATH | Directory for uploaded evidence files. |
Create a `.env` file in `backend/` with these entries.
---
## 📖 API Documentation
Swagger UI: `http://localhost:3000/api/docs` – interactive reference for all `/api/v1/...` endpoints.
---
## 🔐 Security
- **JWT** – Signed access & refresh tokens.
- **RBAC** – Middleware enforces role permissions.
- **Password Hashing** – bcrypt (work factor 12).
- **Input Validation** – Zod schemas.
- **Protected Routes** – All CRUD endpoints require a valid JWT; only `/auth/*` are public.
---
## 🚀 Future Enhancements
| Idea | Benefit |
|------|---------|
| Bulk Import/Export | Faster onboarding of historical ESG data. |
| ML Emission Forecasts | Predict future emissions trends. |
| Multi‑Tenant Support | SaaS for multiple companies. |
| GraphQL API | Flexible client queries. |
| WebSocket Notifications | Real‑time dashboard updates. |
| Advanced Reporting | PDF/Excel exports, scheduled reports. |
| ERP/HRIS Integration | Auto‑sync employees, departments, payroll. |
---
## 👥 Team Members
| Role | Name |
|------|------|
| Backend Developer | *[Your Name]* |
| Frontend Developer | *[Your Name]* |
| Project Lead | *[Your Name]* |
*(Replace placeholders with actual contributor names.)*
---
## 📄 License
Licensed under the **MIT License** – see `LICENSE` for details.

