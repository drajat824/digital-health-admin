import { NavLink, Outlet, Link } from "react-router-dom";
import { Badge } from "../common/UI";
import { LoadingState, ErrorState } from "../common/States";
import useUserRecord from "../../hooks/useUserRecord";

const TABS = [
  { to: "heart-health", icon: "💓", label: "Kesehatan Jantung" },
  { to: "medications", icon: "💊", label: "Obat & Jadwal" },
  { to: "health-records", icon: "🩺", label: "Rekam Kesehatan" },
  { to: "heart-model", icon: "🫀", label: "Model 3D Jantung" },
];

export default function MedicalLayout() {
  const { userId, user, loading, error } = useUserRecord();

  if (loading) return <LoadingState label="Memuat data user..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Manajemen Medis
          </p>
          <h1 className="text-xl font-extrabold text-slate-900">
            {user?.name || `User #${userId}`}{" "}
            <Badge tone="blue">{user?.role || "user"}</Badge>
          </h1>
          <p className="text-sm text-slate-500">{user?.email}</p>
        </div>
        <Link to={`/admin/users`} state={{ user }} className="text-sm text-brand-600 hover:underline">
          ← Kembali ke User
        </Link>
      </div>

      <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl border border-surface-border bg-white p-1">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={`/admin/users/${userId}/medical/${tab.to}`}
            state={{ user }}
            className={({ isActive }) =>
              `flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                isActive ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-surface-muted"
              }`
            }
          >
            <span>{tab.icon}</span>
            {tab.label}
          </NavLink>
        ))}
      </div>

      <Outlet context={{ userId, user }} />
    </div>
  );
}
