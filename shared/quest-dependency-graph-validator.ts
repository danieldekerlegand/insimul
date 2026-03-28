/**
 * Quest Dependency Graph Validator
 *
 * Validates that the quest dependency graph is solvable:
 * - No cycles in prerequisites
 * - No unreachable quests (prerequisites that don't exist)
 * - Main quest chain is fully connected
 * - CEFR-gated quests are reachable at each level
 * - Quest chain has a terminal quest
 */

import type { QuestIR } from './game-engine/ir-types';
import { MAIN_QUEST_CHAPTERS, type MainQuestChapter } from './quest/main-quest-chapters';
import type { CEFRLevel } from './assessment/cefr-mapping';

// ── Types ───────────────────────────────────────────────────────────────────

export interface DependencyIssue {
  severity: 'error' | 'warning';
  message: string;
  questIds?: string[];
}

export interface DependencyGraphReport {
  valid: boolean;
  issues: DependencyIssue[];
  /** Quests with no prerequisites (entry points) */
  entryPoints: string[];
  /** Quests with no dependents (terminal quests) */
  terminalQuests: string[];
  /** Quest chains found: chainId -> ordered quest IDs */
  chains: Map<string, string[]>;
  /** CEFR distribution of quests */
  cefrDistribution: Record<string, number>;
  /** Mermaid diagram of the dependency graph */
  mermaidDiagram: string;
}

// ── Graph helpers ───────────────────────────────────────────────────────────

interface GraphNode {
  quest: QuestIR;
  /** Quest IDs this quest depends on */
  prerequisites: Set<string>;
  /** Quest IDs that depend on this quest */
  dependents: Set<string>;
}

function buildGraph(quests: QuestIR[]): Map<string, GraphNode> {
  const graph = new Map<string, GraphNode>();

  for (const quest of quests) {
    graph.set(quest.id, {
      quest,
      prerequisites: new Set<string>(),
      dependents: new Set<string>(),
    });
  }

  for (const quest of quests) {
    const node = graph.get(quest.id)!;

    // Add explicit prerequisites
    if (quest.prerequisiteQuestIds) {
      for (const preReqId of quest.prerequisiteQuestIds) {
        node.prerequisites.add(preReqId);
        const preReqNode = graph.get(preReqId);
        if (preReqNode) {
          preReqNode.dependents.add(quest.id);
        }
      }
    }

    // Add chain-order dependencies
    if (quest.questChainId && quest.questChainOrder != null && quest.questChainOrder > 1) {
      const prevInChain = quests.find(
        q => q.questChainId === quest.questChainId &&
             q.questChainOrder === quest.questChainOrder! - 1,
      );
      if (prevInChain) {
        node.prerequisites.add(prevInChain.id);
        const prevNode = graph.get(prevInChain.id);
        if (prevNode) {
          prevNode.dependents.add(quest.id);
        }
      }
    }
  }

  return graph;
}

// ── Cycle detection (DFS) ───────────────────────────────────────────────────

function detectCycles(graph: Map<string, GraphNode>): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const inStack = new Set<string>();
  const path: string[] = [];

  function dfs(nodeId: string): void {
    if (inStack.has(nodeId)) {
      // Found cycle — extract it from path
      const cycleStart = path.indexOf(nodeId);
      if (cycleStart >= 0) {
        cycles.push(path.slice(cycleStart).concat(nodeId));
      }
      return;
    }
    if (visited.has(nodeId)) return;

    visited.add(nodeId);
    inStack.add(nodeId);
    path.push(nodeId);

    const node = graph.get(nodeId);
    if (node) {
      Array.from(node.prerequisites).forEach(depId => {
        if (graph.has(depId)) {
          dfs(depId);
        }
      });
    }

    path.pop();
    inStack.delete(nodeId);
  }

  Array.from(graph.keys()).forEach(nodeId => {
    dfs(nodeId);
  });

  return cycles;
}

// ── Chain validation ────────────────────────────────────────────────────────

