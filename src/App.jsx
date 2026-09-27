import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/layout/AdminLayout";
import MedicalLayout from "./components/layout/MedicalLayout";

import Login from "./pages/Auth/Login";
import Dashboard from "./pages/Dashboard";
import UsersList from "./pages/Users/UsersList";
import UserDetail from "./pages/Users/UserDetail";
import HeartHealthPage from "./pages/Medical/HeartHealthPage";
import MedicationsSchedulePage from "./pages/Medical/MedicationsSchedulePage";
import HealthRecordsPage from "./pages/Medical/HealthRecordsPage";
import HeartModelSubPage from "./pages/Medical/HeartModelSubPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/login" element={<Login />} />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />

              {/* User Management */}
              <Route path="users" element={<UsersList />} />
              <Route path="users/:userId" element={<UserDetail />} />

              {/* User Management -> pilih user -> Manajemen Medis (4 sub-halaman) */}
              <Route path="users/:userId/medical" element={<MedicalLayout />}>
                <Route index element={<Navigate to="heart-health" replace />} />
                <Route path="heart-health" element={<HeartHealthPage />} />
                <Route path="medications" element={<MedicationsSchedulePage />} />
                <Route path="health-records" element={<HealthRecordsPage />} />
                <Route path="heart-model" element={<HeartModelSubPage />} />
              </Route>

              <Route path="profile" element={<ProfilePage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
