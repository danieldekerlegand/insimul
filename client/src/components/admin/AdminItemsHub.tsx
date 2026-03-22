import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Search, ChevronRight, ChevronDown, Info, Package, Box,
  Sword, Shield, FlaskConical, Apple, Hammer, Gem, Key, ScrollText,
  AlertTriangle, ImageIcon, RefreshCw,
} from "lucide-react";
import { ModelPreview } from "../ModelPreview";
import { AssetSelect } from "../AssetSelect";
import type { AssetCollection, VisualAsset } from "@shared/schema";

interface BaseItem {
  id: string;
  name: string;
  description?: string;
  itemType: string;
  icon?: string;
  value?: number;
  sellValue?: number;
  weight?: number;
  worldType?: string;
  objectRole?: string;
  category?: string;
  material?: string;
  baseType?: string;
  rarity?: string;
  effects?: Record<string, number>;
  tags?: string[];
  possessable?: boolean;
  loreText?: string;
  isBase?: boolean;
}

const ITEM_TYPE_ICONS: Record<string, any> = {
  weapon: Sword, armor: Shield, consumable: FlaskConical,
  food: Apple, drink: FlaskConical, tool: Hammer,
  material: Gem, collectible: Gem, key: Key,
  quest: ScrollText,
};

const ITEM_TYPE_LABELS: Record<string, string> = {
  weapon: 'Weapons', armor: 'Armor', consumable: 'Consumables',
  food: 'Food', drink: 'Drinks', tool: 'Tools',
  material: 'Materials', collectible: 'Collectibles', key: 'Keys',
  quest: 'Quest Items',
};

const RARITY_COLORS: Record<string, string> = {
  common: 'text-muted-foreground',
  uncommon: 'text-green-600',
  rare: 'text-blue-500',
  epic: 'text-purple-500',
  legendary: 'text-amber-500',
};

