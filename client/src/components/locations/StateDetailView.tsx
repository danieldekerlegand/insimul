import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Map, MapPin, Plus, ChevronRight, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useState } from 'react';

interface StateDetailViewProps {
  state: any;
  settlements: any[];
  onSelectSettlement: (settlement: any) => void;
  onAddSettlement: () => void;
  onDeleteState?: () => void;
  onDeleteSettlement?: (settlementId: string) => void;
  onBulkDeleteSettlements?: (settlementIds: string[]) => void;
}

export function StateDetailView({
  state,
  settlements,
  onSelectSettlement,
  onAddSettlement,
  onDeleteState,
  onDeleteSettlement,
  onBulkDeleteSettlements
}: StateDetailViewProps) {
  const [selectedSettlements, setSelectedSettlements] = useState<Set<string>>(new Set());
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

  const toggleSettlementSelection = (settlementId: string) => {
    const newSelection = new Set(selectedSettlements);
    if (newSelection.has(settlementId)) {
      newSelection.delete(settlementId);
    } else {
      newSelection.add(settlementId);
    }
    setSelectedSettlements(newSelection);
  };

  const toggleAllSettlements = () => {
    if (selectedSettlements.size === settlements.length) {
      setSelectedSettlements(new Set());
    } else {
      setSelectedSettlements(new Set(settlements.map(s => s.id)));
    }
  };

  const handleDeleteClick = (item: { id: string; name: string }) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete && onDeleteSettlement) {
      onDeleteSettlement(itemToDelete.id);
    }
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const confirmBulkDelete = () => {
    if (onBulkDeleteSettlements) {
      onBulkDeleteSettlements(Array.from(selectedSettlements));
      setSelectedSettlements(new Set());
    }
    setBulkDeleteConfirmOpen(false);
  };
  return (
    <div className="space-y-6">
      {/* State Info Card */}
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Map className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">{state.name}</CardTitle>
              <CardDescription>{state.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Type</span>
              <p className="font-semibold">{state.stateType}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Terrain</span>
              <p className="font-semibold">{state.terrain}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Founded</span>
              <p className="font-semibold">{state.foundedYear || 'Unknown'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settlements Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Settlements ({settlements.length})
          </h3>
          <div className="flex gap-2">
            {settlements.length > 0 && onBulkDeleteSettlements && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAllSettlements}
              >
                {selectedSettlements.size === settlements.length ? 'Deselect All' : 'Select All'}
              </Button>
            )}
            {selectedSettlements.size > 0 && onBulkDeleteSettlements && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBulkDeleteConfirmOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete {selectedSettlements.size}
              </Button>
            )}
            <Button onClick={onAddSettlement} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Settlement
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {settlements.map((settlement) => (
            <Card
              key={settlement.id}
              className="cursor-pointer hover:border-primary hover:shadow-md transition-all"
              onClick={() => onSelectSettlement(settlement)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {onBulkDeleteSettlements && (
                      <Checkbox
                        checked={selectedSettlements.has(settlement.id)}
                        onClick={(e) => e.stopPropagation()}
                        onCheckedChange={() => toggleSettlementSelection(settlement.id)}
                      />
                    )}
                    <MapPin className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">{settlement.name}</CardTitle>
                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded">
                      {settlement.settlementType}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {onDeleteSettlement && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick({ id: settlement.id, name: settlement.name });
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>Pop: {settlement.population?.toLocaleString() || 0}</span>
                  {settlement.terrain && <span>{settlement.terrain}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Settlement?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{itemToDelete?.name}</strong>?
              This will permanently remove the settlement and all associated data.
              <p className="mt-2 text-destructive font-semibold">This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Settlement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteConfirmOpen} onOpenChange={setBulkDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple Settlements?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedSettlements.size}</strong> settlement(s)?
              This will permanently remove all selected items and their associated data.
              <p className="mt-2 text-destructive font-semibold">This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete {selectedSettlements.size} Settlement(s)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
