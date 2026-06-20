import { create } from "zustand";

// UI-only global state (tách biệt hoàn toàn với AuthContext — auth vẫn do
// AuthProvider quản lý). Dùng cho landing header: trạng thái cuộn dùng chung
// và panel menu mobile, tránh mỗi component tự gắn listener riêng.
interface UiState {
  scrolled: boolean;
  setScrolled: (v: boolean) => void;
  mobileOpen: boolean;
  toggleMobile: () => void;
  closeMobile: () => void;
  // Sidebar (desktop) thu gọn: `sidebarCollapsed` là trạng thái ghim thủ công
  // qua nút mũi tên; `autoCollapse` (bật từ Cài đặt) cho chế độ hover-to-expand.
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  autoCollapse: boolean;
  toggleAutoCollapse: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  scrolled: false,
  // No-op nếu giá trị không đổi → tránh re-render thừa.
  setScrolled: (v) => set((s) => (s.scrolled === v ? s : { scrolled: v })),
  mobileOpen: false,
  toggleMobile: () => set((s) => ({ mobileOpen: !s.mobileOpen })),
  closeMobile: () => set({ mobileOpen: false }),
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (v) => set((s) => (s.sidebarCollapsed === v ? s : { sidebarCollapsed: v })),
  autoCollapse: false,
  toggleAutoCollapse: () => set((s) => ({ autoCollapse: !s.autoCollapse })),
}));
