# Implementation Plan: Copy Log to Clipboard

## Goal Description
The user requested a feature to copy the contents of a log during both the edit phase (`CreateLogView`) and the preview phase (`ViewLogView`). 

Since logs are composed of varied blocks (headers, paragraphs, text inputs, and checklists), we need a standardized way to convert these blocks into a clean, readable text format (Markdown is ideal for this as it formats well in most apps like Slack, Notion, or Discord). We will then add a "Copy" button to the action footers of both views.

## Proposed Changes

### 1. `src/utils/clipboard.ts` (New File)
We will create a new utility file to house the formatting and copying logic to keep the components clean.

#### [NEW] `src/utils/clipboard.ts`
```typescript
import { type LogBlock } from '../services/logService';

/**
 * Formats a log's title and blocks into a clean Markdown string.
 */
export function formatLogToMarkdown(title: string, blocks: LogBlock[]): string {
  let text = `# ${title || 'Untitled Log'}\n\n`;

  for (const block of blocks) {
    if (block.type === 'header') {
      const hashes = '#'.repeat(block.level + 1);
      text += `${hashes} ${block.text || 'Untitled Header'}\n\n`;
    } else if (block.type === 'paragraph') {
      text += `${block.text || ''}\n\n`;
    } else if (block.type === 'text') {
      text += `**${block.label}**\n${block.value || 'No entry'}\n\n`;
    } else if (block.type === 'checklist') {
      if (block.label) {
        text += `**${block.label}**\n`;
      }
      for (const item of block.items) {
        const checkbox = item.checked ? '[x]' : '[ ]';
        text += `- ${checkbox} ${item.text}\n`;
      }
      text += '\n';
    }
  }

  return text.trim();
}

/**
 * Copies text to the system clipboard.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
}
```

### 2. `src/components/ViewLogView.tsx`
Add a "Copy" button to the sticky action footer next to the "Edit" button.

#### [MODIFY] `ViewLogView.tsx`
- Import the new utility functions.
- Add a `handleCopy` function that triggers the copy and shows a success toast notification.
- Add the button to the footer:
```tsx
<button
  type="button"
  onClick={handleCopy}
  className="cursor-pointer px-6 py-2.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
>
  Copy
</button>
```

### 3. `src/components/CreateLogView.tsx`
Add a "Copy" button to the sticky action footer next to the "Save Log" button so users can extract text even before saving.

#### [MODIFY] `CreateLogView.tsx`
- Import the utility functions.
- Add a `handleCopy` function (which will pull from the current React state for `title` and `blocks`).
- Add the button to the footer layout, ensuring the layout remains balanced.

## Open Questions
- Does generating Markdown (e.g. using `#` for headers, `**` for bold labels, and `[x]` for checkboxes) align with how you expect the text to look when pasted elsewhere?

## Verification Plan
1. **Automated Check:** Run `npm run build` to ensure type safety.
2. **Manual Test:** 
   - Open an existing log in Preview and click "Copy". Paste it into a text editor to verify the markdown structure.
   - Open a log in Edit mode, make some changes, and click "Copy". Verify the pasted text reflects the *unsaved* changes.
