/**
 * tau-prolog strict-mode compatibility patch.
 *
 * tau-prolog's core.js (modules/core.js) assigns `tau_file_system` as an
 * implicit global (no var/let/const). In Node.js CJS this works because
 * modules run in sloppy mode. Vite, however, wraps CJS shims in strict
 * mode where implicit global assignment throws ReferenceError.
 *
 * This module must be imported BEFORE tau-prolog so that the property
 * exists on globalThis when the assignment runs.
 */
(globalThis as any).tau_file_system = (globalThis as any).tau_file_system || undefined;
