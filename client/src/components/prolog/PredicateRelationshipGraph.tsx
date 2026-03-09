/**
 * Predicate Relationship Graph
 *
 * Visual graph showing relationships between predicates.
 * Displays which predicates reference each other based on
 * the rules and Prolog content in the world.
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, Network, ZoomIn, ZoomOut } from 'lucide-react';

interface PredicateNode {
  name: string;
  arity: number;
  category: string;
  x: number;
  y: number;
  connections: number;
}

interface PredicateEdge {
  from: string;
  to: string;
}

interface PredicateRelationshipGraphProps {
  worldId: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  'entity-type': '#3b82f6',
  'property': '#22c55e',
  'relationship': '#a855f7',
  'state': '#eab308',
  'event': '#ef4444',
  'genealogy': '#f97316',
  'knowledge': '#06b6d4',
  'utility': '#6b7280',
};

export function PredicateRelationshipGraph({ worldId }: PredicateRelationshipGraphProps) {
  const [nodes, setNodes] = useState<PredicateNode[]>([]);
  const [edges, setEdges] = useState<PredicateEdge[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const svgRef = useRef<SVGSVGElement>(null);

  const analyze = async () => {
    setLoading(true);
    try {
      const [predicatesRes, rulesRes, actionsRes, questsRes] = await Promise.all([
        fetch('/api/prolog/predicates'),
        fetch(`/api/worlds/${worldId}/rules`),
        fetch(`/api/worlds/${worldId}/actions`),
        fetch(`/api/worlds/${worldId}/quests`),
      ]);

      const predicatesData = await predicatesRes.json();
      const rules = rulesRes.ok ? await rulesRes.json() : [];
      const actions = actionsRes.ok ? await actionsRes.json() : [];
      const quests = questsRes.ok ? await questsRes.json() : [];

      // Build predicate list
      const predNames = Object.entries(predicatesData.predicates || {}).map(
        ([name, info]: [string, any]) => ({
          name,
          arity: info.arity || 0,
          category: info.category || 'utility',
        })
      );

      // Find co-occurrences in prologContent
      const allContent = [
        ...rules.map((r: any) => r.prologContent || ''),
        ...actions.map((a: any) => a.prologContent || ''),
        ...quests.map((q: any) => q.prologContent || ''),
      ].filter(Boolean);

      const edgeSet = new Map<string, number>();
      const connectionCount = new Map<string, number>();

      for (const content of allContent) {
        // Find all predicates mentioned in this content
        const mentioned = predNames.filter(p => {
          const regex = new RegExp(`\\b${p.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\(`, 'g');
          return regex.test(content);
        });

        // Create edges between co-occurring predicates
        for (let i = 0; i < mentioned.length; i++) {
          for (let j = i + 1; j < mentioned.length; j++) {
            const key = [mentioned[i].name, mentioned[j].name].sort().join('->');
            edgeSet.set(key, (edgeSet.get(key) || 0) + 1);
            connectionCount.set(mentioned[i].name, (connectionCount.get(mentioned[i].name) || 0) + 1);
            connectionCount.set(mentioned[j].name, (connectionCount.get(mentioned[j].name) || 0) + 1);
          }
        }
      }

      // Filter to predicates that have connections
      const connectedPreds = predNames.filter(p => connectionCount.has(p.name));

      // Layout: circular arrangement
      const cx = 300, cy = 250, radius = 180;
      const graphNodes: PredicateNode[] = connectedPreds.map((p, i) => ({
        ...p,
        x: cx + radius * Math.cos((2 * Math.PI * i) / connectedPreds.length),
        y: cy + radius * Math.sin((2 * Math.PI * i) / connectedPreds.length),
        connections: connectionCount.get(p.name) || 0,
      }));

      const graphEdges: PredicateEdge[] = [];
      Array.from(edgeSet.keys()).forEach(key => {
        const [from, to] = key.split('->');
        graphEdges.push({ from, to });
      });

      setNodes(graphNodes);
      setEdges(graphEdges);
    } catch (e) {
      console.warn('[PredicateRelationshipGraph] Failed:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    analyze();
  }, [worldId]);

  const getNodePos = (name: string) => {
    const node = nodes.find(n => n.name === name);
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  };

  const highlightedEdges = useMemo(() => {
    if (!selectedNode) return edges;
    return edges.filter(e => e.from === selectedNode || e.to === selectedNode);
  }, [edges, selectedNode]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Network className="w-4 h-4 text-purple-500" />
        <span className="text-sm font-semibold">Predicate Relationships</span>
        <div className="ml-auto flex gap-1">
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setZoom(z => Math.min(z + 0.2, 2))}>
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setZoom(z => Math.max(z - 0.2, 0.4))}>
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="h-7" onClick={analyze} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {nodes.length === 0 && !loading && (
        <div className="p-8 text-center text-sm text-muted-foreground border rounded-lg">
          No predicate relationships found. Add rules, actions, or quests with Prolog content to see the graph.
        </div>
      )}

      {nodes.length > 0 && (
        <div className="border rounded-lg overflow-hidden bg-muted/20">
          <svg
            ref={svgRef}
            viewBox={`0 0 600 500`}
            className="w-full"
            style={{ height: 400, transform: `scale(${zoom})`, transformOrigin: 'center' }}
          >
            {/* Edges */}
            {(selectedNode ? highlightedEdges : edges).map((edge, i) => {
              const from = getNodePos(edge.from);
              const to = getNodePos(edge.to);
              const isHighlighted = selectedNode && (edge.from === selectedNode || edge.to === selectedNode);
              return (
                <line
                  key={i}
                  x1={from.x} y1={from.y}
                  x2={to.x} y2={to.y}
                  stroke={isHighlighted ? '#a855f7' : '#94a3b8'}
                  strokeWidth={isHighlighted ? 2 : 0.5}
                  opacity={selectedNode && !isHighlighted ? 0.1 : 0.4}
                />
              );
            })}

            {/* Nodes */}
            {nodes.map(node => {
              const color = CATEGORY_COLORS[node.category] || '#6b7280';
              const isSelected = selectedNode === node.name;
              const isConnected = selectedNode ? edges.some(e =>
                (e.from === selectedNode && e.to === node.name) ||
                (e.to === selectedNode && e.from === node.name)
              ) : true;
              const nodeRadius = Math.min(8 + node.connections * 1.5, 20);

              return (
                <g
                  key={node.name}
                  className="cursor-pointer"
                  onClick={() => setSelectedNode(isSelected ? null : node.name)}
                  opacity={selectedNode && !isSelected && !isConnected ? 0.2 : 1}
                >
                  <circle
                    cx={node.x} cy={node.y}
                    r={nodeRadius}
                    fill={color}
                    opacity={0.8}
                    stroke={isSelected ? '#fff' : 'none'}
                    strokeWidth={isSelected ? 2 : 0}
                  />
                  <text
                    x={node.x} y={node.y + nodeRadius + 12}
                    textAnchor="middle"
                    fontSize={9}
                    fill="currentColor"
                    className="select-none"
                  >
                    {node.name}/{node.arity}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="flex flex-wrap gap-2 p-2 border-t bg-muted/30">
            {Object.entries(CATEGORY_COLORS).map(([cat, color]) => {
              const count = nodes.filter(n => n.category === cat).length;
              if (count === 0) return null;
              return (
                <div key={cat} className="flex items-center gap-1 text-[10px]">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span>{cat} ({count})</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected node info */}
      {selectedNode && (() => {
        const node = nodes.find(n => n.name === selectedNode);
        if (!node) return null;
        const connectedTo = edges
          .filter(e => e.from === selectedNode || e.to === selectedNode)
          .map(e => e.from === selectedNode ? e.to : e.from);

        return (
          <div className="p-3 border rounded-lg bg-muted/20">
            <div className="flex items-center gap-2 mb-2">
              <code className="text-sm font-mono font-bold">{node.name}/{node.arity}</code>
              <Badge variant="secondary" className="text-[10px]">{node.category}</Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              Connected to: {connectedTo.map(name => (
                <button
                  key={name}
                  className="inline-block mx-0.5 px-1.5 py-0.5 bg-muted rounded font-mono hover:bg-muted/80"
                  onClick={() => setSelectedNode(name)}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
