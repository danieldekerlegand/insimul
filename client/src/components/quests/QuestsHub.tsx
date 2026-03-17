import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircle2, Clock, XCircle, Trophy, Target, Plus, ChevronRight, ChevronDown, RefreshCw, Edit, Globe, Trash2,
} from 'lucide-react';
import { QuestCreateDialog } from '../QuestCreateDialog';
import { PredicatePalette } from '../prolog/PredicatePalette';
import { PrologQueryTester } from '../prolog/PrologQueryTester';
import { PrologSyntaxHighlight } from '../prolog/PrologSyntaxHighlight';
import { ContentValidationIndicator } from '../prolog/ContentValidationIndicator';
import { validateQuestContent } from '@shared/prolog/content-validators';
import { QuestChecklist } from './QuestChecklist';

interface Quest {
  id: string;
  worldId: string;
  assignedTo: string;
  assignedBy: string | null;
  assignedToCharacterId: string | null;
  assignedByCharacterId: string | null;
  title: string;
  description: string;
  questType: string;
  difficulty: string;
  targetLanguage: string;
  objectives: any[] | null;
  progress: Record<string, any> | null;
  status: string;
  completionCriteria: Record<string, any> | null;
  experienceReward: number;
  rewards: Record<string, any> | null;
  assignedAt: Date;
  completedAt: Date | null;
  expiresAt: Date | null;
  conversationContext: string | null;
  tags: string[] | null;
  content: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface QuestsHubProps {
  worldId: string;
}

const STATUS_GROUPS: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  active: { label: 'Active', icon: Clock, color: 'text-blue-500' },
  completed: { label: 'Completed', icon: CheckCircle2, color: 'text-green-500' },
  failed: { label: 'Failed', icon: XCircle, color: 'text-red-500' },
  pending: { label: 'Pending', icon: Target, color: 'text-gray-500' },
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  intermediate: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
  advanced: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
};

const TYPE_ICONS: Record<string, string> = {
  conversation: '💬',
  translation: '🔄',
  vocabulary: '📚',
  grammar: '📝',
  cultural: '🌍',
};

