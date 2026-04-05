import { X, AlertCircle, CheckCircle, Info, Loader2, Inbox } from "lucide-react";

// ── Modal ─────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-semibold text-slate-100">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div>{children}</div>
        {footer && <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}

// ── Toast / Alert ─────────────────────────────────────────────
const ALERT_STYLES = {
  error:   { bg: "bg-rose-500/10 border-rose-500/20",   icon: AlertCircle,    text: "text-rose-400" },
  success: { bg: "bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle, text: "text-emerald-400" },
  info:    { bg: "bg-sky-500/10 border-sky-500/20",     icon: Info,           text: "text-sky-400" },
};
export function Alert({ type = "info", message, onClose }) {
  if (!message) return null;
  const { bg, icon: Icon, text } = ALERT_STYLES[type];
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${bg} ${text} text-sm animate-fade-in`}>
      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <span className="flex-1">{message}</span>
      {onClose && <button onClick={onClose} className="opacity-60 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>}
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────
export function Spinner({ size = "md", className = "" }) {
  const s = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" }[size];
  return <Loader2 className={`${s} animate-spin text-emerald-400 ${className}`} />;
}

export function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center h-full min-h-[300px]">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────
export function EmptyState({ title = "No data found", subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
        <Inbox className="w-7 h-7 text-slate-500" />
      </div>
      <p className="text-slate-300 font-medium">{title}</p>
      {subtitle && <p className="text-sm text-slate-500 mt-1 max-w-xs">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ── Confirm Dialog ────────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = "Confirm", danger = false }) {
  if (!open) return null;
  return (
    <div className="modal-overlay">
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-start gap-4 mb-5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${danger ? "bg-rose-500/10" : "bg-sky-500/10"}`}>
            <AlertCircle className={`w-5 h-5 ${danger ? "text-rose-400" : "text-sky-400"}`} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100">{title}</h3>
            <p className="text-sm text-slate-400 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }} className={danger ? "btn-danger" : "btn-primary"}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────
export function RoleBadge({ role }) {
  const cls = { admin: "badge-admin", analyst: "badge-analyst", viewer: "badge-viewer" }[role] || "badge-viewer";
  return <span className={cls}>{role}</span>;
}

export function TypeBadge({ type }) {
  return <span className={type === "income" ? "badge-income" : "badge-expense"}>{type}</span>;
}

// ── Stat Card ─────────────────────────────────────────────────
export function StatCard({ label, value, sub, icon: Icon, color = "emerald", trend }) {
  const colors = {
    emerald: { icon: "bg-emerald-500/10 text-emerald-400", accent: "text-emerald-400" },
    rose:    { icon: "bg-rose-500/10 text-rose-400",       accent: "text-rose-400" },
    sky:     { icon: "bg-sky-500/10 text-sky-400",         accent: "text-sky-400" },
    amber:   { icon: "bg-amber-500/10 text-amber-400",     accent: "text-amber-400" },
  }[color];

  return (
    <div className="stat-card group">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl ${colors.icon} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trend >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
            {trend >= 0 ? "+" : ""}{trend}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-display font-bold text-slate-100">{value}</p>
        <p className="text-sm text-slate-500 mt-0.5">{label}</p>
      </div>
      {sub && <p className="text-xs text-slate-600 border-t border-slate-800 pt-2 mt-1">{sub}</p>}
    </div>
  );
}

// ── Permission Guard ──────────────────────────────────────────
import { useAuth } from "../../context/AuthContext";
import { Lock } from "lucide-react";

export function Guard({ action, children, fallback }) {
  const { can } = useAuth();
  if (can(action)) return children;
  return fallback ?? (
    <div className="flex items-center gap-2 text-slate-500 text-sm">
      <Lock className="w-4 h-4" /> <span>Insufficient permissions</span>
    </div>
  );
}
