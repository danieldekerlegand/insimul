import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Globe, Users, Map, Trash2, Lock, Edit3, Save, X,
  Scroll, Zap, Target, FileText, Sparkles,
  BookOpen, Brain,
  Play, Gamepad2, BarChart3,
  Upload, Download, Settings, ArrowRight, ChevronRight, Package,
} from 'lucide-react';
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
  onNavigate?: (tab: string) => void;
}

export function WorldManagementTab({ worldId, worldName, worldDescription, onWorldDeleted, onWorldUpdated, onNavigate }: WorldManagementTabProps) {
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

  // Fetch world entities for quick-link previews
  const { data: characters = [] } = useQuery<any[]>({
    queryKey: ['/api/worlds', worldId, 'characters'],
    queryFn: async () => {
      const res = await fetch(`/api/worlds/${worldId}/characters`);
      return res.ok ? res.json() : [];
    },
    enabled: !!worldId,
  });

  const { data: countries = [] } = useQuery<any[]>({
    queryKey: ['/api/worlds', worldId, 'countries'],
    queryFn: async () => {
      const res = await fetch(`/api/worlds/${worldId}/countries`);
      return res.ok ? res.json() : [];
    },
    enabled: !!worldId,
  });

  const { data: rules = [] } = useQuery<any[]>({
    queryKey: ['/api/worlds', worldId, 'rules'],
    queryFn: async () => {
      const res = await fetch(`/api/worlds/${worldId}/rules`);
      return res.ok ? res.json() : [];
    },
    enabled: !!worldId,
  });

  const { data: actions = [] } = useQuery<any[]>({
    queryKey: ['/api/worlds', worldId, 'actions'],
    queryFn: async () => {
      const res = await fetch(`/api/worlds/${worldId}/actions`);
      return res.ok ? res.json() : [];
    },
    enabled: !!worldId,
  });

  const { data: quests = [] } = useQuery<any[]>({
    queryKey: ['/api/worlds', worldId, 'quests'],
    queryFn: async () => {
      const res = await fetch(`/api/worlds/${worldId}/quests`);
      return res.ok ? res.json() : [];
    },
    enabled: !!worldId,
  });

  const { data: grammars = [] } = useQuery<any[]>({
    queryKey: ['/api/worlds', worldId, 'grammars'],
    queryFn: async () => {
      const res = await fetch(`/api/worlds/${worldId}/grammars`);
      return res.ok ? res.json() : [];
    },
    enabled: !!worldId,
  });

  const { data: languages = [] } = useQuery<any[]>({
    queryKey: ['/api/worlds', worldId, 'languages'],
    queryFn: async () => {
      const res = await fetch(`/api/worlds/${worldId}/languages`);
      return res.ok ? res.json() : [];
    },
    enabled: !!worldId,
  });

  const { data: truths = [] } = useQuery<any[]>({
    queryKey: ['/api/worlds', worldId, 'truth'],
    queryFn: async () => {
      const res = await fetch(`/api/worlds/${worldId}/truth`);
      return res.ok ? res.json() : [];
    },
    enabled: !!worldId,
  });

  const { data: simulations = [] } = useQuery<any[]>({
    queryKey: ['/api/worlds', worldId, 'simulations'],
    queryFn: async () => {
      const res = await fetch(`/api/worlds/${worldId}/simulations`);
      return res.ok ? res.json() : [];
    },
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

  // Build quick-link data for each section
  const societyLinks = [
    ...settlements.slice(0, 2).map((s: any) => ({ label: s.name, type: 'settlement' })),
    ...countries.slice(0, 2).map((c: any) => ({ label: c.name, type: 'country' })),
    ...characters.slice(0, 2).map((c: any) => ({ label: c.firstName + (c.lastName ? ` ${c.lastName}` : ''), type: 'character' })),
  ];
  const societyTotal = settlements.length + countries.length + characters.length;

  const rulesLinks = rules.slice(0, 4).map((r: any) => ({ label: r.name || r.title || 'Untitled', type: 'rule' }));
  const actionsLinks = actions.slice(0, 4).map((a: any) => ({ label: a.name || a.actionType || 'Untitled', type: 'action' }));
  const questsLinks = quests.slice(0, 4).map((q: any) => ({ label: q.name || q.title || 'Untitled', type: 'quest' }));
  const grammarsLinks = grammars.slice(0, 4).map((g: any) => ({ label: g.name || 'Untitled', type: 'grammar' }));
  const languagesLinks = languages.slice(0, 4).map((l: any) => ({ label: l.name || 'Untitled', type: 'language' }));

  const truthLinks = truths.slice(0, 4).map((t: any) => ({ label: t.subject || t.statement?.slice(0, 30) || 'Fact', type: 'truth' }));
  const simulationLinks = simulations.slice(0, 4).map((s: any) => ({ label: s.name || 'Simulation', type: 'simulation' }));

  type QuickLink = { label: string; type: string };

  const contentItems: ({
    id: string; label: string; icon: any; description: string;
    color: string; iconColor: string;
    quickLinks?: QuickLink[]; totalCount?: number;
    emptyHint?: string;
  })[] = [
    { id: 'society', label: 'Society', icon: Users, description: 'Countries, settlements, and characters', color: 'from-blue-500/20 to-cyan-500/20', iconColor: 'text-blue-500', quickLinks: societyLinks, totalCount: societyTotal, emptyHint: 'No countries, settlements, or characters yet' },
    { id: 'rules', label: 'Rules', icon: Scroll, description: 'World rules and logic systems', color: 'from-purple-500/20 to-violet-500/20', iconColor: 'text-purple-500', quickLinks: rulesLinks, totalCount: rules.length, emptyHint: 'No world rules defined yet' },
    { id: 'actions', label: 'Actions', icon: Zap, description: 'Character actions and behaviors', color: 'from-amber-500/20 to-orange-500/20', iconColor: 'text-amber-500', quickLinks: actionsLinks, totalCount: actions.length, emptyHint: 'No actions created yet' },
    { id: 'quests', label: 'Quests', icon: Target, description: 'Quest lines and objectives', color: 'from-red-500/20 to-rose-500/20', iconColor: 'text-red-500', quickLinks: questsLinks, totalCount: quests.length, emptyHint: 'No quests created yet' },
    { id: 'grammars', label: 'Grammars', icon: FileText, description: 'Tracery grammars for narrative', color: 'from-emerald-500/20 to-green-500/20', iconColor: 'text-emerald-500', quickLinks: grammarsLinks, totalCount: grammars.length, emptyHint: 'No grammars defined yet' },
    { id: 'languages', label: 'Languages', icon: Sparkles, description: 'Constructed languages', color: 'from-pink-500/20 to-fuchsia-500/20', iconColor: 'text-pink-500', quickLinks: languagesLinks, totalCount: languages.length, emptyHint: 'No languages created yet' },
  ];

  const truthItems: (typeof contentItems[0])[] = [
    { id: 'truth', label: 'Truth System', icon: BookOpen, description: 'Manage world truths and facts', color: 'from-indigo-500/20 to-blue-500/20', iconColor: 'text-indigo-500', quickLinks: truthLinks, totalCount: truths.length, emptyHint: 'No truths established yet' },
    { id: 'prolog', label: 'Prolog KB', icon: Brain, description: 'Prolog knowledge base queries', color: 'from-teal-500/20 to-cyan-500/20', iconColor: 'text-teal-500' },
  ];

  const playItems: (typeof contentItems[0])[] = [
    { id: 'simulations', label: 'Simulations', icon: Play, description: 'Run and configure simulations', color: 'from-green-500/20 to-emerald-500/20', iconColor: 'text-green-500', quickLinks: simulationLinks, totalCount: simulations.length, emptyHint: 'No simulations run yet' },
    { id: '3d-game', label: 'Explore World', icon: Gamepad2, description: 'Enter the 3D world environment', color: 'from-violet-500/20 to-purple-500/20', iconColor: 'text-violet-500' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Playthrough data and insights', color: 'from-sky-500/20 to-blue-500/20', iconColor: 'text-sky-500' },
    { id: 'export-game', label: 'Export Game', icon: Package, description: 'Download project for Babylon, Unreal, Unity, or Godot', color: 'from-indigo-500/20 to-blue-500/20', iconColor: 'text-indigo-500' },
  ];

  const dataItems = [
    { id: 'import', label: 'Import', icon: Upload, description: 'Import world data from files', color: 'from-slate-500/20 to-gray-500/20', iconColor: 'text-slate-500' },
    { id: 'export', label: 'Export', icon: Download, description: 'Export world data to files', color: 'from-slate-500/20 to-gray-500/20', iconColor: 'text-slate-500' },
  ];

  const SectionCard = ({ item }: { item: typeof contentItems[0] }) => {
    const links = item.quickLinks || [];
    const total = item.totalCount || 0;
    const shown = links.slice(0, 4);
    const remaining = total - shown.length;

    return (
      <button
        onClick={() => onNavigate?.(item.id)}
        className="group text-left w-full p-4 rounded-xl transition-all duration-200 hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-sm active:scale-[0.98]"
      >
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${item.color} shrink-0 transition-transform duration-200 group-hover:scale-110`}>
            <item.icon className={`w-5 h-5 ${item.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">{item.label}</span>
              <div className="flex items-center gap-1.5">
                {total > 0 && (
                  <span className="text-[10px] font-medium text-muted-foreground/60 tabular-nums">{total}</span>
                )}
                <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.description}</p>
            {shown.length > 0 ? (
              <div className="flex flex-wrap gap-1 mt-2">
                {shown.map((link, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-foreground/5 dark:bg-white/10 text-foreground/70 dark:text-white/70 truncate max-w-[120px]"
                    title={link.label}
                  >
                    {link.label}
                  </span>
                ))}
                {remaining > 0 && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-medium text-muted-foreground/50">
                    +{remaining}
                  </span>
                )}
              </div>
            ) : item.emptyHint ? (
              <p className="text-[11px] text-muted-foreground/40 italic mt-2">{item.emptyHint}</p>
            ) : null}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-lg shadow-black/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-primary to-primary/60 rounded-xl">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            {isEditing ? (
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-xl font-bold h-auto py-1 px-2 -ml-2"
                placeholder="World name"
              />
            ) : (
              <h1 className="text-2xl font-bold">{name || 'Unnamed World'}</h1>
            )}
            {isEditing ? (
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your world..."
                rows={2}
                className="mt-1 text-sm -ml-2 px-2"
              />
            ) : (
              <p className="text-sm text-muted-foreground mt-0.5">
                {description || 'No description'}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isEditing ? (
            <>
              <Button size="sm" variant="ghost" onClick={handleCancel} disabled={isSaving} className="rounded-xl">
                <X className="w-4 h-4 mr-1.5" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving || !name.trim()} className="rounded-xl">
                <Save className="w-4 h-4 mr-1.5" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </>
          ) : (
            <TooltipProvider>
              <div className="flex gap-1.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        variant="ghost" size="icon"
                        onClick={() => setIsEditing(true)}
                        disabled={!canEdit || loading}
                        className="rounded-xl hover:bg-white/50 dark:hover:bg-white/10"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{canEdit ? 'Edit world' : 'Only the owner can edit'}</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        variant="ghost" size="icon"
                        onClick={() => setShowSettingsDialog(true)}
                        disabled={!canEdit || loading}
                        className="rounded-xl hover:bg-white/50 dark:hover:bg-white/10"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{canEdit ? 'Permissions' : 'Only the owner can manage permissions'}</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        variant="ghost" size="icon"
                        onClick={() => setShowDeleteDialog(true)}
                        disabled={!canEdit || loading}
                        className="rounded-xl hover:bg-white/50 dark:hover:bg-white/10 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{canEdit ? 'Delete world' : 'Only the owner can delete'}</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* Asset Collection */}
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-lg shadow-black/5 p-5">
        <Label htmlFor="asset-collection" className="text-sm font-medium">Asset Collection</Label>
        {canEdit ? (
          <>
            <Select
              value={selectedCollectionId}
              onValueChange={async (value) => {
                setSelectedCollectionId(value);
                if (!isEditing && token) {
                  try {
                    const res = await fetch(`/api/worlds/${worldId}`, {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        selectedAssetCollectionId: value !== 'none' ? value : null,
                      }),
                    });
                    if (res.ok) {
                      toast({ title: 'Asset collection updated' });
                      onWorldUpdated?.();
                    }
                  } catch {
                    toast({ title: 'Failed to update', variant: 'destructive' });
                  }
                }
              }}
            >
              <SelectTrigger id="asset-collection" className="mt-2">
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
            <p className="text-xs text-muted-foreground mt-1.5">
              Asset collections provide themed sets of visual assets for your world
            </p>
          </>
        ) : (
          <p className="text-sm mt-2">
            {availableCollections.find(c => c.id === selectedCollectionId)?.name || 'None selected'}
          </p>
        )}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-xl p-4 shadow-sm shadow-black/5">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Map className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Settlements</span>
          </div>
          <p className="text-2xl font-bold">{settlements.length}</p>
        </div>
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-xl p-4 shadow-sm shadow-black/5">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Users className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Population</span>
          </div>
          <p className="text-2xl font-bold">{totalPopulation.toLocaleString()}</p>
        </div>
        {selectedCollectionId && selectedCollectionId !== 'none' && (
          <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-xl p-4 shadow-sm shadow-black/5">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Assets</span>
            </div>
            <p className="text-sm font-semibold truncate">
              {availableCollections.find(c => c.id === selectedCollectionId)?.name || 'Custom'}
            </p>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-lg shadow-black/5">
        <div className="px-5 pt-4 pb-2 flex items-center gap-2">
          <h2 className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">Content</h2>
          <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">{contentItems.length}</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 p-2">
          {contentItems.map((item) => (
            <SectionCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* Truth Section */}
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-lg shadow-black/5">
        <div className="px-5 pt-4 pb-2 flex items-center gap-2">
          <h2 className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">Truth</h2>
          <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">{truthItems.length}</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 p-2">
          {truthItems.map((item) => (
            <SectionCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* Play Section */}
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-lg shadow-black/5">
        <div className="px-5 pt-4 pb-2 flex items-center gap-2">
          <h2 className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">Play</h2>
          <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">{playItems.length}</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 p-2">
          {playItems.map((item) => (
            <SectionCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* Data Section */}
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-lg shadow-black/5">
        <div className="px-5 pt-4 pb-2 flex items-center gap-2">
          <h2 className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">Data</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 p-2">
          {dataItems.map((item) => (
            <SectionCard key={item.id} item={item} />
          ))}
        </div>
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
