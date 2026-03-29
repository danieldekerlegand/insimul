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
import {
  SettlementLayoutPreview,
  selectPattern,
  computeGenealogy,
  POPULATION_BY_TYPE,
  type SettlementType,
} from '@/components/SettlementLayoutPreview';

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

      // Step 1: Create the settlement record
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

      // Step 2: Run the full unified pipeline (genealogy + geography + employment + housing + routines + truths + ...)
      setGenerationStatus('Generating society...');
      const genRes = await fetch(`/api/generate/settlement/${settlement.id}`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          foundedYear: form.foundedYear,
          numFoundingFamilies: foundingFamilies,
          generations,
          targetPopulation: population,
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
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
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
            <SettlementLayoutPreview
              pattern={selectPattern(form.terrain, form.settlementType, form.foundedYear)}
              settlementType={form.settlementType}
              terrain={form.terrain}
            />
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
