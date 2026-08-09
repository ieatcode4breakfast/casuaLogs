import { expect, test, describe } from 'vitest';
import { templateReducer, type TemplateBlock } from './templateReducer';

describe('templateReducer', () => {
  const initialState: TemplateBlock[] = [];

  test('adds a block', () => {
    const action = {
      type: 'ADD_BLOCK' as const,
      payload: {
        id: '1',
        type: 'header' as const,
        level: 1 as const,
        text: 'Title'
      }
    };
    const newState = templateReducer(initialState, action);
    expect(newState).toHaveLength(1);
    expect(newState[0]).toEqual(action.payload);
  });

  test('updates a header block text', () => {
    const state: TemplateBlock[] = [
      { id: '1', type: 'header', level: 1, text: 'Old Title' }
    ];
    const action = {
      type: 'UPDATE_BLOCK' as const,
      payload: { id: '1', text: 'New Title' }
    };
    const newState = templateReducer(state, action);
    expect(newState[0].type === 'header' && newState[0].text).toBe('New Title');
  });

  test('updates a text block label', () => {
    const state: TemplateBlock[] = [
      { id: '1', type: 'text', inputType: 'short', label: 'Old Label' }
    ];
    const action = {
      type: 'UPDATE_BLOCK' as const,
      payload: { id: '1', text: 'New Label' }
    };
    const newState = templateReducer(state, action);
    expect(newState[0].type === 'text' && newState[0].label).toBe('New Label');
  });

  test('deletes a block', () => {
    const state: TemplateBlock[] = [
      { id: '1', type: 'header', level: 1, text: 'Title' },
      { id: '2', type: 'paragraph', text: 'Body' }
    ];
    const action = {
      type: 'DELETE_BLOCK' as const,
      payload: { id: '1' }
    };
    const newState = templateReducer(state, action);
    expect(newState).toHaveLength(1);
    expect(newState[0].id).toBe('2');
  });

  test('reorders blocks', () => {
    const state: TemplateBlock[] = [
      { id: '1', type: 'header', level: 1, text: 'A' },
      { id: '2', type: 'header', level: 1, text: 'B' },
      { id: '3', type: 'header', level: 1, text: 'C' }
    ];
    const action = {
      type: 'REORDER_BLOCKS' as const,
      payload: { fromIndex: 0, toIndex: 2 }
    };
    const newState = templateReducer(state, action);
    expect(newState.map(b => b.id)).toEqual(['2', '3', '1']);
  });
});
