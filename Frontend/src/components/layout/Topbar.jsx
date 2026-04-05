import { Bell, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Topbar({ title, subtitle }) {
  const { user } = useAuth();
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
      <div>
        <h1 className="font-display text-xl font-semibold text-slate-100">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
        </button>
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-bold">
            {user?.avatar}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-200 leading-none">{user?.name}</p>
            <p className="text-xs text-slate-500 mt-0.5 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
