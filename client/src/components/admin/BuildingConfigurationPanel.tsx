import { useState, useMemo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, Plus, RotateCcw, Trash2 } from "lucide-react";
import { BUILDING_CATEGORY_GROUPINGS, getCategoryForType, type BuildingCategory } from "@shared/game-engine/building-categories";
import type { AssetCollection, VisualAsset } from "@shared/schema";
import type {
  UnifiedBuildingTypeConfig,
  ProceduralStylePreset,
  Color3 as EngineColor3,
  MaterialType,
  ArchitectureStyle,
  RoofStyle,
  Vec3,
} from "@shared/game-engine/types";

// ─── Constants ───────────────────────────────────────────────────────────────

const MATERIAL_TYPES: MaterialType[] = ['wood', 'stone', 'brick', 'metal', 'glass', 'stucco'];
const ARCH_STYLES: ArchitectureStyle[] = ['medieval', 'modern', 'futuristic', 'rustic', 'industrial', 'colonial', 'creole'];
const ROOF_STYLES: RoofStyle[] = ['hip', 'gable', 'flat', 'side_gable', 'hipped_dormers'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

export function colorToHex(c: EngineColor3): string {
  const r = Math.round(c.r * 255).toString(16).padStart(2, '0');
  const g = Math.round(c.g * 255).toString(16).padStart(2, '0');
  const b = Math.round(c.b * 255).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

export function hexToColor(hex: string): EngineColor3 {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16) / 255,
    g: parseInt(h.substring(2, 4), 16) / 255,
    b: parseInt(h.substring(4, 6), 16) / 255,
  };
}

export function humanize(s: string): string {
  return s
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, c => c.toUpperCase());
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface BuildingConfigurationPanelProps {
  collection: AssetCollection;
  assets?: VisualAsset[];
  onUpdateConfig: (buildingTypeConfigs: Record<string, UnifiedBuildingTypeConfig>) => void;
  onUpdateCategoryPresets: (categoryPresets: Record<string, ProceduralStylePreset>) => void;
}

// ─── Category summary ────────────────────────────────────────────────────────

interface CategorySummary {
  asset: number;
  procedural: number;
  unconfigured: number;
}

export function getCategorySummary(
  types: readonly string[],
  configs: Record<string, UnifiedBuildingTypeConfig>,
): CategorySummary {
  let asset = 0;
  let procedural = 0;
  let unconfigured = 0;
  for (const t of types) {
    const cfg = configs[t];
    if (!cfg) {
      unconfigured++;
    } else if (cfg.mode === "asset") {
      asset++;
    } else {
      procedural++;
    }
  }
  return { asset, procedural, unconfigured };
}

// ─── BuildingTypeDetailPanel ─────────────────────────────────────────────────

interface BuildingTypeDetailPanelProps {
  typeName: string;
  config: UnifiedBuildingTypeConfig | undefined;
  categoryPreset: ProceduralStylePreset | undefined;
  assets: VisualAsset[];
  onUpdate: (config: UnifiedBuildingTypeConfig) => void;
}

/** Checks whether a field in styleOverrides differs from the category preset */
function isOverridden(
  overrides: Partial<ProceduralStylePreset> | undefined,
  field: keyof ProceduralStylePreset,
): boolean {
  if (!overrides) return false;
  return field in overrides && overrides[field] !== undefined;
}

