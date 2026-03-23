import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shuffle, Save, Trash2, Plus, RotateCcw } from 'lucide-react';
import { ConfigPreviewScene } from './ConfigPreviewScene';
import {
  type NPCDesignState,
  getDefaultDesign,
  randomizeDesign,
  designToPreset,
  presetToDesign,
  availableBodies,
  availableHair,
  availableOutfits,
  resolveAssetPath,
  DEFAULT_SKIN_TONES,
  DEFAULT_HAIR_COLORS,
  DEFAULT_OUTFIT_COLORS,
} from '@shared/game-engine/npc-designer-utils';
import type { Gender } from '@shared/game-engine/quaternius-asset-manifest';
import type { CharacterConfig, NPCPreset } from '@shared/game-engine/types';

interface NPCDesignerPanelProps {
  config: CharacterConfig | undefined;
  onUpdate: (config: CharacterConfig) => void;
}

export function NPCDesignerPanel({ config, onUpdate }: NPCDesignerPanelProps) {
  const [design, setDesign] = useState<NPCDesignState>(getDefaultDesign);
  const [presetName, setPresetName] = useState('');

  const cfg = config || {};
  const presets = cfg.npcPresets || {};

  const updateDesign = useCallback((patch: Partial<NPCDesignState>) => {
    setDesign(prev => {
      const next = { ...prev, ...patch };
      // When gender changes, reset selections to valid options for new gender
      if (patch.gender && patch.gender !== prev.gender) {
        const bodies = availableBodies(patch.gender);
        const hairs = availableHair(patch.gender);
        const outfits = availableOutfits(patch.gender);
        next.bodyId = bodies[0]?.id || '';
        next.hairId = hairs.length > 0 && prev.hairId ? hairs[0].id : null;
        next.outfitId = outfits.length > 0 && prev.outfitId ? outfits[0].id : null;
      }
      return next;
    });
  }, []);

  const handleRandomize = useCallback(() => {
    setDesign(randomizeDesign());
  }, []);

  const handleSavePreset = useCallback(() => {
    const name = presetName.trim();
    if (!name) return;
    const key = name.toLowerCase().replace(/\s+/g, '_');
    const preset = designToPreset(design, name);
    onUpdate({ ...cfg, npcPresets: { ...presets, [key]: preset } });
    setPresetName('');
  }, [presetName, design, cfg, presets, onUpdate]);

  const handleDeletePreset = useCallback((key: string) => {
    const updated = { ...presets };
    delete updated[key];
    onUpdate({ ...cfg, npcPresets: updated });
  }, [cfg, presets, onUpdate]);

  const handleLoadPreset = useCallback((key: string) => {
    const preset = presets[key];
    if (preset) setDesign(presetToDesign(preset));
  }, [presets]);

  // Build the list of model paths for the composed preview
  const modelPaths: string[] = [];
  if (design.bodyId) {
    const p = resolveAssetPath(design.bodyId);
    if (p) modelPaths.push(p);
  }
  if (design.outfitId) {
    const p = resolveAssetPath(design.outfitId);
    if (p) modelPaths.push(p);
  }
  if (design.hairId) {
    const p = resolveAssetPath(design.hairId);
    if (p) modelPaths.push(p);
  }

  const genderBodies = availableBodies(design.gender);
  const genderHair = availableHair(design.gender);
  const genderOutfits = availableOutfits(design.gender);

  return (
    <div className="space-y-3">
      {/* 3D Preview */}
      <ConfigPreviewScene
        key={modelPaths.join('|')}
        height={220}
        showGround
        modelPath={modelPaths[0]}
        additionalModelPaths={modelPaths.slice(1)}
        className="rounded-lg"
      />

      {/* Randomize */}
      <Button variant="outline" size="sm" className="w-full h-7 text-xs" onClick={handleRandomize}>
        <Shuffle className="w-3 h-3 mr-1" /> Randomize NPC
      </Button>

      {/* Gender */}
      <div className="space-y-1">
        <Label className="text-[10px]">Gender</Label>
        <Select value={design.gender} onValueChange={(v) => updateDesign({ gender: v as Gender })}>
          <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Body */}
      <div className="space-y-1">
        <Label className="text-[10px]">Body</Label>
        <Select value={design.bodyId} onValueChange={(v) => updateDesign({ bodyId: v })}>
          <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Select body..." /></SelectTrigger>
          <SelectContent>
            {genderBodies.map(b => (
              <SelectItem key={b.id} value={b.id}>{b.displayName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Hair */}
      <div className="space-y-1">
        <Label className="text-[10px]">Hair</Label>
        <Select value={design.hairId || '__none__'} onValueChange={(v) => updateDesign({ hairId: v === '__none__' ? null : v })}>
          <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Select hair..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">None</SelectItem>
            {genderHair.map(h => (
              <SelectItem key={h.id} value={h.id}>{h.displayName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Outfit */}
      <div className="space-y-1">
        <Label className="text-[10px]">Outfit</Label>
        <Select value={design.outfitId || '__none__'} onValueChange={(v) => updateDesign({ outfitId: v === '__none__' ? null : v })}>
          <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Select outfit..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">None</SelectItem>
            {genderOutfits.map(o => (
              <SelectItem key={o.id} value={o.id}>{o.displayName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Color Pickers */}
      <div className="space-y-1">
        <Label className="text-[10px]">Skin Tone</Label>
        <div className="flex flex-wrap gap-1">
          {DEFAULT_SKIN_TONES.map(color => (
            <button
              key={color}
              className={`w-5 h-5 rounded border-2 transition-colors ${design.skinColor === color ? 'border-primary' : 'border-transparent'}`}
              style={{ backgroundColor: color }}
              onClick={() => updateDesign({ skinColor: color })}
            />
          ))}
          <input
            type="color"
            className="w-5 h-5 rounded cursor-pointer border"
            value={design.skinColor}
            onChange={(e) => updateDesign({ skinColor: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-[10px]">Hair Color</Label>
        <div className="flex flex-wrap gap-1">
          {DEFAULT_HAIR_COLORS.map(color => (
            <button
              key={color}
              className={`w-5 h-5 rounded border-2 transition-colors ${design.hairColor === color ? 'border-primary' : 'border-transparent'}`}
              style={{ backgroundColor: color }}
              onClick={() => updateDesign({ hairColor: color })}
            />
          ))}
          <input
            type="color"
            className="w-5 h-5 rounded cursor-pointer border"
            value={design.hairColor}
            onChange={(e) => updateDesign({ hairColor: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-[10px]">Outfit Color</Label>
        <div className="flex flex-wrap gap-1">
          {DEFAULT_OUTFIT_COLORS.map(color => (
            <button
              key={color}
              className={`w-5 h-5 rounded border-2 transition-colors ${design.outfitColor === color ? 'border-primary' : 'border-transparent'}`}
              style={{ backgroundColor: color }}
              onClick={() => updateDesign({ outfitColor: color })}
            />
          ))}
          <input
            type="color"
            className="w-5 h-5 rounded cursor-pointer border"
            value={design.outfitColor}
            onChange={(e) => updateDesign({ outfitColor: e.target.value })}
          />
        </div>
      </div>

      {/* Save Preset */}
      <div className="space-y-1 border-t pt-2">
        <Label className="text-[10px]">Save as Preset</Label>
        <div className="flex gap-1">
          <Input
            className="h-6 text-[10px] flex-1"
            placeholder="Preset name..."
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
          />
          <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" onClick={handleSavePreset} disabled={!presetName.trim()}>
            <Save className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Preset List */}
      {Object.keys(presets).length > 0 && (
        <div className="space-y-1">
          <Label className="text-[10px]">Saved Presets</Label>
          <p className="text-[9px] text-muted-foreground">
            The game engine will randomly pick from these presets when spawning NPCs.
          </p>
          <div className="space-y-0.5">
            {Object.entries(presets).map(([key, preset]) => (
              <div key={key} className="flex items-center justify-between text-[10px] px-1.5 py-1 rounded hover:bg-muted/40 group">
                <button className="flex-1 text-left truncate" onClick={() => handleLoadPreset(key)}>
                  {preset.name}
                  <span className="text-muted-foreground ml-1">({preset.gender})</span>
                </button>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeletePreset(key)}>
                  <Trash2 className="w-3 h-3 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* World Color Palettes */}
      <div className="border-t pt-3 mt-3 space-y-2">
        <Label className="text-xs font-semibold">World Color Palettes</Label>
        <p className="text-[9px] text-muted-foreground">
          Default color pools used when randomizing NPC appearances across the world.
        </p>
        <PaletteEditor
          label="Clothing Colors"
          colors={cfg.npcClothingPalette || []}
          defaults={DEFAULT_CLOTHING_PALETTE}
          onChange={(colors) => onUpdate({ ...cfg, npcClothingPalette: colors })}
        />
        <PaletteEditor
          label="Skin Tones"
          colors={cfg.npcSkinTonePalette || []}
          defaults={DEFAULT_SKIN_TONE_PALETTE}
          onChange={(colors) => onUpdate({ ...cfg, npcSkinTonePalette: colors })}
        />
      </div>
    </div>
  );
}

// ─── Palette Editor ─────────────────────────────────────────────────────────

const DEFAULT_CLOTHING_PALETTE = [
  "#8B4513", "#2F4F4F", "#8B0000", "#191970", "#556B2F",
  "#4B0082", "#CD853F", "#A0522D", "#DAA520", "#708090",
];
const DEFAULT_SKIN_TONE_PALETTE = [
  "#FFDFC4", "#F0C8A0", "#D4A574", "#C68642", "#8D5524",
  "#6B3A2A", "#4A2511", "#3B1F0E",
];

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
