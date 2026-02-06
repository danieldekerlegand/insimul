/**
 * BulkAssetImportDialog - Import multiple assets from JSON or CSV files
 */

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileJson, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

interface BulkAssetImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worldId: string;
  collectionId?: string;
}

interface ParsedAsset {
  name: string;
  description?: string;
  assetType: string;
  filePath: string;
  tags?: string[];
  valid: boolean;
  error?: string;
}

const SAMPLE_JSON = `[
  {
    "name": "Stone Wall Texture",
    "description": "Medieval stone wall",
    "assetType": "texture_wall",
    "filePath": "assets/textures/stone_wall.png",
    "tags": ["stone", "medieval", "wall"]
  },
  {
    "name": "Oak Tree Model",
    "description": "Large oak tree",
    "assetType": "model_nature",
    "filePath": "assets/models/oak_tree.glb",
    "tags": ["tree", "nature", "oak"]
  }
]`;

const SAMPLE_CSV = `name,description,assetType,filePath,tags
Stone Wall Texture,Medieval stone wall,texture_wall,assets/textures/stone_wall.png,"stone,medieval,wall"
Oak Tree Model,Large oak tree,model_nature,assets/models/oak_tree.glb,"tree,nature,oak"`;

export function BulkAssetImportDialog({ open, onOpenChange, worldId, collectionId }: BulkAssetImportDialogProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'json' | 'csv'>('json');
  const [inputText, setInputText] = useState('');
  const [parsedAssets, setParsedAssets] = useState<ParsedAsset[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{ success: number; failed: number } | null>(null);

  const parseJSON = (text: string): ParsedAsset[] => {
    try {
      const data = JSON.parse(text);
      if (!Array.isArray(data)) {
        return [{ name: '', assetType: '', filePath: '', valid: false, error: 'JSON must be an array' }];
      }
      return data.map((item: any, index: number) => {
        const errors: string[] = [];
        if (!item.name) errors.push('Missing name');
        if (!item.assetType) errors.push('Missing assetType');
        if (!item.filePath) errors.push('Missing filePath');

        return {
          name: item.name || `Asset ${index + 1}`,
          description: item.description || '',
          assetType: item.assetType || 'unknown',
          filePath: item.filePath || '',
          tags: Array.isArray(item.tags) ? item.tags : [],
          valid: errors.length === 0,
          error: errors.length > 0 ? errors.join(', ') : undefined,
        };
      });
    } catch (e) {
      return [{ name: '', assetType: '', filePath: '', valid: false, error: 'Invalid JSON format' }];
    }
  };

  const parseCSV = (text: string): ParsedAsset[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      return [{ name: '', assetType: '', filePath: '', valid: false, error: 'CSV must have header and at least one row' }];
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const nameIdx = headers.indexOf('name');
    const descIdx = headers.indexOf('description');
    const typeIdx = headers.indexOf('assettype');
    const pathIdx = headers.indexOf('filepath');
    const tagsIdx = headers.indexOf('tags');

    if (nameIdx === -1 || typeIdx === -1 || pathIdx === -1) {
      return [{ name: '', assetType: '', filePath: '', valid: false, error: 'CSV must have name, assetType, and filePath columns' }];
    }

    return lines.slice(1).filter(line => line.trim()).map((line, index) => {
      // Simple CSV parsing (handles quoted strings with commas)
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const errors: string[] = [];
      const name = values[nameIdx] || '';
      const assetType = values[typeIdx] || '';
      const filePath = values[pathIdx] || '';

      if (!name) errors.push('Missing name');
      if (!assetType) errors.push('Missing assetType');
      if (!filePath) errors.push('Missing filePath');

      const tagsStr = tagsIdx !== -1 ? values[tagsIdx] || '' : '';
      const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [];

      return {
        name,
        description: descIdx !== -1 ? values[descIdx] || '' : '',
        assetType,
        filePath,
        tags,
        valid: errors.length === 0,
        error: errors.length > 0 ? errors.join(', ') : undefined,
      };
    });
  };

  const handleParse = () => {
    if (!inputText.trim()) {
      setParsedAssets([]);
      return;
    }
    const assets = activeTab === 'json' ? parseJSON(inputText) : parseCSV(inputText);
    setParsedAssets(assets);
    setImportResults(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInputText(text);
      // Auto-detect format
      if (file.name.endsWith('.json')) {
        setActiveTab('json');
      } else if (file.name.endsWith('.csv')) {
        setActiveTab('csv');
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const validAssets = parsedAssets.filter(a => a.valid);
    if (validAssets.length === 0) {
      toast({
        title: 'No valid assets',
        description: 'Please fix the errors before importing',
        variant: 'destructive',
      });
      return;
    }

    setIsImporting(true);
    let success = 0;
    let failed = 0;

    for (const asset of validAssets) {
      try {
        const response = await fetch('/api/visual-assets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            worldId,
            collectionId,
            name: asset.name,
            description: asset.description,
            assetType: asset.assetType,
            filePath: asset.filePath,
            tags: asset.tags,
            status: 'completed',
            purpose: 'authorial',
          }),
        });

        if (response.ok) {
          success++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }

    setIsImporting(false);
    setImportResults({ success, failed });

    if (success > 0) {
      queryClient.invalidateQueries({ queryKey: ['/api/worlds', worldId, 'assets'] });
      if (collectionId) {
        queryClient.invalidateQueries({ queryKey: ['/api/asset-collections', collectionId] });
      }
      toast({
        title: 'Import complete',
        description: `Successfully imported ${success} asset${success !== 1 ? 's' : ''}${failed > 0 ? `, ${failed} failed` : ''}`,
      });
    } else {
      toast({
        title: 'Import failed',
        description: 'No assets were imported',
        variant: 'destructive',
      });
    }
  };

  const handleLoadSample = () => {
    setInputText(activeTab === 'json' ? SAMPLE_JSON : SAMPLE_CSV);
  };

  const validCount = parsedAssets.filter(a => a.valid).length;
  const invalidCount = parsedAssets.filter(a => !a.valid).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Bulk Asset Import
          </DialogTitle>
          <DialogDescription>
            Import multiple assets at once using JSON or CSV format
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'json' | 'csv')} className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="json" className="flex items-center gap-2">
                <FileJson className="w-4 h-4" />
                JSON
              </TabsTrigger>
              <TabsTrigger value="csv" className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                CSV
              </TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleLoadSample}>
                <Download className="w-4 h-4 mr-2" />
                Load Sample
              </Button>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          <TabsContent value="json" className="mt-0">
            <div className="space-y-2">
              <Label>JSON Data</Label>
              <Textarea
                placeholder="Paste JSON array of assets..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="font-mono text-sm h-40"
              />
            </div>
          </TabsContent>

          <TabsContent value="csv" className="mt-0">
            <div className="space-y-2">
              <Label>CSV Data</Label>
              <Textarea
                placeholder="Paste CSV data with headers: name, description, assetType, filePath, tags"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="font-mono text-sm h-40"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center gap-2 my-2">
          <Button onClick={handleParse} variant="secondary" size="sm">
            Parse & Validate
          </Button>
          {parsedAssets.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-600">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {validCount} valid
              </Badge>
              {invalidCount > 0 && (
                <Badge variant="destructive">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {invalidCount} invalid
                </Badge>
              )}
            </div>
          )}
        </div>

        {parsedAssets.length > 0 && (
          <ScrollArea className="h-48 border rounded-lg">
            <div className="p-2 space-y-2">
              {parsedAssets.map((asset, index) => (
                <Card key={index} className={asset.valid ? 'border-green-500/30' : 'border-red-500/30'}>
                  <CardContent className="py-2 px-3 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {asset.valid ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        )}
                        <span className="font-medium text-sm truncate">{asset.name || 'Unnamed'}</span>
                        <Badge variant="outline" className="text-xs">
                          {asset.assetType}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate pl-6">
                        {asset.error || asset.filePath}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}

        {importResults && (
          <div className="p-3 rounded-lg bg-muted text-center">
            <p className="text-sm">
              Import complete: <span className="text-green-600 font-medium">{importResults.success} succeeded</span>
              {importResults.failed > 0 && (
                <>, <span className="text-red-600 font-medium">{importResults.failed} failed</span></>
              )}
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            onClick={handleImport}
            disabled={validCount === 0 || isImporting}
          >
            {isImporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Import {validCount} Asset{validCount !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
