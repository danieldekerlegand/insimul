import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Users, Save, X,
  Scroll, Zap, Target, FileText, Sparkles,
  BookOpen, Brain,
  Play, Gamepad2, BarChart3,
  Upload, Download, ChevronRight, Package,
} from 'lucide-react';
import { WorldSettingsDialog } from './WorldSettingsDialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';

interface WorldManagementTabProps {
  worldId: string;
  worldName?: string;
  worldDescription?: string;
  onWorldDeleted?: () => void;
  onWorldUpdated?: () => void;
  onNavigate?: (tab: string) => void;
  showSettingsDialog?: boolean;
  onSettingsDialogChange?: (open: boolean) => void;
  showDeleteDialog?: boolean;
  onDeleteDialogChange?: (open: boolean) => void;
  showEditDialog?: boolean;
  onEditDialogChange?: (open: boolean) => void;
}

export function WorldManagementTab({ worldId, worldName, worldDescription, onWorldDeleted, onWorldUpdated, onNavigate, showSettingsDialog = false, onSettingsDialogChange, showDeleteDialog: showDeleteDialogProp = false, onDeleteDialogChange, showEditDialog = false, onEditDialogChange }: WorldManagementTabProps) {
  const [settlements, setSettlements] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editName, setEditName] = useState(worldName || '');
  const [editDescription, setEditDescription] = useState(worldDescription || '');
  const { toast } = useToast();
  const { token } = useAuth();

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
    loadSettlements();
  }, [worldId]);

  useEffect(() => {
    setEditName(worldName || '');
    setEditDescription(worldDescription || '');
  }, [worldName, worldDescription]);

  const loadSettlements = async () => {
    try {
      const settlementsRes = await fetch(`/api/worlds/${worldId}/settlements`);
      if (settlementsRes.ok) {
        setSettlements(await settlementsRes.json());
      }
    } catch (error) {
      console.error('Failed to load settlements:', error);
    }
  };

  const handleDeleteWorld = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/worlds/${worldId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete world');
      toast({
        title: 'World deleted',
        description: `World ${worldName || worldId} and all associated data have been permanently deleted.`,
      });
      onWorldDeleted?.();
    } catch (error) {
      console.error('Failed to delete world:', error);
      toast({ title: 'Error', description: 'Failed to delete world. Please try again.', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
      onDeleteDialogChange?.(false);
    }
  };

  const handleEditSave = async () => {
    if (!token) {
      toast({ title: 'Authentication required', description: 'Sign in as the world owner to update this world.', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch(`/api/worlds/${worldId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: editName, description: editDescription || null }),
      });
      if (!response.ok) throw new Error('Failed to update world');
      toast({ title: 'World Updated', description: 'World information has been saved successfully' });
      onEditDialogChange?.(false);
      onWorldUpdated?.();
    } catch (error) {
      toast({ title: 'Update Failed', description: error instanceof Error ? error.message : 'Failed to update world', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditCancel = () => {
    setEditName(worldName || '');
    setEditDescription(worldDescription || '');
    onEditDialogChange?.(false);
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
      <AlertDialog open={showDeleteDialogProp} onOpenChange={(open) => onDeleteDialogChange?.(open)}>
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

      {/* Edit World Dialog */}
      <Dialog open={showEditDialog} onOpenChange={(open) => { if (!open) handleEditCancel(); else onEditDialogChange?.(open); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit World</DialogTitle>
            <DialogDescription>Update your world's name and description</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-world-name">Name</Label>
              <Input
                id="edit-world-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="World name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-world-desc">Description</Label>
              <Textarea
                id="edit-world-desc"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Describe your world..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleEditCancel} disabled={isSaving}>
              <X className="w-4 h-4 mr-1.5" />
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={isSaving || !editName.trim()}>
              <Save className="w-4 h-4 mr-1.5" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* World Settings Dialog */}
      <WorldSettingsDialog
        worldId={worldId}
        open={showSettingsDialog}
        onOpenChange={(open) => onSettingsDialogChange?.(open)}
        onSettingsUpdated={onWorldUpdated}
      />
    </div>
  );
}