function buildChains(quests: QuestIR[]): Map<string, string[]> {
  const chains = new Map<string, string[]>();

  for (const quest of quests) {
    if (quest.questChainId) {
      if (!chains.has(quest.questChainId)) {
        chains.set(quest.questChainId, []);
      }
      chains.get(quest.questChainId)!.push(quest.id);
    }
  }

  // Sort each chain by questChainOrder
  const questMap = new Map(quests.map(q => [q.id, q]));
  Array.from(chains.entries()).forEach(([_chainId, ids]) => {
    ids.sort((a: string, b: string) => {
      const qa = questMap.get(a)!;
      const qb = questMap.get(b)!;
      return (qa.questChainOrder ?? 0) - (qb.questChainOrder ?? 0);
    });
  });

  return chains;
}

// ── CEFR validation ─────────────────────────────────────────────────────────

const CEFR_ORDER: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];

function cefrRank(level: string): number {
  return CEFR_ORDER.indexOf(level as CEFRLevel);
}

// ── Mermaid diagram generation ──────────────────────────────────────────────

function generateMermaidDiagram(
  graph: Map<string, GraphNode>,
  chains: Map<string, string[]>,
): string {
  const lines: string[] = ['graph TD'];

  // Add nodes with labels
  Array.from(graph.entries()).forEach(([id, node]) => {
    const title = node.quest.title.replace(/"/g, "'").substring(0, 40);
    const cefrTag = (node.quest as any).cefrLevel ? ` [${(node.quest as any).cefrLevel}]` : '';
    lines.push(`  ${sanitizeId(id)}["${title}${cefrTag}"]`);
  });

  // Add edges for prerequisites
  Array.from(graph.entries()).forEach(([id, node]) => {
    Array.from(node.prerequisites).forEach(preReqId => {
      if (graph.has(preReqId)) {
        lines.push(`  ${sanitizeId(preReqId)} --> ${sanitizeId(id)}`);
      }
    });
  });

  // Style chain groups
  let colorIndex = 0;
  const colors = ['#e8f5e9', '#e3f2fd', '#fff3e0', '#f3e5f5', '#fce4ec', '#e0f7fa'];
  Array.from(chains.entries()).forEach(([chainId, questIds]) => {
    if (questIds.length > 1) {
      const color = colors[colorIndex % colors.length];
      lines.push(`  subgraph ${sanitizeId(chainId)}["Chain: ${chainId.substring(0, 30)}"]`);
      for (const qId of questIds) {
        lines.push(`    ${sanitizeId(qId)}`);
      }
      lines.push('  end');
      lines.push(`  style ${sanitizeId(chainId)} fill:${color}`);
      colorIndex++;
    }
  });

  return lines.join('\n');
}

function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_]/g, '_');
}

// ── Main validator ──────────────────────────────────────────────────────────

/**
 * Validate the quest dependency graph is solvable.
 */
