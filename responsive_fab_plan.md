# Implementation Plan: Responsive Floating Action Menu (Speed Dial)

## Goal Description
The current sticky footer containing text-heavy action buttons ("Delete", "Copy", "Edit", "Save") breaks and overflows on small mobile screens (e.g., 320px width). The user proposed converting the footer into an expandable floating icon (a "Speed Dial" or "Floating Action Menu") on smaller screens. 

This plan details how to implement a responsive design where the standard sticky footer is preserved on tablets/desktops (`sm` screens and larger), but collapses into an expandable vertical Speed Dial on mobile screens.

## Proposed Changes

### Component Design (The Speed Dial)
We will introduce local state in each of the three views (`CreateLogView`, `CreateTemplateView`, and `ViewLogView`) to manage the open/closed state of the mobile action menu.

On mobile (`flex sm:hidden`), the UI will display a primary circular Floating Action Button (FAB) anchored to the bottom-right. When tapped, it will reveal a vertical stack of smaller circular icon buttons (Edit, Copy, Delete).

On desktop (`hidden sm:flex`), the existing glassmorphic sticky bar will be displayed, and the mobile FAB will be hidden.

### 1. `ViewLogView.tsx`
- Add `const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);`
- Hide the existing sticky footer on mobile by adding the `hidden sm:flex` classes.
- Add a new mobile-only `div` (`flex sm:hidden fixed bottom-6 right-6 flex-col items-end gap-3 z-50`) containing:
  - An expandable list of icon-only buttons (Delete, Copy, Edit) that appear when `isMobileMenuOpen` is true.
  - A primary toggle button (e.g., a multi-dot "More" icon or a Plus/Pencil icon) to toggle the state.

### 2. `CreateLogView.tsx`
- Add the same `isMobileMenuOpen` state.
- Hide the current sticky bar on mobile (`hidden sm:flex`).
- Add the mobile-only FAB menu containing the "Copy" and "Save" icon buttons.

### 3. `CreateTemplateView.tsx`
- Add the same `isMobileMenuOpen` state.
- Hide the current sticky bar on mobile (`hidden sm:flex`).
- Add the mobile-only FAB menu containing "Delete" (if editing), "Copy" (if we added it, wait—we didn't add copy to templates, only logs), and "Save Template".

### UI/UX Refinements
- The mobile icons will use clear, universally understood SVGs (Trash for Delete, Copy/Clipboard for Copy, Pencil for Edit, Floppy/Check for Save).
- The transition will be smooth (using Tailwind's `transition-all opacity-0 translate-y-4` classes for the expanding menu items).
- A backdrop (`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40`) can be added when the menu is open to focus the user's attention on the actions.

## Verification Plan
1. **Automated Test:** Run `npm run build` to verify type safety.
2. **Manual Test:** 
   - Open the app in a browser and use Developer Tools to simulate a 320px screen width (iPhone SE).
   - Verify that the standard sticky bar is hidden.
   - Tap the new floating action button to ensure the vertical menu expands smoothly.
   - Verify the actions (Copy, Edit, Delete, Save) still trigger their respective functions.
   - Resize the window to >640px to verify the standard sticky bar reappears and the FAB disappears.
