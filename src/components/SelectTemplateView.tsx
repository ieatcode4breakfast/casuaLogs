import { useState, useEffect } from 'react';
import { getTemplates, type Template } from '../services/templateService';

interface SelectTemplateViewProps {
  onNavigate: (view: 'home' | 'create-template' | 'create-log', id?: string) => void;
}

export function SelectTemplateView({ onNavigate }: SelectTemplateViewProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTemplates() {
      try {
        const data = await getTemplates();
        if (data) {
          setTemplates(data);
        }
      } catch (e) {
        console.error('Failed to load templates', e);
      } finally {
        setLoading(false);
      }
    }
    loadTemplates();
  }, []);

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto md:px-6 py-10 md:py-20 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
          <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12 flex flex-col min-h-[80vh]">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => onNavigate('home')}
          className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
          title="Back to Home"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Choose a template</h2>
      </div>

      {templates.length === 0 ? (
        <div className="w-full md:max-w-md mx-auto px-6 py-10 md:p-10 flex flex-col items-center text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-y md:border-x border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl shadow-blue-900/5 dark:shadow-black/20">
          <div className="h-20 w-20 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
            No templates available
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm leading-relaxed">
            You need to create a template first before you can create a log.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('create-template')}
            className="cursor-pointer group relative inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold rounded-xl bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-400 overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 active:scale-95"
          >
            <span>Create Template</span>
            <svg className="transition-transform duration-300 group-hover:translate-x-1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(template => (
            <div 
              key={template.id} 
              onClick={() => onNavigate('create-log', template.id)}
              className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer group"
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{template.name}</h3>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
