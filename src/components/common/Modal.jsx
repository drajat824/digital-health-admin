export default function Modal({ open, title, onClose, children, width = "max-w-lg" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        className={`w-full ${width} rounded-xl bg-white shadow-xl my-8 animate-[fadeIn_0.15s_ease-out]`}
      >
        <div className="flex items-center justify-between border-b border-surface-border px-6 py-4">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
