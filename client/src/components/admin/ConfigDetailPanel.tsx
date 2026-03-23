/**
 * Right-panel detail editor for the currently selected config item.
 * Shows a fixed 3D preview at the top and scrollable editing options below.
 */
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Box } from "lucide-react";
import { ConfigPreviewScene } from "./ConfigPreviewScene";
import { GroundTexturePreview } from "./GroundTexturePreview";
import { BuildingModelPreview } from "../locations/BuildingModelPreview";
import { BuildingTypeDetailPanel } from "./BuildingConfigurationPanel";
import { colorToHex, hexToColor, humanize } from "./BuildingConfigurationPanel";
import { AssetSelect } from "../AssetSelect";
import { useState, useCallback } from "react";
import type { ConfigSelection } from "./config-selection";
import type { VisualAsset } from "@shared/schema";
import type {
  UnifiedBuildingTypeConfig,
  GroundTypeConfig,
  CharacterModelConfig,
  NatureTypeConfig,
  ItemTypeConfig,
} from "@shared/game-engine/types";
import { resolveAssetPath as resolveQuaterniusPath } from "@shared/game-engine/npc-designer-utils";

/** Resolve an asset ID to its file path from the assets list */
function resolveAssetPath(assets: VisualAsset[], assetId?: string): string | undefined {
  if (!assetId) return undefined;
  return assets.find(a => a.id === assetId)?.filePath;
}

/** Resolve an asset ID to its display name, falling back to truncated ID */
function resolveAssetName(assets: VisualAsset[], assetId?: string): string | undefined {
  if (!assetId) return undefined;
  return assets.find(a => a.id === assetId)?.name || `${assetId.slice(0, 12)}...`;
}

// ─── Building Detail Editor with Exterior/Interior tabs ─────────────────────

