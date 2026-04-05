export const fmt = {
  currency: (val) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val),
  date: (str) =>
    new Date(str).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
  shortDate: (str) =>
    new Date(str).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
  percent: (val, total) =>
    total ? ((val / total) * 100).toFixed(1) + "%" : "0%",
  compact: (val) =>
    val >= 1_00_000
      ? `₹${(val / 1_00_000).toFixed(1)}L`
      : val >= 1_000
      ? `₹${(val / 1_000).toFixed(1)}K`
      : `₹${val}`,
};
