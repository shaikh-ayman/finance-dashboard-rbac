import { useState, useEffect } from "react";
import AppLayout from "../components/layout/AppLayout";
import Topbar from "../components/layout/Topbar";
import { PageLoader } from "../components/ui/index.jsx";
import { MonthlyChart, CategoryBarChart, CategoryDonut, NetBalanceLine } from "../components/charts/Charts";
import { api } from "../data/store";
import { fmt } from "../utils/format";
import { TrendingUp, TrendingDown, PieChart, BarChart2 } from "lucide-react";

export default function AnalyticsPage() {
  const [monthly, setMonthly]       = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary]       = useState(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [m, c, s] = await Promise.all([
          api.getMonthlyTrends(),
          api.getCategoryTotals(),
          api.getDashboardSummary(),
        ]);
        setMonthly(m); setCategories(c); setSummary(s);
      } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <AppLayout><Topbar title="Analytics" /><PageLoader /></AppLayout>;

  // Top income vs expense categories
  const topIncomeCats  = [...categories].sort((a,b) => b.income - a.income).slice(0,5);
  const topExpenseCats = [...categories].sort((a,b) => b.expense - a.expense).slice(0,5);

  // Best month
  const bestMonth = monthly.reduce((best, m) => m.income > (best?.income || 0) ? m : best, null);

  return (
    <AppLayout>
      <Topbar title="Analytics" subtitle="Insights & trends across your financial data" />
      <div className="p-6 space-y-6">

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Income",   value: fmt.compact(summary.totalIncome),   color: "text-emerald-400", icon: TrendingUp },
            { label: "Total Expenses", value: fmt.compact(summary.totalExpenses), color: "text-rose-400",    icon: TrendingDown },
            { label: "Net Savings",    value: fmt.compact(summary.netBalance),    color: "text-sky-400",     icon: PieChart },
            { label: "Best Month",     value: bestMonth?.monthLabel || "—",       color: "text-amber-400",   icon: BarChart2 },
          ].map(k => (
            <div key={k.label} className="card p-5">
              <div className="flex items-center gap-2 mb-2">
                <k.icon className={`w-4 h-4 ${k.color}`} />
                <span className="text-xs text-slate-500 font-medium">{k.label}</span>
              </div>
              <p className={`text-2xl font-display font-bold ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Monthly Trend + Net Balance */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="card p-6">
            <h3 className="font-display font-semibold text-slate-100 mb-1">Monthly Income vs Expenses</h3>
            <p className="text-xs text-slate-500 mb-4">Area chart showing cash flow by month</p>
            <MonthlyChart data={monthly} />
          </div>
          <div className="card p-6">
            <h3 className="font-display font-semibold text-slate-100 mb-1">Net Balance Trend</h3>
            <p className="text-xs text-slate-500 mb-4">Monthly surplus / deficit over time</p>
            <NetBalanceLine data={monthly} />
          </div>
        </div>

        {/* Category Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="card p-6">
            <h3 className="font-display font-semibold text-slate-100 mb-1">Category Comparison</h3>
            <p className="text-xs text-slate-500 mb-4">Income vs expense across top categories</p>
            <CategoryBarChart data={categories} />
          </div>
          <div className="card p-6">
            <h3 className="font-display font-semibold text-slate-100 mb-1">Spending Distribution</h3>
            <p className="text-xs text-slate-500 mb-4">Share of total by category</p>
            <CategoryDonut data={categories} />
          </div>
        </div>

        {/* Top Income / Top Expense Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top income */}
          <div className="card p-6">
            <h3 className="font-display font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Top Income Sources
            </h3>
            <div className="space-y-3">
              {topIncomeCats.map((c, i) => (
                <div key={c.category} className="flex items-center gap-3">
                  <span className="text-xs text-slate-600 w-4 font-mono">{i+1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-slate-300">{c.category}</span>
                      <span className="text-sm font-mono text-emerald-400">{fmt.compact(c.income)}</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(c.income / topIncomeCats[0].income) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top expense */}
          <div className="card p-6">
            <h3 className="font-display font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              Top Expense Categories
            </h3>
            <div className="space-y-3">
              {topExpenseCats.map((c, i) => (
                <div key={c.category} className="flex items-center gap-3">
                  <span className="text-xs text-slate-600 w-4 font-mono">{i+1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-slate-300">{c.category}</span>
                      <span className="text-sm font-mono text-rose-400">{fmt.compact(c.expense)}</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(c.expense / topExpenseCats[0].expense) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly table */}
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h3 className="font-display font-semibold text-slate-100">Monthly Summary Table</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  {["Month", "Income", "Expenses", "Net Balance", "Savings Rate"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...monthly].reverse().map(m => {
                  const net = m.income - m.expense;
                  const rate = m.income > 0 ? ((net / m.income) * 100).toFixed(1) : "0.0";
                  return (
                    <tr key={m.month} className="table-row">
                      <td className="px-5 py-3 text-sm font-medium text-slate-200">{m.monthLabel}</td>
                      <td className="px-5 py-3 text-sm font-mono text-emerald-400">{fmt.currency(m.income)}</td>
                      <td className="px-5 py-3 text-sm font-mono text-rose-400">{fmt.currency(m.expense)}</td>
                      <td className={`px-5 py-3 text-sm font-mono font-semibold ${net >= 0 ? "text-sky-400" : "text-rose-400"}`}>{fmt.currency(net)}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${parseFloat(rate) > 20 ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                          {rate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
