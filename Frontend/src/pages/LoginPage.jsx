import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ROLE_TABS = [
  { id: "admin", label: "Admin", subtitle: "Full access — manage users, records, analytics" },
  { id: "analyst", label: "Analyst", subtitle: "Create/update records, view analytics (OTP)", otp: true },
  { id: "viewer", label: "Viewer", subtitle: "Dashboard + read-only access via OTP", otp: true },
];

const DEMO_ACCOUNTS = {
  admin: { email: "admin@example.com", role: "admin" },
  analyst: { email: "analyst@example.com", role: "analyst" },
  viewer: { email: "user@example.com", role: "viewer" },
};

const initialOtpState = {
  email: "",
  otp: "",
  otpSent: false,
  status: "",
  error: "",
  debug: "",
  sending: false,
};

const otpTabs = ROLE_TABS.filter((tab) => tab.otp).map((tab) => tab.id);

const otpCard = (state) =>
  state && state.debug ? (
    <div className="rounded-xl border border-slate-700/60 bg-slate-900/70 p-3 text-xs text-slate-200 space-y-1">
      <p className="text-[11px] uppercase text-slate-500 tracking-wider">Notification</p>
      <p className="text-sm font-mono text-emerald-300">{state.debug}</p>
    </div>
  ) : null;

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("123456");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [otpStates, setOtpStates] = useState({
    viewer: { ...initialOtpState },
    analyst: { ...initialOtpState },
  });

  const { login, loading, requestOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const isOtpTab = ROLE_TABS.find((tab) => tab.id === activeTab)?.otp;
  const currentOtp = otpStates[activeTab] ?? initialOtpState;

  const portalLabel = useMemo(() => {
    return isOtpTab ? `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} OTP` : "Admin Login";
  }, [activeTab, isOtpTab]);

  const updateOtpState = (role, payload) => {
    setOtpStates((prev) => ({ ...prev, [role]: { ...prev[role], ...payload } }));
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError("");
    try {
      const fallback = DEMO_ACCOUNTS[activeTab]?.email || DEMO_ACCOUNTS.admin.email;
      await login(email || fallback, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  const handleSendOtp = async () => {
    const role = activeTab;
    const state = otpStates[role];
    if (!state.email) {
      updateOtpState(role, { error: "Enter an email before requesting OTP" });
      return;
    }
    updateOtpState(role, { error: "", status: "", debug: "", sending: true });
    try {
      const response = await requestOtp(state.email, role);
      updateOtpState(role, {
        otpSent: true,
        status: "OTP sent! Check your email and enter the code below.",
        debug: response.otp || "",
      });
    } catch (err) {
      updateOtpState(role, { error: err.message || "Failed to send OTP" });
    } finally {
      updateOtpState(role, { sending: false });
    }
  };

  const handleVerifyOtp = async () => {
    const role = activeTab;
    const state = otpStates[role];
    if (!state.otp) {
      updateOtpState(role, { error: "Enter the OTP before verification" });
      return;
    }
    updateOtpState(role, { error: "", sending: true });
    try {
      await verifyOtp(state.email, state.otp, role);
      navigate("/dashboard");
    } catch (err) {
      updateOtpState(role, { error: err.message || "OTP verification failed" });
    } finally {
      updateOtpState(role, { sending: false });
    }
  };

  const fillDemo = (role) => {
    const account = DEMO_ACCOUNTS[role];
    if (otpTabs.includes(role)) {
      updateOtpState(role, {
        email: account.email,
        otpSent: false,
        otp: "",
        status: "",
        error: "",
        debug: "",
      });
    } else {
      setEmail(account.email);
      setPassword("123456");
    }
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] grid-bg flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20">
            <Shield className="w-7 h-7 text-slate-950" />
          </div>
          <h1 className="font-display text-3xl font-bold text-slate-100">FinVault</h1>
          <p className="text-slate-500 mt-1 text-sm">Role-aware finance dashboard access</p>
        </div>

        <div className="card p-6 space-y-5">
          <div className="flex gap-3">
            {ROLE_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 text-sm font-semibold rounded-xl transition ${
                  activeTab === tab.id
                    ? "bg-slate-800 text-white border border-emerald-500"
                    : "bg-slate-900/60 text-slate-400 hover:bg-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-400 font-medium">{portalLabel}</p>
              <p className="text-[11px] uppercase text-slate-500 tracking-wider">
                {ROLE_TABS.find((tab) => tab.id === activeTab)?.subtitle}
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 text-rose-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {isOtpTab ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 font-medium mb-1.5 block">Email Address</label>
                  <input
                    type="email"
                    value={currentOtp.email}
                    onChange={(e) => updateOtpState(activeTab, { email: e.target.value })}
                    placeholder="role@email.com"
                    className="input-field"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={currentOtp.sending}
                  className="btn-primary w-full"
                >
                  {currentOtp.sending ? "Sending OTP..." : "Send OTP"}
                </button>

                {currentOtp.status && (
                  <p className="text-xs text-emerald-400 font-medium">{currentOtp.status}</p>
                )}
                {currentOtp.error && (
                  <p className="text-xs text-rose-400 font-medium">{currentOtp.error}</p>
                )}
                {otpCard(currentOtp)}

                {currentOtp.otpSent && (
                  <>
                    <div>
                      <label className="text-xs text-slate-400 font-medium mb-1.5 block">Enter OTP</label>
                      <input
                        type="text"
                        value={currentOtp.otp}
                        onChange={(e) => updateOtpState(activeTab, { otp: e.target.value })}
                        placeholder="123456"
                        maxLength={6}
                        className="input-field"
                      />
                    </div>
                    <button
                      type="button"
                      className="btn-primary w-full"
                      onClick={handleVerifyOtp}
                    >
                      {currentOtp.sending ? "Verifying..." : "Verify OTP"}
                    </button>
                  </>
                )}
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 font-medium mb-1.5 block">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium mb-1.5 block">Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="• • • • • • • •"
                      className="input-field pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((show) => !show)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                >
                  {loading ? "Signing in..." : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs text-slate-500 text-center mb-3 font-medium uppercase tracking-wider">
            Demo Accounts — click to fill
          </p>
          <div className="grid grid-cols-3 gap-2">
            {ROLE_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); fillDemo(tab.id); }}
                className="card p-3 text-left hover:border-emerald-500/30 transition-all duration-200 group"
              >
                <span
                  className={`text-xs font-semibold mb-1 block ${
                    tab.id === "admin" ? "text-amber-400" : tab.id === "analyst" ? "text-sky-400" : "text-slate-400"
                  }`}
                >
                  {tab.label}
                </span>
                <span className="text-xs text-slate-500 leading-relaxed group-hover:text-slate-400 transition-colors">
                  {tab.subtitle}
                </span>
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-slate-600 mt-3">
            Password for admin accounts: <span className="font-mono text-slate-500">password</span>
          </p>
        </div>
      </div>
    </div>
  );
}
