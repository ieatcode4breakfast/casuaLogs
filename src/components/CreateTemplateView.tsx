import { useState, useReducer } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { templateReducer } from '../reducers/templateReducer';

interface CreateTemplateViewProps {
  onNavigate: (view: 'home' | 'create-template') => void;
}

function SortableBlockItem({ id, isEditing, children }: { id: string; isEditing: boolean; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    setActivatorNodeRef
  } = useSortable({ id, disabled: isEditing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} className={`relative w-full group ${isDragging ? 'opacity-50' : ''}`}>
      {!isEditing && (
        <div 
          ref={setActivatorNodeRef} 
          {...attributes} 
          {...listeners} 
          className="absolute -left-6 top-1/2 -translate-y-1/2 p-1 cursor-grab active:cursor-grabbing touch-none text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 z-10 flex items-center justify-center outline-none"
          aria-label="Drag to reorder"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1.5"/><circle cx="9" cy="5" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>
        </div>
      )}
      {children}
    </div>
  );
}

export function CreateTemplateView({ onNavigate }: CreateTemplateViewProps) {
  const [menuState, setMenuState] = useState<'closed' | 'main' | 'header' | 'text' | 'configure-header' | 'configure-text' | 'configure-paragraph'>('closed');
  const [blocks, dispatch] = useReducer(templateReducer, []);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  
  const [pendingHeaderLevel, setPendingHeaderLevel] = useState<1 | 2 | 3 | null>(null);
  const [pendingTextType, setPendingTextType] = useState<'short' | 'short-label' | 'long' | 'long-label' | null>(null);
  const [pendingBlockText, setPendingBlockText] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((i) => i.id === active.id);
      const newIndex = blocks.findIndex((i) => i.id === over.id);
      dispatch({ type: 'REORDER_BLOCKS', payload: { fromIndex: oldIndex, toIndex: newIndex } });
    }
  };

  const handleHeaderSelect = (level: 1 | 2 | 3) => {
    setPendingHeaderLevel(level);
    setPendingBlockText('');
    setMenuState('configure-header');
  };

  const handleParagraphSelect = () => {
    setPendingBlockText('');
    setMenuState('configure-paragraph');
  };

  const handleTextSelect = (type: 'short' | 'short-label' | 'long' | 'long-label') => {
    if (type === 'short' || type === 'long') {
      dispatch({
        type: 'ADD_BLOCK',
        payload: {
          id: crypto.randomUUID(),
          type: 'text',
          inputType: type,
          label: ''
        }
      });
      setMenuState('closed');
    } else {
      setPendingTextType(type);
      setPendingBlockText('');
      setMenuState('configure-text');
    }
  };

  const confirmAddHeader = () => {
    if (!pendingBlockText.trim() || !pendingHeaderLevel) return;
    dispatch({
      type: 'ADD_BLOCK',
      payload: {
        id: crypto.randomUUID(),
        type: 'header',
        level: pendingHeaderLevel,
        text: pendingBlockText.trim()
      }
    });
    setMenuState('closed');
  };

  const confirmAddText = () => {
    if (!pendingBlockText.trim() || !pendingTextType) return;
    dispatch({
      type: 'ADD_BLOCK',
      payload: {
        id: crypto.randomUUID(),
        type: 'text',
        inputType: pendingTextType === 'short-label' ? 'short' : 'long',
        label: pendingBlockText.trim()
      }
    });
    setMenuState('closed');
  };

  const confirmAddParagraph = () => {
    if (!pendingBlockText.trim()) return;
    dispatch({
      type: 'ADD_BLOCK',
      payload: {
        id: crypto.randomUUID(),
        type: 'paragraph',
        text: pendingBlockText.trim()
      }
    });
    setMenuState('closed');
  };

  const handleSaveEdit = () => {
    if (!pendingBlockText.trim() || !editingBlockId) return;
    dispatch({
      type: 'UPDATE_BLOCK',
      payload: { id: editingBlockId, text: pendingBlockText.trim() }
    });
    setEditingBlockId(null);
  };

  return (
    <main className="max-w-3xl mx-auto md:px-6 py-6 md:py-12 flex flex-col min-h-[80vh]">
      <div className="flex items-center gap-4 px-6 md:px-0 mb-6 md:mb-8">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="cursor-pointer p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          aria-label="Go back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
        </button>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Create Template
        </h2>
      </div>

      <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-y md:border-x border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl shadow-blue-900/5 dark:shadow-black/20 p-6 md:p-8 flex flex-col">

        {/* Template Title Input */}
        <div className="mb-2">
          <label htmlFor="template-title" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Title
          </label>
          <input
            type="text"
            id="template-title"
            placeholder="e.g. Daily Workout, Meeting Notes..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Blocks Area */}
        <div className={`flex flex-col mb-6 ${blocks.length === 0 ? 'border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl items-center justify-center p-12 bg-slate-50/50 dark:bg-slate-950/50' : ''}`}>
          
          {blocks.length === 0 && (
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-6">No blocks added yet.</p>
          )}

          {blocks.length > 0 && (
            <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]} onDragEnd={handleDragEnd}>
              <div className="flex flex-col w-full mb-2">
                <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                  {blocks.map(block => (
                    <SortableBlockItem key={block.id} id={block.id} isEditing={editingBlockId === block.id}>
                      <div 
                        onClick={() => {
                          if (block.type === 'header') {
                            setEditingBlockId(block.id);
                            setPendingBlockText(block.text);
                            setPendingHeaderLevel(block.level);
                            setMenuState('closed');
                          } else if (block.type === 'text') {
                            setEditingBlockId(block.id);
                            setPendingBlockText(block.label);
                            setPendingTextType(block.inputType);
                            setMenuState('closed');
                          } else if (block.type === 'paragraph') {
                            setEditingBlockId(block.id);
                            setPendingBlockText(block.text);
                            setMenuState('closed');
                          }
                        }}
                        className={`flex flex-col gap-2 transition-all border border-transparent cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg -mx-4 px-4 w-full ${block.type === 'header' ? 'pt-6' : 'pt-2'}`}
                      >
                        {block.type === 'header' && (
                          <div className={`w-full wrap-break-word whitespace-pre-wrap text-slate-900 dark:text-white ${block.level === 1 ? 'text-3xl font-black tracking-tight' : block.level === 2 ? 'text-2xl font-bold tracking-tight' : 'text-xl font-bold'}`}>
                            {block.text}
                          </div>
                        )}
                        {block.type === 'paragraph' && (
                          <div className="w-full wrap-break-word whitespace-pre-wrap text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed">
                            {block.text}
                          </div>
                        )}
                        {block.type === 'text' && (
                          <div className="w-full flex flex-col gap-2 pointer-events-none">
                            {block.label && (
                              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 wrap-break-word whitespace-pre-wrap w-full">
                                {block.label}
                              </label>
                            )}
                            {block.inputType === 'short' ? (
                              <div className="w-full h-11 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center px-4">
                                <span className="text-slate-400 text-sm">Short text answer...</span>
                              </div>
                            ) : (
                              <div className="w-full h-24 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex">
                                <span className="text-slate-400 text-sm">Long text answer...</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>


                    </SortableBlockItem>
                  ))}
                </SortableContext>
              </div>
            </DndContext>
          )}

          {/* Add Block Button with Menu */}
          <div className="relative flex flex-col items-center">
            <button
              type="button"
              onClick={() => setMenuState(menuState === 'closed' ? 'main' : 'closed')}
              className="cursor-pointer group relative inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:scale-95 shadow-sm"
            >
              <svg className={`transition-transform duration-300 ${menuState !== 'closed' ? 'rotate-45' : 'group-hover:rotate-90'}`} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              <span>Add Block</span>
            </button>

          </div>
        </div>

        {/* Save Template Button */}
        <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            className="cursor-pointer group relative inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:scale-95"
          >
            <span>Save Template</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
          </button>
        </div>

      </div>

      {/* Global Edit Modal */}
      {editingBlockId && (
        (() => {
          const block = blocks.find(b => b.id === editingBlockId);
          if (!block) return null;
          return (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 dark:bg-black/40 backdrop-blur-sm"
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                  setEditingBlockId(null);
                }
              }}
            >
              <div className="w-full max-w-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                <div className="p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {block.type === 'header' ? `Edit Header ${block.level}` : block.type === 'paragraph' ? 'Edit Text' : `Edit ${block.inputType === 'short' ? 'Short' : 'Long'} Text Label`}
                    </label>
                    <button 
                      onClick={() => {
                        dispatch({ type: 'DELETE_BLOCK', payload: { id: block.id } });
                        setEditingBlockId(null);
                      }}
                      className="cursor-pointer text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 p-1.5 rounded-lg transition-colors"
                      aria-label="Delete block"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                  {block.type === 'paragraph' ? (
                    <textarea 
                      maxLength={1000}
                      value={pendingBlockText}
                      onChange={e => setPendingBlockText(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-25 resize-none"
                      autoFocus
                      placeholder="Enter text..."
                    />
                  ) : (
                    <input 
                      type="text" 
                      maxLength={50}
                      value={pendingBlockText}
                      onChange={e => setPendingBlockText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSaveEdit()}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      autoFocus
                      placeholder={block.type === 'header' ? "Enter header text..." : "Enter label..."}
                    />
                  )}
                  <div className="flex justify-end gap-3 mt-2">
                    <button onClick={() => setEditingBlockId(null)} className="cursor-pointer px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                    <button 
                      onClick={handleSaveEdit} 
                      disabled={!pendingBlockText.trim()}
                      className="cursor-pointer px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()
      )}
      {/* Global Add Block Modal */}
      {menuState !== 'closed' && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 dark:bg-black/40 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setMenuState('closed');
            }
          }}
        >
          <div className="w-full max-w-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white">
                Choose a Block
              </h3>
              <button 
                onClick={() => setMenuState('closed')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="flex flex-col">
              {menuState === 'main' && (
                <>
                  <button onClick={() => setMenuState('header')} className="px-5 py-4 text-left text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex justify-between items-center text-slate-700 dark:text-slate-200 cursor-pointer">
                    Header
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                  <button onClick={handleParagraphSelect} className="px-5 py-4 text-left text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex justify-between items-center border-t border-slate-100 dark:border-slate-700/50 text-slate-700 dark:text-slate-200 cursor-pointer">
                    Text
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                  <button onClick={() => setMenuState('text')} className="px-5 py-4 text-left text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex justify-between items-center border-t border-slate-100 dark:border-slate-700/50 text-slate-700 dark:text-slate-200 cursor-pointer">
                    Text Input
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </>
              )}
              {menuState === 'header' && (
                <>
                  <button onClick={() => setMenuState('main')} className="px-4 py-3 text-left text-xs font-bold text-slate-500 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700/50 flex items-center gap-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg> Back
                  </button>
                  <button onClick={() => handleHeaderSelect(1)} className="px-5 py-4 text-left text-2xl font-black tracking-tight hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-slate-900 dark:text-white cursor-pointer">Header 1</button>
                  <button onClick={() => handleHeaderSelect(2)} className="px-5 py-4 text-left text-xl font-bold tracking-tight hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-t border-slate-100 dark:border-slate-700/50 text-slate-800 dark:text-slate-100 cursor-pointer">Header 2</button>
                  <button onClick={() => handleHeaderSelect(3)} className="px-5 py-4 text-left text-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-t border-slate-100 dark:border-slate-700/50 text-slate-700 dark:text-slate-200 cursor-pointer">Header 3</button>
                </>
              )}
              {menuState === 'configure-header' && (
                <div className="p-5 flex flex-col gap-4">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Header {pendingHeaderLevel} Text
                  </label>
                  <input 
                    type="text" 
                    maxLength={50}
                    value={pendingBlockText}
                    onChange={e => setPendingBlockText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && confirmAddHeader()}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    autoFocus
                    placeholder="Enter header text..."
                  />
                  <div className="flex justify-end gap-3 mt-2">
                    <button onClick={() => setMenuState('header')} className="cursor-pointer px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Back</button>
                    <button 
                      onClick={confirmAddHeader} 
                      disabled={!pendingBlockText.trim()}
                      className="cursor-pointer px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}
              {menuState === 'text' && (
                <>
                  <button onClick={() => setMenuState('main')} className="px-4 py-3 text-left text-xs font-bold text-slate-500 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700/50 flex items-center gap-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg> Back
                  </button>
                  <button onClick={() => handleTextSelect('short')} className="px-5 py-4 text-left text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex flex-col gap-1 text-slate-700 dark:text-slate-200 cursor-pointer">
                    <span>Short Text</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">No label</span>
                  </button>
                  <button onClick={() => handleTextSelect('short-label')} className="px-5 py-4 text-left text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-t border-slate-100 dark:border-slate-700/50 flex flex-col gap-1 text-slate-700 dark:text-slate-200 cursor-pointer">
                    <span>Short Text with Label</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">Max 50 characters</span>
                  </button>
                  <button onClick={() => handleTextSelect('long')} className="px-5 py-4 text-left text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-t border-slate-100 dark:border-slate-700/50 flex flex-col gap-1 text-slate-700 dark:text-slate-200 cursor-pointer">
                    <span>Long Text</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">No label</span>
                  </button>
                  <button onClick={() => handleTextSelect('long-label')} className="px-5 py-4 text-left text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-t border-slate-100 dark:border-slate-700/50 flex flex-col gap-1 text-slate-700 dark:text-slate-200 cursor-pointer">
                    <span>Long Text with Label</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">Max 1000 characters</span>
                  </button>
                </>
              )}
              {menuState === 'configure-text' && (
                <div className="p-5 flex flex-col gap-4">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {pendingTextType === 'short' ? 'Short Text' : 'Long Text'} Label
                  </label>
                  <input 
                    type="text" 
                    maxLength={50}
                    value={pendingBlockText}
                    onChange={e => setPendingBlockText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && confirmAddText()}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    autoFocus
                    placeholder="e.g. Notes, Age..."
                  />
                  <div className="flex justify-end gap-3 mt-2">
                    <button onClick={() => setMenuState('text')} className="cursor-pointer px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Back</button>
                    <button 
                      onClick={confirmAddText} 
                      disabled={!pendingBlockText.trim()}
                      className="cursor-pointer px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}
              {menuState === 'configure-paragraph' && (
                <div className="p-5 flex flex-col gap-4">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Text
                  </label>
                  <textarea 
                    maxLength={1000}
                    value={pendingBlockText}
                    onChange={e => setPendingBlockText(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-25 resize-none"
                    autoFocus
                    placeholder="Enter text..."
                  />
                  <div className="text-xs text-right text-slate-400 -mt-2">{pendingBlockText.length}/1000</div>
                  <div className="flex justify-end gap-3 mt-2">
                    <button onClick={() => setMenuState('main')} className="cursor-pointer px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Back</button>
                    <button 
                      onClick={confirmAddParagraph} 
                      disabled={!pendingBlockText.trim()}
                      className="cursor-pointer px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
