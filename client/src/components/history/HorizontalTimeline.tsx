import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ZoomIn, ZoomOut, Calendar } from "lucide-react";
import { EventCluster, type ClusteredEvent } from './EventCluster';

export interface Truth {
  id: string;
  title: string;
  content: string;
  entryType: string;
  historicalSignificance: string | null;
  timeYear: number | null;
  timeSeason: string | null;
  importance: number | null;
  timestep: number;
}

export interface TimelineProps {
  truths: Truth[];
  historyStartYear: number;
  currentYear: number;
  onEventClick?: (truthId: string) => void;
}

type ZoomLevel = 'decade' | 'year' | 'month';

const SIGNIFICANCE_COLORS: Record<string, { dot: string; label: string }> = {
  world: { dot: 'bg-red-500', label: 'World' },
  country: { dot: 'bg-blue-500', label: 'Country' },
  settlement: { dot: 'bg-green-500', label: 'Settlement' },
  family: { dot: 'bg-orange-500', label: 'Family' },
  personal: { dot: 'bg-gray-400', label: 'Personal' },
};

const SEASONS = ['spring', 'summer', 'fall', 'winter'] as const;

function getSignificanceDot(sig: string | null): string {
  return SIGNIFICANCE_COLORS[sig ?? '']?.dot ?? 'bg-gray-400';
}

