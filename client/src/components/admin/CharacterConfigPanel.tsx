import { useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { NPCDesignerPanel } from "./NPCDesignerPanel";
import type { CharacterConfig, CharacterModelConfig } from "@shared/game-engine/types";
import type { ConfigSelection } from "./config-selection";

interface CharacterConfigPanelProps {
  config: CharacterConfig | undefined;
  onUpdate: (config: CharacterConfig) => void;
  selection?: ConfigSelection;
  onSelect?: (selection: ConfigSelection) => void;
}

const DEFAULT_PLAYER_ROLES = ["default", "male", "female"];
const DEFAULT_NPC_ROLES = [
  "civilian_male", "civilian_female",
  "guard", "soldier",
  "merchant", "farmer", "blacksmith", "innkeeper",
  "priest", "teacher", "doctor",
  "noble", "elder", "child",
  "beggar", "sailor",
];

function defaultCharacterModelConfig(): CharacterModelConfig {
  return { mode: "asset" };
}

export function CharacterConfigPanel({ config, onUpdate, selection, onSelect }: CharacterConfigPanelProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

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
    { id: "designer", label: "NPC Designer", count: Object.keys(cfg.npcPresets || {}).length + (cfg.npcClothingPalette?.length || 0) + (cfg.npcSkinTonePalette?.length || 0) },
    { id: "player", label: "Player Models", count: Object.keys(cfg.playerModels || {}).length },
    { id: "npc", label: "NPC Model Overrides", count: Object.keys(cfg.characterModels || {}).length },
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
                {/* NPC Designer */}
                {section.id === "designer" && (
                  <NPCDesignerPanel config={cfg} onUpdate={onUpdate} />
                )}

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

              </div>
            )}
          </div>
        );
      })}

    </div>
  );
}

