/**
 * Prolog Query Tester
 *
 * Compact sidebar component for testing Prolog queries against
 * a world's tau-prolog knowledge base in real-time.
 */

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Play, Trash2, Clock, Terminal } from 'lucide-react';

interface QueryHistoryEntry {
  query: string;
  results: any[];
  count: number;
  timestamp: number;
  error?: string;
}

interface PrologQueryTesterProps {
  worldId: string;
  /** Compact mode for sidebar */
  compact?: boolean;
}

export function PrologQueryTester({ worldId, compact = false }: PrologQueryTesterProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<QueryHistoryEntry[]>([]);
  const { toast } = useToast();

  const executeQuery = async (queryText?: string) => {
    const q = (queryText || query).trim();
    if (!q) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/prolog/tau/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worldId, query: q, maxResults: 20 }),
      });

      const data = await res.json();

      const entry: QueryHistoryEntry = {
        query: q,
        results: data.results || [],
        count: data.count || 0,
        timestamp: Date.now(),
        error: data.status === 'error' ? (data.message || 'Query failed') : undefined,
      };

      setHistory(prev => [entry, ...prev.slice(0, 19)]);

      if (data.status === 'error') {
        toast({ title: 'Query Error', description: data.message, variant: 'destructive' });
      }
    } catch (e) {
      const entry: QueryHistoryEntry = {
        query: q,
        results: [],
        count: 0,
        timestamp: Date.now(),
        error: 'Network error',
      };
      setHistory(prev => [entry, ...prev.slice(0, 19)]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => setHistory([]);

  const formatResult = (result: any): string => {
    if (typeof result === 'boolean') return result ? 'true' : 'false';
    if (typeof result === 'string') return result;
    // Object with variable bindings
    const entries = Object.entries(result);
    if (entries.length === 0) return 'true';
    return entries.map(([k, v]) => `${k} = ${v}`).join(', ');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2 border-b shrink-0">
        <div className="flex items-center gap-1.5 mb-2">
          <Terminal className="w-3.5 h-3.5 text-green-500" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Query Tester
          </span>
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="w-5 h-5 ml-auto"
              onClick={clearHistory}
              title="Clear history"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
        <div className="flex gap-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && executeQuery()}
            placeholder="e.g. person(X)"
            className="h-7 text-xs font-mono"
            disabled={isLoading}
          />
          <Button
            size="sm"
            className="h-7 px-2 shrink-0"
            onClick={() => executeQuery()}
            disabled={isLoading || !query.trim()}
          >
            <Play className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Results / History */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {history.length === 0 && (
            <div className="p-4 text-center text-xs text-muted-foreground">
              Enter a Prolog query to test against the world's knowledge base.
              <div className="mt-2 space-y-1 text-left font-mono">
                <div className="px-2 py-1 rounded bg-muted/30 cursor-pointer hover:bg-muted/50"
                  onClick={() => { setQuery('person(X)'); executeQuery('person(X)'); }}>
                  person(X)
                </div>
                <div className="px-2 py-1 rounded bg-muted/30 cursor-pointer hover:bg-muted/50"
                  onClick={() => { setQuery('age(X, A), A > 30'); executeQuery('age(X, A), A > 30'); }}>
                  age(X, A), A &gt; 30
                </div>
                <div className="px-2 py-1 rounded bg-muted/30 cursor-pointer hover:bg-muted/50"
                  onClick={() => { setQuery('married_to(X, Y)'); executeQuery('married_to(X, Y)'); }}>
                  married_to(X, Y)
                </div>
              </div>
            </div>
          )}

          {history.map((entry, i) => (
            <div key={i} className="rounded border overflow-hidden">
              {/* Query header */}
              <div
                className="flex items-center gap-1.5 px-2 py-1 bg-muted/30 cursor-pointer hover:bg-muted/50"
                onClick={() => setQuery(entry.query)}
              >
                <code className="text-[11px] font-mono flex-1 truncate">{entry.query}</code>
                {entry.error ? (
                  <Badge variant="destructive" className="text-[9px] px-1 py-0">error</Badge>
                ) : (
                  <Badge variant="secondary" className="text-[9px] px-1 py-0">
                    {entry.count} result{entry.count !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>

              {/* Results */}
              {entry.error ? (
                <div className="px-2 py-1 text-[11px] text-red-500 bg-red-500/5">
                  {entry.error}
                </div>
              ) : entry.results.length > 0 ? (
                <div className="px-2 py-1 space-y-0.5">
                  {entry.results.slice(0, 10).map((r, j) => (
                    <div key={j} className="text-[11px] font-mono text-green-600 dark:text-green-400">
                      {formatResult(r)}
                    </div>
                  ))}
                  {entry.results.length > 10 && (
                    <div className="text-[10px] text-muted-foreground">
                      ...and {entry.results.length - 10} more
                    </div>
                  )}
                </div>
              ) : (
                <div className="px-2 py-1 text-[11px] text-muted-foreground italic">
                  No results (false)
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
