import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface CountryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worldId: string;
  onSuccess: () => void;
}

export function CountryDialog({ open, onOpenChange, worldId, onSuccess }: CountryDialogProps) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: '', description: '', governmentType: '', economicSystem: '', foundedYear: new Date().getFullYear()
  });

  const handleSubmit = async () => {
    try {
      const res = await fetch(`/api/worlds/${worldId}/countries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        toast({ title: 'Country Created', description: `${form.name} has been created` });
        setForm({ name: '', description: '', governmentType: '', economicSystem: '', foundedYear: new Date().getFullYear() });
        onSuccess();
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        toast({ title: 'Error', description: errorData.error || errorData.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to create country', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Country</DialogTitle>
          <DialogDescription>Add a new country to this world</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Kingdom of Valoria" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="A feudal kingdom..." />
          </div>
          <div className="space-y-2">
            <Label>Founded Year</Label>
            <Input type="number" value={form.foundedYear} onChange={(e) => setForm({ ...form, foundedYear: parseInt(e.target.value) || new Date().getFullYear() })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Government</Label>
              <Select value={form.governmentType} onValueChange={(v) => setForm({ ...form, governmentType: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monarchy">Monarchy</SelectItem>
                  <SelectItem value="republic">Republic</SelectItem>
                  <SelectItem value="democracy">Democracy</SelectItem>
                  <SelectItem value="feudal">Feudal</SelectItem>
                  <SelectItem value="theocracy">Theocracy</SelectItem>
                  <SelectItem value="empire">Empire</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Economy</Label>
              <Select value={form.economicSystem} onValueChange={(v) => setForm({ ...form, economicSystem: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="feudal">Feudal</SelectItem>
                  <SelectItem value="mercantile">Mercantile</SelectItem>
                  <SelectItem value="agricultural">Agricultural</SelectItem>
                  <SelectItem value="trade-based">Trade-Based</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
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
