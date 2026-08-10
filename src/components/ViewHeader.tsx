export interface ViewHeaderProps {
  title: string;
  onBack: () => void;
  backTitle?: string;
}

export function ViewHeader({ title, onBack, backTitle = "Go back" }: ViewHeaderProps) {
  return (
    <div className="flex items-center gap-1 md:gap-4 px-3 md:px-0 mb-4 md:mb-8">
      <button
        type="button"
        onClick={onBack}
        className="cursor-pointer p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 flex-shrink-0"
        title={backTitle}
        aria-label={backTitle}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      </button>
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white line-clamp-2">
        {title}
      </h2>
    </div>
  );
}
