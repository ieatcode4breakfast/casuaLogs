import { get, set } from 'idb-keyval';
import { getUtcTimestamp } from '../utils/time';
import type { TemplateBlock } from '../reducers/templateReducer';

export interface SaveTemplatePayload {
  name: string;
  blocks: TemplateBlock[];
  editingId?: string | null;
}

export async function saveTemplate(payload: SaveTemplatePayload): Promise<void> {
  const { name, blocks, editingId } = payload;
  
  const trimmedName = name.trim();

  // 1. Schema Validation
  if (!trimmedName) {
    throw new Error('Template name is required and cannot be empty.');
  }
  if (trimmedName.length > 50) {
    throw new Error('Template name cannot exceed 50 characters.');
  }
  if (!blocks || blocks.length === 0) {
    throw new Error('Template must contain at least one block.');
  }

  // Length limits for blocks
  for (const block of blocks) {
    if (block.type === 'header' && block.text.length > 50) {
      throw new Error('Header/Short-text blocks cannot exceed 50 characters.');
    }
    if (block.type === 'text' && block.label.length > 50) {
      throw new Error('Text block labels cannot exceed 50 characters.');
    }
    if (block.type === 'paragraph' && block.text.length > 1000) {
      throw new Error('Paragraph blocks cannot exceed 1000 characters.');
    }
  }

  // 2. Fetch Existing
  const existing = (await get('templates')) || [];

  // 3. Upsert Logic
  if (editingId) {
    const index = existing.findIndex((t: any) => t.id === editingId);
    if (index !== -1) {
      existing[index] = {
        ...existing[index],
        name: trimmedName,
        blocks
      };
      await set('templates', existing);
      return;
    }
  }

  // Fallback to Create (or if editingId was not found)
  const newTemplate = {
    id: crypto.randomUUID(),
    name: trimmedName,
    createdAt: getUtcTimestamp(),
    blocks
  };
  
  existing.push(newTemplate);
  await set('templates', existing);
}
