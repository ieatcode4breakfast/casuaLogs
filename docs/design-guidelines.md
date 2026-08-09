# Design Guidelines

## Responsive Design & Minimum Viewport
Our application follows a mobile-first styling approach mapping directly to Tailwind CSS breakpoints. We use the following named categories for communication and layout planning:

1. **"Legacy"**: `320px` to `359px` (Strictly for ensuring older devices like iPhone SE 1st gen don't horizontally scroll; UI must not break or obscure text).
2. **"Mobile"** (Base): `360px` to `639px` (Our primary mobile-first design target).
3. **"Phablet"** (`sm`): `640px` to `767px` (Large phones in landscape, small tablets).
4. **"Tablet"** (`md`): `768px` to `1023px` (Standard iPads, tablets in portrait).
5. **"Desktop"** (`lg` and up): `1024px` and above (Laptops, landscape tablets, and large screens).
