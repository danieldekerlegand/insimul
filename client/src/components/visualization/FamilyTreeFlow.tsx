/**
 * FamilyTreeFlow
 *
 * Replaces the canvas-based GenealogyViewer with a React Flow graph.
 * Uses dagre for automatic top-down family-tree layout.
 * Parent-child edges are solid; spouse edges are dashed pink.
 * Clicking a node opens a detail panel with navigation buttons that
 * re-center the flow on the target character.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  Handle,
  Position,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
  type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Dagre from '@dagrejs/dagre';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, MapPin, Building2, X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Character {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  birthYear: number | null;
  isAlive: boolean | null;
  spouseId: string | null;
  parentIds: string[] | null;
  childIds: string[] | null;
  socialAttributes?: Record<string, unknown>;
  countryId?: string;
  settlementId?: string;
  occupation?: string;
}

type GenealogyScope = 'world' | 'country' | 'settlement';

export interface FamilyTreeFlowProps {
  worldId: string;
  countries?: any[];
  settlements?: any[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const NODE_W = 152;
const NODE_H = 74;
const MAX_CHARS = 250;

// ─── Custom Node ──────────────────────────────────────────────────────────────

interface FamilyNodeData extends Record<string, unknown> {
  char: Character;
  isSelected: boolean;
}

function FamilyMemberNode({ data }: { data: FamilyNodeData }) {
  const { char, isSelected } = data;
  const alive = char.isAlive !== false;
  const male = char.gender === 'male';
  const accent = !alive ? '#6b7280' : male ? '#3b82f6' : '#ec4899';
  const bg = isSelected ? '#fffbeb' : !alive ? '#f9fafb' : male ? '#eff6ff' : '#fdf2f8';

  return (
    <div
      style={{
        width: NODE_W,
        height: NODE_H,
        borderRadius: 10,
        border: `2px solid ${isSelected ? '#f59e0b' : accent}`,
        background: bg,
        boxShadow: isSelected
          ? '0 0 0 3px rgba(251,191,36,0.3)'
          : '0 1px 4px rgba(0,0,0,0.10)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'border-color 0.12s, box-shadow 0.12s',
      }}
    >
      {/* Colour accent bar */}
      <div style={{ height: 4, background: accent, flexShrink: 0 }} />

      {/* Content */}
      <div
        style={{
          flex: 1,
          padding: '5px 10px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        <div
          style={{
            fontSize: 12.5,
            fontWeight: 600,
            color: '#111827',
            lineHeight: 1.25,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {char.firstName} {char.lastName}
        </div>
        <div
          style={{
            fontSize: 11,
            color: accent,
            display: 'flex',
            gap: 5,
            alignItems: 'center',
          }}
        >
          {male ? '♂' : '♀'}
          {char.birthYear != null && <span>b.{char.birthYear}</span>}
          {!alive && <span style={{ color: '#9ca3af' }}>†</span>}
        </div>
        {char.occupation && (
          <div
            style={{
              fontSize: 10,
              color: '#6b7280',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {char.occupation}
          </div>
        )}
      </div>

      {/* Handles — top for incoming parent edges, bottom for outgoing child edges */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: accent, width: 7, height: 7, top: -3.5, border: '1.5px solid white' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: accent, width: 7, height: 7, bottom: -3.5, border: '1.5px solid white' }}
      />
    </div>
  );
}

const nodeTypes = { familyMember: FamilyMemberNode } as const;

// ─── Dagre layout ─────────────────────────────────────────────────────────────

function layoutNodes(nodes: Node[], edges: Edge[]): Node[] {
  if (nodes.length === 0) return nodes;

  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', ranksep: 60, nodesep: 24, marginx: 24, marginy: 24 });

  nodes.forEach(n => g.setNode(n.id, { width: NODE_W, height: NODE_H }));

  // Only parent-child edges drive the layout; spouse edges are rendered afterwards
  edges
    .filter(e => (e.data as any)?.kind === 'parent-child')
    .forEach(e => g.setEdge(e.source, e.target));

  Dagre.layout(g);

  return nodes.map(n => {
    const pos = g.node(n.id);
    return { ...n, position: { x: pos.x - NODE_W / 2, y: pos.y - NODE_H / 2 } };
  });
}

// ─── Build graph ──────────────────────────────────────────────────────────────

function buildGraph(
  chars: Character[],
  selectedId: string | null
): { nodes: Node[]; edges: Edge[] } {
  const idSet = new Set(chars.map(c => c.id));

  const nodes: Node[] = chars.map(c => ({
    id: c.id,
    type: 'familyMember',
    position: { x: 0, y: 0 },
    data: { char: c, isSelected: c.id === selectedId } satisfies FamilyNodeData,
  }));

  const edges: Edge[] = [];
  const spouseSeen = new Set<string>();

  for (const c of chars) {
    // Parent → child
    for (const pid of c.parentIds ?? []) {
      if (idSet.has(pid)) {
        edges.push({
          id: `pc-${pid}-${c.id}`,
          source: pid,
          target: c.id,
          data: { kind: 'parent-child' },
          type: 'smoothstep',
          style: { stroke: '#9ca3af', strokeWidth: 1.5 },
        });
      }
    }

    // Spouse (deduplicated)
    if (c.spouseId && idSet.has(c.spouseId)) {
      const key = [c.id, c.spouseId].sort().join('~');
      if (!spouseSeen.has(key)) {
        spouseSeen.add(key);
        edges.push({
          id: `sp-${key}`,
          source: c.id,
          target: c.spouseId,
          data: { kind: 'spouse' },
          type: 'straight',
          style: { stroke: '#f472b6', strokeWidth: 1.5, strokeDasharray: '5 3' },
        });
      }
    }
  }

  return { nodes, edges };
}

// ─── Inner component (must be inside ReactFlowProvider) ───────────────────────

function FamilyTreeFlowInner({
  worldId,
  countries: propCountries,
  settlements: propSettlements,
}: FamilyTreeFlowProps) {
  const { fitView, setCenter } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const [scope, setScope] = useState<GenealogyScope>('settlement');
  const [allChars, setAllChars] = useState<Character[]>([]);
  const [countries, setCountries] = useState<any[]>(propCountries ?? []);
  const [settlements, setSettlements] = useState<any[]>(propSettlements ?? []);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedSettlement, setSelectedSettlement] = useState<string | null>(null);
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [truncated, setTruncated] = useState(false);

  // ── Data fetch ──────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      if (!propCountries) {
        const r = await fetch(`/api/worlds/${worldId}/countries`);
        if (r.ok) setCountries(await r.json());
      }
      if (!propSettlements) {
        const r = await fetch(`/api/worlds/${worldId}/settlements`);
        if (r.ok) {
          const data = await r.json();
          setSettlements(data);
          if (data.length > 0) setSelectedSettlement(data[0].id);
        }
      } else if ((propSettlements?.length ?? 0) > 0) {
        setSelectedSettlement(propSettlements![0].id);
      }
      const r = await fetch(`/api/worlds/${worldId}/characters`);
      if (r.ok) setAllChars(await r.json());
    })();
  }, [worldId]);

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filteredChars = useMemo(() => {
    let result = allChars;
    if (scope === 'country' && selectedCountry) {
      result = result.filter(c => c.countryId === selectedCountry);
    } else if (scope === 'settlement' && selectedSettlement) {
      result = result.filter(c => c.settlementId === selectedSettlement);
    }
    if (result.length > MAX_CHARS) {
      setTruncated(true);
      return result.slice(0, MAX_CHARS);
    }
    setTruncated(false);
    return result;
  }, [allChars, scope, selectedCountry, selectedSettlement]);

  const selectedId = selectedChar?.id ?? null;

  // ── Rebuild graph when filtered set changes ──────────────────────────────────
  useEffect(() => {
    const { nodes: raw, edges: rawEdges } = buildGraph(filteredChars, selectedId);
    const laid = layoutNodes(raw, rawEdges);
    setNodes(laid);
    setEdges(rawEdges);
    setTimeout(() => fitView({ padding: 0.15, duration: 350 }), 80);
  }, [filteredChars]);

  // ── Update selection highlight without relayouting ───────────────────────────
  useEffect(() => {
    setNodes(nds =>
      nds.map(n => ({ ...n, data: { ...n.data, isSelected: n.id === selectedId } }))
    );
  }, [selectedId]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      const c = allChars.find(ch => ch.id === node.id) ?? null;
      setSelectedChar(prev => (prev?.id === c?.id ? null : c));
    },
    [allChars]
  );

  const focusChar = useCallback(
    (c: Character) => {
      setSelectedChar(c);
      const node = nodes.find(n => n.id === c.id);
      if (node) {
        setCenter(
          node.position.x + NODE_W / 2,
          node.position.y + NODE_H / 2,
          { zoom: 1.4, duration: 500 }
        );
      }
    },
    [nodes, setCenter]
  );

  const centerSelected = useCallback(() => {
    if (!selectedChar) return;
    const node = nodes.find(n => n.id === selectedChar.id);
    if (node) {
      setCenter(
        node.position.x + NODE_W / 2,
        node.position.y + NODE_H / 2,
        { zoom: 1.6, duration: 400 }
      );
    }
  }, [selectedChar, nodes, setCenter]);

  const scopeLabel =
    scope === 'world'
      ? 'World'
      : scope === 'country'
      ? (countries.find(c => c.id === selectedCountry)?.name ?? 'Country')
      : (settlements.find(s => s.id === selectedSettlement)?.name ?? 'Settlement');

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex gap-3" style={{ height: 700 }}>
      {/* Flow canvas */}
      <div className="flex-1 rounded-xl overflow-hidden border border-border">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.05}
          maxZoom={3}
          proOptions={{ hideAttribution: false }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e5e7eb" />
          <Controls />
          <MiniMap
            nodeColor={n => {
              const c = (n.data as FamilyNodeData | undefined)?.char;
              if (!c) return '#cbd5e1';
              if (c.isAlive === false) return '#6b7280';
              return c.gender === 'male' ? '#3b82f6' : '#ec4899';
            }}
            pannable
            zoomable
            className="rounded-lg"
          />

          {/* ── Scope / controls panel ── */}
          <Panel position="top-left">
            <div className="bg-background border border-border rounded-xl p-3 shadow-md flex flex-col gap-2.5" style={{ minWidth: 214 }}>
              <div>
                <p className="text-sm font-semibold">Family Tree</p>
                <p className="text-xs text-muted-foreground">
                  {filteredChars.length} characters
                  {truncated && ' (capped at 250)'}
                  {' — '}{scopeLabel}
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Scope</Label>
                <Select value={scope} onValueChange={v => setScope(v as GenealogyScope)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="world">
                      <span className="flex items-center gap-1.5">
                        <Globe className="w-3 h-3" /> World
                      </span>
                    </SelectItem>
                    <SelectItem value="country" disabled={countries.length === 0}>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3" /> Country
                      </span>
                    </SelectItem>
                    <SelectItem value="settlement" disabled={settlements.length === 0}>
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3 h-3" /> Settlement
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {scope === 'country' && countries.length > 0 && (
                <div className="space-y-1">
                  <Label className="text-xs">Country</Label>
                  <Select value={selectedCountry ?? ''} onValueChange={setSelectedCountry}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Choose…" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {scope === 'settlement' && settlements.length > 0 && (
                <div className="space-y-1">
                  <Label className="text-xs">Settlement</Label>
                  <Select value={selectedSettlement ?? ''} onValueChange={setSelectedSettlement}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Choose…" />
                    </SelectTrigger>
                    <SelectContent>
                      {settlements.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} ({s.settlementType})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Legend */}
              <div className="border-t border-border pt-2 space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Legend
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {[
                    { color: '#3b82f6', label: '♂ Alive' },
                    { color: '#ec4899', label: '♀ Alive' },
                    { color: '#6b7280', label: '† Deceased' },
                  ].map(({ color, label }) => (
                    <span key={label} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <span style={{ width: 10, height: 10, background: color, borderRadius: 2, display: 'inline-block' }} />
                      {label}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <span style={{ display: 'inline-block', width: 20, height: 0, borderTop: '2px solid #9ca3af' }} />
                    Parent/Child
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <span style={{ display: 'inline-block', width: 20, height: 0, borderTop: '2px dashed #f472b6' }} />
                    Spouse
                  </span>
                </div>
              </div>
            </div>
          </Panel>

          {filteredChars.length === 0 && (
            <Panel position="top-center">
              <div className="bg-background border border-border rounded-xl px-8 py-5 text-sm text-muted-foreground mt-20 shadow-md text-center">
                No characters found. Try a different scope or generate more characters.
              </div>
            </Panel>
          )}
        </ReactFlow>
      </div>

      {/* ── Character detail panel ── */}
      {selectedChar && (
        <Card className="w-64 flex-shrink-0 flex flex-col overflow-hidden">
          <CardHeader className="pb-2 flex-shrink-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <CardTitle className="text-base leading-tight">
                  {selectedChar.firstName} {selectedChar.lastName}
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  {selectedChar.gender === 'male' ? '♂ Male' : '♀ Female'}
                  {selectedChar.socialAttributes?.generation != null &&
                    ` · Gen ${selectedChar.socialAttributes.generation}`}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 flex-shrink-0 -mt-1 -mr-1"
                onClick={() => setSelectedChar(null)}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              <Badge
                variant={selectedChar.isAlive !== false ? 'default' : 'secondary'}
                className="text-xs"
              >
                {selectedChar.isAlive !== false ? 'Alive' : 'Deceased'}
              </Badge>
              {selectedChar.occupation && (
                <Badge variant="outline" className="text-xs">
                  {selectedChar.occupation}
                </Badge>
              )}
            </div>
          </CardHeader>

          <ScrollArea className="flex-1">
            <CardContent className="text-sm space-y-3 pt-0 pb-4">
              {selectedChar.birthYear != null && (
                <div>
                  <span className="text-muted-foreground">Born: </span>
                  {selectedChar.birthYear}
                </div>
              )}

              {selectedChar.spouseId &&
                (() => {
                  const sp = allChars.find(c => c.id === selectedChar.spouseId);
                  return sp ? (
                    <div>
                      <span className="text-muted-foreground">Spouse: </span>
                      <button
                        className="text-primary font-medium hover:underline"
                        onClick={() => focusChar(sp)}
                      >
                        {sp.firstName} {sp.lastName}
                      </button>
                    </div>
                  ) : null;
                })()}

              {(selectedChar.parentIds?.length ?? 0) > 0 && (
                <div>
                  <p className="text-muted-foreground mb-1">Parents</p>
                  <div className="space-y-0.5 pl-1">
                    {selectedChar.parentIds!.map(pid => {
                      const p = allChars.find(c => c.id === pid);
                      return p ? (
                        <button
                          key={pid}
                          className="block text-primary font-medium hover:underline text-left"
                          onClick={() => focusChar(p)}
                        >
                          {p.firstName} {p.lastName}
                        </button>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {(selectedChar.childIds?.length ?? 0) > 0 && (
                <div>
                  <p className="text-muted-foreground mb-1">
                    Children ({selectedChar.childIds!.length})
                  </p>
                  <div className="space-y-0.5 pl-1">
                    {selectedChar.childIds!.slice(0, 8).map(cid => {
                      const ch = allChars.find(c => c.id === cid);
                      return ch ? (
                        <button
                          key={cid}
                          className="block text-primary font-medium hover:underline text-left"
                          onClick={() => focusChar(ch)}
                        >
                          {ch.firstName} {ch.lastName}
                        </button>
                      ) : null;
                    })}
                    {selectedChar.childIds!.length > 8 && (
                      <span className="text-muted-foreground text-xs">
                        +{selectedChar.childIds!.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={centerSelected}
                >
                  Center in Tree
                </Button>
              </div>
            </CardContent>
          </ScrollArea>
        </Card>
      )}
    </div>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────

export function FamilyTreeFlow(props: FamilyTreeFlowProps) {
  return (
    <div className="w-full">
      <ReactFlowProvider>
        <FamilyTreeFlowInner {...props} />
      </ReactFlowProvider>
    </div>
  );
}
