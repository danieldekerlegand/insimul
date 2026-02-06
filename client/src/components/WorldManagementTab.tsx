import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Globe, Users, Map, Trash2, Lock, Edit3, Save, X } from 'lucide-react';
import { WorldSettingsDialog } from './WorldSettingsDialog';
import { useToast } from '@/hooks/use-toast';
import { useWorldPermissions } from '@/hooks/use-world-permissions';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import type { AssetCollection } from '@shared/schema';

interface WorldManagementTabProps {
  worldId: string;
  worldName?: string;
  worldDescription?: string;
  onWorldDeleted?: () => void;
  onWorldUpdated?: () => void;
}

export function WorldManagementTab({ worldId, worldName, worldDescription, onWorldDeleted, onWorldUpdated }: WorldManagementTabProps) {
  const [activeView, setActiveView] = useState<'overview'>('overview');
  const [settlements, setSettlements] = useState<any[]>([]);
  const [totalPopulation, setTotalPopulation] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(worldName || '');
  const [description, setDescription] = useState(worldDescription || '');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');
  const { toast } = useToast();
  const { canEdit, isOwner, loading } = useWorldPermissions(worldId);
  const { token } = useAuth();

  // Fetch available asset collections
  const { data: availableCollections = [] } = useQuery<AssetCollection[]>({
    queryKey: ['/api/asset-collections'],
    queryFn: async () => {
      const response = await fetch('/api/asset-collections');
      if (!response.ok) throw new Error('Failed to fetch collections');
      return response.json();
    },
  });

  // Fetch current world data to get selected collection
  const { data: worldData } = useQuery<any>({
    queryKey: ['/api/worlds', worldId],
    enabled: !!worldId,
  });

  useEffect(() => {
    loadWorldData();
  }, [worldId]);

  useEffect(() => {
    setName(worldName || '');
    setDescription(worldDescription || '');
  }, [worldName, worldDescription]);

  useEffect(() => {
    if (worldData) {
      setSelectedCollectionId(worldData.selectedAssetCollectionId || '');
    }
  }, [worldData]);

  const loadWorldData = async () => {
    try {
      const settlementsRes = await fetch(`/api/worlds/${worldId}/settlements`);
      
      if (settlementsRes.ok) {
        const settlementsData = await settlementsRes.json();
        setSettlements(settlementsData);
        
        // Calculate total population
        const total = settlementsData.reduce((sum: number, s: any) => sum + (s.population || 0), 0);
        setTotalPopulation(total);
      }
    } catch (error) {
      console.error('Failed to load world data:', error);
    }
  };

  const handleDeleteWorld = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/worlds/${worldId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete world');
      }

      toast({
        title: 'World deleted',
        description: `World ${worldName || worldId} and all associated data have been permanently deleted.`,
      });

      // Call the parent callback to handle navigation
      if (onWorldDeleted) {
        onWorldDeleted();
      }
    } catch (error) {
      console.error('Failed to delete world:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete world. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleSave = async () => {
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
      const response = await fetch(`/api/worlds/${worldId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description: description || null,
          selectedAssetCollectionId: selectedCollectionId && selectedCollectionId !== 'none' ? selectedCollectionId : null
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
      if (onWorldUpdated) {
        onWorldUpdated();
      }
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

  const handleCancel = () => {
    setName(worldName || '');
    setDescription(worldDescription || '');
    setSelectedCollectionId(worldData?.selectedAssetCollectionId || '');
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">World Home</h2>
          {worldName && !isEditing && (
            <span className="text-sm text-muted-foreground">• {worldName}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(true)}
                          className="gap-2"
                          disabled={!canEdit || loading}
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </Button>
                      </div>
                    </TooltipTrigger>
                    {!canEdit && (
                      <TooltipContent>
                        <div className="flex items-center gap-2">
                          <Lock className="w-3 h-3" />
                          <span>Only the world owner can edit this world</span>
                        </div>
                      </TooltipContent>
                    )}
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSettingsDialog(true)}
                          className="gap-2"
                          disabled={!canEdit || loading}
                        >
                          <Lock className="w-4 h-4" />
                          Permissions
                        </Button>
                      </div>
                    </TooltipTrigger>
                    {!canEdit && (
                      <TooltipContent>
                        <div className="flex items-center gap-2">
                          <Lock className="w-3 h-3" />
                          <span>Only the world owner can manage permissions</span>
                        </div>
                      </TooltipContent>
                    )}
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setShowDeleteDialog(true)}
                          className="gap-2"
                          disabled={!canEdit || loading}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete World
                        </Button>
                      </div>
                    </TooltipTrigger>
                    {!canEdit && (
                      <TooltipContent>
                        <div className="flex items-center gap-2">
                          <Lock className="w-3 h-3" />
                          <span>Only the world owner can delete this world</span>
                        </div>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
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
      </div>

      <div className="flex-1 overflow-auto p-4">
        {activeView === 'overview' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* World Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>World Information</CardTitle>
                <CardDescription>Basic details about your world</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    <p className="text-sm font-medium">{name || 'Unnamed World'}</p>
                  )}
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
                    <p className="text-sm whitespace-pre-wrap">{description || 'No description provided'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="asset-collection">Asset Collection</Label>
                  {isEditing ? (
                    <Select
                      value={selectedCollectionId}
                      onValueChange={setSelectedCollectionId}
                    >
                      <SelectTrigger id="asset-collection">
                        <SelectValue placeholder="Select an asset collection (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {availableCollections.map((collection) => (
                          <SelectItem key={collection.id} value={collection.id}>
                            {collection.name}
                            {collection.isPublic && ' (Global)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm font-medium">
                      {selectedCollectionId && selectedCollectionId !== 'none'
                        ? availableCollections.find(c => c.id === selectedCollectionId)?.name || 'Unknown collection'
                        : 'No collection selected'}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Asset collections provide themed sets of visual assets for your world
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* World Statistics Card */}
            <Card>
              <CardHeader>
                <CardTitle>World Statistics</CardTitle>
                <CardDescription>Overview of your world's demographics and geography</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Map className="w-4 h-4" />
                      <span className="text-sm">Settlements</span>
                    </div>
                    <p className="text-3xl font-bold">{settlements.length}</p>
                    <p className="text-xs text-muted-foreground">
                      Cities, towns, and villages
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">Total Population</span>
                    </div>
                    <p className="text-3xl font-bold">{totalPopulation.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      Characters across all settlements
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {settlements.length === 0 && (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center space-y-2">
                    <Globe className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
                    <h3 className="font-semibold text-lg">No World Data Yet</h3>
                    <p className="text-muted-foreground">
                      Use the Society tab to create countries, settlements, and characters for your world.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete World?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to delete <strong>{worldName || 'this world'}</strong>?
              </p>
              <p className="text-destructive font-semibold">
                This will permanently delete:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>All rules and grammars</li>
                <li>All simulations and their results</li>
                <li>All characters, countries, states, and settlements</li>
                <li>All actions, truths, and quests</li>
                <li>Everything associated with this world</li>
              </ul>
              <p className="font-semibold">This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWorld}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete World'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* World Settings Dialog */}
      <WorldSettingsDialog
        worldId={worldId}
        open={showSettingsDialog}
        onOpenChange={setShowSettingsDialog}
        onSettingsUpdated={loadWorldData}
      />
    </div>
  );
}
