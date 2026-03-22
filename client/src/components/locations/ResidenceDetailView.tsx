import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Home, Users, ChevronRight, Crown, Heart, UserCheck } from 'lucide-react';
import type { Character } from '@shared/schema';

export const RESIDENCE_TYPES = [
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
  'Other',
] as const;

interface ResidenceDetailViewProps {
  residence: any;
  characters: Character[];
  lots?: any[];
  canEdit?: boolean;
  onViewCharacter: (character: Character) => void;
  onResidenceTypeChange?: (residenceId: string, newType: string) => void;
}

export function ResidenceDetailView({
  residence,
  characters,
  lots = [],
  canEdit = false,
  onViewCharacter,
  onResidenceTypeChange,
}: ResidenceDetailViewProps) {
  const ownerIds: string[] = residence.ownerIds || [];
  const residentIds: string[] = residence.residentIds || [];

  const owners = useMemo(
    () => ownerIds.map(id => characters.find(c => c.id === id)).filter(Boolean) as Character[],
    [ownerIds, characters]
  );

  const residents = useMemo(
    () => residentIds.map(id => characters.find(c => c.id === id)).filter(Boolean) as Character[],
    [residentIds, characters]
  );

  const lot = useMemo(
    () => lots.find(l => l.id === residence.lotId),
    [lots, residence.lotId]
  );

  // Build household relationships among residents
  const householdRelationships = useMemo(() => {
    const relationships: { from: Character; to: Character; type: string }[] = [];
    const residentSet = new Set(residentIds);

    for (const resident of residents) {
      if (resident.spouseId && residentSet.has(resident.spouseId)) {
        const spouse = residents.find(r => r.id === resident.spouseId);
        // Avoid duplicates — only add if from.id < to.id
        if (spouse && resident.id < spouse.id) {
          relationships.push({ from: resident, to: spouse, type: 'spouse' });
        }
      }
      const childIds: string[] = (resident as any).childIds || [];
      for (const childId of childIds) {
        if (residentSet.has(childId)) {
          const child = residents.find(r => r.id === childId);
          if (child) {
            relationships.push({ from: resident, to: child, type: 'parent' });
          }
        }
      }
    }
    return relationships;
  }, [residents, residentIds]);

  const getCharacterName = (char: Character) =>
    [char.firstName, char.lastName].filter(Boolean).join(' ') || 'Unknown';

  return (
    <div className="space-y-4">
      {/* Residence Info */}
      <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">{residence.address || 'Residence'}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Type</span>
            {canEdit && onResidenceTypeChange ? (
              <Select
                value={residence.residenceType ? residence.residenceType.charAt(0).toUpperCase() + residence.residenceType.slice(1).toLowerCase() : 'House'}
                onValueChange={(value) => onResidenceTypeChange(residence.id, value.toLowerCase())}
              >
                <SelectTrigger className="w-[140px] h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESIDENCE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Badge variant="outline" className="capitalize">{residence.residenceType || 'house'}</Badge>
            )}
          </div>
          {lot && lot.streetName && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Street</span>
              <span className="font-medium">{lot.streetName}</span>
            </div>
          )}
          {lot && lot.districtName && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">District</span>
              <span className="font-medium">{lot.districtName}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Occupants</span>
            <span className="font-medium">{residents.length}</span>
          </div>
        </CardContent>
      </Card>

      {/* Owners */}
      <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-500" />
            Owners ({owners.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {owners.length > 0 ? (
            <div className="space-y-1">
              {owners.map(owner => (
                <CharacterRow
                  key={owner.id}
                  character={owner}
                  onClick={() => onViewCharacter(owner)}
                  getName={getCharacterName}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No owners assigned</p>
          )}
        </CardContent>
      </Card>

      {/* Residents */}
      <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            Residents ({residents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {residents.length > 0 ? (
            <div className="space-y-1">
              {residents.map(resident => {
                const isOwner = ownerIds.includes(resident.id);
                return (
                  <CharacterRow
                    key={resident.id}
                    character={resident}
                    onClick={() => onViewCharacter(resident)}
                    getName={getCharacterName}
                    badge={isOwner ? 'Owner' : undefined}
                  />
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No residents</p>
          )}
        </CardContent>
      </Card>

      {/* Household Relationships */}
      {householdRelationships.length > 0 && (
        <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              Household Relationships
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {householdRelationships.map((rel, i) => (
                <div key={i} className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto py-1 px-2 font-medium"
                    onClick={() => onViewCharacter(rel.from)}
                  >
                    {getCharacterName(rel.from)}
                  </Button>
                  <Badge variant="secondary" className="text-xs">
                    {rel.type === 'spouse' ? 'married to' : 'parent of'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto py-1 px-2 font-medium"
                    onClick={() => onViewCharacter(rel.to)}
                  >
                    {getCharacterName(rel.to)}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CharacterRow({
  character,
  onClick,
  getName,
  badge,
}: {
  character: Character;
  onClick: () => void;
  getName: (c: Character) => string;
  badge?: string;
}) {
  return (
    <button
      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted text-left"
      onClick={onClick}
    >
      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
        {(character.firstName ?? '?')[0]}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm truncate">{getName(character)}</p>
        {character.occupation && (
          <p className="text-xs text-muted-foreground truncate">{character.occupation}</p>
        )}
      </div>
      {badge && (
        <Badge variant="outline" className="text-xs shrink-0">{badge}</Badge>
      )}
      <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
    </button>
  );
}
