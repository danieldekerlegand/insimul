import { useState, useEffect, useMemo } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, Cell, ResponsiveContainer,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import type { LearningOutcomeSummary, ProgressionPoint } from '@shared/analytics/quest-analytics-types';
import type { SkillDimension } from '@shared/language/learning-profile';

interface LearningProgressVisualizationProps {
  worldId: string;
  playerName: string;
  playthroughId?: string;
}

const SKILL_COLORS: Record<SkillDimension, string> = {
  comprehension: '#6366f1',
  fluency: '#22c55e',
  vocabulary: '#f59e0b',
  grammar: '#ef4444',
  pronunciation: '#8b5cf6',
};

const SKILL_LABELS: Record<SkillDimension, string> = {
  comprehension: 'Comprehension',
  fluency: 'Fluency',
  vocabulary: 'Vocabulary',
  grammar: 'Grammar',
  pronunciation: 'Pronunciation',
};

const MASTERY_COLOR_SCALE = [
  { threshold: 0.8, color: '#22c55e' },
  { threshold: 0.6, color: '#84cc16' },
  { threshold: 0.4, color: '#f59e0b' },
  { threshold: 0.2, color: '#f97316' },
  { threshold: 0, color: '#ef4444' },
];

function getMasteryColor(mastery: number): string {
  for (const { threshold, color } of MASTERY_COLOR_SCALE) {
    if (mastery >= threshold) return color;
  }
  return '#ef4444';
}

