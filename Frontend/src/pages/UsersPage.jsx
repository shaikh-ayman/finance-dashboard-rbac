import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, UserCheck, UserX, Shield, Search } from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import Topbar from "../components/layout/Topbar";
import { RoleBadge, PageLoader, EmptyState, ConfirmDialog, Alert, Modal } from "../components/ui/index.jsx";
import { api } from "../data/store";
import { fmt } from "../utils/format";
import { useAuth } from "../context/AuthContext";

const EMPTY_FORM = { name: "", email: "", role: "viewer", status: "active" };

function UserModal({ open, onClose, onSaved, editUser }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { setForm(editUser ? { ...editUser } : EMPTY_FORM); setError(""); }, [editUser, open]);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setError("");
    if (!form.name || !form.email) { setError("Name and email are required."); return; }
    if (!form.email.includes("@")) { setError("Please enter a valid email address."); return; }
    setLoading(true);
    try {
      const saved = editUser ? await api.updateUser(editUser.id, form) : await api.createUser(form);
      onSaved(saved); onClose();
    } catch (e) { setError(e.message || "Failed to save user"); }
    finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title={editUser ? "Edit User" : "Add New User"}
      footer={<><button onClick={onClose} className="btn-secondary">Cancel</button><button onClick={handleSubmit} disabled={loading} className="btn-primary">{loading ? "Saving..." : editUser ? "Update" : "Create"}</button></>}
    >
      <div className="space-y-4">
        {error && <Alert type="error" message={error} onClose={() => setError("")} />}
        <div>
          <label className="text-xs text-slate-400 font-medium mb-1.5 block">Full Name</label>
          <input className="input-field" value={form.name} onChange={e => set("name", e.target.value)} placeholder="John Doe" />
        </div>
        <div>
          <label className="text-xs text-slate-400 font-medium mb-1.5 block">Email Address</label>
          <input className="input-field" type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="john@company.com" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1.5 block">Role</label>
            <select className="input-field" value={form.role} onChange={e => set("role", e.target.value)}>
              <option value="admin">Admin</option>
              <option value="analyst">Analyst</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1.5 block">Status</label>
            <select className="input-field" value={form.status} onChange={e => set("status", e.target.value)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Role info */}
        <div className="bg-slate-800/50 rounded-xl p-3 space-y-1.5 text-xs text-slate-400">
          <p className="font-medium text-slate-300 mb-2">Role Permissions:</p>
          {[
            { role: "admin",   label: "Admin",   desc: "Full access — manage users, records, analytics" },
            { role: "analyst", label: "Analyst", desc: "Read + create/update records, view analytics" },
            { role: "viewer",  label: "Viewer",  desc: "Read-only access to dashboard and records" },
          ].map(r => (
            <div key={r.role} className={`flex items-start gap-2 px-2 py-1.5 rounded-lg transition-colors ${form.role === r.role ? "bg-slate-700/60" : ""}`}>
              <span className={`${form.role === r.role ? "text-emerald-400" : "text-slate-600"} mt-0.5`}>•</span>
              <div><span className="font-medium text-slate-300">{r.label}: </span>{r.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

export default function UsersPage() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [search, setSearch]   = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [modalOpen, setModalOpen]   = useState(false);
  const [editUser, setEditUser]     = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [toast, setToast]     = useState("");
  const { user: me, can }     = useAuth();

  const load = async () => {
    setLoading(true);
    try { const u = await api.getUsers(); setUsers(u); setError(""); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleSaved  = () => { load(); showToast(editUser ? "User updated!" : "User created!"); };
  const handleDelete = async () => {
    if (!deleteUser) return;
    try { await api.deleteUser(deleteUser.id); load(); showToast("User removed."); }
    catch (e) { setError(e.message); }
  };

  // Filter
  const filtered = users.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const stats = {
    total:    users.length,
    active:   users.filter(u => u.status === "active").length,
    admins:   users.filter(u => u.role === "admin").length,
    analysts: users.filter(u => u.role === "analyst").length,
  };

  if (!can("manage_users")) {
    return (
      <AppLayout>
        <Topbar title="User Management" />
        <div className="p-6 flex items-center justify-center h-64">
          <div className="text-center">
            <Shield className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-300 font-medium">Admin Access Required</p>
            <p className="text-slate-500 text-sm mt-1">You don't have permission to view this page.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Topbar title="User Management" subtitle="Manage users, roles, and access levels" />
      <div className="p-6 space-y-5">

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 bg-emerald-500 text-slate-950 font-semibold px-5 py-3 rounded-xl shadow-xl z-50">
            {toast}
          </div>
        )}

        {error && <Alert type="error" message={error} onClose={() => setError("")} />}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Users",   value: stats.total,    color: "text-slate-200" },
            { label: "Active",        value: stats.active,   color: "text-emerald-400" },
            { label: "Admins",        value: stats.admins,   color: "text-amber-400" },
            { label: "Analysts",      value: stats.analysts, color: "text-sky-400" },
          ].map(s => (
            <div key={s.label} className="card p-4">
              <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input className="input-field pl-9 w-52" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input-field w-36" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="analyst">Analyst</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <button onClick={() => { setEditUser(null); setModalOpen(true); }} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {loading ? <div className="py-16"><PageLoader /></div> : filtered.length === 0 ? (
            <EmptyState title="No users found" subtitle="Try adjusting your search or add a new user" />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  {["User", "Email", "Role", "Status", "Joined", "Actions"].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} className="table-row">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                          u.role === "admin" ? "bg-amber-500/15 text-amber-400" :
                          u.role === "analyst" ? "bg-sky-500/15 text-sky-400" : "bg-slate-700 text-slate-400"
                        }`}>{u.avatar}</div>
                        <div>
                          <p className="text-sm font-medium text-slate-200">{u.name}</p>
                          {u.id === me?.id && <span className="text-xs text-emerald-400">You</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-400">{u.email}</td>
                    <td className="px-5 py-3.5"><RoleBadge role={u.role} /></td>
                    <td className="px-5 py-3.5">
                      <span className={`flex items-center gap-1.5 text-xs font-medium w-fit ${u.status === "active" ? "text-emerald-400" : "text-slate-500"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === "active" ? "bg-emerald-400" : "bg-slate-600"}`} />
                        {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500 font-mono">{fmt.date(u.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditUser(u); setModalOpen(true); }}
                          className="w-8 h-8 rounded-lg hover:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-200 transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={u.id === me?.id}
                          onClick={() => setDeleteUser(u)}
                          className="w-8 h-8 rounded-lg hover:bg-rose-500/10 flex items-center justify-center text-slate-500 hover:text-rose-400 transition-colors disabled:opacity-25 disabled:cursor-not-allowed">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <UserModal open={modalOpen} onClose={() => { setModalOpen(false); setEditUser(null); }} onSaved={handleSaved} editUser={editUser} />
      <ConfirmDialog
        open={!!deleteUser} onClose={() => setDeleteUser(null)} onConfirm={handleDelete}
        title="Remove User" message={`Remove "${deleteUser?.name}" from the system? Their role and access will be revoked.`}
        confirmLabel="Remove" danger
      />
    </AppLayout>
  );
}
