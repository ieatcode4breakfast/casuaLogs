import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveTemplate, getTemplates, deleteTemplate } from './templateService';
import * as idb from 'idb-keyval';
import type { TemplateBlock } from '../reducers/templateReducer';

vi.mock('idb-keyval', () => ({
  get: vi.fn(),
  set: vi.fn(),
}));

vi.mock('../utils/time', () => ({
  getUtcTimestamp: vi.fn(() => '2026-08-10T12:00:00.000Z'),
}));

describe('templateService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Read (getTemplates)', () => {
    it('returns templates without patching legacy data', async () => {
      const legacyTemplate = { id: 'old-1', name: 'Legacy', createdAt: '2020-01-01T00:00:00.000Z', blocks: [] };
      vi.mocked(idb.get).mockResolvedValueOnce([legacyTemplate]);

      const result = await getTemplates();
      
      expect(idb.get).toHaveBeenCalledWith('templates');
      expect(result).toHaveLength(1);
      expect(result[0].updatedAt).toBeUndefined();
    });

    it('returns empty array if no data', async () => {
      vi.mocked(idb.get).mockResolvedValueOnce(undefined);
      const result = await getTemplates();
      expect(result).toEqual([]);
    });
  });

  describe('Validation', () => {
    it('throws if template name is empty', async () => {
      await expect(saveTemplate({ name: '   ', blocks: [{ id: '1', type: 'paragraph', text: 'hi' }] }))
        .rejects.toThrow('Template name is required.');
    });

    it('throws if template name exceeds 100 characters', async () => {
      await expect(saveTemplate({ name: 'a'.repeat(101), blocks: [{ id: '1', type: 'paragraph', text: 'hi' }] }))
        .rejects.toThrow('Template name cannot exceed 100 characters.');
    });

    it('throws if template has zero blocks', async () => {
      await expect(saveTemplate({ name: 'Valid Name', blocks: [] }))
        .rejects.toThrow('Template must contain at least one block.');
    });

    it('throws if a header block exceeds 50 characters', async () => {
      const blocks: TemplateBlock[] = [{ id: '1', type: 'header', level: 1, text: 'a'.repeat(51) }];
      await expect(saveTemplate({ name: 'Valid Name', blocks }))
        .rejects.toThrow('Header/Short-text blocks cannot exceed 50 characters.');
    });

    it('throws if a text block (short) label exceeds 50 characters', async () => {
      const blocks: TemplateBlock[] = [{ id: '1', type: 'text', inputType: 'short', label: 'a'.repeat(51) }];
      await expect(saveTemplate({ name: 'Valid Name', blocks }))
        .rejects.toThrow('Text block labels cannot exceed 50 characters.');
    });

    it('throws if a text block (long) label exceeds 50 characters', async () => {
      const blocks: TemplateBlock[] = [{ id: '1', type: 'text', inputType: 'long', label: 'a'.repeat(51) }];
      await expect(saveTemplate({ name: 'Valid Name', blocks }))
        .rejects.toThrow('Text block labels cannot exceed 50 characters.');
    });

    it('throws if a paragraph block exceeds 5000 characters', async () => {
      const blocks: TemplateBlock[] = [{ id: '1', type: 'paragraph', text: 'a'.repeat(5001) }];
      await expect(saveTemplate({ name: 'Valid Name', blocks }))
        .rejects.toThrow('Paragraph blocks cannot exceed 5000 characters.');
    });

    it('throws if a checklist label exceeds 50 characters', async () => {
      const blocks: TemplateBlock[] = [{ id: '1', type: 'checklist', label: 'a'.repeat(51), items: ['A'] }];
      await expect(saveTemplate({ name: 'Valid Name', blocks }))
        .rejects.toThrow('Checklist label cannot exceed 50 characters.');
    });

    it('throws if a checklist has zero items', async () => {
      const blocks: TemplateBlock[] = [{ id: '1', type: 'checklist', label: 'Groceries', items: [] }];
      await expect(saveTemplate({ name: 'Valid Name', blocks }))
        .rejects.toThrow('Checklist must have at least one item.');
    });

    it('throws if a checklist exceeds 50 items', async () => {
      const blocks: TemplateBlock[] = [{ id: '1', type: 'checklist', label: 'Groceries', items: Array.from({ length: 51 }, (_, i) => `Item ${i}`) }];
      await expect(saveTemplate({ name: 'Valid Name', blocks }))
        .rejects.toThrow('Checklist cannot exceed 50 items.');
    });

    it('throws if a checklist item exceeds 100 characters', async () => {
      const blocks: TemplateBlock[] = [{ id: '1', type: 'checklist', label: 'Groceries', items: ['a'.repeat(101)] }];
      await expect(saveTemplate({ name: 'Valid Name', blocks }))
        .rejects.toThrow('Checklist item cannot exceed 100 characters.');
    });

    it('succeeds with a valid checklist block', async () => {
      vi.mocked(idb.get).mockResolvedValueOnce(undefined);
      const blocks: TemplateBlock[] = [{ id: '1', type: 'checklist', label: 'Groceries', items: ['Apples', 'Bananas'] }];
      await expect(saveTemplate({ name: 'Valid Name', blocks })).resolves.toEqual(expect.any(String));
    });
  });

  describe('Creation (Append)', () => {
    it('appends a new template to an empty store', async () => {
      vi.mocked(idb.get).mockResolvedValueOnce(undefined);
      
      const blocks: TemplateBlock[] = [{ id: '1', type: 'paragraph', text: 'Valid text' }];
      await saveTemplate({ name: 'New Template', blocks });

      expect(idb.get).toHaveBeenCalledWith('templates');
      expect(idb.set).toHaveBeenCalledTimes(1);
      
      const setArg = vi.mocked(idb.set).mock.calls[0][1] as any[];
      expect(setArg).toHaveLength(1);
      expect(setArg[0].name).toBe('New Template');
      expect(setArg[0].createdAt).toBe('2026-08-10T12:00:00.000Z');
      expect(setArg[0].updatedAt).toBe('2026-08-10T12:00:00.000Z');
      expect(setArg[0].id).toBeDefined();
      expect(setArg[0].blocks).toEqual(blocks);
    });

    it('appends a new template to an existing store', async () => {
      const existingTemplate = { id: 'old-1', name: 'Old', createdAt: '2026-01-01T00:00:00.000Z', blocks: [] };
      vi.mocked(idb.get).mockResolvedValueOnce([existingTemplate]);
      
      const blocks: TemplateBlock[] = [{ id: '1', type: 'paragraph', text: 'Valid text' }];
      await saveTemplate({ name: 'New Template', blocks });

      expect(idb.set).toHaveBeenCalledTimes(1);
      
      const setArg = vi.mocked(idb.set).mock.calls[0][1] as any[];
      expect(setArg).toHaveLength(2);
      expect(setArg[0].id).toBe('old-1');
      expect(setArg[1].name).toBe('New Template');
    });
  });

  describe('Update (Mutation)', () => {
    it('updates an existing template without overwriting its ID or createdAt', async () => {
      const existingTemplate = { 
        id: 'edit-me', 
        name: 'Old Name', 
        createdAt: '2025-01-01T00:00:00.000Z', 
        blocks: [{ id: 'old-block', type: 'paragraph', text: 'old text' } as TemplateBlock] 
      };
      vi.mocked(idb.get).mockResolvedValueOnce([existingTemplate]);
      
      const newBlocks: TemplateBlock[] = [{ id: 'new-block', type: 'paragraph', text: 'new text' }];
      await saveTemplate({ name: 'Updated Name', blocks: newBlocks, editingId: 'edit-me' });

      expect(idb.set).toHaveBeenCalledTimes(1);
      const setArg = vi.mocked(idb.set).mock.calls[0][1] as any[];
      expect(setArg).toHaveLength(1);
      expect(setArg[0].id).toBe('edit-me');
      expect(setArg[0].createdAt).toBe('2025-01-01T00:00:00.000Z');
      expect(setArg[0].updatedAt).toBe('2026-08-10T12:00:00.000Z');
      expect(setArg[0].name).toBe('Updated Name');
      expect(setArg[0].blocks).toEqual(newBlocks);
    });

    it('appends as new if editingId is not found', async () => {
      vi.mocked(idb.get).mockResolvedValueOnce([]); // empty db
      
      const blocks: TemplateBlock[] = [{ id: '1', type: 'paragraph', text: 'valid text' }];
      await saveTemplate({ name: 'Valid Name', blocks, editingId: 'missing-id' });

      const setArg = vi.mocked(idb.set).mock.calls[0][1] as any[];
      expect(setArg).toHaveLength(1);
      // Because it appended as a fallback, it generates a new ID and timestamp
      expect(setArg[0].id).not.toBe('missing-id');
      expect(setArg[0].createdAt).toBe('2026-08-10T12:00:00.000Z');
      expect(setArg[0].updatedAt).toBe('2026-08-10T12:00:00.000Z');
    });
  });

  describe('Deletion', () => {
    it('successfully deletes an existing template', async () => {
      const existingTemplates = [
        { id: '1', name: 'To Keep', createdAt: '2025-01-01T00:00:00.000Z', blocks: [] },
        { id: '2', name: 'To Delete', createdAt: '2025-01-01T00:00:00.000Z', blocks: [] }
      ];
      vi.mocked(idb.get).mockResolvedValueOnce(existingTemplates);

      await deleteTemplate('2');

      expect(idb.set).toHaveBeenCalledTimes(1);
      const setArg = vi.mocked(idb.set).mock.calls[0][1] as any[];
      expect(setArg).toHaveLength(1);
      expect(setArg[0].id).toBe('1');
    });

    it('silently writes back the same array if id is not found', async () => {
      const existingTemplates = [
        { id: '1', name: 'To Keep', createdAt: '2025-01-01T00:00:00.000Z', blocks: [] }
      ];
      vi.mocked(idb.get).mockResolvedValueOnce(existingTemplates);

      await deleteTemplate('missing-id');

      expect(idb.set).toHaveBeenCalledTimes(1);
      const setArg = vi.mocked(idb.set).mock.calls[0][1] as any[];
      expect(setArg).toHaveLength(1);
      expect(setArg[0].id).toBe('1');
    });
  });
});
