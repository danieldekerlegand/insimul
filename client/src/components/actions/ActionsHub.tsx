import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Zap, Plus, ChevronRight, ChevronDown, Edit, Globe, Trash2,
  Target, Clock, Battery, TrendingUp, Tag, RefreshCw,
} from 'lucide-react';
import { ActionCreateDialog } from '../ActionCreateDialog';
import { ActionEditDialog } from '../ActionEditDialog';
import { PredicatePalette } from '../prolog/PredicatePalette';
import { PrologQueryTester } from '../prolog/PrologQueryTester';
import { PrologSyntaxHighlight } from '../prolog/PrologSyntaxHighlight';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface ActionsHubProps {
  worldId: string;
}

type TreeSection = 'world' | 'base';

interface Action {
  id: string;
  worldId: string;
  name: string;
  description: string | null;
  actionType: string;
  category: string | null;
  duration: number | null;
  difficulty: number | null;
  energyCost: number | null;
  prerequisites: any[];
  effects: any[];
  sideEffects: any[];
  targetType: string | null;
  requiresTarget: boolean | null;
  range: number | null;
  isAvailable: boolean | null;
  cooldown: number | null;
  triggerConditions: any[];
  verbPast: string | null;
  verbPresent: string | null;
  narrativeTemplates: string[];
  sourceFormat: string | null;
  prologContent: string | null;
  customData: Record<string, any>;
  tags: string[];
  createdAt: Date | null;
  updatedAt: Date | null;
}

const ACTION_TYPE_LABELS: Record<string, string> = {
  social: 'Social Actions',
  physical: 'Physical Actions',
  mental: 'Mental Actions',
  economic: 'Economic Actions',
  magical: 'Magical Actions',
  political: 'Political Actions',
};

const ACTION_TYPE_COLORS: Record<string, string> = {
  social: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  physical: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  mental: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  economic: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  magical: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  political: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
};

