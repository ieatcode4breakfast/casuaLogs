## Goal Description
The user wants to add an `updatedAt` timestamp to the `Log` schema so that edits can be tracked, and display both the "Created" and "Last Modified" dates stacked vertically on the preview cards across all views (`HomeView` for logs and templates, and `SelectTemplateView` for templates). 

## User Review Required
Please review the plan below. It standardizes the timestamp formatting directly inside the `Card` component for consistency and ensures both dates are explicitly displayed.

## Open Questions
None.

## Proposed Changes

### 1. Update Log Schema & Service
**File: `src/services/logService.ts`**
- Add `updatedAt?: string` to the `Log` interface.
- Update `saveLog()` to assign `updatedAt` during creation, and refresh it during edits.

#### [MODIFY] src/services/logService.ts
```diff
 export interface Log {
   id: string;
   title: string;
   createdAt: string;
+  updatedAt?: string;
   blocks: LogBlock[];
 }
 ...
   if (editingId) {
     const index = existing.findIndex(l => l.id === editingId);
     if (index !== -1) {
       existing[index] = {
         ...existing[index],
         title: trimmedTitle,
-        blocks
+        blocks,
+        updatedAt: getUtcTimestamp()
       };
       await set('logs', existing);
       return;
     }
   }

   const timestamp = getUtcTimestamp();
   const newLog: Log = {
     id: crypto.randomUUID(),
     title: trimmedTitle,
     createdAt: timestamp,
+    updatedAt: timestamp,
     blocks
   };
```

### 2. Standardize Card Component
**File: `src/components/Card.tsx`**
- Replace the single `date?: string` prop with explicit `createdAt?: string` and `updatedAt?: string` ISO strings.
- Render them vertically ("Created" on top of "Last Modified").

#### [MODIFY] src/components/Card.tsx
```diff
 export interface CardProps {
   title: string;
   onClick: () => void;
   color?: 'blue' | 'green';
-  date?: string;
+  createdAt?: string;
+  updatedAt?: string;
   leftFooterNode?: React.ReactNode;
 }

-export function Card({ title, onClick, color = 'blue', date, leftFooterNode }: CardProps) {
+export function Card({ title, onClick, color = 'blue', createdAt, updatedAt, leftFooterNode }: CardProps) {
...
-      <h3 className={`text-lg font-bold text-slate-900 dark:text-white transition-colors line-clamp-2 ${hoverColorClass} ${(date || leftFooterNode) ? 'mb-2' : ''}`}>
+      <h3 className={`text-lg font-bold text-slate-900 dark:text-white transition-colors line-clamp-2 ${hoverColorClass} ${(createdAt || updatedAt || leftFooterNode) ? 'mb-2' : ''}`}>
         {title}
       </h3>
-      {(date || leftFooterNode) && (
-        <div className={`text-sm text-slate-500 dark:text-slate-400 mt-auto flex items-center ${leftFooterNode ? 'justify-between' : 'justify-end'}`}>
-          {leftFooterNode && <span>{leftFooterNode}</span>}
-          {date && <span className="text-xs text-right font-medium">{date}</span>}
+      {(createdAt || updatedAt || leftFooterNode) && (
+        <div className={`mt-auto flex items-end ${leftFooterNode ? 'justify-between' : 'justify-end'}`}>
+          {leftFooterNode && <span className="text-sm text-slate-500 dark:text-slate-400">{leftFooterNode}</span>}
+          <div className="flex flex-col items-end gap-0.5 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
+            {createdAt && <span>Created: {new Date(createdAt).toLocaleDateString()}</span>}
+            {updatedAt && <span>Last Modified: {new Date(updatedAt).toLocaleDateString()}</span>}
+          </div>
         </div>
       )}
```

### 3. Update Call Sites and Sort Logic in HomeView
**File: `src/components/HomeView.tsx`**
- Change how dates are passed to `<Card>`.
- Expand `SortOption` to include `'created'`.
- Add a new `<option>` to the `<select>` inputs for Logs and Templates.
- Update the log and template sorting logic to support `'created'` explicitly sorting by `createdAt` descending.

