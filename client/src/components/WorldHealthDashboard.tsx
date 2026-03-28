/**
 * World Health Dashboard
 *
 * Shows at-a-glance validation metrics for a world, including quest
 * completability, NPC coverage, building coverage, and CEFR distribution.
 * Each metric is green/yellow/red based on health status.
 */

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Activity,
  Users,
  Building2,
  BookOpen,
  Link2,
  RefreshCw,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

interface WorldHealthMetrics {
  totalQuests: number;
  completableQuests: number;
  totalNpcs: number;
  npcsWithDialogue: number;
  totalBuildings: number;
  buildingsWithInteriors: number;
  totalTexts: number;
  totalSettlements: number;
  hasMainQuestChain: boolean;
  questChainCount: number;
  cefrDistribution: Record<string, number>;
}

interface ValidationEntry {
  category: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
}

interface ValidationReport {
  canExport: boolean;
  clean: boolean;
  entries: ValidationEntry[];
  summary: {
    errors: number;
    warnings: number;
    infos: number;
  };
  health: WorldHealthMetrics;
  questWorldReport: {
    feasibleCount: number;
    infeasibleCount: number;
    infeasibleQuests: { id: string; title: string }[];
    warnings: string[];
  };
  dependencyGraphReport: {
    valid: boolean;
    issues: { severity: string; message: string }[];
    mermaidDiagram: string;
  };
}

interface WorldHealthDashboardProps {
  worldId: string;
  onExport?: () => void;
}

// ── Health Status ───────────────────────────────────────────────────────────

type HealthStatus = 'green' | 'yellow' | 'red';

function getStatusColor(status: HealthStatus): string {
  switch (status) {
    case 'green': return 'text-green-600 bg-green-50 border-green-200';
    case 'yellow': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'red': return 'text-red-600 bg-red-50 border-red-200';
  }
}

function getStatusIcon(status: HealthStatus) {
  switch (status) {
    case 'green': return <CheckCircle className="w-4 h-4" />;
    case 'yellow': return <AlertTriangle className="w-4 h-4" />;
    case 'red': return <XCircle className="w-4 h-4" />;
  }
}

function questStatus(total: number, completable: number): HealthStatus {
  if (total === 0) return 'red';
  const ratio = completable / total;
  if (ratio >= 0.95) return 'green';
  if (ratio >= 0.75) return 'yellow';
  return 'red';
}

function coverageStatus(total: number, covered: number): HealthStatus {
  if (total === 0) return 'yellow';
  const ratio = covered / total;
  if (ratio >= 0.9) return 'green';
  if (ratio >= 0.5) return 'yellow';
  return 'red';
}

// ── Component ───────────────────────────────────────────────────────────────

