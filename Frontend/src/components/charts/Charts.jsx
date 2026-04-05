import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, Area, AreaChart, ComposedChart
} from "recharts";

const PALETTE = ["#10b981","#f43f5e","#38bdf8","#f59e0b","#a78bfa","#fb923c","#34d399","#e879f9"];

// ── Custom Tooltip ────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs text-slate-400 mb-2 font-medium">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="font-mono font-medium text-slate-100">₹{p.value?.toLocaleString("en-IN")}</span>
        </div>
      ))}
    </div>
  );
};

// ── Monthly Bar / Area Chart ──────────────────────────────────
export function MonthlyChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
        <defs>
          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis dataKey="monthLabel" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+"K" : v}`} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="income"  name="Income"  stroke="#10b981" fill="url(#incomeGrad)"  strokeWidth={2} dot={{ fill: "#10b981", r: 3 }} />
        <Area type="monotone" dataKey="expense" name="Expense" stroke="#f43f5e" fill="url(#expenseGrad)" strokeWidth={2} dot={{ fill: "#f43f5e", r: 3 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ── Category Bar Chart ────────────────────────────────────────
export function CategoryBarChart({ data }) {
  const top = data.slice(0, 8);
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={top} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
        <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
        <YAxis type="category" dataKey="category" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} width={60} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="income"  name="Income"  fill="#10b981" radius={[0,4,4,0]} />
        <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[0,4,4,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Donut Chart ───────────────────────────────────────────────
const RADIAN = Math.PI / 180;
const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  return (
    <text x={cx + r * Math.cos(-midAngle * RADIAN)} y={cy + r * Math.sin(-midAngle * RADIAN)} fill="#fff" fontSize={11} textAnchor="middle" dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function CategoryDonut({ data }) {
  const chartData = data.slice(0, 7).map(d => ({ name: d.category, value: d.income + d.expense }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={chartData} cx="50%" cy="50%" innerRadius={65} outerRadius={100} dataKey="value" labelLine={false} label={renderLabel}>
          {chartData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
        </Pie>
        <Tooltip formatter={(v) => [`₹${v.toLocaleString("en-IN")}`, "Total"]} contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 12, fontSize: 13 }} />
        <Legend formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── Net Balance Line ──────────────────────────────────────────
export function NetBalanceLine({ data }) {
  const withNet = data.map(d => ({ ...d, net: d.income - d.expense }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={withNet} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
        <defs>
          <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#38bdf8" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis dataKey="monthLabel" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+"K" : v}`} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="net" name="Net Balance" stroke="#38bdf8" fill="url(#netGrad)" strokeWidth={2} dot={{ fill: "#38bdf8", r: 3 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
