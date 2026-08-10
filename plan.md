## Goal Description
The "empty state" displays for Logs and Templates have inconsistent top margins, causing the Logs empty state card to sit lower on the page. The goal is to standardize the design by removing the extra margin from the Logs empty state so that it perfectly matches the tighter layout of the Templates empty state.

## User Review Required
None.

## Open Questions
None.

## Proposed Changes

### 1. Standardize Empty State Spacing
**File: `src/components/HomeView.tsx`**
- Remove the `mt-8 md:mt-12` utility classes from the empty Logs `<div>` container.

#### [MODIFY] src/components/HomeView.tsx
```diff
       {currentTab === 'logs' ? (
         logs.length === 0 ? (
-          <div className="w-full md:max-w-md mx-auto px-6 py-10 md:p-10 flex flex-col items-center text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-y md:border-x border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl shadow-blue-900/5 dark:shadow-black/20 mt-8 md:mt-12">
+          <div className="w-full md:max-w-md mx-auto px-6 py-10 md:p-10 flex flex-col items-center text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-y md:border-x border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl shadow-blue-900/5 dark:shadow-black/20">
             <div className="h-20 w-20 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-6 shadow-inner">
               <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
```

## Verification Plan

### Manual Verification
1. Open the application.
2. If there are existing logs, delete them or mock an empty state.
3. Switch between the "Logs" and "Templates" tabs.
4. Verify that the empty state cards for both tabs sit at the exact same vertical position relative to the tab buttons.
