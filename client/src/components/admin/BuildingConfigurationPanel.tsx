import { useState, useMemo, useCallback, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, Home, Plus, RotateCcw, Trash2, Palette } from "lucide-react";
import { BUILDING_CATEGORY_GROUPINGS, getCategoryForType, type BuildingCategory } from "@shared/game-engine/building-categories";
import { getTemplateForBuildingType } from "@shared/game-engine/interior-templates";
import { AssetSelect } from "../AssetSelect";
import { AssetDropdown } from "./AssetDropdown";
import type { AssetCollection, VisualAsset } from "@shared/schema";
import type {
  UnifiedBuildingTypeConfig,
  InteriorTemplateConfig,
  LightingPreset,
  ProceduralStylePreset,
  Color3 as EngineColor3,
  MaterialType,
  ArchitectureStyle,
  RoofStyle,
  Vec3,
} from "@shared/game-engine/types";

// ─── Constants ───────────────────────────────────────────────────────────────

const LIGHTING_PRESETS: LightingPreset[] = ['bright', 'dim', 'warm', 'cool', 'candlelit'];

const FURNITURE_SETS = [
  'tavern', 'restaurant', 'shop', 'bar', 'bakery', 'brewery',
  'residence_small', 'residence_medium', 'residence_large', 'cottage', 'townhouse', 'apartment', 'mobile_home', 'apartment_complex',
  'church', 'school', 'university', 'hotel', 'hospital',
  'blacksmith', 'warehouse', 'factory', 'carpenter', 'butcher',
  'clinic', 'farm_barn', 'guild_hall', 'library', 'stables',
  'bank', 'barbershop', 'tailor', 'pharmacy', 'law_firm',
  'town_hall', 'police_station', 'fire_station', 'daycare', 'mortuary',
  'theater', 'inn', 'barracks', 'autorepair', 'bathhouse', 'small_office',
  'harbor_office', 'harbor', 'fish_market', 'boatyard', 'lighthouse',
  'mill', 'mine', 'herbshop',
  'grocery_store', 'jewelry_store', 'book_store', 'pawn_shop',
];

const LAYOUT_TEMPLATE_IDS = [
  'tavern', 'restaurant', 'shop', 'bar', 'bakery', 'brewery',
  'residence_small', 'residence_medium', 'residence_large', 'cottage', 'townhouse', 'apartment', 'mobile_home', 'apartment_complex',
  'church', 'school', 'university', 'hotel', 'hospital',
  'blacksmith', 'warehouse', 'factory', 'carpenter', 'butcher',
  'clinic', 'farm_barn', 'guild_hall', 'library', 'stables',
  'bank', 'barbershop', 'tailor', 'pharmacy', 'law_firm',
  'town_hall', 'police_station', 'fire_station', 'daycare', 'mortuary',
  'theater', 'inn', 'barracks', 'autorepair', 'bathhouse', 'small_office',
  'harbor_office', 'harbor', 'fish_market', 'boatyard', 'lighthouse',
  'mill', 'mine', 'herbshop',
  'grocery_store', 'jewelry_store', 'book_store', 'pawn_shop',
];

