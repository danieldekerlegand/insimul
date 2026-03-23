import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useWorldPermissions } from '@/hooks/use-world-permissions';
import {
  Package, Plus, ChevronRight, ChevronDown, Edit, Save, X, Trash2, Copy,
  BookOpen, Scroll, Languages, Image, Box, Loader2,
} from 'lucide-react';
import { ModelPreview } from '@/components/ModelPreview';
import type { VisualAsset } from '@shared/schema';

interface ItemsHubProps {
  worldId: string;
}

const ITEM_TYPE_LABELS: Record<string, string> = {
  weapon: 'Weapons',
  armor: 'Armor',
  consumable: 'Consumables',
  food: 'Food',
  drink: 'Drinks',
  tool: 'Tools',
  material: 'Materials',
  collectible: 'Collectibles',
  key: 'Key Items',
  quest: 'Quest Items',
};

const ITEM_TYPE_COLORS: Record<string, string> = {
  weapon: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  armor: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  consumable: 'bg-green-500/10 text-green-500 border-green-500/20',
  food: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  drink: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  tool: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  material: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  collectible: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  key: 'bg-red-500/10 text-red-500 border-red-500/20',
  quest: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
};

type TreeSection = 'world' | 'base';

interface BaseResourceConfig {
  enabledBaseItems: string[];
  disabledBaseItems: string[];
}

