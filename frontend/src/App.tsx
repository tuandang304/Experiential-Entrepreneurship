import { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import { BrandProvider } from "./brand/BrandContext";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import BrandProfilePage from "./pages/BrandProfilePage";
import CalendarPage from "./pages/CalendarPage";
import ContentLibraryPage from "./pages/ContentLibraryPage";
import ContentStrategyPage from "./pages/ContentStrategyPage";
import ContentWorkspacePage from "./pages/ContentWorkspacePage";
import DashboardPage from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import NotificationsPage from "./pages/NotificationsPage";
import OnboardingPage from "./pages/OnboardingPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";
import SocialAccountPage from "./pages/SocialAccountPage";
import TrendResearchPage from "./pages/TrendResearchPage";

// Wraps an authenticated page with the auth guard and brand-selection context.
function Protected({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <BrandProvider>{children}</BrandProvider>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
        <Route path="/onboarding" element={<Protected><OnboardingPage /></Protected>} />
        <Route path="/profile" element={<Protected><ProfilePage /></Protected>} />
        <Route path="/brand-profiles" element={<Protected><BrandProfilePage /></Protected>} />
        <Route path="/strategies" element={<Protected><ContentStrategyPage /></Protected>} />
        <Route path="/social-accounts" element={<Protected><SocialAccountPage /></Protected>} />
        <Route path="/trends" element={<Protected><TrendResearchPage /></Protected>} />
        <Route path="/content" element={<Protected><ContentLibraryPage /></Protected>} />
        <Route path="/content/:id" element={<Protected><ContentWorkspacePage /></Protected>} />
        <Route path="/calendar" element={<Protected><CalendarPage /></Protected>} />
        <Route path="/analytics" element={<Protected><AnalyticsPage /></Protected>} />
        <Route path="/notifications" element={<Protected><NotificationsPage /></Protected>} />
        <Route path="/admin" element={<Protected><AdminDashboardPage /></Protected>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
