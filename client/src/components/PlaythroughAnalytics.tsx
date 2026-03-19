import { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import {
  GamepadIcon, Clock, Activity, User, GraduationCap, Radio,
  ChevronRight, ChevronDown, BarChart3, Info,
} from 'lucide-react';
import { AssessmentDashboard } from './AssessmentDashboard';
import { TelemetryMonitorDashboard } from './TelemetryMonitorDashboard';

interface Playthrough {
  id: string;
  userId: string;
  worldId: string;
  name?: string;
  status: string;
  currentTimestep?: number;
  playtime?: number;
  actionsCount?: number;
  createdAt: string;
  lastPlayedAt?: string;
}

interface PlaythroughAnalyticsProps {
  worldId: string;
}

type ActiveView = 'playthroughs' | 'assessments' | 'telemetry';
type RightPanel = 'summary' | 'details';

const VIEW_META: Record<ActiveView, { label: string; icon: typeof Activity; group: string }> = {
  playthroughs: { label: 'Playthroughs', icon: GamepadIcon, group: 'Player Data' },
  assessments:  { label: 'Assessments',  icon: GraduationCap, group: 'Player Data' },
  telemetry:    { label: 'Telemetry',    icon: Radio, group: 'System' },
};

const GROUPS = ['Player Data', 'System'];

export function PlaythroughAnalytics({ worldId }: PlaythroughAnalyticsProps) {
  const [playthroughs, setPlaythroughs] = useState<Playthrough[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  // Three-panel state
  const [activeView, setActiveView] = useState<ActiveView>('playthroughs');
  const [selectedPlaythrough, setSelectedPlaythrough] = useState<Playthrough | null>(null);
  const [expandedSection, setExpandedSection] = useState<RightPanel | null>('summary');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(GROUPS));

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
                          onClick={() => { setActiveView('playthroughs'); setSelectedPlaythrough(null); }}
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
                            {Array.from(playthroughGroups.entries()).map(([status, items]) => (
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
                                  <Badge variant="secondary" className="ml-auto text-[10px] px-1 py-0">{items.length}</Badge>
                                </button>

                                {expandedGroups.has(`pt-${status}`) && items.map(p => (
                                  <button
                                    key={p.id}
                                    className={`w-full text-left px-8 py-1 text-[11px] hover:bg-muted/50 transition-colors truncate ${
                                      selectedPlaythrough?.id === p.id ? 'bg-primary/15 text-primary font-medium' : ''
                                    }`}
                                    onClick={() => { setActiveView('playthroughs'); setSelectedPlaythrough(p); }}
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
                      onClick={() => { setActiveView(id); setSelectedPlaythrough(null); }}
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

  // ─── Center panel ────────────────────────────────────────────────────────

  const renderCenter = () => {
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

              {playthroughs.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">All Playthroughs</h3>
                  {playthroughs.map(p => (
                    <button
                      key={p.id}
                      className="w-full text-left bg-muted/30 hover:bg-muted/50 rounded-lg p-3 transition-colors"
                      onClick={() => setSelectedPlaythrough(p)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{p.name || 'Unnamed Playthrough'}</span>
                        <Badge variant={p.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                          {p.status}
                        </Badge>
                      </div>
                      <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
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

    // Selected playthrough detail
    return (
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        <div className="px-4 py-3 border-b shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold break-words">{selectedPlaythrough.name || 'Unnamed Playthrough'}</h2>
            <Badge variant={selectedPlaythrough.status === 'active' ? 'default' : 'secondary'}>
              {selectedPlaythrough.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Player ID: {selectedPlaythrough.userId}
          </p>
        </div>

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

        <ScrollArea className="flex-1">
          <div className="p-4">
            <p className="text-sm text-muted-foreground">
              Detailed playthrough timeline and event data will appear here as the analytics system is expanded.
            </p>
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
                      {section.id === 'summary' && (
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
                        </>
                      )}

                      {section.id === 'details' && !selectedPlaythrough && (
                        <p className="text-xs text-muted-foreground">
                          {activeView === 'playthroughs' && 'Select a playthrough to see details'}
                          {activeView === 'assessments' && 'Assessment data and CEFR distribution is shown in the center panel'}
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
