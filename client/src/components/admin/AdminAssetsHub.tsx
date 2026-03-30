import { useState, useMemo, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Plus, Edit, Trash2, Package, Image as ImageIcon, Sparkles, Save, X,
  Search, ChevronRight, ChevronDown, Info, Settings2, Copy,
  Layers, Download, Tag, Volume2, Box, Maximize2, ArrowUp, Wand2, TrendingUp, Upload, Play, Pause, Move,
  Building2, Users, Palette,
} from "lucide-react";
import { VisualAssetGeneratorDialog } from "../VisualAssetGeneratorDialog";
import { PolyhavenBrowserDialog } from "../PolyhavenBrowserDialog";
import { SketchfabBrowserDialog } from "../SketchfabBrowserDialog";
import { AssetSelect } from "../AssetSelect";
import { ModelPreview } from "../ModelPreview";
import { BuildingModelPreview } from "../locations/BuildingModelPreview";
import { ImageUpscaleDialog } from "../ImageUpscaleDialog";
import { ImageEnhancementDialog } from "../ImageEnhancementDialog";
import { QualityComparisonDialog } from "../QualityComparisonDialog";
import { BuildingConfigurationPanel } from "./BuildingConfigurationPanel";
import { WorldTypeCollectionEditor } from "./WorldTypeCollectionEditor";
import { ConfigDetailPanel } from "./ConfigDetailPanel";
import type { ConfigSelection } from "./config-selection";
import type { AssetCollection, VisualAsset } from "@shared/schema";
import type { ProceduralBuildingConfig, ProceduralStylePreset, ProceduralBuildingTypeOverride, Color3 as EngineColor3, NpcConfig } from "@shared/game-engine/types";
import { CategoryPresetEditorModal, type TexturePickerRequest } from "./CategoryPresetEditorModal";

const WORLD_TYPES = [
  { value: "medieval-fantasy", label: "Medieval Fantasy" },
  { value: "high-fantasy", label: "High Fantasy" },
  { value: "low-fantasy", label: "Low Fantasy" },
  { value: "dark-fantasy", label: "Dark Fantasy" },
  { value: "urban-fantasy", label: "Urban Fantasy" },
  { value: "cyberpunk", label: "Cyberpunk" },
  { value: "sci-fi-space", label: "Sci-Fi Space" },
  { value: "post-apocalyptic", label: "Post-Apocalyptic" },
  { value: "solarpunk", label: "Solarpunk" },
  { value: "steampunk", label: "Steampunk" },
  { value: "dieselpunk", label: "Dieselpunk" },
  { value: "historical-ancient", label: "Historical Ancient" },
  { value: "historical-medieval", label: "Historical Medieval" },
  { value: "historical-renaissance", label: "Historical Renaissance" },
  { value: "historical-victorian", label: "Historical Victorian" },
  { value: "creole-colonial", label: "Creole Colonial" },
  { value: "tropical-pirate", label: "Tropical Pirate" },
  { value: "wild-west", label: "Wild West" },
  { value: "modern-realistic", label: "Modern Realistic" },
  { value: "superhero", label: "Superhero" },
  { value: "horror", label: "Horror" },
  { value: "mythological", label: "Mythological" },
  { value: "generic", label: "Generic" },
];

const COLLECTION_TYPES = [
  { value: "complete_theme", label: "Complete Theme" },
  { value: "texture_pack", label: "Texture Pack" },
  { value: "character_set", label: "Character Set" },
  { value: "building_set", label: "Building Set" },
  { value: "prop_set", label: "Prop Set" },
  { value: "map_atlas", label: "Map Atlas" },
];

// ─── Asset type detection helpers ──────────────────────────────────────────

function isModelAsset(asset: VisualAsset): boolean {
  if ((asset.assetType || '').startsWith('model_')) return true;
  if (asset.mimeType === 'model/gltf-binary') return true;
  const fp = (asset.filePath || '').toLowerCase();
  return fp.endsWith('.glb') || fp.endsWith('.gltf');
}

function isAudioAsset(asset: VisualAsset): boolean {
  if ((asset.assetType || '').startsWith('audio_')) return true;
  if ((asset.mimeType || '').startsWith('audio/')) return true;
  const fp = (asset.filePath || '').toLowerCase();
  return fp.endsWith('.mp3') || fp.endsWith('.wav') || fp.endsWith('.ogg') || fp.endsWith('.m4a');
}

function isImageAsset(asset: VisualAsset): boolean {
  if (isModelAsset(asset) || isAudioAsset(asset)) return false;
  if (asset.mimeType && asset.mimeType.startsWith('image/')) return true;
  const fp = (asset.filePath || '').toLowerCase();
  return fp.endsWith('.png') || fp.endsWith('.jpg') || fp.endsWith('.jpeg') || fp.endsWith('.webp');
}

// ─── Browse modes ──────────────────────────────────────────────────────────

type BrowseMode = 'collections' | 'all-assets';

