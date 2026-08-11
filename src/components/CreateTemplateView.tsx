import { useState, useReducer, useEffect, Fragment } from 'react';
import { get } from 'idb-keyval';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { templateReducer, type TemplateBlock } from '../reducers/templateReducer';
import { saveTemplate, deleteTemplate } from '../services/templateService';
import { ViewHeader } from './ViewHeader';

interface CreateTemplateViewProps {
  onNavigate: (view: 'home' | 'create-template' | 'create-log', id?: string) => void;
  editingTemplateId?: string | null;
  intent?: 'home' | 'create-log';
}

function SortableBlockItem({ id, isEditing, children }: { id: string; isEditing: boolean; children: (props: any) => React.ReactNode }) {
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
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} className={`relative w-full group ${isDragging ? 'opacity-50' : ''}`}>
      {children({ setActivatorNodeRef, attributes, listeners })}
    </div>
  );
}

export function CreateTemplateView({ onNavigate, editingTemplateId, intent = 'home' }: CreateTemplateViewProps) {
  const [menuState, setMenuState] = useState<'closed' | 'main' | 'header' | 'text' | 'configure-header' | 'configure-text' | 'configure-paragraph' | 'checklist' | 'configure-checklist'>('closed');
  const [blocks, dispatch] = useReducer(templateReducer, []);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [insertAfterId, setInsertAfterId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [pendingHeaderLevel, setPendingHeaderLevel] = useState<1 | 2 | 3 | null>(null);
  const [pendingTextType, setPendingTextType] = useState<'short' | 'short-label' | 'long' | 'long-label' | null>(null);
  const [pendingBlockText, setPendingBlockText] = useState('');
  const [pendingBlockLabel, setPendingBlockLabel] = useState('');

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

  useEffect(() => {
    if (editingTemplateId) {
      get('templates').then((templates: any[]) => {
        if (!templates) return;
        const template = templates.find(t => t.id === editingTemplateId);
        if (template) {
          setTemplateName(template.name);
          dispatch({ type: 'SET_BLOCKS', payload: template.blocks });
        }
      });
    }
  }, [editingTemplateId]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((i) => i.id === active.id);
      const newIndex = blocks.findIndex((i) => i.id === over.id);
      dispatch({ type: 'REORDER_BLOCKS', payload: { fromIndex: oldIndex, toIndex: newIndex } });
    }
  };

  const handleInsertAfter = (id: string) => {
    setInsertAfterId(id);
    setMenuState('main');
  };

  const handleDeleteTemplateClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteTemplate = async () => {
    if (!editingTemplateId) return;
    try {
      await deleteTemplate(editingTemplateId);
      onNavigate('home');
    } catch (e: any) {
      setToastMessage(e.message || "Failed to delete template");
      setTimeout(() => setToastMessage(null), 3000);
      setShowDeleteModal(false);
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

  const handleTextSelect = (type: 'short' | 'long') => {
    setPendingTextType(type);
    setPendingBlockText('');
    setMenuState('configure-text');
  };

  const confirmAddHeader = () => {
    if (!pendingBlockText.trim() || !pendingHeaderLevel) return;
    const block: TemplateBlock = {
      id: crypto.randomUUID(),
      type: 'header',
      level: pendingHeaderLevel,
      text: pendingBlockText.trim()
    };
    dispatch(insertAfterId
      ? { type: 'INSERT_BLOCK', payload: { afterId: insertAfterId, block } }
      : { type: 'ADD_BLOCK', payload: block });
    setInsertAfterId(null);
    setMenuState('closed');
  };

  const confirmAddText = () => {
    if (!pendingTextType) return;
    const block: TemplateBlock = {
      id: crypto.randomUUID(),
      type: 'text',
      inputType: pendingTextType as 'short' | 'long',
      label: pendingBlockText.trim()
    };
    dispatch(insertAfterId
      ? { type: 'INSERT_BLOCK', payload: { afterId: insertAfterId, block } }
      : { type: 'ADD_BLOCK', payload: block });
    setInsertAfterId(null);
    setMenuState('closed');
  };

  const confirmAddParagraph = () => {
    if (!pendingBlockText.trim()) return;
    const block: TemplateBlock = {
      id: crypto.randomUUID(),
      type: 'paragraph',
      text: pendingBlockText.trim()
    };
    dispatch(insertAfterId
      ? { type: 'INSERT_BLOCK', payload: { afterId: insertAfterId, block } }
      : { type: 'ADD_BLOCK', payload: block });
    setInsertAfterId(null);
    setMenuState('closed');
  };

  const handleChecklistSelect = () => {
    setPendingBlockLabel('');
    setPendingBlockText('');
    setMenuState('configure-checklist');
  };

  const confirmAddChecklist = () => {
    const items = pendingBlockText.split('\n').map(i => i.trim()).filter(i => i.length > 0);
    if (items.length === 0) return;
    const block: TemplateBlock = {
      id: crypto.randomUUID(),
      type: 'checklist',
      label: pendingBlockLabel.trim(),
      items
    };
    dispatch(insertAfterId
      ? { type: 'INSERT_BLOCK', payload: { afterId: insertAfterId, block } }
      : { type: 'ADD_BLOCK', payload: block });
    setInsertAfterId(null);
    setMenuState('closed');
  };

  const handleSaveEdit = () => {
    if (!editingBlockId) return;
    const block = blocks.find(b => b.id === editingBlockId);
    if (block?.type === 'checklist') {
      const items = pendingBlockText.split('\n').map(i => i.trim()).filter(i => i.length > 0);
      if (items.length === 0) return;
      dispatch({
        type: 'UPDATE_BLOCK',
        payload: { id: editingBlockId, text: pendingBlockLabel.trim(), items }
      });
      setEditingBlockId(null);
      return;
    }
    if (block?.type !== 'text' && !pendingBlockText.trim()) return;
    dispatch({
      type: 'UPDATE_BLOCK',
      payload: { id: editingBlockId, text: pendingBlockText.trim() }
    });
    setEditingBlockId(null);
  };

  const handleSaveTemplate = async () => {
    try {
      const savedId = await saveTemplate({
        name: templateName,
        blocks,
        editingId: editingTemplateId
      });
      onNavigate(intent, intent === 'create-log' ? savedId : undefined);
    } catch (e: any) {
      setToastMessage(e.message || "Failed to save template");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <main className="max-w-3xl mx-auto md:px-6 py-6 md:py-12 flex flex-col min-h-[80vh]">
      <ViewHeader 
        title={editingTemplateId ? 'Edit Template' : 'Create Template'} 
        onBack={() => onNavigate('home')} 
      />

      <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-y md:border-x border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl shadow-blue-900/5 dark:shadow-black/20 p-6 md:p-8 flex flex-col">

        {/* Template Title Input */}
        <div className="mb-2">
          <label htmlFor="template-name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Template Name
          </label>
          <input
            type="text"
            id="template-name"
            maxLength={100}
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="e.g. Daily Journal Entry, Meeting Notes..."
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
                  {blocks.map((block, index) => (
                    <Fragment key={block.id}>
                    <SortableBlockItem id={block.id} isEditing={editingBlockId === block.id}>
                      {(dragProps: any) => (
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
                            } else if (block.type === 'checklist') {
                              setEditingBlockId(block.id);
                              setPendingBlockLabel(block.label);
                              setPendingBlockText(block.items.join('\n'));
                              setMenuState('closed');
                            }
                          }}
                          className={`flex items-start transition-all border border-transparent cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl w-full py-2`}
                        >
                          {editingBlockId !== block.id && (
                            <div 
                              ref={dragProps.setActivatorNodeRef} 
                              {...dragProps.attributes} 
                              {...dragProps.listeners} 
                              className={`shrink-0 p-1 mr-2 cursor-grab active:cursor-grabbing touch-none text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 z-10 flex items-center justify-center outline-none ${block.type === 'header' ? (block.level === 1 ? 'mt-1' : 'mt-0.5') : 'mt-0'}`}
                              aria-label="Drag to reorder"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1.5"/><circle cx="9" cy="5" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>
                            </div>
                          )}
                          <div className="flex flex-col gap-2 w-full min-w-0 pr-2">
                            {block.type === 'header' && (
                              <div className={`w-full break-words whitespace-pre-wrap text-slate-900 dark:text-white ${block.level === 1 ? 'text-3xl font-black tracking-tight' : block.level === 2 ? 'text-2xl font-bold tracking-tight' : 'text-xl font-bold'}`}>
                                {block.text}
                              </div>
                            )}
                            {block.type === 'paragraph' && (
                              <div className="w-full break-words whitespace-pre-wrap text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed">
                                {block.text}
                              </div>
                            )}
                            {block.type === 'text' && (
                              <div className="w-full flex flex-col gap-2 pointer-events-none min-w-0">
                                {block.label && (
                                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 break-words whitespace-pre-wrap w-full">
                                    {block.label}
                                  </label>
                                )}
                                {block.inputType === 'short' ? (
                                  <div className="w-full h-11 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl"></div>
                                ) : (
                                  <div className="w-full h-24 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl"></div>
                                )}
                              </div>
                            )}
                            {block.type === 'checklist' && (
                              <div className="w-full flex flex-col gap-2 pointer-events-none min-w-0">
                                {block.label && (
                                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 break-words whitespace-pre-wrap w-full">
                                    {block.label}
                                  </label>
                                )}
                                <div className="flex flex-col gap-1.5">
                                  {block.items.map((item, i) => (
                                    <div key={i} className="flex items-start gap-2.5 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2">
                                      <div className="w-4 h-4 mt-0.5 shrink-0 rounded border-2 border-slate-300 dark:border-slate-600"></div>
                                      <span className="text-sm text-slate-600 dark:text-slate-300 break-words line-clamp-2 text-left">{item}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </SortableBlockItem>
                    {index < blocks.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleInsertAfter(block.id)}
                        aria-label={`Insert block after ${block.type}`}
                        className="group flex items-center justify-center w-full min-h-10 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                      >
                        <span className="flex items-center gap-2 w-full">
                          <span className="flex-1 h-px bg-slate-200 dark:bg-slate-800 group-hover:bg-blue-400/50 transition-colors" />
                          <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-all shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                          </span>
                          <span className="flex-1 h-px bg-slate-200 dark:bg-slate-800 group-hover:bg-blue-400/50 transition-colors" />
                        </span>
                      </button>
                    )}
                  </Fragment>
                  ))}
                </SortableContext>
              </div>
            </DndContext>
          )}

          {/* Add Block Button with Menu */}
          <div className="relative flex flex-col items-center mt-2">
            <button
              type="button"
              onClick={() => {
                setInsertAfterId(null);
                setMenuState(menuState === 'closed' ? 'main' : 'closed');
              }}
              className="cursor-pointer group relative inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:scale-95 shadow-sm"
            >
              <svg className={`transition-transform duration-300 ${menuState !== 'closed' ? 'rotate-45' : 'group-hover:rotate-90'}`} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              <span>Add Block</span>
            </button>

          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-6 z-20 flex justify-between items-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-black/40 mt-8">
          <div>
            {editingTemplateId && (
              <button
                type="button"
                onClick={handleDeleteTemplateClick}
                className="cursor-pointer group relative inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                <span>Delete</span>
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={handleSaveTemplate}
            className={`group relative inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold rounded-xl bg-blue-600 text-white dark:bg-blue-500 overflow-hidden transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
              !templateName.trim() || blocks.length === 0
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer hover:bg-blue-700 dark:hover:bg-blue-400 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95'
            }`}
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
              <div className="w-full max-w-sm max-h-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                <div className="p-5 flex flex-col gap-4 overflow-y-auto min-h-0">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {block.type === 'header' ? `Edit Header ${block.level}` : block.type === 'paragraph' ? 'Edit Text' : block.type === 'checklist' ? 'Edit Checklist' : `Edit ${block.inputType === 'short' ? 'Short' : 'Long'} Text Label`}
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
                    <>
                      <textarea 
                        maxLength={5000}
                        value={pendingBlockText}
                        onChange={e => setPendingBlockText(e.target.value)}
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
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-25 resize-none overflow-hidden"
                        autoFocus
                        placeholder="Enter text..."
                      />
                      <div className="text-xs text-right text-slate-400 -mt-2">{pendingBlockText.length}/5000</div>
                    </>
                  ) : block.type === 'checklist' ? (
                    <>
                      <input 
                        type="text" 
                        maxLength={50}
                        value={pendingBlockLabel}
                        onChange={e => setPendingBlockLabel(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="Enter label (optional)"
                      />
                      <div className="text-xs text-right text-slate-400 -mt-2">{pendingBlockLabel.length}/50</div>
                      <textarea 
                        maxLength={5000}
                        value={pendingBlockText}
                        onChange={e => setPendingBlockText(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-25 resize-none"
                        autoFocus
                        placeholder="One item per line..."
                      />
                      <div className="text-xs text-right text-slate-400 -mt-2">{pendingBlockText.split('\n').filter(i => i.trim()).length} items</div>
                    </>
                  ) : (
                    <>
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
                      <div className="text-xs text-right text-slate-400 -mt-2">{pendingBlockText.length}/50</div>
                    </>
                  )}
                  <div className="flex justify-end gap-3 mt-2">
                    <button onClick={() => setEditingBlockId(null)} className="cursor-pointer px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                    <button 
                      onClick={handleSaveEdit} 
                      disabled={block.type === 'checklist' ? !pendingBlockText.split('\n').some(i => i.trim()) : block.type !== 'text' && !pendingBlockText.trim()}
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
              setInsertAfterId(null);
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
                onClick={() => {
                  setInsertAfterId(null);
                  setMenuState('closed');
                }}
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
                  <button onClick={handleChecklistSelect} className="px-5 py-4 text-left text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex justify-between items-center border-t border-slate-100 dark:border-slate-700/50 text-slate-700 dark:text-slate-200 cursor-pointer">
                    Checklist
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
                  <div className="text-xs text-right text-slate-400 -mt-2">{pendingBlockText.length}/50</div>
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
                    <span>Short Text Input</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">max 50 chars</span>
                  </button>
                  <button onClick={() => handleTextSelect('long')} className="px-5 py-4 text-left text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-t border-slate-100 dark:border-slate-700/50 flex flex-col gap-1 text-slate-700 dark:text-slate-200 cursor-pointer">
                    <span>Long Text Input</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">max 5000 chars</span>
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
                    placeholder="Enter label"
                  />
                  <div className="text-xs text-right text-slate-400 -mt-2">{pendingBlockText.length}/50</div>
                  <div className="flex justify-end gap-3 mt-2">
                    <button onClick={() => setMenuState('text')} className="cursor-pointer px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Back</button>
                    <button 
                      onClick={confirmAddText} 
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
                    maxLength={5000}
                    value={pendingBlockText}
                    onChange={e => setPendingBlockText(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-25 resize-none"
                    autoFocus
                    placeholder="Enter text..."
                  />
                  <div className="text-xs text-right text-slate-400 -mt-2">{pendingBlockText.length}/5000</div>
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
              {menuState === 'configure-checklist' && (
                <div className="p-5 flex flex-col gap-4">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Checklist Label
                  </label>
                  <input 
                    type="text" 
                    maxLength={50}
                    value={pendingBlockLabel}
                    onChange={e => setPendingBlockLabel(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    autoFocus
                    placeholder="Enter label (optional)"
                  />
                  <div className="text-xs text-right text-slate-400 -mt-2">{pendingBlockLabel.length}/50</div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Checklist Items
                  </label>
                  <textarea 
                    maxLength={5000}
                    value={pendingBlockText}
                    onChange={e => setPendingBlockText(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-25 resize-none"
                    placeholder="One item per line..."
                  />
                  <div className="text-xs text-right text-slate-400 -mt-2">{pendingBlockText.split('\n').filter(i => i.trim()).length} items</div>
                  <div className="flex justify-end gap-3 mt-2">
                    <button onClick={() => setMenuState('main')} className="cursor-pointer px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Back</button>
                    <button 
                      onClick={confirmAddChecklist} 
                      disabled={!pendingBlockText.split('\n').some(i => i.trim())}
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
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Template?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                Are you sure you want to delete this template? This action cannot be undone.
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
                  onClick={confirmDeleteTemplate}
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
