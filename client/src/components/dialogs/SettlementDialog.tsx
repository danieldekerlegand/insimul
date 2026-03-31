import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Users } from 'lucide-react';
import { ALL_GUILDS } from '@/components/CountryConfigPanel';
import {
  SettlementLayoutPreview,
  computeGenealogy,
  estimatePopulation,
  POPULATION_BY_TYPE,
  PATTERN_LABELS,
  type SettlementType,
  type GenerationParams,
} from '@/components/SettlementLayoutPreview';
import { type LayoutPattern } from '@shared/street-pattern-selection';

interface SettlementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worldId: string;
  countryId?: string;
  stateId?: string;
  onSuccess: () => void;
}

export function SettlementDialog({ open, onOpenChange, worldId, countryId, stateId, onSuccess }: SettlementDialogProps) {
  const { toast } = useToast();
  const { token } = useAuth();
  const DEFAULT_FOUNDED_YEARS: Record<SettlementType, number> = {
    dwelling: new Date().getFullYear() - 10,
    roadhouse: new Date().getFullYear() - 15,
    landing: new Date().getFullYear() - 25,
    forge: new Date().getFullYear() - 30,
    chapel: new Date().getFullYear() - 50,
    homestead: new Date().getFullYear() - 40,
    market: new Date().getFullYear() - 60,
    hamlet: new Date().getFullYear() - 75,
    village: new Date().getFullYear() - 100,
    town: new Date().getFullYear() - 125,
    city: new Date().getFullYear() - 150,
  };
  const [form, setForm] = useState({
    name: '',
    description: '',
    settlementType: 'hamlet' as SettlementType,
    layout: 'grid' as LayoutPattern,
    foundedYear: DEFAULT_FOUNDED_YEARS['hamlet'],
  });
  const [guilds, setGuilds] = useState<string[]>(ALL_GUILDS.map(g => g.id));
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');

  const targetPopulation = POPULATION_BY_TYPE[form.settlementType];

  // Compute default generation params when type or founded year changes
  const defaults = useMemo(
    () => computeGenealogy(form.settlementType, form.foundedYear),
    [form.settlementType, form.foundedYear]
  );

  const [genParams, setGenParams] = useState<GenerationParams>(defaults);

  // Sync defaults when settlement type changes (founded year change handled by type change)
  const updateParam = useCallback((key: keyof GenerationParams, value: number) => {
    setGenParams(prev => ({ ...prev, [key]: value }));
  }, []);

  // Live population estimate
  const popEstimate = useMemo(() => estimatePopulation(genParams), [genParams]);

  // How far estimate is from target
  const popRatio = targetPopulation > 0 ? popEstimate.living / targetPopulation : 1;
  const popColor = popRatio >= 0.8 && popRatio <= 1.3 ? 'text-green-600 dark:text-green-400'
    : popRatio >= 0.5 && popRatio <= 2.0 ? 'text-amber-600 dark:text-amber-400'
    : 'text-red-600 dark:text-red-400';

  const headers = (): Record<string, string> => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  };

  const handleSubmit = async () => {
    try {
      setIsGenerating(true);
      setGenerationStatus('Creating settlement...');

      // Step 1: Create the settlement record
      const res = await fetch(`/api/worlds/${worldId}/settlements`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          settlementType: form.settlementType,
          streetPattern: form.layout,
          foundedYear: form.foundedYear,
          population: targetPopulation,
          worldId,
          countryId,
          stateId,
        })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        toast({ title: 'Error', description: errorData.error || errorData.message, variant: 'destructive' });
        setIsGenerating(false);
        setGenerationStatus('');
        return;
      }

      const settlement = await res.json();

      // Step 2: Run the full unified pipeline (genealogy + geography + employment + housing + routines + truths + ...)
      setGenerationStatus('Generating society...');
      const genRes = await fetch(`/api/generate/settlement/${settlement.id}`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          foundedYear: form.foundedYear,
          numFoundingFamilies: genParams.foundingFamilies,
          generations: genParams.generations,
          marriageRate: genParams.marriageRate,
          fertilityRate: genParams.fertilityRate,
          deathRate: genParams.deathRate,
          immigrationRate: genParams.immigrationRate,
          targetPopulation: targetPopulation,
          guilds: guilds.length > 0 ? guilds : undefined,
        })
      });

      if (genRes.ok) {
        const result = await genRes.json();
        toast({
          title: 'Settlement Created',
          description: `${form.name}: ${result.population} people, ${result.businesses} businesses, ${result.housed} housed, ${result.truths} truths`,
        });
      } else {
        const err = await genRes.json().catch(() => ({}));
        toast({ title: 'Generation Error', description: err.error || 'Generation had issues', variant: 'destructive' });
      }

      setForm({ name: '', description: '', settlementType: 'hamlet', layout: 'grid', foundedYear: DEFAULT_FOUNDED_YEARS['hamlet'] });
      setGenParams(computeGenealogy('hamlet', DEFAULT_FOUNDED_YEARS['hamlet']));
      setGuilds(ALL_GUILDS.map(g => g.id));
      setIsGenerating(false);
      setGenerationStatus('');
      onSuccess();
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to create settlement', variant: 'destructive' });
      setIsGenerating(false);
      setGenerationStatus('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={isGenerating ? undefined : onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Settlement</DialogTitle>
          <DialogDescription>Configure and generate a new settlement with families, characters, streets, and buildings.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Goldspire" disabled={isGenerating} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="A bustling city..." disabled={isGenerating} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.settlementType} onValueChange={(v) => {
                const t = v as SettlementType;
                const fy = DEFAULT_FOUNDED_YEARS[t];
                setForm({ ...form, settlementType: t, foundedYear: fy });
                setGenParams(computeGenealogy(t, fy));
              }} disabled={isGenerating}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dwelling">Dwelling (~2 people)</SelectItem>
                  <SelectItem value="roadhouse">Roadhouse (~2 people)</SelectItem>
                  <SelectItem value="landing">Landing (~5 people) — Harbor, Fishing</SelectItem>
                  <SelectItem value="forge">Forge (~5 people) — Blacksmith, Carpentry</SelectItem>
                  <SelectItem value="chapel">Chapel (~5 people) — Church, School</SelectItem>
                  <SelectItem value="homestead">Homestead (~5 people)</SelectItem>
                  <SelectItem value="market">Market (~15 people) — Shops, Tavern</SelectItem>
                  <SelectItem value="hamlet">Hamlet (~25 people)</SelectItem>
                  <SelectItem value="village">Village (~50 people)</SelectItem>
                  <SelectItem value="town">Town (~500 people)</SelectItem>
                  <SelectItem value="city">City (~2,500 people)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Layout</Label>
              <Select value={form.layout} onValueChange={(v) => setForm({ ...form, layout: v as LayoutPattern })} disabled={isGenerating}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(PATTERN_LABELS) as LayoutPattern[]).map(p => (
                    <SelectItem key={p} value={p}>{PATTERN_LABELS[p]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Generation parameters with live population estimate */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium">Generation Parameters</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className={`w-4 h-4 ${popColor}`} />
                <span className={`text-sm font-bold tabular-nums ${popColor}`}>
                  ~{popEstimate.living.toLocaleString()} living
                </span>
                <span className="text-xs text-muted-foreground">
                  / {targetPopulation.toLocaleString()} target
                </span>
              </div>
            </div>

            {/* Founded Year */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <Label className="text-xs">Founded Year</Label>
                <span className="tabular-nums text-muted-foreground">{form.foundedYear}</span>
              </div>
              <Slider
                value={[form.foundedYear]}
                min={new Date().getFullYear() - 500}
                max={new Date().getFullYear()}
                step={5}
                disabled={isGenerating}
                onValueChange={([v]) => {
                  setForm({ ...form, foundedYear: v });
                  const gens = Math.max(1, Math.min(6, Math.floor((new Date().getFullYear() - v) / 25)));
                  setGenParams(prev => ({ ...prev, generations: gens }));
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {/* Founding Families */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <Label className="text-xs">Founding Families</Label>
                  <span className="tabular-nums text-muted-foreground">{genParams.foundingFamilies}</span>
                </div>
                <Slider
                  value={[genParams.foundingFamilies]}
                  min={1} max={60} step={1}
                  disabled={isGenerating}
                  onValueChange={([v]) => updateParam('foundingFamilies', v)}
                />
              </div>

              {/* Generations */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <Label className="text-xs">Generations</Label>
                  <span className="tabular-nums text-muted-foreground">{genParams.generations}</span>
                </div>
                <Slider
                  value={[genParams.generations]}
                  min={1} max={6} step={1}
                  disabled={isGenerating}
                  onValueChange={([v]) => updateParam('generations', v)}
                />
              </div>

              {/* Marriage Rate */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <Label className="text-xs">Marriage Rate</Label>
                  <span className="tabular-nums text-muted-foreground">{Math.round(genParams.marriageRate * 100)}%</span>
                </div>
                <Slider
                  value={[genParams.marriageRate * 100]}
                  min={10} max={100} step={5}
                  disabled={isGenerating}
                  onValueChange={([v]) => updateParam('marriageRate', v / 100)}
                />
              </div>

              {/* Fertility Rate */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <Label className="text-xs">Fertility Rate</Label>
                  <span className="tabular-nums text-muted-foreground">{Math.round(genParams.fertilityRate * 100)}%</span>
                </div>
                <Slider
                  value={[genParams.fertilityRate * 100]}
                  min={10} max={100} step={5}
                  disabled={isGenerating}
                  onValueChange={([v]) => updateParam('fertilityRate', v / 100)}
                />
              </div>

              {/* Death Rate */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <Label className="text-xs">Death Rate</Label>
                  <span className="tabular-nums text-muted-foreground">{Math.round(genParams.deathRate * 100)}%</span>
                </div>
                <Slider
                  value={[genParams.deathRate * 100]}
                  min={5} max={80} step={5}
                  disabled={isGenerating}
                  onValueChange={([v]) => updateParam('deathRate', v / 100)}
                />
              </div>

              {/* Immigration Rate */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <Label className="text-xs">Immigration Rate</Label>
                  <span className="tabular-nums text-muted-foreground">{Math.round(genParams.immigrationRate * 100)}%</span>
                </div>
                <Slider
                  value={[genParams.immigrationRate * 100]}
                  min={0} max={100} step={5}
                  disabled={isGenerating}
                  onValueChange={([v]) => updateParam('immigrationRate', v / 100)}
                />
              </div>
            </div>

            {/* Total stats */}
            <div className="grid grid-cols-3 gap-3 text-center pt-2 border-t">
              <div>
                <p className="text-lg font-semibold">{popEstimate.total.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total (living + dead)</p>
              </div>
              <div>
                <p className={`text-lg font-semibold ${popColor}`}>{popEstimate.living.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Living</p>
              </div>
              <div>
                <p className="text-lg font-semibold">{(popEstimate.total - popEstimate.living).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Deceased</p>
              </div>
            </div>

            <SettlementLayoutPreview
              pattern={form.layout}
              settlementType={form.settlementType}
              population={popEstimate.living}
            />
          </div>

          {/* Guild assignment */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Guilds</Label>
            <div className="flex flex-wrap gap-1.5">
              {guilds.map(gid => {
                const g = ALL_GUILDS.find(x => x.id === gid);
                return (
                  <Badge key={gid} variant="secondary" className="text-xs cursor-pointer hover:bg-destructive/20"
                    onClick={() => setGuilds(prev => prev.filter(id => id !== gid))}>
                    {g?.label || gid} &times;
                  </Badge>
                );
              })}
              {ALL_GUILDS.filter(g => !guilds.includes(g.id)).length > 0 && (
                <select className="h-6 text-xs bg-muted border rounded px-1"
                  value=""
                  disabled={isGenerating}
                  onChange={e => {
                    if (!e.target.value) return;
                    setGuilds(prev => [...prev, e.target.value]);
                    e.target.value = '';
                  }}>
                  <option value="">+ guild</option>
                  {ALL_GUILDS.filter(g => !guilds.includes(g.id)).map(g => (
                    <option key={g.id} value={g.id}>{g.label}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isGenerating}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!form.name || isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {generationStatus}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Create & Generate
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
