/**
 * GenealogyView (US-3.05)
 *
 * Renders multi-generational family trees using a pure CSS/React tree layout
 * with glassmorphism card styling. Supports expandable/collapsible branches,
 * character detail panel, generation color coding, and surname filtering.
 *
 * TODO: Replace this DOM-based layout with the `family-chart` library
 * (https://github.com/donatso/family-chart) once it is installed as a
 * dependency. The data format conversion is already handled server-side
 * by GenealogyEngine.toFamilyChartFormat().
 */

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ChevronDown, ChevronRight, User, Users, Heart, Baby,
  Skull, TreePine, Filter, Maximize2, Minimize2,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types (mirrors server-side GenealogyNode / FamilyTree / GenealogyData)
// ---------------------------------------------------------------------------

export interface GenealogyNode {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  birthYear: number;
  deathYear: number | null;
  gender: 'male' | 'female';
  generation: number;
  parentIds: string[];
  spouseIds: string[];
  childrenIds: string[];
  maidenName?: string;
  isAlive: boolean;
  metadata: Record<string, any>;
}

export interface FamilyTree {
  rootNodeIds: string[];
  allNodeIds: string[];
  familyName: string;
  generationCount: number;
}

export interface GenealogyData {
  trees: FamilyTree[];
  /** Serialized from Map on server — arrives as Record<string, GenealogyNode>. */
  allNodes: Record<string, GenealogyNode>;
  totalCharacters: number;
  yearRange: [number, number];
}

// ---------------------------------------------------------------------------
// Generation color palette
// ---------------------------------------------------------------------------

const GENERATION_COLORS: Record<number, string> = {
  0: 'border-l-amber-500',
  1: 'border-l-emerald-500',
  2: 'border-l-sky-500',
  3: 'border-l-violet-500',
  4: 'border-l-rose-500',
  5: 'border-l-orange-500',
  6: 'border-l-teal-500',
  7: 'border-l-fuchsia-500',
};

const GENERATION_BADGES: Record<number, string> = {
  0: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  1: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  2: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
  3: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
  4: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
  5: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  6: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  7: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/30 dark:text-fuchsia-300',
};

function getGenerationColor(gen: number): string {
  return GENERATION_COLORS[gen % 8] ?? 'border-l-gray-400';
}

