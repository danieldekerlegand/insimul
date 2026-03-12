/**
 * VolitionSystem — Ensemble-style NPC autonomous goal formation.
 *
 * NPCs evaluate available social actions and score them using personality weights
 * and relationship state. When a volition score exceeds a threshold, the NPC
 * initiates the action autonomously.
 *
 * Volition score = sum of (rule_likelihood * personality_match * relationship_modifier)
 */

import { softmaxActionSelection, type ActionCandidate, type PersonalityProfile } from '@shared/game-engine/action-selection';

export interface VolitionGoal {
  npcId: string;
  actionId: string;
  targetId?: string;
  score: number;
  priority: number;
  category: 'social' | 'economic' | 'romantic' | 'hostile' | 'curious';
}

export interface NPCState {
  id: string;
  name: string;
  personality: {
    openness: number;
    conscientiousness: number;
    extroversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  relationships: Record<string, { charge: number; spark: number; type: string }>;
  currentLocation: string;
  temporaryStates?: string[]; // active temporary state types
}

/** Personality-to-action affinity mappings */
const ACTION_PERSONALITY_AFFINITIES: Record<string, Record<string, number>> = {
  'approach': { extroversion: 0.6, agreeableness: 0.3 },
  'start_conversation': { extroversion: 0.7, agreeableness: 0.2 },
  'offer_gift': { agreeableness: 0.6, conscientiousness: 0.2 },
  'challenge': { extroversion: 0.3, neuroticism: 0.3, agreeableness: -0.4 },
  'express_affection': { extroversion: 0.3, agreeableness: 0.4, openness: 0.2 },
  'avoid': { neuroticism: 0.5, extroversion: -0.4 },
  'gossip': { extroversion: 0.4, agreeableness: -0.3, openness: 0.2 },
  'help': { agreeableness: 0.7, conscientiousness: 0.3 },
  'trade': { conscientiousness: 0.4, openness: 0.3 },
  'explore': { openness: 0.7, extroversion: 0.2 },
};

const VOLITION_THRESHOLD = 0.4; // minimum score to act
const RECALC_INTERVAL = 10; // recalculate every N timesteps

export class VolitionSystem {
  private npcStates: Map<string, NPCState> = new Map();
  private activeGoals: Map<string, VolitionGoal[]> = new Map(); // npcId -> sorted goals
  private lastCalcTimestep: number = 0;
  private eventBus: any;

  constructor(eventBus?: any) {
    this.eventBus = eventBus;
  }

  /** Register an NPC for volition calculation */
  registerNPC(state: NPCState): void {
    this.npcStates.set(state.id, state);
  }

  /** Update NPC state (personality, relationships, location, temporary states) */
  updateNPCState(npcId: string, updates: Partial<NPCState>): void {
    const state = this.npcStates.get(npcId);
    if (state) Object.assign(state, updates);
  }

  /** Calculate volition scores for all NPCs */
  calculateVolitions(currentTimestep: number): Map<string, VolitionGoal[]> {
    if (currentTimestep - this.lastCalcTimestep < RECALC_INTERVAL && this.lastCalcTimestep > 0) {
      return this.activeGoals;
    }
    this.lastCalcTimestep = currentTimestep;

    for (const [npcId, npc] of Array.from(this.npcStates.entries())) {
      const goals: VolitionGoal[] = [];

      // Evaluate each action against each potential target
      for (const [actionId, affinities] of Object.entries(ACTION_PERSONALITY_AFFINITIES)) {
        // Calculate personality match
        let personalityScore = 0;
        for (const [trait, weight] of Object.entries(affinities)) {
          const traitValue = (npc.personality as any)[trait] || 0;
          personalityScore += traitValue * weight;
        }

        // For each nearby NPC (simplified: all other NPCs at same location)
        for (const [targetId, target] of Array.from(this.npcStates.entries())) {
          if (targetId === npcId) continue;
          if (target.currentLocation !== npc.currentLocation) continue;

          // Relationship modifier
          const rel = npc.relationships[targetId];
          let relationshipMod = 0.5; // neutral
          if (rel) {
            relationshipMod = actionId === 'avoid' || actionId === 'challenge'
              ? Math.max(0, 1 - (rel.charge / 100)) // negative actions favored for low-charge relationships
              : Math.max(0, 0.2 + (rel.charge / 100)); // positive actions favored for high-charge
          }

          const score = personalityScore * relationshipMod;

          if (score > 0.1) { // don't bother with very low scores
            goals.push({
              npcId,
              actionId,
              targetId,
              score,
              priority: goals.length,
              category: this.categorizeAction(actionId),
            });
          }
        }

        // Some actions don't need targets (explore, work)
        if (['explore', 'trade'].includes(actionId)) {
          goals.push({
            npcId,
            actionId,
            score: personalityScore * 0.5,
            priority: goals.length,
            category: this.categorizeAction(actionId),
          });
        }
      }

      // Sort by score descending
      goals.sort((a, b) => b.score - a.score);
      this.activeGoals.set(npcId, goals);
    }

    return this.activeGoals;
  }

