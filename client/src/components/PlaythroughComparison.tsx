import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import {
  GitCompareArrows, Clock, Activity, BarChart3, CheckCircle2, XCircle,
  Loader2,
} from 'lucide-react';

interface Playthrough {
  id: string;
  userId: string;
  worldId: string;
  name?: string;
  status: string;
  currentTimestep?: number;
  playtime?: number;
  actionsCount?: number;
  decisionsCount?: number;
  createdAt: string;
  lastPlayedAt?: string;
  completedAt?: string;
}

interface TraceStats {
  totalTraces: number;
  actionTypeCounts: Record<string, number>;
  outcomeCounts: Record<string, number>;
  avgDurationMs: number;
}

interface ComparisonEntry {
  playthrough: Playthrough;
  traceStats: TraceStats;
}

interface PlaythroughComparisonProps {
  worldId: string;
  playthroughs: Playthrough[];
}

export function PlaythroughComparison({ worldId, playthroughs }: PlaythroughComparisonProps) {
  const { token } = useAuth();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [comparisonData, setComparisonData] = useState<ComparisonEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const runComparison = async () => {
    if (selectedIds.size < 2) return;
    setLoading(true);
    setError(null);
    try {
      const ids = Array.from(selectedIds).join(',');
      const res = await fetch(`/api/worlds/${worldId}/analytics/compare?ids=${ids}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const msg = await res.json().catch(() => ({ message: 'Comparison failed' }));
        throw new Error(msg.message);
      }
      setComparisonData(await res.json());
    } catch (err: any) {
      setError(err.message || 'Failed to compare playthroughs');
    } finally {
      setLoading(false);
    }
  };

  // Collect all unique action types across compared playthroughs
  const allActionTypes = useMemo(() => {
    if (!comparisonData) return [];
    const types = new Set<string>();
    comparisonData.forEach(e => Object.keys(e.traceStats.actionTypeCounts).forEach(t => types.add(t)));
    return Array.from(types).sort();
  }, [comparisonData]);

  const allOutcomes = useMemo(() => {
    if (!comparisonData) return [];
    const outcomes = new Set<string>();
    comparisonData.forEach(e => Object.keys(e.traceStats.outcomeCounts).forEach(o => outcomes.add(o)));
    return Array.from(outcomes).sort();
  }, [comparisonData]);

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // ─── Selection phase ──────────────────────────────────────────────────
  if (!comparisonData) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitCompareArrows className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Compare Playthroughs</h3>
            <Badge variant="secondary" className="text-[10px]">
              {selectedIds.size} selected
            </Badge>
          </div>
          <button
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={selectedIds.size < 2 || loading}
            onClick={runComparison}
          >
            {loading ? (
              <span className="flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Comparing...
              </span>
            ) : (
              'Compare Selected'
            )}
          </button>
        </div>

        {error && (
          <div className="text-xs text-destructive bg-destructive/10 rounded p-2">{error}</div>
        )}

        {playthroughs.length === 0 && (
          <p className="text-xs text-muted-foreground">No playthroughs available to compare.</p>
        )}

        <div className="grid gap-2">
          {playthroughs.map(p => {
            const isSelected = selectedIds.has(p.id);
            return (
              <button
                key={p.id}
                className={`w-full text-left rounded-lg p-3 border transition-colors ${
                  isSelected ? 'border-primary bg-primary/5' : 'border-border bg-muted/30 hover:bg-muted/50'
                }`}
                onClick={() => toggleSelection(p.id)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                      isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/40'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <span className="text-sm font-medium">{p.name || 'Unnamed Playthrough'}</span>
                  </div>
                  <Badge variant={p.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                    {p.status}
                  </Badge>
                </div>
                <div className="flex gap-4 mt-1 ml-6 text-xs text-muted-foreground">
                  <span>{p.actionsCount || 0} actions</span>
                  <span>{formatDuration(p.playtime)}</span>
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-[10px] text-muted-foreground">
          Select 2–10 playthroughs then click Compare to view side-by-side analysis.
        </p>
      </div>
    );
  }

  // ─── Comparison results ───────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCompareArrows className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Comparison Results</h3>
          <Badge variant="secondary" className="text-[10px]">
            {comparisonData.length} playthroughs
          </Badge>
        </div>
        <button
          className="px-3 py-1.5 text-xs font-medium rounded-md border hover:bg-muted/50 transition-colors"
          onClick={() => { setComparisonData(null); setSelectedIds(new Set()); }}
        >
          New Comparison
        </button>
      </div>

      {/* Overview metrics table */}
      <div className="border rounded-lg overflow-hidden">
        <ScrollArea className="w-full">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-3 py-2 font-semibold text-muted-foreground sticky left-0 bg-muted/30 min-w-[140px]">Metric</th>
                {comparisonData.map(e => (
                  <th key={e.playthrough.id} className="text-right px-3 py-2 font-semibold min-w-[120px]">
                    {e.playthrough.name || `Player ${e.playthrough.userId.substring(0, 8)}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <MetricRow label="Status" values={comparisonData.map(e => e.playthrough.status)} />
              <MetricRow label="Actions" values={comparisonData.map(e => (e.playthrough.actionsCount || 0).toLocaleString())} />
              <MetricRow label="Decisions" values={comparisonData.map(e => (e.playthrough.decisionsCount || 0).toLocaleString())} />
              <MetricRow label="Playtime" values={comparisonData.map(e => formatDuration(e.playthrough.playtime))} />
              <MetricRow label="Timestep" values={comparisonData.map(e => String(e.playthrough.currentTimestep ?? 0))} />
              <MetricRow label="Traced Actions" values={comparisonData.map(e => e.traceStats.totalTraces.toLocaleString())} />
              <MetricRow label="Avg Action (ms)" values={comparisonData.map(e => e.traceStats.avgDurationMs.toLocaleString())} />
            </tbody>
          </table>
        </ScrollArea>
      </div>

      {/* Action type breakdown */}
      {allActionTypes.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="px-3 py-2 border-b bg-muted/30 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action Types</span>
          </div>
          <ScrollArea className="w-full">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/10">
                  <th className="text-left px-3 py-1.5 font-medium text-muted-foreground sticky left-0 bg-muted/10 min-w-[140px]">Type</th>
                  {comparisonData.map(e => (
                    <th key={e.playthrough.id} className="text-right px-3 py-1.5 font-medium min-w-[120px]">
                      {e.playthrough.name || `Player ${e.playthrough.userId.substring(0, 8)}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allActionTypes.map(type => (
                  <tr key={type} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-3 py-1.5 font-medium capitalize sticky left-0 bg-background">{type.replace(/_/g, ' ')}</td>
                    {comparisonData.map(e => (
                      <td key={e.playthrough.id} className="text-right px-3 py-1.5 tabular-nums">
                        {e.traceStats.actionTypeCounts[type] || 0}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </div>
      )}

      {/* Outcome breakdown */}
      {allOutcomes.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="px-3 py-2 border-b bg-muted/30 flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Outcomes</span>
          </div>
          <ScrollArea className="w-full">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/10">
                  <th className="text-left px-3 py-1.5 font-medium text-muted-foreground sticky left-0 bg-muted/10 min-w-[140px]">Outcome</th>
                  {comparisonData.map(e => (
                    <th key={e.playthrough.id} className="text-right px-3 py-1.5 font-medium min-w-[120px]">
                      {e.playthrough.name || `Player ${e.playthrough.userId.substring(0, 8)}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allOutcomes.map(outcome => (
                  <tr key={outcome} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-3 py-1.5 font-medium capitalize sticky left-0 bg-background">{outcome}</td>
                    {comparisonData.map(e => (
                      <td key={e.playthrough.id} className="text-right px-3 py-1.5 tabular-nums">
                        {e.traceStats.outcomeCounts[outcome] || 0}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </div>
      )}

      {allActionTypes.length === 0 && allOutcomes.length === 0 && (
        <div className="text-center py-6 text-xs text-muted-foreground">
          No trace data recorded for the selected playthroughs yet. Play the game to generate action traces.
        </div>
      )}
    </div>
  );
}

function MetricRow({ label, values }: { label: string; values: string[] }) {
  return (
    <tr className="border-b last:border-0 hover:bg-muted/20">
      <td className="px-3 py-1.5 font-medium text-muted-foreground sticky left-0 bg-background">{label}</td>
      {values.map((v, i) => (
        <td key={i} className="text-right px-3 py-1.5 tabular-nums">{v}</td>
      ))}
    </tr>
  );
}
