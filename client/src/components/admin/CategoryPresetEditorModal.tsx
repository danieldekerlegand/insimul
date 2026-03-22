import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save, X, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { BUILDING_CATEGORY_GROUPINGS, type BuildingCategory } from '@shared/game-engine/building-categories';
import type { ProceduralStylePreset, Color3 as EngineColor3 } from '@shared/game-engine/types';
import type { VisualAsset } from '@shared/schema';

const MATERIAL_TYPES = ['wood', 'stone', 'brick', 'metal', 'glass', 'stucco'] as const;
const ARCH_STYLES = ['medieval', 'modern', 'futuristic', 'rustic', 'industrial', 'colonial', 'creole'] as const;
const ROOF_STYLES = ['hip', 'gable', 'flat', 'side_gable', 'hipped_dormers'] as const;

const TEXTURE_FIELDS = [
  { key: 'wallTextureId' as const, label: 'Wall Texture' },
  { key: 'roofTextureId' as const, label: 'Roof Texture' },
  { key: 'floorTextureId' as const, label: 'Floor Texture' },
  { key: 'doorTextureId' as const, label: 'Door Texture' },
  { key: 'windowTextureId' as const, label: 'Window Texture' },
  { key: 'balconyTextureId' as const, label: 'Balcony Texture' },
  { key: 'ironworkTextureId' as const, label: 'Ironwork Texture' },
  { key: 'porchTextureId' as const, label: 'Porch Texture' },
  { key: 'shutterTextureId' as const, label: 'Shutter Texture' },
] as const;

type TextureFieldKey = typeof TEXTURE_FIELDS[number]['key'];

function colorToHex(c: EngineColor3): string {
  const r = Math.round(c.r * 255).toString(16).padStart(2, '0');
  const g = Math.round(c.g * 255).toString(16).padStart(2, '0');
  const b = Math.round(c.b * 255).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

function hexToColor(hex: string): EngineColor3 {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16) / 255,
    g: parseInt(h.substring(2, 4), 16) / 255,
    b: parseInt(h.substring(4, 6), 16) / 255,
  };
}

const CATEGORY_LABELS: Record<BuildingCategory, string> = {
  commercial_food: 'Commercial — Food',
  commercial_retail: 'Commercial — Retail',
  commercial_service: 'Commercial — Service',
  civic: 'Civic',
  industrial: 'Industrial',
  maritime: 'Maritime',
  residential: 'Residential',
};

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

export interface TexturePickerRequest {
  category: string;
  field: TextureFieldKey;
}

export interface CategoryPresetEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presets: Record<string, ProceduralStylePreset> | null;
  onSave: (presets: Record<string, ProceduralStylePreset> | null) => void;
  assets?: VisualAsset[];
  onTexturePickerOpen?: (request: TexturePickerRequest) => void;
}

