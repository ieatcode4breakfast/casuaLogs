# Template Schema

This document defines the schema for Templates and their constituent layout blocks within the `casuaLogs` application.

## Template (Top-Level Entity)
A `Template` represents the saved layout that users can select to format their logs.

```typescript
export interface Template {
  id: string;               // UUID
  name: string;             // Max 50 chars
  createdAt: string;        // UTC ISO string
  updatedAt?: string;       // Optional UTC ISO string
  blocks: TemplateBlock[];  // The array of layout elements
}
```

## Template Blocks
Templates are composed of an array of blocks.

```typescript
export type TemplateBlock = HeaderBlock | TextBlock | ParagraphBlock;
```

### Header Block
```typescript
export type HeaderBlock = {
  id: string;
  type: 'header';
  level: 1 | 2 | 3;
  text: string;             // Max 50 chars
};
```

### Text Block
```typescript
export type TextBlock = {
  id: string;
  type: 'text';
  inputType: 'short' | 'long';
  label: string;            // Max 50 chars
};
```

### Paragraph Block
```typescript
export type ParagraphBlock = {
  id: string;
  type: 'paragraph';
  text: string;             // Max 1000 chars
};
```
