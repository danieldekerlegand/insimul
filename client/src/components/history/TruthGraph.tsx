/**
 * TruthGraph
 *
 * Force-directed node graph of truth-to-truth causal chains.
 * Pure React + SVG, no external graph library.
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/card';

interface Truth {
  id: string;
  title: string;
  content: string;
  entryType: string;
  importance: number | null;
  historicalSignificance?: string | null;
  causesTruthIds: string[] | null;
  causedByTruthIds: string[] | null;
  timestep: number;
}

export interface TruthGraphProps {
  truths: Truth[];
  onTruthSelect?: (truthId: string) => void;
  selectedTruthId?: string;
}

// ------------------------------------------------------------------
// Color by historicalSignificance
// ------------------------------------------------------------------
function significanceColor(sig?: string | null): string {
  switch (sig) {
    case 'world':       return '#ef4444'; // red
    case 'country':     return '#3b82f6'; // blue
    case 'settlement':  return '#22c55e'; // green
    case 'family':      return '#f97316'; // orange
    case 'personal':    return '#9ca3af'; // gray
    default:            return '#a78bfa'; // violet fallback
  }
}

// ------------------------------------------------------------------
// Node / Edge types for the simulation
// ------------------------------------------------------------------
interface GNode {
  id: string;
  truth: Truth;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

interface GEdge {
  source: string;
  target: string;
}

// ------------------------------------------------------------------
// Force simulation helpers
// ------------------------------------------------------------------
const REPULSION = 4000;
const SPRING_K = 0.005;
const SPRING_REST = 120;
const DAMPING = 0.85;
const CENTER_PULL = 0.002;
const DT = 1;

function tick(nodes: GNode[], edges: GEdge[], width: number, height: number) {
  const nodeMap = new Map<string, GNode>();
  for (const n of nodes) nodeMap.set(n.id, n);

  // Repulsion between every pair
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      let dx = a.x - b.x;
      let dy = a.y - b.y;
      let dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = REPULSION / (dist * dist);
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      a.vx += fx * DT;
      a.vy += fy * DT;
      b.vx -= fx * DT;
      b.vy -= fy * DT;
    }
  }

  // Spring attraction along edges
  for (const e of edges) {
    const s = nodeMap.get(e.source);
    const t = nodeMap.get(e.target);
    if (!s || !t) continue;
    let dx = t.x - s.x;
    let dy = t.y - s.y;
    let dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const displacement = dist - SPRING_REST;
    const force = SPRING_K * displacement;
    const fx = (dx / dist) * force;
    const fy = (dy / dist) * force;
    s.vx += fx * DT;
    s.vy += fy * DT;
    t.vx -= fx * DT;
    t.vy -= fy * DT;
  }

  // Center pull
  const cx = width / 2;
  const cy = height / 2;
  for (const n of nodes) {
    n.vx += (cx - n.x) * CENTER_PULL;
    n.vy += (cy - n.y) * CENTER_PULL;
  }

  // Integrate
  for (const n of nodes) {
    n.vx *= DAMPING;
    n.vy *= DAMPING;
    n.x += n.vx * DT;
    n.y += n.vy * DT;
    // Keep in bounds (with padding)
    const pad = n.radius + 4;
    n.x = Math.max(pad, Math.min(width - pad, n.x));
    n.y = Math.max(pad, Math.min(height - pad, n.y));
  }
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------
export function TruthGraph({ truths, onTruthSelect, selectedTruthId }: TruthGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 800, height: 500 });
  const [nodes, setNodes] = useState<GNode[]>([]);
  const [edges, setEdges] = useState<GEdge[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Pan & zoom state
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 800, h: 500 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragNodeId, setDragNodeId] = useState<string | null>(null);
  const panStart = useRef({ mx: 0, my: 0, vx: 0, vy: 0 });

  // Simulation running flag
  const simRunning = useRef(true);
  const nodesRef = useRef<GNode[]>([]);
  const edgesRef = useRef<GEdge[]>([]);

  // Measure container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDims({ width, height });
        }
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Initialize nodes/edges when truths change
  useEffect(() => {
    const truthIds = new Set(truths.map(t => t.id));

    const newNodes: GNode[] = truths.map((t, i) => {
      const imp = t.importance ?? 5;
      const radius = 8 + (imp / 10) * 16; // 8..24
      // Spread initial positions in a circle
      const angle = (i / truths.length) * Math.PI * 2;
      const spread = Math.min(dims.width, dims.height) * 0.35;
      return {
        id: t.id,
        truth: t,
        x: dims.width / 2 + Math.cos(angle) * spread + (Math.random() - 0.5) * 40,
        y: dims.height / 2 + Math.sin(angle) * spread + (Math.random() - 0.5) * 40,
        vx: 0,
        vy: 0,
        radius,
        color: significanceColor((t as any).historicalSignificance),
      };
    });

    const newEdges: GEdge[] = [];
    for (const t of truths) {
      for (const effectId of t.causesTruthIds ?? []) {
        if (truthIds.has(effectId)) {
          newEdges.push({ source: t.id, target: effectId });
        }
      }
    }

    nodesRef.current = newNodes;
    edgesRef.current = newEdges;
    setNodes([...newNodes]);
    setEdges(newEdges);
    setViewBox({ x: 0, y: 0, w: dims.width, h: dims.height });
  }, [truths, dims.width, dims.height]);

  // Run simulation loop
  useEffect(() => {
    simRunning.current = true;
    let frameId: number;
    let iterCount = 0;
    const maxIters = 300;

    const loop = () => {
      if (!simRunning.current) return;
      if (iterCount < maxIters) {
        tick(nodesRef.current, edgesRef.current, dims.width, dims.height);
        iterCount++;
        setNodes([...nodesRef.current]);
      }
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);

    return () => {
      simRunning.current = false;
      cancelAnimationFrame(frameId);
    };
  }, [dims.width, dims.height, truths]);

  // Build lookup for quick access
  const nodeMap = useMemo(() => {
    const m = new Map<string, GNode>();
    for (const n of nodes) m.set(n.id, n);
    return m;
  }, [nodes]);

  // --- Interaction handlers ---

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const scaleFactor = e.deltaY > 0 ? 1.1 : 0.9;
    setViewBox(vb => {
      const newW = vb.w * scaleFactor;
      const newH = vb.h * scaleFactor;
      // Zoom toward center of current viewBox
      const newX = vb.x + (vb.w - newW) / 2;
      const newY = vb.y + (vb.h - newH) / 2;
      return { x: newX, y: newY, w: newW, h: newH };
    });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only pan on background (not on nodes)
    if ((e.target as SVGElement).tagName === 'svg' || (e.target as SVGElement).tagName === 'rect') {
      setIsPanning(true);
      panStart.current = { mx: e.clientX, my: e.clientY, vx: viewBox.x, vy: viewBox.y };
    }
  }, [viewBox]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragNodeId) {
      // Move the dragged node
      const svg = containerRef.current?.querySelector('svg');
      if (!svg) return;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const ctm = svg.getScreenCTM()?.inverse();
      if (!ctm) return;
      const svgPt = pt.matrixTransform(ctm);
      const node = nodesRef.current.find(n => n.id === dragNodeId);
      if (node) {
        node.x = svgPt.x;
        node.y = svgPt.y;
        node.vx = 0;
        node.vy = 0;
        setNodes([...nodesRef.current]);
      }
      return;
    }

    if (!isPanning) return;
    const dx = e.clientX - panStart.current.mx;
    const dy = e.clientY - panStart.current.my;
    // Scale mouse pixels to viewBox coords
    const svgEl = containerRef.current?.querySelector('svg');
    if (!svgEl) return;
    const rect = svgEl.getBoundingClientRect();
    const scaleX = viewBox.w / rect.width;
    const scaleY = viewBox.h / rect.height;
    setViewBox(vb => ({
      ...vb,
      x: panStart.current.vx - dx * scaleX,
      y: panStart.current.vy - dy * scaleY,
    }));
  }, [isPanning, dragNodeId, viewBox.w, viewBox.h]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setDragNodeId(null);
  }, []);

  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setDragNodeId(nodeId);
  }, []);

  const handleNodeClick = useCallback((e: React.MouseEvent, nodeId: string) => {
    // Only fire click if we weren't dragging
    if (!dragNodeId) {
      onTruthSelect?.(nodeId);
    }
  }, [dragNodeId, onTruthSelect]);

  // Highlighted edges for selected/hovered node
  const highlightIds = useMemo(() => {
    const activeId = hoveredId ?? selectedTruthId;
    if (!activeId) return new Set<string>();
    const ids = new Set<string>();
    ids.add(activeId);
    for (const e of edges) {
      if (e.source === activeId) ids.add(e.target);
      if (e.target === activeId) ids.add(e.source);
    }
    return ids;
  }, [hoveredId, selectedTruthId, edges]);

  const hasHighlight = highlightIds.size > 0;

  // Detail tooltip for hovered node
  const hoveredNode = hoveredId ? nodeMap.get(hoveredId) : null;

  return (
    <div ref={containerRef} className="relative w-full h-[500px] rounded-xl overflow-hidden bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10">
      <svg
        width="100%"
        height="100%"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isPanning ? 'grabbing' : dragNodeId ? 'grabbing' : 'grab' }}
      >
        {/* Background for pan events */}
        <rect x={viewBox.x} y={viewBox.y} width={viewBox.w} height={viewBox.h} fill="transparent" />

        <defs>
          <marker
            id="graph-arrow"
            viewBox="0 0 10 10"
            refX="10"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 Z" fill="#94a3b8" fillOpacity={0.7} />
          </marker>
          <marker
            id="graph-arrow-hl"
            viewBox="0 0 10 10"
            refX="10"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 Z" fill="#6366f1" />
          </marker>
        </defs>

        {/* Edges */}
        {edges.map(e => {
          const s = nodeMap.get(e.source);
          const t = nodeMap.get(e.target);
          if (!s || !t) return null;

          const isHl = hasHighlight && (highlightIds.has(e.source) || highlightIds.has(e.target));
          const dimmed = hasHighlight && !isHl;

          // Shorten line so it doesn't overlap the node circle
          const dx = t.x - s.x;
          const dy = t.y - s.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const ux = dx / dist;
          const uy = dy / dist;
          const x1 = s.x + ux * s.radius;
          const y1 = s.y + uy * s.radius;
          const x2 = t.x - ux * (t.radius + 6);
          const y2 = t.y - uy * (t.radius + 6);

          return (
            <line
              key={`${e.source}-${e.target}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isHl ? '#6366f1' : '#94a3b8'}
              strokeWidth={isHl ? 2.5 : 1.5}
              strokeOpacity={dimmed ? 0.15 : isHl ? 0.9 : 0.4}
              markerEnd={isHl ? 'url(#graph-arrow-hl)' : 'url(#graph-arrow)'}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map(n => {
          const isSelected = n.id === selectedTruthId;
          const isHovered = n.id === hoveredId;
          const dimmed = hasHighlight && !highlightIds.has(n.id);

          return (
            <g
              key={n.id}
              transform={`translate(${n.x},${n.y})`}
              onMouseDown={e => handleNodeMouseDown(e, n.id)}
              onClick={e => handleNodeClick(e, n.id)}
              onMouseEnter={() => setHoveredId(n.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Selection ring */}
              {isSelected && (
                <circle r={n.radius + 4} fill="none" stroke="#6366f1" strokeWidth={2} strokeDasharray="4 2" />
              )}
              <circle
                r={n.radius}
                fill={n.color}
                fillOpacity={dimmed ? 0.2 : isHovered ? 1 : 0.8}
                stroke={isHovered ? '#fff' : 'rgba(255,255,255,0.3)'}
                strokeWidth={isHovered ? 2 : 1}
              />
              {/* Label (only if node is large enough or hovered/selected) */}
              {(n.radius >= 14 || isHovered || isSelected) && (
                <text
                  y={n.radius + 12}
                  textAnchor="middle"
                  fill="currentColor"
                  fontSize={10}
                  fontWeight={isSelected ? 600 : 400}
                  opacity={dimmed ? 0.3 : 0.85}
                  pointerEvents="none"
                  className="select-none"
                >
                  {n.truth.title.length > 24 ? n.truth.title.slice(0, 22) + '...' : n.truth.title}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredNode && (
        <div
          className="absolute pointer-events-none z-20 max-w-[240px] px-3 py-2 rounded-lg bg-popover border border-border shadow-lg text-xs"
          style={{
            left: Math.min(
              dims.width - 260,
              Math.max(8, ((hoveredNode.x - viewBox.x) / viewBox.w) * dims.width)
            ),
            top: Math.max(
              8,
              ((hoveredNode.y - viewBox.y) / viewBox.h) * dims.height - 60
            ),
          }}
        >
          <div className="font-semibold text-sm mb-1">{hoveredNode.truth.title}</div>
          <div className="text-muted-foreground line-clamp-2">{hoveredNode.truth.content}</div>
          <div className="flex gap-2 mt-1 text-[10px]">
            <span className="capitalize">{hoveredNode.truth.entryType}</span>
            <span>t={hoveredNode.truth.timestep}</span>
            {hoveredNode.truth.importance != null && <span>imp={hoveredNode.truth.importance}</span>}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-2 left-2 flex gap-3 text-[10px] text-muted-foreground bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 border border-border/50">
        {[
          { label: 'World', color: '#ef4444' },
          { label: 'Country', color: '#3b82f6' },
          { label: 'Settlement', color: '#22c55e' },
          { label: 'Family', color: '#f97316' },
          { label: 'Personal', color: '#9ca3af' },
        ].map(item => (
          <span key={item.label} className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
