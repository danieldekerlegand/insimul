import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, Clock, Calendar, User, History, Compass, Sparkles, Filter, ShieldCheck, Tag, CheckSquare, LayoutList, GitBranchPlus, Network } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from '@/lib/queryClient';
import { TimelineDial } from './TimelineDial';
import { HorizontalTimeline } from './history/HorizontalTimeline';
import { CausalChainOverlay } from './history/CausalChainOverlay';
import { TruthGraph } from './history/TruthGraph';

interface Truth {
  id: string;
  worldId: string;
  characterId: string | null;
  title: string;
  content: string;
  entryType: string;
  historicalEra: string | null;
  timestep: number;
  timestepDuration: number | null;
  timeYear: number | null;
  timeSeason: string | null;
  timeDescription: string | null;
  causesTruthIds: string[] | null;
  causedByTruthIds: string[] | null;
  relatedCharacterIds: string[] | null;
  relatedLocationIds: string[] | null;
  tags: string[] | null;
  importance: number | null;
  isPublic: boolean | null;
  historicalSignificance: string | null;
  source: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Character {
  id: string;
  firstName: string;
  lastName: string;
}

interface TruthTabProps {
  worldId: string;
  characters: Character[];
}

interface ConsistencyIssue {
  truthId: string;
  truthTitle: string;
  field: 'causesTruthIds' | 'causedByTruthIds';
  missingId: string;
}

const ENTRY_TYPES = [
  { value: 'event', label: 'Event' },
  { value: 'backstory', label: 'Backstory' },
  { value: 'relationship', label: 'Relationship' },
  { value: 'achievement', label: 'Achievement' },
  { value: 'milestone', label: 'Milestone' },
  { value: 'prophecy', label: 'Prophecy' },
  { value: 'plan', label: 'Plan' },
];

const ERA_OPTIONS = [
  { value: 'founding', label: 'Founding' },
  { value: 'pre_industrial', label: 'Pre-Industrial' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'civil_war', label: 'Civil War' },
  { value: 'reconstruction', label: 'Reconstruction' },
  { value: 'gilded_age', label: 'Gilded Age' },
  { value: 'progressive', label: 'Progressive' },
  { value: 'world_wars', label: 'World Wars' },
  { value: 'post_war', label: 'Post-War' },
  { value: 'civil_rights', label: 'Civil Rights' },
  { value: 'modern', label: 'Modern' },
  { value: 'contemporary', label: 'Contemporary' },
];

export function TruthTab({ worldId, characters }: TruthTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Truth | null>(null);
  const [currentTimestep, setCurrentTimestep] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'timeline' | 'graph'>('list');
  const [selectedGraphTruthId, setSelectedGraphTruthId] = useState<string | undefined>();
  const causalContainerRef = useRef<HTMLDivElement>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [entryType, setEntryType] = useState('event');
  const [characterId, setCharacterId] = useState<string>('');
  const [timestep, setTimestep] = useState('0');
  const [timestepDuration, setTimestepDuration] = useState('1');
  const [timeYear, setTimeYear] = useState<string>('');
  const [timeSeason, setTimeSeason] = useState('');
  const [importance, setImportance] = useState('5');

  // Orphan filter state
  const [showOrphansOnly, setShowOrphansOnly] = useState(false);

  // Bulk operations state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkEra, setBulkEra] = useState('');
  const [bulkEntryType, setBulkEntryType] = useState('');
  const [bulkTag, setBulkTag] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Consistency check state
  const [consistencyDialogOpen, setConsistencyDialogOpen] = useState(false);
  const [consistencyIssues, setConsistencyIssues] = useState<ConsistencyIssue[]>([]);

  // Fetch Truths
  const { data: truths = [] } = useQuery<Truth[]>({
    queryKey: ['/api/worlds', worldId, 'truth'],
    enabled: !!worldId,
  });

  // Compute orphan truth IDs
  const orphanTruthIds = useMemo(() => {
    const referencedIds = new Set<string>();
    for (const truth of truths) {
      for (const id of truth.causesTruthIds ?? []) {
        referencedIds.add(id);
      }
      for (const id of truth.causedByTruthIds ?? []) {
        referencedIds.add(id);
      }
    }

    const orphans = new Set<string>();
    for (const truth of truths) {
      const isReferencedByCausal = referencedIds.has(truth.id);
      const hasCausalLinks = (truth.causesTruthIds ?? []).length > 0 || (truth.causedByTruthIds ?? []).length > 0;
      const hasCharacterLinks = (truth.relatedCharacterIds ?? []).length > 0;
      const hasLocationLinks = (truth.relatedLocationIds ?? []).length > 0;

      if (!isReferencedByCausal && !hasCausalLinks && !hasCharacterLinks && !hasLocationLinks) {
        orphans.add(truth.id);
      }
    }
    return orphans;
  }, [truths]);

  // Calculate timestep range
  const { minTimestep, maxTimestep } = useMemo(() => {
    if (truths.length === 0) return { minTimestep: -50, maxTimestep: 50 };

    const timesteps = truths.map(e => e.timestep);
    const min = Math.min(...timesteps, -50);
    const max = Math.max(...timesteps, 50);

    return { minTimestep: min, maxTimestep: max };
  }, [truths]);

  // Filter truths (orphan filter applied before temporal split)
  const filteredTruths = useMemo(() => {
    if (!showOrphansOnly) return truths;
    return truths.filter(t => orphanTruthIds.has(t.id));
  }, [truths, showOrphansOnly, orphanTruthIds]);

  // Categorize entries by temporal relation to current timestep
  const { pastEntries, presentEntries, futureEntries } = useMemo(() => {
    const past: Truth[] = [];
    const present: Truth[] = [];
    const future: Truth[] = [];

    filteredTruths.forEach(entry => {
      const entryEndTimestep = entry.timestep + (entry.timestepDuration || 1) - 1;

      if (entryEndTimestep < currentTimestep) {
        past.push(entry);
      } else if (entry.timestep > currentTimestep) {
        future.push(entry);
      } else {
        present.push(entry);
      }
    });

    return {
      pastEntries: past.sort((a, b) => b.timestep - a.timestep),
      presentEntries: present.sort((a, b) => b.timestep - a.timestep),
      futureEntries: future.sort((a, b) => a.timestep - b.timestep),
    };
  }, [filteredTruths, currentTimestep]);

  // Create truth entry mutation
  const createEntryMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await apiRequest('POST', `/api/worlds/${worldId}/truth`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/worlds', worldId, 'truth'] });
      toast({ title: "Truth entry created successfully" });
      resetForm();
      setDialogOpen(false);
    },
  });

  // Update truth entry mutation
  const updateEntryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const response = await apiRequest('PUT', `/api/truth/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/worlds', worldId, 'truth'] });
      toast({ title: "Truth entry updated successfully" });
      resetForm();
      setDialogOpen(false);
    },
  });

  // Delete truth entry mutation
  const deleteEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/truth/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/worlds', worldId, 'truth'] });
      toast({ title: "Truth entry deleted" });
    },
  });

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, data }: { ids: string[]; data: Record<string, unknown> }) => {
      const promises = ids.map(id =>
        apiRequest('PUT', `/api/truth/${id}`, data).then(res => res.json())
      );
      return Promise.all(promises);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/worlds', worldId, 'truth'] });
      toast({ title: `Updated ${variables.ids.length} truth entries` });
      setSelectedIds(new Set());
    },
    onError: () => {
      toast({ title: "Failed to update some entries", variant: "destructive" });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const promises = ids.map(id => apiRequest('DELETE', `/api/truth/${id}`));
      return Promise.all(promises);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/worlds', worldId, 'truth'] });
      toast({ title: `Deleted ${variables.length} truth entries` });
      setSelectedIds(new Set());
      setDeleteConfirmOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to delete some entries", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setTitle('');
    setContent('');
    setEntryType('event');
    setCharacterId('');
    setTimestep('0');
    setTimestepDuration('1');
    setTimeYear('');
    setTimeSeason('');
    setImportance('5');
    setEditingEntry(null);
  };

  const handleSubmit = () => {
    const data = {
      title,
      content,
      entryType,
      characterId: characterId || null,
      timestep: parseInt(timestep),
      timestepDuration: parseInt(timestepDuration),
      timeYear: timeYear ? parseInt(timeYear) : null,
      timeSeason: timeSeason || null,
      importance: parseInt(importance),
    };

    if (editingEntry) {
      updateEntryMutation.mutate({ id: editingEntry.id, data });
    } else {
      createEntryMutation.mutate(data);
    }
  };

  const handleEdit = (entry: Truth) => {
    setEditingEntry(entry);
    setTitle(entry.title);
    setContent(entry.content);
    setEntryType(entry.entryType);
    setCharacterId(entry.characterId || '');
    setTimestep(entry.timestep.toString());
    setTimestepDuration(entry.timestepDuration?.toString() || '1');
    setTimeYear(entry.timeYear?.toString() || '');
    setTimeSeason(entry.timeSeason || '');
    setImportance(entry.importance?.toString() || '5');
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this truth entry?')) {
      deleteEntryMutation.mutate(id);
    }
  };

  const getCharacterName = (charId: string | null) => {
    if (!charId) return 'World Event';
    const char = characters.find(c => c.id === charId);
    return char ? `${char.firstName} ${char.lastName}` : 'Unknown Character';
  };

  // Bulk operations handlers
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback((entries: Truth[]) => {
    setSelectedIds(prev => {
      const entryIds = entries.map(e => e.id);
      const allSelected = entryIds.every(id => prev.has(id));
      const next = new Set(prev);
      if (allSelected) {
        for (const id of entryIds) {
          next.delete(id);
        }
      } else {
        for (const id of entryIds) {
          next.add(id);
        }
      }
      return next;
    });
  }, []);

  const handleBulkSetEra = () => {
    if (!bulkEra || selectedIds.size === 0) return;
    bulkUpdateMutation.mutate({
      ids: Array.from(selectedIds),
      data: { historicalEra: bulkEra },
    });
    setBulkEra('');
  };

  const handleBulkSetEntryType = () => {
    if (!bulkEntryType || selectedIds.size === 0) return;
    bulkUpdateMutation.mutate({
      ids: Array.from(selectedIds),
      data: { entryType: bulkEntryType },
    });
    setBulkEntryType('');
  };

  const handleBulkAddTag = () => {
    if (!bulkTag.trim() || selectedIds.size === 0) return;
    const tag = bulkTag.trim();
    const selectedTruths = truths.filter(t => selectedIds.has(t.id));
    const promises = selectedTruths.map(truth => {
      const existingTags = truth.tags ?? [];
      if (existingTags.includes(tag)) return Promise.resolve(truth);
      return apiRequest('PUT', `/api/truth/${truth.id}`, {
        tags: [...existingTags, tag],
      }).then(res => res.json());
    });
    Promise.all(promises).then(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/worlds', worldId, 'truth'] });
      toast({ title: `Added tag "${tag}" to ${selectedTruths.length} entries` });
      setSelectedIds(new Set());
      setBulkTag('');
    }).catch(() => {
      toast({ title: "Failed to add tag to some entries", variant: "destructive" });
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setDeleteConfirmOpen(true);
  };

  const confirmBulkDelete = () => {
    bulkDeleteMutation.mutate(Array.from(selectedIds));
  };

  // Consistency check
  const runConsistencyCheck = useCallback(() => {
    const truthIdSet = new Set(truths.map(t => t.id));
    const issues: ConsistencyIssue[] = [];

    for (const truth of truths) {
      for (const refId of truth.causesTruthIds ?? []) {
        if (!truthIdSet.has(refId)) {
          issues.push({
            truthId: truth.id,
            truthTitle: truth.title,
            field: 'causesTruthIds',
            missingId: refId,
          });
        }
      }
      for (const refId of truth.causedByTruthIds ?? []) {
        if (!truthIdSet.has(refId)) {
          issues.push({
            truthId: truth.id,
            truthTitle: truth.title,
            field: 'causedByTruthIds',
            missingId: refId,
          });
        }
      }
    }

    setConsistencyIssues(issues);
    setConsistencyDialogOpen(true);
  }, [truths]);

  const renderEntryCard = (entry: Truth) => (
    <Card key={entry.id} data-truth-id={entry.id} className="p-4 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 flex-1">
          <Checkbox
            checked={selectedIds.has(entry.id)}
            onCheckedChange={() => toggleSelection(entry.id)}
            aria-label={`Select ${entry.title}`}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold">{entry.title}</h3>
              <Badge variant="outline">{entry.entryType}</Badge>
              {entry.historicalEra && (
                <Badge variant="outline" className="text-xs capitalize">
                  {entry.historicalEra.replace(/_/g, ' ')}
                </Badge>
              )}
              {entry.characterId && (
                <Badge variant="secondary" className="text-xs">
                  <User className="w-3 h-3 mr-1" />
                  {getCharacterName(entry.characterId)}
                </Badge>
              )}
              {(entry.source === 'imported_ensemble' || entry.source === 'imported_ensemble_history') && (
                <Badge variant="secondary" className="text-xs">Imported</Badge>
              )}
              {orphanTruthIds.has(entry.id) && (
                <Badge variant="destructive" className="text-xs">Orphan</Badge>
              )}
            </div>

            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span className="font-mono">t={entry.timestep}</span>
                {entry.timestepDuration && entry.timestepDuration > 1 && (
                  <span className="text-xs">({entry.timestepDuration} steps)</span>
                )}
              </div>
              {(entry.timeYear || entry.timeSeason) && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {entry.timeYear && <span>Year {entry.timeYear}</span>}
                  {entry.timeSeason && <span className="capitalize">{entry.timeSeason}</span>}
                </div>
              )}
            </div>

            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {entry.content}
            </p>

            {entry.tags && entry.tags.length > 0 && (
              <div className="flex gap-1 mt-2">
                {entry.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(entry)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(entry.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );

  const renderEntryList = (entries: Truth[], emptyIcon: React.ReactNode, emptyMessage: string) => (
    <ScrollArea className="h-[500px]">
      {entries.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <div className="w-12 h-12 mx-auto mb-4 opacity-50">{emptyIcon}</div>
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Checkbox
              checked={entries.length > 0 && entries.every(e => selectedIds.has(e.id))}
              onCheckedChange={() => toggleSelectAll(entries)}
              aria-label="Select all in this tab"
            />
            <span className="text-xs text-muted-foreground">Select all ({entries.length})</span>
          </div>
          {entries.map(renderEntryCard)}
        </div>
      )}
    </ScrollArea>
  );

  const selectedCount = selectedIds.size;

  return (
    <div className="space-y-4 p-6">
      <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center gap-2">
                <Compass className="w-6 h-6 text-primary" />
                World Truth ({truths.length})
              </CardTitle>
              <CardDescription className="mt-1">
                Past, present, and future truths about the world and its characters
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {/* View mode toggle: List | Timeline | Graph */}
              <div className="flex rounded-md border border-border overflow-hidden">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-none border-0"
                  onClick={() => setViewMode('list')}
                  title="List view"
                >
                  <LayoutList className="w-4 h-4 mr-1" />
                  List
                </Button>
                <Button
                  variant={viewMode === 'timeline' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-none border-0 border-l border-border"
                  onClick={() => setViewMode('timeline')}
                  title="Timeline view"
                >
                  <GitBranchPlus className="w-4 h-4 mr-1" />
                  Timeline
                </Button>
                <Button
                  variant={viewMode === 'graph' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-none border-0 border-l border-border"
                  onClick={() => setViewMode('graph')}
                  title="Causal graph view"
                >
                  <Network className="w-4 h-4 mr-1" />
                  Graph
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={runConsistencyCheck}
                title="Check that all causal references point to existing truths"
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                Consistency Check
              </Button>
              <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button size="sm" disabled>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Truth
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingEntry ? 'Edit' : 'Create'} Truth Entry</DialogTitle>
                    <DialogDescription>
                      {editingEntry ? 'Update' : 'Add'} a truth about the past, present, or future
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="The Battle of Ravenshollow"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="entryType">Entry Type</Label>
                        <Select value={entryType} onValueChange={setEntryType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ENTRY_TYPES.map(et => (
                              <SelectItem key={et.value} value={et.value}>{et.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="character">Character (Optional)</Label>
                        <Select value={characterId} onValueChange={setCharacterId}>
                          <SelectTrigger>
                            <SelectValue placeholder="World event" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">World Event</SelectItem>
                            {characters.map(char => (
                              <SelectItem key={char.id} value={char.id}>
                                {char.firstName} {char.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="timestep">Timestep</Label>
                        <Input
                          id="timestep"
                          type="number"
                          value={timestep}
                          onChange={(e) => setTimestep(e.target.value)}
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <Label htmlFor="timestepDuration">Duration (steps)</Label>
                        <Input
                          id="timestepDuration"
                          type="number"
                          min="1"
                          value={timestepDuration}
                          onChange={(e) => setTimestepDuration(e.target.value)}
                          placeholder="1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="importance">Importance (1-10)</Label>
                        <Input
                          id="importance"
                          type="number"
                          min="1"
                          max="10"
                          value={importance}
                          onChange={(e) => setImportance(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="timeYear">Year (Optional)</Label>
                        <Input
                          id="timeYear"
                          type="number"
                          value={timeYear}
                          onChange={(e) => setTimeYear(e.target.value)}
                          placeholder="1200"
                        />
                      </div>

                      <div>
                        <Label htmlFor="timeSeason">Season (Optional)</Label>
                        <Select value={timeSeason} onValueChange={setTimeSeason}>
                          <SelectTrigger>
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Any</SelectItem>
                            <SelectItem value="spring">Spring</SelectItem>
                            <SelectItem value="summer">Summer</SelectItem>
                            <SelectItem value="fall">Fall</SelectItem>
                            <SelectItem value="winter">Winter</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Describe the event, prophecy, or truth..."
                        className="min-h-[200px]"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={createEntryMutation.isPending || updateEntryMutation.isPending || !title || !content}
                      >
                        {editingEntry ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters toolbar */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Checkbox
                id="orphan-filter"
                checked={showOrphansOnly}
                onCheckedChange={(checked) => setShowOrphansOnly(checked === true)}
              />
              <Label htmlFor="orphan-filter" className="text-sm font-normal cursor-pointer flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Show Orphan Truths ({orphanTruthIds.size})
              </Label>
            </div>
          </div>

          {/* Bulk operations toolbar */}
          {selectedCount > 0 && (
            <Card className="p-3 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1 text-sm font-medium">
                  <CheckSquare className="w-4 h-4" />
                  {selectedCount} selected
                </div>

                <div className="h-4 w-px bg-border" />

                {/* Set Era */}
                <div className="flex items-center gap-1">
                  <Select value={bulkEra} onValueChange={setBulkEra}>
                    <SelectTrigger className="h-8 w-[140px] text-xs">
                      <SelectValue placeholder="Set Era..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ERA_OPTIONS.map(era => (
                        <SelectItem key={era.value} value={era.value}>{era.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    disabled={!bulkEra || bulkUpdateMutation.isPending}
                    onClick={handleBulkSetEra}
                  >
                    Apply
                  </Button>
                </div>

                <div className="h-4 w-px bg-border" />

                {/* Set Entry Type */}
                <div className="flex items-center gap-1">
                  <Select value={bulkEntryType} onValueChange={setBulkEntryType}>
                    <SelectTrigger className="h-8 w-[140px] text-xs">
                      <SelectValue placeholder="Set Type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ENTRY_TYPES.map(et => (
                        <SelectItem key={et.value} value={et.value}>{et.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    disabled={!bulkEntryType || bulkUpdateMutation.isPending}
                    onClick={handleBulkSetEntryType}
                  >
                    Apply
                  </Button>
                </div>

                <div className="h-4 w-px bg-border" />

                {/* Add Tag */}
                <div className="flex items-center gap-1">
                  <Tag className="w-3 h-3 text-muted-foreground" />
                  <Input
                    value={bulkTag}
                    onChange={(e) => setBulkTag(e.target.value)}
                    placeholder="Add tag..."
                    className="h-8 w-[120px] text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleBulkAddTag();
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    disabled={!bulkTag.trim()}
                    onClick={handleBulkAddTag}
                  >
                    Add
                  </Button>
                </div>

                <div className="h-4 w-px bg-border" />

                {/* Delete Selected */}
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={handleBulkDelete}
                  disabled={bulkDeleteMutation.isPending}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete Selected
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs ml-auto"
                  onClick={() => setSelectedIds(new Set())}
                >
                  Clear Selection
                </Button>
              </div>
            </Card>
          )}

          {viewMode === 'graph' ? (
            /* Causal Graph View */
            <TruthGraph
              truths={filteredTruths}
              selectedTruthId={selectedGraphTruthId}
              onTruthSelect={(id) => {
                setSelectedGraphTruthId(id);
                const truth = truths.find(t => t.id === id);
                if (truth) handleEdit(truth);
              }}
            />
          ) : viewMode === 'timeline' ? (
            /* Horizontal Timeline View */
            <HorizontalTimeline
              truths={filteredTruths.map(t => ({
                id: t.id,
                title: t.title,
                content: t.content,
                entryType: t.entryType,
                historicalSignificance: t.historicalSignificance ?? null,
                timeYear: t.timeYear,
                timeSeason: t.timeSeason,
                importance: t.importance,
                timestep: t.timestep,
              }))}
              historyStartYear={Math.min(
                ...filteredTruths.filter(t => t.timeYear != null).map(t => t.timeYear!),
                minTimestep
              )}
              currentYear={Math.max(
                ...filteredTruths.filter(t => t.timeYear != null).map(t => t.timeYear!),
                maxTimestep
              )}
              onEventClick={(truthId) => {
                const truth = truths.find(t => t.id === truthId);
                if (truth) handleEdit(truth);
              }}
            />
          ) : (
            <>
              {/* Timeline Navigation */}
              <TimelineDial
                currentTimestep={currentTimestep}
                minTimestep={minTimestep}
                maxTimestep={maxTimestep}
                onTimestepChange={setCurrentTimestep}
              />

              {/* Past/Present/Future Tabs with Causal Chain Overlay */}
              <Tabs defaultValue="present" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-xl p-1 h-auto">
                  <TabsTrigger value="past" className="gap-2">
                    <History className="w-4 h-4" />
                    Past ({pastEntries.length})
                  </TabsTrigger>
                  <TabsTrigger value="present" className="gap-2">
                    <Clock className="w-4 h-4" />
                    Present ({presentEntries.length})
                  </TabsTrigger>
                  <TabsTrigger value="future" className="gap-2">
                    <Sparkles className="w-4 h-4" />
                    Future ({futureEntries.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="past" className="mt-4">
                  <div className="relative" ref={causalContainerRef}>
                    <CausalChainOverlay truths={pastEntries} containerRef={causalContainerRef} />
                    {renderEntryList(pastEntries, <History className="w-12 h-12" />, "No past truths recorded")}
                  </div>
                </TabsContent>

                <TabsContent value="present" className="mt-4">
                  <div className="relative" ref={causalContainerRef}>
                    <CausalChainOverlay truths={presentEntries} containerRef={causalContainerRef} />
                    {renderEntryList(presentEntries, <Clock className="w-12 h-12" />, "No current truths at this timestep")}
                  </div>
                </TabsContent>

                <TabsContent value="future" className="mt-4">
                  <div className="relative" ref={causalContainerRef}>
                    <CausalChainOverlay truths={futureEntries} containerRef={causalContainerRef} />
                    {renderEntryList(futureEntries, <Sparkles className="w-12 h-12" />, "No future truths or prophecies")}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </CardContent>
      </Card>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedCount} truth entries?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The selected truth entries will be permanently deleted,
              and any causal references to them from other truths will become broken.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {bulkDeleteMutation.isPending ? 'Deleting...' : `Delete ${selectedCount} Entries`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Consistency Check Results Dialog */}
      <Dialog open={consistencyDialogOpen} onOpenChange={setConsistencyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              Truth Consistency Check
            </DialogTitle>
            <DialogDescription>
              Validates that all causesTruthIds and causedByTruthIds reference truths that exist.
            </DialogDescription>
          </DialogHeader>
          {consistencyIssues.length === 0 ? (
            <div className="text-center py-8">
              <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-medium text-green-700 dark:text-green-400">All references are valid</p>
              <p className="text-sm text-muted-foreground mt-1">
                Checked {truths.length} truths -- no broken causal references found.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-destructive font-medium">
                Found {consistencyIssues.length} broken reference{consistencyIssues.length !== 1 ? 's' : ''} across {truths.length} truths:
              </p>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {consistencyIssues.map((issue, idx) => (
                    <Card key={`${issue.truthId}-${issue.field}-${issue.missingId}-${idx}`} className="p-3 border-destructive/30">
                      <div className="text-sm">
                        <span className="font-medium">{issue.truthTitle}</span>
                        <span className="text-muted-foreground"> references missing truth </span>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">{issue.missingId}</code>
                        <span className="text-muted-foreground"> in </span>
                        <Badge variant="outline" className="text-xs">{issue.field}</Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setConsistencyDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
