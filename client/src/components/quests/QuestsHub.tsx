import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Clock, Trophy, Target, Plus, ChevronRight, ChevronDown, RefreshCw, Edit, Globe, Trash2, Lock, Play, Eye, AlertTriangle,
} from 'lucide-react';
import { QuestCreateDialog } from '../QuestCreateDialog';
import { PredicatePalette } from '../prolog/PredicatePalette';
import { PrologQueryTester } from '../prolog/PrologQueryTester';
import { PrologSyntaxHighlight } from '../prolog/PrologSyntaxHighlight';
import { ContentValidationIndicator } from '../prolog/ContentValidationIndicator';
import { validateQuestContent } from '@shared/prolog/content-validators';
import { lintQuestContent, type LintWarning, type LintContext } from '@shared/prolog/quest-linter';
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
  titleTranslation: string | null;
  descriptionTranslation: string | null;
  objectivesTranslation: string[] | null;
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

const STATUS_GROUPS: Record<string, { label: string; icon: typeof Clock; color: string; description: string }> = {
  active: { label: 'Active', icon: Play, color: 'text-green-500', description: 'Currently pursued quest (only one at a time)' },
  available: { label: 'Available', icon: Eye, color: 'text-blue-500', description: 'Unlocked and selectable at game start' },
  unavailable: { label: 'Unavailable', icon: Lock, color: 'text-gray-400', description: 'Hidden until preconditions are met' },
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
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['active', 'available', 'unavailable']));
  const [expandedSection, setExpandedSection] = useState<'details' | 'predicates' | 'query' | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: quests = [] } = useQuery<Quest[]>({
    queryKey: ['/api/worlds', worldId, 'quests'],
    enabled: !!worldId,
  });

  // Load world entities for Prolog linting
  const { data: worldCharacters = [] } = useQuery<any[]>({
    queryKey: ['/api/worlds', worldId, 'characters'],
    queryFn: async () => {
      const res = await fetch(`/api/worlds/${worldId}/characters`);
      return res.ok ? res.json() : [];
    },
    enabled: !!worldId,
  });

  const { data: worldItems = [] } = useQuery<any[]>({
    queryKey: ['/api/worlds', worldId, 'items-for-lint'],
    queryFn: async () => {
      const res = await fetch(`/api/worlds/${worldId}/items`);
      return res.ok ? res.json() : [];
    },
    enabled: !!worldId,
  });

  const { data: worldData } = useQuery<any>({
    queryKey: ['/api/worlds', worldId, 'world-data'],
    queryFn: async () => {
      const res = await fetch(`/api/worlds/${worldId}`);
      return res.ok ? res.json() : null;
    },
    enabled: !!worldId,
  });

  // Build lint context from world data
  const lintContext = useMemo((): LintContext => ({
    characterNames: worldCharacters.map((c: any) => `${c.firstName || ''} ${c.lastName || ''}`.trim()),
    characterIds: worldCharacters.map((c: any) => c.id),
    locationNames: [], // Locations loaded per-settlement, skip for now
    locationIds: [],
    businessNames: [],
    itemNames: worldItems.map((i: any) => i.name),
    questIds: [
      ...quests.map(q => q.id),
      // Also include Prolog atom IDs extracted from quest content
      ...quests.map(q => q.content?.match(/quest\(\s*(\w+)/)?.[1]).filter(Boolean) as string[],
    ],
    targetLanguage: worldData?.targetLanguage,
  }), [worldCharacters, worldItems, quests, worldData]);

  // Lint selected quest
  const lintWarnings = useMemo((): LintWarning[] => {
    if (!selectedQuest?.content) return [];
    return lintQuestContent(selectedQuest.content, lintContext);
  }, [selectedQuest?.content, lintContext]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === quests.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(quests.map(q => q.id)));
    }
  };

  const handleBulkDelete = async () => {
    try {
      const res = await fetch(`/api/worlds/${worldId}/quests/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      if (res.ok) {
        const { deleted } = await res.json();
        toast({ title: `${deleted} quest${deleted !== 1 ? 's' : ''} deleted` });
        setSelectedIds(new Set());
        if (selectedIds.has(selectedQuest?.id || '')) setSelectedQuest(null);
        queryClient.invalidateQueries({ queryKey: ['/api/worlds', worldId, 'quests'] });
      } else {
        toast({ title: 'Failed to delete quests', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Failed to delete quests', variant: 'destructive' });
    }
    setBulkDeleteOpen(false);
  };

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

  const handleStatusChange = async (questId: string, newStatus: string) => {
    try {
      // If setting a quest to active, first demote any existing active quest to available
      if (newStatus === 'active') {
        const currentActive = quests.find(q => q.status === 'active' && q.id !== questId);
        if (currentActive) {
          await fetch(`/api/quests/${currentActive.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'available' }),
          });
        }
      }

      const res = await fetch(`/api/quests/${questId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const updated = await res.json();
        await queryClient.invalidateQueries({ queryKey: ['/api/worlds', worldId, 'quests'] });
        if (selectedQuest?.id === questId) {
          setSelectedQuest(updated);
        }
        toast({ title: `Quest set to ${newStatus}` });
      } else {
        toast({ title: 'Failed to update status', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Failed to update status', variant: 'destructive' });
    }
  };

  const getDifficultyColor = (difficulty: string) =>
    DIFFICULTY_COLORS[difficulty] || 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';

  const getTypeIcon = (type: string) => TYPE_ICONS[type] || '🎯';

  // Group quests by canonical starting status.
  // active = pursued at game start (only one), available = selectable, unavailable = locked
  const questGroups: Record<string, Quest[]> = {};
  quests.forEach(q => {
    const key = q.status === 'active' ? 'active' : q.status === 'unavailable' ? 'unavailable' : 'available';
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
    <div className="flex h-[calc(100vh-10rem)] min-h-[480px] gap-0 border border-white/20 dark:border-white/10 rounded-xl overflow-hidden bg-white/40 dark:bg-white/[0.02] backdrop-blur-xl">
      {/* Left Panel - Quest Tree */}
      <div className="w-56 flex-shrink-0 border-r border-white/15 dark:border-white/10 flex flex-col">
        <div className="p-3 border-b border-white/15 dark:border-white/10 flex items-center justify-between">
          <span className="text-sm font-semibold">Quests ({quests.length})</span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        {quests.length > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 border-b bg-muted/20">
            <Button variant="ghost" size="sm" className="h-6 text-[10px] px-1.5" onClick={toggleSelectAll}>
              {selectedIds.size === quests.length ? 'Deselect All' : 'Select All'}
            </Button>
            {selectedIds.size > 0 && (
              <Button variant="ghost" size="sm" className="h-6 text-[10px] px-1.5 text-destructive hover:text-destructive" onClick={() => setBulkDeleteOpen(true)}>
                <Trash2 className="w-3 h-3 mr-1" />
                Delete ({selectedIds.size})
              </Button>
            )}
          </div>
        )}

        <ScrollArea className="flex-1">
          {quests.length === 0 ? (
            <div className="p-3 text-xs text-muted-foreground text-center">No quests yet</div>
          ) : (
            <div className="p-2 space-y-1">
              {(['active', 'available', 'unavailable'] as const).map(status => {
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
                        <Checkbox
                          checked={selectedIds.has(quest.id)}
                          onClick={(e) => e.stopPropagation()}
                          onCheckedChange={() => toggleSelection(quest.id)}
                          className="h-3 w-3 mr-1 flex-shrink-0"
                        />
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
                  {selectedQuest.titleTranslation && (
                    <p className="text-xs text-muted-foreground italic mt-0.5">
                      EN: {selectedQuest.titleTranslation}
                    </p>
                  )}
                  {selectedQuest.descriptionTranslation && (
                    <p className="text-[10px] text-muted-foreground/70 italic mt-0.5">
                      EN: {selectedQuest.descriptionTranslation}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
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
                  <div className="space-y-2">
                    <div className="p-3 bg-purple-500/5 border border-purple-500/10 rounded-lg">
                      <PrologSyntaxHighlight code={selectedQuest.content} className="text-[11px]" />
                    </div>

                    {/* Lint Warnings */}
                    {lintWarnings.length > 0 && (
                      <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                        <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {lintWarnings.length} reference warning{lintWarnings.length !== 1 ? 's' : ''}
                        </p>
                        <div className="space-y-1.5">
                          {lintWarnings.map((w, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs">
                              <Badge variant="outline" className={`text-[9px] shrink-0 ${
                                w.type === 'character' ? 'text-blue-500 border-blue-500/30' :
                                w.type === 'location' ? 'text-green-500 border-green-500/30' :
                                w.type === 'item' ? 'text-purple-500 border-purple-500/30' :
                                w.type === 'language' ? 'text-cyan-500 border-cyan-500/30' :
                                'text-muted-foreground'
                              }`}>{w.type}</Badge>
                              <span className="text-muted-foreground">{w.message}</span>
                              {w.line && <span className="text-[9px] text-muted-foreground/60 ml-auto">L{w.line}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {lintWarnings.length === 0 && selectedQuest.content && (
                      <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 px-1">
                        <span>✓</span> All entity references valid
                      </div>
                    )}
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
                  <div className="p-1.5 bg-muted/30 rounded space-y-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Starting Status</span>
                    <div className="flex gap-1">
                      {(['active', 'available', 'unavailable'] as const).map(s => {
                        const cfg = STATUS_GROUPS[s];
                        const Icon = cfg.icon;
                        const isSelected = selectedQuest.status === s;
                        return (
                          <button
                            key={s}
                            title={cfg.description}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                              isSelected
                                ? s === 'active' ? 'bg-green-500/20 text-green-600 dark:text-green-400 ring-1 ring-green-500/30'
                                : s === 'available' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/30'
                                : 'bg-gray-500/20 text-gray-500 ring-1 ring-gray-500/30'
                                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                            }`}
                            onClick={() => !isSelected && handleStatusChange(selectedQuest.id, s)}
                          >
                            <Icon className="h-3 w-3" />
                            {cfg.label}
                          </button>
                        );
                      })}
                    </div>
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

              {/* Narrative Context (rich view for main quests, simple text for others) */}
              {selectedQuest.conversationContext && (() => {
                let narrativeCtx: any = null;
                try { narrativeCtx = JSON.parse(selectedQuest.conversationContext); } catch {}
                const isMainQuest = selectedQuest.questType === 'main_quest' || selectedQuest.tags?.includes('main_quest');

                if (isMainQuest && narrativeCtx?.introNarrative) {
                  return (
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Narrative Context</h4>
                      <div className="space-y-2">
                        <div className="p-2 bg-muted/30 rounded-lg">
                          <p className="text-[10px] font-semibold text-muted-foreground mb-0.5">Intro Narrative</p>
                          <p className="text-xs">{narrativeCtx.introNarrative}</p>
                        </div>
                        {narrativeCtx.mysteryDetails && (
                          <div className="p-2 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                            <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 mb-0.5">Mystery Details</p>
                            <p className="text-xs">{narrativeCtx.mysteryDetails}</p>
                          </div>
                        )}
                        {narrativeCtx.clueDescriptions?.length > 0 && (
                          <div className="p-2 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                            <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mb-1">Clues</p>
                            <div className="space-y-1">
                              {narrativeCtx.clueDescriptions.map((clue: any, i: number) => (
                                <div key={i} className="flex items-start gap-1.5">
                                  <span className="text-[10px] text-blue-500 mt-0.5">•</span>
                                  <div>
                                    <p className="text-xs">{clue.text}</p>
                                    {(clue.locationId || clue.npcRole) && (
                                      <div className="flex gap-1 mt-0.5">
                                        {clue.locationId && <span className="text-[9px] px-1 py-0 rounded bg-muted text-muted-foreground">{clue.locationId}</span>}
                                        {clue.npcRole && <span className="text-[9px] px-1 py-0 rounded bg-primary/10 text-primary">{clue.npcRole}</span>}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {narrativeCtx.outroNarrative && (
                          <div className="p-2 bg-green-500/5 border border-green-500/20 rounded-lg">
                            <p className="text-[10px] font-semibold text-green-600 dark:text-green-400 mb-0.5">Outro Narrative</p>
                            <p className="text-xs">{narrativeCtx.outroNarrative}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                // Simple text fallback for non-main quests
                return (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Context</h4>
                    <div className="p-2 bg-muted/30 rounded-lg">
                      <p className="text-[10px] text-muted-foreground">{selectedQuest.conversationContext}</p>
                    </div>
                  </div>
                );
              })()}

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

              {/* Continue Quest — only available during a playthrough, not in the editor */}
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

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} Quest{selectedIds.size !== 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the selected quests. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
