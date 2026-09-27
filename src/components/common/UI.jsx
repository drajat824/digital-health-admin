export function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div className={`rounded-xl border border-surface-border bg-white p-5 shadow-card ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, sub, icon, tone = "brand" }) {
  const tones = {
    brand: "bg-brand-50 text-brand-700",
    danger: "bg-danger-50 text-danger-600",
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
  };
  return (
    <Card className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
      </div>
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg ${tones[tone]}`}>
        {icon}
      </div>
    </Card>
  );
}

export function Badge({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-emerald-100 text-emerald-700",
    red: "bg-red-100 text-red-700",
    amber: "bg-amber-100 text-amber-700",
    blue: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700",
    secondary: "bg-white text-slate-700 border border-surface-border hover:bg-surface-muted",
    danger: "bg-danger-600 text-white hover:bg-danger-700",
    ghost: "text-slate-600 hover:bg-surface-muted",
  };
  return (
    <button
      className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Field({ label, error, children, required }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-danger-500">*</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-danger-600">{error}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 disabled:bg-surface-muted";
