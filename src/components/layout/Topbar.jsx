import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Topbar({ onMenuClick }) {
  const { user } = useAuth();
  // const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const initials = (user?.name || "A")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-surface-border bg-white/90 backdrop-blur px-4 sm:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-slate-600 hover:bg-surface-muted lg:hidden"
        aria-label="Open menu"
      >
        ☰
      </button>

      <div className="hidden lg:block" />

      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-surface-muted transition"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
            {initials}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium text-slate-800 leading-none">{user?.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">Admin</p>
          </div>
          <span className="text-slate-400 text-xs">▾</span>
        </button>

        {/* {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-surface-border bg-white py-1 shadow-card">
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/admin/profile");
                }}
                className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-surface-muted"
              >
                Profil Saya
              </button>
            </div>
          </>
        )} */}
      </div>
    </header>
  );
}
