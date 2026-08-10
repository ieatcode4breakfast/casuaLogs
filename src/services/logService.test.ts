import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveLog, deleteLog } from './logService';
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

  it('should delete a log', async () => {
    const mockLogs = [{ id: 'test-log-id', title: 'Test', createdAt: '2026-08-10', blocks: [] }];
    (get as any).mockResolvedValue(mockLogs);

    await deleteLog('test-log-id');

    expect(set).toHaveBeenCalledWith('logs', []);
  });
});