const MATERIAL_TYPES: MaterialType[] = ['wood', 'stone', 'brick', 'metal', 'glass', 'stucco'];
const ARCH_STYLES: ArchitectureStyle[] = ['medieval', 'modern', 'futuristic', 'rustic', 'industrial', 'colonial', 'creole'];
const ROOF_STYLES: RoofStyle[] = ['hip', 'gable', 'flat', 'side_gable', 'hipped_dormers'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<BuildingCategory, string> = {
  commercial_food: "Food & Drink",
  commercial_retail: "Retail",
  commercial_service: "Services",
  civic: "Civic",
  entertainment: "Entertainment",
  professional: "Professional",
  industrial: "Industrial",
  military: "Military",
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

import type { ConfigSelection } from "./config-selection";
import { getBuildingDefaults, MAX_LOT_WIDTH, MAX_LOT_DEPTH } from "@shared/game-engine/building-defaults";
import {
  MATERIAL_PRESETS,
  ARCHITECTURE_PRESETS,
  applyMaterialPreset,
  applyArchitecturePreset,
} from "@shared/game-engine/building-preset-definitions";

interface BuildingConfigurationPanelProps {
  collection: AssetCollection;
  assets?: VisualAsset[];
  onUpdateConfig: (buildingTypeConfigs: Record<string, UnifiedBuildingTypeConfig>) => void;
  onUpdateCategoryPresets?: (categoryPresets: Record<string, ProceduralStylePreset>) => void;
  selection?: ConfigSelection;
  onSelect?: (selection: ConfigSelection) => void;
}

// ─── Category summary ────────────────────────────────────────────────────────

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
    // Count as having interior if explicitly configured OR if a matching template exists
    if (cfg?.interiorConfig || getTemplateForBuildingType(t, t)) withInterior++;
  }
  return { asset, procedural, unconfigured, withInterior };
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
          <AssetDropdown
            assets={assets}
            value={current.modelPath}
            onChange={(id) => update({ modelPath: id })}
            filter="model"
            placeholder="Select model..."
          />
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
        <AssetDropdown
          assets={assets}
          value={current.wallTextureId}
          onChange={(id) => update({ wallTextureId: id })}
          filter="texture"
          placeholder="None"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] text-muted-foreground">Floor Texture</Label>
        <AssetDropdown
          assets={assets}
          value={current.floorTextureId}
          onChange={(id) => update({ floorTextureId: id })}
          filter="texture"
          placeholder="None"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] text-muted-foreground">Ceiling Texture</Label>
        <AssetDropdown
          assets={assets}
          value={current.ceilingTextureId}
          onChange={(id) => update({ ceilingTextureId: id })}
          filter="texture"
          placeholder="None"
        />
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

// ─── BuildingTypeDetailPanel ─────────────────────────────────────────────────

interface BuildingTypeDetailPanelProps {
  typeName: string;
  config: UnifiedBuildingTypeConfig | undefined;
  categoryPreset: ProceduralStylePreset | undefined;
  assets: VisualAsset[];
  onUpdate: (config: UnifiedBuildingTypeConfig) => void;
  /** Hide the interior config section (when shown in separate tab) */
  hideInterior?: boolean;
  /** Show only the interior config section */
  interiorOnly?: boolean;
}

/** Checks whether a field in styleOverrides differs from the category preset */
function isOverridden(
  overrides: Partial<ProceduralStylePreset> | undefined,
  field: keyof ProceduralStylePreset,
): boolean {
  if (!overrides) return false;
  return field in overrides && overrides[field] !== undefined;
}

// ─── Grouped Config Helpers ──────────────────────────────────────────────────

function ConfigSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group border rounded bg-muted/10" open>
      <summary className="flex items-center gap-1 px-2 py-1 cursor-pointer select-none text-[10px] font-semibold text-muted-foreground uppercase tracking-wider hover:bg-muted/30">
        <ChevronRight className="w-3 h-3 transition-transform group-open:rotate-90" />
        {title}
      </summary>
      <div className="px-2 pb-2 pt-1 space-y-1.5">
        {children}
      </div>
    </details>
  );
}

function ColorAndTexture({
  label, colorField, textureField, getResolved, overrides, categoryPreset, assets, setOverride, resetField,
}: {
  label: string;
  colorField: 'roofColor' | 'windowColor' | 'doorColor';
  textureField: 'roofTextureId' | 'wallTextureId' | 'doorTextureId' | 'windowTextureId' | 'balconyTextureId' | 'ironworkTextureId' | 'porchTextureId' | 'shutterTextureId' | 'floorTextureId';
  getResolved: <K extends keyof ProceduralStylePreset>(field: K) => ProceduralStylePreset[K] | undefined;
  overrides: Partial<ProceduralStylePreset> | undefined;
  categoryPreset: ProceduralStylePreset | undefined;
  assets: VisualAsset[];
  setOverride: (partial: Partial<ProceduralStylePreset>) => void;
  resetField: (field: keyof ProceduralStylePreset) => void;
}) {
  return (
    <div className="space-y-1">
      <div>
        <div className="flex items-center gap-0.5">
          <Label className="text-[10px]">{label} Color</Label>
          {isOverridden(overrides, colorField) && (
            <button className="text-muted-foreground hover:text-foreground" onClick={() => resetField(colorField)} title="Reset to category">
              <RotateCcw className="w-2 h-2" />
            </button>
          )}
        </div>
        <input
          type="color"
          value={colorToHex(getResolved(colorField) || { r: 0.5, g: 0.5, b: 0.5 })}
          onChange={e => setOverride({ [colorField]: hexToColor(e.target.value) })}
          className="w-full h-6 rounded border cursor-pointer p-0"
        />
        {!isOverridden(overrides, colorField) && categoryPreset && (
          <p className="text-[8px] text-muted-foreground">(inherited)</p>
        )}
      </div>
      <TextureRow label={`${label} Texture`} field={textureField} getResolved={getResolved} overrides={overrides} assets={assets} setOverride={setOverride} resetField={resetField} />
    </div>
  );
}

