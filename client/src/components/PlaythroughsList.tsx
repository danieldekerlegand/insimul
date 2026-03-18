import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Play, Trash2, Clock, Activity, Calendar, Loader2, Edit3, Pause, XCircle } from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Playthrough {
  id: string;
  userId: string;
  worldId: string;
  worldName?: string;
  worldVisibility?: string;
  name?: string;
  notes?: string;
  status: string;
  currentTimestep?: number;
  playtime?: number;
  actionsCount?: number;
  createdAt: string;
  lastPlayedAt?: string;
}

interface PlaythroughsListProps {
  onResumePlaythrough?: (worldId: string, playthroughId: string) => void;
}

export function PlaythroughsList({ onResumePlaythrough }: PlaythroughsListProps) {
  const [playthroughs, setPlaythroughs] = useState<Playthrough[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [playthroughToDelete, setPlaythroughToDelete] = useState<Playthrough | null>(null);
  const [editingPlaythrough, setEditingPlaythrough] = useState<Playthrough | null>(null);
  const [editName, setEditName] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const { token } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadPlaythroughs();
  }, [token]);

  const loadPlaythroughs = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/playthroughs/my', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setPlaythroughs(await response.json());
      } else {
        toast({ title: 'Error', description: 'Failed to load your playthroughs', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Failed to load playthroughs:', error);
      toast({ title: 'Error', description: 'Failed to load your playthroughs', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlaythrough = async (playthrough: Playthrough) => {
    if (!token) return;

    try {
      setDeletingId(playthrough.id);
      const response = await fetch(`/api/playthroughs/${playthrough.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Playthrough deleted successfully' });
        setPlaythroughs(playthroughs.filter((p) => p.id !== playthrough.id));
      } else {
        toast({ title: 'Error', description: 'Failed to delete playthrough', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Failed to delete playthrough:', error);
      toast({ title: 'Error', description: 'Failed to delete playthrough', variant: 'destructive' });
    } finally {
      setDeletingId(null);
      setPlaythroughToDelete(null);
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
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!token) {
    return (
      <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle>My Playthroughs</CardTitle>
          <CardDescription>Please log in to view your playthroughs</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const activePlaythroughs = playthroughs.filter((p) => p.status === 'active');
  const pausedPlaythroughs = playthroughs.filter((p) => p.status === 'paused');
  const completedPlaythroughs = playthroughs.filter((p) => p.status === 'completed');
  const abandonedPlaythroughs = playthroughs.filter((p) => p.status === 'abandoned');

  return (
    <div className="space-y-6 p-6">
      <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center gap-2">
            <Play className="w-6 h-6 text-primary" />
            My Playthroughs ({playthroughs.length})
          </CardTitle>
          <CardDescription className="mt-1">
            Manage your game sessions across all worlds
            {playthroughs.length > 0 && (
              <span className="ml-2 text-xs">
                {activePlaythroughs.length} active
                {pausedPlaythroughs.length > 0 && ` · ${pausedPlaythroughs.length} paused`}
                {completedPlaythroughs.length > 0 && ` · ${completedPlaythroughs.length} completed`}
              </span>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {playthroughs.length === 0 ? (
        <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-dashed border-white/30 dark:border-white/15 rounded-xl">
          <CardContent className="py-8 text-center text-muted-foreground">
            <p>You haven't started any playthroughs yet.</p>
            <p className="mt-2 text-sm">Browse worlds to start playing!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {playthroughs.map((playthrough) => (
            <Card key={playthrough.id} className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 rounded-xl">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg truncate">
                        {playthrough.name || 'Unnamed Playthrough'}
                      </h3>
                      <Badge variant={playthrough.status === 'active' ? 'default' : 'secondary'}>
                        {playthrough.status}
                      </Badge>
                      {playthrough.worldVisibility && (
                        <Badge variant="outline">{playthrough.worldVisibility}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      World: <span className="font-medium">{playthrough.worldName}</span>
                    </p>
                    {playthrough.notes && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{playthrough.notes}</p>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Actions:</span>
                        <span className="font-medium">{playthrough.actionsCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Playtime:</span>
                        <span className="font-medium">{formatDuration(playthrough.playtime)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Started:</span>
                        <span className="font-medium">{formatDate(playthrough.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Last Played:</span>
                        <span className="font-medium">{formatDate(playthrough.lastPlayedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {playthrough.status === 'active' && onResumePlaythrough && (
                      <Button
                        size="sm"
                        onClick={() => onResumePlaythrough(playthrough.worldId, playthrough.id)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Resume
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(playthrough)}>
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {playthrough.status === 'active' && (
                          <DropdownMenuItem onClick={() => handleUpdateStatus(playthrough, 'paused')}>
                            <Pause className="w-4 h-4 mr-2" />
                            Pause
                          </DropdownMenuItem>
                        )}
                        {playthrough.status === 'paused' && (
                          <DropdownMenuItem onClick={() => handleUpdateStatus(playthrough, 'active')}>
                            <Play className="w-4 h-4 mr-2" />
                            Resume
                          </DropdownMenuItem>
                        )}
                        {(playthrough.status === 'active' || playthrough.status === 'paused') && (
                          <DropdownMenuItem onClick={() => handleUpdateStatus(playthrough, 'abandoned')}>
                            <XCircle className="w-4 h-4 mr-2" />
                            Abandon
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive"
                          disabled={deletingId === playthrough.id}
                          onClick={() => setPlaythroughToDelete(playthrough)}
                        >
                          {deletingId === playthrough.id ? (
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
      )}

      {/* Edit Dialog */}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={playthroughToDelete !== null}
        onOpenChange={(open) => !open && setPlaythroughToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Playthrough?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this playthrough? All progress and play traces will be
              permanently deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => playthroughToDelete && handleDeletePlaythrough(playthroughToDelete)}
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
