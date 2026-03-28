/**
 * Game Export Validator
 *
 * Pre-export validation that runs quest world validation, dependency graph
 * validation, and structural completeness checks against a WorldIR.
 * Used by the export pipeline and the world health dashboard.
 */

import type { WorldIR } from './game-engine/ir-types';
import { validateQuestsAgainstWorld, type WorldValidationReport } from './quest-world-validator';
import { validateQuestDependencyGraph, type DependencyGraphReport } from './quest-dependency-graph-validator';

// ── Types ───────────────────────────────────────────────────────────────────

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationEntry {
  category: string;
  severity: ValidationSeverity;
  message: string;
}

export interface ExportValidationReport {
  /** Overall: true if no errors (warnings are ok) */
  canExport: boolean;
  /** True if no errors and no warnings */
  clean: boolean;
  /** All validation entries */
  entries: ValidationEntry[];
  /** Summary counts */
  summary: {
    errors: number;
    warnings: number;
    infos: number;
  };
  /** Quest-specific sub-reports */
  questWorldReport: WorldValidationReport;
  dependencyGraphReport: DependencyGraphReport;
  /** World health metrics */
  health: WorldHealthMetrics;
}

export interface WorldHealthMetrics {
  totalQuests: number;
  completableQuests: number;
  totalNpcs: number;
  npcsWithDialogue: number;
  totalBuildings: number;
  buildingsWithInteriors: number;
  totalTexts: number;
  totalSettlements: number;
  hasMainQuestChain: boolean;
  questChainCount: number;
  cefrDistribution: Record<string, number>;
}

// ── Validator ───────────────────────────────────────────────────────────────

/**
 * Run all pre-export validations against a WorldIR.
 */
