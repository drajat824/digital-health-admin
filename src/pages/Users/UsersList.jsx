import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Field, inputClass, Badge } from "../../components/common/UI";
import { LoadingState, ErrorState, EmptyState } from "../../components/common/States";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { getAllUsers, deleteUser, register } from "../../api/authApi";
import { useToast } from "../../context/ToastContext";

const PAGE_SIZES = [10, 25, 50];

export default function UsersList() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllUsers();
      setUsers(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!query) return users;
    const q = query.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        String(u.id).includes(q)
    );
  }, [users, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.name || !form.email || !form.password) {
      setFormError("Nama, email, dan password wajib diisi.");
      return;
    }
    setSaving(true);
    try {
      await register(form);
      toast.success("User berhasil ditambahkan");
      setShowAdd(false);
      setForm({ name: "", email: "", password: "", role: "user" });
      load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      toast.success("User berhasil dihapus");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <h1 className="mb-5 text-2xl font-extrabold tracking-wide text-slate-900">MANAJEMEN USER</h1>

      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-600">Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
              >
                {PAGE_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-600">Cari</span>
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Cari nama, email, atau ID.."
                className="w-64 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand-200"
              />
            </div>
          </div>
          <Button onClick={() => setShowAdd(true)}>+ Tambah User</Button>
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : filtered.length === 0 ? (
          <EmptyState title="Belum ada user" description="Tambahkan user pertama lewat tombol di atas." />
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-surface-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-muted text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Nama</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Manajemen Medis</th>
                    <th className="px-4 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {pageRows.map((u) => (
                    <tr key={u.id} className="hover:bg-surface-muted/60 transition">
                      <td className="px-4 py-3 font-mono">{u.id}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
                      <td className="px-4 py-3">{u.email}</td>
                      <td className="px-4 py-3">
                        <Badge tone="blue">{u.role}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => navigate(`/admin/users/${u.id}/medical/heart-health`, { state: { user: u } })}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                        >
                          ATUR
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setDeleteTarget(u)}
                          className="rounded-md bg-danger-500 px-2 py-1.5 text-xs text-white hover:bg-danger-600 transition"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="text-brand-600 disabled:text-slate-300"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`h-7 w-7 rounded-full text-xs font-medium ${
                      page === i + 1 ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="text-brand-600 disabled:text-slate-300"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </Card>

      <Modal open={showAdd} title="Tambah User Baru" onClose={() => setShowAdd(false)}>
        <form onSubmit={handleAddUser} className="space-y-4">
          {formError && (
            <div className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-600">{formError}</div>
          )}
          <Field label="Nama" required>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field label="Email" required>
            <input
              type="email"
              className={inputClass}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
          <Field label="Password" required>
            <input
              type="password"
              className={inputClass}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </Field>
          <Field label="Role">
            <select
              className={inputClass}
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="user">user (pasien)</option>
              <option value="admin">admin</option>
            </select>
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowAdd(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus user ini?"
        message={`Akun "${deleteTarget?.name}" beserta seluruh relasinya akan dihapus permanen (sesuai perilaku DELETE di backend).`}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
