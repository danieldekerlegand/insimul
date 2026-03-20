import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Search, ChevronRight, ChevronDown, Info, FileText, BookOpen,
  ScrollText, Mail, Megaphone, UtensilsCrossed, Plus, Trash2,
  RefreshCw, Save, Code,
} from "lucide-react";
import type { GameText } from "@shared/schema";

const CATEGORY_ICONS: Record<string, any> = {
  book: BookOpen,
  journal: ScrollText,
  letter: Mail,
  flyer: Megaphone,
  recipe: UtensilsCrossed,
};

const CATEGORY_LABELS: Record<string, string> = {
  book: 'Books',
  journal: 'Journals',
  letter: 'Letters',
  flyer: 'Flyers',
  recipe: 'Recipes',
};

const CEFR_COLORS: Record<string, string> = {
  A1: 'bg-green-500/10 text-green-600 border-green-500/20',
  A2: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  B1: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  B2: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  published: 'bg-green-500/10 text-green-600 border-green-500/20',
};

export function AdminTextsHub() {
  const { toast } = useToast();

  // World selection
  const [worlds, setWorlds] = useState<any[]>([]);
  const [selectedWorldId, setSelectedWorldId] = useState<string>("");

  // Data
  const [texts, setTexts] = useState<GameText[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [cefrFilter, setCefrFilter] = useState<string>("all");

  // Selection
  const [selectedText, setSelectedText] = useState<GameText | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Right panel
  const [expandedSection, setExpandedSection] = useState<'details' | 'content' | null>('details');

  // Create dialog
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    titleTranslation: '',
    textCategory: 'book' as string,
    cefrLevel: 'A1' as string,
    targetLanguage: '',
    authorName: '',
    spawnLocationHint: '',
    status: 'draft' as string,
    pages: [{ content: '', contentTranslation: '' }],
  });
  const [saving, setSaving] = useState(false);

  // Editing
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Fetch worlds on mount
  useEffect(() => {
    fetch('/api/worlds').then(r => r.ok ? r.json() : []).then(setWorlds).catch(() => {});
  }, []);

  // Fetch texts when world changes
  useEffect(() => {
    if (!selectedWorldId) { setTexts([]); return; }
    fetchTexts();
  }, [selectedWorldId]);

  const fetchTexts = async () => {
    if (!selectedWorldId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const res = await fetch(`/api/worlds/${selectedWorldId}/texts`);
      if (res.ok) setTexts(await res.json());
    } catch (error) {
      console.error('Failed to fetch texts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtered texts
  const filteredTexts = useMemo(() => {
    let result = texts;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.titleTranslation?.toLowerCase().includes(q) ||
        t.authorName?.toLowerCase().includes(q) ||
        t.tags?.some(tag => tag.toLowerCase().includes(q))
      );
    }
    if (categoryFilter !== "all") {
      result = result.filter(t => t.textCategory === categoryFilter);
    }
    if (cefrFilter !== "all") {
      result = result.filter(t => t.cefrLevel === cefrFilter);
    }
    return result;
  }, [texts, searchQuery, categoryFilter, cefrFilter]);

  // Group by category
  const groupedTexts = useMemo(() => {
    const groups = new Map<string, GameText[]>();
    for (const text of filteredTexts) {
      const key = text.textCategory || 'unknown';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(text);
    }
    return groups;
  }, [filteredTexts]);

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  // Create text
  const handleCreate = async () => {
    if (!selectedWorldId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/worlds/${selectedWorldId}/texts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create text');
      }
      const newText = await res.json();
      setTexts(prev => [newText, ...prev]);
      setShowCreateDialog(false);
      setCreateForm({
        title: '', titleTranslation: '', textCategory: 'book', cefrLevel: 'A1',
        targetLanguage: '', authorName: '', spawnLocationHint: '', status: 'draft',
        pages: [{ content: '', contentTranslation: '' }],
      });
      toast({ title: "Text created", description: newText.title });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Update text field inline
  const handleUpdate = async (id: string, updates: Partial<GameText>) => {
    try {
      const res = await fetch(`/api/texts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update');
      const updated = await res.json();
      setTexts(prev => prev.map(t => t.id === id ? updated : t));
      if (selectedText?.id === id) setSelectedText(updated);
      toast({ title: "Updated" });
    } catch {
      toast({ title: "Error", description: "Failed to update text", variant: "destructive" });
    }
  };

  // Delete text
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/texts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setTexts(prev => prev.filter(t => t.id !== id));
      if (selectedText?.id === id) setSelectedText(null);
      toast({ title: "Text deleted" });
    } catch {
      toast({ title: "Error", description: "Failed to delete text", variant: "destructive" });
    }
  };

  // ─── Left Panel ─────────────────────────────────────────────────────────────

  const renderLeft = () => (
    <div className="flex flex-col h-full border-r">
      <div className="flex items-center justify-between px-3 py-2.5 border-b bg-muted/30 shrink-0">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Texts</span>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowCreateDialog(true)} title="Create text" disabled={!selectedWorldId}>
            <Plus className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={fetchTexts} title="Refresh" disabled={!selectedWorldId}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* World selector */}
      <div className="px-2 py-2 border-b">
        <Select value={selectedWorldId} onValueChange={setSelectedWorldId}>
          <SelectTrigger className="h-7 text-xs">
            <SelectValue placeholder="Select a world..." />
          </SelectTrigger>
          <SelectContent>
            {worlds.map(w => (
              <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Search and filters */}
      <div className="px-2 py-2 border-b space-y-1.5">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Search texts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-7 text-xs pl-7" />
        </div>
        <div className="flex gap-1">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-6 text-[10px] flex-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={cefrFilter} onValueChange={setCefrFilter}>
            <SelectTrigger className="h-6 text-[10px] w-20"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {['A1', 'A2', 'B1', 'B2'].map(l => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {!selectedWorldId ? (
            <p className="text-xs text-muted-foreground text-center py-8">Select a world</p>
          ) : loading ? (
            <p className="text-xs text-muted-foreground text-center py-8">Loading...</p>
          ) : filteredTexts.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No texts found</p>
          ) : (
            <div className="space-y-0.5">
              {Array.from(groupedTexts.entries()).map(([category, categoryTexts]) => {
                const isExpanded = expandedGroups.has(category);
                const Icon = CATEGORY_ICONS[category] || FileText;
                return (
                  <div key={category}>
                    <button className="w-full flex items-center gap-1.5 px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors" onClick={() => toggleGroup(category)}>
                      {isExpanded ? <ChevronDown className="h-3 w-3 shrink-0" /> : <ChevronRight className="h-3 w-3 shrink-0" />}
                      <Icon className="h-3 w-3 shrink-0" />
                      <span className="truncate">{CATEGORY_LABELS[category] || category}</span>
                      <span className="ml-auto text-[10px] opacity-60">{categoryTexts.length}</span>
                    </button>
                    {isExpanded && categoryTexts.map(text => {
                      const isSelected = selectedText?.id === text.id;
                      return (
                        <button
                          key={text.id}
                          className={`w-full text-left px-5 py-1.5 text-xs rounded-sm transition-colors flex items-center gap-2 ${
                            isSelected ? 'bg-primary/15 text-primary font-medium' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                          }`}
                          onClick={() => { setSelectedText(text); setExpandedSection('details'); }}
                        >
                          <span className="truncate flex-1">{text.title}</span>
                          <Badge variant="outline" className={`text-[9px] h-3.5 px-1 ${CEFR_COLORS[text.cefrLevel] || ''}`}>
                            {text.cefrLevel}
                          </Badge>
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
        {filteredTexts.length} text{filteredTexts.length !== 1 ? 's' : ''}
      </div>
    </div>
  );

  // ─── Center Panel ───────────────────────────────────────────────────────────

  const renderCenter = () => {
    if (!selectedText) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <FileText className="w-10 h-10 opacity-20" />
          <p className="text-sm">{selectedWorldId ? 'Select a text from the list' : 'Select a world first'}</p>
          <p className="text-xs">{texts.length} texts in this world</p>
        </div>
      );
    }

    const Icon = CATEGORY_ICONS[selectedText.textCategory] || FileText;
    const pages = (selectedText.pages || []) as Array<{ content: string; contentTranslation: string }>;

    return (
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="px-4 py-3 border-b shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <Icon className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-bold">{selectedText.title}</h2>
            <Badge variant="outline" className={`text-xs ${CEFR_COLORS[selectedText.cefrLevel] || ''}`}>
              {selectedText.cefrLevel}
            </Badge>
            <Badge variant="secondary" className="text-xs capitalize">
              {selectedText.textCategory}
            </Badge>
            <Badge variant="outline" className={`text-xs ${STATUS_COLORS[selectedText.status || 'draft'] || ''}`}>
              {selectedText.status || 'draft'}
            </Badge>
          </div>
          {selectedText.titleTranslation && (
            <p className="text-sm text-muted-foreground italic">{selectedText.titleTranslation}</p>
          )}
        </div>

        {/* Actions bar */}
        <div className="px-4 py-2 border-b bg-muted/20 shrink-0 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => handleUpdate(selectedText.id, { status: selectedText.status === 'published' ? 'draft' : 'published' })}
          >
            {selectedText.status === 'published' ? 'Unpublish' : 'Publish'}
          </Button>
          <div className="flex-1" />
          <Button variant="destructive" size="sm" className="h-7 text-xs" onClick={() => handleDelete(selectedText.id)}>
            <Trash2 className="w-3 h-3 mr-1" /> Delete
          </Button>
        </div>

        {/* Content: pages */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 space-y-4">
            {pages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No pages yet</p>
            ) : pages.map((page, idx) => (
              <div key={idx} className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-muted-foreground">Page {idx + 1}</h3>
                </div>
                <p className="text-sm leading-relaxed">{page.content}</p>
                {page.contentTranslation && (
                  <p className="text-xs text-muted-foreground italic border-t pt-2 mt-2">{page.contentTranslation}</p>
                )}
              </div>
            ))}

            {/* Vocabulary highlights */}
            {selectedText.vocabularyHighlights && (selectedText.vocabularyHighlights as any[]).length > 0 && (
              <div>
                <h3 className="text-xs font-semibold mb-2 text-muted-foreground">Vocabulary Highlights</h3>
                <div className="flex flex-wrap gap-2">
                  {(selectedText.vocabularyHighlights as Array<{ word: string; translation: string; partOfSpeech: string }>).map((v, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      <span className="font-semibold">{v.word}</span>
                      <span className="text-muted-foreground mx-1">-</span>
                      <span>{v.translation}</span>
                      {v.partOfSpeech && <span className="text-muted-foreground ml-1">({v.partOfSpeech})</span>}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Comprehension questions */}
            {selectedText.comprehensionQuestions && (selectedText.comprehensionQuestions as any[]).length > 0 && (
              <div>
                <h3 className="text-xs font-semibold mb-2 text-muted-foreground">Comprehension Questions</h3>
                <div className="space-y-3">
                  {(selectedText.comprehensionQuestions as Array<{ question: string; questionTranslation: string; options: string[]; correctIndex: number }>).map((q, i) => (
                    <div key={i} className="rounded-lg border p-3">
                      <p className="text-sm font-medium">{q.question}</p>
                      {q.questionTranslation && <p className="text-xs text-muted-foreground italic">{q.questionTranslation}</p>}
                      <div className="mt-2 space-y-1">
                        {q.options.map((opt, j) => (
                          <div key={j} className={`text-xs px-2 py-1 rounded ${j === q.correctIndex ? 'bg-green-500/10 text-green-700 font-medium' : 'text-muted-foreground'}`}>
                            {String.fromCharCode(65 + j)}. {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedText.clueText && (
              <div className="rounded-lg border border-amber-500/20 bg-amber-50 dark:bg-amber-950/20 p-3">
                <h3 className="text-xs font-semibold text-amber-600 mb-1">Quest Clue</h3>
                <p className="text-sm">{selectedText.clueText}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  };

  // ─── Right Panel ────────────────────────────────────────────────────────────

  const renderRight = () => {
    if (!selectedText) return null;

    type SectionId = 'details' | 'content';
    const sections: { id: SectionId; label: string; icon: any }[] = [
      { id: 'details', label: 'Details', icon: Info },
      { id: 'content', label: 'Raw JSON', icon: Code },
    ];

    return (
      <div className="w-64 shrink-0 border-l flex flex-col min-h-0">
        {sections.map((section, idx) => {
          const isExpanded = expandedSection === section.id;
          const SIcon = section.icon;
          return (
            <div key={section.id} className={`flex flex-col min-h-0 ${idx > 0 ? 'border-t' : ''} ${isExpanded ? 'flex-1' : ''}`}>
              <button
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0"
                onClick={() => setExpandedSection(isExpanded ? null : section.id)}
              >
                <SIcon className="w-3.5 h-3.5" />
                {section.label}
                <ChevronRight className={`w-3 h-3 ml-auto transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </button>

              {isExpanded && (
                <ScrollArea className="flex-1 min-h-0">
                  <div className="px-3 pb-3 space-y-3">
                    {section.id === 'details' && (
                      <>
                        <DetailField label="ID" value={selectedText.id} mono />
                        <DetailField label="Title" value={selectedText.title} />
                        {selectedText.titleTranslation && <DetailField label="Translation" value={selectedText.titleTranslation} />}
                        <DetailField label="Category" value={selectedText.textCategory} />
                        <DetailField label="CEFR Level" value={selectedText.cefrLevel} />
                        <DetailField label="Target Language" value={selectedText.targetLanguage} />
                        <DetailField label="Difficulty" value={selectedText.difficulty || 'beginner'} />
                        {selectedText.authorName && <DetailField label="Author" value={selectedText.authorName} />}
                        {selectedText.spawnLocationHint && <DetailField label="Spawn Location" value={selectedText.spawnLocationHint} />}
                        <DetailField label="Pages" value={String((selectedText.pages as any[])?.length || 0)} />
                        <DetailField label="Status" value={selectedText.status || 'draft'} />
                        <DetailField label="Generated" value={selectedText.isGenerated ? 'Yes' : 'No'} />
                        {selectedText.tags && (selectedText.tags as string[]).length > 0 && (
                          <div>
                            <p className="text-[10px] text-muted-foreground">Tags</p>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {(selectedText.tags as string[]).map((tag, i) => (
                                <Badge key={i} variant="secondary" className="text-[10px]">{tag}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    {section.id === 'content' && (
                      <pre className="text-[10px] font-mono whitespace-pre-wrap break-words select-all">
                        {JSON.stringify(selectedText, null, 2)}
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

  // ─── Create Dialog ──────────────────────────────────────────────────────────

  const renderCreateDialog = () => {
    // Pre-fill targetLanguage from world if available
    const selectedWorld = worlds.find(w => w.id === selectedWorldId);
    const defaultLang = selectedWorld?.targetLanguage || '';

    return (
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Text</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium">Title (target language)</label>
              <Input className="h-8 text-sm mt-1" value={createForm.title} onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g., Le Petit Prince" />
            </div>
            <div>
              <label className="text-xs font-medium">Title Translation (English)</label>
              <Input className="h-8 text-sm mt-1" value={createForm.titleTranslation} onChange={e => setCreateForm(f => ({ ...f, titleTranslation: e.target.value }))} placeholder="e.g., The Little Prince" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium">Category</label>
                <Select value={createForm.textCategory} onValueChange={v => setCreateForm(f => ({ ...f, textCategory: v }))}>
                  <SelectTrigger className="h-8 text-sm mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium">CEFR Level</label>
                <Select value={createForm.cefrLevel} onValueChange={v => setCreateForm(f => ({ ...f, cefrLevel: v }))}>
                  <SelectTrigger className="h-8 text-sm mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['A1', 'A2', 'B1', 'B2'].map(l => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium">Target Language</label>
                <Input className="h-8 text-sm mt-1" value={createForm.targetLanguage || defaultLang} onChange={e => setCreateForm(f => ({ ...f, targetLanguage: e.target.value }))} placeholder="French" />
              </div>
              <div>
                <label className="text-xs font-medium">Author Name</label>
                <Input className="h-8 text-sm mt-1" value={createForm.authorName} onChange={e => setCreateForm(f => ({ ...f, authorName: e.target.value }))} placeholder="In-world author" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium">Spawn Location Hint</label>
              <Select value={createForm.spawnLocationHint || 'library'} onValueChange={v => setCreateForm(f => ({ ...f, spawnLocationHint: v }))}>
                <SelectTrigger className="h-8 text-sm mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['library', 'bookshop', 'cafe', 'residence', 'office', 'hidden', 'market'].map(l => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium">Page 1 Content (target language)</label>
              <Textarea className="text-sm mt-1" rows={4} value={createForm.pages[0]?.content || ''} onChange={e => {
                const pages = [...createForm.pages];
                pages[0] = { ...pages[0], content: e.target.value };
                setCreateForm(f => ({ ...f, pages }));
              }} placeholder="Text content in target language..." />
            </div>
            <div>
              <label className="text-xs font-medium">Page 1 Translation</label>
              <Textarea className="text-sm mt-1" rows={3} value={createForm.pages[0]?.contentTranslation || ''} onChange={e => {
                const pages = [...createForm.pages];
                pages[0] = { ...pages[0], contentTranslation: e.target.value };
                setCreateForm(f => ({ ...f, pages }));
              }} placeholder="English translation..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving || !createForm.title || !(createForm.targetLanguage || defaultLang)}>
              {saving ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // ─── Root ───────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="flex h-[calc(100vh-10rem)] min-h-[480px] rounded-lg border overflow-hidden bg-background">
        <div className="w-64 shrink-0 flex flex-col">
          {renderLeft()}
        </div>
        {renderCenter()}
        {selectedText && renderRight()}
      </div>
      {renderCreateDialog()}
    </>
  );
}

// ─── Helper Components ─────────────────────────────────────────────────────

function DetailField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={`text-xs break-words ${mono ? 'font-mono select-all text-[10px]' : ''}`}>{value}</p>
    </div>
  );
}
