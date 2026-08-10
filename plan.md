## Goal Description
The objective is to refine the inverted logo by changing its solid dark blue background to perfectly match the application's night mode background color. The application uses Tailwind's `slate-950` (`#020617` / RGB `2, 6, 23`). This will make the logo seamlessly blend into the navigation header when dark mode is active, while maintaining bold white linework.

## User Review Required
None. The user has pre-approved implementation via the `implementify` keyword.

## Proposed Changes

### Assets

#### [MODIFY] `logo.png`
I will regenerate the inverted logo using a modified script that mathematically maps the original white background to `slate-950` (`#020617`) and the linework to pure white. 

#### [MODIFY] `public/icon-64.png`
#### [MODIFY] `public/icon-180.png`
#### [MODIFY] `public/icon-192.png`
#### [MODIFY] `public/icon-512.png`
Overwrite all existing public icons with smoothly resized versions of the updated `slate-950` logo.

## Verification Plan

### Automated Tests
* None.

### Manual Verification
* Ensure `logo.png` and all `public/` icons have been successfully replaced.
* Verify visually that the logo background matches the `slate-950` dark mode background seamlessly.
