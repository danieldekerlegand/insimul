import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ChevronRight, RotateCcw, Home,
} from "lucide-react";
import type { AssetCollection, VisualAsset } from "@shared/schema";
import type {
  UnifiedBuildingTypeConfig,
  InteriorTemplateConfig,
  LightingPreset,
  ProceduralStylePreset,
  Color3 as EngineColor3,
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<BuildingCategory, string> = {
  commercial_food: "Food & Drink",
  commercial_retail: "Retail",
  commercial_service: "Services",
  civic: "Civic",
  industrial: "Industrial",
  maritime: "Maritime",
  residential: "Residential",
};

export function color3ToCss(c: EngineColor3 | undefined): string {
  if (!c) return "#888";
  return `rgb(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)})`;
}

export function humanize(s: string): string {
  return s
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, c => c.toUpperCase());
}

// ─── Category summary ─────────────────────────────────────────────────────────

interface CategorySummary {
  asset: number;
  procedural: number;
  unconfigured: number;
  withInterior: number;
}

export function getCategorySummary(
  types: readonly string[],
  configs: Record<string, UnifiedBuildingTypeConfig>,
): CategorySummary {
  let asset = 0;
  let procedural = 0;
  let unconfigured = 0;
  let withInterior = 0;
  for (const t of types) {
    const cfg = configs[t];
    if (!cfg) {
      unconfigured++;
    } else if (cfg.mode === "asset") {
      asset++;
    } else {
      procedural++;
    }
    if (cfg?.interiorConfig) withInterior++;
  }
  return { asset, procedural, unconfigured, withInterior };
}

// ─── Asset helpers ────────────────────────────────────────────────────────────

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

// ─── Types ────────────────────────────────────────────────────────────────────

interface BuildingConfigurationPanelProps {
  collection: AssetCollection;
  assets?: VisualAsset[];
  onUpdateConfig: (buildingTypeConfigs: Record<string, UnifiedBuildingTypeConfig>) => void;
  onUpdateCategoryPresets?: (categoryPresets: Record<string, ProceduralStylePreset>) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BuildingConfigurationPanel({
  collection,
  assets = [],
  onUpdateConfig,
  onUpdateCategoryPresets,
}: BuildingConfigurationPanelProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedType, setExpandedType] = useState<string | null>(null);

  const configs = useMemo<Record<string, UnifiedBuildingTypeConfig>>(
    () => (collection as any).buildingTypeConfigs || {},
    [(collection as any).buildingTypeConfigs],
  );

  const presets = useMemo<Record<string, ProceduralStylePreset>>(
    () => (collection as any).categoryPresets || {},
    [(collection as any).categoryPresets],
  );

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const toggleType = (typeName: string) => {
    setExpandedType(prev => (prev === typeName ? null : typeName));
  };

