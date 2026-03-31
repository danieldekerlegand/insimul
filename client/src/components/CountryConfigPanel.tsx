/**
 * CountryConfigPanel — shared UI for configuring a country's settlements.
 *
 * Used by both WorldCreateDialog (multi-country world creation) and
 * CountryDialog (single-country procedural generation).
 *
 * Each settlement entry includes type, layout pattern, guild assignments,
 * and an SVG layout preview.
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Trash2 } from 'lucide-react';
import {
  SettlementLayoutPreview,
  computeGenealogy,
  POPULATION_BY_TYPE,
  PATTERN_LABELS,
  type SettlementType,
} from '@/components/SettlementLayoutPreview';
import { type LayoutPattern } from '@shared/street-pattern-selection';

// --- Shared types & constants ---

export const ALL_GUILDS = [
  { id: 'GuildDiplomates', label: 'Diplomates' },
  { id: 'GuildArtisans', label: 'Artisans' },
  { id: 'GuildExplorateurs', label: 'Explorateurs' },
  { id: 'GuildMarchands', label: 'Marchands' },
  { id: 'GuildConteurs', label: 'Conteurs' },
];

export const SETTLEMENT_TYPE_META: Record<SettlementType, { icon: string; businesses: string }> = {
  dwelling:  { icon: '\u{1F6D6}', businesses: 'Hut' },
  roadhouse: { icon: '\u{1F3DA}\uFE0F', businesses: 'Inn' },
  homestead: { icon: '\u{1F3E1}', businesses: 'Farm' },
  landing:   { icon: '\u2693', businesses: 'Harbor, FishMarket' },
  forge:     { icon: '\u{1F528}', businesses: 'Blacksmith, Carpenter' },
  chapel:    { icon: '\u26EA', businesses: 'Church, School' },
  market:    { icon: '\u{1F3EA}', businesses: 'Shop, Grocery, Tavern' },
  hamlet:    { icon: '\u{1F3D8}\uFE0F', businesses: 'Farm, Grocery, Restaurant' },
  village:   { icon: '\u{1F3D8}\uFE0F', businesses: 'Multiple shops, School, Church' },
  town:      { icon: '\u{1F3D9}\uFE0F', businesses: 'Full economy, Government' },
  city:      { icon: '\u{1F306}', businesses: 'Districts, Industry, Trade' },
};

export interface SettlementEntry {
  type: SettlementType;
  layout: LayoutPattern;
  guilds: string[];
}

export interface CountryConfig {
  foundedYear: number;
  settlements: SettlementEntry[];
}

export const DEFAULT_COUNTRY_CONFIG: CountryConfig = {
  foundedYear: 1926,
  settlements: [
    { type: 'village', layout: 'grid', guilds: ['GuildConteurs', 'GuildArtisans', 'GuildExplorateurs', 'GuildDiplomates', 'GuildMarchands'] },
  ],
};

/**
 * Convert a CountryConfig to the server-compatible generation parameters.
 * Used by both WorldCreateDialog and CountryDialog when submitting.
 */
export function countryConfigToServerParams(cc: CountryConfig) {
  const counts: Record<string, number> = {};
  for (const s of cc.settlements) {
    counts[s.type] = (counts[s.type] || 0) + 1;
  }

  const guildAssignments: Record<string, string[]> = {};
  const settlementLayouts: Record<string, string> = {};
  const typeIndices: Record<string, number> = {};
  for (const s of cc.settlements) {
    const idx = typeIndices[s.type] || 0;
    typeIndices[s.type] = idx + 1;
    const key = `${s.type}_${idx}`;
    if (s.guilds.length > 0) {
      guildAssignments[key] = s.guilds;
    }
    settlementLayouts[key] = s.layout;
  }

  const typeOrder: SettlementType[] = ['city', 'town', 'village', 'hamlet', 'market', 'homestead', 'landing', 'forge', 'chapel', 'roadhouse', 'dwelling'];
  const primaryType = typeOrder.find(t => (counts[t] || 0) > 0) || 'market';
  const { foundingFamilies, generations } = computeGenealogy(primaryType as SettlementType, cc.foundedYear);

  return {
    foundedYear: cc.foundedYear,
    generateStates: true,
    numStatesPerCountry: 1,
    numDwellingsPerState: counts['dwelling'] || 0,
    numRoadhousesPerState: counts['roadhouse'] || 0,
    numLandingsPerState: counts['landing'] || 0,
    numForgesPerState: counts['forge'] || 0,
    numChapelsPerState: counts['chapel'] || 0,
    numMarketsPerState: counts['market'] || 0,
    numHamletsPerState: counts['hamlet'] || 0,
    numHomesteadsPerState: counts['homestead'] || 0,
    numVillagesPerState: counts['village'] || 0,
    numTownsPerState: counts['town'] || 0,
    numCitiesPerState: counts['city'] || 0,
    numFoundingFamilies: foundingFamilies,
    generations,
    marriageRate: 0.7,
    fertilityRate: 0.6,
    deathRate: 0.3,
    guildAssignments: Object.keys(guildAssignments).length > 0 ? guildAssignments : undefined,
    settlementLayouts: Object.keys(settlementLayouts).length > 0 ? settlementLayouts : undefined,
  };
}

