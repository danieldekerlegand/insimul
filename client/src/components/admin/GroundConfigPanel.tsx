import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, Trash2 } from "lucide-react";
import { ConfigPreviewScene } from "./ConfigPreviewScene";
import type { GroundConfig, GroundTypeConfig, Color3 as EngineColor3 } from "@shared/game-engine/types";
import { colorToHex, hexToColor } from "./BuildingConfigurationPanel";
import type { ConfigSelection } from "./config-selection";

interface GroundConfigPanelProps {
  config: GroundConfig | undefined;
  onUpdate: (config: GroundConfig) => void;
  selection?: ConfigSelection;
  onSelect?: (selection: ConfigSelection) => void;
}

const GROUND_TYPES = [
  { key: "ground", label: "Ground / Terrain" },
  { key: "road", label: "Road" },
  { key: "sidewalk", label: "Sidewalk" },
] as const;

type GroundTypeKey = typeof GROUND_TYPES[number]["key"];

function defaultGroundTypeConfig(): GroundTypeConfig {
  return { mode: "procedural", color: { r: 0.35, g: 0.55, b: 0.3 }, tiling: 4 };
}

export function GroundConfigPanel({ config, onUpdate, selection, onSelect }: GroundConfigPanelProps) {
  const [customTypes, setCustomTypes] = useState<string[]>(
    config?.custom ? Object.keys(config.custom) : []
  );
  const [newCustomName, setNewCustomName] = useState("");

  const cfg = config || {};

  const getTypeConfig = useCallback((key: string): GroundTypeConfig | undefined => {
    if (key === "ground" || key === "road" || key === "sidewalk") {
      return cfg[key];
    }
    return cfg.custom?.[key];
  }, [cfg]);

  const updateTypeConfig = useCallback((key: string, update: Partial<GroundTypeConfig>) => {
    const existing = getTypeConfig(key) || defaultGroundTypeConfig();
    const updated = { ...existing, ...update };

    const newConfig = { ...cfg };
    if (key === "ground" || key === "road" || key === "sidewalk") {
      newConfig[key] = updated;
    } else {
      newConfig.custom = { ...(newConfig.custom || {}), [key]: updated };
    }
    onUpdate(newConfig);
  }, [cfg, getTypeConfig, onUpdate]);

  const removeCustomType = useCallback((key: string) => {
    const newConfig = { ...cfg };
    if (newConfig.custom) {
      const { [key]: _, ...rest } = newConfig.custom;
      newConfig.custom = rest;
    }
    setCustomTypes(prev => prev.filter(k => k !== key));
    onUpdate(newConfig);
  }, [cfg, onUpdate]);

  const addCustomType = useCallback(() => {
    if (!newCustomName.trim()) return;
    const key = newCustomName.trim().toLowerCase().replace(/\s+/g, "_");
    setCustomTypes(prev => [...prev, key]);
    updateTypeConfig(key, defaultGroundTypeConfig());
    setNewCustomName("");
  }, [newCustomName, updateTypeConfig]);

  const allTypes = [
    ...GROUND_TYPES.map(t => ({ key: t.key, label: t.label, isCustom: false })),
    ...customTypes.map(key => ({ key, label: key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()), isCustom: true })),
  ];

  return (
    <div className="space-y-2">
      <p className="text-[10px] text-muted-foreground">
        Configure textures or procedural colors for ground, roads, and sidewalks.
      </p>

      {allTypes.map(({ key, label, isCustom }) => {
        const typeCfg = getTypeConfig(key);
        const mode = typeCfg?.mode || "procedural";
        const isSelected = selection?.module === 'ground' && selection.groundType === key;

        return (
          <div key={key} className="border rounded">
            <button
              className={`flex items-center justify-between w-full text-xs px-2 py-1.5 rounded cursor-pointer transition-colors ${
                isSelected ? 'bg-primary/15 text-primary font-medium' : 'hover:bg-muted/50'
              }`}
              onClick={() => onSelect?.({ module: 'ground', groundType: key, config: typeCfg })}
            >
              <div className="flex items-center gap-1.5">
                {typeCfg?.color && (
                  <span className="inline-block w-3 h-3 rounded-sm border" style={{ backgroundColor: colorToHex(typeCfg.color) }} />
                )}
                <span className="font-medium">{label}</span>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant={typeCfg ? "secondary" : "outline"} className="text-[9px] h-4">
                  {typeCfg ? mode : "unset"}
                </Badge>
                {isCustom && (
                  <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={(e) => { e.stopPropagation(); removeCustomType(key); }}>
                    <Trash2 className="w-2.5 h-2.5 text-destructive" />
                  </Button>
                )}
                <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
              </div>
            </button>
          </div>
        );
      })}

      {/* Add custom ground type */}
      <div className="flex gap-1">
        <Input
          className="h-6 text-[10px] flex-1"
          placeholder="Custom ground type..."
          value={newCustomName}
          onChange={(e) => setNewCustomName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCustomType()}
        />
        <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" onClick={addCustomType}>
          Add
        </Button>
      </div>

    </div>
  );
}
