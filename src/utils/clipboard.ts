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
