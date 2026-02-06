/**
 * Quest Indicator Manager
 * 
 * Displays visual indicators above NPCs to show quest status:
 * - ! (yellow) - NPC has available quest
 * - ? (yellow) - Quest in progress (assigned by this NPC)
 * - ✓ (green) - Quest ready to turn in
 */

import { Scene, Mesh, MeshBuilder, StandardMaterial, Color3, Vector3, Animation, DynamicTexture } from '@babylonjs/core';

export type QuestIndicatorType = 'available' | 'in_progress' | 'turn_in' | null;

interface QuestIndicator {
  mesh: Mesh;
  type: QuestIndicatorType;
  npcId: string;
}

interface Quest {
  id: string;
  assignedByCharacterId?: string;
  status: string;
  objectives?: any[];
  completionCriteria?: any;
  progress?: any;
}

interface Character {
  id: string;
  canGiveQuests?: boolean;
  occupation?: string;
  [key: string]: any;
}

export class QuestIndicatorManager {
  private scene: Scene;
  private indicators: Map<string, QuestIndicator> = new Map();
  private indicatorHeight: number = 3.5; // Height above NPC
  
  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Update all NPC indicators based on current quest state
   */
  public updateIndicators(
    npcs: Map<string, { mesh: Mesh; character: Character }>,
    quests: Quest[]
  ): void {
    npcs.forEach((npcData, npcId) => {
      const indicatorType = this.getIndicatorType(npcData.character, quests);
      this.setIndicator(npcId, npcData.mesh, indicatorType);
    });
  }

  /**
   * Determine what indicator type an NPC should have
   */
  private getIndicatorType(npc: Character, quests: Quest[]): QuestIndicatorType {
    // Check for quests ready to turn in (highest priority)
    const turnInQuest = quests.find(q => 
      q.assignedByCharacterId === npc.id && 
      q.status === 'active' && 
      this.isQuestReadyToTurnIn(q)
    );
    if (turnInQuest) return 'turn_in';

    // Check for active quests from this NPC
    const activeQuest = quests.find(q => 
      q.assignedByCharacterId === npc.id && 
      q.status === 'active' &&
      !this.isQuestReadyToTurnIn(q)
    );
    if (activeQuest) return 'in_progress';

    // Check if NPC can give quests (based on occupation or flag)
    if (this.canNPCGiveQuests(npc)) return 'available';

    return null;
  }

  /**
   * Check if a quest is ready to be turned in
   */
  private isQuestReadyToTurnIn(quest: Quest): boolean {
    // Check objective-based completion
    if (quest.objectives && Array.isArray(quest.objectives)) {
      return quest.objectives.every((obj: any) => obj.isCompleted || obj.completed);
    }
    
    // Check progress-based completion
    if (quest.completionCriteria && quest.progress) {
      const criteria = quest.completionCriteria;
      const progress = quest.progress;
      
      switch (criteria.type) {
        case 'vocabulary_usage':
          return (progress.currentCount || 0) >= (criteria.requiredCount || 10);
        case 'conversation_turns':
          return (progress.turnsCompleted || 0) >= (criteria.requiredTurns || 5);
        case 'grammar_pattern':
          return (progress.currentCount || 0) >= (criteria.requiredCount || 5);
        case 'conversation_engagement':
          return (progress.messagesCount || 0) >= (criteria.requiredMessages || 8);
      }
    }
    
    return false;
  }

  /**
   * Determine if an NPC can give quests based on their properties
   */
  private canNPCGiveQuests(npc: Character): boolean {
    // Explicit flag
    if (npc.canGiveQuests === true) return true;
    if (npc.canGiveQuests === false) return false;

    // Default: certain occupations can give quests
    const questGiverOccupations = [
      'teacher', 'professor', 'merchant', 'shopkeeper', 'guard',
      'mayor', 'innkeeper', 'blacksmith', 'librarian', 'elder',
      'captain', 'guide', 'trainer', 'master', 'chief'
    ];

    if (npc.occupation) {
      const occupation = npc.occupation.toLowerCase();
      return questGiverOccupations.some(occ => occupation.includes(occ));
    }

    return false;
  }

  /**
   * Set or update an indicator for an NPC
   */
  private setIndicator(npcId: string, npcMesh: Mesh, type: QuestIndicatorType): void {
    const existing = this.indicators.get(npcId);

    // Remove existing if type changed or should be removed
    if (existing && (existing.type !== type || type === null)) {
      this.removeIndicator(npcId);
    }

    // Create new indicator if needed
    if (type && (!existing || existing.type !== type)) {
      this.createIndicator(npcId, npcMesh, type);
    }
  }

