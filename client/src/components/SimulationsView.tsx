/**
 * Simulations Sub-View (US-2.04)
 *
 * Controls for running historical (lo-fi) and gameplay (hi-fi) simulations.
 * Includes event type selection, LLM enrichment tiers, progress tracking,
 * and live event feed.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  Activity, AlertCircle, Check, ChevronDown, ChevronRight, Clock, Loader2, Play,
  RotateCcw, Settings2, Sparkles, Square, TestTube2, Zap,
} from 'lucide-react';

interface SimulationsViewProps {
  worldId: string;
}

interface World {
  id: string;
  historyStartYear?: number;
  historyEndYear?: number;
  currentGameYear?: number;
  timestepUnit?: string;
}

type SimMode = 'historical' | 'gameplay';
type LlmTier = 'none' | 'minor' | 'major' | 'all';

interface SimConfig {
  mode: SimMode;
  startYear: number;
  endYear: number;
  samplingRate: number;
  seed: number;
  allowVariation: boolean;
  enabledEventTypes: string[];
  llmEnrichmentTier: LlmTier;
}

interface RateTable {
  label: string;
  birthRate: number;
  deathRateMultiplier: number;
  marriageRate: number;
  divorceRate: number;
  immigrationRate: number;
  businessFoundingRate: number;
  businessClosureRate: number;
  knowledgeDecayRate: number;
  mentalModelDecayRate: number;
  salienceDecayRate: number;
}

const RATE_FIELD_LABELS: Record<string, { label: string; description: string }> = {
  birthRate: { label: 'Birth Rate', description: 'Conception probability per eligible couple per timestep' },
  deathRateMultiplier: { label: 'Death Rate Multiplier', description: 'Multiplier on age-dependent death probability' },
  marriageRate: { label: 'Marriage Rate', description: 'Engagement probability per eligible couple per timestep' },
  divorceRate: { label: 'Divorce Rate', description: 'Divorce probability per married couple per timestep' },
  immigrationRate: { label: 'Immigration Rate', description: 'New character probability per settlement per timestep' },
  businessFoundingRate: { label: 'Business Founding', description: 'New business probability per settlement per timestep' },
  businessClosureRate: { label: 'Business Closure', description: 'Existing business closure probability per timestep' },
  knowledgeDecayRate: { label: 'Knowledge Decay', description: 'How fast beliefs lose confidence (0-1 per timestep)' },
  mentalModelDecayRate: { label: 'Mental Model Decay', description: 'How fast mental models deteriorate without contact' },
  salienceDecayRate: { label: 'Salience Decay', description: 'How fast salience fades without interaction' },
};

const WORLD_TYPE_RATES: Record<string, RateTable> = {
  'medieval-fantasy': { label: 'Medieval Fantasy', birthRate: 0.18, deathRateMultiplier: 1.4, marriageRate: 0.008, divorceRate: 0.0005, immigrationRate: 0.002, businessFoundingRate: 0.003, businessClosureRate: 0.002, knowledgeDecayRate: 0.02, mentalModelDecayRate: 0.015, salienceDecayRate: 0.01 },
  'modern-realistic': { label: 'Modern Realistic', birthRate: 0.10, deathRateMultiplier: 0.7, marriageRate: 0.005, divorceRate: 0.003, immigrationRate: 0.008, businessFoundingRate: 0.006, businessClosureRate: 0.004, knowledgeDecayRate: 0.005, mentalModelDecayRate: 0.008, salienceDecayRate: 0.006 },
  'sci-fi': { label: 'Science Fiction', birthRate: 0.06, deathRateMultiplier: 0.4, marriageRate: 0.004, divorceRate: 0.004, immigrationRate: 0.012, businessFoundingRate: 0.008, businessClosureRate: 0.005, knowledgeDecayRate: 0.002, mentalModelDecayRate: 0.004, salienceDecayRate: 0.003 },
  'historical': { label: 'Historical', birthRate: 0.20, deathRateMultiplier: 1.6, marriageRate: 0.010, divorceRate: 0.0002, immigrationRate: 0.003, businessFoundingRate: 0.002, businessClosureRate: 0.003, knowledgeDecayRate: 0.025, mentalModelDecayRate: 0.020, salienceDecayRate: 0.012 },
};

const DEFAULT_RATES: RateTable = { label: 'Default', birthRate: 0.15, deathRateMultiplier: 1.0, marriageRate: 0.006, divorceRate: 0.002, immigrationRate: 0.005, businessFoundingRate: 0.005, businessClosureRate: 0.003, knowledgeDecayRate: 0.01, mentalModelDecayRate: 0.01, salienceDecayRate: 0.008 };

interface SimEvent {
  type: string;
  year: number;
  description: string;
  importance: number;
  historicalSignificance: string;
}

interface SimProgress {
  currentYear: number;
  totalYears: number;
  eventsGenerated: number;
  phase: string;
  progress: number;
}

const EVENT_TYPES = [
  { id: 'birth', label: 'Births', emoji: '👶' },
  { id: 'death', label: 'Deaths', emoji: '⚰️' },
  { id: 'marriage', label: 'Marriages', emoji: '💍' },
  { id: 'divorce', label: 'Divorces', emoji: '💔' },
  { id: 'business_founding', label: 'Business Openings', emoji: '🏪' },
  { id: 'business_closure', label: 'Business Closings', emoji: '🚪' },
  { id: 'hiring', label: 'Hiring', emoji: '💼' },
  { id: 'retirement', label: 'Retirements', emoji: '🎉' },
];

const LLM_TIERS: Array<{ value: LlmTier; label: string; description: string }> = [
  { value: 'none', label: 'None', description: 'No LLM enrichment (fastest)' },
  { value: 'minor', label: 'Minor Events', description: 'Settlement-level and above' },
  { value: 'major', label: 'Major Events', description: 'Country/world significance only' },
  { value: 'all', label: 'All Events', description: 'Every event (slow, expensive)' },
];

export function SimulationsView({ worldId }: SimulationsViewProps) {
  const queryClient = useQueryClient();

  const { data: world } = useQuery<World>({
    queryKey: ['/api/worlds', worldId],
    enabled: !!worldId,
  });

  // Simulation config state
  const [config, setConfig] = useState<SimConfig>({
    mode: 'historical',
    startYear: 1839,
    endYear: 1979,
    samplingRate: 3.6,
    seed: Math.floor(Math.random() * 1000000),
    allowVariation: true,
    enabledEventTypes: [], // empty = all
    llmEnrichmentTier: 'none',
  });

  // Rate table state
  const [rateOverrides, setRateOverrides] = useState<Partial<RateTable>>({});
  const [showRates, setShowRates] = useState(false);

  // Resolve current rates based on world type + overrides
  const worldType = (world as any)?.worldType || (world as any)?.type || '';
  const baseRates = WORLD_TYPE_RATES[worldType.toLowerCase()] || DEFAULT_RATES;
  const effectiveRates: RateTable = { ...baseRates, ...rateOverrides };

  const updateRate = useCallback((field: string, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      setRateOverrides(prev => ({ ...prev, [field]: num }));
    }
  }, []);

  const resetRates = useCallback(() => {
    setRateOverrides({});
  }, []);

  // Simulation run state
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<SimProgress | null>(null);
  const [events, setEvents] = useState<SimEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Initialize from world settings
  useState(() => {
    if (world?.historyStartYear) {
      setConfig(prev => ({
        ...prev,
        startYear: world.historyStartYear ?? 1839,
        endYear: world.historyEndYear ?? 1979,
      }));
    }
  });

  const toggleEventType = useCallback((typeId: string) => {
    setConfig(prev => {
      const types = prev.enabledEventTypes;
      if (types.includes(typeId)) {
        return { ...prev, enabledEventTypes: types.filter(t => t !== typeId) };
      }
      return { ...prev, enabledEventTypes: [...types, typeId] };
    });
  }, []);

  const runSimulation = useCallback(async () => {
    setIsRunning(true);
    setError(null);
    setEvents([]);
    setCompleted(false);
    setProgress(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch(`/api/worlds/${worldId}/simulations/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...config, rateOverrides: Object.keys(rateOverrides).length > 0 ? rateOverrides : undefined }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error ?? 'Simulation failed');
      }

      const result = await response.json();

      setEvents(result.events ?? []);
      setProgress({
        currentYear: config.endYear,
        totalYears: config.endYear - config.startYear,
        eventsGenerated: result.events?.length ?? 0,
        phase: 'complete',
        progress: 1,
      });
      setCompleted(true);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Simulation cancelled');
      } else {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    } finally {
      setIsRunning(false);
      abortRef.current = null;
    }
  }, [worldId, config, rateOverrides]);

  const cancelSimulation = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const acceptResults = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/worlds/${worldId}/simulations/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
      });
      if (!response.ok) throw new Error('Failed to accept results');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/worlds', worldId, 'truth'] });
      setCompleted(false);
      setEvents([]);
    },
  });

  // Summary stats
  const eventsByType: Record<string, number> = {};
  for (const e of events) {
    eventsByType[e.type] = (eventsByType[e.type] ?? 0) + 1;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Configuration Panel */}
        <Card className="lg:col-span-1 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mode */}
            <div className="space-y-1.5">
              <Label className="text-xs">Simulation Mode</Label>
              <Select
                value={config.mode}
                onValueChange={(v) => setConfig(prev => ({ ...prev, mode: v as SimMode }))}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="historical">Historical (Lo-Fi)</SelectItem>
                  <SelectItem value="gameplay">Gameplay (Hi-Fi)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">
                {config.mode === 'historical'
                  ? 'Fast 140-year compression with sampled timesteps'
                  : 'Full-fidelity simulation with all systems active'}
              </p>
            </div>

            {/* Year Range */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Start Year</Label>
                <Input
                  type="number"
                  value={config.startYear}
                  onChange={e => setConfig(prev => ({ ...prev, startYear: parseInt(e.target.value) || 1839 }))}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">End Year</Label>
                <Input
                  type="number"
                  value={config.endYear}
                  onChange={e => setConfig(prev => ({ ...prev, endYear: parseInt(e.target.value) || 1979 }))}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {/* Sampling Rate (historical only) */}
            {config.mode === 'historical' && (
              <div className="space-y-1">
                <Label className="text-xs">Sampling Rate (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={config.samplingRate}
                  onChange={e => setConfig(prev => ({ ...prev, samplingRate: parseFloat(e.target.value) || 3.6 }))}
                  className="h-8 text-xs"
                />
                <p className="text-[10px] text-muted-foreground">
                  TotT default: 3.6%. Higher = more events but slower.
                </p>
              </div>
            )}

            {/* Seed */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Seed</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 text-[10px] px-1.5"
                  onClick={() => setConfig(prev => ({ ...prev, seed: Math.floor(Math.random() * 1000000) }))}
                >
                  Randomize
                </Button>
              </div>
              <Input
                type="number"
                value={config.seed}
                onChange={e => setConfig(prev => ({ ...prev, seed: parseInt(e.target.value) || 0 }))}
                className="h-8 text-xs"
              />
            </div>

            {/* Variation toggle */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="allow-variation"
                checked={config.allowVariation}
                onCheckedChange={(checked) =>
                  setConfig(prev => ({ ...prev, allowVariation: checked === true }))
                }
              />
              <label htmlFor="allow-variation" className="text-xs cursor-pointer">
                Allow Variation (non-deterministic)
              </label>
            </div>

            {/* Event Types */}
            <div className="space-y-1.5">
              <Label className="text-xs">Event Types</Label>
              <p className="text-[10px] text-muted-foreground mb-1">
                {config.enabledEventTypes.length === 0 ? 'All enabled' : `${config.enabledEventTypes.length} selected`}
              </p>
              <div className="grid grid-cols-2 gap-1">
                {EVENT_TYPES.map(et => (
                  <div key={et.id} className="flex items-center gap-1.5">
                    <Checkbox
                      id={`evt-${et.id}`}
                      checked={config.enabledEventTypes.length === 0 || config.enabledEventTypes.includes(et.id)}
                      onCheckedChange={() => toggleEventType(et.id)}
                    />
                    <label htmlFor={`evt-${et.id}`} className="text-[11px] cursor-pointer">
                      {et.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* LLM Enrichment */}
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                LLM Enrichment
              </Label>
              <Select
                value={config.llmEnrichmentTier}
                onValueChange={(v) => setConfig(prev => ({ ...prev, llmEnrichmentTier: v as LlmTier }))}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LLM_TIERS.map(tier => (
                    <SelectItem key={tier.value} value={tier.value}>
                      {tier.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">
                {LLM_TIERS.find(t => t.value === config.llmEnrichmentTier)?.description}
              </p>
            </div>

            {/* Rate Tables */}
            <div className="space-y-1.5">
              <button
                onClick={() => setShowRates(!showRates)}
                className="flex items-center gap-1 text-xs font-medium w-full text-left"
              >
                {showRates ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                Rate Tables
                {Object.keys(rateOverrides).length > 0 && (
                  <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3.5 ml-1">
                    {Object.keys(rateOverrides).length} modified
                  </Badge>
                )}
              </button>
              {showRates && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-muted-foreground">
                      Base: {baseRates.label}
                    </p>
                    {Object.keys(rateOverrides).length > 0 && (
                      <Button variant="ghost" size="sm" className="h-5 text-[10px] px-1.5" onClick={resetRates}>
                        <RotateCcw className="w-2.5 h-2.5 mr-1" />
                        Reset
                      </Button>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {Object.entries(RATE_FIELD_LABELS).map(([field, meta]) => {
                      const isModified = field in rateOverrides;
                      const value = (effectiveRates as any)[field] as number;
                      return (
                        <div key={field} className="grid grid-cols-[1fr_80px] gap-2 items-center">
                          <div>
                            <div className={`text-[11px] ${isModified ? 'font-medium text-primary' : ''}`}>
                              {meta.label}
                            </div>
                          </div>
                          <Input
                            type="number"
                            step="0.001"
                            min="0"
                            value={value}
                            onChange={e => updateRate(field, e.target.value)}
                            className={`h-6 text-[10px] px-1.5 ${isModified ? 'border-primary/50' : ''}`}
                            title={meta.description}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Run / Cancel */}
            <div className="flex gap-2 pt-2">
              {!isRunning ? (
                <Button
                  onClick={runSimulation}
                  className="flex-1 h-9"
                  disabled={isRunning}
                >
                  <Play className="w-4 h-4 mr-1.5" />
                  Run Simulation
                </Button>
              ) : (
                <Button
                  onClick={cancelSimulation}
                  variant="destructive"
                  className="flex-1 h-9"
                >
                  <Square className="w-4 h-4 mr-1.5" />
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results / Live Feed Panel */}
        <Card className="lg:col-span-2 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4" />
                {isRunning ? 'Live Feed' : completed ? 'Results' : 'Event Feed'}
              </CardTitle>
              {events.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {events.length} events
                </Badge>
              )}
            </div>
            {isRunning && progress && (
              <div className="space-y-1 mt-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Year {progress.currentYear} · {progress.phase}</span>
                  <span>{Math.round(progress.progress * 100)}%</span>
                </div>
                <Progress value={progress.progress * 100} className="h-2" />
              </div>
            )}
          </CardHeader>
          <CardContent>
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-500 mb-3">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {isRunning && !progress && (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Starting simulation...
              </div>
            )}

            {!isRunning && events.length === 0 && !error && (
              <div className="text-center py-12 text-muted-foreground">
                <TestTube2 className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Configure and run a simulation to generate historical events.</p>
              </div>
            )}

            {events.length > 0 && (
              <div className="space-y-4">
                {/* Summary */}
                {completed && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.entries(eventsByType).map(([type, count]) => (
                      <div
                        key={type}
                        className="flex items-center gap-2 p-2 rounded-lg bg-white/40 dark:bg-white/5 border border-white/10"
                      >
                        <span className="text-sm">
                          {EVENT_TYPES.find(e => e.id === type)?.emoji ?? '📌'}
                        </span>
                        <div>
                          <div className="text-xs font-medium capitalize">{type.replace(/_/g, ' ')}</div>
                          <div className="text-[10px] text-muted-foreground">{count} events</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Event list */}
                <ScrollArea className="h-[400px]">
                  <div className="space-y-1">
                    {events.slice(-200).map((event, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 px-2 py-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5"
                      >
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          event.importance >= 8 ? 'bg-red-500' :
                          event.importance >= 5 ? 'bg-primary' : 'bg-muted-foreground/30'
                        }`} />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs">{event.description}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-muted-foreground">{event.year}</span>
                            <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 capitalize">
                              {event.type.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Accept button */}
                {completed && (
                  <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                    <Button
                      onClick={() => acceptResults.mutate()}
                      disabled={acceptResults.isPending}
                      className="h-9"
                    >
                      {acceptResults.isPending ? (
                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4 mr-1.5" />
                      )}
                      Accept Results ({events.length} events)
                    </Button>
                    <p className="text-[10px] text-muted-foreground">
                      Commits generated events as truth entries in your world.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
