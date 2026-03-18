/**
 * Data Layer Abstraction for BabylonGame
 *
 * This provides a unified interface for loading game data
 * that can switch between API calls (for Insimul) and
 * file loading (for exported games).
 */

import { PlaythroughQuestOverlay } from './PlaythroughQuestOverlay';

export interface DataSource {
  /** Playthrough-scoped quest overlay. When set, loadQuests merges overlay
   *  state on top of base world quests, and updateQuest writes to the overlay
   *  instead of the world. */
  questOverlay: PlaythroughQuestOverlay | null;
  loadWorld(worldId: string): Promise<any>;
  loadCharacters(worldId: string): Promise<any[]>;
  loadActions(worldId: string): Promise<any[]>;
  loadBaseActions(): Promise<any[]>;
  loadQuests(worldId: string): Promise<any[]>;
  loadSettlements(worldId: string): Promise<any[]>;
  loadRules(worldId: string): Promise<any[]>;
  loadBaseRules(): Promise<any[]>;
  loadCountries(worldId: string): Promise<any[]>;
  loadStates(worldId: string): Promise<any[]>;
  loadBaseResources(worldId: string): Promise<any>;
  loadAssets(worldId: string): Promise<any[]>;
  loadConfig3D(worldId: string): Promise<any>;
  loadTruths(worldId: string): Promise<any[]>;
  loadCharacter(characterId: string): Promise<any>;
  startPlaythrough(worldId: string, authToken: string, playthroughName: string): Promise<any>;
  updateQuest(questId: string, data: any): Promise<void>;
  loadSettlementBusinesses(settlementId: string): Promise<any[]>;
  loadSettlementLots(settlementId: string): Promise<any[]>;
  loadSettlementResidences(settlementId: string): Promise<any[]>;
  payFines(playthroughId: string, settlementId: string): Promise<any>;
  getEntityInventory(worldId: string, entityId: string): Promise<any>;
  transferItem(worldId: string, transfer: {
    fromEntityId?: string;
    toEntityId?: string;
    itemId: string;
    itemName?: string;
    itemDescription?: string;
    itemType?: string;
    quantity?: number;
    transactionType: 'buy' | 'sell' | 'steal' | 'discard' | 'give' | 'quest_reward';
    totalPrice?: number;
  }): Promise<any>;
  getMerchantInventory(worldId: string, merchantId: string): Promise<any>;
  loadPrologContent(worldId: string): Promise<string | null>;
  loadWorldItems(worldId: string): Promise<any[]>;
  saveGameState(worldId: string, playthroughId: string, slotIndex: number, state: any): Promise<void>;
  loadGameState(worldId: string, playthroughId: string, slotIndex: number): Promise<any | null>;
  loadGeography(worldId: string): Promise<{ heightmap?: number[][]; terrainSize?: number } | null>;
}

/**
 * API-based data source for Insimul
 */
export class ApiDataSource implements DataSource {
  public questOverlay: PlaythroughQuestOverlay | null = null;

  constructor(private authToken: string) {}

  private getHeaders(): HeadersInit {
    return this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {};
  }

