import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveLog, deleteLog, type LogBlock } from './logService';
import { get, set } from 'idb-keyval';

vi.mock('idb-keyval', () => ({
  get: vi.fn(),
  set: vi.fn(),
}));

describe('logService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (get as any).mockResolvedValue([]);
  });

  it('should save and retrieve a log decoupled from a template', async () => {
    const logBlocks = [
      { id: '1', type: 'header' as const, level: 1 as const, text: 'My Log' },
      { id: '2', type: 'text' as const, inputType: 'short' as const, label: 'Name', value: 'John' },
    ];

    await saveLog({ title: 'My Awesome Log', blocks: logBlocks as any });

    expect(set).toHaveBeenCalledTimes(1);
    const setCall = (set as any).mock.calls[0];
    expect(setCall[0]).toBe('logs');
    expect(setCall[1]).toHaveLength(1);
    expect(setCall[1][0].title).toBe('My Awesome Log');
    expect(setCall[1][0].blocks).toEqual(logBlocks);
    expect(setCall[1][0].id).toBeDefined();
    expect(setCall[1][0].createdAt).toBeDefined();
    expect(setCall[1][0].updatedAt).toBeDefined();
    expect(setCall[1][0].updatedAt).toBe(setCall[1][0].createdAt); // Equal on creation
    // No templateId reference
    expect(setCall[1][0].templateId).toBeUndefined();
  });

  it('should enforce validation rules', async () => {
    await expect(saveLog({ title: '', blocks: [{ id: '1', type: 'header', level: 1, text: 'H' }] } as any)).rejects.toThrow('Log title is required.');
    
    await expect(saveLog({ title: 'a'.repeat(101), blocks: [{ id: '1', type: 'header', level: 1, text: 'H' }] } as any)).rejects.toThrow('Log title cannot exceed 100 characters.');

    await expect(saveLog({ title: 'Valid Title', blocks: [] })).rejects.toThrow('Log must contain at least one block.');

    const invalidHeader = [{ id: '1', type: 'header' as const, level: 1 as const, text: 'a'.repeat(51) }];
    await expect(saveLog({ title: 'Valid Title', blocks: invalidHeader as any })).rejects.toThrow('Header/Short-text blocks cannot exceed 50 characters.');

    const invalidTextLabel = [{ id: '1', type: 'text' as const, inputType: 'short' as const, label: 'a'.repeat(51), value: '' }];
    await expect(saveLog({ title: 'Valid Title', blocks: invalidTextLabel as any })).rejects.toThrow('Text block labels cannot exceed 50 characters.');

    const invalidParagraph = [{ id: '1', type: 'paragraph' as const, text: 'a'.repeat(5001) }];
    await expect(saveLog({ title: 'Valid Title', blocks: invalidParagraph as any })).rejects.toThrow('Paragraph blocks cannot exceed 5000 characters.');
  });

  it('should enforce checklist validation rules', async () => {
    // Label too long
    await expect(saveLog({
      title: 'Valid Title',
      blocks: [{ id: '1', type: 'checklist', label: 'a'.repeat(51), items: [{ text: 'A', checked: false }] }] as unknown as LogBlock[]
    })).rejects.toThrow('Checklist label cannot exceed 50 characters.');

    // Zero items
    await expect(saveLog({
      title: 'Valid Title',
      blocks: [{ id: '1', type: 'checklist', label: 'G', items: [] }] as unknown as LogBlock[]
    })).rejects.toThrow('Checklist must have at least one item.');

    // Too many items
    await expect(saveLog({
      title: 'Valid Title',
      blocks: [{ id: '1', type: 'checklist', label: 'G', items: Array.from({ length: 51 }, (_, i) => ({ text: `Item ${i}`, checked: false })) }] as unknown as LogBlock[]
    })).rejects.toThrow('Checklist cannot exceed 50 items.');

    // Checklist total characters too long
    await expect(saveLog({
      title: 'Valid Title',
      blocks: [{ id: '1', type: 'checklist', label: 'G', items: [{ text: 'a'.repeat(5001), checked: false }] }] as unknown as LogBlock[]
    })).rejects.toThrow('Checklist total characters cannot exceed 5000.');

    // Item lacking a checked boolean
    await expect(saveLog({
      title: 'Valid Title',
      blocks: [{ id: '1', type: 'checklist', label: 'G', items: [{ text: 'A' }] }] as unknown as LogBlock[]
    })).rejects.toThrow('Checklist item must have a checked state.');

    // Valid checklist succeeds
    await expect(saveLog({
      title: 'Valid Title',
      blocks: [{ id: '1', type: 'checklist', label: 'G', items: [{ text: 'A', checked: true }] }] as unknown as LogBlock[]
    })).resolves.toEqual(expect.any(String));
  });

  it('should delete a log', async () => {
    const mockLogs = [{ id: 'test-log-id', title: 'Test', createdAt: '2026-08-10', blocks: [] }];
    (get as any).mockResolvedValue(mockLogs);

    await deleteLog('test-log-id');

    expect(set).toHaveBeenCalledWith('logs', []);
  });

  it('updates an existing log when editingId is provided', async () => {
    const existingLog = {
      id: 'log-123',
      title: 'Original Title',
      createdAt: '2023-01-01T00:00:00.000Z',
      blocks: [],
    };

    vi.mocked(get).mockResolvedValue([existingLog]);

    await saveLog({
      title: 'Updated Title',
      blocks: [{ id: 'b1', type: 'paragraph', text: 'New content' }],
      editingId: 'log-123'
    });

    const setCall = vi.mocked(set).mock.calls[0];
    expect(setCall[0]).toBe('logs');

    const updatedLogs = setCall[1];
    expect(updatedLogs).toHaveLength(1);
    expect(updatedLogs[0].id).toBe('log-123'); // ID unchanged
    expect(updatedLogs[0].createdAt).toBe('2023-01-01T00:00:00.000Z'); // Created at unchanged
    expect(updatedLogs[0].updatedAt).toBeDefined(); // Updated at set on edit
    expect(updatedLogs[0].title).toBe('Updated Title'); // Title updated
    expect(updatedLogs[0].blocks[0].text).toBe('New content'); // Blocks updated
  });

  it('creates a new log when editingId is not found', async () => {
    vi.mocked(get).mockResolvedValue([]);

    await saveLog({
      title: 'New Log',
      blocks: [{ id: 'b1', type: 'paragraph', text: 'Content' }],
      editingId: 'missing-id'
    });

    const setCall = vi.mocked(set).mock.calls[0];
    const logs = setCall[1];
    expect(logs).toHaveLength(1);
    expect(logs[0].id).not.toBe('missing-id');
    expect(logs[0].title).toBe('New Log');
  });
});
