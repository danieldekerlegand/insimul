import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ChevronRight, ChevronDown, RotateCcw, Home, Building2,
} from "lucide-react";
import type { AssetCollection, VisualAsset } from "@shared/schema";
import type {
  UnifiedBuildingTypeConfig,
  InteriorTemplateConfig,
  LightingPreset,
} from "@shared/game-engine/types";
import {
  BUILDING_CATEGORY_GROUPINGS,
  type BuildingCategory,
} from "@shared/game-engine/building-categories";

// ─── Constants ──────────────────────────────────────────────────────────────

const LIGHTING_PRESETS: LightingPreset[] = ['bright', 'dim', 'warm', 'cool', 'candlelit'];

const FURNITURE_SETS = [
  'tavern', 'shop', 'residential', 'church', 'school', 'hotel',
  'blacksmith', 'warehouse', 'clinic', 'farm', 'guild_hall', 'office',
  'library', 'bakery', 'restaurant', 'bar',
];

const LAYOUT_TEMPLATE_IDS = [
  'tavern', 'restaurant', 'shop', 'bar', 'bakery',
  'residence_small', 'residence_medium', 'residence_large',
  'church', 'school', 'hotel', 'blacksmith', 'warehouse',
  'clinic', 'farm_barn', 'guild_hall',
];

// ─── Helpers ────────────────────────────────────────────────────────────────

export function humanize(s: string): string {
  return s
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, c => c.toUpperCase());
}

export function getCategorySummary(
  types: readonly string[],
  configs: Record<string, UnifiedBuildingTypeConfig>,
): { asset: number; procedural: number; unconfigured: number; withInterior: number } {
  let asset = 0, procedural = 0, unconfigured = 0, withInterior = 0;
  for (const t of types) {
    const cfg = configs[t];
    if (!cfg) { unconfigured++; continue; }
    if (cfg.mode === 'asset') asset++;
    else procedural++;
    if (cfg.interiorConfig) withInterior++;
  }
  return { asset, procedural, unconfigured, withInterior };
}

function getTextureAssets(assets: VisualAsset[]): VisualAsset[] {
  return assets.filter(a => {
    const type = a.assetType || '';
    const path = (a.filePath || '').toLowerCase();
    return type.startsWith('texture_') ||
      path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.webp');
  });
}

function getModelAssets(assets: VisualAsset[]): VisualAsset[] {
  return assets.filter(a => {
    const type = a.assetType || '';
    const path = (a.filePath || '').toLowerCase();
    return type.startsWith('model_') ||
      a.mimeType === 'model/gltf-binary' ||
      path.endsWith('.glb') || path.endsWith('.gltf');
  });
}

// ─── Interior Config Editor ─────────────────────────────────────────────────

