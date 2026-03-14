import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronRight,
  Activity,
  Headphones,
  AlertTriangle,
  Eye,
  FileText,
  Clock,
} from 'lucide-react';

// ============= Types =============

interface SubscaleInfo {
  id: string;
  name: string;
}

interface EnrichedEvaluation {
  id: string;
  studyId: string;
  participantId: string;
  instrumentType: string;
  instrumentName: string;
  targetLanguage: string | null;
  responses: Record<string, number | string>;
  score: number | null;
  maxScore: number | null;
  subscaleScores: Record<string, number>;
  subscales: SubscaleInfo[];
  sessionId: string | null;
  createdAt: string;
}

interface LanguageAssessment {
  id: string;
  playerId: string;
  worldId: string;
  assessmentType: string;
  targetLanguage: string;
  score: number;
  maxScore: number;
  details: Record<string, any>;
  testWindow: string | null;
  createdAt: string;
}

interface PlayerAssessmentResponse {
  participantId: string;
  evaluations: EnrichedEvaluation[];
  languageAssessments: LanguageAssessment[];
  totalAssessments: number;
}

// Instrument display metadata
const INSTRUMENT_META: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
  actfl_opi: { label: 'ACTFL OPI', icon: Headphones, color: 'text-blue-600', bgColor: 'bg-blue-500' },
  sus: { label: 'SUS', icon: Activity, color: 'text-emerald-600', bgColor: 'bg-emerald-500' },
  ssq: { label: 'SSQ', icon: AlertTriangle, color: 'text-amber-600', bgColor: 'bg-amber-500' },
  ipq: { label: 'IPQ', icon: Eye, color: 'text-violet-600', bgColor: 'bg-violet-500' },
};

const PHASE_LABELS: Record<string, string> = {
  pre: 'Pre-test',
  post: 'Post-test',
  delayed: 'Delayed',
};

