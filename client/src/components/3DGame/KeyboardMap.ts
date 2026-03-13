/**
 * Keyboard Map — Central catalogue of all keyboard bindings in the 3D game.
 *
 * Movement keys are handled by CharacterController (ActionMap).
 * Game action keys are handled by BabylonGame.handleKeyDown().
 * Camera shortcuts are handled by CameraManager.handleKeyboardShortcut().
 *
 * Use KeyboardEvent.code values (layout-independent physical keys).
 */

// ─── Movement (CharacterController ActionMap) ─────────────────────────────
// These are configured via ActionMap in CharacterController.ts and use
// KeyboardEvent.key (lowercase). Listed here for reference only.
//
//   W / ArrowUp       — Walk forward
//   S / ArrowDown     — Walk backward
//   A / ArrowLeft     — Turn left
//   D / ArrowRight    — Turn right
//   Q                 — Strafe left
//   E                 — Strafe right
//   Space             — Jump
//   Shift             — Sprint (speed modifier)
//   CapsLock          — Toggle sprint

// ─── Game Actions (BabylonGame.handleKeyDown) ─────────────────────────────

/** Interact with nearest NPC (open chat) or end conversation */
export const KEY_NPC_INTERACT = 'KeyG';

/** Enter/exit nearest building */
export const KEY_BUILDING_INTERACT = 'Enter';

/** Attack / respawn */
export const KEY_ATTACK = 'KeyF';

/** Target nearest enemy */
export const KEY_TARGET_ENEMY = 'KeyT';

/** Toggle vocabulary/grammar panel */
export const KEY_VOCABULARY_PANEL = 'KeyV';

/** Toggle conversation history panel */
export const KEY_CONVERSATION_HISTORY = 'KeyH';

/** Toggle skill tree panel */
export const KEY_SKILL_TREE = 'KeyK';

/** Toggle notice board */
export const KEY_NOTICE_BOARD = 'KeyN';

/** Toggle assessment progress panel */
export const KEY_ASSESSMENT_PANEL = 'KeyL';

/** Toggle VR mode */
export const KEY_TOGGLE_VR = 'KeyV'; // Shift+V

/** Open/close game menu */
export const KEY_GAME_MENU = 'Escape';

// ─── Camera (CameraManager.handleKeyboardShortcut) ────────────────────────
// These use KeyboardEvent.key (lowercase). Listed here for reference.
//
//   1                 — First-person camera
//   2                 — Third-person camera
//   3                 — Isometric camera
