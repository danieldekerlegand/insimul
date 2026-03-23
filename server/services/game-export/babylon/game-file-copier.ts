/**
 * File Copier for Babylon.js Export
 * 
 * This utility copies the actual 3DGame files from the client directory
 * to the export directory, with minimal modifications for standalone use.
 */

import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import * as path from 'path';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { GeneratedFile } from './babylon-project-generator';

const TEMPLATES_DIR = join(dirname(fileURLToPath(import.meta.url)), 'templates');

export class GameFileCopier {
  private sourceDir: string;
  private targetDir: string;

  constructor(sourceDir: string, targetDir: string) {
    this.sourceDir = sourceDir;
    this.targetDir = targetDir;
  }

  async copyAllFiles(): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];

    // Dynamically discover all .ts files in the 3DGame directory
    // instead of maintaining a hardcoded list that goes stale
    const filesToCopy = this.discoverGameFiles();

    // Copy each file with modifications
    for (const file of filesToCopy) {
      const sourcePath = path.join(this.sourceDir, file.src);
      const targetPath = file.dest;
      
      try {
        if (fs.existsSync(sourcePath)) {
          const content = await fsPromises.readFile(sourcePath, 'utf-8');
          let modifiedContent = await this.modifyFileForExport(content, file.src);
          
          // Special handling for BabylonGame.ts to fix asset paths
          if (file.src === 'BabylonGame.ts') {
            // Fix rootUrl construction to use ASSET_ROOT instead of hardcoded '/'
            modifiedContent = modifiedContent.replace(
              "rootUrl = '/' + cleanPath.substring(0, lastSlash + 1);",
              "rootUrl = ASSET_ROOT + cleanPath.substring(0, lastSlash + 1);"
            );
            modifiedContent = modifiedContent.replace(
              "            rootUrl = '/';",
              "            rootUrl = ASSET_ROOT;"
            );
            modifiedContent = modifiedContent.replace(
              "'/' + cleanPath.substring(0, lastSlash + 1) : '/'",
              "ASSET_ROOT + cleanPath.substring(0, lastSlash + 1) : ASSET_ROOT"
            );
            // Fix player/NPC model path — skip .babylon assets (not exported) and use ASSET_ROOT
            modifiedContent = modifiedContent.replace(
              "if (playerAsset && playerAsset.filePath) {",
              "if (playerAsset && playerAsset.filePath && !playerAsset.filePath.endsWith('.babylon')) {"
            );
            modifiedContent = modifiedContent.replace(
              "          playerRootUrl = lastSlash >= 0 ? '/' + cleanPath.substring(0, lastSlash + 1) : '/';",
              "          playerRootUrl = lastSlash >= 0 ? ASSET_ROOT + cleanPath.substring(0, lastSlash + 1) : ASSET_ROOT;"
            );
            modifiedContent = modifiedContent.replace(
              "if (overrideAsset && overrideAsset.filePath) {",
              "if (overrideAsset && overrideAsset.filePath && !overrideAsset.filePath.endsWith('.babylon')) {"
            );

            // Fix ground texture paths (absolute → relative)
            modifiedContent = modifiedContent.replace(
              /new Texture\("\/assets\/ground\/ground\.jpg"/g,
              'new Texture("./assets/ground/ground.jpg"'
            );

            modifiedContent = modifiedContent.replace(
              /new Texture\("\/assets\/ground\/ground-normal\.png"/g,
              'new Texture("./assets/ground/ground-normal.png"'
            );

            modifiedContent = modifiedContent.replace(
              /"\/assets\/ground\/ground_heightMap\.png"/g,
              '"./assets/ground/ground_heightMap.png"'
            );

            // Fix NPC SceneLoader call to use proper rootUrl/fileName split
            modifiedContent = modifiedContent.replace(
              /const result = await SceneLoader\.ImportMeshAsync\("", "", NPC_MODEL_URL, this\.scene\);/g,
              `const npcRootUrl = "./assets/npc/";
        const npcFileName = "starterAvatars.babylon";
        const result = await SceneLoader.ImportMeshAsync("", npcRootUrl, npcFileName, this.scene);`
            );

          }

          // Special handling for TextureManager.ts to fix asset paths on file:// protocol
          if (file.src === 'TextureManager.ts') {
            modifiedContent = modifiedContent.replace(
              `    // Handle both absolute URLs and relative paths
    if (!texturePath.startsWith('http://') && !texturePath.startsWith('https://')) {
      // Relative path → ensure it starts with '/'
      if (!texturePath.startsWith('/')) {
        texturePath = \`/\${texturePath}\`;
      }
    } else {`,
              `    // Use relative paths on file:// protocol (Electron production), absolute otherwise
    const assetRoot = (typeof window !== 'undefined' && window.location?.protocol === 'file:') ? './' : '/';

    // Handle both absolute URLs and relative paths
    if (!texturePath.startsWith('http://') && !texturePath.startsWith('https://')) {
      // Relative path → prefix with assetRoot
      if (!texturePath.startsWith('/') && !texturePath.startsWith('./')) {
        texturePath = \`\${assetRoot}\${texturePath}\`;
      }
    } else {`
            );
          }

          // Debug: Check if this is BabylonGame.ts
          if (file.src === 'BabylonGame.ts') {
            console.log(`[GameFileCopier] Processing BabylonGame.ts - checking for @shared imports:`);
            const lines = modifiedContent.split('\n');
            lines.forEach((line, idx) => {
              if (line.includes('@shared')) {
                console.log(`  Found @shared at line ${idx + 1}: ${line}`);
              }
            });
          }
          
          files.push({ path: targetPath, content: modifiedContent });
        }
      } catch (error) {
        console.warn(`Failed to copy file: ${file.src}`, error);
      }
    }

    // Create a comprehensive types file for the exported game
    files.push({
      path: 'src/types.ts',
      content: `/**
 * Game Engine Types - Local copy for exported game
 */

// Combat types
export interface CombatEntityData {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  damage?: number;
}

export interface CombatStyle {
  id: string;
  name: string;
  damageMultiplier: number;
}

export interface CombatSettings {
  enabled: boolean;
  damageMultiplier: number;
}

export interface DamageResult {
  targetId: string;
  damage: number;
  newHealth: number;
}

export const DEFAULT_COMBAT_SETTINGS: CombatSettings = {
  enabled: true,
  damageMultiplier: 1.0,
};

// Inventory types
export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  maxStack?: number;
}

// Resource types
export type ResourceType = 'wood' | 'stone' | 'metal' | 'food' | 'water';

export interface ResourceInventory {
  [key: string]: number;
}

export interface StorageCapacity {
  max: number;
  current: number;
}

// Survival types
export type NeedType = 'hunger' | 'thirst' | 'energy' | 'health';

export interface NeedConfig {
  id: NeedType;
  name: string;
  decayRate: number;
}

export interface NeedState {
  id: NeedType;
  value: number;
  max: number;
}

export interface NeedModifier {
  id: string;
  needId: NeedType;
  amount: number;
  duration?: number;
}

export interface SurvivalEvent {
  type: string;
  message: string;
}

// Rule types
export interface Rule {
  id: string;
  name: string;
  condition: RuleCondition;
  effect: RuleEffect;
}

export interface RuleCondition {
  type: string;
  params?: any;
}

export interface RuleEffect {
  type: string;
  params?: any;
}

export interface RuleViolation {
  ruleId: string;
  ruleName: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface GameContext {
  location?: Vec3;
  time?: number;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

// Crafting types
export interface ItemCategory {
  id: string;
  name: string;
}

export interface CraftingRecipe {
  id: string;
  name: string;
  inputs: { [key: string]: number };
  outputs: { [key: string]: number };
  category: ItemCategory;
}

export interface CraftedItem {
  id: string;
  name: string;
  quantity: number;
}

// Dungeon types
export type RoomType = 'entrance' | 'exit' | 'treasure' | 'enemy' | 'trap';
export type TileType = 'floor' | 'wall' | 'door' | 'trap';
export type LootRarity = 'common' | 'uncommon' | 'rare' | 'legendary';
export type TrapType = 'spike' | 'poison' | 'fire' | 'electric';

export interface DungeonConfig {
  floorNumber: number;
  minRooms: number;
  maxRooms: number;
}

export interface EnemySpawn {
  type: string;
  position: Vec3;
  level: number;
}

export interface LootSpawn {
  items: string[];
  position: Vec3;
  rarity: LootRarity;
}

export interface TrapSpawn {
  type: TrapType;
  position: Vec3;
  damage: number;
}

export interface DungeonRoom {
  id: string;
  type: RoomType;
  position: Vec3;
  size: Vec3;
  connections: string[];
}

export interface DungeonCorridor {
  from: string;
  to: string;
  path: Vec3[];
}

export interface DungeonFloorData {
  rooms: DungeonRoom[];
  corridors: DungeonCorridor[];
  enemies: EnemySpawn[];
  loot: LootSpawn[];
  traps: TrapSpawn[];
}

// Action types
export interface Action {
  id: string;
  name: string;
  description?: string;
}

export type ActionState = 'available' | 'in_progress' | 'completed' | 'failed';

export interface ActionContext {
  playerId: string;
  targetId?: string;
  location?: Vec3;
}

export interface ActionResult {
  success: boolean;
  message?: string;
  effects?: ActionEffect[];
}

export interface ActionEffect {
  type: string;
  value: any;
}

export interface ActionUIConfig {
  icon?: string;
  color?: string;
  shortcut?: string;
}

export const ACTION_UI_CONFIGS: { [key: string]: ActionUIConfig } = {};
`
    });

    // Create a barrel export file
    files.push({
      path: 'src/index.ts',
      content: this.generateBarrelExport()
    });

    return files;
  }

  /**
   * Dynamically discover all .ts files in the 3DGame directory and subdirectories.
   * This replaces the previous hardcoded file list which went stale as new files were added.
   */
  private discoverGameFiles(): { src: string; dest: string }[] {
    const result: { src: string; dest: string }[] = [];

    const scan = (dir: string, relPrefix: string) => {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === '__tests__' || entry.name.endsWith('.test.ts')) continue;
        const absPath = path.join(dir, entry.name);
        const relPath = relPrefix ? `${relPrefix}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
          scan(absPath, relPath);
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) && !entry.name.endsWith('.d.ts')) {
          result.push({ src: relPath, dest: `src/${relPath}` });
        }
      }
    };

    scan(this.sourceDir, '');
    return result;
  }

  private async modifyFileForExport(content: string, filename: string): Promise<string> {
    let modified = content;

    // Rewrite @/components/3DGame/* imports → relative (files are co-located in src/)
    // Handles both static `from "@/components/3DGame/..."` and dynamic `import('@/components/3DGame/...')`
    modified = modified.replace(/@\/components\/3DGame\//g, './');
    modified = modified.replace(/from "@\/contexts\/AuthContext"/g, '// from "@/contexts/AuthContext"');

    // Strip dev-only imports that aren't bundled in the export
    modified = modified.replace(/^import\s+["']@babylonjs\/inspector["'];?\s*$/gm, '// @babylonjs/inspector removed — dev-only, not bundled in export');

    // Rewrite relative ../../../../shared/ paths → ./shared/ (shared/ is copied to src/shared/)
    // Preserve the original quote style to avoid mismatched quotes
    modified = modified.replace(/from (["'])(?:\.\.\/)+shared\//g, "from $1./shared/");

    // After all import rewrites, inject ASSET_ROOT for BabylonGame.ts
    if (filename === 'BabylonGame.ts') {
      // Insert ASSET_ROOT after the last import statement
      const lines = modified.split('\n');
      let lastImportIdx = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ') || lines[i].startsWith('} from ')) lastImportIdx = i;
      }
      if (lastImportIdx >= 0) {
        lines.splice(lastImportIdx + 1, 0, '',
          "// Use relative asset root for exported games (works in both Vite dev and Electron file://)",
          "const ASSET_ROOT = './';");
        modified = lines.join('\n');
      }
    }

    return modified;
  }

  private generateBarrelExport(): string {
    return readFileSync(join(TEMPLATES_DIR, 'game-index.ts'), 'utf8');
  }
}
