import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Loader2, Sparkles, Scroll, FileCode, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { SystemType } from '@/lib/unified-syntax';

interface GenerateRulesTabProps {
  worldId: string;
}

export function GenerateRulesTab({ worldId }: GenerateRulesTabProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [systemType, setSystemType] = useState<SystemType>('insimul');
  const [ruleType, setRuleType] = useState<'trigger' | 'volition' | 'genealogy' | 'trait'>('trigger');
  const [numRules, setNumRules] = useState(5);
  const [useBulk, setUseBulk] = useState(true);
  const [priority, setPriority] = useState(5);
  const [tags, setTags] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Prompt Required',
        description: 'Please describe the rules you want to generate',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Generate with AI
      const generateResponse = await fetch('/api/generate-rule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${prompt}. Generate ${numRules} ${ruleType} rules for ${systemType} format. Priority: ${priority}. Tags: ${tags || 'none'}`,
          systemType,
          bulkCreate: useBulk
        })
      });

      if (!generateResponse.ok) {
        const errorText = await generateResponse.text();
        throw new Error(errorText);
      }

      const { rule, isBulk } = await generateResponse.json();

      // Create the rules
      if (isBulk && typeof rule === 'string') {
        const ruleStrings = rule.split(/\n\n+/).filter(r => r.trim());
        let successCount = 0;

        for (let i = 0; i < ruleStrings.length; i++) {
          const ruleContent = ruleStrings[i].trim();
          if (!ruleContent) continue;

          const nameMatch = ruleContent.match(/rule\s+(\w+)/);
          const ruleName = nameMatch ? nameMatch[1] : `Generated Rule ${i + 1}`;

          const createRes = await fetch('/api/rules', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              worldId,
              name: ruleName,
              content: ruleContent,
              systemType,
              ruleType,
              priority,
              tags: tags.split(',').map(t => t.trim()).filter(Boolean),
              isActive: true
            })
          });

          if (createRes.ok) successCount++;
        }

        toast({
          title: 'Rules Generated',
          description: `Successfully created ${successCount}/${ruleStrings.length} rules`
        });
      } else {
        // Single rule
        const ruleContent = typeof rule === 'string' ? rule : String(rule);
        const nameMatch = ruleContent.match(/rule\s+(\w+)/);
        const ruleName = nameMatch ? nameMatch[1] : `Generated: ${prompt.substring(0, 30)}`;

        const createResponse = await fetch('/api/rules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            worldId,
            name: ruleName,
            content: ruleContent,
            systemType,
            ruleType,
            priority,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            isActive: true
          })
        });

        if (createResponse.ok) {
          toast({
            title: 'Rule Generated',
            description: 'Successfully created AI-generated rule'
          });
        }
      }

      // Reset form
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
          <Scroll className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Generate Rules with AI</h2>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* AI Prompt */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                Rule Description
              </CardTitle>
              <CardDescription>
                Describe the rules you want to generate. Be specific about the domain and behavior.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Prompt</Label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Create rules for noble succession and inheritance in a medieval kingdom..."
                  className="min-h-[120px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>System Type</Label>
                  <Select value={systemType} onValueChange={(v: SystemType) => setSystemType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="insimul">Insimul</SelectItem>
                      <SelectItem value="ensemble">Ensemble JSON</SelectItem>
                      <SelectItem value="kismet">Kismet Prolog</SelectItem>
                      <SelectItem value="tott">Talk of the Town JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Rule Type</Label>
                  <Select value={ruleType} onValueChange={(v: any) => setRuleType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trigger">Trigger</SelectItem>
                      <SelectItem value="volition">Volition</SelectItem>
                      <SelectItem value="genealogy">Genealogy</SelectItem>
                      <SelectItem value="trait">Trait</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generation Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-primary" />
                Generation Settings
              </CardTitle>
              <CardDescription>
                Configure how many rules to generate and their properties
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
                  <Label>Number of Rules: {numRules}</Label>
                  <Slider
                    value={[numRules]}
                    onValueChange={([v]) => setNumRules(v)}
                    min={1}
                    max={20}
                    step={1}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Priority: {priority}</Label>
                <Slider
                  value={[priority]}
                  onValueChange={([v]) => setPriority(v)}
                  min={1}
                  max={10}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Tags (comma-separated)</Label>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g., nobility, inheritance, succession"
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
                  'Create rules for noble succession where the eldest child inherits titles and lands',
                  'Generate social interaction rules for characters meeting at different locations',
                  'Create genealogy rules for tracking family relationships across generations',
                  'Generate volition rules for characters deciding whether to get married',
                  'Create trait rules for personality development based on life experiences'
                ].map((example, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="w-full text-left justify-start h-auto py-2 px-3"
                    onClick={() => setPrompt(example)}
                  >
                    <Sparkles className="w-4 h-4 mr-2 flex-shrink-0" />
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
                Generating {useBulk ? `${numRules} Rules` : 'Rule'}...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate {useBulk ? `${numRules} Rules` : 'Rule'} with AI
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
