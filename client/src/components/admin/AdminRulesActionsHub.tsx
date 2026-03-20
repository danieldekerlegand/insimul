import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen, Sword, Search, ChevronRight, ChevronDown, Trash2,
  Code, Info, CheckSquare, Square,
} from "lucide-react";
import { PrologSyntaxHighlight } from "../prolog/PrologSyntaxHighlight";

interface BaseResource {
  id: string;
  name: string;
  description?: string;
  content?: string;
  category?: string;
  ruleType?: string;
  actionType?: string;
  sourceFormat?: string;
  tags?: string[];
  priority?: number;
  likelihood?: number;
  isActive?: boolean;
}

const SYNTAX_COLORS: Record<string, string> = {
  insimul: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  talkofthetown: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  ensemble: 'bg-green-500/10 text-green-500 border-green-500/20',
  kismet: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
};

interface AdminRulesActionsHubProps {
  /** When set, locks the component to show only rules or only actions (hides the toggle) */
  mode?: 'rules' | 'actions';
}

export function AdminRulesActionsHub({ mode }: AdminRulesActionsHubProps = {}) {
  const { toast } = useToast();

  // Data
  const [baseRules, setBaseRules] = useState<BaseResource[]>([]);
  const [baseActions, setBaseActions] = useState<BaseResource[]>([]);
  const [loading, setLoading] = useState(true);

  // Navigation — locked if mode is set
  const [activeTab, setActiveTab] = useState<'rules' | 'actions'>(mode || 'rules');
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Selection
  const [selectedResource, setSelectedResource] = useState<BaseResource | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Right panel
  const [expandedSection, setExpandedSection] = useState<'details' | 'content' | null>('details');

  // Delete dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rulesRes, actionsRes] = await Promise.all([
        fetch('/api/rules/base?limit=10000'),
        fetch('/api/actions/base?limit=10000'),
      ]);

      if (rulesRes.ok) {
        const data = await rulesRes.json();
        setBaseRules(data.rules || data);
      }
      if (actionsRes.ok) {
        const data = await actionsRes.json();
        setBaseActions(data.rules || data);
      }
    } catch (error) {
      console.error('Failed to fetch base resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentResources = activeTab === 'rules' ? baseRules : baseActions;
  const resourceLabel = activeTab === 'rules' ? 'rule' : 'action';

  // Filter and group
  const filteredResources = useMemo(() => {
    if (!searchQuery) return currentResources;
    const q = searchQuery.toLowerCase();
    return currentResources.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q) ||
      r.category?.toLowerCase().includes(q) ||
      r.tags?.some(t => t.toLowerCase().includes(q))
    );
  }, [currentResources, searchQuery]);

  const groupedResources = useMemo(() => {
    const groups = new Map<string, BaseResource[]>();
    for (const r of filteredResources) {
      const key = (activeTab === 'rules' ? r.ruleType : r.actionType) || r.category || 'uncategorized';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(r);
    }
    return groups;
  }, [filteredResources, activeTab]);

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredResources.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredResources.map(r => r.id)));
    }
  };

  const handleDeleteSingle = async () => {
    if (!selectedResource) return;
    setDeleting(true);
    try {
      const endpoint = activeTab === 'rules' ? '/api/rules' : '/api/actions';
      const response = await fetch(`${endpoint}/${selectedResource.id}`, { method: 'DELETE' });
      if (response.ok) {
        toast({ title: "Deleted", description: `Deleted ${resourceLabel} "${selectedResource.name}"` });
        setDeleteDialogOpen(false);
        setSelectedResource(null);
        fetchData();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete');
      }
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : 'Failed to delete', variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    setDeleting(true);
    const endpoint = activeTab === 'rules' ? '/api/rules' : '/api/actions';
    let successCount = 0;
    let errorCount = 0;

    for (const id of Array.from(selectedIds)) {
      try {
        const response = await fetch(`${endpoint}/${id}`, { method: 'DELETE' });
        if (response.ok) successCount++; else errorCount++;
      } catch { errorCount++; }
    }

    toast({
      title: successCount > 0 ? "Bulk Delete Complete" : "Failed",
      description: `Deleted ${successCount} ${resourceLabel}${successCount !== 1 ? 's' : ''}${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
      variant: errorCount > 0 && successCount === 0 ? "destructive" : "default",
    });
    setSelectedIds(new Set());
    setBulkDeleteDialogOpen(false);
    setDeleting(false);
    fetchData();
  };

  // ─── Left Panel ────────────────────────────────────────────────────────────

  const renderLeft = () => (
    <div className="flex flex-col h-full border-r">
      <div className="flex items-center justify-between px-3 py-2.5 border-b bg-muted/30 shrink-0">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Base Resources</span>
      </div>

      {/* Rules / Actions toggle — hidden when mode is locked */}
      {!mode && (
        <div className="flex border-b">
          <button
            className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'rules' ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => { setActiveTab('rules'); setSelectedResource(null); setSelectedIds(new Set()); }}
          >
            <BookOpen className="w-3 h-3" />
            Rules ({baseRules.length})
          </button>
          <button
            className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'actions' ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => { setActiveTab('actions'); setSelectedResource(null); setSelectedIds(new Set()); }}
          >
            <Sword className="w-3 h-3" />
            Actions ({baseActions.length})
          </button>
        </div>
      )}

      {/* Search */}
      <div className="px-2 py-2 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder={`Search ${resourceLabel}s...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 text-xs pl-7"
          />
        </div>
      </div>

      {/* Bulk actions */}
      {filteredResources.length > 0 && (
        <div className="flex items-center gap-1 px-2 py-1 border-b bg-muted/20 shrink-0">
          <Button variant="ghost" size="sm" className="h-6 text-[10px] px-1.5" onClick={toggleSelectAll}>
            {selectedIds.size === filteredResources.length ? (
              <><CheckSquare className="w-3 h-3 mr-1" />Deselect</>
            ) : (
              <><Square className="w-3 h-3 mr-1" />Select All</>
            )}
          </Button>
          {selectedIds.size > 0 && (
            <Button variant="ghost" size="sm" className="h-6 text-[10px] px-1.5 text-destructive hover:text-destructive" onClick={() => setBulkDeleteDialogOpen(true)}>
              <Trash2 className="w-3 h-3 mr-1" /> Delete ({selectedIds.size})
            </Button>
          )}
        </div>
      )}

      {/* Resource List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {loading ? (
            <p className="text-xs text-muted-foreground text-center py-8">Loading...</p>
          ) : filteredResources.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No {resourceLabel}s found</p>
          ) : (
            <div className="space-y-0.5">
              {Array.from(groupedResources.entries()).map(([groupName, groupItems]) => {
                const groupKey = `${activeTab}:${groupName}`;
                const isExpanded = expandedGroups.has(groupKey);
                return (
                  <div key={groupName}>
                    <button
                      className="w-full flex items-center gap-1 px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => toggleGroup(groupKey)}
                    >
                      {isExpanded ? <ChevronDown className="h-3 w-3 shrink-0" /> : <ChevronRight className="h-3 w-3 shrink-0" />}
                      <span className="truncate capitalize">{groupName}</span>
                      <span className="ml-auto text-[10px] opacity-60">{groupItems.length}</span>
                    </button>
                    {isExpanded && groupItems.map(resource => {
                      const isSelected = selectedResource?.id === resource.id;
                      return (
                        <button
                          key={resource.id}
                          className={`w-full text-left px-5 py-1.5 text-xs rounded-sm transition-colors flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-primary/15 text-primary font-medium'
                              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                          }`}
                          onClick={() => setSelectedResource(resource)}
                        >
                          <Checkbox
                            checked={selectedIds.has(resource.id)}
                            onClick={(e) => e.stopPropagation()}
                            onCheckedChange={() => toggleSelection(resource.id)}
                            className="h-3 w-3 shrink-0"
                          />
                          <span className="truncate">{resource.name}</span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="px-3 py-2 border-t text-[10px] text-muted-foreground">
        {filteredResources.length} {resourceLabel}{filteredResources.length !== 1 ? 's' : ''}
      </div>
    </div>
  );

  // ─── Center Panel ──────────────────────────────────────────────────────────

  const renderCenter = () => {
    if (!selectedResource) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          {activeTab === 'rules' ? <BookOpen className="w-10 h-10 opacity-20" /> : <Sword className="w-10 h-10 opacity-20" />}
          <p className="text-sm">Select a {resourceLabel} from the list</p>
          <p className="text-xs">
            {baseRules.length + baseActions.length} total base resources loaded
          </p>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="px-4 py-3 border-b shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold break-words">{selectedResource.name}</h2>
            <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">Base</Badge>
            {selectedResource.sourceFormat && (
              <Badge variant="outline" className={SYNTAX_COLORS[selectedResource.sourceFormat] || ''}>
                {selectedResource.sourceFormat}
              </Badge>
            )}
            {selectedResource.ruleType && (
              <Badge variant="secondary" className="text-xs">{selectedResource.ruleType}</Badge>
            )}
            {selectedResource.actionType && (
              <Badge variant="secondary" className="text-xs">{selectedResource.actionType}</Badge>
            )}
            {selectedResource.category && (
              <Badge variant="secondary" className="text-xs">{selectedResource.category}</Badge>
            )}
          </div>
          {selectedResource.description && (
            <p className="text-sm text-muted-foreground">{selectedResource.description}</p>
          )}
        </div>

        {/* Actions bar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/20 shrink-0">
          <Badge variant="outline" className="text-xs">Global</Badge>
          <div className="ml-auto">
            <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
            </Button>
          </div>
        </div>

        {/* Meta info */}
        <div className="px-4 py-2 border-b shrink-0">
          <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
            {selectedResource.priority !== undefined && (
              <span>Priority: <strong className="text-foreground">{selectedResource.priority}</strong></span>
            )}
            {selectedResource.likelihood !== undefined && (
              <span>Likelihood: <strong className="text-foreground">{selectedResource.likelihood}</strong></span>
            )}
            <span>Status: <strong className="text-foreground">{selectedResource.isActive !== false ? 'Active' : 'Inactive'}</strong></span>
          </div>
          {selectedResource.tags && selectedResource.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedResource.tags.map((tag, i) => (
                <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}
        </div>

        {/* Code viewer */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="px-4 py-2 shrink-0 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Code className="w-3.5 h-3.5" />
            <span>Prolog Content</span>
          </div>
          <ScrollArea className="flex-1 mx-4 mb-4">
            <div className="bg-purple-500/5 p-4 rounded-lg overflow-x-auto border border-purple-500/10">
              {selectedResource.content ? (
                <PrologSyntaxHighlight code={selectedResource.content} />
              ) : (
                <p className="text-sm text-muted-foreground italic">No content available.</p>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  };

  // ─── Right Panel ───────────────────────────────────────────────────────────

  const renderRight = () => {
    if (!selectedResource) return null;

    const sections = [
      { id: 'details' as const, label: 'Details', icon: Info },
      { id: 'content' as const, label: 'Raw Content', icon: Code },
    ];

    return (
      <div className="w-64 shrink-0 border-l flex flex-col min-h-0">
        {sections.map((section, idx) => {
          const isExpanded = expandedSection === section.id;
          const Icon = section.icon;
          return (
            <div key={section.id} className={`flex flex-col min-h-0 ${idx > 0 ? 'border-t' : ''} ${isExpanded ? 'flex-1' : ''}`}>
              <button
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0"
                onClick={() => setExpandedSection(isExpanded ? null : section.id)}
              >
                <Icon className="w-3.5 h-3.5" />
                {section.label}
                <ChevronRight className={`w-3 h-3 ml-auto transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </button>

              {isExpanded && (
                <ScrollArea className="flex-1 min-h-0">
                  <div className="px-3 pb-3 space-y-3">
                    {section.id === 'details' && (
                      <>
                        <DetailField label="ID" value={selectedResource.id} mono />
                        <DetailField label="Name" value={selectedResource.name} />
                        {selectedResource.sourceFormat && (
                          <DetailField label="Source Format" value={selectedResource.sourceFormat} />
                        )}
                        {selectedResource.ruleType && (
                          <DetailField label="Rule Type" value={selectedResource.ruleType} />
                        )}
                        {selectedResource.actionType && (
                          <DetailField label="Action Type" value={selectedResource.actionType} />
                        )}
                        {selectedResource.category && (
                          <DetailField label="Category" value={selectedResource.category} />
                        )}
                        {selectedResource.priority !== undefined && (
                          <DetailField label="Priority" value={String(selectedResource.priority)} />
                        )}
                        {selectedResource.likelihood !== undefined && (
                          <DetailField label="Likelihood" value={String(selectedResource.likelihood)} />
                        )}
                        <DetailField label="Status" value={selectedResource.isActive !== false ? 'Active' : 'Inactive'} />
                        {selectedResource.tags && selectedResource.tags.length > 0 && (
                          <div>
                            <p className="text-[10px] text-muted-foreground mb-1">Tags</p>
                            <div className="flex flex-wrap gap-1">
                              {selectedResource.tags.map((tag, i) => (
                                <Badge key={i} variant="outline" className="text-[10px] h-4">{tag}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {selectedResource.description && (
                          <div>
                            <p className="text-[10px] text-muted-foreground mb-1">Description</p>
                            <p className="text-xs">{selectedResource.description}</p>
                          </div>
                        )}
                      </>
                    )}

                    {section.id === 'content' && (
                      <pre className="text-[10px] font-mono whitespace-pre-wrap break-all select-all bg-muted/50 p-2 rounded">
                        {selectedResource.content || 'No content'}
                      </pre>
                    )}
                  </div>
                </ScrollArea>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ─── Root ──────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="flex h-[calc(100vh-10rem)] min-h-[480px] rounded-lg border overflow-hidden bg-background">
        <div className="w-56 shrink-0 flex flex-col">
          {renderLeft()}
        </div>
        {renderCenter()}
        {selectedResource && renderRight()}
      </div>

      {/* Single Delete */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Base {activeTab === 'rules' ? 'Rule' : 'Action'}?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete "{selectedResource?.name}"? This removes it from all worlds. Cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSingle} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} Base {activeTab === 'rules' ? 'Rules' : 'Actions'}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes them from all worlds. Cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? 'Deleting...' : `Delete ${selectedIds.size}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function DetailField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={`text-xs ${mono ? 'font-mono select-all text-[10px]' : ''}`}>{value}</p>
    </div>
  );
}
