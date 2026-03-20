import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import {
  User, Heart, Brain, Activity, Briefcase, Users, ChevronRight,
  MessageCircle, Box, Save, X, Trash2, BookOpen, Calendar,
  Sparkles, Image as ImageIcon, Pencil, Check
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { CharacterModelPreview } from './CharacterModelPreview';
import { VisualAssetGeneratorDialog } from '../VisualAssetGeneratorDialog';
import { AssetBrowserDialog } from '../AssetBrowserDialog';
import type { Character, VisualAsset } from '@shared/schema';
import { characterModelPath } from '@shared/asset-paths';

// Bundled NPC models available for selection
const BUNDLED_NPC_MODELS: { key: string; name: string; filePath: string }[] = [
  { key: 'default', name: 'Default NPC (starterAvatars)', filePath: 'assets/models/characters/legacy/starterAvatars.babylon' },
  { key: 'civilian_male', name: 'Male Civilian NPC', filePath: characterModelPath('generic', 'npc_civilian_male.glb') },
  { key: 'civilian_female', name: 'Female Civilian NPC', filePath: characterModelPath('generic', 'npc_civilian_female.glb') },
  { key: 'guard', name: 'Guard NPC', filePath: characterModelPath('generic', 'npc_guard.glb') },
  { key: 'merchant', name: 'Merchant NPC', filePath: characterModelPath('generic', 'npc_merchant.glb') },
  { key: 'brainstem', name: 'BrainStem Character', filePath: characterModelPath('generic', 'brainstem.glb') },
  { key: 'fox', name: 'Fox Character', filePath: characterModelPath('generic', 'fox.glb') },
];

interface Truth {
  id: string;
  title: string;
  content: string;
  entryType: string;
  timestep: number;
  timestepDuration: number | null;
  timeYear: number | null;
  timeSeason: string | null;
  importance: number | null;
  tags: string[] | null;
  source: string | null;
}

interface CharacterDetailViewProps {
  character: Character;
  allCharacters: Character[];
  onCharacterUpdated?: () => void;
  onCharacterDeleted?: () => void;
  onChatWithCharacter: (character: Character) => void;
  onViewCharacter: (character: Character) => void;
}

/** Format a personality trait value (typically -1..1 or 0..1) as X/100 */
function formatPersonalityValue(value: unknown): string {
  const num = Number(value);
  if (isNaN(num)) return String(value);
  const normalized = num < 0 ? Math.round(((num + 1) / 2) * 100) : Math.round(num * 100);
  return `${Math.max(0, Math.min(100, normalized))}/100`;
}

export function CharacterDetailView({
  character,
  allCharacters,
  onCharacterUpdated,
  onCharacterDeleted,
  onChatWithCharacter,
  onViewCharacter
}: CharacterDetailViewProps) {
  const { toast } = useToast();
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const authHeaders = (): Record<string, string> => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  };

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAssetGenerator, setShowAssetGenerator] = useState(false);
  const [showAssetBrowser, setShowAssetBrowser] = useState(false);

  // Editable fields
  const [firstName, setFirstName] = useState(character.firstName);
  const [middleName, setMiddleName] = useState(character.middleName || '');
  const [lastName, setLastName] = useState(character.lastName);
  const [suffix, setSuffix] = useState(character.suffix || '');
  const [maidenName, setMaidenName] = useState(character.maidenName || '');
  const [birthYear, setBirthYear] = useState<number | null>(character.birthYear);
  const [gender, setGender] = useState(character.gender);
  const [occupation, setOccupation] = useState(character.occupation || '');
  const [currentLocation, setCurrentLocation] = useState(character.currentLocation || '');
  const [isAlive, setIsAlive] = useState(character.isAlive ?? true);
  const [status, setStatus] = useState(character.status || '');

  // Reset form when character changes
  useEffect(() => {
    setFirstName(character.firstName);
    setMiddleName(character.middleName || '');
    setLastName(character.lastName);
    setSuffix(character.suffix || '');
    setMaidenName(character.maidenName || '');
    setBirthYear(character.birthYear);
    setGender(character.gender);
    setOccupation(character.occupation || '');
    setCurrentLocation(character.currentLocation || '');
    setIsAlive(character.isAlive ?? true);
    setStatus(character.status || '');
    setIsEditing(false);
  }, [character.id]);

  // Fetch visual assets for this character
  const { data: visualAssets = [] } = useQuery<any[]>({
    queryKey: ['/api/assets/character', character.id],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/assets/character/${character.id}`);
      return response.json();
    },
  });

  // Fetch character truths
  const { data: truths = [] } = useQuery<Truth[]>({
    queryKey: ['/api/characters', character.id, 'truth'],
    enabled: !!character.id,
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

  const portrait = visualAssets.find((a: any) => a.assetType === 'character_portrait');
  const textures = visualAssets.filter((a: any) => a.assetType === 'character_texture');

  // NPC model: local override (set immediately on dropdown change) > explicit generationConfig > gender auto-select
  const [localModelPathOverride, setLocalModelPathOverride] = useState<string | null>(null);

  // Reset the local override when the character prop changes (e.g. parent refetch or switching characters)
  useEffect(() => {
    setLocalModelPathOverride(null);
  }, [character.id]);

  const explicitModelPath = localModelPathOverride || (character.generationConfig as any)?.npcModelPath || null;
  const genderModelPath = (() => {
    if (explicitModelPath) return null; // explicit path takes priority
    const g = (character.gender || '').toLowerCase();
    if (g === 'female' || g === 'f') return characterModelPath('generic', 'npc_civilian_female.glb');
    if (g === 'male' || g === 'm') return characterModelPath('generic', 'npc_civilian_male.glb');
    return null; // fallback to default for other/unspecified
  })();
  const npcModelPath = explicitModelPath || genderModelPath || null;
  const currentNpcModel = BUNDLED_NPC_MODELS.find(m => npcModelPath && npcModelPath === m.filePath);
  const currentModelName = currentNpcModel?.name || (npcModelPath ? 'Custom model' : 'Default NPC (starterAvatars)');

  const getFullName = (char: Character) => {
    return [char.firstName, char.middleName, char.lastName, char.suffix].filter(Boolean).join(' ');
  };

  const getAge = (char: Character) => {
    // Use the stored age field if available (MongoDB stores it directly)
    if ((char as any).age != null && (char as any).age > 0) return (char as any).age;
    if (!char.birthYear) return null;
    // Try world-level year fields, then fall back to current real year
    const currentYear =
      worldData?.currentGameYear ||
      worldData?.historyEndYear ||
      worldData?.currentYear ||
      worldData?.foundedYear
        ? (worldData.currentGameYear || worldData.historyEndYear || worldData.currentYear || (worldData.foundedYear + 100))
        : new Date().getFullYear();
    const age = currentYear - char.birthYear;
    return age >= 0 ? age : null;
  };

  const getCharacterById = (id: string) => allCharacters.find(c => c.id === id);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/characters/${character.id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({
          firstName,
          middleName: middleName || null,
          lastName,
          suffix: suffix || null,
          maidenName: maidenName || null,
          birthYear,
          gender,
          occupation: occupation || null,
          currentLocation: currentLocation || null,
          isAlive,
          status: status || null,
        }),
      });
      if (!response.ok) throw new Error('Failed to update character');

      toast({ title: 'Character Updated', description: 'Character information has been saved.' });
      setIsEditing(false);
      onCharacterUpdated?.();
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update character',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset fields to character values
    setFirstName(character.firstName);
    setMiddleName(character.middleName || '');
    setLastName(character.lastName);
    setSuffix(character.suffix || '');
    setMaidenName(character.maidenName || '');
    setBirthYear(character.birthYear);
    setGender(character.gender);
    setOccupation(character.occupation || '');
    setCurrentLocation(character.currentLocation || '');
    setIsAlive(character.isAlive ?? true);
    setStatus(character.status || '');
    setIsEditing(false);
  };

  const handleDelete = async () => {
    try {
      const h: Record<string, string> = {};
      if (token) h['Authorization'] = `Bearer ${token}`;
      const response = await fetch(`/api/characters/${character.id}`, { method: 'DELETE', headers: h });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to delete character');
      }
      toast({ title: 'Character Deleted', description: `${character.firstName} ${character.lastName} has been deleted` });
      setShowDeleteConfirm(false);
      onCharacterDeleted?.();
    } catch (error) {
      toast({
        title: 'Delete Failed',
        description: error instanceof Error ? error.message : 'Failed to delete character',
        variant: 'destructive',
      });
    }
  };

  const handleNpcModelChange = async (modelKey: string) => {
    const selected = BUNDLED_NPC_MODELS.find(m => m.key === modelKey);
    if (!selected) return;

    // Update preview immediately (don't wait for server round-trip)
    setLocalModelPathOverride(selected.filePath);

    try {
      const updatedConfig = {
        ...((character.generationConfig as any) || {}),
        npcModelPath: selected.filePath,
        npcModelName: selected.name,
      };

      const response = await fetch(`/api/characters/${character.id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ generationConfig: updatedConfig }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to update character (${response.status})`);
      }

      toast({ title: 'NPC Model Updated', description: `Changed to ${selected.name}` });
      onCharacterUpdated?.();
    } catch (error) {
      toast({
        title: 'Failed to update model',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="truth">
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
            Truth
          </TabsTrigger>
          <TabsTrigger value="assets">
            <ImageIcon className="w-3.5 h-3.5 mr-1.5" />
            Assets
          </TabsTrigger>
        </TabsList>

        {/* ── INFO TAB ── */}
        <TabsContent value="info" className="space-y-4 mt-4">
          {/* Character Header with Portrait */}
          <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg shadow-primary/5 rounded-xl">
            <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/5 to-transparent rounded-t-xl">
              <div className="flex items-start gap-4">
                {/* Portrait */}
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
                    {!isEditing ? (
                      <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => setIsEditing(true)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit Character
                      </Button>
                    ) : (
                      <div className="flex gap-1.5">
                        <Button size="sm" className="flex-1" onClick={handleSave} disabled={isSaving || !firstName.trim() || !lastName.trim()}>
                          <Save className="w-4 h-4 mr-1" />
                          {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleCancelEdit} disabled={isSaving}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              {!isEditing ? (
                /* ── Read-only view ── */
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Occupation</span>
                    <p className="text-sm font-semibold text-right">{
                      character.occupation
                      || ((character as any).customData?.currentOccupation?.vocation)
                      || ((character.socialAttributes as any)?.currentOccupation)
                      || (character.retired ? 'Retired' : 'Not specified')
                    }</p>
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
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <p className="text-sm font-semibold text-right">{character.status || 'Active'}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Living</span>
                    <p className="text-sm font-semibold text-right">{(character.isAlive ?? true) ? 'Alive' : 'Deceased'}</p>
                  </div>
                </div>
              ) : (
                /* ── Edit form ── */
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">First Name *</Label>
                    <Input value={firstName} onChange={e => setFirstName(e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Last Name *</Label>
                    <Input value={lastName} onChange={e => setLastName(e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Middle Name</Label>
                    <Input value={middleName} onChange={e => setMiddleName(e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Suffix</Label>
                    <Input value={suffix} onChange={e => setSuffix(e.target.value)} placeholder="Jr., III" className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Maiden Name</Label>
                    <Input value={maidenName} onChange={e => setMaidenName(e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Gender *</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Birth Year</Label>
                    <Input type="number" value={birthYear || ''} onChange={e => setBirthYear(e.target.value ? parseInt(e.target.value) : null)} className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Occupation</Label>
                    <Input value={occupation} onChange={e => setOccupation(e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs">Current Location</Label>
                    <Input value={currentLocation} onChange={e => setCurrentLocation(e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Status</Label>
                    <Input value={status} onChange={e => setStatus(e.target.value)} placeholder="Active, Retired" className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Living Status</Label>
                    <Select value={isAlive ? 'alive' : 'deceased'} onValueChange={v => setIsAlive(v === 'alive')}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alive">Alive</SelectItem>
                        <SelectItem value="deceased">Deceased</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Delete button in edit mode */}
                  <div className="col-span-2 pt-2 border-t mt-2">
                    <Button variant="destructive" size="sm" className="w-full" onClick={() => setShowDeleteConfirm(true)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Character
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3D Model Preview */}
          <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Box className="w-4 h-4 text-primary" />
                3D Preview
              </CardTitle>
              <CardDescription className="text-xs">{currentModelName}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <CharacterModelPreview
                modelPath={npcModelPath}
                texturePath={textures[0]?.filePath}
                className="h-52"
              />
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">NPC Asset</Label>
                <Select
                  value={currentNpcModel?.key || 'default'}
                  onValueChange={handleNpcModelChange}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select NPC model" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUNDLED_NPC_MODELS.map(model => (
                      <SelectItem key={model.key} value={model.key}>{model.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Personality */}
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
                        onClick={() => { if (relatedCharacter) onViewCharacter(relatedCharacter); }}
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
        </TabsContent>

        {/* ── TRUTH TAB ── */}
        <TabsContent value="truth" className="space-y-4 mt-4">
          <ScrollArea className="h-[500px]">
            {truths.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No Truths yet</p>
                <p className="text-sm mt-2">Add character truths in the Truth tab</p>
              </div>
            ) : (
              <div className="space-y-3">
                {truths
                  .sort((a, b) => b.timestep - a.timestep)
                  .map((entry) => (
                  <Card key={entry.id} className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{entry.title}</h4>
                          <Badge variant="outline" className="text-xs">{entry.entryType}</Badge>
                          {(entry.source === 'imported_ensemble' || entry.source === 'imported_ensemble_history') && (
                            <Badge variant="secondary" className="text-xs">Imported</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span className="font-mono">t={entry.timestep}</span>
                            {entry.timestepDuration && entry.timestepDuration > 1 && (
                              <span>({entry.timestepDuration} steps)</span>
                            )}
                          </div>
                          {(entry.timeYear || entry.timeSeason) && (
                            <>
                              {entry.timeYear && <span>Year {entry.timeYear}</span>}
                              {entry.timeSeason && <span className="capitalize">{entry.timeSeason}</span>}
                            </>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{entry.content}</p>
                        {entry.tags && entry.tags.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {entry.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        {/* ── ASSETS TAB ── */}
        <TabsContent value="assets" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Character Visual Assets</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAssetBrowser(true)}>
                <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
                Browse
              </Button>
              <Button size="sm" onClick={() => setShowAssetGenerator(true)}>
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Generate
              </Button>
            </div>
          </div>

          {visualAssets.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">No visual assets yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate a portrait or upload custom character art
                </p>
                <Button onClick={() => setShowAssetGenerator(true)}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Character Portrait
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {visualAssets.map((asset: any) => (
                <Card key={asset.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative aspect-square">
                      <img
                        src={`/${asset.filePath}`}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="text-xs">
                          {asset.assetType.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium truncate">{asset.name}</p>
                      {asset.generationProvider && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <Sparkles className="h-3 w-3" />
                          {asset.generationProvider}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Asset Generator Dialog */}
      <VisualAssetGeneratorDialog
        open={showAssetGenerator}
        onOpenChange={setShowAssetGenerator}
        entityType="character"
        entityId={character.id}
        entityName={`${character.firstName} ${character.lastName}`}
        assetType="character_portrait"
        onAssetGenerated={() => {
          queryClient.invalidateQueries({ queryKey: ['/api/assets/character', character.id] });
        }}
      />

      {/* Asset Browser Dialog */}
      <AssetBrowserDialog
        open={showAssetBrowser}
        onOpenChange={setShowAssetBrowser}
        entityType="character"
        entityId={character.id}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Character?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{character.firstName} {character.lastName}</strong>?
              This will permanently remove the character and all associated data.
              <p className="mt-2 text-destructive font-semibold">This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Character
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
