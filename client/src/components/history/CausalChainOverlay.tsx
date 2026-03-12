/**
 * CausalChainOverlay
 *
 * Renders SVG arrows between causally related truth cards that are both visible
 * in the current list view. Meant to be layered on top of the truth card list
 * with position: absolute so the arrows float over the cards.
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';

interface Truth {
  id: string;
  causesTruthIds: string[] | null;
  causedByTruthIds: string[] | null;
  entryType: string;
}

interface CausalChainOverlayProps {
  /** All truths currently visible in the list */
  truths: Truth[];
  /** The container element whose children hold [data-truth-id] attributes */
  containerRef: React.RefObject<HTMLElement | null>;
}

/** Arrow color based on the *cause* truth's entry type */
function arrowColor(entryType: string): string {
  switch (entryType) {
    case 'event':       return '#6366f1'; // indigo
    case 'backstory':   return '#8b5cf6'; // violet
    case 'relationship':return '#ec4899'; // pink
    case 'achievement': return '#f59e0b'; // amber
    case 'milestone':   return '#10b981'; // emerald
    case 'prophecy':    return '#06b6d4'; // cyan
    case 'plan':        return '#64748b'; // slate
    default:            return '#94a3b8'; // gray
  }
}

interface Edge {
  fromId: string;
  toId: string;
  color: string;
}

export function CausalChainOverlay({ truths, containerRef }: CausalChainOverlayProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [edges, setEdges] = useState<{ x1: number; y1: number; x2: number; y2: number; color: string; key: string }[]>([]);

  const truthMap = React.useMemo(() => {
    const m = new Map<string, Truth>();
    for (const t of truths) m.set(t.id, t);
    return m;
  }, [truths]);

  // Build list of causal edges whose both endpoints are visible
  const causalEdges: Edge[] = React.useMemo(() => {
    const result: Edge[] = [];
    const visibleIds = new Set(truths.map(t => t.id));
    for (const truth of truths) {
      for (const effectId of truth.causesTruthIds ?? []) {
        if (visibleIds.has(effectId)) {
          result.push({ fromId: truth.id, toId: effectId, color: arrowColor(truth.entryType) });
        }
      }
    }
    return result;
  }, [truths]);

  const recalc = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const newEdges: typeof edges = [];

    for (const edge of causalEdges) {
      const fromEl = container.querySelector(`[data-truth-id="${edge.fromId}"]`);
      const toEl = container.querySelector(`[data-truth-id="${edge.toId}"]`);
      if (!fromEl || !toEl) continue;

      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();

      // Arrow exits from the right-center of the cause card, enters left-center of effect card
      const x1 = fromRect.right - containerRect.left;
      const y1 = fromRect.top + fromRect.height / 2 - containerRect.top;
      const x2 = toRect.left - containerRect.left;
      const y2 = toRect.top + toRect.height / 2 - containerRect.top;

      newEdges.push({ x1, y1, x2, y2, color: edge.color, key: `${edge.fromId}->${edge.toId}` });
    }

    setEdges(newEdges);
  }, [causalEdges, containerRef]);

  // Recalculate positions on render and when truths change
  useEffect(() => {
    recalc();
    // Also recalc after a short delay to account for layout shifts
    const timer = setTimeout(recalc, 200);
    return () => clearTimeout(timer);
  }, [recalc]);

  // Observe resize / scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(recalc);
    observer.observe(container);

    // Scroll inside a ScrollArea
    const scrollEl = container.closest('[data-radix-scroll-area-viewport]') ?? container;
    scrollEl.addEventListener('scroll', recalc, { passive: true });

    return () => {
      observer.disconnect();
      scrollEl.removeEventListener('scroll', recalc);
    };
  }, [containerRef, recalc]);

  if (edges.length === 0) return null;

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {edges.map(e => (
          <marker
            key={`marker-${e.key}`}
            id={`arrow-${e.key}`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 Z" fill={e.color} />
          </marker>
        ))}
      </defs>
      {edges.map(e => {
        // Cubic bezier for a nice curve
        const dx = e.x2 - e.x1;
        const cp = Math.max(40, Math.abs(dx) * 0.4);
        const path = `M ${e.x1} ${e.y1} C ${e.x1 + cp} ${e.y1}, ${e.x2 - cp} ${e.y2}, ${e.x2} ${e.y2}`;
        return (
          <path
            key={e.key}
            d={path}
            fill="none"
            stroke={e.color}
            strokeWidth={2}
            strokeOpacity={0.6}
            markerEnd={`url(#arrow-${e.key})`}
          />
        );
      })}
    </svg>
  );
}