export function QuestsHub({ worldId }: QuestsHubProps) {
  const { toast } = useToast();
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['active']));
  const [expandedSection, setExpandedSection] = useState<'details' | 'predicates' | 'query' | null>(null);
  const queryClient = useQueryClient();

  const { data: quests = [] } = useQuery<Quest[]>({
    queryKey: ['/api/worlds', worldId, 'quests'],
    enabled: !!worldId,
  });

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const selectQuest = async (quest: Quest) => {
    setSelectedQuest(quest);
    try {
      const res = await fetch(`/api/quests/${quest.id}`);
      if (res.ok) {
        setSelectedQuest(await res.json());
      }
    } catch {
      // Use partial data
    }
  };

  const getStatusIcon = (status: string) => {
    const group = STATUS_GROUPS[status];
    if (!group) return <Target className="w-3.5 h-3.5 text-gray-500" />;
    const Icon = group.icon;
    return <Icon className={`w-3.5 h-3.5 ${group.color}`} />;
  };

  const getDifficultyColor = (difficulty: string) =>
    DIFFICULTY_COLORS[difficulty] || 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';

  const getTypeIcon = (type: string) => TYPE_ICONS[type] || '🎯';

  // Group quests by status
  const questGroups: Record<string, Quest[]> = {};
  quests.forEach(q => {
    const key = q.status || 'pending';
    if (!questGroups[key]) questGroups[key] = [];
    questGroups[key].push(q);
  });

  // Validation of current content
  const questValidation = useMemo(() => {
    if (!selectedQuest?.content) return null;
    return validateQuestContent(selectedQuest.content);
  }, [selectedQuest?.content]);

  // Render progress bar helper
  const renderProgressBar = (current: number, total: number) => (
    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-1">
      <div
        className="bg-blue-500 h-1.5 rounded-full transition-all"
        style={{ width: `${Math.min(100, (current / total) * 100)}%` }}
      />
    </div>
  );

  return (
    <div className="flex h-[640px] gap-0 border border-white/20 dark:border-white/10 rounded-xl overflow-hidden bg-white/40 dark:bg-white/[0.02] backdrop-blur-xl">
      {/* Left Panel - Quest Tree */}
      <div className="w-56 flex-shrink-0 border-r border-white/15 dark:border-white/10 flex flex-col">
        <div className="p-3 border-b border-white/15 dark:border-white/10 flex items-center justify-between">
          <span className="text-sm font-semibold">Quests ({quests.length})</span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          {quests.length === 0 ? (
            <div className="p-3 text-xs text-muted-foreground text-center">No quests yet</div>
          ) : (
            <div className="p-2 space-y-1">
              {(['active', 'pending', 'completed', 'failed'] as const).map(status => {
                const group = questGroups[status];
                if (!group || group.length === 0) return null;
                const statusConfig = STATUS_GROUPS[status];
                const StatusIcon = statusConfig?.icon || Target;
                return (
                  <div key={status}>
                    <button
                      className="w-full flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors rounded-md"
                      onClick={() => toggleGroup(status)}
                    >
                      {expandedGroups.has(status) ? (
                        <ChevronDown className="h-3 w-3 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-3 w-3 flex-shrink-0" />
                      )}
                      <StatusIcon className={`h-3 w-3 flex-shrink-0 ${statusConfig?.color || ''}`} />
                      <span className="truncate">{statusConfig?.label || status}</span>
                      <span className="ml-auto text-[10px] opacity-60">{group.length}</span>
                    </button>

                    {expandedGroups.has(status) && group.map(quest => (
                      <button
                        key={quest.id}
                        className={`w-full text-left px-5 py-1 text-xs rounded-sm transition-colors break-words ${
                          selectedQuest?.id === quest.id
                            ? 'bg-primary/15 text-primary font-medium'
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        }`}
                        onClick={() => selectQuest(quest)}
                      >
                        <span className="mr-1">{getTypeIcon(quest.questType)}</span>
                        {quest.title}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Center Panel - Quest Detail */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedQuest ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-white/15 dark:border-white/10">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getTypeIcon(selectedQuest.questType)}</span>
                    <h2 className="text-lg font-semibold truncate">{selectedQuest.title}</h2>
                    <Badge className={`text-[10px] border ${getDifficultyColor(selectedQuest.difficulty)}`}>
                      {selectedQuest.difficulty}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedQuest.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {getStatusIcon(selectedQuest.status)}
                  <span className="text-xs capitalize font-medium">{selectedQuest.status}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={async () => {
                      if (!confirm(`Delete quest "${selectedQuest.title}"?`)) return;
                      try {
                        const res = await fetch(`/api/quests/${selectedQuest.id}`, { method: 'DELETE' });
                        if (res.ok) {
                          setSelectedQuest(null);
                          queryClient.invalidateQueries({ queryKey: ['/api/worlds', worldId, 'quests'] });
                          toast({ title: 'Quest deleted' });
                        } else {
                          toast({ title: 'Error', description: 'Failed to delete quest', variant: 'destructive' });
                        }
                      } catch {
                        toast({ title: 'Error', description: 'Failed to delete quest', variant: 'destructive' });
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Prolog Content */}
            <ScrollArea className="flex-1">
              <div className="p-4">
                {selectedQuest.content ? (
                  <div className="p-3 bg-purple-500/5 border border-purple-500/10 rounded-lg">
                    <PrologSyntaxHighlight code={selectedQuest.content} className="text-[11px]" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <p className="text-xs text-muted-foreground italic">No Prolog content generated yet</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={async () => {
                        try {
                          const res = await fetch(`/api/quests/${selectedQuest.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ title: selectedQuest.title }),
                          });
                          if (res.ok) {
                            const updated = await res.json();
                            setSelectedQuest(updated);
                            toast({ title: 'Prolog Generated' });
                          }
                        } catch (e) {
                          toast({ title: 'Error', description: 'Failed to generate Prolog', variant: 'destructive' });
                        }
                      }}
                    >
                      <RefreshCw className="w-3 h-3 mr-1" /> Generate Prolog
                    </Button>
                  </div>
                )}
              </div>

              {/* Prolog Content Validation */}
              {questValidation && (
                <div className="px-4 pb-2 shrink-0">
                  <ContentValidationIndicator
                    validationResult={questValidation}
                    label="Prolog Validation"
                    defaultCollapsed={true}
                  />
                </div>
              )}
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center space-y-2">
              <Target className="h-10 w-10 mx-auto opacity-20" />
              <p className="text-sm">Select a quest to view details</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Collapsible Sections */}
      <div className="w-64 flex-shrink-0 border-l border-white/15 dark:border-white/10 flex flex-col min-h-0">
        {[
          { id: 'details' as const, label: 'Details', icon: Target },
          { id: 'predicates' as const, label: 'Predicates', icon: Edit },
          { id: 'query' as const, label: 'Query', icon: Globe },
        ].map((section, idx) => {
          const isExpanded = expandedSection === section.id;
          const Icon = section.icon;

          return (
            <div
              key={section.id}
              className={`flex flex-col min-h-0 ${idx > 0 ? 'border-t' : ''} ${isExpanded ? 'flex-1' : ''}`}
            >
              {/* Section header */}
              <button
                className="flex items-center gap-1.5 px-3 py-2 border-b bg-muted/30 shrink-0 hover:bg-muted/50 transition-colors text-left"
                onClick={() => setExpandedSection(isExpanded ? null : section.id)}
              >
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.label}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground ml-auto transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
              </button>

              {/* Section content */}
              {isExpanded && (
                <div className="flex-1 min-h-0 flex flex-col">
                  {section.id === 'predicates' && (
                    <PredicatePalette compact onInsert={(text) => navigator.clipboard.writeText(text)} />
                  )}

                  {section.id === 'query' && (
                    <PrologQueryTester worldId={worldId} compact />
                  )}

                  {section.id === 'details' && (
                    <ScrollArea className="flex-1">
          {selectedQuest ? (
            <div className="p-3 space-y-4">
              {/* Properties */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Properties</h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center p-1.5 bg-muted/30 rounded">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Type</span>
                    <span className="text-xs font-medium capitalize">{selectedQuest.questType}</span>
                  </div>
                  <div className="flex justify-between items-center p-1.5 bg-muted/30 rounded">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Language</span>
                    <span className="text-xs font-medium">{selectedQuest.targetLanguage}</span>
                  </div>
                  <div className="flex justify-between items-center p-1.5 bg-muted/30 rounded">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Difficulty</span>
                    <Badge className={`text-[10px] border ${getDifficultyColor(selectedQuest.difficulty)}`}>
                      {selectedQuest.difficulty}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-1.5 bg-muted/30 rounded">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Reward</span>
                    <span className="text-xs font-medium text-amber-600 flex items-center gap-1">
                      <Trophy className="h-3 w-3 text-amber-500" />
                      {selectedQuest.experienceReward} XP
                    </span>
                  </div>
                  {selectedQuest.assignedBy && (
                    <div className="flex justify-between items-center p-1.5 bg-muted/30 rounded">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Assigned By</span>
                      <span className="text-xs font-medium">{selectedQuest.assignedBy}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center p-1.5 bg-muted/30 rounded">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Assigned</span>
                    <span className="text-xs font-medium">{new Date(selectedQuest.assignedAt).toLocaleDateString()}</span>
                  </div>
                  {selectedQuest.completedAt && (
                    <div className="flex justify-between items-center p-1.5 bg-muted/30 rounded">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Completed</span>
                      <span className="text-xs font-medium">{new Date(selectedQuest.completedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  {selectedQuest.expiresAt && (
                    <div className="flex justify-between items-center p-1.5 bg-muted/30 rounded">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Expires</span>
                      <span className="text-xs font-medium">{new Date(selectedQuest.expiresAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Objectives */}
              {selectedQuest.objectives && selectedQuest.objectives.length > 0 && (
                <QuestChecklist objectives={selectedQuest.objectives} compact />
              )}

              {/* Completion Criteria & Progress */}
              {selectedQuest.completionCriteria && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Completion Criteria</h4>
                  {selectedQuest.completionCriteria.description && (
                    <p className="text-[10px] text-muted-foreground mb-2">{selectedQuest.completionCriteria.description}</p>
                  )}

                  {selectedQuest.progress && (
                    <div className="space-y-2">
                      {selectedQuest.completionCriteria.type === 'vocabulary_usage' && (
                        <div className="p-2 bg-muted/30 rounded-lg">
                          <div className="flex justify-between text-[10px] mb-0.5">
                            <span>Words Used</span>
                            <span className="font-semibold">
                              {selectedQuest.progress.currentCount || 0} / {selectedQuest.completionCriteria.requiredCount}
                            </span>
                          </div>
                          {renderProgressBar(selectedQuest.progress.currentCount || 0, selectedQuest.completionCriteria.requiredCount)}
                          {selectedQuest.progress.wordsUsed?.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {selectedQuest.progress.wordsUsed.map((word: string) => (
                                <Badge key={word} variant="secondary" className="text-[9px]">{word}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {selectedQuest.completionCriteria.type === 'conversation_turns' && (
                        <div className="p-2 bg-muted/30 rounded-lg">
                          <div className="flex justify-between text-[10px] mb-0.5">
                            <span>Turns</span>
                            <span className="font-semibold">
                              {selectedQuest.progress.turnsCompleted || 0} / {selectedQuest.completionCriteria.requiredTurns}
                            </span>
                          </div>
                          {renderProgressBar(selectedQuest.progress.turnsCompleted || 0, selectedQuest.completionCriteria.requiredTurns)}
                          {selectedQuest.progress.keywordsUsed?.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {selectedQuest.progress.keywordsUsed.map((kw: string) => (
                                <Badge key={kw} variant="secondary" className="text-[9px]">{kw}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {selectedQuest.completionCriteria.type === 'grammar_pattern' && (
                        <div className="p-2 bg-muted/30 rounded-lg">
                          <div className="flex justify-between text-[10px] mb-0.5">
                            <span>Patterns</span>
                            <span className="font-semibold">
                              {selectedQuest.progress.currentCount || 0} / {selectedQuest.completionCriteria.requiredCount}
                            </span>
                          </div>
                          {renderProgressBar(selectedQuest.progress.currentCount || 0, selectedQuest.completionCriteria.requiredCount)}
                          {selectedQuest.progress.patternsUsed?.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {selectedQuest.progress.patternsUsed.map((p: string) => (
                                <Badge key={p} variant="secondary" className="text-[9px]">{p}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {selectedQuest.completionCriteria.type === 'conversation_engagement' && (
                        <div className="p-2 bg-muted/30 rounded-lg">
                          <div className="flex justify-between text-[10px] mb-0.5">
                            <span>Messages</span>
                            <span className="font-semibold">
                              {selectedQuest.progress.messagesCount || 0} / {selectedQuest.completionCriteria.requiredMessages}
                            </span>
                          </div>
                          {renderProgressBar(selectedQuest.progress.messagesCount || 0, selectedQuest.completionCriteria.requiredMessages)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Rewards */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Rewards</h4>
                <div className="p-2 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <Trophy className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-xs font-medium text-amber-600">{selectedQuest.experienceReward} XP</span>
                  </div>
                  {selectedQuest.rewards && Object.keys(selectedQuest.rewards).length > 0 && (
                    <div className="mt-1.5">
                      <pre className="text-[10px] whitespace-pre-wrap break-all font-mono">
                        {JSON.stringify(selectedQuest.rewards, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              {/* Context */}
              {selectedQuest.conversationContext && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Context</h4>
                  <div className="p-2 bg-muted/30 rounded-lg">
                    <p className="text-[10px] text-muted-foreground">{selectedQuest.conversationContext}</p>
                  </div>
                </div>
              )}

              {/* Tags */}
              {selectedQuest.tags && selectedQuest.tags.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedQuest.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-[9px]">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Continue Quest Button */}
              {selectedQuest.status === 'active' && (
                <Button className="w-full" variant="default" size="sm">
                  Continue Quest
                </Button>
              )}
            </div>
          ) : (
            <div className="p-3 text-xs text-muted-foreground italic">
              Select a quest to see details
            </div>
          )}
                    </ScrollArea>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Dialog */}
      <QuestCreateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        worldId={worldId}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['/api/worlds', worldId, 'quests'] });
        }}
      />
    </div>
  );
}
