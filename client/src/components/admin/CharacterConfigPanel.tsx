import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, Plus, Trash2, RotateCcw } from "lucide-react";
import { ConfigPreviewScene } from "./ConfigPreviewScene";
import type { CharacterConfig, CharacterModelConfig } from "@shared/game-engine/types";
import type { ConfigSelection } from "./config-selection";

interface CharacterConfigPanelProps {
  config: CharacterConfig | undefined;
  onUpdate: (config: CharacterConfig) => void;
  selection?: ConfigSelection;
  onSelect?: (selection: ConfigSelection) => void;
}

const DEFAULT_PLAYER_ROLES = ["default", "male", "female"];
const DEFAULT_NPC_ROLES = ["civilian_male", "civilian_female", "guard", "merchant", "noble"];
const DEFAULT_HAIR_STYLES = {
  male: ["short", "medium", "long", "bald", "mohawk"],
  female: ["long", "medium", "short", "ponytail", "braids", "bun"],
};
const DEFAULT_CLOTHING_PALETTE = [
  "#8B4513", "#2F4F4F", "#8B0000", "#191970", "#556B2F",
  "#4B0082", "#CD853F", "#A0522D", "#DAA520", "#708090",
];
const DEFAULT_SKIN_TONES = [
  "#FFDFC4", "#F0C8A0", "#D4A574", "#C68642", "#8D5524",
  "#6B3A2A", "#4A2511", "#3B1F0E",
];

function defaultCharacterModelConfig(): CharacterModelConfig {
  return { mode: "asset" };
}

