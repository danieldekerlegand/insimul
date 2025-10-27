import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { SystemType, InsimulRuleCompiler } from '@/lib/unified-syntax';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worldId: string;
  onImportComplete: () => void;
}

export function ImportDialog({
  open,
  onOpenChange,
  worldId,
  onImportComplete
}: ImportDialogProps) {
  const [importFormat, setImportFormat] = useState<SystemType>('insimul');
  const [importContent, setImportContent] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importType, setImportType] = useState<'rules' | 'characters' | 'actions' | 'truth'>('rules');
  const [parseResults, setParseResults] = useState<{ rules: number; characters: number; actions: number; truths: number } | null>(null);
  const { toast } = useToast();
  const ruleCompiler = new InsimulRuleCompiler();

  const formatOptions = [
    { value: 'insimul', label: 'Insimul Format', description: 'Unified narrative simulation syntax' },
    { value: 'ensemble', label: 'Ensemble JSON', description: 'Social simulation rules as JSON' },
    { value: 'kismet', label: 'Kismet Prolog', description: 'Prolog-style social rules' },
    { value: 'tott', label: 'Talk of the Town Python', description: 'Python classes and methods' }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportContent(content);
      
      // Auto-detect format and type from file name and content
      const fileName = file.name.toLowerCase();
      const extension = fileName.split('.').pop();
      
      // Detect type from filename
      if (fileName.includes('cast') || fileName.includes('character')) {
        setImportType('characters');
        setImportFormat('ensemble');
      } else if (fileName.includes('action')) {
        setImportType('actions');
        setImportFormat('ensemble');
      } else if (fileName.includes('history') || fileName.includes('truth')) {
        setImportType('truth');
        setImportFormat('ensemble');
      } else {
        setImportType('rules');
        // Auto-detect format from file extension
        if (extension === 'insimul') setImportFormat('insimul');
        else if (extension === 'json' || extension === 'ens') setImportFormat('ensemble');
        else if (extension === 'lp' || extension === 'kis') setImportFormat('kismet');
        else if (extension === 'py') setImportFormat('tott');
      }
    };
    reader.readAsText(file);
  };

  const handlePreview = () => {
    try {
      let results = { rules: 0, characters: 0, actions: 0, truths: 0 };

      if (importType === 'characters') {
        // Parse Ensemble cast file
        const castData = JSON.parse(importContent);
        const characterNames = Object.keys(castData);
        results.characters = characterNames.length;

        toast({
          title: 'Content Parsed',
          description: `Found ${results.characters} characters ready to import`
        });
      } else if (importType === 'actions') {
        // Parse Ensemble actions file
        const actionsData = JSON.parse(importContent);
        results.actions = actionsData.actions?.length || 0;

        toast({
          title: 'Content Parsed',
          description: `Found ${results.actions} actions ready to import`
        });
      } else if (importType === 'truth') {
        // Parse Ensemble history/truth file
        const truthData = JSON.parse(importContent);

        // Handle Ensemble history format: { history: [{ pos: 0, data: [...] }] }
        let truthCount = 0;
        if (truthData.history && Array.isArray(truthData.history)) {
          // Count total data items across all history entries
          truthCount = truthData.history.reduce((sum: number, entry: any) => {
            return sum + (Array.isArray(entry.data) ? entry.data.length : 0);
          }, 0);
        } else if (Array.isArray(truthData)) {
          truthCount = truthData.length;
        }

        results.truths = truthCount;

        toast({
          title: 'Content Parsed',
          description: `Found ${results.truths} Truths ready to import`
        });
      } else {
        // Parse rules
        const parsedRules = ruleCompiler.compile(importContent, importFormat);
        results.rules = parsedRules.length;
        
        toast({
          title: 'Content Parsed',
          description: `Found ${results.rules} rules ready to import`
        });
      }
      
      setParseResults(results);
    } catch (error) {
      toast({
        title: 'Parse Error',
        description: error instanceof Error ? error.message : 'Failed to parse content',
        variant: 'destructive'
      });
    }
  };

  const handleImport = async () => {
    if (!importContent.trim()) {
      toast({
        title: 'No Content',
        description: 'Please paste or upload content to import',
        variant: 'destructive'
      });
      return;
    }

    setIsImporting(true);

    try {
      if (importType === 'characters') {
        // Import Ensemble cast file
        const castData = JSON.parse(importContent);
        const characterNames = Object.keys(castData);
        
        if (characterNames.length === 0) {
          throw new Error('No characters found in the cast file');
        }

        // Create characters in the database
        let successCount = 0;
        for (const fullName of characterNames) {
          const nameParts = fullName.split(' ');
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(' ') || nameParts[0];
          
          const response = await fetch('/api/characters', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              worldId: worldId,
              firstName: firstName,
              lastName: lastName,
              gender: 'unknown',
              age: null
            })
          });

          if (response.ok) successCount++;
        }

        toast({
          title: 'Import Successful',
          description: `Imported ${successCount} of ${characterNames.length} characters`
        });

      } else if (importType === 'actions') {
        // Import Ensemble actions file
        const actionsData = JSON.parse(importContent);
        const actions = actionsData.actions || [];
        
        if (actions.length === 0) {
          throw new Error('No actions found in the file');
        }

        // Create actions in the database
        let successCount = 0;
        for (const action of actions) {
          const response = await fetch('/api/actions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              worldId: worldId,
              name: action.name || action.displayName || 'Unnamed Action',
              description: action.displayName || action.name,
              actionType: 'social',
              systemType: 'ensemble',
              prerequisites: action.conditions || null,
              effects: action.effects || null,
              customData: action
            })
          });

          if (response.ok) successCount++;
        }

        toast({
          title: 'Import Successful',
          description: `Imported ${successCount} of ${actions.length} actions`
        });

      } else if (importType === 'truth') {
        // Import Ensemble history/truth file
        const truthData = JSON.parse(importContent);

        // Validate that we have truth data in some format
        const hasHistoryFormat = truthData.history && Array.isArray(truthData.history);
        const hasDirectArray = Array.isArray(truthData);

        if (!hasHistoryFormat && !hasDirectArray) {
          throw new Error('No Truths found in the file');
        }

        const response = await fetch(`/api/worlds/${worldId}/truth/import-ensemble`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: importContent })
        });

        if (!response.ok) {
          throw new Error('Failed to import Truths');
        }

        const result = await response.json();

        toast({
          title: 'Import Successful',
          description: `Imported ${result.count} Truths`
        });

      } else {
        // Import rules - create individual rules instead of a rule file
        const parsedRules = ruleCompiler.compile(importContent, importFormat);

        if (parsedRules.length === 0) {
          throw new Error('No valid rules found in the content');
        }

        // Create individual rules in the database
        let successCount = 0;
        for (const parsedRule of parsedRules) {
          try {
            const response = await fetch('/api/rules', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                worldId: worldId,
                name: parsedRule.name,
                content: importContent, // Store original content for reference
                systemType: importFormat,
                ruleType: parsedRule.ruleType || 'trigger',
                priority: parsedRule.priority || 5,
                likelihood: parsedRule.likelihood || 1.0,
                conditions: parsedRule.conditions || [],
                effects: parsedRule.effects || [],
                tags: parsedRule.tags || [],
                dependencies: parsedRule.dependencies || [],
                isActive: true,
                isCompiled: false,
                compiledOutput: {}
              })
            });

            if (response.ok) successCount++;
          } catch (error) {
            console.error(`Failed to import rule ${parsedRule.name}:`, error);
          }
        }

        toast({
          title: 'Import Successful',
          description: `Imported ${successCount} of ${parsedRules.length} rules as individual entries`
        });
      }

      // Reset and close
      setImportContent('');
      setParseResults(null);
      onImportComplete();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Import Failed',
        description: error instanceof Error ? error.message : 'Failed to import content',
        variant: 'destructive'
      });
    } finally {
      setIsImporting(false);
    }
  };

  const selectedFormat = formatOptions.find(option => option.value === importFormat);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto" data-testid="import-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Rules & Data
          </DialogTitle>
          <DialogDescription>
            Import rules, characters, and actions from various formats (Insimul, Ensemble, Kismet, Talk of the Town).
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Import Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="import-type">Import Type</Label>
            <Select value={importType} onValueChange={(value: 'rules' | 'characters' | 'actions' | 'truth') => setImportType(value)} data-testid="select-import-type">
              <SelectTrigger>
                <SelectValue placeholder="Select what to import" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rules">
                  <div className="flex flex-col">
                    <span className="font-medium">Rules</span>
                    <span className="text-sm text-muted-foreground">Social simulation rules</span>
                  </div>
                </SelectItem>
                <SelectItem value="characters">
                  <div className="flex flex-col">
                    <span className="font-medium">Characters (Cast)</span>
                    <span className="text-sm text-muted-foreground">Ensemble cast file</span>
                  </div>
                </SelectItem>
                <SelectItem value="actions">
                  <div className="flex flex-col">
                    <span className="font-medium">Actions</span>
                    <span className="text-sm text-muted-foreground">Ensemble actions file</span>
                  </div>
                </SelectItem>
                <SelectItem value="truth">
                  <div className="flex flex-col">
                    <span className="font-medium">Truth (History)</span>
                    <span className="text-sm text-muted-foreground">Ensemble history/truth file</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Import Format Selection (only for rules) */}
          {importType === 'rules' && (
            <div className="space-y-2">
              <Label htmlFor="import-format">Import Format</Label>
              <Select value={importFormat} onValueChange={(value: SystemType) => setImportFormat(value)} data-testid="select-import-format">
                <SelectTrigger>
                  <SelectValue placeholder="Select import format" />
                </SelectTrigger>
                <SelectContent>
                  {formatOptions.map(option => (
                    <SelectItem key={option.value} value={option.value} data-testid={`format-option-${option.value}`}>
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-sm text-muted-foreground">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedFormat && (
                <p className="text-sm text-muted-foreground">{selectedFormat.description}</p>
              )}
            </div>
          )}

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Upload File</Label>
            <input
              id="file-upload"
              type="file"
              accept=".insimul,.json,.ens,.lp,.kis,.py,.txt"
              onChange={handleFileUpload}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                dark:file:bg-blue-950 dark:file:text-blue-300"
              data-testid="input-file-upload"
            />
          </div>

          {/* Content Input */}
          <div className="space-y-2">
            <Label htmlFor="import-content">Or Paste Content</Label>
            <Textarea
              id="import-content"
              value={importContent}
              onChange={(e) => setImportContent(e.target.value)}
              placeholder={`Paste your ${importFormat} format rules here...`}
              className="min-h-[300px] font-mono text-sm"
              data-testid="textarea-import-content"
            />
          </div>

          {/* Parse Results */}
          {parseResults && (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                Ready to import: <strong>{parseResults.rules} rules</strong>
                {parseResults.characters > 0 && `, ${parseResults.characters} characters`}
                {parseResults.actions > 0 && `, ${parseResults.actions} actions`}
                {parseResults.truths > 0 && `, ${parseResults.truths} Truths`}
              </AlertDescription>
            </Alert>
          )}

          {/* Import Actions */}
          <div className="flex gap-3">
            <Button 
              onClick={handlePreview} 
              variant="outline"
              disabled={!importContent.trim() || isImporting}
              data-testid="button-preview-import"
            >
              <FileText className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={!importContent.trim() || isImporting}
              data-testid="button-import"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isImporting ? 'Importing...' : 'Import'}
            </Button>
          </div>

          {/* Help Text */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Supported formats:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Rules:</strong> Insimul (.insimul), Ensemble (.json), Kismet (.lp), TotT (.py)</li>
                <li><strong>Characters:</strong> Ensemble cast files (.json) with character names</li>
                <li><strong>Actions:</strong> Ensemble actions files (.json) with action definitions</li>
                <li><strong>Truth:</strong> Ensemble history files (.json) with past/present/future events</li>
              </ul>
              <p className="mt-2 text-xs text-muted-foreground">
                Files with "cast" or "character" in the name are auto-detected as character imports.
                Files with "action" in the name are auto-detected as action imports.
                Files with "history" or "truth" in the name are auto-detected as truth imports.
              </p>
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  );
}
