import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "admin@mail.com", password: "Admin123" });
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password);
      const dest = location.state?.from?.pathname || "/admin/dashboard";
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-4">
      <div className="w-full max-w-[420px]">
        <div className="rounded-2xl bg-white p-8 shadow-[0_2px_20px_rgba(0,0,0,0.08)]">
          <div className="flex flex-col items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-900">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" fill="white" />
                <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="white" />
              </svg>
            </div>
            <h1 className="mt-5 text-2xl font-bold tracking-wide text-slate-900">
              ADMIN LOGIN
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            {error && (
              <div className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-600">
                {error}
              </div>
            )}

            <input
              type="email"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="username"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
              />
              Remember Me
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#1d6fc9] py-3 text-sm font-semibold tracking-wide text-white hover:bg-[#1a63b3] transition disabled:opacity-60"
            >
              {loading ? "PROCESSING..." : "LOGIN"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