function TextureRow({
  label, field, getResolved, overrides, assets, setOverride, resetField,
}: {
  label: string;
  field: keyof ProceduralStylePreset;
  getResolved: <K extends keyof ProceduralStylePreset>(field: K) => ProceduralStylePreset[K] | undefined;
  overrides: Partial<ProceduralStylePreset> | undefined;
  assets: VisualAsset[];
  setOverride: (partial: Partial<ProceduralStylePreset>) => void;
  resetField: (field: keyof ProceduralStylePreset) => void;
}) {
  const textureId = getResolved(field) as string | undefined;
  return (
    <div>
      <div className="flex items-center justify-between">
        <Label className="text-[10px]">{label}</Label>
        {isOverridden(overrides, field) && (
          <button className="text-muted-foreground hover:text-foreground" onClick={() => resetField(field)} title="Reset to category">
            <RotateCcw className="w-2 h-2" />
          </button>
        )}
      </div>
      <AssetDropdown
        assets={assets}
        value={textureId}
        onChange={(id) => setOverride({ [field]: id || undefined } as any)}
        filter="texture"
        placeholder="Not set (using color)"
        className="h-6 text-[10px]"
      />
    </div>
  );
}

function FeatureToggle({
  label, field, getResolved, overrides, setOverride, resetField,
}: {
  label: string;
  field: 'hasBalcony' | 'hasIronworkBalcony' | 'hasPorch' | 'hasShutters';
  getResolved: <K extends keyof ProceduralStylePreset>(field: K) => ProceduralStylePreset[K] | undefined;
  overrides: Partial<ProceduralStylePreset> | undefined;
  setOverride: (partial: Partial<ProceduralStylePreset>) => void;
  resetField: (field: keyof ProceduralStylePreset) => void;
}) {
  return (
    <div className="flex items-center gap-1">
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
  );
}

