import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, AlertCircle, Download, Eye } from 'lucide-react';
import { RuleExporter } from '@/lib/rule-exporter';
import type { InsimulRule, Condition, Effect, SourceFormat } from '@/lib/unified-syntax';

type ExportFormat = 'ensemble' | 'kismet' | 'tott' | 'insimul';

interface RuleConvertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule: {
    id: string;
    name: string;
    content: string;
    sourceFormat: string;
  };
}

/**
 * Parse Prolog content (as stored in the DB) back into InsimulRule objects
 * for export/preview to other formats. This is a best-effort extraction
 * from the Prolog predicates we generate.
 */
function parsePrologToInsimulRule(name: string, prologContent: string): InsimulRule {
  // Extract metadata from Prolog comments and facts
  const priority = extractNumber(prologContent, /rule_priority\(\s*\w+\s*,\s*(\d+(?:\.\d+)?)\s*\)/) ?? 5;
  const likelihood = extractNumber(prologContent, /rule_likelihood\(\s*\w+\s*,\s*(\d+(?:\.\d+)?)\s*\)/);
  const ruleType = extractString(prologContent, /% Format:.*?\/\s*Type:\s*(\w+)/) || 'trigger';
  const category = extractString(prologContent, /% Category:\s*(.+)/);
  const isActive = !/rule_inactive\(\s*\w+\s*\)/.test(prologContent);

  // Extract conditions from rule_applies/3 clause body
  const conditions: Condition[] = [];
  const appliesMatch = prologContent.match(/rule_applies\(\s*\w+\s*,\s*X\s*,\s*Y\s*\)\s*:-\s*([\s\S]*?)\./);
  if (appliesMatch) {
    const body = appliesMatch[1].trim();
    // Split on commas that aren't inside parentheses
    const goals = splitPrologGoals(body);
    for (const goal of goals) {
      const condition = parsePrologGoalAsCondition(goal.trim());
      if (condition) conditions.push(condition);
    }
  }

  // Extract effects from rule_effect/4 facts
  const effects: Effect[] = [];
  const effectRegex = /rule_effect\(\s*\w+\s*,\s*X\s*,\s*Y\s*,\s*(effect\([^)]*\))\s*\)\s*\./g;
  let effectMatch;
  while ((effectMatch = effectRegex.exec(prologContent)) !== null) {
    const effect = parsePrologEffect(effectMatch[1].trim());
    if (effect) effects.push(effect);
  }

  // Extract tags from comments
  const tags: string[] = [];
  const tagsMatch = prologContent.match(/% tags:\s*\[([^\]]*)\]/);
  if (tagsMatch) {
    tags.push(...tagsMatch[1].split(',').map(t => t.trim()).filter(Boolean));
  }
  if (category) tags.push(category);

  return {
    id: name,
    name,
    sourceFormat: 'insimul' as SourceFormat,
    ruleType: ruleType as InsimulRule['ruleType'],
    priority,
    likelihood: likelihood ?? undefined,
    conditions,
    effects,
    tags,
    dependencies: [],
    isActive,
  };
}

function extractNumber(content: string, regex: RegExp): number | null {
  const match = content.match(regex);
  return match ? parseFloat(match[1]) : null;
}

function extractString(content: string, regex: RegExp): string | null {
  const match = content.match(regex);
  return match ? match[1].trim() : null;
}

/** Split Prolog goals on commas, respecting parenthesis nesting */
function splitPrologGoals(body: string): string[] {
  const goals: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of body) {
    if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']') depth--;
    else if (ch === ',' && depth === 0) {
      if (current.trim()) goals.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) goals.push(current.trim());
  return goals;
}

/** Parse a single Prolog goal into a Condition */
function parsePrologGoalAsCondition(goal: string): Condition | null {
  if (!goal || goal.startsWith('%')) return null;

  // Negation: \+ goal
  if (goal.startsWith('\\+')) {
    const inner = goal.replace(/^\\+\s*\(?/, '').replace(/\)?\s*$/, '');
    const innerCondition = parsePrologGoalAsCondition(inner);
    if (innerCondition) {
      innerCondition.negated = true;
      return innerCondition;
    }
  }

  // Comparison: Var Op Value (e.g., Val > 5)
  const compMatch = goal.match(/^(\w+)\s*(>=|=<|>|<|=:=|=\\=)\s*(.+)$/);
  if (compMatch) {
    return {
      type: 'comparison',
      first: compMatch[1],
      operator: mapPrologOperator(compMatch[2]),
      value: compMatch[3].trim(),
    };
  }

  // Predicate: name(args...)
  const predMatch = goal.match(/^(\w+)\(([^)]*)\)$/);
  if (predMatch) {
    const [, predName, argsStr] = predMatch;
    const args = argsStr.split(',').map(a => a.trim());
    return {
      type: 'predicate',
      predicate: predName,
      first: args[0] || undefined,
      second: args[1] || undefined,
      value: args[2] || undefined,
    };
  }

  return null;
}

