import { Routes, Route } from "react-router-dom";
import { SettingsProvider } from "@/context/SettingsContext";
import { DataProvider } from "@/context/DataContext";
import { AuthProvider } from "@/context/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { RequireAuth, RequirePermission } from "@/components/layout/Guards";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import IntakePage from "@/pages/IntakePage";
import SettingsPage from "@/pages/SettingsPage";
import ProjectWorkspacePage from "@/pages/ProjectWorkspacePage";
import NotFoundPage from "@/pages/NotFoundPage";

export default function App() {
  return (
    <SettingsProvider>
      <DataProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              element={
                <RequireAuth>
                  <AppLayout />
                </RequireAuth>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="new" element={<IntakePage />} />
              <Route path="projects/:id" element={<ProjectWorkspacePage />} />
              <Route
                path="settings"
                element={
                  <RequirePermission permission="manage_settings">
                    <SettingsPage />
                  </RequirePermission>
                }
              />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </DataProvider>
    </SettingsProvider>
  );
}
