import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Sparkles } from 'lucide-react';

interface SettlementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worldId: string;
  countryId?: string;
  stateId?: string;
  onSuccess: () => void;
}

type SettlementType = 'hamlet' | 'village' | 'town' | 'city';

const POPULATION_BY_TYPE: Record<SettlementType, number> = {
  hamlet: 50,
  village: 100,
  town: 1000,
  city: 5000,
};

// Base founding families scaled by settlement size
const BASE_FAMILIES: Record<SettlementType, number> = {
  hamlet: 3,
  village: 5,
  town: 15,
  city: 50,
};

const YEARS_PER_GENERATION = 25;

/**
 * Compute founding families and generations from settlement type + founded year.
 * The idea: older settlements have had more generations, which means fewer founding
 * families were needed to reach the current population. Newer settlements need more
 * founders because fewer generations have passed.
 */
function computeGenealogy(type: SettlementType, foundedYear: number): { foundingFamilies: number; generations: number } {
  const currentYear = new Date().getFullYear();
  const yearsOld = Math.max(0, currentYear - foundedYear);
  const generations = Math.max(1, Math.min(6, Math.floor(yearsOld / YEARS_PER_GENERATION)));

  // For older settlements (more generations), fewer founding families needed.
  // For newer settlements (fewer generations), more founding families needed.
  const baseFamilies = BASE_FAMILIES[type];
  // Scale: at 1 generation, need ~2x base; at 6 generations, need ~0.5x base
  const generationScale = Math.max(0.5, 2.0 - (generations - 1) * 0.3);
  const foundingFamilies = Math.max(2, Math.min(60, Math.round(baseFamilies * generationScale)));

  return { foundingFamilies, generations };
}

export function SettlementDialog({ open, onOpenChange, worldId, countryId, stateId, onSuccess }: SettlementDialogProps) {
  const { toast } = useToast();
  const { token } = useAuth();
  const [form, setForm] = useState({
    name: '',
    description: '',
    settlementType: 'town' as SettlementType,
    terrain: 'plains',
    foundedYear: new Date().getFullYear() - 150,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');

  const population = POPULATION_BY_TYPE[form.settlementType];
  const { foundingFamilies, generations } = useMemo(
    () => computeGenealogy(form.settlementType, form.foundedYear),
    [form.settlementType, form.foundedYear]
  );

  const headers = (): Record<string, string> => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  };

  const handleSubmit = async () => {
    try {
      setIsGenerating(true);
      setGenerationStatus('Creating settlement...');

      const res = await fetch(`/api/worlds/${worldId}/settlements`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          ...form,
          population,
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
      const settlementId = settlement.id;

      // Always generate genealogy (families + characters)
      setGenerationStatus('Generating families & characters...');
      try {
        const genRes = await fetch(`/api/generate/genealogy/${worldId}`, {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify({
            settlementId,
            numFoundingFamilies: foundingFamilies,
            generations,
            startYear: form.foundedYear,
            targetPopulation: population,
          })
        });
        if (genRes.ok) {
          const genData = await genRes.json();
          const livingInfo = genData.livingCharacters ? ` (${genData.livingCharacters} living)` : '';
          toast({ title: 'Genealogy Generated', description: `${genData.totalCharacters} characters across ${genData.families} families${livingInfo}` });
        } else {
          const err = await genRes.json().catch(() => ({}));
          toast({ title: 'Genealogy Warning', description: err.error || 'Genealogy generation had issues', variant: 'destructive' });
        }
      } catch (e) {
        toast({ title: 'Genealogy Error', description: (e as Error).message, variant: 'destructive' });
      }

      // Always generate geography (streets, buildings, districts)
      setGenerationStatus('Generating streets & buildings...');
      try {
        const geoRes = await fetch(`/api/generate/geography/${settlementId}`, {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify({
            foundedYear: form.foundedYear,
          })
        });
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          toast({ title: 'Geography Generated', description: `${geoData.districts} districts, ${geoData.streets} streets, ${geoData.buildings} buildings` });
        } else {
          const err = await geoRes.json().catch(() => ({}));
          toast({ title: 'Geography Warning', description: err.error || 'Geography generation had issues', variant: 'destructive' });
        }
      } catch (e) {
        toast({ title: 'Geography Error', description: (e as Error).message, variant: 'destructive' });
      }

      toast({ title: 'Settlement Created', description: `${form.name} has been created with AI-generated content` });
      setForm({ name: '', description: '', settlementType: 'town', terrain: 'plains', foundedYear: new Date().getFullYear() - 150 });
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
      <DialogContent>
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
              <Select value={form.settlementType} onValueChange={(v) => setForm({ ...form, settlementType: v as SettlementType })} disabled={isGenerating}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hamlet">Hamlet</SelectItem>
                  <SelectItem value="village">Village</SelectItem>
                  <SelectItem value="town">Town</SelectItem>
                  <SelectItem value="city">City</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Terrain</Label>
              <Select value={form.terrain} onValueChange={(v) => setForm({ ...form, terrain: v })} disabled={isGenerating}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="plains">Plains</SelectItem>
                  <SelectItem value="hills">Hills</SelectItem>
                  <SelectItem value="mountains">Mountains</SelectItem>
                  <SelectItem value="coast">Coast</SelectItem>
                  <SelectItem value="river">River</SelectItem>
                  <SelectItem value="forest">Forest</SelectItem>
                  <SelectItem value="desert">Desert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Founded Year</Label>
            <Input type="number" value={form.foundedYear} onChange={(e) => setForm({ ...form, foundedYear: parseInt(e.target.value) || new Date().getFullYear() })} disabled={isGenerating} />
          </div>

          {/* Auto-computed generation preview */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium">Generation Preview</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-semibold">{population.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Population</p>
              </div>
              <div>
                <p className="text-lg font-semibold">{foundingFamilies}</p>
                <p className="text-xs text-muted-foreground">Founding Families</p>
              </div>
              <div>
                <p className="text-lg font-semibold">{generations}</p>
                <p className="text-xs text-muted-foreground">Generations</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center pt-1">
              Families, characters, streets, and buildings will be generated automatically.
            </p>
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
