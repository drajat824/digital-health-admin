import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-muted text-center px-4">
      <p className="text-5xl">🧭</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">404 - Page Not Found</h1>
      <p className="mt-2 text-sm text-slate-500">The page you are looking for is not available.</p>
      <Link
        to="/admin/dashboard"
        className="mt-6 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
