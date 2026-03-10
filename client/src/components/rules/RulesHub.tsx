import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useWorldPermissions } from '@/hooks/use-world-permissions';
import {
  Scroll, Plus, ChevronRight, ChevronDown, Code, Edit, Save, X, RefreshCw, Globe,
} from 'lucide-react';
import { RuleCreateDialog } from '../RuleCreateDialog';
import { RuleConvertDialog } from '../RuleConvertDialog';
import { PredicatePalette } from '../prolog/PredicatePalette';
import { PrologQueryTester } from '../prolog/PrologQueryTester';
import { PrologSyntaxHighlight } from '../prolog/PrologSyntaxHighlight';

interface RulesHubProps {
  worldId: string;
}

// Group rules by ruleType or category
type TreeSection = 'world' | 'base';

const RULE_TYPE_LABELS: Record<string, string> = {
  trigger: 'Trigger Rules',
  volition: 'Volition Rules',
  trait: 'Trait Rules',
  default: 'Default Rules',
  pattern: 'Pattern Rules',
};

const SYNTAX_COLORS: Record<string, string> = {
  insimul: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  talkofthetown: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  ensemble: 'bg-green-500/10 text-green-500 border-green-500/20',
  kismet: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
};

export function RulesHub({ worldId }: RulesHubProps) {
  const { toast } = useToast();
  const { canEdit, loading: permissionsLoading } = useWorldPermissions(worldId);

  // Data
  const [rules, setRules] = useState<any[]>([]);
  const [baseRules, setBaseRules] = useState<any[]>([]);
  const [enabledBaseRuleIds, setEnabledBaseRuleIds] = useState<string[]>([]);

  // Pagination for base rules
  const [baseRulesPage, setBaseRulesPage] = useState(1);
  const [baseRulesLimit] = useState(50);
  const [baseRulesHasMore, setBaseRulesHasMore] = useState(false);

  // Tree navigation
  const [activeSection, setActiveSection] = useState<TreeSection>('world');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Selection
  const [selectedRule, setSelectedRule] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Editing
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  // Right panel tab
  const [rightTab, setRightTab] = useState<'details' | 'predicates' | 'query'>('details');

  // Dialogs
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showConvertDialog, setShowConvertDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (worldId) fetchRules();
  }, [worldId]);

  const fetchRules = async () => {
    try {
      const [rulesRes, baseRes, configRes] = await Promise.all([
        fetch(`/api/rules?worldId=${worldId}`),
        fetch(`/api/rules/base?page=${baseRulesPage}&limit=${baseRulesLimit}`),
        fetch(`/api/worlds/${worldId}/base-resources/config`),
      ]);

      if (rulesRes.ok) setRules(await rulesRes.json());

      let baseData: any[] = [];
      if (baseRes.ok) {
        const response = await baseRes.json();
        if (response.rules) {
          baseData = response.rules;
          setBaseRulesHasMore(response.pagination?.hasMore || false);
        } else {
          baseData = response;
          setBaseRulesHasMore(false);
        }
        setBaseRules(baseData);
      }

      if (configRes.ok) {
        const config = await configRes.json();
        const enabled = config.disabledBaseRules?.length > 0
          ? baseData.filter((r: any) => !config.disabledBaseRules.includes(r.id)).map((r: any) => r.id)
          : baseData.map((r: any) => r.id);
        setEnabledBaseRuleIds(enabled);
      } else {
        // Default: all base rules enabled
        setEnabledBaseRuleIds(baseData.map((r: any) => r.id));
      }
    } catch (error) {
      console.error('Failed to fetch rules:', error);
    }
  };

  const fetchBaseRulesPage = async (page: number) => {
    try {
      const res = await fetch(`/api/rules/base?page=${page}&limit=${baseRulesLimit}`);
      if (res.ok) {
        const response = await res.json();
        if (response.rules) {
          setBaseRules(response.rules);
          setBaseRulesHasMore(response.pagination?.hasMore || false);
        } else {
          setBaseRules(response);
          setBaseRulesHasMore(false);
        }
      }
    } catch (error) {
      console.error('Failed to fetch base rules page:', error);
    }
  };

  // Group world rules by ruleType
  const worldRuleGroups = useMemo(() => {
    const groups = new Map<string, any[]>();
    rules.forEach(r => {
      const type = r.ruleType || 'default';
      if (!groups.has(type)) groups.set(type, []);
      groups.get(type)!.push(r);
    });
    return groups;
  }, [rules]);

  // Group base rules by category
  const baseRuleGroups = useMemo(() => {
    const groups = new Map<string, any[]>();
    baseRules.forEach(r => {
      const cat = r.category || 'Uncategorized';
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat)!.push(r);
    });
    return groups;
  }, [baseRules]);

  // Expand all groups by default on first render
  useEffect(() => {
    const allKeys = new Set<string>();
    worldRuleGroups.forEach((_, k) => allKeys.add(`world:${k}`));
    baseRuleGroups.forEach((_, k) => allKeys.add(`base:${k}`));
    setExpandedGroups(allKeys);
  }, [worldRuleGroups, baseRuleGroups]);

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const selectRule = async (rule: any) => {
    setSelectedRule(rule);
    setShowDetail(true);
    setIsEditing(false);
    setEditedContent('');

    // Fetch full rule content if not already loaded
    if (!rule.content && rule.id) {
      try {
        const res = await fetch(`/api/rules/${rule.id}`);
        if (res.ok) {
          const fullRule = await res.json();
          setSelectedRule(fullRule);
        }
      } catch {
        // Keep partial rule data
      }
    }
  };

  const toggleBaseRule = async (ruleId: string, enabled: boolean) => {
    try {
      const newEnabledIds = enabled
        ? [...enabledBaseRuleIds, ruleId]
        : enabledBaseRuleIds.filter(id => id !== ruleId);
      setEnabledBaseRuleIds(newEnabledIds);

      const disabledIds = baseRules.map(r => r.id).filter(id => !newEnabledIds.includes(id));
      await fetch(`/api/worlds/${worldId}/base-resources/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceType: 'rule', resourceId: ruleId, enabled, disabledBaseRules: disabledIds }),
      });

      toast({ title: enabled ? 'Base Rule Enabled' : 'Base Rule Disabled' });
    } catch {
      toast({ title: 'Error', description: 'Failed to toggle base rule', variant: 'destructive' });
      fetchRules();
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;
    try {
      const res = await fetch(`/api/rules/${ruleId}`, { method: 'DELETE' });
      if (res.ok) {
        toast({ title: 'Rule deleted' });
        fetchRules();
        if (selectedRule?.id === ruleId) { setSelectedRule(null); setShowDetail(false); }
      } else {
        toast({ title: 'Failed to delete rule', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Failed to delete rule', variant: 'destructive' });
    }
  };

  const saveEdit = async () => {
    if (!selectedRule) return;
    try {
      const res = await fetch(`/api/rules/${selectedRule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editedContent }),
      });
      if (res.ok) {
        toast({ title: 'Rule saved' });
        setIsEditing(false);
        setSelectedRule({ ...selectedRule, content: editedContent });
        fetchRules();
      } else {
        toast({ title: 'Failed to save rule', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Failed to save rule', variant: 'destructive' });
    }
  };

  // ─── Left panel: tree ──────────────────────────────────────────────────────

  const renderTree = () => (
    <div className="flex flex-col h-full border-r">
      <div className="flex items-center justify-between px-3 py-2.5 border-b bg-muted/30 shrink-0">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rules</span>
        {canEdit && (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowCreateDialog(true)} title="Add rule">
            <Plus className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {/* World Rules section */}
          <button
            className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium text-left transition-colors ${
              activeSection === 'world' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
            }`}
            onClick={() => setActiveSection('world')}
          >
            <Scroll className="w-3.5 h-3.5 shrink-0 text-primary" />
            <span>World Rules</span>
            <span className="ml-auto text-xs text-muted-foreground">{rules.length}</span>
          </button>

          {activeSection === 'world' && (
            <div className="ml-3 space-y-0.5">
              {Array.from(worldRuleGroups.entries()).map(([type, groupRules]) => {
                const groupKey = `world:${type}`;
                const isExpanded = expandedGroups.has(groupKey);
                return (
                  <div key={type}>
                    <div className="flex items-center">
                      <button
                        className="p-1 hover:bg-muted rounded shrink-0"
                        onClick={() => toggleGroup(groupKey)}
                      >
                        {isExpanded
                          ? <ChevronDown className="w-3 h-3 text-muted-foreground" />
                          : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                      </button>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1.5 py-1">
                        {RULE_TYPE_LABELS[type] || type} ({groupRules.length})
                      </span>
                    </div>
                    {isExpanded && (
                      <div className="ml-5 space-y-0.5">
                        {groupRules.map(rule => (
                          <button
                            key={rule.id}
                            className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm text-left transition-colors ${
                              selectedRule?.id === rule.id
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                            onClick={() => selectRule(rule)}
                          >
                            <Code className="w-3.5 h-3.5 shrink-0" />
                            <span className="break-words">{rule.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {rules.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No world rules yet</p>
              )}
            </div>
          )}

          {/* Base Rules section */}
          <button
            className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium text-left transition-colors ${
              activeSection === 'base' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
            }`}
            onClick={() => setActiveSection('base')}
          >
            <Globe className="w-3.5 h-3.5 shrink-0 text-purple-500" />
            <span>Base Rules</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {baseRules.length}
            </span>
          </button>

          {activeSection === 'base' && (
            <div className="ml-3 space-y-0.5">
              {Array.from(baseRuleGroups.entries()).map(([category, groupRules]) => {
                const groupKey = `base:${category}`;
                const isExpanded = expandedGroups.has(groupKey);
                return (
                  <div key={category}>
                    <div className="flex items-center">
                      <button
                        className="p-1 hover:bg-muted rounded shrink-0"
                        onClick={() => toggleGroup(groupKey)}
                      >
                        {isExpanded
                          ? <ChevronDown className="w-3 h-3 text-muted-foreground" />
                          : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                      </button>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1.5 py-1">
                        {category} ({groupRules.length})
                      </span>
                    </div>
                    {isExpanded && (
                      <div className="ml-5 space-y-0.5">
                        {groupRules.map(rule => {
                          const isEnabled = enabledBaseRuleIds.includes(rule.id);
                          return (
                            <button
                              key={rule.id}
                              className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm text-left transition-colors ${
                                selectedRule?.id === rule.id
                                  ? 'bg-primary/10 text-primary font-medium'
                                  : isEnabled
                                    ? 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    : 'text-muted-foreground/50 hover:bg-muted'
                              }`}
                              onClick={() => selectRule(rule)}
                            >
                              <Code className="w-3.5 h-3.5 shrink-0" />
                              <span className="break-words flex-1">{rule.name}</span>
                              {!isEnabled && <span className="text-xs text-muted-foreground/50">off</span>}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {baseRules.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No base rules</p>
              )}

              {/* Pagination */}
              {(baseRulesPage > 1 || baseRulesHasMore) && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => { const p = baseRulesPage - 1; setBaseRulesPage(p); fetchBaseRulesPage(p); }}
                    disabled={baseRulesPage <= 1}
                  >
                    Prev
                  </Button>
                  <span className="text-xs text-muted-foreground">Page {baseRulesPage}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => { const p = baseRulesPage + 1; setBaseRulesPage(p); fetchBaseRulesPage(p); }}
                    disabled={!baseRulesHasMore}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  // ─── Center panel: rule detail ─────────────────────────────────────────────

  const renderCenter = () => {
    if (!selectedRule) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <Scroll className="w-10 h-10 opacity-20" />
          <p className="text-sm">Select a rule from the list</p>
        </div>
      );
    }

    const isBase = selectedRule.isBase || baseRules.some(r => r.id === selectedRule.id);
    const isEnabled = isBase ? enabledBaseRuleIds.includes(selectedRule.id) : true;

    return (
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="px-4 py-3 border-b shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold break-words">{selectedRule.name}</h2>
            <Badge variant="outline" className={SYNTAX_COLORS[selectedRule.syntax] || ''}>
              {selectedRule.ruleType || 'rule'}
            </Badge>
            {isBase && (
              <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                Base
              </Badge>
            )}
            {!selectedRule.isActive && !isBase && (
              <Badge variant="outline" className="bg-gray-500/10 text-gray-500">Inactive</Badge>
            )}
          </div>
          {selectedRule.description && (
            <p className="text-sm text-muted-foreground">{selectedRule.description}</p>
          )}
        </div>

        {/* Actions bar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/20 shrink-0">
          {isBase && (
            <div className="flex items-center gap-2 mr-auto">
              <Label htmlFor="base-toggle" className="text-xs">
                {isEnabled ? 'Enabled' : 'Disabled'}
              </Label>
              <Switch
                id="base-toggle"
                checked={isEnabled}
                onCheckedChange={(checked) => toggleBaseRule(selectedRule.id, checked)}
                disabled={!canEdit || permissionsLoading}
              />
            </div>
          )}

          {!isBase && canEdit && !isEditing && (
            <>
              <Button variant="outline" size="sm" onClick={() => { setIsEditing(true); setEditedContent(selectedRule.content || ''); }}>
                <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowConvertDialog(true)}>
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Convert
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDeleteRule(selectedRule.id)}>
                Delete
              </Button>
            </>
          )}

          {isEditing && (
            <>
              <Button size="sm" onClick={saveEdit}>
                <Save className="w-3.5 h-3.5 mr-1.5" /> Save
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                <X className="w-3.5 h-3.5 mr-1.5" /> Cancel
              </Button>
            </>
          )}
        </div>

        {/* Meta info */}
        <div className="px-4 py-2 border-b shrink-0">
          <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
            {selectedRule.priority !== undefined && (
              <span>Priority: <strong className="text-foreground">{selectedRule.priority}</strong></span>
            )}
            {selectedRule.ruleType && (
              <span>Type: <strong className="text-foreground">{selectedRule.ruleType}</strong></span>
            )}
            {selectedRule.category && (
              <span>Category: <strong className="text-foreground">{selectedRule.category}</strong></span>
            )}
            <span>Status: <strong className="text-foreground">{selectedRule.isActive !== false ? 'Active' : 'Inactive'}</strong></span>
          </div>

          {selectedRule.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedRule.tags.map((tag: string, i: number) => (
                <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}
        </div>

        {/* Code editor / viewer */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="px-4 py-2 shrink-0 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Code className="w-3.5 h-3.5" />
            <span>Prolog</span>
            {isEditing && <span className="text-primary">(Editing)</span>}
          </div>
          {isEditing ? (
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="flex-1 mx-4 mb-4 font-mono text-sm resize-none rounded-lg"
              placeholder="Enter rule code..."
            />
          ) : (
            <ScrollArea className="flex-1 mx-4 mb-4">
              <div className="bg-purple-500/5 p-4 rounded-lg overflow-x-auto border border-purple-500/10">
                {selectedRule.content ? (
                  <PrologSyntaxHighlight code={selectedRule.content} />
                ) : (
                  <p className="text-sm text-muted-foreground italic">No Prolog content available.</p>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    );
  };

  // ─── Predicate insert handler ─────────────────────────────────────────────

  const handlePredicateInsert = (text: string) => {
    if (isEditing) {
      setEditedContent(prev => prev + (prev.endsWith('\n') || prev === '' ? '' : '\n') + text);
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  // ─── Right panel: triggers/conditions/predicates/query ──────────────────────

  const renderRight = () => {
    return (
      <div className="w-64 shrink-0 border-l flex flex-col min-h-0">
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

        {/* Tab content */}
        {rightTab === 'predicates' && (
          <PredicatePalette compact onInsert={handlePredicateInsert} />
        )}

        {rightTab === 'query' && (
          <PrologQueryTester worldId={worldId} compact />
        )}

        {rightTab === 'details' && (
          <>
            {!selectedRule ? (
              <div className="flex-1 flex items-center justify-center p-4 text-center text-sm text-muted-foreground">
                Select a rule to view details
              </div>
            ) : (
              <ScrollArea className="flex-1">
                <div className="p-3 space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Source Format</span>
                      <span className="font-mono text-xs">{selectedRule.sourceFormat || 'prolog'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Rule Type</span>
                      <span className="font-mono text-xs">{selectedRule.ruleType || 'none'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Category</span>
                      <span className="font-mono text-xs">{selectedRule.category || 'none'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Priority</span>
                      <span className="font-mono text-xs">{selectedRule.priority ?? 'none'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Likelihood</span>
                      <span className="font-mono text-xs">{selectedRule.likelihood ?? 'none'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Active</span>
                      <Badge variant={selectedRule.isActive !== false ? 'default' : 'secondary'} className="text-xs">
                        {selectedRule.isActive !== false ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>

                  {selectedRule.description && (
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</span>
                      <p className="text-sm">{selectedRule.description}</p>
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tags</span>
                    {selectedRule.tags?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedRule.tags.map((tag: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No tags</p>
                    )}
                  </div>

                  {selectedRule.triggers?.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Triggers</span>
                      <div className="space-y-1">
                        {selectedRule.triggers.map((t: string, i: number) => (
                          <div key={i} className="px-2 py-1 text-sm rounded bg-muted/30">{t}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </>
        )}
      </div>
    );
  };

  // ─── Dialogs ───────────────────────────────────────────────────────────────

  const handleCreateBlank = async (sourceFormat: string, _isBase: boolean) => {
    try {
      const response = await fetch('/api/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worldId, name: `New ${sourceFormat} Rule`,
          content: `// New ${sourceFormat} rule\n// Add your rule content here`,
          sourceFormat, ruleType: 'default', isActive: true,
        }),
      });
      if (response.ok) { setShowCreateDialog(false); fetchRules(); }
    } catch (error) {
      console.error('Error creating blank rule:', error);
    }
  };

  const handleGenerateWithAI = async (prompt: string, sourceFormat: string, bulkCreate: boolean, _isBase: boolean) => {
    setIsGenerating(true);
    try {
      toast({ title: 'Generating...', description: `Creating ${bulkCreate ? 'multiple rules' : 'rule'} with AI` });

      const generateRes = await fetch('/api/generate-rule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, sourceFormat, bulkCreate }),
      });

      if (!generateRes.ok) {
        toast({ title: 'Generation Failed', description: await generateRes.text(), variant: 'destructive' });
        return;
      }

      const { rule, isBulk } = await generateRes.json();

      if (isBulk && typeof rule === 'string') {
        const ruleStrings = rule.split(/\n\n+/).filter((r: string) => r.trim());
        let successCount = 0;
        for (let i = 0; i < ruleStrings.length; i++) {
          const content = ruleStrings[i].trim();
          if (!content) continue;
          const nameMatch = content.match(/rule\s+(\w+)/);
          const res = await fetch('/api/rules', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              worldId, name: nameMatch ? nameMatch[1] : `AI Rule ${i + 1}`,
              content, sourceFormat, ruleType: 'default', isActive: true,
            }),
          });
          if (res.ok) successCount++;
        }
        toast({ title: 'Rules Created', description: `Created ${successCount} AI-generated rules` });
      } else {
        const content = typeof rule === 'string' ? rule : String(rule);
        const nameMatch = content.match(/rule\s+(\w+)/);
        const res = await fetch('/api/rules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            worldId, name: nameMatch ? nameMatch[1] : `AI: ${prompt.substring(0, 30)}`,
            content, sourceFormat, ruleType: 'default', isActive: true,
          }),
        });
        if (res.ok) toast({ title: 'Rule Created' });
        else toast({ title: 'Save Failed', variant: 'destructive' });
      }

      setShowCreateDialog(false);
      fetchRules();
    } catch (error) {
      toast({ title: 'Error', description: `Failed to generate rule: ${error instanceof Error ? error.message : 'Unknown error'}`, variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── Root ──────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="flex h-[640px] rounded-lg border overflow-hidden bg-background">
        <div className="w-56 shrink-0 flex flex-col">
          {renderTree()}
        </div>
        {renderCenter()}
        {renderRight()}
      </div>

      <RuleCreateDialog
        open={showCreateDialog}
        onOpenChange={(open) => { setShowCreateDialog(open); if (!open) fetchRules(); }}
        worldId={worldId}
        onCreateBlank={handleCreateBlank}
        onGenerateWithAI={handleGenerateWithAI}
        isGenerating={isGenerating}
      />

      {selectedRule && (
        <RuleConvertDialog
          open={showConvertDialog}
          onOpenChange={setShowConvertDialog}
          rule={{
            id: selectedRule.id,
            name: selectedRule.name,
            content: selectedRule.content,
            sourceFormat: selectedRule.sourceFormat || 'insimul',
          }}
          onConvert={async (ruleId, newContent, newSourceFormat) => {
            try {
              const res = await fetch(`/api/rules/${ruleId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newContent, sourceFormat: newSourceFormat }),
              });
              if (res.ok) {
                toast({ title: 'Rule Converted', description: `Converted to ${newSourceFormat}` });
                fetchRules();
                setSelectedRule({ ...selectedRule, content: newContent, sourceFormat: newSourceFormat });
              } else {
                toast({ title: 'Conversion Failed', variant: 'destructive' });
              }
            } catch {
              toast({ title: 'Failed to convert rule', variant: 'destructive' });
            }
          }}
        />
      )}
    </>
  );
}
