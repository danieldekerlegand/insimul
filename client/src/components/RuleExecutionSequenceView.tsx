import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ChevronDown, ChevronRight, Zap, CheckCircle, XCircle } from 'lucide-react';

interface RuleExecutionRecord {
  timestep: number;
  ruleId: string;
  ruleName: string;
  ruleType: string;
  conditions: any[];
  effectsExecuted: Array<{
    type: string;
    description: string;
    success: boolean;
  }>;
  charactersAffected: string[];
  narrativeGenerated: string | null;
  timestamp: Date;
}

interface RuleExecutionSequenceViewProps {
  ruleExecutionSequence: RuleExecutionRecord[];
  currentTimestep?: number;
}

export function RuleExecutionSequenceView({
  ruleExecutionSequence,
  currentTimestep
}: RuleExecutionSequenceViewProps) {
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set());

  // Filter rules by timestep if specified
  const filteredRules = currentTimestep !== undefined
    ? ruleExecutionSequence.filter(record => record.timestep === currentTimestep)
    : ruleExecutionSequence;

  // Group rules by timestep
  const rulesByTimestep = filteredRules.reduce((acc, record) => {
    const timestep = record.timestep;
    if (!acc.has(timestep)) {
      acc.set(timestep, []);
    }
    acc.get(timestep)!.push(record);
    return acc;
  }, new Map<number, RuleExecutionRecord[]>());

  const toggleRule = (ruleKey: string) => {
    setExpandedRules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ruleKey)) {
        newSet.delete(ruleKey);
      } else {
        newSet.add(ruleKey);
      }
      return newSet;
    });
  };

  const getRuleTypeColor = (ruleType: string) => {
    const colorMap: Record<string, string> = {
      insimul: 'bg-blue-100 text-blue-800',
      prolog: 'bg-purple-100 text-purple-800',
      kismet: 'bg-green-100 text-green-800',
      default: 'bg-gray-100 text-gray-800',
    };
    return colorMap[ruleType] || colorMap.default;
  };

  if (filteredRules.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Rule Execution Sequence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No rules executed yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Rule Execution Sequence ({filteredRules.length} rules)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from(rulesByTimestep.entries())
            .sort(([a], [b]) => a - b)
            .map(([timestep, records]) => (
              <div key={timestep} className="border-l-2 border-blue-500 pl-4">
                <div className="font-semibold text-sm text-muted-foreground mb-2">
                  Timestep {timestep}
                </div>
                <div className="space-y-2">
                  {records.map((record, index) => {
                    const ruleKey = `${record.timestep}-${record.ruleId}-${index}`;
                    const isExpanded = expandedRules.has(ruleKey);

                    return (
                      <Card key={ruleKey} className="bg-slate-50 dark:bg-slate-900">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-0 h-6 w-6"
                                onClick={() => toggleRule(ruleKey)}
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </Button>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Zap className="w-4 h-4 text-blue-600" />
                                  <span className="font-semibold">{record.ruleName}</span>
                                  <Badge
                                    variant="outline"
                                    className={getRuleTypeColor(record.ruleType)}
                                  >
                                    {record.ruleType}
                                  </Badge>
                                </div>

                                {record.narrativeGenerated && (
                                  <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded text-sm">
                                    <div className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                                      Narrative Generated:
                                    </div>
                                    <p className="text-amber-800 dark:text-amber-200 italic">
                                      {record.narrativeGenerated}
                                    </p>
                                  </div>
                                )}

                                {isExpanded && (
                                  <div className="mt-3 space-y-3">
                                    {/* Effects */}
                                    {record.effectsExecuted.length > 0 && (
                                      <div>
                                        <div className="text-xs font-semibold text-muted-foreground mb-1">
                                          Effects Executed ({record.effectsExecuted.length}):
                                        </div>
                                        <div className="space-y-1">
                                          {record.effectsExecuted.map((effect, idx) => (
                                            <div
                                              key={idx}
                                              className="flex items-start gap-2 text-sm"
                                            >
                                              {effect.success ? (
                                                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                                              ) : (
                                                <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
                                              )}
                                              <div className="flex-1">
                                                <Badge
                                                  variant="outline"
                                                  className="text-xs mr-2"
                                                >
                                                  {effect.type}
                                                </Badge>
                                                <span className="text-muted-foreground">
                                                  {effect.description}
                                                </span>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Characters Affected */}
                                    {record.charactersAffected.length > 0 && (
                                      <div>
                                        <div className="text-xs font-semibold text-muted-foreground mb-1">
                                          Characters Affected:
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                          {record.charactersAffected.map((charId) => (
                                            <Badge key={charId} variant="secondary" className="text-xs">
                                              {charId}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Timestamp */}
                                    <div className="text-xs text-muted-foreground">
                                      Executed at: {new Date(record.timestamp).toLocaleString()}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
