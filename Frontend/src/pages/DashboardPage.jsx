import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Wallet, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import Topbar from "../components/layout/Topbar";
import { StatCard, PageLoader } from "../components/ui/index.jsx";
import { MonthlyChart, CategoryDonut } from "../components/charts/Charts";
import { api } from "../data/store";
import { fmt } from "../utils/format";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [recent, setRecent]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [s, m, c, r] = await Promise.all([
          api.getDashboardSummary(),
          api.getMonthlyTrends(),
          api.getCategoryTotals(),
          api.getRecentActivity(6),
        ]);
        setSummary(s); setMonthly(m); setCategories(c); setRecent(r);
      } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <AppLayout><Topbar title="Dashboard" /><PageLoader /></AppLayout>;

  const savingsRate = summary ? ((summary.netBalance / summary.totalIncome) * 100).toFixed(1) : 0;

  return (
    <AppLayout>
      <Topbar
        title={`Good day, ${user?.name?.split(" ")[0]} 👋`}
        subtitle="Here's your financial overview"
      />
      <div className="p-6 space-y-6">

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Income"    value={fmt.compact(summary.totalIncome)}   icon={TrendingUp}   color="emerald" trend={8.2} />
          <StatCard label="Total Expenses"  value={fmt.compact(summary.totalExpenses)} icon={TrendingDown} color="rose"    trend={-3.1} />
          <StatCard label="Net Balance"     value={fmt.compact(summary.netBalance)}    icon={Wallet}       color="sky"     />
          <StatCard label="Transactions"    value={summary.transactionCount}           icon={Activity}     color="amber"
            sub={`Savings rate: ${savingsRate}%`}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Monthly Trend */}
          <div className="xl:col-span-2 card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-semibold text-slate-100">Income vs Expenses</h3>
                <p className="text-xs text-slate-500 mt-0.5">Monthly breakdown</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />Income</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />Expense</span>
              </div>
            </div>
            <MonthlyChart data={monthly} />
          </div>

          {/* Category Donut */}
          <div className="card p-6">
            <div className="mb-2">
              <h3 className="font-display font-semibold text-slate-100">By Category</h3>
              <p className="text-xs text-slate-500 mt-0.5">Spending distribution</p>
            </div>
            <CategoryDonut data={categories} />
          </div>
        </div>

        {/* Recent Activity + Category Summary */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Recent Activity */}
          <div className="card p-6">
            <h3 className="font-display font-semibold text-slate-100 mb-4">Recent Activity</h3>
            <div className="space-y-1">
              {recent.map(tx => (
                <div key={tx.id} className="flex items-center gap-3 py-2.5 border-b border-slate-800/60 last:border-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.type === "income" ? "bg-emerald-500/10" : "bg-rose-500/10"}`}>
                    {tx.type === "income"
                      ? <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                      : <ArrowDownRight className="w-4 h-4 text-rose-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 truncate">{tx.description || tx.category}</p>
                    <p className="text-xs text-slate-500">{tx.category} · {fmt.shortDate(tx.date)}</p>
                  </div>
                  <span className={`text-sm font-mono font-semibold ${tx.type === "income" ? "text-emerald-400" : "text-rose-400"}`}>
                    {tx.type === "income" ? "+" : "-"}{fmt.compact(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Category Summary Table */}
          <div className="card p-6">
            <h3 className="font-display font-semibold text-slate-100 mb-4">Category Breakdown</h3>
            <div className="space-y-3">
              {categories.slice(0, 7).map((cat) => {
                const total = cat.income + cat.expense;
                const maxTotal = categories[0] ? categories[0].income + categories[0].expense : 1;
                const pct = (total / maxTotal) * 100;
                return (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-300">{cat.category}</span>
                      <span className="text-sm font-mono text-slate-400">{fmt.compact(total)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
