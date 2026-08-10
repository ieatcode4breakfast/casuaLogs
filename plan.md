## Background and Execution Context
The application allows users to create logs based on templates, but currently lacks the ability to edit a log after it has been created. A log is immutable once saved because the UI in `ViewLogView` only provides a "Done" button to exit, and the `logService.ts` only supports appending new logs.

The goal is to introduce log editing capability. Importantly, this feature must strictly bypass the template system: when editing a log, the application must load the exact block snapshot saved within the log itself, not the template it was originally derived from. This ensures that historical logs remain intact even if their originating template was altered or deleted.

To accomplish this, we will introduce an `edit-log` state to the router (`App.tsx`), swap the exit button in `ViewLogView` with an "Edit" button, upgrade `CreateLogView` to handle both creation and editing depending on the presence of a `templateId` or `editingLogId`, and modify `logService.ts` to support UPSERT operations.

## Proposed Changes

### 1. Update the Service Layer to Support Upsert
**File: `src/services/logService.ts`**
- Modify `SaveLogPayload` interface to accept an optional `editingId`.
- Modify `saveLog` function. Instead of unconditionally pushing a new log to the IndexedDB array, it should first check if `editingId` is provided. If so, it finds the index of the log with that ID and overwrites the `title` and `blocks`, leaving `createdAt` and `id` untouched.

#### [MODIFY] src/services/logService.ts
```diff
 export interface SaveLogPayload {
   title: string;
   blocks: LogBlock[];
+  editingId?: string | null;
 }

 export async function saveLog(payload: SaveLogPayload): Promise<void> {
-  const { title, blocks } = payload;
+  const { title, blocks, editingId } = payload;
...
   const existing = await getLogs();
+  
+  if (editingId) {
+    const index = existing.findIndex(l => l.id === editingId);
+    if (index !== -1) {
+      existing[index] = {
+        ...existing[index],
+        title: trimmedTitle,
+        blocks
+      };
+      await set('logs', existing);
+      return;
+    }
+  }

   const timestamp = getUtcTimestamp();
```

### 2. Update Router State
**File: `src/App.tsx`**
- Append `'edit-log'` to the exported `ViewState` type union.
- In `handleNavigate`, add an `else if (view === 'edit-log')` block. This block should set `viewingLogId` to the provided ID and clear out `editingTemplateId` and `selectedTemplateId`.
- In the render block at the bottom, add a new conditional render for `'edit-log'`. It should render the `<CreateLogView>` component but pass `editingLogId={viewingLogId}` instead of `templateId`.

#### [MODIFY] src/App.tsx
```diff
-export type ViewState = 'home' | 'create-template' | 'select-template' | 'create-log' | 'view-log';
+export type ViewState = 'home' | 'create-template' | 'select-template' | 'create-log' | 'view-log' | 'edit-log';

... (in handleNavigate)
+    } else if (view === 'edit-log') {
+      setViewingLogId(id || null)
+      setEditingTemplateId(null)
+      setSelectedTemplateId(null)

... (in render)
       {currentView === 'create-log' && selectedTemplateId && <CreateLogView onNavigate={handleNavigate} templateId={selectedTemplateId} />}
+      {currentView === 'edit-log' && viewingLogId && <CreateLogView onNavigate={handleNavigate} editingLogId={viewingLogId} />}
       {currentView === 'view-log' && viewingLogId && <ViewLogView onNavigate={handleNavigate} logId={viewingLogId} />}
```

### 3. Adapt CreateLogView for Dual-Purpose (Create & Edit)
**File: `src/components/CreateLogView.tsx`**
- Update `CreateLogViewProps` so `templateId` is optional (`templateId?: string`) and `editingLogId?: string` is added.
- The component currently uses a `template` state variable to determine if it is ready to render the form. Replace this with a simple boolean `isReady` state initialized to `false`.
- In the `loadTemplate` `useEffect`:
  - If `editingLogId` is present, await `getLogs()`, find the target log, and directly load `log.title` and `log.blocks` into state. Set `isReady` to true. This completely ignores templates.
  - Else if `templateId` is present, retain the current logic (fetch templates, build initial blocks with empty string values). Set `isReady` to true.
- In the main render block, change the fallback condition from `if (!template)` to `if (!isReady)`.
- Update the `ViewHeader` title to dynamically read `"Edit Log"` when `editingLogId` is present, or `"New Log"` otherwise.
- In the `handleSaveLog` function, pass `editingId: editingLogId` into the `saveLog` payload.

