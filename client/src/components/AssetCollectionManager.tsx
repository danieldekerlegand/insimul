import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Package, Image as ImageIcon, Sparkles, Save, X, RefreshCw, ChevronDown, Home, Users, Trees, Box, User, Swords } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { VisualAssetGeneratorDialog } from "./VisualAssetGeneratorDialog";
import { AssetBrowserDialog } from "./AssetBrowserDialog";
import { PolyhavenBrowserDialog } from "./PolyhavenBrowserDialog";
import type { AssetCollection, VisualAsset } from "@shared/schema";

interface AssetCollectionManagerProps {
  onRefresh?: () => void;
}

const WORLD_TYPES = [
  { value: "medieval-fantasy", label: "Medieval Fantasy" },
  { value: "high-fantasy", label: "High Fantasy" },
  { value: "low-fantasy", label: "Low Fantasy" },
  { value: "dark-fantasy", label: "Dark Fantasy" },
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
  { value: "wild-west", label: "Wild West" },
  { value: "modern", label: "Modern" },
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

export function AssetCollectionManager({ onRefresh }: AssetCollectionManagerProps) {
  const { toast } = useToast();
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<AssetCollection | null>(null);
  const [showAssetGenerator, setShowAssetGenerator] = useState(false);
  const [showAssetBrowser, setShowAssetBrowser] = useState(false);
  const [showAllAssetsBrowser, setShowAllAssetsBrowser] = useState(false);
  const [showPolyhavenBrowser, setShowPolyhavenBrowser] = useState(false);
  const [showModelBrowser, setShowModelBrowser] = useState(false);
  const [modelBrowserContext, setModelBrowserContext] = useState<{
    group: 'texture' | 'building' | 'nature' | 'character' | 'object';
    key: string;
  } | null>(null);
  const [generatorAssetType, setGeneratorAssetType] = useState<'character_portrait' | 'building_exterior' | 'texture_ground' | 'texture_wall' | 'texture_material'>('texture_ground');
  
  // 3D Config state
  const [groundTextureId, setGroundTextureId] = useState<string>('');
  const [roadTextureId, setRoadTextureId] = useState<string>('');
  const [buildingModels, setBuildingModels] = useState<Record<string, string>>({});
  const [natureModels, setNatureModels] = useState<Record<string, string>>({});
  const [characterModels, setCharacterModels] = useState<Record<string, string>>({});
  const [objectModels, setObjectModels] = useState<Record<string, string>>({});
  const [playerModels, setPlayerModels] = useState<Record<string, string>>({});
  const [questObjectModels, setQuestObjectModels] = useState<Record<string, string>>({});

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [collectionType, setCollectionType] = useState("complete_theme");
  const [worldType, setWorldType] = useState("medieval-fantasy");
  const [purpose, setPurpose] = useState("");
  const [tags, setTags] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [baseCollectionId, setBaseCollectionId] = useState("");

  // Fetch all asset collections
  const { data: collections = [], isLoading, refetch } = useQuery<AssetCollection[]>({
    queryKey: ['/api/asset-collections'],
    queryFn: async () => {
      const response = await fetch('/api/asset-collections');
      if (!response.ok) throw new Error('Failed to fetch collections');
      return response.json();
    },
  });

  // Fetch base collections for "Copy from Base" selector
  const { data: baseCollections = [] } = useQuery<AssetCollection[]>({
    queryKey: ['/api/asset-collections', 'base'],
    queryFn: async () => {
      const response = await fetch('/api/asset-collections?isBase=true');
      if (!response.ok) throw new Error('Failed to fetch base collections');
      return response.json();
    },
  });

  // Fetch assets for selected collection
  const { data: collectionAssets = [] } = useQuery<VisualAsset[]>({
    queryKey: ['/api/asset-collections', selectedCollection?.id, 'assets'],
    enabled: !!selectedCollection?.id,
    queryFn: async () => {
      if (!selectedCollection) return [];
      const assetIds = selectedCollection.assetIds || [];
      if (assetIds.length === 0) return [];
      
      const response = await fetch(`/api/visual-assets?ids=${assetIds.join(',')}`);
      if (!response.ok) throw new Error('Failed to fetch assets');
      return response.json();
    },
  });

  const resetForm = () => {
    setName('');
    setDescription('');
    setCollectionType('complete_theme');
    setWorldType('medieval-fantasy');
    setPurpose('');
    setTags('');
    setIsPublic(true);
    setBaseCollectionId('');
    setGroundTextureId('');
    setRoadTextureId('');
    setBuildingModels({});
    setNatureModels({});
    setCharacterModels({});
    setObjectModels({});
    setPlayerModels({});
    setQuestObjectModels({});
  };

  const loadCollectionToForm = (collection: AssetCollection) => {
    setName(collection.name);
    setDescription(collection.description || '');
    setCollectionType(collection.collectionType);
    setWorldType(collection.worldType || 'medieval-fantasy');
    setPurpose(collection.purpose || '');
    setTags(collection.tags?.join(', ') || '');
    setIsPublic(collection.isPublic ?? true);
    
    // Load 3D config if available
    const config = (collection as any).config3D || {};
    setGroundTextureId(config.groundTextureId || '');
    setRoadTextureId(config.roadTextureId || '');
    setBuildingModels(config.buildingModels || {});
    setNatureModels(config.natureModels || {});
    setCharacterModels(config.characterModels || {});
    setObjectModels(config.objectModels || {});
    setPlayerModels(config.playerModels || {});
    setQuestObjectModels(config.questObjectModels || {});
  };

  const handleCreate = async () => {
    if (!token) {
      toast({
        title: "Authentication required",
        description: "You must be logged in as an admin to create collections.",
        variant: "destructive",
      });
      return;
    }

    try {
      // If base collection selected, copy from it
      let initialAssets: string[] = [];
      let initial3DConfig = {
        groundTextureId: groundTextureId || null,
        roadTextureId: roadTextureId || null,
        buildingModels,
        natureModels,
        characterModels,
        objectModels,
        playerModels,
        questObjectModels,
      };

      if (baseCollectionId) {
        const baseCollection = baseCollections.find(bc => bc.id === baseCollectionId);
        if (baseCollection) {
          initialAssets = baseCollection.assetIds || [];
          initial3DConfig = {
            groundTextureId: baseCollection.groundTextureId || null,
            roadTextureId: baseCollection.roadTextureId || null,
            buildingModels: baseCollection.buildingModels || {},
            natureModels: baseCollection.natureModels || {},
            characterModels: baseCollection.characterModels || {},
            objectModels: baseCollection.objectModels || {},
            playerModels: baseCollection.playerModels || {},
            questObjectModels: baseCollection.questObjectModels || {},
          };
        }
      }

      const response = await fetch('/api/asset-collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description: description || null,
          collectionType,
          worldType: worldType || null,
          purpose: purpose || null,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          isPublic,
          isBase: false, // User-created collections are never base
          assetIds: initialAssets, // Copy from base if selected
          config3D: initial3DConfig,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to create collection');
      }

      const copiedMsg = baseCollectionId ? ' (copied from base collection)' : '';
      toast({
        title: "Collection created",
        description: `${name} has been created successfully${copiedMsg}.`,
      });

      queryClient.invalidateQueries({ queryKey: ['/api/asset-collections'] });
      setShowCreateDialog(false);
      resetForm();
      onRefresh?.();
    } catch (error) {
      toast({
        title: "Creation failed",
        description: error instanceof Error ? error.message : "Failed to create collection",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async () => {
    if (!token || !selectedCollection) return;

    try {
      const response = await fetch(`/api/asset-collections/${selectedCollection.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description: description || null,
          collectionType,
          worldType,
          purpose: purpose || null,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          isPublic,
          config3D: {
            groundTextureId: groundTextureId || null,
            roadTextureId: roadTextureId || null,
            buildingModels,
            natureModels,
            characterModels,
            objectModels,
            playerModels,
            questObjectModels,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to update collection');
      }

      toast({
        title: "Collection updated",
        description: `${name} has been updated successfully.`,
      });

      queryClient.invalidateQueries({ queryKey: ['/api/asset-collections'] });
      setShowEditDialog(false);
      setSelectedCollection(null);
      resetForm();
      onRefresh?.();
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update collection",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!token || !selectedCollection) return;

    try {
      const response = await fetch(`/api/asset-collections/${selectedCollection.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to delete collection');
      }

      toast({
        title: "Collection deleted",
        description: `${selectedCollection.name} has been deleted.`,
      });

      queryClient.invalidateQueries({ queryKey: ['/api/asset-collections'] });
      setShowDeleteDialog(false);
      setSelectedCollection(null);
      onRefresh?.();
    } catch (error) {
      toast({
        title: "Deletion failed",
        description: error instanceof Error ? error.message : "Failed to delete collection",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Asset Collections</h2>
          <p className="text-sm text-muted-foreground">
            Manage global asset collections that can be assigned to worlds
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAllAssetsBrowser(true)}>
            <ImageIcon className="w-4 h-4 mr-2" />
            Browse All Assets
          </Button>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Collection
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Loading collections...
          </CardContent>
        </Card>
      ) : collections.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="font-medium mb-1">No asset collections yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first asset collection to get started
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Collection
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {collections.map((collection) => {
            const assetCount = collection.assetIds?.length || 0;
            const typeLabel = COLLECTION_TYPES.find(t => t.value === collection.collectionType)?.label || collection.collectionType;
            const worldTypeLabel = WORLD_TYPES.find(t => t.value === collection.worldType)?.label || collection.worldType;
            const isBaseCollection = (collection as any).isBase === true;

            return (
              <Card
                key={collection.id}
                className={`hover:shadow-lg transition-shadow ${isBaseCollection ? 'border-blue-500 border-2' : ''}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {collection.name}
                        {isBaseCollection && (
                          <Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Base Collection
                          </Badge>
                        )}
                      </CardTitle>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">
                          {typeLabel}
                        </Badge>
                        {collection.worldType ? (
                          <Badge variant="secondary" className="text-xs">
                            {worldTypeLabel}
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            ⚠️ No World Type
                          </Badge>
                        )}
                        {collection.isPublic && (
                          <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Public
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {collection.description && (
                    <CardDescription className="line-clamp-2 mt-2">
                      {collection.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Assets:</span>{" "}
                      <span className="font-medium">{assetCount}</span>
                    </div>
                    {collection.purpose && (
                      <div className="text-xs text-muted-foreground">
                        {collection.purpose}
                      </div>
                    )}
                    <div className="flex flex-col gap-2 pt-2">
                      {/* Hide Edit/Delete/Generate for base collections */}
                      {!isBaseCollection && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => {
                              setSelectedCollection(collection);
                              loadCollectionToForm(collection);
                              setShowEditDialog(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Collection
                          </Button>
                        </>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          setSelectedCollection(collection);
                          setShowAssetBrowser(true);
                        }}
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        {isBaseCollection ? 'View Assets' : 'Browse Assets'} ({assetCount})
                      </Button>

                      {/* Show "Create Copy" button for base collections */}
                      {isBaseCollection && (
                        <Button
                          size="sm"
                          variant="default"
                          className="w-full justify-start"
                          onClick={() => {
                            setBaseCollectionId(collection.id);
                            setWorldType(collection.worldType || 'generic');
                            setName(`${collection.name} (Copy)`);
                            setDescription(collection.description || '');
                            setCollectionType(collection.collectionType);
                            setShowCreateDialog(true);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create Copy
                        </Button>
                      )}

                      {!isBaseCollection && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => {
                              console.log('[AssetCollectionManager] Opening Polyhaven browser for collection:', {
                                id: collection.id,
                                name: collection.name,
                                worldType: collection.worldType,
                                collectionType: collection.collectionType
                              });
                              setSelectedCollection(collection);
                              setShowPolyhavenBrowser(true);
                            }}
                          >
                            <Package className="w-4 h-4 mr-2" />
                            Add from Polyhaven
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                variant="default"
                                className="w-full justify-start"
                              >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Generate Assets
                                <ChevronDown className="w-4 h-4 ml-auto" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuLabel>Asset Type</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedCollection(collection);
                                  setGeneratorAssetType('character_portrait');
                                  setShowAssetGenerator(true);
                                }}
                              >
                                <Users className="w-4 h-4 mr-2" />
                                Character Portrait
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedCollection(collection);
                                  setGeneratorAssetType('building_exterior');
                                  setShowAssetGenerator(true);
                                }}
                              >
                                <Home className="w-4 h-4 mr-2" />
                                Building Exterior
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Textures</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedCollection(collection);
                                  setGeneratorAssetType('texture_ground');
                                  setShowAssetGenerator(true);
                                }}
                              >
                                <Box className="w-4 h-4 mr-2" />
                                Ground Texture
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedCollection(collection);
                                  setGeneratorAssetType('texture_wall');
                                  setShowAssetGenerator(true);
                                }}
                              >
                                <Box className="w-4 h-4 mr-2" />
                                Wall Texture
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedCollection(collection);
                                  setGeneratorAssetType('texture_material');
                                  setShowAssetGenerator(true);
                                }}
                              >
                                <Box className="w-4 h-4 mr-2" />
                                Material Texture
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <Button
                            size="sm"
                            variant="destructive"
                            className="w-full justify-start"
                            onClick={() => {
                              setSelectedCollection(collection);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Collection
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Create Asset Collection</DialogTitle>
            <DialogDescription>
              Create a new asset collection that can be assigned to worlds
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-name">Name *</Label>
                <Input
                  id="create-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Medieval Fantasy Pack"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-type">Collection Type *</Label>
                <Select value={collectionType} onValueChange={setCollectionType}>
                  <SelectTrigger id="create-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLLECTION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-world-type">
                World Type <span className="text-xs text-muted-foreground">(Optional)</span>
              </Label>
              <Select value={worldType} onValueChange={setWorldType}>
                <SelectTrigger id="create-world-type">
                  <SelectValue placeholder="Select world type (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (Generic)</SelectItem>
                  {WORLD_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="base-collection">
                Copy from Base Collection <span className="text-xs text-muted-foreground">(Optional)</span>
              </Label>
              <Select value={baseCollectionId} onValueChange={setBaseCollectionId}>
                <SelectTrigger id="base-collection">
                  <SelectValue placeholder="None (empty collection)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (empty collection)</SelectItem>
                  {baseCollections.map((bc) => (
                    <SelectItem key={bc.id} value={bc.id}>
                      {bc.name} {bc.worldType ? `(${bc.worldType})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Pre-populate this collection with all assets and configuration from a base collection
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-description">Description</Label>
              <Textarea
                id="create-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A complete set of medieval fantasy assets..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-purpose">Purpose</Label>
              <Input
                id="create-purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Complete medieval fantasy asset pack"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-tags">Tags (comma-separated)</Label>
              <Input
                id="create-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="medieval, fantasy, buildings, textures"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="create-public"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="create-public" className="cursor-pointer">
                Make this collection public (available to all users)
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!name.trim()}>
              <Save className="w-4 h-4 mr-2" />
              Create Collection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Edit Asset Collection</DialogTitle>
            <DialogDescription>
              Update collection details and manage assets
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="3d-config">3D Assets</TabsTrigger>
              <TabsTrigger value="assets">
                Assets ({collectionAssets.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name *</Label>
                  <Input
                    id="edit-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-type">Collection Type *</Label>
                  <Select value={collectionType} onValueChange={setCollectionType}>
                    <SelectTrigger id="edit-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COLLECTION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-world-type">World Type</Label>
                <Select value={worldType} onValueChange={setWorldType}>
                  <SelectTrigger id="edit-world-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WORLD_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-purpose">Purpose</Label>
                <Input
                  id="edit-purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
                <Input
                  id="edit-tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-public"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="edit-public" className="cursor-pointer">
                  Make this collection public (available to all users)
                </Label>
              </div>
            </TabsContent>

            <TabsContent value="3d-config" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Terrain & Textures</CardTitle>
                  <CardDescription>
                    Select default textures for ground and roads in this collection
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between rounded border px-3 py-2">
                    <div className="mr-2">
                      <p className="text-sm font-medium">Ground Texture</p>
                      <p className="text-xs text-muted-foreground">
                        {groundTextureId
                          ? collectionAssets.find(a => a.id === groundTextureId)?.name || 'Unknown texture'
                          : 'No texture selected'}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setModelBrowserContext({ group: 'texture', key: 'groundTextureId' });
                        setShowModelBrowser(true);
                      }}
                    >
                      Select Texture
                    </Button>
                  </div>

                  <div className="flex items-center justify-between rounded border px-3 py-2">
                    <div className="mr-2">
                      <p className="text-sm font-medium">Road Texture</p>
                      <p className="text-xs text-muted-foreground">
                        {roadTextureId
                          ? collectionAssets.find(a => a.id === roadTextureId)?.name || 'Unknown texture'
                          : 'No texture selected'}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setModelBrowserContext({ group: 'texture', key: 'roadTextureId' });
                        setShowModelBrowser(true);
                      }}
                    >
                      Select Texture
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Building Models</CardTitle>
                  <CardDescription>
                    Configure default 3D models for buildings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Building model configuration will be available once you add building assets to this collection.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Player Models
                  </CardTitle>
                  <CardDescription>
                    Configure player character models for the game
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {['default', 'male', 'female', 'knight', 'mage', 'rogue'].map((role) => (
                    <div key={role} className="flex items-center justify-between rounded border px-3 py-2">
                      <div className="mr-2">
                        <p className="text-sm font-medium capitalize">{role} Player</p>
                        <p className="text-xs text-muted-foreground">
                          {playerModels[role]
                            ? collectionAssets.find(a => a.id === playerModels[role])?.name || 'Selected'
                            : 'No model selected'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setModelBrowserContext({ group: 'character', key: `player_${role}` });
                            setShowModelBrowser(true);
                          }}
                        >
                          Select
                        </Button>
                        {playerModels[role] && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPlayerModels(prev => {
                              const next = { ...prev };
                              delete next[role];
                              return next;
                            })}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    NPC Models
                  </CardTitle>
                  <CardDescription>
                    Configure NPC character models
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {['civilian_male', 'civilian_female', 'guard', 'merchant', 'noble'].map((role) => (
                    <div key={role} className="flex items-center justify-between rounded border px-3 py-2">
                      <div className="mr-2">
                        <p className="text-sm font-medium">{role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                        <p className="text-xs text-muted-foreground">
                          {characterModels[role]
                            ? collectionAssets.find(a => a.id === characterModels[role])?.name || 'Selected'
                            : 'No model selected'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setModelBrowserContext({ group: 'character', key: role });
                            setShowModelBrowser(true);
                          }}
                        >
                          Select
                        </Button>
                        {characterModels[role] && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCharacterModels(prev => {
                              const next = { ...prev };
                              delete next[role];
                              return next;
                            })}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Swords className="w-4 h-4" />
                    Quest Object Models
                  </CardTitle>
                  <CardDescription>
                    Configure models for quest items and objectives
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {['collectible', 'marker', 'container', 'key', 'scroll'].map((role) => (
                    <div key={role} className="flex items-center justify-between rounded border px-3 py-2">
                      <div className="mr-2">
                        <p className="text-sm font-medium capitalize">{role}</p>
                        <p className="text-xs text-muted-foreground">
                          {questObjectModels[role]
                            ? collectionAssets.find(a => a.id === questObjectModels[role])?.name || 'Selected'
                            : 'No model selected'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setModelBrowserContext({ group: 'object', key: `quest_${role}` });
                            setShowModelBrowser(true);
                          }}
                        >
                          Select
                        </Button>
                        {questObjectModels[role] && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setQuestObjectModels(prev => {
                              const next = { ...prev };
                              delete next[role];
                              return next;
                            })}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Trees className="w-4 h-4" />
                    Nature Models
                  </CardTitle>
                  <CardDescription>
                    Configure nature element models (trees, rocks, shrubs)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {['defaultTree', 'tree', 'rock', 'shrub', 'bush'].map((role) => (
                    <div key={role} className="flex items-center justify-between rounded border px-3 py-2">
                      <div className="mr-2">
                        <p className="text-sm font-medium">{role.replace(/([A-Z])/g, ' $1').trim()}</p>
                        <p className="text-xs text-muted-foreground">
                          {natureModels[role]
                            ? collectionAssets.find(a => a.id === natureModels[role])?.name || 'Selected'
                            : 'No model selected'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setModelBrowserContext({ group: 'nature', key: role });
                            setShowModelBrowser(true);
                          }}
                        >
                          Select
                        </Button>
                        {natureModels[role] && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setNatureModels(prev => {
                              const next = { ...prev };
                              delete next[role];
                              return next;
                            })}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assets" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Manage assets in this collection
                </p>
                <Button
                  size="sm"
                  onClick={() => {
                    setGeneratorAssetType('texture_ground');
                    setShowAssetGenerator(true);
                  }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Assets
                </Button>
              </div>

              {collectionAssets.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No assets in this collection yet</p>
                    <p className="text-xs mt-1">Generate or upload assets to get started</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {collectionAssets.map((asset) => (
                    <div key={asset.id} className="relative aspect-square rounded-md overflow-hidden border">
                      <img
                        src={`/${asset.filePath}`}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1">
                        <p className="text-xs text-white truncate">
                          {asset.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditDialog(false);
              setSelectedCollection(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={!name.trim()}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Collection?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedCollection?.name}</strong>?
              This will not delete the assets themselves, but worlds using this collection
              will need to select a different one.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedCollection(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Collection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Asset Generator Dialog */}
      {selectedCollection && (
        <VisualAssetGeneratorDialog
          open={showAssetGenerator}
          onOpenChange={setShowAssetGenerator}
          entityType="collection"
          entityId={selectedCollection.id}
          entityName={selectedCollection.name}
          assetType={generatorAssetType}
          onAssetGenerated={() => {
            queryClient.invalidateQueries({ queryKey: ['/api/asset-collections', selectedCollection.id, 'assets'] });
          }}
        />
      )}

      {/* Asset Browser Dialog */}
      {selectedCollection && (
        <AssetBrowserDialog
          open={showAssetBrowser}
          onOpenChange={(open) => {
            setShowAssetBrowser(open);
            if (!open) setSelectedCollection(null);
          }}
          collectionId={selectedCollection.id}
        />
      )}

      {/* Polyhaven Browser Dialog */}
      {selectedCollection && (
        <PolyhavenBrowserDialog
          open={showPolyhavenBrowser}
          onOpenChange={(open) => {
            setShowPolyhavenBrowser(open);
            if (!open) setSelectedCollection(null);
          }}
          collectionId={selectedCollection.id}
          collectionType={selectedCollection.collectionType}
          worldType={selectedCollection.worldType || 'generic'}
          onAssetsSelected={(assetIds) => {
            toast({
              title: 'Polyhaven Assets Added',
              description: `Added ${assetIds.length} assets to the collection`,
            });
            // TODO: Actually add the assets to the collection
          }}
        />
      )}

      {/* Model Browser Dialog for 3D Asset Selection */}
      {selectedCollection && showModelBrowser && modelBrowserContext && (
        <AssetBrowserDialog
          open={showModelBrowser}
          onOpenChange={(open) => {
            setShowModelBrowser(open);
            if (!open) setModelBrowserContext(null);
          }}
          collectionId={selectedCollection.id}
          modelsOnly={modelBrowserContext.group !== 'texture'}
          onAssetSelected={(asset) => {
            if (!modelBrowserContext) return;

            const { group, key } = modelBrowserContext;

            // Update the appropriate state based on the group
            if (group === 'texture') {
              if (key === 'groundTextureId') {
                setGroundTextureId(asset.id);
              } else if (key === 'roadTextureId') {
                setRoadTextureId(asset.id);
              }
            } else if (group === 'building') {
              setBuildingModels(prev => ({ ...prev, [key]: asset.id }));
            } else if (group === 'nature') {
              setNatureModels(prev => ({ ...prev, [key]: asset.id }));
            } else if (group === 'character') {
              // Handle player models (key starts with "player_")
              if (key.startsWith('player_')) {
                const role = key.replace('player_', '');
                setPlayerModels(prev => ({ ...prev, [role]: asset.id }));
              } else {
                // Handle NPC models
                setCharacterModels(prev => ({ ...prev, [key]: asset.id }));
              }
            } else if (group === 'object') {
              // Handle quest object models (key starts with "quest_")
              if (key.startsWith('quest_')) {
                const role = key.replace('quest_', '');
                setQuestObjectModels(prev => ({ ...prev, [role]: asset.id }));
              } else {
                setObjectModels(prev => ({ ...prev, [key]: asset.id }));
              }
            }

            toast({
              title: 'Asset Selected',
              description: `${asset.name} assigned as ${key}`,
            });

            setShowModelBrowser(false);
            setModelBrowserContext(null);
          }}
        />
      )}

      {/* Browse All Assets Dialog (no collection filter) */}
      <AssetBrowserDialog
        open={showAllAssetsBrowser}
        onOpenChange={setShowAllAssetsBrowser}
      />
    </div>
  );
}
