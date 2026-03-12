import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus, Search, Edit, Trash2, PlayCircle, FileText, BookOpen, ChevronRight, ChevronDown, Sparkles,
  X, Save, Link2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { GrammarEditor } from '../GrammarEditor';
import { GrammarTestConsole } from '../GrammarTestConsole';
import { GenerateGrammarDialog } from '../GenerateGrammarDialog';
import { NamePatternEditor } from '../NamePatternEditor';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent,
} from '@/components/ui/dialog';

const CONTEXT_TYPE_OPTIONS = [
  'narrative', 'dialogue', 'description', 'history',
  'quest', 'item', 'character', 'location',
] as const;

interface TruthBinding {
  placeholder: string;
  truthQuery: string;
}

interface Grammar {
  id: string;
  worldId: string;
  name: string;
  description: string | null;
  grammar: Record<string, string | string[]>;
  tags: string[];
  truthBindings?: TruthBinding[];
  contextType?: string | null;
  isActive: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

interface GrammarsHubProps {
  worldId: string;
}

export function GrammarsHub({ worldId }: GrammarsHubProps) {
  const [grammars, setGrammars] = useState<Grammar[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrammar, setSelectedGrammar] = useState<Grammar | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingName, setIsCreatingName] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [grammarToDelete, setGrammarToDelete] = useState<Grammar | null>(null);
  const [expandedTags, setExpandedTags] = useState<Set<string>>(new Set());
  const [editingBindings, setEditingBindings] = useState<TruthBinding[]>([]);
  const [isBindingsDirty, setIsBindingsDirty] = useState(false);
  const [editingContextType, setEditingContextType] = useState<string | null>(null);
  const [isContextTypeDirty, setIsContextTypeDirty] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadGrammars();
  }, [worldId]);

  // Sync editing state when selected grammar changes
  useEffect(() => {
    setEditingBindings(selectedGrammar?.truthBindings ?? []);
    setIsBindingsDirty(false);
    setEditingContextType(selectedGrammar?.contextType ?? null);
    setIsContextTypeDirty(false);
  }, [selectedGrammar?.id]);

  const loadGrammars = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/worlds/${worldId}/grammars`);
      if (!response.ok) throw new Error('Failed to fetch grammars');
      setGrammars(await response.json());
    } catch (error) {
      console.error('Error loading grammars:', error);
      toast({ title: 'Error', description: 'Failed to load grammars', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filteredGrammars = useMemo(() => {
    if (!searchQuery.trim()) return grammars;
    const query = searchQuery.toLowerCase();
    return grammars.filter(
      g => g.name.toLowerCase().includes(query) ||
        g.description?.toLowerCase().includes(query) ||
        g.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }, [grammars, searchQuery]);

  // Group grammars by first tag (or "Untagged")
  const grammarGroups = useMemo(() => {
    const groups: Record<string, Grammar[]> = {};
    filteredGrammars.forEach(g => {
      const key = g.tags.length > 0 ? g.tags[0] : 'untagged';
      if (!groups[key]) groups[key] = [];
      groups[key].push(g);
    });
    return groups;
  }, [filteredGrammars]);

  const handleSaveGrammar = async (grammarData: Partial<Grammar>) => {
    try {
      const url = isCreating ? '/api/grammars' : `/api/grammars/${selectedGrammar?.id}`;
      const method = isCreating ? 'POST' : 'PUT';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...grammarData, worldId }),
      });
      if (!response.ok) throw new Error('Failed to save grammar');
      toast({
        title: isCreating ? 'Grammar created' : 'Grammar updated',
        description: `"${grammarData.name}" has been ${isCreating ? 'created' : 'updated'}.`,
      });
      await loadGrammars();
      setIsEditing(false);
      setIsCreatingName(false);
      setSelectedGrammar(null);
    } catch (error) {
      console.error('Error saving grammar:', error);
      toast({ title: 'Error', description: 'Failed to save grammar', variant: 'destructive' });
    }
  };

  const confirmDelete = async () => {
    if (!grammarToDelete) return;
    try {
      const response = await fetch(`/api/grammars/${grammarToDelete.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete grammar');
      toast({ title: 'Grammar deleted', description: `"${grammarToDelete.name}" has been deleted.` });
      if (selectedGrammar?.id === grammarToDelete.id) setSelectedGrammar(null);
      await loadGrammars();
      setDeleteDialogOpen(false);
      setGrammarToDelete(null);
    } catch (error) {
      console.error('Error deleting grammar:', error);
      toast({ title: 'Error', description: 'Failed to delete grammar', variant: 'destructive' });
    }
  };

  const handleSaveTruthBindings = async () => {
    if (!selectedGrammar) return;
    try {
      const response = await fetch(`/api/grammars/${selectedGrammar.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ truthBindings: editingBindings }),
      });
      if (!response.ok) throw new Error('Failed to save truth bindings');
      toast({ title: 'Truth bindings saved' });
      setIsBindingsDirty(false);
      await loadGrammars();
      // Update selected grammar in place
      setSelectedGrammar(prev => prev ? { ...prev, truthBindings: editingBindings } : null);
    } catch (error) {
      console.error('Error saving truth bindings:', error);
      toast({ title: 'Error', description: 'Failed to save truth bindings', variant: 'destructive' });
    }
  };

  const handleSaveContextType = async () => {
    if (!selectedGrammar) return;
    try {
      const response = await fetch(`/api/grammars/${selectedGrammar.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contextType: editingContextType }),
      });
      if (!response.ok) throw new Error('Failed to save context type');
      toast({ title: 'Context type saved' });
      setIsContextTypeDirty(false);
      await loadGrammars();
      setSelectedGrammar(prev => prev ? { ...prev, contextType: editingContextType } : null);
    } catch (error) {
      console.error('Error saving context type:', error);
      toast({ title: 'Error', description: 'Failed to save context type', variant: 'destructive' });
    }
  };

  const toggleTag = (tag: string) => {
    setExpandedTags(prev => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  return (
    <>
    <div className="flex h-[640px] gap-0 border border-white/20 dark:border-white/10 rounded-xl overflow-hidden bg-white/40 dark:bg-white/[0.02] backdrop-blur-xl">
      {/* Left Panel - Grammar Tree */}
      <div className="w-56 flex-shrink-0 border-r border-white/15 dark:border-white/10 flex flex-col">
        <div className="p-3 border-b border-white/15 dark:border-white/10 flex items-center justify-between">
          <span className="text-sm font-semibold">Grammars ({grammars.length})</span>
          <div className="flex items-center gap-0.5">
            <GenerateGrammarDialog
              worldId={worldId}
              onGenerated={(generated) => {
                handleSaveGrammar({
                  name: generated.name,
                  description: generated.description,
                  grammar: generated.grammar,
                  tags: generated.tags,
                  isActive: true,
                });
              }}
            >
              <Button variant="ghost" size="icon" className="h-6 w-6" title="AI Generate">
                <Sparkles className="h-3.5 w-3.5" />
              </Button>
            </GenerateGrammarDialog>
            <Button variant="ghost" size="icon" className="h-6 w-6" title="Name Pattern" onClick={() => {
              setSelectedGrammar(null);
              setIsCreatingName(true);
            }}>
              <FileText className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" title="Create Manual" onClick={() => {
              setSelectedGrammar(null);
              setIsCreating(true);
              setIsEditing(true);
            }}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="p-2 border-b border-white/15 dark:border-white/10">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-7 pl-7 text-xs bg-transparent border-white/15"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {loading ? (
            <div className="p-3 text-xs text-muted-foreground text-center">Loading...</div>
          ) : filteredGrammars.length === 0 ? (
            <div className="p-3 text-xs text-muted-foreground text-center">
              {searchQuery ? 'No matches' : 'No grammars yet'}
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {Object.entries(grammarGroups).map(([tag, tagGrammars]) => (
                <div key={tag}>
                  <button
                    className="w-full flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors rounded-md"
                    onClick={() => toggleTag(tag)}
                  >
                    {expandedTags.has(tag) ? (
                      <ChevronDown className="h-3 w-3 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-3 w-3 flex-shrink-0" />
                    )}
                    <FileText className="h-3 w-3 flex-shrink-0 text-emerald-500" />
                    <span className="truncate capitalize">{tag}</span>
                    <span className="ml-auto text-[10px] opacity-60">{tagGrammars.length}</span>
                  </button>

                  {expandedTags.has(tag) && tagGrammars.map(grammar => (
                    <button
                      key={grammar.id}
                      className={`w-full text-left px-5 py-1 text-xs rounded-sm transition-colors break-words ${
                        selectedGrammar?.id === grammar.id
                          ? 'bg-primary/15 text-primary font-medium'
                          : grammar.isActive
                            ? 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                            : 'text-muted-foreground/50 hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedGrammar(grammar)}
                    >
                      {grammar.name}
                      {!grammar.isActive && <span className="text-[10px] ml-1 opacity-50">(off)</span>}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

      </div>

      {/* Center Panel - Grammar Detail */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedGrammar ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-white/15 dark:border-white/10">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-semibold truncate">{selectedGrammar.name}</h2>
                    {!selectedGrammar.isActive && (
                      <Badge variant="secondary" className="text-[10px]">Inactive</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {selectedGrammar.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Context:</span>
                    <select
                      value={editingContextType ?? ''}
                      onChange={(e) => {
                        setEditingContextType(e.target.value || null);
                        setIsContextTypeDirty(true);
                      }}
                      className="h-6 text-xs bg-transparent border border-white/15 rounded px-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                    >
                      <option value="">None</option>
                      {CONTEXT_TYPE_OPTIONS.map(ct => (
                        <option key={ct} value={ct}>{ct}</option>
                      ))}
                    </select>
                    {isContextTypeDirty && (
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleSaveContextType} title="Save context type">
                        <Save className="h-3 w-3 text-emerald-500" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => {
                    setIsCreating(false);
                    setIsEditing(true);
                  }}>
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setIsTesting(true)}>
                    <PlayCircle className="h-3 w-3 mr-1" />
                    Test
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setGrammarToDelete(selectedGrammar);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Symbols List */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {/* Tags */}
                {selectedGrammar.tags.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedGrammar.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Truth Bindings */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Link2 className="h-3 w-3" />
                      Truth Bindings ({editingBindings.length})
                    </h3>
                    <div className="flex items-center gap-1">
                      {isBindingsDirty && (
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleSaveTruthBindings} title="Save bindings">
                          <Save className="h-3 w-3 text-emerald-500" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => {
                          setEditingBindings([...editingBindings, { placeholder: '', truthQuery: '' }]);
                          setIsBindingsDirty(true);
                        }}
                        title="Add binding"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  {editingBindings.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground italic">
                      No truth bindings. Click + to map Tracery variables to world truths.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {editingBindings.map((binding, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 p-2 bg-muted/30 rounded-lg">
                          <Input
                            value={binding.placeholder}
                            onChange={(e) => {
                              const updated = [...editingBindings];
                              updated[idx] = { ...updated[idx], placeholder: e.target.value };
                              setEditingBindings(updated);
                              setIsBindingsDirty(true);
                            }}
                            placeholder="variable_name"
                            className="h-6 text-xs font-mono bg-transparent border-white/15 flex-[1]"
                          />
                          <span className="text-[10px] text-muted-foreground flex-shrink-0">&rarr;</span>
                          <Input
                            value={binding.truthQuery}
                            onChange={(e) => {
                              const updated = [...editingBindings];
                              updated[idx] = { ...updated[idx], truthQuery: e.target.value };
                              setEditingBindings(updated);
                              setIsBindingsDirty(true);
                            }}
                            placeholder="truth:field:filterKey=filterValue"
                            className="h-6 text-xs font-mono bg-transparent border-white/15 flex-[2]"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 flex-shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() => {
                              setEditingBindings(editingBindings.filter((_, i) => i !== idx));
                              setIsBindingsDirty(true);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Grammar Symbols */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Symbols ({Object.keys(selectedGrammar.grammar).length})
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(selectedGrammar.grammar).map(([symbol, rules]) => (
                      <div key={symbol} className="p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Badge variant="secondary" className="text-xs font-mono">#{symbol}#</Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {Array.isArray(rules) ? `${rules.length} rules` : '1 rule'}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          {(Array.isArray(rules) ? rules : [rules]).map((rule, i) => (
                            <div key={i} className="text-xs font-mono text-muted-foreground pl-2 border-l-2 border-emerald-500/30">
                              {rule}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center space-y-2">
              <BookOpen className="h-10 w-10 mx-auto opacity-20" />
              <p className="text-sm">Select a grammar to view symbols</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Quick Reference */}
      <div className="w-64 flex-shrink-0 border-l border-white/15 dark:border-white/10 flex flex-col">
        <div className="p-3 border-b border-white/15 dark:border-white/10">
          <span className="text-sm font-semibold">Reference</span>
        </div>

        <ScrollArea className="flex-1">
          {selectedGrammar ? (
            <div className="p-3 space-y-4">
              {/* Info */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Info</h4>
                <div className="space-y-2">
                  <div className="p-2 bg-muted/30 rounded-lg">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Status</span>
                    <p className="text-sm font-medium">{selectedGrammar.isActive ? 'Active' : 'Inactive'}</p>
                  </div>
                  <div className="p-2 bg-muted/30 rounded-lg">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Symbols</span>
                    <p className="text-sm font-medium">{Object.keys(selectedGrammar.grammar).length}</p>
                  </div>
                  <div className="p-2 bg-muted/30 rounded-lg">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Rules</span>
                    <p className="text-sm font-medium">
                      {Object.values(selectedGrammar.grammar).reduce(
                        (sum, rules) => sum + (Array.isArray(rules) ? rules.length : 1), 0
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Symbol Index */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Symbol Index</h4>
                <div className="space-y-0.5">
                  {Object.keys(selectedGrammar.grammar).map(symbol => (
                    <div key={symbol} className="px-2 py-1 text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded transition-colors cursor-default">
                      #{symbol}#
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracery Syntax Help */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tracery Syntax</h4>
                <div className="space-y-1.5 text-[11px] text-muted-foreground">
                  <div className="p-1.5 bg-muted/30 rounded">
                    <code className="font-mono">#symbol#</code> — expand symbol
                  </div>
                  <div className="p-1.5 bg-muted/30 rounded">
                    <code className="font-mono">#symbol.s#</code> — pluralize
                  </div>
                  <div className="p-1.5 bg-muted/30 rounded">
                    <code className="font-mono">#symbol.capitalize#</code> — capitalize
                  </div>
                  <div className="p-1.5 bg-muted/30 rounded">
                    <code className="font-mono">#symbol.a#</code> — a/an prefix
                  </div>
                  <div className="p-1.5 bg-muted/30 rounded">
                    <code className="font-mono">#[key:#val#]symbol#</code> — save to key
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 text-xs text-muted-foreground italic">
              Select a grammar to see reference
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Grammar</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{grammarToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>

    {/* Grammar Editor Modal */}
    <Dialog open={isEditing} onOpenChange={(open) => { if (!open) { setIsEditing(false); setSelectedGrammar(null); } }}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <GrammarEditor
          grammar={selectedGrammar}
          worldId={worldId}
          isCreating={isCreating}
          onSave={handleSaveGrammar}
          onCancel={() => { setIsEditing(false); setSelectedGrammar(null); }}
        />
      </DialogContent>
    </Dialog>

    {/* Test Console Modal */}
    <Dialog open={isTesting && !!selectedGrammar} onOpenChange={(open) => { if (!open) { setIsTesting(false); } }}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        {selectedGrammar && (
          <GrammarTestConsole
            grammar={selectedGrammar}
            worldId={worldId}
            onClose={() => { setIsTesting(false); }}
          />
        )}
      </DialogContent>
    </Dialog>

    {/* Name Pattern Editor Modal */}
    <Dialog open={isCreatingName} onOpenChange={(open) => { if (!open) { setIsCreatingName(false); setSelectedGrammar(null); } }}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <NamePatternEditor
          worldId={worldId}
          onSave={handleSaveGrammar}
          onCancel={() => { setIsCreatingName(false); setSelectedGrammar(null); }}
        />
      </DialogContent>
    </Dialog>
    </>
  );
}