#### [MODIFY] src/components/CreateLogView.tsx
```typescript
 interface CreateLogViewProps {
-  onNavigate: (view: 'home' | 'create-template' | 'select-template') => void;
-  templateId: string;
+  onNavigate: (view: 'home' | 'create-template' | 'select-template' | 'view-log', id?: string) => void;
+  templateId?: string;
+  editingLogId?: string;
 }

 export function CreateLogView({ onNavigate, templateId, editingLogId }: CreateLogViewProps) {
-  const [template, setTemplate] = useState<Template | null>(null);
+  const [isReady, setIsReady] = useState(false);
...
   useEffect(() => {
     async function loadData() {
       try {
+        if (editingLogId) {
+          const logs = await getLogs();
+          const log = logs.find(l => l.id === editingLogId);
+          if (log) {
+            setTitle(log.title);
+            setBlocks(log.blocks);
+            setIsReady(true);
+          }
+        } else if (templateId) {
           const templates = await getTemplates();
           const found = templates.find(t => t.id === templateId);
           if (found) {
             setTitle(found.name);
             const initialBlocks: LogBlock[] = found.blocks.map(b => {
               if (b.type === 'text') {
                 return { ...b, value: '' } as LogBlock;
               }
               return { ...b } as LogBlock;
             });
             setBlocks(initialBlocks);
+            setIsReady(true);
           }
+        }
...
-  if (!template) {
+  if (!isReady) {
...
       <ViewHeader 
-        title="New Log" 
+        title={editingLogId ? "Edit Log" : "New Log"} 
...
   const handleSaveLog = async () => {
     try {
-      await saveLog({ title, blocks });
+      await saveLog({ title, blocks, editingId: editingLogId });
       onNavigate('home');
```

### 4. Wire the Edit Button in the Log Viewer
**File: `src/components/ViewLogView.tsx`**
- Locate the "Done" button at the bottom of the log viewer.
- Change its label to "Edit".
- Update its `onClick` handler to navigate to `'edit-log'` instead of `'home'`, passing the current `logId`.
- Update its styling to use a primary blue color to indicate it is a primary action, distinguishing it from a generic back/done button.

#### [MODIFY] src/components/ViewLogView.tsx
```diff
           <button
             type="button"
-            onClick={() => onNavigate('home')}
-            className="px-6 py-2.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
+            onClick={() => onNavigate('edit-log', logId)}
+            className="px-6 py-2.5 rounded-xl font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors"
           >
-            Done
+            Edit
           </button>
```

### 5. Add Unit Tests for Upsert Logic
**File: `src/services/logService.test.ts`**
- Create a new test file using `vitest` to verify the new update behavior.
- We will mock `idb-keyval` to simulate the database state.
- Test that when `saveLog` is called with an `editingId`, the existing log is updated (blocks and title) but the `createdAt` and `id` remain exactly the same.
- Test that it throws an error or handles it gracefully if the `editingId` isn't found.

#### [NEW] src/services/logService.test.ts
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveLog } from './logService';
import * as idbKeyval from 'idb-keyval';

vi.mock('idb-keyval', () => ({
  get: vi.fn(),
  set: vi.fn()
}));

describe('saveLog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates an existing log when editingId is provided', async () => {
    const existingLog = {
      id: 'log-123',
      title: 'Original Title',
      createdAt: '2023-01-01T00:00:00.000Z',
      blocks: []
    };

    vi.mocked(idbKeyval.get).mockResolvedValue([existingLog]);

    await saveLog({
      title: 'Updated Title',
      blocks: [{ id: 'b1', type: 'paragraph', text: 'New content' }],
      editingId: 'log-123'
    });

    const setCall = vi.mocked(idbKeyval.set).mock.calls[0];
    expect(setCall[0]).toBe('logs');
    
    const updatedLogs = setCall[1];
    expect(updatedLogs).toHaveLength(1);
    expect(updatedLogs[0].id).toBe('log-123'); // ID unchanged
    expect(updatedLogs[0].createdAt).toBe('2023-01-01T00:00:00.000Z'); // Created at unchanged
    expect(updatedLogs[0].title).toBe('Updated Title'); // Title updated
    expect(updatedLogs[0].blocks[0].text).toBe('New content'); // Blocks updated
  });
});
```

## Verification Plan

### Automated Tests
Run `npx tsc --noEmit` to ensure type definitions (like `ViewState` and `SaveLogPayload`) have been consistently applied and no TypeScript errors emerge.

### Manual Verification
1. Execute `npm run dev`.
2. Click on an existing log to view it in `ViewLogView`.
3. Scroll to the bottom and click the new blue "Edit" button.
4. Verify the screen transitions to the editing mode, with "Edit Log" in the top header.
5. Verify the input fields are pre-populated exclusively with the log's existing data (no dependencies on templates).
6. Change the Log Title and one of the text block contents.
7. Click "Save Log".
8. Verify you are redirected Home.
9. Open the log again and verify your edits persisted.
10. Ensure that a duplicate log was NOT created (verify the total log count remains exactly the same).
