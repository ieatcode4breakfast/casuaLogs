import { useState, useEffect } from 'react'
import { HomeView } from './components/HomeView'
import { CreateTemplateView } from './components/CreateTemplateView'

export type ViewState = 'home' | 'create-template';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('home')
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null)
  
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('theme')
    if (stored === 'dark') return true
    if (stored === 'light') return false
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  const handleNavigate = (view: ViewState, id?: string) => {
    setCurrentView(view)
    if (view === 'create-template') {
      setEditingTemplateId(id || null)
    } else {
      setEditingTemplateId(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-200 dark:selection:bg-blue-800 transition-colors duration-300 select-none">
      <header className="sticky top-0 z-10 backdrop-blur-md bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/50 dark:border-slate-800/50 px-8 py-4 flex items-center justify-between shadow-sm">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => handleNavigate('home')}
        >
          <h1 className="font-dynapuff text-2xl font-bold tracking-tight text-blue-700 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
            casuaLogs
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setDark(d => !d)}
          aria-label="Toggle dark mode"
          className="cursor-pointer p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          {dark ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          )}
        </button>
      </header>

      {currentView === 'home' && <HomeView onNavigate={handleNavigate} />}
      {currentView === 'create-template' && <CreateTemplateView onNavigate={handleNavigate} editingTemplateId={editingTemplateId} />}
    </div>
  )
}

export default App
