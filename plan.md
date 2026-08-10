## Goal Description
The goal is to update the date display for both the log list and template list on the Home view. Currently, they display dates in different formats (e.g., just the date for logs, and "Created:" / "(Edited:)" for templates). The requirement is to change both lists to only display "Last modified: <date>", using the user's local timezone. Tests are intentionally omitted per the request.

## Proposed Changes

### `src/components/HomeView.tsx`
We will update how dates are rendered in the log list and template list. For logs, since there is no `updatedAt` field, we will use `createdAt`. For templates, we will use `updatedAt` if it exists, otherwise `createdAt`. 

#### [MODIFY] HomeView.tsx
```tsx
// For logs (around line 127)
-                      <span className="text-xs text-right font-medium">
-                        {new Date(log.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
-                      </span>
+                      <span className="text-xs text-right font-medium">
+                        Last modified: {new Date(log.createdAt).toLocaleDateString()}
+                      </span>
```

```tsx
// For templates (around line 181)
-                  <span className="text-xs text-right">
-                    Created: {new Date(template.createdAt).toLocaleDateString()}
-                    {template.updatedAt && template.updatedAt !== template.createdAt && (
-                      <span className="ml-1 opacity-80 block">(Edited: {new Date(template.updatedAt).toLocaleDateString()})</span>
-                    )}
-                  </span>
+                  <span className="text-xs text-right">
+                    Last modified: {new Date(template.updatedAt || template.createdAt).toLocaleDateString()}
+                  </span>
```

## Verification Plan
### Manual Verification
- Open the application and go to the Home view.
- Verify that under the "Logs" tab, each log card displays "Last modified: <date>" at the bottom right.
- Switch to the "Templates" tab and verify that each template card displays "Last modified: <date>" at the bottom right, using the `updatedAt` date if it was edited, or the `createdAt` date if it wasn't.
- Ensure the dates are correctly formatted for the local timezone (which `toLocaleDateString()` handles natively).
