import { useState, useEffect } from 'react';
import { getTemplates } from '../services/templateService';
import { getLogs, type Log } from '../services/logService';

interface HomeViewProps {
  onNavigate: (view: 'home' | 'create-template' | 'select-template' | 'create-log' | 'view-log', id?: string) => void;
  currentTab: 'logs' | 'templates';
  onTabChange: (tab: 'logs' | 'templates') => void;
}

export function HomeView({ onNavigate, currentTab, onTabChange }: HomeViewProps) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [templatesData, logsData] = await Promise.all([
          getTemplates(),
          getLogs()
        ]);
        if (templatesData) setTemplates(templatesData);
        if (logsData) setLogs(logsData);
      } catch (e) {
        console.error('Failed to load data', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getLogPreview = (log: Log) => {
    for (const block of log.blocks) {
      if (block.type === 'header' && block.text) return block.text;
      if (block.type === 'text' && block.value) return block.value;
      if (block.type === 'paragraph' && block.text) return block.text;
    }
    return 'Empty Log';
  };

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
      <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl mb-8 self-start shadow-sm border border-slate-200 dark:border-slate-800">
        <button
          onClick={() => onTabChange('logs')}
          className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            currentTab === 'logs'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800'
          }`}
        >
          Logs
        </button>
        <button
          onClick={() => onTabChange('templates')}
          className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            currentTab === 'templates'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800'
          }`}
        >
          Templates
        </button>
      </div>

      {currentTab === 'logs' ? (
        logs.length === 0 ? (
          <div className="w-full md:max-w-md mx-auto px-6 py-10 md:p-10 flex flex-col items-center text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-y md:border-x border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl shadow-blue-900/5 dark:shadow-black/20 mt-8 md:mt-12">
            <div className="h-20 w-20 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
              No logs yet
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm leading-relaxed">
              Start creating logs. You can use templates to make logging easier.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('select-template')}
              className="cursor-pointer group relative inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:scale-95"
            >
              <span>Create Log</span>
              <svg className="transition-transform duration-300 group-hover:translate-x-1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-6">
            <div className="flex justify-between items-center px-2 md:px-0">
              <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Logs</h2>
              <button
                type="button"
                onClick={() => onNavigate('select-template')}
                className="cursor-pointer group relative inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 overflow-hidden transition-all duration-300 shadow-md shadow-blue-500/20 active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span>New</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {logs.slice().reverse().map(log => {
                const preview = log.title || getLogPreview(log);
                const truncatedPreview = preview.length > 60 ? preview.substring(0, 60) + '...' : preview;
                return (
                  <div 
                    key={log.id} 
                    onClick={() => onNavigate('view-log', log.id)}
                    className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer group"
                  >
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {truncatedPreview}
                    </h3>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mt-auto pt-4 flex justify-end items-center border-t border-slate-100 dark:border-slate-800/60">
                      <span className="text-xs text-right font-medium">
                        {new Date(log.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )
      ) : templates.length === 0 ? (
        <div className="w-full md:max-w-md mx-auto px-6 py-10 md:p-10 flex flex-col items-center text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-y md:border-x border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl shadow-blue-900/5 dark:shadow-black/20">
          <div className="h-20 w-20 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
            No templates yet
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm leading-relaxed">
            Get started by creating your first template. You can use it to log daily events, notes, or whatever you need.
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
        <div className="w-full flex flex-col gap-6">
          <div className="flex justify-between items-center px-2 md:px-0">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Templates</h2>
            <button
              type="button"
              onClick={() => onNavigate('create-template')}
              className="cursor-pointer group relative inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-400 overflow-hidden transition-all duration-300 shadow-md shadow-green-500/20 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span>New</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <div 
                key={template.id} 
                onClick={() => onNavigate('create-template', template.id)}
                className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer group"
              >
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{template.name}</h3>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-auto pt-4 flex justify-between items-center">
                  <span>{template.blocks.length} block{template.blocks.length !== 1 ? 's' : ''}</span>
                  <span className="text-xs text-right">
                    Created: {new Date(template.createdAt).toLocaleDateString()}
                    {template.updatedAt && template.updatedAt !== template.createdAt && (
                      <span className="ml-1 opacity-80 block">(Edited: {new Date(template.updatedAt).toLocaleDateString()})</span>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
