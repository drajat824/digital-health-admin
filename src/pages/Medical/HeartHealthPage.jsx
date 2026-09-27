import { useEffect, useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, Badge } from "../../components/common/UI";
import { LoadingState, ErrorState, EmptyState } from "../../components/common/States";
import { getRealtimeHeartRates, getHeartRateAggregations } from "../../api/heartRateApi";
import { getHeartIssues } from "../../api/heartIssueApi";

export default function HeartHealthPage() {
  const { userId } = useOutletContext();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [realtimeRows, setRealtimeRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  const [aggRows, setAggRows] = useState([]);
  const [issues, setIssues] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [rt, agg, iss] = await Promise.all([
        getRealtimeHeartRates({ user_id: userId, page, limit: 30 }),
        getHeartRateAggregations({ user_id: userId }),
        getHeartIssues({ user_id: userId }),
      ]);

      // Backend /api/hr sekarang membungkus response: { data, pagination }
      setRealtimeRows(rt.data.data || []);
      setPagination(rt.data.pagination || null);

      // /api/hr-aggregation belum diubah, masih array polos
      setAggRows(Array.isArray(agg.data) ? agg.data : []);

      setIssues(iss.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, page]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingState label="Memuat data kesehatan jantung..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const realtimeChartData = [...realtimeRows]
    .reverse()
    .map((r) => ({
      time: new Date(r.start_time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      bpm: r.bpm,
    }));

  const aggChartData = [...aggRows]
    .slice(0, 30)
    .reverse()
    .map((r) => ({
      time: new Date(r.start_time).toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
      bpm: r.bpm,
    }));

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Heart Rate Realtime</h3>
          {pagination && (
            <span className="text-xs text-slate-400">
              Halaman {pagination.currentPage} / {pagination.totalPages} · {pagination.totalItems} data
            </span>
          )}
        </div>
        {realtimeChartData.length === 0 ? (
          <EmptyState title="Belum ada data heart rate realtime" icon="💓" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={realtimeChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6e9f2" />
              <XAxis dataKey="time" fontSize={11} stroke="#94a3b8" />
              <YAxis fontSize={11} stroke="#94a3b8" domain={["dataMin - 5", "dataMax + 5"]} />
              <Tooltip />
              <Line type="monotone" dataKey="bpm" stroke="#3466f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-3 flex items-center justify-center gap-2 text-sm">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-brand-600 disabled:text-slate-300"
            >
              ← Sebelumnya
            </button>
            <span className="text-slate-400">|</span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="text-brand-600 disabled:text-slate-300"
            >
              Berikutnya →
            </button>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="mb-3 text-sm font-bold text-slate-800">Heart Rate Agregasi</h3>
        {aggChartData.length === 0 ? (
          <EmptyState title="Belum ada data agregasi heart rate" icon="📈" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={aggChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6e9f2" />
              <XAxis dataKey="time" fontSize={11} stroke="#94a3b8" />
              <YAxis fontSize={11} stroke="#94a3b8" domain={["dataMin - 5", "dataMax + 5"]} />
              <Tooltip />
              <Line type="monotone" dataKey="bpm" stroke="#16a34a" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card>
        <h3 className="mb-3 text-sm font-bold text-slate-800">Riwayat Heart Issue</h3>
        {issues.length === 0 ? (
          <EmptyState title="Tidak ada isu jantung tercatat" icon="🚨" />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-surface-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-muted text-left text-xs font-semibold uppercase text-slate-500">
                  <th className="px-3 py-2">Waktu</th>
                  <th className="px-3 py-2">Jenis</th>
                  <th className="px-3 py-2">BPM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {issues.map((i) => (
                  <tr key={i.id}>
                    <td className="px-3 py-2">{new Date(i.recorded_at).toLocaleString("id-ID")}</td>
                    <td className="px-3 py-2">
                      <Badge tone={i.issue_type === "TAKIKARDIA" ? "red" : "amber"}>{i.issue_type}</Badge>
                    </td>
                    <td className="px-3 py-2 font-medium">{i.bpm_recorded}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
