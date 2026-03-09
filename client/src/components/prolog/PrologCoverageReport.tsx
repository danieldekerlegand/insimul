/**
 * Prolog Coverage Report
 *
 * Shows which predicates are covered by rules, actions, and quests.
 * Identifies unused predicates and provides a coverage percentage.
 */

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { FileSearch, RefreshCw, CheckCircle, Circle } from 'lucide-react';

interface CoverageData {
  [predName: string]: {
    rules: number;
    actions: number;
    quests: number;
    total: number;
  };
}

interface CoverageSummary {
  totalPredicates: number;
  covered: number;
  uncovered: number;
  coveragePercent: number;
}

interface PrologCoverageReportProps {
  worldId: string;
}

export function PrologCoverageReport({ worldId }: PrologCoverageReportProps) {
  const [coverage, setCoverage] = useState<CoverageData>({});
  const [summary, setSummary] = useState<CoverageSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [showUncovered, setShowUncovered] = useState(false);
  const { toast } = useToast();

  const loadCoverage = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/prolog/tau/coverage/${worldId}`);
      const data = await res.json();
      if (data.status === 'success') {
        setCoverage(data.coverage);
        setSummary(data.summary);
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to load coverage report', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoverage();
  }, [worldId]);

  const sorted = useMemo(() => {
    return Object.entries(coverage)
      .map(([name, data]) => ({ name, ...data }))
      .filter(item => showUncovered ? item.total === 0 : item.total > 0)
      .sort((a, b) => showUncovered ? a.name.localeCompare(b.name) : b.total - a.total);
  }, [coverage, showUncovered]);

  const maxTotal = useMemo(() => Math.max(1, ...Object.values(coverage).map(c => c.total)), [coverage]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileSearch className="w-5 h-5 text-cyan-500" />
        <h3 className="text-sm font-semibold">Coverage Report</h3>
        <Button variant="outline" size="sm" className="ml-auto" onClick={loadCoverage} disabled={loading}>
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Shows which core predicates are referenced by your world's rules, actions, and quests.
      </p>

      {summary && (
        <>
          {/* Coverage summary */}
          <div className="p-3 border rounded-lg bg-muted/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Predicate Coverage</span>
              <Badge
                className={`text-xs ${
                  summary.coveragePercent >= 75 ? 'bg-green-500/10 text-green-600' :
                  summary.coveragePercent >= 50 ? 'bg-amber-500/10 text-amber-600' :
                  'bg-red-500/10 text-red-600'
                }`}
              >
                {summary.coveragePercent}%
              </Badge>
            </div>

            {/* Coverage bar */}
            <div className="h-3 bg-muted rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all ${
                  summary.coveragePercent >= 75 ? 'bg-green-500' :
                  summary.coveragePercent >= 50 ? 'bg-amber-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${summary.coveragePercent}%` }}
              />
            </div>

            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                {summary.covered} covered
              </span>
              <span className="flex items-center gap-1">
                <Circle className="w-3 h-3 text-gray-400" />
                {summary.uncovered} uncovered
              </span>
              <span>{summary.totalPredicates} total</span>
            </div>
          </div>

          {/* Toggle */}
          <div className="flex gap-1 bg-muted/50 rounded-md p-0.5">
            <button
              className={`flex-1 px-2 py-1 rounded text-xs transition-colors ${!showUncovered ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
              onClick={() => setShowUncovered(false)}
            >
              Covered ({summary.covered})
            </button>
            <button
              className={`flex-1 px-2 py-1 rounded text-xs transition-colors ${showUncovered ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
              onClick={() => setShowUncovered(true)}
            >
              Uncovered ({summary.uncovered})
            </button>
          </div>

          {/* Predicate list */}
          <ScrollArea className="h-56 border rounded-lg">
            <div className="p-2 space-y-1">
              {sorted.map(item => (
                <div key={item.name} className="px-2 py-1.5 rounded hover:bg-muted/30">
                  <div className="flex items-center gap-1.5">
                    {item.total > 0 ? (
                      <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />
                    ) : (
                      <Circle className="w-3 h-3 text-gray-400 shrink-0" />
                    )}
                    <span className="text-[11px] font-mono flex-1">{item.name}</span>
                    {item.total > 0 && (
                      <span className="text-[10px] text-muted-foreground">{item.total}</span>
                    )}
                  </div>
                  {item.total > 0 && (
                    <>
                      <div className="ml-5 mt-0.5 h-1 bg-muted/50 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-cyan-500"
                          style={{ width: `${(item.total / maxTotal) * 100}%` }}
                        />
                      </div>
                      <div className="ml-5 flex gap-2 mt-0.5 text-[9px] text-muted-foreground">
                        {item.rules > 0 && <span>Rules: {item.rules}</span>}
                        {item.actions > 0 && <span>Actions: {item.actions}</span>}
                        {item.quests > 0 && <span>Quests: {item.quests}</span>}
                      </div>
                    </>
                  )}
                </div>
              ))}

              {sorted.length === 0 && (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  {showUncovered ? 'All predicates are covered!' : 'No predicates are covered yet.'}
                </div>
              )}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
}
