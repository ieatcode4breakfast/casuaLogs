import { describe, it, expect } from 'vitest';
import { formatLogToMarkdown } from './clipboard';
import { type LogBlock } from '../services/logService';

describe('formatLogToMarkdown', () => {
  it('formats header blocks correctly', () => {
    const blocks: LogBlock[] = [{ id: '1', type: 'header', level: 1, text: 'Main Header' }];
    const result = formatLogToMarkdown('My Log', blocks);
    expect(result).toBe('# My Log\n\n## Main Header');
  });

  it('formats paragraph blocks correctly', () => {
    const blocks: LogBlock[] = [{ id: '1', type: 'paragraph', text: 'Some text here.' }];
    const result = formatLogToMarkdown('My Log', blocks);
    expect(result).toBe('# My Log\n\nSome text here.');
  });

  it('formats text blocks correctly with a value', () => {
    const blocks: LogBlock[] = [{ id: '1', type: 'text', inputType: 'short', label: 'Summary', value: 'This is a summary.' }];
    const result = formatLogToMarkdown('My Log', blocks);
    expect(result).toBe('# My Log\n\n**Summary**\nThis is a summary.');
  });

  it('formats text blocks correctly when the value is blank (empty string)', () => {
    const blocks: LogBlock[] = [{ id: '1', type: 'text', inputType: 'short', label: 'Summary', value: '' }];
    const result = formatLogToMarkdown('My Log', blocks);
    expect(result).toBe('# My Log\n\n**Summary**');
  });
  
  it('formats text blocks correctly when the value is undefined', () => {
    const blocks: LogBlock[] = [{ id: '1', type: 'text', inputType: 'short', label: 'Summary', value: undefined as any }];
    const result = formatLogToMarkdown('My Log', blocks);
    expect(result).toBe('# My Log\n\n**Summary**');
  });

  it('formats checklist blocks correctly', () => {
    const blocks: LogBlock[] = [{
      id: '1',
      type: 'checklist',
      label: 'Tasks',
      items: [
        { text: 'Task 1', checked: true },
        { text: 'Task 2', checked: false }
      ]
    }];
    const result = formatLogToMarkdown('My Log', blocks);
    expect(result).toBe('# My Log\n\n**Tasks**\n- [x] Task 1\n- [ ] Task 2');
  });
});
