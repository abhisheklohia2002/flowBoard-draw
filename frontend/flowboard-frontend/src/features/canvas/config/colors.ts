export interface NodeColor {
  name: string;
  bg: string;
  border: string;
  text: string;
}

export const NODE_COLORS: NodeColor[] = [
  {
    name: "Slate",
    bg: "#0f172a",
    border: "#64748b",
    text: "#f8fafc",
  },
  {
    name: "Cyan",
    bg: "#082f49",
    border: "#38bdf8",
    text: "#e0f2fe",
  },
  {
    name: "Emerald",
    bg: "#052e2b",
    border: "#34d399",
    text: "#ecfdf5",
  },
  {
    name: "Violet",
    bg: "#2e1065",
    border: "#a78bfa",
    text: "#f5f3ff",
  },
  {
    name: "Amber",
    bg: "#422006",
    border: "#f59e0b",
    text: "#fffbeb",
  },
  {
    name: "Rose",
    bg: "#4c0519",
    border: "#fb7185",
    text: "#fff1f2",
  },
];