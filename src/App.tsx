import { useState, useEffect } from 'react'

function App() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('theme')
    if (stored === 'dark') return true
    if (stored === 'light') return false
    // ponytail: jsdom has no matchMedia; default to light mode in that environment
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <div className="min-h-screen bg-maroon-50 text-maroon-950 dark:bg-maroon-950 dark:text-maroon-100 font-sans">
      <header className="flex items-center justify-between px-6 py-4 border-b border-maroon-200 dark:border-maroon-800">
        <h1 className="text-2xl font-semibold tracking-tight text-maroon-900 dark:text-maroon-100">
          My Templates
        </h1>
        <button
          type="button"
          onClick={() => setDark(d => !d)}
          className="px-3 py-1.5 text-sm rounded-md border border-maroon-300 dark:border-maroon-700 bg-maroon-100 dark:bg-maroon-800 text-maroon-900 dark:text-maroon-100 hover:bg-maroon-200 dark:hover:bg-maroon-700 transition-colors"
        >
          {dark ? 'Light' : 'Dark'}
        </button>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col items-center gap-6">
        <button
          type="button"
          className="px-6 py-3 text-base font-medium rounded-lg bg-maroon-600 text-white hover:bg-maroon-700 dark:bg-maroon-500 dark:hover:bg-maroon-400 dark:text-maroon-950 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-maroon-500"
        >
          + Add Template
        </button>
        <p className="text-maroon-400 dark:text-maroon-500 text-sm">
          No templates yet.
        </p>
      </main>
    </div>
  )
}

export default App
