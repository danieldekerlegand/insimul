import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Sparkles, Globe2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { POPULATION_BY_TYPE } from '@/components/SettlementLayoutPreview';

interface CountryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worldId: string;
  onSuccess: () => void;
}

const ALL_GUILDS = [
  { id: 'GuildDiplomates', label: 'Diplomates' },
  { id: 'GuildArtisans', label: 'Artisans' },
  { id: 'GuildExplorateurs', label: 'Explorateurs' },
  { id: 'GuildMarchands', label: 'Marchands' },
  { id: 'GuildConteurs', label: 'Conteurs' },
];

const SETTLEMENT_TYPES = [
  { type: 'landing', label: 'Landing', icon: '\u2693', businesses: 'Harbor, FishMarket' },
  { type: 'forge', label: 'Forge', icon: '\uD83D\uDD28', businesses: 'Blacksmith, Carpenter' },
  { type: 'chapel', label: 'Chapel', icon: '\u26EA', businesses: 'Church, School' },
  { type: 'market', label: 'Market', icon: '\uD83C\uDFEA', businesses: 'Shop, Grocery, Tavern' },
  { type: 'hamlet', label: 'Hamlet', icon: '\uD83C\uDFD8\uFE0F', businesses: 'Farm, Grocery, Restaurant' },
  { type: 'homestead', label: 'Homestead', icon: '\uD83C\uDFE1', businesses: 'Farm' },
] as const;

type SettlementKey = typeof SETTLEMENT_TYPES[number]['type'];

const DEFAULT_COUNTS: Record<SettlementKey, number> = {
  landing: 1,
  forge: 0,
  chapel: 0,
  market: 0,
  hamlet: 1,
  homestead: 3,
};

const DEFAULT_GUILD_ASSIGNMENTS: Record<string, string[]> = {
  'hamlet_0': ['GuildConteurs', 'GuildArtisans', 'GuildExplorateurs'],
  'landing_0': ['GuildDiplomates'],
  'homestead_0': ['GuildMarchands'],
};

