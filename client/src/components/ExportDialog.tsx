import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Download, Copy, FileText } from 'lucide-react';
import { SystemType } from '@/lib/unified-syntax';
import { ruleExporter } from '@/lib/rule-exporter';
import { useToast } from '@/hooks/use-toast';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rules: any[];
  worldName: string;
  characters?: any[];
  actions?: any[];
  includeCharacters?: boolean;
  includeActions?: boolean;
}

export function ExportDialog({
  open,
  onOpenChange,
  rules,
  worldName,
  characters = [],
  actions = [],
  includeCharacters = false,
  includeActions = false
}: ExportDialogProps) {
  const [exportFormat, setExportFormat] = useState<SystemType>('insimul');
  const [includeSchema, setIncludeSchema] = useState(false);
  const [includeCharacterData, setIncludeCharacterData] = useState(includeCharacters);
  const [includeActionData, setIncludeActionData] = useState(includeActions);
  const [exportedContent, setExportedContent] = useState('');
  const { toast } = useToast();

  // Update checkbox state when prop changes
  useEffect(() => {
    setIncludeCharacterData(includeCharacters);
    setIncludeActionData(includeActions);
  }, [includeCharacters, includeActions]);

  const formatOptions = [
    { value: 'insimul', label: 'Insimul Format', description: 'Unified narrative simulation syntax' },
    { value: 'ensemble', label: 'Ensemble JSON', description: 'Social simulation rules as JSON' },
    { value: 'kismet', label: 'Kismet Prolog', description: 'Prolog-style social rules' },
    { value: 'tott', label: 'Talk of the Town Python', description: 'Python classes and methods' }
  ];

  const handleExport = () => {
    try {
      const content = ruleExporter.exportToFormat(
        rules,
        exportFormat,
        includeSchema,
        includeCharacterData ? characters : undefined,
        includeActionData ? actions : undefined
      );
      setExportedContent(content);
    } catch (error) {
      toast({
        title: 'Export Error',
        description: error instanceof Error ? error.message : 'Failed to export rules',
        variant: 'destructive'
      });
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(exportedContent);
    toast({
      title: 'Copied to Clipboard',
      description: 'The exported content has been copied to your clipboard.'
    });
  };

  const handleDownload = () => {
    const fileExtensions = {
      insimul: 'insimul',
      ensemble: 'json',
      kismet: 'lp',
      tott: 'py'
    };
    
    const extension = fileExtensions[exportFormat];
    const filename = `${worldName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_rules.${extension}`;
    
    const blob = new Blob([exportedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'File Downloaded',
      description: `Rules exported as ${filename}`
    });
  };

  const selectedFormat = formatOptions.find(option => option.value === exportFormat);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto" data-testid="export-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Export Rules
          </DialogTitle>
          <DialogDescription>
            Export your rules to different formats for use in other systems or for backup.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Export Format Selection */}
          <div className="space-y-2">
            <Label htmlFor="export-format">Export Format</Label>
            <Select value={exportFormat} onValueChange={(value: SystemType) => setExportFormat(value)} data-testid="select-export-format">
              <SelectTrigger>
                <SelectValue placeholder="Select export format" />
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

          {/* Export Options */}
          <div className="space-y-4">
            {characters.length > 0 && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-characters"
                  checked={includeCharacterData}
                  onCheckedChange={(checked) => setIncludeCharacterData(!!checked)}
                  data-testid="checkbox-include-characters"
                />
                <Label htmlFor="include-characters" className="text-sm">
                  Include character data ({characters.length} characters)
                </Label>
              </div>
            )}

            {actions.length > 0 && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-actions"
                  checked={includeActionData}
                  onCheckedChange={(checked) => setIncludeActionData(!!checked)}
                  data-testid="checkbox-include-actions"
                />
                <Label htmlFor="include-actions" className="text-sm">
                  Include action data ({actions.length} actions)
                </Label>
              </div>
            )}

            {exportFormat === 'ensemble' && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-schema"
                  checked={includeSchema}
                  onCheckedChange={(checked) => setIncludeSchema(!!checked)}
                  data-testid="checkbox-include-schema"
                />
                <Label htmlFor="include-schema" className="text-sm">
                  Include schema definitions
                </Label>
              </div>
            )}
          </div>

          {/* Export Action */}
          <div className="flex gap-3">
            <Button onClick={handleExport} disabled={rules.length === 0} data-testid="button-export">
              Generate Export
            </Button>
            <div className="text-sm text-muted-foreground flex items-center">
              {rules.length} rules{includeCharacterData && characters.length > 0 ? ` + ${characters.length} characters` : ''} to export
            </div>
          </div>

          {/* Export Results */}
          {exportedContent && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="exported-content">Exported Content</Label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyToClipboard}
                    data-testid="button-copy-content"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleDownload}
                    data-testid="button-download-file"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              <Textarea
                id="exported-content"
                value={exportedContent}
                readOnly
                className="min-h-[400px] font-mono text-sm"
                data-testid="textarea-exported-content"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}