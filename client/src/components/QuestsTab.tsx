import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, Clock, XCircle, Trophy, Target, Plus, Star, Timer } from 'lucide-react';
import { QuestCreateDialog } from './QuestCreateDialog';
import { TruthContextPanel } from './TruthContextPanel';
import { ContentValidationIndicator } from './prolog/ContentValidationIndicator';
import { validateQuestContent } from '@shared/prolog/content-validators';
import { cefrLevelLabel } from '@shared/quest-difficulty';

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
  cefrLevel: string | null;
  difficultyStars: number | null;
  estimatedMinutes: number | null;
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
  content: string | null;
  conversationContext: string | null;
  tags: string[] | null;
  createdAt: Date;
  updatedAt: Date;
}

interface QuestsTabProps {
  worldId: string;
}

export function QuestsTab({ worldId }: QuestsTabProps) {
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const queryClient = useQueryClient();

  // Fetch quests
  const { data: quests = [] } = useQuery<Quest[]>({
    queryKey: ['/api/worlds', worldId, 'quests'],
    enabled: !!worldId,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'active':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Target className="w-4 h-4 text-gray-500" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'conversation':
        return '💬';
      case 'translation':
        return '🔄';
      case 'vocabulary':
        return '📚';
      case 'grammar':
        return '📝';
      case 'cultural':
        return '🌍';
      default:
        return '🎯';
    }
  };

  const getCefrBadgeColor = (level: string) => {
    switch (level) {
      case 'A1': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'A2': return 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200';
      case 'B1': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'B2': return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const renderDifficultyStars = (stars: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < stars ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
      />
    ));
  };

  // Validation of selected quest's Prolog content
  const questValidation = useMemo(() => {
    if (!selectedQuest?.content) return null;
    return validateQuestContent(selectedQuest.content);
  }, [selectedQuest?.content]);

  const activeQuests = quests.filter(q => q.status === 'active');
  const completedQuests = quests.filter(q => q.status === 'completed');
  const otherQuests = quests.filter(q => q.status !== 'active' && q.status !== 'completed');

  return (
    <div className="space-y-4 p-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Quests ({quests.length})
          </h2>
          <p className="text-muted-foreground mt-1">
            Create and manage narrative quests for your world
            {quests.length > 0 && (
              <span className="ml-2 text-xs">
                {activeQuests.length} active · {completedQuests.length} completed
              </span>
            )}
          </p>
        </div>
        <QuestCreateDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          worldId={worldId}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['/api/worlds', worldId, 'quests'] });
          }}
        >
          <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
            <Plus className="w-4 h-4 mr-2" />
            Create Quest
          </Button>
        </QuestCreateDialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quest List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active Quests */}
        {activeQuests.length > 0 && (
          <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-500/10 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
                Active Quests ({activeQuests.length})
              </CardTitle>
              <CardDescription>
                Language learning quests currently in progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {activeQuests.map((quest) => (
                    <Card
                      key={quest.id}
                      className={`cursor-pointer bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 rounded-xl ${
                        selectedQuest?.id === quest.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedQuest(quest)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xl">{getTypeIcon(quest.questType)}</span>
                              <h3 className="font-semibold">{quest.title}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {quest.description}
                            </p>
                            <div className="flex flex-wrap gap-2 items-center">
                              <Badge className={getDifficultyColor(quest.difficulty)}>
                                {quest.difficulty}
                              </Badge>
                              {quest.cefrLevel && (
                                <Badge className={getCefrBadgeColor(quest.cefrLevel)}>
                                  {quest.cefrLevel}
                                </Badge>
                              )}
                              {quest.difficultyStars && (
                                <span className="flex items-center gap-0.5" title={`Difficulty: ${quest.difficultyStars}/5`}>
                                  {renderDifficultyStars(quest.difficultyStars)}
                                </span>
                              )}
                              <Badge variant="outline">
                                {quest.targetLanguage}
                              </Badge>
                              <Badge variant="outline">
                                {quest.questType}
                              </Badge>
                              {quest.estimatedMinutes && (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Timer className="w-3 h-3" />
                                  ~{quest.estimatedMinutes}m
                                </span>
                              )}
                              {quest.assignedBy && (
                                <Badge variant="secondary">
                                  From: {quest.assignedBy}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {getStatusIcon(quest.status)}
                            <div className="flex items-center gap-1 text-sm text-amber-600">
                              <Trophy className="w-3 h-3" />
                              {quest.experienceReward} XP
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Completed Quests */}
        {completedQuests.length > 0 && (
          <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 bg-green-500/10 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                Completed Quests ({completedQuests.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-3">
                  {completedQuests.map((quest) => (
                    <Card
                      key={quest.id}
                      className="cursor-pointer bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 rounded-xl opacity-75 hover:opacity-100"
                      onClick={() => setSelectedQuest(quest)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{quest.title}</h3>
                            <p className="text-sm text-muted-foreground">{quest.description}</p>
                          </div>
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* No Quests */}
        {quests.length === 0 && (
          <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
            <CardContent className="py-12 text-center">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Quests Yet</h3>
              <p className="text-muted-foreground">
                Talk to characters to receive language learning quests!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quest Details Panel */}
      <div className="lg:col-span-1">
        {selectedQuest ? (
          <Card className="sticky top-4 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{getTypeIcon(selectedQuest.questType)}</span>
                Quest Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">{selectedQuest.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedQuest.description}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(selectedQuest.status)}
                    <span className="capitalize">{selectedQuest.status}</span>
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Difficulty:</span>
                  <div className="flex items-center gap-2">
                    <Badge className={getDifficultyColor(selectedQuest.difficulty)}>
                      {selectedQuest.difficulty}
                    </Badge>
                    {selectedQuest.difficultyStars && (
                      <span className="flex items-center gap-0.5">
                        {renderDifficultyStars(selectedQuest.difficultyStars)}
                      </span>
                    )}
                  </div>
                </div>

                {selectedQuest.cefrLevel && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">CEFR Level:</span>
                    <Badge className={getCefrBadgeColor(selectedQuest.cefrLevel)} title={cefrLevelLabel(selectedQuest.cefrLevel as any)}>
                      {selectedQuest.cefrLevel}
                    </Badge>
                  </div>
                )}

                {selectedQuest.estimatedMinutes && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Est. Time:</span>
                    <span className="flex items-center gap-1">
                      <Timer className="w-3 h-3" />
                      ~{selectedQuest.estimatedMinutes} min
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Language:</span>
                  <span>{selectedQuest.targetLanguage}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="capitalize">{selectedQuest.questType}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Reward:</span>
                  <div className="flex items-center gap-1 text-amber-600">
                    <Trophy className="w-3 h-3" />
                    {selectedQuest.experienceReward} XP
                  </div>
                </div>

                {selectedQuest.assignedBy && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Assigned by:</span>
                    <span>{selectedQuest.assignedBy}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Assigned:</span>
                  <span>{new Date(selectedQuest.assignedAt).toLocaleDateString()}</span>
                </div>

                {selectedQuest.completedAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Completed:</span>
                    <span>{new Date(selectedQuest.completedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {selectedQuest.completionCriteria && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Completion Criteria:</h4>
                  <p className="text-xs text-muted-foreground">
                    {selectedQuest.completionCriteria.description}
                  </p>

                  {/* Progress Display */}
                  {selectedQuest.progress && (
                    <div className="space-y-2">
                      {/* Vocabulary Usage Progress */}
                      {selectedQuest.completionCriteria.type === 'vocabulary_usage' && (
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Words Used:</span>
                            <span className="font-semibold">
                              {selectedQuest.progress.currentCount || 0} / {selectedQuest.completionCriteria.requiredCount}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{
                                width: `${Math.min(100, ((selectedQuest.progress.currentCount || 0) / selectedQuest.completionCriteria.requiredCount) * 100)}%`
                              }}
                            />
                          </div>
                          {selectedQuest.progress.wordsUsed && selectedQuest.progress.wordsUsed.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-semibold mb-1">Words you've used:</p>
                              <div className="flex flex-wrap gap-1">
                                {selectedQuest.progress.wordsUsed.map((word: string) => (
                                  <Badge key={word} variant="secondary" className="text-xs">
                                    {word}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Conversation Turns Progress */}
                      {selectedQuest.completionCriteria.type === 'conversation_turns' && (
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Conversation Turns:</span>
                            <span className="font-semibold">
                              {selectedQuest.progress.turnsCompleted || 0} / {selectedQuest.completionCriteria.requiredTurns}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{
                                width: `${Math.min(100, ((selectedQuest.progress.turnsCompleted || 0) / selectedQuest.completionCriteria.requiredTurns) * 100)}%`
                              }}
                            />
                          </div>
                          {selectedQuest.progress.keywordsUsed && selectedQuest.progress.keywordsUsed.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-semibold mb-1">Keywords used:</p>
                              <div className="flex flex-wrap gap-1">
                                {selectedQuest.progress.keywordsUsed.map((keyword: string) => (
                                  <Badge key={keyword} variant="secondary" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Grammar Pattern Progress */}
                      {selectedQuest.completionCriteria.type === 'grammar_pattern' && (
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Patterns Used:</span>
                            <span className="font-semibold">
                              {selectedQuest.progress.currentCount || 0} / {selectedQuest.completionCriteria.requiredCount}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{
                                width: `${Math.min(100, ((selectedQuest.progress.currentCount || 0) / selectedQuest.completionCriteria.requiredCount) * 100)}%`
                              }}
                            />
                          </div>
                          {selectedQuest.progress.patternsUsed && selectedQuest.progress.patternsUsed.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-semibold mb-1">Patterns used:</p>
                              <div className="flex flex-wrap gap-1">
                                {selectedQuest.progress.patternsUsed.map((pattern: string) => (
                                  <Badge key={pattern} variant="secondary" className="text-xs">
                                    {pattern}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Conversation Engagement Progress */}
                      {selectedQuest.completionCriteria.type === 'conversation_engagement' && (
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Messages Sent:</span>
                            <span className="font-semibold">
                              {selectedQuest.progress.messagesCount || 0} / {selectedQuest.completionCriteria.requiredMessages}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{
                                width: `${Math.min(100, ((selectedQuest.progress.messagesCount || 0) / selectedQuest.completionCriteria.requiredMessages) * 100)}%`
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {selectedQuest.conversationContext && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Context:</h4>
                  <p className="text-xs text-muted-foreground bg-slate-50 dark:bg-slate-900 p-3 rounded">
                    {selectedQuest.conversationContext.substring(0, 200)}...
                  </p>
                </div>
              )}

              {selectedQuest.status === 'active' && (
                <Button className="w-full" variant="default">
                  Continue Quest
                </Button>
              )}

              {/* Prolog Content Validation */}
              {questValidation && (
                <ContentValidationIndicator
                  validationResult={questValidation}
                  label="Prolog Validation"
                  defaultCollapsed={true}
                />
              )}

              {/* Truth Context Panel (US-2.06) */}
              <TruthContextPanel
                worldId={worldId}
                entityType="quest"
                entityId={selectedQuest?.id}
                entityName={selectedQuest?.title}
                entityTags={selectedQuest?.tags ?? undefined}
                defaultCollapsed={true}
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="sticky top-4 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
            <CardContent className="py-12 text-center">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                Select a quest to view details
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    </div>
  );
}