// --- Component ---

export function CountryConfigPanel({
  config,
  onChange,
  onRemove,
  canRemove,
}: {
  config: CountryConfig;
  onChange: (updated: CountryConfig) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const update = (partial: Partial<CountryConfig>) => onChange({ ...config, ...partial });

  const totalSettlements = config.settlements.length;
  const estimatedPop = config.settlements.reduce((sum, s) => sum + POPULATION_BY_TYPE[s.type], 0);

  const assignedGuilds = new Set(config.settlements.flatMap(s => s.guilds));
  const unassignedGuilds = ALL_GUILDS.filter(g => !assignedGuilds.has(g.id));

  const addSettlement = () => {
    update({ settlements: [...config.settlements, { type: 'homestead', layout: 'organic', guilds: [] }] });
  };

  const removeSettlement = (index: number) => {
    update({ settlements: config.settlements.filter((_, i) => i !== index) });
  };

  const updateSettlement = (index: number, partial: Partial<SettlementEntry>) => {
    const next = config.settlements.map((s, i) => i === index ? { ...s, ...partial } : s);
    update({ settlements: next });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2 flex-1">
          <Label className="text-xs">Founded Year</Label>
          <Input
            type="number"
            value={config.foundedYear}
            onChange={(e) => update({ foundedYear: parseInt(e.target.value) || 1850 })}
          />
        </div>
        {canRemove && (
          <Button type="button" variant="ghost" size="icon" className="mt-5 text-muted-foreground hover:text-destructive" onClick={onRemove}>
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Settlements */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Settlements</Label>
          <Button type="button" variant="outline" size="sm" className="h-6 text-[10px] gap-1" onClick={addSettlement}>
            <Plus className="w-3 h-3" /> Add Settlement
          </Button>
        </div>
        <div className="space-y-1.5">
          {config.settlements.map((s, idx) => {
            const meta = SETTLEMENT_TYPE_META[s.type];
            return (
              <div key={idx} className="px-3 py-2 rounded-md bg-muted/30 border border-border text-xs space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">{meta.icon}</span>
                  <Select value={s.type} onValueChange={(v: string) => updateSettlement(idx, { type: v as SettlementType })}>
                    <SelectTrigger className="h-7 text-xs w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(SETTLEMENT_TYPE_META) as SettlementType[]).map(t => (
                        <SelectItem key={t} value={t}>
                          <span className="capitalize">{t}</span>
                          <span className="text-muted-foreground ml-1">~{POPULATION_BY_TYPE[t]}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={s.layout} onValueChange={(v: string) => updateSettlement(idx, { layout: v as LayoutPattern })}>
                    <SelectTrigger className="h-7 text-xs w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(PATTERN_LABELS) as LayoutPattern[]).map(p => (
                        <SelectItem key={p} value={p}>{PATTERN_LABELS[p]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-muted-foreground ml-auto">~{POPULATION_BY_TYPE[s.type]}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-muted-foreground hover:text-destructive"
                    onClick={() => removeSettlement(idx)}
                    disabled={totalSettlements <= 1}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                </div>
                {/* Guild assignment */}
                <div className="flex flex-wrap gap-1 ml-7">
                  {s.guilds.map(gid => {
                    const g = ALL_GUILDS.find(x => x.id === gid);
                    return (
                      <Badge key={gid} variant="secondary" className="text-[9px] cursor-pointer hover:bg-destructive/20"
                        onClick={() => {
                          updateSettlement(idx, { guilds: s.guilds.filter(id => id !== gid) });
                        }}>
                        {g?.label || gid} &times;
                      </Badge>
                    );
                  })}
                  {ALL_GUILDS.filter(g => !s.guilds.includes(g.id)).length > 0 && (
                    <select className="h-5 text-[9px] bg-muted border rounded px-1"
                      value=""
                      onChange={e => {
                        if (!e.target.value) return;
                        updateSettlement(idx, { guilds: [...s.guilds, e.target.value] });
                        e.target.value = '';
                      }}>
                      <option value="">+ guild</option>
                      {ALL_GUILDS.filter(g => !s.guilds.includes(g.id)).map(g => (
                        <option key={g.id} value={g.id}>{g.label}</option>
                      ))}
                    </select>
                  )}
                </div>
                {/* Layout preview */}
                <SettlementLayoutPreview
                  pattern={s.layout}
                  settlementType={s.type}
                />
              </div>
            );
          })}
          {unassignedGuilds.length > 0 && (
            <p className="text-[10px] text-amber-500">
              Unassigned guilds: {unassignedGuilds.map(g => g.label).join(', ')}
            </p>
          )}
        </div>
        {totalSettlements > 0 && (
          <p className="text-xs text-muted-foreground">
            {totalSettlements} settlement{totalSettlements !== 1 ? 's' : ''} — ~{estimatedPop.toLocaleString()} estimated population
          </p>
        )}
      </div>
    </div>
  );
}
