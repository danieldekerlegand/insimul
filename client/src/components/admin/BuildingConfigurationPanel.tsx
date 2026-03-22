import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { BUILDING_CATEGORY_GROUPINGS, type BuildingCategory } from "@shared/game-engine/building-categories";
import type { AssetCollection } from "@shared/schema";
import type { UnifiedBuildingTypeConfig, ProceduralStylePreset, Color3 as EngineColor3 } from "@shared/game-engine/types";

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

// ─── Types ────────────────────────────────────────────────────────────────────

interface BuildingConfigurationPanelProps {
  collection: AssetCollection;
  onUpdateConfig: (buildingTypeConfigs: Record<string, UnifiedBuildingTypeConfig>) => void;
  onUpdateCategoryPresets: (categoryPresets: Record<string, ProceduralStylePreset>) => void;
}

// ─── Category summary ─────────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

export function BuildingConfigurationPanel({
  collection,
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
                        {/* Color swatch */}
                        <span
                          className="inline-block w-3 h-3 rounded-sm border border-border shrink-0"
                          style={{ backgroundColor: color3ToCss(displayColor) }}
                        />
                        {/* Type name */}
                        <span className="flex-1 text-left truncate">{humanize(typeName)}</span>
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

                          {/* Interior config summary */}
                          {cfg?.interiorConfig && (
                            <div className="text-muted-foreground">
                              Interior: {cfg.interiorConfig.mode === "model" ? "3D Model" : "Procedural"}{" "}
                              {cfg.interiorConfig.layoutTemplateId && `(${cfg.interiorConfig.layoutTemplateId})`}
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
