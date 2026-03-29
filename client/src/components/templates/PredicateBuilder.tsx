import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import {
  GAMEPLAY_PREDICATES, getPredicatesByCategory, getPredicateByName, getMinimumViableTemplate,
  type GameplayPredicate, type PredicateCategory,
} from '@shared/prolog/gameplay-predicates';

export interface StartingTruth {
  predicate: string;
  args: any[];
}

interface PredicateBuilderProps {
  truths: StartingTruth[];
  onChange: (truths: StartingTruth[]) => void;
  readOnly?: boolean;
}

const CATEGORY_LABELS: Record<PredicateCategory, string> = {
  player_state: 'Player State',
  npc_state: 'NPC State',
  world_state: 'World State',
  location: 'Location',
};

const CATEGORY_ORDER: PredicateCategory[] = ['player_state', 'npc_state', 'world_state', 'location'];

function formatTruth(truth: StartingTruth): string {
  return `${truth.predicate}(${truth.args.map(a => String(a)).join(', ')}).`;
}

function parseArgValue(value: string, type: string): any {
  if (type === 'integer') {
    const n = parseInt(value, 10);
    return isNaN(n) ? 0 : n;
  }
  if (type === 'float') {
    const f = parseFloat(value);
    return isNaN(f) ? 0.0 : f;
  }
  // atom — lowercase, no spaces
  return value.trim().toLowerCase().replace(/\s+/g, '_') || '';
}

export function PredicateBuilder({ truths, onChange, readOnly }: PredicateBuilderProps) {
  const [selectedPredicate, setSelectedPredicate] = useState<string>('');
  const [argValues, setArgValues] = useState<string[]>([]);

  // MVT validation
  const mvtPredicates = useMemo(() => getMinimumViableTemplate().map(p => p.name), []);
  const missingMvt = useMemo(() => {
    const present = new Set(truths.map(t => t.predicate));
    return mvtPredicates.filter(name => !present.has(name));
  }, [truths, mvtPredicates]);

  // When predicate selection changes, reset arg inputs
  const handlePredicateSelect = (name: string) => {
    setSelectedPredicate(name);
    const pred = getPredicateByName(name);
    if (pred) {
      setArgValues(pred.args.map(a => a.type === 'integer' ? '0' : a.type === 'float' ? '0.0' : ''));
    }
  };

  const handleArgChange = (index: number, value: string) => {
    setArgValues(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleAdd = () => {
    const pred = getPredicateByName(selectedPredicate);
    if (!pred) return;

    const parsedArgs = pred.args.map((a, i) => parseArgValue(argValues[i] || '', a.type));

    // Don't add if any atom arg is empty
    const hasEmpty = pred.args.some((a, i) => a.type === 'atom' && !parsedArgs[i]);
    if (hasEmpty) return;

    onChange([...truths, { predicate: selectedPredicate, args: parsedArgs }]);
    // Reset form
    setArgValues(pred.args.map(a => a.type === 'integer' ? '0' : a.type === 'float' ? '0.0' : ''));
  };

  const handleRemove = (index: number) => {
    onChange(truths.filter((_, i) => i !== index));
  };

  const currentPred = getPredicateByName(selectedPredicate);

  return (
    <div className="space-y-4">
      {/* MVT Warning */}
      {missingMvt.length > 0 && (
        <div className="flex items-start gap-2 p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 text-sm">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <span className="font-medium">Missing required predicates: </span>
            {missingMvt.map((name, i) => (
              <span key={name}>
                {i > 0 && ', '}
                <code className="text-xs bg-yellow-500/10 px-1 py-0.5 rounded">{name}</code>
              </span>
            ))}
            <p className="mt-1 text-xs opacity-80">
              These predicates are part of the Minimum Viable Template (MVT) and are required for a playable character.
            </p>
          </div>
        </div>
      )}

      {/* Current truths list */}
      <div>
        <Label className="text-sm font-medium">Starting Truths ({truths.length})</Label>
        {truths.length > 0 ? (
          <div className="mt-2 space-y-1">
            {truths.map((truth, i) => (
              <div key={i} className="flex items-center gap-2 group">
                <div className="flex-1 font-mono text-xs bg-muted/50 px-3 py-1.5 rounded border">
                  {formatTruth(truth)}
                </div>
                {!readOnly && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    onClick={() => handleRemove(i)}
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No starting truths defined.</p>
        )}
      </div>

      {/* Add predicate form */}
      {!readOnly && (
        <div className="border rounded-lg p-3 space-y-3 bg-muted/20">
          <Label className="text-sm font-medium">Add Predicate</Label>

          {/* Predicate selector */}
          <Select value={selectedPredicate} onValueChange={handlePredicateSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a predicate..." />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_ORDER.map(cat => {
                const preds = getPredicatesByCategory(cat);
                return (
                  <SelectGroup key={cat}>
                    <SelectLabel>{CATEGORY_LABELS[cat]}</SelectLabel>
                    {preds.map(p => (
                      <SelectItem key={p.name} value={p.name}>
                        <span className="font-mono text-xs">{p.name}/{p.arity}</span>
                        <span className="text-muted-foreground ml-2 text-xs">{p.description}</span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                );
              })}
            </SelectContent>
          </Select>

          {/* Argument inputs */}
          {currentPred && (
            <>
              <div className="grid grid-cols-2 gap-2">
                {currentPred.args.map((arg, i) => (
                  <div key={arg.name}>
                    <Label className="text-xs text-muted-foreground">
                      {arg.name} <Badge variant="outline" className="text-[10px] ml-1">{arg.type}</Badge>
                    </Label>
                    <Input
                      value={argValues[i] || ''}
                      onChange={e => handleArgChange(i, e.target.value)}
                      placeholder={arg.name.toLowerCase()}
                      type={arg.type === 'integer' || arg.type === 'float' ? 'number' : 'text'}
                      step={arg.type === 'float' ? '0.1' : undefined}
                      className="h-8 text-sm font-mono"
                    />
                  </div>
                ))}
              </div>

              {/* Preview */}
              {selectedPredicate && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Preview: </span>
                  <code className="bg-muted px-1.5 py-0.5 rounded">
                    {formatTruth({
                      predicate: selectedPredicate,
                      args: currentPred.args.map((a, i) => parseArgValue(argValues[i] || '', a.type)),
                    })}
                  </code>
                </div>
              )}

              <Button
                size="sm"
                onClick={handleAdd}
                disabled={currentPred.args.some((a, i) => a.type === 'atom' && !argValues[i]?.trim())}
              >
                <Plus className="w-4 h-4 mr-1" />Add Truth
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
