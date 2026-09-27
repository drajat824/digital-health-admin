import { useEffect, useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, Button, Field, inputClass, Badge } from "../../components/common/UI";
import { LoadingState, ErrorState, EmptyState } from "../../components/common/States";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import {
  getDemographics,
  createDemographic,
  updateDemographic,
  deleteDemographic,
  GENDER_OPTIONS,
} from "../../api/demographicApi";
import {
  getMedicalRecords,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
  getFileViewUrl,
} from "../../api/medicalRecordApi";
import { useToast } from "../../context/ToastContext";

const EMPTY_DEMO = {
  check_date: "",
  date_of_birth: "",
  gender: "Male",
  age: "",
  height: "",
  weight: "",
  bmi: "",
  blood_sugar: "",
  cholesterol: "",
};

export default function HealthRecordsPage() {
  const { userId } = useOutletContext();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [demographics, setDemographics] = useState([]);
  const [records, setRecords] = useState([]);

  // demographic modal state
  const [demoModal, setDemoModal] = useState({ open: false, data: null });
  const [demoForm, setDemoForm] = useState(EMPTY_DEMO);
  const [demoError, setDemoError] = useState("");
  const [demoDelete, setDemoDelete] = useState(null);

  // medical record modal state
  const [recModal, setRecModal] = useState({ open: false, data: null });
  const [recForm, setRecForm] = useState({ check_date: "" });
  const [recFiles, setRecFiles] = useState({ lab_result: null, medical_image: null, diagnosis: null });
  const [recError, setRecError] = useState("");
  const [recDelete, setRecDelete] = useState(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [demo, rec] = await Promise.all([
        getDemographics({ user_id: userId }),
        getMedicalRecords({ user_id: userId }),
      ]);
      setDemographics(demo.data);
      setRecords(rec.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  // ---- Demographic handlers ----
  const openDemoCreate = () => {
    setDemoForm(EMPTY_DEMO);
    setDemoError("");
    setDemoModal({ open: true, data: null });
  };
  const openDemoEdit = (row) => {
    setDemoForm({
      check_date: row.check_date?.slice(0, 10) || "",
      date_of_birth: row.date_of_birth?.slice(0, 10) || "",
      gender: row.gender,
      age: row.age,
      height: row.height,
      weight: row.weight,
      bmi: row.bmi,
      blood_sugar: row.blood_sugar ?? "",
      cholesterol: row.cholesterol ?? "",
    });
    setDemoError("");
    setDemoModal({ open: true, data: row });
  };
  const submitDemo = async (e) => {
    e.preventDefault();
    const f = demoForm;
    if (!f.check_date || !f.date_of_birth || !f.gender || !f.age || !f.height || !f.weight || !f.bmi) {
      setDemoError("Semua field wajib (kecuali gula darah & kolesterol) harus diisi.");
      return;
    }
    setSaving(true);
    setDemoError("");
    try {
      const payload = {
        user_id: userId,
        check_date: f.check_date,
        date_of_birth: f.date_of_birth,
        gender: f.gender,
        age: Number(f.age),
        height: Number(f.height),
        weight: Number(f.weight),
        bmi: Number(f.bmi),
        blood_sugar: f.blood_sugar ? Number(f.blood_sugar) : null,
        cholesterol: f.cholesterol ? Number(f.cholesterol) : null,
      };
      if (demoModal.data) {
        await updateDemographic(demoModal.data.id, payload);
        toast.success("Data demografi diperbarui");
      } else {
        await createDemographic(payload);
        toast.success("Data demografi ditambahkan");
      }
      setDemoModal({ open: false, data: null });
      load();
    } catch (err) {
      setDemoError(err.message);
    } finally {
      setSaving(false);
    }
  };
  const confirmDemoDelete = async () => {
    setDeleting(true);
    try {
      await deleteDemographic(demoDelete.id);
      toast.success("Data demografi dihapus");
      setDemoDelete(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const autoBmi = () => {
    const h = Number(demoForm.height) / 100;
    const w = Number(demoForm.weight);
    if (h > 0 && w > 0) {
      setDemoForm({ ...demoForm, bmi: (w / (h * h)).toFixed(2) });
    }
  };

  // ---- Medical record handlers ----
  const openRecCreate = () => {
    setRecForm({ check_date: "" });
    setRecFiles({ lab_result: null, medical_image: null, diagnosis: null });
    setRecError("");
    setRecModal({ open: true, data: null });
  };
  const openRecEdit = (row) => {
    setRecForm({ check_date: row.check_date?.slice(0, 10) || "" });
    setRecFiles({ lab_result: null, medical_image: null, diagnosis: null });
    setRecError("");
    setRecModal({ open: true, data: row });
  };
  const submitRec = async (e) => {
    e.preventDefault();
    setSaving(true);
    setRecError("");
    try {
      const payload = { user_id: userId, check_date: recForm.check_date, files: recFiles };
      if (recModal.data) {
        await updateMedicalRecord(recModal.data.id, payload);
        toast.success("Rekam medis diperbarui");
      } else {
        await createMedicalRecord(payload);
        toast.success("Rekam medis ditambahkan");
      }
      setRecModal({ open: false, data: null });
      load();
    } catch (err) {
      setRecError(err.message);
    } finally {
      setSaving(false);
    }
  };
  const confirmRecDelete = async () => {
    setDeleting(true);
    try {
      await deleteMedicalRecord(recDelete.id);
      toast.success("Rekam medis dihapus");
      setRecDelete(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingState label="Memuat rekam kesehatan..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-5">
      {/* ---- Demographic ---- */}
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Demografi & Metrik Kesehatan</h3>
          <Button onClick={openDemoCreate}>+ Tambah</Button>
        </div>
        {demographics.length === 0 ? (
          <EmptyState title="Belum ada data demografi" icon="🧬" />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-surface-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-muted text-left text-xs font-semibold uppercase text-slate-500">
                  <th className="px-3 py-2">Tanggal</th>
                  <th className="px-3 py-2">Gender/Usia</th>
                  <th className="px-3 py-2">TB/BB</th>
                  <th className="px-3 py-2">BMI</th>
                  <th className="px-3 py-2">Gula Darah</th>
                  <th className="px-3 py-2">Kolesterol</th>
                  <th className="px-3 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {demographics.map((d) => (
                  <tr key={d.id}>
                    <td className="px-3 py-2">{new Date(d.check_date).toLocaleDateString("id-ID")}</td>
                    <td className="px-3 py-2">{d.gender}, {d.age} th</td>
                    <td className="px-3 py-2">{d.height}cm / {d.weight}kg</td>
                    <td className="px-3 py-2">
                      <Badge tone={d.bmi < 18.5 || d.bmi >= 25 ? "amber" : "green"}>{d.bmi}</Badge>
                    </td>
                    <td className="px-3 py-2">{d.blood_sugar ?? "—"}</td>
                    <td className="px-3 py-2">{d.cholesterol ?? "—"}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button onClick={() => openDemoEdit(d)} className="rounded-md bg-amber-400 px-2 py-1 text-xs text-white hover:bg-amber-500">Edit</button>
                        <button onClick={() => setDemoDelete(d)} className="rounded-md bg-danger-500 px-2 py-1 text-xs text-white hover:bg-danger-600">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ---- Medical records (file uploads) ---- */}
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Dokumen Rekam Medis</h3>
          <Button onClick={openRecCreate}>+ Tambah Dokumen</Button>
        </div>
        <p className="mb-3 text-xs text-slate-400">
          Setiap entri bisa memuat hingga 3 file: hasil lab, citra medis (X-Ray/MRI), dan dokumen diagnosis.
        </p>
        {records.length === 0 ? (
          <EmptyState title="Belum ada dokumen rekam medis" icon="📄" />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-surface-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-muted text-left text-xs font-semibold uppercase text-slate-500">
                  <th className="px-3 py-2">Tanggal</th>
                  <th className="px-3 py-2">Hasil Lab</th>
                  <th className="px-3 py-2">Citra Medis</th>
                  <th className="px-3 py-2">Diagnosis</th>
                  <th className="px-3 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {records.map((r) => (
                  <tr key={r.id}>
                    <td className="px-3 py-2">{r.check_date ? new Date(r.check_date).toLocaleDateString("id-ID") : "—"}</td>
                    <td className="px-3 py-2">
                      {r.lab_result ? (
                        <a href={getFileViewUrl(r.lab_result)} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
                          Lihat File
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {r.medical_image ? (
                        <a href={getFileViewUrl(r.medical_image)} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
                          Lihat File
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {r.diagnosis ? (
                        <a href={getFileViewUrl(r.diagnosis)} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
                          Lihat File
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button onClick={() => openRecEdit(r)} className="rounded-md bg-amber-400 px-2 py-1 text-xs text-white hover:bg-amber-500">Edit</button>
                        <button onClick={() => setRecDelete(r)} className="rounded-md bg-danger-500 px-2 py-1 text-xs text-white hover:bg-danger-600">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Demographic modal */}
      <Modal open={demoModal.open} title={demoModal.data ? "Edit Demografi" : "Tambah Demografi"} onClose={() => setDemoModal({ open: false, data: null })}>
        <form onSubmit={submitDemo} className="space-y-4">
          {demoError && <div className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-600">{demoError}</div>}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tanggal Check" required>
              <input type="date" className={inputClass} value={demoForm.check_date} onChange={(e) => setDemoForm({ ...demoForm, check_date: e.target.value })} />
            </Field>
            <Field label="Tanggal Lahir" required>
              <input type="date" className={inputClass} value={demoForm.date_of_birth} onChange={(e) => setDemoForm({ ...demoForm, date_of_birth: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Gender" required>
              <select className={inputClass} value={demoForm.gender} onChange={(e) => setDemoForm({ ...demoForm, gender: e.target.value })}>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </Field>
            <Field label="Usia" required>
              <input type="number" className={inputClass} value={demoForm.age} onChange={(e) => setDemoForm({ ...demoForm, age: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tinggi Badan (cm)" required>
              <input type="number" step="0.1" className={inputClass} value={demoForm.height} onChange={(e) => setDemoForm({ ...demoForm, height: e.target.value })} onBlur={autoBmi} />
            </Field>
            <Field label="Berat Badan (kg)" required>
              <input type="number" step="0.1" className={inputClass} value={demoForm.weight} onChange={(e) => setDemoForm({ ...demoForm, weight: e.target.value })} onBlur={autoBmi} />
            </Field>
          </div>
          <Field label="BMI" required>
            <input type="number" step="0.01" className={inputClass} value={demoForm.bmi} onChange={(e) => setDemoForm({ ...demoForm, bmi: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Gula Darah (mg/dL)">
              <input type="number" step="0.1" className={inputClass} value={demoForm.blood_sugar} onChange={(e) => setDemoForm({ ...demoForm, blood_sugar: e.target.value })} />
            </Field>
            <Field label="Kolesterol (mg/dL)">
              <input type="number" step="0.1" className={inputClass} value={demoForm.cholesterol} onChange={(e) => setDemoForm({ ...demoForm, cholesterol: e.target.value })} />
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setDemoModal({ open: false, data: null })}>Batal</Button>
            <Button type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</Button>
          </div>
        </form>
      </Modal>

      {/* Medical record modal */}
      <Modal open={recModal.open} title={recModal.data ? "Edit Dokumen Rekam Medis" : "Tambah Dokumen Rekam Medis"} onClose={() => setRecModal({ open: false, data: null })}>
        <form onSubmit={submitRec} className="space-y-4">
          {recError && <div className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-600">{recError}</div>}
          <Field label="Tanggal Pemeriksaan">
            <input type="date" className={inputClass} value={recForm.check_date} onChange={(e) => setRecForm({ ...recForm, check_date: e.target.value })} />
          </Field>
          <Field label="File Hasil Lab (PDF/Gambar)">
            <input type="file" className={inputClass} onChange={(e) => setRecFiles({ ...recFiles, lab_result: e.target.files[0] })} />
            {recModal.data?.lab_result && !recFiles.lab_result && (
              <p className="mt-1 text-xs text-slate-400">Sudah ada file — biarkan kosong untuk mempertahankan file lama.</p>
            )}
          </Field>
          <Field label="File Citra Medis (X-Ray/MRI)">
            <input type="file" className={inputClass} onChange={(e) => setRecFiles({ ...recFiles, medical_image: e.target.files[0] })} />
            {recModal.data?.medical_image && !recFiles.medical_image && (
              <p className="mt-1 text-xs text-slate-400">Sudah ada file — biarkan kosong untuk mempertahankan file lama.</p>
            )}
          </Field>
          <Field label="File Diagnosis">
            <input type="file" className={inputClass} onChange={(e) => setRecFiles({ ...recFiles, diagnosis: e.target.files[0] })} />
            {recModal.data?.diagnosis && !recFiles.diagnosis && (
              <p className="mt-1 text-xs text-slate-400">Sudah ada file — biarkan kosong untuk mempertahankan file lama.</p>
            )}
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setRecModal({ open: false, data: null })}>Batal</Button>
            <Button type="submit" disabled={saving}>{saving ? "Mengunggah..." : "Simpan"}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(demoDelete)}
        message="Data demografi ini akan dihapus permanen."
        loading={deleting}
        onCancel={() => setDemoDelete(null)}
        onConfirm={confirmDemoDelete}
      />
      <ConfirmDialog
        open={Boolean(recDelete)}
        message="Dokumen rekam medis ini (beserta referensi filenya) akan dihapus permanen."
        loading={deleting}
        onCancel={() => setRecDelete(null)}
        onConfirm={confirmRecDelete}
      />
    </div>
  );
}
