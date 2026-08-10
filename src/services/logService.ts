import { get, set } from 'idb-keyval';
import { getUtcTimestamp } from '../utils/time';

export type LogHeaderBlock = {
  id: string;
  type: 'header';
  level: 1 | 2 | 3;
  text: string;
};

export type LogParagraphBlock = {
  id: string;
  type: 'paragraph';
  text: string;
};

export type LogTextBlock = {
  id: string;
  type: 'text';
  inputType: 'short' | 'long';
  label: string;
  value: string;
};

export type LogBlock = LogHeaderBlock | LogParagraphBlock | LogTextBlock;

export interface Log {
  id: string;
  title: string;
  createdAt: string;
  updatedAt?: string;
  blocks: LogBlock[];
}

export interface SaveLogPayload {
  title: string;
  blocks: LogBlock[];
  editingId?: string | null;
}

export async function getLogs(): Promise<Log[]> {
  return (await get('logs')) || [];
}

export async function saveLog(payload: SaveLogPayload): Promise<void> {
  const { title, blocks, editingId } = payload;
  
  const trimmedTitle = title?.trim() || '';

  if (!trimmedTitle) {
    throw new Error('Log title is required.');
  }
  if (trimmedTitle.length > 100) {
    throw new Error('Log title cannot exceed 100 characters.');
  }

  if (!blocks || blocks.length === 0) {
    throw new Error('Log must contain at least one block.');
  }

  for (const block of blocks) {
    if (block.type === 'header' && block.text.length > 50) {
      throw new Error('Header/Short-text blocks cannot exceed 50 characters.');
    }
    if (block.type === 'text') {
      if (block.label.length > 50) throw new Error('Text block labels cannot exceed 50 characters.');
      if (block.inputType === 'short' && block.value.length > 50) throw new Error('Short text answers cannot exceed 50 characters.');
      if (block.inputType === 'long' && block.value.length > 5000) throw new Error('Long text answers cannot exceed 5000 characters.');
    }
    if (block.type === 'paragraph' && block.text.length > 5000) {
      throw new Error('Paragraph blocks cannot exceed 5000 characters.');
    }
  }

  const existing = await getLogs();

  if (editingId) {
    const index = existing.findIndex(l => l.id === editingId);
    if (index !== -1) {
      existing[index] = {
        ...existing[index],
        title: trimmedTitle,
        blocks,
        updatedAt: getUtcTimestamp()
      };
      await set('logs', existing);
      return;
    }
  }

  const timestamp = getUtcTimestamp();
  const newLog: Log = {
    id: crypto.randomUUID(),
    title: trimmedTitle,
    createdAt: timestamp,
    updatedAt: timestamp,
    blocks
  };
  
  existing.push(newLog);
  await set('logs', existing);
}

export async function deleteLog(id: string): Promise<void> {
  const existing = await getLogs();
  const filtered = existing.filter(l => l.id !== id);
  await set('logs', filtered);
}
