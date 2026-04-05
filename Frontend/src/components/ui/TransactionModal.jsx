import { useState, useEffect } from "react";
import { Modal, Alert } from "../ui/index.jsx";
import { CATEGORIES } from "../../data/store";
import { api } from "../../data/store";

const EMPTY = {
  amount: "",
  type: "income",
  category: "",
  date: new Date().toISOString().split("T")[0],
  recipient: "",
  description: ""
};

export default function TransactionModal({ open, onClose, onSaved, editData }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(editData ? { ...editData, amount: String(editData.amount) } : EMPTY);
    setError("");
  }, [editData, open]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setError("");
    if (!form.amount || !form.category || !form.date) { setError("Amount, category, and date are required."); return; }
    if (parseFloat(form.amount) <= 0) { setError("Amount must be greater than 0."); return; }
    setLoading(true);
    try {
      const saved = editData
        ? await api.updateTransaction(editData.id, form)
        : await api.createTransaction(form);
      onSaved(saved);
      onClose();
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally { setLoading(false); }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editData ? "Edit Transaction" : "New Transaction"}
      footer={
        <>
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary disabled:opacity-50">
            {loading ? "Saving..." : editData ? "Update" : "Create"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {error && <Alert type="error" message={error} onClose={() => setError("")} />}

        {/* Amount + Type */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block font-medium">Amount (₹)</label>
            <input
              type="number" min="0" step="0.01"
              value={form.amount} onChange={e => set("amount", e.target.value)}
              className="input-field" placeholder="0.00"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block font-medium">Type</label>
            <div className="flex gap-2">
              {["income", "expense"].map(t => (
                <button
                  key={t} onClick={() => set("type", t)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                    form.type === t
                      ? t === "income"
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                        : "bg-rose-500/15 border-rose-500/40 text-rose-400"
                      : "border-slate-700 text-slate-500 hover:border-slate-600"
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="text-xs text-slate-400 mb-1.5 block font-medium">Category</label>
          <select value={form.category} onChange={e => set("category", e.target.value)} className="input-field">
            <option value="">Select category...</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Recipient */}
        <div>
          <label className="text-xs text-slate-400 mb-1.5 block font-medium">Recipient / Party</label>
          <input
            type="text"
            value={form.recipient}
            onChange={e => set("recipient", e.target.value)}
            className="input-field"
            placeholder="Who is this payment to/from?"
          />
        </div>

        {/* Date */}
        <div>
          <label className="text-xs text-slate-400 mb-1.5 block font-medium">Date</label>
          <input type="date" value={form.date} onChange={e => set("date", e.target.value)} className="input-field" />
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs text-slate-400 mb-1.5 block font-medium">Notes / Description</label>
          <textarea
            rows={3} value={form.description} onChange={e => set("description", e.target.value)}
            className="input-field resize-none" placeholder="Optional description..."
          />
        </div>
      </div>
    </Modal>
  );
}