  const handleModeToggle = (typeName: string) => {
    const current = configs[typeName];
    const newMode: "asset" | "procedural" = current?.mode === "asset" ? "procedural" : "asset";
    const updated = {
      ...configs,
      [typeName]: { ...current, mode: newMode },
    };
    onUpdateConfig(updated);
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

  const categories = Object.entries(BUILDING_CATEGORY_GROUPINGS) as [
    BuildingCategory,
    readonly string[],
  ][];

  return (
    <div className="space-y-1" data-testid="building-configuration-panel">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        Building Types by Category
      </p>

      {categories.map(([category, types]) => {
        const isExpanded = expandedCategories.has(category);
        const summary = getCategorySummary(types, configs);
        const preset = presets[category];

        return (
          <div key={category} className="border rounded" data-testid={`category-${category}`}>
            {/* Category header */}
            <button
              className="flex items-center justify-between w-full text-xs px-2 py-2 hover:bg-muted/50 rounded cursor-pointer transition-colors"
              onClick={() => toggleCategory(category)}
              data-testid={`category-header-${category}`}
            >
              <div className="flex items-center gap-1.5">
                <ChevronRight
                  className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`}
                />
                <span className="font-medium">{CATEGORY_LABELS[category]}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {preset && (
                  <span
                    className="inline-block w-3 h-3 rounded-sm border border-border"
                    style={{ backgroundColor: color3ToCss(preset.baseColors?.[0]) }}
                    title="Category preset color"
                  />
                )}
                {summary.withInterior > 0 && (
                  <Badge variant="secondary" className="text-[9px] h-4">
                    {summary.withInterior} interior
                  </Badge>
                )}
                <Badge variant="outline" className="text-[9px] h-4 font-normal">
                  {summary.asset > 0 && <span>{summary.asset} asset</span>}
                  {summary.asset > 0 && summary.procedural > 0 && <span className="mx-0.5">/</span>}
                  {summary.procedural > 0 && <span>{summary.procedural} proc</span>}
                  {(summary.asset > 0 || summary.procedural > 0) && summary.unconfigured > 0 && (
                    <span className="mx-0.5">/</span>
                  )}
                  {summary.unconfigured > 0 && (
                    <span className="text-muted-foreground">{summary.unconfigured} unset</span>
                  )}
                  {summary.asset === 0 && summary.procedural === 0 && summary.unconfigured > 0 && (
                    <span className="text-muted-foreground">{types.length} unconfigured</span>
                  )}
                </Badge>
              </div>
            </button>

            {/* Expanded category — list of building types */}
            {isExpanded && (
              <div className="border-t px-1.5 pb-1.5 pt-1 space-y-0.5">
                {types.map(typeName => {
                  const cfg = configs[typeName];
                  const isTypeExpanded = expandedType === typeName;
                  const presetColor = preset?.baseColors?.[0];
                  const overrideColor = cfg?.styleOverrides?.baseColors?.[0];
                  const displayColor = overrideColor || presetColor;

                  return (
                    <div key={typeName} data-testid={`building-type-${typeName}`}>
                      <button
                        className="flex items-center gap-2 w-full text-xs px-1.5 py-1 hover:bg-muted/40 rounded transition-colors"
                        onClick={() => toggleType(typeName)}
                        data-testid={`type-row-${typeName}`}
                      >
                        {/* Color swatch */}
                        <span
                          className="inline-block w-3 h-3 rounded-sm border border-border shrink-0"
                          style={{ backgroundColor: color3ToCss(displayColor) }}
                        />
                        {/* Type name */}
                        <span className="flex-1 text-left truncate">{humanize(typeName)}</span>
                        {/* Interior indicator */}
                        {cfg?.interiorConfig && (
                          <Home className="w-3 h-3 text-muted-foreground shrink-0" />
                        )}
                        {/* Mode badge */}
                        {cfg ? (
                          <Badge
                            variant={cfg.mode === "asset" ? "default" : "secondary"}
                            className="text-[9px] h-4"
                          >
                            {cfg.mode === "asset" ? "Asset" : "Procedural"}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[9px] h-4 text-muted-foreground">
                            Unset
                          </Badge>
                        )}
                        <ChevronRight
                          className={`w-3 h-3 text-muted-foreground transition-transform shrink-0 ${isTypeExpanded ? "rotate-90" : ""}`}
                        />
                      </button>

                      {/* Expanded type detail */}
                      {isTypeExpanded && (
                        <div
                          className="ml-5 mr-1 my-1 p-2 border rounded bg-muted/20 space-y-2 text-xs"
                          data-testid={`type-detail-${typeName}`}
                        >
                          {/* Mode toggle */}
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Mode:</span>
                            <button
                              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                                cfg?.mode === "asset"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted hover:bg-muted/80"
                              }`}
                              onClick={() => handleModeToggle(typeName)}
                            >
                              Asset
                            </button>
                            <button
                              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                                cfg?.mode === "procedural"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted hover:bg-muted/80"
                              }`}
                              onClick={() => handleModeToggle(typeName)}
                            >
                              Procedural
                            </button>
                          </div>

                          {/* Summary info based on mode */}
                          {cfg?.mode === "asset" && (
                            <div className="text-muted-foreground">
                              {cfg.assetId ? (
                                <span>Asset assigned: <code className="text-[10px]">{cfg.assetId}</code></span>
                              ) : (
                                <span>No asset assigned yet</span>
                              )}
                            </div>
                          )}

                          {cfg?.mode === "procedural" && (
                            <div className="space-y-1">
                              <div className="text-muted-foreground">
                                {cfg.stylePresetId ? (
                                  <span>Preset: {cfg.stylePresetId}</span>
                                ) : (
                                  <span>Using category defaults</span>
                                )}
                              </div>
                              {cfg.styleOverrides && Object.keys(cfg.styleOverrides).length > 0 && (
                                <div className="text-muted-foreground">
                                  {Object.keys(cfg.styleOverrides).length} field override(s)
                                </div>
                              )}
                            </div>
                          )}

                          {!cfg && (
                            <div className="text-muted-foreground">
                              Not configured. Click a mode above to begin.
                            </div>
                          )}

                          {/* Scaling info */}
                          {cfg?.modelScaling && (
                            <div className="text-muted-foreground">
                              Scale: {cfg.modelScaling.x.toFixed(2)} x {cfg.modelScaling.y.toFixed(2)} x {cfg.modelScaling.z.toFixed(2)}
                            </div>
                          )}

                          {/* Interior config section */}
                          {cfg && (
                            <div className="border rounded p-2 space-y-2 bg-muted/20">
                              <div className="flex items-center gap-1.5">
                                <Home className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Interior</span>
                                {cfg.interiorConfig && (
                                  <Badge variant="secondary" className="text-[9px] h-3.5 ml-auto">
                                    {cfg.interiorConfig.mode}
                                  </Badge>
                                )}
                              </div>
                              <InteriorConfigEditor
                                config={cfg.interiorConfig}
                                assets={assets}
                                onChange={(interiorConfig) => handleUpdateType(typeName, { ...cfg, interiorConfig })}
                                onClear={() => {
                                  const { interiorConfig: _, ...rest } = cfg;
                                  handleUpdateType(typeName, rest as UnifiedBuildingTypeConfig);
                                }}
                              />
                            </div>
                          )}
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