export function LearningProgressVisualization({
  worldId,
  playerName,
  playthroughId,
}: LearningProgressVisualizationProps) {
  const [data, setData] = useState<LearningOutcomeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    if (!token || !playerName) return;

    const load = async () => {
      setLoading(true);
      try {
        const params = playthroughId ? `?playthroughId=${playthroughId}` : '';
        const res = await fetch(
          `/api/worlds/${worldId}/analytics/learning-outcomes/${encodeURIComponent(playerName)}${params}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!res.ok) throw new Error('Failed to load learning outcomes');
        setData(await res.json());
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [worldId, playerName, playthroughId, token]);

  const radarData = useMemo(() => {
    if (!data) return [];
    return (Object.entries(data.skillScores) as [SkillDimension, number][]).map(
      ([skill, score]) => ({
        skill: SKILL_LABELS[skill] ?? skill,
        score: Math.round(score * 100),
        fullMark: 100,
      }),
    );
  }, [data]);

  const xpTimelineData = useMemo(() => {
    if (!data?.progressionTimeline.length) return [];
    return data.progressionTimeline.map((pt: ProgressionPoint, i: number) => ({
      index: i + 1,
      date: new Date(pt.timestamp).toLocaleDateString(),
      cumulativeXp: pt.cumulativeXp,
      xpEarned: pt.xpEarned,
      success: pt.success,
    }));
  }, [data]);

  const skillTrajectoryData = useMemo(() => {
    if (!data?.progressionTimeline.length || !data.categoryProgress.length) return [];
    const timeline = data.progressionTimeline;
    const windowSize = Math.max(1, Math.floor(timeline.length / 10));
    const points: Array<Record<string, number | string>> = [];

    for (let i = 0; i < timeline.length; i += windowSize) {
      const window = timeline.slice(0, i + windowSize);
      const point: Record<string, number | string> = { quest: i + windowSize };

      const catScores = new Map<string, { success: number; total: number }>();
      for (const pt of window) {
        const cat = pt.questType;
        if (!catScores.has(cat)) catScores.set(cat, { success: 0, total: 0 });
        const s = catScores.get(cat)!;
        s.total++;
        if (pt.success) s.success++;
      }

      for (const [skill, categories] of Object.entries(SKILL_TO_CATEGORIES_LOCAL)) {
        let totalRate = 0;
        let count = 0;
        for (const cat of categories) {
          const s = catScores.get(cat);
          if (s && s.total > 0) {
            totalRate += s.success / s.total;
            count++;
          }
        }
        point[skill] = count > 0 ? Math.round((totalRate / count) * 100) : 0;
      }

      points.push(point);
    }

    return points;
  }, [data]);

  const categoryMasteryData = useMemo(() => {
    if (!data?.categoryProgress.length) return [];
    return [...data.categoryProgress]
      .sort((a, b) => b.mastery - a.mastery)
      .map(cp => ({
        category: formatCategory(cp.category),
        mastery: Math.round(cp.mastery * 100),
        successRate: Math.round(cp.successRate * 100),
        quests: cp.questsCompleted,
      }));
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading learning progress...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-destructive">
        {error}
      </div>
    );
  }

  if (!data || data.questsAttempted === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No quest data available for this player yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary header */}
      <div className="flex flex-wrap gap-4">
        <SummaryCard label="Quests Completed" value={data.questsCompleted} />
        <SummaryCard label="Success Rate" value={`${Math.round(data.successRate * 100)}%`} />
        <SummaryCard label="Total XP" value={data.totalXpEarned.toLocaleString()} />
        {data.currentCefrLevel && (
          <SummaryCard label="CEFR Level" value={data.currentCefrLevel} />
        )}
      </div>

      {/* Strengths and areas for improvement */}
      {(data.strengths.length > 0 || data.areasForImprovement.length > 0) && (
        <div className="flex flex-wrap gap-4">
          {data.strengths.length > 0 && (
            <div className="flex-1 min-w-[200px] bg-green-500/10 rounded-lg p-3">
              <span className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wider">
                Strengths
              </span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {data.strengths.map(s => (
                  <Badge key={s} variant="secondary" className="text-xs bg-green-500/20">
                    {formatCategory(s)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {data.areasForImprovement.length > 0 && (
            <div className="flex-1 min-w-[200px] bg-amber-500/10 rounded-lg p-3">
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                Needs Improvement
              </span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {data.areasForImprovement.map(s => (
                  <Badge key={s} variant="secondary" className="text-xs bg-amber-500/20">
                    {formatCategory(s)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Skill Radar */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3">Skill Profile</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar
                name="Skill Score"
                dataKey="score"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.3}
              />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                formatter={(value: number) => [`${value}%`, 'Score']}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Skill Trajectories over time */}
      {skillTrajectoryData.length > 1 && (
        <div className="bg-muted/30 rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3">Skill Trajectories</h3>
          <p className="text-xs text-muted-foreground mb-3">
            How each skill dimension evolves as quests are completed
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={skillTrajectoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="quest"
                  label={{ value: 'Quests Completed', position: 'insideBottom', offset: -5, fontSize: 11 }}
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  domain={[0, 100]}
                  label={{ value: 'Score %', angle: -90, position: 'insideLeft', fontSize: 11 }}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  formatter={(value: number, name: string) => [`${value}%`, SKILL_LABELS[name as SkillDimension] ?? name]}
                />
                <Legend formatter={(value: string) => SKILL_LABELS[value as SkillDimension] ?? value} />
                {(Object.keys(SKILL_COLORS) as SkillDimension[]).map(skill => (
                  <Line
                    key={skill}
                    type="monotone"
                    dataKey={skill}
                    stroke={SKILL_COLORS[skill]}
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* XP Progression Curve */}
      {xpTimelineData.length > 0 && (
        <div className="bg-muted/30 rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3">XP Progression</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={xpTimelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="index"
                  label={{ value: 'Quest #', position: 'insideBottom', offset: -5, fontSize: 11 }}
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  label={{ value: 'Cumulative XP', angle: -90, position: 'insideLeft', fontSize: 11 }}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  formatter={(value: number, name: string) => {
                    if (name === 'cumulativeXp') return [value.toLocaleString(), 'Total XP'];
                    return [value.toLocaleString(), 'XP Earned'];
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="cumulativeXp"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#6366f1' }}
                  name="cumulativeXp"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Category Mastery Bar Chart */}
      {categoryMasteryData.length > 0 && (
        <div className="bg-muted/30 rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3">Category Mastery</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryMasteryData} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <YAxis
                  type="category"
                  dataKey="category"
                  tick={{ fontSize: 11 }}
                  width={95}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  formatter={(value: number, name: string) => {
                    if (name === 'mastery') return [`${value}%`, 'Mastery'];
                    return [`${value}%`, 'Success Rate'];
                  }}
                />
                <Bar dataKey="mastery" name="mastery" radius={[0, 4, 4, 0]}>
                  {categoryMasteryData.map((entry, i) => (
                    <Cell key={i} fill={getMasteryColor(entry.mastery / 100)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-muted/30 rounded-lg p-3 min-w-[120px]">
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
      <p className="text-xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

function formatCategory(cat: string): string {
  return cat
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

const SKILL_TO_CATEGORIES_LOCAL: Record<SkillDimension, string[]> = {
  comprehension: ['listening_comprehension', 'follow_instructions', 'translation_challenge'],
  fluency: ['conversation', 'navigation', 'time_activity'],
  vocabulary: ['vocabulary', 'visual_vocabulary', 'scavenger_hunt'],
  grammar: ['grammar', 'translation_challenge', 'conversation'],
  pronunciation: ['pronunciation', 'conversation', 'listening_comprehension'],
};