export function HorizontalTimeline({ truths, historyStartYear, currentYear, onEventClick }: TimelineProps) {
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('year');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [viewportLeft, setViewportLeft] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [totalScrollWidth, setTotalScrollWidth] = useState(0);
  const [hoveredEvent, setHoveredEvent] = useState<Truth | null>(null);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null);

  // Derive year range
  const startYear = historyStartYear;
  const endYear = currentYear;
  const totalYears = Math.max(endYear - startYear + 1, 1);

  // Width per unit based on zoom
  const unitWidth = useMemo(() => {
    switch (zoomLevel) {
      case 'decade': return 80;
      case 'year': return 60;
      case 'month': return 200; // 200px per year = ~16px per month
    }
  }, [zoomLevel]);

  const totalWidth = useMemo(() => {
    if (zoomLevel === 'decade') {
      const decades = Math.ceil(totalYears / 10);
      return decades * unitWidth + 100;
    }
    return totalYears * unitWidth + 100;
  }, [totalYears, unitWidth, zoomLevel]);

  // Group truths by year
  const truthsByYear = useMemo(() => {
    const map = new Map<number, Truth[]>();
    for (const t of truths) {
      const year = t.timeYear ?? startYear;
      if (!map.has(year)) map.set(year, []);
      map.get(year)!.push(t);
    }
    return map;
  }, [truths, startYear]);

  // Cluster events: group by year + entryType
  const clusters = useMemo(() => {
    const result: { year: number; entryType: string; events: ClusteredEvent[] }[] = [];
    Array.from(truthsByYear.entries()).forEach(([year, yearTruths]) => {
      const byType = new Map<string, ClusteredEvent[]>();
      for (const t of yearTruths) {
        const key = t.entryType;
        if (!byType.has(key)) byType.set(key, []);
        byType.get(key)!.push({
          id: t.id,
          title: t.title,
          content: t.content,
          entryType: t.entryType,
          historicalSignificance: t.historicalSignificance,
          timeYear: t.timeYear,
          timeSeason: t.timeSeason,
          importance: t.importance,
        });
      }
      Array.from(byType.entries()).forEach(([entryType, events]) => {
        result.push({ year, entryType, events });
      });
    });
    result.sort((a, b) => a.year - b.year);
    return result;
  }, [truthsByYear]);

  // X position for a year
  const yearToX = useCallback((year: number): number => {
    if (zoomLevel === 'decade') {
      const decadeOffset = (year - startYear) / 10;
      return decadeOffset * unitWidth + 50;
    }
    return (year - startYear) * unitWidth + 50;
  }, [zoomLevel, startYear, unitWidth]);

  // Update minimap on scroll
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setViewportLeft(el.scrollLeft);
    setViewportWidth(el.clientWidth);
    setTotalScrollWidth(el.scrollWidth);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    handleScroll();
    el.addEventListener('scroll', handleScroll);
    const ro = new ResizeObserver(handleScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', handleScroll);
      ro.disconnect();
    };
  }, [handleScroll, totalWidth]);

  // Minimap click to navigate
  const handleMinimapClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickRatio = (e.clientX - rect.left) / rect.width;
    const targetScroll = clickRatio * el.scrollWidth - el.clientWidth / 2;
    el.scrollTo({ left: Math.max(0, targetScroll), behavior: 'smooth' });
  }, []);

  // Event dot click handler with popup
  const handleDotClick = useCallback((truth: Truth, e: React.MouseEvent) => {
    e.stopPropagation();
    if (hoveredEvent?.id === truth.id) {
      setHoveredEvent(null);
      setPopupPos(null);
    } else {
      setHoveredEvent(truth);
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setPopupPos({ x: rect.left + rect.width / 2, y: rect.top });
    }
    onEventClick?.(truth.id);
  }, [hoveredEvent, onEventClick]);

  // Generate tick marks
  const ticks = useMemo(() => {
    const result: { x: number; label: string; isMajor: boolean }[] = [];
    if (zoomLevel === 'decade') {
      for (let y = startYear; y <= endYear; y++) {
        if (y % 10 === 0) {
          result.push({ x: yearToX(y), label: `${y}`, isMajor: true });
        }
      }
    } else if (zoomLevel === 'year') {
      for (let y = startYear; y <= endYear; y++) {
        const isMajor = y % 10 === 0;
        result.push({ x: yearToX(y), label: `${y}`, isMajor });
      }
    } else {
      // Month view: show every year with season subdivisions
      for (let y = startYear; y <= endYear; y++) {
        result.push({ x: yearToX(y), label: `${y}`, isMajor: true });
        // Add season ticks
        for (let s = 0; s < 4; s++) {
          const seasonX = yearToX(y) + (s + 0.5) * (unitWidth / 4);
          result.push({ x: seasonX, label: SEASONS[s], isMajor: false });
        }
      }
    }
    return result;
  }, [zoomLevel, startYear, endYear, yearToX, unitWidth]);

  // Events positioned on the timeline
  const positionedEvents = useMemo(() => {
    return truths.map(t => {
      const year = t.timeYear ?? startYear;
      let x = yearToX(year);
      // In month view, offset by season
      if (zoomLevel === 'month' && t.timeSeason) {
        const seasonIdx = SEASONS.indexOf(t.timeSeason as typeof SEASONS[number]);
        if (seasonIdx >= 0) {
          x += (seasonIdx + 0.5) * (unitWidth / 4);
        }
      }
      return { truth: t, x };
    });
  }, [truths, startYear, yearToX, zoomLevel, unitWidth]);

  // Minimap ratios
  const minimapViewportLeft = totalScrollWidth > 0 ? (viewportLeft / totalScrollWidth) * 100 : 0;
  const minimapViewportWidth = totalScrollWidth > 0 ? (viewportWidth / totalScrollWidth) * 100 : 100;

  // Minimap dots (summarized positions)
  const minimapDots = useMemo(() => {
    return positionedEvents.map(pe => ({
      left: totalWidth > 0 ? (pe.x / totalWidth) * 100 : 0,
      color: getSignificanceDot(pe.truth.historicalSignificance),
    }));
  }, [positionedEvents, totalWidth]);

  return (
    <div className="space-y-3">
      {/* Controls bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            variant={zoomLevel === 'decade' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setZoomLevel('decade')}
            className="h-7 text-xs px-2"
          >
            Decades
          </Button>
          <Button
            variant={zoomLevel === 'year' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setZoomLevel('year')}
            className="h-7 text-xs px-2"
          >
            Years
          </Button>
          <Button
            variant={zoomLevel === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setZoomLevel('month')}
            className="h-7 text-xs px-2"
          >
            Months
          </Button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {Object.entries(SIGNIFICANCE_COLORS).map(([key, val]) => (
            <div key={key} className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${val.dot}`} />
              <span>{val.label}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          <span>{startYear} - {endYear}</span>
        </div>
      </div>

      {/* Timeline scroll area */}
      <div
        ref={scrollRef}
        className="overflow-x-auto overflow-y-hidden relative bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-xl"
        style={{ height: 220 }}
      >
        <div style={{ width: totalWidth, height: '100%', position: 'relative' }}>
          {/* Axis line */}
          <div
            className="absolute bg-border dark:bg-white/20"
            style={{ left: 40, right: 10, top: 120, height: 2 }}
          />

          {/* Tick marks */}
          {ticks.map((tick, i) => (
            <div key={`${tick.label}-${i}`} className="absolute" style={{ left: tick.x, top: tick.isMajor ? 100 : 110 }}>
              <div
                className={`w-px ${tick.isMajor ? 'bg-foreground/40 h-5' : 'bg-foreground/20 h-3'}`}
                style={{ marginLeft: -0.5 }}
              />
              <div
                className={`text-center whitespace-nowrap ${tick.isMajor ? 'text-[11px] font-medium mt-1' : 'text-[9px] text-muted-foreground mt-0.5'}`}
                style={{ transform: 'translateX(-50%)' }}
              >
                {tick.isMajor || zoomLevel === 'month' ? tick.label : ''}
              </div>
            </div>
          ))}

          {/* Event dots on the axis */}
          <TooltipProvider delayDuration={200}>
            {positionedEvents.map((pe, idx) => {
              const stacked = positionedEvents.filter(
                (other, oi) => oi < idx && Math.abs(other.x - pe.x) < 12
              ).length;
              const dotY = 112 - (stacked * 14);

              return (
                <Tooltip key={pe.truth.id}>
                  <TooltipTrigger asChild>
                    <button
                      className={`absolute w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 shadow-sm cursor-pointer hover:scale-150 transition-transform ${getSignificanceDot(pe.truth.historicalSignificance)}`}
                      style={{
                        left: pe.x - 6,
                        top: dotY,
                        zIndex: 10 + (pe.truth.importance ?? 5),
                      }}
                      onClick={(e) => handleDotClick(pe.truth, e)}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="space-y-1">
                      <p className="font-semibold text-sm">{pe.truth.title}</p>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px] h-4 px-1">
                          {pe.truth.entryType}
                        </Badge>
                        {pe.truth.historicalSignificance && (
                          <Badge variant="secondary" className="text-[10px] h-4 px-1">
                            {pe.truth.historicalSignificance}
                          </Badge>
                        )}
                        {pe.truth.timeYear && (
                          <span className="text-[10px] text-muted-foreground">
                            {pe.truth.timeYear}{pe.truth.timeSeason ? ` (${pe.truth.timeSeason})` : ''}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-3">{pe.truth.content}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>

          {/* Cluster summaries above the axis */}
          {zoomLevel !== 'month' && (
            <div className="absolute" style={{ left: 0, top: 0, width: totalWidth, height: 95, overflow: 'hidden' }}>
              {clusters.map((cluster, i) => {
                if (cluster.events.length < 2) return null;
                const x = yearToX(cluster.year);
                return (
                  <div
                    key={`cluster-${cluster.year}-${cluster.entryType}-${i}`}
                    className="absolute"
                    style={{ left: x - 10, top: 5 + (i % 4) * 22, width: 200 }}
                  >
                    <EventCluster
                      events={cluster.events}
                      year={cluster.year}
                      entryType={cluster.entryType}
                      onEventClick={onEventClick}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Minimap */}
      <div
        className="relative h-6 bg-white/30 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-md cursor-pointer overflow-hidden"
        onClick={handleMinimapClick}
      >
        {/* Event dot indicators */}
        {minimapDots.map((dot, i) => (
          <div
            key={i}
            className={`absolute w-1 h-2 rounded-sm ${dot.color}`}
            style={{ left: `${dot.left}%`, top: 8, opacity: 0.7 }}
          />
        ))}

        {/* Viewport rectangle */}
        <div
          className="absolute top-0 h-full border-2 border-primary/60 bg-primary/10 rounded-sm transition-all duration-75"
          style={{
            left: `${minimapViewportLeft}%`,
            width: `${Math.max(minimapViewportWidth, 2)}%`,
          }}
        />

        {/* Year labels at edges */}
        <span className="absolute left-1 top-0.5 text-[9px] text-muted-foreground">{startYear}</span>
        <span className="absolute right-1 top-0.5 text-[9px] text-muted-foreground">{endYear}</span>
      </div>
    </div>
  );
}
