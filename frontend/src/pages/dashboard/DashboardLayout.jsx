import { useState } from "react";
import { Outlet } from "react-router-dom";
import SidebarNav from "../../components/dashboard/SidebarNav";
import { useAuth } from "../../context/AuthContext";
import { DashboardProvider, useDashboard } from "../../context/DashboardContext";

const DashboardShell = () => {
  const { user, logout } = useAuth();
  const { error, setError } = useDashboard();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1400px] px-4 py-6 md:px-6">
      {error ? (
        <div className="mb-4 flex items-center justify-between rounded-lg bg-rose-500/20 px-4 py-3 text-sm text-rose-200">
          <span>{error}</span>
          <button className="btn-secondary px-3 py-1" onClick={() => setError("")} type="button">
            Dismiss
          </button>
        </div>
      ) : null}

      <button className="btn-secondary mb-4 lg:hidden" onClick={() => setSidebarOpen(true)} type="button">
        Open Menu
      </button>

      <section className="grid gap-6 lg:grid-cols-[290px,1fr]">
        <SidebarNav
          onClose={() => setSidebarOpen(false)}
          onLogout={logout}
          open={sidebarOpen}
          userName={user?.name}
        />
        <div className="space-y-6">
          <Outlet />
        </div>
      </section>
    </main>
  );
};

const DashboardLayout = () => {
  return (
    <DashboardProvider>
      <DashboardShell />
    </DashboardProvider>
  );
};

export default DashboardLayout;
