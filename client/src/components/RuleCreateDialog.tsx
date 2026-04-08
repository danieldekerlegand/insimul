import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Plus, Lightbulb, RefreshCw, AlertTriangle, BookOpen, X } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import type { Citation } from '@shared/schema';

interface RuleCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worldId: string;
  onCreateBlank: (sourceFormat: string, isBase: boolean) => void;
  onGenerateWithAI: (prompt: string, sourceFormat: string, bulkCreate: boolean, isBase: boolean, citations: Citation[]) => void;
  isGenerating?: boolean;
  onSuccess?: () => void;
}

export function RuleCreateDialog({
  open,
  onOpenChange,
  worldId,
  onCreateBlank,
  onGenerateWithAI,
  isGenerating = false,
  onSuccess,
}: RuleCreateDialogProps) {
  const [sourceFormat, setSystemType] = useState('insimul');
  const [aiPrompt, setAiPrompt] = useState('');
  const [bulkCreate, setBulkCreate] = useState(false);
  const [isBaseResource, setIsBaseResource] = useState(false);
  const [ruleType, setRuleType] = useState<'trigger' | 'volition' | 'genealogy' | 'trait'>('trigger');
  const [citations, setCitations] = useState<Citation[]>([]);
  const { toast } = useToast();

  // Regenerate state
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  const handleRegenerate = async () => {
    setShowRegenerateConfirm(false);
    setIsRegenerating(true);
    try {
      const res = await fetch(`/api/worlds/${worldId}/rules/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || 'Failed to regenerate rules');
      }

      const data = await res.json();
      toast({
        title: 'Rules Regenerated',
        description: `Deleted ${data.deleted} rules, created ${data.created} new rules`,
      });
      onSuccess?.();
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

  const handleCreateBlank = () => {
    onCreateBlank(sourceFormat, isBaseResource);
    onOpenChange(false);
    setAiPrompt('');
    setIsBaseResource(false);
  };

  const handleGenerateAI = () => {
    if (!aiPrompt.trim()) {
      toast({
        title: 'Prompt Required',
        description: 'Please enter a description for the AI to generate rules',
        variant: 'destructive'
      });
      return;
    }

    // Enhance prompt with bulk generation parameters
    let enhancedPrompt = aiPrompt;
    if (bulkCreate) {
      // Parse numbered/bulleted list items from the prompt
      const lines = aiPrompt.split('\n').map(l => l.trim()).filter(Boolean);
      const listItems = lines.filter(l => /^(\d+[\.\)]\s*|-\s*|\*\s*)/.test(l));
      const count = listItems.length > 0 ? listItems.length : lines.length;
      enhancedPrompt = `Generate ${count} ${ruleType} rules, one for each item in the following list:\n${aiPrompt}`;
    }

    onGenerateWithAI(enhancedPrompt, sourceFormat, bulkCreate, isBaseResource, citations);
    // Don't close dialog yet - wait for generation to complete
    setAiPrompt('');
    setIsBaseResource(false);
    setCitations([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Rule
          </DialogTitle>
          <DialogDescription>
            Choose how you want to create your rule. Optionally mark it as a base resource for global availability.
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
            {/* Base Resource Checkbox */}
            <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <input
                id="is-base-resource-manual"
                type="checkbox"
                checked={isBaseResource}
                onChange={(e) => setIsBaseResource(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <Label htmlFor="is-base-resource-manual" className="cursor-pointer text-sm">
                <strong>Create as Base Resource</strong> (global, available to all worlds)
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="blank-system-type">System Type</Label>
              <Select value={sourceFormat} onValueChange={setSystemType}>
                <SelectTrigger id="blank-system-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="insimul">Insimul</SelectItem>
                  <SelectItem value="ensemble">Ensemble</SelectItem>
                  <SelectItem value="kismet">Kismet</SelectItem>
                  <SelectItem value="tott">Talk of the Town</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <h4 className="font-medium mb-2">What you'll get:</h4>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>• A new rule file with example template</li>
                <li>• Pre-filled with {sourceFormat} syntax structure</li>
                <li>• Ready to customize for your specific needs</li>
              </ul>
            </div>

            <Button onClick={handleCreateBlank} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Create {isBaseResource ? 'Base' : ''} Rule
            </Button>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4 mt-4">
            {/* Base Resource Checkbox */}
            <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <input
                id="is-base-resource-ai"
                type="checkbox"
                checked={isBaseResource}
                onChange={(e) => setIsBaseResource(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <Label htmlFor="is-base-resource-ai" className="cursor-pointer text-sm">
                <strong>Create as Base Resource</strong> (global, available to all worlds)
              </Label>
            </div>

            {/* Bulk Generation Toggle */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Bulk Generation</Label>
                    <p className="text-sm text-muted-foreground">
                      {bulkCreate
                        ? 'List multiple rules below — one will be generated for each item'
                        : 'Generate a single rule from your description'}
                    </p>
                  </div>
                  <Switch
                    checked={bulkCreate}
                    onCheckedChange={setBulkCreate}
                  />
                </div>
              </CardContent>
            </Card>

            {/* AI Prompt */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Rule Description
                </CardTitle>
                <CardDescription>
                  {bulkCreate
                    ? 'List each rule you want to generate. Use a numbered list or bullet points — one rule will be created per item.'
                    : 'Describe the rule you want to generate. Be specific about the domain and behavior.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Prompt</Label>
                  <Textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder={bulkCreate
                      ? "1. Characters with high ambition seek promotion when employed\n2. Merchants lower prices when inventory is high\n3. NPCs visit the tavern in the evening if they have no other obligations\n4. Rivals spread rumors about each other when trust is low"
                      : "e.g., Create rules for noble succession and inheritance in a medieval kingdom..."}
                    className={bulkCreate ? "min-h-[180px]" : "min-h-[120px]"}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>System Type</Label>
                    <Select value={sourceFormat} onValueChange={setSystemType}>
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
                    <Select value={ruleType} onValueChange={(value: any) => setRuleType(value)}>
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

            {/* Citations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Citations
                </CardTitle>
                <CardDescription>
                  Add references that should inform the generated rules. The AI will ground its output in these sources.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {citations.map((citation, idx) => (
                  <div key={idx} className="relative rounded-lg border p-3 space-y-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => setCitations(prev => prev.filter((_, i) => i !== idx))}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    <div className="space-y-1">
                      <Label className="text-xs">Title</Label>
                      <Input
                        value={citation.title}
                        onChange={(e) => setCitations(prev => prev.map((c, i) => i === idx ? { ...c, title: e.target.value } : c))}
                        placeholder="e.g., Chitimacha Grammar §4.2"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Reference Content</Label>
                      <Textarea
                        value={citation.content || ''}
                        onChange={(e) => setCitations(prev => prev.map((c, i) => i === idx ? { ...c, content: e.target.value } : c))}
                        placeholder="Paste the relevant text from this source..."
                        className="min-h-[60px] text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">URL (optional)</Label>
                      <Input
                        value={citation.url || ''}
                        onChange={(e) => setCitations(prev => prev.map((c, i) => i === idx ? { ...c, url: e.target.value } : c))}
                        placeholder="https://..."
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCitations(prev => [...prev, { title: '' }])}
                  className="w-full"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Citation
                </Button>
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
                      onClick={() => setAiPrompt(example)}
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
              onClick={handleGenerateAI}
              className="w-full"
              size="lg"
              disabled={isGenerating || !aiPrompt.trim()}
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Generating {bulkCreate ? `${isBaseResource ? 'Base ' : ''}Rules` : `${isBaseResource ? 'Base ' : ''}Rule`}...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate {bulkCreate ? `${isBaseResource ? 'Base ' : ''}Rules` : `${isBaseResource ? 'Base ' : ''}Rule`}
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="regenerate" className="space-y-4 mt-4">
            <Card className="border-destructive/50 bg-destructive/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Wipe &amp; Regenerate All Rules
                </CardTitle>
                <CardDescription>
                  This will permanently delete all existing world rules and regenerate
                  them using AI. Base rules are not affected.
                  Requires a configured Gemini API key.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-destructive/10 rounded-lg text-sm text-destructive">
                  <strong>Warning:</strong> This action cannot be undone. All custom
                  rules and manually created rules for this world will be lost.
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
                      Regenerating Rules...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Wipe &amp; Regenerate All Rules
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
                    This will delete all world rules and regenerate them using AI.
                    Base rules will not be affected. This action cannot be undone.
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
