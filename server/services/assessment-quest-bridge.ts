/**
 * Assessment Quest Bridge (Server)
 *
 * Re-exports shared bridge functions and adds the server-typed
 * buildArrivalAssessmentQuest that returns InsertQuest.
 */

export {
  type AssessmentQuestObjective,
  type AssessmentQuestConfig,
  markPhaseObjectiveComplete,
  computeProgress,
  isArrivalAssessmentQuest,
  getArrivalPhaseIds,
} from '../../shared/services/assessment-quest-bridge-shared.js';

import { buildArrivalAssessmentQuest as buildShared } from '../../shared/services/assessment-quest-bridge-shared.js';
import type { AssessmentQuestConfig } from '../../shared/services/assessment-quest-bridge-shared.js';
import type { InsertQuest } from '../../shared/schema.js';

/**
 * Server-typed version that returns InsertQuest.
 */
export function buildArrivalAssessmentQuest(config: AssessmentQuestConfig): InsertQuest {
  return buildShared(config) as InsertQuest;
}