export function BuildingTypeDetailPanel({
  typeName,
  config,
  categoryPreset,
  assets,
  onUpdate,
  hideInterior,
  interiorOnly,
}: BuildingTypeDetailPanelProps) {
  const mode = config?.mode;
  const overrides = config?.styleOverrides;

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
      className={`${interiorOnly || hideInterior ? '' : 'ml-5 mr-1 my-1'} p-2 border rounded bg-muted/20 space-y-2 text-xs`}
      data-testid={`type-detail-${typeName}`}
    >
      {/* Mode toggle */}
      {!interiorOnly && (<div className="flex items-center gap-2">
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
      </div>)}

      {/* ── Asset Mode ── */}
      {!interiorOnly && mode === "asset" && (
        <div className="space-y-2" data-testid={`asset-config-${typeName}`}>
          <div>
            <Label className="text-[10px]">Model Asset</Label>
            <AssetDropdown
              assets={assets}
              value={config?.assetId}
              onChange={setAssetId}
              filter="model"
              placeholder="No model selected"
              className="h-6 text-[10px]"
            />
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
      {!interiorOnly && mode === "procedural" && (
        <div className="space-y-1.5" data-testid={`procedural-config-${typeName}`}>
          {/* Reset all */}
          {hasAnyOverrides && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" className="h-5 text-[9px] px-1.5 text-muted-foreground" onClick={resetAllOverrides}>
                <RotateCcw className="w-2.5 h-2.5 mr-0.5" /> Reset All to Category
              </Button>
            </div>
          )}

          {/* ── Material & Architecture Quick Presets ── */}
          <ConfigSection title="Style Presets">
            <p className="text-[9px] text-muted-foreground -mt-0.5 mb-1">
              Changing a preset resets its related fields to defaults. Further edits below create a modified variant.
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <Label className="text-[10px]">Material</Label>
                <Select
                  value={getResolved('materialType') || 'wood'}
                  onValueChange={v => {
                    const applied = applyMaterialPreset(overrides || {}, v as MaterialType);
                    onUpdate({ ...config, mode: 'procedural', styleOverrides: applied });
                  }}
                >
                  <SelectTrigger className="h-6 text-[10px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MATERIAL_TYPES.map(m => {
                      const mp = MATERIAL_PRESETS[m];
                      return (
                        <SelectItem key={m} value={m}>
                          <span className="flex items-center gap-1.5">
                            <span
                              className="inline-block w-3 h-3 rounded-sm border"
                              style={{ backgroundColor: `rgb(${mp.baseColors[0].r * 255},${mp.baseColors[0].g * 255},${mp.baseColors[0].b * 255})` }}
                            />
                            {mp.label}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[10px]">Architecture</Label>
                <Select
                  value={getResolved('architectureStyle') || 'colonial'}
                  onValueChange={v => {
                    const applied = applyArchitecturePreset(overrides || {}, v as ArchitectureStyle);
                    onUpdate({ ...config, mode: 'procedural', styleOverrides: applied });
                  }}
                >
                  <SelectTrigger className="h-6 text-[10px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ARCH_STYLES.map(a => {
                      const ap = ARCHITECTURE_PRESETS[a];
                      return (
                        <SelectItem key={a} value={a}>
                          <span className="flex items-center gap-1.5">
                            <span className="text-muted-foreground text-[9px]">{ap.roofStyle}</span>
                            {ap.label}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </ConfigSection>

          {/* ── Roof ── */}
          <ConfigSection title="Roof">
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
            <ColorAndTexture
              label="Roof"
              colorField="roofColor"
              textureField="roofTextureId"
              getResolved={getResolved}
              overrides={overrides}
              categoryPreset={categoryPreset}
              assets={assets}
              setOverride={setOverride}
              resetField={resetField}
            />
          </ConfigSection>

          {/* ── Walls ── */}
          <ConfigSection title="Walls">
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
            <TextureRow label="Wall Texture" field="wallTextureId" getResolved={getResolved} overrides={overrides} assets={assets} setOverride={setOverride} resetField={resetField} />
          </ConfigSection>

          {/* ── Windows ── */}
          <ConfigSection title="Windows">
            <ColorAndTexture
              label="Window"
              colorField="windowColor"
              textureField="windowTextureId"
              getResolved={getResolved}
              overrides={overrides}
              categoryPreset={categoryPreset}
              assets={assets}
              setOverride={setOverride}
              resetField={resetField}
            />
            <FeatureToggle label="Shutters" field="hasShutters" getResolved={getResolved} overrides={overrides} setOverride={setOverride} resetField={resetField} />
            {getResolved('hasShutters') && (
              <>
                <div>
                  <Label className="text-[10px]">Shutter Color</Label>
                  <input
                    type="color"
                    value={colorToHex(getResolved('shutterColor') || getResolved('doorColor') || { r: 0.4, g: 0.3, b: 0.2 })}
                    onChange={e => setOverride({ shutterColor: hexToColor(e.target.value) })}
                    className="w-full h-6 rounded border cursor-pointer p-0"
                  />
                </div>
                <TextureRow label="Shutter Texture" field="shutterTextureId" getResolved={getResolved} overrides={overrides} assets={assets} setOverride={setOverride} resetField={resetField} />
              </>
            )}
          </ConfigSection>

          {/* ── Doors ── */}
          <ConfigSection title="Doors">
            <ColorAndTexture
              label="Door"
              colorField="doorColor"
              textureField="doorTextureId"
              getResolved={getResolved}
              overrides={overrides}
              categoryPreset={categoryPreset}
              assets={assets}
              setOverride={setOverride}
              resetField={resetField}
            />
          </ConfigSection>

          {/* ── Balcony & Porch ── */}
          <ConfigSection title="Balcony & Porch">
            <div className="space-y-1">
              <FeatureToggle label="Balcony" field="hasBalcony" getResolved={getResolved} overrides={overrides} setOverride={setOverride} resetField={resetField} />
              {getResolved('hasBalcony') && (
                <TextureRow label="Balcony Texture" field="balconyTextureId" getResolved={getResolved} overrides={overrides} assets={assets} setOverride={setOverride} resetField={resetField} />
              )}
              <FeatureToggle label="Ironwork Balcony" field="hasIronworkBalcony" getResolved={getResolved} overrides={overrides} setOverride={setOverride} resetField={resetField} />
              {getResolved('hasIronworkBalcony') && (
                <TextureRow label="Ironwork Texture" field="ironworkTextureId" getResolved={getResolved} overrides={overrides} assets={assets} setOverride={setOverride} resetField={resetField} />
              )}
              <FeatureToggle label="Front Porch" field="hasPorch" getResolved={getResolved} overrides={overrides} setOverride={setOverride} resetField={resetField} />
              {getResolved('hasPorch') && (
                <>
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
                  <TextureRow label="Porch Texture" field="porchTextureId" getResolved={getResolved} overrides={overrides} assets={assets} setOverride={setOverride} resetField={resetField} />
                </>
              )}
            </div>
          </ConfigSection>

          {/* ── Dimensions ── */}
          <ConfigSection title="Dimensions">
            <div className="grid grid-cols-3 gap-1">
              {([
                ['Floors', 'floors', undefined],
                ['Width', 'width', MAX_LOT_WIDTH],
                ['Depth', 'depth', MAX_LOT_DEPTH],
              ] as const).map(([label, field, maxVal]) => {
                const typeDefaults = getBuildingDefaults(typeName);
                const defaultVal = typeDefaults[field as keyof typeof typeDefaults];
                return (
                  <div key={field}>
                    <Label className="text-[9px]">{label}{maxVal ? ` (max ${maxVal})` : ''}</Label>
                    <Input
                      type="number"
                      className="h-5 text-[10px]"
                      placeholder={String(defaultVal)}
                      max={maxVal}
                      value={(overrides as any)?.[field] ?? ''}
                      onChange={e => {
                        let val = e.target.value ? parseFloat(e.target.value) : undefined;
                        if (val !== undefined && maxVal && val > maxVal) val = maxVal;
                        setOverride({ [field]: val } as any);
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <p className="text-[8px] text-muted-foreground mt-1">
              Width/depth are clamped to lot size ({MAX_LOT_WIDTH}×{MAX_LOT_DEPTH}) to prevent street overflow.
            </p>
          </ConfigSection>
        </div>
      )}

      {/* Not configured yet */}
      {!interiorOnly && !mode && (
        <div className="text-muted-foreground text-[10px]">
          Not configured. Select a mode above to begin.
        </div>
      )}

      {/* Interior config section */}
      {!hideInterior && (config || interiorOnly) && (
        <div className="border rounded p-2 space-y-2 bg-muted/20">
          {!interiorOnly && (
            <div className="flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Interior</span>
              {config?.interiorConfig && (
                <Badge variant="secondary" className="text-[9px] h-3.5 ml-auto">
                  {config.interiorConfig.mode}
                </Badge>
              )}
            </div>
          )}
          <InteriorConfigEditor
            config={config?.interiorConfig}
            assets={assets}
            onChange={(interiorConfig) => onUpdate({ ...(config || { mode: 'procedural' as const }), interiorConfig })}
            onClear={() => {
              if (!config) return;
              const { interiorConfig: _, ...rest } = config;
              onUpdate(rest as UnifiedBuildingTypeConfig);
            }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

// ─── Inline Category Preset Editor ──────────────────────────────────────────

const TEXTURE_FIELDS = [
  { key: 'wallTextureId' as const, label: 'Wall Texture' },
  { key: 'roofTextureId' as const, label: 'Roof Texture' },
  { key: 'floorTextureId' as const, label: 'Floor Texture' },
  { key: 'doorTextureId' as const, label: 'Door Texture' },
  { key: 'windowTextureId' as const, label: 'Window Texture' },
] as const;

function makeDefaultPreset(category: string): ProceduralStylePreset {
  return {
    id: `cat_${category}_${Date.now()}`,
    name: `${CATEGORY_LABELS[category as BuildingCategory] ?? category} Style`,
    baseColors: [{ r: 0.8, g: 0.75, b: 0.65 }],
    roofColor: { r: 0.3, g: 0.25, b: 0.2 },
    windowColor: { r: 0.8, g: 0.85, b: 0.9 },
    doorColor: { r: 0.4, g: 0.3, b: 0.2 },
    materialType: 'wood',
    architectureStyle: 'colonial',
  };
}

function InlineCategoryPresetEditor({
  category,
  preset,
  assets,
  onUpdate,
  onAdd,
  onRemove,
}: {
  category: string;
  preset: ProceduralStylePreset | undefined;
  assets: VisualAsset[];
  onUpdate: (partial: Partial<ProceduralStylePreset>) => void;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const [showPresetDetails, setShowPresetDetails] = useState(false);

  if (!preset) {
    return (
      <div className="flex items-center justify-between px-2 py-1 bg-muted/30 rounded text-[10px]">
        <span className="text-muted-foreground flex items-center gap-1">
          <Palette className="w-3 h-3" /> No category style preset
        </span>
        <Button variant="ghost" size="sm" className="h-5 text-[10px] px-1.5" onClick={onAdd}>
          <Plus className="w-3 h-3 mr-0.5" /> Add Preset
        </Button>
      </div>
    );
  }

  return (
    <div className="border rounded bg-muted/20 px-2 py-1.5 space-y-1.5">
      <button
        className="flex items-center justify-between w-full text-[10px]"
        onClick={() => setShowPresetDetails(!showPresetDetails)}
      >
        <div className="flex items-center gap-1.5">
          <Palette className="w-3 h-3 text-muted-foreground" />
          <span className="font-medium">Category Preset: {preset.name}</span>
        </div>
        <div className="flex items-center gap-1">
          {preset.baseColors.slice(0, 4).map((c, i) => (
            <div key={i} className="w-3 h-3 rounded-sm border" style={{ backgroundColor: colorToHex(c) }} />
          ))}
          <ChevronRight className={`w-3 h-3 text-muted-foreground transition-transform ${showPresetDetails ? 'rotate-90' : ''}`} />
        </div>
      </button>

      {showPresetDetails && (
        <div className="space-y-2 pt-1 border-t">
          <div>
            <Label className="text-[10px]">Name</Label>
            <Input className="h-6 text-xs" value={preset.name} onChange={e => onUpdate({ name: e.target.value })} />
          </div>

          <p className="text-[9px] text-muted-foreground">
            Changing a preset applies its defaults. Further edits create a modified variant.
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <Label className="text-[10px]">Material</Label>
              <Select value={preset.materialType} onValueChange={v => {
                const mp = MATERIAL_PRESETS[v as MaterialType];
                onUpdate({
                  materialType: mp.materialType,
                  baseColors: [...mp.baseColors],
                  roofColor: { ...mp.roofColor },
                  doorColor: { ...mp.doorColor },
                  windowColor: { ...mp.windowColor },
                  shutterColor: { ...mp.shutterColor },
                  wallTextureId: undefined,
                  roofTextureId: undefined,
                  doorTextureId: undefined,
                  windowTextureId: undefined,
                  shutterTextureId: undefined,
                });
              }}>
                <SelectTrigger className="h-6 text-[10px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MATERIAL_TYPES.map(m => {
                    const mp = MATERIAL_PRESETS[m];
                    return (
                      <SelectItem key={m} value={m}>
                        <span className="flex items-center gap-1.5">
                          <span className="inline-block w-3 h-3 rounded-sm border"
                            style={{ backgroundColor: `rgb(${mp.baseColors[0].r * 255},${mp.baseColors[0].g * 255},${mp.baseColors[0].b * 255})` }} />
                          {mp.label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px]">Architecture</Label>
              <Select value={preset.architectureStyle} onValueChange={v => {
                const ap = ARCHITECTURE_PRESETS[v as ArchitectureStyle];
                onUpdate({
                  architectureStyle: ap.architectureStyle,
                  roofStyle: ap.roofStyle,
                  hasBalcony: ap.hasBalcony,
                  hasIronworkBalcony: ap.hasIronworkBalcony,
                  hasPorch: ap.hasPorch,
                  hasShutters: ap.hasShutters,
                  porchDepth: ap.porchDepth,
                  porchSteps: ap.porchSteps,
                  balconyTextureId: undefined,
                  ironworkTextureId: undefined,
                  porchTextureId: undefined,
                });
              }}>
                <SelectTrigger className="h-6 text-[10px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ARCH_STYLES.map(a => {
                    const ap = ARCHITECTURE_PRESETS[a];
                    return (
                      <SelectItem key={a} value={a}>
                        <span className="flex items-center gap-1.5">
                          <span className="text-muted-foreground text-[9px]">{ap.roofStyle}</span>
                          {ap.label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-[10px]">Roof Style</Label>
            <Select value={preset.roofStyle || 'default'} onValueChange={v => onUpdate({ roofStyle: v === 'default' ? undefined : v as RoofStyle })}>
              <SelectTrigger className="h-6 text-[10px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default (from architecture)</SelectItem>
                {ROOF_STYLES.map(r => <SelectItem key={r} value={r}>{r.replace(/_/g, ' ')}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Wall Colors */}
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-[10px]">Wall Colors</Label>
              <Button variant="ghost" size="sm" className="h-4 text-[9px] px-1" onClick={() => {
                onUpdate({ baseColors: [...preset.baseColors, { r: 0.7, g: 0.7, b: 0.7 }] });
              }}><Plus className="w-2.5 h-2.5" /></Button>
            </div>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {preset.baseColors.map((c, i) => (
                <div key={i} className="relative group">
                  <input type="color" value={colorToHex(c)}
                    onChange={e => {
                      const colors = [...preset.baseColors];
                      colors[i] = hexToColor(e.target.value);
                      onUpdate({ baseColors: colors });
                    }}
                    className="w-6 h-6 rounded border cursor-pointer p-0" />
                  {preset.baseColors.length > 1 && (
                    <button className="absolute -top-1 -right-1 w-3 h-3 bg-destructive text-white rounded-full text-[8px] leading-none hidden group-hover:flex items-center justify-center"
                      onClick={() => onUpdate({ baseColors: preset.baseColors.filter((_, j) => j !== i) })}>&times;</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Accent Colors */}
          <div className="grid grid-cols-3 gap-1.5">
            {([['Roof', 'roofColor'], ['Window', 'windowColor'], ['Door', 'doorColor']] as const).map(([label, field]) => (
              <div key={field}>
                <Label className="text-[10px]">{label}</Label>
                <input type="color" value={colorToHex((preset as any)[field])}
                  onChange={e => onUpdate({ [field]: hexToColor(e.target.value) })}
                  className="w-full h-6 rounded border cursor-pointer p-0" />
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-muted-foreground">Features</p>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
              {([['Balcony', 'hasBalcony'], ['Ironwork', 'hasIronworkBalcony'], ['Porch', 'hasPorch'], ['Shutters', 'hasShutters']] as const).map(([label, field]) => (
                <label key={field} className="flex items-center gap-1 text-[10px] cursor-pointer">
                  <input type="checkbox" checked={!!(preset as any)[field]}
                    onChange={e => onUpdate({ [field]: e.target.checked || undefined })} className="w-3 h-3" />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* Textures */}
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-muted-foreground">Textures</p>
            {TEXTURE_FIELDS.map(({ key, label }) => (
              <div key={key} className="space-y-0.5">
                <Label className="text-[10px]">{label}</Label>
                <AssetSelect
                  value={(preset as any)[key]}
                  placeholder={`Select ${label.toLowerCase()}...`}
                  className="h-6 text-[10px]"
                  onSelect={(asset) => onUpdate({ [key]: asset.id })}
                  onClear={() => onUpdate({ [key]: undefined })}
                />
              </div>
            ))}
          </div>

          <Button variant="destructive" size="sm" className="w-full h-6 text-[10px]" onClick={onRemove}>
            <Trash2 className="w-3 h-3 mr-1" /> Remove Preset
          </Button>
        </div>
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
  selection,
  onSelect,
}: BuildingConfigurationPanelProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const configs = useMemo<Record<string, UnifiedBuildingTypeConfig>>(
    () => (collection as any).worldTypeConfig?.buildingConfig?.buildingTypeConfigs
      || (collection as any).buildingTypeConfigs || {},
    [(collection as any).worldTypeConfig, (collection as any).buildingTypeConfigs],
  );

  const presets = useMemo<Record<string, ProceduralStylePreset>>(
    () => (collection as any).worldTypeConfig?.buildingConfig?.categoryPresets
      || (collection as any).categoryPresets || {},
    [(collection as any).worldTypeConfig, (collection as any).categoryPresets],
  );

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const isTypeSelected = (typeName: string) =>
    selection?.module === 'building' && selection.typeName === typeName;

  const isPresetSelected = (category: string) =>
    selection?.module === 'building-preset' && selection.category === category;

  const handleTypeUpdate = useCallback(
    (typeName: string, typeConfig: UnifiedBuildingTypeConfig) => {
      onUpdateConfig({ ...configs, [typeName]: typeConfig });
    },
    [configs, onUpdateConfig],
  );

  const handlePresetUpdate = useCallback(
    (category: string, partial: Partial<ProceduralStylePreset>) => {
      if (!onUpdateCategoryPresets) return;
      onUpdateCategoryPresets({
        ...presets,
        [category]: { ...presets[category], ...partial },
      });
    },
    [presets, onUpdateCategoryPresets],
  );

  const handlePresetAdd = useCallback(
    (category: string) => {
      if (!onUpdateCategoryPresets) return;
      onUpdateCategoryPresets({
        ...presets,
        [category]: makeDefaultPreset(category),
      });
    },
    [presets, onUpdateCategoryPresets],
  );

  const handlePresetRemove = useCallback(
    (category: string) => {
      if (!onUpdateCategoryPresets) return;
      const next = { ...presets };
      delete next[category];
      onUpdateCategoryPresets(next);
    },
    [presets, onUpdateCategoryPresets],
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

            {/* Expanded category — preset editor + building types */}
            {isExpanded && (
              <div className="border-t px-1.5 pb-1.5 pt-1 space-y-1.5">
                {/* Inline category preset editor */}
                <InlineCategoryPresetEditor
                  category={category}
                  preset={preset}
                  assets={assets}
                  onUpdate={(partial) => handlePresetUpdate(category, partial)}
                  onAdd={() => handlePresetAdd(category)}
                  onRemove={() => handlePresetRemove(category)}
                />

                {/* Building types list */}
                <div className="space-y-0.5">
                  {types.map(typeName => {
                    const cfg = configs[typeName];
                    const selected = isTypeSelected(typeName);
                    const presetColor = preset?.baseColors?.[0];
                    const overrideColor = cfg?.styleOverrides?.baseColors?.[0];
                    const displayColor = overrideColor || presetColor;

                    return (
                      <button
                        key={typeName}
                        className={`flex items-center gap-2 w-full text-xs px-1.5 py-1 rounded transition-colors ${
                          selected ? 'bg-primary/15 text-primary font-medium' : 'hover:bg-muted/40'
                        }`}
                        onClick={() => onSelect?.({
                          module: 'building',
                          typeName,
                          category,
                          config: cfg,
                          categoryPreset: preset,
                        })}
                        data-testid={`type-row-${typeName}`}
                      >
                        <span
                          className="inline-block w-3 h-3 rounded-sm border border-border shrink-0"
                          style={{ backgroundColor: color3ToCss(displayColor) }}
                        />
                        <span className="flex-1 text-left truncate">{humanize(typeName)}</span>
                        {cfg?.interiorConfig && (
                          <Home className="w-3 h-3 text-muted-foreground shrink-0" />
                        )}
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
                        <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}

    </div>
  );
}
