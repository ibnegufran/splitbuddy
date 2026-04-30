import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import DashboardOverviewPage from "./pages/dashboard/DashboardOverviewPage";
import ExpensesPage from "./pages/dashboard/ExpensesPage";
import GroupsPage from "./pages/dashboard/GroupsPage";
import MembersPage from "./pages/dashboard/MembersPage";
import SettlementsPage from "./pages/dashboard/SettlementsPage";

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthPage mode="signup" />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthPage mode="login" />} />
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardOverviewPage />} />
        <Route path="groups" element={<GroupsPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="members" element={<MembersPage />} />
        <Route path="settlements" element={<SettlementsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
