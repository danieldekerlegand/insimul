import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Layers, ChevronDown, ChevronUp } from 'lucide-react';
import type { ViewLevel } from './LocationMapPreview';

export type MapLayer = 'terrain' | 'streets' | 'buildings' | 'water' | 'labels' | 'districts';

export const ALL_LAYERS: MapLayer[] = ['terrain', 'streets', 'buildings', 'water', 'labels', 'districts'];

const LAYER_META: Record<MapLayer, { label: string; color: string; views: ViewLevel[] }> = {
  terrain:   { label: 'Terrain',   color: '#6B8E23', views: ['world', 'country', 'settlement'] },
  districts: { label: 'Districts', color: '#FFD700', views: ['world', 'country'] },
  streets:   { label: 'Streets',   color: '#B0A890', views: ['settlement'] },
  buildings: { label: 'Buildings', color: '#CD853F', views: ['country', 'settlement'] },
  water:     { label: 'Water',     color: '#4682B4', views: ['world', 'country', 'settlement'] },
  labels:    { label: 'Labels',    color: '#CCCCCC', views: ['world', 'country', 'settlement'] },
};

interface MapLayersPanelProps {
  viewLevel: ViewLevel;
  visibleLayers: Set<MapLayer>;
  onToggleLayer: (layer: MapLayer) => void;
}

export function MapLayersPanel({ viewLevel, visibleLayers, onToggleLayer }: MapLayersPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const availableLayers = ALL_LAYERS.filter(l => LAYER_META[l].views.includes(viewLevel));

  return (
    <div className="absolute top-2 right-2 z-20">
      {!expanded ? (
        <Button
          variant="secondary"
          size="sm"
          className="h-8 gap-1.5 bg-black/60 hover:bg-black/80 text-white border-0 backdrop-blur-sm"
          onClick={() => setExpanded(true)}
        >
          <Layers className="w-3.5 h-3.5" />
          Layers
        </Button>
      ) : (
        <div className="bg-black/75 backdrop-blur-sm rounded-lg border border-white/10 min-w-[160px]">
          <button
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-white/80 uppercase tracking-wider"
            onClick={() => setExpanded(false)}
          >
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Layers
            </span>
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <div className="px-2 pb-2 space-y-1">
            {availableLayers.map(layer => {
              const meta = LAYER_META[layer];
              const isVisible = visibleLayers.has(layer);
              return (
                <label
                  key={layer}
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 cursor-pointer"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: meta.color, opacity: isVisible ? 1 : 0.3 }}
                  />
                  <span className={`text-xs flex-1 ${isVisible ? 'text-white' : 'text-white/40'}`}>
                    {meta.label}
                  </span>
                  <Switch
                    checked={isVisible}
                    onCheckedChange={() => onToggleLayer(layer)}
                    className="scale-75"
                  />
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
