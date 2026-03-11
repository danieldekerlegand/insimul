/**
 * Content Gating Manager
 *
 * Controls which content (settlements, NPC types, quest types) is
 * unlocked based on the player's fluency and XP level.
 */

export interface ContentGate {
  id: string;
  name: string;
  description: string;
  requirement: GateRequirement;
  contentType: 'settlement' | 'npc_type' | 'quest_type' | 'cosmetic';
  unlocked: boolean;
}

export interface GateRequirement {
  type: 'fluency' | 'level' | 'words_mastered' | 'quests_completed';
  threshold: number;
}

const CONTENT_GATES: ContentGate[] = [
  // Settlements
  {
    id: 'unlock_town',
    name: 'Neighboring Town',
    description: 'Unlock access to the neighboring town',
    requirement: { type: 'fluency', threshold: 20 },
    contentType: 'settlement',
    unlocked: false,
  },
  {
    id: 'unlock_city',
    name: 'The Capital',
    description: 'Unlock the capital city with more NPCs and quests',
    requirement: { type: 'fluency', threshold: 50 },
    contentType: 'settlement',
    unlocked: false,
  },

  // NPC Types
  {
    id: 'unlock_scholars',
    name: 'Scholars & Teachers',
    description: 'Unlock scholarly NPCs with advanced vocabulary',
    requirement: { type: 'fluency', threshold: 30 },
    contentType: 'npc_type',
    unlocked: false,
  },
  {
    id: 'unlock_nobles',
    name: 'Nobles & Officials',
    description: 'Unlock noble NPCs with formal speech patterns',
    requirement: { type: 'fluency', threshold: 50 },
    contentType: 'npc_type',
    unlocked: false,
  },
  {
    id: 'unlock_travelers',
    name: 'Foreign Travelers',
    description: 'Unlock traveler NPCs who speak with different accents and dialects',
    requirement: { type: 'fluency', threshold: 70 },
    contentType: 'npc_type',
    unlocked: false,
  },

  // Quest Types
  {
    id: 'unlock_translation_quests',
    name: 'Translation Challenges',
    description: 'Unlock translation challenge quests',
    requirement: { type: 'fluency', threshold: 30 },
    contentType: 'quest_type',
    unlocked: false,
  },
  {
    id: 'unlock_cultural_quests',
    name: 'Cultural Quests',
    description: 'Unlock cultural exploration quests',
    requirement: { type: 'fluency', threshold: 30 },
    contentType: 'quest_type',
    unlocked: false,
  },
  {
    id: 'unlock_navigation_quests',
    name: 'Navigation Quests',
    description: 'Unlock target-language navigation quests',
    requirement: { type: 'fluency', threshold: 40 },
    contentType: 'quest_type',
    unlocked: false,
  },
  {
    id: 'unlock_time_quests',
    name: 'Time-Based Quests',
    description: 'Unlock quests with time vocabulary challenges',
    requirement: { type: 'fluency', threshold: 50 },
    contentType: 'quest_type',
    unlocked: false,
  },

  // Cosmetics
  {
    id: 'unlock_cultural_outfit',
    name: 'Cultural Outfit',
    description: 'Earn a traditional outfit for your character',
    requirement: { type: 'level', threshold: 5 },
    contentType: 'cosmetic',
    unlocked: false,
  },
  {
    id: 'unlock_scholar_robe',
    name: 'Scholar\'s Robe',
    description: 'Earn the scholar\'s robe for reaching intermediate level',
    requirement: { type: 'level', threshold: 11 },
    contentType: 'cosmetic',
    unlocked: false,
  },
  {
    id: 'unlock_royal_attire',
    name: 'Royal Attire',
    description: 'Earn royal attire for reaching advanced fluency',
    requirement: { type: 'level', threshold: 16 },
    contentType: 'cosmetic',
    unlocked: false,
  },
];

export class ContentGatingManager {
  private gates: ContentGate[];
  private onContentUnlocked: ((gate: ContentGate) => void) | null = null;

  constructor() {
    this.gates = CONTENT_GATES.map(g => ({ ...g }));
  }

  /**
   * Update gates based on current player stats.
   * Returns newly unlocked gates.
   */
  public updatePlayerProgress(stats: {
    fluency: number;
    level: number;
    wordsMastered: number;
    questsCompleted: number;
  }): ContentGate[] {
    const newlyUnlocked: ContentGate[] = [];

    for (const gate of this.gates) {
      if (gate.unlocked) continue;

      const { type, threshold } = gate.requirement;
      let current = 0;

      switch (type) {
        case 'fluency': current = stats.fluency; break;
        case 'level': current = stats.level; break;
        case 'words_mastered': current = stats.wordsMastered; break;
        case 'quests_completed': current = stats.questsCompleted; break;
      }

      if (current >= threshold) {
        gate.unlocked = true;
        newlyUnlocked.push(gate);
        this.onContentUnlocked?.(gate);
      }
    }

    return newlyUnlocked;
  }

  public getUnlockedGates(): ContentGate[] {
    return this.gates.filter(g => g.unlocked);
  }

  public getLockedGates(): ContentGate[] {
    return this.gates.filter(g => !g.unlocked);
  }

  public getGatesByType(contentType: string): ContentGate[] {
    return this.gates.filter(g => g.contentType === contentType);
  }

  public isUnlocked(gateId: string): boolean {
    return this.gates.find(g => g.id === gateId)?.unlocked || false;
  }

  public isQuestTypeUnlocked(questCategory: string): boolean {
    // Map quest categories to gates
    const gateMap: Record<string, string> = {
      translation_challenge: 'unlock_translation_quests',
      cultural: 'unlock_cultural_quests',
      navigation: 'unlock_navigation_quests',
      time_activity: 'unlock_time_quests',
    };

    const gateId = gateMap[questCategory];
    if (!gateId) return true; // No gate = always available
    return this.isUnlocked(gateId);
  }

  public setOnContentUnlocked(cb: (gate: ContentGate) => void): void {
    this.onContentUnlocked = cb;
  }

  public exportState(): string {
    return JSON.stringify(this.gates.filter(g => g.unlocked).map(g => g.id));
  }

  public importState(json: string): void {
    try {
      const unlockedIds: string[] = JSON.parse(json);
      for (const gate of this.gates) {
        gate.unlocked = unlockedIds.includes(gate.id);
      }
    } catch (e) {
      console.error('[ContentGatingManager] Failed to import state:', e);
    }
  }

  public dispose(): void {
    this.onContentUnlocked = null;
  }
}
