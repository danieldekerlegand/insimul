import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Heart, Brain, Activity, Briefcase, Users, ChevronRight, MessageCircle } from 'lucide-react';
import type { Character } from '@shared/schema';

interface CharacterDetailViewProps {
  character: Character;
  allCharacters: Character[];
  onEditCharacter: (character: Character) => void;
  onChatWithCharacter: (character: Character) => void;
  onViewCharacter: (character: Character) => void;
}

export function CharacterDetailView({
  character,
  allCharacters,
  onEditCharacter,
  onChatWithCharacter,
  onViewCharacter
}: CharacterDetailViewProps) {
  
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
    const currentYear = new Date().getFullYear();
    return currentYear - char.birthYear;
  };

  const getCharacterById = (id: string) => {
    return allCharacters.find(c => c.id === id);
  };

  return (
    <div className="space-y-6">
      {/* Character Info Card */}
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{getFullName(character)}</CardTitle>
                <CardDescription className="mt-1">
                  {getAge(character) && `Age ${getAge(character)} • `}
                  {character.gender && `${character.gender.charAt(0).toUpperCase() + character.gender.slice(1)}`}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onChatWithCharacter(character)}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Talk
              </Button>
              <Button variant="outline" size="sm" onClick={() => onEditCharacter(character)}>
                Edit Character
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Occupation</span>
              <p className="font-semibold">{character.occupation || 'Not specified'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Location</span>
              <p className="font-semibold">{character.currentLocation || 'Unknown'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Gender</span>
              <p className="font-semibold">{character.gender || 'Not specified'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Age</span>
              <p className="font-semibold">{getAge(character) || 'Unknown'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personality & Traits */}
      {character.personality && Object.keys(character.personality).length > 0 && (
        <Card>
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
                  <p className="font-medium">{String(value)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Physical Traits */}
      {character.physicalTraits && Object.keys(character.physicalTraits).length > 0 && (
        <Card>
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
        <Card>
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
        <Card>
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
                    className="cursor-pointer hover:border-primary transition-all"
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
        <Card>
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
                        className="cursor-pointer hover:border-primary transition-all"
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
                        className="cursor-pointer hover:border-primary transition-all"
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
