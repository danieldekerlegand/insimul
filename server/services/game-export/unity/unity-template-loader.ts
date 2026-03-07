/**
 * Unity Template Loader
 *
 * Reads C# and config files from `templates/` at build time and performs
 * {{TOKEN}} substitution for world-specific values. Identical in design
 * to the Godot template loader — see godot-template-loader.ts.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const TEMPLATES_DIR = join(dirname(fileURLToPath(import.meta.url)), 'templates');

export type TokenMap = Record<string, string | number>;

/**
 * Load a template file and replace {{TOKEN}} placeholders with values.
 * Warns to stderr for any tokens that remain unreplaced after substitution.
 */
export function loadTemplate(relativePath: string, tokens: TokenMap = {}): string {
  const fullPath = join(TEMPLATES_DIR, relativePath);
  let content = readFileSync(fullPath, 'utf8');
  for (const [key, value] of Object.entries(tokens)) {
    content = content.split(`{{${key}}}`).join(String(value));
  }
  const remaining = content.match(/\{\{[A-Z_]+\}\}/g);
  if (remaining) {
    console.warn(
      `[UnityTemplateLoader] Unreplaced tokens in "${relativePath}": ${[...new Set(remaining)].join(', ')}`
    );
  }
  return content;
}

/** Load a static template file with no token substitution. */
export function loadStaticTemplate(relativePath: string): string {
  return loadTemplate(relativePath, {});
}
