import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import {
  Search, ChevronRight, ChevronDown, Info, Package, Box,
  Sword, Shield, FlaskConical, Apple, Hammer, Gem, Key, ScrollText,
  AlertTriangle, ImageIcon, RefreshCw, Plus, Trash2, Copy,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ModelPreview } from "../ModelPreview";
import { AssetSelect } from "../AssetSelect";
import type { AssetCollection, VisualAsset } from "@shared/schema";

interface ItemTranslation {
  targetWord: string;
  pronunciation: string;
  category: string;
}

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
  visualAssetId?: string;
  category?: string;
  material?: string;
  baseType?: string;
  rarity?: string;
  effects?: Record<string, number>;
  tags?: string[];
  possessable?: boolean;
  loreText?: string;
  isBase?: boolean;
  translations?: Record<string, ItemTranslation>;
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
  quest: 'Quest Items', container: 'Containers', decoration: 'Decorations',
  document: 'Documents', equipment: 'Equipment', accessory: 'Accessories',
  ammunition: 'Ammunition', furniture: 'Furniture',
};

const RARITY_COLORS: Record<string, string> = {
  common: 'text-muted-foreground',
  uncommon: 'text-green-600',
  rare: 'text-blue-500',
  epic: 'text-purple-500',
  legendary: 'text-amber-500',
};

interface AdminItemsHubProps {
  worldId?: string;
}

