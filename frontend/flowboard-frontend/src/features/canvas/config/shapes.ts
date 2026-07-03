import {
  Box,
  Circle,
  Database,
  Diamond,
  Globe,
  Layers,
  Server,
  Square,
  Triangle,
  Workflow,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ShapeType =
  | "rectangle"
  | "rounded"
  | "circle"
  | "diamond"
  | "triangle"
  | "service"
  | "database"
  | "api"
  | "queue"
  | "process";

export interface ShapeDefinition {
  type: ShapeType;
  label: string;
  category: "Basic" | "Backend" | "System Design";
  icon: LucideIcon;
  defaultColor: string;
  borderColor: string;
  textColor: string;
}

export const SHAPES: ShapeDefinition[] = [
  {
    type: "rectangle",
    label: "Rectangle",
    category: "Basic",
    icon: Square,
    defaultColor: "#0f172a",
    borderColor: "#64748b",
    textColor: "#f8fafc",
  },
  {
    type: "rounded",
    label: "Rounded Box",
    category: "Basic",
    icon: Box,
    defaultColor: "#111827",
    borderColor: "#94a3b8",
    textColor: "#f8fafc",
  },
  {
    type: "circle",
    label: "Circle",
    category: "Basic",
    icon: Circle,
    defaultColor: "#1e1b4b",
    borderColor: "#818cf8",
    textColor: "#eef2ff",
  },
  {
    type: "diamond",
    label: "Decision",
    category: "Basic",
    icon: Diamond,
    defaultColor: "#422006",
    borderColor: "#f59e0b",
    textColor: "#fffbeb",
  },
  {
    type: "triangle",
    label: "Triangle",
    category: "Basic",
    icon: Triangle,
    defaultColor: "#3f1d2b",
    borderColor: "#fb7185",
    textColor: "#fff1f2",
  },
  {
    type: "service",
    label: "Service",
    category: "Backend",
    icon: Server,
    defaultColor: "#052e2b",
    borderColor: "#34d399",
    textColor: "#ecfdf5",
  },
  {
    type: "database",
    label: "Database",
    category: "Backend",
    icon: Database,
    defaultColor: "#082f49",
    borderColor: "#38bdf8",
    textColor: "#e0f2fe",
  },
  {
    type: "api",
    label: "API Gateway",
    category: "System Design",
    icon: Globe,
    defaultColor: "#172554",
    borderColor: "#60a5fa",
    textColor: "#eff6ff",
  },
  {
    type: "queue",
    label: "Queue",
    category: "System Design",
    icon: Layers,
    defaultColor: "#312e81",
    borderColor: "#a78bfa",
    textColor: "#f5f3ff",
  },
  {
    type: "process",
    label: "Process",
    category: "System Design",
    icon: Workflow,
    defaultColor: "#431407",
    borderColor: "#fb923c",
    textColor: "#fff7ed",
  },
];