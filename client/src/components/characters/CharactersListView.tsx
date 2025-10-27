import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, ChevronRight, Plus, Heart, Users, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CharacterCreateDialog } from '../CharacterCreateDialog';
import type { Character } from '@shared/schema';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useState } from 'react';

interface CharactersListViewProps {
  characters: Character[];
  worldId: string;
  settlementId?: string;
  onSelectCharacter: (character: Character) => void;
  onCreateCharacter: (data: any) => void;
  isCreating: boolean;
  onDeleteCharacter?: (characterId: string) => void;
  onBulkDeleteCharacters?: (characterIds: string[]) => void;
}

export function CharactersListView({
  characters,
  worldId,
  settlementId,
  onSelectCharacter,
  onCreateCharacter,
  isCreating,
  onDeleteCharacter,
  onBulkDeleteCharacters
}: CharactersListViewProps) {
  const [selectedCharacters, setSelectedCharacters] = useState<Set<string>>(new Set());
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

  const toggleCharacterSelection = (characterId: string) => {
    const newSelection = new Set(selectedCharacters);
    if (newSelection.has(characterId)) {
      newSelection.delete(characterId);
    } else {
      newSelection.add(characterId);
    }
    setSelectedCharacters(newSelection);
  };

  const toggleAllCharacters = () => {
    if (selectedCharacters.size === characters.length) {
      setSelectedCharacters(new Set());
    } else {
      setSelectedCharacters(new Set(characters.map(c => c.id)));
    }
  };

  const handleDeleteClick = (item: { id: string; name: string }) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete && onDeleteCharacter) {
      onDeleteCharacter(itemToDelete.id);
    }
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const confirmBulkDelete = () => {
    if (onBulkDeleteCharacters) {
      onBulkDeleteCharacters(Array.from(selectedCharacters));
      setSelectedCharacters(new Set());
    }
    setBulkDeleteConfirmOpen(false);
  };
  
  const getFullName = (character: Character) => {
    const parts = [
      character.firstName,
      character.middleName,
      character.lastName,
      character.suffix
    ].filter(Boolean);
    return parts.join(' ');
  };

  const getAge = (character: Character) => {
    if (!character.birthYear) return null;
    const currentYear = new Date().getFullYear();
    return currentYear - character.birthYear;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Characters
          </h2>
          <p className="text-muted-foreground mt-1">Click a character to view their details and relationships</p>
        </div>
        <div className="flex gap-2">
          {characters.length > 0 && onBulkDeleteCharacters && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAllCharacters}
            >
              {selectedCharacters.size === characters.length ? 'Deselect All' : 'Select All'}
            </Button>
          )}
          {selectedCharacters.size > 0 && onBulkDeleteCharacters && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteConfirmOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete {selectedCharacters.size}
            </Button>
          )}
          <CharacterCreateDialog
            worldId={worldId}
            settlementId={settlementId}
            onCreateCharacter={onCreateCharacter}
            isLoading={isCreating}
          >
            <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
              <Plus className="w-4 h-4 mr-2" />
              Add Character
            </Button>
          </CharacterCreateDialog>
        </div>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="grid gap-4">
          {characters.map((character) => (
            <Card
              key={character.id}
              className="cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
              onClick={() => onSelectCharacter(character)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {onBulkDeleteCharacters && (
                      <Checkbox
                        checked={selectedCharacters.has(character.id)}
                        onClick={(e) => e.stopPropagation()}
                        onCheckedChange={() => toggleCharacterSelection(character.id)}
                      />
                    )}
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{getFullName(character)}</CardTitle>
                      <CardDescription className="mt-1">
                        {getAge(character) && `Age ${getAge(character)} • `}
                        {character.gender && `${character.gender.charAt(0).toUpperCase() + character.gender.slice(1)}`}
                        {character.occupation && ` • ${character.occupation}`}
                      </CardDescription>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {character.currentLocation && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium">{character.currentLocation}</span>
                    </div>
                  )}
                  {character.relationships && Object.keys(character.relationships).length > 0 && (
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{Object.keys(character.relationships).length} relationships</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {characters.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="pt-12 pb-12">
                <div className="text-center space-y-3">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-muted-foreground">No characters yet. Click "Add Character" to create one!</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Character?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{itemToDelete?.name}</strong>?
              This will permanently remove the character and all associated data.
              <p className="mt-2 text-destructive font-semibold">This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Character
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteConfirmOpen} onOpenChange={setBulkDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple Characters?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedCharacters.size}</strong> character(s)?
              This will permanently remove all selected characters and their associated data.
              <p className="mt-2 text-destructive font-semibold">This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete {selectedCharacters.size} Character(s)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
