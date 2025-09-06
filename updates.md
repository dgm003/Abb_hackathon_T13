# ABB_Hackathon_project– Project Overview

## 📌 Introduction
 ABB_Hackathon_project is a full-stack project built with:
- **Backend:** .NET 8 Web API (C#)
- **Frontend:** Angular 17
- **Containerization:** Docker & Docker Compose
- **Deployment Target:** Multi-service Docker environment

The goal is to provide a modular backend API with a modern Angular frontend, both containerized and orchestrated together.

---

## ✅ Current State

### 1. Project Structure 
ABB_Hackathon_project/
│── backend-dotnet/ # .NET 8 Web API
│ ├── Controllers/ # API endpoints (Data, Health, ML)
│ ├── Models/ # DTOs (DataSummary, SimulationRequest, etc.)
│ ├── Services/ # Business logic (CSV Parser, ML Service)
│ ├── Program.cs # Startup and routing
│ ├── appsettings.json # Config
│ └── Dockerfile # Backend container definition
│
│── frontend-angular/ # Angular 17 app
│ ├── src/ # Angular source (components, styles, etc.)
│ ├── angular.json # Angular CLI config
│ ├── package.json # Dependencies
│ └── Dockerfile # Frontend container definition
│
│── docker-compose.yaml # Orchestration for frontend + backend


---

### 2. Backend (.NET 8 API)
- RESTful API with controllers:
  - `HealthController` → `/health` endpoint for container health check.
  - `DataController` → Handles data parsing/summarization.
  - `MLController` → Placeholder for ML-related APIs.
- Services include:
  - `CsvParserService` → Reads CSV files.
  - `FileService` → File operations.
  - `MLService` → Stub for machine learning workflows.
- Models define API request/response DTOs.
- Dockerized with a **multi-stage build**:
  - Build using `mcr.microsoft.com/dotnet/sdk:8.0`
  - Run using `mcr.microsoft.com/dotnet/aspnet:8.0`

---

### 3. Frontend (Angular 17)
- Proper Angular CLI workspace generated:
  - `src/app/` with root `AppComponent`.
  - Config files (`angular.json`, `tsconfig.json`, etc.).
- Dockerfile uses:
  - **Node 20 Alpine** → install & build Angular app.
  - **Nginx Alpine** → serves the built app from `/usr/share/nginx/html`.
- Production build: `npm run build --configuration production`

---

### 4. Docker & Compose
- `docker-compose.yaml` orchestrates backend + frontend.
- A custom Docker network ensures both containers can communicate.
- Backend is exposed on its own port, frontend served via Nginx.
- Current issues with Docker network (`enable_ipv4`) were resolved by recreating the network.

---

## 🚧 Next Steps
1. **Test Containers:**
   - Run backend → confirm `/health` works.
   - Run frontend → confirm Angular app loads.
2. **Connect Frontend → Backend:**
   - Update Angular `environment.ts` with backend API URL.
   - Ensure correct service discovery inside Docker Compose.
3. **Add Database (Optional, Future Step):**
   - If persistence is needed, add PostgreSQL/MongoDB service.
4. **CI/CD Setup (Future):**
   - GitHub Actions or Azure DevOps pipelines for build/test/deploy.

---

## 💡 Usage
- Build services:
  ```bash
  docker-compose build

Run all services:
docker-compose up

Access:

Backend API → http://localhost:<backend-port>/health

Frontend → http://localhost:<frontend-port>/

📖 Summary

At this stage, IntelliInspect has:

A working backend API in .NET 8

A working Angular frontend served with Nginx

Dockerized infrastructure with multi-service orchestration

Clean base for extending features (DB integration, API expansion, frontend integration)


---

👉 My suggestion:  
- Save this as `PROJECT_OVERVIEW.md` at the **root of your repo**.  
- Then tell Cursor: *“Read the PROJECT_OVERVIEW.md for full project context”*.  

That way it has **all context in one place** and won’t keep asking you for scattered details.  

---

Do you want me to also prepare a **`README.md` (simpler version for GitHub repo)**, or just keep this detailed one for Cursor/internal documentation?
