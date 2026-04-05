import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ArrowLeftRight, Users, BarChart3,
  LogOut, ChevronLeft, ChevronRight, Settings, Shield, Bell
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const NAV = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/transactions", icon: ArrowLeftRight, label: "Transactions" },
  { path: "/analytics", icon: BarChart3, label: "Analytics" },
  { path: "/users", icon: Users, label: "User Management", role: "admin" },
];

const ROLE_COLORS = { admin: "badge-admin", analyst: "badge-analyst", viewer: "badge-viewer" };

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout, can } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => { await logout(); navigate("/login"); };

  return (
    <aside className={`flex flex-col h-screen sticky top-0 bg-slate-950 border-r border-slate-800/60 transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800/60">
        <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-slate-950" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-display font-bold text-slate-100 text-lg leading-none">FinVault</p>
            <p className="text-xs text-slate-500 mt-0.5">Finance Dashboard</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 transition-colors flex-shrink-0"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ path, icon: Icon, label, role }) => {
          if (role === "admin" && !can("manage_users")) return null;
          const active = location.pathname === path;
          return (
            <button key={path} onClick={() => navigate(path)} className={`w-full ${active ? "nav-link-active" : "nav-link"} ${collapsed ? "justify-center px-2" : ""}`}>
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
              {!collapsed && active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-slate-800/60">
        {!collapsed && (
          <div className="px-3 py-3 rounded-xl bg-slate-800/50 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-bold flex-shrink-0">
                {user?.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
                <span className={`${ROLE_COLORS[user?.role]} inline-block mt-0.5`}>{user?.role}</span>
              </div>
            </div>
          </div>
        )}
        <button onClick={handleLogout} className={`w-full nav-link text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 ${collapsed ? "justify-center px-2" : ""}`}>
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