export function ActionsHub({ worldId }: ActionsHubProps) {
  const { toast } = useToast();

  // Data
  const [actions, setActions] = useState<Action[]>([]);
  const [baseActions, setBaseActions] = useState<Action[]>([]);
  const [enabledBaseActionIds, setEnabledBaseActionIds] = useState<string[]>([]);

  // Tree navigation
  const [activeSection, setActiveSection] = useState<TreeSection>('world');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Selection
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);

  // Code view toggle
  const [codeView, setCodeView] = useState<'source' | 'prolog'>('source');

  // Right panel tab
  const [rightTab, setRightTab] = useState<'details' | 'predicates' | 'query'>('details');

  // Dialogs
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [actionToEdit, setActionToEdit] = useState<Action | null>(null);

  useEffect(() => {
    if (worldId) fetchActions();
  }, [worldId]);

  const fetchActions = async () => {
    try {
      const [actionsRes, baseRes, configRes] = await Promise.all([
        fetch(`/api/worlds/${worldId}/actions`),
        fetch('/api/actions/base'),
        fetch(`/api/worlds/${worldId}/base-resources/config`),
      ]);

      if (actionsRes.ok) {
        setActions(await actionsRes.json());
      }

      let baseData: Action[] = [];
      if (baseRes.ok) {
        baseData = await baseRes.json();
        setBaseActions(baseData);
      }

      if (configRes.ok) {
        const config = await configRes.json();
        const enabled = config.disabledBaseActions?.length > 0
          ? baseData.filter((a: Action) => !config.disabledBaseActions.includes(a.id)).map((a: Action) => a.id)
          : baseData.map((a: Action) => a.id);
        setEnabledBaseActionIds(enabled);
      }
    } catch (error) {
      console.error('Failed to fetch actions:', error);
    }
  };

  // Action creation mutation
  const createActionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', `/api/worlds/${worldId}/actions`, data);
      return await response.json();
    },
    onSuccess: () => {
      fetchActions();
      toast({ title: 'Action created', description: 'The action was successfully created.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to create action: ${error.message}`, variant: 'destructive' });
    },
  });

  // Delete mutation
  const deleteActionMutation = useMutation({
    mutationFn: async (actionId: string) => {
      await apiRequest('DELETE', `/api/worlds/${worldId}/actions/${actionId}`);
    },
    onSuccess: () => {
      fetchActions();
      setSelectedAction(null);
      toast({ title: 'Action deleted', description: 'The action was successfully deleted.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to delete action: ${error.message}`, variant: 'destructive' });
    },
  });

  const toggleBaseAction = async (actionId: string, enabled: boolean) => {
    try {
      const newEnabledIds = enabled
        ? [...enabledBaseActionIds, actionId]
        : enabledBaseActionIds.filter(id => id !== actionId);

      setEnabledBaseActionIds(newEnabledIds);

      const disabledIds = baseActions
        .map(a => a.id)
        .filter(id => !newEnabledIds.includes(id));

      await fetch(`/api/worlds/${worldId}/base-resources/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceType: 'action',
          resourceId: actionId,
          enabled,
          disabledBaseActions: disabledIds,
        }),
      });

      toast({
        title: enabled ? 'Base Action Enabled' : 'Base Action Disabled',
        description: `The base action has been ${enabled ? 'enabled' : 'disabled'} for this world`,
      });
    } catch (error) {
      console.error('Failed to toggle base action:', error);
      toast({ title: 'Error', description: 'Failed to toggle base action', variant: 'destructive' });
      fetchActions();
    }
  };

  // Group actions by actionType for tree
  const worldActionGroups = useMemo(() => {
    const groups: Record<string, Action[]> = {};
    actions.forEach(a => {
      const key = a.actionType || 'other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(a);
    });
    return groups;
  }, [actions]);

  const baseActionGroups = useMemo(() => {
    const groups: Record<string, Action[]> = {};
    baseActions.forEach(a => {
      const key = a.category || a.actionType || 'other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(a);
    });
    return groups;
  }, [baseActions]);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const getActionTypeColor = (type: string) => {
    return ACTION_TYPE_COLORS[type] || 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
  };

  const selectAction = async (action: Action) => {
    setSelectedAction(action);
    // Fetch full details including prologContent
    try {
      const res = await fetch(`/api/actions/${action.id}`);
      if (res.ok) {
        const full = await res.json();
        setSelectedAction(full);
      }
    } catch (e) {
      // Use the partial data we already have
    }
  };

  const isBase = selectedAction ? baseActions.some(a => a.id === selectedAction.id) : false;
  const isEnabled = selectedAction ? enabledBaseActionIds.includes(selectedAction.id) : false;

  return (
    <div className="flex h-[640px] gap-0 border border-white/20 dark:border-white/10 rounded-xl overflow-hidden bg-white/40 dark:bg-white/[0.02] backdrop-blur-xl">
      {/* Left Panel - Tree */}
      <div className="w-56 flex-shrink-0 border-r border-white/15 dark:border-white/10 flex flex-col">
        <div className="p-3 border-b border-white/15 dark:border-white/10 flex items-center justify-between">
          <span className="text-sm font-semibold">Actions</span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {/* World Actions Section */}
            <button
              className={`w-full flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeSection === 'world' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50'
              }`}
              onClick={() => setActiveSection('world')}
            >
              <Zap className="h-3.5 w-3.5" />
              World Actions ({actions.length})
            </button>

            {activeSection === 'world' && Object.entries(worldActionGroups).map(([group, groupActions]) => (
              <div key={group}>
                <button
                  className="w-full flex items-center gap-1 px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => toggleGroup(`world-${group}`)}
                >
                  {expandedGroups.has(`world-${group}`) ? (
                    <ChevronDown className="h-3 w-3 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-3 w-3 flex-shrink-0" />
                  )}
                  <span className="truncate">{ACTION_TYPE_LABELS[group] || `${group.charAt(0).toUpperCase() + group.slice(1)} Actions`}</span>
                  <span className="ml-auto text-[10px] opacity-60">{groupActions.length}</span>
                </button>

                {expandedGroups.has(`world-${group}`) && groupActions.map(action => (
                  <button
                    key={action.id}
                    className={`w-full text-left px-5 py-1 text-xs rounded-sm transition-colors break-words ${
                      selectedAction?.id === action.id
                        ? 'bg-primary/15 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                    onClick={() => selectAction(action)}
                  >
                    {action.name}
                  </button>
                ))}
              </div>
            ))}

            {/* Base Actions Section */}
            <button
              className={`w-full flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold rounded-md transition-colors mt-2 ${
                activeSection === 'base' ? 'bg-pink-500/10 text-pink-500' : 'text-muted-foreground hover:bg-muted/50'
              }`}
              onClick={() => setActiveSection('base')}
            >
              <Globe className="h-3.5 w-3.5" />
              Base Actions ({baseActions.length})
            </button>

            {activeSection === 'base' && Object.entries(baseActionGroups).map(([group, groupActions]) => (
              <div key={group}>
                <button
                  className="w-full flex items-center gap-1 px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => toggleGroup(`base-${group}`)}
                >
                  {expandedGroups.has(`base-${group}`) ? (
                    <ChevronDown className="h-3 w-3 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-3 w-3 flex-shrink-0" />
                  )}
                  <span className="truncate">{group.charAt(0).toUpperCase() + group.slice(1)}</span>
                  <span className="ml-auto text-[10px] opacity-60">{groupActions.length}</span>
                </button>

                {expandedGroups.has(`base-${group}`) && groupActions.map(action => {
                  const actionEnabled = enabledBaseActionIds.includes(action.id);
                  return (
                    <button
                      key={action.id}
                      className={`w-full text-left px-5 py-1 text-xs rounded-sm transition-colors break-words ${
                        selectedAction?.id === action.id
                          ? 'bg-primary/15 text-primary font-medium'
                          : actionEnabled
                            ? 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                            : 'text-muted-foreground/50 hover:bg-muted/50'
                      }`}
                      onClick={() => selectAction(action)}
                    >
                      {action.name}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Center Panel - Detail */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedAction ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-white/15 dark:border-white/10">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-semibold truncate">{selectedAction.name}</h2>
                    <Badge className={`text-[10px] border ${getActionTypeColor(selectedAction.actionType)}`}>
                      {selectedAction.actionType}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {selectedAction.description || 'No description'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {isBase ? (
                    <div className="flex items-center gap-2">
                      <Label htmlFor="toggle-base" className="text-xs">
                        {isEnabled ? 'Enabled' : 'Disabled'}
                      </Label>
                      <Switch
                        id="toggle-base"
                        checked={isEnabled}
                        onCheckedChange={(checked) => toggleBaseAction(selectedAction.id, checked)}
                      />
                    </div>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => {
                        setActionToEdit(selectedAction);
                        setShowEditDialog(true);
                      }}>
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs text-destructive hover:bg-destructive/10"
                        onClick={() => deleteActionMutation.mutate(selectedAction.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Properties Grid */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {/* Core Properties */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Properties</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-2 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                        <Tag className="h-3 w-3" />
                        <span className="text-[10px] uppercase tracking-wider">Category</span>
                      </div>
                      <p className="text-sm font-medium">{selectedAction.category || 'None'}</p>
                    </div>
                    <div className="p-2 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                        <Clock className="h-3 w-3" />
                        <span className="text-[10px] uppercase tracking-wider">Duration</span>
                      </div>
                      <p className="text-sm font-medium">{selectedAction.duration || 0} steps</p>
                    </div>
                    <div className="p-2 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                        <Battery className="h-3 w-3" />
                        <span className="text-[10px] uppercase tracking-wider">Energy</span>
                      </div>
                      <p className="text-sm font-medium">{selectedAction.energyCost || 0}</p>
                    </div>
                    <div className="p-2 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                        <TrendingUp className="h-3 w-3" />
                        <span className="text-[10px] uppercase tracking-wider">Difficulty</span>
                      </div>
                      <p className="text-sm font-medium">{Math.round((selectedAction.difficulty || 0) * 100)}%</p>
                    </div>
                  </div>
                </div>

                {/* Targeting */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Targeting & Scope</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-2 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                        <Target className="h-3 w-3" />
                        <span className="text-[10px] uppercase tracking-wider">Target</span>
                      </div>
                      <p className="text-sm font-medium capitalize">{selectedAction.targetType || 'None'}</p>
                    </div>
                    <div className="p-2 bg-muted/30 rounded-lg">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Requires Target</span>
                      <p className="text-sm font-medium">{selectedAction.requiresTarget ? 'Yes' : 'No'}</p>
                    </div>
                    <div className="p-2 bg-muted/30 rounded-lg">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Range</span>
                      <p className="text-sm font-medium">{selectedAction.range === 0 ? 'Same location' : `${selectedAction.range} units`}</p>
                    </div>
                  </div>
                </div>

                {/* Narrative */}
                {(selectedAction.verbPresent || selectedAction.verbPast) && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Narrative</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedAction.verbPresent && (
                        <div className="p-2 bg-muted/30 rounded-lg">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Present Tense</span>
                          <p className="text-sm font-medium">{selectedAction.verbPresent}</p>
                        </div>
                      )}
                      {selectedAction.verbPast && (
                        <div className="p-2 bg-muted/30 rounded-lg">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Past Tense</span>
                          <p className="text-sm font-medium">{selectedAction.verbPast}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Narrative Templates */}
                {selectedAction.narrativeTemplates && selectedAction.narrativeTemplates.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Narrative Templates ({selectedAction.narrativeTemplates.length})
                    </h3>
                    <div className="space-y-1.5">
                      {selectedAction.narrativeTemplates.map((template, i) => (
                        <div key={i} className="p-2 bg-muted/30 rounded-lg text-sm font-mono">
                          {template}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Additional</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-2 bg-muted/30 rounded-lg">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Cooldown</span>
                      <p className="text-sm font-medium">{selectedAction.cooldown || 0} steps</p>
                    </div>
                    <div className="p-2 bg-muted/30 rounded-lg">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Available</span>
                      <p className="text-sm font-medium">{selectedAction.isAvailable !== false ? 'Yes' : 'No'}</p>
                    </div>
                    {selectedAction.sourceFormat && (
                      <div className="p-2 bg-muted/30 rounded-lg">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">System</span>
                        <p className="text-sm font-medium">{selectedAction.sourceFormat}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {selectedAction.tags && selectedAction.tags.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedAction.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center space-y-2">
              <Zap className="h-10 w-10 mx-auto opacity-20" />
              <p className="text-sm">Select an action to view details</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Prerequisites, Effects, Side Effects, Predicates, Query */}
      <div className="w-64 flex-shrink-0 border-l border-white/15 dark:border-white/10 flex flex-col">
        {/* Tab switcher */}
        <div className="flex bg-muted/30 border-b shrink-0">
          <button
            className={`flex-1 px-2 py-1.5 text-[10px] font-medium transition-colors ${rightTab === 'details' ? 'bg-background border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setRightTab('details')}
          >
            Details
          </button>
          <button
            className={`flex-1 px-2 py-1.5 text-[10px] font-medium transition-colors ${rightTab === 'predicates' ? 'bg-background border-b-2 border-purple-500 text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setRightTab('predicates')}
          >
            Predicates
          </button>
          <button
            className={`flex-1 px-2 py-1.5 text-[10px] font-medium transition-colors ${rightTab === 'query' ? 'bg-background border-b-2 border-green-500 text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setRightTab('query')}
          >
            Query
          </button>
        </div>

        {rightTab === 'predicates' && (
          <PredicatePalette compact onInsert={(text) => navigator.clipboard.writeText(text)} />
        )}

        {rightTab === 'query' && (
          <PrologQueryTester worldId={worldId} compact />
        )}

        {rightTab === 'details' && (
        <ScrollArea className="flex-1">
          {selectedAction ? (
            <div className="p-3 space-y-4">
              {/* Source / Prolog Toggle */}
              <div className="flex gap-1 p-0.5 bg-muted/50 rounded-md">
                <button
                  className={`flex-1 px-2 py-1 text-[10px] font-medium rounded transition-colors ${
                    codeView === 'source'
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setCodeView('source')}
                >
                  Source
                </button>
                <button
                  className={`flex-1 px-2 py-1 text-[10px] font-medium rounded transition-colors ${
                    codeView === 'prolog'
                      ? 'bg-purple-500/20 shadow-sm text-purple-600 dark:text-purple-400'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setCodeView('prolog')}
                >
                  Prolog
                </button>
              </div>

              {codeView === 'prolog' ? (
                <div className="p-2 bg-purple-500/5 border border-purple-500/10 rounded-lg">
                  {selectedAction.prologContent ? (
                    <PrologSyntaxHighlight code={selectedAction.prologContent} className="text-[11px]" />
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground italic">No Prolog content generated yet</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[10px] h-6"
                        onClick={async () => {
                          try {
                            const res = await fetch(`/api/actions/${selectedAction.id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ name: selectedAction.name }),
                            });
                            if (res.ok) {
                              const updated = await res.json();
                              setSelectedAction(updated);
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
              ) : (
              <>

              {/* Prerequisites */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Prerequisites ({selectedAction.prerequisites?.length || 0})
                </h4>
                {selectedAction.prerequisites && selectedAction.prerequisites.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedAction.prerequisites.map((prereq: any, i: number) => (
                      <div key={i} className="p-2 bg-muted/30 rounded-lg">
                        <pre className="text-[11px] whitespace-pre-wrap break-all font-mono">
                          {typeof prereq === 'string' ? prereq : JSON.stringify(prereq, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No prerequisites</p>
                )}
              </div>

              {/* Effects */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Effects ({selectedAction.effects?.length || 0})
                </h4>
                {selectedAction.effects && selectedAction.effects.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedAction.effects.map((effect: any, i: number) => (
                      <div key={i} className="p-2 bg-muted/30 rounded-lg">
                        <pre className="text-[11px] whitespace-pre-wrap break-all font-mono">
                          {typeof effect === 'string' ? effect : JSON.stringify(effect, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No effects</p>
                )}
              </div>

              {/* Side Effects */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Side Effects ({selectedAction.sideEffects?.length || 0})
                </h4>
                {selectedAction.sideEffects && selectedAction.sideEffects.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedAction.sideEffects.map((se: any, i: number) => (
                      <div key={i} className="p-2 bg-muted/30 rounded-lg">
                        <pre className="text-[11px] whitespace-pre-wrap break-all font-mono">
                          {typeof se === 'string' ? se : JSON.stringify(se, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No side effects</p>
                )}
              </div>

              {/* Trigger Conditions */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Trigger Conditions ({selectedAction.triggerConditions?.length || 0})
                </h4>
                {selectedAction.triggerConditions && selectedAction.triggerConditions.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedAction.triggerConditions.map((tc: any, i: number) => (
                      <div key={i} className="p-2 bg-muted/30 rounded-lg">
                        <pre className="text-[11px] whitespace-pre-wrap break-all font-mono">
                          {typeof tc === 'string' ? tc : JSON.stringify(tc, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No trigger conditions</p>
                )}
              </div>
              </>
              )}
            </div>
          ) : (
            <div className="p-3 text-xs text-muted-foreground italic">
              Select an action to see details
            </div>
          )}
        </ScrollArea>
        )}
      </div>

      {/* Create Dialog */}
      <ActionCreateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={(data) => {
          createActionMutation.mutate({ ...data, worldId });
          setShowCreateDialog(false);
        }}
      />

      {/* Edit Dialog */}
      {actionToEdit && (
        <ActionEditDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          action={actionToEdit}
          onActionUpdated={() => {
            fetchActions();
            setShowEditDialog(false);
          }}
          onActionDeleted={() => {
            fetchActions();
            setSelectedAction(null);
            setShowEditDialog(false);
          }}
        />
      )}
    </div>
  );
}
