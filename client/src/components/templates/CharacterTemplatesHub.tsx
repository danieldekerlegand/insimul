import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useWorldPermissions } from '@/hooks/use-world-permissions';
import {
  LayoutTemplate, Plus, Edit, Save, X, Trash2, Copy, Star, Loader2, Globe, User,
} from 'lucide-react';
import type { CharacterTemplate } from '@shared/schema';
import { PredicateBuilder, type StartingTruth } from './PredicateBuilder';
import { ActionFeasibilityTester } from './ActionFeasibilityTester';

interface CharacterTemplatesHubProps {
  worldId: string;
}

export function CharacterTemplatesHub({ worldId }: CharacterTemplatesHubProps) {
  const { toast } = useToast();
  const { canEdit } = useWorldPermissions(worldId);

  const [templates, setTemplates] = useState<CharacterTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CharacterTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<{ name: string; description: string; startingTruths: StartingTruth[] }>({ name: '', description: '', startingTruths: [] });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState<{ name: string; description: string }>({ name: '', description: '' });
  const [deleteTarget, setDeleteTarget] = useState<CharacterTemplate | null>(null);
  const [saving, setSaving] = useState(false);

  // Load templates
  useEffect(() => {
    if (!worldId) return;
    setLoading(true);
    fetch(`/api/worlds/${worldId}/character-templates`)
      .then(r => r.ok ? r.json() : [])
      .then((data: CharacterTemplate[]) => {
        setTemplates(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [worldId]);

  // Separate base and world templates
  const { baseTemplates, worldTemplates } = useMemo(() => {
    const base: CharacterTemplate[] = [];
    const world: CharacterTemplate[] = [];
    for (const t of templates) {
      if (t.isBase) base.push(t);
      else world.push(t);
    }
    return { baseTemplates: base, worldTemplates: world };
  }, [templates]);

  // Create template
  const handleCreate = async () => {
    if (!createForm.name.trim()) {
      toast({ title: 'Error', description: 'Name is required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`/api/worlds/${worldId}/character-templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worldId,
          name: createForm.name.trim(),
          description: createForm.description.trim() || null,
          startingTruths: [],
          isDefault: false,
          isBase: false,
        }),
      });
      if (!response.ok) throw new Error('Failed to create template');
      const created: CharacterTemplate = await response.json();
      setTemplates(prev => [...prev, created]);
      setSelectedTemplate(created);
      setShowCreateDialog(false);
      setCreateForm({ name: '', description: '' });
      toast({ title: 'Created', description: `Template "${created.name}" created` });
    } catch {
      toast({ title: 'Error', description: 'Failed to create template', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Duplicate template
  const handleDuplicate = async (template: CharacterTemplate) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/worlds/${worldId}/character-templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worldId,
          name: `${template.name} (Copy)`,
          description: template.description,
          startingTruths: template.startingTruths || [],
          isDefault: false,
          isBase: false,
        }),
      });
      if (!response.ok) throw new Error('Failed to duplicate template');
      const created: CharacterTemplate = await response.json();
      setTemplates(prev => [...prev, created]);
      setSelectedTemplate(created);
      toast({ title: 'Duplicated', description: `Template "${created.name}" created` });
    } catch {
      toast({ title: 'Error', description: 'Failed to duplicate template', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Save edits
  const handleSaveEdit = async () => {
    if (!selectedTemplate || !editForm.name.trim()) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/character-templates/${selectedTemplate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name.trim(),
          description: editForm.description.trim() || null,
          startingTruths: editForm.startingTruths,
        }),
      });
      if (!response.ok) throw new Error('Failed to update template');
      const updated: CharacterTemplate = await response.json();
      setTemplates(prev => prev.map(t => t.id === updated.id ? updated : t));
      setSelectedTemplate(updated);
      setIsEditing(false);
      toast({ title: 'Saved', description: 'Template updated' });
    } catch {
      toast({ title: 'Error', description: 'Failed to update template', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Delete template
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const response = await fetch(`/api/character-templates/${deleteTarget.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete template');
      setTemplates(prev => prev.filter(t => t.id !== deleteTarget.id));
      if (selectedTemplate?.id === deleteTarget.id) setSelectedTemplate(null);
      toast({ title: 'Deleted', description: `Template "${deleteTarget.name}" deleted` });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete template', variant: 'destructive' });
    } finally {
      setDeleteTarget(null);
    }
  };

  // Toggle isDefault
  const handleToggleDefault = async (template: CharacterTemplate) => {
    try {
      const response = await fetch(`/api/character-templates/${template.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: !template.isDefault }),
      });
      if (!response.ok) throw new Error('Failed to update template');
      const updated: CharacterTemplate = await response.json();
      // If setting as default, unset others in this world
      setTemplates(prev => prev.map(t => {
        if (t.id === updated.id) return updated;
        if (updated.isDefault && t.worldId === updated.worldId && t.id !== updated.id) {
          return { ...t, isDefault: false };
        }
        return t;
      }));
      if (selectedTemplate?.id === updated.id) setSelectedTemplate(updated);
      toast({
        title: updated.isDefault ? 'Set as default' : 'Default removed',
        description: updated.isDefault ? `"${updated.name}" is now the default template` : 'Default template cleared',
      });
    } catch {
      toast({ title: 'Error', description: 'Failed to update default', variant: 'destructive' });
    }
  };

  const startEditing = (template: CharacterTemplate) => {
    setEditForm({
      name: template.name,
      description: template.description || '',
      startingTruths: (template.startingTruths as StartingTruth[] | null) || [],
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  // Render template list item
  const renderTemplateItem = (template: CharacterTemplate) => {
    const isSelected = selectedTemplate?.id === template.id;
    const truthCount = (template.startingTruths as any[] | null)?.length || 0;
    return (
      <button
        key={template.id}
        onClick={() => { setSelectedTemplate(template); setIsEditing(false); }}
        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
          isSelected
            ? 'bg-primary/10 border border-primary/30'
            : 'hover:bg-muted/50 border border-transparent'
        }`}
      >
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 shrink-0 text-muted-foreground" />
          <span className="font-medium text-sm truncate">{template.name}</span>
          {template.isDefault && (
            <Star className="w-3 h-3 shrink-0 text-yellow-500 fill-yellow-500" />
          )}
        </div>
        <div className="flex items-center gap-2 mt-1 ml-6">
          <Badge variant="outline" className="text-xs">
            {truthCount} truth{truthCount !== 1 ? 's' : ''}
          </Badge>
          {template.isBase && (
            <Badge variant="secondary" className="text-xs">
              <Globe className="w-3 h-3 mr-1" />Base
            </Badge>
          )}
        </div>
      </button>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)]">
      {/* Left sidebar — template list */}
      <div className="w-72 shrink-0 border rounded-lg bg-card flex flex-col">
        <div className="p-3 border-b flex items-center justify-between">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4" />
            Character Templates
          </h3>
          {canEdit && (
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>
        <ScrollArea className="flex-1 p-2">
          {worldTemplates.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-muted-foreground px-2 mb-1">World Templates</p>
              <div className="space-y-1">
                {worldTemplates.map(renderTemplateItem)}
              </div>
            </div>
          )}
          {baseTemplates.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground px-2 mb-1">Base Templates</p>
              <div className="space-y-1">
                {baseTemplates.map(renderTemplateItem)}
              </div>
            </div>
          )}
          {templates.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-8">
              No templates yet.{canEdit && ' Click + to create one.'}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Right panel — detail/edit */}
      <div className="flex-1 border rounded-lg bg-card flex flex-col">
        {selectedTemplate ? (
          <>
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{selectedTemplate.name}</h2>
                {selectedTemplate.isBase && (
                  <span className="text-xs text-muted-foreground">Base template (read-only)</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {canEdit && !selectedTemplate.isBase && !isEditing && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => handleToggleDefault(selectedTemplate)}>
                      <Star className={`w-4 h-4 mr-1 ${selectedTemplate.isDefault ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                      {selectedTemplate.isDefault ? 'Default' : 'Set Default'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => startEditing(selectedTemplate)}>
                      <Edit className="w-4 h-4 mr-1" />Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDuplicate(selectedTemplate)}>
                      <Copy className="w-4 h-4 mr-1" />Duplicate
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(selectedTemplate)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
                {canEdit && selectedTemplate.isBase && (
                  <Button size="sm" variant="outline" onClick={() => handleDuplicate(selectedTemplate)}>
                    <Copy className="w-4 h-4 mr-1" />Duplicate to World
                  </Button>
                )}
                {isEditing && (
                  <>
                    <Button size="sm" onClick={handleSaveEdit} disabled={saving}>
                      <Save className="w-4 h-4 mr-1" />{saving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={cancelEditing}>
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Body */}
            <ScrollArea className="flex-1 p-4">
              {isEditing ? (
                <div className="space-y-6 max-w-2xl">
                  <div className="space-y-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={editForm.name}
                        onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Template name"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={editForm.description}
                        onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe this character template..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <PredicateBuilder
                    truths={editForm.startingTruths}
                    onChange={startingTruths => setEditForm(prev => ({ ...prev, startingTruths }))}
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                    <p className="text-sm">{selectedTemplate.description || 'No description'}</p>
                  </div>

                  {/* Starting Truths */}
                  <PredicateBuilder
                    truths={(selectedTemplate.startingTruths as StartingTruth[] | null) || []}
                    onChange={() => {}}
                    readOnly
                  />

                  {/* Metadata */}
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    {selectedTemplate.createdAt && (
                      <span>Created: {new Date(selectedTemplate.createdAt).toLocaleDateString()}</span>
                    )}
                    {selectedTemplate.updatedAt && (
                      <span>Updated: {new Date(selectedTemplate.updatedAt).toLocaleDateString()}</span>
                    )}
                  </div>

                  {/* Feasibility Tester */}
                  <div className="border-t pt-4">
                    <ActionFeasibilityTester
                      templates={templates}
                      selectedTemplateId={selectedTemplate.id}
                    />
                  </div>
                </div>
              )}
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Select a template to view details
          </div>
        )}
      </div>

      {/* Create dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Character Template</DialogTitle>
            <DialogDescription>
              Define a new character template with starting truths for this world.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Name</Label>
              <Input
                value={createForm.name}
                onChange={e => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Explorer, Scholar, Trader"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={createForm.description}
                onChange={e => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this template represents..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving || !createForm.name.trim()}>
              {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
