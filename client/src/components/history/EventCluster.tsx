import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";

export interface ClusteredEvent {
  id: string;
  title: string;
  content: string;
  entryType: string;
  historicalSignificance: string | null;
  timeYear: number | null;
  timeSeason: string | null;
  importance: number | null;
}

interface EventClusterProps {
  events: ClusteredEvent[];
  year: number;
  entryType: string;
  onEventClick?: (eventId: string) => void;
}

const SIGNIFICANCE_COLORS: Record<string, string> = {
  world: 'bg-red-500',
  country: 'bg-blue-500',
  settlement: 'bg-green-500',
  family: 'bg-orange-500',
  personal: 'bg-gray-400',
};

function significanceColor(sig: string | null): string {
  return SIGNIFICANCE_COLORS[sig ?? ''] ?? 'bg-gray-400';
}

export function EventCluster({ events, year, entryType, onEventClick }: EventClusterProps) {
  const [expanded, setExpanded] = useState(false);

  if (events.length === 1) {
    const ev = events[0];
    return (
      <button
        onClick={() => onEventClick?.(ev.id)}
        className="flex items-center gap-1.5 text-left hover:bg-white/20 dark:hover:bg-white/10 rounded-md px-1.5 py-1 transition-colors w-full"
        title={ev.title}
      >
        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${significanceColor(ev.historicalSignificance)}`} />
        <span className="text-xs truncate max-w-[180px]">{ev.title}</span>
      </button>
    );
  }

  return (
    <div className="w-full">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-left hover:bg-white/20 dark:hover:bg-white/10 rounded-md px-1.5 py-1 transition-colors w-full"
      >
        {expanded ? (
          <ChevronDown className="w-3 h-3 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-3 h-3 shrink-0 text-muted-foreground" />
        )}
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
          {events.length}
        </Badge>
        <span className="text-xs truncate text-muted-foreground">
          {events.length} {entryType}{events.length !== 1 ? 's' : ''} in {year}
        </span>
      </button>

      {expanded && (
        <div className="ml-3 mt-1 space-y-0.5 border-l border-white/20 dark:border-white/10 pl-2">
          {events.map(ev => (
            <button
              key={ev.id}
              onClick={() => onEventClick?.(ev.id)}
              className="flex items-center gap-1.5 text-left hover:bg-white/20 dark:hover:bg-white/10 rounded-md px-1.5 py-0.5 transition-colors w-full"
              title={ev.title}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${significanceColor(ev.historicalSignificance)}`} />
              <span className="text-xs truncate max-w-[160px]">{ev.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