export function CountryDialog({ open, onOpenChange, worldId, onSuccess }: CountryDialogProps) {
  const { toast } = useToast();
  const { token } = useAuth();
  const [form, setForm] = useState({
    name: '', description: '', governmentType: '', economicSystem: '', foundedYear: new Date().getFullYear()
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [counts, setCounts] = useState<Record<SettlementKey, number>>({ ...DEFAULT_COUNTS });
  const [guildAssignments, setGuildAssignments] = useState<Record<string, string[]>>({ ...DEFAULT_GUILD_ASSIGNMENTS });

  // Grid placement
  const [gridWidth, setGridWidth] = useState(1);
  const [gridHeight, setGridHeight] = useState(1);
  const [gridX, setGridX] = useState(0);
  const [gridY, setGridY] = useState(0);
  const [worldGridW, setWorldGridW] = useState<number | null>(null);
  const [worldGridH, setWorldGridH] = useState<number | null>(null);
  const [existingCountryPlacements, setExistingCountryPlacements] = useState<Array<{ gridX: number; gridY: number; gridWidth: number; gridHeight: number }>>([]);

  // Fetch world grid info
  useEffect(() => {
    if (!open || !worldId) return;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    fetch(`/api/worlds/${worldId}`, { headers })
      .then(r => r.ok ? r.json() : null)
      .then(world => {
        if (world) {
          setWorldGridW(world.gridWidth ?? null);
          setWorldGridH(world.gridHeight ?? null);
        }
      })
      .catch(() => {});
    fetch(`/api/worlds/${worldId}/countries`, { headers })
      .then(r => r.ok ? r.json() : [])
      .then((countries: any[]) => {
        setExistingCountryPlacements(
          countries
            .filter((c: any) => c.gridX != null && c.gridY != null && c.gridWidth != null && c.gridHeight != null)
            .map((c: any) => ({ gridX: c.gridX, gridY: c.gridY, gridWidth: c.gridWidth, gridHeight: c.gridHeight }))
        );
      })
      .catch(() => {});
  }, [open, worldId, token]);

  const setCount = (type: SettlementKey, delta: number) => {
    setCounts(prev => {
      const next = { ...prev, [type]: Math.max(0, Math.min(5, prev[type] + delta)) };
      // Clean up guild assignments for removed settlements
      const newCount = next[type];
      setGuildAssignments(ga => {
        const cleaned = { ...ga };
        for (const key of Object.keys(cleaned)) {
          if (key.startsWith(`${type}_`)) {
            const idx = parseInt(key.split('_').pop() || '0');
            if (idx >= newCount) delete cleaned[key];
          }
        }
        return cleaned;
      });
      return next;
    });
  };

  const addGuild = (settlementKey: string, guildId: string) => {
    setGuildAssignments(prev => ({
      ...prev,
      [settlementKey]: [...(prev[settlementKey] || []), guildId],
    }));
  };

  const removeGuild = (settlementKey: string, guildId: string) => {
    setGuildAssignments(prev => {
      const next = { ...prev };
      next[settlementKey] = (next[settlementKey] || []).filter(id => id !== guildId);
      if (next[settlementKey].length === 0) delete next[settlementKey];
      return next;
    });
  };

  const totalSettlements = Object.values(counts).reduce((a, b) => a + b, 0);
  const totalPop = SETTLEMENT_TYPES.reduce((sum, s) => sum + counts[s.type] * POPULATION_BY_TYPE[s.type], 0);

  const handleSubmit = async () => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const bodyData: any = { ...form };
      if (worldGridW && worldGridH) {
        bodyData.gridWidth = gridWidth;
        bodyData.gridHeight = gridHeight;
        bodyData.gridX = gridX;
        bodyData.gridY = gridY;
      }
      const res = await fetch(`/api/worlds/${worldId}/countries`, {
        method: 'POST',
        headers,
        body: JSON.stringify(bodyData)
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
    if (totalSettlements === 0) {
      toast({ title: 'No settlements', description: 'Add at least one settlement to generate', variant: 'destructive' });
      return;
    }
    setIsGenerating(true);
    try {
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
          numStatesPerCountry: 1,
          numLandingsPerState: counts.landing,
          numForgesPerState: counts.forge,
          numChapelsPerState: counts.chapel,
          numMarketsPerState: counts.market,
          numHamletsPerState: counts.hamlet,
          numHomesteadsPerState: counts.homestead,
          numCitiesPerState: 0,
          numTownsPerState: 0,
          numVillagesPerState: 0,
          guildAssignments: Object.keys(guildAssignments).length > 0 ? guildAssignments : undefined,
          terrain: 'plains',
          foundedYear: form.foundedYear,
          marriageRate: 0.7,
          fertilityRate: 0.6,
          deathRate: 0.3,
          generateGeography: true,
          generateGenealogy: true,
          generateBusinesses: true,
          assignEmployment: true,
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
        setCounts({ ...DEFAULT_COUNTS });
        setGuildAssignments({ ...DEFAULT_GUILD_ASSIGNMENTS });
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
            {/* Grid Placement — only shown when the world has grid dimensions */}
            {worldGridW && worldGridH && (
              <div className="space-y-3 border rounded-lg p-3">
                <Label className="text-sm font-medium">Grid Placement</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Width (world cells)</label>
                    <Input
                      type="number"
                      min={1}
                      max={worldGridW}
                      value={gridWidth}
                      onChange={(e) => setGridWidth(Math.max(1, Math.min(worldGridW, parseInt(e.target.value) || 1)))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Height (world cells)</label>
                    <Input
                      type="number"
                      min={1}
                      max={worldGridH}
                      value={gridHeight}
                      onChange={(e) => setGridHeight(Math.max(1, Math.min(worldGridH, parseInt(e.target.value) || 1)))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Position X (column)</label>
                    <Input
                      type="number"
                      min={0}
                      max={worldGridW - gridWidth}
                      value={gridX}
                      onChange={(e) => setGridX(Math.max(0, Math.min(worldGridW - gridWidth, parseInt(e.target.value) || 0)))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Position Y (row)</label>
                    <Input
                      type="number"
                      min={0}
                      max={worldGridH - gridHeight}
                      value={gridY}
                      onChange={(e) => setGridY(Math.max(0, Math.min(worldGridH - gridHeight, parseInt(e.target.value) || 0)))}
                    />
                  </div>
                </div>
                {/* Mini grid preview */}
                <div className="flex justify-center">
                  <svg
                    width={Math.min(200, worldGridW * 40)}
                    height={Math.min(200, worldGridH * 40)}
                    viewBox={`0 0 ${worldGridW} ${worldGridH}`}
                    className="border rounded bg-muted/30"
                  >
                    {/* Grid lines */}
                    {Array.from({ length: worldGridW + 1 }).map((_, i) => (
                      <line key={`v${i}`} x1={i} y1={0} x2={i} y2={worldGridH} stroke="currentColor" strokeWidth={0.02} opacity={0.2} />
                    ))}
                    {Array.from({ length: worldGridH + 1 }).map((_, i) => (
                      <line key={`h${i}`} x1={0} y1={i} x2={worldGridW} y2={i} stroke="currentColor" strokeWidth={0.02} opacity={0.2} />
                    ))}
                    {/* Existing countries */}
                    {existingCountryPlacements.map((c, i) => (
                      <rect key={`existing-${i}`} x={c.gridX} y={c.gridY} width={c.gridWidth} height={c.gridHeight}
                        fill="hsl(var(--muted-foreground))" fillOpacity={0.2} stroke="hsl(var(--muted-foreground))" strokeWidth={0.04} />
                    ))}
                    {/* New country placement */}
                    <rect x={gridX} y={gridY} width={gridWidth} height={gridHeight}
                      fill="hsl(var(--primary))" fillOpacity={0.3} stroke="hsl(var(--primary))" strokeWidth={0.06} />
                  </svg>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {gridWidth}×{gridHeight} cells at ({gridX}, {gridY}) in {worldGridW}×{worldGridH} world grid
                </p>
              </div>
            )}
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

              {/* Settlement Counts */}
              <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium">Settlements</span>
                  <span className="text-xs text-muted-foreground ml-auto">{totalSettlements} settlements — ~{totalPop} people</span>
                </div>
                <div className="space-y-1.5">
                  {SETTLEMENT_TYPES.map(s => (
                    <div key={s.type} className="space-y-1">
                      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-background/50 border border-border text-xs">
                        <span className="text-base">{s.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{s.label}</div>
                          <div className="text-muted-foreground truncate">{s.businesses}</div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setCount(s.type, -1)}
                            disabled={counts[s.type] === 0}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-5 text-center font-medium">{counts[s.type]}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setCount(s.type, 1)}
                            disabled={counts[s.type] >= 5}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="text-muted-foreground w-10 text-right shrink-0">
                          ~{counts[s.type] * POPULATION_BY_TYPE[s.type]}
                        </span>
                      </div>
                      {/* Per-instance guild assignment */}
                      {counts[s.type] > 0 && Array.from({ length: counts[s.type] }).map((_, i) => {
                        const key = `${s.type}_${i}`;
                        const guilds = guildAssignments[key] || [];
                        return (
                          <div key={key} className="flex items-center gap-1.5 ml-9 text-[10px]">
                            {counts[s.type] > 1 && <span className="text-muted-foreground">#{i + 1}</span>}
                            {guilds.map(gid => {
                              const g = ALL_GUILDS.find(x => x.id === gid);
                              return (
                                <Badge key={gid} variant="secondary" className="text-[9px] cursor-pointer hover:bg-destructive/20"
                                  onClick={() => removeGuild(key, gid)}>
                                  {g?.label || gid} &times;
                                </Badge>
                              );
                            })}
                            {ALL_GUILDS.filter(g => !guilds.includes(g.id)).length > 0 && (
                              <select className="h-5 text-[9px] bg-muted border rounded px-1"
                                value=""
                                onChange={e => {
                                  if (!e.target.value) return;
                                  addGuild(key, e.target.value);
                                }}>
                                <option value="">+ guild</option>
                                {ALL_GUILDS.filter(g => !guilds.includes(g.id)).map(g => (
                                  <option key={g.id} value={g.id}>{g.label}</option>
                                ))}
                              </select>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                {(() => {
                  const assigned = new Set(Object.values(guildAssignments).flat());
                  const unassigned = ALL_GUILDS.filter(g => !assigned.has(g.id));
                  return unassigned.length > 0 ? (
                    <p className="text-[10px] text-amber-500 mt-1">
                      Unassigned: {unassigned.map(g => g.label).join(', ')}
                    </p>
                  ) : null;
                })()}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button
                onClick={handleProceduralGenerate}
                disabled={isGenerating || !form.name || totalSettlements === 0}
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
