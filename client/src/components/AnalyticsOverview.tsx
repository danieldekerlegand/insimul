import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import {
  BarChart3, Users, Clock, Activity, TrendingUp, Target,
  Zap, Trophy, ArrowUpRight, ArrowDownRight, Minus,
} from 'lucide-react';
import type {
  CrossPlaythroughAnalytics,
  StatusBreakdown,
  DistributionBucket,
  EngagementPoint,
  PlayerSummary,
} from '@shared/analytics/playthrough-analytics-types';

interface AnalyticsOverviewProps {
  worldId: string;
}

export function AnalyticsOverview({ worldId }: AnalyticsOverviewProps) {
  const [analytics, setAnalytics] = useState<CrossPlaythroughAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    if (!token || !worldId) return;
    setLoading(true);
    fetch(`/api/worlds/${worldId}/analytics/playthroughs/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (res.status === 403) throw new Error('Only world owners can view analytics');
        if (!res.ok) throw new Error('Failed to load analytics');
        return res.json();
      })
      .then((data: CrossPlaythroughAnalytics) => {
        setAnalytics(data);
        setError(null);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [worldId, token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Loading cross-playthrough analytics...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12 text-destructive">
        {error}
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-6">
        {/* Key metrics row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={Users}
            label="Unique Players"
            value={analytics.uniquePlayers}
            sub={`${analytics.totalPlaythroughs} total playthroughs`}
          />
          <MetricCard
            icon={Clock}
            label="Total Playtime"
            value={formatDuration(analytics.totalPlaytime)}
            sub={`${formatDuration(analytics.avgPlaytime)} avg per session`}
          />
          <MetricCard
            icon={Activity}
            label="Total Actions"
            value={analytics.totalActions.toLocaleString()}
            sub={`${Math.round(analytics.avgActions)} avg per session`}
          />
          <MetricCard
            icon={Target}
            label="Completion Rate"
            value={`${Math.round(analytics.completionRate * 100)}%`}
            sub={`${analytics.byStatus.find(s => s.status === 'completed')?.count || 0} completed`}
          />
        </div>

        {/* Secondary metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={Zap}
            label="Total Decisions"
            value={analytics.totalDecisions.toLocaleString()}
            sub="Major choices made"
          />
          <MetricCard
            icon={TrendingUp}
            label="Avg Timestep"
            value={Math.round(analytics.avgTimestep)}
            sub="Average progress reached"
          />
          <MetricCard
            icon={Clock}
            label="Median Playtime"
            value={formatDuration(analytics.medianPlaytime)}
            sub="Middle-of-pack session"
          />
          <MetricCard
            icon={Trophy}
            label="Active Now"
            value={analytics.byStatus.find(s => s.status === 'active')?.count || 0}
            sub={`${analytics.byStatus.find(s => s.status === 'paused')?.count || 0} paused`}
          />
        </div>

        {/* Status breakdown + Distributions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Section title="Status Breakdown">
            <StatusBars items={analytics.byStatus} />
          </Section>

          <Section title="Playtime Distribution">
            <DistributionChart buckets={analytics.playtimeDistribution} />
          </Section>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Section title="Actions Distribution">
            <DistributionChart buckets={analytics.actionsDistribution} />
          </Section>

          <Section title="Engagement Timeline">
            {analytics.engagementTimeline.length > 0 ? (
              <EngagementTable points={analytics.engagementTimeline} />
            ) : (
              <p className="text-sm text-muted-foreground">No engagement data yet.</p>
            )}
          </Section>
        </div>

        {/* Player leaderboards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Section title="Top Players by Playtime">
            <PlayerTable players={analytics.topPlayersByPlaytime} metric="playtime" />
          </Section>

          <Section title="Top Players by Actions">
            <PlayerTable players={analytics.topPlayersByActions} metric="actions" />
          </Section>
        </div>
      </div>
    </ScrollArea>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function MetricCard({ icon: Icon, label, value, sub }: {
  icon: typeof Users;
  label: string;
  value: number | string;
  sub: string;
}) {
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-muted/20 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500',
  completed: 'bg-blue-500',
  abandoned: 'bg-red-400',
  paused: 'bg-yellow-500',
  unknown: 'bg-gray-400',
};

function StatusBars({ items }: { items: StatusBreakdown[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No playthroughs yet.</p>;
  }
  const sorted = [...items].sort((a, b) => b.count - a.count);
  const maxCount = sorted[0]?.count || 1;

  return (
    <div className="space-y-2">
      {sorted.map(item => (
        <div key={item.status} className="flex items-center gap-3">
          <span className="text-xs w-20 capitalize truncate">{item.status}</span>
          <div className="flex-1 h-5 bg-muted/50 rounded overflow-hidden">
            <div
              className={`h-full rounded ${STATUS_COLORS[item.status] || STATUS_COLORS.unknown} transition-all`}
              style={{ width: `${(item.count / maxCount) * 100}%` }}
            />
          </div>
          <span className="text-xs tabular-nums w-16 text-right">
            {item.count} ({Math.round(item.percentage * 100)}%)
          </span>
        </div>
      ))}
    </div>
  );
}

function DistributionChart({ buckets }: { buckets: DistributionBucket[] }) {
  const maxCount = Math.max(...buckets.map(b => b.count), 1);
  return (
    <div className="flex items-end gap-1 h-24">
      {buckets.map(bucket => (
        <div key={bucket.label} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[10px] tabular-nums text-muted-foreground">
            {bucket.count}
          </span>
          <div
            className="w-full bg-primary/60 rounded-t transition-all min-h-[2px]"
            style={{ height: `${(bucket.count / maxCount) * 64}px` }}
          />
          <span className="text-[9px] text-muted-foreground truncate w-full text-center">
            {bucket.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function EngagementTable({ points }: { points: EngagementPoint[] }) {
  const recent = points.slice(-10);
  return (
    <div className="space-y-1 max-h-48 overflow-y-auto">
      <div className="flex text-[10px] text-muted-foreground uppercase tracking-wider gap-2 pb-1 border-b">
        <span className="flex-1">Date</span>
        <span className="w-16 text-right">Started</span>
        <span className="w-16 text-right">Active</span>
      </div>
      {recent.map(p => (
        <div key={p.date} className="flex text-xs gap-2">
          <span className="flex-1 tabular-nums">{p.date}</span>
          <span className="w-16 text-right tabular-nums">{p.started}</span>
          <span className="w-16 text-right tabular-nums">{p.activeSessions}</span>
        </div>
      ))}
    </div>
  );
}

function PlayerTable({ players, metric }: {
  players: PlayerSummary[];
  metric: 'playtime' | 'actions';
}) {
  if (players.length === 0) {
    return <p className="text-sm text-muted-foreground">No player data.</p>;
  }
  return (
    <div className="space-y-1 max-h-48 overflow-y-auto">
      <div className="flex text-[10px] text-muted-foreground uppercase tracking-wider gap-2 pb-1 border-b">
        <span className="w-6">#</span>
        <span className="flex-1">Player</span>
        <span className="w-12 text-right">Runs</span>
        <span className="w-20 text-right">{metric === 'playtime' ? 'Time' : 'Actions'}</span>
      </div>
      {players.map((p, i) => (
        <div key={p.userId} className="flex text-xs gap-2 items-center">
          <span className="w-6 tabular-nums text-muted-foreground">{i + 1}</span>
          <span className="flex-1 truncate font-mono text-[11px]">
            {p.userId.substring(0, 12)}...
          </span>
          <span className="w-12 text-right tabular-nums">{p.playthroughCount}</span>
          <span className="w-20 text-right tabular-nums">
            {metric === 'playtime'
              ? formatDuration(p.totalPlaytime)
              : p.totalActions.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  if (!seconds) return '0m';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