#### [MODIFY] src/components/HomeView.tsx
```diff
-type SortOption = 'last-modified' | 'name';
+type SortOption = 'last-modified' | 'created' | 'name';
...
   const sortedLogs = [...logs].sort((a, b) => {
+    if (sortOption === 'created') {
+      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
+    }
+    const aTime = new Date(a.updatedAt || a.createdAt).getTime();
+    const bTime = new Date(b.updatedAt || b.createdAt).getTime();
     if (sortOption === 'name') {
       const nameCmp = (a.title || getLogPreview(a)).localeCompare(b.title || getLogPreview(b));
-      return nameCmp !== 0 ? nameCmp : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
+      return nameCmp !== 0 ? nameCmp : bTime - aTime;
     }
-    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
+    return bTime - aTime;
   });

   const sortedTemplates = [...templates].sort((a, b) => {
+    if (sortOption === 'created') {
+      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
+    }
     if (sortOption === 'name') {
       const nameCmp = a.name.localeCompare(b.name);
       if (nameCmp !== 0) return nameCmp;
       const aTime = new Date(a.updatedAt || a.createdAt).getTime();
       const bTime = new Date(b.updatedAt || b.createdAt).getTime();
       return bTime - aTime;
     }
     const aTime = new Date(a.updatedAt || a.createdAt).getTime();
     const bTime = new Date(b.updatedAt || b.createdAt).getTime();
     return bTime - aTime;
   });

... (Update both <select> blocks for Logs and Templates)
-               <select id="sort-logs" value={sortOption} onChange={(e) => setSortOption(e.target.value as SortOption)} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer">
+               <select id="sort-logs" value={sortOption} onChange={(e) => setSortOption(e.target.value as SortOption)} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer">
                  <option value="last-modified">Last Modified</option>
+                 <option value="created">Created Date</option>
                  <option value="name">Name</option>
                </select>

... (For Logs rendering)
               <Card
                 key={log.id}
                 title={preview}
                 onClick={() => onNavigate('view-log', log.id)}
                 color="blue"
-                date={`Last modified: ${new Date(log.createdAt).toLocaleDateString()}`}
+                createdAt={log.createdAt}
+                updatedAt={log.updatedAt || log.createdAt}
               />

... (For Templates rendering)
               <Card
                 key={template.id}
                 title={template.name}
                 onClick={() => onNavigate('create-template', template.id)}
                 color="green"
                 leftFooterNode={`${template.blocks.length} block${template.blocks.length !== 1 ? 's' : ''}`}
-                date={`Last modified: ${new Date(template.updatedAt || template.createdAt).toLocaleDateString()}`}
+                createdAt={template.createdAt}
+                updatedAt={template.updatedAt || template.createdAt}
               />
```

### 4. Update Call Sites in SelectTemplateView
**File: `src/components/SelectTemplateView.tsx`**
- Mirror the `SortOption` changes made in `HomeView`.

#### [MODIFY] src/components/SelectTemplateView.tsx
```diff
-type SortOption = 'last-modified' | 'name';
+type SortOption = 'last-modified' | 'created' | 'name';
...
   const sortedTemplates = [...templates].sort((a, b) => {
+    if (sortOption === 'created') {
+      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
+    }
     if (sortOption === 'name') {
...
-              <select id="sort-select-template" value={sortOption} onChange={(e) => setSortOption(e.target.value as SortOption)} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer">
+              <select id="sort-select-template" value={sortOption} onChange={(e) => setSortOption(e.target.value as SortOption)} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer">
                 <option value="last-modified">Last Modified</option>
+                <option value="created">Created Date</option>
                 <option value="name">Name</option>
               </select>
...
               <Card
                 key={template.id}
                 title={template.name}
                 onClick={() => onNavigate('create-log', template.id)}
                 color="blue"
-                date={`Last modified: ${new Date(template.updatedAt || template.createdAt).toLocaleDateString()}`}
+                createdAt={template.createdAt}
+                updatedAt={template.updatedAt || template.createdAt}
               />
```

### 5. Update Tests
**File: `src/services/logService.test.ts`**
Update the test assertions to ensure `updatedAt` is assigned and correctly modified, distinguishing it from `createdAt`.

## Verification Plan

### Automated Tests
Run `npx vitest run` to ensure tests verify the new `updatedAt` logic. Run `npx tsc --noEmit` to verify updated props in `Card.tsx`.

### Manual Verification
1. Navigate to `HomeView`.
2. Look at existing logs and templates. Verify that both "Created" and "Last Modified" are displayed on every card.
3. Edit an existing log and save it.
4. Verify that the "Last Modified" date updates to today, while the "Created" date remains the same.
5. Verify the logs list correctly sorts by the new "Last Modified" date.
