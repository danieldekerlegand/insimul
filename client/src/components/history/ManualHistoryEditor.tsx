import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus, Edit, Trash2, Clock, Calendar, User, History, MapPin,
  Tag, CheckSquare, Undo2, X, Link2, Search,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from '@/lib/queryClient';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Truth {
  id: string;
  worldId: string;
  characterId: string | null;
  title: string;
  content: string;
  entryType: string;
  historicalEra: string | null;
  historicalSignificance: string | null;
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
  source: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Character {
  id: string;
  firstName: string;
  lastName: string;
}

interface Settlement {
  id: string;
  name: string;
}

interface ManualHistoryEditorProps {
  worldId: string;
  characters: Character[];
}

// ---------------------------------------------------------------------------
// Undo stack
// ---------------------------------------------------------------------------

type UndoOpType = 'create' | 'update' | 'delete' | 'bulk-update' | 'bulk-delete';

interface UndoOperation {
  type: UndoOpType;
  /** Snapshot(s) of the truth(s) before the operation */
  data: Truth | Truth[];
  /** ID(s) affected */
  ids: string[];
}

const MAX_UNDO = 10;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ENTRY_TYPES = [
  { value: 'event', label: 'Event' },
  { value: 'backstory', label: 'Backstory' },
  { value: 'relationship', label: 'Relationship' },
  { value: 'achievement', label: 'Achievement' },
  { value: 'milestone', label: 'Milestone' },
  { value: 'prophecy', label: 'Prophecy' },
  { value: 'plan', label: 'Plan' },
  { value: 'history', label: 'History' },
];

const ERA_OPTIONS = [
  { value: 'founding', label: 'Founding' },
  { value: 'civil_war', label: 'Civil War' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'modern', label: 'Modern' },
];

const SIGNIFICANCE_OPTIONS = [
  { value: 'world', label: 'World' },
  { value: 'country', label: 'Country' },
  { value: 'state', label: 'State' },
  { value: 'settlement', label: 'Settlement' },
  { value: 'family', label: 'Family' },
  { value: 'personal', label: 'Personal' },
];

const SEASON_OPTIONS = [
  { value: 'spring', label: 'Spring' },
  { value: 'summer', label: 'Summer' },
  { value: 'fall', label: 'Fall' },
  { value: 'winter', label: 'Winter' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function emptyFormState() {
  return {
    title: '',
    content: '',
    entryType: 'event',
    historicalEra: '',
    historicalSignificance: '',
    timeYear: '',
    timeSeason: '',
    importance: 5,
    relatedCharacterIds: [] as string[],
    relatedLocationIds: [] as string[],
    tags: [] as string[],
    causesTruthIds: [] as string[],
    causedByTruthIds: [] as string[],
    customEra: '',
  };
}

type FormState = ReturnType<typeof emptyFormState>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ManualHistoryEditor({ worldId, characters }: ManualHistoryEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Dialog / editing
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Truth | null>(null);
  const [form, setForm] = useState<FormState>(emptyFormState);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkPanelOpen, setBulkPanelOpen] = useState(false);
  const [bulkEra, setBulkEra] = useState('');
  const [bulkSignificance, setBulkSignificance] = useState('');
  const [bulkTag, setBulkTag] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Tag input helper
  const [tagInput, setTagInput] = useState('');

  // Search / filter
  const [searchQuery, setSearchQuery] = useState('');

  // Undo stack
  const [undoStack, setUndoStack] = useState<UndoOperation[]>([]);

  // -----------------------------------------------------------------------
  // Queries
  // -----------------------------------------------------------------------

  const { data: truths = [] } = useQuery<Truth[]>({
    queryKey: ['/api/worlds', worldId, 'truth'],
    enabled: !!worldId,
  });

  const { data: settlements = [] } = useQuery<Settlement[]>({
    queryKey: ['/api/worlds', worldId, 'settlements'],
    enabled: !!worldId,
  });

  // -----------------------------------------------------------------------
  // Filtered list
  // -----------------------------------------------------------------------

  const filteredTruths = useMemo(() => {
    if (!searchQuery.trim()) return truths;
    const q = searchQuery.trim().toLowerCase();
    return truths.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.content.toLowerCase().includes(q) ||
      (t.tags ?? []).some(tag => tag.toLowerCase().includes(q))
    );
  }, [truths, searchQuery]);

  // Truth map for causal link labels
  const truthMap = useMemo(() => {
    const m = new Map<string, Truth>();
    for (const t of truths) m.set(t.id, t);
    return m;
  }, [truths]);

  // -----------------------------------------------------------------------
  // Undo helpers
  // -----------------------------------------------------------------------

  const pushUndo = useCallback((op: UndoOperation) => {
    setUndoStack(prev => [...prev.slice(-(MAX_UNDO - 1)), op]);
  }, []);

  const invalidateTruths = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['/api/worlds', worldId, 'truth'] });
  }, [queryClient, worldId]);

  // -----------------------------------------------------------------------
  // Mutations
  // -----------------------------------------------------------------------

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiRequest('POST', `/api/worlds/${worldId}/truth`, data);
      return await res.json();
    },
    onSuccess: (created: Truth) => {
      pushUndo({ type: 'create', data: created, ids: [created.id] });
      invalidateTruths();
      toast({ title: "Truth entry created" });
      resetForm();
      setDialogOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const res = await apiRequest('PUT', `/api/truth/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      invalidateTruths();
      toast({ title: "Truth entry updated" });
      resetForm();
      setDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/truth/${id}`);
    },
    onSuccess: () => {
      invalidateTruths();
      toast({ title: "Truth entry deleted" });
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, data }: { ids: string[]; data: Record<string, unknown> }) => {
      const promises = ids.map(id =>
        apiRequest('PUT', `/api/truth/${id}`, data).then(r => r.json())
      );
      return Promise.all(promises);
    },
    onSuccess: (_data, variables) => {
      invalidateTruths();
      toast({ title: `Updated ${variables.ids.length} entries` });
      setSelectedIds(new Set());
      setBulkPanelOpen(false);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const promises = ids.map(id => apiRequest('DELETE', `/api/truth/${id}`));
      return Promise.all(promises);
    },
    onSuccess: (_data, variables) => {
      invalidateTruths();
      toast({ title: `Deleted ${variables.length} entries` });
      setSelectedIds(new Set());
      setDeleteConfirmOpen(false);
    },
  });

  // -----------------------------------------------------------------------
  // Undo execution
  // -----------------------------------------------------------------------

  const handleUndo = useCallback(async () => {
    if (undoStack.length === 0) return;
    const op = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));

    try {
      switch (op.type) {
        case 'create': {
          // Undo a create = delete the created entry
          await apiRequest('DELETE', `/api/truth/${op.ids[0]}`);
          break;
        }
        case 'update': {
          // Undo an update = restore previous state
          const prev = op.data as Truth;
          await apiRequest('PUT', `/api/truth/${prev.id}`, {
            title: prev.title,
            content: prev.content,
            entryType: prev.entryType,
            historicalEra: prev.historicalEra,
            historicalSignificance: prev.historicalSignificance,
            timeYear: prev.timeYear,
            timeSeason: prev.timeSeason,
            importance: prev.importance,
            relatedCharacterIds: prev.relatedCharacterIds,
            relatedLocationIds: prev.relatedLocationIds,
            tags: prev.tags,
            causesTruthIds: prev.causesTruthIds,
            causedByTruthIds: prev.causedByTruthIds,
          });
          break;
        }
        case 'delete': {
          // Undo a delete = re-create
          const prev = op.data as Truth;
          await apiRequest('POST', `/api/worlds/${worldId}/truth`, {
            title: prev.title,
            content: prev.content,
            entryType: prev.entryType,
            historicalEra: prev.historicalEra,
            historicalSignificance: prev.historicalSignificance,
            timeYear: prev.timeYear,
            timeSeason: prev.timeSeason,
            importance: prev.importance,
            relatedCharacterIds: prev.relatedCharacterIds,
            relatedLocationIds: prev.relatedLocationIds,
            tags: prev.tags,
            causesTruthIds: prev.causesTruthIds,
            causedByTruthIds: prev.causedByTruthIds,
            timestep: prev.timestep,
          });
          break;
        }
        case 'bulk-update': {
          // Restore each entry to its previous state
          const prevEntries = op.data as Truth[];
          await Promise.all(prevEntries.map(prev =>
            apiRequest('PUT', `/api/truth/${prev.id}`, {
              historicalEra: prev.historicalEra,
              historicalSignificance: prev.historicalSignificance,
              tags: prev.tags,
            })
          ));
          break;
        }
        case 'bulk-delete': {
          // Re-create all deleted entries
          const prevEntries = op.data as Truth[];
          await Promise.all(prevEntries.map(prev =>
            apiRequest('POST', `/api/worlds/${worldId}/truth`, {
              title: prev.title,
              content: prev.content,
              entryType: prev.entryType,
              historicalEra: prev.historicalEra,
              historicalSignificance: prev.historicalSignificance,
              timeYear: prev.timeYear,
              timeSeason: prev.timeSeason,
              importance: prev.importance,
              relatedCharacterIds: prev.relatedCharacterIds,
              relatedLocationIds: prev.relatedLocationIds,
              tags: prev.tags,
              causesTruthIds: prev.causesTruthIds,
              causedByTruthIds: prev.causedByTruthIds,
              timestep: prev.timestep,
            })
          ));
          break;
        }
      }
      invalidateTruths();
      toast({ title: "Undone" });
    } catch {
      toast({ title: "Undo failed", variant: "destructive" });
    }
  }, [undoStack, invalidateTruths, toast, worldId]);

  // -----------------------------------------------------------------------
  // Form helpers
  // -----------------------------------------------------------------------

  const resetForm = () => {
    setForm(emptyFormState());
    setTagInput('');
    setEditingEntry(null);
  };

  const patchForm = (patch: Partial<FormState>) => {
    setForm(prev => ({ ...prev, ...patch }));
  };

  const handleEdit = (entry: Truth) => {
    setEditingEntry(entry);
    setForm({
      title: entry.title,
      content: entry.content,
      entryType: entry.entryType,
      historicalEra: entry.historicalEra ?? '',
      historicalSignificance: entry.historicalSignificance ?? '',
      timeYear: entry.timeYear?.toString() ?? '',
      timeSeason: entry.timeSeason ?? '',
      importance: entry.importance ?? 5,
      relatedCharacterIds: entry.relatedCharacterIds ?? [],
      relatedLocationIds: entry.relatedLocationIds ?? [],
      tags: entry.tags ?? [],
      causesTruthIds: entry.causesTruthIds ?? [],
      causedByTruthIds: entry.causedByTruthIds ?? [],
      customEra: ERA_OPTIONS.some(e => e.value === entry.historicalEra) ? '' : (entry.historicalEra ?? ''),
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const resolvedEra = form.historicalEra === '__custom__'
      ? (form.customEra.trim() || null)
      : (form.historicalEra || null);

    const data: Record<string, unknown> = {
      title: form.title,
      content: form.content,
      entryType: form.entryType,
      historicalEra: resolvedEra,
      historicalSignificance: form.historicalSignificance || null,
      timeYear: form.timeYear ? parseInt(form.timeYear) : null,
      timeSeason: form.timeSeason || null,
      importance: form.importance,
      relatedCharacterIds: form.relatedCharacterIds.length > 0 ? form.relatedCharacterIds : null,
      relatedLocationIds: form.relatedLocationIds.length > 0 ? form.relatedLocationIds : null,
      tags: form.tags.length > 0 ? form.tags : null,
      causesTruthIds: form.causesTruthIds.length > 0 ? form.causesTruthIds : null,
      causedByTruthIds: form.causedByTruthIds.length > 0 ? form.causedByTruthIds : null,
    };

    if (editingEntry) {
      // Snapshot before update for undo
      pushUndo({ type: 'update', data: editingEntry, ids: [editingEntry.id] });
      updateMutation.mutate({ id: editingEntry.id, data });
    } else {
      // timestep defaults to 0 for manual entries
      (data as Record<string, unknown>).timestep = 0;
      createMutation.mutate(data);
    }
  };

  const handleDelete = (entry: Truth) => {
    pushUndo({ type: 'delete', data: entry, ids: [entry.id] });
    deleteMutation.mutate(entry.id);
  };

  // -----------------------------------------------------------------------
  // Tag helpers
  // -----------------------------------------------------------------------

  const addTag = () => {
    const tag = tagInput.trim();
    if (!tag || form.tags.includes(tag)) return;
    patchForm({ tags: [...form.tags, tag] });
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    patchForm({ tags: form.tags.filter(t => t !== tag) });
  };

  // -----------------------------------------------------------------------
  // Multi-select toggle helpers
  // -----------------------------------------------------------------------

  const toggleArrayItem = (field: 'relatedCharacterIds' | 'relatedLocationIds' | 'causesTruthIds' | 'causedByTruthIds', id: string) => {
    const current = form[field] as string[];
    const next = current.includes(id)
      ? current.filter(i => i !== id)
      : [...current, id];
    patchForm({ [field]: next });
  };

  // -----------------------------------------------------------------------
  // Bulk operations
  // -----------------------------------------------------------------------

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds(prev => {
      const ids = filteredTruths.map(t => t.id);
      const allSelected = ids.every(id => prev.has(id));
      if (allSelected) return new Set<string>();
      return new Set(ids);
    });
  }, [filteredTruths]);

  const handleBulkApply = () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    const data: Record<string, unknown> = {};
    let changed = false;

    // Snapshot selected truths for undo
    const selectedTruths = truths.filter(t => selectedIds.has(t.id));

    if (bulkEra) { data.historicalEra = bulkEra; changed = true; }
    if (bulkSignificance) { data.historicalSignificance = bulkSignificance; changed = true; }

    if (bulkTag.trim()) {
      // Tag must be applied per-entry to merge with existing tags
      const tag = bulkTag.trim();
      pushUndo({ type: 'bulk-update', data: selectedTruths, ids });
      const promises = selectedTruths.map(truth => {
        const existingTags = truth.tags ?? [];
        if (existingTags.includes(tag)) return Promise.resolve(truth);
        return apiRequest('PUT', `/api/truth/${truth.id}`, {
          ...data,
          tags: [...existingTags, tag],
        }).then(r => r.json());
      });
      Promise.all(promises).then(() => {
        invalidateTruths();
        toast({ title: `Applied bulk changes to ${selectedTruths.length} entries` });
        setSelectedIds(new Set());
        setBulkPanelOpen(false);
        setBulkEra('');
        setBulkSignificance('');
        setBulkTag('');
      }).catch(() => {
        toast({ title: "Bulk update failed", variant: "destructive" });
      });
      return;
    }

    if (!changed) return;
    pushUndo({ type: 'bulk-update', data: selectedTruths, ids });
    bulkUpdateMutation.mutate({ ids, data });
    setBulkEra('');
    setBulkSignificance('');
    setBulkTag('');
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    // Snapshot for undo
    const selectedTruths = truths.filter(t => selectedIds.has(t.id));
    pushUndo({ type: 'bulk-delete', data: selectedTruths, ids: Array.from(selectedIds) });
    setDeleteConfirmOpen(true);
  };

  const confirmBulkDelete = () => {
    bulkDeleteMutation.mutate(Array.from(selectedIds));
  };

  // -----------------------------------------------------------------------
  // Helpers for display
  // -----------------------------------------------------------------------

  const getCharName = (id: string) => {
    const c = characters.find(ch => ch.id === id);
    return c ? `${c.firstName} ${c.lastName}` : id.slice(0, 8);
  };

  const getLocationName = (id: string) => {
    const s = settlements.find(loc => loc.id === id);
    return s ? s.name : id.slice(0, 8);
  };

  const selectedCount = selectedIds.size;

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="space-y-4 p-6">
      <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center gap-2">
                <History className="w-6 h-6 text-primary" />
                Manual History Editor ({truths.length})
              </CardTitle>
              <CardDescription className="mt-1">
                Create, edit, and bulk-manage historical truth entries
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {/* Undo button */}
              <Button
                variant="outline"
                size="sm"
                disabled={undoStack.length === 0}
                onClick={handleUndo}
                title={undoStack.length > 0 ? `Undo (${undoStack.length} operations)` : 'Nothing to undo'}
              >
                <Undo2 className="w-4 h-4 mr-2" />
                Undo{undoStack.length > 0 && ` (${undoStack.length})`}
              </Button>

              <Button
                size="sm"
                onClick={() => { resetForm(); setDialogOpen(true); }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={filteredTruths.length > 0 && filteredTruths.every(t => selectedIds.has(t.id))}
                onCheckedChange={() => toggleSelectAll()}
                aria-label="Select all"
              />
              <span className="text-xs text-muted-foreground">Select all ({filteredTruths.length})</span>
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

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setBulkPanelOpen(true)}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Bulk Edit
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={handleBulkDelete}
                  disabled={bulkDeleteMutation.isPending}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Bulk Delete
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

          {/* Bulk edit panel */}
          {bulkPanelOpen && selectedCount > 0 && (
            <Card className="p-4 bg-amber-50/50 dark:bg-amber-900/10 border-amber-200/50 dark:border-amber-500/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Bulk Edit - {selectedCount} entries</h3>
                <Button variant="ghost" size="sm" onClick={() => setBulkPanelOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Set Era</Label>
                  <Select value={bulkEra} onValueChange={setBulkEra}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="No change" />
                    </SelectTrigger>
                    <SelectContent>
                      {ERA_OPTIONS.map(e => (
                        <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Set Significance</Label>
                  <Select value={bulkSignificance} onValueChange={setBulkSignificance}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="No change" />
                    </SelectTrigger>
                    <SelectContent>
                      {SIGNIFICANCE_OPTIONS.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Add Tag</Label>
                  <Input
                    value={bulkTag}
                    onChange={e => setBulkTag(e.target.value)}
                    placeholder="Tag to add..."
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-3 gap-2">
                <Button variant="outline" size="sm" onClick={() => setBulkPanelOpen(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleBulkApply}
                  disabled={bulkUpdateMutation.isPending || (!bulkEra && !bulkSignificance && !bulkTag.trim())}
                >
                  Apply to {selectedCount} entries
                </Button>
              </div>
            </Card>
          )}

          {/* Event list */}
          <ScrollArea className="h-[550px]">
            {filteredTruths.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No truth entries found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTruths.map(entry => (
                  <Card
                    key={entry.id}
                    className="p-4 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Checkbox
                          checked={selectedIds.has(entry.id)}
                          onCheckedChange={() => toggleSelection(entry.id)}
                          aria-label={`Select ${entry.title}`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold truncate">{entry.title}</h3>
                            <Badge variant="outline">{entry.entryType}</Badge>
                            {entry.historicalEra && (
                              <Badge variant="outline" className="text-xs capitalize">
                                {entry.historicalEra.replace(/_/g, ' ')}
                              </Badge>
                            )}
                            {entry.historicalSignificance && (
                              <Badge variant="secondary" className="text-xs capitalize">
                                {entry.historicalSignificance}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-1">
                            {entry.timeYear && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>Year {entry.timeYear}</span>
                              </div>
                            )}
                            {entry.timeSeason && (
                              <span className="capitalize">{entry.timeSeason}</span>
                            )}
                            {entry.importance && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Importance: {entry.importance}/10</span>
                              </div>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {entry.content}
                          </p>

                          {/* Related characters */}
                          {entry.relatedCharacterIds && entry.relatedCharacterIds.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {entry.relatedCharacterIds.map(cid => (
                                <Badge key={cid} variant="secondary" className="text-xs">
                                  <User className="w-3 h-3 mr-1" />
                                  {getCharName(cid)}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Related locations */}
                          {entry.relatedLocationIds && entry.relatedLocationIds.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {entry.relatedLocationIds.map(lid => (
                                <Badge key={lid} variant="outline" className="text-xs">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {getLocationName(lid)}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Tags */}
                          {entry.tags && entry.tags.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {entry.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  <Tag className="w-3 h-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Causal links summary */}
                          {((entry.causesTruthIds?.length ?? 0) > 0 || (entry.causedByTruthIds?.length ?? 0) > 0) && (
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <Link2 className="w-3 h-3" />
                              {(entry.causedByTruthIds?.length ?? 0) > 0 && (
                                <span>Caused by {entry.causedByTruthIds!.length}</span>
                              )}
                              {(entry.causesTruthIds?.length ?? 0) > 0 && (
                                <span>Causes {entry.causesTruthIds!.length}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-1 ml-3 shrink-0">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(entry)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(entry)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEntry ? 'Edit' : 'Create'} History Entry</DialogTitle>
            <DialogDescription>
              {editingEntry ? 'Update' : 'Add'} a historical truth entry
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <Label htmlFor="he-title">Title</Label>
              <Input
                id="he-title"
                value={form.title}
                onChange={e => patchForm({ title: e.target.value })}
                placeholder="The Great Fire of Millbrook"
              />
            </div>

            {/* Content */}
            <div>
              <Label htmlFor="he-content">Content / Description</Label>
              <Textarea
                id="he-content"
                value={form.content}
                onChange={e => patchForm({ content: e.target.value })}
                placeholder="Describe the historical event..."
                className="min-h-[120px]"
              />
            </div>

            {/* Entry type + Era row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Entry Type</Label>
                <Select value={form.entryType} onValueChange={v => patchForm({ entryType: v })}>
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
                <Label>Historical Era</Label>
                <Select
                  value={form.historicalEra}
                  onValueChange={v => patchForm({ historicalEra: v, customEra: v === '__custom__' ? form.customEra : '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {ERA_OPTIONS.map(e => (
                      <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                    ))}
                    <SelectItem value="__custom__">Custom...</SelectItem>
                  </SelectContent>
                </Select>
                {form.historicalEra === '__custom__' && (
                  <Input
                    className="mt-2"
                    value={form.customEra}
                    onChange={e => patchForm({ customEra: e.target.value })}
                    placeholder="e.g. renaissance"
                  />
                )}
              </div>
            </div>

            {/* Significance + Year + Season */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Significance</Label>
                <Select value={form.historicalSignificance} onValueChange={v => patchForm({ historicalSignificance: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {SIGNIFICANCE_OPTIONS.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="he-year">Year</Label>
                <Input
                  id="he-year"
                  type="number"
                  value={form.timeYear}
                  onChange={e => patchForm({ timeYear: e.target.value })}
                  placeholder="1850"
                />
              </div>

              <div>
                <Label>Season</Label>
                <Select value={form.timeSeason} onValueChange={v => patchForm({ timeSeason: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    {SEASON_OPTIONS.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Importance slider */}
            <div>
              <Label>Importance: {form.importance}/10</Label>
              <Slider
                value={[form.importance]}
                onValueChange={([v]) => patchForm({ importance: v })}
                min={1}
                max={10}
                step={1}
                className="mt-2"
              />
            </div>

            {/* Related characters multi-select */}
            <div>
              <Label>Related Characters</Label>
              <div className="flex flex-wrap gap-1 mt-1 mb-2">
                {form.relatedCharacterIds.map(cid => (
                  <Badge
                    key={cid}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem('relatedCharacterIds', cid)}
                  >
                    <User className="w-3 h-3 mr-1" />
                    {getCharName(cid)}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
              <ScrollArea className="h-[100px] border rounded-md p-2">
                {characters.map(c => (
                  <div
                    key={c.id}
                    className="flex items-center gap-2 py-1 px-1 hover:bg-muted/50 rounded cursor-pointer"
                    onClick={() => toggleArrayItem('relatedCharacterIds', c.id)}
                  >
                    <Checkbox
                      checked={form.relatedCharacterIds.includes(c.id)}
                      onCheckedChange={() => toggleArrayItem('relatedCharacterIds', c.id)}
                    />
                    <span className="text-sm">{c.firstName} {c.lastName}</span>
                  </div>
                ))}
                {characters.length === 0 && (
                  <p className="text-xs text-muted-foreground">No characters in this world</p>
                )}
              </ScrollArea>
            </div>

            {/* Related locations multi-select */}
            <div>
              <Label>Related Locations</Label>
              <div className="flex flex-wrap gap-1 mt-1 mb-2">
                {form.relatedLocationIds.map(lid => (
                  <Badge
                    key={lid}
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem('relatedLocationIds', lid)}
                  >
                    <MapPin className="w-3 h-3 mr-1" />
                    {getLocationName(lid)}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
              <ScrollArea className="h-[100px] border rounded-md p-2">
                {settlements.map(s => (
                  <div
                    key={s.id}
                    className="flex items-center gap-2 py-1 px-1 hover:bg-muted/50 rounded cursor-pointer"
                    onClick={() => toggleArrayItem('relatedLocationIds', s.id)}
                  >
                    <Checkbox
                      checked={form.relatedLocationIds.includes(s.id)}
                      onCheckedChange={() => toggleArrayItem('relatedLocationIds', s.id)}
                    />
                    <span className="text-sm">{s.name}</span>
                  </div>
                ))}
                {settlements.length === 0 && (
                  <p className="text-xs text-muted-foreground">No settlements in this world</p>
                )}
              </ScrollArea>
            </div>

            {/* Tags */}
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-1 mt-1 mb-2">
                {form.tags.map(tag => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => removeTag(tag)}
                  >
                    {tag}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                />
                <Button variant="outline" size="sm" onClick={addTag} disabled={!tagInput.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Causal links: causesTruthIds */}
            <div>
              <Label>Causes (events this leads to)</Label>
              <div className="flex flex-wrap gap-1 mt-1 mb-2">
                {form.causesTruthIds.map(tid => (
                  <Badge
                    key={tid}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem('causesTruthIds', tid)}
                  >
                    <Link2 className="w-3 h-3 mr-1" />
                    {truthMap.get(tid)?.title ?? tid.slice(0, 8)}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
              <ScrollArea className="h-[80px] border rounded-md p-2">
                {truths
                  .filter(t => t.id !== editingEntry?.id)
                  .map(t => (
                    <div
                      key={t.id}
                      className="flex items-center gap-2 py-1 px-1 hover:bg-muted/50 rounded cursor-pointer"
                      onClick={() => toggleArrayItem('causesTruthIds', t.id)}
                    >
                      <Checkbox
                        checked={form.causesTruthIds.includes(t.id)}
                        onCheckedChange={() => toggleArrayItem('causesTruthIds', t.id)}
                      />
                      <span className="text-sm truncate">{t.title}</span>
                    </div>
                  ))}
              </ScrollArea>
            </div>

            {/* Causal links: causedByTruthIds */}
            <div>
              <Label>Caused By (events that led to this)</Label>
              <div className="flex flex-wrap gap-1 mt-1 mb-2">
                {form.causedByTruthIds.map(tid => (
                  <Badge
                    key={tid}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem('causedByTruthIds', tid)}
                  >
                    <Link2 className="w-3 h-3 mr-1" />
                    {truthMap.get(tid)?.title ?? tid.slice(0, 8)}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
              <ScrollArea className="h-[80px] border rounded-md p-2">
                {truths
                  .filter(t => t.id !== editingEntry?.id)
                  .map(t => (
                    <div
                      key={t.id}
                      className="flex items-center gap-2 py-1 px-1 hover:bg-muted/50 rounded cursor-pointer"
                      onClick={() => toggleArrayItem('causedByTruthIds', t.id)}
                    >
                      <Checkbox
                        checked={form.causedByTruthIds.includes(t.id)}
                        onCheckedChange={() => toggleArrayItem('causedByTruthIds', t.id)}
                      />
                      <span className="text-sm truncate">{t.title}</span>
                    </div>
                  ))}
              </ScrollArea>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  createMutation.isPending ||
                  updateMutation.isPending ||
                  !form.title.trim() ||
                  !form.content.trim()
                }
              >
                {editingEntry ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedCount} truth entries?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the selected entries. You can undo this operation
              using the Undo button afterwards.
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
    </div>
  );
}
