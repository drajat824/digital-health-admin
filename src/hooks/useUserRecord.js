import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { getAllUsers } from "../api/authApi";

/**
 * Backend tidak menyediakan GET /api/auth/users/:id (single), hanya list.
 * Jadi kita pakai user object yang dikirim lewat router state saat navigasi
 * dari daftar user (cepat, tanpa request tambahan), dan fallback fetch
 * getAllUsers() lalu filter jika halaman dibuka langsung / di-refresh.
 */
export default function useUserRecord() {
  const { userId } = useParams();
  const location = useLocation();
  const id = Number(userId);

  const [user, setUser] = useState(location.state?.user || null);
  const [loading, setLoading] = useState(!location.state?.user);
  const [error, setError] = useState("");

  useEffect(() => {
    if (location.state?.user && location.state.user.id === id) {
      setUser(location.state.user);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError("");
    getAllUsers()
      .then((res) => {
        if (cancelled) return;
        const found = res.data.find((u) => u.id === id);
        setUser(found || null);
        if (!found) setError("User tidak ditemukan.");
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return { userId: id, user, loading, error };
}
