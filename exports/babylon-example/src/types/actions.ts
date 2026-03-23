// Action type definitions for RPG game
// Canonical definitions live in @shared/game-engine/types.ts
// This file re-exports them for backward compatibility with existing 3DGame imports.

export type {
  Action,
  ActionState,
  ActionContext,
  ActionResult,
  ActionEffect,
  ActionUIConfig,
} from '@shared/game-engine/types';

export { ACTION_UI_CONFIGS } from '@shared/game-engine/types';
