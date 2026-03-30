import { useState, useEffect, useMemo, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import {
  GamepadIcon, Clock, Activity, User, GraduationCap, Radio,
  ChevronRight, ChevronDown, BarChart3, Info, TrendingUp, MapPin, Layers, Shield,
  ArrowLeft, CheckCircle, XCircle, AlertCircle, Target, GitCompareArrows,
  Heart, MessageSquare, Trash2,
} from 'lucide-react';
import { AssessmentDashboard } from './AssessmentDashboard';
import { TelemetryMonitorDashboard } from './TelemetryMonitorDashboard';
import { LearningProgressVisualization } from './LearningProgressVisualization';
import { PlaythroughComparison } from './PlaythroughComparison';
import { AnalyticsOverview } from './AnalyticsOverview';

interface Playthrough {
  id: string;
  userId: string;
  worldId: string;
  name?: string;
  userName?: string;
  userEmail?: string;
  status: string;
  currentTimestep?: number;
  playtime?: number;
  actionsCount?: number;
  decisionsCount?: number;
  createdAt: string;
  lastPlayedAt?: string;
  completedAt?: string;
}

interface TimelineEvent {
  id: string;
  timestep: number;
  actionType: string;
  actionName: string | null;
  outcome: string | null;
  locationId: string | null;
  targetType: string | null;
  narrativeText: string | null;
  durationMs: number | null;
  timestamp: string | null;
}

interface ReputationEntry {
  id: string;
  entityType: string;
  entityId: string;
  score: number;
  violationCount?: number;
  warningCount?: number;
}

interface RelationshipEntry {
  id: string;
  sourceData: {
    fromCharacterId: string;
    toCharacterId: string;
    type: string;
    strength: number;
    metadata?: any;
  };
}

interface ConversationEntry {
  id: string;
  npcCharacterName?: string;
  npcCharacterId: string;
  turnCount: number;
  targetLanguage?: string;
  targetLanguagePercentage?: number;
  fluencyGained?: number;
  topics?: string[];
  startedAt?: string;
  durationMs?: number;
}

interface JourneyData {
  playthrough: Playthrough;
  summary: {
    totalTraces: number;
    totalDeltas: number;
    totalReputations: number;
    totalRelationships: number;
    totalConversations: number;
    avgDurationMs: number | null;
    uniqueLocations: number;
    uniqueActionTypes: number;
  };
  actionBreakdown: Record<string, number>;
  outcomeBreakdown: Record<string, number>;
  locationVisits: Record<string, number>;
  deltaBreakdown: Record<string, { creates: number; updates: number; deletes: number }>;
  actionsPerTimestep: Record<string, number>;
  reputations: ReputationEntry[];
  relationships: RelationshipEntry[];
  conversations: ConversationEntry[];
  timeline: TimelineEvent[];
}

interface PlaythroughAnalyticsProps {
  worldId: string;
}

type ActiveView = 'overview' | 'playthroughs' | 'comparison' | 'assessments' | 'learning_progress' | 'telemetry';
type DetailTab = 'timeline' | 'actions' | 'locations' | 'changes' | 'reputations' | 'relationships' | 'conversations';
type RightPanel = 'summary' | 'details';

const VIEW_META: Record<ActiveView, { label: string; icon: typeof Activity; group: string }> = {
  overview:          { label: 'Overview',           icon: BarChart3,      group: 'Player Data' },
  playthroughs:      { label: 'Playthroughs',       icon: GamepadIcon,    group: 'Player Data' },
  comparison:        { label: 'Compare',             icon: GitCompareArrows, group: 'Player Data' },
  assessments:       { label: 'Assessments',         icon: GraduationCap, group: 'Player Data' },
  learning_progress: { label: 'Learning Progress',   icon: TrendingUp,    group: 'Player Data' },
  telemetry:         { label: 'Telemetry',           icon: Radio,         group: 'System' },
};

const GROUPS = ['Player Data', 'System'];

const DETAIL_TABS: { id: DetailTab; label: string; icon: typeof Activity }[] = [
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'actions', label: 'Actions', icon: Activity },
  { id: 'locations', label: 'Locations', icon: MapPin },
  { id: 'changes', label: 'World Changes', icon: Layers },
  { id: 'reputations', label: 'Reputations', icon: Shield },
  { id: 'relationships', label: 'Relationships', icon: Heart },
  { id: 'conversations', label: 'Conversations', icon: MessageSquare },
];

const OUTCOME_ICONS: Record<string, typeof CheckCircle> = {
  success: CheckCircle,
  failure: XCircle,
  partial: AlertCircle,
};