export function validateQuestDependencyGraph(quests: QuestIR[]): DependencyGraphReport {
  const issues: DependencyIssue[] = [];
  const questMap = new Map(quests.map(q => [q.id, q]));
  const graph = buildGraph(quests);
  const chains = buildChains(quests);

  // 1. Check for missing prerequisites
  Array.from(graph.entries()).forEach(([id, node]) => {
    Array.from(node.prerequisites).forEach(preReqId => {
      if (!questMap.has(preReqId)) {
        issues.push({
          severity: 'error',
          message: `Quest "${node.quest.title}" (${id}) requires prerequisite "${preReqId}" which does not exist`,
          questIds: [id, preReqId],
        });
      }
    });
  });

  // 2. Check for cycles
  const cycles = detectCycles(graph);
  for (const cycle of cycles) {
    const cycleNames = cycle.map(id => questMap.get(id)?.title ?? id).join(' -> ');
    issues.push({
      severity: 'error',
      message: `Circular dependency detected: ${cycleNames}`,
      questIds: cycle,
    });
  }

  // 3. Find entry and terminal quests
  const entryPoints: string[] = [];
  const terminalQuests: string[] = [];

  Array.from(graph.entries()).forEach(([id, node]) => {
    if (node.prerequisites.size === 0) {
      entryPoints.push(id);
    }
    if (node.dependents.size === 0) {
      terminalQuests.push(id);
    }
  });

  if (entryPoints.length === 0 && quests.length > 0) {
    issues.push({
      severity: 'error',
      message: 'No entry point quests found — all quests have prerequisites, creating a deadlock',
    });
  }

  // 4. Check chain gaps
  Array.from(chains.entries()).forEach(([chainId, questIds]) => {
    const chainQuests = questIds
      .map((qid: string) => questMap.get(qid)!)
      .filter((q: QuestIR | undefined): q is QuestIR => q != null);
    const orders = chainQuests
      .map((q: QuestIR) => q.questChainOrder)
      .filter((o: number | null): o is number => o != null)
      .sort((a: number, b: number) => a - b);

    for (let i = 1; i < orders.length; i++) {
      if (orders[i] - orders[i - 1] > 1) {
        issues.push({
          severity: 'warning',
          message: `Chain "${chainId}" has a gap in ordering between step ${orders[i - 1]} and ${orders[i]}`,
          questIds: questIds,
        });
      }
    }
  });

  // 5. CEFR distribution
  const cefrDistribution: Record<string, number> = {};
  for (const quest of quests) {
    const cefrLevel = (quest as any).cefrLevel || quest.difficulty || 'unknown';
    cefrDistribution[cefrLevel] = (cefrDistribution[cefrLevel] || 0) + 1;
  }

  // 6. Main quest chapter validation
  validateMainQuestChapters(quests, issues);

  // 7. Generate mermaid diagram
  const mermaidDiagram = generateMermaidDiagram(graph, chains);

  return {
    valid: issues.filter(i => i.severity === 'error').length === 0,
    issues,
    entryPoints,
    terminalQuests,
    chains,
    cefrDistribution,
    mermaidDiagram,
  };
}

/**
 * Validate that the main quest chapter progression is achievable.
 */
function validateMainQuestChapters(
  quests: QuestIR[],
  issues: DependencyIssue[],
): void {
  if (quests.length === 0) return;

  // Group quests by type for chapter objective matching
  const questsByType = new Map<string, QuestIR[]>();
  for (const quest of quests) {
    const qType = quest.questType;
    if (!questsByType.has(qType)) {
      questsByType.set(qType, []);
    }
    questsByType.get(qType)!.push(quest);
  }

  // Check each chapter has enough quests of the right types
  for (const chapter of MAIN_QUEST_CHAPTERS) {
    for (const objective of chapter.objectives) {
      const available = questsByType.get(objective.questType) ?? [];
      if (available.length < objective.requiredCount) {
        issues.push({
          severity: 'warning',
          message: `Chapter ${chapter.number} "${chapter.title}" objective "${objective.title}" requires ${objective.requiredCount} "${objective.questType}" quests but only ${available.length} exist in the world`,
        });
      }
    }
  }

  // Check CEFR progression: enough lower-level quests before higher gates
  const cefrGates: { chapter: MainQuestChapter; level: CEFRLevel }[] = [];
  for (const chapter of MAIN_QUEST_CHAPTERS) {
    if (chapter.requiredCefrLevel !== 'A1') {
      cefrGates.push({ chapter, level: chapter.requiredCefrLevel });
    }
  }

  // For each CEFR gate, check there are quests at the preceding level
  for (const gate of cefrGates) {
    const gateRank = cefrRank(gate.level);
    const precedingLevel = CEFR_ORDER[gateRank - 1];
    if (!precedingLevel) continue;

    const questsAtPrecedingLevel = quests.filter(q => {
      const ql = (q as any).cefrLevel || q.difficulty;
      return ql === precedingLevel;
    });

    if (questsAtPrecedingLevel.length < 3) {
      issues.push({
        severity: 'warning',
        message: `Chapter ${gate.chapter.number} requires CEFR ${gate.level} but only ${questsAtPrecedingLevel.length} quests at level ${precedingLevel} exist — player may not be able to progress`,
      });
    }
  }
}
