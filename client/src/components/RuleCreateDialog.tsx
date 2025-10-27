import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Sparkles, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RuleCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worldId: string;
  onCreateBlank: (systemType: string) => void;
  onGenerateWithAI: (prompt: string, systemType: string, bulkCreate: boolean) => void;
  isGenerating?: boolean;
}

export function RuleCreateDialog({
  open,
  onOpenChange,
  worldId,
  onCreateBlank,
  onGenerateWithAI,
  isGenerating = false
}: RuleCreateDialogProps) {
  const [systemType, setSystemType] = useState('insimul');
  const [aiPrompt, setAiPrompt] = useState('');
  const [bulkCreate, setBulkCreate] = useState(false);
  const { toast } = useToast();

  const handleCreateBlank = () => {
    onCreateBlank(systemType);
    onOpenChange(false);
    setAiPrompt('');
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

    onGenerateWithAI(aiPrompt, systemType, bulkCreate);
    // Don't close dialog yet - wait for generation to complete
    setAiPrompt('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Rule
          </DialogTitle>
          <DialogDescription>
            Choose how you want to create your rule
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="blank" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="blank">
              <FileText className="w-4 h-4 mr-2" />
              Blank Rule
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Generator
            </TabsTrigger>
          </TabsList>

          <TabsContent value="blank" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="blank-system-type">System Type</Label>
              <Select value={systemType} onValueChange={setSystemType}>
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
                <li>• Pre-filled with {systemType} syntax structure</li>
                <li>• Ready to customize for your specific needs</li>
              </ul>
            </div>

            <Button onClick={handleCreateBlank} className="w-full">
              <FileText className="w-4 h-4 mr-2" />
              Create Blank Rule
            </Button>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="ai-system-type">System Type</Label>
              <Select value={systemType} onValueChange={setSystemType}>
                <SelectTrigger id="ai-system-type">
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

            <div className="space-y-2">
              <Label htmlFor="ai-prompt">Describe the rule(s) you want to create</Label>
              <Textarea
                id="ai-prompt"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder={bulkCreate 
                  ? "Example: Create multiple rules for medieval social interactions including greetings, gift-giving, and formal court etiquette. Include rules for different social classes."
                  : "Example: Create a rule for noble succession where the eldest child inherits the title when a parent dies."}
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-slate-500">
                Be specific about the scenario, character types, and interactions you want to model.
              </p>
            </div>

            <div className="flex items-center space-x-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <Checkbox 
                id="bulk-create" 
                checked={bulkCreate}
                onCheckedChange={(checked) => setBulkCreate(checked as boolean)}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="bulk-create"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Bulk create multiple rules
                </label>
                <p className="text-xs text-slate-500">
                  Generate multiple related rules in a single file based on your instructions
                </p>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-start gap-2">
                <Sparkles className="w-5 h-5 text-purple-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-purple-700 dark:text-purple-300 mb-1">
                    AI-Powered Generation
                  </p>
                  <p className="text-purple-600 dark:text-purple-400">
                    {bulkCreate 
                      ? "The AI will generate multiple related rules in the selected format based on your instructions. All rules will be created in a single file."
                      : "The AI will analyze your description and generate a single rule in the selected format. You can edit it after creation."}
                  </p>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleGenerateAI} 
              className="w-full"
              disabled={isGenerating || !aiPrompt.trim()}
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate with AI
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
