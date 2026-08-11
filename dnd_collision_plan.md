# Implementation Plan: Drag and Drop Collision Detection

## Goal Description
The user noticed that when reordering template blocks via drag-and-drop, a dragged block does not visually swap places with the target block until its **center** crosses the target block. For large blocks, this creates a disjointed UX, requiring the user to drag the block much further than intuitively expected. 

The goal is to trigger the movement as soon as the top or bottom edge of the dragged block touches/intersects another block.

## Background Context
The application uses the `@dnd-kit/core` library for drag-and-drop interactions in `src/components/CreateTemplateView.tsx`. 
Currently, the `<DndContext>` component is configured with `collisionDetection={closestCenter}`. 
As the name implies, `closestCenter` calculates distance based on the center point of the draggable node's bounding rectangle.

To achieve the desired edge-based intersection behavior, we need to change this strategy to `closestCorners`. This algorithm measures the distance between all four corners of the dragged item's bounding box and the corners of the droppable containers, resulting in a much smoother, immediate swap when dragging large items of variable heights.

## Proposed Changes

### `src/components/CreateTemplateView.tsx`

We will update the `dnd-kit` imports and modify the `DndContext` configuration.

#### [MODIFY] `CreateTemplateView.tsx`

**1. Update the import statement:**
Change `closestCenter` to `closestCorners`.

```diff
- import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
+ import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
```

**2. Update the `DndContext` component:**
Replace `collisionDetection={closestCenter}` with `collisionDetection={closestCorners}`.

```diff
- <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]} onDragEnd={handleDragEnd}>
+ <DndContext sensors={sensors} collisionDetection={closestCorners} modifiers={[restrictToVerticalAxis]} onDragEnd={handleDragEnd}>
```

## Verification Plan

### Automated Tests
Run standard type checking and build verification to ensure imports and typings are valid:
```bash
npm run build
```

### Manual Verification
1. Navigate to the "Create Template" view.
2. Add a mixture of small blocks (Headers) and very large blocks (Long text or Checklists with many items).
3. Grab a large block by its drag handle and drag it vertically.
4. Verify that the blocks rearrange as soon as the leading edge (top or bottom) of the dragged block overlaps the boundary of the adjacent block, rather than waiting for the centers to align.