function getGenerationBadge(gen: number): string {
  return GENERATION_BADGES[gen % 8] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface GenealogyViewProps {
  data: GenealogyData | null;
  /** Whether data is currently loading. */
  isLoading?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function GenealogyView({ data, isLoading }: GenealogyViewProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [familyFilter, setFamilyFilter] = useState<string>('all');
  const [allExpanded, setAllExpanded] = useState(false);

  // Build a lookup map from the serialized allNodes
  const nodeMap = useMemo(() => {
    if (!data) return new Map<string, GenealogyNode>();
    const map = new Map<string, GenealogyNode>();
    const entries = Object.entries(data.allNodes);
    for (const [id, node] of entries) {
      map.set(id, node);
    }
    return map;
  }, [data]);

  // Available family names for filter
  const familyNames = useMemo(() => {
    if (!data) return [];
    return data.trees.map(t => t.familyName).sort();
  }, [data]);

  // Filtered trees
  const filteredTrees = useMemo(() => {
    if (!data) return [];
    if (familyFilter === 'all') return data.trees;
    return data.trees.filter(t => t.familyName === familyFilter);
  }, [data, familyFilter]);

  const toggleNode = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    if (!data) return;
    const allIds = new Set(Object.keys(data.allNodes));
    setExpandedNodes(allIds);
    setAllExpanded(true);
  }, [data]);

  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set());
    setAllExpanded(false);
  }, []);

  const selectedNode = selectedNodeId ? nodeMap.get(selectedNodeId) ?? null : null;

  if (isLoading) {
    return (
      <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <TreePine className="w-8 h-8 mx-auto mb-3 animate-pulse" />
            <p>Generating family trees...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.totalCharacters === 0) {
    return (
      <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <TreePine className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p>No genealogy data available.</p>
            <p className="text-xs mt-1">Run the historical simulation to generate family trees.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header / Controls */}
      <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{data.totalCharacters} characters</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TreePine className="w-4 h-4" />
                <span>{data.trees.length} families</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {data.yearRange[0]} - {data.yearRange[1]}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Select value={familyFilter} onValueChange={setFamilyFilter}>
                <SelectTrigger className="w-[160px] h-8 text-xs">
                  <Filter className="w-3 h-3 mr-1" />
                  <SelectValue placeholder="Family" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Families</SelectItem>
                  {familyNames.map(name => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8"
                onClick={allExpanded ? collapseAll : expandAll}
              >
                {allExpanded ? (
                  <><Minimize2 className="w-3 h-3 mr-1" /> Collapse</>
                ) : (
                  <><Maximize2 className="w-3 h-3 mr-1" /> Expand All</>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main content: tree + detail panel */}
      <div className="flex gap-4">
        {/* Tree area */}
        <div className="flex-1 min-w-0">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4 pr-4">
              {filteredTrees.map(tree => (
                <FamilyTreeCard
                  key={tree.familyName}
                  tree={tree}
                  nodeMap={nodeMap}
                  expandedNodes={expandedNodes}
                  selectedNodeId={selectedNodeId}
                  onToggleNode={toggleNode}
                  onSelectNode={setSelectedNodeId}
                />
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Detail panel */}
        {selectedNode && (
          <Card className="w-[320px] shrink-0 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4" />
                {selectedNode.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CharacterDetail node={selectedNode} nodeMap={nodeMap} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Generation legend */}
      <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
        <CardContent className="py-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-muted-foreground font-medium">Generations:</span>
            {Array.from({ length: Math.min(8, Math.max(...filteredTrees.map(t => t.generationCount), 1)) }, (_, i) => (
              <Badge key={i} className={`text-xs ${getGenerationBadge(i)}`}>
                Gen {i}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FamilyTreeCard — one card per founding family
// ---------------------------------------------------------------------------

interface FamilyTreeCardProps {
  tree: FamilyTree;
  nodeMap: Map<string, GenealogyNode>;
  expandedNodes: Set<string>;
  selectedNodeId: string | null;
  onToggleNode: (id: string) => void;
  onSelectNode: (id: string) => void;
}

function FamilyTreeCard({
  tree, nodeMap, expandedNodes, selectedNodeId, onToggleNode, onSelectNode,
}: FamilyTreeCardProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/40 dark:hover:bg-white/10 transition-colors"
        onClick={() => setCollapsed(prev => !prev)}
      >
        <div className="flex items-center gap-2">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span className="font-semibold text-sm">{tree.familyName} Family</span>
          <Badge variant="outline" className="text-xs ml-2">
            {tree.allNodeIds.length} members
          </Badge>
          <Badge variant="outline" className="text-xs">
            {tree.generationCount} gen{tree.generationCount !== 1 ? 's' : ''}
          </Badge>
        </div>
      </button>

      {!collapsed && (
        <CardContent className="pt-0 pb-3">
          <div className="pl-2">
            {tree.rootNodeIds.map(rootId => {
              const rootNode = nodeMap.get(rootId);
              if (!rootNode) return null;
              return (
                <TreeBranch
                  key={rootId}
                  node={rootNode}
                  nodeMap={nodeMap}
                  expandedNodes={expandedNodes}
                  selectedNodeId={selectedNodeId}
                  onToggleNode={onToggleNode}
                  onSelectNode={onSelectNode}
                  depth={0}
                />
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// TreeBranch — recursive node renderer
// ---------------------------------------------------------------------------

interface TreeBranchProps {
  node: GenealogyNode;
  nodeMap: Map<string, GenealogyNode>;
  expandedNodes: Set<string>;
  selectedNodeId: string | null;
  onToggleNode: (id: string) => void;
  onSelectNode: (id: string) => void;
  depth: number;
}

function TreeBranch({
  node, nodeMap, expandedNodes, selectedNodeId, onToggleNode, onSelectNode, depth,
}: TreeBranchProps) {
  const hasChildren = node.childrenIds.length > 0;
  const isExpanded = expandedNodes.has(node.id);
  const isSelected = selectedNodeId === node.id;
  const genColor = getGenerationColor(node.generation);

  // Find spouse name for display
  const spouseNames = node.spouseIds
    .map(sid => nodeMap.get(sid))
    .filter((s): s is GenealogyNode => s != null)
    .map(s => s.firstName);

  // Get children nodes (only those where this node is a parent)
  const children = node.childrenIds
    .map(cid => nodeMap.get(cid))
    .filter((c): c is GenealogyNode => c != null);

  return (
    <div className={depth > 0 ? 'ml-5 border-l border-gray-200 dark:border-gray-700 pl-3' : ''}>
      {/* Node row */}
      <div
        className={`
          flex items-center gap-2 py-1.5 px-2 rounded-md text-sm cursor-pointer
          border-l-2 ${genColor}
          transition-colors
          ${isSelected
            ? 'bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-300 dark:ring-blue-700'
            : 'hover:bg-white/40 dark:hover:bg-white/10'}
        `}
        onClick={() => onSelectNode(node.id)}
      >
        {/* Expand/collapse toggle */}
        {hasChildren ? (
          <button
            className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            onClick={(e) => { e.stopPropagation(); onToggleNode(node.id); }}
          >
            {isExpanded
              ? <ChevronDown className="w-3.5 h-3.5" />
              : <ChevronRight className="w-3.5 h-3.5" />
            }
          </button>
        ) : (
          <span className="w-[18px]" />
        )}

        {/* Gender icon */}
        {node.gender === 'male'
          ? <User className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          : <User className="w-3.5 h-3.5 text-pink-500 shrink-0" />
        }

        {/* Name */}
        <span className={`font-medium truncate ${!node.isAlive ? 'line-through opacity-60' : ''}`}>
          {node.name}
        </span>

        {/* Maiden name */}
        {node.maidenName && (
          <span className="text-xs text-muted-foreground">(nee {node.maidenName})</span>
        )}

        {/* Spouse indicator */}
        {spouseNames.length > 0 && (
          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
            <Heart className="w-3 h-3 text-red-400" />
            {spouseNames.join(', ')}
          </span>
        )}

        {/* Years */}
        <span className="text-xs text-muted-foreground ml-auto shrink-0">
          {node.birthYear}{node.deathYear != null ? ` - ${node.deathYear}` : ''}
        </span>

        {/* Status icon */}
        {!node.isAlive && <Skull className="w-3 h-3 text-gray-400 shrink-0" />}

        {/* Children count */}
        {hasChildren && (
          <Badge variant="outline" className="text-[10px] px-1 py-0 shrink-0">
            {node.childrenIds.length}
          </Badge>
        )}
      </div>

      {/* Children (recursive) */}
      {isExpanded && children.length > 0 && (
        <div className="mt-0.5">
          {children.map(child => (
            <TreeBranch
              key={child.id}
              node={child}
              nodeMap={nodeMap}
              expandedNodes={expandedNodes}
              selectedNodeId={selectedNodeId}
              onToggleNode={onToggleNode}
              onSelectNode={onSelectNode}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CharacterDetail — detail panel for a selected node
// ---------------------------------------------------------------------------

interface CharacterDetailProps {
  node: GenealogyNode;
  nodeMap: Map<string, GenealogyNode>;
}

function CharacterDetail({ node, nodeMap }: CharacterDetailProps) {
  const parents = node.parentIds
    .map(pid => nodeMap.get(pid))
    .filter((p): p is GenealogyNode => p != null);

  const spouses = node.spouseIds
    .map(sid => nodeMap.get(sid))
    .filter((s): s is GenealogyNode => s != null);

  const children = node.childrenIds
    .map(cid => nodeMap.get(cid))
    .filter((c): c is GenealogyNode => c != null);

  const age = node.deathYear != null
    ? node.deathYear - node.birthYear
    : null;

  return (
    <div className="space-y-4 text-sm">
      {/* Basic info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Badge className={getGenerationBadge(node.generation)}>
            Generation {node.generation}
          </Badge>
          <Badge variant={node.isAlive ? 'default' : 'secondary'}>
            {node.isAlive ? 'Living' : 'Deceased'}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Gender</span>
            <p className="font-medium capitalize">{node.gender}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Born</span>
            <p className="font-medium">{node.birthYear}</p>
          </div>
          {node.deathYear != null && (
            <>
              <div>
                <span className="text-muted-foreground">Died</span>
                <p className="font-medium">{node.deathYear}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Age at death</span>
                <p className="font-medium">{age}</p>
              </div>
            </>
          )}
          {node.maidenName && (
            <div className="col-span-2">
              <span className="text-muted-foreground">Maiden name</span>
              <p className="font-medium">{node.maidenName}</p>
            </div>
          )}
        </div>
      </div>

      {/* Parents */}
      {parents.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Parents
          </h4>
          <div className="space-y-1">
            {parents.map(p => (
              <RelationshipBadge key={p.id} node={p} icon={<User className="w-3 h-3" />} />
            ))}
          </div>
        </div>
      )}

      {/* Spouses */}
      {spouses.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Spouse{spouses.length > 1 ? 's' : ''}
          </h4>
          <div className="space-y-1">
            {spouses.map(s => (
              <RelationshipBadge key={s.id} node={s} icon={<Heart className="w-3 h-3 text-red-400" />} />
            ))}
          </div>
        </div>
      )}

      {/* Children */}
      {children.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Children ({children.length})
          </h4>
          <div className="space-y-1">
            {children.map(c => (
              <RelationshipBadge key={c.id} node={c} icon={<Baby className="w-3 h-3 text-green-500" />} />
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      {Object.keys(node.metadata).length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Details
          </h4>
          <div className="text-xs space-y-0.5">
            {Object.entries(node.metadata).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                <span className="font-medium">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// RelationshipBadge — small inline badge showing a related character
// ---------------------------------------------------------------------------

function RelationshipBadge({ node, icon }: { node: GenealogyNode; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-xs px-2 py-1 rounded bg-gray-50 dark:bg-gray-800/50">
      {icon}
      <span className={`font-medium ${!node.isAlive ? 'line-through opacity-60' : ''}`}>
        {node.name}
      </span>
      <span className="text-muted-foreground ml-auto">
        {node.birthYear}{node.deathYear != null ? ` - ${node.deathYear}` : ''}
      </span>
    </div>
  );
}
