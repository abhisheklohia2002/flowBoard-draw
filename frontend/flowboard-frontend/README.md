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

## Notes

- Tokens are not stored in localStorage. Backend sends HttpOnly cookies.
- API calls do not live in TSX pages. They are in feature API modules.
- Server state belongs to TanStack Query.
- Local UI/canvas state belongs to Zustand.
- The diagram editor is an MVP. Label editing and custom node components should be added next.

## Next production improvements

1. Add proper `/api/user/me`, `/api/user/login`, `/api/user/logout` backend endpoints.
2. Add React Flow custom node components for service/database shapes.
3. Add inline node label editing.
4. Add debounced autosave.
5. Add ownership checks on the backend.
6. Add route-level error boundaries.
7. Add refresh-token retry flow only if your backend supports refresh endpoint.
