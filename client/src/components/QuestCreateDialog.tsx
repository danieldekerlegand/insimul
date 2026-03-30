import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Sparkles, Target, Map, Trophy, Zap, RefreshCw, AlertTriangle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface QuestCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worldId: string;
  onSuccess: () => void;
  children?: React.ReactNode;
}

export function QuestCreateDialog({ open, onOpenChange, worldId, onSuccess, children }: QuestCreateDialogProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Manual form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    questType: 'main',
    difficulty: 'intermediate',
    targetLanguage: '',
    experienceReward: 100,
    tags: '',
  });

  // AI generation state
  const [aiPrompt, setAiPrompt] = useState('');
  const [questType, setQuestType] = useState('main');
  const [numQuests, setNumQuests] = useState(3);
  const [useBulk, setUseBulk] = useState(false);
  const [difficulty, setDifficulty] = useState(5);
  const [numSteps, setNumSteps] = useState(3);

  // Regenerate state
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/quests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worldId,
          ...formData,
          status: 'available',
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
          objectives: [],
          rewards: { experience: formData.experienceReward },
          isActive: true
        })
      });

      if (res.ok) {
        toast({ title: 'Quest Created', description: `${formData.title} has been created` });
        setFormData({ title: '', description: '', questType: 'main', difficulty: 'intermediate', targetLanguage: '', experienceReward: 100, tags: '' });
        onSuccess();
        onOpenChange(false);
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        toast({ title: 'Error', description: errorData.error || errorData.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to create quest', variant: 'destructive' });
    }
  };

  const handleSeedAllTypes = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/worlds/${worldId}/quests/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'seed' }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || 'Failed to generate seed quests');
      }

      const data = await res.json();
      toast({
        title: 'Seed Quests Generated',
        description: `Created ${data.count} quests (one per objective type)`,
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: 'Prompt Required',
        description: 'Please describe the quests you want to generate',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    try {
      const questPrompt = `Generate ${numQuests} ${questType} quests for: ${aiPrompt}. Each quest should have ${numSteps} steps/objectives, difficulty level ${difficulty}/10, and include rewards and prerequisites.`;

      // Generate quests
      const quests = [];

      for (let i = 0; i < (useBulk ? numQuests : 1); i++) {
        const questName = `${aiPrompt.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}_${i + 1}`;

        // Generate quest steps
        const steps = [];
        for (let j = 0; j < numSteps; j++) {
          steps.push({
            order: j + 1,
            description: `Step ${j + 1}: Complete objective for ${questName}`,
            requirements: [],
            isCompleted: false
          });
        }

        const questData = {
          worldId,
          name: questName,
          description: `${aiPrompt} - Quest ${i + 1}`,
          questType,
          difficulty,
          status: 'available',
          objectives: steps,
          rewards: {
            experience: difficulty * 100,
            items: [],
            relationships: []
          },
          prerequisites: [],
          tags: [questType, 'generated'],
          isActive: true,
          isRepeatable: questType === 'daily' || questType === 'side',
          cooldown: questType === 'daily' ? 1 : 0
        };

        const createResponse = await fetch('/api/quests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(questData)
        });

        if (createResponse.ok) {
          quests.push(await createResponse.json());
        }
      }

      toast({
        title: 'Quests Generated',
        description: `Successfully created ${quests.length} quest${quests.length > 1 ? 's' : ''}`
      });

      setAiPrompt('');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    setShowRegenerateConfirm(false);
    setIsRegenerating(true);
    try {
      const res = await fetch(`/api/worlds/${worldId}/quests/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || 'Failed to regenerate quests');
      }

      const data = await res.json();
      toast({
        title: 'Quests Regenerated',
        description: `Deleted ${data.deleted} quests, created ${data.created} new quests`,
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Regeneration Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Create New Quest
          </DialogTitle>
          <DialogDescription>
            Choose how you want to create your quest
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manual">
              <Plus className="w-4 h-4 mr-2" />
              Manual
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Generator
            </TabsTrigger>
            <TabsTrigger value="regenerate">
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4 mt-4">
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Quest Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g., The Missing Merchant"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  placeholder="Describe the quest objectives and narrative..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="questType">Quest Type</Label>
                  <Select value={formData.questType} onValueChange={(v) => setFormData({ ...formData, questType: v })}>
                    <SelectTrigger id="questType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main">Main Story</SelectItem>
                      <SelectItem value="side">Side Quest</SelectItem>
                      <SelectItem value="daily">Daily Quest</SelectItem>
                      <SelectItem value="faction">Faction Quest</SelectItem>
                      <SelectItem value="personal">Personal Quest</SelectItem>
                      <SelectItem value="event">Event Quest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={formData.difficulty} onValueChange={(v) => setFormData({ ...formData, difficulty: v })}>
                    <SelectTrigger id="difficulty">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guildId">Guild</Label>
                  <Select value={(formData as any).guildId || ''} onValueChange={(v) => setFormData({ ...formData, guildId: v || undefined } as any)}>
                    <SelectTrigger id="guildId">
                      <SelectValue placeholder="No guild" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      <SelectItem value="marchands">Marchands (Commerce)</SelectItem>
                      <SelectItem value="artisans">Artisans (Crafting)</SelectItem>
                      <SelectItem value="conteurs">Conteurs (Reading)</SelectItem>
                      <SelectItem value="explorateurs">Explorateurs (Navigation)</SelectItem>
                      <SelectItem value="diplomates">Diplomates (Social)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guildTier">Guild Tier</Label>
                  <Select value={String((formData as any).guildTier ?? '')} onValueChange={(v) => setFormData({ ...formData, guildTier: v ? Number(v) : undefined } as any)}>
                    <SelectTrigger id="guildTier">
                      <SelectValue placeholder="No tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      <SelectItem value="0">Tier 0 - Join Quest</SelectItem>
                      <SelectItem value="1">Tier 1 - Apprenti</SelectItem>
                      <SelectItem value="2">Tier 2 - Compagnon</SelectItem>
                      <SelectItem value="3">Tier 3 - Grand Maitre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experienceReward">Experience Reward</Label>
                <Input
                  id="experienceReward"
                  type="number"
                  value={formData.experienceReward}
                  onChange={(e) => setFormData({ ...formData, experienceReward: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g., mystery, social, investigation"
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Quest</Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4 mt-4">
            {/* Seed All Types — one quest per game mechanic */}
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Seed All Quest Types
                </CardTitle>
                <CardDescription>
                  Generate one playable quest for every game mechanic: talk to NPCs, collect items,
                  visit locations, deliver items, translate phrases, listen to stories, and more.
                  Ensures all 18 objective types are represented.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleSeedAllTypes}
                  disabled={isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Zap className="w-4 h-4 mr-2 animate-spin" />
                      Seeding All Types...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Generate 18 Seed Quests (One Per Type)
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Quest Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Quest Description
                </CardTitle>
                <CardDescription>
                  Describe the narrative and objectives for the quests you want to generate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Prompt</Label>
                  <Textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g., Create a quest chain about investigating mysterious disappearances in a medieval town..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Quest Type</Label>
                  <Select value={questType} onValueChange={setQuestType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main">Main Story</SelectItem>
                      <SelectItem value="side">Side Quest</SelectItem>
                      <SelectItem value="daily">Daily Quest</SelectItem>
                      <SelectItem value="faction">Faction Quest</SelectItem>
                      <SelectItem value="personal">Personal Quest</SelectItem>
                      <SelectItem value="event">Event Quest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Quest Parameters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="w-5 h-5 text-primary" />
                  Quest Parameters
                </CardTitle>
                <CardDescription>
                  Configure quest structure and difficulty
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Bulk Generation</Label>
                  <Switch
                    checked={useBulk}
                    onCheckedChange={setUseBulk}
                  />
                </div>

                {useBulk && (
                  <div className="space-y-2">
                    <Label>Number of Quests: {numQuests}</Label>
                    <Slider
                      value={[numQuests]}
                      onValueChange={([v]) => setNumQuests(v)}
                      min={1}
                      max={10}
                      step={1}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Steps/Objectives per Quest: {numSteps}</Label>
                  <Slider
                    value={[numSteps]}
                    onValueChange={([v]) => setNumSteps(v)}
                    min={1}
                    max={10}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Difficulty (1-10): {difficulty}</Label>
                  <Slider
                    value={[difficulty]}
                    onValueChange={([v]) => setDifficulty(v)}
                    min={1}
                    max={10}
                    step={1}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Example Prompts */}
            <Card>
              <CardHeader>
                <CardTitle>Example Prompts</CardTitle>
                <CardDescription>Click to use these example prompts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    'Create a quest to investigate mysterious disappearances in the village',
                    'Generate a quest chain about rising through the ranks of a merchant guild',
                    'Create daily quests for gathering resources and helping townsfolk',
                    'Generate a personal quest about uncovering family secrets and lost heritage',
                    'Create faction quests for gaining favor with different noble houses'
                  ].map((example, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      className="w-full text-left justify-start h-auto py-2 px-3"
                      onClick={() => setAiPrompt(example)}
                    >
                      <Trophy className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{example}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Button
              onClick={handleGenerateWithAI}
              disabled={isGenerating || !aiPrompt.trim()}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Generating {useBulk ? `${numQuests} Quests` : 'Quest'}...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate {useBulk ? `${numQuests} Quests` : 'Quest'}
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="regenerate" className="space-y-4 mt-4">
            <Card className="border-destructive/50 bg-destructive/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Wipe &amp; Regenerate All Quests
                </CardTitle>
                <CardDescription>
                  This will permanently delete all existing quests for this world
                  and regenerate them from scratch using the seed quest generator.
                  This includes one quest per objective type plus assessment quests
                  for language-learning worlds.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-destructive/10 rounded-lg text-sm text-destructive">
                  <strong>Warning:</strong> This action cannot be undone. All quest progress,
                  custom quests, and manually created quests will be lost.
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setShowRegenerateConfirm(true)}
                  disabled={isRegenerating}
                  className="w-full"
                  size="lg"
                >
                  {isRegenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Regenerating Quests...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Wipe &amp; Regenerate All Quests
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <AlertDialog open={showRegenerateConfirm} onOpenChange={setShowRegenerateConfirm}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete all quests for this world and regenerate them.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRegenerate} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Yes, Regenerate
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
