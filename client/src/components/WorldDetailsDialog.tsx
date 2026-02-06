import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Globe, Edit3, Trash2, Save, X, Info, Sparkles, Image as ImageIcon, BarChart3, Plus, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { VisualAssetGeneratorDialog } from './VisualAssetGeneratorDialog';
import { AssetBrowserDialog } from './AssetBrowserDialog';
import { BatchGenerationDialog } from './BatchGenerationDialog';
import { JobQueueViewer } from './JobQueueViewer';
import type { World, VisualAsset, AssetCollection } from '@shared/schema';

type World3DConfig = {
  buildingModels?: Record<string, string>;
  natureModels?: Record<string, string>;
  characterModels?: Record<string, string>;
  objectModels?: Record<string, string>;
  groundTextureId?: string;
  roadTextureId?: string;
};

interface WorldDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  world: World | null;
  onWorldUpdated: () => void;
  onWorldDeleted: () => void;
}

export function WorldDetailsDialog({
  open,
  onOpenChange,
  world,
  onWorldUpdated,
  onWorldDeleted
}: WorldDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { token } = useAuth();

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Geographical data
  const [countries, setCountries] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [totalPopulation, setTotalPopulation] = useState(0);

  // Visual Assets state
  const [showAssetGenerator, setShowAssetGenerator] = useState(false);
  const [showAssetBrowser, setShowAssetBrowser] = useState(false);
  const [showBatchGeneration, setShowBatchGeneration] = useState(false);
  const [showJobQueue, setShowJobQueue] = useState(false);
  const [assetType, setAssetType] = useState<'texture_ground' | 'texture_wall' | 'texture_material'>('texture_ground');
  const [world3DConfig, setWorld3DConfig] = useState<World3DConfig | null>(null);
  const [isLoading3DConfig, setIsLoading3DConfig] = useState(false);
  const [showModelBrowser, setShowModelBrowser] = useState(false);
  const [modelBrowserContext, setModelBrowserContext] = useState<{
    group: 'building' | 'nature' | 'character' | 'texture' | 'object';
    key: string;
  } | null>(null);
  const [isSyncing3DDefaults, setIsSyncing3DDefaults] = useState(false);
  
  // User collection creation state
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [newCollectionType, setNewCollectionType] = useState('texture_pack');
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);

  // Fetch world visual assets
  const { data: worldAssets = [] } = useQuery<VisualAsset[]>({
    queryKey: ['/api/worlds', world?.id, 'assets'],
    enabled: !!world?.id && open
  });

  // Fetch asset collections for this world
  const { data: worldCollections = [], isLoading: isLoadingCollections } = useQuery<AssetCollection[]>({
    queryKey: ['/api/worlds', world?.id, 'asset-collections'],
    enabled: !!world?.id && open
  });

  // Fetch all available global asset collections
  const { data: availableCollections = [] } = useQuery<AssetCollection[]>({
    queryKey: ['/api/asset-collections', 'global'],
    queryFn: async () => {
      const response = await fetch('/api/asset-collections?global=true');
      if (!response.ok) throw new Error('Failed to fetch collections');
      return response.json();
    },
    enabled: open
  });

  // State for selected asset collection
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');

  // Load world data when dialog opens
  useEffect(() => {
    if (world) {
      setName(world.name);
      setDescription(world.description || '');
      setSelectedCollectionId((world as any).selectedAssetCollectionId || '');
      
      // Fetch countries and settlements
      fetchGeographicalData(world.id);
    }
  }, [world]);
  
  // Load world-level 3D config
  useEffect(() => {
    const load3DConfig = async () => {
      if (!world?.id || !open) return;
      try {
        setIsLoading3DConfig(true);
        const response = await fetch(`/api/worlds/${world.id}/3d-config`);
        if (response.ok) {
          const data = await response.json();
          setWorld3DConfig(data as World3DConfig);
        }
      } catch (error) {
        console.error('Failed to fetch 3D config:', error);
      } finally {
        setIsLoading3DConfig(false);
      }
    };

    load3DConfig();
  }, [world?.id, open]);
  
  // Fetch countries and settlements for this world
  const fetchGeographicalData = async (worldId: string) => {
    try {
      const [countriesRes, settlementsRes] = await Promise.all([
        fetch(`/api/worlds/${worldId}/countries`),
        fetch(`/api/worlds/${worldId}/settlements`)
      ]);
      
      if (countriesRes.ok && settlementsRes.ok) {
        const countriesData = await countriesRes.json();
        const settlementsData = await settlementsRes.json();
        
        setCountries(countriesData);
        setSettlements(settlementsData);
        
        // Calculate total population
        const total = settlementsData.reduce((sum: number, s: any) => sum + (s.population || 0), 0);
        setTotalPopulation(total);
      }
    } catch (error) {
      console.error('Failed to fetch geographical data:', error);
    }
  };

  const handleResync3DDefaults = async () => {
    if (!world) return;
    if (!token) {
      toast({
        title: 'Authentication required',
        description: 'Sign in as the world owner to sync 3D defaults for this world.',
        variant: 'destructive',
      });
      return;
    }
    try {
      setIsSyncing3DDefaults(true);
      const response = await fetch(`/api/worlds/${world.id}/3d-config/sync-defaults`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error((data as any).error || 'Failed to sync 3D defaults');
      }

      setWorld3DConfig((data as any).world3DConfig as World3DConfig);

      // Refresh assets in case new VisualAssets were created during syncing
      queryClient.invalidateQueries({ queryKey: ['/api/worlds', world.id, 'assets'] });

      toast({
        title: '3D defaults synced',
        description: 'Default 3D building and tree models have been configured for this world.',
      });
    } catch (error) {
      toast({
        title: 'Sync failed',
        description: error instanceof Error ? error.message : 'Failed to sync 3D defaults',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing3DDefaults(false);
    }
  };

  const hasBuildingDefaults = !!world3DConfig?.buildingModels &&
    ['default', 'smallResidence'].every((key) => {
      const id = world3DConfig.buildingModels?.[key];
      return !!id && worldAssets.some((a) => a.id === id);
    });

  const hasNatureDefaults = !!world3DConfig?.natureModels &&
    !!world3DConfig.natureModels.defaultTree &&
    worldAssets.some((a) => a.id === world3DConfig.natureModels!.defaultTree);

  const defaultsInSync = hasBuildingDefaults && hasNatureDefaults;

  const groundTexture = world3DConfig?.groundTextureId
    ? worldAssets.find((a) => a.id === world3DConfig.groundTextureId)
    : undefined;

  const roadTexture = world3DConfig?.roadTextureId
    ? worldAssets.find((a) => a.id === world3DConfig.roadTextureId)
    : undefined;

  const objectRoles = world3DConfig?.objectModels
    ? Object.keys(world3DConfig.objectModels).sort()
    : [];

  const handleSave = async () => {
    if (!world) return;

    if (!token) {
      toast({
        title: 'Authentication required',
        description: 'Sign in as the world owner to update this world.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/worlds/${world.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description: description || null
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update world');
      }

      toast({
        title: 'World Updated',
        description: 'World information has been saved successfully'
      });

      setIsEditing(false);
      onWorldUpdated();
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update world',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!world) return;

    try {
      const response = await fetch(`/api/worlds/${world.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete world');
      }

      toast({
        title: 'World Deleted',
        description: `${world.name} has been permanently deleted`
      });

      onWorldDeleted();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Delete Failed',
        description: error instanceof Error ? error.message : 'Failed to delete world',
        variant: 'destructive'
      });
    }
  };

  const handleCancel = () => {
    if (world) {
      // Reset to original values
      setName(world.name);
      setDescription(world.description || '');
    }
    setIsEditing(false);
  };

  if (!world) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {isEditing ? 'Edit World' : 'World Details'}
              </DialogTitle>
              <div className="flex gap-2">
                {!isEditing ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={isSaving || !name.trim()}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                  </>
                )}
              </div>
            </div>
            <DialogDescription>
              {isEditing ? 'Edit world information and settings' : 'View detailed information about this world'}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="world-name">World Name *</Label>
                  {isEditing ? (
                    <Input
                      id="world-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter world name"
                    />
                  ) : (
                    <p className="text-sm font-medium">{world.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Total Population</Label>
                  <p className="text-sm font-medium">{totalPopulation.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Calculated from {settlements.length} settlement(s)</p>
                </div>

                <div className="space-y-2">
                  <Label>Countries</Label>
                  <p className="text-sm font-medium">{countries.length}</p>
                  <p className="text-xs text-muted-foreground">Nation-states in this world</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                {isEditing ? (
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your world..."
                    rows={4}
                  />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{world.description || 'No description provided'}</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="3d-config" className="space-y-4 mt-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium mb-1">Terrain &amp; Textures</h4>
                      <p className="text-sm text-muted-foreground">
                        Select which textures the 3D game should use for ground and roads in this world.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded border px-3 py-2">
                      <div className="mr-2">
                        <p className="text-sm font-medium">Ground Texture</p>
                        <p className="text-xs text-muted-foreground">
                          {groundTexture ? groundTexture.name : 'No texture selected'}
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
                          {roadTexture ? roadTexture.name : 'No texture selected'}
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
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium mb-1">World Props (Object Roles)</h4>
                      <p className="text-sm text-muted-foreground">
                        Configure which 3D models are used for interactive world props like chests, lanterns, and data pads.
                      </p>
                    </div>
                  </div>

                  {objectRoles.length > 0 ? (
                    <div className="space-y-3">
                      {objectRoles.map((role) => {
                        const assetId = world3DConfig?.objectModels?.[role];
                        const asset = assetId ? worldAssets.find((a) => a.id === assetId) : undefined;
                        const label = role
                          .split('_')
                          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                          .join(' ');
                        return (
                          <div key={role} className="flex items-center justify-between rounded border px-3 py-2">
                            <div className="mr-2">
                              <p className="text-sm font-medium">{label}</p>
                              <p className="text-xs text-muted-foreground">
                                {asset ? asset.name : 'No model selected'}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setModelBrowserContext({ group: 'object', key: role });
                                setShowModelBrowser(true);
                              }}
                            >
                              Select Model
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No prop roles are configured yet for this world. Once world defaults are synced, object roles
                      like chests or lanterns will appear here.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="collections" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Asset Collections</h3>
                  <p className="text-sm text-muted-foreground">
                    Grouped sets of visual assets such as texture packs, building sets, and character sets.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {worldCollections.length} collection{worldCollections.length === 1 ? '' : 's'}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => setShowCreateCollection(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Collection
                  </Button>
                </div>
              </div>

              {/* Create Collection Form */}
              {showCreateCollection && (
                <Card className="border-primary/50 bg-primary/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Create New Collection
                    </CardTitle>
                    <CardDescription>Create a custom asset collection for this world</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="collectionName">Collection Name</Label>
                        <Input
                          id="collectionName"
                          value={newCollectionName}
                          onChange={(e) => setNewCollectionName(e.target.value)}
                          placeholder="My Custom Textures"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="collectionType">Type</Label>
                        <Select value={newCollectionType} onValueChange={setNewCollectionType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="texture_pack">Texture Pack</SelectItem>
                            <SelectItem value="character_set">Character Set</SelectItem>
                            <SelectItem value="building_set">Building Set</SelectItem>
                            <SelectItem value="prop_set">Prop Set</SelectItem>
                            <SelectItem value="complete_theme">Complete Theme</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="collectionDesc">Description (optional)</Label>
                      <Textarea
                        id="collectionDesc"
                        value={newCollectionDescription}
                        onChange={(e) => setNewCollectionDescription(e.target.value)}
                        placeholder="A collection of custom textures for my world..."
                        rows={2}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowCreateCollection(false);
                          setNewCollectionName('');
                          setNewCollectionDescription('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        disabled={!newCollectionName.trim() || isCreatingCollection}
                        onClick={async () => {
                          if (!token || !world) return;
                          setIsCreatingCollection(true);
                          try {
                            const response = await fetch('/api/asset-collections', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({
                                name: newCollectionName.trim(),
                                description: newCollectionDescription.trim() || null,
                                collectionType: newCollectionType,
                                worldId: world.id,
                                isPublic: false,
                                isBase: false,
                              }),
                            });
                            if (!response.ok) {
                              const err = await response.json().catch(() => ({}));
                              throw new Error(err.error || 'Failed to create collection');
                            }
                            toast({
                              title: 'Collection created',
                              description: `${newCollectionName} has been created.`,
                            });
                            queryClient.invalidateQueries({ queryKey: ['/api/worlds', world.id, 'asset-collections'] });
                            setShowCreateCollection(false);
                            setNewCollectionName('');
                            setNewCollectionDescription('');
                          } catch (error) {
                            toast({
                              title: 'Creation failed',
                              description: error instanceof Error ? error.message : 'Failed to create collection',
                              variant: 'destructive',
                            });
                          } finally {
                            setIsCreatingCollection(false);
                          }
                        }}
                      >
                        {isCreatingCollection ? 'Creating...' : 'Create Collection'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {isLoadingCollections ? (
                <p className="text-sm text-muted-foreground">Loading collections...</p>
              ) : worldCollections.length === 0 && !showCreateCollection ? (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center space-y-3">
                    <Package className="w-10 h-10 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No asset collections defined for this world yet.</p>
                    <Button variant="outline" size="sm" onClick={() => setShowCreateCollection(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Collection
                    </Button>
                  </CardContent>
                </Card>
              ) : worldCollections.length > 0 ? (
                <div className="space-y-3">
                  {worldCollections.map((collection) => {
                    const assetCount = collection.assetIds?.length ?? 0;
                    const typeLabel = collection.collectionType
                      .split('_')
                      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                      .join(' ');
                    return (
                      <Card key={collection.id}>
                        <CardContent className="py-3 px-4 flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{collection.name}</p>
                              <Badge variant="outline" className="text-xs">
                                {typeLabel}
                              </Badge>
                              {collection.isPublic && (
                                <Badge variant="secondary" className="text-xs">Global</Badge>
                              )}
                            </div>
                            {collection.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">{collection.description}</p>
                            )}
                            {collection.purpose && (
                              <p className="text-xs text-muted-foreground">Purpose: {collection.purpose}</p>
                            )}
                            {collection.tags && collection.tags.length > 0 && (
                              <p className="text-xs text-muted-foreground">
                                Tags: {collection.tags.join(', ')}
                              </p>
                            )}
                          </div>
                          <div className="text-right text-xs text-muted-foreground space-y-1">
                            <p>{assetCount} asset{assetCount === 1 ? '' : 's'}</p>
                            <p>{collection.isActive ? 'Active' : 'Inactive'}</p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : null}
            </TabsContent>

            <TabsContent value="assets" className="space-y-6 mt-4">
              {/* Overview Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Assets Overview</h3>
                    <p className="text-sm text-muted-foreground">Generate and manage visual assets for your world</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setShowBatchGeneration(true)}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Batch Generation
                    </Button>
                  </div>
                </div>

                {/* Quick Generate Buttons */}
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Generate Textures for 3D Game
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setAssetType('texture_ground');
                            setShowAssetGenerator(true);
                          }}
                        >
                          <Sparkles className="w-3 h-3 mr-2" />
                          Ground Texture
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setAssetType('texture_wall');
                            setShowAssetGenerator(true);
                          }}
                        >
                          <Sparkles className="w-3 h-3 mr-2" />
                          Wall Texture
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setAssetType('texture_material');
                            setShowAssetGenerator(true);
                          }}
                        >
                          <Sparkles className="w-3 h-3 mr-2" />
                          Material Texture
                        </Button>
                      </div>
                    </div>

                    <div className="pt-2 text-xs text-muted-foreground">
                      <p>Generated textures will be available in the 3D game for applying to terrain, buildings, and objects.</p>
                    </div>
                  </CardContent>
                </Card>

                {/* World-level 3D Assets (models) */}
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium mb-1">3D Assets (Models)</h4>
                        <p className="text-sm text-muted-foreground">
                          Assign default 3D models for buildings, nature, and characters in this world.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {isLoading3DConfig ? (
                          <span className="text-xs text-muted-foreground">Loading 3D config...</span>
                        ) : (
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              defaultsInSync
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                            }`}
                          >
                            {defaultsInSync ? '3D defaults in sync' : '3D defaults out of sync'}
                          </span>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleResync3DDefaults}
                          disabled={isLoading3DConfig || isSyncing3DDefaults}
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          {isSyncing3DDefaults ? 'Syncing...' : 'Resync Defaults'}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Buildings */}
                      <div className="space-y-3">
                        <h5 className="text-sm font-semibold">Buildings</h5>
                        {['default', 'smallResidence'].map((key) => {
                          const assetId = world3DConfig?.buildingModels?.[key];
                          const asset = assetId ? worldAssets.find(a => a.id === assetId) : undefined;
                          const label = key === 'default' ? 'Default Building' : 'Small Residence';
                          return (
                            <div key={key} className="flex items-center justify-between rounded border px-3 py-2">
                              <div className="mr-2">
                                <p className="text-sm font-medium">{label}</p>
                                <p className="text-xs text-muted-foreground">
                                  {asset ? asset.name : 'No model selected'}
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setModelBrowserContext({ group: 'building', key });
                                  setShowModelBrowser(true);
                                }}
                              >
                                Select Model
                              </Button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Nature */}
                      <div className="space-y-3">
                        <h5 className="text-sm font-semibold">Nature</h5>
                        {['defaultTree'].map((key) => {
                          const assetId = world3DConfig?.natureModels?.[key];
                          const asset = assetId ? worldAssets.find(a => a.id === assetId) : undefined;
                          const label = 'Default Tree';
                          return (
                            <div key={key} className="flex items-center justify-between rounded border px-3 py-2">
                              <div className="mr-2">
                                <p className="text-sm font-medium">{label}</p>
                                <p className="text-xs text-muted-foreground">
                                  {asset ? asset.name : 'No model selected'}
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setModelBrowserContext({ group: 'nature', key });
                                  setShowModelBrowser(true);
                                }}
                              >
                                Select Model
                              </Button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Characters */}
                      <div className="space-y-3">
                        <h5 className="text-sm font-semibold">Characters</h5>
                        {['npcDefault', 'civilian', 'guard', 'merchant', 'questgiver'].map((key) => {
                          const assetId = world3DConfig?.characterModels?.[key];
                          const asset = assetId ? worldAssets.find(a => a.id === assetId) : undefined;
                          let label = '';
                          if (key === 'npcDefault') label = 'Default NPC (fallback)';
                          else if (key === 'civilian') label = 'Civilian NPC';
                          else if (key === 'guard') label = 'Guard NPC';
                          else if (key === 'merchant') label = 'Merchant NPC';
                          else if (key === 'questgiver') label = 'Quest Giver NPC';
                          return (
                            <div key={key} className="flex items-center justify-between rounded border px-3 py-2">
                              <div className="mr-2">
                                <p className="text-sm font-medium">{label}</p>
                                <p className="text-xs text-muted-foreground">
                                  {asset ? asset.name : 'No model selected'}
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setModelBrowserContext({ group: 'character', key });
                                  setShowModelBrowser(true);
                                }}
                              >
                                Select Model
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Existing Assets Preview */}
                {worldAssets.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Recent Assets ({worldAssets.length})</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {worldAssets.slice(0, 8).map(asset => (
                        <div key={asset.id} className="relative aspect-square rounded-md overflow-hidden border">
                          <img
                            src={`/${asset.filePath}`}
                            alt={asset.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1">
                            <p className="text-xs text-white truncate">{asset.assetType.replace('texture_', '')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {worldAssets.length > 8 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        +{worldAssets.length - 8} more. Click "Browse Assets" to see them.
                      </p>
                    )}
                  </div>
                )}

                {worldAssets.length === 0 && (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <ImageIcon className="h-12 w-12 text-muted-foreground mb-3" />
                      <p className="font-medium mb-1">No visual assets yet</p>
                      <p className="text-sm text-muted-foreground mb-4">Generate textures to use in your 3D world</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Libraries Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Libraries
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Open the visual asset browser to explore all assets for this world.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAssetBrowser(true)}
                    disabled={worldAssets.length === 0}
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Browse Assets ({worldAssets.length})
                  </Button>
                </div>
              </div>

              {/* Jobs & History Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Jobs &amp; History
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      View and monitor generation jobs for this world.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowJobQueue(true)}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Job Queue
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="metadata" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    World ID
                  </Label>
                  <p className="text-sm font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded">{world.id}</p>
                </div>

                <div className="space-y-2">
                  <Label>Created At</Label>
                  <p className="text-sm">{world.createdAt ? new Date(world.createdAt).toLocaleString() : 'Unknown'}</p>
                </div>

                <div className="space-y-2">
                  <Label>Last Updated</Label>
                  <p className="text-sm">{world.updatedAt ? new Date(world.updatedAt).toLocaleString() : 'Unknown'}</p>
                </div>
              </div>

              {world.config && Object.keys(world.config).length > 0 && (
                <div className="space-y-2">
                  <Label>Configuration</Label>
                  <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-3 rounded overflow-auto max-h-48">
                    {JSON.stringify(world.config, null, 2)}
                  </pre>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Visual Asset Generator Dialog */}
      {world && (
        <VisualAssetGeneratorDialog
          open={showAssetGenerator}
          onOpenChange={setShowAssetGenerator}
          entityType="world"
          entityId={world.id}
          entityName={world.name}
          assetType={assetType}
          onAssetGenerated={() => {
            queryClient.invalidateQueries({ queryKey: ['/api/worlds', world.id, 'assets'] });
          }}
        />
      )}

      {/* Asset Browser Dialog */}
      {world && (
        <AssetBrowserDialog
          open={showAssetBrowser}
          onOpenChange={setShowAssetBrowser}
          worldId={world.id}
        />
      )}

      {/* 3D Model Asset Browser for world-level 3D config */}
      {world && (
        <AssetBrowserDialog
          open={showModelBrowser}
          onOpenChange={(open) => {
            setShowModelBrowser(open);
            if (!open) {
              setModelBrowserContext(null);
            }
          }}
          worldId={world.id}
          modelsOnly={modelBrowserContext?.group !== 'texture'}
          onAssetSelected={async (asset) => {
            if (!world || !modelBrowserContext) return;

            const group = modelBrowserContext.group;
            let body: any = {};

            if (group === 'building') {
              body.buildingModels = {
                ...(world3DConfig?.buildingModels || {}),
                [modelBrowserContext.key]: asset.id
              };
            } else if (group === 'nature') {
              body.natureModels = {
                ...(world3DConfig?.natureModels || {}),
                [modelBrowserContext.key]: asset.id
              };
            } else if (group === 'character') {
              body.characterModels = {
                ...(world3DConfig?.characterModels || {}),
                [modelBrowserContext.key]: asset.id
               };
             } else if (group === 'texture') {
               body[modelBrowserContext.key] = asset.id;
             } else if (group === 'object') {
               body.objectModels = {
                 ...(world3DConfig?.objectModels || {}),
                 [modelBrowserContext.key]: asset.id
              };
            }

            try {
              const response = await fetch(`/api/worlds/${world.id}/3d-config`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
              });

              if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error || 'Failed to update 3D config');
              }

              const updated = await response.json();
              setWorld3DConfig(updated as World3DConfig);

              toast({
                title: '3D model updated',
                description: `${asset.name} assigned as ${modelBrowserContext.key}`
              });
            } catch (error) {
              toast({
                title: 'Update failed',
                description: error instanceof Error ? error.message : 'Failed to update 3D config',
                variant: 'destructive'
              });
            } finally {
              setShowModelBrowser(false);
              setModelBrowserContext(null);
            }
          }}
        />
      )}

      {/* Batch Generation Dialog */}
      {world && (
        <BatchGenerationDialog
          open={showBatchGeneration}
          onOpenChange={setShowBatchGeneration}
          worldId={world.id}
          worldName={world.name}
        />
      )}

      {/* Job Queue Viewer */}
      {world && (
        <JobQueueViewer
          open={showJobQueue}
          onOpenChange={setShowJobQueue}
          worldId={world.id}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete World?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{world.name}</strong>? This will permanently delete:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All rule files</li>
                <li>All characters</li>
                <li>All actions</li>
                <li>All simulations</li>
                <li>All world data</li>
              </ul>
              <p className="mt-2 text-destructive font-semibold">This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete World
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
