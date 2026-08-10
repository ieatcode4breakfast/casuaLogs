import { useState, useEffect } from 'react';
import { getLogs, deleteLog, type Log } from '../services/logService';
import { ViewHeader } from './ViewHeader';

interface ViewLogViewProps {
  onNavigate: (view: 'home' | 'create-template' | 'select-template' | 'create-log' | 'view-log' | 'edit-log', id?: string) => void;
  logId: string;
}

export function ViewLogView({ onNavigate, logId }: ViewLogViewProps) {
  const [log, setLog] = useState<Log | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadLog() {
      try {
        const logs = await getLogs();
        const found = logs.find(l => l.id === logId);
        if (found) {
          setLog(found);
        }
      } catch (e) {
        console.error("Failed to load log", e);
      } finally {
        setLoading(false);
      }
    }
    loadLog();
  }, [logId]);

  const confirmDeleteLog = async () => {
    try {
      await deleteLog(logId);
      onNavigate('home');
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to delete log";
      setToastMessage(message);
      setTimeout(() => setToastMessage(null), 3000);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto md:px-6 py-8 md:py-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </main>
    );
  }

  if (!log) {
    return (
      <main className="max-w-3xl mx-auto md:px-6 py-8 md:py-12 flex flex-col items-center">
        <p className="text-slate-500 mb-4">Log not found.</p>
        <button onClick={() => onNavigate('home')} className="text-blue-600 hover:underline">
          Return Home
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto md:px-6 py-8 md:py-12">
      <ViewHeader 
        title={log.title} 
        onBack={() => onNavigate('home')} 
        backTitle="Back to Home"
      />

      <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-y md:border-x border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl shadow-blue-900/5 dark:shadow-black/20 p-6 md:p-8 flex flex-col mb-2">
        
        <div className="flex flex-col mb-6">
          <div className="flex flex-col w-full mb-2">
            {log.blocks.map((block) => {
              if (block.type === 'header') {
                const HTag = `h${block.level + 1}` as any;
                const sizeClass = block.level === 1 ? 'text-2xl' : block.level === 2 ? 'text-xl' : 'text-lg';
                return (
                  <div key={block.id} className="py-3">
                    <HTag className={`${sizeClass} font-bold text-slate-900 dark:text-white`}>
                      {block.text}
                    </HTag>
                  </div>
                );
              }

              if (block.type === 'paragraph') {
                return (
                  <div key={block.id} className="py-2">
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {block.text}
                    </p>
                  </div>
                );
              }

              if (block.type === 'text') {
                return (
                  <div key={block.id} className="py-3 flex flex-col gap-1">
                    <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {block.label}
                    </h4>
                    <p className="text-slate-900 dark:text-white whitespace-pre-wrap leading-relaxed">
                      {block.value || <span className="text-slate-400 italic">No entry</span>}
                    </p>
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="cursor-pointer group relative inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
            <span>Delete</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('edit-log', logId)}
            className="px-6 py-2.5 rounded-xl font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-100 animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-none w-max max-w-[calc(100vw-2rem)]">
          <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3.5 rounded-xl shadow-xl shadow-black/20 font-medium text-sm flex items-center gap-3 pointer-events-auto">
            <svg className="shrink-0" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span className="truncate">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}></div>
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Log?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                Are you sure you want to delete this log? This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 cursor-pointer px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteLog}
                  className="flex-1 cursor-pointer px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
