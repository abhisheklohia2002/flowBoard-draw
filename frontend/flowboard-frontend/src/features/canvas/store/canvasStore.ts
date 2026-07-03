import { create } from "zustand";

interface CanvasState {
  currentDiagramID: number | null;
  selectedElementID: string | null;
  isSidebarOpen: boolean;
  isDirty: boolean;
  setCurrentDiagramID: (id: number | null) => void;
  setSelectedElementID: (id: string | null) => void;
  setSidebarOpen: (value: boolean) => void;
  setDirty: (value: boolean) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  currentDiagramID: null,
  selectedElementID: null,
  isSidebarOpen: true,
  isDirty: false,
  setCurrentDiagramID: (id) => set({ currentDiagramID: id }),
  setSelectedElementID: (id) => set({ selectedElementID: id }),
  setSidebarOpen: (value) => set({ isSidebarOpen: value }),
  setDirty: (value) => set({ isDirty: value }),
}));