function BuildingDetailEditor({
  selection,
  assets,
  onUpdate,
}: {
  selection: Extract<ConfigSelection, { module: 'building' }>;
  assets: VisualAsset[];
  onUpdate: (config: UnifiedBuildingTypeConfig) => void;
}) {
  const [activeTab, setActiveTab] = useState<'exterior' | 'interior'>('exterior');

  // Resolve the style preset for the preview
  const preset = selection.categoryPreset;
  const overrides = selection.config?.styleOverrides;
  const wallColor = overrides?.baseColors?.[0] || preset?.baseColors?.[0];
  const roofColor = overrides?.roofColor || preset?.roofColor;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="shrink-0 px-3 pt-3 pb-1">
        <p className="text-xs font-semibold">{humanize(selection.typeName)}</p>
        <p className="text-[10px] text-muted-foreground">{selection.category.replace(/_/g, ' ')}</p>
      </div>

      {/* Exterior / Interior tab toggle */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'exterior' | 'interior')} className="flex flex-col flex-1 min-h-0">
        <TabsList className="grid grid-cols-2 h-7 mx-3 shrink-0">
          <TabsTrigger value="exterior" className="text-[10px]">Exterior</TabsTrigger>
          <TabsTrigger value="interior" className="text-[10px]">Interior</TabsTrigger>
        </TabsList>

        {/* Fixed 3D Preview */}
        <div className="shrink-0 px-3 py-2">
          <div className="rounded-lg border overflow-hidden" style={{ height: 180 }}>
            <BuildingModelPreview
              key={`${selection.typeName}-${activeTab}-${JSON.stringify(overrides || {})}-${JSON.stringify(selection.config?.interiorConfig || {})}`}
              hideTabs
              initialViewMode={activeTab}
              tintColor={wallColor}
              buildingType={selection.typeName}
              businessType={selection.typeName}
              interiorConfig={selection.config?.interiorConfig}
              interiorAssets={assets}
              proceduralConfig={preset ? {
                stylePresets: [{
                  id: preset.id || 'preview',
                  name: preset.name || 'preview',
                  baseColors: overrides?.baseColors || preset.baseColors || [{ r: 0.7, g: 0.65, b: 0.55 }],
                  roofColor: overrides?.roofColor || preset.roofColor || { r: 0.3, g: 0.25, b: 0.2 },
                  windowColor: overrides?.windowColor || preset.windowColor || { r: 0.7, g: 0.75, b: 0.8 },
                  doorColor: overrides?.doorColor || preset.doorColor || { r: 0.4, g: 0.3, b: 0.2 },
                  materialType: overrides?.materialType || preset.materialType || 'wood',
                  architectureStyle: overrides?.architectureStyle || preset.architectureStyle || 'colonial',
                  roofStyle: overrides?.roofStyle || preset.roofStyle,
                  hasBalcony: overrides?.hasBalcony ?? preset.hasBalcony,
                  hasIronworkBalcony: overrides?.hasIronworkBalcony ?? preset.hasIronworkBalcony,
                  hasPorch: overrides?.hasPorch ?? preset.hasPorch,
                  hasShutters: overrides?.hasShutters ?? preset.hasShutters,
                  porchDepth: overrides?.porchDepth ?? preset.porchDepth,
                  porchSteps: overrides?.porchSteps ?? preset.porchSteps,
                  shutterColor: overrides?.shutterColor ?? preset.shutterColor,
                  wallTextureId: overrides?.wallTextureId ?? preset.wallTextureId,
                  roofTextureId: overrides?.roofTextureId ?? preset.roofTextureId,
                  doorTextureId: overrides?.doorTextureId ?? preset.doorTextureId,
                  windowTextureId: overrides?.windowTextureId ?? preset.windowTextureId,
                }],
              } : {
                stylePresets: [{
                  id: 'default',
                  name: 'Default',
                  baseColors: [{ r: 0.7, g: 0.65, b: 0.55 }],
                  roofColor: { r: 0.3, g: 0.25, b: 0.2 },
                  windowColor: { r: 0.7, g: 0.75, b: 0.8 },
                  doorColor: { r: 0.4, g: 0.3, b: 0.2 },
                  materialType: 'wood',
                  architectureStyle: 'colonial',
                }],
              }}
              zone={selection.category.startsWith('residential') ? 'residential' : 'commercial'}
              className="h-full w-full"
            />
          </div>
        </div>

        {/* Scrollable editor content */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="px-3 pb-3">
              <TabsContent value="exterior" className="mt-0">
                <BuildingTypeDetailPanel
                  typeName={selection.typeName}
                  config={selection.config}
                  categoryPreset={selection.categoryPreset}
                  assets={assets}
                  onUpdate={onUpdate}
                  hideInterior
                />
              </TabsContent>

              <TabsContent value="interior" className="mt-0">
                <BuildingTypeDetailPanel
                  typeName={selection.typeName}
                  config={selection.config}
                  categoryPreset={selection.categoryPreset}
                  assets={assets}
                  onUpdate={onUpdate}
                  interiorOnly
                />
              </TabsContent>
            </div>
          </ScrollArea>
        </div>
      </Tabs>
    </div>
  );
}

// ─── Nature Preview Helper ──────────────────────────────────────────────────

