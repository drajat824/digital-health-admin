import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NAV_SECTIONS = [
  {
    label: "Umum",
    items: [{ to: "/admin/dashboard", label: "Dashboard", icon: "📊" }],
  },
  {
    label: "Data Pasien",
    items: [{ to: "/admin/users", label: "Manajemen User", icon: "🧑‍⚕️" }],
  }
];

export default function Sidebar({ open, onClose }) {
  const { logout } = useAuth();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed z-40 inset-y-0 left-0 flex w-64 flex-col transform bg-[#2b2b2b] text-slate-200 transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-5 pt-7 pb-6">
          <p className="text-xl font-extrabold leading-tight text-white">
            DIGITAL HEALTH
            <br />
            ADMIN
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="mb-5">
              <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {section.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? "bg-[#2f7bf6] text-white"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`
                    }
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4">
          <button
            onClick={logout}
            className="w-full rounded-lg bg-[#e04b4b] py-3 text-sm font-semibold tracking-wide text-white hover:bg-[#c93f3f] transition"
          >
            KELUAR
          </button>
        </div>
      </aside>
    </>
  );
}
