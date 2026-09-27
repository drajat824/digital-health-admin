export function LoadingState({ label = "Memuat data..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-500">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
      <p className="mt-3 text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({ title = "Belum ada data", description, icon = "🗂️", action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-4xl">{icon}</div>
      <h3 className="mt-3 text-sm font-semibold text-slate-800">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message = "Gagal memuat data", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-4xl">⚠️</div>
      <h3 className="mt-3 text-sm font-semibold text-danger-600">{message}</h3>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition"
        >
          Coba lagi
        </button>
      )}
    </div>
  );
}