// ============= Sub-Components =============

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string | number; sub?: string }) {
  return (
    <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
      <CardContent className="p-4 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
          {sub && <p className="text-xs text-muted-foreground/70 mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

/** Horizontal bar for a subscale score */
function SubscaleBar({ name, score, maxScore, color }: { name: string; score: number; maxScore: number; color: string }) {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-36 text-right text-muted-foreground truncate" title={name}>{name}</span>
      <div className="flex-1 h-5 rounded bg-muted/30 overflow-hidden">
        <div
          className={`h-full rounded ${color} opacity-70 transition-all duration-500`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className="w-16 text-right tabular-nums text-sm font-medium">
        {score.toFixed(1)}/{maxScore}
      </span>
    </div>
  );
}

/** Delta indicator arrow */
function DeltaIndicator({ current, previous }: { current: number; previous: number }) {
  const delta = current - previous;
  const pctChange = previous !== 0 ? (delta / previous) * 100 : 0;

  if (Math.abs(delta) < 0.01) {
    return <span className="text-muted-foreground text-xs flex items-center gap-0.5"><Minus className="w-3 h-3" /> 0%</span>;
  }

  if (delta > 0) {
    return (
      <span className="text-emerald-600 text-xs flex items-center gap-0.5">
        <TrendingUp className="w-3 h-3" /> +{pctChange.toFixed(1)}%
      </span>
    );
  }

  return (
    <span className="text-red-500 text-xs flex items-center gap-0.5">
      <TrendingDown className="w-3 h-3" /> {pctChange.toFixed(1)}%
    </span>
  );
}

/** Expandable row for a single assessment evaluation */
function EvaluationRow({ evaluation, previousScore }: { evaluation: EnrichedEvaluation; previousScore: number | null }) {
  const [expanded, setExpanded] = useState(false);
  const meta = INSTRUMENT_META[evaluation.instrumentType] || {
    label: evaluation.instrumentType,
    icon: FileText,
    color: 'text-gray-600',
    bgColor: 'bg-gray-500',
  };
  const Icon = meta.icon;

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
      >
        <div className="text-muted-foreground">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
        <div className={`p-1.5 rounded ${meta.bgColor}/20`}>
          <Icon className={`w-4 h-4 ${meta.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-medium text-sm">{evaluation.instrumentName}</span>
          {evaluation.targetLanguage && (
            <Badge variant="outline" className="ml-2 text-xs">{evaluation.targetLanguage}</Badge>
          )}
        </div>
        <div className="text-right">
          <span className="font-bold tabular-nums text-sm">
            {evaluation.score != null ? evaluation.score.toFixed(1) : '—'}
          </span>
          {evaluation.maxScore != null && (
            <span className="text-muted-foreground text-xs">/{evaluation.maxScore}</span>
          )}
        </div>
        {previousScore != null && evaluation.score != null && (
          <div className="w-20 text-right">
            <DeltaIndicator current={evaluation.score} previous={previousScore} />
          </div>
        )}
        <div className="w-32 text-right text-xs text-muted-foreground">
          {new Date(evaluation.createdAt).toLocaleDateString()}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-white/5 space-y-4">
          {/* Subscale breakdown */}
          {evaluation.subscales.length > 0 && Object.keys(evaluation.subscaleScores).length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Subscale Scores</h4>
              <div className="space-y-1.5">
                {evaluation.subscales.map(sub => {
                  const score = evaluation.subscaleScores[sub.id];
                  if (score == null) return null;
                  return (
                    <SubscaleBar
                      key={sub.id}
                      name={sub.name}
                      score={score}
                      maxScore={evaluation.maxScore ?? 10}
                      color={meta.bgColor}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Raw responses */}
          {evaluation.responses && typeof evaluation.responses === 'object' && Object.keys(evaluation.responses).length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Responses</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {Object.entries(evaluation.responses).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between bg-muted/20 rounded px-2 py-1 text-xs">
                    <span className="text-muted-foreground truncate mr-1">{key}</span>
                    <span className="font-medium tabular-nums">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="flex gap-4 text-xs text-muted-foreground">
            {evaluation.studyId && <span>Study: {evaluation.studyId}</span>}
            {evaluation.sessionId && <span>Session: {evaluation.sessionId}</span>}
            <span>Taken: {new Date(evaluation.createdAt).toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ============= Main Component =============

interface PlayerAssessmentDetailProps {
  playerId: string;
  worldId?: string;
  onBack?: () => void;
}

export function PlayerAssessmentDetail({ playerId, worldId, onBack }: PlayerAssessmentDetailProps) {
  const [instrumentFilter, setInstrumentFilter] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery<PlayerAssessmentResponse>({
    queryKey: ['/api/assessment', playerId, 'detail', { worldId }],
    enabled: !!playerId,
  });

  // Group evaluations by instrument type for dimension comparison
  const groupedByInstrument = useMemo(() => {
    if (!data) return {};
    const groups: Record<string, EnrichedEvaluation[]> = {};
    for (const ev of data.evaluations) {
      if (!groups[ev.instrumentType]) groups[ev.instrumentType] = [];
      groups[ev.instrumentType].push(ev);
    }
    // Sort each group chronologically (oldest first for longitudinal view)
    for (const key of Object.keys(groups)) {
      groups[key].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    return groups;
  }, [data]);

  // Filtered evaluations for the scores table (newest first)
  const filteredEvaluations = useMemo(() => {
    if (!data) return [];
    let evals = [...data.evaluations];
    if (instrumentFilter) {
      evals = evals.filter(e => e.instrumentType === instrumentFilter);
    }
    return evals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [data, instrumentFilter]);

  // Compute summary stats
  const summaryStats = useMemo(() => {
    if (!data || data.evaluations.length === 0) return null;

    const instrumentTypes = new Set(data.evaluations.map(e => e.instrumentType));
    const latestByInstrument: Record<string, number | null> = {};
    for (const [type, evals] of Object.entries(groupedByInstrument)) {
      const latest = evals[evals.length - 1];
      latestByInstrument[type] = latest?.score ?? null;
    }

    const scores = data.evaluations.filter(e => e.score != null).map(e => e.score!);
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    return {
      totalAssessments: data.totalAssessments,
      instrumentCount: instrumentTypes.size,
      avgScore: avgScore.toFixed(1),
      latestByInstrument,
    };
  }, [data, groupedByInstrument]);

  // Build a map of previous scores for delta indicators
  const previousScoreMap = useMemo(() => {
    const map: Record<string, number | null> = {};
    for (const [, evals] of Object.entries(groupedByInstrument)) {
      for (let i = 0; i < evals.length; i++) {
        map[evals[i].id] = i > 0 ? evals[i - 1].score : null;
      }
    }
    return map;
  }, [groupedByInstrument]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted-foreground">Loading assessment data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-red-500">Failed to load assessment data.</div>
      </div>
    );
  }

  if (!data || data.totalAssessments === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        )}
        <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-xl">
          <CardContent className="py-12 text-center">
            <BarChart3 className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">No assessments found for this player.</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Submit evaluation responses to see assessment data.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        )}
        <div>
          <h2 className="text-xl font-bold">Player Assessment Detail</h2>
          <p className="text-sm text-muted-foreground">Participant: {playerId}</p>
        </div>
      </div>

      {/* Summary Stats */}
      {summaryStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={BarChart3} label="Total Assessments" value={summaryStats.totalAssessments} />
          <StatCard icon={Activity} label="Instruments Used" value={summaryStats.instrumentCount} />
          <StatCard icon={TrendingUp} label="Avg Score" value={summaryStats.avgScore} />
          <StatCard icon={Clock} label="Language Assessments" value={data.languageAssessments.length} />
        </div>
      )}

      {/* Per-Dimension Comparison */}
      {Object.keys(groupedByInstrument).length > 0 && (
        <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Score Comparison by Dimension</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(groupedByInstrument).map(([type, evals]) => {
              const meta = INSTRUMENT_META[type] || { label: type, icon: FileText, color: 'text-gray-600', bgColor: 'bg-gray-500' };
              const latest = evals[evals.length - 1];
              if (!latest || !latest.subscales.length) return null;

              return (
                <div key={type}>
                  <div className="flex items-center gap-2 mb-2">
                    <meta.icon className={`w-4 h-4 ${meta.color}`} />
                    <span className="font-medium text-sm">{meta.label}</span>
                    <span className="text-xs text-muted-foreground">
                      (latest: {new Date(latest.createdAt).toLocaleDateString()})
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {latest.subscales.map(sub => {
                      const score = latest.subscaleScores[sub.id];
                      if (score == null) return null;
                      return (
                        <SubscaleBar
                          key={sub.id}
                          name={sub.name}
                          score={score}
                          maxScore={latest.maxScore ?? 10}
                          color={meta.bgColor}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Longitudinal Scores Table */}
      <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Assessment History</CardTitle>
            <div className="flex gap-1">
              <Button
                variant={instrumentFilter === null ? 'default' : 'ghost'}
                size="sm"
                className="text-xs h-7"
                onClick={() => setInstrumentFilter(null)}
              >
                All
              </Button>
              {Object.entries(INSTRUMENT_META).map(([type, meta]) => (
                <Button
                  key={type}
                  variant={instrumentFilter === type ? 'default' : 'ghost'}
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setInstrumentFilter(instrumentFilter === type ? null : type)}
                >
                  {meta.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Table header */}
          <div className="flex items-center gap-3 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <div className="w-4" />
            <div className="w-8" />
            <div className="flex-1">Instrument</div>
            <div className="w-24 text-right">Score</div>
            <div className="w-20 text-right">Change</div>
            <div className="w-32 text-right">Date</div>
          </div>

          {filteredEvaluations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No assessments match the filter.</p>
          ) : (
            filteredEvaluations.map(ev => (
              <EvaluationRow
                key={ev.id}
                evaluation={ev}
                previousScore={previousScoreMap[ev.id]}
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* Language Assessments */}
      {data.languageAssessments.length > 0 && (
        <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Language Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <div className="flex-1">Type</div>
                <div className="w-24">Language</div>
                <div className="w-20">Phase</div>
                <div className="w-24 text-right">Score</div>
                <div className="w-32 text-right">Date</div>
              </div>
              {data.languageAssessments.map(la => (
                <div key={la.id} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm">
                  <div className="flex-1 font-medium capitalize">{la.assessmentType.replace(/_/g, ' ')}</div>
                  <div className="w-24">
                    <Badge variant="outline" className="text-xs">{la.targetLanguage}</Badge>
                  </div>
                  <div className="w-20">
                    <Badge variant="secondary" className="text-xs">
                      {la.testWindow ? PHASE_LABELS[la.testWindow] || la.testWindow : '—'}
                    </Badge>
                  </div>
                  <div className="w-24 text-right tabular-nums font-medium">
                    {la.score}/{la.maxScore}
                  </div>
                  <div className="w-32 text-right text-xs text-muted-foreground">
                    {new Date(la.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
