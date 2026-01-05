# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PDF Gravity is an HTML-to-PDF conversion web application. Users paste HTML code in a text area and can either preview or download the generated PDF.

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

## Key Implementation Details

- Backend PDF generation gracefully handles missing WeasyPrint dependencies with a warning
- The API injects TailwindCSS CDN into HTML if not already present
- Environment variable `VITE_API_URL` configures the backend URL (defaults to `http://localhost:8000`)
- Render.yaml is configured for deployment on Render (backend as Docker, frontend as static site)

## Adding New Translations

Add translation files in `/frontend/src/locales/{locale}/translation.json` and register them in `/frontend/src/i18n.ts`.
