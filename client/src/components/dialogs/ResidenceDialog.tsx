import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface ResidenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ResidenceFormData) => void;
  settlementId: string;
}

export interface ResidenceFormData {
  address: string;
  residenceType: string;
  description?: string;
  rooms?: number;
  settlementId: string;
}

const residenceTypes = [
  'House',
  'Apartment',
  'Cottage',
  'Manor',
  'Estate',
  'Townhouse',
  'Hut',
  'Villa',
  'Cabin',
  'Palace',
  'Other'
];

export function ResidenceDialog({ open, onOpenChange, onSubmit, settlementId }: ResidenceDialogProps) {
  const [formData, setFormData] = useState<ResidenceFormData>({
    address: '',
    residenceType: 'House',
    description: '',
    rooms: 4,
    settlementId
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form
    setFormData({
      address: '',
      residenceType: 'House',
      description: '',
      rooms: 4,
      settlementId
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Residence</DialogTitle>
            <DialogDescription>
              Add a new residence to this settlement.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="456 Oak Avenue"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="residenceType">Residence Type *</Label>
              <Select
                value={formData.residenceType}
                onValueChange={(value) => setFormData({ ...formData, residenceType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {residenceTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="rooms">Number of Rooms</Label>
              <Input
                id="rooms"
                type="number"
                value={formData.rooms}
                onChange={(e) => setFormData({ ...formData, rooms: parseInt(e.target.value) || 0 })}
                min="1"
                max="50"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="A description of the residence..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.address}>
              Create Residence
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
