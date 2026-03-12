import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Calendar, ChevronDown, ChevronRight, Clock, Filter,
  Globe, Link2, MapPin, Milestone, Plus, Search, User, Users,
} from 'lucide-react';

interface Truth {
  id: string;
  worldId: string;
  characterId?: string;
  title: string;
  content: string;
  entryType: string;
  timestep: number;
  timeYear?: number;
  timeSeason?: string;
  timeDescription?: string;
  historicalEra?: string;
  historicalSignificance?: string;
  causesTruthIds?: string[];
  causedByTruthIds?: string[];
  relatedCharacterIds?: string[];
  relatedLocationIds?: string[];
  tags?: string[];
  importance?: number;
  isPublic?: boolean;
  source?: string;
}

interface World {
  id: string;
  historyStartYear?: number;
  historyEndYear?: number;
  currentGameYear?: number;
  timestepUnit?: string;
}

type TieredView = 'headlines' | 'notable' | 'all';

const TIERED_VIEW_CONFIG: Record<TieredView, { label: string; minImportance: number }> = {
  headlines: { label: 'Headlines', minImportance: 7 },
  notable: { label: 'Notable', minImportance: 4 },
  all: { label: 'All', minImportance: 1 },
};

interface HistoryTimelineViewProps {
  worldId: string;
  characters: Array<{ id: string; name?: string; firstName?: string; lastName?: string }>;
  onAddEvent?: (year?: number, era?: string) => void;
}

const ERA_COLORS: Record<string, string> = {
  'pre_industrial': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  'civil_war': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  'reconstruction': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  'gilded_age': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'progressive': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'roaring_twenties': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  'great_depression': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  'world_war_ii': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  'post_war': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'civil_rights': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  'modern': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  'contemporary': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  'founding': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  'industrial': 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300',
};

const SIGNIFICANCE_ICONS: Record<string, typeof Globe> = {
  'world': Globe,
  'country': MapPin,
  'state': MapPin,
  'settlement': MapPin,
  'family': Users,
  'personal': User,
};

const SIGNIFICANCE_ORDER = ['world', 'country', 'state', 'settlement', 'family', 'personal'];

type FilterSignificance = 'all' | string;
type FilterEra = 'all' | string;