function NaturePreview({
  modelPath,
  group,
  mode,
}: {
  modelPath?: string;
  group: string;
  mode: 'asset' | 'procedural';
}) {
  const buildProcedural = useCallback((scene: any, BABYLON: any) => {
    const mat = new BABYLON.StandardMaterial("natureMat", scene);
    mat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    if (group === 'trees') {
      const trunk = BABYLON.MeshBuilder.CreateCylinder("trunk", { height: 1.5, diameterTop: 0.15, diameterBottom: 0.25 }, scene);
      trunk.position.y = 0.75;
      const trunkMat = new BABYLON.StandardMaterial("trunkMat", scene);
      trunkMat.diffuseColor = new BABYLON.Color3(0.4, 0.26, 0.13);
      trunkMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
      trunk.material = trunkMat;
      const foliage = BABYLON.MeshBuilder.CreateSphere("foliage", { diameter: 1.5, segments: 8 }, scene);
      foliage.position.y = 2;
      foliage.scaling = new BABYLON.Vector3(1, 1.2, 1);
      mat.diffuseColor = new BABYLON.Color3(0.2, 0.55, 0.2);
      foliage.material = mat;
    } else if (group === 'vegetation') {
      mat.diffuseColor = new BABYLON.Color3(0.25, 0.6, 0.15);
      for (let i = 0; i < 5; i++) {
        const blade = BABYLON.MeshBuilder.CreateSphere(`bush${i}`, { diameter: 0.4, segments: 6 }, scene);
        blade.position.x = (Math.random() - 0.5) * 0.8;
        blade.position.z = (Math.random() - 0.5) * 0.8;
        blade.position.y = 0.15;
        blade.scaling = new BABYLON.Vector3(1, 0.7 + Math.random() * 0.6, 1);
        blade.material = mat;
      }
    } else if (group === 'water') {
      const water = BABYLON.MeshBuilder.CreateDisc("water", { radius: 1.2, tessellation: 32 }, scene);
      water.rotation.x = Math.PI / 2;
      water.position.y = 0.05;
      mat.diffuseColor = new BABYLON.Color3(0.2, 0.4, 0.7);
      mat.alpha = 0.8;
      water.material = mat;
      const rim = BABYLON.MeshBuilder.CreateTorus("rim", { diameter: 2.4, thickness: 0.15, tessellation: 32 }, scene);
      rim.position.y = 0.05;
      const rimMat = new BABYLON.StandardMaterial("rimMat", scene);
      rimMat.diffuseColor = new BABYLON.Color3(0.5, 0.45, 0.4);
      rimMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
      rim.material = rimMat;
    } else {
      const rock = BABYLON.MeshBuilder.CreateSphere("rock", { diameter: 1, segments: 6 }, scene);
      rock.position.y = 0.3;
      rock.scaling = new BABYLON.Vector3(1.2, 0.7, 1);
      mat.diffuseColor = new BABYLON.Color3(0.5, 0.48, 0.45);
      rock.material = mat;
      const pebble = BABYLON.MeshBuilder.CreateSphere("pebble", { diameter: 0.4, segments: 5 }, scene);
      pebble.position.set(0.6, 0.12, 0.3);
      pebble.scaling = new BABYLON.Vector3(1.1, 0.6, 0.9);
      pebble.material = mat;
    }
  }, [group]);

  // Asset mode with a model path — load the 3D model
  if (mode === 'asset' && modelPath) {
    return <ConfigPreviewScene height={180} showGround={true} modelPath={modelPath} />;
  }

  // Asset mode without a model, or procedural mode — show placeholder
  return <ConfigPreviewScene height={180} showGround={true} buildProcedural={buildProcedural} />;
}

// ─── Main Component ─────────────────────────────────────────────────────────

interface ConfigDetailPanelProps {
  selection: ConfigSelection;
  assets: VisualAsset[];
  onUpdateBuilding?: (typeName: string, config: UnifiedBuildingTypeConfig) => void;
  onUpdateGround?: (groundType: string, config: Partial<GroundTypeConfig>) => void;
  onUpdateCharacter?: (section: 'player' | 'npc', role: string, config: Partial<CharacterModelConfig>) => void;
  onUpdateNature?: (group: string, item: string, config: Partial<NatureTypeConfig>) => void;
  onUpdateItem?: (group: string, item: string, config: Partial<ItemTypeConfig>) => void;
}

