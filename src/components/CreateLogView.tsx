import { useState, useEffect } from 'react';
import { getTemplates } from '../services/templateService';
import { getLogs, saveLog, type LogBlock } from '../services/logService';
import { ViewHeader } from './ViewHeader';

interface CreateLogViewProps {
  onNavigate: (view: 'home' | 'create-template' | 'select-template' | 'view-log', id?: string) => void;
  templateId?: string;
  editingLogId?: string;
}

export function CreateLogView({ onNavigate, templateId, editingLogId }: CreateLogViewProps) {
  const [isReady, setIsReady] = useState(false);
  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState<LogBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadTemplate() {
      try {
        if (editingLogId) {
          const logs = await getLogs();
          const log = logs.find(l => l.id === editingLogId);
          if (log) {
            setTitle(log.title);
            setBlocks(log.blocks);
            setIsReady(true);
          }
        } else if (templateId) {
          const templates = await getTemplates();
          const found = templates.find(t => t.id === templateId);
          if (found) {
            setTitle(found.name);
            const initialBlocks: LogBlock[] = found.blocks.map(b => {
              if (b.type === 'text') {
                return { ...b, value: '' } as LogBlock;
              }
              if (b.type === 'checklist') {
                return { ...b, items: b.items.map(item => ({ text: item, checked: false })) } as LogBlock;
              }
              return { ...b } as LogBlock;
            });
            setBlocks(initialBlocks);
            setIsReady(true);
          }
        }
      } catch (e) {
        console.error('Failed to load template', e);
      } finally {
        setLoading(false);
      }
    }
    loadTemplate();
  }, [templateId, editingLogId]);

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

  const handleCheckToggle = (blockId: string, itemIndex: number) => {
    setBlocks(currentBlocks =>
      currentBlocks.map(b =>
        (b.id === blockId && b.type === 'checklist')
          ? { ...b, items: b.items.map((item, i) => i === itemIndex ? { ...item, checked: !item.checked } : item) }
          : b
      )
    );
  };

  const handleSaveLog = async () => {
    try {
      const savedId = await saveLog({ title, blocks, editingId: editingLogId });
      onNavigate('view-log', savedId);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to save log";
      setToastMessage(message);
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

  if (!isReady) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10 text-center">
        <h2 className="text-xl font-bold text-red-500">Template not found</h2>
        <button onClick={() => onNavigate('select-template')} className="mt-4 text-blue-500 underline">Go Back</button>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto md:px-6 py-8 md:py-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5 z-50">
          <svg className="text-red-500" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p className="font-medium text-sm">{toastMessage}</p>
        </div>
      )}

      <ViewHeader 
        title={editingLogId ? "Edit Log" : "New Log"} 
        onBack={() => editingLogId ? onNavigate('view-log', editingLogId) : onNavigate('select-template')} 
        backTitle={editingLogId ? "Back to Log" : "Back to Templates"}
      />

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
                <HTag className={`${sizeClass} font-bold text-slate-900 dark:text-white break-words`}>
                  {block.text || 'Untitled Header'}
                </HTag>
              </div>
            );
          }

          if (block.type === 'paragraph') {
            return (
              <div key={block.id} className="py-2">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
                  {block.text || 'Empty paragraph...'}
                </p>
              </div>
            );
          }

          if (block.type === 'text') {
            return (
              <div key={block.id} className="py-2 flex flex-col gap-2">
                <label htmlFor={`input-${block.id}`} className="text-sm font-semibold text-slate-700 dark:text-slate-300 break-words">
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

          if (block.type === 'checklist') {
            return (
              <div key={block.id} className="py-2 flex flex-col gap-2">
                {block.label && (
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 break-words">
                    {block.label}
                  </label>
                )}
                <div className="flex flex-col gap-1.5">
                  {block.items.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleCheckToggle(block.id, i)}
                      className="flex items-start gap-2.5 text-left bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 hover:border-blue-500 hover:ring-2 hover:ring-blue-500/20 transition-all cursor-pointer"
                    >
                      <span className={`w-4 h-4 mt-0.5 shrink-0 rounded border-2 flex items-center justify-center transition-colors ${item.checked ? 'bg-blue-600 border-blue-600' : 'border-slate-300 dark:border-slate-600'}`}>
                        {item.checked && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        )}
                      </span>
                      <span className={`text-sm break-words line-clamp-2 text-left ${item.checked ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                        {item.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          }

          return null;
        })}
          </div>
        </div>

        <div className="sticky bottom-6 z-20 flex justify-end bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-black/40 mt-8">
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
