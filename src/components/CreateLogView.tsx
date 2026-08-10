import { useState, useEffect } from 'react';
import { getTemplates, type Template } from '../services/templateService';
import { saveLog, type LogBlock } from '../services/logService';

interface CreateLogViewProps {
  onNavigate: (view: 'home' | 'create-template' | 'select-template') => void;
  templateId: string;
}

export function CreateLogView({ onNavigate, templateId }: CreateLogViewProps) {
  const [template, setTemplate] = useState<Template | null>(null);
  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState<LogBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadTemplate() {
      try {
        const templates = await getTemplates();
        const found = templates.find(t => t.id === templateId);
        if (found) {
          setTemplate(found);
          setTitle(found.name);
          const initialBlocks: LogBlock[] = found.blocks.map(b => {
            if (b.type === 'text') {
              return { ...b, value: '' } as LogBlock;
            }
            return { ...b } as LogBlock;
          });
          setBlocks(initialBlocks);
        }
      } catch (e) {
        console.error('Failed to load template', e);
      } finally {
        setLoading(false);
      }
    }
    loadTemplate();
  }, [templateId]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleInputChange = (id: string, value: string) => {
    setBlocks(currentBlocks => 
      currentBlocks.map(b => 
        (b.id === id && b.type === 'text') ? { ...b, value } : b
      )
    );
  };

  const handleSaveLog = async () => {
    try {
      await saveLog({ title, blocks });
      onNavigate('home');
    } catch (e: any) {
      setToastMessage(e.message || "Failed to save log");
    }
  };

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto md:px-6 py-10 md:py-20 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
          <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
        </div>
      </main>
    );
  }

  if (!template) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10 text-center">
        <h2 className="text-xl font-bold text-red-500">Template not found</h2>
        <button onClick={() => onNavigate('select-template')} className="mt-4 text-blue-500 underline">Go Back</button>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5 z-50">
          <svg className="text-red-500" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p className="font-medium text-sm">{toastMessage}</p>
        </div>
      )}

      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => onNavigate('select-template')}
          className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
          title="Back to Templates"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          New Log
        </h2>
      </div>

      <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-y md:border-x border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl shadow-blue-900/5 dark:shadow-black/20 p-6 md:p-8 flex flex-col mb-2">
        <div className="mb-2">
          <label htmlFor="log-title" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Log Title
          </label>
          <input
            type="text"
            id="log-title"
            maxLength={100}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Log Title"
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        <div className="flex flex-col mb-6">
          <div className="flex flex-col w-full mb-2">
        {blocks.map((block) => {
          if (block.type === 'header') {
            const HTag = `h${block.level + 1}` as any;
            const sizeClass = block.level === 1 ? 'text-2xl' : block.level === 2 ? 'text-xl' : 'text-lg';
            return (
              <div key={block.id} className="py-2">
                <HTag className={`${sizeClass} font-bold text-slate-900 dark:text-white`}>
                  {block.text || 'Untitled Header'}
                </HTag>
              </div>
            );
          }

          if (block.type === 'paragraph') {
            return (
              <div key={block.id} className="py-2">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {block.text || 'Empty paragraph...'}
                </p>
              </div>
            );
          }

          if (block.type === 'text') {
            return (
              <div key={block.id} className="py-2 flex flex-col gap-2">
                <label htmlFor={`input-${block.id}`} className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {block.label}
                </label>
                {block.inputType === 'short' ? (
                  <div>
                    <input
                      id={`input-${block.id}`}
                      type="text"
                      maxLength={50}
                      value={block.value}
                      onChange={(e) => handleInputChange(block.id, e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    />
                    <div className="text-xs text-right text-slate-400 mt-1">{block.value.length}/50</div>
                  </div>
                ) : (
                  <div>
                    <textarea
                      id={`input-${block.id}`}
                      maxLength={5000}
                      value={block.value}
                      onChange={(e) => handleInputChange(block.id, e.target.value)}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = `${target.scrollHeight}px`;
                      }}
                      ref={(el) => {
                        if (el && !el.dataset.initialized) {
                          el.dataset.initialized = 'true';
                          el.style.height = 'auto';
                          el.style.height = `${el.scrollHeight}px`;
                        }
                      }}
                      rows={4}
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none min-h-25 max-[359px]:max-h-75 max-h-100 sm:max-h-125 overflow-y-auto"
                    />
                    <div className="text-xs text-right text-slate-400 mt-1">{block.value.length}/5000</div>
                  </div>
                )}
              </div>
            );
          }

          return null;
        })}
          </div>
        </div>

        <div className="flex justify-end pt-8 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={handleSaveLog}
            className="cursor-pointer group relative inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            <span>Save Log</span>
          </button>
        </div>
      </div>
    </main>
  );
}