export function BuildingTypeDetailPanel({
  typeName,
  config,
  categoryPreset,
  assets,
  onUpdate,
}: BuildingTypeDetailPanelProps) {
  const mode = config?.mode;
  const overrides = config?.styleOverrides;

  const modelAssets = useMemo(
    () => assets.filter(a =>
      (a.assetType || '').startsWith('model_') ||
      a.mimeType === 'model/gltf-binary' ||
      /\.(glb|gltf)$/i.test(a.filePath || ''),
    ),
    [assets],
  );

  const setMode = (newMode: 'asset' | 'procedural') => {
    onUpdate({ ...config, mode: newMode });
  };

  // ── Asset mode helpers ──
  const setAssetId = (assetId: string | undefined) => {
    onUpdate({ ...config, mode: 'asset', assetId });
  };

  const setScaling = (axis: 'x' | 'y' | 'z', value: number) => {
    const current = config?.modelScaling || { x: 1, y: 1, z: 1 };
    onUpdate({ ...config, mode: config?.mode || 'asset', modelScaling: { ...current, [axis]: value } });
  };

  const resetScaling = () => {
    const { modelScaling: _, ...rest } = config || {} as UnifiedBuildingTypeConfig;
    onUpdate({ ...rest, mode: config?.mode || 'asset' });
  };

  // ── Procedural mode helpers ──
  const getResolved = <K extends keyof ProceduralStylePreset>(field: K): ProceduralStylePreset[K] | undefined => {
    if (overrides && field in overrides && overrides[field] !== undefined) {
      return overrides[field] as ProceduralStylePreset[K];
    }
    return categoryPreset?.[field];
  };

  const setOverride = (partial: Partial<ProceduralStylePreset>) => {
    onUpdate({
      ...config,
      mode: 'procedural',
      styleOverrides: { ...overrides, ...partial },
    });
  };

  const resetField = (field: keyof ProceduralStylePreset) => {
    if (!overrides) return;
    const next = { ...overrides };
    delete next[field];
    onUpdate({ ...config, mode: 'procedural', styleOverrides: next });
  };

  const resetAllOverrides = () => {
    onUpdate({ ...config, mode: 'procedural', styleOverrides: undefined });
  };

  const hasAnyOverrides = overrides && Object.keys(overrides).length > 0;

  const scaling = config?.modelScaling || { x: 1, y: 1, z: 1 };
  const hasCustomScale = scaling.x !== 1 || scaling.y !== 1 || scaling.z !== 1;

  return (
    <div
      className="ml-5 mr-1 my-1 p-2 border rounded bg-muted/20 space-y-2 text-xs"
      data-testid={`type-detail-${typeName}`}
    >
      {/* Mode toggle */}
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-[10px]">Mode:</span>
        <button
          className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
            mode === "asset" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
          }`}
          onClick={() => setMode("asset")}
          data-testid={`mode-asset-${typeName}`}
        >
          Asset Model
        </button>
        <button
          className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
            mode === "procedural" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
          }`}
          onClick={() => setMode("procedural")}
          data-testid={`mode-procedural-${typeName}`}
        >
          Procedural
        </button>
      </div>

      {/* ── Asset Mode ── */}
      {mode === "asset" && (
        <div className="space-y-2" data-testid={`asset-config-${typeName}`}>
          <div>
            <Label className="text-[10px]">Model Asset</Label>
            <Select
              value={config?.assetId || "none"}
              onValueChange={v => setAssetId(v === "none" ? undefined : v)}
            >
              <SelectTrigger className="h-6 text-[10px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No model selected</SelectItem>
                {modelAssets.map(a => (
                  <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label className="text-[10px]">Model Scaling</Label>
              {hasCustomScale && (
                <Button variant="ghost" size="sm" className="h-4 text-[9px] px-1" onClick={resetScaling} title="Reset scale">
                  <RotateCcw className="w-2.5 h-2.5" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-1">
              {(['x', 'y', 'z'] as const).map(axis => (
                <div key={axis}>
                  <Label className="text-[9px] uppercase text-muted-foreground">{axis}</Label>
                  <Input
                    type="number"
                    step="0.1"
                    className="h-5 text-[10px]"
                    value={scaling[axis]}
                    onChange={e => setScaling(axis, parseFloat(e.target.value) || 1)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Procedural Mode ── */}
      {mode === "procedural" && (
        <div className="space-y-2" data-testid={`procedural-config-${typeName}`}>
          {/* Reset all */}
          {hasAnyOverrides && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" className="h-5 text-[9px] px-1.5 text-muted-foreground" onClick={resetAllOverrides}>
                <RotateCcw className="w-2.5 h-2.5 mr-0.5" /> Reset All to Category
              </Button>
            </div>
          )}

          {/* Material + Architecture */}
          <div className="grid grid-cols-2 gap-1.5">
            <OverridableSelect
              label="Material"
              field="materialType"
              value={getResolved('materialType')}
              options={MATERIAL_TYPES.map(m => ({ value: m, label: m }))}
              isOverridden={isOverridden(overrides, 'materialType')}
              categoryName={categoryPreset ? 'category' : undefined}
              onChange={v => setOverride({ materialType: v as MaterialType })}
              onReset={() => resetField('materialType')}
            />
            <OverridableSelect
              label="Architecture"
              field="architectureStyle"
              value={getResolved('architectureStyle')}
              options={ARCH_STYLES.map(a => ({ value: a, label: a }))}
              isOverridden={isOverridden(overrides, 'architectureStyle')}
              categoryName={categoryPreset ? 'category' : undefined}
              onChange={v => setOverride({ architectureStyle: v as ArchitectureStyle })}
              onReset={() => resetField('architectureStyle')}
            />
          </div>

          {/* Roof style */}
          <OverridableSelect
            label="Roof Style"
            field="roofStyle"
            value={getResolved('roofStyle') || 'default'}
            options={[
              { value: 'default', label: 'Default (from architecture)' },
              ...ROOF_STYLES.map(r => ({ value: r, label: r.replace(/_/g, ' ') })),
            ]}
            isOverridden={isOverridden(overrides, 'roofStyle')}
            categoryName={categoryPreset ? 'category' : undefined}
            onChange={v => setOverride({ roofStyle: v === 'default' ? undefined : v as RoofStyle })}
            onReset={() => resetField('roofStyle')}
          />

          {/* Wall Colors */}
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-[10px]">
                Wall Colors
                {!isOverridden(overrides, 'baseColors') && categoryPreset && (
                  <span className="text-muted-foreground ml-1 font-normal">(inherited)</span>
                )}
              </Label>
              <div className="flex gap-0.5">
                {isOverridden(overrides, 'baseColors') && (
                  <Button variant="ghost" size="sm" className="h-4 text-[9px] px-1" onClick={() => resetField('baseColors')} title="Reset to category">
                    <RotateCcw className="w-2.5 h-2.5" />
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="h-4 text-[9px] px-1" onClick={() => {
                  const current = getResolved('baseColors') || [{ r: 0.7, g: 0.7, b: 0.7 }];
                  setOverride({ baseColors: [...current, { r: 0.7, g: 0.7, b: 0.7 }] });
                }}>
                  <Plus className="w-2.5 h-2.5" />
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {(getResolved('baseColors') || [{ r: 0.8, g: 0.75, b: 0.65 }]).map((c, i) => (
                <div key={i} className="relative group">
                  <input
                    type="color"
                    value={colorToHex(c)}
                    onChange={e => {
                      const colors = [...(getResolved('baseColors') || [])];
                      colors[i] = hexToColor(e.target.value);
                      setOverride({ baseColors: colors });
                    }}
                    className="w-6 h-6 rounded border cursor-pointer p-0"
                  />
                  {(getResolved('baseColors') || []).length > 1 && (
                    <button
                      className="absolute -top-1 -right-1 w-3 h-3 bg-destructive text-white rounded-full text-[8px] leading-none hidden group-hover:flex items-center justify-center"
                      onClick={() => {
                        const colors = (getResolved('baseColors') || []).filter((_, j) => j !== i);
                        setOverride({ baseColors: colors });
                      }}
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Roof / Window / Door colors */}
          <div className="grid grid-cols-3 gap-1.5">
            {([
              ['Roof', 'roofColor'] as const,
              ['Window', 'windowColor'] as const,
              ['Door', 'doorColor'] as const,
            ]).map(([label, field]) => (
              <div key={field}>
                <div className="flex items-center gap-0.5">
                  <Label className="text-[10px]">{label}</Label>
                  {isOverridden(overrides, field) && (
                    <button className="text-muted-foreground hover:text-foreground" onClick={() => resetField(field)} title="Reset to category">
                      <RotateCcw className="w-2 h-2" />
                    </button>
                  )}
                </div>
                <input
                  type="color"
                  value={colorToHex(getResolved(field) || { r: 0.5, g: 0.5, b: 0.5 })}
                  onChange={e => setOverride({ [field]: hexToColor(e.target.value) })}
                  className="w-full h-6 rounded border cursor-pointer p-0"
                />
                {!isOverridden(overrides, field) && categoryPreset && (
                  <p className="text-[8px] text-muted-foreground">(inherited)</p>
                )}
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-muted-foreground">Features</p>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
              {([
                ['Balcony', 'hasBalcony'] as const,
                ['Ironwork Balcony', 'hasIronworkBalcony'] as const,
                ['Front Porch', 'hasPorch'] as const,
                ['Shutters', 'hasShutters'] as const,
              ]).map(([label, field]) => (
                <div key={field} className="flex items-center gap-1">
                  <label className="flex items-center gap-1 text-[10px] cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={!!getResolved(field)}
                      onChange={e => setOverride({ [field]: e.target.checked || undefined })}
                      className="w-3 h-3"
                    />
                    {label}
                  </label>
                  {isOverridden(overrides, field) && (
                    <button className="text-muted-foreground hover:text-foreground" onClick={() => resetField(field)} title="Reset">
                      <RotateCcw className="w-2 h-2" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Porch options (conditional) */}
          {getResolved('hasPorch') && (
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <Label className="text-[10px]">Porch Depth</Label>
                <Input
                  type="number"
                  className="h-5 text-[10px]"
                  value={getResolved('porchDepth') ?? 3}
                  onChange={e => setOverride({ porchDepth: parseFloat(e.target.value) || 3 })}
                />
              </div>
              <div>
                <Label className="text-[10px]">Porch Steps</Label>
                <Input
                  type="number"
                  className="h-5 text-[10px]"
                  value={getResolved('porchSteps') ?? 3}
                  onChange={e => setOverride({ porchSteps: parseInt(e.target.value) || 3 })}
                />
              </div>
            </div>
          )}

          {/* Shutter color (conditional) */}
          {getResolved('hasShutters') && (
            <div>
              <Label className="text-[10px]">Shutter Color</Label>
              <input
                type="color"
                value={colorToHex(getResolved('shutterColor') || getResolved('doorColor') || { r: 0.4, g: 0.3, b: 0.2 })}
                onChange={e => setOverride({ shutterColor: hexToColor(e.target.value) })}
                className="w-full h-6 rounded border cursor-pointer p-0"
              />
            </div>
          )}

          {/* Dimension overrides */}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground mb-0.5">Dimensions</p>
            <div className="grid grid-cols-3 gap-1">
              {([
                ['Floors', 'floors'],
                ['Width', 'width'],
                ['Depth', 'depth'],
              ] as const).map(([label, field]) => (
                <div key={field}>
                  <Label className="text-[9px]">{label}</Label>
                  <Input
                    type="number"
                    className="h-5 text-[10px]"
                    placeholder="default"
                    value={(overrides as any)?.[field] ?? ''}
                    onChange={e => {
                      const val = e.target.value ? parseFloat(e.target.value) : undefined;
                      setOverride({ [field]: val } as any);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Not configured yet */}
      {!mode && (
        <div className="text-muted-foreground text-[10px]">
          Not configured. Select a mode above to begin.
        </div>
      )}
    </div>
  );
}

// ─── OverridableSelect ───────────────────────────────────────────────────────

function OverridableSelect({
  label,
  field,
  value,
  options,
  isOverridden,
  categoryName,
  onChange,
  onReset,
}: {
  label: string;
  field: string;
  value: string | undefined;
  options: { value: string; label: string }[];
  isOverridden: boolean;
  categoryName: string | undefined;
  onChange: (value: string) => void;
  onReset: () => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-0.5">
        <Label className="text-[10px]">{label}</Label>
        {isOverridden && (
          <button className="text-muted-foreground hover:text-foreground" onClick={onReset} title="Reset to category">
            <RotateCcw className="w-2 h-2" />
          </button>
        )}
      </div>
      <Select value={value || 'none'} onValueChange={onChange}>
        <SelectTrigger className="h-6 text-[10px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map(o => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {!isOverridden && categoryName && (
        <p className="text-[8px] text-muted-foreground">(inherited from {categoryName})</p>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

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

  const handleTypeUpdate = useCallback(
    (typeName: string, typeConfig: UnifiedBuildingTypeConfig) => {
      onUpdateConfig({ ...configs, [typeName]: typeConfig });
    },
    [configs, onUpdateConfig],
  );

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
                        <span
                          className="inline-block w-3 h-3 rounded-sm border border-border shrink-0"
                          style={{ backgroundColor: color3ToCss(displayColor) }}
                        />
                        <span className="flex-1 text-left truncate">{humanize(typeName)}</span>
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

                      {/* Expanded type detail panel */}
                      {isTypeExpanded && (
                        <BuildingTypeDetailPanel
                          typeName={typeName}
                          config={cfg}
                          categoryPreset={preset}
                          assets={assets}
                          onUpdate={updated => handleTypeUpdate(typeName, updated)}
                        />
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
