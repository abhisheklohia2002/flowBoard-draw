# FlowBoard Frontend

Production-style React + Vite + TypeScript frontend for a mini draw.io-style diagram builder.

## Stack

- React + Vite + TypeScript
- React Flow (`@xyflow/react`) for canvas/nodes/edges
- TailwindCSS + shadcn-style local UI components
- Axios with `withCredentials: true` for HttpOnly cookie auth
- TanStack Query for server state
- Zustand for local UI/canvas state
- Sonner for toast notifications
- Lucide React icons

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Update `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Your Go backend must allow credentials in CORS and set cookies correctly.

## Backend APIs expected

Auth:

```txt
POST /api/user/register
POST /api/user/login
POST /api/user/logout
GET  /api/user/me
```

Projects:

```txt
GET  /api/projects
POST /api/projects
```

Diagrams:

```txt
POST /api/projects/:projectID/diagrams
GET  /api/projects/:projectID/diagrams
GET  /api/diagrams/:diagramID/canvas
PUT  /api/diagrams/:diagramID/save
GET  /api/diagrams/:diagramID/versions
POST /api/diagrams/:diagramID/versions/:versionID/restore
```
