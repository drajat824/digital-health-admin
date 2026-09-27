import { Link } from "react-router-dom";
import { Card, Badge, Button } from "../../components/common/UI";
import { LoadingState, ErrorState } from "../../components/common/States";
import useUserRecord from "../../hooks/useUserRecord";

const MEDICAL_SECTIONS = [
  {
    to: "heart-health",
    icon: "💓",
    title: "Heart Health",
    desc: "Real-time heart rate, aggregation, and heart issue history.",
  },
  {
    to: "medications",
    icon: "💊",
    title: "Medications & Schedule",
    desc: "Patient medication data and medication schedule.",
  },
  {
    to: "health-records",
    icon: "🩺",
    title: "Health Records",
    desc: "Demographic data/health metrics and medical records documents.",
  },
  {
    to: "heart-model",
    icon: "🫀",
    title: "3D Heart Model",
    desc: "Interactive visualization of heart anatomy model.",
  },
];

export default function UserDetail() {
  const { userId, user, loading, error } = useUserRecord();

  if (loading) return <LoadingState label="Memuat data user..." />;
  if (error) return <ErrorState message={error} />;

  const initials = (user?.name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-extrabold tracking-wide text-slate-900">DETAIL USER</h1>
        <Link to="/admin/users" className="text-sm text-brand-600 hover:underline">
          ← Kembali ke User Management
        </Link>
      </div>

      <Card className="mb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-xl font-bold text-white">
            {initials}
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">{user?.name || `User #${userId}`}</p>
            <p className="text-sm text-slate-500">{user?.email || "—"}</p>
            <Badge tone="blue">{user?.role || "user"}</Badge>
          </div>
        </div>
      </Card>

      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
        Manajemen Medis
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {MEDICAL_SECTIONS.map((s) => (
          <Link key={s.to} to={`/admin/users/${userId}/medical/${s.to}`} state={{ user }}>
            <Card className="h-full transition hover:border-brand-300 hover:shadow-md">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <p className="font-semibold text-slate-800">{s.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{s.desc}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-6">
        <Link to={`/admin/users/${userId}/medical/heart-health`} state={{ user }}>
          <Button>Buka Manajemen Medis →</Button>
        </Link>
      </div>
    </div>
  );
}
