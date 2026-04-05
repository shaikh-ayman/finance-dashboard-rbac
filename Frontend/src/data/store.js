import client, { saveToken } from "../api/client";

export const ROLES = { ADMIN: "admin", ANALYST: "analyst", VIEWER: "viewer" };

export const PERMISSIONS = {
  admin: ["read", "create", "update", "delete", "manage_users"],
  analyst: ["read"],
  viewer: ["read"]
};

export const CATEGORIES = [
  "Salary", "Freelance", "Investment", "Rental", "Bonus",
  "Rent", "Groceries", "Transport", "Utilities", "Healthcare",
  "Education", "Entertainment", "Software", "Marketing", "Operations"
];

const buildAvatar = (name = "", fallback = "") => {
  const initials = name.split(" ").map((segment) => segment[0] || "").join("").slice(0, 2).toUpperCase();
  return initials || fallback.slice(0, 2).toUpperCase();
};

const mapUser = (user) => ({
  ...user,
  status: user.is_active ? "active" : "inactive",
  avatar: buildAvatar(user.name, user.email),
  createdAt: user.created_at ?? new Date().toISOString()
});

const mapRecord = (record) => ({
  ...record,
  recipient: record.recipient || "",
  description: record.description || "",
});

const transformRecordsResponse = (payload) => {
  return {
    ...payload,
    data: payload.data.map(mapRecord)
  };
};

const mapCategory = (category) => ({
  ...category,
  income: Number(category.income ?? 0),
  expense: Number(category.expense ?? 0)
});

export const api = {
  login: (email, password) => client.post("/users/login", { email, password }).then((res) => res.data),
  requestOtp: (email, role) => client.post("/auth/request-otp", { email, role }).then((res) => res.data),
  verifyOtp: (email, otp, role) => client.post("/auth/verify-otp", { email, otp, role }).then((res) => res.data),
  logout: () => {
    saveToken(null);
    return Promise.resolve();
  },
  getCurrentUser: () => client.get("/users/me").then((res) => mapUser(res.data)),
  getUsers: () => client.get("/users").then((res) => res.data.map(mapUser)),
  createUser: (payload) => {
    const body = {
      name: payload.name,
      email: payload.email,
      role: payload.role,
      is_active: payload.status !== "inactive",
      password: payload.password || "password"
    };
    return client.post("/users", body).then((res) => mapUser(res.data));
  },
  updateUser: (id, payload) => {
    const body = {
      name: payload.name,
      email: payload.email,
      role: payload.role,
      is_active: payload.status !== "inactive"
    };
    return client.put(`/users/${id}`, body).then((res) => mapUser(res.data));
  },
  deleteUser: (id) => client.delete(`/users/${id}`).then((res) => res.data),

  getDashboardSummary: () => client.get("/dashboard/summary").then((res) => res.data),
  getCategoryTotals: () => client.get("/dashboard/category-wise").then((res) => res.data.map(mapCategory)),
  getMonthlyTrends: () => client.get("/dashboard/monthly-trends").then((res) => res.data),
  getRecentActivity: (limit = 5) => client.get("/dashboard/recent", { params: { limit } }).then((res) => res.data.map(mapRecord)),

  getTransactions: (filters = {}) => {
    const params = {
      type: filters.type || undefined,
      category: filters.category || undefined,
      search: filters.search || undefined,
      page: filters.page || 1,
      limit: filters.limit || 10
    };
    if (filters.startDate) params.start_date = filters.startDate;
    if (filters.endDate) params.end_date = filters.endDate;
    return client.get("/records", { params }).then((res) => transformRecordsResponse(res.data));
  },
  deleteTransaction: (id) => client.delete(`/records/${id}`).then((res) => res.data),
  createTransaction: (payload) => {
    const body = {
      amount: payload.amount,
      type: payload.type,
      category: payload.category,
      date: payload.date,
      recipient: payload.recipient || "",
      description: payload.description || ""
    };
    return client.post("/records", body).then((res) => mapRecord(res.data));
  },
  updateTransaction: (id, payload) => {
    const body = {
      amount: payload.amount,
      type: payload.type,
      category: payload.category,
      date: payload.date,
      recipient: payload.recipient || "",
      description: payload.description || ""
    };
    return client.put(`/records/${id}`, body).then((res) => mapRecord(res.data));
  }
};
