import { useEffect, useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, Button, Badge, Field, inputClass } from "../../components/common/UI";
import { LoadingState, ErrorState, EmptyState } from "../../components/common/States";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import {
  getMedications,
  createMedication,
  updateMedication,
  deleteMedication,
  ROUTE_OPTIONS,
  MEAL_RELATION_OPTIONS,
} from "../../api/medicationApi";
import {
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  STATUS_OPTIONS,
} from "../../api/medicationScheduleApi";
import { useToast } from "../../context/ToastContext";

const EMPTY_MED = {
  generic_name: "",
  brand_name: "",
  dosage_form: "",
  strength: "",
  route: "oral",
  meal_relation: "any_time",
};

const EMPTY_SCHEDULE = {
  medication_id: "",
  schedule_date: "",
  status: "pending",
  takenAt: "",
  late: 0,
};

export default function MedicationsSchedulePage() {
  const { userId } = useOutletContext();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [medications, setMedications] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const [medModal, setMedModal] = useState({ open: false, data: null });
  const [medForm, setMedForm] = useState(EMPTY_MED);
  const [medError, setMedError] = useState("");
  const [medDelete, setMedDelete] = useState(null);

  const [schedModal, setSchedModal] = useState({ open: false, data: null });
  const [schedForm, setSchedForm] = useState(EMPTY_SCHEDULE);
  const [schedError, setSchedError] = useState("");
  const [schedDelete, setSchedDelete] = useState(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [meds, sched] = await Promise.all([
        getMedications({ user_id: userId }),
        getSchedules({ user_id: userId }),
      ]);
      setMedications(meds.data);
      setSchedules(sched.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  // ---- Medication handlers ----
  const openMedCreate = () => {
    setMedForm(EMPTY_MED);
    setMedError("");
    setMedModal({ open: true, data: null });
  };
  const openMedEdit = (row) => {
    setMedForm(row);
    setMedError("");
    setMedModal({ open: true, data: row });
  };
  const submitMed = async (e) => {
    e.preventDefault();
    if (!medForm.generic_name || !medForm.dosage_form || !medForm.strength) {
      setMedError("Nama generik, bentuk sediaan, dan kekuatan wajib diisi.");
      return;
    }
    setSaving(true);
    setMedError("");
    try {
      const payload = { ...medForm, user_id: userId, brand_name: medForm.brand_name || null };
      if (medModal.data) {
        await updateMedication(medModal.data.id, payload);
        toast.success("Obat berhasil diperbarui");
      } else {
        await createMedication(payload);
        toast.success("Obat berhasil ditambahkan");
      }
      setMedModal({ open: false, data: null });
      load();
    } catch (err) {
      setMedError(err.message);
    } finally {
      setSaving(false);
    }
  };
  const confirmMedDelete = async () => {
    setDeleting(true);
    try {
      await deleteMedication(medDelete.id);
      toast.success("Obat berhasil dihapus");
      setMedDelete(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  // ---- Schedule handlers ----
  const openSchedCreate = () => {
    setSchedForm(EMPTY_SCHEDULE);
    setSchedError("");
    setSchedModal({ open: true, data: null });
  };
  const openSchedEdit = (row) => {
    setSchedForm({
      medication_id: row.medication_id,
      schedule_date: row.schedule_date?.slice(0, 16) || "",
      status: row.status,
      takenAt: row.takenAt?.slice(0, 16) || "",
      late: row.late || 0,
    });
    setSchedError("");
    setSchedModal({ open: true, data: row });
  };
  const submitSched = async (e) => {
    e.preventDefault();
    if (!schedForm.medication_id || !schedForm.schedule_date) {
      setSchedError("Obat dan tanggal jadwal wajib diisi.");
      return;
    }
    setSaving(true);
    setSchedError("");
    try {
      const payload = {
        medication_id: Number(schedForm.medication_id),
        schedule_date: schedForm.schedule_date,
        status: schedForm.status,
        takenAt: schedForm.status === "taken" ? schedForm.takenAt || new Date().toISOString() : null,
        late: Number(schedForm.late) || 0,
      };
      if (schedModal.data) {
        // Endpoint PUT terbaru mendukung update menyeluruh (medication_id,
        // schedule_date, status, takenAt, late) — bukan cuma status seperti versi lama.
        await updateSchedule(schedModal.data.id, payload);
        toast.success("Jadwal berhasil diperbarui");
      } else {
        await createSchedule(payload);
        toast.success("Jadwal berhasil ditambahkan");
      }
      setSchedModal({ open: false, data: null });
      load();
    } catch (err) {
      setSchedError(err.message);
    } finally {
      setSaving(false);
    }
  };
  const confirmSchedDelete = async () => {
    setDeleting(true);
    try {
      await deleteSchedule(schedDelete.id);
      toast.success("Jadwal berhasil dihapus");
      setSchedDelete(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingState label="Memuat data obat & jadwal..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Data Obat</h3>
          <Button onClick={openMedCreate}>+ Tambah Obat</Button>
        </div>
        {medications.length === 0 ? (
          <EmptyState title="Belum ada data obat" icon="💊" />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-surface-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-muted text-left text-xs font-semibold uppercase text-slate-500">
                  <th className="px-3 py-2">Nama Obat</th>
                  <th className="px-3 py-2">Kekuatan</th>
                  <th className="px-3 py-2">Rute</th>
                  <th className="px-3 py-2">Aturan Makan</th>
                  <th className="px-3 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {medications.map((m) => (
                  <tr key={m.id}>
                    <td className="px-3 py-2">
                      <p className="font-medium text-slate-800">{m.generic_name}</p>
                      {m.brand_name && <p className="text-xs text-slate-500">{m.brand_name}</p>}
                    </td>
                    <td className="px-3 py-2">{m.strength}</td>
                    <td className="px-3 py-2">
                      <Badge tone="blue">{m.route}</Badge>
                    </td>
                    <td className="px-3 py-2 text-xs">{m.meal_relation.replaceAll("_", " ")}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openMedEdit(m)}
                          className="rounded-md bg-amber-400 px-2 py-1 text-xs text-white hover:bg-amber-500"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setMedDelete(m)}
                          className="rounded-md bg-danger-500 px-2 py-1 text-xs text-white hover:bg-danger-600"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Jadwal Minum Obat</h3>
          <Button onClick={openSchedCreate} disabled={medications.length === 0}>
            + Tambah Jadwal
          </Button>
        </div>
        {medications.length === 0 && (
          <p className="mb-2 text-xs text-amber-600">Tambahkan data obat terlebih dahulu sebelum membuat jadwal.</p>
        )}
        {schedules.length === 0 ? (
          <EmptyState title="Belum ada jadwal obat" icon="⏰" />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-surface-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-muted text-left text-xs font-semibold uppercase text-slate-500">
                  <th className="px-3 py-2">Jadwal</th>
                  <th className="px-3 py-2">Obat</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {schedules.map((s) => (
                  <tr key={s.id}>
                    <td className="px-3 py-2">{new Date(s.schedule_date).toLocaleString("id-ID")}</td>
                    <td className="px-3 py-2">
                      {s.generic_name} {s.brand_name ? `(${s.brand_name})` : ""}
                    </td>
                    <td className="px-3 py-2">
                      <Badge tone={s.status === "taken" ? "green" : s.status === "missed" ? "red" : "amber"}>
                        {s.status} {s.late ? "· terlambat" : ""}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openSchedEdit(s)}
                          className="rounded-md bg-amber-400 px-2 py-1 text-xs text-white hover:bg-amber-500"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setSchedDelete(s)}
                          className="rounded-md bg-danger-500 px-2 py-1 text-xs text-white hover:bg-danger-600"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Medication modal */}
      <Modal open={medModal.open} title={medModal.data ? "Edit Obat" : "Tambah Obat"} onClose={() => setMedModal({ open: false, data: null })}>
        <form onSubmit={submitMed} className="space-y-4">
          {medError && <div className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-600">{medError}</div>}
          <Field label="Nama Generik" required>
            <input className={inputClass} value={medForm.generic_name} onChange={(e) => setMedForm({ ...medForm, generic_name: e.target.value })} />
          </Field>
          <Field label="Nama Merek">
            <input className={inputClass} value={medForm.brand_name || ""} onChange={(e) => setMedForm({ ...medForm, brand_name: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Bentuk Sediaan" required>
              <input className={inputClass} value={medForm.dosage_form} onChange={(e) => setMedForm({ ...medForm, dosage_form: e.target.value })} />
            </Field>
            <Field label="Kekuatan" required>
              <input className={inputClass} value={medForm.strength} onChange={(e) => setMedForm({ ...medForm, strength: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Rute">
              <select className={inputClass} value={medForm.route} onChange={(e) => setMedForm({ ...medForm, route: e.target.value })}>
                {ROUTE_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </Field>
            <Field label="Aturan Makan">
              <select className={inputClass} value={medForm.meal_relation} onChange={(e) => setMedForm({ ...medForm, meal_relation: e.target.value })}>
                {MEAL_RELATION_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r.replaceAll("_", " ")}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setMedModal({ open: false, data: null })}>Batal</Button>
            <Button type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</Button>
          </div>
        </form>
      </Modal>

      {/* Schedule modal */}
      <Modal open={schedModal.open} title={schedModal.data ? "Edit Jadwal Obat" : "Tambah Jadwal Obat"} onClose={() => setSchedModal({ open: false, data: null })}>
        <form onSubmit={submitSched} className="space-y-4">
          {schedError && <div className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-600">{schedError}</div>}
          <Field label="Obat" required>
            <select className={inputClass} value={schedForm.medication_id} onChange={(e) => setSchedForm({ ...schedForm, medication_id: e.target.value })}>
              <option value="">Pilih obat...</option>
              {medications.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.generic_name} {m.brand_name ? `(${m.brand_name})` : ""} — {m.strength}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tanggal & Jam Jadwal" required>
            <input type="datetime-local" className={inputClass} value={schedForm.schedule_date} onChange={(e) => setSchedForm({ ...schedForm, schedule_date: e.target.value })} />
          </Field>
          <Field label="Status">
            <select className={inputClass} value={schedForm.status} onChange={(e) => setSchedForm({ ...schedForm, status: e.target.value })}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          {schedForm.status === "taken" && (
            <Field label="Waktu Diminum">
              <input type="datetime-local" className={inputClass} value={schedForm.takenAt} onChange={(e) => setSchedForm({ ...schedForm, takenAt: e.target.value })} />
            </Field>
          )}
          <Field label="Terlambat?">
            <select className={inputClass} value={schedForm.late} onChange={(e) => setSchedForm({ ...schedForm, late: e.target.value })}>
              <option value={0}>Tidak</option>
              <option value={1}>Ya</option>
            </select>
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setSchedModal({ open: false, data: null })}>Batal</Button>
            <Button type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(medDelete)}
        message={`Data obat "${medDelete?.generic_name}" akan dihapus permanen, termasuk jadwal terkait (FK CASCADE).`}
        loading={deleting}
        onCancel={() => setMedDelete(null)}
        onConfirm={confirmMedDelete}
      />
      <ConfirmDialog
        open={Boolean(schedDelete)}
        message="Jadwal obat ini akan dihapus permanen."
        loading={deleting}
        onCancel={() => setSchedDelete(null)}
        onConfirm={confirmSchedDelete}
      />
    </div>
  );
}
