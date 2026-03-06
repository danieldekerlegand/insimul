/**
 * Data Layer Abstraction for BabylonGame
 * 
 * This interface allows BabylonGame to work with both API-based data (in Insimul)
 * and file-based data (in exported games).
 */

export interface DataSource {
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
}

/**
 * API-based data source for Insimul
 */
export class ApiDataSource implements DataSource {
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
    const res = await fetch('/api/actions/base', { headers: this.getHeaders() });
    return res.ok ? await res.json() : [];
  }

  async loadQuests(worldId: string): Promise<any[]> {
    const res = await fetch(`/api/worlds/${worldId}/quests`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : [];
  }

  async loadSettlements(worldId: string): Promise<any[]> {
    const res = await fetch(`/api/worlds/${worldId}/settlements`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : [];
  }

  async loadRules(worldId: string): Promise<any[]> {
    const res = await fetch(`/api/worlds/${worldId}/rules`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : [];
  }

  async loadBaseRules(): Promise<any[]> {
    const res = await fetch('/api/rules/base', { headers: this.getHeaders() });
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
    const res = await fetch(`/api/worlds/${worldId}/base-resources`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : {};
  }

  async loadAssets(worldId: string): Promise<any[]> {
    const res = await fetch(`/api/worlds/${worldId}/assets`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : [];
  }

  async loadConfig3D(worldId: string): Promise<any> {
    const res = await fetch(`/api/worlds/${worldId}/config3d`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : {};
  }

  async loadTruths(worldId: string): Promise<any[]> {
    const res = await fetch(`/api/worlds/${worldId}/truths`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : [];
  }

  async loadCharacter(characterId: string): Promise<any> {
    const res = await fetch(`/api/characters/${characterId}`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : null;
  }

  async startPlaythrough(worldId: string, authToken: string, playthroughName: string): Promise<any> {
    const res = await fetch(`/api/worlds/${worldId}/playthrough`, {
      method: 'POST',
      headers: { ...this.getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: playthroughName })
    });
    return res.ok ? await res.json() : null;
  }

  async updateQuest(questId: string, data: any): Promise<void> {
    await fetch(`/api/quests/${questId}`, {
      method: 'PATCH',
      headers: { ...this.getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  async loadSettlementBusinesses(settlementId: string): Promise<any[]> {
    const res = await fetch(`/api/settlements/${settlementId}/businesses`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : [];
  }

  async loadSettlementLots(settlementId: string): Promise<any[]> {
    const res = await fetch(`/api/settlements/${settlementId}/lots`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : [];
  }

  async loadSettlementResidences(settlementId: string): Promise<any[]> {
    const res = await fetch(`/api/settlements/${settlementId}/residences`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : [];
  }

  async payFines(playthroughId: string, settlementId: string): Promise<any> {
    const res = await fetch(`/api/playthroughs/${playthroughId}/pay-fines`, {
      method: 'POST',
      headers: { ...this.getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ settlementId })
    });
    return res.ok ? await res.json() : { success: false };
  }
}

/**
 * File-based data source for exported games
 */
export class FileDataSource implements DataSource {
  private worldData: any = null;
  private worldIR: any = null;

  constructor() {
    // Load world data from files
    this.loadWorldData();
  }

  private async loadWorldData(): Promise<void> {
    try {
      // Load the world IR
      const irResponse = await fetch('/data/world_ir.json');
      this.worldIR = await irResponse.json();
      
      // Load the full world data - combine character and other data
      const [characterResponse, geographyResponse, actionsResponse, questsResponse, npcsResponse, rulesResponse, truthsResponse] = await Promise.all([
        fetch('/data/characters.json'),
        fetch('/src/data/geography.json'),
        fetch('/src/data/actions.json'),
        fetch('/src/data/quests.json'),
        fetch('/src/data/npcs.json'),
        fetch('/src/data/rules.json'),
        fetch('/data/truths.json')
      ]);
      
      const [characters, geography, actions, quests, npcs, rules, truths] = await Promise.all([
        characterResponse.json(),
        geographyResponse.json(),
        actionsResponse.json(),
        questsResponse.json(),
        npcsResponse.json(),
        rulesResponse.json(),
        truthsResponse.json()
      ]);
      
      // Combine into worldData structure
      this.worldData = {
        characters,
        geography,
        actions,
        quests,
        npcs,
        rules,
        truths
      };
      
      console.log('[FileDataSource] Loaded world data from files');
    } catch (error) {
      console.error('[FileDataSource] Failed to load world data:', error);
    }
  }

  private async waitForData(): Promise<void> {
    if (!this.worldData || !this.worldIR) {
      await new Promise(resolve => setTimeout(resolve, 100));
      return this.waitForData();
    }
  }

  async loadWorld(worldId: string): Promise<any> {
    await this.waitForData();
    return this.worldData;
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
    return this.worldIR?.actions || [];
  }

  async loadQuests(worldId: string): Promise<any[]> {
    await this.waitForData();
    return this.worldData?.quests || [];
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
    return this.worldIR?.rules || [];
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
    return this.worldData?.baseResources || {};
  }

  async loadAssets(worldId: string): Promise<any[]> {
    await this.waitForData();
    // Load assets from the asset manifest
    try {
      const response = await fetch('/data/asset-manifest.json');
      const manifest = await response.json();
      
      // Convert manifest assets to the expected format
      const assets: any[] = [];
      
      // Add character assets
      if (manifest.categories?.character) {
        for (const asset of manifest.categories.character) {
          assets.push({
            id: asset.role,
            type: 'character',
            role: asset.role,
            filePath: `/${asset.exportPath}`, // Add leading slash for absolute path
            worldId: worldId
          });
        }
      }
      
      // Add building assets
      if (manifest.categories?.building) {
        for (const asset of manifest.categories.building) {
          assets.push({
            id: asset.role,
            type: 'building',
            role: asset.role,
            filePath: `/${asset.exportPath}`,
            worldId: worldId
          });
        }
      }
      
      // Add quest object assets
      if (manifest.categories?.quest_object) {
        for (const asset of manifest.categories.quest_object) {
          assets.push({
            id: asset.role,
            type: 'quest_object',
            role: asset.role,
            filePath: `/${asset.exportPath}`,
            worldId: worldId
          });
        }
      }
      
      // Add ground assets
      if (manifest.categories?.ground) {
        for (const asset of manifest.categories.ground) {
          assets.push({
            id: asset.role,
            type: 'ground',
            role: asset.role,
            filePath: `/${asset.exportPath}`,
            worldId: worldId
          });
        }
      }
      
      // Add legacy NPC asset mapping for compatibility
      const npcGuard = assets.find(a => a.role === 'npc_guard');
      if (npcGuard) {
        assets.push({
          id: 'starterAvatars',
          type: 'character',
          role: 'npc',
          filePath: npcGuard.filePath,
          worldId: worldId
        });
      }
      
      // Add legacy player model mapping for compatibility
      const playerDefault = assets.find(a => a.role === 'player_default');
      if (playerDefault) {
        assets.push({
          id: 'Vincent-frontFacing',
          type: 'character',
          role: 'player',
          filePath: playerDefault.filePath,
          worldId: worldId
        });
      }
      
      return assets;
    } catch (error) {
      console.error('[FileDataSource] Failed to load asset manifest:', error);
      return [];
    }
  }

  async loadConfig3D(worldId: string): Promise<any> {
    await this.waitForData();
    return this.worldData?.config3D || {};
  }

  async loadTruths(worldId: string): Promise<any[]> {
    await this.waitForData();
    return this.worldData?.truths || [];
  }

  async loadCharacter(characterId: string): Promise<any> {
    await this.waitForData();
    return this.worldData?.characters?.find((c: any) => c.id === characterId);
  }

  async startPlaythrough(worldId: string, authToken: string, playthroughName: string): Promise<any> {
    // In exported games, playthrough is handled locally
    return { id: 'exported-playthrough', name: playthroughName };
  }

  async updateQuest(questId: string, data: any): Promise<void> {
    // In exported games, quest updates are handled locally
    console.log('Quest updated:', questId, data);
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
}

/**
 * Factory to create the appropriate data source
 */
export function createDataSource(authToken?: string): DataSource {
  // Check if we're in an exported environment (no API available)
  if (typeof window !== 'undefined' && window.location?.protocol === 'file:') {
    return new FileDataSource();
  }
  
  // Default to file-based for exports
  return new FileDataSource();
}
