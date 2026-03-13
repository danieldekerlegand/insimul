import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  BarChart3,
  Users,
  GraduationCap,
  BookOpen,
  Brain,
  Ear,
  Globe,
  MessageSquare,
  Layers,
  CalendarDays,
  ChevronRight,
} from 'lucide-react';

// ============= Types =============

interface AssessmentDashboardData {
  worldId: string;
  totalAssessments: number;
  uniquePlayers: number;
  histogram: Record<string, number>;
  cefrDistribution: Record<string, number>;
  typeAverages: Record<string, { avgScore: number; avgPercentage: number; count: number }>;
  phaseAverages: Record<string, { avgPercentage: number; count: number }>;
  players: Array<{
    playerId: string;
    assessmentCount: number;
    avgPercentage: number;
    lastAssessment: string;
  }>;
}

// Assessment type metadata
const ASSESSMENT_TYPES: Record<string, { label: string; icon: typeof BookOpen; color: string }> = {
  vocabulary: { label: 'Vocabulary', icon: BookOpen, color: 'text-blue-500' },
  grammar: { label: 'Grammar', icon: Brain, color: 'text-purple-500' },
  pronunciation: { label: 'Pronunciation', icon: MessageSquare, color: 'text-orange-500' },
  listening: { label: 'Listening', icon: Ear, color: 'text-green-500' },
  pragmatic: { label: 'Pragmatic', icon: Globe, color: 'text-teal-500' },
  cultural: { label: 'Cultural', icon: GraduationCap, color: 'text-rose-500' },
};

