import { useState, useEffect } from 'react';
import { getLogs, type Log } from '../services/logService';
import { ViewHeader } from './ViewHeader';

interface ViewLogViewProps {
  onNavigate: (view: 'home' | 'create-template' | 'select-template' | 'create-log' | 'view-log', id?: string) => void;
  logId: string;
}

export function ViewLogView({ onNavigate, logId }: ViewLogViewProps) {
  const [log, setLog] = useState<Log | null>(null);
  const [loading, setLoading] = useState(true);

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

        <div className="flex justify-between items-center pt-8 border-t border-slate-200 dark:border-slate-800">
          <span className="text-sm text-slate-500 font-medium">
            Created on {new Date(log.createdAt).toLocaleDateString()}
          </span>
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="px-6 py-2.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </main>
  );
}