  /** Get the top N goals for an NPC that exceed the threshold */
  getTopGoals(npcId: string, count: number = 3): VolitionGoal[] {
    const goals = this.activeGoals.get(npcId) || [];
    return goals.filter(g => g.score >= VOLITION_THRESHOLD).slice(0, count);
  }

  /** Execute a goal for an NPC selected probabilistically via softmax */
  executeTopGoal(npcId: string): VolitionGoal | null {
    const goals = this.getTopGoals(npcId, 10); // consider more candidates for softmax
    if (goals.length === 0) return null;

    const npc = this.npcStates.get(npcId);
    if (!npc) return null;

    // Convert goals to ActionCandidate format for softmax selection
    const candidates: ActionCandidate[] = goals.map(g => ({
      id: g.actionId + (g.targetId ? `_${g.targetId}` : ''),
      name: g.actionId,
      baseWeight: g.score,
      personalityAffinities: ACTION_PERSONALITY_AFFINITIES[g.actionId] || {},
    }));

    const personality: PersonalityProfile = npc.personality;

    // Stressed NPCs behave more predictably (lower temperature)
    const hasStress = npc.temporaryStates?.some(s =>
      s.includes('stress') || s.includes('anxious') || s.includes('afraid')
    );
    const temperature = hasStress ? 0.3 : 0.7;

    const result = softmaxActionSelection(candidates, personality, temperature);
    if (!result) return null;

    // Map back to the original VolitionGoal
    const selectedGoal = goals.find(g => {
      const candidateId = g.actionId + (g.targetId ? `_${g.targetId}` : '');
      return candidateId === result.selectedAction.id;
    }) || goals[0];

    this.eventBus?.emit('npc_volition_action', {
      npcId: selectedGoal.npcId,
      actionId: selectedGoal.actionId,
      targetId: selectedGoal.targetId,
      score: selectedGoal.score,
      category: selectedGoal.category,
    });

    return selectedGoal;
  }

  /** Update: recalculate volitions and execute top goals for all NPCs */
  update(currentTimestep: number): VolitionGoal[] {
    this.calculateVolitions(currentTimestep);
    const executed: VolitionGoal[] = [];
    for (const npcId of Array.from(this.npcStates.keys())) {
      const goal = this.executeTopGoal(npcId);
      if (goal) executed.push(goal);
    }
    return executed;
  }

  private categorizeAction(actionId: string): VolitionGoal['category'] {
    if (['approach', 'start_conversation', 'gossip', 'help'].includes(actionId)) return 'social';
    if (['offer_gift', 'trade'].includes(actionId)) return 'economic';
    if (['express_affection'].includes(actionId)) return 'romantic';
    if (['challenge', 'avoid'].includes(actionId)) return 'hostile';
    return 'curious';
  }

  /** Serialize for save/load */
  serialize(): any {
    return {
      npcStates: Object.fromEntries(this.npcStates),
      activeGoals: Object.fromEntries(this.activeGoals),
      lastCalcTimestep: this.lastCalcTimestep,
    };
  }

  deserialize(data: any): void {
    if (data?.npcStates) this.npcStates = new Map(Object.entries(data.npcStates));
    if (data?.activeGoals) this.activeGoals = new Map(Object.entries(data.activeGoals) as any);
    if (data?.lastCalcTimestep) this.lastCalcTimestep = data.lastCalcTimestep;
  }
}