  /**
   * Create a quest indicator above an NPC
   */
  private createIndicator(npcId: string, npcMesh: Mesh, type: QuestIndicatorType): void {
    const indicatorConfig = this.getIndicatorConfig(type);
    if (!indicatorConfig) return;

    // Create a plane for the indicator
    const indicator = MeshBuilder.CreatePlane(
      `quest_indicator_${npcId}`,
      { width: 0.8, height: 0.8 },
      this.scene
    );

    // Position above NPC
    indicator.parent = npcMesh;
    indicator.position = new Vector3(0, this.indicatorHeight, 0);
    indicator.billboardMode = Mesh.BILLBOARDMODE_ALL;

    // Create dynamic texture for the symbol
    const textureResolution = 128;
    const dynamicTexture = new DynamicTexture(
      `quest_indicator_tex_${npcId}`,
      textureResolution,
      this.scene,
      false
    );

    // Draw the indicator symbol
    const ctx = dynamicTexture.getContext() as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, textureResolution, textureResolution);
    
    // Draw background circle
    ctx.beginPath();
    ctx.arc(64, 64, 50, 0, Math.PI * 2);
    ctx.fillStyle = indicatorConfig.bgColor;
    ctx.fill();
    ctx.strokeStyle = indicatorConfig.borderColor;
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw symbol
    ctx.fillStyle = indicatorConfig.textColor;
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(indicatorConfig.symbol, 64, 68);

    dynamicTexture.update();

    // Create material
    const material = new StandardMaterial(`quest_indicator_mat_${npcId}`, this.scene);
    material.diffuseTexture = dynamicTexture;
    material.emissiveTexture = dynamicTexture;
    material.useAlphaFromDiffuseTexture = true;
    material.disableLighting = true;
    indicator.material = material;

    // Add floating animation
    const floatAnim = new Animation(
      `quest_indicator_float_${npcId}`,
      'position.y',
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    floatAnim.setKeys([
      { frame: 0, value: this.indicatorHeight },
      { frame: 30, value: this.indicatorHeight + 0.2 },
      { frame: 60, value: this.indicatorHeight }
    ]);

    indicator.animations.push(floatAnim);
    this.scene.beginAnimation(indicator, 0, 60, true);

    // Store indicator
    this.indicators.set(npcId, {
      mesh: indicator,
      type,
      npcId
    });
  }

  /**
   * Get configuration for indicator type
   */
  private getIndicatorConfig(type: QuestIndicatorType): {
    symbol: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
  } | null {
    switch (type) {
      case 'available':
        return {
          symbol: '!',
          bgColor: 'rgba(255, 215, 0, 0.9)', // Gold
          borderColor: '#b8860b',
          textColor: '#000000'
        };
      case 'in_progress':
        return {
          symbol: '?',
          bgColor: 'rgba(192, 192, 192, 0.9)', // Silver/gray
          borderColor: '#808080',
          textColor: '#000000'
        };
      case 'turn_in':
        return {
          symbol: '✓',
          bgColor: 'rgba(50, 205, 50, 0.9)', // Lime green
          borderColor: '#228b22',
          textColor: '#ffffff'
        };
      default:
        return null;
    }
  }

  /**
   * Remove an indicator
   */
  public removeIndicator(npcId: string): void {
    const indicator = this.indicators.get(npcId);
    if (indicator) {
      this.scene.stopAnimation(indicator.mesh);
      indicator.mesh.dispose();
      this.indicators.delete(npcId);
    }
  }

  /**
   * Force refresh indicator for a specific NPC
   */
  public refreshIndicator(npcId: string, npcMesh: Mesh, character: Character, quests: Quest[]): void {
    const indicatorType = this.getIndicatorType(character, quests);
    this.setIndicator(npcId, npcMesh, indicatorType);
  }

  /**
   * Clear all indicators
   */
  public clearAll(): void {
    this.indicators.forEach((indicator, npcId) => {
      this.removeIndicator(npcId);
    });
  }

  /**
   * Get current indicator type for an NPC
   */
  public getIndicatorTypeForNPC(npcId: string): QuestIndicatorType {
    return this.indicators.get(npcId)?.type || null;
  }

  /**
   * Dispose manager
   */
  public dispose(): void {
    this.clearAll();
  }
}
