# Design Guidelines

## Responsive Design & Minimum Viewport
Our application follows a mobile-first styling approach mapping directly to Tailwind CSS breakpoints. We use the following named categories for communication and layout planning:

1. **"Legacy"**: `320px` to `359px` (Strictly for ensuring older devices like iPhone SE 1st gen don't horizontally scroll; UI must not break or obscure text).
2. **"Mobile"** (Base): `360px` to `639px` (Our primary mobile-first design target).
3. **"Phablet"** (`sm`): `640px` to `767px` (Large phones in landscape, small tablets).
4. **"Tablet"** (`md`): `768px` to `1023px` (Standard iPads, tablets in portrait).
5. **"Desktop"** (`lg` and up): `1024px` and above (Laptops, landscape tablets, and large screens).

### Component-Specific Limits

- **Long Text Inputs**: 
  - Legacy: `max-h-75`
  - Mobile: `max-h-100`
  - Phablet & up: `max-h-125`

## Vertical Spacing & Forms
To maintain a consistent visual rhythm across data-entry views (like Templates and Logs), adhere to the following vertical spacing rules:

- **Form Titles/Headers**: Wrap primary inputs (like Template Name or Log Title) in a container with a bottom margin of `mb-2`.
- **Main Block Containers**: The primary area holding dynamic blocks should be wrapped in an outer container with `mb-6` and an inner flex container with `mb-2`.
- **Bottom Actions (Save/Submit)**: The final action row should be separated by a top border using `pt-8 border-t border-slate-200 dark:border-slate-800`. Do not use additional top margins (`mt-4`, etc.) above this border.

## Full Bleed Form Containers
On Mobile viewports (screens below `sm` / `640px`), main form containers (like those in Template/Log creators) should adopt a "full bleed" pattern:
- The `<main>` wrapper should omit horizontal padding on mobile, using `md:px-6` instead of `px-4 md:px-6`.
- View Headers (containing the Title and Back button) that sit outside the form container must retain their padding via `px-6 md:px-0` so they align properly with the content on desktop but don't touch the edges on mobile.
