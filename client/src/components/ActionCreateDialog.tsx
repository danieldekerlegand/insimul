import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';

interface ActionCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (action: any) => void;
  children?: React.ReactNode;
}

export function ActionCreateDialog({ open, onOpenChange, onSubmit, children }: ActionCreateDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    actionType: 'social',
    category: '',
    duration: 1,
    difficulty: 0.5,
    energyCost: 1,
    targetType: 'none',
    requiresTarget: false,
    range: 0,
    cooldown: 0,
    verbPast: '',
    verbPresent: '',
    tags: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const actionData = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      prerequisites: [],
      effects: [],
      sideEffects: [],
      triggerConditions: [],
      narrativeTemplates: [],
    };

    onSubmit(actionData);
    onOpenChange(false);

    // Reset form
    setFormData({
      name: '',
      description: '',
      actionType: 'social',
      category: '',
      duration: 1,
      difficulty: 0.5,
      energyCost: 1,
      targetType: 'none',
      requiresTarget: false,
      range: 0,
      cooldown: 0,
      verbPast: '',
      verbPresent: '',
      tags: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Action</DialogTitle>
          <DialogDescription>
            Define a new action that characters can perform in simulations.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Action Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Negotiate Trade Deal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actionType">Action Type *</Label>
              <Select
                value={formData.actionType}
                onValueChange={(value) => setFormData({ ...formData, actionType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="physical">Physical</SelectItem>
                  <SelectItem value="mental">Mental</SelectItem>
                  <SelectItem value="economic">Economic</SelectItem>
                  <SelectItem value="magical">Magical</SelectItem>
                  <SelectItem value="political">Political</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this action does..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., conversation, combat, trade"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetType">Target Type</Label>
              <Select
                value={formData.targetType}
                onValueChange={(value) => setFormData({ ...formData, targetType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="self">Self</SelectItem>
                  <SelectItem value="other">Other Character</SelectItem>
                  <SelectItem value="location">Location</SelectItem>
                  <SelectItem value="object">Object</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (steps)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty (0-1)</Label>
              <Input
                id="difficulty"
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: parseFloat(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="energyCost">Energy Cost</Label>
              <Input
                id="energyCost"
                type="number"
                min="0"
                value={formData.energyCost}
                onChange={(e) => setFormData({ ...formData, energyCost: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="range">Range</Label>
              <Input
                id="range"
                type="number"
                min="0"
                value={formData.range}
                onChange={(e) => setFormData({ ...formData, range: parseInt(e.target.value) })}
                placeholder="0 = same location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cooldown">Cooldown (steps)</Label>
              <Input
                id="cooldown"
                type="number"
                min="0"
                value={formData.cooldown}
                onChange={(e) => setFormData({ ...formData, cooldown: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="verbPresent">Verb (Present)</Label>
              <Input
                id="verbPresent"
                value={formData.verbPresent}
                onChange={(e) => setFormData({ ...formData, verbPresent: e.target.value })}
                placeholder="e.g., talks, fights"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="verbPast">Verb (Past)</Label>
              <Input
                id="verbPast"
                value={formData.verbPast}
                onChange={(e) => setFormData({ ...formData, verbPast: e.target.value })}
                placeholder="e.g., talked, fought"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g., diplomacy, trade, negotiation"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="requiresTarget"
              checked={formData.requiresTarget}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, requiresTarget: !!checked })
              }
            />
            <Label htmlFor="requiresTarget">Requires Target</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Action</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
