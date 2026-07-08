import { User } from "@/types/auth";
import { create } from "zustand";

interface AppState {
  isMobileSidebarOpen: boolean;
  setMobileSidebarOpen: (value: boolean) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (value: boolean) => void;
  user: User;
  setUser: (user: User) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isMobileSidebarOpen: false,
  user: {
    email:"",
    full_name:"",
    id:0,
    role:"",
    aiTokenValidation:0
  },
  sidebarCollapsed: false,
  setMobileSidebarOpen: (value) => set({ isMobileSidebarOpen: value }),
  toggleSidebar: () =>
    set((state) => ({
      sidebarCollapsed: !state.sidebarCollapsed,
    })),
  
  setSidebarCollapsed: (value) =>
    set({
      sidebarCollapsed: value,
    }),
  setUser: (user: User) =>
    set({
      user: user,
    }),
}));
