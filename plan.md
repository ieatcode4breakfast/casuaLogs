## Goal Description
Enhance the user experience so that when a user creates a new template via the "Choose a template" view (SelectTemplateView), they are immediately redirected to create a new log with that template, skipping the Home screen.

## User Review Required
None.

## Open Questions
None.

## Proposed Changes

---
### Service Layer: Template Service
#### [MODIFY] src/services/templateService.ts
Update `saveTemplate` to return the ID of the created or updated template, rather than `void`.
**Diff (Conceptual):**
```diff
- export async function saveTemplate(payload: SaveTemplatePayload): Promise<void> {
+ export async function saveTemplate(payload: SaveTemplatePayload): Promise<string> {
...
      await set('templates', existing);
-      return;
+      return editingId;
    }
  }

  const newTemplate: Template = {
    id: crypto.randomUUID(),
...
  existing.push(newTemplate);
  await set('templates', existing);
+ return newTemplate.id;
}
```

#### [MODIFY] src/services/templateService.test.ts
Update the test that explicitly checks for a `void` return type from `saveTemplate`.
**Diff (Conceptual):**
```diff
-      await expect(saveTemplate({ name: 'Valid Name', blocks })).resolves.toBeUndefined();
+      await expect(saveTemplate({ name: 'Valid Name', blocks })).resolves.toEqual(expect.any(String));
```

---
### App State & Routing
#### [MODIFY] src/App.tsx
Add a `templateIntent` state so the application remembers *why* the user is creating a template. Update `handleNavigate` to intercept the navigation action from `SelectTemplateView` to `CreateTemplateView` and set the intent. Pass this intent to `CreateTemplateView`.

**Diff (Conceptual):**
```diff
  function App() {
    const [currentView, setCurrentView] = useState<ViewState>('home')
+   const [templateIntent, setTemplateIntent] = useState<'home' | 'create-log'>('home')

    const handleNavigate = (view: ViewState, id?: string) => {
+     if (view === 'create-template' && currentView === 'select-template' && !id) {
+       setTemplateIntent('create-log');
+     } else if (view === 'create-template') {
+       setTemplateIntent('home');
+     }
      setCurrentView(view)
```
```diff
-      {currentView === 'create-template' && <CreateTemplateView onNavigate={handleNavigate} editingTemplateId={editingTemplateId} />}
+      {currentView === 'create-template' && <CreateTemplateView onNavigate={handleNavigate} editingTemplateId={editingTemplateId} intent={templateIntent} />}
```

---
### UI: Create Template View
#### [MODIFY] src/components/CreateTemplateView.tsx
Accept the new `intent` prop. Capture the returned template ID from `saveTemplate` and execute conditional routing based on the intent.

**Diff (Conceptual):**
```diff
  interface CreateTemplateViewProps {
    onNavigate: (view: 'home' | 'create-template' | 'create-log', id?: string) => void;
    editingTemplateId?: string | null;
+   intent?: 'home' | 'create-log';
  }

- export function CreateTemplateView({ onNavigate, editingTemplateId }: CreateTemplateViewProps) {
+ export function CreateTemplateView({ onNavigate, editingTemplateId, intent = 'home' }: CreateTemplateViewProps) {

...
  const handleSave = async () => {
    try {
-     await saveTemplate({
+     const savedId = await saveTemplate({
        name,
        blocks,
        editingId: editingTemplateId
      });
-     onNavigate('home');
+     onNavigate(intent, intent === 'create-log' ? savedId : undefined);
    } catch (err: any) {
```

## Verification Plan
### Automated Tests
Run typechecks and unit tests to ensure `templateService.ts` passes with its new return type:
```bash
npx tsc --noEmit
npx vitest run
```

### Manual Verification
1. Navigate to the Home screen and click the "New Template" button in the Templates tab.
2. Build and save a template. Ensure it redirects back to the Home screen (testing the default intent).
3. Click "New Log" to open the Select Template view.
4. Click the "New" button in the Select Template view.
5. Build and save a template. Ensure it immediately redirects to the Create Log view with the new template active.
