import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Loader2, Sparkles, Target, Map, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GenerateQuestsTabProps {
  worldId: string;
}

export function GenerateQuestsTab({ worldId }: GenerateQuestsTabProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [questType, setQuestType] = useState('main');
  const [numQuests, setNumQuests] = useState(3);
  const [useBulk, setUseBulk] = useState(true);
  const [difficulty, setDifficulty] = useState(5);
  const [numSteps, setNumSteps] = useState(3);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Prompt Required',
        description: 'Please describe the quests you want to generate',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    try {
      const questPrompt = `Generate ${numQuests} ${questType} quests for: ${prompt}. Each quest should have ${numSteps} steps/objectives, difficulty level ${difficulty}/10, and include rewards and prerequisites.`;

      // Generate quests
      const quests = [];
      
      for (let i = 0; i < (useBulk ? numQuests : 1); i++) {
        const questName = `${prompt.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}_${i + 1}`;
        
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
          description: `${prompt} - Quest ${i + 1}`,
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

      setPrompt('');
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-4 border-b">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Generate Quests</h2>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">
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
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
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
                    onClick={() => setPrompt(example)}
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
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating {useBulk ? `${numQuests} Quests` : 'Quest'}...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate {useBulk ? `${numQuests} Quests` : 'Quest'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