  async loadWorld(worldId: string): Promise<any> {
    const res = await fetch(`/api/worlds/${worldId}`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : {};
  }

  async loadCharacters(worldId: string): Promise<any[]> {
    const res = await fetch(`/api/worlds/${worldId}/characters`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : [];
  }

  async loadActions(worldId: string): Promise<any[]> {
    const res = await fetch(`/api/worlds/${worldId}/actions`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : [];
  }

  async loadBaseActions(): Promise<any[]> {
    const res = await fetch(`/api/actions/base`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : [];
  }

  async loadQuests(worldId: string): Promise<any[]> {
    const res = await fetch(`/api/worlds/${worldId}/quests`, { headers: this.getHeaders() });
    const baseQuests = res.ok ? await res.json() : [];
    return this.questOverlay ? this.questOverlay.mergeQuests(baseQuests) : baseQuests;
  }

  async loadSettlements(worldId: string): Promise<any[]> {
    const res = await fetch(`/api/worlds/${worldId}/settlements`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : [];
  }

  async loadRules(worldId: string): Promise<any[]> {
    const res = await fetch(`/api/rules?worldId=${worldId}`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : [];
  }

  async loadBaseRules(): Promise<any[]> {
    const res = await fetch(`/api/rules/base`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : [];
  }

  async loadCountries(worldId: string): Promise<any[]> {
    const res = await fetch(`/api/worlds/${worldId}/countries`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : [];
  }

  async loadStates(worldId: string): Promise<any[]> {
    const res = await fetch(`/api/worlds/${worldId}/states`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : [];
  }

  async loadBaseResources(worldId: string): Promise<any> {
    const res = await fetch(`/api/worlds/${worldId}/base-resources/config`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : {};
  }

  async loadAssets(worldId: string): Promise<any[]> {
    const res = await fetch(`/api/worlds/${worldId}/assets`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : [];
  }

  async loadConfig3D(worldId: string): Promise<any> {
    const res = await fetch(`/api/worlds/${worldId}/3d-config`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : {};
  }

  async loadTruths(worldId: string): Promise<any[]> {
    const res = await fetch(`/api/worlds/${worldId}/truth`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : [];
  }

  async loadCharacter(characterId: string): Promise<any> {
    const res = await fetch(`/api/characters/${characterId}`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : null;
  }

  async startPlaythrough(worldId: string, authToken: string, playthroughName: string): Promise<any> {
    const res = await fetch(`/api/worlds/${worldId}/playthroughs/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ name: playthroughName }),
    });
    return res.ok ? await res.json() : null;
  }

  async updateQuest(questId: string, data: any): Promise<void> {
    if (this.questOverlay) {
      this.questOverlay.updateQuest(questId, data);
      return;
    }
    // Fallback: direct world write (no playthrough active)
    await fetch(`/api/quests/${questId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  async loadSettlementBusinesses(settlementId: string): Promise<any[]> {
    const res = await fetch(`/api/settlements/${settlementId}/businesses`);
    return res.ok ? await res.json() : [];
  }

  async loadSettlementLots(settlementId: string): Promise<any[]> {
    const res = await fetch(`/api/settlements/${settlementId}/lots`);
    return res.ok ? await res.json() : [];
  }

  async loadSettlementResidences(settlementId: string): Promise<any[]> {
    const res = await fetch(`/api/settlements/${settlementId}/residences`);
    return res.ok ? await res.json() : [];
  }

  async payFines(playthroughId: string, settlementId: string): Promise<any> {
    const res = await fetch(
      `/api/playthroughs/${playthroughId}/reputations/settlement/${settlementId}/pay-fines`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.authToken ? `Bearer ${this.authToken}` : ''
        }
      }
    );
    return res.ok ? await res.json() : null;
  }

  async getEntityInventory(worldId: string, entityId: string): Promise<any> {
    const res = await fetch(`/api/worlds/${worldId}/entities/${entityId}/inventory`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : { entityId, items: [], gold: 0 };
  }

  async transferItem(worldId: string, transfer: any): Promise<any> {
    const res = await fetch(`/api/worlds/${worldId}/inventory/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getHeaders() },
      body: JSON.stringify(transfer),
    });
    return res.ok ? await res.json() : { success: false };
  }

  async getMerchantInventory(worldId: string, merchantId: string): Promise<any> {
    const res = await fetch(`/api/worlds/${worldId}/merchants/${merchantId}/inventory`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : null;
  }

  async loadWorldItems(worldId: string): Promise<any[]> {
    const res = await fetch(`/api/worlds/${worldId}/items`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : [];
  }

  async loadPrologContent(worldId: string): Promise<string | null> {
    try {
      const res = await fetch(`/api/prolog/tau/export/${worldId}`, { headers: this.getHeaders() });
      if (res.ok) {
        const data = await res.json();
        return data.content || null;
      }
    } catch { /* Prolog not available */ }
    return null;
  }

  async saveGameState(worldId: string, playthroughId: string, slotIndex: number, state: any): Promise<void> {
    await fetch(`/api/worlds/${worldId}/game-state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getHeaders() },
      body: JSON.stringify({ playthroughId, slotIndex, state }),
    });
  }

  async loadGameState(worldId: string, playthroughId: string, slotIndex: number): Promise<any | null> {
    const res = await fetch(
      `/api/worlds/${worldId}/game-state?playthroughId=${playthroughId}&slotIndex=${slotIndex}`,
      { headers: this.getHeaders() }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.state || null;
  }

  async loadGeography(worldId: string): Promise<{ heightmap?: number[][]; terrainSize?: number } | null> {
    try {
      const res = await fetch(`/api/worlds/${worldId}/geography`, { headers: this.getHeaders() });
      if (res.ok) {
        const data = await res.json();
        return data || null;
      }
    } catch { /* Geography not available */ }
    return null;
  }
}

// Reads a JSON data file, using Electron IPC when running from file:// (production build),
// or falling back to fetch() in dev / web mode.
async function readDataFile(relativePath: string): Promise<any> {
  const isElectronProduction =
    typeof window !== 'undefined' &&
    window.location?.protocol === 'file:' &&
    (window as any).electronAPI?.readFile;
  if (isElectronProduction) {
    const text = await (window as any).electronAPI.readFile(relativePath);
    return JSON.parse(text);
  }
  const res = await fetch(`./${relativePath}`);
  return res.json();
}

/**
 * File-based data source for exported games
 */
export class FileDataSource implements DataSource {
  public questOverlay: PlaythroughQuestOverlay | null = null;
  private worldData: any = null;
  private worldIR: any = null;

  constructor() {
    // Load world data on initialization
    this.loadWorldData();
  }

  private async loadWorldData(): Promise<void> {
    try {
      // Load the world IR file
      this.worldIR = await readDataFile('data/world_ir.json');

      // Load other data files
      const [characters, npcs, quests, actions, rules, geography, theme, assetManifest] = await Promise.all([
        readDataFile('data/characters.json').catch(() => []),
        readDataFile('data/npcs.json').catch(() => []),
        readDataFile('data/quests.json').catch(() => []),
        readDataFile('data/actions.json').catch(() => []),
        readDataFile('data/rules.json').catch(() => []),
        readDataFile('data/geography.json').catch(() => ({})),
        readDataFile('data/theme.json').catch(() => ({})),
        readDataFile('data/asset-manifest.json').catch(() => ({})),
      ]);

      this.worldData = {
        world: this.worldIR.meta,
        characters,
        npcs,
        quests,
        actions,
        rules,
        geography,
        theme,
        assetManifest,
      };
    } catch (error) {
      console.error('Failed to load world data:', error);
    }
  }

  private async waitForData(): Promise<void> {
    if (!this.worldData) {
      await this.loadWorldData();
    }
  }

  async loadWorld(worldId: string): Promise<any> {
    await this.waitForData();
    const meta = this.worldIR?.meta || {};
    // Game expects a `name` property; IR stores it as `worldName`
    return { ...meta, name: meta.worldName || meta.name || 'Unknown World' };
  }

  async loadCharacters(worldId: string): Promise<any[]> {
    await this.waitForData();
    return this.worldData?.characters || [];
  }

  async loadActions(worldId: string): Promise<any[]> {
    await this.waitForData();
    return this.worldData?.actions || [];
  }

  async loadBaseActions(): Promise<any[]> {
    await this.waitForData();
    return this.worldIR?.systems?.actions || [];
  }

  async loadQuests(worldId: string): Promise<any[]> {
    await this.waitForData();
    const baseQuests = this.worldData?.quests || [];
    return this.questOverlay ? this.questOverlay.mergeQuests(baseQuests) : baseQuests;
  }

  async loadSettlements(worldId: string): Promise<any[]> {
    await this.waitForData();
    return this.worldData?.geography?.settlements || [];
  }

  async loadRules(worldId: string): Promise<any[]> {
    await this.waitForData();
    return this.worldData?.rules || [];
  }

  async loadBaseRules(): Promise<any[]> {
    await this.waitForData();
    return this.worldIR?.systems?.rules || [];
  }

  async loadCountries(worldId: string): Promise<any[]> {
    await this.waitForData();
    return this.worldData?.geography?.countries || [];
  }

  async loadStates(worldId: string): Promise<any[]> {
    await this.waitForData();
    return this.worldData?.geography?.states || [];
  }

  async loadBaseResources(worldId: string): Promise<any> {
    await this.waitForData();
    return this.worldIR?.systems?.resources || {};
  }

  async loadAssets(worldId: string): Promise<any[]> {
    await this.waitForData();
    const manifest = this.worldData?.assetManifest;
    if (!manifest?.assets) return [];

    const categoryToAssetType: Record<string, string> = {
      character: 'character',
      ground: 'texture_ground',
      quest_object: 'quest_object',
      audio: 'audio',
      building: 'building',
      nature: 'nature',
      prop: 'prop',
    };

    return manifest.assets
      .filter((a: any) => !a.role.endsWith('_bin') && !a.role.startsWith('roof_') && !a.role.includes('_tex_'))
      .map((a: any) => {
        const ext = a.exportPath.split('.').pop()?.toLowerCase() || '';
        let assetType = categoryToAssetType[a.category] || a.category;
        // Building texture files become texture_wall assets
        if (a.category === 'building' && (ext === 'png' || ext === 'jpg' || ext === 'jpeg')) {
          assetType = 'texture_wall';
        }
        const mimeType =
          ext === 'glb' || ext === 'gltf' ? 'model/gltf-binary' :
          ext === 'mp3' ? 'audio/mpeg' :
          ext === 'ogg' ? 'audio/ogg' :
          ext === 'png' ? 'image/png' :
          ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
          'application/octet-stream';
        return {
          id: a.role,
          name: a.role,
          assetType,
          filePath: a.exportPath,
          fileName: a.exportPath.split('/').pop() || a.role,
          fileSize: a.fileSize,
          mimeType,
        };
      });
  }

  async loadConfig3D(worldId: string): Promise<any> {
    await this.waitForData();
    const manifest = this.worldData?.assetManifest;
    if (!manifest) return {};

    // Build building model mapping from manifest (exclude bin and texture files)
    const buildingModels: Record<string, string> = {};
    for (const a of (manifest.categories?.building || [])) {
      const ext = a.exportPath.split('.').pop()?.toLowerCase() || '';
      if (!a.role.endsWith('_bin') && !a.role.includes('_tex_') && ext !== 'png' && ext !== 'jpg' && ext !== 'jpeg') {
        buildingModels[a.role] = a.role;
      }
    }
    // Common type fallbacks to available models
    const buildingFallbacks: Record<string, string> = {
      tavern: 'house', shop: 'house', market: 'house', farm: 'house',
      mill: 'blacksmith', watchtower: 'barracks', wall: 'house',
      gate: 'church', tower: 'barracks', keep: 'castle', palace: 'castle',
    };
    for (const [type, fallback] of Object.entries(buildingFallbacks)) {
      if (!buildingModels[type] && buildingModels[fallback]) {
        buildingModels[type] = fallback;
      }
    }

    // Quest object model mapping
    const questObjectModels: Record<string, string> = {};
    for (const a of (manifest.categories?.quest_object || [])) {
      if (!a.role.endsWith('_bin') && !a.role.includes('_tex_')) {
        questObjectModels[a.role] = a.role;
      }
    }
    const questFallbacks: Record<string, string> = {
      key: 'chest', scroll: 'chest', artifact: 'collectible_gem',
    };
    for (const [type, fallback] of Object.entries(questFallbacks)) {
      if (!questObjectModels[type] && questObjectModels[fallback]) {
        questObjectModels[type] = fallback;
      }
    }

    // Nature model mapping (trees, rocks, shrubs)
    const natureModels: Record<string, string> = {};
    for (const a of (manifest.categories?.nature || [])) {
      if (!a.role.endsWith('_bin') && !a.role.includes('_tex_')) {
        natureModels[a.role] = a.role;
      }
    }

    // Prop/object model mapping
    const objectModels: Record<string, string> = {};
    for (const a of (manifest.categories?.prop || [])) {
      if (!a.role.endsWith('_bin') && !a.role.includes('_tex_')) {
        objectModels[a.role] = a.role;
      }
    }

    // Character and player model mapping.
    // Core exports bundle 'player_default' (Vincent.babylon) and 'npc_default' (starterAvatars.babylon).
    // BabylonGame looks up playerModels['default'] and characterModels['guard'/'merchant'/'civilian'].
    // Collection-specific overrides (npc_guard, npc_merchant, etc.) take priority if present.
    const characterModels: Record<string, string> = {};
    const playerModels: Record<string, string> = {};
    for (const a of (manifest.categories?.character || [])) {
      if (!a.role.endsWith('_bin') && !a.role.includes('_tex_') && a.role !== 'player_texture') {
        if (a.role.startsWith('player')) {
          playerModels[a.role] = a.role;
          if (a.role === 'player_default') playerModels['default'] = 'player_default';
        } else {
          characterModels[a.role] = a.role;
          if (a.role === 'npc_default') {
            // Generic NPC model — use as fallback for all NPC roles
            if (!characterModels['npcDefault']) characterModels['npcDefault'] = 'npc_default';
            if (!characterModels['guard']) characterModels['guard'] = 'npc_default';
            if (!characterModels['merchant']) characterModels['merchant'] = 'npc_default';
            if (!characterModels['civilian']) characterModels['civilian'] = 'npc_default';
            if (!characterModels['questgiver']) characterModels['questgiver'] = 'npc_default';
          }
          // Collection-specific role overrides take priority (set after npc_default fallbacks)
          if (a.role === 'npc_guard') characterModels['guard'] = 'npc_guard';
          if (a.role === 'npc_merchant') characterModels['merchant'] = 'npc_merchant';
          if (a.role === 'npc_civilian_male' || a.role === 'npc_civilian_female') {
            if (!characterModels['civilian']) characterModels['civilian'] = a.role;
          }
        }
      }
    }

    // Texture IDs from ground category and building_texture role
    const groundAsset = manifest.categories?.ground?.find((a: any) => a.role === 'ground_diffuse') || manifest.categories?.ground?.[0];
    const buildingTexture = (manifest.categories?.building || []).find(
      (a: any) => { const ext = a.exportPath.split('.').pop()?.toLowerCase(); return ext === 'png' || ext === 'jpg' || ext === 'jpeg'; }
    );

    return {
      buildingModels: Object.keys(buildingModels).length > 0 ? buildingModels : undefined,
      natureModels: Object.keys(natureModels).length > 0 ? natureModels : undefined,
      objectModels: Object.keys(objectModels).length > 0 ? objectModels : undefined,
      questObjectModels: Object.keys(questObjectModels).length > 0 ? questObjectModels : undefined,
      characterModels: Object.keys(characterModels).length > 0 ? characterModels : undefined,
      playerModels: Object.keys(playerModels).length > 0 ? playerModels : undefined,
      groundTextureId: groundAsset?.role,
      roadTextureId: groundAsset?.role,
      wallTextureId: buildingTexture?.role,
      roofTextureId: buildingTexture?.role,
    };
  }

  async loadTruths(worldId: string): Promise<any[]> {
    await this.waitForData();
    return this.worldIR?.truths || [];
  }

  async loadCharacter(characterId: string): Promise<any> {
    await this.waitForData();
    return this.worldData?.characters?.find((c: any) => c.id === characterId) || null;
  }

  async startPlaythrough(worldId: string, authToken: string, playthroughName: string): Promise<any> {
    // In exported games, playthrough is handled locally
    return { id: 'exported-playthrough', name: playthroughName };
  }

  async updateQuest(questId: string, data: any): Promise<void> {
    if (this.questOverlay) {
      this.questOverlay.updateQuest(questId, data);
      return;
    }
    console.log('Quest updated (no overlay):', questId, data);
  }

  async loadSettlementBusinesses(settlementId: string): Promise<any[]> {
    await this.waitForData();
    const settlement = this.worldData?.geography?.settlements?.find((s: any) => s.id === settlementId);
    return settlement?.businesses || [];
  }

  async loadSettlementLots(settlementId: string): Promise<any[]> {
    await this.waitForData();
    const settlement = this.worldData?.geography?.settlements?.find((s: any) => s.id === settlementId);
    return settlement?.lots || [];
  }

  async loadSettlementResidences(settlementId: string): Promise<any[]> {
    await this.waitForData();
    const settlement = this.worldData?.geography?.settlements?.find((s: any) => s.id === settlementId);
    return settlement?.residences || [];
  }

  async payFines(playthroughId: string, settlementId: string): Promise<any> {
    // In exported games, fines are handled locally
    return { success: true };
  }

  async getEntityInventory(worldId: string, entityId: string): Promise<any> {
    // In exported games, inventory is managed locally
    return { entityId, items: [], gold: 0 };
  }

  async transferItem(worldId: string, transfer: any): Promise<any> {
    // In exported games, transfers are handled locally
    console.log('Item transferred:', transfer);
    return { success: true, ...transfer, timestamp: Date.now() };
  }

  async getMerchantInventory(worldId: string, merchantId: string): Promise<any> {
    // In exported games, merchant inventory is generated locally
    return null;
  }

  async loadPrologContent(worldId: string): Promise<string | null> {
    try {
      const content = await readDataFile('data/knowledge-base.pl');
      return typeof content === 'string' ? content : null;
    } catch {
      return null;
    }
  }

  async loadWorldItems(worldId: string): Promise<any[]> {
    try {
      return await readDataFile('data/items.json');
    } catch {
      return [];
    }
  }

  async saveGameState(_worldId: string, _playthroughId: string, slotIndex: number, state: any): Promise<void> {
    try {
      localStorage.setItem(`insimul_save_${slotIndex}`, JSON.stringify(state));
    } catch (err) {
      console.error('Failed to save game state to localStorage:', err);
    }
  }

  async loadGameState(_worldId: string, _playthroughId: string, slotIndex: number): Promise<any | null> {
    try {
      const raw = localStorage.getItem(`insimul_save_${slotIndex}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  async loadGeography(worldId: string): Promise<{ heightmap?: number[][]; terrainSize?: number } | null> {
    await this.waitForData();
    const geo = this.worldData?.geography;
    if (!geo) return null;
    return { heightmap: geo.heightmap, terrainSize: geo.terrainSize };
  }
}

/**
 * Factory to create the appropriate data source
 */
export function createDataSource(authToken?: string): DataSource {
  // Check if we're in an exported environment (no API available)
  if (typeof window !== 'undefined' && window.location?.protocol === 'file:') {
    return new FileDataSource();
  }
  
  // Check if we have an auth token (Insimul environment)
  if (authToken) {
    return new ApiDataSource(authToken);
  }
  
  // Default to file-based for safety
  return new FileDataSource();
}
