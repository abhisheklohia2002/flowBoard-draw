import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthPage } from "@/features/auth/pages/AuthPage";
import { ProjectsPage } from "@/features/projects/pages/ProjectsPage";
import { ProjectDetailPage } from "@/features/projects/pages/ProjectDetailPage";
import { DiagramEditorPage } from "@/features/diagrams/pages/DiagramEditorPage";
import { DashboardPage } from "@/app/DashboardPage";
import { ProtectedRoute } from "./ProtectedRoute";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/projects" replace /> },
  { path: "/auth", element: <AuthPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          // { path: "/dashboard", element: <DashboardPage /> },
          { path: "/projects", element: <ProjectsPage /> },
          { path: "/projects/:projectID", element: <ProjectDetailPage /> },
          { path: "/diagrams/:diagramID", element: <DiagramEditorPage /> },
        ],
      },
    ],
  },
]);
