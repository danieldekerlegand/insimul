import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface StateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worldId: string;
  countryId?: string;
  countryName?: string;
  onSuccess: () => void;
}

export function StateDialog({ open, onOpenChange, worldId, countryId, countryName, onSuccess }: StateDialogProps) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: '', description: '', stateType: 'province', terrain: 'plains', foundedYear: new Date().getFullYear()
  });

  const handleSubmit = async () => {
    if (!countryId) {
      toast({ title: 'Error', description: 'No country selected', variant: 'destructive' });
      return;
    }
    try {
      const res = await fetch(`/api/countries/${countryId}/states`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, worldId })
      });
      if (res.ok) {
        toast({ title: 'State Created', description: `${form.name} has been created` });
        setForm({ name: '', description: '', stateType: 'province', terrain: 'plains', foundedYear: new Date().getFullYear() });
        onSuccess();
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        toast({ title: 'Error', description: errorData.error || errorData.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to create state', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create State / Province</DialogTitle>
          <DialogDescription>Add a new region within {countryName || 'the selected country'}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Province of Aldermoor" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="A northern province..." />
          </div>
          <div className="space-y-2">
            <Label>Founded Year</Label>
            <Input type="number" value={form.foundedYear} onChange={(e) => setForm({ ...form, foundedYear: parseInt(e.target.value) || new Date().getFullYear() })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.stateType} onValueChange={(v) => setForm({ ...form, stateType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="province">Province</SelectItem>
                  <SelectItem value="state">State</SelectItem>
                  <SelectItem value="territory">Territory</SelectItem>
                  <SelectItem value="region">Region</SelectItem>
                  <SelectItem value="duchy">Duchy</SelectItem>
                  <SelectItem value="county">County</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Terrain</Label>
              <Select value={form.terrain} onValueChange={(v) => setForm({ ...form, terrain: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="plains">Plains</SelectItem>
                  <SelectItem value="hills">Hills</SelectItem>
                  <SelectItem value="mountains">Mountains</SelectItem>
                  <SelectItem value="coast">Coast</SelectItem>
                  <SelectItem value="river">River</SelectItem>
                  <SelectItem value="forest">Forest</SelectItem>
                  <SelectItem value="desert">Desert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!form.name}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
