import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Download, Copy, FileText, Loader2, Archive } from 'lucide-react';
import type { SystemType } from '@/lib/editor-types';
import { ruleExporter } from '@/lib/rule-exporter';
import { useToast } from '@/hooks/use-toast';
import JSZip from 'jszip';

interface DataCounts {
  rules: number;
  characters: number;
  actions: number;
  quests: number;
  items: number;
  grammars: number;
  languages: number;
  truths: number;
  baseRules: number;
  baseActions: number;
}

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worldId: string;
  worldName: string;
  // Legacy props for non-Insimul format exports
  rules?: any[];
  characters?: any[];
  actions?: any[];
  includeCharacters?: boolean;
  includeActions?: boolean;
}

export function ExportDialog({
  open,
  onOpenChange,
  worldId,
  worldName,
  rules = [],
  characters = [],
  actions = [],
  includeCharacters = false,
  includeActions = false
}: ExportDialogProps) {
  const [exportFormat, setExportFormat] = useState<SystemType>('insimul');
  const [includeSchema, setIncludeSchema] = useState(false);
  const [exportedContent, setExportedContent] = useState('');
  const [exportedFiles, setExportedFiles] = useState<Record<string, string>>({});
  const [isExporting, setIsExporting] = useState(false);
  const [counts, setCounts] = useState<DataCounts | null>(null);
  const { toast } = useToast();

  // Category toggles
  const [includeRules, setIncludeRules] = useState(true);
  const [includeCharacterData, setIncludeCharacterData] = useState(true);
  const [includeActionData, setIncludeActionData] = useState(true);
  const [includeQuests, setIncludeQuests] = useState(true);
  const [includeItems, setIncludeItems] = useState(true);
  const [includeGrammars, setIncludeGrammars] = useState(true);
  const [includeLanguages, setIncludeLanguages] = useState(true);
  const [includeTruths, setIncludeTruths] = useState(true);
  const [includeBaseContent, setIncludeBaseContent] = useState(false);

  // Fetch counts when dialog opens
  useEffect(() => {
    if (!open || !worldId) return;
    setExportedContent('');
    setExportedFiles({});

    const fetchCounts = async () => {
      try {
        const [rulesRes, charsRes, actionsRes, questsRes, itemsRes, grammarsRes, langsRes, truthsRes, baseRulesRes, baseActionsRes] = await Promise.all([
          fetch(`/api/worlds/${worldId}/rules`),
          fetch(`/api/worlds/${worldId}/characters`),
          fetch(`/api/worlds/${worldId}/actions`),
          fetch(`/api/worlds/${worldId}/quests`),
          fetch(`/api/worlds/${worldId}/items`),
          fetch(`/api/worlds/${worldId}/grammars`),
          fetch(`/api/worlds/${worldId}/languages`),
          fetch(`/api/worlds/${worldId}/truth`),
          fetch('/api/rules/base'),
          fetch('/api/actions/base'),
        ]);

        const [rulesData, charsData, actionsData, questsData, itemsData, grammarsData, langsData, truthsData, baseRulesData, baseActionsData] = await Promise.all([
          rulesRes.ok ? rulesRes.json() : [],
          charsRes.ok ? charsRes.json() : [],
          actionsRes.ok ? actionsRes.json() : [],
          questsRes.ok ? questsRes.json() : [],
          itemsRes.ok ? itemsRes.json() : [],
          grammarsRes.ok ? grammarsRes.json() : [],
          langsRes.ok ? langsRes.json() : [],
          truthsRes.ok ? truthsRes.json() : [],
          baseRulesRes.ok ? baseRulesRes.json() : [],
          baseActionsRes.ok ? baseActionsRes.json() : [],
        ]);

        setCounts({
          rules: Array.isArray(rulesData) ? rulesData.length : 0,
          characters: Array.isArray(charsData) ? charsData.length : 0,
          actions: Array.isArray(actionsData) ? actionsData.length : 0,
          quests: Array.isArray(questsData) ? questsData.length : 0,
          items: Array.isArray(itemsData) ? itemsData.length : 0,
          grammars: Array.isArray(grammarsData) ? grammarsData.length : 0,
          languages: Array.isArray(langsData) ? langsData.length : 0,
          truths: Array.isArray(truthsData) ? truthsData.length : 0,
          baseRules: Array.isArray(baseRulesData) ? baseRulesData.length : 0,
          baseActions: Array.isArray(baseActionsData) ? baseActionsData.length : 0,
        });
      } catch (error) {
        console.error('Failed to fetch export counts:', error);
      }
    };

    fetchCounts();
  }, [open, worldId]);

  const formatOptions = [
    { value: 'insimul', label: 'Insimul Prolog', description: 'Export all Prolog content as-is' },
    { value: 'ensemble', label: 'Ensemble JSON', description: 'Social simulation rules as JSON' },
    { value: 'kismet', label: 'Kismet Prolog', description: 'Prolog-style social rules' },
    { value: 'tott', label: 'Talk of the Town Python', description: 'Python classes and methods' }
  ];

  // Generates Prolog content for a single category, returning the file text
  const generatePrologSection = (items: any[], sectionName: string): string => {
    const lines: string[] = [];
    const header = `%% Insimul World Export: ${worldName}\n%% Category: ${sectionName}\n%% Generated: ${new Date().toISOString()}\n`;
    lines.push(header);

    const prologItems = items.filter(item => item.content?.trim());
    if (prologItems.length === 0) return '';
    lines.push(`%% ═══════════════════════════════════════════════════════════`);
    lines.push(`%% ${sectionName} (${prologItems.length} entries)`);
    lines.push(`%% ═══════════════════════════════════════════════════════════\n`);
    for (const item of prologItems) {
      if (item.name) lines.push(`%% ${item.name}`);
      lines.push(item.content.trim());
      lines.push('');
    }
    return lines.join('\n');
  };

  // Generates Prolog facts for entities without a `content` field
  const generateFactsSection = (items: any[], sectionName: string, factGenerator: (item: any) => string): string => {
    if (items.length === 0) return '';
    const lines: string[] = [];
    const header = `%% Insimul World Export: ${worldName}\n%% Category: ${sectionName}\n%% Generated: ${new Date().toISOString()}\n`;
    lines.push(header);
    lines.push(`%% ═══════════════════════════════════════════════════════════`);
    lines.push(`%% ${sectionName} (${items.length} entries)`);
    lines.push(`%% ═══════════════════════════════════════════════════════════\n`);
    for (const item of items) {
      lines.push(factGenerator(item));
    }
    lines.push('');
    return lines.join('\n');
  };

  const generateCharacterFacts = (chars: any[]): string => {
    return generateFactsSection(chars, 'Characters', (char) => {
      const name = `${char.firstName || ''} ${char.lastName || ''}`.trim() || char.name || `character_${char.id}`;
      const safeId = char.id?.replace(/[^a-zA-Z0-9_]/g, '_') || 'unknown';
      const lines = [`%% Character: ${name}`];
      lines.push(`character('${safeId}', '${name.replace(/'/g, "\\'")}').`);
      if (char.firstName) lines.push(`character_first_name('${safeId}', '${char.firstName.replace(/'/g, "\\'")}').`);
      if (char.lastName) lines.push(`character_last_name('${safeId}', '${char.lastName.replace(/'/g, "\\'")}').`);
      if (char.age) lines.push(`character_age('${safeId}', ${char.age}).`);
      if (char.gender) lines.push(`character_gender('${safeId}', '${char.gender}').`);
      if (char.occupation) lines.push(`character_occupation('${safeId}', '${char.occupation.replace(/'/g, "\\'")}').`);
      if (char.personality && typeof char.personality === 'object') {
        for (const [trait, value] of Object.entries(char.personality)) {
          lines.push(`character_personality('${safeId}', '${trait}', ${value}).`);
        }
      }
      lines.push('');
      return lines.join('\n');
    });
  };

  const generateItemContent = (items: any[]): string => {
    const withContent = items.filter(i => i.content?.trim());
    const withoutContent = items.filter(i => !i.content?.trim());
    const parts: string[] = [];
    if (withContent.length > 0) parts.push(generatePrologSection(withContent, 'Items (Prolog)'));
    if (withoutContent.length > 0) {
      parts.push(generateFactsSection(withoutContent, 'Items', (item) => {
        const safeId = item.id?.replace(/[^a-zA-Z0-9_]/g, '_') || 'unknown';
        const lines = [`%% Item: ${item.name || 'Unknown'}`];
        lines.push(`item('${safeId}', '${(item.name || 'unknown').replace(/'/g, "\\'")}').`);
        if (item.itemType) lines.push(`item_type('${safeId}', '${item.itemType}').`);
        if (item.rarity) lines.push(`item_rarity('${safeId}', '${item.rarity}').`);
        if (item.basePrice != null) lines.push(`item_price('${safeId}', ${item.basePrice}).`);
        if (item.description) lines.push(`item_description('${safeId}', '${item.description.replace(/'/g, "\\'").replace(/\n/g, ' ')}').`);
        lines.push('');
        return lines.join('\n');
      }));
    }
    return parts.filter(Boolean).join('\n');
  };

  const generateGrammarContent = (grammars: any[]): string => {
    const withContent = grammars.filter(g => g.content?.trim());
    const withoutContent = grammars.filter(g => !g.content?.trim());
    const parts: string[] = [];
    if (withContent.length > 0) parts.push(generatePrologSection(withContent, 'Grammars (Prolog)'));
    if (withoutContent.length > 0) {
      parts.push(generateFactsSection(withoutContent, 'Grammars', (g) => {
        const safeId = g.id?.replace(/[^a-zA-Z0-9_]/g, '_') || 'unknown';
        const lines = [`%% Grammar: ${g.name || 'Unknown'}`];
        lines.push(`grammar('${safeId}', '${(g.name || 'unknown').replace(/'/g, "\\'")}').`);
        if (g.grammarType) lines.push(`grammar_type('${safeId}', '${g.grammarType}').`);
        if (g.rules && typeof g.rules === 'object') {
          const rulesStr = JSON.stringify(g.rules).replace(/'/g, "\\'");
          lines.push(`grammar_rules('${safeId}', '${rulesStr}').`);
        }
        lines.push('');
        return lines.join('\n');
      }));
    }
    return parts.filter(Boolean).join('\n');
  };

  const generateLanguageContent = (languages: any[]): string => {
    return generateFactsSection(languages, 'Languages', (lang) => {
      const safeId = lang.id?.replace(/[^a-zA-Z0-9_]/g, '_') || 'unknown';
      const lines = [`%% Language: ${lang.name || 'Unknown'}`];
      lines.push(`language('${safeId}', '${(lang.name || 'unknown').replace(/'/g, "\\'")}').`);
      if (lang.isoCode) lines.push(`language_iso('${safeId}', '${lang.isoCode}').`);
      if (lang.family) lines.push(`language_family('${safeId}', '${lang.family.replace(/'/g, "\\'")}').`);
      if (lang.status) lines.push(`language_status('${safeId}', '${lang.status}').`);
      lines.push('');
      return lines.join('\n');
    });
  };

  const generateTruthContent = (truths: any[]): string => {
    const withContent = truths.filter(t => t.content?.trim());
    const withoutContent = truths.filter(t => !t.content?.trim());
    const parts: string[] = [];
    if (withContent.length > 0) parts.push(generatePrologSection(withContent, 'Truths (Prolog)'));
    if (withoutContent.length > 0) {
      parts.push(generateFactsSection(withoutContent, 'Truths', (truth) => {
        const safeId = truth.id?.replace(/[^a-zA-Z0-9_]/g, '_') || 'unknown';
        const lines = [`%% Truth: ${truth.subject || 'Unknown'} — ${truth.predicate || ''}`];
        const subj = (truth.subject || 'unknown').replace(/'/g, "\\'");
        const pred = (truth.predicate || 'unknown').replace(/'/g, "\\'");
        const obj = (truth.object || '').replace(/'/g, "\\'");
        lines.push(`truth('${safeId}', '${subj}', '${pred}', '${obj}').`);
        if (truth.confidence != null) lines.push(`truth_confidence('${safeId}', ${truth.confidence}).`);
        lines.push('');
        return lines.join('\n');
      }));
    }
    return parts.filter(Boolean).join('\n');
  };

  const handleInsimulExport = async () => {
    setIsExporting(true);
    try {
      // Fetch all requested data in parallel
      const fetches: Record<string, Promise<Response>> = {};

      if (includeRules) fetches.rules = fetch(`/api/worlds/${worldId}/rules`);
      if (includeCharacterData) fetches.characters = fetch(`/api/worlds/${worldId}/characters`);
      if (includeActionData) fetches.actions = fetch(`/api/worlds/${worldId}/actions`);
      if (includeQuests) fetches.quests = fetch(`/api/worlds/${worldId}/quests`);
      if (includeItems) fetches.items = fetch(`/api/worlds/${worldId}/items`);
      if (includeGrammars) fetches.grammars = fetch(`/api/worlds/${worldId}/grammars`);
      if (includeLanguages) fetches.languages = fetch(`/api/worlds/${worldId}/languages`);
      if (includeTruths) fetches.truths = fetch(`/api/worlds/${worldId}/truth`);
      if (includeBaseContent) {
        fetches.baseRules = fetch('/api/rules/base');
        fetches.baseActions = fetch('/api/actions/base');
      }

      const keys = Object.keys(fetches);
      const responses = await Promise.all(Object.values(fetches));
      const data: Record<string, any[]> = {};
      for (let i = 0; i < keys.length; i++) {
        data[keys[i]] = responses[i].ok ? await responses[i].json() : [];
        if (!Array.isArray(data[keys[i]])) data[keys[i]] = [];
      }

      // Build per-category file contents
      const exportFiles: Record<string, string> = {};

      if (data.baseRules) {
        const content = generatePrologSection(data.baseRules, 'Base Rules');
        if (content) exportFiles['base_rules.pl'] = content;
      }
      if (data.baseActions) {
        const content = generatePrologSection(data.baseActions, 'Base Actions');
        if (content) exportFiles['base_actions.pl'] = content;
      }
      if (data.rules) {
        const content = generatePrologSection(data.rules, 'Rules');
        if (content) exportFiles['rules.pl'] = content;
      }
      if (data.actions) {
        const content = generatePrologSection(data.actions, 'Actions');
        if (content) exportFiles['actions.pl'] = content;
      }
      if (data.quests) {
        const content = generatePrologSection(data.quests, 'Quests');
        if (content) exportFiles['quests.pl'] = content;
      }
      if (data.characters) {
        const content = generateCharacterFacts(data.characters);
        if (content) exportFiles['characters.pl'] = content;
      }
      if (data.items) {
        const content = generateItemContent(data.items);
        if (content) exportFiles['items.pl'] = content;
      }
      if (data.grammars) {
        const content = generateGrammarContent(data.grammars);
        if (content) exportFiles['grammars.pl'] = content;
      }
      if (data.languages) {
        const content = generateLanguageContent(data.languages);
        if (content) exportFiles['languages.pl'] = content;
      }
      if (data.truths) {
        const content = generateTruthContent(data.truths);
        if (content) exportFiles['truths.pl'] = content;
      }

      setExportedFiles(exportFiles);

      // Also build a combined preview for the textarea
      const preview = Object.entries(exportFiles)
        .map(([filename, content]) => `%% ── ${filename} ──\n${content}`)
        .join('\n\n');
      setExportedContent(preview);
    } catch (error) {
      toast({
        title: 'Export Error',
        description: error instanceof Error ? error.message : 'Failed to export data',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleLegacyExport = () => {
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

  const handleExport = () => {
    if (exportFormat === 'insimul') {
      handleInsimulExport();
    } else {
      handleLegacyExport();
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(exportedContent);
    toast({
      title: 'Copied to Clipboard',
      description: 'The exported content has been copied to your clipboard.'
    });
  };

  const handleDownload = async () => {
    const worldSlug = worldName.toLowerCase().replace(/[^a-z0-9]/g, '_');

    // For Insimul format, bundle separate files into a zip
    if (exportFormat === 'insimul' && Object.keys(exportedFiles).length > 0) {
      const zip = new JSZip();
      const folder = zip.folder(worldSlug) as JSZip;
      for (const [filename, content] of Object.entries(exportedFiles)) {
        folder.file(filename, content);
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${worldSlug}_export.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'File Downloaded',
        description: `Exported ${Object.keys(exportedFiles).length} files as ${worldSlug}_export.zip`
      });
      return;
    }

    // Legacy single-file download for other formats
    const fileExtensions: Record<string, string> = {
      ensemble: 'json',
      kismet: 'lp',
      tott: 'py'
    };

    const extension = fileExtensions[exportFormat] || 'txt';
    const filename = `${worldSlug}_export.${extension}`;

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
      description: `Exported as ${filename}`
    });
  };

  const selectedFormat = formatOptions.find(option => option.value === exportFormat);
  const isInsimulFormat = exportFormat === 'insimul';

  const selectedCount = isInsimulFormat && counts
    ? (includeRules ? counts.rules : 0) +
      (includeCharacterData ? counts.characters : 0) +
      (includeActionData ? counts.actions : 0) +
      (includeQuests ? counts.quests : 0) +
      (includeItems ? counts.items : 0) +
      (includeGrammars ? counts.grammars : 0) +
      (includeLanguages ? counts.languages : 0) +
      (includeTruths ? counts.truths : 0) +
      (includeBaseContent ? (counts.baseRules + counts.baseActions) : 0)
    : rules.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto" data-testid="export-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Export World Data
          </DialogTitle>
          <DialogDescription>
            Export your world data for backup or use in other systems.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Format Selection */}
          <div className="space-y-2">
            <Label htmlFor="export-format">Export Format</Label>
            <Select value={exportFormat} onValueChange={(value: SystemType) => { setExportFormat(value); setExportedContent(''); setExportedFiles({}); }} data-testid="select-export-format">
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

          {/* Export Options — full categories for Insimul format */}
          {isInsimulFormat ? (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Data Categories</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="inc-rules" checked={includeRules} onCheckedChange={(c) => setIncludeRules(!!c)} />
                  <Label htmlFor="inc-rules" className="text-sm">Rules{counts ? ` (${counts.rules})` : ''}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="inc-characters" checked={includeCharacterData} onCheckedChange={(c) => setIncludeCharacterData(!!c)} />
                  <Label htmlFor="inc-characters" className="text-sm">Characters{counts ? ` (${counts.characters})` : ''}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="inc-actions" checked={includeActionData} onCheckedChange={(c) => setIncludeActionData(!!c)} />
                  <Label htmlFor="inc-actions" className="text-sm">Actions{counts ? ` (${counts.actions})` : ''}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="inc-quests" checked={includeQuests} onCheckedChange={(c) => setIncludeQuests(!!c)} />
                  <Label htmlFor="inc-quests" className="text-sm">Quests{counts ? ` (${counts.quests})` : ''}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="inc-items" checked={includeItems} onCheckedChange={(c) => setIncludeItems(!!c)} />
                  <Label htmlFor="inc-items" className="text-sm">Items{counts ? ` (${counts.items})` : ''}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="inc-grammars" checked={includeGrammars} onCheckedChange={(c) => setIncludeGrammars(!!c)} />
                  <Label htmlFor="inc-grammars" className="text-sm">Grammars{counts ? ` (${counts.grammars})` : ''}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="inc-languages" checked={includeLanguages} onCheckedChange={(c) => setIncludeLanguages(!!c)} />
                  <Label htmlFor="inc-languages" className="text-sm">Languages{counts ? ` (${counts.languages})` : ''}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="inc-truths" checked={includeTruths} onCheckedChange={(c) => setIncludeTruths(!!c)} />
                  <Label htmlFor="inc-truths" className="text-sm">Truths{counts ? ` (${counts.truths})` : ''}</Label>
                </div>
              </div>

              {/* Base content toggle */}
              <div className="flex items-center space-x-2 pt-2 border-t">
                <Checkbox id="inc-base" checked={includeBaseContent} onCheckedChange={(c) => setIncludeBaseContent(!!c)} />
                <Label htmlFor="inc-base" className="text-sm">
                  Include enabled base content{counts ? ` (${counts.baseRules} rules, ${counts.baseActions} actions)` : ''}
                </Label>
              </div>
            </div>
          ) : (
            /* Legacy options for non-Insimul formats */
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
          )}

          {/* Export Action */}
          <div className="flex gap-3">
            <Button onClick={handleExport} disabled={selectedCount === 0 || isExporting} data-testid="button-export">
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                'Generate Export'
              )}
            </Button>
            <div className="text-sm text-muted-foreground flex items-center">
              {selectedCount} items to export
            </div>
          </div>

          {/* Export Results */}
          {exportedContent && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="exported-content">
                  Exported Content ({exportedContent.length.toLocaleString()} chars)
                </Label>
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
                    {isInsimulFormat && Object.keys(exportedFiles).length > 0 ? (
                      <>
                        <Archive className="w-4 h-4 mr-2" />
                        Download ZIP ({Object.keys(exportedFiles).length} files)
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </>
                    )}
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
