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
      setDemoError("All required fields (except blood sugar & cholesterol) must be filled.");
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
          <h3 className="text-sm font-bold text-slate-800">Demographics & Health Metrics</h3>
          <Button onClick={openDemoCreate}>+ Add</Button>
        </div>
        {demographics.length === 0 ? (
          <EmptyState title="No demographics data yet" icon="🧬" />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-surface-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-muted text-left text-xs font-semibold uppercase text-slate-500">
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Gender/Age</th>
                  <th className="px-3 py-2">Height/Weight</th>
                  <th className="px-3 py-2">BMI</th>
                  <th className="px-3 py-2">Blood Sugar</th>
                  <th className="px-3 py-2">Cholesterol</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {demographics.map((d) => (
                  <tr key={d.id}>
                    <td className="px-3 py-2">{new Date(d.check_date).toLocaleDateString("id-ID")}</td>
                    <td className="px-3 py-2">{d.gender}, {d.age} yrs</td>
                    <td className="px-3 py-2">{d.height}cm / {d.weight}kg</td>
                    <td className="px-3 py-2">
                      <Badge tone={d.bmi < 18.5 || d.bmi >= 25 ? "amber" : "green"}>{d.bmi}</Badge>
                    </td>
                    <td className="px-3 py-2">{d.blood_sugar ?? "—"}</td>
                    <td className="px-3 py-2">{d.cholesterol ?? "—"}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button onClick={() => openDemoEdit(d)} className="rounded-md bg-amber-400 px-2 py-1 text-xs text-white hover:bg-amber-500">Edit</button>
                        <button onClick={() => setDemoDelete(d)} className="rounded-md bg-danger-500 px-2 py-1 text-xs text-white hover:bg-danger-600">Delete</button>
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
          <h3 className="text-sm font-bold text-slate-800">Medical Record Documents</h3>
          <Button onClick={openRecCreate}>+ Add Document</Button>
        </div>
        <p className="mb-3 text-xs text-slate-400">
          Each entry can include up to 3 files: lab results, medical images (X-Ray/MRI), and diagnosis documents.
        </p>
        {records.length === 0 ? (
          <EmptyState title="Belum ada dokumen rekam medis" icon="📄" />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-surface-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-muted text-left text-xs font-semibold uppercase text-slate-500">
                    <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Lab Result</th>
                      <th className="px-3 py-2">Medical Image</th>
                      <th className="px-3 py-2">Diagnosis</th>
                      <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {records.map((r) => (
                  <tr key={r.id}>
                    <td className="px-3 py-2">{r.check_date ? new Date(r.check_date).toLocaleDateString("id-ID") : "—"}</td>
                    <td className="px-3 py-2">
                      {r.lab_result ? (
                        <a href={getFileViewUrl(r.lab_result)} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
                          View File
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {r.medical_image ? (
                        <a href={getFileViewUrl(r.medical_image)} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
                          View File
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {r.diagnosis ? (
                        <a href={getFileViewUrl(r.diagnosis)} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
                          View File
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                          <button onClick={() => openRecEdit(r)} className="rounded-md bg-amber-400 px-2 py-1 text-xs text-white hover:bg-amber-500">Edit</button>
                        <button onClick={() => setRecDelete(r)} className="rounded-md bg-danger-500 px-2 py-1 text-xs text-white hover:bg-danger-600">Delete</button>
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
      <Modal open={demoModal.open} title={demoModal.data ? "Edit Demographics" : "Add Demographics"} onClose={() => setDemoModal({ open: false, data: null })}>
        <form onSubmit={submitDemo} className="space-y-4">
          {demoError && <div className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-600">{demoError}</div>}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Check Date" required>
              <input type="date" className={inputClass} value={demoForm.check_date} onChange={(e) => setDemoForm({ ...demoForm, check_date: e.target.value })} />
            </Field>
            <Field label="Date of Birth" required>
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
            <Field label="Age" required>
              <input type="number" className={inputClass} value={demoForm.age} onChange={(e) => setDemoForm({ ...demoForm, age: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Height (cm)" required>
              <input type="number" step="0.1" className={inputClass} value={demoForm.height} onChange={(e) => setDemoForm({ ...demoForm, height: e.target.value })} onBlur={autoBmi} />
            </Field>
            <Field label="Weight (kg)" required>
              <input type="number" step="0.1" className={inputClass} value={demoForm.weight} onChange={(e) => setDemoForm({ ...demoForm, weight: e.target.value })} onBlur={autoBmi} />
            </Field>
          </div>
          <Field label="BMI" required>
            <input type="number" step="0.01" className={inputClass} value={demoForm.bmi} onChange={(e) => setDemoForm({ ...demoForm, bmi: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Blood Sugar (mg/dL)">
              <input type="number" step="0.1" className={inputClass} value={demoForm.blood_sugar} onChange={(e) => setDemoForm({ ...demoForm, blood_sugar: e.target.value })} />
            </Field>
            <Field label="Cholesterol (mg/dL)">
              <input type="number" step="0.1" className={inputClass} value={demoForm.cholesterol} onChange={(e) => setDemoForm({ ...demoForm, cholesterol: e.target.value })} />
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setDemoModal({ open: false, data: null })}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      </Modal>

      {/* Medical record modal */}
      <Modal open={recModal.open} title={recModal.data ? "Edit Medical Record Document" : "Add Medical Record Document"} onClose={() => setRecModal({ open: false, data: null })}>
        <form onSubmit={submitRec} className="space-y-4">
          {recError && <div className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-600">{recError}</div>}
          <Field label="Examination Date">
            <input type="date" className={inputClass} value={recForm.check_date} onChange={(e) => setRecForm({ ...recForm, check_date: e.target.value })} />
          </Field>
          <Field label="Lab Result File (PDF/Image)">
            <input type="file" className={inputClass} onChange={(e) => setRecFiles({ ...recFiles, lab_result: e.target.files[0] })} />
            {recModal.data?.lab_result && !recFiles.lab_result && (
              <p className="mt-1 text-xs text-slate-400">Existing file — leave empty to keep the current file.</p>
            )}
          </Field>
          <Field label="Medical Image File (X-Ray/MRI)">
            <input type="file" className={inputClass} onChange={(e) => setRecFiles({ ...recFiles, medical_image: e.target.files[0] })} />
            {recModal.data?.medical_image && !recFiles.medical_image && (
              <p className="mt-1 text-xs text-slate-400">Existing file — leave empty to keep the current file.</p>
            )}
          </Field>
          <Field label="Diagnosis File">
            <input type="file" className={inputClass} onChange={(e) => setRecFiles({ ...recFiles, diagnosis: e.target.files[0] })} />
            {recModal.data?.diagnosis && !recFiles.diagnosis && (
              <p className="mt-1 text-xs text-slate-400">Existing file — leave empty to keep the current file.</p>
            )}
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setRecModal({ open: false, data: null })}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Uploading..." : "Save"}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(demoDelete)}
        message="This demographic data will be permanently deleted."
        loading={deleting}
        onCancel={() => setDemoDelete(null)}
        onConfirm={confirmDemoDelete}
      />
      <ConfirmDialog
        open={Boolean(recDelete)}
        message="This medical record document (including its file references) will be permanently deleted."
        loading={deleting}
        onCancel={() => setRecDelete(null)}
        onConfirm={confirmRecDelete}
      />
    </div>
  );
}
