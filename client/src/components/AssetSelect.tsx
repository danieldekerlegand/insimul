import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { VisualAsset, AssetCollection } from '@shared/schema';

export interface AssetSelectProps {
  /** Currently selected asset ID */
  value?: string;
  /** Called when an asset is selected */
  onSelect?: (asset: VisualAsset) => void;
  /** Called when selection is cleared (value set to empty) */
  onClear?: () => void;
  /** Filter to world assets */
  worldId?: string;
  /** Filter to collection assets */
  collectionId?: string;
  /** Filter to entity assets */
  entityType?: 'character' | 'business' | 'settlement' | 'country' | 'state';
  /** Filter to entity assets */
  entityId?: string;
  /** Only show 3D model assets */
  modelsOnly?: boolean;
  /** Filter to specific asset types (e.g. ['model_character', 'model_player']) */
  assetTypeFilter?: string[];
  /** Placeholder text */
  placeholder?: string;
  /** Additional CSS classes for the trigger */
  className?: string;
  /** Whether the select is disabled */
  disabled?: boolean;
}

const CLEAR_VALUE = '__clear__';

export function isModelAsset(asset: VisualAsset): boolean {
  const type = asset.assetType || '';
  if (type.startsWith('model_')) return true;
  const mime = asset.mimeType || '';
  if (mime === 'model/gltf-binary') return true;
  const filePath = asset.filePath?.toLowerCase?.() || '';
  return filePath.endsWith('.glb') || filePath.endsWith('.gltf');
}

export function AssetSelect({
  value,
  onSelect,
  onClear,
  worldId,
  collectionId,
  entityType,
  entityId,
  modelsOnly = false,
  assetTypeFilter,
  placeholder = 'Select asset...',
  className,
  disabled,
}: AssetSelectProps) {
  // Fetch collection details when collectionId is provided
  const { data: collection } = useQuery<AssetCollection>({
    queryKey: ['/api/asset-collections', collectionId],
    enabled: !!collectionId,
  });

  // Fetch assets
  const { data: rawAssets = [], isLoading } = useQuery<VisualAsset[]>({
    queryKey: collectionId && collection?.assetIds?.length
      ? ['/api/assets', { ids: collection.assetIds.join(',') }]
      : entityId && entityType
        ? ['/api/assets', entityType, entityId]
        : worldId
          ? ['/api/worlds', worldId, 'assets']
          : ['/api/assets'],
    queryFn: async () => {
      if (collectionId && collection?.assetIds?.length) {
        const res = await fetch(`/api/assets?ids=${collection.assetIds.join(',')}`);
        if (!res.ok) throw new Error('Failed to fetch assets');
        return res.json();
      }
      if (collectionId && collection?.assetIds?.length === 0) {
        return [];
      }
      const url = entityId && entityType
        ? `/api/assets/${entityType}/${entityId}`
        : worldId
          ? `/api/worlds/${worldId}/assets`
          : '/api/assets';
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch assets');
      return res.json();
    },
    enabled: !collectionId || !!collection,
  });

  let assets = modelsOnly ? rawAssets.filter(isModelAsset) : rawAssets;
  if (assetTypeFilter?.length) {
    assets = assets.filter(a => assetTypeFilter.includes(a.assetType));
  }

  const handleValueChange = (selectedId: string) => {
    if (selectedId === CLEAR_VALUE) {
      onClear?.();
      return;
    }
    const asset = assets.find(a => a.id === selectedId);
    if (asset) {
      onSelect?.(asset);
    }
  };

  return (
    <Select value={value || ''} onValueChange={handleValueChange} disabled={disabled || isLoading}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={isLoading ? 'Loading...' : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {value && onClear && (
          <SelectItem value={CLEAR_VALUE} className="text-muted-foreground italic">
            Clear selection
          </SelectItem>
        )}
        {assets.length === 0 && !isLoading && (
          <SelectItem value="__empty__" disabled>
            No assets available
          </SelectItem>
        )}
        {assets.map((asset) => (
          <SelectItem key={asset.id} value={asset.id}>
            {asset.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