export function CharacterConfigPanel({ config, onUpdate, selection, onSelect }: CharacterConfigPanelProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [newBodyModel, setNewBodyModel] = useState("");
  const [newHairStyle, setNewHairStyle] = useState("");
  const [newHairGender, setNewHairGender] = useState<"male" | "female">("male");

  const cfg = config || {};

  const updateField = useCallback(<K extends keyof CharacterConfig>(key: K, value: CharacterConfig[K]) => {
    onUpdate({ ...cfg, [key]: value });
  }, [cfg, onUpdate]);

  const updatePlayerModel = useCallback((role: string, update: Partial<CharacterModelConfig>) => {
    const existing = cfg.playerModels?.[role] || defaultCharacterModelConfig();
    const updated = { ...existing, ...update };
    updateField("playerModels", { ...(cfg.playerModels || {}), [role]: updated });
  }, [cfg, updateField]);

  const updateCharacterModel = useCallback((role: string, update: Partial<CharacterModelConfig>) => {
    const existing = cfg.characterModels?.[role] || defaultCharacterModelConfig();
    const updated = { ...existing, ...update };
    updateField("characterModels", { ...(cfg.characterModels || {}), [role]: updated });
  }, [cfg, updateField]);

  type SectionDef = { id: string; label: string; count: number };
  const sections: SectionDef[] = [
    { id: "player", label: "Player Models", count: Object.keys(cfg.playerModels || {}).length },
    { id: "npc", label: "NPC Models", count: Object.keys(cfg.characterModels || {}).length },
    { id: "appearance", label: "NPC Appearance", count: (cfg.npcBodyModels?.length || 0) + Object.values(cfg.npcHairStyles || {}).flat().length },
    { id: "palettes", label: "Color Palettes", count: (cfg.npcClothingPalette?.length || 0) + (cfg.npcSkinTonePalette?.length || 0) },
  ];

  return (
    <div className="space-y-2">
      <p className="text-[10px] text-muted-foreground">
        Configure player character and NPC models, body types, hair styles, and color palettes.
      </p>

      {sections.map((section) => {
        const isExpanded = expandedSection === section.id;
        return (
          <div key={section.id} className="border rounded">
            <button
              className="flex items-center justify-between w-full text-xs px-2 py-1.5 hover:bg-muted/50 rounded cursor-pointer transition-colors"
              onClick={() => setExpandedSection(isExpanded ? null : section.id)}
            >
              <div className="flex items-center gap-1.5">
                <ChevronRight className={`w-3 h-3 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                <span className="font-medium">{section.label}</span>
              </div>
              <Badge variant={section.count > 0 ? "secondary" : "outline"} className="text-[9px] h-4">
                {section.count}
              </Badge>
            </button>

            {isExpanded && (
              <div className="space-y-2 px-2 pb-2 border-t pt-2">
                {/* Player Models */}
                {section.id === "player" && (
                  <div className="space-y-0.5">
                    {DEFAULT_PLAYER_ROLES.map((role) => {
                      const modelCfg = cfg.playerModels?.[role];
                      const isSelected = selection?.module === 'character' && selection.section === 'player' && selection.role === role;
                      return (
                        <button
                          key={role}
                          className={`flex items-center justify-between w-full text-xs px-2 py-1 rounded transition-colors ${
                            isSelected ? 'bg-primary/15 text-primary font-medium' : 'hover:bg-muted/40'
                          }`}
                          onClick={() => onSelect?.({ module: 'character', section: 'player', role, config: modelCfg })}
                        >
                          <span className="capitalize">{role}</span>
                          <div className="flex items-center gap-1">
                            <Badge variant={modelCfg?.assetId ? "secondary" : "outline"} className="text-[9px] h-4">
                              {modelCfg?.assetId ? "asset" : "unset"}
                            </Badge>
                            <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* NPC Character Models */}
                {section.id === "npc" && (
                  <div className="space-y-0.5">
                    {DEFAULT_NPC_ROLES.map((role) => {
                      const modelCfg = cfg.characterModels?.[role];
                      const isSelected = selection?.module === 'character' && selection.section === 'npc' && selection.role === role;
                      return (
                        <button
                          key={role}
                          className={`flex items-center justify-between w-full text-xs px-2 py-1 rounded transition-colors ${
                            isSelected ? 'bg-primary/15 text-primary font-medium' : 'hover:bg-muted/40'
                          }`}
                          onClick={() => onSelect?.({ module: 'character', section: 'npc', role, config: modelCfg })}
                        >
                          <span>{role.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</span>
                          <div className="flex items-center gap-1">
                            <Badge variant={modelCfg?.assetId ? "secondary" : "outline"} className="text-[9px] h-4">
                              {modelCfg?.assetId ? "asset" : "unset"}
                            </Badge>
                            <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* NPC Appearance (body models + hair) */}
                {section.id === "appearance" && (
                  <>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px]">NPC Body Models</Label>
                        <Button
                          variant="ghost" size="sm" className="h-5 text-[10px] px-1.5"
                          onClick={() => updateField("npcBodyModels", [
                            "outfit_male_peasant", "outfit_female_peasant",
                            "outfit_male_merchant", "outfit_female_merchant",
                          ])}
                        >
                          <RotateCcw className="w-3 h-3 mr-0.5" /> Defaults
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(cfg.npcBodyModels || []).map((model, i) => (
                          <Badge key={i} variant="secondary" className="text-[9px] h-5 gap-0.5">
                            {model}
                            <button onClick={() => updateField("npcBodyModels", cfg.npcBodyModels!.filter((_, j) => j !== i))}>
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-1">
                        <Input className="h-5 text-[10px] flex-1" placeholder="Model ID..." value={newBodyModel} onChange={(e) => setNewBodyModel(e.target.value)} />
                        <Button variant="outline" size="sm" className="h-5 text-[10px] px-1.5" onClick={() => {
                          if (newBodyModel.trim()) {
                            updateField("npcBodyModels", [...(cfg.npcBodyModels || []), newBodyModel.trim()]);
                            setNewBodyModel("");
                          }
                        }}>
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Hair styles by gender */}
                    {(["male", "female"] as const).map((gender) => (
                      <div key={gender} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label className="text-[10px] capitalize">{gender} Hair Styles</Label>
                          <Button
                            variant="ghost" size="sm" className="h-5 text-[10px] px-1.5"
                            onClick={() => updateField("npcHairStyles", {
                              ...(cfg.npcHairStyles || {}),
                              [gender]: DEFAULT_HAIR_STYLES[gender],
                            })}
                          >
                            <RotateCcw className="w-3 h-3 mr-0.5" /> Defaults
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {(cfg.npcHairStyles?.[gender] || []).map((style, i) => (
                            <Badge key={i} variant="outline" className="text-[9px] h-5 gap-0.5">
                              {style}
                              <button onClick={() => {
                                const updated = { ...(cfg.npcHairStyles || {}) };
                                updated[gender] = (updated[gender] || []).filter((_, j) => j !== i);
                                updateField("npcHairStyles", updated);
                              }}>
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-1">
                          <Input className="h-5 text-[10px] flex-1" placeholder="Hair style..." value={newHairGender === gender ? newHairStyle : ""} onChange={(e) => { setNewHairStyle(e.target.value); setNewHairGender(gender); }} />
                          <Button variant="outline" size="sm" className="h-5 text-[10px] px-1.5" onClick={() => {
                            if (newHairStyle.trim() && newHairGender === gender) {
                              const updated = { ...(cfg.npcHairStyles || {}) };
                              updated[gender] = [...(updated[gender] || []), newHairStyle.trim()];
                              updateField("npcHairStyles", updated);
                              setNewHairStyle("");
                            }
                          }}>
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* Color Palettes */}
                {section.id === "palettes" && (
                  <>
                    <PaletteEditor
                      label="Clothing Palette"
                      colors={cfg.npcClothingPalette || []}
                      defaults={DEFAULT_CLOTHING_PALETTE}
                      onChange={(colors) => updateField("npcClothingPalette", colors)}
                    />
                    <PaletteEditor
                      label="Skin Tone Palette"
                      colors={cfg.npcSkinTonePalette || []}
                      defaults={DEFAULT_SKIN_TONES}
                      onChange={(colors) => updateField("npcSkinTonePalette", colors)}
                    />
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

    </div>
  );
}

// ─── Palette Editor ─────────────────────────────────────────────────────────

function PaletteEditor({
  label,
  colors,
  defaults,
  onChange,
}: {
  label: string;
  colors: string[];
  defaults: string[];
  onChange: (colors: string[]) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label className="text-[10px]">{label}</Label>
        <Button variant="ghost" size="sm" className="h-5 text-[10px] px-1.5" onClick={() => onChange(defaults)}>
          <RotateCcw className="w-3 h-3 mr-0.5" /> Defaults
        </Button>
      </div>
      <div className="flex flex-wrap gap-1">
        {colors.map((color, i) => (
          <div key={i} className="relative group">
            <input
              type="color"
              className="w-5 h-5 rounded cursor-pointer border"
              value={color}
              onChange={(e) => {
                const updated = [...colors];
                updated[i] = e.target.value;
                onChange(updated);
              }}
            />
            <button
              className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full hidden group-hover:flex items-center justify-center"
              onClick={() => onChange(colors.filter((_, j) => j !== i))}
            >
              <Trash2 className="w-2 h-2 text-white" />
            </button>
          </div>
        ))}
        <button
          className="w-5 h-5 rounded border-2 border-dashed border-muted-foreground/30 flex items-center justify-center hover:border-muted-foreground/60 transition-colors"
          onClick={() => onChange([...colors, "#808080"])}
        >
          <Plus className="w-3 h-3 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
