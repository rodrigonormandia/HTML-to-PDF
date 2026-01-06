# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PDF Gravity is an HTML-to-PDF conversion web application. Users paste HTML code in a text area and can either preview or download the generated PDF.

**Developer:** Rodrigo Normandia

## Architecture

**Frontend (React + Vite + TypeScript)**
- Located in `/frontend`
- Uses TailwindCSS v4 for styling
- i18next for internationalization (Portuguese-BR is the default/fallback language)
- Axios for API calls to the backend
- Single-page app with one main component (`App.tsx`)

**Backend (Python + FastAPI)**
- Located in `/backend`
- Uses WeasyPrint for PDF generation (requires GTK3 system dependencies)
- Single endpoint: `POST /api/convert` accepts `html_content` and `action` (preview/download)
- Automatically injects TailwindCSS CDN and wraps bare HTML in a proper document structure
- API documentation available at `/api/docs` (Swagger UI) and `/api/redoc` (ReDoc)

## Production URLs

| Resource | URL |
|----------|-----|
| Application | https://htmltopdf.buscarid.com |
| API Docs (Swagger) | https://htmltopdf.buscarid.com/api/docs |
| API Docs (ReDoc) | https://htmltopdf.buscarid.com/api/redoc |
| Portainer | https://portainer.buscarid.com |
| GitHub Actions | https://github.com/EngenhariaBucarId/HTML-to-PDF-Antigravity/actions |

## Development Commands

### Frontend
```bash
cd frontend
npm install      # Install dependencies
npm run dev      # Start dev server (port 5173)
npm run build    # Build for production (tsc + vite build)
npm run lint     # Run ESLint
```

### Backend
```bash
# Recommended: Use Docker (WeasyPrint requires GTK3 which is complex to install on Windows)
docker compose up

# Or locally with Python virtual environment:
cd backend
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```

### Full Stack (Docker)
```bash
docker compose up        # Starts both frontend (5173) and backend (8000)
```

## Deployment (CI/CD)

### Pipeline
```
Git Push (main) → GitHub Actions → Docker Hub → Portainer (manual update)
```

### Docker Images
- `normandiabuscarid/pdf-gravity-api:latest`
- `normandiabuscarid/pdf-gravity-web:latest`

### Deploy Process
1. Push changes to `main` branch
2. GitHub Actions builds and pushes images to Docker Hub (~2 min)
3. In Portainer: **Stacks** → **pdf-gravity** → **Update the stack** with **"Re-pull image"**

See `DEPLOY.md` for detailed deployment documentation.

## Key Implementation Details

- Backend PDF generation gracefully handles missing WeasyPrint dependencies with a warning
- The API injects TailwindCSS CDN into HTML if not already present
- Environment variable `VITE_API_URL` configures the backend URL (defaults to `http://localhost:8000`)
- Version is displayed in the footer (`frontend/src/App.tsx`)

## Workflow Rules (IMPORTANT)

When working with this repository, follow these rules:

1. **Commit** - Only commit after user approval
2. **Push** - Only push after user approval
3. **Version** - Update version in footer (`App.tsx`) and commit message on every push
4. **Server restart** - Always ask if the user wants to restart the server when changes require it

## Adding New Translations

Add translation files in `/frontend/src/locales/{locale}/translation.json` and register them in `/frontend/src/i18n.ts`.

## Important Files

| File | Description |
|------|-------------|
| `docker-compose.prod.yml` | Production stack for Portainer/Swarm |
| `.github/workflows/build-and-push.yml` | CI/CD workflow |
| `frontend/src/App.tsx` | Main frontend component (version in footer) |
| `backend/main.py` | API endpoints and documentation |
| `DEPLOY.md` | Deployment documentation |
