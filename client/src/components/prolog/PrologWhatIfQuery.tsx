/**
 * Prolog What-If Query
 *
 * Test hypothetical world states by temporarily asserting facts
 * and running queries against the modified knowledge base.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { PrologSyntaxHighlight } from './PrologSyntaxHighlight';
import { FlaskConical, Plus, X, Play, History } from 'lucide-react';

interface WhatIfResult {
  hypotheticalFacts: string[];
  query: string;
  results: any[];
  count: number;
  timestamp: number;
}

interface PrologWhatIfQueryProps {
  worldId: string;
}

export function PrologWhatIfQuery({ worldId }: PrologWhatIfQueryProps) {
  const [facts, setFacts] = useState<string[]>(['']);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<WhatIfResult[]>([]);
  const { toast } = useToast();

  const addFact = () => setFacts(prev => [...prev, '']);
  const removeFact = (index: number) => setFacts(prev => prev.filter((_, i) => i !== index));
  const updateFact = (index: number, value: string) => {
    setFacts(prev => prev.map((f, i) => i === index ? value : f));
  };

  const runWhatIf = async () => {
    const cleanFacts = facts.filter(f => f.trim());
    if (!query.trim()) {
      toast({ title: 'Enter a query', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/prolog/tau/what-if', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worldId,
          hypotheticalFacts: cleanFacts,
          query: query.trim(),
          maxResults: 20,
        }),
      });
      const data = await res.json();

      const entry: WhatIfResult = {
        hypotheticalFacts: cleanFacts,
        query: query.trim(),
        results: data.results || [],
        count: data.count || 0,
        timestamp: Date.now(),
      };
      setHistory(prev => [entry, ...prev.slice(0, 9)]);

      if (data.error) {
        toast({ title: 'Query Error', description: data.error, variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Error', description: 'What-if query failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const formatResult = (result: any): string => {
    if (typeof result === 'boolean') return result ? 'true' : 'false';
    if (typeof result === 'string') return result;
    const entries = Object.entries(result);
    if (entries.length === 0) return 'true';
    return entries.map(([k, v]) => `${k} = ${v}`).join(', ');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FlaskConical className="w-5 h-5 text-purple-500" />
        <h3 className="text-sm font-semibold">What-If Queries</h3>
      </div>

      <p className="text-xs text-muted-foreground">
        Temporarily add hypothetical facts, then query to see how the world would respond.
        Facts are automatically removed after the query runs.
      </p>

      {/* Hypothetical facts */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">Hypothetical Facts</span>
          <Button variant="outline" size="sm" className="h-6 text-xs ml-auto" onClick={addFact}>
            <Plus className="w-3 h-3 mr-1" /> Add Fact
          </Button>
        </div>
        {facts.map((fact, i) => (
          <div key={i} className="flex gap-1">
            <Input
              value={fact}
              onChange={(e) => updateFact(i, e.target.value)}
              placeholder={`e.g. age(john, 25)`}
              className="h-7 text-xs font-mono"
            />
            {facts.length > 1 && (
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeFact(i)}>
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Query */}
      <div className="space-y-1.5">
        <span className="text-xs font-medium">Query</span>
        <div className="flex gap-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runWhatIf()}
            placeholder="e.g. adult(john)"
            className="h-7 text-xs font-mono"
          />
          <Button size="sm" className="h-7 px-3 shrink-0" onClick={runWhatIf} disabled={loading}>
            <Play className="w-3 h-3 mr-1" /> Run
          </Button>
        </div>
      </div>

      {/* Pre-built scenarios */}
      <div className="space-y-1">
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Quick Scenarios</span>
        <div className="grid grid-cols-1 gap-1">
          {[
            { label: 'New character appears', facts: ['person(new_visitor)', 'age(new_visitor, 25)', 'gender(new_visitor, male)'], query: 'adult(new_visitor)' },
            { label: 'Marriage eligibility', facts: ['person(test_a)', 'person(test_b)', 'age(test_a, 20)', 'age(test_b, 22)', 'alive(test_a)', 'alive(test_b)'], query: 'can_marry(test_a, test_b)' },
            { label: 'All adults', facts: [], query: 'person(X), age(X, A), A >= 18' },
          ].map((scenario, i) => (
            <button
              key={i}
              className="text-left px-2 py-1 text-[11px] rounded bg-muted/30 hover:bg-muted/50 transition-colors"
              onClick={() => {
                setFacts(scenario.facts.length > 0 ? scenario.facts : ['']);
                setQuery(scenario.query);
              }}
            >
              {scenario.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results history */}
      {history.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <History className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Results</span>
          </div>
          <ScrollArea className="h-48 border rounded-lg">
            <div className="p-2 space-y-2">
              {history.map((entry, i) => (
                <div key={i} className="rounded border overflow-hidden">
                  {entry.hypotheticalFacts.length > 0 && (
                    <div className="px-2 py-1 bg-purple-500/5 border-b text-[10px] font-mono text-purple-400">
                      + {entry.hypotheticalFacts.join(', ')}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/30">
                    <code className="text-[11px] font-mono flex-1 truncate">{entry.query}</code>
                    <Badge variant="secondary" className="text-[9px] px-1 py-0">
                      {entry.count} result{entry.count !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  {entry.results.length > 0 ? (
                    <div className="px-2 py-1 space-y-0.5">
                      {entry.results.slice(0, 5).map((r, j) => (
                        <div key={j} className="text-[11px] font-mono text-green-600 dark:text-green-400">
                          {formatResult(r)}
                        </div>
                      ))}
                      {entry.results.length > 5 && (
                        <div className="text-[10px] text-muted-foreground">
                          ...and {entry.results.length - 5} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="px-2 py-1 text-[11px] text-muted-foreground italic">No results</div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
