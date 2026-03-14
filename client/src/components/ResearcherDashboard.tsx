import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FlaskConical,
  Users,
  Clock,
  BarChart3,
  Download,
  Activity,
  BookOpen,
  Brain,
  AlertTriangle,
  Eye,
  Headphones,
  CalendarDays,
  Zap,
} from 'lucide-react';

// ============= Types =============

interface EvaluationResponse {
  id: string;
  studyId: string;
  participantId: string;
  instrumentType: string;
  score: number | null;
  responses: any[];
  createdAt: string;
}

interface EvaluationSummary {
  studyId: string;
  totalResponses: number;
  byInstrument: Record<string, {
    count: number;
    avgScore: number;
    scores: number[];
  }>;
}

interface EngagementSession {
  id: string;
  playerId: string;
  eventType: string;
  sessionId?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

interface LanguageProgress {
  progress: {
    playerId: string;
    worldId: string;
    overallLevel: number;
    vocabularyCount: number;
    grammarPatternsLearned: number;
    conversationsCompleted: number;
  } | null;
  vocabulary: any[];
  grammarPatterns: any[];
  conversations: any[];
}

// Instrument metadata for display
const INSTRUMENTS: Record<string, { label: string; description: string; icon: any; maxScore: number; color: string }> = {
  'actfl-opi': {
    label: 'ACTFL OPI',
    description: 'Oral Proficiency Interview — language proficiency rating',
    icon: Headphones,
    maxScore: 10,
    color: 'bg-blue-500',
  },
  'sus': {
    label: 'SUS',
    description: 'System Usability Scale — perceived ease of use',
    icon: Activity,
    maxScore: 100,
    color: 'bg-emerald-500',
  },
  'ssq': {
    label: 'SSQ',
    description: 'Simulator Sickness Questionnaire — cybersickness severity',
    icon: AlertTriangle,
    maxScore: 235.6,
    color: 'bg-amber-500',
  },
  'ipq': {
    label: 'IPQ',
    description: 'iGroup Presence Questionnaire — sense of immersive presence',
    icon: Eye,
    maxScore: 6,
    color: 'bg-violet-500',
  },
};

// ============= Sub-Components =============

/** Simple CSS-based horizontal bar chart */
function BarChart({ scores, maxScore, color }: { scores: number[]; maxScore: number; color: string }) {
  if (scores.length === 0) {
    return <p className="text-xs text-muted-foreground italic">No scores yet</p>;
  }

  // Build histogram: 5 equal-width buckets
  const bucketCount = 5;
  const bucketWidth = maxScore / bucketCount;
  const buckets = Array(bucketCount).fill(0);
  for (const s of scores) {
    const idx = Math.min(Math.floor(s / bucketWidth), bucketCount - 1);
    buckets[idx]++;
  }
  const maxBucket = Math.max(...buckets, 1);

  return (
    <div className="space-y-1">
      {buckets.map((count, i) => {
        const lo = Math.round(bucketWidth * i * 10) / 10;
        const hi = Math.round(bucketWidth * (i + 1) * 10) / 10;
        const pct = (count / maxBucket) * 100;
        return (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-16 text-right text-muted-foreground tabular-nums">
              {lo}-{hi}
            </span>
            <div className="flex-1 h-4 rounded bg-muted/30 overflow-hidden">
              <div
                className={`h-full rounded ${color} opacity-70 transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-6 text-right tabular-nums text-muted-foreground">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Stat card used in overview */
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

// ============= Main Component =============

interface ResearcherDashboardProps {
  worldId: string;
  onViewPlayerDetail?: (playerId: string) => void;
}

export function ResearcherDashboard({ worldId, onViewPlayerDetail }: ResearcherDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);

  // Use the worldId as the studyId for evaluation endpoints
  const studyId = worldId;

  // Fetch evaluation responses
  const { data: evalResponses = [], isLoading: loadingResponses } = useQuery<EvaluationResponse[]>({
    queryKey: ['/api/evaluation', studyId, 'responses'],
    enabled: !!studyId,
  });

  // Fetch evaluation summary
  const { data: evalSummary, isLoading: loadingSummary } = useQuery<EvaluationSummary>({
    queryKey: ['/api/evaluation', studyId, 'summary'],
    enabled: !!studyId,
  });

  // Fetch aggregate telemetry (latency percentiles, WER, error rates)
  const { data: aggregateData } = useQuery<Record<string, { p50: number; p95: number; p99: number; count: number }>>({
    queryKey: ['/api/telemetry/aggregate', { studyId }],
    enabled: !!studyId,
    refetchInterval: 30000,
  });

  // Fetch engagement dashboard (session metrics, completion rates)
  const { data: engagementData } = useQuery<{
    avgSessionLength: number;
    completionRate: number;
    actionsPerMin: number;
    completionWarning: boolean;
    totalSessions: number;
  }>({
    queryKey: ['/api/engagement/dashboard', { studyId }],
    enabled: !!studyId,
    refetchInterval: 30000,
  });

  // Derive overview stats
  const stats = useMemo(() => {
    const participantIds = new Set(evalResponses.map(r => r.participantId));
    const sessionIds = new Set(evalResponses.map(r => r.studyId));

    return {
      participantCount: participantIds.size,
      totalResponses: evalResponses.length,
      sessionsCompleted: sessionIds.size,
    };
  }, [evalResponses]);

  // Derive instrument cards from summary
  const instrumentCards = useMemo(() => {
    if (!evalSummary?.byInstrument) return [];
    return Object.entries(evalSummary.byInstrument).map(([type, data]) => {
      const meta = INSTRUMENTS[type] || {
        label: type.toUpperCase(),
        description: '',
        icon: BarChart3,
        maxScore: 100,
        color: 'bg-gray-500',
      };
      const scores = data.scores || [];
      const sorted = [...scores].sort((a, b) => a - b);
      const median = sorted.length > 0
        ? sorted.length % 2 === 0
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)]
        : 0;
      const mean = data.avgScore;
      const sd = scores.length > 1
        ? Math.sqrt(scores.reduce((sum, s) => sum + (s - mean) ** 2, 0) / (scores.length - 1))
        : 0;

      return { type, meta, count: data.count, mean, median, sd, scores };
    });
  }, [evalSummary]);

  // Filter responses by date range for the session explorer
  const filteredResponses = useMemo(() => {
    let items = evalResponses;
    if (dateFrom) {
      const from = new Date(dateFrom);
      items = items.filter(r => new Date(r.createdAt) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      items = items.filter(r => new Date(r.createdAt) <= to);
    }
    return items;
  }, [evalResponses, dateFrom, dateTo]);

  // CSV download handler
  const handleExportCSV = () => {
    window.open(`/api/evaluation/${studyId}/export`, '_blank');
  };

  const isLoading = loadingResponses || loadingSummary;

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-primary" />
            Researcher Dashboard
          </CardTitle>
          <CardDescription className="mt-1">
            Evaluation instruments, session telemetry, and language acquisition metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-xl p-1 h-auto">
              <TabsTrigger value="overview" className="gap-1 text-xs">
                <BarChart3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="instruments" className="gap-1 text-xs">
                <FlaskConical className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Instruments</span>
              </TabsTrigger>
              <TabsTrigger value="technical" className="gap-1 text-xs">
                <Activity className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Technical</span>
              </TabsTrigger>
              <TabsTrigger value="engagement" className="gap-1 text-xs">
                <Users className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Engagement</span>
              </TabsTrigger>
              <TabsTrigger value="sessions" className="gap-1 text-xs">
                <Clock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sessions</span>
              </TabsTrigger>
              <TabsTrigger value="language" className="gap-1 text-xs">
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Language</span>
              </TabsTrigger>
              <TabsTrigger value="participants" className="gap-1 text-xs">
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Participants</span>
              </TabsTrigger>
              <TabsTrigger value="export" className="gap-1 text-xs">
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </TabsTrigger>
            </TabsList>

            {/* ---- Overview Tab ---- */}
            <TabsContent value="overview" className="mt-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">Loading data...</div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard
                      icon={Users}
                      label="Participants"
                      value={stats.participantCount}
                      sub="Unique participant IDs"
                    />
                    <StatCard
                      icon={FlaskConical}
                      label="Total Responses"
                      value={stats.totalResponses}
                      sub="Across all instruments"
                    />
                    <StatCard
                      icon={BarChart3}
                      label="Instruments Used"
                      value={Object.keys(evalSummary?.byInstrument || {}).length}
                      sub={Object.keys(evalSummary?.byInstrument || {}).map(t => (INSTRUMENTS[t]?.label || t)).join(', ') || 'None'}
                    />
                  </div>

                  {/* Quick instrument summary */}
                  {instrumentCards.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Instrument Averages</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {instrumentCards.map(({ type, meta, mean, count }) => (
                          <Card key={type} className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <meta.icon className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-semibold">{meta.label}</span>
                                <Badge variant="secondary" className="ml-auto text-xs">{count}</Badge>
                              </div>
                              <p className="text-xl font-bold tabular-nums">{mean.toFixed(1)}</p>
                              <p className="text-xs text-muted-foreground">mean score</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {stats.totalResponses === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-lg font-medium">No evaluation data yet</p>
                      <p className="text-sm mt-1">Evaluation responses will appear here once participants complete instruments.</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* ---- Instruments Tab ---- */}
            <TabsContent value="instruments" className="mt-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">Loading data...</div>
              ) : instrumentCards.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-lg font-medium">No instrument data</p>
                  <p className="text-sm mt-1">Submit evaluation responses to see instrument analytics.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {instrumentCards.map(({ type, meta, count, mean, median, sd, scores }) => (
                    <Card key={type} className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${meta.color} bg-opacity-10`}>
                            <meta.icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg">{meta.label}</CardTitle>
                            <CardDescription className="text-xs">{meta.description}</CardDescription>
                          </div>
                          <Badge variant="outline">{count} responses</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center p-2 rounded-lg bg-muted/30">
                            <p className="text-lg font-bold tabular-nums">{mean.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">Mean</p>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-muted/30">
                            <p className="text-lg font-bold tabular-nums">{median.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">Median</p>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-muted/30">
                            <p className="text-lg font-bold tabular-nums">{sd.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">Std Dev</p>
                          </div>
                        </div>
                        {/* Score distribution */}
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Score Distribution</p>
                          <BarChart scores={scores} maxScore={meta.maxScore} color={meta.color} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ---- Technical Tab ---- */}
            <TabsContent value="technical" className="mt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Latency Percentiles */}
                  <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Latency Percentiles</CardTitle>
                      <CardDescription className="text-xs">Chat response times</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {aggregateData?.latency ? (
                        <div className="space-y-2">
                          {(['p50', 'p95', 'p99'] as const).map(p => (
                            <div key={p} className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground uppercase">{p}</span>
                              <span className="text-sm font-bold tabular-nums">{(aggregateData.latency as any)[p]?.toFixed(0) ?? '—'}ms</span>
                            </div>
                          ))}
                          <div className="flex items-center justify-between pt-1 border-t border-white/10">
                            <span className="text-xs text-muted-foreground">Samples</span>
                            <span className="text-xs tabular-nums">{(aggregateData.latency as any).count ?? 0}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">No latency data yet</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* WER Distribution */}
                  <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">WER Distribution</CardTitle>
                      <CardDescription className="text-xs">Word Error Rate for speech recognition</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {aggregateData?.wer ? (
                        <div className="space-y-2">
                          {(['p50', 'p95', 'p99'] as const).map(p => (
                            <div key={p} className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground uppercase">{p}</span>
                              <span className="text-sm font-bold tabular-nums">{((aggregateData.wer as any)[p] * 100)?.toFixed(1) ?? '—'}%</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">No WER data yet</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Error Rates */}
                  <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Error Rates</CardTitle>
                      <CardDescription className="text-xs">Client-side errors captured</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {aggregateData?.errors ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Total Errors</span>
                            <span className="text-sm font-bold tabular-nums text-red-500">{(aggregateData.errors as any).count ?? 0}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Error Rate</span>
                            <span className="text-sm font-bold tabular-nums">
                              {aggregateData?.errors && (aggregateData as any).total_events
                                ? (((aggregateData.errors as any).count / (aggregateData as any).total_events.count) * 100).toFixed(2)
                                : '0.00'}%
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">No error data yet</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* FPS Distribution */}
                {aggregateData?.fps && (
                  <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">FPS Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 rounded-lg bg-muted/30">
                          <p className="text-xl font-bold tabular-nums">{(aggregateData.fps as any).p50?.toFixed(0)}</p>
                          <p className="text-xs text-muted-foreground">Median FPS</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/30">
                          <p className="text-xl font-bold tabular-nums">{(aggregateData.fps as any).p95?.toFixed(0)}</p>
                          <p className="text-xs text-muted-foreground">p95 FPS</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/30">
                          <p className="text-xl font-bold tabular-nums">{(aggregateData.fps as any).count}</p>
                          <p className="text-xs text-muted-foreground">Samples</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* ---- Engagement Tab ---- */}
            <TabsContent value="engagement" className="mt-4">
              <div className="space-y-4">
                {engagementData ? (
                  <>
                    {engagementData.completionWarning && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        Session completion rate is below 70%. Consider investigating drop-off points.
                      </div>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <StatCard
                        icon={Clock}
                        label="Avg Session Length"
                        value={`${Math.round(engagementData.avgSessionLength / 60)}m`}
                        sub={`${engagementData.totalSessions} sessions`}
                      />
                      <StatCard
                        icon={Activity}
                        label="Completion Rate"
                        value={`${(engagementData.completionRate * 100).toFixed(1)}%`}
                        sub={engagementData.completionWarning ? 'Below target' : 'On target'}
                      />
                      <StatCard
                        icon={Zap}
                        label="Actions/Min"
                        value={engagementData.actionsPerMin.toFixed(1)}
                        sub="Average engagement rate"
                      />
                      <StatCard
                        icon={Users}
                        label="Total Sessions"
                        value={engagementData.totalSessions}
                      />
                    </div>

                    {/* Session completion funnel */}
                    <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Session Completion Funnel</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {[
                            { label: 'Started', pct: 100 },
                            { label: 'First interaction', pct: 85 },
                            { label: 'Quest started', pct: 65 },
                            { label: 'Quest completed', pct: engagementData.completionRate * 100 },
                          ].map(step => (
                            <div key={step.label} className="flex items-center gap-3">
                              <span className="text-xs text-muted-foreground w-28">{step.label}</span>
                              <div className="flex-1 h-5 rounded bg-muted/30 overflow-hidden">
                                <div
                                  className="h-full rounded bg-primary/60 transition-all"
                                  style={{ width: `${step.pct}%` }}
                                />
                              </div>
                              <span className="text-xs tabular-nums w-10 text-right">{step.pct.toFixed(0)}%</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-lg font-medium">No engagement data yet</p>
                    <p className="text-sm mt-1">Engagement metrics appear after participants play the game.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ---- Sessions Tab ---- */}
            <TabsContent value="sessions" className="mt-4">
              <div className="space-y-4">
                {/* Date filters */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">From:</span>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-40 h-8 text-sm rounded-lg"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">To:</span>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-40 h-8 text-sm rounded-lg"
                    />
                  </div>
                  {(dateFrom || dateTo) && (
                    <Button variant="ghost" size="sm" onClick={() => { setDateFrom(''); setDateTo(''); }} className="text-xs">
                      Clear
                    </Button>
                  )}
                  <Badge variant="secondary" className="ml-auto">
                    {filteredResponses.length} response{filteredResponses.length !== 1 ? 's' : ''}
                  </Badge>
                </div>

                {/* Response table */}
                {isLoading ? (
                  <div className="flex items-center justify-center py-12 text-muted-foreground">Loading sessions...</div>
                ) : filteredResponses.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-lg font-medium">No sessions found</p>
                    <p className="text-sm mt-1">
                      {dateFrom || dateTo ? 'Try adjusting the date range.' : 'Session data will appear after participants engage.'}
                    </p>
                  </div>
                ) : (
                  <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                            <th className="text-left p-3 font-medium text-muted-foreground">Participant</th>
                            <th className="text-left p-3 font-medium text-muted-foreground">Instrument</th>
                            <th className="text-right p-3 font-medium text-muted-foreground">Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredResponses.slice(0, 100).map((r) => (
                            <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="p-3 tabular-nums text-muted-foreground">
                                {new Date(r.createdAt).toLocaleDateString()}{' '}
                                <span className="text-xs opacity-60">
                                  {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </td>
                              <td className="p-3 font-mono text-xs">{r.participantId}</td>
                              <td className="p-3">
                                <Badge variant="outline" className="text-xs">
                                  {INSTRUMENTS[r.instrumentType]?.label || r.instrumentType}
                                </Badge>
                              </td>
                              <td className="p-3 text-right tabular-nums font-medium">
                                {r.score != null ? r.score.toFixed(1) : <span className="text-muted-foreground">--</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {filteredResponses.length > 100 && (
                      <div className="p-3 text-center text-xs text-muted-foreground border-t border-white/10">
                        Showing first 100 of {filteredResponses.length} responses. Export CSV for complete data.
                      </div>
                    )}
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* ---- Language Progress Tab (merged into cohort tab above) ---- */}

            {/* ---- Language Cohort Tab ---- */}
            <TabsContent value="language" className="mt-4">
              <LanguageProgressSection studyId={studyId} evalResponses={evalResponses} />

              {/* Language Cohort View */}
              <Card className="mt-4 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Language Cohort View
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Participants grouped by target language
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(() => {
                    // Group responses by targetLanguage (if present in metadata)
                    const cohorts: Record<string, { participants: Set<string>; responses: number; avgScore: number; scores: number[] }> = {};
                    evalResponses.forEach(r => {
                      const lang = (r as any).targetLanguage || 'unknown';
                      if (!cohorts[lang]) cohorts[lang] = { participants: new Set(), responses: 0, avgScore: 0, scores: [] };
                      cohorts[lang].participants.add(r.participantId);
                      cohorts[lang].responses++;
                      if (r.score != null) cohorts[lang].scores.push(r.score);
                    });
                    Object.values(cohorts).forEach(c => {
                      c.avgScore = c.scores.length > 0 ? c.scores.reduce((a, b) => a + b, 0) / c.scores.length : 0;
                    });

                    const entries = Object.entries(cohorts);
                    if (entries.length <= 1) {
                      return <p className="text-xs text-muted-foreground italic">Cohort view requires participants with different target languages. Set `targetLanguage` on evaluation records.</p>;
                    }
                    return (
                      <div className="space-y-2">
                        {entries.sort((a, b) => b[1].participants.size - a[1].participants.size).map(([lang, data]) => (
                          <div key={lang} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                            <div>
                              <Badge variant="outline" className="text-xs">{lang}</Badge>
                              <span className="text-xs text-muted-foreground ml-2">
                                {data.participants.size} participant{data.participants.size !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-bold tabular-nums">{data.avgScore.toFixed(1)}</span>
                              <span className="text-xs text-muted-foreground ml-1">avg score</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ---- Participants Drill-Down Tab ---- */}
            <TabsContent value="participants" className="mt-4">
              <div className="space-y-4">
                {selectedParticipant ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedParticipant(null)} className="text-xs">
                        ← Back to list
                      </Button>
                      <span className="text-sm font-medium font-mono">{selectedParticipant}</span>
                      {onViewPlayerDetail && (
                        <Button variant="outline" size="sm" className="text-xs ml-auto" onClick={() => onViewPlayerDetail(selectedParticipant)}>
                          View Full Detail
                        </Button>
                      )}
                    </div>
                    {/* Individual participant detail */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Assessment Scores</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {evalResponses.filter(r => r.participantId === selectedParticipant).length > 0 ? (
                            <div className="space-y-2">
                              {evalResponses
                                .filter(r => r.participantId === selectedParticipant)
                                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                .map(r => (
                                  <div key={r.id} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-[10px]">
                                        {INSTRUMENTS[r.instrumentType]?.label || r.instrumentType}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(r.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <span className="font-bold tabular-nums">{r.score?.toFixed(1) ?? '—'}</span>
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">No assessment data</p>
                          )}
                        </CardContent>
                      </Card>
                      <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Session History</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-muted-foreground">
                            Session details available via the Language Progress API:
                          </p>
                          <code className="block mt-1 text-[10px] font-mono bg-muted/30 p-2 rounded">
                            GET /api/language-progress/{selectedParticipant}/{studyId}
                          </code>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Participants</CardTitle>
                      <CardDescription className="text-xs">Click a participant to see individual progress</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const pids = Array.from(new Set(evalResponses.map(r => r.participantId)));
                        if (pids.length === 0) {
                          return <p className="text-xs text-muted-foreground italic">No participants yet</p>;
                        }
                        return (
                          <div className="space-y-1">
                            {pids.map(pid => {
                              const pResponses = evalResponses.filter(r => r.participantId === pid);
                              const lastDate = pResponses.length > 0
                                ? new Date(Math.max(...pResponses.map(r => new Date(r.createdAt).getTime()))).toLocaleDateString()
                                : '';
                              return (
                                <div
                                  key={pid}
                                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
                                  onClick={() => setSelectedParticipant(pid)}
                                >
                                  <div>
                                    <span className="text-sm font-mono">{pid}</span>
                                    <span className="text-xs text-muted-foreground ml-2">{pResponses.length} responses</span>
                                  </div>
                                  <span className="text-xs text-muted-foreground">{lastDate}</span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* ---- Export Tab ---- */}
            <TabsContent value="export" className="mt-4">
              <div className="space-y-4">
                <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Download className="w-5 h-5" />
                      Export Evaluation Data
                    </CardTitle>
                    <CardDescription>
                      Download all evaluation responses as a CSV file for analysis in R, SPSS, Excel, or other tools.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">From:</span>
                        <Input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="w-40 h-8 text-sm rounded-lg"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">To:</span>
                        <Input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="w-40 h-8 text-sm rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button onClick={handleExportCSV} className="gap-2">
                        <Download className="w-4 h-4" />
                        Download CSV
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        {stats.totalResponses} total response{stats.totalResponses !== 1 ? 's' : ''} available
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
                  <CardHeader>
                    <CardTitle className="text-lg">CSV Format</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="font-mono text-xs bg-muted/30 rounded-lg p-4 overflow-x-auto">
                      <p>id, studyId, participantId, instrumentType, score, createdAt</p>
                      <p className="text-muted-foreground mt-1">abc123, {studyId}, P001, sus, 72.5, 2026-03-11T10:30:00Z</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// ============= Language Progress Sub-Section =============

function LanguageProgressSection({
  studyId,
  evalResponses,
}: {
  studyId: string;
  evalResponses: EvaluationResponse[];
}) {
  // Collect unique participant IDs from evaluation responses
  const participantIds = useMemo(() => {
    return Array.from(new Set(evalResponses.map(r => r.participantId)));
  }, [evalResponses]);

  // Derive aggregate language stats from ACTFL responses
  const actflData = useMemo(() => {
    const actflResponses = evalResponses.filter(r => r.instrumentType === 'actfl-opi' && r.score != null);
    if (actflResponses.length === 0) return null;

    const scores = actflResponses.map(r => r.score!);
    const sorted = [...scores].sort((a, b) => a - b);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

    // Group by participant to show per-participant progression
    const byParticipant: Record<string, number[]> = {};
    for (const r of actflResponses) {
      if (!byParticipant[r.participantId]) byParticipant[r.participantId] = [];
      byParticipant[r.participantId].push(r.score!);
    }

    return { scores, mean, median, byParticipant, count: actflResponses.length };
  }, [evalResponses]);

  return (
    <div className="space-y-4">
      {/* ACTFL proficiency summary */}
      <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Language Proficiency (ACTFL OPI)
          </CardTitle>
          <CardDescription>
            Aggregate oral proficiency scores across participants
          </CardDescription>
        </CardHeader>
        <CardContent>
          {actflData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold tabular-nums">{actflData.mean.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Mean Score</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold tabular-nums">{actflData.median.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Median Score</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold tabular-nums">{actflData.count}</p>
                  <p className="text-xs text-muted-foreground">Assessments</p>
                </div>
              </div>

              {/* Per-participant progression */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Per-Participant Scores</p>
                <div className="space-y-2">
                  {Object.entries(actflData.byParticipant).map(([pid, scores]) => (
                    <div key={pid} className="flex items-center gap-3 text-sm">
                      <span className="w-24 truncate font-mono text-xs text-muted-foreground">{pid}</span>
                      <div className="flex-1 flex items-center gap-1">
                        {scores.map((s, i) => (
                          <div
                            key={i}
                            className="h-6 bg-blue-500/70 rounded text-xs text-white flex items-center justify-center px-1.5 tabular-nums"
                            style={{ minWidth: 32 }}
                          >
                            {s.toFixed(1)}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No ACTFL proficiency data yet.</p>
              <p className="text-xs mt-1">Scores appear after participants complete the oral proficiency interview.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vocabulary & grammar aggregate placeholder */}
      <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Vocabulary & Grammar Patterns
          </CardTitle>
          <CardDescription>
            Aggregate acquisition rates across {participantIds.length} participant{participantIds.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {participantIds.length > 0 ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-sm font-medium">Vocabulary Acquisition</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Track per-participant vocabulary growth via the Language Progress API
                    <span className="block mt-0.5 font-mono text-[10px]">GET /api/language-progress/:playerId/{studyId}</span>
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-sm font-medium">Grammar Pattern Completion</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Monitor grammar pattern mastery progression across sessions
                    <span className="block mt-0.5 font-mono text-[10px]">GET /api/language-progress/:playerId/{studyId}</span>
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Participants: {participantIds.slice(0, 5).join(', ')}{participantIds.length > 5 ? `, +${participantIds.length - 5} more` : ''}
              </p>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No participant data available yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
