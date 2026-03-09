/**
 * Predicate Palette
 *
 * Searchable palette of core Prolog predicates from core-predicates.json.
 * Users can browse by category, search by name, and click to insert
 * predicates into rule/action/quest editors.
 */

import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Search, Copy, ChevronDown, ChevronRight, Braces,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────

interface PredicateArg {
  name: string;
  type: string;
  description?: string;
}

interface PredicateInfo {
  name: string;
  category: string;
  arity: number;
  description: string;
  args: PredicateArg[];
  examples: string[];
  builtIn: boolean;
}

interface PredicatePaletteProps {
  /** Called when user clicks a predicate to insert it */
  onInsert?: (predicateText: string) => void;
  /** Compact mode for sidebar usage */
  compact?: boolean;
  /** Filter to specific categories */
  categoryFilter?: string[];
}

// ── Category metadata ─────────────────────────────────────────────────────

const CATEGORY_META: Record<string, { label: string; color: string; icon: string }> = {
  'entity-type': { label: 'Entity Types', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: '🏷' },
  'property': { label: 'Properties', color: 'bg-green-500/10 text-green-600 border-green-500/20', icon: '📋' },
  'relationship': { label: 'Relationships', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20', icon: '🔗' },
  'state': { label: 'States', color: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20', icon: '⚡' },
  'event': { label: 'Events', color: 'bg-red-500/10 text-red-600 border-red-500/20', icon: '📢' },
  'genealogy': { label: 'Genealogy', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20', icon: '🌳' },
  'knowledge': { label: 'Knowledge', color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20', icon: '🧠' },
  'utility': { label: 'Utility', color: 'bg-gray-500/10 text-gray-600 border-gray-500/20', icon: '🔧' },
};

export function PredicatePalette({ onInsert, compact = false, categoryFilter }: PredicatePaletteProps) {
  const [predicates, setPredicates] = useState<PredicateInfo[]>([]);
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Load core predicates
  useEffect(() => {
    loadPredicates();
  }, []);

  const loadPredicates = async () => {
    try {
      const res = await fetch('/api/prolog/predicates');
      if (res.ok) {
        const data = await res.json();
        // data.predicates is { name: { category, arity, ... } }
        const preds: PredicateInfo[] = Object.entries(data.predicates || {}).map(
          ([name, info]: [string, any]) => ({
            name,
            category: info.category || 'utility',
            arity: info.arity || 0,
            description: info.description || '',
            args: info.args || [],
            examples: info.examples || [],
            builtIn: info.builtIn !== false,
          })
        );
        setPredicates(preds);
        // Expand first category by default
        if (preds.length > 0) {
          const cats = Array.from(new Set(preds.map(p => p.category)));
          setExpandedCategories(new Set(cats.slice(0, 2)));
        }
      }
    } catch (e) {
      console.warn('[PredicatePalette] Failed to load predicates:', e);
    } finally {
      setLoading(false);
    }
  };

  // Filter and group
  const { grouped, matchCount } = useMemo(() => {
    let filtered = predicates;
    if (categoryFilter) {
      filtered = filtered.filter(p => categoryFilter.includes(p.category));
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    const groups: Record<string, PredicateInfo[]> = {};
    for (const pred of filtered) {
      if (!groups[pred.category]) groups[pred.category] = [];
      groups[pred.category].push(pred);
    }
    return { grouped: groups, matchCount: filtered.length };
  }, [predicates, search, categoryFilter]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const handleInsert = (pred: PredicateInfo) => {
    // Build a template like: age(?entity, ?years)
    const argList = pred.args.map(a => `?${a.name}`).join(', ');
    const template = pred.arity > 0 ? `${pred.name}(${argList})` : pred.name;
    onInsert?.(template);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
        Loading predicates...
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${compact ? 'h-full' : ''}`}>
      {/* Header */}
      <div className="px-3 py-2 border-b shrink-0">
        <div className="flex items-center gap-1.5 mb-2">
          <Braces className="w-3.5 h-3.5 text-purple-500" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Predicates
          </span>
          <span className="ml-auto text-xs text-muted-foreground">{matchCount}</span>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search predicates..."
            className="h-7 pl-7 text-xs"
          />
        </div>
      </div>

      {/* Predicate tree */}
      <ScrollArea className="flex-1">
        <div className="p-1">
          {Object.entries(grouped).map(([category, preds]) => {
            const meta = CATEGORY_META[category] || { label: category, color: 'bg-muted text-foreground', icon: '📦' };
            const isExpanded = expandedCategories.has(category);

            return (
              <div key={category} className="mb-1">
                {/* Category header */}
                <button
                  className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium hover:bg-muted/50 rounded transition-colors"
                  onClick={() => toggleCategory(category)}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3 shrink-0" />
                  ) : (
                    <ChevronRight className="w-3 h-3 shrink-0" />
                  )}
                  <span>{meta.icon}</span>
                  <span>{meta.label}</span>
                  <span className="ml-auto text-muted-foreground">{preds.length}</span>
                </button>

                {/* Predicate items */}
                {isExpanded && (
                  <div className="ml-3 space-y-0.5">
                    <TooltipProvider delayDuration={300}>
                      {preds.map(pred => (
                        <Tooltip key={pred.name}>
                          <TooltipTrigger asChild>
                            <div
                              className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-muted/50 cursor-pointer group transition-colors"
                              onClick={() => handleInsert(pred)}
                            >
                              <span className="text-xs font-mono text-foreground truncate flex-1">
                                {pred.name}/{pred.arity}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const argList = pred.args.map(a => `?${a.name}`).join(', ');
                                  copyToClipboard(pred.arity > 0 ? `${pred.name}(${argList})` : pred.name);
                                }}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs">
                            <div className="space-y-1.5">
                              <div className="font-mono font-bold text-sm">
                                {pred.name}/{pred.arity}
                              </div>
                              <p className="text-xs">{pred.description}</p>
                              {pred.args.length > 0 && (
                                <div className="text-xs space-y-0.5">
                                  <span className="font-medium">Args:</span>
                                  {pred.args.map((a, i) => (
                                    <div key={i} className="ml-2 font-mono">
                                      {a.name}: <span className="text-muted-foreground">{a.type}</span>
                                      {a.description && <span className="text-muted-foreground"> — {a.description}</span>}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {pred.examples.length > 0 && (
                                <div className="text-xs">
                                  <span className="font-medium">Examples:</span>
                                  <pre className="mt-0.5 bg-muted/50 p-1 rounded text-[10px] font-mono">
                                    {pred.examples.join('\n')}
                                  </pre>
                                </div>
                              )}
                              <Badge variant="secondary" className={`text-[10px] ${meta.color}`}>
                                {meta.label}
                              </Badge>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </TooltipProvider>
                  </div>
                )}
              </div>
            );
          })}

          {matchCount === 0 && (
            <div className="p-4 text-center text-xs text-muted-foreground">
              No predicates match "{search}"
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
