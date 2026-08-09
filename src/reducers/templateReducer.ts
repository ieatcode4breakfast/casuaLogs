export type HeaderBlock = {
  id: string;
  type: 'header';
  level: 1 | 2 | 3;
  text: string;
};

export type TextBlock = {
  id: string;
  type: 'text';
  inputType: 'short' | 'long';
  label: string;
};

export type ParagraphBlock = {
  id: string;
  type: 'paragraph';
  text: string;
};

export type TemplateBlock = HeaderBlock | TextBlock | ParagraphBlock;

export type TemplateAction =
  | { type: 'ADD_BLOCK'; payload: TemplateBlock }
  | { type: 'UPDATE_BLOCK'; payload: { id: string; text: string } }
  | { type: 'DELETE_BLOCK'; payload: { id: string } }
  | { type: 'REORDER_BLOCKS'; payload: { fromIndex: number; toIndex: number } };

export function templateReducer(state: TemplateBlock[], action: TemplateAction): TemplateBlock[] {
  switch (action.type) {
    case 'ADD_BLOCK':
      return [...state, action.payload];
      
    case 'UPDATE_BLOCK':
      return state.map(block => {
        if (block.id !== action.payload.id) return block;
        
        if (block.type === 'header' || block.type === 'paragraph') {
          return { ...block, text: action.payload.text };
        }
        
        if (block.type === 'text') {
          return { ...block, label: action.payload.text };
        }
        
        return block;
      });
      
    case 'DELETE_BLOCK':
      return state.filter(block => block.id !== action.payload.id);
      
    case 'REORDER_BLOCKS': {
      const copy = [...state];
      const [moved] = copy.splice(action.payload.fromIndex, 1);
      copy.splice(action.payload.toIndex, 0, moved);
      return copy;
    }
      
    default:
      return state;
  }
}
