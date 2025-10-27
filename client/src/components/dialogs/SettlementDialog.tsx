import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface SettlementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worldId: string;
  countryId?: string;
  stateId?: string;
  onSuccess: () => void;
}

export function SettlementDialog({ open, onOpenChange, worldId, countryId, stateId, onSuccess }: SettlementDialogProps) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: '', description: '', settlementType: 'town' as 'village' | 'town' | 'city',
    terrain: 'plains', population: 0, foundedYear: new Date().getFullYear()
  });

  const handleSubmit = async () => {
    try {
      const res = await fetch(`/api/worlds/${worldId}/settlements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, worldId, countryId, stateId })
      });
      if (res.ok) {
        toast({ title: 'Settlement Created', description: `${form.name} has been created` });
        setForm({ name: '', description: '', settlementType: 'town', terrain: 'plains', population: 0, foundedYear: new Date().getFullYear() });
        onSuccess();
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        toast({ title: 'Error', description: errorData.error || errorData.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to create settlement', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Settlement</DialogTitle>
          <DialogDescription>Add a new settlement (city, town, or village)</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Goldspire" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="A bustling city..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.settlementType} onValueChange={(v: any) => setForm({ ...form, settlementType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="village">Village</SelectItem>
                  <SelectItem value="town">Town</SelectItem>
                  <SelectItem value="city">City</SelectItem>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Population</Label>
              <Input type="number" value={form.population} onChange={(e) => setForm({ ...form, population: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="space-y-2">
              <Label>Founded Year</Label>
              <Input type="number" value={form.foundedYear} onChange={(e) => setForm({ ...form, foundedYear: parseInt(e.target.value) || new Date().getFullYear() })} />
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