export function CategoryPresetEditorModal({
  open,
  onOpenChange,
  presets: initialPresets,
  onSave,
  assets = [],
  onTexturePickerOpen,
}: CategoryPresetEditorModalProps) {
  const [presets, setPresets] = useState<Record<string, ProceduralStylePreset>>(initialPresets ?? {});
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const categories = Object.keys(BUILDING_CATEGORY_GROUPINGS) as BuildingCategory[];

  const updatePreset = useCallback((category: string, partial: Partial<ProceduralStylePreset>) => {
    setPresets(prev => ({
      ...prev,
      [category]: { ...prev[category], ...partial },
    }));
    setDirty(true);
  }, []);

  const addPreset = useCallback((category: string) => {
    setPresets(prev => ({
      ...prev,
      [category]: makeDefaultPreset(category),
    }));
    setDirty(true);
    setExpandedCategory(category);
  }, []);

  const removePreset = useCallback((category: string) => {
    setPresets(prev => {
      const next = { ...prev };
      delete next[category];
      return next;
    });
    setDirty(true);
    setExpandedCategory(null);
  }, []);

  const handleSave = () => {
    const result = Object.keys(presets).length > 0 ? presets : null;
    onSave(result);
    setDirty(false);
    onOpenChange(false);
  };

  const getTextureName = (textureId?: string) => {
    if (!textureId) return null;
    return assets.find(a => a.id === textureId)?.name ?? 'Selected';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-sm">Category Style Presets</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-1.5 pb-2">
            {categories.map(category => {
              const preset = presets[category];
              const isExpanded = expandedCategory === category;
              const types = BUILDING_CATEGORY_GROUPINGS[category];

              return (
                <div key={category} className="border rounded" data-testid={`category-${category}`}>
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <button
                      className="flex items-center gap-1.5 text-xs hover:text-foreground transition-colors cursor-pointer flex-1 min-w-0"
                      onClick={() => setExpandedCategory(isExpanded ? null : category)}
                    >
                      <ChevronRight className={`w-3 h-3 text-muted-foreground shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      <span className="font-medium truncate">{CATEGORY_LABELS[category]}</span>
                      <Badge variant="outline" className="text-[9px] h-4 shrink-0">{types.length} types</Badge>
                    </button>
                    {!preset ? (
                      <Button variant="ghost" size="sm" className="h-5 text-[10px] px-1.5 shrink-0" onClick={() => addPreset(category)}>
                        <Plus className="w-3 h-3 mr-0.5" /> Add
                      </Button>
                    ) : (
                      <div className="flex gap-0.5 shrink-0">
                        {preset.baseColors.slice(0, 3).map((c, i) => (
                          <div key={i} className="w-3 h-3 rounded-sm border" style={{ backgroundColor: colorToHex(c) }} />
                        ))}
                      </div>
                    )}
                  </div>

                  {isExpanded && preset && (
                    <PresetEditor
                      category={category}
                      preset={preset}
                      onUpdate={(partial) => updatePreset(category, partial)}
                      onRemove={() => removePreset(category)}
                      assets={assets}
                      getTextureName={getTextureName}
                      onTexturePickerOpen={onTexturePickerOpen}
                    />
                  )}

                  {isExpanded && !preset && (
                    <div className="px-2 pb-2 border-t pt-1.5">
                      <p className="text-[10px] text-muted-foreground italic">
                        No preset for this category. Types: {types.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-1">
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" className="h-7 text-xs" disabled={!dirty} onClick={handleSave}>
            <Save className="w-3 h-3 mr-1" /> Save Presets
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PresetEditor({
  category,
  preset,
  onUpdate,
  onRemove,
  assets,
  getTextureName,
  onTexturePickerOpen,
}: {
  category: string;
  preset: ProceduralStylePreset;
  onUpdate: (partial: Partial<ProceduralStylePreset>) => void;
  onRemove: () => void;
  assets: VisualAsset[];
  getTextureName: (id?: string) => string | null;
  onTexturePickerOpen?: (request: TexturePickerRequest) => void;
}) {
  return (
    <div className="space-y-2 px-2 pb-2 border-t pt-2" data-testid={`preset-editor-${category}`}>
      <div>
        <Label className="text-[10px]">Name</Label>
        <Input className="h-6 text-xs" value={preset.name} onChange={e => onUpdate({ name: e.target.value })} />
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <div>
          <Label className="text-[10px]">Material</Label>
          <Select value={preset.materialType} onValueChange={v => onUpdate({ materialType: v as any })}>
            <SelectTrigger className="h-6 text-[10px]"><SelectValue /></SelectTrigger>
            <SelectContent>{MATERIAL_TYPES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[10px]">Architecture</Label>
          <Select value={preset.architectureStyle} onValueChange={v => onUpdate({ architectureStyle: v as any })}>
            <SelectTrigger className="h-6 text-[10px]"><SelectValue /></SelectTrigger>
            <SelectContent>{ARCH_STYLES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-[10px]">Roof Style</Label>
        <Select value={preset.roofStyle || 'default'} onValueChange={v => onUpdate({ roofStyle: v === 'default' ? undefined : v as any })}>
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
          {([['Balcony', 'hasBalcony'], ['Ironwork Balcony', 'hasIronworkBalcony'], ['Front Porch', 'hasPorch'], ['Shutters', 'hasShutters']] as const).map(([label, field]) => (
            <label key={field} className="flex items-center gap-1 text-[10px] cursor-pointer">
              <input type="checkbox" checked={!!(preset as any)[field]}
                onChange={e => onUpdate({ [field]: e.target.checked || undefined })} className="w-3 h-3" />
              {label}
            </label>
          ))}
        </div>
      </div>

      {preset.hasPorch && (
        <div className="grid grid-cols-2 gap-1.5">
          <div>
            <Label className="text-[10px]">Porch Depth</Label>
            <Input type="number" className="h-6 text-xs" value={preset.porchDepth ?? 3}
              onChange={e => onUpdate({ porchDepth: parseFloat(e.target.value) || 3 })} />
          </div>
          <div>
            <Label className="text-[10px]">Porch Steps</Label>
            <Input type="number" className="h-6 text-xs" value={preset.porchSteps ?? 3}
              onChange={e => onUpdate({ porchSteps: parseInt(e.target.value) || 3 })} />
          </div>
        </div>
      )}

      {preset.hasShutters && (
        <div>
          <Label className="text-[10px]">Shutter Color</Label>
          <input type="color" value={preset.shutterColor ? colorToHex(preset.shutterColor) : colorToHex(preset.doorColor)}
            onChange={e => onUpdate({ shutterColor: hexToColor(e.target.value) })}
            className="w-full h-6 rounded border cursor-pointer p-0" />
        </div>
      )}

      {/* Texture Picker Section */}
      <div className="space-y-1">
        <p className="text-[10px] font-semibold text-muted-foreground">Textures</p>
        <div className="space-y-1">
          {TEXTURE_FIELDS.map(({ key, label }) => (
            <TextureRow
              key={key}
              label={label}
              textureId={(preset as any)[key]}
              textureName={getTextureName((preset as any)[key])}
              onSelect={() => onTexturePickerOpen?.({ category, field: key })}
              onClear={() => onUpdate({ [key]: undefined })}
            />
          ))}
        </div>
      </div>

      <Button variant="destructive" size="sm" className="w-full h-6 text-[10px]" onClick={onRemove}>
        <Trash2 className="w-3 h-3 mr-1" /> Remove Preset
      </Button>
    </div>
  );
}

function TextureRow({ label, textureId, textureName, onSelect, onClear }: {
  label: string;
  textureId?: string;
  textureName: string | null;
  onSelect: () => void;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded border px-2 py-1" data-testid={`texture-row-${label.toLowerCase().replace(/\s/g, '-')}`}>
      <div className="min-w-0 mr-2">
        <p className="text-[10px] font-medium">{label}</p>
        <p className="text-[9px] text-muted-foreground truncate">{textureName ?? 'Not set'}</p>
      </div>
      <div className="flex gap-1 shrink-0">
        <Button variant="outline" size="sm" className="h-5 text-[9px] px-1.5" onClick={onSelect}>
          <ImageIcon className="w-3 h-3 mr-0.5" /> Pick
        </Button>
        {textureId && (
          <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={onClear}>
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
