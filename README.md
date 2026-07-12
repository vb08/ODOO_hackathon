# EcoSphere – Enterprise ESG Management Platform

![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-blue?logo=postgresql) ![License: MIT](https://img.shields.io/badge/License-MIT-yellow)

EcoSphere is a unified, end-to-end corporate platform that enables organizations to record, audit, analyze, and optimize their **Environmental, Social, and Governance (ESG)** performance metrics. It combines a robust Express + PostgreSQL + Prisma backend with a premium, glassmorphic React frontend.

---

## 📌 Executive Architecture & Flows

### 1. High-Level Architecture
EcoSphere adopts a decoupled **Client-Server architecture** utilizing:
- **Frontend Layer**: Single Page Application (SPA) built using React, Vite, and Tailwind CSS. State is managed locally and via Context APIs (e.g., `AuthContext`). All requests are made via a centralized Axios instance with authorization interceptors.
- **API Gateway / Routing Layer**: Express Router utilizing custom Role-Based Access Control (RBAC) middlewares to validate JSON Web Tokens (JWT) and filter requests based on permission matrices.
- **Service Layer**: Decoupled TS classes encapsulating business logic (e.g., carbon calculations, badge awarding algorithms, audit scheduling).
- **Data Access Layer**: Repository Pattern backed by Prisma ORM communicating with a relational PostgreSQL database.

```mermaid
flowchart TB
    subgraph Client ["Client (Frontend React App)"]
        UI["UI Component View (Tailwind CSS)"]
        Context["Auth / Session Context"]
        AxiosClient["Axios HTTP client (Bearer JWT interceptor)"]
        UI --> Context
        UI --> AxiosClient
    end

    subgraph API_Gateway ["API Gateway / Routing Layer"]
        Router["Express App Router (/api/v1)"]
        AuthMiddleware["JWT Authentication Middleware"]
        RBACMiddleware["Role-Based Authorization filter"]
        Router --> AuthMiddleware
        AuthMiddleware --> RBACMiddleware
    end

    subgraph Service_Domain ["Business Service Domain"]
        EnvSvc["Environmental Calculation Svc"]
        GovSvc["Governance Policy & Audit Svc"]
        SocSvc["CSR Engagement Svc"]
        GamSvc["Gamification & Leaderboard Svc"]
    end

    subgraph Repository_Layer ["Data Access Layer (Prisma)"]
        PrismaClient["Prisma Database Client"]
    end

    subgraph Database ["PostgreSQL Datastore"]
        PG["PostgreSQL Instance"]
    end

    AxiosClient -- "JSON over HTTP" --> Router
    RBACMiddleware --> EnvSvc & GovSvc & SocSvc & GamSvc
    EnvSvc & GovSvc & SocSvc & GamSvc --> PrismaClient
    PrismaClient --> PG
```

---

## 💾 Database Schema Design (Low-Level Architecture)

The system relies on PostgreSQL to ensure ACID compliance across ledger transactions and CSR volunteer activity completions.

```mermaid
erDiagram
    Role {
        string id PK
        string code "ADMIN, ESG_MANAGER, etc"
        string name
    }
    User {
        string id PK
        string email
        string passwordHash
        string roleId FK
    }
    Employee {
        string id PK
        string firstName
        string lastName
        string employeeId
        string email
        string userId FK
        int xp
        float volunteerHours
    }
    EmissionFactor {
        string id PK
        string name
        float factor
        string unit
        string sourceType "Electricity, Diesel, etc"
    }
    CarbonTransaction {
        string id PK
        string sourceName
        float quantity
        float calculatedCo2
        string status "PENDING, APPROVED, REJECTED"
        string employeeId FK
    }
    ESGPolicy {
        string id PK
        string title
        string code
        string status "ACTIVE, DRAFT"
    }
    PolicyAcknowledgement {
        string id PK
        string policyId FK
        string employeeId FK
        datetime acknowledgedAt
    }
    Audit {
        string id PK
        string title
        string code
        string status "PLANNED, IN_PROGRESS, COMPLETED"
        float score
    }
    Challenge {
        string id PK
        string title
        int baseXp
        string status "ACTIVE, COMPLETED"
    }
    Reward {
        string id PK
        string title
        int xpCost
        int stock
    }
    RewardRedemption {
        string id PK
        string rewardId FK
        string employeeId FK
        string status "PENDING, APPROVED"
    }

    User ||--|| Employee : "1-to-1 profile"
    Role ||--o{ User : "defines RBAC"
    Employee ||--o{ CarbonTransaction : "logs emissions"
    ESGPolicy ||--o{ PolicyAcknowledgement : "tracks signatures"
    Employee ||--o{ PolicyAcknowledgement : "signs policies"
    Employee ||--o{ RewardRedemption : "redeems prizes"
    Reward ||--o{ RewardRedemption : "deducts stock"
```

---

## 🛠️ Feature Modules Specification

### 🌱 Environmental Module
- **Live Calculations Engine**: Carbon footprint is calculated dynamically using formula:
  $$\text{CO}_2\text{e (kg)} = \text{Activity Quantity} \times \text{Emission Factor Coefficient}$$
- **Ledger Verification Workflow**: Environmental transactions are submitted in `PENDING` states. ESG Managers or Administrators review entries to transition them to `APPROVED` or `REJECTED`, writing immutable entries to the `CarbonTransaction` ledger.

### 📜 Governance Command
- **Compliance Policy Acknowledgements**: Tracks policy drafts, publications, and signs them cryptographically using the employee profile context.
- **Audit Checklist Records**: Standardizes compliance checklists across departments. Identifies and flags overdue issues dynamically based on calendar scheduling.

### 🤝 Social Hub
- **CSR Activity Workspace**: Enables employees to participate in local and global CSR programs.
- **Evidence Verification**: Employees submit photographic or document-based URL evidence. Upon review, managers approve hours, which adds to the organization's composite engagement scores and credits the employee with XP.

### 🏆 Gamification & Leaderboard
- **Quest Completion Lifecycle**: Challenges grant XP rewards. When a challenge is marked complete, the system updates the employee's total accumulated XP.
- **Rewards Redemption Bazaar**: Deducts XP from the employee balance, decreases item stock, and triggers an approval card for delivery.
- **Real-Time Rankings**: Renders department and employee rank leaderboards directly from database aggregations.

---

## 🚀 Setup & Execution Guide

### Prerequisites
- **Node.js** (v18.x or above)
- **PostgreSQL** (v15.x or above)
- **NPM** (v9.x or above)

---

### Step 1: Clone and Dependencies Installation
Install dependencies for both projects:
```bash
# Backend installation
cd backend
npm install

# Frontend installation
cd ../frontend
npm install
```

---

### Step 2: Database Configuration
1. Make sure your local PostgreSQL database is running.
2. Inside `backend/`, create a `.env` file based on the environment options:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ecosphere?schema=public"
JWT_ACCESS_SECRET="ecosphere_access_secret_super_key_123"
JWT_REFRESH_SECRET="ecosphere_refresh_secret_super_key_456"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"
```

---

### Step 3: Run Database Migrations & Seeds
Generate Prisma client schemas, execute migrations to set up relational tables, and seed master directories:
```bash
cd backend

# Apply DB migrations
npm run prisma:migrate

# Seed data (Creates default users, factors, policies and challenges)
npm run seed
```

---

### Step 4: Booting Up the Platform

#### 1. Running the Backend Server
```bash
cd backend
npm run dev
```
*The backend API server launches at `http://localhost:5000`.*
*Interactive API Swagger Documentation is available at `http://localhost:5000/api/docs`.*

#### 2. Running the Frontend Server
```bash
cd frontend
npm run dev
```
*The frontend application boots at `http://localhost:5173`.*

---

## 🔧 Troubleshooting Compilation Gotchas

### 1. `ts-node` express Request compilation crashes:
If you run `npm run dev` and hit compiler type-errors like:
```text
TSError: ⨯ Unable to compile TypeScript:
src/controllers/DepartmentController.ts: error TS2339: Property 'user' does not exist on type 'Request'.
```
This happens because `ts-node` does not read custom typescript type declarations (`src/types/express.d.ts`) by default without full file loading. 

**Solution**:
We have configured `"ts-node": { "files": true }` in [`tsconfig.json`](file:///C:/Users/YUVRAJ%20KABADWAL/Downloads/EcoSphere/backend/tsconfig.json) to explicitly enable this behavior, preventing any TS compilation failures when starting nodemon.

### 2. Database authentication failures (Prisma Code `P1000`):
Ensure that the password in the `DATABASE_URL` matches your local Postgres password. If PostgreSQL is running on a port other than `5432`, update the port value accordingly in the URL.

---

## 👥 Seeding Credentials

Access the administrator control panels with the seeded root account:
- **Email**: `admin@ecosphere.com`
- **Password**: `admin123`

---

## 📄 License
Licensed under the [MIT License](LICENSE).