function mapPrologOperator(op: string): Condition['operator'] {
  switch (op) {
    case '>': return 'greater';
    case '<': return 'less';
    case '=:=': case '=': return 'equals';
    default: return 'equals';
  }
}

/** Parse effect(action, value) into an Effect */
function parsePrologEffect(effectStr: string): Effect | null {
  const match = effectStr.match(/^effect\(\s*(\w+)\s*(?:,\s*(.+))?\s*\)$/);
  if (!match) return null;
  const action = match[1];
  const value = match[2]?.replace(/^'|'$/g, '');
  return {
    type: 'set',
    target: 'X',
    action,
    value,
  };
}

/** Generate a file extension for the given format */
function formatExtension(format: ExportFormat): string {
  switch (format) {
    case 'ensemble': return 'json';
    case 'kismet': return 'pl';
    case 'tott': return 'json';
    case 'insimul': return 'insimul';
  }
}

function formatLabel(format: ExportFormat): string {
  switch (format) {
    case 'ensemble': return 'Ensemble JSON';
    case 'kismet': return 'Kismet';
    case 'tott': return 'Talk of the Town JSON';
    case 'insimul': return 'Insimul DSL';
  }
}

export function RuleConvertDialog({ open, onOpenChange, rule }: RuleConvertDialogProps) {
  const [targetFormat, setTargetFormat] = useState<ExportFormat>('ensemble');
  const [convertedContent, setConvertedContent] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);

  const formatOptions: { value: ExportFormat; label: string }[] = [
    { value: 'ensemble', label: 'Ensemble JSON' },
    { value: 'kismet', label: 'Kismet' },
    { value: 'tott', label: 'Talk of the Town JSON' },
    { value: 'insimul', label: 'Insimul DSL' },
  ];

  const handlePreview = useCallback(() => {
    setIsConverting(true);
    setError('');
    setConvertedContent('');

    try {
      if (!rule.content) {
        setError('No Prolog content available to convert.');
        setIsConverting(false);
        return;
      }

      // Parse the Prolog content into an InsimulRule for export
      const parsed = parsePrologToInsimulRule(rule.name, rule.content);
      const exporter = new RuleExporter();
      const converted = exporter.exportToFormat([parsed], targetFormat as SourceFormat, false, []);
      setConvertedContent(converted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert rule');
      console.error('Conversion error:', err);
    } finally {
      setIsConverting(false);
    }
  }, [rule.content, rule.name, targetFormat]);

  const handleDownload = useCallback(() => {
    if (!convertedContent) return;

    const safeName = rule.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const ext = formatExtension(targetFormat);
    const filename = `${safeName}.${ext}`;

    const blob = new Blob([convertedContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [convertedContent, rule.name, targetFormat]);

  const handleClose = () => {
    onOpenChange(false);
    setConvertedContent('');
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Export Rule Format
          </DialogTitle>
          <DialogDescription>
            Preview "{rule.name}" in Ensemble, Kismet, or Talk of the Town format.
            This is a read-only preview — the database record is not modified.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-auto">
          {/* Format Selection */}
          <div className="space-y-2">
            <Label htmlFor="target-format">Export Format</Label>
            <Select value={targetFormat} onValueChange={(value) => {
              setTargetFormat(value as ExportFormat);
              setConvertedContent('');
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select export format" />
              </SelectTrigger>
              <SelectContent>
                {formatOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview Button */}
          <Button
            onClick={handlePreview}
            disabled={isConverting}
            className="w-full"
            variant="outline"
          >
            <Eye className="w-4 h-4 mr-2" />
            {isConverting ? 'Converting...' : 'Preview Conversion'}
          </Button>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Source Content (Prolog) */}
          <div className="space-y-2">
            <Label>Source (Insimul Prolog)</Label>
            <pre className="p-4 bg-slate-100 dark:bg-slate-900 rounded-lg overflow-auto max-h-[200px] text-sm font-mono whitespace-pre-wrap">
              {rule.content || 'No Prolog content available.'}
            </pre>
          </div>

          {/* Converted Content */}
          {convertedContent && (
            <div className="space-y-2">
              <Label>Preview ({formatLabel(targetFormat)})</Label>
              <pre className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg overflow-auto max-h-[200px] text-sm font-mono whitespace-pre-wrap">
                {convertedContent}
              </pre>
            </div>
          )}

          {/* Info note */}
          {convertedContent && (
            <Alert>
              <AlertDescription>
                This is a read-only preview of how this rule would look in {formatLabel(targetFormat)} format.
                Use the Download button to save a copy. The original Prolog record is not modified.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
          {convertedContent && (
            <Button onClick={handleDownload} variant="default">
              <Download className="w-4 h-4 mr-2" />
              Download .{formatExtension(targetFormat)}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
