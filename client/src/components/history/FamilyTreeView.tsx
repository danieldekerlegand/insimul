/**
 * Family Tree Visualization
 *
 * Renders a family tree using SVG with nodes for characters
 * and lines for parent-child and spouse relationships.
 * Built-in layout engine — no external library required.
 */

import { useState, useMemo, useRef, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  age?: number | null;
  gender?: string;
  spouseId?: string | null;
  motherId?: string | null;
  fatherId?: string | null;
  isAlive?: boolean;
  occupation?: string | null;
}

interface FamilyTreeViewProps {
  characters: FamilyMember[];
  onCharacterSelect?: (characterId: string) => void;
  selectedCharacterId?: string;
}

interface TreeNode {
  member: FamilyMember;
  x: number;
  y: number;
  generation: number;
}

const NODE_WIDTH = 120;
const NODE_HEIGHT = 50;
const H_GAP = 30;
const V_GAP = 80;
const SPOUSE_GAP = 10;

const GENDER_COLORS: Record<string, string> = {
  male: '#3b82f6',
  female: '#ec4899',
  nonbinary: '#a855f7',
};

export function FamilyTreeView({ characters, onCharacterSelect, selectedCharacterId }: FamilyTreeViewProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  // Build family tree layout
  const { nodes, edges, width, height } = useMemo(() => {
    if (characters.length === 0) return { nodes: [], edges: [], width: 800, height: 400 };

    const memberMap = new Map(characters.map(c => [c.id, c]));
    const childrenMap = new Map<string, string[]>();
    const roots: string[] = [];

    // Build parent→children map and find roots (no parents)
    characters.forEach(c => {
      const hasParent = (c.motherId && memberMap.has(c.motherId)) || (c.fatherId && memberMap.has(c.fatherId));
      if (!hasParent) roots.push(c.id);

      if (c.motherId && memberMap.has(c.motherId)) {
        const existing = childrenMap.get(c.motherId) || [];
        existing.push(c.id);
        childrenMap.set(c.motherId, existing);
      }
      if (c.fatherId && memberMap.has(c.fatherId)) {
        const existing = childrenMap.get(c.fatherId) || [];
        if (!existing.includes(c.id)) existing.push(c.id);
        childrenMap.set(c.fatherId, existing);
      }
    });

    // If no clear roots, use all characters
    if (roots.length === 0) roots.push(...characters.map(c => c.id));

    // Assign generations via BFS
    const generationMap = new Map<string, number>();
    const visited = new Set<string>();
    const queue: Array<{ id: string; gen: number }> = roots.map(id => ({ id, gen: 0 }));

    while (queue.length > 0) {
      const { id, gen } = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);
      generationMap.set(id, gen);

      const children = childrenMap.get(id) || [];
      children.forEach(childId => {
        if (!visited.has(childId)) queue.push({ id: childId, gen: gen + 1 });
      });

      // Spouse is same generation
      const member = memberMap.get(id);
      if (member?.spouseId && !visited.has(member.spouseId)) {
        queue.push({ id: member.spouseId, gen });
      }
    }

    // Add any unvisited characters
    characters.forEach(c => {
      if (!generationMap.has(c.id)) generationMap.set(c.id, 0);
    });

    // Group by generation
    const genGroups = new Map<number, string[]>();
    generationMap.forEach((gen, id) => {
      const group = genGroups.get(gen) || [];
      group.push(id);
      genGroups.set(gen, group);
    });

    // Place spouse pairs together
    const positioned = new Set<string>();
    const treeNodes: TreeNode[] = [];

    const sortedGens = Array.from(genGroups.keys()).sort((a, b) => a - b);
    sortedGens.forEach(gen => {
      const ids = genGroups.get(gen) || [];
      let x = 0;

      ids.forEach(id => {
        if (positioned.has(id)) return;
        const member = memberMap.get(id)!;
        positioned.add(id);

        treeNodes.push({ member, x, y: gen * (NODE_HEIGHT + V_GAP), generation: gen });

        // Place spouse next to them
        if (member.spouseId && !positioned.has(member.spouseId) && memberMap.has(member.spouseId)) {
          positioned.add(member.spouseId);
          x += NODE_WIDTH + SPOUSE_GAP;
          treeNodes.push({
            member: memberMap.get(member.spouseId)!,
            x,
            y: gen * (NODE_HEIGHT + V_GAP),
            generation: gen,
          });
        }

        x += NODE_WIDTH + H_GAP;
      });
    });

    // Build edges
    const nodePositions = new Map(treeNodes.map(n => [n.member.id, n]));
    const treeEdges: Array<{ from: TreeNode; to: TreeNode; type: 'parent' | 'spouse' }> = [];

    treeNodes.forEach(node => {
      const m = node.member;
      // Spouse line
      if (m.spouseId && nodePositions.has(m.spouseId)) {
        const spouseNode = nodePositions.get(m.spouseId)!;
        // Only add once (lower id first)
        if (m.id < m.spouseId) {
          treeEdges.push({ from: node, to: spouseNode, type: 'spouse' });
        }
      }
      // Parent→child lines
      const children = childrenMap.get(m.id) || [];
      children.forEach(childId => {
        if (nodePositions.has(childId)) {
          treeEdges.push({ from: node, to: nodePositions.get(childId)!, type: 'parent' });
        }
      });
    });

    const maxX = Math.max(...treeNodes.map(n => n.x + NODE_WIDTH), 800);
    const maxY = Math.max(...treeNodes.map(n => n.y + NODE_HEIGHT), 400);

    return { nodes: treeNodes, edges: treeEdges, width: maxX + 40, height: maxY + 40 };
  }, [characters]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  }, [dragging, dragStart]);

  const handleMouseUp = useCallback(() => setDragging(false), []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.max(0.2, Math.min(3, z * delta)));
  }, []);

  return (
    <div className="relative w-full h-full min-h-[400px] bg-muted/10 rounded-lg overflow-hidden">
      {/* Controls */}
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => setZoom(z => Math.min(3, z * 1.2))}>
          <ZoomIn className="w-3 h-3" />
        </Button>
        <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => setZoom(z => Math.max(0.2, z * 0.8))}>
          <ZoomOut className="w-3 h-3" />
        </Button>
        <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>
          <Maximize2 className="w-3 h-3" />
        </Button>
      </div>

      {/* Generation labels */}
      <div className="absolute top-2 left-2 z-10 text-xs text-muted-foreground">
        {characters.length} members
      </div>

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        className="cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <g transform={`translate(${pan.x + 20}, ${pan.y + 20}) scale(${zoom})`}>
          {/* Edges */}
          {edges.map((edge, i) => {
            const fromCx = edge.from.x + NODE_WIDTH / 2;
            const fromCy = edge.from.y + NODE_HEIGHT / 2;
            const toCx = edge.to.x + NODE_WIDTH / 2;
            const toCy = edge.to.y + NODE_HEIGHT / 2;

            if (edge.type === 'spouse') {
              return (
                <line
                  key={`edge-${i}`}
                  x1={edge.from.x + NODE_WIDTH}
                  y1={fromCy}
                  x2={edge.to.x}
                  y2={toCy}
                  stroke="#ec4899"
                  strokeWidth={2}
                  strokeDasharray="4,4"
                  opacity={0.5}
                />
              );
            }

            // Parent→child: curve from bottom of parent to top of child
            const startY = edge.from.y + NODE_HEIGHT;
            const endY = edge.to.y;
            const midY = (startY + endY) / 2;

            return (
              <path
                key={`edge-${i}`}
                d={`M ${fromCx} ${startY} C ${fromCx} ${midY}, ${toCx} ${midY}, ${toCx} ${endY}`}
                fill="none"
                stroke="#6b7280"
                strokeWidth={1.5}
                opacity={0.4}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map(node => {
            const isSelected = selectedCharacterId === node.member.id;
            const color = GENDER_COLORS[node.member.gender || ''] || '#6b7280';
            const isAlive = node.member.isAlive !== false;

            return (
              <g
                key={node.member.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => onCharacterSelect?.(node.member.id)}
                className="cursor-pointer"
              >
                <rect
                  width={NODE_WIDTH}
                  height={NODE_HEIGHT}
                  rx={6}
                  fill={isSelected ? color : 'rgba(0,0,0,0.6)'}
                  stroke={color}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  opacity={isAlive ? 1 : 0.5}
                />
                <text
                  x={NODE_WIDTH / 2}
                  y={18}
                  textAnchor="middle"
                  fill="white"
                  fontSize={11}
                  fontWeight="bold"
                >
                  {node.member.firstName}
                </text>
                <text
                  x={NODE_WIDTH / 2}
                  y={32}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.7)"
                  fontSize={9}
                >
                  {node.member.lastName}
                </text>
                {node.member.age && (
                  <text
                    x={NODE_WIDTH / 2}
                    y={44}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.5)"
                    fontSize={8}
                  >
                    {isAlive ? `Age ${node.member.age}` : `Died at ${node.member.age}`}
                  </text>
                )}
                {!isAlive && (
                  <line x1={0} y1={NODE_HEIGHT / 2} x2={NODE_WIDTH} y2={NODE_HEIGHT / 2} stroke="rgba(255,0,0,0.3)" strokeWidth={1} />
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {characters.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <p className="text-sm">No family data available</p>
        </div>
      )}
    </div>
  );
}