export function HistoryTimelineView({ worldId, characters, onAddEvent }: HistoryTimelineViewProps) {
  const [expandedEras, setExpandedEras] = useState<Set<string>>(new Set());
  const [filterSignificance, setFilterSignificance] = useState<FilterSignificance>('all');
  const [filterEra, setFilterEra] = useState<FilterEra>('all');
  const [selectedTruthId, setSelectedTruthId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tieredView, setTieredView] = useState<TieredView>('notable');

  const { data: allTruths = [] } = useQuery<Truth[]>({
    queryKey: ['/api/worlds', worldId, 'truth'],
    enabled: !!worldId,
  });

  const { data: world } = useQuery<World>({
    queryKey: ['/api/worlds', worldId],
    enabled: !!worldId,
  });

  // Filter to history-relevant truths
  const historicalTruths = useMemo(() => {
    return allTruths.filter(t =>
      t.entryType === 'history' ||
      t.entryType === 'event' ||
      t.entryType === 'milestone' ||
      t.historicalEra
    );
  }, [allTruths]);

  // Apply filters
  const filteredTruths = useMemo(() => {
    let result = historicalTruths;
    if (filterSignificance !== 'all') {
      result = result.filter(t => t.historicalSignificance === filterSignificance);
    }
    if (filterEra !== 'all') {
      result = result.filter(t => t.historicalEra === filterEra);
    }
    // Tiered view filter by importance
    const minImportance = TIERED_VIEW_CONFIG[tieredView].minImportance;
    result = result.filter(t => (t.importance ?? 5) >= minImportance);
    // Full-text search filter
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.content.toLowerCase().includes(query)
      );
    }
    return result.sort((a, b) => (a.timeYear ?? a.timestep) - (b.timeYear ?? b.timestep));
  }, [historicalTruths, filterSignificance, filterEra, tieredView, searchQuery]);

  // Group by era
  const eraGroups = useMemo(() => {
    const groups = new Map<string, Truth[]>();
    for (const truth of filteredTruths) {
      const era = truth.historicalEra ?? 'unclassified';
      const existing = groups.get(era);
      if (existing) {
        existing.push(truth);
      } else {
        groups.set(era, [truth]);
      }
    }
    return Array.from(groups.entries());
  }, [filteredTruths]);

  // Available eras for filter
  const availableEras = useMemo(() => {
    const eras = new Set<string>();
    for (const t of historicalTruths) {
      if (t.historicalEra) eras.add(t.historicalEra);
    }
    return Array.from(eras);
  }, [historicalTruths]);

  // Build truth lookup for causal connections
  const truthMap = useMemo(() => {
    const map = new Map<string, Truth>();
    for (const t of allTruths) {
      map.set(t.id, t);
    }
    return map;
  }, [allTruths]);

  // Character name lookup
  const charNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of characters) {
      const name = c.name ?? [c.firstName, c.lastName].filter(Boolean).join(' ') ?? c.id;
      map.set(c.id, name);
    }
    return map;
  }, [characters]);

  const selectedTruth = selectedTruthId ? truthMap.get(selectedTruthId) : null;

  const toggleEra = (era: string) => {
    setExpandedEras(prev => {
      const next = new Set(prev);
      if (next.has(era)) {
        next.delete(era);
      } else {
        next.add(era);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedEras(new Set(eraGroups.map(([era]) => era)));
  };

  const collapseAll = () => {
    setExpandedEras(new Set());
  };

  const formatEraName = (era: string) =>
    era.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const getYearRange = (truths: Truth[]): string => {
    const years = truths.map(t => t.timeYear).filter((y): y is number => y != null);
    if (years.length === 0) return '';
    const min = Math.min(...years);
    const max = Math.max(...years);
    return min === max ? `${min}` : `${min}–${max}`;
  };

  return (
    <div className="space-y-4">
      {/* World timeline header */}
      <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>History: {world?.historyStartYear ?? '—'} – {world?.historyEndYear ?? '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Gameplay: {world?.currentGameYear ?? world?.historyEndYear ?? '—'}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {filteredTruths.length}/{historicalTruths.length} events
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {/* Full-text search */}
              <div className="relative">
                <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="h-8 w-[180px] pl-7 text-xs"
                />
              </div>

              {/* Tiered view toggle */}
              <div className="flex items-center rounded-md border border-input bg-background h-8">
                {(Object.entries(TIERED_VIEW_CONFIG) as Array<[TieredView, { label: string; minImportance: number }]>).map(([key, config]) => (
                  <TooltipProvider key={key}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className={`px-2.5 h-full text-xs font-medium transition-colors ${
                            tieredView === key
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted text-muted-foreground'
                          } ${key === 'headlines' ? 'rounded-l-md' : ''} ${key === 'all' ? 'rounded-r-md' : ''}`}
                          onClick={() => setTieredView(key)}
                        >
                          {config.label}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Importance {config.minImportance}+</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>

              <Select value={filterEra} onValueChange={setFilterEra}>
                <SelectTrigger className="w-[160px] h-8 text-xs">
                  <Filter className="w-3 h-3 mr-1" />
                  <SelectValue placeholder="Era" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Eras</SelectItem>
                  {availableEras.map(era => (
                    <SelectItem key={era} value={era}>{formatEraName(era)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterSignificance} onValueChange={setFilterSignificance}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue placeholder="Scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scopes</SelectItem>
                  {SIGNIFICANCE_ORDER.map(s => (
                    <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="ghost" size="sm" className="text-xs h-8" onClick={expandAll}>
                Expand All
              </Button>
              <Button variant="ghost" size="sm" className="text-xs h-8" onClick={collapseAll}>
                Collapse
              </Button>

              {/* Add Event button in header */}
              {onAddEvent && (
                <Button
                  variant="default"
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => onAddEvent()}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Event
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        {/* Timeline */}
        <div className="flex-1 min-w-0">
          <ScrollArea className="h-[600px]">
            {eraGroups.length === 0 ? (
              <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <Milestone className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">
                      No historical events yet. Run a historical simulation or create truths with the "history" entry type.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {eraGroups.map(([era, truths]) => {
                  const isExpanded = expandedEras.has(era);
                  const yearRange = getYearRange(truths);
                  const colorClass = ERA_COLORS[era] ?? 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300';

                  return (
                    <Card
                      key={era}
                      className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl overflow-hidden"
                    >
                      <div className="flex items-center">
                        <button
                          className="flex-1 flex items-center gap-3 px-4 py-3 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                          onClick={() => toggleEra(era)}
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 shrink-0" />
                          )}
                          <Badge className={`${colorClass} text-xs`}>
                            {formatEraName(era)}
                          </Badge>
                          {yearRange && (
                            <span className="text-xs text-muted-foreground">{yearRange}</span>
                          )}
                          <Badge variant="secondary" className="text-xs ml-auto">
                            {truths.length} event{truths.length !== 1 ? 's' : ''}
                          </Badge>
                        </button>
                        {onAddEvent && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 mr-2 shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              const years = truths.map(t => t.timeYear).filter((y): y is number => y != null);
                              const maxYear = years.length > 0 ? Math.max(...years) : undefined;
                              onAddEvent(maxYear, era);
                            }}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Event
                          </Button>
                        )}
                      </div>

                      {isExpanded && (
                        <div className="border-t border-white/10">
                          {truths.map((truth, idx) => {
                            const SigIcon = SIGNIFICANCE_ICONS[truth.historicalSignificance ?? ''] ?? Milestone;
                            const isSelected = selectedTruthId === truth.id;
                            const hasCauses = (truth.causedByTruthIds?.length ?? 0) > 0;
                            const hasEffects = (truth.causesTruthIds?.length ?? 0) > 0;

                            return (
                              <button
                                key={truth.id}
                                className={`w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors ${
                                  isSelected
                                    ? 'bg-primary/10 dark:bg-primary/20'
                                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                                } ${idx > 0 ? 'border-t border-white/5' : ''}`}
                                onClick={() => setSelectedTruthId(isSelected ? null : truth.id)}
                              >
                                {/* Timeline dot */}
                                <div className="flex flex-col items-center mt-1 shrink-0">
                                  <div className={`w-2.5 h-2.5 rounded-full ${
                                    (truth.importance ?? 5) >= 8
                                      ? 'bg-red-500'
                                      : (truth.importance ?? 5) >= 5
                                        ? 'bg-primary'
                                        : 'bg-muted-foreground/40'
                                  }`} />
                                  {idx < truths.length - 1 && (
                                    <div className="w-px h-6 bg-muted-foreground/20 mt-1" />
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium truncate">{truth.title}</span>
                                    <SigIcon className="w-3 h-3 text-muted-foreground shrink-0" />
                                    {(hasCauses || hasEffects) && (
                                      <Link2 className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    {truth.timeYear && (
                                      <span className="text-xs text-muted-foreground">{truth.timeYear}</span>
                                    )}
                                    {truth.timeSeason && (
                                      <span className="text-xs text-muted-foreground capitalize">· {truth.timeSeason}</span>
                                    )}
                                    {truth.tags && truth.tags.length > 0 && (
                                      <div className="flex gap-1">
                                        {truth.tags.slice(0, 3).map(tag => (
                                          <Badge key={tag} variant="outline" className="text-[10px] px-1 py-0">
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="shrink-0">
                                  <Badge variant="outline" className="text-[10px]">
                                    {truth.importance ?? 5}/10
                                  </Badge>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Detail panel */}
        {selectedTruth && (
          <Card className="w-[340px] shrink-0 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{selectedTruth.title}</CardTitle>
              <CardDescription className="text-xs">
                {selectedTruth.timeYear && `Year ${selectedTruth.timeYear}`}
                {selectedTruth.timeSeason && ` · ${selectedTruth.timeSeason}`}
                {selectedTruth.timeDescription && ` — ${selectedTruth.timeDescription}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground leading-relaxed">{selectedTruth.content}</p>

              {/* Metadata */}
              <div className="flex flex-wrap gap-1.5">
                {selectedTruth.historicalEra && (
                  <Badge className={ERA_COLORS[selectedTruth.historicalEra] ?? 'bg-slate-100 text-slate-800'}>
                    {formatEraName(selectedTruth.historicalEra)}
                  </Badge>
                )}
                {selectedTruth.historicalSignificance && (
                  <Badge variant="outline" className="text-xs capitalize">
                    {selectedTruth.historicalSignificance} scope
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {selectedTruth.entryType}
                </Badge>
              </div>

              {/* Causal connections */}
              {(selectedTruth.causedByTruthIds?.length ?? 0) > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-1">Caused By</h4>
                  <div className="space-y-1">
                    {selectedTruth.causedByTruthIds?.map(id => {
                      const cause = truthMap.get(id);
                      return (
                        <button
                          key={id}
                          className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                          onClick={() => setSelectedTruthId(id)}
                        >
                          <Link2 className="w-3 h-3" />
                          {cause?.title ?? id}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {(selectedTruth.causesTruthIds?.length ?? 0) > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-1">Led To</h4>
                  <div className="space-y-1">
                    {selectedTruth.causesTruthIds?.map(id => {
                      const effect = truthMap.get(id);
                      return (
                        <button
                          key={id}
                          className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                          onClick={() => setSelectedTruthId(id)}
                        >
                          <Link2 className="w-3 h-3" />
                          {effect?.title ?? id}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Related characters */}
              {(selectedTruth.relatedCharacterIds?.length ?? 0) > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-1">Related Characters</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedTruth.relatedCharacterIds?.map(cid => (
                      <Badge key={cid} variant="secondary" className="text-xs">
                        <User className="w-3 h-3 mr-1" />
                        {charNameMap.get(cid) ?? cid.slice(0, 8)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {(selectedTruth.tags?.length ?? 0) > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-1">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedTruth.tags?.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-[10px] text-muted-foreground/60 pt-1 border-t border-white/10">
                Source: {selectedTruth.source ?? 'unknown'} · ID: {selectedTruth.id.slice(0, 8)}…
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
