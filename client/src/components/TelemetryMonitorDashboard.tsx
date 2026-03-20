/**
 * Telemetry Monitoring Dashboard (US-6.07)
 *
 * Real-time monitoring of telemetry from exported games.
 * Shows API key status, ingestion rates, error rates, and connected clients.
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity, AlertTriangle, Check, Copy, Eye, EyeOff,
  Key, Loader2, Monitor, Plus, Radio, Trash2, Zap,
} from 'lucide-react';

interface ApiKey {
  id: string;
  key: string;
  name: string;
  createdAt: string;
  lastUsedAt?: string;
  requestCount: number;
}

interface TelemetryStatus {
  totalEvents: number;
  totalSessions: number;
  eventsLast24h: number;
  errorsLast24h: number;
  activeKeys: number;
}

interface TelemetryMonitorDashboardProps {
  worldId: string;
}

export function TelemetryMonitorDashboard({ worldId }: TelemetryMonitorDashboardProps) {
  const queryClient = useQueryClient();
  const [newKeyName, setNewKeyName] = useState('');
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Fetch API keys
  const { data: apiKeys = [], isLoading: keysLoading } = useQuery<ApiKey[]>({
    queryKey: ['/api/worlds', worldId, 'api-keys'],
    refetchInterval: 30000,
  });

  // Fetch telemetry status
  const { data: status } = useQuery<TelemetryStatus>({
    queryKey: ['/api/external/telemetry/status'],
    refetchInterval: 10000,
  });

  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  // Fetch recent engagement sessions
  const { data: sessions = [] } = useQuery<Array<{
    sessionId: string;
    participantId: string;
    startTime: string;
    eventCount: number;
    platform: string;
  }>>({
    queryKey: ['/api/engagement/sessions'],
    refetchInterval: 15000,
  });

  // Generate new API key
  const generateKey = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/worlds/${worldId}/api-keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName || 'New API Key', worldId }),
      });
      if (!response.ok) throw new Error('Failed to generate key');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/worlds', worldId, 'api-keys'] });
      setNewKeyName('');
    },
  });

  // Revoke API key
  const revokeKey = useMutation({
    mutationFn: async (keyId: string) => {
      const response = await fetch(`/api/worlds/${worldId}/api-keys/${keyId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to revoke key');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/worlds', worldId, 'api-keys'] });
    },
  });

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => {
      const next = new Set(prev);
      if (next.has(keyId)) {
        next.delete(keyId);
      } else {
        next.add(keyId);
      }
      return next;
    });
  };

  const copyKey = (key: string, keyId: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-xl p-1">
          <TabsTrigger value="overview" className="gap-2">
            <Monitor className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="gap-2">
            <Key className="w-4 h-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="live" className="gap-2">
            <Radio className="w-4 h-4" />
            Live Sessions
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Zap className="w-4 h-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="errors" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            Errors
          </TabsTrigger>
          <TabsTrigger value="players" className="gap-2">
            <Activity className="w-4 h-4" />
            Players
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              label="Total Events"
              value={status?.totalEvents ?? 0}
              icon={<Zap className="w-4 h-4" />}
            />
            <StatCard
              label="Total Sessions"
              value={status?.totalSessions ?? 0}
              icon={<Activity className="w-4 h-4" />}
            />
            <StatCard
              label="Events (24h)"
              value={status?.eventsLast24h ?? 0}
              icon={<Monitor className="w-4 h-4" />}
            />
            <StatCard
              label="Errors (24h)"
              value={status?.errorsLast24h ?? 0}
              icon={<AlertTriangle className="w-4 h-4" />}
              variant={status?.errorsLast24h ? 'destructive' : 'default'}
            />
          </div>

          <Card className="mt-4 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Integration Guide</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>To send telemetry from exported games:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Generate an API key in the "API Keys" tab</li>
                <li>Configure the telemetry client in your exported game with the API key</li>
                <li>Events will be batched and sent to <code className="bg-black/10 dark:bg-white/10 px-1 rounded">POST /api/telemetry/external/batch</code></li>
                <li>Monitor ingestion in the "Live Sessions" tab</li>
              </ol>
              <p className="mt-2">Supported platforms: Babylon.js, Godot, Unity, Unreal Engine</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api-keys" className="mt-4 space-y-4">
          {/* New key form */}
          <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
            <CardContent className="pt-4">
              <div className="flex items-end gap-3">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Key Name</Label>
                  <Input
                    placeholder="e.g., Production Godot Build"
                    value={newKeyName}
                    onChange={e => setNewKeyName(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <Button
                  onClick={() => generateKey.mutate()}
                  disabled={generateKey.isPending}
                  className="h-8 text-xs"
                >
                  {generateKey.isPending ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Plus className="w-3 h-3 mr-1" />
                  )}
                  Generate Key
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Key list */}
          {keysLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : apiKeys.length === 0 ? (
            <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
              <CardContent className="py-8 text-center text-muted-foreground">
                <Key className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No API keys yet. Generate one to start receiving telemetry.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {apiKeys.map(apiKey => (
                <Card
                  key={apiKey.id}
                  className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl"
                >
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{apiKey.name}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {apiKey.requestCount} requests
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded font-mono">
                            {visibleKeys.has(apiKey.id) ? apiKey.key : `${apiKey.key.slice(0, 12)}${'•'.repeat(20)}`}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0"
                            onClick={() => toggleKeyVisibility(apiKey.id)}
                          >
                            {visibleKeys.has(apiKey.id) ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0"
                            onClick={() => copyKey(apiKey.key, apiKey.id)}
                          >
                            {copiedKey === apiKey.id ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Created {new Date(apiKey.createdAt).toLocaleDateString()}
                          {apiKey.lastUsedAt && ` · Last used ${new Date(apiKey.lastUsedAt).toLocaleDateString()}`}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 h-8"
                        onClick={() => revokeKey.mutate(apiKey.id)}
                        disabled={revokeKey.isPending}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Revoke
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Live Sessions Tab */}
        <TabsContent value="live" className="mt-4">
          <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Radio className="w-4 h-4 text-green-500 animate-pulse" />
                  Active Sessions
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {sessions.length} sessions
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Live telemetry from exported games (refreshes every 15s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Radio className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No active sessions. Export a game and start playing to see telemetry.</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[400px]">
                  <div className="space-y-1">
                    {sessions.map((session, idx) => (
                      <div
                        key={session.sessionId ?? idx}
                        className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                      >
                        <div className="space-y-0.5">
                          <div className="text-xs font-medium">
                            {session.participantId ?? 'Anonymous'}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span>{new Date(session.startTime).toLocaleTimeString()}</span>
                            {session.platform && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5">
                                {session.platform}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-medium">{session.eventCount} events</div>
                          <div className="text-[10px] text-muted-foreground">
                            {session.sessionId?.slice(0, 8)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        {/* Activity Timeline Tab */}
        <TabsContent value="activity" className="mt-4 space-y-4">
          <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Player Activity Timeline</CardTitle>
              <CardDescription className="text-xs">Aggregated events over time (hourly buckets)</CardDescription>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No activity data yet</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {/* Simple hourly bar chart based on session start times */}
                  {(() => {
                    const hourBuckets = Array(24).fill(0);
                    sessions.forEach(s => {
                      const h = new Date(s.startTime).getHours();
                      hourBuckets[h] += s.eventCount;
                    });
                    const maxEvents = Math.max(...hourBuckets, 1);
                    return hourBuckets.map((count, h) => (
                      <div key={h} className="flex items-center gap-2 text-xs">
                        <span className="w-8 text-right text-muted-foreground tabular-nums">{h}:00</span>
                        <div className="flex-1 h-4 rounded bg-muted/30 overflow-hidden">
                          <div
                            className="h-full rounded bg-blue-500/60 transition-all"
                            style={{ width: `${(count / maxEvents) * 100}%` }}
                          />
                        </div>
                        <span className="w-8 text-right tabular-nums text-muted-foreground">{count}</span>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Event Type Distribution */}
          <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Event Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No events</p>
              ) : (
                <div className="space-y-1">
                  {(() => {
                    const platformCounts: Record<string, number> = {};
                    sessions.forEach(s => {
                      const p = s.platform || 'unknown';
                      platformCounts[p] = (platformCounts[p] || 0) + s.eventCount;
                    });
                    const total = Object.values(platformCounts).reduce((a, b) => a + b, 0) || 1;
                    return Object.entries(platformCounts)
                      .sort((a, b) => b[1] - a[1])
                      .map(([platform, count]) => (
                        <div key={platform} className="flex items-center gap-2 text-xs">
                          <span className="w-24 truncate text-muted-foreground">{platform}</span>
                          <div className="flex-1 h-4 rounded bg-muted/30 overflow-hidden">
                            <div className="h-full rounded bg-emerald-500/60" style={{ width: `${(count / total) * 100}%` }} />
                          </div>
                          <span className="w-12 text-right tabular-nums">{count} <span className="text-muted-foreground">({((count / total) * 100).toFixed(0)}%)</span></span>
                        </div>
                      ));
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Errors Tab */}
        <TabsContent value="errors" className="mt-4">
          <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Recent Errors
              </CardTitle>
              <CardDescription className="text-xs">
                Errors from exported games (last 24h: {status?.errorsLast24h ?? 0})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(status?.errorsLast24h ?? 0) === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Check className="w-8 h-8 mx-auto mb-2 opacity-50 text-green-500" />
                  <p className="text-sm">No errors in the last 24 hours</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-xl font-bold tabular-nums text-red-500">{status?.errorsLast24h ?? 0}</p>
                      <p className="text-xs text-muted-foreground">Errors (24h)</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30">
                      <p className="text-xl font-bold tabular-nums">
                        {status?.eventsLast24h ? ((status.errorsLast24h / status.eventsLast24h) * 100).toFixed(2) : '0.00'}%
                      </p>
                      <p className="text-xs text-muted-foreground">Error Rate</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Check server logs for error details. Error events are captured with context including the action being performed and game state.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Players Tab */}
        <TabsContent value="players" className="mt-4">
          <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Per-Player Details</CardTitle>
              <CardDescription className="text-xs">Click a player to see their session history and event timeline</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedPlayer ? (
                <div className="space-y-3">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedPlayer(null)} className="text-xs">
                    ← Back to list
                  </Button>
                  <div className="text-sm font-mono mb-2">{selectedPlayer}</div>
                  <div className="space-y-1">
                    {sessions
                      .filter(s => s.participantId === selectedPlayer)
                      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                      .map((s, idx) => (
                        <div key={s.sessionId ?? idx} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/20">
                          <div>
                            <div className="text-xs">{new Date(s.startTime).toLocaleString()}</div>
                            {s.platform && <Badge variant="outline" className="text-[9px] mt-0.5">{s.platform}</Badge>}
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-bold">{s.eventCount} events</div>
                            <div className="text-[10px] text-muted-foreground">{s.sessionId?.slice(0, 8)}</div>
                          </div>
                        </div>
                      ))}
                    {sessions.filter(s => s.participantId === selectedPlayer).length === 0 && (
                      <p className="text-xs text-muted-foreground italic">No sessions found</p>
                    )}
                  </div>
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No player data yet</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[400px]">
                  <div className="space-y-1">
                    {(() => {
                      const playerMap: Record<string, { sessions: number; events: number; lastSeen: string }> = {};
                      sessions.forEach(s => {
                        const pid = s.participantId || 'Anonymous';
                        if (!playerMap[pid]) playerMap[pid] = { sessions: 0, events: 0, lastSeen: s.startTime };
                        playerMap[pid].sessions++;
                        playerMap[pid].events += s.eventCount;
                        if (s.startTime > playerMap[pid].lastSeen) playerMap[pid].lastSeen = s.startTime;
                      });
                      return Object.entries(playerMap)
                        .sort((a, b) => b[1].events - a[1].events)
                        .map(([pid, data]) => (
                          <div
                            key={pid}
                            className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
                            onClick={() => setSelectedPlayer(pid)}
                          >
                            <div>
                              <span className="text-sm font-mono">{pid}</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                {data.sessions} session{data.sessions !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold">{data.events} events</span>
                              <div className="text-[10px] text-muted-foreground">
                                Last seen {new Date(data.lastSeen).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ));
                    })()}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  variant = 'default',
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  variant?: 'default' | 'destructive';
}) {
  return (
    <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
      <CardContent className="pt-4 pb-3 px-4">
        <div className="flex items-center justify-between mb-1">
          <span className={`${variant === 'destructive' ? 'text-red-500' : 'text-muted-foreground'}`}>
            {icon}
          </span>
        </div>
        <div className={`text-2xl font-bold ${variant === 'destructive' && value > 0 ? 'text-red-500' : ''}`}>
          {value.toLocaleString()}
        </div>
        <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
      </CardContent>
    </Card>
  );
}