export function ItemsHub({ worldId }: ItemsHubProps) {
  const { toast } = useToast();
  const { canEdit } = useWorldPermissions(worldId);

  const [items, setItems] = useState<any[]>([]);
  const [baseItems, setBaseItems] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState<TreeSection>('world');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [truths, setTruths] = useState<any[]>([]);
  const [quests, setQuests] = useState<any[]>([]);
  const [baseConfig, setBaseConfig] = useState<BaseResourceConfig>({
    enabledBaseItems: [],
    disabledBaseItems: [],
  });

  // Asset preview state
  const [worldAssets, setWorldAssets] = useState<VisualAsset[]>([]);
  const [world3DConfig, setWorld3DConfig] = useState<Record<string, any> | null>(null);
  const [baseAssetCollections, setBaseAssetCollections] = useState<any[]>([]);

  // Load truths and quests for detail sections
  useEffect(() => {
    if (!worldId) return;
    Promise.all([
      fetch(`/api/worlds/${worldId}/truths`).then(r => r.ok ? r.json() : []),
      fetch(`/api/worlds/${worldId}/quests`).then(r => r.ok ? r.json() : []),
    ]).then(([t, q]) => {
      setTruths(t);
      setQuests(q);
    }).catch(() => {});
  }, [worldId]);

  // Load world assets and 3D config for asset preview
  useEffect(() => {
    if (!worldId) return;
    Promise.all([
      fetch(`/api/worlds/${worldId}/assets`).then(r => r.ok ? r.json() : []),
      fetch(`/api/worlds/${worldId}/3d-config`).then(r => r.ok ? r.json() : null),
      fetch('/api/asset-collections?isBase=true').then(r => r.ok ? r.json() : []),
    ]).then(async ([assets, config, baseCollections]) => {
      setWorld3DConfig(config);
      setBaseAssetCollections(baseCollections);

      // Collect all asset IDs referenced in base collection objectModels/questObjectModels
      // that aren't already in the world assets, and fetch them in bulk
      const worldAssetIds = new Set(assets.map((a: VisualAsset) => a.id));
      const missingIds = new Set<string>();
      for (const collection of baseCollections) {
        for (const models of [collection.objectModels, collection.questObjectModels]) {
          if (!models) continue;
          for (const ref of Object.values(models)) {
            if (typeof ref === 'string' && !ref.startsWith('${') && !worldAssetIds.has(ref)) {
              missingIds.add(ref);
            }
          }
        }
      }

      if (missingIds.size > 0) {
        try {
          const res = await fetch('/api/assets/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: Array.from(missingIds) }),
          });
          if (res.ok) {
            const extraAssets = await res.json();
            assets = [...assets, ...extraAssets];
          }
        } catch { /* non-fatal */ }
      }

      setWorldAssets(assets);
    }).catch(() => {});
  }, [worldId]);

  // Load items and base config
  useEffect(() => {
    if (!worldId) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/worlds/${worldId}/items`).then(r => r.ok ? r.json() : []),
      fetch('/api/items/base').then(r => r.ok ? r.json() : []),
      fetch(`/api/worlds/${worldId}/base-resources/config`).then(r => r.ok ? r.json() : null),
    ]).then(async ([worldItems, base, config]) => {
      const ownItems = worldItems.filter((i: any) => i.worldId === worldId);
      setItems(ownItems);
      setBaseItems(base);
      if (config) {
        setBaseConfig({
          enabledBaseItems: config.enabledBaseItems || [],
          disabledBaseItems: config.disabledBaseItems || [],
        });
      }

      // Fetch visual assets referenced by items' visualAssetId
      const allItems = [...ownItems, ...base];
      const missingAssetIds: string[] = [];
      const seen = new Set(worldAssets.map(a => a.id));
      for (const item of allItems) {
        if (item.visualAssetId && !seen.has(item.visualAssetId)) {
          seen.add(item.visualAssetId);
          missingAssetIds.push(item.visualAssetId);
        }
      }
      if (missingAssetIds.length > 0) {
        try {
          // Batch in chunks of 500 (API limit)
          const allExtra: VisualAsset[] = [];
          for (let i = 0; i < missingAssetIds.length; i += 500) {
            const chunk = missingAssetIds.slice(i, i + 500);
            const res = await fetch('/api/assets/bulk', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids: chunk }),
            });
            if (res.ok) {
              const extras = await res.json();
              allExtra.push(...extras);
            }
          }
          if (allExtra.length > 0) {
            setWorldAssets(prev => [...prev, ...allExtra]);
          }
        } catch { /* non-fatal */ }
      }

      setLoading(false);
    }).catch(() => setLoading(false));
  }, [worldId]); // eslint-disable-line react-hooks/exhaustive-deps

  const isBaseItemEnabled = (itemId: string): boolean => {
    if (baseConfig.disabledBaseItems.includes(itemId)) return false;
    return baseConfig.enabledBaseItems.includes(itemId) || baseConfig.enabledBaseItems.length === 0;
  };

  const handleToggleBaseItem = async (itemId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/worlds/${worldId}/base-resources/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId: itemId, resourceType: 'item', enabled }),
      });
      if (!response.ok) throw new Error('Failed to toggle');
      const { config } = await response.json();
      setBaseConfig({
        enabledBaseItems: config.enabledBaseItems || [],
        disabledBaseItems: config.disabledBaseItems || [],
      });
      toast({
        title: 'Success',
        description: `Base item ${enabled ? 'enabled' : 'disabled'} for this world`,
      });
    } catch {
      toast({ title: 'Error', description: 'Failed to toggle base item', variant: 'destructive' });
    }
  };

  // Group items by type
  const groupedWorldItems = useMemo(() => {
    const groups: Record<string, any[]> = {};
    for (const item of items) {
      const type = item.itemType || 'collectible';
      if (!groups[type]) groups[type] = [];
      groups[type].push(item);
    }
    return groups;
  }, [items]);

  const groupedBaseItems = useMemo(() => {
    const groups: Record<string, any[]> = {};
    for (const item of baseItems) {
      const type = item.itemType || 'collectible';
      if (!groups[type]) groups[type] = [];
      groups[type].push(item);
    }
    return groups;
  }, [baseItems]);

  // Find an asset by ID or file path (collections may store either)
  const findAsset = (ref: string, assets: VisualAsset[]): VisualAsset | null => {
    // Try by ID first
    const byId = assets.find(a => a.id === ref);
    if (byId) return byId;
    // Try by file path (template-populated collections store paths like "/assets/...")
    const normalizedRef = ref.startsWith('/') ? ref.slice(1) : ref;
    const byPath = assets.find(a => {
      const normalizedPath = a.filePath.startsWith('/') ? a.filePath.slice(1) : a.filePath;
      return normalizedPath === normalizedRef || a.filePath === ref;
    });
    return byPath || null;
  };

  // Resolve the asset reference for an item based on its objectRole.
  // Returns either a VisualAsset record or a raw file path string.
  const resolveItemAsset = (item: any): { asset: VisualAsset | null; filePath: string | null } => {
    // Strategy 0: Direct visualAssetId lookup (asset-first items)
    if (item?.visualAssetId) {
      const asset = worldAssets.find(a => a.id === item.visualAssetId);
      if (asset) return { asset, filePath: asset.filePath };
    }

    if (!item?.objectRole) return { asset: null, filePath: null };

    const role = item.objectRole;

    // Strategy 1: Check world 3D config objectModels (maps role -> assetId or filePath)
    if (world3DConfig?.objectModels) {
      const ref = world3DConfig.objectModels[role];
      if (ref) {
        const asset = findAsset(ref, worldAssets);
        if (asset) return { asset, filePath: asset.filePath };
        // ref might be a direct file path
        if (ref.includes('/') || ref.match(/\.(glb|gltf|png|jpg|webp)$/i)) {
          return { asset: null, filePath: ref };
        }
      }
    }

    // Strategy 2: Check base asset collections objectModels
    for (const collection of baseAssetCollections) {
      if (collection.objectModels) {
        const ref = collection.objectModels[role];
        if (ref && !ref.startsWith('${')) {
          const asset = findAsset(ref, worldAssets);
          if (asset) return { asset, filePath: asset.filePath };
          if (ref.includes('/') || ref.match(/\.(glb|gltf|png|jpg|webp)$/i)) {
            return { asset: null, filePath: ref };
          }
        }
      }
      // Also check questObjectModels
      if (collection.questObjectModels) {
        const ref = collection.questObjectModels[role];
        if (ref && !ref.startsWith('${')) {
          const asset = findAsset(ref, worldAssets);
          if (asset) return { asset, filePath: asset.filePath };
          if (ref.includes('/') || ref.match(/\.(glb|gltf|png|jpg|webp)$/i)) {
            return { asset: null, filePath: ref };
          }
        }
      }
    }

    // Strategy 3: Search world assets by semantic role metadata or tags
    const byMetadata = worldAssets.find(a => {
      const meta = a.metadata as Record<string, any> | null;
      return meta?.semanticRole === role;
    });
    if (byMetadata) return { asset: byMetadata, filePath: byMetadata.filePath };

    // Strategy 4: Search world assets by name containing the role
    const byName = worldAssets.find(a =>
      a.name.toLowerCase().includes(role.toLowerCase()) ||
      (a.tags as string[] || []).includes(role)
    );
    if (byName) return { asset: byName, filePath: byName.filePath };

    return { asset: null, filePath: null };
  };

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const handleCreate = async () => {
    try {
      const res = await fetch(`/api/worlds/${worldId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          worldId,
        }),
      });
      if (res.ok) {
        const newItem = await res.json();
        setItems(prev => [...prev, newItem]);
        setShowCreateForm(false);
        setEditForm({});
        toast({ title: 'Item created', description: `"${newItem.name}" added to world` });
      } else {
        toast({ title: 'Error', description: 'Failed to create item', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to create item', variant: 'destructive' });
    }
  };

  const handleSave = async () => {
    if (!selectedItem) return;
    try {
      const res = await fetch(`/api/items/${selectedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
        setSelectedItem(updated);
        setIsEditing(false);
        toast({ title: 'Item updated' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update item', variant: 'destructive' });
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      const res = await fetch(`/api/items/${itemId}`, { method: 'DELETE' });
      if (res.ok) {
        setItems(prev => prev.filter(i => i.id !== itemId));
        if (selectedItem?.id === itemId) setSelectedItem(null);
        toast({ title: 'Item deleted' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete item', variant: 'destructive' });
    }
  };

  const handleImportBase = async (baseItem: any) => {
    const { id, _id, isBase, createdAt, updatedAt, ...data } = baseItem;
    try {
      const res = await fetch(`/api/worlds/${worldId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, worldId, isBase: false }),
      });
      if (res.ok) {
        const imported = await res.json();
        setItems(prev => [...prev, imported]);
        toast({ title: 'Item imported', description: `"${imported.name}" copied to world for customization` });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to import item', variant: 'destructive' });
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map(i => i.id)));
    }
  };

  const handleBulkDelete = async () => {
    try {
      const res = await fetch(`/api/worlds/${worldId}/items/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      if (res.ok) {
        const { deleted } = await res.json();
        toast({ title: `${deleted} item${deleted !== 1 ? 's' : ''} deleted` });
        setSelectedIds(new Set());
        if (selectedIds.has(selectedItem?.id)) setSelectedItem(null);
        // Refresh items
        const worldItemsRes = await fetch(`/api/worlds/${worldId}/items`);
        if (worldItemsRes.ok) {
          const worldItems = await worldItemsRes.json();
          setItems(worldItems.filter((i: any) => i.worldId === worldId));
        }
      } else {
        toast({ title: 'Failed to delete items', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Failed to delete items', variant: 'destructive' });
    }
    setBulkDeleteOpen(false);
  };

  const startEdit = (item: any) => {
    setEditForm({
      name: item.name || '',
      description: item.description || '',
      itemType: item.itemType || 'collectible',
      icon: item.icon || '',
      value: item.value || 0,
      sellValue: item.sellValue || 0,
      weight: item.weight || 1,
      tradeable: item.tradeable !== false,
      stackable: item.stackable !== false,
      maxStack: item.maxStack || 99,
      objectRole: item.objectRole || '',
      lootWeight: item.lootWeight || 0,
      tags: (item.tags || []).join(', '),
    });
    setIsEditing(true);
  };

  const startCreate = () => {
    setEditForm({
      name: '',
      description: '',
      itemType: 'collectible',
      icon: '',
      value: 0,
      sellValue: 0,
      weight: 1,
      tradeable: true,
      stackable: true,
      maxStack: 99,
      objectRole: '',
      lootWeight: 0,
      tags: '',
    });
    setShowCreateForm(true);
    setSelectedItem(null);
    setIsEditing(false);
  };

  const renderItemForm = (isCreate: boolean) => (
    <div className="space-y-3 p-4">
      <div>
        <Label className="text-xs text-muted-foreground">Name</Label>
        <input className="w-full bg-muted/50 border border-border rounded px-2 py-1 text-sm"
          value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Description</Label>
        <textarea className="w-full bg-muted/50 border border-border rounded px-2 py-1 text-sm h-16 resize-none"
          value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">Type</Label>
          <select className="w-full bg-muted/50 border border-border rounded px-2 py-1 text-sm"
            value={editForm.itemType || 'collectible'} onChange={e => setEditForm({ ...editForm, itemType: e.target.value })}>
            {Object.entries(ITEM_TYPE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Icon</Label>
          <input className="w-full bg-muted/50 border border-border rounded px-2 py-1 text-sm"
            value={editForm.icon || ''} onChange={e => setEditForm({ ...editForm, icon: e.target.value })}
            placeholder="emoji or text" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">Value</Label>
          <input type="number" className="w-full bg-muted/50 border border-border rounded px-2 py-1 text-sm"
            value={editForm.value || 0} onChange={e => setEditForm({ ...editForm, value: parseInt(e.target.value) || 0 })} />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Sell Value</Label>
          <input type="number" className="w-full bg-muted/50 border border-border rounded px-2 py-1 text-sm"
            value={editForm.sellValue || 0} onChange={e => setEditForm({ ...editForm, sellValue: parseInt(e.target.value) || 0 })} />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Weight</Label>
          <input type="number" step="0.1" className="w-full bg-muted/50 border border-border rounded px-2 py-1 text-sm"
            value={editForm.weight || 1} onChange={e => setEditForm({ ...editForm, weight: parseFloat(e.target.value) || 1 })} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={editForm.tradeable !== false}
            onChange={e => setEditForm({ ...editForm, tradeable: e.target.checked })} />
          <Label className="text-xs">Tradeable</Label>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={editForm.stackable !== false}
            onChange={e => setEditForm({ ...editForm, stackable: e.target.checked })} />
          <Label className="text-xs">Stackable</Label>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Max Stack</Label>
          <input type="number" className="w-full bg-muted/50 border border-border rounded px-2 py-1 text-sm"
            value={editForm.maxStack || 99} onChange={e => setEditForm({ ...editForm, maxStack: parseInt(e.target.value) || 99 })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">Object Role</Label>
          <input className="w-full bg-muted/50 border border-border rounded px-2 py-1 text-sm"
            value={editForm.objectRole || ''} onChange={e => setEditForm({ ...editForm, objectRole: e.target.value })}
            placeholder="e.g. sword, shield, potion" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Loot Weight</Label>
          <input type="number" className="w-full bg-muted/50 border border-border rounded px-2 py-1 text-sm"
            value={editForm.lootWeight || 0} onChange={e => setEditForm({ ...editForm, lootWeight: parseInt(e.target.value) || 0 })} />
        </div>
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Tags (comma separated)</Label>
        <input className="w-full bg-muted/50 border border-border rounded px-2 py-1 text-sm"
          value={editForm.tags || ''} onChange={e => setEditForm({ ...editForm, tags: e.target.value })}
          placeholder="weapon, loot:common, melee" />
      </div>
      <div className="flex gap-2 pt-2">
        <Button size="sm" onClick={() => {
          const data = {
            ...editForm,
            tags: editForm.tags ? editForm.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
          };
          if (isCreate) {
            setEditForm(data);
            handleCreate();
          } else {
            setEditForm(data);
            handleSave();
          }
        }}>
          <Save className="h-3 w-3 mr-1" /> {isCreate ? 'Create' : 'Save'}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => { setIsEditing(false); setShowCreateForm(false); }}>
          <X className="h-3 w-3 mr-1" /> Cancel
        </Button>
      </div>
    </div>
  );

  const renderTreeSection = (section: TreeSection, grouped: Record<string, any[]>) => (
    <div className="space-y-1">
      {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([type, typeItems]) => (
        <div key={type}>
          <button
            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted/50 rounded transition-colors"
            onClick={() => toggleGroup(`${section}-${type}`)}
          >
            {expandedGroups.has(`${section}-${type}`) ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            <span className="font-medium">{ITEM_TYPE_LABELS[type] || type}</span>
            <Badge variant="secondary" className="ml-auto text-[10px] h-4">{typeItems.length}</Badge>
          </button>
          {expandedGroups.has(`${section}-${type}`) && (
            <div className="ml-5 space-y-0.5">
              {typeItems.map((item: any) => {
                const isBase = section === 'base';
                const enabled = isBase ? isBaseItemEnabled(item.id) : true;
                return (
                  <div
                    key={item.id}
                    className={`w-full flex items-center gap-2 px-2 py-1 text-xs rounded transition-colors ${
                      selectedItem?.id === item.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted/30 text-muted-foreground'
                    } ${isBase && !enabled ? 'opacity-50' : ''}`}
                  >
                    {!isBase && canEdit && (
                      <Checkbox
                        checked={selectedIds.has(item.id)}
                        onClick={(e) => e.stopPropagation()}
                        onCheckedChange={() => toggleSelection(item.id)}
                        className="h-3 w-3 flex-shrink-0"
                      />
                    )}
                    <button
                      className="flex items-center gap-2 flex-1 min-w-0 text-left"
                      onClick={() => { setSelectedItem(item); setIsEditing(false); setShowCreateForm(false); }}
                    >
                      <span>{item.icon || '?'}</span>
                      <span className="truncate">{item.name}</span>
                    </button>
                    {isBase && canEdit && (
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) => handleToggleBaseItem(item.id, checked)}
                        className="ml-auto flex-shrink-0 scale-75"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  if (loading) {
    return <div className="flex items-center justify-center p-12 text-muted-foreground">Loading items...</div>;
  }

  // Resolve asset for currently selected item
  const selectedItemResolved = selectedItem ? resolveItemAsset(selectedItem) : { asset: null, filePath: null };

  const renderAssetPreview = () => {
    if (!selectedItem) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm p-4 text-center">
          <Image className="w-8 h-8 mb-2 opacity-30" />
          <span>Select an item to preview its asset</span>
        </div>
      );
    }

    const { asset, filePath } = selectedItemResolved;
    const previewPath = filePath
      ? (filePath.startsWith('/') ? filePath : `/${filePath}`)
      : null;
    const isModel = previewPath?.match(/\.(glb|gltf)$/i) || asset?.mimeType?.includes('model');
    const isImage = previewPath?.match(/\.(png|jpg|jpeg|webp|svg)$/i) || asset?.mimeType?.startsWith('image/');

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center p-3">
          {previewPath ? (
            isModel ? (
              <div className="w-full aspect-square rounded-lg overflow-hidden bg-muted/20">
                <ModelPreview modelPath={previewPath} showControls={true} className="w-full h-full" />
              </div>
            ) : isImage ? (
              <div className="w-full aspect-square rounded-lg overflow-hidden bg-muted/20 flex items-center justify-center">
                <img src={previewPath} alt={asset?.name || selectedItem.name} className="max-w-full max-h-full object-contain" />
              </div>
            ) : (
              <div className="text-center text-muted-foreground text-xs">
                <Box className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>Asset: {asset?.name || previewPath.split('/').pop()}</p>
                <p className="text-[10px] mt-1">{previewPath}</p>
              </div>
            )
          ) : (
            <div className="text-center text-muted-foreground text-xs">
              <Image className="w-8 h-8 mx-auto mb-2 opacity-30" />
              {selectedItem.objectRole ? (
                <p>No asset mapped for role <code className="bg-muted px-1 rounded">{selectedItem.objectRole}</code></p>
              ) : (
                <p>No object role assigned</p>
              )}
            </div>
          )}
        </div>

        {/* Asset metadata */}
        {(asset || previewPath) && (
          <div className="border-t p-3 space-y-1.5 text-xs">
            {asset && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="truncate ml-2 font-medium">{asset.name}</span>
              </div>
            )}
            {asset?.assetType && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Type</span>
                <Badge variant="secondary" className="text-[10px]">{asset.assetType}</Badge>
              </div>
            )}
            {selectedItem.objectRole && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Role</span>
                <code className="bg-muted px-1 rounded text-[10px]">{selectedItem.objectRole}</code>
              </div>
            )}
            {previewPath && !asset && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Path</span>
                <span className="truncate ml-2 text-[10px] font-mono">{previewPath}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
    <div className="flex h-[calc(100vh-10rem)] min-h-[480px] rounded-lg border overflow-hidden bg-background">
      {/* Left Panel - Tree */}
      <div className="w-56 shrink-0 min-w-0 flex flex-col overflow-hidden border-r">
        <div className="flex items-center justify-between px-3 py-2.5 border-b bg-muted/30 shrink-0">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Items</span>
          {canEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={startCreate}
              title="Add item"
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>

        <div className="flex border-b">
          <button
            className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${activeSection === 'world' ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveSection('world')}
          >
            World ({items.length})
          </button>
          <button
            className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${activeSection === 'base' ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveSection('base')}
          >
            Base ({baseItems.length})
          </button>
        </div>

        {activeSection === 'world' && canEdit && items.length > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 border-b bg-muted/20">
            <Button variant="ghost" size="sm" className="h-6 text-[10px] px-1.5" onClick={toggleSelectAll}>
              {selectedIds.size === items.length ? 'Deselect All' : 'Select All'}
            </Button>
            {selectedIds.size > 0 && (
              <Button variant="ghost" size="sm" className="h-6 text-[10px] px-1.5 text-destructive hover:text-destructive" onClick={() => setBulkDeleteOpen(true)}>
                <Trash2 className="w-3 h-3 mr-1" />
                Delete ({selectedIds.size})
              </Button>
            )}
          </div>
        )}

        <ScrollArea className="flex-1">
          <div className="p-2">
            {activeSection === 'world' && (
              items.length === 0 ? (
                <div className="text-center text-muted-foreground text-xs py-8">
                  No custom items yet.
                </div>
              ) : renderTreeSection('world', groupedWorldItems)
            )}
            {activeSection === 'base' && (
              baseItems.length === 0 ? (
                <div className="text-center text-muted-foreground text-xs py-8">
                  No base items available.
                </div>
              ) : renderTreeSection('base', groupedBaseItems)
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Center Panel - Detail/Edit */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <ScrollArea className="h-full">
          {showCreateForm ? (
            <div>
              <div className="px-3 py-2.5 border-b bg-muted/30">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Create New Item</span>
              </div>
              {renderItemForm(true)}
            </div>
          ) : selectedItem ? (
            <div>
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedItem.icon || '?'}</span>
                  <div>
                    <h3 className="text-sm font-semibold">{selectedItem.name}</h3>
                    <Badge variant="outline" className={`text-[10px] ${ITEM_TYPE_COLORS[selectedItem.itemType] || ''}`}>
                      {selectedItem.itemType}
                    </Badge>
                    {selectedItem.isBase && <Badge variant="secondary" className="ml-1 text-[10px]">Base</Badge>}
                  </div>
                </div>
                {canEdit && !selectedItem.isBase && (
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => startEdit(selectedItem)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(selectedItem.id)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                )}
                {selectedItem.isBase && canEdit && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {isBaseItemEnabled(selectedItem.id) ? 'Enabled' : 'Disabled'}
                    </span>
                    <Switch
                      checked={isBaseItemEnabled(selectedItem.id)}
                      onCheckedChange={(checked) => handleToggleBaseItem(selectedItem.id, checked)}
                    />
                    <Button size="sm" variant="outline" onClick={() => handleImportBase(selectedItem)}>
                      <Copy className="h-3 w-3 mr-1" /> Copy to World
                    </Button>
                  </div>
                )}
              </div>

              {isEditing ? renderItemForm(false) : (
                <div className="p-4 space-y-4">
                  {selectedItem.description && (
                    <p className="text-sm text-muted-foreground">{selectedItem.description}</p>
                  )}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div><span className="text-muted-foreground">Value:</span> <span className="font-mono">{selectedItem.value || 0}g</span></div>
                    <div><span className="text-muted-foreground">Sell:</span> <span className="font-mono">{selectedItem.sellValue || 0}g</span></div>
                    <div><span className="text-muted-foreground">Weight:</span> <span className="font-mono">{selectedItem.weight || 1}</span></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div><span className="text-muted-foreground">Tradeable:</span> {selectedItem.tradeable !== false ? 'Yes' : 'No'}</div>
                    <div><span className="text-muted-foreground">Stackable:</span> {selectedItem.stackable !== false ? 'Yes' : 'No'}</div>
                    <div><span className="text-muted-foreground">Max Stack:</span> {selectedItem.maxStack || 99}</div>
                  </div>
                  {selectedItem.objectRole && (
                    <div className="text-sm"><span className="text-muted-foreground">Object Role:</span> <code className="bg-muted px-1 rounded">{selectedItem.objectRole}</code></div>
                  )}
                  {selectedItem.lootWeight > 0 && (
                    <div className="text-sm"><span className="text-muted-foreground">Loot Weight:</span> {selectedItem.lootWeight}</div>
                  )}
                  {selectedItem.effects && Object.keys(selectedItem.effects).length > 0 && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Effects:</span>
                      <div className="flex gap-2 mt-1">
                        {Object.entries(selectedItem.effects).map(([key, val]) => (
                          <Badge key={key} variant="outline" className="text-[10px]">{key}: +{String(val)}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedItem.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedItem.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                      ))}
                    </div>
                  )}

                  {/* Lore Truths */}
                  {selectedItem.relatedTruthIds?.length > 0 && (
                    <div className="text-sm">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground font-medium">Lore Truths</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedItem.relatedTruthIds.map((truthId: string) => {
                          const truth = truths.find((t: any) => t.id === truthId);
                          return (
                            <Badge key={truthId} variant="outline" className="text-[10px] bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                              {truth?.title || truth?.name || truthId}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Quest Relevance */}
                  {(() => {
                    const relevantQuests = quests.filter((q: any) => {
                      const id = selectedItem.id;
                      const contentMatch = q.content && typeof q.content === 'string' && q.content.includes(id);
                      const objectivesMatch = q.objectives && JSON.stringify(q.objectives).includes(id);
                      return contentMatch || objectivesMatch;
                    });
                    if (relevantQuests.length === 0) return null;
                    return (
                      <div className="text-sm">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Scroll className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground font-medium">Quest Relevance</span>
                        </div>
                        <div className="space-y-1">
                          {relevantQuests.map((q: any) => (
                            <div key={q.id} className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px] bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                                {q.name || q.title || q.id}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Language Learning Data */}
                  {selectedItem.languageLearningData && (
                    <div className="text-sm">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Languages className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground font-medium">Language Learning Data</span>
                      </div>
                      <div className="bg-muted/30 border border-border rounded-md p-3 space-y-2">
                        {selectedItem.languageLearningData.targetWord && (
                          <div><span className="text-muted-foreground">Target Word:</span> <span className="font-mono">{selectedItem.languageLearningData.targetWord}</span></div>
                        )}
                        {selectedItem.languageLearningData.targetLanguage && (
                          <div><span className="text-muted-foreground">Language:</span> {selectedItem.languageLearningData.targetLanguage}</div>
                        )}
                        {selectedItem.languageLearningData.pronunciation && (
                          <div><span className="text-muted-foreground">Pronunciation:</span> <span className="italic">{selectedItem.languageLearningData.pronunciation}</span></div>
                        )}
                        {selectedItem.languageLearningData.category && (
                          <div><span className="text-muted-foreground">Category:</span> <Badge variant="secondary" className="text-[10px] ml-1">{selectedItem.languageLearningData.category}</Badge></div>
                        )}
                        {Object.entries(selectedItem.languageLearningData)
                          .filter(([key]) => !['targetWord', 'targetLanguage', 'pronunciation', 'category'].includes(key))
                          .map(([key, val]) => (
                            <div key={key}><span className="text-muted-foreground">{key}:</span> {String(val)}</div>
                          ))
                        }
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm p-12">
              Select an item to view details, or create a new one.
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Right Panel - Asset Preview */}
      <div className="w-72 shrink-0 border-l flex flex-col min-h-0">
        <div className="flex items-center gap-1.5 px-3 py-2.5 border-b bg-muted/30 shrink-0">
          <Image className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Asset Preview</span>
        </div>
        <div className="flex-1 min-h-0 overflow-auto">
          {renderAssetPreview()}
        </div>
      </div>
    </div>
    <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {selectedIds.size} Item{selectedIds.size !== 1 ? 's' : ''}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the selected world items. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
