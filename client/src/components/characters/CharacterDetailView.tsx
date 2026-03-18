import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Heart, Brain, Activity, Briefcase, Users, ChevronRight, MessageCircle, Box } from 'lucide-react';
import { CharacterModelPreview } from './CharacterModelPreview';
import type { Character } from '@shared/schema';

interface CharacterDetailViewProps {
  character: Character;
  allCharacters: Character[];
  onEditCharacter: (character: Character) => void;
  onChatWithCharacter: (character: Character) => void;
  onViewCharacter: (character: Character) => void;
}

/** Format a personality trait value (typically -1..1 or 0..1) as X/100 */
function formatPersonalityValue(value: unknown): string {
  const num = Number(value);
  if (isNaN(num)) return String(value);
  // Traits are stored as -1..1 or 0..1; normalize to 0..100
  const normalized = num < 0 ? Math.round(((num + 1) / 2) * 100) : Math.round(num * 100);
  return `${Math.max(0, Math.min(100, normalized))}/100`;
}

export function CharacterDetailView({
  character,
  allCharacters,
  onEditCharacter,
  onChatWithCharacter,
  onViewCharacter
}: CharacterDetailViewProps) {
  // Fetch visual assets for this character
  const { data: visualAssets = [] } = useQuery<any[]>({
    queryKey: ['/api/assets/character', character.id],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/assets/character/${character.id}`);
      return response.json();
    },
  });

  // Resolve location UUID to a readable settlement name
  const { data: locationName } = useQuery<string>({
    queryKey: ['/api/settlement-name', character.currentLocation],
    queryFn: async () => {
      if (!character.currentLocation) return 'Unknown';
      try {
        const response = await apiRequest('GET', `/api/settlements/${character.currentLocation}`);
        const settlement = await response.json();
        return settlement?.name || character.currentLocation;
      } catch {
        return character.currentLocation;
      }
    },
    enabled: !!character.currentLocation,
  });

  // Fetch world data to get currentYear for age calculation
  const { data: worldData } = useQuery<any>({
    queryKey: ['/api/world', character.worldId],
    queryFn: async () => {
      if (!character.worldId) return null;
      try {
        const response = await apiRequest('GET', `/api/worlds/${character.worldId}`);
        return response.json();
      } catch {
        return null;
      }
    },
    enabled: !!character.worldId,
  });

  const portrait = visualAssets.find(a => a.assetType === 'character_portrait');
  const textures = visualAssets.filter(a => a.assetType === 'character_texture');
  const characterModel = visualAssets.find(a => a.assetType === 'model_character');

  const getFullName = (char: Character) => {
    const parts = [
      char.firstName,
      char.middleName,
      char.lastName,
      char.suffix
    ].filter(Boolean);
    return parts.join(' ');
  };

  const getAge = (char: Character) => {
    if (!char.birthYear) return null;
    // Use world's currentYear if available, otherwise fall back to real year
    const currentYear = worldData?.currentYear || worldData?.foundedYear
      ? (worldData.currentYear || worldData.foundedYear + 100)
      : new Date().getFullYear();
    const age = currentYear - char.birthYear;
    return age >= 0 ? age : null;
  };

  const getCharacterById = (id: string) => {
    return allCharacters.find(c => c.id === id);
  };

  return (
    <div className="space-y-6">
      {/* Character Info Card with Portrait */}
      <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg shadow-primary/5 rounded-xl">
        <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/5 to-transparent rounded-t-xl">
          <div className="flex items-start gap-4">
            {/* Portrait Display */}
            <div className="flex-shrink-0">
              {portrait ? (
                <img
                  src={`/${portrait.filePath}`}
                  alt={getFullName(character)}
                  className="w-20 h-20 object-cover rounded-lg border-2 border-primary/20"
                />
              ) : (
                <div className="w-20 h-20 bg-primary/10 rounded-lg flex items-center justify-center border-2 border-dashed border-primary/30">
                  <User className="w-10 h-10 text-primary/50" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl truncate">{getFullName(character)}</CardTitle>
              <CardDescription className="mt-1">
                {getAge(character) && `Age ${getAge(character)} • `}
                {character.gender && `${character.gender.charAt(0).toUpperCase() + character.gender.slice(1)}`}
              </CardDescription>

              <div className="flex flex-col gap-1.5 mt-3">
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => onChatWithCharacter(character)}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Talk
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => onEditCharacter(character)}>
                  Edit Character
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Occupation</span>
              <p className="text-sm font-semibold text-right">{character.occupation || 'Not specified'}</p>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Location</span>
              <p className="text-sm font-semibold text-right">{locationName || character.currentLocation || 'Unknown'}</p>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Gender</span>
              <p className="text-sm font-semibold text-right">{character.gender || 'Not specified'}</p>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Age</span>
              <p className="text-sm font-semibold text-right">{getAge(character) || 'Unknown'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3D Model Preview */}
      <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Box className="w-4 h-4 text-primary" />
            3D Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CharacterModelPreview
            modelPath={characterModel?.filePath}
            texturePath={textures[0]?.filePath}
            className="h-52"
          />
        </CardContent>
      </Card>

      {/* Personality & Traits */}
      {character.personality && Object.keys(character.personality).length > 0 && (
        <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Personality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(character.personality).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <span className="text-sm text-muted-foreground capitalize">{key}</span>
                  <p className="font-medium">{formatPersonalityValue(value)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Physical Traits */}
      {character.physicalTraits && Object.keys(character.physicalTraits).length > 0 && (
        <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Physical Traits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(character.physicalTraits).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <span className="text-sm text-muted-foreground capitalize">{key}</span>
                  <p className="font-medium">{String(value)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skills */}
      {character.skills && Object.keys(character.skills).length > 0 && (
        <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(character.skills).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-sm capitalize">{key}</span>
                  <span className="px-2 py-1 bg-primary/10 rounded text-primary font-medium text-sm">
                    {String(value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Relationships */}
      {character.relationships && Object.keys(character.relationships).length > 0 && (
        <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              Relationships ({Object.keys(character.relationships).length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(character.relationships).map(([characterId, relationship]: [string, any]) => {
                const relatedCharacter = getCharacterById(characterId);
                return (
                  <Card
                    key={characterId}
                    className="cursor-pointer bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-sm transition-all rounded-lg"
                    onClick={() => {
                      if (relatedCharacter) onViewCharacter(relatedCharacter);
                    }}
                  >
                    <CardHeader className="py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">
                            {relatedCharacter ? getFullName(relatedCharacter) : 'Unknown Character'}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {typeof relationship === 'string' ? relationship : relationship?.type || 'Unknown relationship'}
                          </CardDescription>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Family */}
      {((character.parentIds && character.parentIds.length > 0) ||
        (character.childIds && character.childIds.length > 0)) && (
        <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Family
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {character.parentIds && character.parentIds.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Parents</h4>
                <div className="space-y-2">
                  {character.parentIds.map(parentId => {
                    const parent = getCharacterById(parentId);
                    return parent ? (
                      <Card
                        key={parentId}
                        className="cursor-pointer bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-sm transition-all rounded-lg"
                        onClick={() => onViewCharacter(parent)}
                      >
                        <CardHeader className="py-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">{getFullName(parent)}</CardTitle>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </CardHeader>
                      </Card>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {character.childIds && character.childIds.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Children</h4>
                <div className="space-y-2">
                  {character.childIds.map(childId => {
                    const child = getCharacterById(childId);
                    return child ? (
                      <Card
                        key={childId}
                        className="cursor-pointer bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-sm transition-all rounded-lg"
                        onClick={() => onViewCharacter(child)}
                      >
                        <CardHeader className="py-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">{getFullName(child)}</CardTitle>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </CardHeader>
                      </Card>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

    </div>
  );
}
