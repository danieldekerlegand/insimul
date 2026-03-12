/**
 * Enhanced Knowledge Base Query Interface
 *
 * Full-featured KB browser with category-grouped facts, a visual query builder,
 * query history (persisted in localStorage), suggested queries, and formatted
 * results with CSV/JSON export.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import {
  Brain,
  Play,
  Trash2,
  Clock,
  ChevronDown,
  ChevronRight,
  Download,
  FileJson,
  FileSpreadsheet,
  Search,
  Lightbulb,
  History,
  RotateCcw,
  RefreshCw,
  Layers,
  Users,
  MapPin,
  ScrollText,
  Zap,
  Package,
  Shield,
  BookOpen,
  Link2,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────

interface EnhancedKBQueryProps {
  worldId: string;
}

interface QueryHistoryEntry {
  query: string;
  timestamp: number;
  resultCount: number;
  error?: string;
}

interface QueryResult {
  [key: string]: any;
}

interface PredicateInfo {
  name: string;
  arity: number;
  category: string;
  description: string;
  args: { name: string; type: string; description?: string }[];
  examples: string[];
}

interface FactCategory {
  key: string;
  label: string;
  icon: React.ReactNode;
  predicatePatterns: string[];
  colorClass: string;
}

interface SuggestedQuery {
  label: string;
  description: string;
  query: string;
  category: string;
}

// ── Constants ──────────────────────────────────────────────────────────────

const HISTORY_KEY = 'insimul-kb-query-history';
const MAX_HISTORY = 20;

const FACT_CATEGORIES: FactCategory[] = [
  {
    key: 'characters',
    label: 'Characters',
    icon: <Users className="w-4 h-4" />,
    predicatePatterns: ['person', 'first_name', 'last_name', 'full_name', 'age', 'birth_year', 'gender', 'alive', 'dead', 'occupation', 'at_location', 'personality', 'physical_trait', 'mental_trait', 'skill'],
    colorClass: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  },
  {
    key: 'locations',
    label: 'Locations',
    icon: <MapPin className="w-4 h-4" />,
    predicatePatterns: ['settlement', 'lot', 'residence', 'business', 'country', 'state', 'world'],
    colorClass: 'bg-green-500/10 text-green-600 border-green-500/20',
  },
  {
    key: 'rules',
    label: 'Rules',
    icon: <ScrollText className="w-4 h-4" />,
    predicatePatterns: ['rule_'],
    colorClass: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  },
  {
    key: 'actions',
    label: 'Actions',
    icon: <Zap className="w-4 h-4" />,
    predicatePatterns: ['action_', 'can_do'],
    colorClass: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  },
  {
    key: 'items',
    label: 'Items',
    icon: <Package className="w-4 h-4" />,
    predicatePatterns: ['item'],
    colorClass: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
  },
  {
    key: 'truths',
    label: 'Truths',
    icon: <BookOpen className="w-4 h-4" />,
    predicatePatterns: ['truth'],
    colorClass: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  },
  {
    key: 'relationships',
    label: 'Relationships',
    icon: <Link2 className="w-4 h-4" />,
    predicatePatterns: ['married_to', 'parent_of', 'child_of', 'likes', 'dislikes', 'knows'],
    colorClass: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
  },
  {
    key: 'history',
    label: 'History',
    icon: <Shield className="w-4 h-4" />,
    predicatePatterns: ['achievement', 'language', 'grammar'],
    colorClass: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  },
];

const SUGGESTED_QUERIES: SuggestedQuery[] = [
  { label: 'All characters', description: 'List every person in the world', query: 'person(X)', category: 'Characters' },
  { label: 'Living characters', description: 'Characters that are alive', query: 'alive(X)', category: 'Characters' },
  { label: 'Character ages', description: 'All characters with their ages', query: 'age(X, Age)', category: 'Characters' },
  { label: 'Married couples', description: 'All marriage relationships', query: 'married_to(X, Y)', category: 'Relationships' },
  { label: 'Parent-child links', description: 'All parent-child relationships', query: 'parent_of(Parent, Child)', category: 'Relationships' },
  { label: 'All settlements', description: 'Every settlement in the world', query: 'settlement(X)', category: 'Locations' },
  { label: 'Settlement names', description: 'Settlements with their names', query: 'settlement_name(X, Name)', category: 'Locations' },
  { label: 'All businesses', description: 'Every business in the world', query: 'business(X)', category: 'Locations' },
  { label: 'Business owners', description: 'Businesses with their owners', query: 'business_owner(Biz, Owner)', category: 'Locations' },
  { label: 'All items', description: 'Every item in the knowledge base', query: 'item(X)', category: 'Items' },
  { label: 'Item details', description: 'Items with names and types', query: 'item_name(X, Name), item_type(X, Type)', category: 'Items' },
  { label: 'All truths', description: 'World truths and lore entries', query: 'truth(X, Title, Content)', category: 'Truths' },
  { label: 'Character occupations', description: 'Characters with their jobs', query: 'occupation(X, Job)', category: 'Characters' },
  { label: 'Personality traits', description: 'Big Five personality values', query: 'personality(X, Trait, Value)', category: 'Characters' },
  { label: 'Character skills', description: 'All character skill levels', query: 'skill(X, SkillName, Level)', category: 'Characters' },
  { label: 'Active rules', description: 'Currently active game rules', query: 'rule_active(X)', category: 'Rules' },
  { label: 'Adults over 30', description: 'Characters older than 30', query: 'age(X, A), A > 30', category: 'Characters' },
  { label: 'Characters at locations', description: 'Where each character is', query: 'at_location(Char, Loc)', category: 'Characters' },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function loadHistory(): QueryHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: QueryHistoryEntry[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, MAX_HISTORY)));
  } catch {
    // localStorage may be full; silently ignore
  }
}

function categorizeFact(factStr: string): string {
  const predicateName = factStr.split('(')[0]?.trim() || '';
  for (const cat of FACT_CATEGORIES) {
    if (cat.predicatePatterns.some(p => predicateName.startsWith(p) || predicateName === p)) {
      return cat.key;
    }
  }
  return 'other';
}

function exportAsCSV(results: QueryResult[], columns: string[]): string {
  const header = columns.join(',');
  const rows = results.map(r =>
    columns.map(c => {
      const val = String(r[c] ?? '');
      return val.includes(',') || val.includes('"') || val.includes('\n')
        ? `"${val.replace(/"/g, '""')}"`
        : val;
    }).join(',')
  );
  return [header, ...rows].join('\n');
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// ── Component ──────────────────────────────────────────────────────────────

export function EnhancedKBQuery({ worldId }: EnhancedKBQueryProps) {
  const [facts, setFacts] = useState<string[]>([]);
  const [predicates, setPredicates] = useState<PredicateInfo[]>([]);
  const [isLoadingFacts, setIsLoadingFacts] = useState(false);
  const [isQuerying, setIsQuerying] = useState(false);

  // Query builder state
  const [selectedPredicate, setSelectedPredicate] = useState<string>('');
  const [argValues, setArgValues] = useState<string[]>([]);
  const [rawQuery, setRawQuery] = useState('');

  // Results
  const [queryResults, setQueryResults] = useState<QueryResult[]>([]);
  const [resultColumns, setResultColumns] = useState<string[]>([]);
  const [lastQueryText, setLastQueryText] = useState('');

  // History
  const [history, setHistory] = useState<QueryHistoryEntry[]>(loadHistory);

  // UI state
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [factSearchFilter, setFactSearchFilter] = useState('');
  const [activeSection, setActiveSection] = useState<'builder' | 'suggested' | 'history'>('builder');

  const { toast } = useToast();

  // ── Data loading ───────────────────────────────────────────────────────

  useEffect(() => {
    loadFacts();
    loadPredicates();
  }, [worldId]);

  const loadFacts = async () => {
    setIsLoadingFacts(true);
    try {
      const res = await fetch(`/api/prolog/facts?worldId=${worldId}`);
      const data = await res.json();
      if (data.status === 'success') {
        setFacts(data.facts || []);
      }
    } catch {
      // silent
    } finally {
      setIsLoadingFacts(false);
    }
  };

  const loadPredicates = async () => {
    try {
      const res = await fetch('/api/prolog/predicates');
      if (res.ok) {
        const data = await res.json();
        const preds: PredicateInfo[] = Object.entries(data.predicates || {}).map(
          ([name, info]: [string, any]) => ({
            name,
            arity: info.arity || 0,
            category: info.category || 'utility',
            description: info.description || '',
            args: info.args || [],
            examples: info.examples || [],
          })
        );
        setPredicates(preds);
      }
    } catch {
      // silent
    }
  };

  // ── Categorized facts ─────────────────────────────────────────────────

  const categorizedFacts = useMemo(() => {
    const groups: Record<string, string[]> = {};
    const filtered = factSearchFilter
      ? facts.filter(f => f.toLowerCase().includes(factSearchFilter.toLowerCase()))
      : facts;

    for (const fact of filtered) {
      const cat = categorizeFact(fact);
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(fact);
    }
    return groups;
  }, [facts, factSearchFilter]);

  // ── Unique predicates from facts (for dropdown) ───────────────────────

  const knownPredicatesFromFacts = useMemo(() => {
    const predSet = new Set<string>();
    for (const fact of facts) {
      const match = fact.match(/^([a-z_][a-z0-9_]*)\s*\(/);
      if (match) predSet.add(match[1]);
    }
    return Array.from(predSet).sort();
  }, [facts]);

  // ── Query execution ───────────────────────────────────────────────────

  const executeQuery = useCallback(async (queryText: string) => {
    const q = queryText.trim();
    if (!q) return;

    setIsQuerying(true);
    setLastQueryText(q);
    try {
      const res = await fetch('/api/prolog/tau/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worldId, query: q, maxResults: 100 }),
      });
      const data = await res.json();

      if (data.error) {
        toast({ title: 'Query Error', description: data.error, variant: 'destructive' });
        addToHistory(q, 0, data.error);
        setQueryResults([]);
        setResultColumns([]);
        return;
      }

      const results: QueryResult[] = data.results || [];
      setQueryResults(results);

      // Derive columns from results
      if (results.length > 0) {
        const cols = new Set<string>();
        for (const r of results) {
          if (typeof r === 'object' && r !== null) {
            Object.keys(r).forEach(k => cols.add(k));
          }
        }
        setResultColumns(Array.from(cols));
      } else {
        setResultColumns([]);
      }

      const count = data.count ?? results.length;
      addToHistory(q, count);

      toast({
        title: 'Query Complete',
        description: `Found ${count} result${count !== 1 ? 's' : ''}`,
      });
    } catch (err: any) {
      toast({ title: 'Network Error', description: 'Failed to reach query endpoint', variant: 'destructive' });
      addToHistory(q, 0, 'Network error');
    } finally {
      setIsQuerying(false);
    }
  }, [worldId]);

  const addToHistory = (query: string, resultCount: number, error?: string) => {
    setHistory(prev => {
      const entry: QueryHistoryEntry = { query, timestamp: Date.now(), resultCount, error };
      const next = [entry, ...prev.filter(h => h.query !== query)].slice(0, MAX_HISTORY);
      saveHistory(next);
      return next;
    });
  };

  // ── Query builder ─────────────────────────────────────────────────────

  const selectedPredicateInfo = useMemo(() => {
    return predicates.find(p => p.name === selectedPredicate);
  }, [selectedPredicate, predicates]);

  const handlePredicateSelect = (name: string) => {
    setSelectedPredicate(name);
    const pred = predicates.find(p => p.name === name);
    if (pred) {
      setArgValues(pred.args.map(a => a.name.toUpperCase()));
    } else {
      setArgValues([]);
    }
  };

  const buildQueryFromArgs = (): string => {
    if (!selectedPredicate) return '';
    if (argValues.length === 0) return selectedPredicate;
    return `${selectedPredicate}(${argValues.join(', ')})`;
  };

  const runBuilderQuery = () => {
    const q = buildQueryFromArgs();
    if (q) {
      setRawQuery(q);
      executeQuery(q);
    }
  };

  const fillQueryBuilder = (queryText: string) => {
    setRawQuery(queryText);
    // Try to parse predicate name
    const match = queryText.match(/^([a-z_][a-z0-9_]*)\s*\((.+)\)$/);
    if (match) {
      const predName = match[1];
      const args = match[2].split(',').map(a => a.trim());
      setSelectedPredicate(predName);
      setArgValues(args);
    }
  };

  // ── Exports ───────────────────────────────────────────────────────────

  const exportResultsCSV = () => {
    if (queryResults.length === 0 || resultColumns.length === 0) return;
    const csv = exportAsCSV(queryResults, resultColumns);
    downloadFile(csv, `kb-query-results-${Date.now()}.csv`, 'text/csv');
  };

  const exportResultsJSON = () => {
    if (queryResults.length === 0) return;
    const json = JSON.stringify(queryResults, null, 2);
    downloadFile(json, `kb-query-results-${Date.now()}.json`, 'application/json');
  };

  // ── Toggle category expand ────────────────────────────────────────────

  const toggleCategory = (key: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Knowledge Base Explorer
            <Badge variant="secondary" className="ml-2 text-xs">
              {facts.length} facts
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={loadFacts}
              disabled={isLoadingFacts}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isLoadingFacts ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ── Left column: Categorized Facts ─────────────────────────────── */}
        <Card className="lg:col-span-1 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              Fact Categories
            </CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={factSearchFilter}
                onChange={(e) => setFactSearchFilter(e.target.value)}
                placeholder="Filter facts..."
                className="h-8 pl-8 text-xs"
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-[500px]">
              <div className="space-y-1">
                {FACT_CATEGORIES.map(cat => {
                  const catFacts = categorizedFacts[cat.key] || [];
                  if (catFacts.length === 0 && !factSearchFilter) return null;
                  const isExpanded = expandedCategories.has(cat.key);

                  return (
                    <Collapsible
                      key={cat.key}
                      open={isExpanded}
                      onOpenChange={() => toggleCategory(cat.key)}
                    >
                      <CollapsibleTrigger className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/50 transition-colors text-left">
                        {isExpanded
                          ? <ChevronDown className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                          : <ChevronRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                        }
                        <span className="shrink-0">{cat.icon}</span>
                        <span className="text-sm font-medium flex-1">{cat.label}</span>
                        <Badge variant="secondary" className={`text-[10px] px-1.5 ${cat.colorClass}`}>
                          {catFacts.length}
                        </Badge>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="ml-6 mt-1 space-y-0.5 max-h-48 overflow-y-auto">
                          {catFacts.slice(0, 100).map((fact, i) => (
                            <div
                              key={i}
                              className="text-[11px] font-mono px-2 py-0.5 rounded hover:bg-muted/30 cursor-pointer truncate"
                              title={fact}
                              onClick={() => {
                                // Extract predicate and fill query
                                const match = fact.match(/^[^.]+/);
                                if (match) {
                                  setRawQuery(match[0]);
                                  setActiveSection('builder');
                                }
                              }}
                            >
                              {fact}
                            </div>
                          ))}
                          {catFacts.length > 100 && (
                            <div className="text-[10px] text-muted-foreground px-2 py-1">
                              ...and {catFacts.length - 100} more
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}

                {/* Other / uncategorized */}
                {categorizedFacts['other'] && categorizedFacts['other'].length > 0 && (
                  <Collapsible
                    open={expandedCategories.has('other')}
                    onOpenChange={() => toggleCategory('other')}
                  >
                    <CollapsibleTrigger className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/50 transition-colors text-left">
                      {expandedCategories.has('other')
                        ? <ChevronDown className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                        : <ChevronRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                      }
                      <span className="text-sm font-medium flex-1">Other</span>
                      <Badge variant="secondary" className="text-[10px] px-1.5">
                        {categorizedFacts['other'].length}
                      </Badge>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="ml-6 mt-1 space-y-0.5 max-h-48 overflow-y-auto">
                        {categorizedFacts['other'].slice(0, 100).map((fact, i) => (
                          <div
                            key={i}
                            className="text-[11px] font-mono px-2 py-0.5 rounded hover:bg-muted/30 cursor-pointer truncate"
                            title={fact}
                            onClick={() => {
                              const match = fact.match(/^[^.]+/);
                              if (match) {
                                setRawQuery(match[0]);
                                setActiveSection('builder');
                              }
                            }}
                          >
                            {fact}
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {facts.length === 0 && !isLoadingFacts && (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No facts loaded. Click Refresh or sync from database.
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* ── Right column: Query Builder + Results ──────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Section tabs */}
          <div className="flex gap-1 border-b border-white/10 pb-1">
            <Button
              variant={activeSection === 'builder' ? 'default' : 'ghost'}
              size="sm"
              className="text-xs"
              onClick={() => setActiveSection('builder')}
            >
              <Search className="w-3.5 h-3.5 mr-1" />
              Query Builder
            </Button>
            <Button
              variant={activeSection === 'suggested' ? 'default' : 'ghost'}
              size="sm"
              className="text-xs"
              onClick={() => setActiveSection('suggested')}
            >
              <Lightbulb className="w-3.5 h-3.5 mr-1" />
              Suggestions
            </Button>
            <Button
              variant={activeSection === 'history' ? 'default' : 'ghost'}
              size="sm"
              className="text-xs"
              onClick={() => setActiveSection('history')}
            >
              <History className="w-3.5 h-3.5 mr-1" />
              History
              {history.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-[10px] px-1">
                  {history.length}
                </Badge>
              )}
            </Button>
          </div>

          {/* ── Query Builder Panel ──────────────────────────────────────── */}
          {activeSection === 'builder' && (
            <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
              <CardContent className="pt-4 space-y-4">
                {/* Predicate selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Predicate
                  </label>
                  <Select value={selectedPredicate} onValueChange={handlePredicateSelect}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select a predicate..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {/* Predicates from schema */}
                        {predicates.map(p => (
                          <SelectItem key={p.name} value={p.name}>
                            <span className="font-mono text-xs">{p.name}/{p.arity}</span>
                            <span className="ml-2 text-muted-foreground text-xs truncate">
                              {p.description.slice(0, 50)}
                            </span>
                          </SelectItem>
                        ))}
                        {/* Predicates discovered from facts but not in schema */}
                        {knownPredicatesFromFacts
                          .filter(name => !predicates.some(p => p.name === name))
                          .map(name => (
                            <SelectItem key={name} value={name}>
                              <span className="font-mono text-xs">{name}</span>
                              <span className="ml-2 text-muted-foreground text-xs">(from KB)</span>
                            </SelectItem>
                          ))
                        }
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* Argument inputs */}
                {selectedPredicateInfo && selectedPredicateInfo.args.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Arguments
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedPredicateInfo.args.map((arg, i) => (
                        <div key={i} className="space-y-1">
                          <label className="text-[11px] text-muted-foreground font-mono">
                            {arg.name}
                            <span className="text-muted-foreground/60 ml-1">({arg.type})</span>
                          </label>
                          <Input
                            value={argValues[i] || ''}
                            onChange={(e) => {
                              const next = [...argValues];
                              next[i] = e.target.value;
                              setArgValues(next);
                            }}
                            placeholder={`Variable or value (e.g., X, 'john')`}
                            className="h-8 text-xs font-mono"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Built query preview */}
                {selectedPredicate && (
                  <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30 border border-muted">
                    <code className="text-xs font-mono flex-1 text-foreground">
                      {buildQueryFromArgs()}
                    </code>
                    <Button
                      size="sm"
                      className="h-7 px-3"
                      onClick={runBuilderQuery}
                      disabled={isQuerying}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Run
                    </Button>
                  </div>
                )}

                {/* Raw query input */}
                <div className="space-y-2 border-t pt-3">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Raw Query
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={rawQuery}
                      onChange={(e) => setRawQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && executeQuery(rawQuery)}
                      placeholder="e.g., person(X), age(X, A), A > 25"
                      className="h-9 text-sm font-mono"
                    />
                    <Button
                      onClick={() => executeQuery(rawQuery)}
                      disabled={isQuerying || !rawQuery.trim()}
                      className="shrink-0"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Run
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Suggested Queries Panel ───────────────────────────────────── */}
          {activeSection === 'suggested' && (
            <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
              <CardContent className="pt-4">
                <ScrollArea className="h-[300px]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SUGGESTED_QUERIES.map((sq, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg border border-muted hover:border-primary/30 hover:bg-muted/30 cursor-pointer transition-all group"
                        onClick={() => {
                          fillQueryBuilder(sq.query);
                          setActiveSection('builder');
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium group-hover:text-primary transition-colors">
                              {sq.label}
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              {sq.description}
                            </div>
                            <code className="text-[10px] font-mono text-primary/70 mt-1 block truncate">
                              {sq.query}
                            </code>
                          </div>
                          <Badge variant="outline" className="text-[9px] shrink-0">
                            {sq.category}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* ── History Panel ────────────────────────────────────────────── */}
          {activeSection === 'history' && (
            <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
              <CardContent className="pt-4">
                {history.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No query history yet. Run a query to see it here.
                  </div>
                ) : (
                  <>
                    <div className="flex justify-end mb-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground"
                        onClick={() => {
                          setHistory([]);
                          saveHistory([]);
                        }}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Clear History
                      </Button>
                    </div>
                    <ScrollArea className="h-[280px]">
                      <div className="space-y-1.5">
                        {history.map((entry, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 px-3 py-2 rounded-md border hover:bg-muted/30 transition-colors group"
                          >
                            <Clock className="w-3 h-3 text-muted-foreground shrink-0" />
                            <div className="flex-1 min-w-0">
                              <code className="text-xs font-mono block truncate">{entry.query}</code>
                              <div className="text-[10px] text-muted-foreground mt-0.5">
                                {new Date(entry.timestamp).toLocaleTimeString()}
                              </div>
                            </div>
                            {entry.error ? (
                              <Badge variant="destructive" className="text-[9px] px-1.5 shrink-0">
                                error
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[9px] px-1.5 shrink-0">
                                {entry.resultCount} result{entry.resultCount !== 1 ? 's' : ''}
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                              onClick={() => {
                                setRawQuery(entry.query);
                                executeQuery(entry.query);
                                setActiveSection('builder');
                              }}
                              title="Re-run this query"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* ── Results Table ────────────────────────────────────────────── */}
          {(queryResults.length > 0 || lastQueryText) && (
            <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  Results
                  {lastQueryText && (
                    <code className="text-[11px] font-mono text-muted-foreground font-normal ml-2 truncate">
                      {lastQueryText}
                    </code>
                  )}
                  <Badge variant="secondary" className="text-[10px] ml-auto">
                    {queryResults.length} row{queryResults.length !== 1 ? 's' : ''}
                  </Badge>
                  {queryResults.length > 0 && (
                    <div className="flex gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7"
                        onClick={exportResultsCSV}
                        title="Export as CSV"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7"
                        onClick={exportResultsJSON}
                        title="Export as JSON"
                      >
                        <FileJson className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {queryResults.length > 0 && resultColumns.length > 0 ? (
                  <ScrollArea className="h-[300px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10 text-[10px]">#</TableHead>
                          {resultColumns.map(col => (
                            <TableHead key={col} className="text-[11px] font-mono">
                              {col}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {queryResults.map((row, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-[10px] text-muted-foreground">
                              {i + 1}
                            </TableCell>
                            {resultColumns.map(col => (
                              <TableCell key={col} className="text-xs font-mono max-w-[200px] truncate">
                                {typeof row === 'object' && row !== null
                                  ? String(row[col] ?? '')
                                  : String(row)}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                ) : queryResults.length > 0 ? (
                  // Boolean / non-object results
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-1 p-2">
                      {queryResults.map((r, i) => (
                        <div key={i} className="text-xs font-mono text-green-600 dark:text-green-400">
                          {typeof r === 'boolean' ? (r ? 'true' : 'false') : JSON.stringify(r)}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : lastQueryText ? (
                  <div className="py-6 text-center text-sm text-muted-foreground italic">
                    No results (false)
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
