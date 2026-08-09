interface HomeViewProps {
  onNavigate: (view: 'home' | 'create-template') => void;
}

export function HomeView({ onNavigate }: HomeViewProps) {
  return (
    <main className="max-w-5xl mx-auto md:px-6 py-10 md:py-20 flex flex-col items-center justify-center min-h-[80vh]">
      <div className="w-full md:max-w-md px-6 py-10 md:p-10 flex flex-col items-center text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-y md:border-x border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl shadow-blue-900/5 dark:shadow-black/20">
        <div className="h-20 w-20 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
          No templates yet
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm leading-relaxed">
          Get started by creating your first template. You can use it to log daily events, workouts, or whatever you need.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('create-template')}
          className="cursor-pointer group relative inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:scale-95"
        >
          <span>Create Template</span>
          <svg className="transition-transform duration-300 group-hover:translate-x-1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      </div>
    </main>
  );
}