function InteriorConfigEditor({
  config,
  assets,
  onChange,
  onClear,
}: {
  config: InteriorTemplateConfig | undefined;
  assets: VisualAsset[];
  onChange: (cfg: InteriorTemplateConfig) => void;
  onClear: () => void;
}) {
  const current: InteriorTemplateConfig = config || { mode: 'procedural' };
  const textureAssets = useMemo(() => getTextureAssets(assets), [assets]);
  const modelAssets = useMemo(() => getModelAssets(assets), [assets]);

  const update = (partial: Partial<InteriorTemplateConfig>) => {
    onChange({ ...current, ...partial });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold">Interior Mode</Label>
        {config && (
          <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[10px]" onClick={onClear}>
            <RotateCcw className="w-3 h-3 mr-0.5" /> Clear
          </Button>
        )}
      </div>
      <Select value={current.mode} onValueChange={(v) => update({ mode: v as 'model' | 'procedural' })}>
        <SelectTrigger className="h-7 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="model">3D Model</SelectItem>
          <SelectItem value="procedural">Procedural</SelectItem>
        </SelectContent>
      </Select>

      {current.mode === 'model' && (
        <div className="space-y-2">
          <Label className="text-[10px] text-muted-foreground">Interior Model</Label>
          <Select
            value={current.modelPath || '_none'}
            onValueChange={(v) => update({ modelPath: v === '_none' ? undefined : v })}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue placeholder="Select model..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">None</SelectItem>
              {modelAssets.map(a => (
                <SelectItem key={a.id} value={a.filePath || a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {current.mode === 'procedural' && (
        <div className="space-y-2">
          <Label className="text-[10px] text-muted-foreground">Layout Template</Label>
          <Select
            value={current.layoutTemplateId || '_none'}
            onValueChange={(v) => update({ layoutTemplateId: v === '_none' ? undefined : v })}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue placeholder="Select template..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">None (auto)</SelectItem>
              {LAYOUT_TEMPLATE_IDS.map(id => (
                <SelectItem key={id} value={id}>{humanize(id)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Texture pickers */}
      <div className="space-y-2">
        <Label className="text-[10px] text-muted-foreground">Wall Texture</Label>
        <Select
          value={current.wallTextureId || '_none'}
          onValueChange={(v) => update({ wallTextureId: v === '_none' ? undefined : v })}
        >
          <SelectTrigger className="h-7 text-xs">
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_none">None</SelectItem>
            {textureAssets.map(a => (
              <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] text-muted-foreground">Floor Texture</Label>
        <Select
          value={current.floorTextureId || '_none'}
          onValueChange={(v) => update({ floorTextureId: v === '_none' ? undefined : v })}
        >
          <SelectTrigger className="h-7 text-xs">
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_none">None</SelectItem>
            {textureAssets.map(a => (
              <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] text-muted-foreground">Ceiling Texture</Label>
        <Select
          value={current.ceilingTextureId || '_none'}
          onValueChange={(v) => update({ ceilingTextureId: v === '_none' ? undefined : v })}
        >
          <SelectTrigger className="h-7 text-xs">
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_none">None</SelectItem>
            {textureAssets.map(a => (
              <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Furniture set */}
      <div className="space-y-2">
        <Label className="text-[10px] text-muted-foreground">Furniture Set</Label>
        <Select
          value={current.furnitureSet || '_none'}
          onValueChange={(v) => update({ furnitureSet: v === '_none' ? undefined : v })}
        >
          <SelectTrigger className="h-7 text-xs">
            <SelectValue placeholder="None (auto)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_none">None (auto)</SelectItem>
            {FURNITURE_SETS.map(s => (
              <SelectItem key={s} value={s}>{humanize(s)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lighting preset */}
      <div className="space-y-2">
        <Label className="text-[10px] text-muted-foreground">Lighting Preset</Label>
        <Select
          value={current.lightingPreset || '_none'}
          onValueChange={(v) => update({ lightingPreset: v === '_none' ? undefined : v as LightingPreset })}
        >
          <SelectTrigger className="h-7 text-xs">
            <SelectValue placeholder="None (default)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_none">None (default)</SelectItem>
            {LIGHTING_PRESETS.map(p => (
              <SelectItem key={p} value={p}>{humanize(p)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// ─── Building Type Detail Panel ─────────────────────────────────────────────

function BuildingTypeDetailPanel({
  buildingType,
  config,
  assets,
  onUpdate,
}: {
  buildingType: string;
  config: UnifiedBuildingTypeConfig | undefined;
  assets: VisualAsset[];
  onUpdate: (cfg: UnifiedBuildingTypeConfig | undefined) => void;
}) {
  const current = config || { mode: 'procedural' as const };

  const updateInterior = (interiorConfig: InteriorTemplateConfig) => {
    onUpdate({ ...current, interiorConfig });
  };

  const clearInterior = () => {
    const { interiorConfig: _, ...rest } = current;
    onUpdate(rest as UnifiedBuildingTypeConfig);
  };

  return (
    <div className="space-y-3 pl-3 border-l-2 border-primary/20">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">{humanize(buildingType)}</span>
        <Badge variant="outline" className="text-[10px] h-4">
          {current.mode}
        </Badge>
      </div>

      {/* Interior Configuration Section */}
      <div className="border rounded p-2 space-y-2 bg-muted/20">
        <div className="flex items-center gap-1.5">
          <Home className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Interior</span>
          {current.interiorConfig && (
            <Badge variant="secondary" className="text-[9px] h-3.5 ml-auto">
              {current.interiorConfig.mode}
            </Badge>
          )}
        </div>
        <InteriorConfigEditor
          config={current.interiorConfig}
          assets={assets}
          onChange={updateInterior}
          onClear={clearInterior}
        />
      </div>
    </div>
  );
}

// ─── Main Panel ─────────────────────────────────────────────────────────────

export function BuildingConfigurationPanel({
  collection,
  assets,
  onUpdateConfig,
}: {
  collection: AssetCollection;
  assets: VisualAsset[];
  onUpdateConfig: (configs: Record<string, UnifiedBuildingTypeConfig>) => void;
}) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const configs: Record<string, UnifiedBuildingTypeConfig> =
    (collection as any).buildingTypeConfigs || {};

  const categories = Object.entries(BUILDING_CATEGORY_GROUPINGS) as [BuildingCategory, readonly string[]][];

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  };

  const handleUpdateType = (type: string, cfg: UnifiedBuildingTypeConfig | undefined) => {
    const updated = { ...configs };
    if (cfg) {
      updated[type] = cfg;
    } else {
      delete updated[type];
    }
    onUpdateConfig(updated);
  };

  return (
    <div className="space-y-1" data-testid="building-config-panel">
      <div className="flex items-center gap-1.5 mb-2">
        <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Building Type Configuration
        </span>
      </div>

      {categories.map(([category, types]) => {
        const isExpanded = expandedCategories.has(category);
        const summary = getCategorySummary(types, configs);

        return (
          <div key={category} className="border rounded">
            <button
              className="flex items-center justify-between w-full text-xs px-2 py-1.5 hover:bg-muted/50 rounded cursor-pointer transition-colors"
              onClick={() => toggleCategory(category)}
              data-testid={`category-${category}`}
            >
              <div className="flex items-center gap-1.5">
                {isExpanded
                  ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                <span className="font-medium">{humanize(category)}</span>
              </div>
              <div className="flex gap-1">
                {summary.withInterior > 0 && (
                  <Badge variant="secondary" className="text-[9px] h-4">
                    {summary.withInterior} interior
                  </Badge>
                )}
                <Badge variant={summary.unconfigured === 0 ? "secondary" : "outline"} className="text-[10px] h-4">
                  {types.length - summary.unconfigured}/{types.length}
                </Badge>
              </div>
            </button>

            {isExpanded && (
              <div className="space-y-1 px-2 pb-2 border-t pt-1.5">
                {types.map(type => {
                  const cfg = configs[type];
                  const isSelected = selectedType === type;

                  return (
                    <div key={type}>
                      <button
                        className={`flex items-center justify-between w-full text-xs px-2 py-1 rounded cursor-pointer transition-colors ${
                          isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedType(isSelected ? null : type)}
                        data-testid={`type-${type}`}
                      >
                        <span>{humanize(type)}</span>
                        <div className="flex items-center gap-1">
                          {cfg?.interiorConfig && (
                            <Home className="w-3 h-3 text-muted-foreground" />
                          )}
                          {cfg ? (
                            <Badge variant="secondary" className="text-[9px] h-3.5">{cfg.mode}</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[9px] h-3.5 text-muted-foreground">—</Badge>
                          )}
                        </div>
                      </button>

                      {isSelected && (
                        <div className="mt-1.5 mb-2">
                          <BuildingTypeDetailPanel
                            buildingType={type}
                            config={cfg}
                            assets={assets}
                            onUpdate={(newCfg) => handleUpdateType(type, newCfg)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