export function WorldHealthDashboard({ worldId, onExport }: WorldHealthDashboardProps) {
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);

  const runValidation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/worlds/${worldId}/export/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ engine: 'babylon' }),
      });
      if (!res.ok) throw new Error(`Validation failed: ${res.statusText}`);
      const data = await res.json();
      setReport(data.report);
    } catch (e: any) {
      setError(e.message || 'Validation failed');
    } finally {
      setLoading(false);
    }
  }, [worldId]);

  const toggleMetric = (key: string) => {
    setExpandedMetric(prev => prev === key ? null : key);
  };

  if (!report && !loading) {
    return (
      <div className="border rounded-lg p-4 bg-card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4" /> World Health
          </h3>
          <Button size="sm" variant="outline" onClick={runValidation}>
            <RefreshCw className="w-3 h-3 mr-1" /> Run Validation
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Run validation to check quest completability, NPC coverage, and export readiness.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="border rounded-lg p-4 bg-card">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="w-4 h-4 animate-spin" /> Running validation...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded-lg p-4 bg-card">
        <div className="flex items-center gap-2 text-sm text-red-600">
          <XCircle className="w-4 h-4" /> {error}
        </div>
        <Button size="sm" variant="outline" className="mt-2" onClick={runValidation}>
          Retry
        </Button>
      </div>
    );
  }

  if (!report) return null;

  const h = report.health;
  const qStatus = questStatus(h.totalQuests, h.completableQuests);
  const npcStatus = coverageStatus(h.totalNpcs, h.npcsWithDialogue);
  const buildingStatus = coverageStatus(h.totalBuildings, h.buildingsWithInteriors);
  const chainStatus = h.hasMainQuestChain ? 'green' : 'red' as HealthStatus;
  const hasRedMetrics = [qStatus, chainStatus].includes('red') ||
    (h.totalSettlements === 0) || (h.totalNpcs === 0);

  const metrics: { key: string; label: string; value: string; status: HealthStatus; icon: React.ReactNode; details?: string[] }[] = [
    {
      key: 'quests',
      label: 'Quests',
      value: `${h.completableQuests}/${h.totalQuests} completable`,
      status: qStatus,
      icon: <Activity className="w-4 h-4" />,
      details: report.questWorldReport.infeasibleQuests.map(q => `${q.title} — infeasible`),
    },
    {
      key: 'chain',
      label: 'Quest Chains',
      value: h.hasMainQuestChain ? `${h.questChainCount} chains` : 'No chains found',
      status: chainStatus,
      icon: <Link2 className="w-4 h-4" />,
      details: report.dependencyGraphReport.issues
        .filter(i => i.severity === 'error')
        .map(i => i.message),
    },
    {
      key: 'npcs',
      label: 'NPC Dialogue',
      value: `${h.npcsWithDialogue}/${h.totalNpcs} with dialogue`,
      status: npcStatus,
      icon: <Users className="w-4 h-4" />,
    },
    {
      key: 'buildings',
      label: 'Building Interiors',
      value: `${h.buildingsWithInteriors}/${h.totalBuildings} with interiors`,
      status: buildingStatus,
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      key: 'texts',
      label: 'Documents',
      value: `${h.totalTexts} texts`,
      status: h.totalTexts > 0 ? 'green' : 'yellow',
      icon: <BookOpen className="w-4 h-4" />,
    },
  ];

  return (
    <div className="border rounded-lg bg-card">
      <div className="flex items-center justify-between p-4 pb-2">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Activity className="w-4 h-4" /> World Health
          {report.canExport ? (
            <Badge variant="outline" className="text-green-600 border-green-300 text-xs">Ready</Badge>
          ) : (
            <Badge variant="outline" className="text-red-600 border-red-300 text-xs">Issues Found</Badge>
          )}
        </h3>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={runValidation} disabled={loading}>
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Summary bar */}
      <div className="px-4 pb-2 flex gap-2 text-xs">
        {report.summary.errors > 0 && (
          <span className="text-red-600 flex items-center gap-1">
            <XCircle className="w-3 h-3" /> {report.summary.errors} errors
          </span>
        )}
        {report.summary.warnings > 0 && (
          <span className="text-yellow-600 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> {report.summary.warnings} warnings
          </span>
        )}
        {report.summary.errors === 0 && report.summary.warnings === 0 && (
          <span className="text-green-600 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> All checks passed
          </span>
        )}
      </div>

      {/* Metrics */}
      <div className="px-2 pb-2">
        {metrics.map(m => (
          <div key={m.key} className="mb-1">
            <button
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs border ${getStatusColor(m.status)} hover:opacity-80 transition-opacity`}
              onClick={() => m.details && m.details.length > 0 ? toggleMetric(m.key) : undefined}
            >
              {getStatusIcon(m.status)}
              <span className="flex-1 text-left">
                <span className="font-medium">{m.label}:</span> {m.value}
              </span>
              {m.details && m.details.length > 0 && (
                expandedMetric === m.key
                  ? <ChevronDown className="w-3 h-3" />
                  : <ChevronRight className="w-3 h-3" />
              )}
            </button>
            {expandedMetric === m.key && m.details && m.details.length > 0 && (
              <ScrollArea className="max-h-32 ml-6 mt-1">
                {m.details.map((d, i) => (
                  <div key={i} className="text-xs text-muted-foreground py-0.5 pl-2 border-l">
                    {d}
                  </div>
                ))}
              </ScrollArea>
            )}
          </div>
        ))}
      </div>

      {/* CEFR Distribution */}
      {Object.keys(h.cefrDistribution).length > 0 && (
        <div className="px-4 pb-3">
          <div className="text-xs font-medium mb-1">CEFR Distribution</div>
          <div className="flex gap-1 flex-wrap">
            {Object.entries(h.cefrDistribution)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([level, count]) => (
                <Badge key={level} variant="outline" className="text-xs">
                  {level}: {count}
                </Badge>
              ))}
          </div>
        </div>
      )}

      {/* Export button */}
      {hasRedMetrics && (
        <div className="px-4 pb-3 text-xs text-red-600">
          Fix critical issues before exporting.
        </div>
      )}
      {onExport && (
        <div className="px-4 pb-3">
          <Button
            size="sm"
            className="w-full"
            disabled={hasRedMetrics}
            onClick={onExport}
          >
            {hasRedMetrics ? 'Fix Issues Before Export' : 'Export World'}
          </Button>
        </div>
      )}
    </div>
  );
}
