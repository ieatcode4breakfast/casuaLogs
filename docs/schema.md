# Application Schemas

This document defines the core data schemas for **Templates** and **Logs**, along with their constituent layout blocks within the `casualogs` application.

## 1. Templates

A `Template` represents the saved structural layout that users can select to format new logs.

```typescript
export interface Template {
  id: string;               // UUID
  name: string;             // Max 50 chars
  createdAt: string;        // UTC ISO string
  updatedAt?: string;       // Optional UTC ISO string
  blocks: TemplateBlock[];  // The array of structural elements
}
```

### Template Blocks
Templates are composed of structural blocks that dictate layout, but do not contain user input data.

```typescript
export type TemplateBlock = HeaderBlock | TextBlock | ParagraphBlock | ChecklistBlock;

export type HeaderBlock = {
  id: string;
  type: 'header';
  level: 1 | 2 | 3;
  text: string;             // Max 50 chars
};

export type TextBlock = {
  id: string;
  type: 'text';
  inputType: 'short' | 'long';
  label: string;            // Max 50 chars
};

export type ParagraphBlock = {
  id: string;
  type: 'paragraph';
  text: string;             // Max 5000 chars
};

export type ChecklistBlock = {
  id: string;
  type: 'checklist';
  label: string;            // Optional, max 50 chars
  items: string[];          // Array of predefined item labels (max 50 items, max 100 chars each)
};
```

---

## 2. Logs

A `Log` represents a filled-out entry. It shares a similar block structure to templates, but text blocks additionally store the user's explicit input.

```typescript
export interface Log {
  id: string;
  title: string;            // Max 100 characters
  createdAt: string;        // UTC ISO string
  updatedAt?: string;       // Optional UTC ISO string
  blocks: LogBlock[];       // The array of elements containing user data
}
```

### Log Blocks
Log blocks are nearly identical to template blocks, except `LogTextBlock` requires a `value` property to store the user's answer.

```typescript
export type LogBlock = LogHeaderBlock | LogParagraphBlock | LogTextBlock | LogChecklistBlock;

export type LogHeaderBlock = {
  id: string;
  type: 'header';
  level: 1 | 2 | 3;
  text: string;             // Max 50 chars
};

export type LogTextBlock = {
  id: string;
  type: 'text';
  inputType: 'short' | 'long';
  label: string;            // Max 50 chars
  value: string;            // The user's input (Max 50 for 'short', 5000 for 'long')
};

export type LogParagraphBlock = {
  id: string;
  type: 'paragraph';
  text: string;             // Max 5000 chars
};

export type LogChecklistBlock = {
  id: string;
  type: 'checklist';
  label: string;            // Optional, max 50 chars
  items: { text: string; checked: boolean }[]; // Tracks check state
};
```
