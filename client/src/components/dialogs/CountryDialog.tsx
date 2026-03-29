import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Sparkles, Globe2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  SettlementLayoutPreview,
  selectPattern,
  computeGenealogy,
  POPULATION_BY_TYPE,
} from '@/components/SettlementLayoutPreview';

interface CountryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worldId: string;
  onSuccess: () => void;
}

export function CountryDialog({ open, onOpenChange, worldId, onSuccess }: CountryDialogProps) {
  const { toast } = useToast();
  const { token } = useAuth();
  const [form, setForm] = useState({
    name: '', description: '', governmentType: '', economicSystem: '', foundedYear: new Date().getFullYear()
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  
  // Procedural generation config
  const [numSettlements, setNumSettlements] = useState(3);
  const [numFoundingFamilies, setNumFoundingFamilies] = useState(10);
  const [generations, setGenerations] = useState(4);
  const [generateBusinesses, setGenerateBusinesses] = useState(true);

  const handleSubmit = async () => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`/api/worlds/${worldId}/countries`, {
        method: 'POST',
        headers,
        body: JSON.stringify(form)
      });
      if (res.ok) {
        toast({ title: 'Country Created', description: `${form.name} has been created` });
        setForm({ name: '', description: '', governmentType: '', economicSystem: '', foundedYear: new Date().getFullYear() });
        onSuccess();
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        toast({ title: 'Error', description: errorData.error || errorData.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to create country', variant: 'destructive' });
    }
  };

  const handleProceduralGenerate = async () => {
    setIsGenerating(true);
    try {
      // Use the world generation API endpoint
      const genHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) genHeaders['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`/api/generate/hierarchical`, {
        method: 'POST',
        headers: genHeaders,
        body: JSON.stringify({
          worldId,
          worldName: form.name || 'Generated Kingdom',
          customPrompt: aiPrompt || undefined,
          numCountries: 1,
          numStatesPerCountry: 0,
          numCitiesPerState: numSettlements,
          numTownsPerState: 0,
          numVillagesPerState: 0,
          terrain: 'plains',
          foundedYear: form.foundedYear,
          numFoundingFamilies,
          generations,
          marriageRate: 0.7,
          fertilityRate: 0.6,
          deathRate: 0.3,
          generateGeography: true,
          generateGenealogy: true,
          generateBusinesses,
          assignEmployment: generateBusinesses,
          governmentType: form.governmentType || 'monarchy',
          economicSystem: form.economicSystem || 'feudal'
        })
      });
      
      if (res.ok) {
        const result = await res.json();
        toast({
          title: 'Society Generated!',
          description: `Created country with ${result.numSettlements} settlements and ${result.totalPopulation} characters`
        });
        setForm({ name: '', description: '', governmentType: '', economicSystem: '', foundedYear: new Date().getFullYear() });
        setAiPrompt('');
        onSuccess();
        onOpenChange(false);
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        toast({ title: 'Error', description: errorData.error || errorData.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to generate', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe2 className="w-5 h-5" />
            Create Country
          </DialogTitle>
          <DialogDescription>Choose how you want to create your country</DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">
              <Plus className="w-4 h-4 mr-2" />
              Manual
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Generator
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4 mt-4">
            <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Kingdom of Valoria" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="A feudal kingdom..." />
          </div>
          <div className="space-y-2">
            <Label>Founded Year</Label>
            <Input type="number" value={form.foundedYear} onChange={(e) => setForm({ ...form, foundedYear: parseInt(e.target.value) || new Date().getFullYear() })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Government</Label>
              <Select value={form.governmentType} onValueChange={(v) => setForm({ ...form, governmentType: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monarchy">Monarchy</SelectItem>
                  <SelectItem value="republic">Republic</SelectItem>
                  <SelectItem value="democracy">Democracy</SelectItem>
                  <SelectItem value="feudal">Feudal</SelectItem>
                  <SelectItem value="theocracy">Theocracy</SelectItem>
                  <SelectItem value="empire">Empire</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Economy</Label>
              <Select value={form.economicSystem} onValueChange={(v) => setForm({ ...form, economicSystem: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="feudal">Feudal</SelectItem>
                  <SelectItem value="mercantile">Mercantile</SelectItem>
                  <SelectItem value="agricultural">Agricultural</SelectItem>
                  <SelectItem value="trade-based">Trade-Based</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={!form.name}>Create</Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Country Name *</Label>
                <Input 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  placeholder="Kingdom of Valoria" 
                />
              </div>

              <div className="space-y-2">
                <Label>Capital/Settlement Description</Label>
                <Textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe the main settlement (e.g., 'A bustling port city on the coast' or 'A fortified mountain stronghold')"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Government</Label>
                  <Select value={form.governmentType} onValueChange={(v) => setForm({ ...form, governmentType: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monarchy">Monarchy</SelectItem>
                      <SelectItem value="republic">Republic</SelectItem>
                      <SelectItem value="democracy">Democracy</SelectItem>
                      <SelectItem value="feudal">Feudal</SelectItem>
                      <SelectItem value="theocracy">Theocracy</SelectItem>
                      <SelectItem value="empire">Empire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Economy</Label>
                  <Select value={form.economicSystem} onValueChange={(v) => setForm({ ...form, economicSystem: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feudal">Feudal</SelectItem>
                      <SelectItem value="mercantile">Mercantile</SelectItem>
                      <SelectItem value="agricultural">Agricultural</SelectItem>
                      <SelectItem value="trade-based">Trade-Based</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900 space-y-4">
                <h4 className="text-sm font-semibold">Procedural Generation Options</h4>
                
                <div className="space-y-2">
                  <Label>Number of Settlements: {numSettlements}</Label>
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[numSettlements]}
                    onValueChange={(value) => setNumSettlements(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Founding Families: {numFoundingFamilies}</Label>
                  <Slider
                    min={1}
                    max={30}
                    step={1}
                    value={[numFoundingFamilies]}
                    onValueChange={(value) => setNumFoundingFamilies(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Generations: {generations}</Label>
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[generations]}
                    onValueChange={(value) => setGenerations(value[0])}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="generate-businesses"
                    checked={generateBusinesses}
                    onCheckedChange={(checked) => setGenerateBusinesses(checked as boolean)}
                  />
                  <Label htmlFor="generate-businesses" className="cursor-pointer">
                    Generate businesses and economy
                  </Label>
                </div>
              </div>

              {/* Generation Preview — shows what a typical settlement will look like */}
              <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium">Generation Preview (per settlement)</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-lg font-semibold">{numSettlements}</p>
                    <p className="text-xs text-muted-foreground">Settlements</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{numFoundingFamilies}</p>
                    <p className="text-xs text-muted-foreground">Founding Families</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{generations}</p>
                    <p className="text-xs text-muted-foreground">Generations</p>
                  </div>
                </div>
                <SettlementLayoutPreview
                  pattern={selectPattern('plains', 'town', form.foundedYear)}
                  settlementType="town"
                  terrain="plains"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button
                onClick={handleProceduralGenerate}
                disabled={isGenerating || !form.name}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Society
                  </>
                )}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