export function validateWorldForExport(worldIR: WorldIR): ExportValidationReport {
  const entries: ValidationEntry[] = [];

  // ── Run sub-validators ──
  const questWorldReport = validateQuestsAgainstWorld(worldIR);
  const dependencyGraphReport = validateQuestDependencyGraph(worldIR.systems.quests);

  // ── Structural checks ──

  // 1. Must have at least one settlement with buildings and NPCs
  const settlements = worldIR.geography.settlements;
  if (settlements.length === 0) {
    entries.push({
      category: 'world',
      severity: 'error',
      message: 'World has no settlements — game requires at least one settlement',
    });
  } else {
    const settlementsWithBuildings = settlements.filter(s => {
      return worldIR.entities.buildings.some(b => b.settlementId === s.id);
    });
    if (settlementsWithBuildings.length === 0) {
      entries.push({
        category: 'world',
        severity: 'error',
        message: 'No settlement has any buildings',
      });
    }
  }

  if (worldIR.entities.npcs.length === 0) {
    entries.push({
      category: 'world',
      severity: 'error',
      message: 'World has no NPCs — game requires at least one NPC',
    });
  }

  // 2. Check NPC → dialogue context coverage
  const dialogueCharIds = new Set(
    worldIR.systems.dialogueContexts.map(dc => dc.characterId),
  );
  const npcsWithoutDialogue = worldIR.entities.npcs.filter(
    n => !dialogueCharIds.has(n.characterId),
  );
  if (npcsWithoutDialogue.length > 0) {
    entries.push({
      category: 'npc',
      severity: 'warning',
      message: `${npcsWithoutDialogue.length} of ${worldIR.entities.npcs.length} NPCs have no dialogue context`,
    });
  }

  // 3. Check buildings have positions
  const buildingsWithoutPosition = worldIR.entities.buildings.filter(
    b => !b.position || (b.position.x === 0 && b.position.y === 0 && b.position.z === 0),
  );
  if (buildingsWithoutPosition.length > 0) {
    entries.push({
      category: 'building',
      severity: 'warning',
      message: `${buildingsWithoutPosition.length} buildings have no position or are at origin`,
    });
  }

  // 4. Check quest count
  const quests = worldIR.systems.quests;
  if (quests.length === 0) {
    entries.push({
      category: 'quest',
      severity: 'error',
      message: 'World has no quests — game requires at least one quest',
    });
  }

  // 5. Quest world validation issues
  for (const issue of questWorldReport.issues) {
    entries.push({
      category: 'quest',
      severity: issue.severity,
      message: `Quest "${issue.questTitle}": ${issue.message}`,
    });
  }

  // Summarize infeasible quests
  if (questWorldReport.infeasible.length > 0) {
    entries.push({
      category: 'quest',
      severity: 'warning',
      message: `${questWorldReport.infeasible.length} quests reference non-existent world data and may be uncompletable`,
    });
  }

  // 6. Dependency graph issues
  for (const issue of dependencyGraphReport.issues) {
    entries.push({
      category: 'dependency',
      severity: issue.severity,
      message: issue.message,
    });
  }

  // 7. Text documents
  const texts = worldIR.systems.texts;
  if (texts.length > 0) {
    const textsWithoutContent = texts.filter(
      t => !t.pages || t.pages.length === 0,
    );
    if (textsWithoutContent.length > 0) {
      entries.push({
        category: 'text',
        severity: 'warning',
        message: `${textsWithoutContent.length} text documents have no pages/content`,
      });
    }
  }

  // 8. Check items referenced by quest rewards exist
  for (const quest of quests) {
    if (quest.itemRewards) {
      for (const reward of quest.itemRewards) {
        const itemExists = worldIR.systems.items.some(
          i => i.id === reward.itemId || i.name.toLowerCase() === reward.name.toLowerCase(),
        );
        if (!itemExists) {
          entries.push({
            category: 'quest',
            severity: 'warning',
            message: `Quest "${quest.title}" rewards item "${reward.name}" which doesn't exist in items list`,
          });
        }
      }
    }
  }

  // ── Build health metrics ──
  const health: WorldHealthMetrics = {
    totalQuests: quests.length,
    completableQuests: questWorldReport.feasible.length,
    totalNpcs: worldIR.entities.npcs.length,
    npcsWithDialogue: worldIR.entities.npcs.length - npcsWithoutDialogue.length,
    totalBuildings: worldIR.entities.buildings.length,
    buildingsWithInteriors: worldIR.entities.buildings.filter(b => b.interior !== null).length,
    totalTexts: texts.length,
    totalSettlements: settlements.length,
    hasMainQuestChain: quests.some(q => q.questChainId != null),
    questChainCount: dependencyGraphReport.chains.size,
    cefrDistribution: dependencyGraphReport.cefrDistribution,
  };

  // ── Summarize ──
  const errors = entries.filter(e => e.severity === 'error').length;
  const warnings = entries.filter(e => e.severity === 'warning').length;
  const infos = entries.filter(e => e.severity === 'info').length;

  return {
    canExport: errors === 0,
    clean: errors === 0 && warnings === 0,
    entries,
    summary: { errors, warnings, infos },
    questWorldReport,
    dependencyGraphReport,
    health,
  };
}

/**
 * Produce a serializable validation report (converts Maps to objects).
 */
export function serializeValidationReport(report: ExportValidationReport): Record<string, any> {
  return {
    canExport: report.canExport,
    clean: report.clean,
    entries: report.entries,
    summary: report.summary,
    health: report.health,
    questWorldReport: {
      feasibleCount: report.questWorldReport.feasible.length,
      infeasibleCount: report.questWorldReport.infeasible.length,
      infeasibleQuests: report.questWorldReport.infeasible.map(q => ({
        id: q.id,
        title: q.title,
      })),
      warnings: report.questWorldReport.warnings,
    },
    dependencyGraphReport: {
      valid: report.dependencyGraphReport.valid,
      issues: report.dependencyGraphReport.issues,
      entryPoints: report.dependencyGraphReport.entryPoints,
      terminalQuests: report.dependencyGraphReport.terminalQuests,
      chains: Object.fromEntries(report.dependencyGraphReport.chains),
      cefrDistribution: report.dependencyGraphReport.cefrDistribution,
      mermaidDiagram: report.dependencyGraphReport.mermaidDiagram,
    },
  };
}
