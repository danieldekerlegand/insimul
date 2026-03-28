/**
 * GDScript Validator — lightweight parse-time checks for generated .gd files.
 *
 * Catches common errors before the export ZIP is produced:
 * - Invalid class names (Godot 3→4 renames)
 * - Reserved keyword variable names
 * - Type inference failures (`:= dict[...]` or `:= dict.get(...)`)
 * - Invalid unicode escapes
 * - Duplicate constant names
 * - Unsubstituted template tokens
 */

import type { GeneratedFile } from './godot-project-generator';

// Godot 3→4 class renames that are common mistakes
const INVALID_CLASSES = [
  { wrong: 'PointLight3D', correct: 'OmniLight3D' },
  { wrong: 'PointLight', correct: 'OmniLight3D' },
  { wrong: /\bSpatial\b/, correct: 'Node3D' },
  { wrong: /\bKinematicBody\b/, correct: 'CharacterBody3D' },
  { wrong: /\bKinematicBody3D\b/, correct: 'CharacterBody3D' },
  { wrong: /\bRigidBody\b(?!3D)/, correct: 'RigidBody3D' },
  { wrong: /\bArea\b(?!3D)/, correct: 'Area3D' },
  { wrong: /\.instance\(\)/, correct: '.instantiate()' },
];

// GDScript reserved keywords that can't be used as variable names
const RESERVED_KEYWORDS = [
  'trait', 'class', 'signal', 'enum', 'const', 'var', 'func',
  'static', 'extends', 'is', 'in', 'as', 'self', 'super',
  'break', 'continue', 'pass', 'return', 'match', 'while', 'for',
  'if', 'elif', 'else', 'await', 'yield', 'void',
];

export interface ValidationError {
  file: string;
  line: number;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Validate all .gd files in the generated file list.
 * Returns an array of validation errors. Empty = all good.
 */
export function validateGDScriptFiles(files: GeneratedFile[]): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const file of files) {
    if (!file.path.endsWith('.gd')) continue;
    const fileErrors = validateSingleFile(file);
    errors.push(...fileErrors);
  }

  return errors;
}

function validateSingleFile(file: GeneratedFile): ValidationError[] {
  const errors: ValidationError[] = [];
  const lines = file.content.split('\n');

  const seenConstants = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Skip comments
    const trimmed = line.replace(/#.*$/, '').trim();
    if (trimmed === '') continue;

    // Check for unsubstituted template tokens
    const tokenMatch = trimmed.match(/\{\{[A-Z_]+\}\}/);
    if (tokenMatch) {
      errors.push({
        file: file.path,
        line: lineNum,
        message: `Unsubstituted template token: ${tokenMatch[0]}`,
        severity: 'error',
      });
    }

    // Check for invalid class names
    for (const check of INVALID_CLASSES) {
      const pattern = check.wrong instanceof RegExp ? check.wrong : new RegExp(`\\b${check.wrong}\\b`);
      if (pattern.test(trimmed)) {
        errors.push({
          file: file.path,
          line: lineNum,
          message: `Invalid class "${check.wrong instanceof RegExp ? check.wrong.source : check.wrong}" — use "${check.correct}" in Godot 4.x`,
          severity: 'error',
        });
      }
    }

    // Check for reserved keywords as loop variables: "for <keyword> in"
    const forMatch = trimmed.match(/^for\s+(\w+)\s+in\b/);
    if (forMatch && RESERVED_KEYWORDS.includes(forMatch[1])) {
      errors.push({
        file: file.path,
        line: lineNum,
        message: `Reserved keyword "${forMatch[1]}" used as loop variable`,
        severity: 'error',
      });
    }

    // Check for type inference from dict indexing: "var x := dict[...]"
    const dictIndexInfer = trimmed.match(/var\s+\w+\s*:=\s*\w+\[/);
    if (dictIndexInfer) {
      errors.push({
        file: file.path,
        line: lineNum,
        message: `Type inference from dictionary/array indexing may fail — use explicit type annotation`,
        severity: 'warning',
      });
    }

    // Check for invalid unicode escapes: \u{XXXX}
    if (/\\u\{[0-9a-fA-F]+\}/.test(line)) {
      errors.push({
        file: file.path,
        line: lineNum,
        message: `Invalid unicode escape "\\u{...}" — use "\\U00XXXXXX" format in GDScript`,
        severity: 'error',
      });
    }

    // Check for duplicate constants
    const constMatch = trimmed.match(/^const\s+(\w+)\s*:?=/);
    if (constMatch) {
      const constName = constMatch[1];
      if (seenConstants.has(constName)) {
        errors.push({
          file: file.path,
          line: lineNum,
          message: `Duplicate constant "${constName}" — already defined earlier in file`,
          severity: 'error',
        });
      }
      seenConstants.add(constName);
    }

    // Check for class_name conflicting with autoload
    if (/^class_name\s+/.test(trimmed)) {
      const className = trimmed.replace(/^class_name\s+/, '').trim();
      // Common autoload names that conflict
      const autoloadNames = ['EventBus', 'GameManager', 'DataLoader', 'GameClock',
        'ActionSystem', 'QuestSystem', 'CombatSystem', 'RuleEnforcer',
        'InventorySystem', 'DialogueSystem', 'BuildingEntrySystem',
        'AudioManager', 'SaveSystem'];
      if (autoloadNames.includes(className)) {
        errors.push({
          file: file.path,
          line: lineNum,
          message: `class_name "${className}" conflicts with autoload singleton of the same name`,
          severity: 'error',
        });
      }
    }
  }

  return errors;
}
