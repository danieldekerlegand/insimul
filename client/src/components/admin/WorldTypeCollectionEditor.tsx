import { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2, Map, Users, TreePine, Package } from "lucide-react";
import { BuildingConfigurationPanel } from "./BuildingConfigurationPanel";
import { GroundConfigPanel } from "./GroundConfigPanel";
import { CharacterConfigPanel } from "./CharacterConfigPanel";
import { NatureConfigPanel } from "./NatureConfigPanel";
import { ItemConfigPanel } from "./ItemConfigPanel";
import type { AssetCollection, VisualAsset } from "@shared/schema";
import type { WorldTypeCollectionConfig } from "@shared/game-engine/types";
import type { ConfigSelection } from "./config-selection";

interface WorldTypeCollectionEditorProps {
  collection: AssetCollection;
  assets?: VisualAsset[];
  onPatch: (patch: Partial<AssetCollection>) => void;
  selection?: ConfigSelection;
  onSelect?: (selection: ConfigSelection) => void;
}

/**
 * Unified editor for World Type Collections.
 * Replaces the old 5-section right panel (Building Config, 3D Config,
 * Procedural Buildings, NPC Characters, Category Presets) with a single
 * tabbed interface containing 5 config modules.
 */
export function WorldTypeCollectionEditor({
  collection,
  assets = [],
  onPatch,
  selection,
  onSelect,
}: WorldTypeCollectionEditorProps) {
  const [activeTab, setActiveTab] = useState("buildings");

  // Read worldTypeConfig or fall back to legacy fields
  const wtc: WorldTypeCollectionConfig = (collection as any).worldTypeConfig || {};

  const updateWorldTypeConfig = useCallback((update: Partial<WorldTypeCollectionConfig>) => {
    const merged = { ...wtc, ...update };
    onPatch({ worldTypeConfig: merged } as any);
  }, [wtc, onPatch]);

  return (
    <div className="flex flex-col h-full min-h-0">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full min-h-0">
        <TabsList className="grid grid-cols-5 h-8 shrink-0 mx-1 mt-1">
          <TabsTrigger value="buildings" className="text-[10px] px-1 gap-0.5">
            <Building2 className="w-3 h-3" />
            <span className="hidden xl:inline">Buildings</span>
          </TabsTrigger>
          <TabsTrigger value="ground" className="text-[10px] px-1 gap-0.5">
            <Map className="w-3 h-3" />
            <span className="hidden xl:inline">Ground</span>
          </TabsTrigger>
          <TabsTrigger value="characters" className="text-[10px] px-1 gap-0.5">
            <Users className="w-3 h-3" />
            <span className="hidden xl:inline">Chars</span>
          </TabsTrigger>
          <TabsTrigger value="nature" className="text-[10px] px-1 gap-0.5">
            <TreePine className="w-3 h-3" />
            <span className="hidden xl:inline">Nature</span>
          </TabsTrigger>
          <TabsTrigger value="items" className="text-[10px] px-1 gap-0.5">
            <Package className="w-3 h-3" />
            <span className="hidden xl:inline">Items</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="px-3 pb-3 pt-2">
              <TabsContent value="buildings" className="mt-0">
                <BuildingConfigurationPanel
                  collection={collection}
                  assets={assets}
                  selection={selection}
                  onSelect={onSelect}
                  onUpdateConfig={(buildingTypeConfigs) => {
                    updateWorldTypeConfig({
                      buildingConfig: {
                        ...wtc.buildingConfig,
                        buildingTypeConfigs,
                      },
                    });
                    onPatch({ buildingTypeConfigs } as any);
                  }}
                  onUpdateCategoryPresets={(categoryPresets) => {
                    updateWorldTypeConfig({
                      buildingConfig: {
                        ...wtc.buildingConfig,
                        categoryPresets,
                      },
                    });
                    onPatch({ categoryPresets } as any);
                  }}
                />
              </TabsContent>

              <TabsContent value="ground" className="mt-0">
                <GroundConfigPanel
                  config={wtc.groundConfig}
                  onUpdate={(groundConfig) => updateWorldTypeConfig({ groundConfig })}
                  selection={selection}
                  onSelect={onSelect}
                  assets={assets}
                />
              </TabsContent>

              <TabsContent value="characters" className="mt-0">
                <CharacterConfigPanel
                  config={wtc.characterConfig}
                  onUpdate={(characterConfig) => updateWorldTypeConfig({ characterConfig })}
                  selection={selection}
                  onSelect={onSelect}
                />
              </TabsContent>

              <TabsContent value="nature" className="mt-0">
                <NatureConfigPanel
                  config={wtc.natureConfig}
                  onUpdate={(natureConfig) => updateWorldTypeConfig({ natureConfig })}
                  selection={selection}
                  onSelect={onSelect}
                />
              </TabsContent>

              <TabsContent value="items" className="mt-0">
                <ItemConfigPanel
                  config={wtc.itemConfig}
                  onUpdate={(itemConfig) => updateWorldTypeConfig({ itemConfig })}
                  selection={selection}
                  onSelect={onSelect}
                />
              </TabsContent>
            </div>
          </ScrollArea>
        </div>
      </Tabs>
    </div>
  );
}
