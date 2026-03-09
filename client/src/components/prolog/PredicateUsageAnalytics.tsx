/**
 * Predicate Usage Analytics
 *
 * Analyzes which predicates are used across rules, actions, and quests
 * in a world. Shows usage counts, coverage, and unused predicates.
 */

import { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { BarChart3, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

interface PredicateUsage {
  name: string;
  arity: number;
  category: string;
  usedInRules: number;
  usedInActions: number;
  usedInQuests: number;
  total: number;
}

interface PredicateUsageAnalyticsProps {
  worldId: string;
  compact?: boolean;
}

export function PredicateUsageAnalytics({ worldId, compact = false }: PredicateUsageAnalyticsProps) {
  const [usage, setUsage] = useState<PredicateUsage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'total' | 'name'>('total');

  const analyze = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [predicatesRes, rulesRes, actionsRes, questsRes] = await Promise.all([
        fetch('/api/prolog/predicates'),
        fetch(`/api/worlds/${worldId}/rules`),
        fetch(`/api/worlds/${worldId}/actions`),
        fetch(`/api/worlds/${worldId}/quests`),
      ]);

      const predicatesData = await predicatesRes.json();
      const rules = rulesRes.ok ? await rulesRes.json() : [];
      const actions = actionsRes.ok ? await actionsRes.json() : [];
      const quests = questsRes.ok ? await questsRes.json() : [];

      // Count predicate usage in prologContent
      const predicateNames = Object.entries(predicatesData.predicates || {}).map(
        ([name, info]: [string, any]) => ({
          name,
          arity: info.arity || 0,
          category: info.category || 'utility',
        })
      );

      const countInContent = (content: string | null, predName: string): number => {
        if (!content) return 0;
        // Match predicate name followed by ( or end of line/space
        const regex = new RegExp(`\\b${predName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\(`, 'g');
        const matches = content.match(regex);
        return matches ? matches.length : 0;
      };

      const results: PredicateUsage[] = predicateNames.map(pred => {
        let usedInRules = 0;
        let usedInActions = 0;
        let usedInQuests = 0;

        for (const rule of rules) {
          usedInRules += countInContent(rule.prologContent, pred.name);
          usedInRules += countInContent(rule.content, pred.name);
        }
        for (const action of actions) {
          usedInActions += countInContent(action.prologContent, pred.name);
        }
        for (const quest of quests) {
          usedInQuests += countInContent(quest.prologContent, pred.name);
        }

        return {
          ...pred,
          usedInRules,
          usedInActions,
          usedInQuests,
          total: usedInRules + usedInActions + usedInQuests,
        };
      });

      setUsage(results);
    } catch (e) {
      console.warn('[PredicateUsageAnalytics] Failed to analyze:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    analyze();
  }, [worldId]);

  const sorted = useMemo(() => {
    const items = [...usage];
    if (sortBy === 'total') {
      items.sort((a, b) => b.total - a.total);
    } else {
      items.sort((a, b) => a.name.localeCompare(b.name));
    }
    return items;
  }, [usage, sortBy]);

  const stats = useMemo(() => {
    const used = usage.filter(u => u.total > 0).length;
    const unused = usage.filter(u => u.total === 0).length;
    const totalUsage = usage.reduce((sum, u) => sum + u.total, 0);
    return { used, unused, total: usage.length, totalUsage };
  }, [usage]);

  const maxCount = useMemo(() => Math.max(1, ...usage.map(u => u.total)), [usage]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2 border-b shrink-0">
        <div className="flex items-center gap-1.5 mb-2">
          <BarChart3 className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Usage Analytics
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="w-5 h-5 ml-auto"
            onClick={analyze}
            disabled={loading}
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Summary stats */}
        {usage.length > 0 && (
          <div className="flex gap-2 text-[10px]">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>{stats.used} used</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-yellow-500" />
              <span>{stats.unused} unused</span>
            </div>
            <span className="text-muted-foreground">{stats.totalUsage} total refs</span>
          </div>
        )}

        {/* Sort toggle */}
        <div className="flex gap-1 mt-1.5 bg-muted/50 rounded-md p-0.5">
          <button
            className={`px-2 py-0.5 rounded text-[10px] transition-colors ${sortBy === 'total' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
            onClick={() => setSortBy('total')}
          >
            By Usage
          </button>
          <button
            className={`px-2 py-0.5 rounded text-[10px] transition-colors ${sortBy === 'name' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
            onClick={() => setSortBy('name')}
          >
            By Name
          </button>
        </div>
      </div>

      {/* Predicate list with usage bars */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {loading && (
            <div className="p-4 text-center text-xs text-muted-foreground">Analyzing...</div>
          )}

          {!loading && sorted.map(pred => (
            <div key={`${pred.name}/${pred.arity}`} className="px-2 py-1 rounded hover:bg-muted/30">
              <div className="flex items-center gap-1.5">
                <span className={`text-[11px] font-mono ${pred.total > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {pred.name}/{pred.arity}
                </span>
                <span className="ml-auto text-[10px] text-muted-foreground">{pred.total}</span>
              </div>

              {/* Usage bar */}
              <div className="mt-0.5 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500"
                  style={{ width: `${(pred.total / maxCount) * 100}%` }}
                />
              </div>

              {/* Breakdown */}
              {pred.total > 0 && (
                <div className="flex gap-2 mt-0.5 text-[9px] text-muted-foreground">
                  {pred.usedInRules > 0 && <span>Rules: {pred.usedInRules}</span>}
                  {pred.usedInActions > 0 && <span>Actions: {pred.usedInActions}</span>}
                  {pred.usedInQuests > 0 && <span>Quests: {pred.usedInQuests}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
