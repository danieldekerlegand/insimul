/**
 * Unreal C++ Template Linting Tests
 *
 * Validates all C++ template files for common errors without needing the UE5 editor or compiler.
 * Catches: unregistered files, unreplaced tokens, unbalanced braces, missing include guards,
 * deprecated UE5 APIs, UHT-incompatible patterns, cross-reference issues, and known anti-patterns.
 */

import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'fs';
import { join, relative } from 'path';
import { generateCppFiles } from '../services/game-export/unreal/unreal-cpp-generator';
import type { WorldIR } from '@shared/game-engine/ir-types';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const TEMPLATES_DIR = join(__dirname, '../services/game-export/unreal/templates/source');

/** Recursively collect all .h and .cpp files under a directory. */
function collectCppFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectCppFiles(full));
    } else if (entry.name.endsWith('.h') || entry.name.endsWith('.cpp')) {
      results.push(full);
    }
  }
  return results;
}

/** Minimal IR fixture that exercises all generator paths. */
function makeFullIR(): WorldIR {
  return {
    meta: {
      insimulVersion: '1.0.0',
      worldId: 'lint-world',
      worldName: 'Lint World',
      worldType: 'medieval_fantasy',
      seed: 'lint-seed',
      terrainSize: 256,
      exportTimestamp: '2026-03-28T00:00:00Z',
      genreConfig: {
        id: 'rpg',
        name: 'RPG',
        genre: 'rpg',
        features: { crafting: true, resources: true, survival: true, combat: true, ranged: true },
      },
    },
    geography: {
      terrainSize: 256,
      countries: [],
      states: [],
      settlements: [],
      waterFeatures: [],
      terrainFeatures: [],
      biomeZones: [],
    },
    entities: {
      characters: [],
      npcs: [],
      buildings: [],
      roads: [],
    },
    systems: {
      rules: [],
      baseRules: [],
      actions: [],
      baseActions: [],
      quests: [],
      items: [],
      lootTables: [],
      truths: [],
      grammars: [],
      dialogueContexts: [],
      languages: [],
    },
    theme: {
      visualTheme: {
        groundColor: { r: 0.3, g: 0.5, b: 0.2 },
        skyColor: { r: 0.5, g: 0.7, b: 0.9 },
        roadColor: { r: 0.4, g: 0.4, b: 0.4 },
        settlementBaseColor: { r: 0.6, g: 0.5, b: 0.4 },
        settlementRoofColor: { r: 0.5, g: 0.3, b: 0.2 },
        roadRadius: 3,
      },
      ambientLighting: { color: [0.5, 0.5, 0.5], intensity: 0.5 },
      directionalLight: { direction: [0.5, -1, 0.3], intensity: 1.0 },
      fog: { density: 0.002 },
    },
    player: {
      speed: 5,
      jumpHeight: 1.5,
      gravity: 2,
      initialHealth: 100,
      initialEnergy: 100,
      initialGold: 50,
      startPosition: { x: 0, y: 0, z: 0 },
    },
    combat: {
      style: 'fighting',
      settings: {
        baseDamage: 10,
        criticalChance: 0.15,
        criticalMultiplier: 2.0,
        blockReduction: 0.5,
        dodgeChance: 0.1,
        attackCooldown: 1000,
      },
    },
    ui: {
      showHealthBar: true,
      showStaminaBar: true,
      showCompass: true,
      showMinimap: true,
      menuConfig: {
        mapScreen: { enabled: true },
        dialogueScreen: { enabled: true },
        pauseMenu: { maxSaveSlots: 5 },
      },
      questJournal: {
        maxTrackedQuests: 3,
        showQuestMarkers: true,
        autoTrackNew: true,
      },
    },
    survival: {
      needs: [],
      modifierPresets: [],
    },
    assessment: {
      instruments: [{ id: 'test', name: 'Test', questions: [], scoringMethod: 'mean', phases: ['pre'] }],
      phases: ['pre', 'post'],
    },
    languageLearning: {
      vocabulary: [{ id: 'v1', word: 'bonjour', translation: 'hello', category: 'greetings', proficiencyLevel: 1 }],
      grammarPatterns: [{ id: 'g1', pattern: 'SVO', example: 'Je mange', proficiencyLevel: 1 }],
      proficiencyTiers: [],
    },
    aiConfig: {
      apiMode: 'insimul',
      insimulEndpoint: 'https://api.example.com',
      geminiModel: 'gemini-2.0-flash',
      geminiApiKeyPlaceholder: '',
      voiceEnabled: false,
      defaultVoice: 'en-US',
    },
  } as unknown as WorldIR;
}

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe('Unreal C++ Template Lint', () => {
  const allTemplateFiles = collectCppFiles(TEMPLATES_DIR);
  const ir = makeFullIR();

  // Generate all files through the pipeline to get post-substitution content
  let generatedFiles: { path: string; content: string }[];
  let generationError: Error | null = null;
  try {
    generatedFiles = generateCppFiles(ir);
  } catch (e) {
    generationError = e as Error;
    generatedFiles = [];
  }

  it('generator does not throw', () => {
    expect(generationError, `Generator threw: ${generationError?.message}\n${generationError?.stack}`).toBeNull();
  });

  // ── Registration completeness ──

  it('all .h/.cpp template files are registered in the generator', () => {
    // Generate with multiple configs to cover conditional paths
    const configs = [
      ir,
      { ...ir, survival: null } as unknown as WorldIR,
      { ...ir, assessment: null, languageLearning: null } as unknown as WorldIR,
    ];

    const allGeneratedBasenames = new Set<string>();
    for (const config of configs) {
      try {
        const files = generateCppFiles(config);
        for (const f of files) {
          // Extract just the filename for matching (e.g. "InsimulGameMode.cpp")
          const basename = f.path.split('/').pop()!.toLowerCase();
          allGeneratedBasenames.add(basename);
        }
      } catch { /* skip configs that fail */ }
    }

    const unregistered: string[] = [];
    for (const file of allTemplateFiles) {
      const rel = relative(TEMPLATES_DIR, file).replace(/\\/g, '/');
      const basename = rel.split('/').pop()!.toLowerCase();
      if (!allGeneratedBasenames.has(basename)) {
        unregistered.push(rel);
      }
    }

    expect(unregistered, `Unregistered template files:\n${unregistered.join('\n')}`).toEqual([]);
  });

  // ── Token substitution ──

  it('no unreplaced {{TOKEN}} placeholders after substitution', () => {
    const failures: string[] = [];
    for (const file of generatedFiles) {
      const remaining = file.content.match(/\{\{[A-Z_]+\}\}/g);
      if (remaining) {
        const unique = [...new Set(remaining)];
        failures.push(`${file.path}: ${unique.join(', ')}`);
      }
    }
    expect(failures, `Unreplaced tokens:\n${failures.join('\n')}`).toEqual([]);
  });

  // ── Balanced braces ──

  it('all files have balanced curly braces', () => {
    const failures: string[] = [];
    for (const file of generatedFiles) {
      let open = 0;
      let close = 0;
      for (const ch of file.content) {
        if (ch === '{') open++;
        if (ch === '}') close++;
      }
      const diff = Math.abs(open - close);
      // Tolerate ±2 for C++ initializer lists and macros
      if (diff > 2) {
        failures.push(`${file.path}: { count=${open}, } count=${close}, diff=${diff}`);
      }
    }
    expect(failures, `Significantly unbalanced braces:\n${failures.join('\n')}`).toEqual([]);
  });

  // ── Include guards ──

  it('all .h files have #pragma once', () => {
    const failures: string[] = [];
    for (const file of generatedFiles) {
      if (!file.path.endsWith('.h')) continue;
      if (!file.content.includes('#pragma once')) {
        failures.push(file.path);
      }
    }
    expect(failures, `Header files missing #pragma once:\n${failures.join('\n')}`).toEqual([]);
  });

  // ── GENERATED_BODY() macro ──

  it('all UCLASS/USTRUCT declarations have GENERATED_BODY()', () => {
    const failures: string[] = [];
    for (const file of generatedFiles) {
      if (!file.path.endsWith('.h')) continue;

      const hasUClass = /\bUCLASS\b/.test(file.content);
      const hasUStruct = /\bUSTRUCT\b/.test(file.content);
      const hasGeneratedBody = /\bGENERATED_BODY\(\)/.test(file.content);

      if ((hasUClass || hasUStruct) && !hasGeneratedBody) {
        failures.push(file.path);
      }
    }
    expect(failures, `UCLASS/USTRUCT without GENERATED_BODY():\n${failures.join('\n')}`).toEqual([]);
  });

  // ── UHT-incompatible patterns ──

  describe('no UHT-incompatible patterns', () => {
    it('no TSharedPtr in UFUNCTION parameters', () => {
      const failures: string[] = [];
      for (const file of generatedFiles) {
        if (!file.path.endsWith('.h')) continue;

        // Find UFUNCTION declarations followed by function signatures with TSharedPtr
        const lines = file.content.split('\n');
        for (let i = 0; i < lines.length - 1; i++) {
          if (lines[i].includes('UFUNCTION') && i + 1 < lines.length) {
            // Check next few lines for the function signature
            for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
              if (lines[j].includes('TSharedPtr')) {
                failures.push(`${file.path}:${j + 1}: TSharedPtr in UFUNCTION parameter`);
              }
            }
          }
        }
      }
      expect(failures, `TSharedPtr in UFUNCTION:\n${failures.join('\n')}`).toEqual([]);
    });

    it('no BlueprintReadOnly/BlueprintReadWrite on private members', () => {
      const failures: string[] = [];
      for (const file of generatedFiles) {
        if (!file.path.endsWith('.h')) continue;

        const lines = file.content.split('\n');
        let inPrivate = false;
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line === 'private:') inPrivate = true;
          if (line === 'public:' || line === 'protected:') inPrivate = false;

          if (inPrivate && (line.includes('BlueprintReadOnly') || line.includes('BlueprintReadWrite'))) {
            // Allow UPROPERTY() on private members — just not Blueprint-exposed ones
            if (line.includes('UPROPERTY')) {
              failures.push(`${file.path}:${i + 1}: Blueprint specifier on private member`);
            }
          }
        }
      }
      expect(failures, `Blueprint specifiers on private members:\n${failures.join('\n')}`).toEqual([]);
    });

    it('no TArray default parameters in UFUNCTION signatures', () => {
      const failures: string[] = [];
      for (const file of generatedFiles) {
        if (!file.path.endsWith('.h')) continue;

        const lines = file.content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          // Look for lines that are part of a UFUNCTION and have TArray<...>() default
          if (lines[i].includes('TArray<') && lines[i].includes('()') && lines[i].includes('=')) {
            // Check if this is within a UFUNCTION context (look back for UFUNCTION)
            for (let j = Math.max(0, i - 3); j < i; j++) {
              if (lines[j].includes('UFUNCTION')) {
                failures.push(`${file.path}:${i + 1}: TArray default parameter in UFUNCTION`);
                break;
              }
            }
          }
        }
      }
      expect(failures, `TArray default params in UFUNCTION:\n${failures.join('\n')}`).toEqual([]);
    });
  });

  // ── Deprecated UE5 APIs ──

  describe('no deprecated UE5 APIs', () => {
    it('no FSlateDrawElement in function signatures (use FSlateWindowElementList)', () => {
      const failures: string[] = [];
      for (const file of generatedFiles) {
        // Check for FSlateDrawElement used as a parameter type (not just a static method call)
        const matches = file.content.match(/FSlateDrawElement\s*&/g);
        if (matches) {
          failures.push(`${file.path}: ${matches.length} FSlateDrawElement& reference(s)`);
        }
      }
      expect(failures, `Deprecated FSlateDrawElement& references:\n${failures.join('\n')}`).toEqual([]);
    });

    it('no invalid float literals (e.g. 100f instead of 100.0f)', () => {
      const failures: string[] = [];
      for (const file of generatedFiles) {
        // Match patterns like "= 100f" or "= 1f" (digit immediately followed by 'f' with no decimal point)
        // But not "0.5f" or "1.0f" (which are valid)
        const matches = file.content.match(/=\s*\d+f\b/g);
        if (matches) {
          // Filter out valid patterns like "0f" which is technically valid but suspicious
          const invalid = matches.filter(m => !m.includes('.'));
          if (invalid.length > 0) {
            failures.push(`${file.path}: ${invalid.join(', ')}`);
          }
        }
      }
      expect(failures, `Invalid float literals:\n${failures.join('\n')}`).toEqual([]);
    });
  });

  // ── Cross-reference validation ──

  describe('cross-reference consistency', () => {
    it('.cpp files include their corresponding .h file', () => {
      const failures: string[] = [];
      for (const file of generatedFiles) {
        if (!file.path.endsWith('.cpp')) continue;

        // Get the expected header name
        const cppName = file.path.split('/').pop()!;
        const headerName = cppName.replace('.cpp', '.h');

        // Check for #include of the header (with or without path prefix)
        if (!file.content.includes(`#include "${headerName}"`)) {
          // Also check for path-relative includes
          const hasRelativeInclude = file.content.match(
            new RegExp(`#include\\s+"[^"]*${headerName.replace('.', '\\.')}"`)
          );
          if (!hasRelativeInclude) {
            failures.push(`${file.path}: missing #include "${headerName}"`);
          }
        }
      }
      expect(failures, `Missing self-include:\n${failures.join('\n')}`).toEqual([]);
    });

    it('files using UMaterialInstanceDynamic include Materials/MaterialInstanceDynamic.h', () => {
      const failures: string[] = [];
      for (const file of generatedFiles) {
        if (!file.path.endsWith('.cpp')) continue;
        if (file.content.includes('UMaterialInstanceDynamic') &&
            !file.content.includes('MaterialInstanceDynamic.h')) {
          failures.push(file.path);
        }
      }
      expect(failures, `Missing MaterialInstanceDynamic.h include:\n${failures.join('\n')}`).toEqual([]);
    });

    it('files using ConstructorHelpers include UObject/ConstructorHelpers.h', () => {
      const failures: string[] = [];
      for (const file of generatedFiles) {
        if (!file.path.endsWith('.cpp')) continue;
        if (file.content.includes('ConstructorHelpers::') &&
            !file.content.includes('ConstructorHelpers.h')) {
          failures.push(file.path);
        }
      }
      expect(failures, `Missing ConstructorHelpers.h include:\n${failures.join('\n')}`).toEqual([]);
    });
  });

  // ── Known anti-patterns ──

  it('no static_cast<FSlateWindowElementList*> (should pass by reference)', () => {
    const failures: string[] = [];
    for (const file of generatedFiles) {
      if (file.content.includes('static_cast<FSlateWindowElementList*>')) {
        failures.push(file.path);
      }
    }
    expect(failures, `Unnecessary static_cast to FSlateWindowElementList*:\n${failures.join('\n')}`).toEqual([]);
  });

  it('no duplicate USTRUCT names across files', () => {
    const structNames = new Map<string, string>(); // name → first file
    const duplicates: string[] = [];

    for (const file of generatedFiles) {
      if (!file.path.endsWith('.h')) continue;

      const matches = file.content.matchAll(/USTRUCT\([^)]*\)\s*struct\s+(?:INSIMULEXPORT_API\s+)?(\w+)/g);
      for (const match of matches) {
        const name = match[1];
        const existing = structNames.get(name);
        if (existing && existing !== file.path) {
          duplicates.push(`${name}: defined in ${existing} and ${file.path}`);
        } else {
          structNames.set(name, file.path);
        }
      }
    }
    expect(duplicates, `Duplicate USTRUCT names:\n${duplicates.join('\n')}`).toEqual([]);
  });

  it('no class name mismatches between .h declaration and .cpp method definitions', () => {
    const failures: string[] = [];

    // Build map of class names from .h files
    const classNames = new Map<string, string>(); // file stem → class name
    for (const file of generatedFiles) {
      if (!file.path.endsWith('.h')) continue;
      const match = file.content.match(/class\s+(?:INSIMULEXPORT_API\s+)?([AU]\w+)\s*:\s*public/);
      if (match) {
        const stem = file.path.split('/').pop()!.replace('.h', '');
        classNames.set(stem, match[1]);
      }
    }

    // Check .cpp files for method definitions using wrong class name
    for (const file of generatedFiles) {
      if (!file.path.endsWith('.cpp')) continue;
      const stem = file.path.split('/').pop()!.replace('.cpp', '');
      const expectedClass = classNames.get(stem);
      if (!expectedClass) continue;

      // Find all ClassName:: method definitions
      const methodDefs = file.content.matchAll(/(\w+)::\w+\s*\(/g);
      for (const match of methodDefs) {
        const usedClass = match[1];
        // Skip common non-class prefixes (Super, FMath, UE_LOG, etc.)
        if (['Super', 'FMath', 'UE_LOG', 'FString', 'FVector', 'FLinearColor',
             'FRotator', 'FTransform', 'FQuat', 'FVector2D', 'Cast',
             'UMaterialInstanceDynamic', 'UGameplayStatics', 'FJsonSerializer',
             'TJsonReaderFactory', 'FFileHelper', 'FPaths', 'FPackageName',
             'IFileManager', 'UWorld', 'UPackage', 'FSlateDrawElement',
             'FSlateFontInfo', 'FCoreStyle', 'UWidgetTree',
        ].includes(usedClass)) continue;

        // If it starts with U/A/F/E and doesn't match the expected class, flag it
        if (usedClass.match(/^[UAFE]/) && usedClass !== expectedClass &&
            !file.content.includes(`class ${usedClass}`)) {
          // Only flag if it looks like it should be the file's own class
          // (i.e., it's defining a method, not calling a static method)
          const lineIdx = file.content.indexOf(match[0]);
          const lineStart = file.content.lastIndexOf('\n', lineIdx) + 1;
          const lineContent = file.content.slice(lineStart, file.content.indexOf('\n', lineIdx));
          // Method definitions start at column 0 (not indented)
          if (lineContent.match(/^\w/)) {
            failures.push(`${file.path}: method on ${usedClass} but header declares ${expectedClass}`);
            break; // One per file is enough
          }
        }
      }
    }
    expect(failures, `Class name mismatches:\n${failures.join('\n')}`).toEqual([]);
  });

  // ── File structure ──

  it('every .h file has at least one class, struct, or enum declaration', () => {
    const declPattern = /\b(class|struct|enum)\s+(?:INSIMULEXPORT_API\s+)?\w+/;
    const failures: string[] = [];
    for (const file of generatedFiles) {
      if (!file.path.endsWith('.h')) continue;
      if (!file.content.match(declPattern)) {
        failures.push(file.path);
      }
    }
    expect(failures, `Header files with no type declarations:\n${failures.join('\n')}`).toEqual([]);
  });

  it('no template file exceeds 2000 lines', () => {
    const failures: string[] = [];
    for (const file of generatedFiles) {
      const lines = file.content.split('\n').length;
      if (lines > 2000) {
        failures.push(`${file.path}: ${lines} lines`);
      }
    }
    expect(failures, `Oversized files:\n${failures.join('\n')}`).toEqual([]);
  });

  // ── Build.cs module dependencies ──

  it('HTTP module is listed when code uses FHttpModule', () => {
    const usesHttp = generatedFiles.some(f => f.content.includes('FHttpModule'));
    if (usesHttp) {
      const buildCs = readFileSync(
        join(__dirname, '../services/game-export/unreal/templates/project/Build.cs'),
        'utf8'
      );
      expect(buildCs).toContain('"HTTP"');
    }
  });

  it('AnimGraphRuntime is listed when code uses KismetAnimationLibrary', () => {
    const usesAnimLib = generatedFiles.some(f => f.content.includes('KismetAnimationLibrary'));
    if (usesAnimLib) {
      const buildCs = readFileSync(
        join(__dirname, '../services/game-export/unreal/templates/project/Build.cs'),
        'utf8'
      );
      expect(buildCs).toContain('"AnimGraphRuntime"');
    }
  });

  it('ProceduralMeshComponent module is listed when code uses UProceduralMeshComponent', () => {
    const usesProcMesh = generatedFiles.some(f => f.content.includes('UProceduralMeshComponent'));
    if (usesProcMesh) {
      const buildCs = readFileSync(
        join(__dirname, '../services/game-export/unreal/templates/project/Build.cs'),
        'utf8'
      );
      expect(buildCs).toContain('"ProceduralMeshComponent"');
    }
  });

  // ── .uproject plugin consistency ──

  it('plugin names in .uproject are valid for UE 5.7', () => {
    const uproject = readFileSync(
      join(__dirname, '../services/game-export/unreal/templates/project/InsimulExport.uproject'),
      'utf8'
    );
    // These plugin names were renamed/removed in UE 5.7
    expect(uproject).not.toContain('"InterchangePlugins"');
    expect(uproject).not.toContain('"GLTFImporter"');
  });
});
