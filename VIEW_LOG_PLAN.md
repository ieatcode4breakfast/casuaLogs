# Implementation Plan: Clickable Log Previews

## Goal Description
The goal is to make existing log items in the HomeView list clickable. Clicking a log should open a read-only preview of that log's content (i.e. no active form inputs).

## Proposed Changes

### 1. `src/App.tsx`
- **Add `'view-log'`** to the `ViewState` type.
- Add `viewingLogId` to the state.
- Update `handleNavigate` to set `viewingLogId` when navigating to `'view-log'`.
- Render a new `<ViewLogView />` component when `currentView === 'view-log'`.

### 2. `src/components/HomeView.tsx`
- Update the `onNavigate` type in `HomeViewProps` to include `'view-log'`.
- Add an `onClick` handler to the log card mapping over `logs`.

### 3. `src/components/ViewLogView.tsx`
- Create a new component that fetches the specific log using `logId` from `idb-keyval` (via `getLogs` from `logService`).
- Display the log title as a heading.
- Render the `blocks` of the log as read-only elements:
  - Header: Render standard `<hX>` tags.
  - Text: Render the `label` as a small semi-bold title, and the `value` as plain text below it.
  - Paragraph: Render standard `<p>` tags.
- Provide a "Back" button to return to the home view.
- *Styling*: Utilize our standardized form spacing containers (`mb-6` outer wrapper, `mb-2` inner wrapper) to maintain a consistent visual rhythm.

## Verification Plan

### Automated Tests
None required. Per our internal rules (Rule 4.6), we exclude UI/Browser-based simulation tests. We will focus purely on manual verification of the component.

### Manual Verification
1. Launch the dev server.
2. Click on the log card in the Home tab.
3. Verify you see the log title and content statically (no text inputs or textareas are rendered).
4. Verify clicking "Back" returns to the list.
