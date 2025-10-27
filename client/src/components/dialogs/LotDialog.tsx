import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface LotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: LotFormData) => void;
  settlementId: string;
}

export interface LotFormData {
  address: string;
  districtName?: string;
  description?: string;
  size?: number;
  settlementId: string;
}

export function LotDialog({ open, onOpenChange, onSubmit, settlementId }: LotDialogProps) {
  const [formData, setFormData] = useState<LotFormData>({
    address: '',
    districtName: '',
    description: '',
    size: 1000,
    settlementId
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form
    setFormData({
      address: '',
      districtName: '',
      description: '',
      size: 1000,
      settlementId
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Lot</DialogTitle>
            <DialogDescription>
              Add a new lot to this settlement.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="789 Main Street"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="districtName">District Name</Label>
              <Input
                id="districtName"
                value={formData.districtName}
                onChange={(e) => setFormData({ ...formData, districtName: e.target.value })}
                placeholder="Market District"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="size">Size (sq ft)</Label>
              <Input
                id="size"
                type="number"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: parseInt(e.target.value) || 0 })}
                min="1"
                placeholder="1000"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="A description of the lot..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.address}>
              Create Lot
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
