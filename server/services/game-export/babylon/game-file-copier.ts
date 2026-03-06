/**
 * File Copier for Babylon.js Export
 * 
 * This utility copies the actual 3DGame files from the client directory
 * to the export directory, with minimal modifications for standalone use.
 */

import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import * as path from 'path';
import type { GeneratedFile } from './babylon-project-generator';

export class GameFileCopier {
  private sourceDir: string;
  private targetDir: string;

  constructor(sourceDir: string, targetDir: string) {
    this.sourceDir = sourceDir;
    this.targetDir = targetDir;
  }

  async copyAllFiles(): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];
    
    // Define the file structure to copy
    const filesToCopy = [
      // Core files
      { src: 'BabylonGame.ts', dest: 'src/BabylonGame.ts' },
      { src: 'DataSource.ts', dest: 'src/DataSource.ts' },
      { src: 'TextureManager.ts', dest: 'src/TextureManager.ts' },
      { src: 'AudioManager.ts', dest: 'src/AudioManager.ts' },
      { src: 'CameraManager.ts', dest: 'src/CameraManager.ts' },
      { src: 'CharacterController.ts', dest: 'src/CharacterController.ts' },
      { src: 'HealthBar.ts', dest: 'src/HealthBar.ts' },
      
      // World generation
      { src: 'WorldScaleManager.ts', dest: 'src/WorldScaleManager.ts' },
      { src: 'ProceduralBuildingGenerator.ts', dest: 'src/ProceduralBuildingGenerator.ts' },
      { src: 'ProceduralNatureGenerator.ts', dest: 'src/ProceduralNatureGenerator.ts' },
      { src: 'ProceduralDungeonGenerator.ts', dest: 'src/ProceduralDungeonGenerator.ts' },
      { src: 'RoadGenerator.ts', dest: 'src/RoadGenerator.ts' },
      
      // Game systems
      { src: 'actions/ActionManager.ts', dest: 'src/actions/ActionManager.ts' },
      { src: 'actions/index.ts', dest: 'src/actions/index.ts' },
      { src: 'RuleEnforcer.ts', dest: 'src/RuleEnforcer.ts' },
      { src: 'CombatSystem.ts', dest: 'src/CombatSystem.ts' },
      { src: 'RangedCombatSystem.ts', dest: 'src/RangedCombatSystem.ts' },
      { src: 'FightingCombatSystem.ts', dest: 'src/FightingCombatSystem.ts' },
      { src: 'TurnBasedCombatSystem.ts', dest: 'src/TurnBasedCombatSystem.ts' },
      { src: 'CraftingSystem.ts', dest: 'src/CraftingSystem.ts' },
      { src: 'ResourceSystem.ts', dest: 'src/ResourceSystem.ts' },
      { src: 'SurvivalNeedsSystem.ts', dest: 'src/SurvivalNeedsSystem.ts' },
      { src: 'RunManager.ts', dest: 'src/RunManager.ts' },
      
      // VR Components
      { src: 'VRManager.ts', dest: 'src/VRManager.ts' },
      { src: 'VRAccessibilityManager.ts', dest: 'src/VRAccessibilityManager.ts' },
      { src: 'VRChatPanel.ts', dest: 'src/VRChatPanel.ts' },
      { src: 'VRCombatAdapter.ts', dest: 'src/VRCombatAdapter.ts' },
      { src: 'VRComfortSettings.ts', dest: 'src/VRComfortSettings.ts' },
      { src: 'VRHUDManager.ts', dest: 'src/VRHUDManager.ts' },
      { src: 'VRHandTrackingManager.ts', dest: 'src/VRHandTrackingManager.ts' },
      { src: 'VRInteractionManager.ts', dest: 'src/VRInteractionManager.ts' },
      { src: 'VRUIPanel.ts', dest: 'src/VRUIPanel.ts' },
      { src: 'VRVocabularyLabels.ts', dest: 'src/VRVocabularyLabels.ts' },
      
      // UI Systems
      { src: 'BabylonGUIManager.ts', dest: 'src/BabylonGUIManager.ts' },
      { src: 'BabylonChatPanel.ts', dest: 'src/BabylonChatPanel.ts' },
      { src: 'BabylonDialogueActions.ts', dest: 'src/BabylonDialogueActions.ts' },
      { src: 'BabylonInventory.ts', dest: 'src/BabylonInventory.ts' },
      { src: 'BabylonMinimap.ts', dest: 'src/BabylonMinimap.ts' },
      { src: 'BabylonQuestTracker.ts', dest: 'src/BabylonQuestTracker.ts' },
      { src: 'BabylonRadialMenu.ts', dest: 'src/BabylonRadialMenu.ts' },
      { src: 'BabylonRulesPanel.ts', dest: 'src/BabylonRulesPanel.ts' },
      { src: 'CombatUI.ts', dest: 'src/CombatUI.ts' },
      { src: 'GameMenuSystem.ts', dest: 'src/GameMenuSystem.ts' },
      { src: 'GenreUIManager.ts', dest: 'src/GenreUIManager.ts' },
      
      // Building systems
      { src: 'BuildingInfoDisplay.ts', dest: 'src/BuildingInfoDisplay.ts' },
      { src: 'BuildingInteriorGenerator.ts', dest: 'src/BuildingInteriorGenerator.ts' },
      { src: 'BuildingPlacementSystem.ts', dest: 'src/BuildingPlacementSystem.ts' },
      
      // Quest systems
      { src: 'QuestObjectManager.ts', dest: 'src/QuestObjectManager.ts' },
      { src: 'QuestIndicatorManager.ts', dest: 'src/QuestIndicatorManager.ts' },
      { src: 'QuestWaypointManager.ts', dest: 'src/QuestWaypointManager.ts' },
      
      // NPC systems
      { src: 'NPCTalkingIndicator.ts', dest: 'src/NPCTalkingIndicator.ts' },
      { src: 'NPCAmbientConversationManager.ts', dest: 'src/NPCAmbientConversationManager.ts' },
      
      // Types
      { src: 'types/actions.ts', dest: 'src/types/actions.ts' },
      { src: 'types/index.ts', dest: 'src/types/index.ts' },
      
      // Utilities
      { src: 'DebugLabelUtils.ts', dest: 'src/DebugLabelUtils.ts' },
      { src: 'LanguageProgressTracker.ts', dest: 'src/LanguageProgressTracker.ts' },
    ];

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
            // Inject ASSET_ROOT constant for Electron file:// protocol compatibility
            modifiedContent = modifiedContent.replace(
              /^(const FOOTSTEP_SOUND_URL = .+;)$/m,
              `$1\n// Use relative asset root when running from file:// (Electron production build)\nconst ASSET_ROOT = (typeof window !== 'undefined' && window.location?.protocol === 'file:') ? './' : '/';`
            );
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

            // Fix model URL constants to use './' prefix (works in both web and Electron file://)
            // and point to the actual paths the asset bundler exports them to.
            modifiedContent = modifiedContent.replace(
              /const PLAYER_MODEL_URL = "\/assets\/player\/Vincent-frontFacing\.babylon";/g,
              'const PLAYER_MODEL_URL = "./assets/player/Vincent-frontFacing.babylon";'
            );

            modifiedContent = modifiedContent.replace(
              /const NPC_MODEL_URL = "\/assets\/npc\/starterAvatars\.babylon";/g,
              'const NPC_MODEL_URL = "./assets/npc/starterAvatars.babylon";'
            );

            modifiedContent = modifiedContent.replace(
              /const FOOTSTEP_SOUND_URL = "\/assets\/footstep_carpet_000\.ogg";/g,
              'const FOOTSTEP_SOUND_URL = "./assets/audio/footstep/stone.mp3";'
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
              /result = await SceneLoader\.ImportMeshAsync\("", "", NPC_MODEL_URL, this\.scene\);/g,
              `const npcRootUrl = "./assets/npc/";
const npcFileName = "starterAvatars.babylon";
result = await SceneLoader.ImportMeshAsync("", npcRootUrl, npcFileName, this.scene);`
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

  private async modifyFileForExport(content: string, filename: string): Promise<string> {
    let modified = content;
    
    // Special handling for DataSource.ts
    if (filename === 'DataSource.ts') {
      // Replace the loadAssets method to load from asset manifest
      modified = modified.replace(
        /async loadAssets\(worldId: string\): Promise<any\[]> \{[\s\S]*?return this\.worldData\?\.theme\?\.assets \|\| \[\];[\s\S]*?\}/,
        `async loadAssets(worldId: string): Promise<any[]> {
    await this.waitForData();
    // Load assets from the asset manifest
    try {
      const response = await fetch('./data/asset-manifest.json');
      const manifest = await response.json();
      
      // Convert manifest assets to the expected format
      const assets: any[] = [];
      
      // Add character assets
      if (manifest.categories?.character) {
        for (const asset of manifest.categories.character) {
          assets.push({
            id: asset.role,
            name: asset.role,
            assetType: 'character',
            filePath: asset.exportPath,
            fileSize: asset.fileSize
          });
        }
      }
      
      // Add building assets
      if (manifest.categories?.building) {
        for (const asset of manifest.categories.building) {
          assets.push({
            id: asset.role,
            name: asset.role,
            assetType: 'building',
            filePath: asset.exportPath,
            fileSize: asset.fileSize
          });
        }
      }
      
      // Add ground textures
      if (manifest.categories?.ground) {
        for (const asset of manifest.categories.ground) {
          assets.push({
            id: asset.role,
            name: asset.role,
            assetType: 'texture_ground',
            filePath: asset.exportPath,
            fileSize: asset.fileSize
          });
        }
      }
      
      // Add quest objects
      if (manifest.categories?.questObject) {
        for (const asset of manifest.categories.questObject) {
          assets.push({
            id: asset.role,
            name: asset.role,
            assetType: 'quest_object',
            filePath: asset.exportPath,
            fileSize: asset.fileSize
          });
        }
      }
      
      // Also add quest objects from the quest-objects directory
      const questObjectAssets = [
        { id: 'chest', name: 'chest', assetType: 'quest_object', filePath: 'assets/quest-objects/chest.glb' },
        { id: 'quest_marker', name: 'quest_marker', assetType: 'quest_object', filePath: 'assets/quest-objects/quest_marker.glb' },
        { id: 'collectible_gem', name: 'collectible_gem', assetType: 'quest_object', filePath: 'assets/quest-objects/collectible_gem.glb' },
        { id: 'water_bottle', name: 'water_bottle', assetType: 'quest_object', filePath: 'assets/quest-objects/water_bottle.glb' },
      ];
      
      for (const asset of questObjectAssets) {
        assets.push(asset);
      }
      
      return assets;
    } catch (error) {
      console.error('Failed to load asset manifest:', error);
      return [];
    }
  }`
      );
      
      // Replace loadConfig3D to return proper 3D config
      modified = modified.replace(
        /async loadConfig3D\(worldId: string\): Promise<any> \{[\s\S]*?return this\.worldData\?\.theme\?\.visuals \|\| \{\};[\s\S]*?\}/,
        `async loadConfig3D(worldId: string): Promise<any> {
    await this.waitForData();
    // Return a default 3D config with proper asset mappings
    return {
      buildingModels: {
        house: 'house',
        blacksmith: 'blacksmith',
        church: 'church',
        barracks: 'barracks',
        castle: 'castle',
        tavern: 'house', // Reuse house model
        shop: 'house', // Reuse house model
        market: 'house', // Reuse house model
        farm: 'house', // Reuse house model
        mill: 'blacksmith', // Reuse blacksmith model
        watchtower: 'barracks', // Reuse barracks model
        wall: 'house', // Reuse house model
        gate: 'church', // Reuse church model
        tower: 'barracks', // Reuse barracks model
        keep: 'castle', // Reuse castle model
        palace: 'castle', // Reuse castle model
      },
      natureModels: {},
      objectModels: {},
      questObjectModels: {
        chest: 'chest',
        quest_marker: 'quest_marker',
        collectible_gem: 'collectible_gem',
        water_bottle: 'water_bottle',
        key: 'chest', // Reuse chest model
        scroll: 'chest', // Reuse chest model
        artifact: 'collectible_gem', // Reuse gem model
      },
      groundTextureId: 'ground_diffuse',
      roadTextureId: 'ground_diffuse',
      wallTextureId: 'building_texture',
      roofTextureId: 'building_texture',
    };
  }`
      );
    }
    
    // Instead of commenting out @shared imports, we'll keep them and handle them in the build
    // Only replace @/ imports with relative paths
    modified = modified.replace(/from "@\/components\/3DGame\//g, 'from "./');
    modified = modified.replace(/from "@\/contexts\/AuthContext"/g, '// from "@/contexts/AuthContext"');
    
    // Remove duplicate properties
    modified = modified.replace(/private dataSource: DataSource;\s*private dataSource: DataSource;/g, 'private dataSource: DataSource;');
    
    // Add DataSource injection where needed
    if (!modified.includes('import { DataSource }') && modified.includes('private dataSource: DataSource')) {
      modified = 'import { DataSource, FileDataSource } from "./DataSource";\n' + modified;
    }
    
    return modified;
  }

  private addDataSourceInjection(content: string): string {
    // Add DataSource import
    if (!content.includes('import { DataSource }')) {
      content = content.replace(
        'import type { VisualAsset }',
        'import { DataSource, FileDataSource } from "./DataSource";\nimport type { VisualAsset }'
      );
    }

    // Add dataSource to config interface
    content = content.replace(
      'interface BabylonGameConfig {',
      'interface BabylonGameConfig {\n  dataSource?: DataSource;'
    );

    // Find the constructor and add dataSource initialization
    const constructorMatch = content.match(/constructor\(canvas: HTMLCanvasElement, config: BabylonGameConfig\) \{[\s\S]*?this\.config = config;/);
    if (constructorMatch) {
      const newConstructor = constructorMatch[0].replace(
        'this.config = config;',
        'this.config = config;\n    this.dataSource = config.dataSource || new FileDataSource();'
      );
      content = content.replace(constructorMatch[0], newConstructor);
    }

    // Add dataSource property declaration
    content = content.replace(
      'private config: BabylonGameConfig;',
      'private config: BabylonGameConfig;\n  private dataSource: DataSource;'
    );

    // Replace fetch calls in loadWorldData to use dataSource
    const loadWorldDataMatch = content.match(/private async loadWorldData\(\): Promise<void> \{[\s\S]*?const \[\s*world,[\s\S]*?\]\s*=\s*await Promise\.all\(\[[\s\S]*?\]\);[\s\S]*?this\.worldData = world;[\s\S]*?this\.characters = characters;/);
    if (loadWorldDataMatch) {
      const newLoadWorldData = `
  private async loadWorldData(): Promise<void> {
    try {
      const worldId = this.config.worldId;

      // Use the data source instead of direct API calls
      const [
        world,
        characters,
        actions,
        baseActions,
        quests,
        settlements,
        rules,
        baseRules,
        countries,
        states,
        baseResources,
        assets,
        config3D
      ] = await Promise.all([
        this.dataSource.loadWorld(worldId),
        this.dataSource.loadCharacters(worldId),
        this.dataSource.loadActions(worldId),
        this.dataSource.loadBaseActions(),
        this.dataSource.loadQuests(worldId),
        this.dataSource.loadSettlements(worldId),
        this.dataSource.loadRules(worldId),
        this.dataSource.loadBaseRules(),
        this.dataSource.loadCountries(worldId),
        this.dataSource.loadStates(worldId),
        this.dataSource.loadBaseResources(worldId),
        this.dataSource.loadAssets(worldId),
        this.dataSource.loadConfig3D(worldId)
      ]);

      // Store the data - populate both worldData and separate properties for compatibility
      this.worldData = {
        ...world,
        characters,  // Also store in worldData for compatibility
        settlements, // Also store in worldData for compatibility
        rules,
        baseRules,
        actions,
        baseActions,
        quests,
        countries,
        states,
        baseResources
      };
      
      // Also store in separate properties for main app compatibility
      this.characters = characters;
      this.actions = [...actions, ...baseActions];
      this.quests = quests;
      this.settlements = settlements;
      this.rules = [...rules, ...baseRules];
      this.countries = countries;
      this.states = states;
      this.baseResources = baseResources;
      this.assets = assets;
      this.config3D = config3D;

      console.log('[BabylonGame] World data loaded successfully');

      // Apply 3D model overrides if generators are ready
      if (this.scene && this.buildingGenerator && this.natureGenerator) {
        await this.applyWorld3DConfig();
      }

      // Update UI
      this.updateWorldStatsUI();
    } catch (error) {
      console.error('Failed to load world data:', error);
    }
  }`;
      content = content.replace(loadWorldDataMatch[0], newLoadWorldData);
    }

    // Fix updateWorldStatsUI to have default empty arrays
    content = content.replace(
      /const \{ countries, settlements, characters, rules, baseRules, actions, baseActions, quests \} = this\.worldData;/,
      'const { countries = [], settlements = [], characters = [], rules = [], baseRules = [], actions = [], baseActions = [], quests = [] } = this.worldData;'
    );

    // Fix generateProceduralWorld to handle empty settlements
    content = content.replace(
      /const settlements = this\.worldData\.settlements\.slice\(0, MAX_SETTLEMENTS_3D\);/,
      'const settlements = (this.worldData.settlements || []).slice(0, MAX_SETTLEMENTS_3D);'
    );

    // Fix loadNPCs to handle empty characters
    content = content.replace(
      /const characters = this\.worldData\.characters\.slice\(0, MAX_NPCS\);/,
      'const characters = (this.worldData.characters || []).slice(0, MAX_NPCS);'
    );

    // Update player model path
    content = content.replace(
      /const PLAYER_MODEL_URL = "\/assets\/player\/Vincent-frontFacing\.babylon";/,
      'const PLAYER_MODEL_URL = "/assets/characters/player_default.glb";'
    );

    return content;
  }

  private generateBarrelExport(): string {
    return `/**
 * Barrel export for the Babylon.js game
 */

export { BabylonGame } from './BabylonGame';
export { createDataSource, FileDataSource, type DataSource } from './DataSource';

// Export all game components
export * from './TextureManager';
export * from './AudioManager';
export * from './CameraManager';
export * from './CharacterController';
export * from './HealthBar';
export * from './WorldScaleManager';
export * from './ProceduralBuildingGenerator';
export * from './ProceduralNatureGenerator';
export * from './ProceduralDungeonGenerator';
export * from './RoadGenerator';
export * from './actions/ActionManager';
export * from './RuleEnforcer';
export * from './CombatSystem';
export * from './RangedCombatSystem';
export * from './FightingCombatSystem';
export * from './TurnBasedCombatSystem';
export * from './CraftingSystem';
export * from './ResourceSystem';
export * from './SurvivalNeedsSystem';
export * from './RunManager';
export * from './QuestObjectManager';
export * from './QuestIndicatorManager';
export * from './QuestWaypointManager';
export * from './BabylonGUIManager';
export * from './BabylonChatPanel';
export * from './BabylonDialogueActions';
export * from './BabylonInventory';
export * from './BabylonMinimap';
export * from './BabylonQuestTracker';
export * from './BabylonRadialMenu';
export * from './BabylonRulesPanel';
export * from './CombatUI';
export * from './GameMenuSystem';
export * from './GenreUIManager';
export * from './BuildingInfoDisplay';
export * from './BuildingInteriorGenerator';
export * from './BuildingPlacementSystem';
export * from './NPCTalkingIndicator';
export * from './NPCAmbientConversationManager';
export * from './DebugLabelUtils';
export * from './LanguageProgressTracker';
export * from './types';
`;
  }
}