export function ConfigDetailPanel({
  selection,
  assets,
  onUpdateBuilding,
  onUpdateGround,
  onUpdateCharacter,
  onUpdateNature,
  onUpdateItem,
}: ConfigDetailPanelProps) {
  if (!selection) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center text-muted-foreground">
          <Box className="w-8 h-8 mx-auto mb-2 opacity-20" />
          <p className="text-[10px]">Select an item to edit</p>
        </div>
      </div>
    );
  }

  // ─── Building Type ──────────────────────────────────────────────────────
  if (selection.module === 'building') {
    return <BuildingDetailEditor
      selection={selection}
      assets={assets}
      onUpdate={(updated) => onUpdateBuilding?.(selection.typeName, updated)}
    />;
  }

  // ─── Ground Type ────────────────────────────────────────────────────────
  if (selection.module === 'ground') {
    const cfg = selection.config;
    const mode = cfg?.mode || 'procedural';
    const textureAsset = cfg?.textureId ? assets.find(a => a.id === cfg.textureId) : undefined;
    const textureUrl = textureAsset ? `/${textureAsset.filePath}` : undefined;
    return (
      <div className="flex flex-col h-full min-h-0">
        <div className="shrink-0 p-3 border-b">
          <p className="text-xs font-semibold mb-2">{humanize(selection.groundType)}</p>
          <GroundTexturePreview
            groundType={selection.groundType}
            textureUrl={mode === 'asset' ? textureUrl : undefined}
            color={cfg?.color ? colorToHex(cfg.color) : "#5a8a5a"}
            tiling={cfg?.tiling ?? 4}
            height={180}
          />
        </div>
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-3 space-y-3">
            <div>
              <Label className="text-[10px]">Mode</Label>
              <Select value={mode} onValueChange={(v) => onUpdateGround?.(selection.groundType, { mode: v as 'asset' | 'procedural' })}>
                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="asset">Asset (Texture)</SelectItem>
                  <SelectItem value="procedural">Procedural (Color)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {mode === 'asset' && (
              <>
                <div className="space-y-1">
                  <Label className="text-[10px]">Texture Asset</Label>
                  <AssetSelect
                    value={cfg?.textureId}
                    placeholder="Select Texture"
                    className="h-7 text-xs"
                    assetTypeFilter={['texture_ground', 'texture_material', 'texture_wall']}
                    onSelect={(asset) => onUpdateGround?.(selection.groundType, { textureId: asset.id, mode: 'asset' })}
                    onClear={() => onUpdateGround?.(selection.groundType, { textureId: undefined })}
                  />
                </div>
                <div>
                  <Label className="text-[10px]">Tiling</Label>
                  <Input type="number" className="h-7 text-xs" value={cfg?.tiling ?? 4} min={1} max={32}
                    onChange={(e) => onUpdateGround?.(selection.groundType, { tiling: Number(e.target.value) })} />
                </div>
              </>
            )}

            {mode === 'procedural' && (
              <>
                <div>
                  <Label className="text-[10px]">Color</Label>
                  <input type="color" className="w-full h-7 rounded cursor-pointer"
                    value={cfg?.color ? colorToHex(cfg.color) : "#5a8a5a"}
                    onChange={(e) => onUpdateGround?.(selection.groundType, { color: hexToColor(e.target.value) })} />
                </div>
                <div>
                  <Label className="text-[10px]">Tiling</Label>
                  <Input type="number" className="h-7 text-xs" value={cfg?.tiling ?? 4} min={1} max={32}
                    onChange={(e) => onUpdateGround?.(selection.groundType, { tiling: Number(e.target.value) })} />
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // ─── Character Model ────────────────────────────────────────────────────
  if (selection.module === 'character') {
    const cfg = selection.config;
    const mode = cfg?.mode || 'asset';
    // For composed mode, preview the body model from quaternius
    const characterModelPath = mode === 'composed' && cfg?.bodyId
      ? resolveQuaterniusPath(cfg.bodyId)
      : resolveAssetPath(assets, cfg?.assetId);
    return (
      <div className="flex flex-col h-full min-h-0">
        <div className="shrink-0 p-3 border-b">
          <p className="text-xs font-semibold mb-2">
            {selection.section === 'player' ? 'Player' : 'NPC'}: {humanize(selection.role)}
          </p>
          <ConfigPreviewScene height={180} showGround={true} modelPath={characterModelPath || undefined} />
        </div>
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-3 space-y-3">
            <div>
              <Label className="text-[10px]">Mode</Label>
              <Select value={mode} onValueChange={(v) =>
                onUpdateCharacter?.(selection.section, selection.role, { mode: v as 'asset' | 'procedural' | 'composed' })
              }>
                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="asset">Asset (3D Model)</SelectItem>
                  <SelectItem value="composed">Composed (Body + Hair + Outfit)</SelectItem>
                  <SelectItem value="procedural">Procedural</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {mode === 'asset' && (
              <div className="space-y-1">
                <Label className="text-[10px]">Model Asset</Label>
                <AssetSelect
                  value={cfg?.assetId}
                  placeholder="Select Character Model"
                  className="h-7 text-xs"
                  modelsOnly
                  assetTypeFilter={['model_character', 'model_player']}
                  onSelect={(asset) => onUpdateCharacter?.(selection.section, selection.role, { assetId: asset.id })}
                  onClear={() => onUpdateCharacter?.(selection.section, selection.role, { assetId: undefined })}
                />
              </div>
            )}

            {mode === 'composed' && (
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground">
                  Composed characters use body, hair, and outfit parts from the NPC Designer.
                  Configure presets in the NPC Designer section, then assign them to roles here.
                </p>
                {cfg?.bodyId && (
                  <div className="text-[10px]">
                    <span className="text-muted-foreground">Body:</span> {cfg.bodyId}
                  </div>
                )}
                {cfg?.hairId && (
                  <div className="text-[10px]">
                    <span className="text-muted-foreground">Hair:</span> {cfg.hairId}
                  </div>
                )}
                {cfg?.outfitId && (
                  <div className="text-[10px]">
                    <span className="text-muted-foreground">Outfit:</span> {cfg.outfitId}
                  </div>
                )}
                {cfg?.skinColor && (
                  <div className="flex items-center gap-1 text-[10px]">
                    <span className="text-muted-foreground">Skin:</span>
                    <div className="w-3 h-3 rounded border" style={{ backgroundColor: cfg.skinColor }} />
                    {cfg.skinColor}
                  </div>
                )}
              </div>
            )}

            {/* Scaling */}
            <div>
              <Label className="text-[10px]">Scale (X / Y / Z)</Label>
              <div className="grid grid-cols-3 gap-1">
                {(['x', 'y', 'z'] as const).map(axis => (
                  <Input key={axis} type="number" step={0.1} className="h-7 text-xs"
                    value={cfg?.modelScaling?.[axis] ?? 1}
                    onChange={(e) => onUpdateCharacter?.(selection.section, selection.role, {
                      modelScaling: { ...(cfg?.modelScaling || { x: 1, y: 1, z: 1 }), [axis]: Number(e.target.value) },
                    })} />
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  // ─── Nature Item ────────────────────────────────────────────────────────
  if (selection.module === 'nature') {
    const cfg = selection.config;
    const natureAsset = cfg?.assetId ? assets.find(a => a.id === cfg.assetId) : null;
    const natureModelPath = natureAsset?.filePath || undefined;
    const natureGroup = selection.group;
    return (
      <div className="flex flex-col h-full min-h-0">
        <div className="shrink-0 p-3 border-b">
          <p className="text-xs font-semibold mb-2">{humanize(selection.item)}</p>
          <NaturePreview
            key={`${selection.group}-${selection.item}-${cfg?.assetId || 'none'}-${cfg?.mode || 'asset'}`}
            modelPath={(cfg?.mode || 'asset') === 'asset' ? natureModelPath : undefined}
            group={natureGroup}
            mode={cfg?.mode || 'asset'}
          />
        </div>
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-3 space-y-3">
            <div>
              <Label className="text-[10px]">Mode</Label>
              <Select value={cfg?.mode || 'asset'} onValueChange={(v) =>
                onUpdateNature?.(selection.group, selection.item, { mode: v as 'asset' | 'procedural' })
              }>
                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="asset">Asset (3D Model)</SelectItem>
                  <SelectItem value="procedural">Procedural</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(cfg?.mode || 'asset') === 'asset' && (
              <div className="space-y-1">
                <Label className="text-[10px]">Model Asset</Label>
                <AssetSelect
                  value={cfg?.assetId}
                  placeholder="Select Model"
                  className="h-7 text-xs"
                  modelsOnly
                  assetTypeFilter={['model_nature', 'model_tree', 'model_3d', 'model_prop']}
                  onSelect={(asset) => onUpdateNature?.(selection.group, selection.item, { assetId: asset.id })}
                  onClear={() => onUpdateNature?.(selection.group, selection.item, { assetId: undefined })}
                />
              </div>
            )}

            <div>
              <Label className="text-[10px]">Scale (X / Y / Z)</Label>
              <div className="grid grid-cols-3 gap-1">
                {(['x', 'y', 'z'] as const).map(axis => (
                  <Input key={axis} type="number" step={0.1} className="h-7 text-xs"
                    value={cfg?.modelScaling?.[axis] ?? 1}
                    onChange={(e) => onUpdateNature?.(selection.group, selection.item, {
                      modelScaling: { ...(cfg?.modelScaling || { x: 1, y: 1, z: 1 }), [axis]: Number(e.target.value) },
                    })} />
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  // ─── Item/Prop ──────────────────────────────────────────────────────────
  if (selection.module === 'item') {
    const cfg = selection.config;
    const itemModelPath = resolveAssetPath(assets, cfg?.assetId);
    return (
      <div className="flex flex-col h-full min-h-0">
        <div className="shrink-0 p-3 border-b">
          <p className="text-xs font-semibold mb-2">{humanize(selection.item)}</p>
          <ConfigPreviewScene height={180} showGround={true} modelPath={itemModelPath} />
        </div>
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-3 space-y-3">
            <div>
              <Label className="text-[10px]">Mode</Label>
              <Select value={cfg?.mode || 'asset'} onValueChange={(v) =>
                onUpdateItem?.(selection.group, selection.item, { mode: v as 'asset' | 'procedural' })
              }>
                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="asset">Asset (3D Model)</SelectItem>
                  <SelectItem value="procedural">Procedural</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(cfg?.mode || 'asset') === 'asset' && (
              <div className="space-y-1">
                <Label className="text-[10px]">Model Asset</Label>
                <AssetSelect
                  value={cfg?.assetId}
                  placeholder="Select Model"
                  className="h-7 text-xs"
                  modelsOnly
                  assetTypeFilter={['model_prop', 'model_quest_item', 'model_3d']}
                  onSelect={(asset) => onUpdateItem?.(selection.group, selection.item, { assetId: asset.id })}
                  onClear={() => onUpdateItem?.(selection.group, selection.item, { assetId: undefined })}
                />
              </div>
            )}

            <div>
              <Label className="text-[10px]">Scale (X / Y / Z)</Label>
              <div className="grid grid-cols-3 gap-1">
                {(['x', 'y', 'z'] as const).map(axis => (
                  <Input key={axis} type="number" step={0.1} className="h-7 text-xs"
                    value={cfg?.modelScaling?.[axis] ?? 1}
                    onChange={(e) => onUpdateItem?.(selection.group, selection.item, {
                      modelScaling: { ...(cfg?.modelScaling || { x: 1, y: 1, z: 1 }), [axis]: Number(e.target.value) },
                    })} />
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  return null;
}
