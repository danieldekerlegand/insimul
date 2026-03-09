/**
 * Prolog Scenario Tester
 *
 * Run a series of Prolog scenario tests against the world's knowledge base.
 * Each scenario can set up temporary facts, run a query, and check expectations.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  TestTube2, Play, Plus, X, CheckCircle, XCircle, Trash2,
} from 'lucide-react';

interface ScenarioInput {
  name: string;
  setup: string; // comma-separated facts
  query: string;
  expect: string; // 'true', 'false', or a number
}

interface ScenarioResult {
  name: string;
  query: string;
  expected: string;
  actual: string;
  passed: boolean;
}

interface TestRunResult {
  results: ScenarioResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    passRate: number;
  };
  timestamp: number;
}

interface PrologScenarioTesterProps {
  worldId: string;
}

const DEFAULT_SCENARIOS: ScenarioInput[] = [
  { name: 'People exist', setup: '', query: 'person(X)', expect: 'true' },
  { name: 'Adults have age >= 18', setup: '', query: 'adult(X), age(X, A), A < 18', expect: 'false' },
  { name: 'No self-marriage', setup: '', query: 'married_to(X, X)', expect: 'false' },
];

export function PrologScenarioTester({ worldId }: PrologScenarioTesterProps) {
  const [scenarios, setScenarios] = useState<ScenarioInput[]>(DEFAULT_SCENARIOS);
  const [runs, setRuns] = useState<TestRunResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const addScenario = () => {
    setScenarios(prev => [...prev, { name: '', setup: '', query: '', expect: 'true' }]);
  };

  const removeScenario = (index: number) => {
    setScenarios(prev => prev.filter((_, i) => i !== index));
  };

  const updateScenario = (index: number, field: keyof ScenarioInput, value: string) => {
    setScenarios(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const runTests = async () => {
    const validScenarios = scenarios.filter(s => s.query.trim());
    if (validScenarios.length === 0) {
      toast({ title: 'No scenarios', description: 'Add at least one scenario with a query', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const payload = validScenarios.map(s => ({
        name: s.name || s.query,
        setup: s.setup ? s.setup.split(',').map(f => f.trim()).filter(Boolean) : [],
        query: s.query.trim(),
        expect: s.expect === 'true' ? true : s.expect === 'false' ? false : isNaN(Number(s.expect)) ? s.expect : Number(s.expect),
      }));

      const res = await fetch('/api/prolog/tau/scenario-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worldId, scenarios: payload }),
      });
      const data = await res.json();

      if (data.status === 'success') {
        const run: TestRunResult = {
          results: data.results,
          summary: data.summary,
          timestamp: Date.now(),
        };
        setRuns(prev => [run, ...prev.slice(0, 9)]);

        toast({
          title: `${data.summary.passed}/${data.summary.total} Passed`,
          description: data.summary.failed > 0
            ? `${data.summary.failed} test${data.summary.failed !== 1 ? 's' : ''} failed`
            : 'All tests passed!',
          variant: data.summary.failed > 0 ? 'destructive' : 'default',
        });
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to run scenario tests', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const latestRun = runs.length > 0 ? runs[0] : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TestTube2 className="w-5 h-5 text-blue-500" />
        <h3 className="text-sm font-semibold">Scenario Tests</h3>
        <div className="ml-auto flex gap-1">
          <Button variant="outline" size="sm" onClick={addScenario}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Add
          </Button>
          <Button size="sm" onClick={runTests} disabled={loading}>
            <Play className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Run All
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Define test scenarios with optional setup facts, a query, and expected result (true/false/count).
      </p>

      {/* Scenario editor */}
      <ScrollArea className="max-h-64">
        <div className="space-y-2 pr-2">
          {scenarios.map((scenario, i) => (
            <div key={i} className="p-2 border rounded-lg space-y-1.5 bg-muted/10">
              <div className="flex items-center gap-1">
                {latestRun && latestRun.results[i] && (
                  latestRun.results[i].passed ? (
                    <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  )
                )}
                <Input
                  value={scenario.name}
                  onChange={(e) => updateScenario(i, 'name', e.target.value)}
                  placeholder="Test name"
                  className="h-6 text-xs"
                />
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => removeScenario(i)}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-1">
                <Input
                  value={scenario.query}
                  onChange={(e) => updateScenario(i, 'query', e.target.value)}
                  placeholder="Query: person(X)"
                  className="h-6 text-[11px] font-mono"
                />
                <Input
                  value={scenario.expect}
                  onChange={(e) => updateScenario(i, 'expect', e.target.value)}
                  placeholder="true"
                  className="h-6 w-16 text-[11px] font-mono text-center"
                  title="Expected: true, false, or result count"
                />
              </div>
              <Input
                value={scenario.setup}
                onChange={(e) => updateScenario(i, 'setup', e.target.value)}
                placeholder="Setup facts (comma-separated, optional)"
                className="h-6 text-[11px] font-mono text-muted-foreground"
              />
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Latest run results */}
      {latestRun && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium">Latest Run</span>
            <div className="flex gap-1 ml-auto">
              <Badge
                className={`text-[10px] ${latestRun.summary.passRate === 100 ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}
              >
                {latestRun.summary.passRate}% pass rate
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                {latestRun.summary.passed}/{latestRun.summary.total}
              </Badge>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${latestRun.summary.passRate === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-green-500 to-red-500'}`}
              style={{ width: `${latestRun.summary.passRate}%` }}
            />
          </div>

          {/* Failed tests detail */}
          {latestRun.results.filter(r => !r.passed).length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] text-red-500 font-medium">Failed:</span>
              {latestRun.results.filter(r => !r.passed).map((r, i) => (
                <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-red-500/5 rounded text-[11px]">
                  <XCircle className="w-3 h-3 text-red-500 shrink-0" />
                  <span className="font-medium truncate">{r.name}</span>
                  <span className="text-muted-foreground ml-auto shrink-0">
                    expected {r.expected}, got {r.actual}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Run history */}
      {runs.length > 1 && (
        <div className="space-y-1">
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">History</span>
          <div className="space-y-0.5">
            {runs.slice(1).map((run, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] px-2 py-1 rounded bg-muted/20">
                <span className={run.summary.passRate === 100 ? 'text-green-500' : 'text-amber-500'}>
                  {run.summary.passRate}%
                </span>
                <span className="text-muted-foreground">
                  {run.summary.passed}/{run.summary.total} passed
                </span>
                <span className="text-muted-foreground ml-auto text-[10px]">
                  {new Date(run.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