export function AdminItemsHub() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Data
  const [searchQuery, setSearchQuery] = useState("");
  const [worldTypeFilter, setWorldTypeFilter] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<BaseItem | null>(null);

  // Right panel
  const [expandedSection, setExpandedSection] = useState<'preview' | 'details' | null>('preview');

  // Groups
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());


  // Fetch base items
  const { data: baseItems = [], isLoading } = useQuery<BaseItem[]>({
    queryKey: ['/api/items/base'],
    queryFn: async () => {
      const res = await fetch('/api/items/base');
      if (!res.ok) throw new Error('Failed to fetch base items');
      return res.json();
    },
  });

  // Fetch a base collection to resolve objectRole → asset
  const { data: collections = [] } = useQuery<AssetCollection[]>({
    queryKey: ['/api/asset-collections', 'base'],
    queryFn: async () => {
      const res = await fetch('/api/asset-collections?isBase=true');
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Fetch all visual assets for model preview
  const { data: allAssets = [] } = useQuery<VisualAsset[]>({
    queryKey: ['/api/assets', 'all-for-items'],
    queryFn: async () => {
      const res = await fetch('/api/assets');
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Resolve objectRole → VisualAsset for preview
  const resolveObjectRoleAsset = (objectRole: string | undefined | null): VisualAsset | null => {
    if (!objectRole) return null;
    // Try medieval-fantasy collection first, then any base collection
    for (const col of collections) {
      const assetId = (col.objectModels || {} as Record<string, string>)[objectRole];
      if (assetId) {
        const asset = allAssets.find(a => a.id === assetId);
        if (asset) return asset;
      }
    }
    return null;
  };

  // Find which collection holds a given role's mapping (or pick the first props/weapons/furniture base collection)
  const findCollectionForRole = (objectRole: string): AssetCollection | null => {
    // First check if already mapped in a collection
    for (const col of collections) {
      if ((col.objectModels as Record<string, string>)?.[objectRole]) return col;
    }
    // Fall back to "Base Props & Objects" or first base collection
    return collections.find(c => c.name === 'Base Props & Objects') || collections[0] || null;
  };

  // Mutation to update objectModels mapping on a collection
  const updateAssetMapping = useMutation({
    mutationFn: async ({ collectionId, objectRole, assetId }: { collectionId: string; objectRole: string; assetId: string }) => {
      const col = collections.find(c => c.id === collectionId);
      const updatedModels = { ...(col?.objectModels as Record<string, string> || {}), [objectRole]: assetId };
      const updatedAssetIds = [...new Set([...(col?.assetIds || []), assetId])];
      const res = await apiRequest('PATCH', `/api/asset-collections/${collectionId}`, {
        objectModels: updatedModels,
        assetIds: updatedAssetIds,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/asset-collections'] });
      toast({ title: 'Asset Updated', description: 'Item asset mapping has been updated.' });
    },
    onError: (err: any) => {
      toast({ title: 'Failed to update', description: err.message, variant: 'destructive' });
    },
  });

  const handleAssetSelected = (asset: VisualAsset) => {
    if (!selectedItem?.objectRole) return;
    const col = findCollectionForRole(selectedItem.objectRole);
    if (!col) {
      toast({ title: 'No collection found', description: 'Cannot find a base collection to update.', variant: 'destructive' });
      return;
    }
    updateAssetMapping.mutate({ collectionId: col.id, objectRole: selectedItem.objectRole, assetId: asset.id });
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    let result = baseItems;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.description?.toLowerCase().includes(q) ||
        i.objectRole?.toLowerCase().includes(q) ||
        i.category?.toLowerCase().includes(q) ||
        i.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    if (worldTypeFilter !== "all") {
      result = result.filter(i => i.worldType === worldTypeFilter || !i.worldType);
    }
    return result;
  }, [baseItems, searchQuery, worldTypeFilter]);

  // Group by itemType
  const groupedItems = useMemo(() => {
    const groups = new Map<string, BaseItem[]>();
    for (const item of filteredItems) {
      const key = item.itemType || 'unknown';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(item);
    }
    return groups;
  }, [filteredItems]);

  // Available worldTypes
  const worldTypes = useMemo(() => {
    const types = new Set(baseItems.map(i => i.worldType).filter(Boolean) as string[]);
    return Array.from(types).sort();
  }, [baseItems]);

  // Items without objectRole
  const unmappedCount = baseItems.filter(i => !i.objectRole).length;

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  // ─── Left Panel ────────────────────────────────────────────────────────────

  const renderLeft = () => (
    <div className="flex flex-col h-full border-r">
      <div className="flex items-center justify-between px-3 py-2.5 border-b bg-muted/30 shrink-0">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Base Items</span>
        {unmappedCount > 0 && (
          <Badge variant="outline" className="text-[10px] h-4 text-amber-500 border-amber-500/30">
            {unmappedCount} unmapped
          </Badge>
        )}
      </div>

      <div className="px-2 py-2 border-b space-y-1.5">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Search items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-7 text-xs pl-7" />
        </div>
        <Select value={worldTypeFilter} onValueChange={setWorldTypeFilter}>
          <SelectTrigger className="h-6 text-[10px]"><SelectValue placeholder="All World Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All World Types ({baseItems.length})</SelectItem>
            {worldTypes.map(wt => (
              <SelectItem key={wt} value={wt}>{wt} ({baseItems.filter(i => i.worldType === wt).length})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {isLoading ? (
            <p className="text-xs text-muted-foreground text-center py-8">Loading...</p>
          ) : filteredItems.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No items found</p>
          ) : (
            <div className="space-y-0.5">
              {Array.from(groupedItems.entries()).map(([typeName, typeItems]) => {
                const isExpanded = expandedGroups.has(typeName);
                const Icon = ITEM_TYPE_ICONS[typeName] || Package;
                return (
                  <div key={typeName}>
                    <button className="w-full flex items-center gap-1.5 px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors" onClick={() => toggleGroup(typeName)}>
                      {isExpanded ? <ChevronDown className="h-3 w-3 shrink-0" /> : <ChevronRight className="h-3 w-3 shrink-0" />}
                      <Icon className="h-3 w-3 shrink-0" />
                      <span className="truncate">{ITEM_TYPE_LABELS[typeName] || typeName}</span>
                      <span className="ml-auto text-[10px] opacity-60">{typeItems.length}</span>
                    </button>
                    {isExpanded && typeItems.map(item => {
                      const isSelected = selectedItem?.id === item.id;
                      const hasAsset = !!item.objectRole;
                      return (
                        <button
                          key={item.id}
                          className={`w-full text-left px-5 py-1.5 text-xs rounded-sm transition-colors flex items-center gap-2 ${
                            isSelected ? 'bg-primary/15 text-primary font-medium' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                          }`}
                          onClick={() => { setSelectedItem(item); setExpandedSection('preview'); }}
                        >
                          <span className="shrink-0">{item.icon || '📦'}</span>
                          <span className="truncate flex-1">{item.name}</span>
                          {!hasAsset && <span title="No objectRole"><AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" /></span>}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="px-3 py-2 border-t text-[10px] text-muted-foreground">
        {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
      </div>
    </div>
  );

  // ─── Center Panel ──────────────────────────────────────────────────────────

  const renderCenter = () => {
    if (!selectedItem) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <Package className="w-10 h-10 opacity-20" />
          <p className="text-sm">Select an item from the list</p>
          <p className="text-xs">{baseItems.length} base items across {worldTypes.length} world types</p>
        </div>
      );
    }

    const asset = resolveObjectRoleAsset(selectedItem.objectRole);
    const isModel = asset && (asset.filePath?.endsWith('.glb') || asset.filePath?.endsWith('.gltf') || asset.mimeType === 'model/gltf-binary');

    return (
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="px-4 py-3 border-b shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{selectedItem.icon || '📦'}</span>
            <h2 className="text-lg font-bold">{selectedItem.name}</h2>
            <Badge variant="secondary" className="text-xs capitalize">{selectedItem.itemType}</Badge>
            {selectedItem.rarity && selectedItem.rarity !== 'common' && (
              <Badge variant="outline" className={`text-xs capitalize ${RARITY_COLORS[selectedItem.rarity] || ''}`}>{selectedItem.rarity}</Badge>
            )}
            {selectedItem.worldType && (
              <Badge variant="outline" className="text-xs">{selectedItem.worldType}</Badge>
            )}
            {!selectedItem.worldType && (
              <Badge variant="outline" className="text-xs text-blue-500 border-blue-500/30">Universal</Badge>
            )}
          </div>
          {selectedItem.description && <p className="text-sm text-muted-foreground">{selectedItem.description}</p>}
        </div>

        {/* Asset mapping info */}
        <div className="px-4 py-2 border-b bg-muted/20 shrink-0">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-muted-foreground">Object Role:</span>
            {selectedItem.objectRole ? (
              <Badge variant="secondary" className="font-mono text-[10px]">{selectedItem.objectRole}</Badge>
            ) : (
              <span className="text-amber-500 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> No role assigned (no 3D model)
              </span>
            )}
            {asset && (
              <>
                <span className="text-muted-foreground">→</span>
                <span className="text-xs truncate flex-1">{asset.name}</span>
              </>
            )}
            {selectedItem.objectRole && (
              <div className="ml-auto shrink-0 w-32">
                <AssetSelect
                  modelsOnly
                  placeholder={asset ? 'Change' : 'Assign'}
                  className="h-5 text-[10px]"
                  onSelect={handleAssetSelected}
                />
              </div>
            )}
          </div>
        </div>

        {/* Item details grid */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 space-y-4">
            {/* 3D Preview */}
            {asset && isModel && (
              <div className="rounded-lg border overflow-hidden h-64 bg-muted/30">
                <ModelPreview modelPath={asset.filePath} className="h-full w-full" showControls={true} />
              </div>
            )}
            {asset && !isModel && asset.filePath && (
              <div className="rounded-lg border overflow-hidden h-48 flex items-center justify-center bg-muted/30">
                <img src={`/${asset.filePath}`} alt={asset.name} className="max-h-full object-contain" />
              </div>
            )}
            {!asset && selectedItem.objectRole && (
              <div className="rounded-lg border p-4 text-center text-muted-foreground bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/30">
                <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                <p className="text-sm mb-2">Role "{selectedItem.objectRole}" has no matching asset in base collections</p>
                <AssetSelect
                  modelsOnly
                  placeholder="Assign Asset"
                  className="h-8 text-xs"
                  onSelect={handleAssetSelected}
                />
              </div>
            )}

            {/* Properties grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <PropertyCard label="Value" value={selectedItem.value?.toString() || '0'} icon="💰" />
              <PropertyCard label="Sell Value" value={selectedItem.sellValue?.toString() || '0'} icon="🏷️" />
              <PropertyCard label="Weight" value={selectedItem.weight?.toString() || '1'} icon="⚖️" />
              {selectedItem.category && <PropertyCard label="Category" value={selectedItem.category.replace(/_/g, ' ')} />}
              {selectedItem.material && <PropertyCard label="Material" value={selectedItem.material} />}
              {selectedItem.baseType && <PropertyCard label="Base Type" value={selectedItem.baseType} />}
              <PropertyCard label="Possessable" value={selectedItem.possessable !== false ? 'Yes' : 'No'} />
              <PropertyCard label="Stackable" value={selectedItem.possessable ? 'Yes' : 'No'} />
            </div>

            {/* Effects */}
            {selectedItem.effects && Object.keys(selectedItem.effects).length > 0 && (
              <div>
                <h3 className="text-xs font-semibold mb-2 text-muted-foreground">Effects</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(selectedItem.effects).map(([key, val]) => (
                    <Badge key={key} variant="outline" className="text-xs">
                      {key}: {val > 0 ? '+' : ''}{val}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Lore */}
            {selectedItem.loreText && (
              <div>
                <h3 className="text-xs font-semibold mb-2 text-muted-foreground">Lore</h3>
                <p className="text-sm italic text-muted-foreground">{selectedItem.loreText}</p>
              </div>
            )}

            {/* Tags */}
            {selectedItem.tags && selectedItem.tags.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold mb-2 text-muted-foreground">Tags</h3>
                <div className="flex flex-wrap gap-1">
                  {selectedItem.tags.map((tag, i) => <Badge key={i} variant="secondary" className="text-[10px]">{tag}</Badge>)}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  };

  // ─── Right Panel ───────────────────────────────────────────────────────────

  const renderRight = () => {
    if (!selectedItem) return null;

    const asset = resolveObjectRoleAsset(selectedItem.objectRole);
    type SectionId = 'preview' | 'details';
    const sections: { id: SectionId; label: string; icon: any }[] = [
      { id: 'preview', label: 'Asset', icon: ImageIcon },
      { id: 'details', label: 'Details', icon: Info },
    ];

    return (
      <div className="w-64 shrink-0 border-l flex flex-col min-h-0">
        {sections.map((section, idx) => {
          const isExpanded = expandedSection === section.id;
          const Icon = section.icon;
          return (
            <div key={section.id} className={`flex flex-col min-h-0 ${idx > 0 ? 'border-t' : ''} ${isExpanded ? 'flex-1' : ''}`}>
              <button
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0"
                onClick={() => setExpandedSection(isExpanded ? null : section.id)}
              >
                <Icon className="w-3.5 h-3.5" />
                {section.label}
                <ChevronRight className={`w-3 h-3 ml-auto transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </button>

              {isExpanded && (
                <ScrollArea className="flex-1 min-h-0">
                  <div className="px-3 pb-3 space-y-3">
                    {section.id === 'preview' && (
                      <>
                        {asset ? (
                          <>
                            <div className="rounded-lg border overflow-hidden bg-muted/30 aspect-square">
                              {(asset.filePath?.endsWith('.glb') || asset.filePath?.endsWith('.gltf')) ? (
                                <ModelPreview modelPath={asset.filePath} className="h-full w-full" showControls={false} />
                              ) : (
                                <img src={`/${asset.filePath}`} alt={asset.name} className="w-full h-full object-contain" />
                              )}
                            </div>
                            <DetailField label="Asset" value={asset.name} />
                            <DetailField label="File" value={asset.filePath} mono />
                            <DetailField label="Type" value={asset.assetType?.replace(/_/g, ' ') || 'Unknown'} />
                            {selectedItem.objectRole && (
                              <AssetSelect
                                modelsOnly
                                placeholder="Change Asset"
                                className="h-7 text-xs w-full"
                                onSelect={handleAssetSelected}
                              />
                            )}
                          </>
                        ) : (
                          <div className="text-center py-6 text-muted-foreground">
                            <Box className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-xs mb-2">{selectedItem.objectRole ? 'Asset not found' : 'No role assigned'}</p>
                            {selectedItem.objectRole && (
                              <AssetSelect
                                modelsOnly
                                placeholder="Assign Asset"
                                className="h-7 text-xs"
                                onSelect={handleAssetSelected}
                              />
                            )}
                          </div>
                        )}
                      </>
                    )}

                    {section.id === 'details' && (
                      <>
                        <DetailField label="ID" value={selectedItem.id} mono />
                        <DetailField label="Item Type" value={selectedItem.itemType} />
                        <DetailField label="World Type" value={selectedItem.worldType || 'Universal'} />
                        <DetailField label="Object Role" value={selectedItem.objectRole || 'None'} />
                        {selectedItem.category && <DetailField label="Category" value={selectedItem.category} />}
                        {selectedItem.material && <DetailField label="Material" value={selectedItem.material} />}
                        {selectedItem.baseType && <DetailField label="Base Type" value={selectedItem.baseType} />}
                        <DetailField label="Rarity" value={selectedItem.rarity || 'common'} />
                        <DetailField label="Value" value={`${selectedItem.value || 0} (sell: ${selectedItem.sellValue || 0})`} />
                        <DetailField label="Weight" value={String(selectedItem.weight || 1)} />
                        <DetailField label="Possessable" value={selectedItem.possessable !== false ? 'Yes' : 'No'} />
                      </>
                    )}
                  </div>
                </ScrollArea>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ─── Root ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-[calc(100vh-10rem)] min-h-[480px] rounded-lg border overflow-hidden bg-background">
      <div className="w-56 shrink-0 flex flex-col">
        {renderLeft()}
      </div>
      {renderCenter()}
      {selectedItem && renderRight()}

    </div>
  );
}

// ─── Helper Components ─────────────────────────────────────────────────────

function DetailField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={`text-xs break-words ${mono ? 'font-mono select-all text-[10px]' : ''}`}>{value}</p>
    </div>
  );
}

function PropertyCard({ label, value, icon }: { label: string; value: string; icon?: string }) {
  return (
    <div className="rounded-lg border px-3 py-2 bg-muted/20">
      <div className="text-[10px] text-muted-foreground">{icon && <span className="mr-1">{icon}</span>}{label}</div>
      <div className="text-sm font-medium capitalize">{value}</div>
    </div>
  );
}
