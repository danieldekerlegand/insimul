/**
 * Skill Tree Module — Generic Types
 *
 * Wraps the existing `shared/skill-tree/` framework and adds
 * module-system integration. The generic skill tree is already
 * parameterized on condition type; this module provides the
 * wiring so condition types come from enabled modules.
 */

// Re-export the core framework types
export type {
  SkillCondition,
  SkillNode,
  SkillTier,
  SkillTreeState,
  SkillTreeConfig,
} from '../../skill-tree';

export {
  createSkillTreeState,
  updateSkillProgress,
} from '../../skill-tree';

// ---------------------------------------------------------------------------
// Module configuration
// ---------------------------------------------------------------------------

/**
 * Config for the skill tree module. Each genre provides its own
 * tree definition via this config.
 */
export interface SkillTreeModuleConfig {
  /**
   * Condition types available in this genre's skill tree.
   * Collected from all enabled modules' `skillTreeConditionTypes`.
   */
  conditionTypes: string[];

  /**
   * The actual tree layout (tiers, nodes) is genre-specific.
   * Store as a serializable structure that can be loaded at runtime.
   */
  treeDefinition?: Record<string, unknown>;
}
