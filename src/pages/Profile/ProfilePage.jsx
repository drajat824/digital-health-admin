import { useState } from "react";
import { PageHeader, Card, Badge, Button } from "../../components/common/UI";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  const initials = (user?.name || "A")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div>
      <PageHeader title="Profil Admin" description="Informasi akun admin yang sedang login." />

      <Card className="max-w-lg">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-xl font-bold text-white">
            {initials}
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">{user?.name}</p>
            <Badge tone="blue">{user?.role}</Badge>
          </div>
        </div>

        <div className="mt-6 space-y-3 border-t border-surface-border pt-5 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">User ID</span>
            <span className="font-medium text-slate-800">{user?.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Email</span>
            <span className="font-medium text-slate-800">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Role</span>
            <span className="font-medium text-slate-800">{user?.role}</span>
          </div>
        </div>

        <p className="mt-5 text-xs text-slate-400">
          Backend belum menyediakan endpoint untuk mengubah profil/password admin
          (tidak ada <code>PUT /api/users/:id</code>). Tambahkan endpoint tersebut
          jika ingin fitur edit profil di halaman ini.
        </p>

        <Button
          variant="danger"
          className="mt-6 w-full justify-center"
          onClick={() => setConfirmingLogout(true)}
        >
          Keluar dari Akun
        </Button>
      </Card>

      {confirmingLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Keluar dari akun?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Anda perlu login kembali untuk mengakses dashboard.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setConfirmingLogout(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  logout();
                  toast.info("Anda telah keluar");
                }}
                className="rounded-lg bg-danger-600 px-4 py-2 text-sm font-medium text-white hover:bg-danger-700"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
