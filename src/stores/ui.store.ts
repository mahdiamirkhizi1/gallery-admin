import { create } from "zustand";
import { persist } from "zustand/middleware";

type DashboardPeriod = "7d" | "30d" | "1y";
type UiState = { sidebarCollapsed: boolean; dashboardPeriod: DashboardPeriod; toggleSidebar: () => void; setDashboardPeriod: (period: DashboardPeriod) => void };

export const useUiStore = create<UiState>()(persist(
  set => ({ sidebarCollapsed: false, dashboardPeriod: "30d", toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })), setDashboardPeriod: dashboardPeriod => set({ dashboardPeriod }) }),
  { name: "goldino-admin-ui", partialize: state => ({ sidebarCollapsed: state.sidebarCollapsed, dashboardPeriod: state.dashboardPeriod }) },
));
