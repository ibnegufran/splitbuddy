import { NavLink } from "react-router-dom";
import BrandLogo from "../BrandLogo";

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
  </svg>
);

const GroupIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ExpenseIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
  </svg>
);

const MemberIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="7" r="4" />
    <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
  </svg>
);

const SettlementIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: HomeIcon, end: true },
  { to: "/dashboard/groups", label: "Groups", icon: GroupIcon },
  { to: "/dashboard/expenses", label: "Expenses", icon: ExpenseIcon },
  { to: "/dashboard/members", label: "Members", icon: MemberIcon },
  { to: "/dashboard/settlements", label: "Settlements", icon: SettlementIcon }
];

const SidebarNav = ({ userName, onLogout, open, onClose }) => {
  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm transition lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />
      <aside
        className={`glass-panel fixed left-4 top-4 z-40 h-[calc(100vh-2rem)] w-[280px] transform overflow-y-auto p-5 transition lg:static lg:z-auto lg:h-auto lg:w-auto lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-[120%]"
        }`}
      >
        <div className="flex items-center justify-between">
          <BrandLogo />
          <button className="btn-secondary px-3 py-1.5 lg:hidden" onClick={onClose} type="button">
            Close
          </button>
        </div>

        <div className="mt-5 rounded-xl border border-white/15 bg-white/5 p-3">
          <p className="text-xs uppercase tracking-[0.16em] text-cyan-200/80">Signed In</p>
          <p className="mt-1 text-sm font-semibold text-white">{userName}</p>
        </div>

        <nav className="mt-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-400 to-blue-500 font-semibold text-slate-950"
                      : "border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                  }`
                }
              >
                <Icon />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <button className="btn-secondary mt-6 w-full" onClick={onLogout} type="button">
          Logout
        </button>
      </aside>
    </>
  );
};

export default SidebarNav;