const OUTCOME_COLORS: Record<string, string> = {
  success: 'text-green-600 dark:text-green-400',
  failure: 'text-red-600 dark:text-red-400',
  partial: 'text-yellow-600 dark:text-yellow-400',
  unknown: 'text-muted-foreground',
};

export function PlaythroughAnalytics({ worldId }: PlaythroughAnalyticsProps) {
  const [playthroughs, setPlaythroughs] = useState<Playthrough[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  // Three-panel state
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const [selectedPlaythrough, setSelectedPlaythrough] = useState<Playthrough | null>(null);
  const [expandedSection, setExpandedSection] = useState<RightPanel | null>('summary');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(GROUPS));

  // Journey detail state
  const [journeyData, setJourneyData] = useState<JourneyData | null>(null);
  const [journeyLoading, setJourneyLoading] = useState(false);
  const [detailTab, setDetailTab] = useState<DetailTab>('timeline');

  useEffect(() => {
    loadPlaythroughs();
  }, [worldId, token]);

  const loadPlaythroughs = async () => {
    if (!token) {
      setError('Authentication required to view analytics');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/worlds/${worldId}/analytics/playthroughs`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPlaythroughs(data);
        setError(null);
      } else if (response.status === 403) {
        setError('Only world owners can view analytics');
      } else {
        setError('Failed to load playthrough analytics');
      }
    } catch (err) {
      console.error('Failed to load playthroughs:', err);
      setError('Failed to load playthrough analytics');
    } finally {
      setLoading(false);
    }
  };

  const loadJourneyData = useCallback(async (playthroughId: string) => {
    if (!token) return;
    try {
      setJourneyLoading(true);
      const response = await fetch(
        `/api/worlds/${worldId}/analytics/playthroughs/${playthroughId}/journey`,
        { headers: { 'Authorization': `Bearer ${token}` } },
      );
      if (response.ok) {
        setJourneyData(await response.json());
      }
    } catch (err) {
      console.error('Failed to load journey data:', err);
    } finally {
      setJourneyLoading(false);
    }
  }, [worldId, token]);

  const selectPlaythrough = useCallback((p: Playthrough | null) => {
    setSelectedPlaythrough(p);
    setActiveView('playthroughs');
    setDetailTab('timeline');
    if (p) {
      setJourneyData(null);
      loadJourneyData(p.id);
    } else {
      setJourneyData(null);
    }
  }, [loadJourneyData]);

  const deleteItem = useCallback(async (type: 'truths' | 'deltas' | 'conversations', itemId: string) => {
    if (!selectedPlaythrough || !token) return;
    try {
      const res = await fetch(`/api/playthroughs/${selectedPlaythrough.id}/${type}/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        // Refresh journey data
        loadJourneyData(selectedPlaythrough.id);
      }
    } catch (e) {
      console.error(`Failed to delete ${type} item:`, e);
    }
  }, [selectedPlaythrough, token, loadJourneyData]);

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMs = (ms: number | null) => {
    if (ms == null) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const totalPlaytime = playthroughs.reduce((sum, p) => sum + (p.playtime || 0), 0);
  const totalActions = playthroughs.reduce((sum, p) => sum + (p.actionsCount || 0), 0);
  const activePlayers = playthroughs.filter(p => p.status === 'active').length;

  // Group playthroughs by status
  const playthroughGroups = useMemo(() => {
    const groups = new Map<string, Playthrough[]>();
    playthroughs.forEach(p => {
      const status = p.status || 'unknown';
      if (!groups.has(status)) groups.set(status, []);
      groups.get(status)!.push(p);
    });
    return groups;
  }, [playthroughs]);

  // Sorted action breakdown for charts
  const sortedActionBreakdown = useMemo(() => {
    if (!journeyData) return [];
    return Object.entries(journeyData.actionBreakdown)
      .sort((a, b) => b[1] - a[1]);
  }, [journeyData]);

  // Sorted location visits
  const sortedLocationVisits = useMemo(() => {
    if (!journeyData) return [];
    return Object.entries(journeyData.locationVisits)
      .sort((a, b) => b[1] - a[1]);
  }, [journeyData]);

  // Engagement chart data (actions per timestep)
  const engagementData = useMemo(() => {
    if (!journeyData) return [];
    return Object.entries(journeyData.actionsPerTimestep)
      .map(([ts, count]) => ({ timestep: Number(ts), count }))
      .sort((a, b) => a.timestep - b.timestep);
  }, [journeyData]);

  const maxEngagement = useMemo(() => {
    return Math.max(1, ...engagementData.map(d => d.count));
  }, [engagementData]);

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  // ─── Left panel: vertical tree navigation ────────────────────────────────

  const renderTree = () => (
    <div className="flex flex-col h-full border-r">
      <div className="flex items-center justify-between px-3 py-2.5 border-b bg-muted/30 shrink-0">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Analytics</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="py-1">
          {GROUPS.map(group => {
            const items = (Object.entries(VIEW_META) as [ActiveView, typeof VIEW_META[ActiveView]][])
              .filter(([, meta]) => meta.group === group);

            return (
              <div key={group}>
                <button
                  className="flex items-center gap-1 w-full px-3 py-1.5 hover:bg-muted/50 text-left"
                  onClick={() => toggleGroup(group)}
                >
                  {expandedGroups.has(group) ? (
                    <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0 -rotate-90" />
                  )}
                  <span className="text-xs font-medium">{group}</span>
                  <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">{items.length}</Badge>
                </button>

                {expandedGroups.has(group) && items.map(([id, meta]) => {
                  const Icon = meta.icon;
                  const isActive = activeView === id;

                  // For playthroughs, show expandable sub-items
                  if (id === 'playthroughs') {
                    return (
                      <div key={id}>
                        <button
                          className={`w-full text-left flex items-center gap-2 px-6 py-1.5 text-xs hover:bg-muted/50 transition-colors ${
                            isActive && !selectedPlaythrough ? 'bg-primary/15 text-primary font-medium' : ''
                          }`}
                          onClick={() => { setActiveView('playthroughs'); selectPlaythrough(null); }}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{meta.label}</span>
                          {playthroughs.length > 0 && (
                            <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">{playthroughs.length}</Badge>
                          )}
                        </button>

                        {/* Individual playthroughs grouped by status */}
                        {activeView === 'playthroughs' && !loading && !error && playthroughs.length > 0 && (
                          <div className="ml-4">
                            {Array.from(playthroughGroups.entries()).map(([status, statusItems]) => (
                              <div key={status}>
                                <button
                                  className="flex items-center gap-1 w-full px-4 py-1 hover:bg-muted/50 text-left"
                                  onClick={() => toggleGroup(`pt-${status}`)}
                                >
                                  {expandedGroups.has(`pt-${status}`) ? (
                                    <ChevronDown className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
                                  ) : (
                                    <ChevronDown className="w-2.5 h-2.5 text-muted-foreground shrink-0 -rotate-90" />
                                  )}
                                  <span className="text-[10px] font-medium capitalize text-muted-foreground">{status}</span>
                                  <Badge variant="secondary" className="ml-auto text-[10px] px-1 py-0">{statusItems.length}</Badge>
                                </button>

                                {expandedGroups.has(`pt-${status}`) && statusItems.map(p => (
                                  <button
                                    key={p.id}
                                    className={`w-full text-left px-8 py-1 text-[11px] hover:bg-muted/50 transition-colors truncate ${
                                      selectedPlaythrough?.id === p.id ? 'bg-primary/15 text-primary font-medium' : ''
                                    }`}
                                    onClick={() => selectPlaythrough(p)}
                                  >
                                    {p.name || `Player ${p.userId.substring(0, 8)}...`}
                                  </button>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <button
                      key={id}
                      className={`w-full text-left flex items-center gap-2 px-6 py-1.5 text-xs hover:bg-muted/50 transition-colors ${
                        isActive ? 'bg-primary/15 text-primary font-medium' : ''
                      }`}
                      onClick={() => { setActiveView(id); setSelectedPlaythrough(null); setJourneyData(null); }}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{meta.label}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );

  // ─── Detail tabs for selected playthrough ─────────────────────────────────

  const renderDetailTabs = () => {
    if (!journeyData) return null;

    return (
      <>
        {detailTab === 'timeline' && renderTimeline()}
        {detailTab === 'actions' && renderActionBreakdown()}
        {detailTab === 'locations' && renderLocationVisits()}
        {detailTab === 'changes' && renderWorldChanges()}
        {detailTab === 'reputations' && renderReputations()}
        {detailTab === 'relationships' && renderRelationships()}
        {detailTab === 'conversations' && renderConversations()}
      </>
    );
  };

  const renderTimeline = () => {
    const events = journeyData!.timeline;
    if (events.length === 0) {
      return <p className="text-sm text-muted-foreground">No events recorded yet.</p>;
    }

    return (
      <div className="space-y-4">
        {/* Engagement mini-chart */}
        {engagementData.length > 1 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Actions per Timestep
            </h4>
            <div className="flex items-end gap-px h-16 bg-muted/20 rounded p-1">
              {engagementData.map(d => (
                <div
                  key={d.timestep}
                  className="flex-1 bg-primary/60 hover:bg-primary/80 rounded-t transition-colors min-w-[2px]"
                  style={{ height: `${(d.count / maxEngagement) * 100}%` }}
                  title={`Timestep ${d.timestep}: ${d.count} actions`}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>Timestep {engagementData[0]?.timestep}</span>
              <span>Timestep {engagementData[engagementData.length - 1]?.timestep}</span>
            </div>
          </div>
        )}

        {/* Event list */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Events ({events.length})
          </h4>
          <div className="space-y-1">
            {events.map(event => {
              const OutcomeIcon = OUTCOME_ICONS[event.outcome || ''] || Target;
              const outcomeColor = OUTCOME_COLORS[event.outcome || ''] || OUTCOME_COLORS.unknown;

              return (
                <div key={event.id} className="bg-muted/20 rounded p-2 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <OutcomeIcon className={`w-3.5 h-3.5 shrink-0 ${outcomeColor}`} />
                    <span className="text-xs font-medium truncate">
                      {event.actionName || event.actionType}
                    </span>
                    <Badge variant="outline" className="text-[10px] px-1 py-0 shrink-0">
                      {event.actionType}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground ml-auto shrink-0">
                      T{event.timestep}
                    </span>
                    <button
                      className="text-muted-foreground/40 hover:text-destructive transition-colors shrink-0"
                      title="Delete this event"
                      onClick={() => deleteItem('truths', event.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  {event.narrativeText && (
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 pl-5">
                      {event.narrativeText}
                    </p>
                  )}
                  <div className="flex gap-3 mt-1 pl-5 text-[10px] text-muted-foreground">
                    {event.locationId && <span>@ {event.locationId.substring(0, 12)}...</span>}
                    {event.targetType && <span>Target: {event.targetType}</span>}
                    {event.durationMs != null && <span>{formatMs(event.durationMs)}</span>}
                    {event.timestamp && <span>{formatDate(event.timestamp)}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderActionBreakdown = () => {
    if (sortedActionBreakdown.length === 0) {
      return <p className="text-sm text-muted-foreground">No actions recorded yet.</p>;
    }

    const total = sortedActionBreakdown.reduce((s, [, c]) => s + c, 0);

    return (
      <div className="space-y-4">
        {/* Action type distribution */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Action Types ({sortedActionBreakdown.length})
          </h4>
          <div className="space-y-1.5">
            {sortedActionBreakdown.map(([type, count]) => {
              const pct = Math.round((count / total) * 100);
              return (
                <div key={type}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="font-medium capitalize">{type.replace(/_/g, ' ')}</span>
                    <span className="text-muted-foreground">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary/70 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Outcome distribution */}
        {Object.keys(journeyData!.outcomeBreakdown).length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Outcomes
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(journeyData!.outcomeBreakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([outcome, count]) => {
                  const OutcomeIcon = OUTCOME_ICONS[outcome] || Target;
                  const color = OUTCOME_COLORS[outcome] || OUTCOME_COLORS.unknown;
                  return (
                    <div key={outcome} className="bg-muted/20 rounded p-2 flex items-center gap-2">
                      <OutcomeIcon className={`w-4 h-4 ${color}`} />
                      <div>
                        <p className="text-sm font-bold tabular-nums">{count}</p>
                        <p className="text-[10px] text-muted-foreground capitalize">{outcome}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Avg duration */}
        {journeyData!.summary.avgDurationMs != null && (
          <div className="bg-muted/20 rounded p-3">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Action Duration</span>
            <p className="text-lg font-bold">{formatMs(journeyData!.summary.avgDurationMs)}</p>
          </div>
        )}
      </div>
    );
  };

  const renderLocationVisits = () => {
    if (sortedLocationVisits.length === 0) {
      return <p className="text-sm text-muted-foreground">No location data recorded.</p>;
    }

    const maxVisits = sortedLocationVisits[0]?.[1] || 1;

    return (
      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Visited Locations ({sortedLocationVisits.length})
          </h4>
          <div className="space-y-1.5">
            {sortedLocationVisits.map(([locId, count]) => (
              <div key={locId} className="bg-muted/20 rounded p-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-mono truncate max-w-[70%]">{locId}</span>
                  <span className="text-xs text-muted-foreground">{count} visits</span>
                </div>
                <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500/70 rounded-full"
                    style={{ width: `${(count / maxVisits) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderWorldChanges = () => {
    const entries = Object.entries(journeyData!.deltaBreakdown);
    if (entries.length === 0) {
      return <p className="text-sm text-muted-foreground">No world changes recorded.</p>;
    }

    return (
      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            World Changes by Entity Type
          </h4>
          <div className="space-y-2">
            {entries.sort((a, b) => {
              const totalA = a[1].creates + a[1].updates + a[1].deletes;
              const totalB = b[1].creates + b[1].updates + b[1].deletes;
              return totalB - totalA;
            }).map(([entityType, ops]) => {
              const total = ops.creates + ops.updates + ops.deletes;
              return (
                <div key={entityType} className="bg-muted/20 rounded p-2">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-medium capitalize">{entityType}</span>
                    <span className="text-[10px] text-muted-foreground">{total} total</span>
                  </div>
                  <div className="flex gap-3 text-[10px]">
                    {ops.creates > 0 && (
                      <span className="text-green-600 dark:text-green-400">+{ops.creates} created</span>
                    )}
                    {ops.updates > 0 && (
                      <span className="text-blue-600 dark:text-blue-400">{ops.updates} updated</span>
                    )}
                    {ops.deletes > 0 && (
                      <span className="text-red-600 dark:text-red-400">-{ops.deletes} deleted</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-muted/20 rounded p-3">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Deltas</span>
          <p className="text-lg font-bold">{journeyData!.summary.totalDeltas}</p>
        </div>
      </div>
    );
  };

  const renderReputations = () => {
    const reps = journeyData!.reputations;
    if (reps.length === 0) {
      return <p className="text-sm text-muted-foreground">No reputation data recorded.</p>;
    }

    return (
      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Reputations ({reps.length})
          </h4>
          <div className="space-y-1.5">
            {reps.sort((a, b) => b.score - a.score).map(rep => {
              const scoreColor = rep.score > 25 ? 'text-green-600 dark:text-green-400'
                : rep.score < -25 ? 'text-red-600 dark:text-red-400'
                : 'text-muted-foreground';
              const barWidth = Math.abs(rep.score);
              const isPositive = rep.score >= 0;

              return (
                <div key={rep.id} className="bg-muted/20 rounded p-2">
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-xs">
                      <span className="font-medium capitalize">{rep.entityType}</span>
                      <span className="text-muted-foreground"> / {rep.entityId.substring(0, 12)}...</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold tabular-nums ${scoreColor}`}>
                        {rep.score > 0 ? '+' : ''}{rep.score}
                      </span>
                      <button className="text-muted-foreground/40 hover:text-destructive transition-colors" title="Delete" onClick={() => deleteItem('truths', rep.id)}>
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  {/* Score bar centered at 0 */}
                  <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden flex">
                    <div className="w-1/2 flex justify-end">
                      {!isPositive && (
                        <div
                          className="h-full bg-red-500/60 rounded-l-full"
                          style={{ width: `${barWidth}%` }}
                        />
                      )}
                    </div>
                    <div className="w-1/2">
                      {isPositive && (
                        <div
                          className="h-full bg-green-500/60 rounded-r-full"
                          style={{ width: `${barWidth}%` }}
                        />
                      )}
                    </div>
                  </div>
                  {(rep.violationCount || rep.warningCount) ? (
                    <div className="flex gap-3 mt-1 text-[10px] text-muted-foreground">
                      {rep.violationCount ? <span>{rep.violationCount} violations</span> : null}
                      {rep.warningCount ? <span>{rep.warningCount} warnings</span> : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderRelationships = () => {
    const rels = journeyData!.relationships || [];
    if (rels.length === 0) {
      return <p className="text-sm text-muted-foreground">No relationship data recorded.</p>;
    }

    return (
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Relationships ({rels.length})
        </h4>
        <div className="space-y-1.5">
          {rels.sort((a, b) => (b.sourceData?.strength || 0) - (a.sourceData?.strength || 0)).map(rel => {
            const data = rel.sourceData || {} as any;
            const strength = data.strength || 0;
            const scoreColor = strength > 0.3 ? 'text-green-600 dark:text-green-400'
              : strength < -0.3 ? 'text-red-600 dark:text-red-400'
              : 'text-muted-foreground';
            const barWidth = Math.min(100, Math.abs(strength) * 100);
            const isPositive = strength >= 0;

            return (
              <div key={rel.id} className="bg-muted/20 rounded p-2">
                <div className="flex justify-between items-center mb-1">
                  <div className="text-xs">
                    <span className="font-medium capitalize">{data.type || 'unknown'}</span>
                    <span className="text-muted-foreground"> {data.fromCharacterId?.substring(0, 8)}... &rarr; {data.toCharacterId?.substring(0, 8)}...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold tabular-nums ${scoreColor}`}>
                      {strength > 0 ? '+' : ''}{strength.toFixed(2)}
                    </span>
                    <button className="text-muted-foreground/40 hover:text-destructive transition-colors" title="Delete" onClick={() => deleteItem('truths', rel.id)}>
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden flex">
                  <div className="w-1/2 flex justify-end">
                    {!isPositive && (
                      <div className="h-full bg-red-500/60 rounded-l-full" style={{ width: `${barWidth}%` }} />
                    )}
                  </div>
                  <div className="w-1/2">
                    {isPositive && (
                      <div className="h-full bg-green-500/60 rounded-r-full" style={{ width: `${barWidth}%` }} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderConversations = () => {
    const convos = journeyData!.conversations || [];
    if (convos.length === 0) {
      return <p className="text-sm text-muted-foreground">No conversations recorded.</p>;
    }

    return (
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          NPC Conversations ({convos.length})
        </h4>
        <div className="space-y-1.5">
          {convos.map((convo: any) => (
            <div key={convo.id} className="bg-muted/20 rounded p-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium">{convo.npcCharacterName || convo.npcCharacterId?.substring(0, 12) || 'Unknown NPC'}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{convo.turnCount || 0} turns</span>
                  <button className="text-muted-foreground/40 hover:text-destructive transition-colors" title="Delete" onClick={() => deleteItem('conversations', convo.id)}>
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[10px] text-muted-foreground">
                {convo.targetLanguage && <span>Language: {convo.targetLanguage}</span>}
                {convo.targetLanguagePercentage != null && <span>{Math.round(convo.targetLanguagePercentage)}% target language</span>}
                {convo.fluencyGained ? <span className="text-green-600 dark:text-green-400">+{convo.fluencyGained.toFixed(1)} fluency</span> : null}
                {convo.durationMs ? <span>{Math.round(convo.durationMs / 1000)}s</span> : null}
              </div>
              {convo.topics?.length > 0 && (
                <div className="flex gap-1 mt-1 flex-wrap">
                  {convo.topics.map((t: string) => (
                    <Badge key={t} variant="outline" className="text-[9px] px-1 py-0">{t}</Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ─── Center panel ────────────────────────────────────────────────────────

  const renderCenter = () => {
    // Overview — cross-playthrough aggregated insights
    if (activeView === 'overview') {
      return (
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          <div className="px-4 py-3 border-b shrink-0">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <h2 className="text-lg font-bold">Analytics Overview</h2>
              <Badge variant="outline" className="text-[10px]">Cross-Playthrough</Badge>
            </div>
          </div>
          <AnalyticsOverview worldId={worldId} />
        </div>
      );
    }

    // Assessments
    if (activeView === 'assessments') {
      return (
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          <div className="px-4 py-3 border-b shrink-0">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-primary" />
              <h2 className="text-lg font-bold">Assessments</h2>
              <Badge variant="outline" className="text-[10px]">Player Data</Badge>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4">
              <AssessmentDashboard worldId={worldId} />
            </div>
          </ScrollArea>
        </div>
      );
    }

    // Telemetry
    if (activeView === 'telemetry') {
      return (
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          <div className="px-4 py-3 border-b shrink-0">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-primary" />
              <h2 className="text-lg font-bold">Telemetry</h2>
              <Badge variant="outline" className="text-[10px]">System</Badge>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4">
              <TelemetryMonitorDashboard worldId={worldId} />
            </div>
          </ScrollArea>
        </div>
      );
    }

    // Comparison view
    if (activeView === 'comparison') {
      return (
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          <div className="px-4 py-3 border-b shrink-0">
            <div className="flex items-center gap-2">
              <GitCompareArrows className="w-4 h-4 text-primary" />
              <h2 className="text-lg font-bold">Compare Playthroughs</h2>
              <Badge variant="outline" className="text-[10px]">Research</Badge>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4">
              <PlaythroughComparison worldId={worldId} playthroughs={playthroughs} />
            </div>
          </ScrollArea>
        </div>
      );
    }

    // Learning Progress
    if (activeView === 'learning_progress') {
      return (
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          <div className="px-4 py-3 border-b shrink-0">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h2 className="text-lg font-bold">Learning Progress</h2>
              <Badge variant="outline" className="text-[10px]">Player Data</Badge>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4">
              {selectedPlaythrough ? (
                <LearningProgressVisualization
                  worldId={worldId}
                  playerName={selectedPlaythrough.name || selectedPlaythrough.userId}
                  playthroughId={selectedPlaythrough.id}
                />
              ) : playthroughs.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Select a player to view their learning progress, or view aggregate data below.
                  </p>
                  {playthroughs.map(p => (
                    <button
                      key={p.id}
                      className="w-full text-left bg-muted/30 hover:bg-muted/50 rounded-lg p-3 transition-colors"
                      onClick={() => setSelectedPlaythrough(p)}
                    >
                      <span className="text-sm font-medium">{p.name || `Player ${p.userId.substring(0, 8)}...`}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No playthroughs available.</p>
              )}
            </div>
          </ScrollArea>
        </div>
      );
    }

    // Playthroughs: no selection — overview
    if (!selectedPlaythrough) {
      if (loading) {
        return (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Loading playthrough data...
          </div>
        );
      }
      if (error) {
        return (
          <div className="flex-1 flex items-center justify-center text-destructive">
            {error}
          </div>
        );
      }
      return (
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          <div className="px-4 py-3 border-b shrink-0">
            <div className="flex items-center gap-2">
              <GamepadIcon className="w-4 h-4 text-primary" />
              <h2 className="text-lg font-bold">Playthrough Overview</h2>
              <Badge variant="outline" className="text-[10px]">Player Data</Badge>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {/* Summary stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={User} label="Total Players" value={playthroughs.length} sub={`${activePlayers} active`} />
                <StatCard icon={Clock} label="Total Playtime" value={formatDuration(totalPlaytime)} sub="Across all players" />
                <StatCard icon={Activity} label="Total Actions" value={totalActions.toLocaleString()} sub="Player interactions" />
                <StatCard icon={GamepadIcon} label="Avg. Actions" value={playthroughs.length > 0 ? Math.round(totalActions / playthroughs.length) : 0} sub="Per player" />
              </div>

              {/* Status breakdown */}
              {playthroughGroups.size > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Status Breakdown</h3>
                  <div className="flex gap-2 flex-wrap">
                    {Array.from(playthroughGroups.entries()).map(([status, group]) => (
                      <div key={status} className="bg-muted/30 rounded-lg px-3 py-2">
                        <p className="text-lg font-bold">{group.length}</p>
                        <p className="text-[10px] text-muted-foreground capitalize">{status}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {playthroughs.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">All Playthroughs</h3>
                  {playthroughs.map(p => (
                    <button
                      key={p.id}
                      className="w-full text-left bg-muted/30 hover:bg-muted/50 rounded-lg p-3 transition-colors"
                      onClick={() => selectPlaythrough(p)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{p.name || 'Unnamed Playthrough'}</span>
                        <Badge variant={p.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                          {p.status}
                        </Badge>
                      </div>
                      <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                        <span>{p.userName || p.userId.substring(0, 12)}</span>
                        <span>{p.actionsCount || 0} actions</span>
                        <span>{formatDuration(p.playtime)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      );
    }

    // Selected playthrough detail with journey data
    return (
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        {/* Header */}
        <div className="px-4 py-3 border-b shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <button
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => selectPlaythrough(null)}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-bold break-words flex-1">{selectedPlaythrough.name || 'Unnamed Playthrough'}</h2>
            <Badge variant={selectedPlaythrough.status === 'active' ? 'default' : 'secondary'}>
              {selectedPlaythrough.status}
            </Badge>
            <button
              className="text-muted-foreground hover:text-destructive transition-colors ml-2"
              title="Delete playthrough"
              onClick={async () => {
                if (!confirm(`Delete "${selectedPlaythrough.name || 'Unnamed Playthrough'}" and all its data? This cannot be undone.`)) return;
                try {
                  const res = await fetch(`/api/playthroughs/${selectedPlaythrough.id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  if (res.ok) {
                    setPlaythroughs(prev => prev.filter(p => p.id !== selectedPlaythrough.id));
                    selectPlaythrough(null);
                  }
                } catch (e) {
                  console.error('Failed to delete playthrough:', e);
                }
              }}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground pl-6">
            Player: {selectedPlaythrough.userName || selectedPlaythrough.userId}
            {selectedPlaythrough.userEmail && <span className="ml-2 opacity-60">({selectedPlaythrough.userEmail})</span>}
          </p>
        </div>

        {/* Stat bar */}
        <div className="px-4 py-2.5 border-b bg-muted/20 shrink-0">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
            <div>
              <span className="text-muted-foreground">Actions: </span>
              <span className="font-medium">{selectedPlaythrough.actionsCount || 0}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Playtime: </span>
              <span className="font-medium">{formatDuration(selectedPlaythrough.playtime)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Started: </span>
              <span className="font-medium">{formatDate(selectedPlaythrough.createdAt)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Last Played: </span>
              <span className="font-medium">{formatDate(selectedPlaythrough.lastPlayedAt)}</span>
            </div>
            {selectedPlaythrough.currentTimestep != null && (
              <div>
                <span className="text-muted-foreground">Timestep: </span>
                <span className="font-medium">{selectedPlaythrough.currentTimestep}</span>
              </div>
            )}
          </div>
        </div>

        {/* Detail tabs */}
        <div className="px-4 py-1.5 border-b shrink-0 flex gap-1 overflow-x-auto">
          {DETAIL_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = detailTab === tab.id;
            return (
              <button
                key={tab.id}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors shrink-0 ${
                  isActive
                    ? 'bg-primary/15 text-primary font-medium'
                    : 'hover:bg-muted/50 text-muted-foreground'
                }`}
                onClick={() => setDetailTab(tab.id)}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            {journeyLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                Loading journey data...
              </div>
            ) : journeyData ? (
              renderDetailTabs()
            ) : (
              <p className="text-sm text-muted-foreground">Failed to load journey data.</p>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  };

  // ─── Right panel: collapsible sections ───────────────────────────────────

  const renderRight = () => {
    const sections: { id: RightPanel; label: string; icon: typeof Info }[] = [
      { id: 'summary', label: 'Summary', icon: BarChart3 },
      { id: 'details', label: 'Details', icon: Info },
    ];

    return (
      <div className="w-64 shrink-0 border-l flex flex-col min-h-0">
        {sections.map((section, idx) => {
          const isExpanded = expandedSection === section.id;
          const Icon = section.icon;

          return (
            <div
              key={section.id}
              className={`flex flex-col min-h-0 ${idx > 0 ? 'border-t' : ''} ${isExpanded ? 'flex-1' : ''}`}
            >
              <button
                className="flex items-center gap-1.5 px-3 py-2 border-b bg-muted/30 shrink-0 hover:bg-muted/50 transition-colors text-left"
                onClick={() => setExpandedSection(isExpanded ? null : section.id)}
              >
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.label}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground ml-auto transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
              </button>

              {isExpanded && (
                <div className="flex-1 min-h-0 flex flex-col">
                  <ScrollArea className="flex-1">
                    <div className="p-3 space-y-3">
                      {section.id === 'summary' && !selectedPlaythrough && (
                        <>
                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Players</span>
                            <p className="text-lg font-bold">{playthroughs.length}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Active</span>
                            <p className="text-lg font-bold">{activePlayers}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Playtime</span>
                            <p className="text-lg font-bold">{formatDuration(totalPlaytime)}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Actions</span>
                            <p className="text-lg font-bold">{totalActions.toLocaleString()}</p>
                          </div>
                        </>
                      )}

                      {section.id === 'summary' && selectedPlaythrough && journeyData && (
                        <>
                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Events Recorded</span>
                            <p className="text-lg font-bold">{journeyData.summary.totalTraces}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">World Changes</span>
                            <p className="text-lg font-bold">{journeyData.summary.totalDeltas}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Action Types</span>
                            <p className="text-lg font-bold">{journeyData.summary.uniqueActionTypes}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Locations Visited</span>
                            <p className="text-lg font-bold">{journeyData.summary.uniqueLocations}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Reputations</span>
                            <p className="text-lg font-bold">{journeyData.summary.totalReputations}</p>
                          </div>
                          {journeyData.summary.avgDurationMs != null && (
                            <div>
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Duration</span>
                              <p className="text-lg font-bold">{formatMs(journeyData.summary.avgDurationMs)}</p>
                            </div>
                          )}
                        </>
                      )}

                      {section.id === 'summary' && selectedPlaythrough && !journeyData && !journeyLoading && (
                        <p className="text-xs text-muted-foreground">No journey data available</p>
                      )}

                      {section.id === 'details' && selectedPlaythrough && (
                        <>
                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Player ID</span>
                            <p className="text-xs font-mono break-all">{selectedPlaythrough.userId}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Playthrough ID</span>
                            <p className="text-xs font-mono break-all">{selectedPlaythrough.id}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Status</span>
                            <div className="mt-1">
                              <Badge variant={selectedPlaythrough.status === 'active' ? 'default' : 'secondary'}>
                                {selectedPlaythrough.status}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Started</span>
                            <p className="text-xs">{formatDate(selectedPlaythrough.createdAt)}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Last Played</span>
                            <p className="text-xs">{formatDate(selectedPlaythrough.lastPlayedAt)}</p>
                          </div>
                        </>
                      )}

                      {section.id === 'details' && !selectedPlaythrough && (
                        <p className="text-xs text-muted-foreground">
                          {activeView === 'playthroughs' && 'Select a playthrough to see details'}
                          {activeView === 'assessments' && 'Assessment data and CEFR distribution is shown in the center panel'}
                          {activeView === 'learning_progress' && 'Select a player to view skill trajectories and mastery curves'}
                          {activeView === 'telemetry' && 'Real-time telemetry monitoring is shown in the center panel'}
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ─── Root ────────────────────────────────────────────────────────────────

  return (
    <div data-testid="playthrough-analytics-readonly" className="flex h-[calc(100vh-10rem)] min-h-[480px] rounded-lg border overflow-hidden bg-background">
      <div className="w-56 shrink-0 flex flex-col">
        {renderTree()}
      </div>
      {renderCenter()}
      {renderRight()}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub }: { icon: typeof User; label: string; value: number | string; sub: string }) {
  return (
    <div className="bg-muted/30 rounded-lg p-3">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        <Icon className="w-4 h-4" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-[10px] text-muted-foreground">{sub}</p>
    </div>
  );
}
