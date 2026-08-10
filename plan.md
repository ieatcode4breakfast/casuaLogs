## Goal Description
The "Choose a template" empty state in `SelectTemplateView` appears full-bleed on mobile screens because its parent `<main>` container deliberately lacks horizontal padding to accommodate the `ViewHeader` component. Furthermore, the empty state containers across both `HomeView` and `SelectTemplateView` use `border-y md:border-x` alongside `rounded-3xl`, which causes the sides to clip or lose borders on mobile devices. We will standardize these empty states so they are contained (not full-bleed) and have fully continuous borders on all screen sizes.

## User Review Required
None.

## Open Questions
None.

## Proposed Changes

### 1. Fix Full-Bleed Empty State in SelectTemplateView
**File: `src/components/SelectTemplateView.tsx`**
- Remove `w-full` and replace `mx-auto` with `mx-4 md:mx-auto`. This natively applies a 16px side margin on mobile so the empty state is no longer full-bleed.
- Replace `border-y md:border-x` with a continuous `border`.

#### [MODIFY] src/components/SelectTemplateView.tsx
```diff
       {templates.length === 0 ? (
-        <div className="w-full md:max-w-md mx-auto px-6 py-10 md:p-10 flex flex-col items-center text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-y md:border-x border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl shadow-blue-900/5 dark:shadow-black/20">
+        <div className="mx-4 md:mx-auto md:max-w-md px-6 py-10 md:p-10 flex flex-col items-center text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl shadow-blue-900/5 dark:shadow-black/20">
           <div className="h-20 w-20 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6 shadow-inner">
```

### 2. Fix Clipped Borders in HomeView Empty States
**File: `src/components/HomeView.tsx`**
- For both the Logs and Templates empty state containers, replace `border-y md:border-x` with a continuous `border` so the rounded corners render properly on mobile. (The `w-full` class can stay here since `HomeView`'s `<main>` tag already applies `px-4` padding).

#### [MODIFY] src/components/HomeView.tsx
```diff
       {currentTab === 'logs' ? (
         logs.length === 0 ? (
-          <div className="w-full md:max-w-md mx-auto px-6 py-10 md:p-10 flex flex-col items-center text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-y md:border-x border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl shadow-blue-900/5 dark:shadow-black/20">
+          <div className="w-full md:max-w-md mx-auto px-6 py-10 md:p-10 flex flex-col items-center text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl shadow-blue-900/5 dark:shadow-black/20">
             <div className="h-20 w-20 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-6 shadow-inner">
...
       ) : templates.length === 0 ? (
-        <div className="w-full md:max-w-md mx-auto px-6 py-10 md:p-10 flex flex-col items-center text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-y md:border-x border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl shadow-blue-900/5 dark:shadow-black/20">
+        <div className="w-full md:max-w-md mx-auto px-6 py-10 md:p-10 flex flex-col items-center text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl shadow-blue-900/5 dark:shadow-black/20">
           <div className="h-20 w-20 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6 shadow-inner">
```

## Verification Plan

### Manual Verification
1. Open the application on a mobile viewport (or resize the browser window).
2. Navigate to `SelectTemplateView` when there are no templates. Verify that it is no longer full-bleed and has proper side margins.
3. Check `HomeView` (both Logs and Templates). Verify that all empty states now have continuous borders wrapped around their rounded corners on mobile.
