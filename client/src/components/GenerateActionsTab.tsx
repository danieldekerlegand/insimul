import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Loader2, Sparkles, Zap, Target, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GenerateActionsTabProps {
  worldId: string;
}

export function GenerateActionsTab({ worldId }: GenerateActionsTabProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState('social');
  const [numActions, setNumActions] = useState(5);
  const [useBulk, setUseBulk] = useState(true);
  const [duration, setDuration] = useState(1);
  const [difficulty, setDifficulty] = useState(0.5);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Prompt Required',
        description: 'Please describe the actions you want to generate',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    try {
      const actionPrompt = `Generate ${numActions} ${category} actions for: ${prompt}. Each action should have a clear verb, target type, duration (${duration} time units), and difficulty (${difficulty}). Include prerequisites and effects where appropriate.`;

      // For now, create placeholder actions that will be enhanced by backend
      const actions = [];
      const baseVerbs = ['interact', 'perform', 'execute', 'engage', 'conduct'];
      
      for (let i = 0; i < (useBulk ? numActions : 1); i++) {
        const actionName = `${category}_action_${Date.now()}_${i}`;
        const verb = baseVerbs[i % baseVerbs.length];
        
        const actionData = {
          worldId,
          name: actionName,
          description: `${prompt} - Action ${i + 1}`,
          actionType: category,
          category,
          duration,
          difficulty,
          targetType: 'other',
          prerequisites: [],
          effects: [],
          verbPresent: verb,
          verbPast: verb + 'ed',
          verbGerund: verb + 'ing',
          tags: [category, 'generated'],
          isActive: true
        };

        const createResponse = await fetch('/api/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(actionData)
        });

        if (createResponse.ok) {
          actions.push(await createResponse.json());
        }
      }

      toast({
        title: 'Actions Generated',
        description: `Successfully created ${actions.length} action${actions.length > 1 ? 's' : ''}`
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
          <Zap className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Generate Actions</h2>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Action Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Action Description
              </CardTitle>
              <CardDescription>
                Describe the type of actions you want characters to be able to perform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Prompt</Label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Create actions for characters to trade goods, negotiate prices, and complete business transactions..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="leisure">Leisure</SelectItem>
                    <SelectItem value="combat">Combat</SelectItem>
                    <SelectItem value="trade">Trade</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="magic">Magic</SelectItem>
                    <SelectItem value="crafting">Crafting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Action Parameters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Action Parameters
              </CardTitle>
              <CardDescription>
                Set default parameters for generated actions
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
                  <Label>Number of Actions: {numActions}</Label>
                  <Slider
                    value={[numActions]}
                    onValueChange={([v]) => setNumActions(v)}
                    min={1}
                    max={20}
                    step={1}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Duration (time units): {duration}
                </Label>
                <Slider
                  value={[duration]}
                  onValueChange={([v]) => setDuration(v)}
                  min={0.5}
                  max={10}
                  step={0.5}
                />
              </div>

              <div className="space-y-2">
                <Label>Difficulty (0-1): {difficulty.toFixed(2)}</Label>
                <Slider
                  value={[difficulty * 100]}
                  onValueChange={([v]) => setDifficulty(v / 100)}
                  min={0}
                  max={100}
                  step={5}
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
                  'Create social actions for characters to make friends, gossip, and form alliances',
                  'Generate work actions for different professions like blacksmith, merchant, farmer',
                  'Create leisure actions for entertainment, sports, and hobbies',
                  'Generate combat actions for different fighting styles and weapons',
                  'Create magic actions for casting spells and performing rituals'
                ].map((example, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="w-full text-left justify-start h-auto py-2 px-3"
                    onClick={() => setPrompt(example)}
                  >
                    <Zap className="w-4 h-4 mr-2 flex-shrink-0" />
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
                Generating {useBulk ? `${numActions} Actions` : 'Action'}...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate {useBulk ? `${numActions} Actions` : 'Action'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
