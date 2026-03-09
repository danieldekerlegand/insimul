/**
 * Prolog Consistency Checker
 *
 * Checks a world's Prolog knowledge base for contradictions,
 * inconsistencies, missing data, and invalid values.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  ShieldCheck, AlertTriangle, AlertCircle, Info, RefreshCw, CheckCircle,
} from 'lucide-react';

interface ConsistencyIssue {
  type: 'contradiction' | 'inconsistency' | 'missing_data' | 'invalid_value';
  description: string;
  details?: any;
}

interface ConsistencyResult {
  issues: ConsistencyIssue[];
  issueCount: number;
  summary: {
    contradictions: number;
    inconsistencies: number;
    missingData: number;
    invalidValues: number;
  };
  knowledgeBaseStats: {
    factCount: number;
    ruleCount: number;
  };
}

interface PrologConsistencyCheckerProps {
  worldId: string;
}

const ISSUE_CONFIG: Record<string, { icon: typeof AlertTriangle; color: string; label: string }> = {
  contradiction: { icon: AlertCircle, color: 'text-red-500', label: 'Contradiction' },
  inconsistency: { icon: AlertTriangle, color: 'text-amber-500', label: 'Inconsistency' },
  missing_data: { icon: Info, color: 'text-blue-500', label: 'Missing Data' },
  invalid_value: { icon: AlertCircle, color: 'text-orange-500', label: 'Invalid Value' },
};

export function PrologConsistencyChecker({ worldId }: PrologConsistencyCheckerProps) {
  const [result, setResult] = useState<ConsistencyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const runCheck = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/prolog/tau/consistency-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worldId }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setResult(data);
        toast({
          title: data.issueCount === 0 ? 'All Clear' : `${data.issueCount} Issue${data.issueCount !== 1 ? 's' : ''} Found`,
          description: data.issueCount === 0
            ? 'No contradictions or inconsistencies detected'
            : `${data.summary.contradictions} contradictions, ${data.summary.inconsistencies} inconsistencies`,
          variant: data.issueCount > 0 ? 'destructive' : 'default',
        });
      } else {
        toast({ title: 'Check Failed', description: data.error, variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to run consistency check', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-green-500" />
        <h3 className="text-sm font-semibold">Consistency Checker</h3>
        <Button variant="outline" size="sm" className="ml-auto" onClick={runCheck} disabled={loading}>
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Run Check
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Scans the knowledge base for contradictions, inconsistencies, missing data, and invalid values.
      </p>

      {result && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-lg border bg-muted/20 text-center">
              <div className="text-lg font-bold">{result.knowledgeBaseStats.factCount}</div>
              <div className="text-[10px] text-muted-foreground">Facts</div>
            </div>
            <div className="p-2 rounded-lg border bg-muted/20 text-center">
              <div className="text-lg font-bold">{result.knowledgeBaseStats.ruleCount}</div>
              <div className="text-[10px] text-muted-foreground">Rules</div>
            </div>
          </div>

          {/* Issue summary */}
          <div className="flex flex-wrap gap-2">
            {result.summary.contradictions > 0 && (
              <Badge variant="destructive" className="text-xs">
                {result.summary.contradictions} contradiction{result.summary.contradictions !== 1 ? 's' : ''}
              </Badge>
            )}
            {result.summary.inconsistencies > 0 && (
              <Badge className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/20">
                {result.summary.inconsistencies} inconsistenc{result.summary.inconsistencies !== 1 ? 'ies' : 'y'}
              </Badge>
            )}
            {result.summary.missingData > 0 && (
              <Badge className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/20">
                {result.summary.missingData} missing
              </Badge>
            )}
            {result.summary.invalidValues > 0 && (
              <Badge className="text-xs bg-orange-500/10 text-orange-600 border-orange-500/20">
                {result.summary.invalidValues} invalid
              </Badge>
            )}
            {result.issueCount === 0 && (
              <Badge className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                <CheckCircle className="w-3 h-3 mr-1" />
                No issues found
              </Badge>
            )}
          </div>

          {/* Issue list */}
          {result.issues.length > 0 && (
            <ScrollArea className="h-64 border rounded-lg">
              <div className="p-2 space-y-1">
                {result.issues.map((issue, i) => {
                  const config = ISSUE_CONFIG[issue.type] || ISSUE_CONFIG.inconsistency;
                  const Icon = config.icon;
                  return (
                    <div key={i} className="flex items-start gap-2 p-2 rounded hover:bg-muted/30">
                      <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${config.color}`} />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs">{issue.description}</span>
                      </div>
                      <Badge variant="outline" className="text-[9px] shrink-0">{config.label}</Badge>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </>
      )}
    </div>
  );
}
