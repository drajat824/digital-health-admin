import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { PageHeader, StatCard, Card, Badge } from "../components/common/UI";
import { LoadingState, ErrorState } from "../components/common/States";
import { getRealtimeHeartRates, getHeartRateAggregations } from "../api/heartRateApi";
import { getHeartIssues } from "../api/heartIssueApi";
import { getMedications } from "../api/medicationApi";
import { getSchedules } from "../api/medicationScheduleApi";
import { getAllUsers } from "../api/authApi";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [users, hr, agg, issues, meds, schedules] = await Promise.all([
        getAllUsers(),
        getRealtimeHeartRates({ limit: 30 }), // response: { data, pagination }
        getHeartRateAggregations(), // masih array polos
        getHeartIssues(),
        getMedications(),
        getSchedules(),
      ]);

      const realtimeRows = hr.data.data || [];
      const aggRows = Array.isArray(agg.data) ? agg.data : [];
      const heartIssues = issues.data || [];
      const medications = meds.data || [];
      const medSchedules = schedules.data || [];

      const pendingSchedules = medSchedules.filter((s) => s.status === "pending").length;
      const missedSchedules = medSchedules.filter((s) => s.status === "missed").length;

      const realtimeTrend = [...realtimeRows]
        .reverse()
        .map((r) => ({
          time: new Date(r.start_time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          bpm: r.bpm,
        }));

      const aggTrend = [...aggRows]
        .slice(0, 30)
        .reverse()
        .map((r) => ({
          time: new Date(r.start_time).toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
          bpm: r.bpm,
        }));

      setData({
        userCount: users.data.length,
        heartRateCount: hr.data.pagination?.totalItems ?? realtimeRows.length,
        heartIssueCount: heartIssues.length,
        medicationCount: medications.length,
        pendingSchedules,
        missedSchedules,
        recentIssues: heartIssues.slice(0, 5),
        realtimeTrend,
        aggTrend,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <LoadingState label="Memuat ringkasan dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Ringkasan data kesehatan dari seluruh pengguna Digital Health."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total User (non-admin)" value={data.userCount} icon="🧑‍⚕️" tone="brand" />
        <StatCard label="Data Heart Rate Realtime" value={data.heartRateCount} icon="💓" tone="emerald" />
        <StatCard label="Heart Issues" value={data.heartIssueCount} icon="🚨" tone="danger" />
        <StatCard label="Data Obat Terdaftar" value={data.medicationCount} icon="💊" tone="amber" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Jadwal Pending" value={data.pendingSchedules} icon="⏳" tone="amber" />
        <StatCard label="Jadwal Terlewat" value={data.missedSchedules} icon="❌" tone="danger" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* <Card>
          <h3 className="mb-4 text-sm font-semibold text-slate-800">Heart Rate Realtime</h3>
          {data.realtimeTrend.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada data heart rate realtime.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data.realtimeTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6e9f2" />
                <XAxis dataKey="time" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" domain={["dataMin - 5", "dataMax + 5"]} />
                <Tooltip />
                <Line type="monotone" dataKey="bpm" stroke="#3466f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card> */}

        {/* <Card>
          <h3 className="mb-4 text-sm font-semibold text-slate-800">Heart Rate Agregasi</h3>
          {data.aggTrend.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada data agregasi heart rate.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data.aggTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6e9f2" />
                <XAxis dataKey="time" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" domain={["dataMin - 5", "dataMax + 5"]} />
                <Tooltip />
                <Line type="monotone" dataKey="bpm" stroke="#16a34a" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card> */}
      </div>

      <Card className="mt-4">
        <h3 className="mb-4 text-sm font-semibold text-slate-800">Heart Issue Terbaru</h3>
        {data.recentIssues.length === 0 ? (
          <p className="text-sm text-slate-500">Tidak ada isu jantung terbaru.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {data.recentIssues.map((issue) => (
              <li key={issue.id} className="rounded-lg border border-surface-border p-3 text-sm">
                <p className="font-medium text-slate-800">User #{issue.user_id}</p>
                <p className="text-xs text-slate-500">{new Date(issue.recorded_at).toLocaleString("id-ID")}</p>
                <div className="mt-2 flex items-center justify-between">
                  <Badge tone={issue.issue_type === "TAKIKARDIA" ? "red" : "amber"}>{issue.issue_type}</Badge>
                  <span className="text-xs text-slate-500">{issue.bpm_recorded} bpm</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
