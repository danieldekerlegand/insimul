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
  /** The NPC mesh to track (indicator is NOT parented to avoid scale issues) */
  trackedMesh: Mesh;
  /** Height offset above the NPC mesh */
  heightOffset: number;
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

export type QuestCompletionChecker = (questId: string) => boolean;

export class QuestIndicatorManager {
  private scene: Scene;
  private indicators: Map<string, QuestIndicator> = new Map();
  private indicatorHeight: number = 3.5; // Height above NPC
  private questCompletionChecker: QuestCompletionChecker | null = null;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Set a delegate that checks quest completion via QuestCompletionEngine.
   * When set, isQuestReadyToTurnIn delegates to this instead of reimplementing.
   */
  setQuestCompletionChecker(checker: QuestCompletionChecker): void {
    this.questCompletionChecker = checker;
  }

  /**
   * Update all NPC indicators based on current quest state
   */
  public updateIndicators(
    npcs: Map<string, { mesh: Mesh; character: Character }>,
    quests: Quest[]
  ): void {
    let created = 0;
    let sample: { id: string; occupation: string | undefined; type: QuestIndicatorType } | null = null;
    npcs.forEach((npcData, npcId) => {
      const indicatorType = this.getIndicatorType(npcData.character, quests);
      if (indicatorType) created++;
      if (!sample) sample = { id: npcId, occupation: npcData.character?.occupation, type: indicatorType };
      this.setIndicator(npcId, npcData.mesh, indicatorType);
    });
    console.log(`[QuestIndicatorManager] Updated ${npcs.size} NPCs, ${created} indicators created, ${quests.length} quests, sample NPC:`, sample);
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

    // Check if NPC has visible available quests assigned to them
    // (guild-gated: only show "!" if a quest they give is in the visible set)
    // Status 'available' is used for guild-gated quests that are unlocked but not yet accepted
    const hasVisibleQuest = quests.some(q =>
      q.assignedByCharacterId === npc.id
      && (q.status as string) === 'available'
    );
    if (hasVisibleQuest) return 'available';

    // Fallback: check if NPC can give quests (occupation-based, for NPCs without pre-assigned quests)
    if (this.canNPCGiveQuests(npc)) {
      const hasUnassignedQuests = quests.some(q =>
        !q.assignedByCharacterId
        && (q.status as string) === 'available'
      );
      if (hasUnassignedQuests) return 'available';
    }

    return null;
  }

  /**
   * Check if a quest is ready to be turned in
   */
  private isQuestReadyToTurnIn(quest: Quest): boolean {
    // Delegate to QuestCompletionEngine when available (single source of truth)
    if (this.questCompletionChecker) {
      return this.questCompletionChecker(quest.id);
    }

    // Fallback: check objective-based completion from quest data
    if (quest.objectives && Array.isArray(quest.objectives)) {
      return quest.objectives.every((obj: any) => !!obj.completed);
    }

    // Fallback: check progress-based completion
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
        case 'follow_directions':
          return (progress.stepsCompleted || 0) >= (criteria.stepsRequired || criteria.requiredCount || 1);
      }
    }

    return false;
  }

  /**
   * Determine if an NPC can give quests based on their properties
   */
  private canNPCGiveQuests(npc: Character): boolean {
    // Main quest NPCs always show as quest givers
    if (npc.generationConfig?.mainQuestNPC) return true;

    // Explicit flag
    if (npc.canGiveQuests === true) return true;
    if (npc.canGiveQuests === false) return false;

    // Default: certain occupations can give quests
    const questGiverOccupations = [
      'teacher', 'professor', 'merchant', 'shopkeeper', 'guard',
      'mayor', 'innkeeper', 'blacksmith', 'librarian', 'elder',
      'captain', 'guide', 'trainer', 'master', 'chief',
      // Additional occupations common in procedurally generated worlds
      'baker', 'farmer', 'fisher', 'artisan', 'healer', 'priest',
      'herbalist', 'tailor', 'weaver', 'potter', 'hunter', 'ranger',
      'sailor', 'dock', 'harbor', 'stable', 'brewer', 'cook',
      'barkeep', 'bartender', 'clerk', 'postmaster', 'constable',
      'sheriff', 'warden', 'monk', 'nun', 'scribe', 'scholar',
      'apothecary', 'midwife', 'nurse', 'doctor', 'veterinarian',
      'musician', 'bard', 'storyteller', 'vendor', 'owner', 'keeper',
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
   * Create a quest indicator above an NPC.
   * Indicators are positioned in world space (NOT parented to the NPC mesh)
   * to avoid rendering issues from models with negative scale values.
   */
  private createIndicator(npcId: string, npcMesh: Mesh, type: QuestIndicatorType): void {
    const indicatorConfig = this.getIndicatorConfig(type);
    if (!indicatorConfig) return;

    // Compute height offset from mesh bounds
    let heightOffset = this.indicatorHeight;
    try {
      npcMesh.computeWorldMatrix(true);
      const bi = npcMesh.getHierarchyBoundingVectors(true);
      const modelHeight = bi.max.y - bi.min.y;
      if (modelHeight > 0.1) {
        heightOffset = modelHeight + 0.5;
      }
    } catch {
      // Fall back to default
    }

    // Create a plane for the indicator (world-space, not parented)
    const indicator = MeshBuilder.CreatePlane(
      `quest_indicator_${npcId}`,
      { width: 0.8, height: 0.8 },
      this.scene
    );

    // Position in world space above the NPC
    indicator.position = new Vector3(
      npcMesh.position.x,
      npcMesh.position.y + heightOffset,
      npcMesh.position.z,
    );
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
    material.backFaceCulling = false;
    indicator.material = material;

    // Add pulse (scale) animation for 'available' and 'turn_in' to draw attention
    if (type === 'available' || type === 'turn_in') {
      const pulseAnim = new Animation(
        `quest_indicator_pulse_${npcId}`,
        'scaling',
        30,
        Animation.ANIMATIONTYPE_VECTOR3,
        Animation.ANIMATIONLOOPMODE_CYCLE
      );

      const baseScale = new Vector3(1, 1, 1);
      const peakScale = new Vector3(1.25, 1.25, 1.25);

      pulseAnim.setKeys([
        { frame: 0, value: baseScale },
        { frame: 20, value: peakScale },
        { frame: 40, value: baseScale },
        { frame: 60, value: baseScale },
      ]);

      indicator.animations.push(pulseAnim);
      this.scene.beginAnimation(indicator, 0, 60, true);
    }

    // Store indicator with tracking info
    this.indicators.set(npcId, {
      mesh: indicator,
      type,
      npcId,
      trackedMesh: npcMesh,
      heightOffset,
    });
  }

  /**
   * Update indicator positions to follow their tracked NPC meshes.
   * Call this each frame from the render loop.
   */
  public updatePositions(): void {
    this.indicators.forEach((indicator) => {
      if (indicator.trackedMesh && !indicator.trackedMesh.isDisposed()) {
        indicator.mesh.position.x = indicator.trackedMesh.position.x;
        indicator.mesh.position.y = indicator.trackedMesh.position.y + indicator.heightOffset;
        indicator.mesh.position.z = indicator.trackedMesh.position.z;
      }
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
          symbol: '?',
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