export function AdminAssetsHub() {
  const { toast } = useToast();
  const { token } = useAuth();
  const queryClient = useQueryClient();

  // Browse mode
  const [browseMode, setBrowseMode] = useState<BrowseMode>('collections');

  // Collection selection
  const [selectedCollection, setSelectedCollection] = useState<AssetCollection | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterWorldType, setFilterWorldType] = useState<string>("all");

  // Asset selection (for right panel preview)
  const [selectedAsset, setSelectedAsset] = useState<VisualAsset | null>(null);
  const [showFullscreenAsset, setShowFullscreenAsset] = useState(false);

  // All-assets browse state
  const [assetSearchQuery, setAssetSearchQuery] = useState("");
  const [assetTypeFilter, setAssetTypeFilter] = useState<string>("all");

  // Right panel
  const [expandedSection, setExpandedSection] = useState<'preview' | 'details' | 'config' | 'procedural' | 'npc' | 'category_presets' | 'building-config' | null>('preview');
  const [configSelection, setConfigSelection] = useState<ConfigSelection>(null);

  // Dialogs
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAssetGenerator, setShowAssetGenerator] = useState(false);
  const [showPolyhavenBrowser, setShowPolyhavenBrowser] = useState(false);
  const [showSketchfabBrowser, setShowSketchfabBrowser] = useState(false);
  const [generatorAssetType, setGeneratorAssetType] = useState<'character_portrait' | 'building_exterior' | 'texture_ground' | 'texture_wall' | 'texture_material'>('texture_ground');

  // Lazy model preview & audio playback (for grid items)
  const [loadedModelIds, setLoadedModelIds] = useState<string[]>([]);
  const MAX_MODEL_PREVIEWS = 16;
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const handleModelHover = (assetId: string) => {
    if (!loadedModelIds.includes(assetId)) {
      setLoadedModelIds(prev => {
        const next = [...prev, assetId];
        if (next.length > MAX_MODEL_PREVIEWS) next.shift();
        return next;
      });
    }
  };

  const handleAudioPlayPause = (e: React.MouseEvent, asset: VisualAsset) => {
    e.stopPropagation();
    const audioId = `audio-grid-${asset.id}`;
    const audioElement = document.getElementById(audioId) as HTMLAudioElement;
    if (!audioElement) return;
    if (playingAudioId === asset.id) {
      audioElement.pause();
      setPlayingAudioId(null);
    } else {
      if (playingAudioId) {
        const prev = document.getElementById(`audio-grid-${playingAudioId}`) as HTMLAudioElement;
        if (prev) prev.pause();
      }
      audioElement.play();
      setPlayingAudioId(asset.id);
      audioElement.onended = () => setPlayingAudioId(null);
    }
  };

  // Quality tools
  const [showUpscaleDialog, setShowUpscaleDialog] = useState(false);
  const [showEnhanceDialog, setShowEnhanceDialog] = useState(false);
  const [showComparisonDialog, setShowComparisonDialog] = useState(false);

  // Category preset editor modal
  const [showCategoryPresetEditor, setShowCategoryPresetEditor] = useState(false);
  const [categoryTexturePickerRequest, setCategoryTexturePickerRequest] = useState<TexturePickerRequest | null>(null);

  // Inline 3D config editing (right panel)
  const [expandedConfigGroups, setExpandedConfigGroups] = useState<Set<string>>(new Set());

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [collectionType, setCollectionType] = useState("complete_theme");
  const [worldType, setWorldType] = useState("medieval-fantasy");
  const [purpose, setPurpose] = useState("");
  const [tags, setTags] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [baseCollectionId, setBaseCollectionId] = useState("");

  // 3D config state
  const [groundTextureId, setGroundTextureId] = useState<string>('');
  const [roadTextureId, setRoadTextureId] = useState<string>('');
  const [buildingModels, setBuildingModels] = useState<Record<string, string>>({});
  const [natureModels, setNatureModels] = useState<Record<string, string>>({});
  const [characterModels, setCharacterModels] = useState<Record<string, string>>({});
  const [objectModels, setObjectModels] = useState<Record<string, string>>({});
  const [playerModels, setPlayerModels] = useState<Record<string, string>>({});
  const [questObjectModels, setQuestObjectModels] = useState<Record<string, string>>({});
  const [modelScaling, setModelScaling] = useState<Record<string, { x: number; y: number; z: number }>>({});
  const [npcConfig, setNpcConfig] = useState<NpcConfig | null>(null);

  // ─── Data fetching ─────────────────────────────────────────────────────────

  const { data: collections = [], isLoading } = useQuery<AssetCollection[]>({
    queryKey: ['/api/asset-collections'],
    queryFn: async () => {
      const response = await fetch('/api/asset-collections');
      if (!response.ok) throw new Error('Failed to fetch collections');
      return response.json();
    },
  });

  const { data: baseCollections = [] } = useQuery<AssetCollection[]>({
    queryKey: ['/api/asset-collections', 'base'],
    queryFn: async () => {
      const response = await fetch('/api/asset-collections?isBase=true');
      if (!response.ok) throw new Error('Failed to fetch base collections');
      return response.json();
    },
  });

  const { data: collectionAssets = [] } = useQuery<VisualAsset[]>({
    queryKey: ['/api/asset-collections', selectedCollection?.id, 'assets'],
    enabled: browseMode === 'collections' && !!selectedCollection?.id,
    queryFn: async () => {
      if (!selectedCollection) return [];
      const assetIds = selectedCollection.assetIds || [];
      if (assetIds.length === 0) return [];
      const response = await fetch(`/api/assets?ids=${assetIds.join(',')}`);
      if (!response.ok) throw new Error('Failed to fetch assets');
      return response.json();
    },
  });

  // All assets fetch (used for all-assets browse mode AND for texture/model pickers in config panels)
  const { data: allAssets = [], isLoading: allAssetsLoading } = useQuery<VisualAsset[]>({
    queryKey: ['/api/assets', 'all'],
    queryFn: async () => {
      const response = await fetch('/api/assets');
      if (!response.ok) throw new Error('Failed to fetch assets');
      return response.json();
    },
  });

  // Delete asset mutation
  const deleteMutation = useMutation({
    mutationFn: async (assetId: string) => {
      await apiRequest('DELETE', `/api/assets/${assetId}`, undefined);
    },
    onSuccess: () => {
      toast({ title: 'Asset deleted' });
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/asset-collections'] });
      setSelectedAsset(null);
    },
    onError: (error: any) => {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    },
  });

  // ─── Derived data ──────────────────────────────────────────────────────────

  const filteredCollections = useMemo(() => {
    let result = [...collections];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    if (filterWorldType !== "all") result = result.filter(c => c.worldType === filterWorldType);
    result.sort((a, b) => {
      if (a.isBase && !b.isBase) return -1;
      if (!a.isBase && b.isBase) return 1;
      return a.name.localeCompare(b.name);
    });
    return result;
  }, [collections, searchQuery, filterWorldType]);

  const groupedCollections = useMemo(() => {
    const groups = new Map<string, AssetCollection[]>();
    for (const c of filteredCollections) {
      // Group by world type, or "Uncategorized" if no world type
      const worldLabel = WORLD_TYPES.find(t => t.value === c.worldType)?.label || c.worldType || 'Uncategorized';
      const key = c.isBase ? `${worldLabel} (Base)` : worldLabel;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(c);
    }
    return groups;
  }, [filteredCollections]);

  // Current assets to display (depends on browse mode)
  const displayAssets = browseMode === 'collections' ? collectionAssets : allAssets;

  const filteredDisplayAssets = useMemo(() => {
    if (browseMode === 'collections') return displayAssets;
    let result = [...displayAssets];
    if (assetSearchQuery) {
      const q = assetSearchQuery.toLowerCase();
      result = result.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.assetType?.toLowerCase().includes(q) ||
        a.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    if (assetTypeFilter !== "all") result = result.filter(a => getAssetCategory(a) === assetTypeFilter);
    return result;
  }, [browseMode, displayAssets, assetSearchQuery, assetTypeFilter]);

  // Get asset category: prefer DB category field, fall back to name parenthetical
  const getAssetCategory = (asset: VisualAsset): string => {
    if ((asset as any).category) return (asset as any).category;
    const match = asset.name.match(/\(([^)]+)\)\s*$/);
    return match ? match[1].trim() : 'uncategorized';
  };

  // All asset categories for the type filter
  const allAssetTypes = useMemo(() =>
    Array.from(new Set(allAssets.map(a => getAssetCategory(a)))).sort(),
    [allAssets]
  );

  // Group assets by category extracted from name (for all-assets browse mode)
  const groupedAssets = useMemo(() => {
    const groups = new Map<string, VisualAsset[]>();
    for (const a of filteredDisplayAssets) {
      const key = getAssetCategory(a);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(a);
    }
    // Sort groups alphabetically
    return new Map([...groups.entries()].sort(([a], [b]) => a.localeCompare(b)));
  }, [filteredDisplayAssets]);

  // Find which collections an asset belongs to
  const getAssetCollections = (assetId: string): AssetCollection[] => {
    return collections.filter(c => c.assetIds?.includes(assetId));
  };

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Base Collections']));
  const [expandedAssetGroups, setExpandedAssetGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const toggleAssetGroup = (key: string) => {
    setExpandedAssetGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  // ─── Form helpers ──────────────────────────────────────────────────────────

  const resetForm = () => {
    setName(''); setDescription(''); setCollectionType('complete_theme');
    setWorldType('medieval-fantasy'); setPurpose(''); setTags('');
    setIsPublic(true); setBaseCollectionId('');
    setGroundTextureId(''); setRoadTextureId('');
    setBuildingModels({}); setNatureModels({}); setCharacterModels({});
    setObjectModels({}); setPlayerModels({}); setQuestObjectModels({});
    setModelScaling({}); setNpcConfig(null);
  };

  const loadCollectionToForm = (collection: AssetCollection) => {
    setName(collection.name);
    setDescription(collection.description || '');
    setCollectionType(collection.collectionType);
    setWorldType(collection.worldType || 'medieval-fantasy');
    setPurpose(collection.purpose || '');
    setTags(collection.tags?.join(', ') || '');
    setIsPublic(collection.isPublic ?? true);
    setGroundTextureId(collection.groundTextureId || '');
    setRoadTextureId(collection.roadTextureId || '');
    setBuildingModels(collection.buildingModels || {});
    setNatureModels(collection.natureModels || {});
    setCharacterModels(collection.characterModels || {});
    setObjectModels(collection.objectModels || {});
    setPlayerModels(collection.playerModels || {});
    setQuestObjectModels(collection.questObjectModels || {});
    setModelScaling((collection as any).modelScaling || {});
    setNpcConfig(collection.npcConfig || null);
  };

  const handleCopyCollection = (collection: AssetCollection) => {
    setBaseCollectionId(collection.id);
    setWorldType(collection.worldType || 'generic');
    setName(`${collection.name} (Copy)`);
    setDescription(collection.description || '');
    setCollectionType(collection.collectionType);
    setPurpose(collection.purpose || '');
    setTags(collection.tags?.join(', ') || '');
    setShowCreateDialog(true);
  };

  // ─── CRUD handlers ─────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!token) {
      toast({ title: "Auth required", variant: "destructive" });
      return;
    }
    try {
      let initialAssets: string[] = [];
      let initial3DConfig = {
        groundTextureId: groundTextureId || null, roadTextureId: roadTextureId || null,
        buildingModels, natureModels, characterModels, objectModels, playerModels, questObjectModels,
      };
      if (baseCollectionId) {
        const base = baseCollections.find(bc => bc.id === baseCollectionId);
        if (base) {
          initialAssets = base.assetIds || [];
          initial3DConfig = {
            groundTextureId: base.groundTextureId || null, roadTextureId: base.roadTextureId || null,
            buildingModels: base.buildingModels || {}, natureModels: base.natureModels || {},
            characterModels: base.characterModels || {}, objectModels: base.objectModels || {},
            playerModels: base.playerModels || {}, questObjectModels: base.questObjectModels || {},
          };
        }
      }
      const response = await fetch('/api/asset-collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name, description: description || null, collectionType: 'world_type_collection',
          worldType: (worldType && worldType !== '__none__') ? worldType : null, purpose: purpose || null,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          isPublic, isBase: false, assetIds: initialAssets, modelScaling, ...initial3DConfig,
        }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to create');
      }
      toast({ title: "Created", description: `${name} has been created.` });
      queryClient.invalidateQueries({ queryKey: ['/api/asset-collections'] });
      setShowCreateDialog(false);
      resetForm();
    } catch (error) {
      toast({ title: "Failed", description: error instanceof Error ? error.message : "Error", variant: "destructive" });
    }
  };

  const handleUpdate = async () => {
    if (!token || !selectedCollection) return;
    try {
      const response = await fetch(`/api/asset-collections/${selectedCollection.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name, description: description || null, collectionType,
          worldType: (worldType && worldType !== '__none__') ? worldType : null,
          purpose: purpose || null, tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          isPublic, groundTextureId: groundTextureId || null, roadTextureId: roadTextureId || null,
          buildingModels, natureModels, characterModels, objectModels, playerModels, questObjectModels, modelScaling,
          npcConfig,
        }),
      });
      if (!response.ok) throw new Error('Failed to update');
      toast({ title: "Updated" });
      queryClient.invalidateQueries({ queryKey: ['/api/asset-collections'] });
      setShowEditDialog(false);
      const updated = await fetch(`/api/asset-collections/${selectedCollection.id}`);
      if (updated.ok) setSelectedCollection(await updated.json());
    } catch (error) {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!token || !selectedCollection) return;
    try {
      const response = await fetch(`/api/asset-collections/${selectedCollection.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete');
      toast({ title: "Deleted" });
      queryClient.invalidateQueries({ queryKey: ['/api/asset-collections'] });
      setShowDeleteDialog(false);
      setSelectedCollection(null);
      setSelectedAsset(null);
    } catch (error) {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  // Inline PATCH for 3D config changes (right panel editing)
  // Debounced to avoid flooding the server during slider/color picker drags.
  const pendingPatchRef = useRef<Partial<AssetCollection> | null>(null);
  const patchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushPatch = useCallback(async () => {
    const patch = pendingPatchRef.current;
    pendingPatchRef.current = null;
    if (!patch || !token || !selectedCollection) return;
    try {
      const response = await fetch(`/api/asset-collections/${selectedCollection.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(patch),
      });
      if (!response.ok) throw new Error('Failed to update');
      queryClient.invalidateQueries({ queryKey: ['/api/asset-collections'] });
      const updated = await fetch(`/api/asset-collections/${selectedCollection.id}`);
      if (updated.ok) setSelectedCollection(await updated.json());
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    }
  }, [token, selectedCollection, queryClient, toast]);

  const patchCollectionConfig = useCallback((patch: Partial<AssetCollection>) => {
    // Merge with any pending patch so we don't lose intermediate changes
    pendingPatchRef.current = pendingPatchRef.current
      ? { ...pendingPatchRef.current, ...patch }
      : patch;
    if (patchTimerRef.current) clearTimeout(patchTimerRef.current);
    patchTimerRef.current = setTimeout(flushPatch, 500);
  }, [flushPatch]);

  const handleInlineModelAssign = (modelField: string, role: string, assetId: string | null) => {
    if (!selectedCollection) return;
    const current = (selectedCollection as any)[modelField] || {};
    const updated = { ...current };
    if (assetId) {
      updated[role] = assetId;
    } else {
      delete updated[role];
    }
    patchCollectionConfig({ [modelField]: updated } as any);
  };

  const handleInlineTextureAssign = (field: string, assetId: string | null) => {
    patchCollectionConfig({ [field]: assetId } as any);
  };

  const handleInlineScaleUpdate = (scalingKey: string, axis: 'x' | 'y' | 'z', value: number) => {
    if (!selectedCollection) return;
    const current = (selectedCollection as any).modelScaling || {};
    const entry = current[scalingKey] || { x: 1, y: 1, z: 1 };
    const updated = { ...current, [scalingKey]: { ...entry, [axis]: value } };
    patchCollectionConfig({ modelScaling: updated } as any);
  };

  const handleInlineScaleReset = (scalingKey: string) => {
    if (!selectedCollection) return;
    const current = { ...((selectedCollection as any).modelScaling || {}) };
    delete current[scalingKey];
    patchCollectionConfig({ modelScaling: current } as any);
  };

  const handleDownload = (asset: VisualAsset) => {
    const link = document.createElement('a');
    link.href = `/${asset.filePath}`;
    link.download = asset.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ─── Left Panel ────────────────────────────────────────────────────────────

  const renderLeft = () => (
    <div className="flex flex-col h-full border-r">
      <div className="flex items-center justify-between px-3 py-2.5 border-b bg-muted/30 shrink-0">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assets</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6" title="Add">
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Add Assets</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { resetForm(); setShowCreateDialog(true); }}>
              <Package className="w-3.5 h-3.5 mr-2" /> New World Type
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowPolyhavenBrowser(true)} disabled={!!selectedCollection?.isBase}>
              <Package className="w-3.5 h-3.5 mr-2" /> From Polyhaven
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowSketchfabBrowser(true)} disabled={!!selectedCollection?.isBase}>
              <Package className="w-3.5 h-3.5 mr-2" /> From Sketchfab
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setGeneratorAssetType('texture_ground'); setShowAssetGenerator(true); }} disabled={!!selectedCollection?.isBase}>
              <Sparkles className="w-3.5 h-3.5 mr-2" /> Generate Assets
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Browse mode toggle */}
      <div className="flex border-b">
        <button
          className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
            browseMode === 'collections' ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => { setBrowseMode('collections'); setSelectedAsset(null); }}
        >
          Collections
        </button>
        <button
          className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
            browseMode === 'all-assets' ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => { setBrowseMode('all-assets'); setSelectedAsset(null); setSelectedCollection(null); }}
        >
          All Assets
        </button>
      </div>

      {browseMode === 'collections' ? renderCollectionsList() : renderAllAssetsList()}
    </div>
  );

  const renderCollectionsList = () => (
    <>
      {/* Search */}
      <div className="px-2 py-2 border-b space-y-1.5">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Search collections..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-7 text-xs pl-7" />
        </div>
        <Select value={filterWorldType} onValueChange={setFilterWorldType}>
          <SelectTrigger className="h-6 text-[10px]"><SelectValue placeholder="World Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All World Types</SelectItem>
            {WORLD_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Collection List (flat) */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {isLoading ? (
            <p className="text-xs text-muted-foreground text-center py-8">Loading...</p>
          ) : filteredCollections.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No collections found</p>
          ) : (
            filteredCollections.map(collection => {
              const isSelected = selectedCollection?.id === collection.id;
              const worldLabel = WORLD_TYPES.find(t => t.value === collection.worldType)?.label;
              return (
                <div key={collection.id} className="group flex items-center">
                  <button
                    className={`flex-1 text-left px-3 py-1.5 text-xs rounded-sm transition-colors flex items-center gap-2 min-w-0 ${
                      isSelected ? 'bg-primary/15 text-primary font-medium' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                    onClick={() => { setSelectedCollection(collection); setSelectedAsset(null); }}
                  >
                    <Package className="w-3 h-3 shrink-0" />
                    <span className="truncate flex-1">{collection.name}</span>
                    {worldLabel && <span className="text-[10px] shrink-0 opacity-60">{worldLabel}</span>}
                  </button>
                  <Button
                    variant="ghost" size="icon"
                    className="h-5 w-5 opacity-0 group-hover:opacity-100 shrink-0 mr-1"
                    title="Copy collection"
                    onClick={(e) => { e.stopPropagation(); handleCopyCollection(collection); }}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
      <div className="px-3 py-2 border-t text-[10px] text-muted-foreground">
        {filteredCollections.length} collection{filteredCollections.length !== 1 ? 's' : ''}
      </div>
    </>
  );

  const renderAllAssetsList = () => (
    <>
      {/* Search */}
      <div className="px-2 py-2 border-b space-y-1.5">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Search assets..." value={assetSearchQuery} onChange={(e) => setAssetSearchQuery(e.target.value)} className="h-7 text-xs pl-7" />
        </div>
        <Select value={assetTypeFilter} onValueChange={setAssetTypeFilter}>
          <SelectTrigger className="h-6 text-[10px]"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types ({allAssets.length})</SelectItem>
            {allAssetTypes.map(t => (
              <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')} ({allAssets.filter(a => getAssetCategory(a) === t).length})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Asset list grouped by type */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {allAssetsLoading ? (
            <p className="text-xs text-muted-foreground text-center py-8">Loading...</p>
          ) : filteredDisplayAssets.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No assets found</p>
          ) : (
            <div className="space-y-0.5">
              {Array.from(groupedAssets.entries()).map(([typeName, typeAssets]) => {
                const isExpanded = expandedAssetGroups.has(typeName);
                return (
                  <div key={typeName}>
                    <button className="w-full flex items-center gap-1 px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors" onClick={() => toggleAssetGroup(typeName)}>
                      {isExpanded ? <ChevronDown className="h-3 w-3 shrink-0" /> : <ChevronRight className="h-3 w-3 shrink-0" />}
                      <span className="truncate capitalize">{typeName.replace(/_/g, ' ')}</span>
                      <span className="ml-auto text-[10px] opacity-60">{typeAssets.length}</span>
                    </button>
                    {isExpanded && typeAssets.map(asset => {
                      const isSelected = selectedAsset?.id === asset.id;
                      return (
                        <button
                          key={asset.id}
                          className={`w-full text-left px-5 py-1.5 text-xs rounded-sm transition-colors flex items-center gap-2 ${
                            isSelected ? 'bg-primary/15 text-primary font-medium' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                          }`}
                          onClick={() => { setSelectedAsset(asset); setExpandedSection('preview'); }}
                        >
                          {isImageAsset(asset) ? <ImageIcon className="w-3 h-3 shrink-0" />
                            : isModelAsset(asset) ? <Box className="w-3 h-3 shrink-0" />
                            : isAudioAsset(asset) ? <Volume2 className="w-3 h-3 shrink-0" />
                            : <Package className="w-3 h-3 shrink-0" />}
                          <span className="truncate">{asset.name}</span>
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
        {filteredDisplayAssets.length} asset{filteredDisplayAssets.length !== 1 ? 's' : ''}
      </div>
    </>
  );

  // ─── Center Panel ──────────────────────────────────────────────────────────

  const renderCenter = () => {
    if (browseMode === 'collections' && !selectedCollection) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <Layers className="w-10 h-10 opacity-20" />
          <p className="text-sm">Select a collection from the list</p>
          <Button variant="outline" size="sm" onClick={() => { resetForm(); setShowCreateDialog(true); }}>
            <Plus className="w-3.5 h-3.5 mr-1.5" /> New Collection
          </Button>
        </div>
      );
    }

    if (browseMode === 'all-assets' && !selectedAsset) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <ImageIcon className="w-10 h-10 opacity-20" />
          <p className="text-sm">Select an asset from the list</p>
          <p className="text-xs">{allAssets.length} total assets across {collections.length} collections</p>
        </div>
      );
    }

    // In collections mode, show World Type Collection Editor in center
    if (browseMode === 'collections' && selectedCollection) {
      const isBase = selectedCollection.isBase === true;
      const worldTypeLabel = WORLD_TYPES.find(t => t.value === selectedCollection.worldType)?.label || selectedCollection.worldType;

      return (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="px-4 py-3 border-b shrink-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold break-words">{selectedCollection.name}</h2>
              {isBase && <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Base</Badge>}
              {worldTypeLabel && <Badge variant="secondary" className="text-xs">{worldTypeLabel}</Badge>}
            </div>
            {selectedCollection.description && <p className="text-sm text-muted-foreground">{selectedCollection.description}</p>}
          </div>

          {/* Actions bar */}
          <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/20 shrink-0 flex-wrap">
            {!isBase && (
              <>
                <Button variant="outline" size="sm" onClick={() => { loadCollectionToForm(selectedCollection); setShowEditDialog(true); }}>
                  <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit Details
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowPolyhavenBrowser(true)}>
                  <Package className="w-3.5 h-3.5 mr-1.5" /> Polyhaven
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowSketchfabBrowser(true)}>
                  <Package className="w-3.5 h-3.5 mr-1.5" /> Sketchfab
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setGeneratorAssetType('texture_ground'); setShowAssetGenerator(true); }}>
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Generate
                </Button>
                <div className="ml-auto">
                  <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* World Type Collection Editor (5 config tabs) */}
          <div className="flex-1 min-h-0">
            <WorldTypeCollectionEditor
              collection={selectedCollection}
              assets={allAssets}
              onPatch={patchCollectionConfig}
              selection={configSelection}
              onSelect={setConfigSelection}
            />
          </div>
        </div>
      );
    }

    // In all-assets mode with a selected asset, show its full preview in center
    if (browseMode === 'all-assets' && selectedAsset) {
      return (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="px-4 py-3 border-b shrink-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold break-words">{selectedAsset.name}</h2>
              <Badge variant="secondary" className="text-xs">{selectedAsset.assetType?.replace(/_/g, ' ')}</Badge>
            </div>
            {selectedAsset.description && <p className="text-sm text-muted-foreground">{selectedAsset.description}</p>}
          </div>
          <div className="flex-1 min-h-0 flex items-center justify-center p-4">
            <AssetPreviewLarge asset={selectedAsset} onFullscreen={() => setShowFullscreenAsset(true)} />
          </div>
        </div>
      );
    }

    return null;
  };

  // ─── Right Panel ───────────────────────────────────────────────────────────

  const renderRight = () => {
    const hasAsset = !!selectedAsset;
    const hasCollection = browseMode === 'collections' && !!selectedCollection;
    if (!hasAsset && !hasCollection) return null;

    // When an asset is selected, show asset preview + details
    if (hasAsset) {
      return (
        <div className="w-72 shrink-0 border-l flex flex-col min-h-0">
          {/* Asset Preview Section */}
          <div className="flex flex-col min-h-0 flex-1">
            <button
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0"
              onClick={() => setExpandedSection(expandedSection === 'preview' ? null : 'preview')}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Asset Preview
              <ChevronRight className={`w-3 h-3 ml-auto transition-transform ${expandedSection === 'preview' ? 'rotate-90' : ''}`} />
            </button>
            {expandedSection === 'preview' && selectedAsset && (
              <ScrollArea className="flex-1 min-h-0">
                <div className="px-3 pb-3 space-y-3">
                  <div className="relative rounded-lg border overflow-hidden bg-muted/30">
                    {isImageAsset(selectedAsset) ? (
                      <img src={`/${selectedAsset.filePath}`} alt={selectedAsset.name} className="w-full aspect-square object-contain" />
                    ) : isModelAsset(selectedAsset) ? (
                      <div className="aspect-square">
                        <ModelPreview modelPath={selectedAsset.filePath} className="h-full w-full" showControls={true} />
                      </div>
                    ) : isAudioAsset(selectedAsset) ? (
                      <div className="aspect-square flex flex-col items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                        <Volume2 className="h-8 w-8 text-purple-500 mb-2" />
                        <audio controls src={`/${selectedAsset.filePath}`} className="w-5/6" />
                      </div>
                    ) : (
                      <div className="aspect-square flex items-center justify-center">
                        <Box className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setShowFullscreenAsset(true)}>
                    <Maximize2 className="w-3 h-3 mr-1.5" /> Fullscreen
                  </Button>

                  {/* Quick info */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <span>{selectedAsset.assetType?.replace(/_/g, ' ')}</span>
                    </div>
                    {selectedAsset.fileSize && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Size</span>
                        <span>{(selectedAsset.fileSize / 1024).toFixed(1)} KB</span>
                      </div>
                    )}
                    {selectedAsset.width && selectedAsset.height && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dimensions</span>
                        <span>{selectedAsset.width}x{selectedAsset.height}</span>
                      </div>
                    )}
                  </div>

                  {/* Collections this asset belongs to */}
                  {browseMode === 'all-assets' && (() => {
                    const assetCollections = getAssetCollections(selectedAsset.id);
                    if (assetCollections.length === 0) return null;
                    return (
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-1">In Collections</p>
                        <div className="flex flex-wrap gap-1">
                          {assetCollections.map(c => (
                            <Badge key={c.id} variant="outline" className="text-[10px] h-4 cursor-pointer hover:bg-primary/10"
                              onClick={() => { setBrowseMode('collections'); setSelectedCollection(c); setSelectedAsset(selectedAsset); }}>
                              {c.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Actions */}
                  <div className="flex gap-1 flex-wrap">
                    <Button variant="outline" size="sm" className="text-[10px] h-6 px-2" onClick={() => handleDownload(selectedAsset)}>
                      <Download className="w-3 h-3 mr-1" /> Download
                    </Button>
                    {isImageAsset(selectedAsset) && (
                      <>
                        <Button variant="outline" size="sm" className="text-[10px] h-6 px-2" onClick={() => setShowUpscaleDialog(true)}>
                          <ArrowUp className="w-3 h-3 mr-1" /> Upscale
                        </Button>
                        <Button variant="outline" size="sm" className="text-[10px] h-6 px-2" onClick={() => setShowEnhanceDialog(true)}>
                          <Wand2 className="w-3 h-3 mr-1" /> Enhance
                        </Button>
                      </>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="text-[10px] h-6 px-2">
                          <Trash2 className="w-3 h-3 mr-1" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Asset?</AlertDialogTitle>
                          <AlertDialogDescription>Permanently delete "{selectedAsset.name}"?</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMutation.mutate(selectedAsset.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  {/* Asset Details */}
                  <DetailField label="ID" value={selectedAsset.id} mono />
                  <DetailField label="Name" value={selectedAsset.name} />
                  <DetailField label="Type" value={selectedAsset.assetType?.replace(/_/g, ' ') || 'Unknown'} />
                  <DetailField label="Format" value={selectedAsset.mimeType || 'Unknown'} />
                  <DetailField label="File Path" value={selectedAsset.filePath} mono />
                  {selectedAsset.purpose && <DetailField label="Purpose" value={selectedAsset.purpose} />}
                  {selectedAsset.usageContext && <DetailField label="Context" value={selectedAsset.usageContext} />}
                  {selectedAsset.generationProvider && (
                    <>
                      <DetailField label="Provider" value={selectedAsset.generationProvider} />
                      {selectedAsset.generationPrompt && <DetailField label="Prompt" value={selectedAsset.generationPrompt} />}
                    </>
                  )}
                  {selectedAsset.tags && selectedAsset.tags.length > 0 && (
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1">Tags</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedAsset.tags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] h-4"><Tag className="w-2 h-2 mr-0.5" />{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      );
    }

    // When a collection is selected (no asset), show config detail panel
    if (hasCollection && selectedCollection) {
      const wtc = (selectedCollection as any).worldTypeConfig || {};

      return (
        <div className="w-80 shrink-0 border-l flex flex-col min-h-0">
          <ConfigDetailPanel
            selection={configSelection}
            assets={allAssets}
            onUpdateBuilding={(typeName, updated) => {
              const configs = wtc.buildingConfig?.buildingTypeConfigs || {};
              const newConfigs = { ...configs, [typeName]: updated };
              patchCollectionConfig({
                worldTypeConfig: { ...wtc, buildingConfig: { ...wtc.buildingConfig, buildingTypeConfigs: newConfigs } },
                buildingTypeConfigs: newConfigs,
              } as any);
              // Update selection to reflect changes
              const preset = wtc.buildingConfig?.categoryPresets?.[configSelection?.module === 'building' ? configSelection.category : ''];
              setConfigSelection({ module: 'building', typeName, category: configSelection?.module === 'building' ? configSelection.category : '', config: updated, categoryPreset: preset });
            }}
            onUpdateGround={(groundType, update) => {
              const gc = wtc.groundConfig || {};
              const existing = (groundType === 'ground' || groundType === 'road' || groundType === 'sidewalk')
                ? gc[groundType] || {} : gc.custom?.[groundType] || {};
              const updated = { ...existing, ...update };
              const newGc = { ...gc };
              if (groundType === 'ground' || groundType === 'road' || groundType === 'sidewalk') {
                newGc[groundType] = updated;
              } else {
                newGc.custom = { ...(newGc.custom || {}), [groundType]: updated };
              }
              patchCollectionConfig({ worldTypeConfig: { ...wtc, groundConfig: newGc } } as any);
              setConfigSelection({ module: 'ground', groundType, config: updated });
            }}
            onUpdateCharacter={(section, role, update) => {
              const cc = wtc.characterConfig || {};
              const field = section === 'player' ? 'playerModels' : 'characterModels';
              const models = cc[field] || {};
              const existing = models[role] || { mode: 'asset' };
              const updated = { ...existing, ...update };
              const newCc = { ...cc, [field]: { ...models, [role]: updated } };
              patchCollectionConfig({ worldTypeConfig: { ...wtc, characterConfig: newCc } } as any);
              setConfigSelection({ module: 'character', section, role, config: updated });
            }}
            onUpdateNature={(group, item, update) => {
              const nc = wtc.natureConfig || {};
              const groupItems = nc[group] || {};
              const existing = groupItems[item] || { mode: 'asset' };
              const updated = { ...existing, ...update };
              const newNc = { ...nc, [group]: { ...groupItems, [item]: updated } };
              patchCollectionConfig({ worldTypeConfig: { ...wtc, natureConfig: newNc } } as any);
              setConfigSelection({ module: 'nature', group, item, config: updated });
            }}
            onUpdateItem={(group, item, update) => {
              const ic = wtc.itemConfig || {};
              const groupItems = ic[group] || {};
              const existing = groupItems[item] || { mode: 'asset' };
              const updated = { ...existing, ...update };
              const newIc = { ...ic, [group]: { ...groupItems, [item]: updated } };
              patchCollectionConfig({ worldTypeConfig: { ...wtc, itemConfig: newIc } } as any);
              setConfigSelection({ module: 'item', group, item, config: updated });
            }}
          />
        </div>
      );
    }

    return null;
  };

  // ─── Root ──────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="flex h-[calc(100vh-10rem)] min-h-[480px] rounded-lg border overflow-hidden bg-background">
        <div className="w-64 shrink-0 flex flex-col">
          {renderLeft()}
        </div>
        {renderCenter()}
        {renderRight()}
      </div>

      {/* Fullscreen Asset Preview Dialog */}
      <Dialog open={showFullscreenAsset && !!selectedAsset} onOpenChange={(open) => { if (!open) setShowFullscreenAsset(false); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
          {selectedAsset && (
            <>
              <DialogHeader className="shrink-0">
                <DialogTitle>{selectedAsset.name}</DialogTitle>
                <DialogDescription>{selectedAsset.description}</DialogDescription>
              </DialogHeader>
              <div className="flex-1 min-h-0 overflow-auto space-y-4">
                <div className="relative">
                  {isModelAsset(selectedAsset) ? (
                    <div className="h-80 rounded-lg border overflow-hidden">
                      <ModelPreview modelPath={selectedAsset.filePath} className="h-full w-full" showControls={true} />
                    </div>
                  ) : isImageAsset(selectedAsset) ? (
                    <img src={`/${selectedAsset.filePath}`} alt={selectedAsset.name} className="w-full max-h-[50vh] object-contain rounded-lg border" />
                  ) : isAudioAsset(selectedAsset) ? (
                    <div className="flex flex-col items-center justify-center h-48 rounded-lg border bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                      <Volume2 className="h-12 w-12 text-purple-500 mb-3" />
                      <audio controls src={`/${selectedAsset.filePath}`} className="w-3/4" />
                    </div>
                  ) : (
                    <div className="flex h-48 items-center justify-center rounded-lg border bg-muted">
                      <Box className="h-10 w-10 text-muted-foreground mr-2" />
                      <span className="text-sm text-muted-foreground">Preview not available</span>
                    </div>
                  )}
                </div>

                <Tabs defaultValue="details">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="generation">Generation Info</TabsTrigger>
                  </TabsList>
                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><p className="text-muted-foreground">Type</p><p className="font-medium">{selectedAsset.assetType?.replace(/_/g, ' ')}</p></div>
                      <div><p className="text-muted-foreground">Dimensions</p><p className="font-medium">{selectedAsset.width}x{selectedAsset.height}</p></div>
                      <div><p className="text-muted-foreground">File Size</p><p className="font-medium">{selectedAsset.fileSize ? `${(selectedAsset.fileSize / 1024).toFixed(2)} KB` : 'N/A'}</p></div>
                      <div><p className="text-muted-foreground">Format</p><p className="font-medium">{selectedAsset.mimeType}</p></div>
                      <div><p className="text-muted-foreground">Purpose</p><p className="font-medium">{selectedAsset.purpose || 'N/A'}</p></div>
                      <div><p className="text-muted-foreground">Context</p><p className="font-medium">{selectedAsset.usageContext || 'N/A'}</p></div>
                      <div className="col-span-2"><p className="text-muted-foreground">File Path</p><p className="font-mono text-xs break-all">{selectedAsset.filePath}</p></div>
                    </div>
                    {selectedAsset.tags && selectedAsset.tags.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Tags</p>
                        <div className="flex flex-wrap gap-2">{selectedAsset.tags.map(tag => <Badge key={tag} variant="outline"><Tag className="h-3 w-3 mr-1" />{tag}</Badge>)}</div>
                      </div>
                    )}
                    {/* Collections */}
                    {(() => {
                      const assetCollections = getAssetCollections(selectedAsset.id);
                      if (assetCollections.length === 0) return null;
                      return (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">In Collections</p>
                          <div className="flex flex-wrap gap-2">
                            {assetCollections.map(c => <Badge key={c.id} variant="secondary">{c.name}</Badge>)}
                          </div>
                        </div>
                      );
                    })()}
                  </TabsContent>
                  <TabsContent value="generation" className="space-y-4">
                    {selectedAsset.generationProvider ? (
                      <>
                        <div><p className="text-sm text-muted-foreground">Provider</p><Badge variant="outline" className="mt-1"><Sparkles className="h-3 w-3 mr-1" />{selectedAsset.generationProvider}</Badge></div>
                        {selectedAsset.generationPrompt && <div><p className="text-sm text-muted-foreground">Prompt</p><p className="text-sm mt-1 p-3 bg-muted rounded-lg">{selectedAsset.generationPrompt}</p></div>}
                        {selectedAsset.generationParams && Object.keys(selectedAsset.generationParams).length > 0 && (
                          <div><p className="text-sm text-muted-foreground">Parameters</p><pre className="text-xs mt-1 p-3 bg-muted rounded-lg overflow-auto">{JSON.stringify(selectedAsset.generationParams, null, 2)}</pre></div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">This asset was not generated by AI.</p>
                    )}
                  </TabsContent>
                </Tabs>

                {/* Quality tools */}
                {isImageAsset(selectedAsset) && (
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowUpscaleDialog(true)}><ArrowUp className="h-4 w-4 mr-2" />Upscale</Button>
                    <Button variant="outline" size="sm" onClick={() => setShowEnhanceDialog(true)}><Wand2 className="h-4 w-4 mr-2" />Enhance</Button>
                    {selectedAsset.parentAssetId && (
                      <Button variant="outline" size="sm" onClick={() => setShowComparisonDialog(true)}><TrendingUp className="h-4 w-4 mr-2" />Compare</Button>
                    )}
                  </div>
                )}

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => handleDownload(selectedAsset)}><Download className="h-4 w-4 mr-2" />Download</Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive"><Trash2 className="h-4 w-4 mr-2" />Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Asset?</AlertDialogTitle>
                        <AlertDialogDescription>Permanently delete "{selectedAsset.name}"?</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { deleteMutation.mutate(selectedAsset.id); setShowFullscreenAsset(false); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Collection Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Create World Type Collection</DialogTitle>
            <DialogDescription>Create a new world type collection with building, ground, character, nature, and item configurations</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Medieval Fantasy Pack" /></div>
            <div className="space-y-2"><Label>World Type</Label><Select value={worldType} onValueChange={setWorldType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="__none__">None (Generic)</SelectItem>{WORLD_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Copy from Base Collection</Label><Select value={baseCollectionId || '__none__'} onValueChange={(v) => setBaseCollectionId(v === '__none__' ? '' : v)}><SelectTrigger><SelectValue placeholder="None (empty)" /></SelectTrigger><SelectContent><SelectItem value="__none__">None (empty)</SelectItem>{baseCollections.map(bc => <SelectItem key={bc.id} value={bc.id}>{bc.name} {bc.worldType ? `(${bc.worldType})` : ''}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Purpose</Label><Input value={purpose} onChange={(e) => setPurpose(e.target.value)} /></div>
              <div className="space-y-2"><Label>Tags (comma-separated)</Label><Input value={tags} onChange={(e) => setTags(e.target.value)} /></div>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="create-public" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="rounded" />
              <Label htmlFor="create-public" className="cursor-pointer">Public</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreateDialog(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!name.trim()}><Save className="w-4 h-4 mr-2" /> Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Collection Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader><DialogTitle>Edit World Type Collection</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="space-y-2"><Label>World Type</Label><Select value={worldType} onValueChange={setWorldType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{WORLD_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Purpose</Label><Input value={purpose} onChange={(e) => setPurpose(e.target.value)} /></div>
              <div className="space-y-2"><Label>Tags</Label><Input value={tags} onChange={(e) => setTags(e.target.value)} /></div>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="edit-public" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="rounded" />
              <Label htmlFor="edit-public" className="cursor-pointer">Public</Label>
            </div>
            {/* 3D Config */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3">3D Asset Configuration</h3>
              <div className="space-y-2">
                <ModelConfigRow label="Ground Texture" value={groundTextureId} assets={collectionAssets} collectionId={selectedCollection?.id ?? ''} modelsOnly={false} onAssetSelected={(asset) => setGroundTextureId(asset.id)} onClear={() => setGroundTextureId('')} />
                <ModelConfigRow label="Road Texture" value={roadTextureId} assets={collectionAssets} collectionId={selectedCollection?.id ?? ''} modelsOnly={false} onAssetSelected={(asset) => setRoadTextureId(asset.id)} onClear={() => setRoadTextureId('')} />
              </div>
              {[
                { title: 'Building Models', field: 'buildingModels', roles: ['default', 'smallResidence', 'largeResidence', 'mansion', 'tavern', 'shop', 'blacksmith', 'church', 'library', 'hospital', 'school', 'bank', 'theater', 'windmill', 'watermill', 'lumbermill', 'barracks', 'mine', 'municipal'], group: 'building' as const, prefix: '', models: buildingModels, setModels: setBuildingModels },
                { title: 'Player Models', field: 'playerModels', roles: ['default', 'male', 'female', 'knight', 'mage', 'rogue'], group: 'character' as const, prefix: 'player_', models: playerModels, setModels: setPlayerModels },
                { title: 'NPC Models', field: 'characterModels', roles: ['civilian_male', 'civilian_female', 'guard', 'merchant', 'noble'], group: 'character' as const, prefix: '', models: characterModels, setModels: setCharacterModels },
                { title: 'Nature Models', field: 'natureModels', roles: ['defaultTree', 'tree', 'rock', 'shrub', 'bush'], group: 'nature' as const, prefix: '', models: natureModels, setModels: setNatureModels },
                { title: 'Quest Objects', field: 'questObjectModels', roles: ['collectible', 'marker', 'container', 'key', 'scroll'], group: 'object' as const, prefix: 'quest_', models: questObjectModels, setModels: setQuestObjectModels },
              ].map(({ title, field, roles, group, prefix, models, setModels }) => (
                <div key={title}>
                  <h4 className="text-xs font-medium mt-3 mb-2 text-muted-foreground">{title}</h4>
                  <div className="space-y-1.5">
                    {roles.map(role => {
                      const scalingKey = `${field}.${role}`;
                      return (
                        <ModelConfigRow key={role} label={role.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()} value={models[role]} assets={collectionAssets}
                          collectionId={selectedCollection?.id ?? ''} modelsOnly={group !== 'texture'}
                          scaling={modelScaling[scalingKey]}
                          onScaleChange={(axis, value) => setModelScaling(prev => {
                            const entry = prev[scalingKey] || { x: 1, y: 1, z: 1 };
                            return { ...prev, [scalingKey]: { ...entry, [axis]: value } };
                          })}
                          onScaleReset={() => setModelScaling(prev => {
                            const next = { ...prev };
                            delete next[scalingKey];
                            return next;
                          })}
                          onAssetSelected={(asset) => setModels((prev: Record<string, string>) => ({ ...prev, [role]: asset.id }))}
                          onClear={() => setModels((prev: Record<string, string>) => { const n = { ...prev }; delete n[role]; return n; })} />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            {/* NPC Character Config */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3">NPC Character Configuration</h3>
              <NpcConfigEditor config={npcConfig} onSave={setNpcConfig} inline />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEditDialog(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={!name.trim()}><Save className="w-4 h-4 mr-2" /> Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Collection */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Collection?</AlertDialogTitle><AlertDialogDescription>Delete <strong>{selectedCollection?.name}</strong>? Assets won't be deleted.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* External Dialogs */}
      <VisualAssetGeneratorDialog open={showAssetGenerator} onOpenChange={setShowAssetGenerator}
        entityType={selectedCollection ? 'collection' : 'standalone'}
        entityId={selectedCollection?.id}
        entityName={selectedCollection?.name}
        assetType={generatorAssetType}
        onAssetGenerated={() => {
          queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
          if (selectedCollection) queryClient.invalidateQueries({ queryKey: ['/api/asset-collections', selectedCollection.id, 'assets'] });
        }} />
      <PolyhavenBrowserDialog open={showPolyhavenBrowser} onOpenChange={setShowPolyhavenBrowser} collectionId={selectedCollection?.id} collectionType={selectedCollection?.collectionType} worldType={selectedCollection?.worldType || 'generic'}
        onAssetsSelected={(assetIds) => {
          toast({ title: 'Polyhaven Assets Added', description: `Added ${assetIds.length} asset${assetIds.length !== 1 ? 's' : ''}` });
          queryClient.invalidateQueries({ queryKey: ['/api/asset-collections'] });
          if (selectedCollection) queryClient.invalidateQueries({ queryKey: ['/api/asset-collections', selectedCollection.id, 'assets'] });
          queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
        }} />
      <SketchfabBrowserDialog open={showSketchfabBrowser} onOpenChange={setShowSketchfabBrowser} collectionId={selectedCollection?.id} collectionType={selectedCollection?.collectionType} worldType={selectedCollection?.worldType || 'generic'}
        onAssetsSelected={(assets) => {
          toast({ title: 'Sketchfab Models Added', description: `Added ${assets.length} model${assets.length !== 1 ? 's' : ''}` });
          queryClient.invalidateQueries({ queryKey: ['/api/asset-collections'] });
          if (selectedCollection) queryClient.invalidateQueries({ queryKey: ['/api/asset-collections', selectedCollection.id, 'assets'] });
          queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
        }} />

      {/* Quality tools */}
      {selectedAsset && showUpscaleDialog && (
        <ImageUpscaleDialog open={showUpscaleDialog} onOpenChange={setShowUpscaleDialog} asset={selectedAsset}
          onUpscaleComplete={() => { queryClient.invalidateQueries({ queryKey: ['/api/assets'] }); setShowUpscaleDialog(false); }} />
      )}
      {selectedAsset && showEnhanceDialog && (
        <ImageEnhancementDialog open={showEnhanceDialog} onOpenChange={setShowEnhanceDialog} asset={selectedAsset}
          onEnhanceComplete={() => { queryClient.invalidateQueries({ queryKey: ['/api/assets'] }); setShowEnhanceDialog(false); }} />
      )}
      {selectedAsset?.parentAssetId && showComparisonDialog && (
        <QualityComparisonDialog open={showComparisonDialog} onOpenChange={setShowComparisonDialog}
          originalAsset={allAssets.find(a => a.id === selectedAsset.parentAssetId) || selectedAsset} processedAsset={selectedAsset} />
      )}
    </>
  );
}

// ─── Helper Components ─────────────────────────────────────────────────────

function AssetGridItem({ asset, isSelected, onClick, modelLoaded, onModelHover, playingAudioId, onAudioPlayPause }: {
  asset: VisualAsset; isSelected: boolean; onClick: () => void;
  modelLoaded?: boolean; onModelHover?: () => void;
  playingAudioId?: string | null; onAudioPlayPause?: (e: React.MouseEvent, asset: VisualAsset) => void;
}) {
  const isModel = isModelAsset(asset);
  const isAudio = isAudioAsset(asset);
  const isImage = isImageAsset(asset);

  return (
    <div
      className={`group relative aspect-square rounded-lg overflow-hidden border bg-muted/30 cursor-pointer transition-all ${
        isSelected ? 'border-primary ring-2 ring-primary/30' : 'hover:border-primary/50'
      }`}
      onClick={onClick}
      onMouseEnter={() => { if (isModel && onModelHover) onModelHover(); }}
    >
      {isImage ? (
        <img src={`/${asset.filePath}`} alt={asset.name} className="w-full h-full object-cover" loading="lazy" />
      ) : isModel ? (
        modelLoaded ? (
          <div className="h-full w-full">
            <ModelPreview modelPath={asset.filePath} className="h-full w-full" showControls={false} />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
            <Box className="w-8 h-8 text-blue-500/50 mb-1" />
            <span className="text-[10px] font-medium text-blue-600">3D Model</span>
            <span className="text-[9px] text-muted-foreground">Hover to preview</span>
          </div>
        )
      ) : isAudio ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-500/10 to-pink-500/10">
          <Volume2 className="w-8 h-8 text-purple-500/50 mb-2" />
          {onAudioPlayPause && (
            <button
              onClick={(e) => onAudioPlayPause(e, asset)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500 text-white hover:bg-purple-600 transition-colors text-[10px]"
            >
              {playingAudioId === asset.id ? (
                <><Pause className="h-3 w-3" /> Pause</>
              ) : (
                <><Play className="h-3 w-3" /> Play</>
              )}
            </button>
          )}
          <audio id={`audio-grid-${asset.id}`} src={`/${asset.filePath}`} preload="none" />
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Package className="w-8 h-8 text-muted-foreground/30" />
        </div>
      )}
      {/* Type badge */}
      <div className="absolute top-1.5 right-1.5">
        <Badge variant="secondary" className="text-[9px] h-4 px-1 bg-black/50 text-white border-0 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
          {asset.assetType?.replace(/_/g, ' ')}
        </Badge>
      </div>
      {/* Name overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
        <p className="text-[10px] text-white truncate">{asset.name}</p>
      </div>
    </div>
  );
}

function AssetPreviewLarge({ asset, onFullscreen }: { asset: VisualAsset; onFullscreen: () => void }) {
  return (
    <div className="relative w-full max-w-2xl">
      {isImageAsset(asset) ? (
        <img src={`/${asset.filePath}`} alt={asset.name} className="w-full max-h-[60vh] object-contain rounded-lg border cursor-pointer" onClick={onFullscreen} />
      ) : isModelAsset(asset) ? (
        <div className="h-80 w-full rounded-lg border overflow-hidden">
          <ModelPreview modelPath={asset.filePath} className="h-full w-full" showControls={true} />
        </div>
      ) : isAudioAsset(asset) ? (
        <div className="flex flex-col items-center justify-center h-48 rounded-lg border bg-gradient-to-br from-purple-500/20 to-pink-500/20">
          <Volume2 className="h-12 w-12 text-purple-500 mb-3" />
          <audio controls src={`/${asset.filePath}`} className="w-3/4" />
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center rounded-lg border bg-muted">
          <Box className="h-10 w-10 text-muted-foreground mr-2" />
          <span className="text-sm text-muted-foreground">Preview not available</span>
        </div>
      )}
      <Button variant="outline" size="sm" className="absolute top-2 right-2 opacity-70 hover:opacity-100" onClick={onFullscreen}>
        <Maximize2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

function DetailField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={`text-xs break-words ${mono ? 'font-mono select-all text-[10px]' : ''}`}>{value}</p>
    </div>
  );
}

function ConfigSummaryRow({ label, hasValue, count }: { label: string; hasValue?: boolean; count?: number }) {
  const configured = hasValue || (count !== undefined && count > 0);
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      {count !== undefined ? (
        <Badge variant={count > 0 ? "secondary" : "outline"} className="text-[10px] h-4">{count}</Badge>
      ) : (
        <span className={configured ? 'text-green-600' : 'text-muted-foreground/50'}>{configured ? 'Set' : 'None'}</span>
      )}
    </div>
  );
}

function InlineModelRow({ label, assetId, assets, onSelect, onClear, scaling, onScaleChange, onScaleReset }: {
  label: string; assetId?: string; assets: VisualAsset[]; onSelect: () => void; onClear: () => void;
  scaling?: { x: number; y: number; z: number };
  onScaleChange?: (axis: 'x' | 'y' | 'z', value: number) => void;
  onScaleReset?: () => void;
}) {
  const [showScale, setShowScale] = useState(false);
  const asset = assetId ? assets.find(a => a.id === assetId) : null;
  const assetName = asset?.name || (assetId ? 'Assigned' : null);
  const isImage = asset && isImageAsset(asset);
  const isModel = asset && isModelAsset(asset);
  const hasCustomScale = scaling && (scaling.x !== 1 || scaling.y !== 1 || scaling.z !== 1);
  return (
    <div className="rounded border">
      <div className="flex items-center gap-1.5 px-1.5 py-1">
        {/* Thumbnail */}
        <div className="w-7 h-7 rounded bg-muted/50 flex items-center justify-center shrink-0 overflow-hidden">
          {isImage ? (
            <img src={`/${asset.filePath}`} alt={assetName || ''} className="w-full h-full object-cover" />
          ) : isModel ? (
            <Box className="w-3.5 h-3.5 text-blue-500" />
          ) : (
            <Package className="w-3.5 h-3.5 text-muted-foreground/40" />
          )}
        </div>
        {/* Info */}
        <div className="overflow-hidden" style={{ flex: '1 1 0', minWidth: 0 }}>
          <p className="text-[11px] font-medium capitalize truncate">{label}</p>
          <p className={`text-[10px] truncate ${assetName ? 'text-muted-foreground' : 'text-muted-foreground/40 italic'}`}>{assetName || 'Not set'}</p>
        </div>
        {/* Actions */}
        <div className="flex gap-0.5 shrink-0">
          {assetId && onScaleChange && (
            <Button variant={hasCustomScale ? "secondary" : "ghost"} size="sm" className="h-5 w-5 p-0" onClick={() => setShowScale(!showScale)} title="Scale">
              <Move className="w-2.5 h-2.5" />
            </Button>
          )}
          <Button variant="outline" size="sm" className="h-5 text-[10px] px-1.5" onClick={onSelect}>{assetId ? 'Change' : 'Select'}</Button>
          {assetId && <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={onClear}><X className="w-2.5 h-2.5" /></Button>}
        </div>
      </div>
      {/* Scale controls */}
      {showScale && assetId && onScaleChange && (
        <ScaleEditor
          scaling={scaling || { x: 1, y: 1, z: 1 }}
          onChange={onScaleChange}
          onReset={onScaleReset}
        />
      )}
    </div>
  );
}

function ScaleEditor({ scaling, onChange, onReset }: {
  scaling: { x: number; y: number; z: number };
  onChange: (axis: 'x' | 'y' | 'z', value: number) => void;
  onReset?: () => void;
}) {
  const [lockUniform, setLockUniform] = useState(true);

  const handleChange = (axis: 'x' | 'y' | 'z', value: number) => {
    if (lockUniform) {
      onChange('x', value);
      onChange('y', value);
      onChange('z', value);
    } else {
      onChange(axis, value);
    }
  };

  return (
    <div className="px-2 pb-1.5 pt-0.5 border-t bg-muted/20 space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-muted-foreground">Scale</span>
        <div className="flex items-center gap-1">
          <button
            className={`text-[9px] px-1 rounded ${lockUniform ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setLockUniform(!lockUniform)}
            title={lockUniform ? 'Uniform scaling (click to unlock)' : 'Per-axis scaling (click to lock)'}
          >
            {lockUniform ? 'Uniform' : 'Per-axis'}
          </button>
          {onReset && (
            <button className="text-[9px] text-muted-foreground hover:text-foreground" onClick={onReset}>Reset</button>
          )}
        </div>
      </div>
      {lockUniform ? (
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground w-6">XYZ</span>
          <input type="range" min="0.1" max="5" step="0.1" value={scaling.x}
            onChange={(e) => handleChange('x', parseFloat(e.target.value))}
            className="flex-1 h-1 accent-primary" />
          <input type="number" min="0.01" max="50" step="0.1" value={scaling.x}
            onChange={(e) => handleChange('x', parseFloat(e.target.value) || 1)}
            className="w-12 h-5 text-[10px] text-center border rounded bg-background" />
        </div>
      ) : (
        (['x', 'y', 'z'] as const).map(axis => (
          <div key={axis} className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground w-6 uppercase">{axis}</span>
            <input type="range" min="0.1" max="5" step="0.1" value={scaling[axis]}
              onChange={(e) => handleChange(axis, parseFloat(e.target.value))}
              className="flex-1 h-1 accent-primary" />
            <input type="number" min="0.01" max="50" step="0.1" value={scaling[axis]}
              onChange={(e) => handleChange(axis, parseFloat(e.target.value) || 1)}
              className="w-12 h-5 text-[10px] text-center border rounded bg-background" />
          </div>
        ))
      )}
    </div>
  );
}

function ModelConfigRow({ label, value, assets, collectionId, modelsOnly, onAssetSelected, onClear, scaling, onScaleChange, onScaleReset }: {
  label: string; value?: string; assets: VisualAsset[]; collectionId: string; modelsOnly?: boolean;
  onAssetSelected: (asset: any) => void; onClear: () => void;
  scaling?: { x: number; y: number; z: number };
  onScaleChange?: (axis: 'x' | 'y' | 'z', value: number) => void;
  onScaleReset?: () => void;
}) {
  const [showScale, setShowScale] = useState(false);
  const hasCustomScale = scaling && (scaling.x !== 1 || scaling.y !== 1 || scaling.z !== 1);
  return (
    <div className="rounded border">
      <div className="flex items-center justify-between px-2 py-1.5">
        <div className="mr-2 min-w-0">
          <p className="text-xs font-medium capitalize">{label}</p>
        </div>
        <div className="flex gap-1 shrink-0 items-center">
          {value && onScaleChange && (
            <Button variant={hasCustomScale ? "secondary" : "ghost"} size="sm" className="h-6 w-6 p-0" onClick={() => setShowScale(!showScale)} title="Scale">
              <Move className="w-3 h-3" />
            </Button>
          )}
          <AssetSelect
            value={value}
            onSelect={onAssetSelected}
            onClear={onClear}
            collectionId={collectionId}
            modelsOnly={modelsOnly}
            placeholder="Select..."
            className="h-6 text-[10px] min-w-[120px]"
          />
        </div>
      </div>
      {showScale && value && onScaleChange && (
        <ScaleEditor
          scaling={scaling || { x: 1, y: 1, z: 1 }}
          onChange={onScaleChange}
          onReset={onScaleReset}
        />
      )}
    </div>
  );
}

// ─── Procedural Buildings Editor ────────────────────────────────────────────

const MATERIAL_TYPES = ['wood', 'stone', 'brick', 'metal', 'glass', 'stucco'] as const;
const ARCH_STYLES = ['medieval', 'modern', 'futuristic', 'rustic', 'industrial', 'colonial', 'creole'] as const;
const ROOF_STYLES = ['hip', 'gable', 'flat', 'side_gable', 'hipped_dormers'] as const;

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

function ProceduralBuildingsEditor({
  collection,
  onSave,
}: {
  collection: AssetCollection;
  onSave: (config: ProceduralBuildingConfig | null) => void;
}) {
  const existing = (collection as any).proceduralBuildings as ProceduralBuildingConfig | null;
  const [config, setConfig] = useState<ProceduralBuildingConfig>(
    existing || { stylePresets: [], buildingTypeOverrides: {} }
  );
  const [expandedPreset, setExpandedPreset] = useState<string | null>(null);
  const [expandedOverrides, setExpandedOverrides] = useState(false);
  const [dirty, setDirty] = useState(false);

  const update = (fn: (c: ProceduralBuildingConfig) => ProceduralBuildingConfig) => {
    setConfig(prev => fn({ ...prev }));
    setDirty(true);
  };

  const addPreset = () => {
    const id = `style_${Date.now()}`;
    const newPreset: ProceduralStylePreset = {
      id,
      name: 'New Style',
      baseColors: [{ r: 0.8, g: 0.75, b: 0.65 }],
      roofColor: { r: 0.3, g: 0.25, b: 0.2 },
      windowColor: { r: 0.8, g: 0.85, b: 0.9 },
      doorColor: { r: 0.4, g: 0.3, b: 0.2 },
      materialType: 'wood',
      architectureStyle: 'colonial',
    };
    update(c => ({ ...c, stylePresets: [...c.stylePresets, newPreset] }));
    setExpandedPreset(id);
  };

  const updatePreset = (id: string, partial: Partial<ProceduralStylePreset>) => {
    update(c => ({
      ...c,
      stylePresets: c.stylePresets.map(p => p.id === id ? { ...p, ...partial } : p),
    }));
  };

  const removePreset = (id: string) => {
    update(c => ({
      ...c,
      stylePresets: c.stylePresets.filter(p => p.id !== id),
      defaultResidentialStyleId: c.defaultResidentialStyleId === id ? undefined : c.defaultResidentialStyleId,
      defaultCommercialStyleId: c.defaultCommercialStyleId === id ? undefined : c.defaultCommercialStyleId,
    }));
    if (expandedPreset === id) setExpandedPreset(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Style Presets</p>
        <Button variant="ghost" size="sm" className="h-5 text-[10px] px-1.5" onClick={addPreset}>
          <Plus className="w-3 h-3 mr-0.5" /> Add
        </Button>
      </div>

      {config.stylePresets.length === 0 && (
        <p className="text-[10px] text-muted-foreground italic px-1">No procedural style presets defined. Buildings will use the default world style.</p>
      )}

      {config.stylePresets.map(preset => {
        const isExpanded = expandedPreset === preset.id;
        return (
          <div key={preset.id} className="border rounded">
            <button
              className="flex items-center justify-between w-full text-xs px-2 py-1.5 hover:bg-muted/50 rounded cursor-pointer transition-colors"
              onClick={() => setExpandedPreset(isExpanded ? null : preset.id)}
            >
              <div className="flex items-center gap-1.5">
                <ChevronRight className={`w-3 h-3 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                <div className="flex gap-1">
                  {preset.baseColors.slice(0, 4).map((c, i) => (
                    <div key={i} className="w-3 h-3 rounded-sm border" style={{ backgroundColor: colorToHex(c) }} />
                  ))}
                </div>
                <span className="font-medium truncate">{preset.name}</span>
              </div>
              <Badge variant="outline" className="text-[9px] h-4">{preset.architectureStyle}</Badge>
            </button>

            {isExpanded && (
              <div className="space-y-2 px-2 pb-2 border-t pt-2">
                <div>
                  <Label className="text-[10px]">Name</Label>
                  <Input className="h-6 text-xs" value={preset.name} onChange={e => updatePreset(preset.id, { name: e.target.value })} />
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <Label className="text-[10px]">Material</Label>
                    <Select value={preset.materialType} onValueChange={v => updatePreset(preset.id, { materialType: v as any })}>
                      <SelectTrigger className="h-6 text-[10px]"><SelectValue /></SelectTrigger>
                      <SelectContent>{MATERIAL_TYPES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[10px]">Architecture</Label>
                    <Select value={preset.architectureStyle} onValueChange={v => updatePreset(preset.id, { architectureStyle: v as any })}>
                      <SelectTrigger className="h-6 text-[10px]"><SelectValue /></SelectTrigger>
                      <SelectContent>{ARCH_STYLES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-[10px]">Roof Style</Label>
                  <Select value={preset.roofStyle || 'default'} onValueChange={v => updatePreset(preset.id, { roofStyle: v === 'default' ? undefined : v as any })}>
                    <SelectTrigger className="h-6 text-[10px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default (from architecture)</SelectItem>
                      {ROOF_STYLES.map(r => <SelectItem key={r} value={r}>{r.replace(/_/g, ' ')}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px]">Wall Colors (random per building)</Label>
                    <Button variant="ghost" size="sm" className="h-4 text-[9px] px-1" onClick={() => {
                      updatePreset(preset.id, { baseColors: [...preset.baseColors, { r: 0.7, g: 0.7, b: 0.7 }] });
                    }}><Plus className="w-2.5 h-2.5" /></Button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {preset.baseColors.map((c, i) => (
                      <div key={i} className="relative group">
                        <input type="color" value={colorToHex(c)}
                          onChange={e => {
                            const colors = [...preset.baseColors];
                            colors[i] = hexToColor(e.target.value);
                            updatePreset(preset.id, { baseColors: colors });
                          }}
                          className="w-6 h-6 rounded border cursor-pointer p-0" />
                        {preset.baseColors.length > 1 && (
                          <button className="absolute -top-1 -right-1 w-3 h-3 bg-destructive text-white rounded-full text-[8px] leading-none hidden group-hover:flex items-center justify-center"
                            onClick={() => updatePreset(preset.id, { baseColors: preset.baseColors.filter((_, j) => j !== i) })}>&times;</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {([['Roof', 'roofColor'], ['Window', 'windowColor'], ['Door', 'doorColor']] as const).map(([label, field]) => (
                    <div key={field}>
                      <Label className="text-[10px]">{label}</Label>
                      <input type="color" value={colorToHex((preset as any)[field])}
                        onChange={e => updatePreset(preset.id, { [field]: hexToColor(e.target.value) })}
                        className="w-full h-6 rounded border cursor-pointer p-0" />
                    </div>
                  ))}
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-muted-foreground">Features</p>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                    {([['Balcony', 'hasBalcony'], ['Ironwork Balcony', 'hasIronworkBalcony'], ['Front Porch', 'hasPorch'], ['Shutters', 'hasShutters']] as const).map(([label, field]) => (
                      <label key={field} className="flex items-center gap-1 text-[10px] cursor-pointer">
                        <input type="checkbox" checked={!!(preset as any)[field]}
                          onChange={e => updatePreset(preset.id, { [field]: e.target.checked || undefined })} className="w-3 h-3" />
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
                        onChange={e => updatePreset(preset.id, { porchDepth: parseFloat(e.target.value) || 3 })} />
                    </div>
                    <div>
                      <Label className="text-[10px]">Porch Steps</Label>
                      <Input type="number" className="h-6 text-xs" value={preset.porchSteps ?? 3}
                        onChange={e => updatePreset(preset.id, { porchSteps: parseInt(e.target.value) || 3 })} />
                    </div>
                  </div>
                )}

                {preset.hasShutters && (
                  <div>
                    <Label className="text-[10px]">Shutter Color</Label>
                    <input type="color" value={preset.shutterColor ? colorToHex(preset.shutterColor) : colorToHex(preset.doorColor)}
                      onChange={e => updatePreset(preset.id, { shutterColor: hexToColor(e.target.value) })}
                      className="w-full h-6 rounded border cursor-pointer p-0" />
                  </div>
                )}

                <Button variant="destructive" size="sm" className="w-full h-6 text-[10px]" onClick={() => removePreset(preset.id)}>
                  <Trash2 className="w-3 h-3 mr-1" /> Remove Style
                </Button>
              </div>
            )}
          </div>
        );
      })}

      {config.stylePresets.length > 0 && (
        <div className="space-y-1.5 border rounded p-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Default Styles</p>
          <div>
            <Label className="text-[10px]">Residential Default</Label>
            <Select value={config.defaultResidentialStyleId || 'random'}
              onValueChange={v => update(c => ({ ...c, defaultResidentialStyleId: v === 'random' ? undefined : v }))}>
              <SelectTrigger className="h-6 text-[10px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="random">Random from all presets</SelectItem>
                {config.stylePresets.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[10px]">Commercial Default</Label>
            <Select value={config.defaultCommercialStyleId || 'random'}
              onValueChange={v => update(c => ({ ...c, defaultCommercialStyleId: v === 'random' ? undefined : v }))}>
              <SelectTrigger className="h-6 text-[10px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="random">Random from all presets</SelectItem>
                {config.stylePresets.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="border rounded">
        <button className="flex items-center justify-between w-full text-xs px-2 py-1.5 hover:bg-muted/50 rounded cursor-pointer transition-colors"
          onClick={() => setExpandedOverrides(!expandedOverrides)}>
          <div className="flex items-center gap-1.5">
            <ChevronRight className={`w-3 h-3 text-muted-foreground transition-transform ${expandedOverrides ? 'rotate-90' : ''}`} />
            <span className="font-medium">Building Type Overrides</span>
          </div>
          <Badge variant="outline" className="text-[9px] h-4">{Object.keys(config.buildingTypeOverrides || {}).length}</Badge>
        </button>
        {expandedOverrides && (
          <BuildingTypeOverridesEditor overrides={config.buildingTypeOverrides || {}} stylePresets={config.stylePresets}
            onChange={overrides => update(c => ({ ...c, buildingTypeOverrides: overrides }))} />
        )}
      </div>

      {dirty && (
        <Button className="w-full h-7 text-xs"
          onClick={() => { onSave(config.stylePresets.length > 0 ? config : null); setDirty(false); }}>
          <Save className="w-3 h-3 mr-1" /> Save Procedural Config
        </Button>
      )}
    </div>
  );
}

// ─── NPC Config Editor ──────────────────────────────────────────────────────

const DEFAULT_BODY_MODELS = [
  'outfit_male_peasant', 'outfit_female_peasant',
  'outfit_male_ranger', 'outfit_female_ranger',
];

const DEFAULT_HAIR_STYLES: Record<string, string[]> = {
  male: ['buzzed', 'long', 'simpleparted'],
  female: ['long', 'buns', 'buzzedfemale'],
};

const DEFAULT_CLOTHING_PALETTE = [
  '#8B4513', '#2F4F4F', '#556B2F', '#191970', '#800020',
  '#C3B091', '#36454F', '#D2B48C', '#8E4585', '#725E54',
  '#008080', '#FFFDD0',
];

const DEFAULT_SKIN_TONE_PALETTE = [
  '#FFDFC4', '#F0D5BE', '#D1A684', '#C68642',
  '#8D5524', '#6B3E26', '#5C3317', '#3B2219',
];

function NpcConfigEditor({
  config,
  onSave,
  inline,
}: {
  config: NpcConfig | null;
  onSave: (config: NpcConfig | null) => void;
  inline?: boolean;
}) {
  const [local, setLocal] = useState<NpcConfig>(config || {});
  const [dirty, setDirty] = useState(false);
  const [newBodyModel, setNewBodyModel] = useState('');
  const [newHairGender, setNewHairGender] = useState('male');
  const [newHairStyle, setNewHairStyle] = useState('');

  const update = (fn: (c: NpcConfig) => NpcConfig) => {
    setLocal(prev => fn({ ...prev }));
    setDirty(true);
  };

  const handleSave = () => {
    const hasContent = (local.bodyModels?.length || 0) > 0 ||
      Object.keys(local.hairStyles || {}).length > 0 ||
      (local.clothingPalette?.length || 0) > 0 ||
      (local.skinTonePalette?.length || 0) > 0;
    onSave(hasContent ? local : null);
    setDirty(false);
  };

  // In inline mode (edit dialog), auto-sync to parent
  const effectiveSave = inline ? () => {
    const hasContent = (local.bodyModels?.length || 0) > 0 ||
      Object.keys(local.hairStyles || {}).length > 0 ||
      (local.clothingPalette?.length || 0) > 0 ||
      (local.skinTonePalette?.length || 0) > 0;
    onSave(hasContent ? local : null);
  } : undefined;

  const updateAndSync = (fn: (c: NpcConfig) => NpcConfig) => {
    setLocal(prev => {
      const next = fn({ ...prev });
      if (inline) {
        const hasContent = (next.bodyModels?.length || 0) > 0 ||
          Object.keys(next.hairStyles || {}).length > 0 ||
          (next.clothingPalette?.length || 0) > 0 ||
          (next.skinTonePalette?.length || 0) > 0;
        onSave(hasContent ? next : null);
      } else {
        setDirty(true);
      }
      return next;
    });
  };

  const addBodyModel = (model: string) => {
    if (!model.trim()) return;
    updateAndSync(c => ({
      ...c,
      bodyModels: [...(c.bodyModels || []).filter(m => m !== model.trim()), model.trim()],
    }));
    setNewBodyModel('');
  };

  const removeBodyModel = (model: string) => {
    updateAndSync(c => ({
      ...c,
      bodyModels: (c.bodyModels || []).filter(m => m !== model),
    }));
  };

  const addHairStyle = (gender: string, style: string) => {
    if (!style.trim()) return;
    updateAndSync(c => ({
      ...c,
      hairStyles: {
        ...(c.hairStyles || {}),
        [gender]: [...((c.hairStyles || {})[gender] || []).filter(s => s !== style.trim()), style.trim()],
      },
    }));
    setNewHairStyle('');
  };

  const removeHairStyle = (gender: string, style: string) => {
    updateAndSync(c => {
      const styles = { ...(c.hairStyles || {}) };
      styles[gender] = (styles[gender] || []).filter(s => s !== style);
      if (styles[gender].length === 0) delete styles[gender];
      return { ...c, hairStyles: styles };
    });
  };

  const updateColorPalette = (field: 'clothingPalette' | 'skinTonePalette', colors: string[]) => {
    updateAndSync(c => ({ ...c, [field]: colors.length > 0 ? colors : undefined }));
  };

  const loadDefaults = () => {
    updateAndSync(() => ({
      bodyModels: [...DEFAULT_BODY_MODELS],
      hairStyles: { male: [...DEFAULT_HAIR_STYLES.male], female: [...DEFAULT_HAIR_STYLES.female] },
      clothingPalette: [...DEFAULT_CLOTHING_PALETTE],
      skinTonePalette: [...DEFAULT_SKIN_TONE_PALETTE],
    }));
  };

  const hasAnyConfig = (local.bodyModels?.length || 0) > 0 ||
    Object.keys(local.hairStyles || {}).length > 0 ||
    (local.clothingPalette?.length || 0) > 0 ||
    (local.skinTonePalette?.length || 0) > 0;

  return (
    <div className="space-y-3">
      {!hasAnyConfig && (
        <div className="text-center py-2">
          <p className="text-[10px] text-muted-foreground italic mb-2">No NPC appearance config. NPCs will use default world settings.</p>
          <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={loadDefaults}>
            <Sparkles className="w-3 h-3 mr-1" /> Load Defaults
          </Button>
        </div>
      )}

      {/* Body Models */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Body Models</p>
          <Badge variant="outline" className="text-[9px] h-4">{local.bodyModels?.length || 0}</Badge>
        </div>
        <div className="flex flex-wrap gap-1 mb-1">
          {(local.bodyModels || []).map(model => (
            <Badge key={model} variant="secondary" className="text-[10px] h-5 gap-1 pr-1">
              {model.replace(/^outfit_/, '').replace(/_/g, ' ')}
              <button className="ml-0.5 hover:text-destructive" onClick={() => removeBodyModel(model)}>&times;</button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-1">
          <Select value={newBodyModel || '__custom__'} onValueChange={v => { if (v !== '__custom__') addBodyModel(v); }}>
            <SelectTrigger className="h-6 text-[10px] flex-1"><SelectValue placeholder="Add model..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__custom__" disabled>Add model...</SelectItem>
              {DEFAULT_BODY_MODELS.filter(m => !(local.bodyModels || []).includes(m)).map(m => (
                <SelectItem key={m} value={m}>{m.replace(/^outfit_/, '').replace(/_/g, ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-0.5">
            <Input className="h-6 text-[10px] w-28" placeholder="Custom model" value={newBodyModel} onChange={e => setNewBodyModel(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addBodyModel(newBodyModel); }} />
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => addBodyModel(newBodyModel)} disabled={!newBodyModel.trim()}>
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Hair Styles */}
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Hair Styles</p>
        {Object.entries(local.hairStyles || {}).map(([gender, styles]) => (
          <div key={gender} className="mb-1.5">
            <p className="text-[10px] font-medium capitalize mb-0.5">{gender}</p>
            <div className="flex flex-wrap gap-1">
              {styles.map(style => (
                <Badge key={style} variant="secondary" className="text-[10px] h-5 gap-1 pr-1">
                  {style}
                  <button className="ml-0.5 hover:text-destructive" onClick={() => removeHairStyle(gender, style)}>&times;</button>
                </Badge>
              ))}
            </div>
          </div>
        ))}
        <div className="flex gap-1">
          <Select value={newHairGender} onValueChange={setNewHairGender}>
            <SelectTrigger className="h-6 text-[10px] w-20"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
          <Input className="h-6 text-[10px] flex-1" placeholder="Hair style name" value={newHairStyle} onChange={e => setNewHairStyle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { addHairStyle(newHairGender, newHairStyle); } }} />
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => addHairStyle(newHairGender, newHairStyle)} disabled={!newHairStyle.trim()}>
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Clothing Palette */}
      <ColorPaletteEditor
        label="Clothing Palette"
        colors={local.clothingPalette || []}
        onChange={(colors) => updateColorPalette('clothingPalette', colors)}
      />

      {/* Skin Tone Palette */}
      <ColorPaletteEditor
        label="Skin Tone Palette"
        colors={local.skinTonePalette || []}
        onChange={(colors) => updateColorPalette('skinTonePalette', colors)}
      />

      {/* Save / Clear */}
      <div className="flex gap-1">
        {!inline && dirty && (
          <Button className="flex-1 h-7 text-xs" onClick={handleSave}>
            <Save className="w-3 h-3 mr-1" /> Save NPC Config
          </Button>
        )}
        {hasAnyConfig && (
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => {
            updateAndSync(() => ({}));
          }}>
            <X className="w-3 h-3 mr-1" /> Clear
          </Button>
        )}
      </div>
    </div>
  );
}

function ColorPaletteEditor({
  label,
  colors,
  onChange,
}: {
  label: string;
  colors: string[];
  onChange: (colors: string[]) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        <Button variant="ghost" size="sm" className="h-4 text-[9px] px-1" onClick={() => onChange([...colors, '#888888'])}>
          <Plus className="w-2.5 h-2.5" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-1">
        {colors.map((color, i) => (
          <div key={i} className="relative group">
            <input type="color" value={color}
              onChange={e => {
                const next = [...colors];
                next[i] = e.target.value;
                onChange(next);
              }}
              className="w-6 h-6 rounded border cursor-pointer p-0" />
            {colors.length > 0 && (
              <button className="absolute -top-1 -right-1 w-3 h-3 bg-destructive text-white rounded-full text-[8px] leading-none hidden group-hover:flex items-center justify-center"
                onClick={() => onChange(colors.filter((_, j) => j !== i))}>&times;</button>
            )}
          </div>
        ))}
        {colors.length === 0 && (
          <p className="text-[10px] text-muted-foreground italic">No colors defined</p>
        )}
      </div>
    </div>
  );
}

const BUILDING_TYPE_KEYS = [
  'residence_small', 'residence_medium', 'residence_large', 'residence_mansion',
  'Bakery', 'Restaurant', 'Tavern', 'Inn', 'Market', 'Shop', 'Blacksmith',
  'LawFirm', 'Bank', 'Hospital', 'School', 'Church', 'Theater', 'Library', 'ApartmentComplex',
];

function BuildingTypeOverridesEditor({ overrides, stylePresets, onChange }: {
  overrides: Record<string, ProceduralBuildingTypeOverride>;
  stylePresets: ProceduralStylePreset[];
  onChange: (o: Record<string, ProceduralBuildingTypeOverride>) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const addOverride = (type: string) => { onChange({ ...overrides, [type]: {} }); setExpanded(type); };
  const updateOverride = (type: string, partial: Partial<ProceduralBuildingTypeOverride>) => {
    onChange({ ...overrides, [type]: { ...overrides[type], ...partial } });
  };
  const removeOverride = (type: string) => {
    const next = { ...overrides }; delete next[type]; onChange(next);
    if (expanded === type) setExpanded(null);
  };

  const unusedTypes = BUILDING_TYPE_KEYS.filter(t => !(t in overrides));

  /** Build a ProceduralBuildingConfig scoped to a single type for preview */
  const buildPreviewConfig = (type: string, ov: ProceduralBuildingTypeOverride): ProceduralBuildingConfig => ({
    stylePresets,
    buildingTypeOverrides: { [type]: ov },
    defaultResidentialStyleId: undefined,
    defaultCommercialStyleId: undefined,
  });

  const isResidentialType = (type: string) => type.startsWith('residence_');

  return (
    <div className="space-y-1 px-2 pb-2 border-t pt-1.5">
      {Object.entries(overrides).map(([type, ov]) => {
        const isExp = expanded === type;
        return (
          <div key={type} className="border rounded">
            <button className="flex items-center justify-between w-full text-[10px] px-1.5 py-1 hover:bg-muted/50 rounded cursor-pointer"
              onClick={() => setExpanded(isExp ? null : type)}>
              <div className="flex items-center gap-1">
                <ChevronRight className={`w-2.5 h-2.5 text-muted-foreground transition-transform ${isExp ? 'rotate-90' : ''}`} />
                <span className="font-medium">{type.replace(/_/g, ' ')}</span>
              </div>
            </button>
            {isExp && (
              <div className="space-y-1.5 px-1.5 pb-1.5 border-t pt-1.5">
                <BuildingModelPreview
                  proceduralConfig={buildPreviewConfig(type, ov)}
                  buildingType={type}
                  zone={isResidentialType(type) ? 'residential' : 'commercial'}
                  tintColor={isResidentialType(type) ? { r: 0.3, g: 0.5, b: 0.8 } : { r: 0.8, g: 0.5, b: 0.2 }}
                  className="h-36 mb-1"
                />
                <div className="grid grid-cols-3 gap-1">
                  {(['floors', 'width', 'depth'] as const).map(f => (
                    <div key={f}>
                      <Label className="text-[9px] capitalize">{f}</Label>
                      <Input type="number" className="h-5 text-[10px]" value={(ov as any)[f] ?? ''} placeholder="default"
                        onChange={e => updateOverride(type, { [f]: e.target.value ? parseInt(e.target.value) : undefined })} />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-x-2 gap-y-0.5">
                  {(['hasChimney', 'hasBalcony', 'hasPorch'] as const).map(field => (
                    <label key={field} className="flex items-center gap-1 text-[9px] cursor-pointer">
                      <input type="checkbox" checked={!!ov[field]} className="w-2.5 h-2.5"
                        onChange={e => updateOverride(type, { [field]: e.target.checked || undefined })} />
                      {field.replace('has', '')}
                    </label>
                  ))}
                </div>
                {stylePresets.length > 0 && (
                  <div>
                    <Label className="text-[9px]">Force Style</Label>
                    <Select value={ov.stylePresetId || 'none'} onValueChange={v => updateOverride(type, { stylePresetId: v === 'none' ? undefined : v })}>
                      <SelectTrigger className="h-5 text-[9px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Use default</SelectItem>
                        {stylePresets.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button variant="ghost" size="sm" className="h-5 text-[9px] text-destructive w-full" onClick={() => removeOverride(type)}>
                  <Trash2 className="w-2.5 h-2.5 mr-0.5" /> Remove
                </Button>
              </div>
            )}
          </div>
        );
      })}
      {unusedTypes.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full h-5 text-[10px]">
              <Plus className="w-3 h-3 mr-0.5" /> Add Override
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-48 overflow-y-auto">
            {unusedTypes.map(t => (
              <DropdownMenuItem key={t} className="text-xs" onClick={() => addOverride(t)}>{t.replace(/_/g, ' ')}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
