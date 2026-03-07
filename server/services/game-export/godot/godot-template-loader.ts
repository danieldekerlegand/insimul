/**
 * Godot Template Loader
 *
 * Reads GDScript / config template files from the `templates/` directory and
 * performs simple `{{TOKEN}}` substitution so the templates can be real files
 * with proper IDE support rather than inline TypeScript strings.
 */

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { GeneratedFile } from './godot-project-generator';

const TEMPLATES_DIR = join(dirname(fileURLToPath(import.meta.url)), 'templates');

export type TokenMap = Record<string, string | number>;

/**
 * Load a template file and substitute all `{{TOKEN}}` occurrences.
 * Throws if the template file does not exist.
 */
export function loadTemplate(relativePath: string, tokens: TokenMap = {}): string {
  const fullPath = join(TEMPLATES_DIR, relativePath);
  let content: string;
  try {
    content = readFileSync(fullPath, 'utf8');
  } catch {
    throw new Error(`[GodotTemplateLoader] Template not found: ${fullPath}`);
  }

  for (const [key, value] of Object.entries(tokens)) {
    const placeholder = `{{${key}}}`;
    // Replace all occurrences
    content = content.split(placeholder).join(String(value));
  }

  // Warn about any unreplaced tokens (helpful during development)
  const remaining = content.match(/\{\{[A-Z_]+\}\}/g);
  if (remaining) {
    const unique = [...new Set(remaining)];
    console.warn(`[GodotTemplateLoader] Unreplaced tokens in ${relativePath}: ${unique.join(', ')}`);
  }

  return content;
}

/**
 * Load a static template file (no substitution).
 */
export function loadStaticTemplate(relativePath: string): string {
  return loadTemplate(relativePath, {});
}

/**
 * Load a template and return it as a GeneratedFile ready for the ZIP.
 */
export function templateToFile(
  outputPath: string,
  templatePath: string,
  tokens: TokenMap = {},
): GeneratedFile {
  return { path: outputPath, content: loadTemplate(templatePath, tokens) };
}
