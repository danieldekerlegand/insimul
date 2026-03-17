import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
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

const POPULATION_DEFAULTS: Record<string, number> = {
  village: 120,
  town: 500,
  city: 2000,
};

const FAMILY_DEFAULTS: Record<string, number> = {
  village: 4,
  town: 8,
  city: 15,
};

export function SettlementDialog({ open, onOpenChange, worldId, countryId, stateId, onSuccess }: SettlementDialogProps) {
  const { toast } = useToast();
  const { token } = useAuth();
  const [form, setForm] = useState({
    name: '', description: '', settlementType: 'town' as 'village' | 'town' | 'city',
    terrain: 'plains', population: 0, foundedYear: new Date().getFullYear()
  });
  const [aiGenerate, setAiGenerate] = useState(false);
  const [aiConfig, setAiConfig] = useState({
    generateGenealogy: true,
    generateGeography: true,
    numFoundingFamilies: 8,
    generations: 3,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');

  const headers = (): Record<string, string> => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  };

  const handleSubmit = async () => {
    try {
      setIsGenerating(true);
      setGenerationStatus('Creating settlement...');

      const population = form.population || POPULATION_DEFAULTS[form.settlementType] || 500;

      const res = await fetch(`/api/worlds/${worldId}/settlements`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ ...form, population, worldId, countryId, stateId })
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

      if (aiGenerate) {
        // Generate genealogy (families + characters)
        if (aiConfig.generateGenealogy) {
          setGenerationStatus('Generating families & characters...');
          try {
            const genRes = await fetch(`/api/generate/genealogy/${worldId}`, {
              method: 'POST',
              headers: headers(),
              body: JSON.stringify({
                settlementId,
                numFoundingFamilies: aiConfig.numFoundingFamilies,
                generations: aiConfig.generations,
              })
            });
            if (genRes.ok) {
              const genData = await genRes.json();
              toast({ title: 'Genealogy Generated', description: `${genData.totalCharacters} characters across ${genData.families} families` });
            } else {
              const err = await genRes.json().catch(() => ({}));
              toast({ title: 'Genealogy Warning', description: err.error || 'Genealogy generation had issues', variant: 'destructive' });
            }
          } catch (e) {
            toast({ title: 'Genealogy Error', description: (e as Error).message, variant: 'destructive' });
          }
        }

        // Generate geography (streets, buildings, districts)
        if (aiConfig.generateGeography) {
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
        }
      }

      toast({ title: 'Settlement Created', description: `${form.name} has been created${aiGenerate ? ' with AI-generated content' : ''}` });
      setForm({ name: '', description: '', settlementType: 'town', terrain: 'plains', population: 0, foundedYear: new Date().getFullYear() });
      setAiGenerate(false);
      setIsGenerating(false);
      setGenerationStatus('');
      onSuccess();
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to create settlement', variant: 'destructive' });
      setIsGenerating(false);
      setGenerationStatus('');
    }
  };

  const handleTypeChange = (v: 'village' | 'town' | 'city') => {
    setForm({ ...form, settlementType: v });
    setAiConfig({ ...aiConfig, numFoundingFamilies: FAMILY_DEFAULTS[v] || 8 });
  };

  return (
    <Dialog open={open} onOpenChange={isGenerating ? undefined : onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Settlement</DialogTitle>
          <DialogDescription>Add a new settlement (city, town, or village)</DialogDescription>
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
              <Select value={form.settlementType} onValueChange={handleTypeChange} disabled={isGenerating}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Population</Label>
              <Input type="number" value={form.population || ''} onChange={(e) => setForm({ ...form, population: parseInt(e.target.value) || 0 })} placeholder={String(POPULATION_DEFAULTS[form.settlementType])} disabled={isGenerating} />
            </div>
            <div className="space-y-2">
              <Label>Founded Year</Label>
              <Input type="number" value={form.foundedYear} onChange={(e) => setForm({ ...form, foundedYear: parseInt(e.target.value) || new Date().getFullYear() })} disabled={isGenerating} />
            </div>
          </div>

          {/* AI Generation toggle */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <Label htmlFor="ai-generate" className="font-medium cursor-pointer">AI Generation</Label>
              </div>
              <Switch id="ai-generate" checked={aiGenerate} onCheckedChange={setAiGenerate} disabled={isGenerating} />
            </div>
            {aiGenerate && (
              <div className="space-y-3 pt-1">
                <p className="text-xs text-muted-foreground">Automatically generate families, characters, streets, and buildings.</p>
                <div className="flex items-center justify-between">
                  <Label htmlFor="gen-genealogy" className="text-sm cursor-pointer">Families &amp; Characters</Label>
                  <Switch id="gen-genealogy" checked={aiConfig.generateGenealogy} onCheckedChange={(v) => setAiConfig({ ...aiConfig, generateGenealogy: v })} disabled={isGenerating} />
                </div>
                {aiConfig.generateGenealogy && (
                  <div className="grid grid-cols-2 gap-3 pl-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Founding Families</Label>
                      <Input type="number" min={1} max={30} value={aiConfig.numFoundingFamilies} onChange={(e) => setAiConfig({ ...aiConfig, numFoundingFamilies: parseInt(e.target.value) || 4 })} disabled={isGenerating} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Generations</Label>
                      <Input type="number" min={1} max={6} value={aiConfig.generations} onChange={(e) => setAiConfig({ ...aiConfig, generations: parseInt(e.target.value) || 3 })} disabled={isGenerating} />
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <Label htmlFor="gen-geography" className="text-sm cursor-pointer">Streets &amp; Buildings</Label>
                  <Switch id="gen-geography" checked={aiConfig.generateGeography} onCheckedChange={(v) => setAiConfig({ ...aiConfig, generateGeography: v })} disabled={isGenerating} />
                </div>
              </div>
            )}
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
            ) : aiGenerate ? (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Create & Generate
              </>
            ) : (
              'Create'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
