import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Filter, Edit2, Trash2, ChevronLeft, ChevronRight, X } from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import Topbar from "../components/layout/Topbar";
import { TypeBadge, PageLoader, EmptyState, ConfirmDialog, Guard } from "../components/ui/index.jsx";
import TransactionModal from "../components/ui/TransactionModal";
import { api, CATEGORIES } from "../data/store";
import { fmt } from "../utils/format";
import { useAuth } from "../context/AuthContext";

export default function TransactionsPage() {
  const [data, setData]       = useState([]);
  const [meta, setMeta]       = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTx, setEditTx]   = useState(null);
  const [deleteTx, setDeleteTx] = useState(null);
  const [toast, setToast]     = useState("");
  const { can } = useAuth();

  // Filters
  const [filters, setFilters] = useState({ type: "", category: "", search: "", page: 1 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getTransactions({ ...filters, limit: 10 });
      setData(res.data); setMeta({ total: res.total, page: res.page, totalPages: res.totalPages });
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleSaved  = () => { load(); showToast(editTx ? "Transaction updated!" : "Transaction created!"); };
  const handleDelete = async () => {
    if (!deleteTx) return;
    await api.deleteTransaction(deleteTx.id);
    load(); showToast("Transaction deleted.");
  };

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v, page: 1 }));
  const clearFilters = () => setFilters({ type: "", category: "", search: "", page: 1 });
  const hasFilters = filters.type || filters.category || filters.search;

  return (
    <AppLayout>
      <Topbar title="Transactions" subtitle={`${meta.total} total records`} />
      <div className="p-6 space-y-4">

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 bg-emerald-500 text-slate-950 font-semibold px-5 py-3 rounded-xl shadow-xl z-50 animate-slide-up">
            {toast}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center flex-1">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                className="input-field pl-9 w-56"
                placeholder="Search..."
                value={filters.search}
                onChange={e => setFilter("search", e.target.value)}
              />
            </div>
            {/* Type filter */}
            <select value={filters.type} onChange={e => setFilter("type", e.target.value)} className="input-field w-36">
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            {/* Category filter */}
            <select value={filters.category} onChange={e => setFilter("category", e.target.value)} className="input-field w-40">
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 px-3 py-2 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
          <Guard action="create">
            <button onClick={() => { setEditTx(null); setModalOpen(true); }} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Transaction
            </button>
          </Guard>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
              {["Date", "Description", "Party", "Category", "Type", "Amount", ""].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="py-16 text-center"><span className="text-slate-500 text-sm">Loading...</span></td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan={7}><EmptyState title="No transactions found" subtitle="Try adjusting your filters or create a new transaction" /></td></tr>
                ) : data.map(tx => (
                  <tr key={tx.id} className="table-row">
                    <td className="px-5 py-3.5 text-sm text-slate-400 font-mono whitespace-nowrap">{fmt.date(tx.date)}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-200 max-w-[200px] truncate">{tx.description || "—"}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-300">{tx.recipient || "—"}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-300">{tx.category}</td>
                    <td className="px-5 py-3.5"><TypeBadge type={tx.type} /></td>
                    <td className="px-5 py-3.5">
                      <span className={`font-mono font-semibold text-sm ${tx.type === "income" ? "text-emerald-400" : "text-rose-400"}`}>
                        {tx.type === "income" ? "+" : "−"}{fmt.currency(tx.amount)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        <Guard action="update">
                          <button onClick={() => { setEditTx(tx); setModalOpen(true); }}
                            className="w-8 h-8 rounded-lg hover:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-200 transition-colors">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </Guard>
                        <Guard action="delete">
                          <button onClick={() => setDeleteTx(tx)}
                            className="w-8 h-8 rounded-lg hover:bg-rose-500/10 flex items-center justify-center text-slate-500 hover:text-rose-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </Guard>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between">
              <p className="text-xs text-slate-500">Showing {(meta.page - 1) * 10 + 1}–{Math.min(meta.page * 10, meta.total)} of {meta.total}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setFilter("page", meta.page - 1)} disabled={meta.page === 1}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 flex items-center justify-center transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-slate-400">{meta.page} / {meta.totalPages}</span>
                <button onClick={() => setFilter("page", meta.page + 1)} disabled={meta.page === meta.totalPages}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 flex items-center justify-center transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <TransactionModal
        open={modalOpen} onClose={() => { setModalOpen(false); setEditTx(null); }}
        onSaved={handleSaved} editData={editTx}
      />
      <ConfirmDialog
        open={!!deleteTx} onClose={() => setDeleteTx(null)}
        onConfirm={handleDelete}
        title="Delete Transaction"
        message={`Are you sure you want to delete "${deleteTx?.description || deleteTx?.category}"? This cannot be undone.`}
        confirmLabel="Delete" danger
      />
    </AppLayout>
  );
}
