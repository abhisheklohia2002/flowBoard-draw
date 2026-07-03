import { create } from "zustand";

interface AppState {
  isMobileSidebarOpen: boolean;
  setMobileSidebarOpen: (value: boolean) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (value: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isMobileSidebarOpen: false,
  setMobileSidebarOpen: (value) => set({ isMobileSidebarOpen: value }),
  sidebarCollapsed: false,

  toggleSidebar: () =>
    set((state) => ({
      sidebarCollapsed: !state.sidebarCollapsed,
    })),

  setSidebarCollapsed: (value) =>
    set({
      sidebarCollapsed: value,
    }),
}));
