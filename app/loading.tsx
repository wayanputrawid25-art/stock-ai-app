import { LoadingState } from '@/components/LoadingState';

export default function Loading() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 px-6 py-16">
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center rounded-3xl border border-cyan-100 bg-white/80 p-8 shadow-2xl shadow-cyan-900/10 backdrop-blur">
        <div className="mb-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
          Frequency Analyzer
        </div>
        <LoadingState message="Menyiapkan data terbaik untuk Anda..." />
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-1/2 animate-[loading-bar_1.3s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-emerald-400" />
        </div>
      </div>
    </main>
  );
}