export function AdminItemsHub({ worldId }: AdminItemsHubProps = {}) {
  const { toast } = useToast();
  const { token } = useAuth();
  const queryClient = useQueryClient();

  // Data
  const [searchQuery, setSearchQuery] = useState("");
  const [worldTypeFilter, setWorldTypeFilter] = useState<string>("all");
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<BaseItem | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  const [viewMode, setViewMode] = useState<'base' | 'world'>(worldId ? 'world' : 'base');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState<Record<string, any>>({});

  // Right panel
  const [expandedSection, setExpandedSection] = useState<'preview' | 'details' | null>('details');

  // Groups
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const headers = (): Record<string, string> => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  };

  // Fetch base items
  const { data: baseItems = [], isLoading: baseLoading } = useQuery<BaseItem[]>({
    queryKey: ['/api/items/base'],
    queryFn: async () => {
      const res = await fetch('/api/items/base');
      if (!res.ok) throw new Error('Failed to fetch base items');
      return res.json();
    },
  });

  // Fetch world items (only world-specific, not base items)
  const { data: worldItems = [], isLoading: worldLoading } = useQuery<BaseItem[]>({
    queryKey: ['/api/items/world', worldId],
    queryFn: async () => {
      if (!worldId) return [];
      const res = await fetch(`/api/worlds/${worldId}/items`);
      if (!res.ok) return [];
      const all: BaseItem[] = await res.json();
      // Filter to only world-specific items (exclude base items)
      return all.filter(i => !i.isBase);
    },
    enabled: !!worldId,
  });

  const isLoading = viewMode === 'base' ? baseLoading : worldLoading;
  const activeItems = viewMode === 'base' ? baseItems : worldItems;

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

  // Resolve item → VisualAsset for preview (checks visualAssetId first, then objectRole collections)
  const resolveItemAsset = (item: any): VisualAsset | null => {
    // Strategy 1: Direct visualAssetId lookup (asset-first items)
    if (item?.visualAssetId) {
      const asset = allAssets.find(a => a.id === item.visualAssetId);
      if (asset) return asset;
    }
    // Strategy 2: objectRole → collection objectModels lookup
    if (!item?.objectRole) return null;
    for (const col of collections) {
      const assetId = (col.objectModels || {} as Record<string, string>)[item.objectRole];
      if (assetId) {
        const asset = allAssets.find(a => a.id === assetId);
        if (asset) return asset;
      }
    }
    return null;
  };
  // Keep backward compat alias
  const resolveObjectRoleAsset = (objectRole: string | undefined | null): VisualAsset | null => {
    return resolveItemAsset({ objectRole });
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

  // Mutation to update item fields (name, description, etc.)
  const updateItem = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BaseItem> }) => {
      const res = await apiRequest('PUT', `/api/items/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/base-items'] });
      toast({ title: 'Item Updated', description: 'Base item has been updated.' });
    },
    onError: (err: any) => {
      toast({ title: 'Failed to update', description: err.message, variant: 'destructive' });
    },
  });

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
    let result = activeItems;
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
    if (propertyFilter === 'has_asset') {
      result = result.filter(i => !!i.visualAssetId || !!i.objectRole);
    } else if (propertyFilter === 'procedural') {
      result = result.filter(i => i.itemType === 'environmental' || i.tags?.includes('permanent'));
    } else if (propertyFilter === 'possessable') {
      result = result.filter(i => i.possessable === true);
    } else if (propertyFilter === 'not_possessable') {
      result = result.filter(i => i.possessable === false || i.possessable === undefined);
    }
    return result;
  }, [activeItems, searchQuery, worldTypeFilter, propertyFilter]);

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
  const unmappedCount = activeItems.filter(i => !i.objectRole).length;

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
      <div className="px-3 py-2.5 border-b bg-muted/30 shrink-0">
        {worldId ? (
          <div className="flex items-center gap-1">
            <button
              className={`text-xs px-2 py-0.5 rounded font-medium transition-colors ${viewMode === 'world' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => { setViewMode('world'); setSelectedItem(null); }}
            >World ({worldItems.length})</button>
            <button
              className={`text-xs px-2 py-0.5 rounded font-medium transition-colors ${viewMode === 'base' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => { setViewMode('base'); setSelectedItem(null); }}
            >Base ({baseItems.length})</button>
            {viewMode === 'world' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 ml-auto"
                onClick={() => { setCreateForm({ itemType: 'collectible' }); setShowCreateDialog(true); }}
                title="Create new world item"
              >
                <Plus className="w-3 h-3" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Base Items ({baseItems.length})</span>
            {unmappedCount > 0 && (
              <Badge variant="outline" className="text-[10px] h-4 text-amber-500 border-amber-500/30">
                {unmappedCount} unmapped
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="px-2 py-2 border-b space-y-1.5">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Search items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-7 text-xs pl-7" />
        </div>
        <div className="flex gap-1">
          <Select value={worldTypeFilter} onValueChange={setWorldTypeFilter}>
            <SelectTrigger className="h-6 text-[10px] flex-1"><SelectValue placeholder="World Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types ({activeItems.length})</SelectItem>
              {worldTypes.map(wt => (
                <SelectItem key={wt} value={wt}>{wt} ({activeItems.filter(i => i.worldType === wt).length})</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={propertyFilter} onValueChange={setPropertyFilter}>
            <SelectTrigger className="h-6 text-[10px] flex-1"><SelectValue placeholder="Filter" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="has_asset">Has Asset</SelectItem>
              <SelectItem value="procedural">Procedural</SelectItem>
              <SelectItem value="possessable">Possessable</SelectItem>
              <SelectItem value="not_possessable">Not Possessable</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
                          <span className="truncate flex-1">
                            {item.name}
                            {item.translations && Object.values(item.translations)[0]?.targetWord && (
                              <span className="text-[10px] text-muted-foreground ml-1">
                                ({Object.values(item.translations)[0].targetWord})
                              </span>
                            )}
                          </span>
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
          <p className="text-xs">{activeItems.length} {viewMode} items across {worldTypes.length} world types</p>
        </div>
      );
    }

    const asset = resolveItemAsset(selectedItem);
    const isModel = asset && (asset.filePath?.endsWith('.glb') || asset.filePath?.endsWith('.gltf') || asset.mimeType === 'model/gltf-binary');

    return (
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="px-4 py-3 border-b shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{selectedItem.icon || '📦'}</span>
            {editingName ? (
              <form className="flex items-center gap-1 flex-1" onSubmit={(e) => {
                e.preventDefault();
                if (editNameValue.trim() && editNameValue !== selectedItem.name) {
                  updateItem.mutate({ id: selectedItem.id, data: { name: editNameValue.trim() } });
                  setSelectedItem({ ...selectedItem, name: editNameValue.trim() });
                }
                setEditingName(false);
              }}>
                <Input
                  value={editNameValue}
                  onChange={(e) => setEditNameValue(e.target.value)}
                  className="h-7 text-lg font-bold"
                  autoFocus
                  onBlur={() => {
                    if (editNameValue.trim() && editNameValue !== selectedItem.name) {
                      updateItem.mutate({ id: selectedItem.id, data: { name: editNameValue.trim() } });
                      setSelectedItem({ ...selectedItem, name: editNameValue.trim() });
                    }
                    setEditingName(false);
                  }}
                  onKeyDown={(e) => { if (e.key === 'Escape') setEditingName(false); }}
                />
              </form>
            ) : (
              <h2
                className="text-lg font-bold cursor-pointer hover:text-primary/80 transition-colors"
                onClick={() => { setEditingName(true); setEditNameValue(selectedItem.name); }}
                title="Click to rename"
              >
                {selectedItem.name}
              </h2>
            )}
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
            {selectedItem.isBase && <Badge variant="outline" className="text-xs text-emerald-500 border-emerald-500/30">Base</Badge>}
            <div className="ml-auto flex items-center gap-1">
              {worldId && viewMode === 'base' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs gap-1"
                  onClick={async () => {
                    try {
                      const res = await fetch(`/api/worlds/${worldId}/items`, {
                        method: 'POST',
                        headers: headers(),
                        body: JSON.stringify({ ...selectedItem, id: undefined, isBase: false, worldId }),
                      });
                      if (res.ok) {
                        toast({ title: 'Copied to world', description: `"${selectedItem.name}" added as a world item` });
                        queryClient.invalidateQueries({ queryKey: ['/api/items/world', worldId] });
                      }
                    } catch { toast({ title: 'Failed to copy', variant: 'destructive' }); }
                  }}
                >
                  <Copy className="w-3 h-3" /> Copy to World
                </Button>
              )}
              {viewMode === 'world' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={async () => {
                    if (!confirm(`Delete "${selectedItem.name}"?`)) return;
                    try {
                      await fetch(`/api/items/${selectedItem.id}`, { method: 'DELETE', headers: headers() });
                      setSelectedItem(null);
                      queryClient.invalidateQueries({ queryKey: ['/api/items/world', worldId] });
                      toast({ title: 'Item deleted' });
                    } catch { toast({ title: 'Failed to delete', variant: 'destructive' }); }
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
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

            {/* Translations */}
            <div>
              <h3 className="text-xs font-semibold mb-2 text-muted-foreground flex items-center gap-1">
                🌐 Translations
                {!selectedItem.translations && <span className="text-amber-500 text-[10px] font-normal">(none)</span>}
              </h3>
              {selectedItem.translations && Object.keys(selectedItem.translations).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(selectedItem.translations).map(([lang, trans]) => (
                    <div key={lang} className="rounded border p-2 bg-muted/20 space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-[10px]">{lang}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Target Word</Label>
                          <Input
                            className="h-7 text-sm"
                            defaultValue={trans.targetWord || ''}
                            onBlur={(e) => {
                              const val = e.target.value.trim();
                              if (val !== trans.targetWord) {
                                const updatedTranslations = {
                                  ...selectedItem.translations,
                                  [lang]: { ...trans, targetWord: val },
                                };
                                updateItem.mutate({ id: selectedItem.id, data: { translations: updatedTranslations } as any });
                                setSelectedItem({ ...selectedItem, translations: updatedTranslations });
                              }
                            }}
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Pronunciation</Label>
                          <Input
                            className="h-7 text-sm"
                            defaultValue={trans.pronunciation || ''}
                            onBlur={(e) => {
                              const val = e.target.value.trim();
                              if (val !== trans.pronunciation) {
                                const updatedTranslations = {
                                  ...selectedItem.translations,
                                  [lang]: { ...trans, pronunciation: val },
                                };
                                updateItem.mutate({ id: selectedItem.id, data: { translations: updatedTranslations } as any });
                                setSelectedItem({ ...selectedItem, translations: updatedTranslations });
                              }
                            }}
                          />
                        </div>
                      </div>
                      {trans.category && (
                        <div className="text-[10px] text-muted-foreground">Category: {trans.category}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No translations. Run the translation migration to generate them.
                </p>
              )}
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

    const asset = resolveItemAsset(selectedItem);
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
      {/* Right asset preview panel removed — details shown in center panel */}

      {/* Create Item Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Item</DialogTitle>
            <DialogDescription>Add a new item to this world.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Name *</Label>
              <Input value={createForm.name || ''} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} placeholder="Iron Sword" className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Description</Label>
              <textarea className="w-full bg-muted/50 border border-border rounded px-2 py-1 text-sm h-16 resize-none"
                value={createForm.description || ''} onChange={e => setCreateForm({ ...createForm, description: e.target.value })} placeholder="A sturdy iron sword." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Type</Label>
                <select className="w-full bg-muted/50 border border-border rounded px-2 py-1 text-sm h-8"
                  value={createForm.itemType || 'collectible'} onChange={e => setCreateForm({ ...createForm, itemType: e.target.value })}>
                  {Object.entries(ITEM_TYPE_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-xs">Icon</Label>
                <Input value={createForm.icon || ''} onChange={e => setCreateForm({ ...createForm, icon: e.target.value })} placeholder="emoji" className="h-8 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Value</Label>
                <Input type="number" value={createForm.value || 0} onChange={e => setCreateForm({ ...createForm, value: parseInt(e.target.value) || 0 })} className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Sell Value</Label>
                <Input type="number" value={createForm.sellValue || 0} onChange={e => setCreateForm({ ...createForm, sellValue: parseInt(e.target.value) || 0 })} className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Weight</Label>
                <Input type="number" step="0.1" value={createForm.weight || 1} onChange={e => setCreateForm({ ...createForm, weight: parseFloat(e.target.value) || 1 })} className="h-8 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={createForm.tradeable !== false} onChange={e => setCreateForm({ ...createForm, tradeable: e.target.checked })} />
                Tradeable
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={createForm.stackable !== false} onChange={e => setCreateForm({ ...createForm, stackable: e.target.checked })} />
                Stackable
              </label>
              <div>
                <Label className="text-xs">Max Stack</Label>
                <Input type="number" value={createForm.maxStack || 99} onChange={e => setCreateForm({ ...createForm, maxStack: parseInt(e.target.value) || 99 })} className="h-8 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Object Role</Label>
                <Input value={createForm.objectRole || ''} onChange={e => setCreateForm({ ...createForm, objectRole: e.target.value })} placeholder="e.g. sword, shield" className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Loot Weight</Label>
                <Input type="number" value={createForm.lootWeight || 0} onChange={e => setCreateForm({ ...createForm, lootWeight: parseInt(e.target.value) || 0 })} className="h-8 text-sm" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Tags (comma separated)</Label>
              <Input value={createForm.tags || ''} onChange={e => setCreateForm({ ...createForm, tags: e.target.value })} placeholder="weapon, melee, loot" className="h-8 text-sm" />
            </div>
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={!!createForm.possessable} onChange={e => setCreateForm({ ...createForm, possessable: e.target.checked })} />
              Possessable (player can pick up)
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button disabled={!createForm.name} onClick={async () => {
              try {
                const tags = createForm.tags ? createForm.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [];
                const res = await fetch(`/api/worlds/${worldId}/items`, {
                  method: 'POST',
                  headers: headers(),
                  body: JSON.stringify({ ...createForm, tags, worldId }),
                });
                if (res.ok) {
                  const newItem = await res.json();
                  queryClient.invalidateQueries({ queryKey: ['/api/items/world', worldId] });
                  setShowCreateDialog(false);
                  setCreateForm({});
                  setSelectedItem(newItem);
                  toast({ title: 'Item created', description: `"${newItem.name}" added to world` });
                }
              } catch { toast({ title: 'Failed to create item', variant: 'destructive' }); }
            }}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