// CEFR level colors
const CEFR_COLORS: Record<string, string> = {
  A1: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  A2: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  B1: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  B2: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  C1: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  C2: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

// ============= Sub-Components =============

function StatCard({ icon: Icon, label, value, sub }: { icon: typeof Users; label: string; value: number | string; sub: string }) {
  return (
    <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums">{value}</p>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground">{sub}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HistogramBar({ label, count, maxCount }: { label: string; count: number; maxCount: number }) {
  const height = maxCount > 0 ? Math.max((count / maxCount) * 120, count > 0 ? 4 : 0) : 0;
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs tabular-nums text-muted-foreground">{count}</span>
      <div className="w-full flex items-end justify-center" style={{ height: 120 }}>
        <div
          className="w-full rounded-t bg-primary/70 transition-all"
          style={{ height }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground tabular-nums">{label}</span>
    </div>
  );
}

// ============= Main Component =============

interface AssessmentDashboardProps {
  worldId: string;
}

export function AssessmentDashboard({ worldId }: AssessmentDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [playerSearch, setPlayerSearch] = useState('');

  // Build query params
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (typeFilter) params.set('assessmentType', typeFilter);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    return params.toString();
  }, [typeFilter, dateFrom, dateTo]);

  const { data, isLoading } = useQuery<AssessmentDashboardData>({
    queryKey: [`/api/assessment/dashboard/${worldId}`, queryParams],
    queryFn: async () => {
      const url = `/api/assessment/dashboard/${worldId}${queryParams ? `?${queryParams}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch assessment data');
      return res.json();
    },
    enabled: !!worldId,
  });

  const histogramEntries = useMemo(() => {
    if (!data?.histogram) return [];
    return Object.entries(data.histogram);
  }, [data]);

  const maxHistCount = useMemo(() => {
    return Math.max(...histogramEntries.map(([, c]) => c), 1);
  }, [histogramEntries]);

  const filteredPlayers = useMemo(() => {
    if (!data?.players) return [];
    if (!playerSearch) return data.players;
    const q = playerSearch.toLowerCase();
    return data.players.filter(p => p.playerId.toLowerCase().includes(q));
  }, [data, playerSearch]);

  const cefrOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary" />
            Assessment Dashboard
          </CardTitle>
          <CardDescription className="mt-1">
            Language assessment scores, CEFR distribution, and per-player performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-xl p-1 h-auto">
              <TabsTrigger value="overview" className="gap-1 text-xs">
                <BarChart3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="scores" className="gap-1 text-xs">
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Scores</span>
              </TabsTrigger>
              <TabsTrigger value="phases" className="gap-1 text-xs">
                <CalendarDays className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Phases</span>
              </TabsTrigger>
              <TabsTrigger value="players" className="gap-1 text-xs">
                <Users className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Players</span>
              </TabsTrigger>
            </TabsList>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <select
                className="text-sm border rounded-lg px-3 py-1.5 bg-background"
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                {Object.entries(ASSESSMENT_TYPES).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <Input
                type="date"
                className="w-36 text-sm"
                placeholder="From"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
              />
              <Input
                type="date"
                className="w-36 text-sm"
                placeholder="To"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
              />
            </div>

            {/* ---- Overview Tab ---- */}
            <TabsContent value="overview" className="mt-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">Loading data...</div>
              ) : !data || data.totalAssessments === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-lg font-medium">No assessment data yet</p>
                  <p className="text-sm mt-1">Assessment results will appear here once players complete language assessments.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Stat cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard icon={BarChart3} label="Total Assessments" value={data.totalAssessments} sub="Across all types" />
                    <StatCard icon={Users} label="Unique Players" value={data.uniquePlayers} sub="Players assessed" />
                    <StatCard
                      icon={GraduationCap}
                      label="Assessment Types"
                      value={Object.keys(data.typeAverages).length}
                      sub={Object.keys(data.typeAverages).map(t => ASSESSMENT_TYPES[t]?.label || t).join(', ') || 'None'}
                    />
                  </div>

                  {/* Score histogram */}
                  <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Score Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-11 gap-1">
                        {histogramEntries.map(([label, count]) => (
                          <HistogramBar key={label} label={label} count={count} maxCount={maxHistCount} />
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* CEFR distribution */}
                  <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">CEFR Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-3">
                        {cefrOrder.map(level => (
                          <div key={level} className="flex items-center gap-2">
                            <Badge className={`text-sm px-3 py-1 ${CEFR_COLORS[level]}`}>
                              {level}
                            </Badge>
                            <span className="text-sm font-semibold tabular-nums">{data.cefrDistribution[level] || 0}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Per-type averages */}
                  {Object.keys(data.typeAverages).length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Type Averages</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Object.entries(data.typeAverages).map(([type, avg]) => {
                          const meta = ASSESSMENT_TYPES[type] || { label: type, icon: BarChart3, color: 'text-gray-500' };
                          const Icon = meta.icon;
                          return (
                            <Card key={type} className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Icon className={`w-4 h-4 ${meta.color}`} />
                                  <span className="text-sm font-semibold">{meta.label}</span>
                                  <Badge variant="secondary" className="ml-auto text-xs">{avg.count}</Badge>
                                </div>
                                <p className="text-xl font-bold tabular-nums">{avg.avgPercentage}%</p>
                                <p className="text-xs text-muted-foreground">avg score: {avg.avgScore}</p>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* ---- Scores Tab ---- */}
            <TabsContent value="scores" className="mt-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">Loading data...</div>
              ) : !data || Object.keys(data.typeAverages).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-lg font-medium">No score data</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Automated metrics table */}
                  <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Automated Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Type</th>
                              <th className="text-right py-2 px-3 font-semibold text-muted-foreground">Count</th>
                              <th className="text-right py-2 px-3 font-semibold text-muted-foreground">Avg Score</th>
                              <th className="text-right py-2 px-3 font-semibold text-muted-foreground">Avg %</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(data.typeAverages).map(([type, avg]) => {
                              const meta = ASSESSMENT_TYPES[type];
                              return (
                                <tr key={type} className="border-b border-white/5 hover:bg-white/5">
                                  <td className="py-2 px-3 font-medium">{meta?.label || type}</td>
                                  <td className="py-2 px-3 text-right tabular-nums">{avg.count}</td>
                                  <td className="py-2 px-3 text-right tabular-nums">{avg.avgScore}</td>
                                  <td className="py-2 px-3 text-right tabular-nums">{avg.avgPercentage}%</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Score histogram (larger) */}
                  <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Score Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-11 gap-1">
                        {histogramEntries.map(([label, count]) => (
                          <HistogramBar key={label} label={label} count={count} maxCount={maxHistCount} />
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* CEFR badges */}
                  <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">CEFR Level Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {cefrOrder.map(level => {
                          const count = data.cefrDistribution[level] || 0;
                          const total = data.totalAssessments || 1;
                          const pct = Math.round((count / total) * 100);
                          return (
                            <div key={level} className="text-center">
                              <Badge className={`text-lg px-4 py-2 ${CEFR_COLORS[level]}`}>{level}</Badge>
                              <p className="text-lg font-bold tabular-nums mt-2">{count}</p>
                              <p className="text-xs text-muted-foreground">{pct}%</p>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* ---- Phases Tab ---- */}
            <TabsContent value="phases" className="mt-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">Loading data...</div>
              ) : !data || Object.keys(data.phaseAverages).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-lg font-medium">No phase data</p>
                  <p className="text-sm mt-1">Phase data will appear when assessments have test windows (pre/post/delayed).</p>
                </div>
              ) : (
                <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Per-Phase Averages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Phase</th>
                            <th className="text-right py-2 px-3 font-semibold text-muted-foreground">Count</th>
                            <th className="text-right py-2 px-3 font-semibold text-muted-foreground">Avg %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(data.phaseAverages).map(([phase, avg]) => (
                            <tr key={phase} className="border-b border-white/5 hover:bg-white/5">
                              <td className="py-2 px-3 font-medium capitalize">{phase}</td>
                              <td className="py-2 px-3 text-right tabular-nums">{avg.count}</td>
                              <td className="py-2 px-3 text-right tabular-nums">{avg.avgPercentage}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* ---- Players Tab ---- */}
            <TabsContent value="players" className="mt-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">Loading data...</div>
              ) : !data || data.players.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-lg font-medium">No player data</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Input
                    placeholder="Search players..."
                    className="max-w-sm"
                    value={playerSearch}
                    onChange={e => setPlayerSearch(e.target.value)}
                  />
                  <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Player</th>
                              <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Assessments</th>
                              <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Avg %</th>
                              <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Last Assessment</th>
                              <th className="py-3 px-4"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredPlayers.map(player => (
                              <tr key={player.playerId} className="border-b border-white/5 hover:bg-white/5 cursor-pointer">
                                <td className="py-3 px-4 font-medium">{player.playerId}</td>
                                <td className="py-3 px-4 text-right tabular-nums">{player.assessmentCount}</td>
                                <td className="py-3 px-4 text-right tabular-nums">{player.avgPercentage}%</td>
                                <td className="py-3 px-4 text-right text-muted-foreground">
                                  {player.lastAssessment ? new Date(player.lastAssessment).toLocaleDateString() : '-'}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
