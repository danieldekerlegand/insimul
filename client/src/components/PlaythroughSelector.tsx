import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Play, Plus, Clock, Activity, Calendar, Loader2, ArrowLeft, Trash2, Edit3, Pause, XCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';

interface Playthrough {
  id: string;
  userId: string;
  worldId: string;
  name?: string;
  description?: string;
  notes?: string;
  status: string;
  currentTimestep?: number;
  playtime?: number;
  actionsCount?: number;
  decisionsCount?: number;
  createdAt: string;
  lastPlayedAt?: string;
  startedAt?: string;
}

interface PlaythroughSelectorProps {
  worldId: string;
  worldName: string;
  onSelectPlaythrough: (playthroughId: string) => void;
  onBack: () => void;
}

export function PlaythroughSelector({
  worldId,
  worldName,
  onSelectPlaythrough,
  onBack,
}: PlaythroughSelectorProps) {
  const [playthroughs, setPlaythroughs] = useState<Playthrough[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newPlaythroughName, setNewPlaythroughName] = useState('');
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [editingPlaythrough, setEditingPlaythrough] = useState<Playthrough | null>(null);
  const [editName, setEditName] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingPlaythrough, setDeletingPlaythrough] = useState<Playthrough | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { token } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadPlaythroughs();
  }, [token, worldId]);

  const loadPlaythroughs = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/worlds/${worldId}/playthroughs`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setPlaythroughs(await response.json());
      }
    } catch (error) {
      console.error('Failed to load playthroughs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartNew = async () => {
    if (!token) return;

    try {
      setCreating(true);
      const response = await fetch(`/api/worlds/${worldId}/playthroughs/start`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newPlaythroughName.trim() || `${worldName} Playthrough`,
        }),
      });

      if (response.ok) {
        const playthrough = await response.json();
        setShowNewDialog(false);
        setNewPlaythroughName('');
        onSelectPlaythrough(playthrough.id);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to create playthrough',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to create playthrough:', error);
      toast({
        title: 'Error',
        description: 'Failed to create playthrough',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleUpdatePlaythrough = async () => {
    if (!token || !editingPlaythrough) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/playthroughs/${editingPlaythrough.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editName.trim() || undefined,
          notes: editNotes.trim() || undefined,
        }),
      });

      if (response.ok) {
        toast({ title: 'Updated', description: 'Playthrough updated successfully' });
        setEditingPlaythrough(null);
        loadPlaythroughs();
      } else {
        toast({ title: 'Error', description: 'Failed to update playthrough', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Failed to update playthrough:', error);
      toast({ title: 'Error', description: 'Failed to update playthrough', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (playthrough: Playthrough, newStatus: string) => {
    if (!token) return;

    try {
      const response = await fetch(`/api/playthroughs/${playthrough.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast({ title: 'Updated', description: `Playthrough ${newStatus}` });
        loadPlaythroughs();
      } else {
        toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleDelete = async (playthrough: Playthrough) => {
    if (!token) return;

    try {
      setDeletingId(playthrough.id);
      const response = await fetch(`/api/playthroughs/${playthrough.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast({ title: 'Deleted', description: 'Playthrough deleted' });
        setPlaythroughs(playthroughs.filter((p) => p.id !== playthrough.id));
      } else {
        toast({ title: 'Error', description: 'Failed to delete playthrough', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Failed to delete playthrough:', error);
    } finally {
      setDeletingId(null);
      setDeletingPlaythrough(null);
    }
  };

  const openEditDialog = (playthrough: Playthrough) => {
    setEditName(playthrough.name || '');
    setEditNotes(playthrough.notes || '');
    setEditingPlaythrough(playthrough);
  };

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const activePlaythroughs = playthroughs.filter((p) => p.status === 'active');
  const pausedPlaythroughs = playthroughs.filter((p) => p.status === 'paused');
  const otherPlaythroughs = playthroughs.filter(
    (p) => p.status !== 'active' && p.status !== 'paused'
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Play {worldName}
            </h2>
            <p className="text-sm text-muted-foreground">
              Select a playthrough to resume or start a new one
            </p>
          </div>
        </div>
        <Button onClick={() => setShowNewDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Playthrough
        </Button>
      </div>

      {/* No playthroughs */}
      {playthroughs.length === 0 && (
        <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-dashed border-white/30 dark:border-white/15 rounded-xl">
          <CardContent className="py-12 text-center">
            <Play className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium mb-2">No playthroughs yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Start a new playthrough to explore {worldName}
            </p>
            <Button onClick={() => setShowNewDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Start Playing
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Active playthroughs */}
      {activePlaythroughs.length > 0 && (
        <PlaythroughSection
          title="Active"
          playthroughs={activePlaythroughs}
          onResume={onSelectPlaythrough}
          onEdit={openEditDialog}
          onUpdateStatus={handleUpdateStatus}
          onDelete={setDeletingPlaythrough}
          deletingId={deletingId}
          formatDuration={formatDuration}
          formatDate={formatDate}
        />
      )}

      {/* Paused playthroughs */}
      {pausedPlaythroughs.length > 0 && (
        <PlaythroughSection
          title="Paused"
          playthroughs={pausedPlaythroughs}
          onResume={(id) => {
            handleUpdateStatus(pausedPlaythroughs.find((p) => p.id === id)!, 'active');
          }}
          resumeLabel="Unpause"
          onEdit={openEditDialog}
          onUpdateStatus={handleUpdateStatus}
          onDelete={setDeletingPlaythrough}
          deletingId={deletingId}
          formatDuration={formatDuration}
          formatDate={formatDate}
        />
      )}

      {/* Completed/Abandoned */}
      {otherPlaythroughs.length > 0 && (
        <PlaythroughSection
          title="Past"
          playthroughs={otherPlaythroughs}
          onEdit={openEditDialog}
          onUpdateStatus={handleUpdateStatus}
          onDelete={setDeletingPlaythrough}
          deletingId={deletingId}
          formatDuration={formatDuration}
          formatDate={formatDate}
        />
      )}

      {/* New Playthrough Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Playthrough</DialogTitle>
            <DialogDescription>
              Start a new adventure in {worldName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="playthrough-name">Name (optional)</Label>
              <Input
                id="playthrough-name"
                value={newPlaythroughName}
                onChange={(e) => setNewPlaythroughName(e.target.value)}
                placeholder={`${worldName} Playthrough`}
                onKeyDown={(e) => e.key === 'Enter' && handleStartNew()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleStartNew} disabled={creating}>
              {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              Start
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Playthrough Dialog */}
      <Dialog open={editingPlaythrough !== null} onOpenChange={(open) => !open && setEditingPlaythrough(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Playthrough</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Add notes about this playthrough..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPlaythrough(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePlaythrough} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={deletingPlaythrough !== null}
        onOpenChange={(open) => !open && setDeletingPlaythrough(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Playthrough?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deletingPlaythrough?.name || 'Unnamed Playthrough'}" and all its progress. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingPlaythrough && handleDelete(deletingPlaythrough)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* Reusable section for a group of playthroughs */
function PlaythroughSection({
  title,
  playthroughs,
  onResume,
  resumeLabel = 'Resume',
  onEdit,
  onUpdateStatus,
  onDelete,
  deletingId,
  formatDuration,
  formatDate,
}: {
  title: string;
  playthroughs: Playthrough[];
  onResume?: (id: string) => void;
  resumeLabel?: string;
  onEdit: (p: Playthrough) => void;
  onUpdateStatus: (p: Playthrough, status: string) => void;
  onDelete: (p: Playthrough) => void;
  deletingId: string | null;
  formatDuration: (s: number | undefined) => string;
  formatDate: (s: string | undefined) => string;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        {title} ({playthroughs.length})
      </h3>
      {playthroughs.map((p) => (
        <Card
          key={p.id}
          className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 rounded-xl"
        >
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-lg truncate">
                    {p.name || 'Unnamed Playthrough'}
                  </h4>
                  <Badge variant={p.status === 'active' ? 'default' : 'secondary'}>
                    {p.status}
                  </Badge>
                </div>
                {p.notes && (
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{p.notes}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5" />
                    {p.actionsCount || 0} actions
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDuration(p.playtime)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Started {formatDate(p.createdAt)}
                  </span>
                  {p.lastPlayedAt && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Last played {formatDate(p.lastPlayedAt)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {onResume && (
                  <Button size="sm" onClick={() => onResume(p.id)}>
                    <Play className="w-4 h-4 mr-1" />
                    {resumeLabel}
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(p)}>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    {p.status === 'active' && (
                      <DropdownMenuItem onClick={() => onUpdateStatus(p, 'paused')}>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </DropdownMenuItem>
                    )}
                    {p.status === 'paused' && (
                      <DropdownMenuItem onClick={() => onUpdateStatus(p, 'active')}>
                        <Play className="w-4 h-4 mr-2" />
                        Resume
                      </DropdownMenuItem>
                    )}
                    {(p.status === 'active' || p.status === 'paused') && (
                      <DropdownMenuItem onClick={() => onUpdateStatus(p, 'abandoned')}>
                        <XCircle className="w-4 h-4 mr-2" />
                        Abandon
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="text-destructive"
                      disabled={deletingId === p.id}
                      onClick={() => onDelete(p)}
                    >
                      {deletingId === p.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
