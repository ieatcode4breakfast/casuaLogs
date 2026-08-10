## Goal Description
Currently, because this is a Single Page Application (SPA), when a user clicks a button to navigate to a new view (like saving a log and going to the preview), the browser's scroll position remains exactly where it was (often at the bottom of the page). We want to reset the scroll position to the top of the page on every view change.

## User Review Required
None.

## Open Questions
None.

## Proposed Changes

---
### Routing Layer: App Component
#### [MODIFY] src/App.tsx
Update the global `handleNavigate` function to reset the scroll position to the top of the window every time the user navigates between views.

```typescript
  const handleNavigate = (view: ViewState, id?: string) => {
    window.scrollTo(0, 0); // Reset scroll position to top
    // ... existing logic ...
```

## Verification Plan
### Automated Tests
```bash
npx tsc --noEmit
```
### Manual Verification
1. Create a log that is long enough to require scrolling.
2. Scroll to the absolute bottom and click "Save Log".
3. Verify that when the preview loads (`ViewLogView`), the window is scrolled all the way to the top of the page.
4. Verify this behavior holds true when navigating anywhere else (e.g., clicking "Go Back" from the bottom of a view).
