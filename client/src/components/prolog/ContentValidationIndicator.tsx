import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronRight } from 'lucide-react';
import type { ValidationResult } from '@shared/prolog/content-validators';

interface ContentValidationIndicatorProps {
  validationResult: ValidationResult;
  /** Label shown next to the badge, e.g. "Prolog Validation" */
  label?: string;
  /** Start collapsed (default: true) */
  defaultCollapsed?: boolean;
}

/**
 * Displays a validation status indicator (green/yellow/red) with a collapsible
 * detail section showing errors and warnings from Prolog content validation.
 */
export function ContentValidationIndicator({
  validationResult,
  label = 'Validation',
  defaultCollapsed = true,
}: ContentValidationIndicatorProps) {
  const [isOpen, setIsOpen] = useState(!defaultCollapsed);

  const { errors, warnings, detectedPredicates } = validationResult;

  const status: 'valid' | 'warning' | 'error' =
    errors.length > 0 ? 'error' : warnings.length > 0 ? 'warning' : 'valid';

  const statusConfig = {
    valid: {
      icon: CheckCircle2,
      badgeClass: 'bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400',
      text: 'Valid',
    },
    warning: {
      icon: AlertTriangle,
      badgeClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:text-yellow-400',
      text: `${warnings.length} warning${warnings.length !== 1 ? 's' : ''}`,
    },
    error: {
      icon: XCircle,
      badgeClass: 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400',
      text: `${errors.length} error${errors.length !== 1 ? 's' : ''}${warnings.length > 0 ? `, ${warnings.length} warning${warnings.length !== 1 ? 's' : ''}` : ''}`,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;
  const hasMessages = errors.length > 0 || warnings.length > 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-lg">
        <CollapsibleTrigger asChild>
          <button
            className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/30 rounded-lg transition-colors"
            disabled={!hasMessages && detectedPredicates.length === 0}
          >
            {hasMessages || detectedPredicates.length > 0 ? (
              isOpen
                ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            ) : null}
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span className="text-xs font-medium text-muted-foreground">{label}</span>
            <Badge variant="outline" className={`ml-auto text-xs ${config.badgeClass}`}>
              {config.text}
            </Badge>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-2">
            {errors.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">
                  Errors
                </span>
                {errors.map((error, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-1.5 text-xs text-red-600 dark:text-red-400 bg-red-500/5 rounded px-2 py-1.5"
                  >
                    <XCircle className="w-3 h-3 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                ))}
              </div>
            )}

            {warnings.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider">
                  Warnings
                </span>
                {warnings.map((warning, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-1.5 text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-500/5 rounded px-2 py-1.5"
                  >
                    <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                    <span>{warning}</span>
                  </div>
                ))}
              </div>
            )}

            {detectedPredicates.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Detected Predicates
                </span>
                <div className="flex flex-wrap gap-1">
                  {detectedPredicates.map((pred) => (
                    <Badge
                      key={pred}
                      variant="secondary"
                      className="text-xs font-mono"
                    >
                      {pred}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
