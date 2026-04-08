import { CheckCircle2, Circle, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export interface QuestObjective {
  type: string;
  description?: string;
  completed: boolean;
  current?: number;
  required?: number;
}

interface QuestChecklistProps {
  objectives: QuestObjective[];
  /** Compact mode uses smaller text/spacing (for card previews) */
  compact?: boolean;
  className?: string;
}

/** Icon for objective type */
function getObjectiveIcon(type: string): string {
  switch (type) {
    case 'visit_location':
    case 'discover_location':
      return '\u{1F4CD}';
    case 'talk_to_npc':
    case 'complete_conversation':
    case 'conversation':
      return '\u{1F4AC}';
    case 'use_vocabulary':
    case 'collect_vocabulary':
    case 'vocabulary':
      return '\u{1F4DA}';
    case 'grammar':
      return '\u{1F4DD}';
    case 'collect_text':
    case 'find_text':
    case 'read_text':
    case 'read_sign':
      return '\u{1F4D6}';
    case 'identify_object':
      return '\u{1F50D}';
    case 'collect_item':
    case 'deliver_item':
      return '\u{1F4E6}';
    case 'defeat_enemies':
      return '\u2694\uFE0F';
    case 'craft_item':
      return '\u{1F528}';
    case 'escort_npc':
      return '\u{1F6E1}\uFE0F';
    case 'listening_comprehension':
      return '\u{1F3A7}';
    case 'translation_challenge':
      return '\u{1F504}';
    case 'navigate_language':
    case 'follow_directions':
      return '\u{1F9ED}';
    case 'pronunciation_check':
      return '\u{1F3A4}';
    case 'gain_reputation':
      return '\u2B50';
    case 'write_response':
      return '\u270D\uFE0F';
    default:
      return '\u{1F3AF}';
  }
}

/** Tooltip hint explaining what counts toward a meta-objective */
function getObjectiveHint(type: string): string | undefined {
  const hints: Record<string, string> = {
    vocabulary: 'Any word learned or used in conversation',
    use_vocabulary: 'Use target-language words in conversation',
    collect_vocabulary: 'Find and learn new words',
    conversation: 'Any NPC conversation counts',
    complete_conversation: 'Complete conversations with NPCs',
    grammar: 'Positive grammar feedback counts',
    collect_text: 'Find books, letters, or journals',
    find_text: 'Discover texts around town',
    read_text: 'Read collected texts',
    read_sign: 'Read signs and notices',
  };
  return hints[type];
}

export function QuestChecklist({ objectives, compact = false, className }: QuestChecklistProps) {
  if (!objectives || objectives.length === 0) {
    return (
      <div className={cn('flex items-center gap-2 text-muted-foreground', compact ? 'text-[10px]' : 'text-xs', className)}>
        <Target className="w-3 h-3" />
        No objectives defined
      </div>
    );
  }

  const completedCount = objectives.filter(o => o.completed).length;
  const totalCount = objectives.length;
  const overallProgress = Math.round((completedCount / totalCount) * 100);

  return (
    <div className={cn('space-y-1.5', className)}>
      {/* Summary bar */}
      <div className="flex items-center gap-2">
        <span className={cn('font-semibold text-muted-foreground uppercase tracking-wider', compact ? 'text-[9px]' : 'text-[10px]')}>
          Objectives
        </span>
        <span className={cn('font-medium', compact ? 'text-[9px]' : 'text-[10px]',
          completedCount === totalCount ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
        )}>
          {completedCount}/{totalCount}
        </span>
        <Progress value={overallProgress} className={cn('flex-1', compact ? 'h-1' : 'h-1.5')} />
      </div>

      {/* Objective items */}
      <div className={cn('space-y-0.5', compact ? 'pl-0' : 'pl-1')}>
        {objectives.map((obj, i) => (
          <ObjectiveItem key={i} objective={obj} compact={compact} />
        ))}
      </div>
    </div>
  );
}

function ObjectiveItem({ objective, compact }: { objective: QuestObjective; compact: boolean }) {
  const hasProgress = objective.required != null && objective.required > 1;
  const current = objective.current ?? 0;
  const required = objective.required ?? 1;
  const itemProgress = hasProgress ? Math.min(Math.round((current / required) * 100), 100) : 0;

  const label = objective.description || objective.type.replace(/_/g, ' ');
  const progressSuffix = hasProgress ? ` (${current}/${required})` : '';
  const hint = getObjectiveHint(objective.type);

  return (
    <div className="group">
      <div className="flex items-start gap-1.5" title={hint}>
        {/* Completion indicator */}
        {objective.completed ? (
          <CheckCircle2 className={cn('flex-shrink-0 text-green-500', compact ? 'w-3 h-3 mt-0.5' : 'w-3.5 h-3.5 mt-0.5')} />
        ) : (
          <Circle className={cn('flex-shrink-0 text-muted-foreground/50', compact ? 'w-3 h-3 mt-0.5' : 'w-3.5 h-3.5 mt-0.5')} />
        )}

        {/* Type icon + description */}
        <div className="flex-1 min-w-0">
          <span className={cn(
            compact ? 'text-[10px]' : 'text-xs',
            objective.completed
              ? 'text-green-600 dark:text-green-400 line-through opacity-75'
              : 'text-foreground'
          )}>
            <span className={compact ? 'text-[10px]' : 'text-xs'}>{getObjectiveIcon(objective.type)} </span>
            {label}
            {progressSuffix && (
              <span className="text-muted-foreground font-medium">{progressSuffix}</span>
            )}
          </span>
          {/* Hint text for incomplete meta-objectives */}
          {hint && !objective.completed && !compact && (
            <div className="text-[9px] text-muted-foreground/70 italic mt-0.5">{hint}</div>
          )}
        </div>
      </div>

      {/* Per-objective progress bar (only for incomplete countable objectives) */}
      {hasProgress && !objective.completed && (
        <div className="ml-5 mt-0.5">
          <Progress value={itemProgress} className="h-1" />
        </div>
      )}
    </div>
  );
}
