import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Search, ChevronRight, ChevronDown, Info, FileText, BookOpen,
  ScrollText, Mail, Megaphone, UtensilsCrossed, Plus, Trash2,
  RefreshCw, Code, Sparkles, Database, CheckSquare, Square,
  Eye, X, ChevronLeft,
} from "lucide-react";
import type { GameText } from "@shared/schema";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
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

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const SPAWN_LOCATIONS = ['library', 'bookshop', 'cafe', 'residence', 'office', 'hidden', 'market'];

interface TextFormData {
  title: string;
  titleTranslation: string;
  textCategory: string;
  cefrLevel: string;
  targetLanguage: string;
  difficulty: string;
  authorName: string;
  spawnLocationHint: string;
  clueText: string;
  status: string;
  tags: string[];
  pages: Array<{ content: string; contentTranslation: string }>;
  vocabularyHighlights: Array<{ word: string; translation: string; partOfSpeech: string }>;
  comprehensionQuestions: Array<{ question: string; questionTranslation: string; options: string[]; correctIndex: number }>;
}

const emptyForm: TextFormData = {
  title: '', titleTranslation: '', textCategory: 'book', cefrLevel: 'A1',
  targetLanguage: '', difficulty: 'beginner', authorName: '', spawnLocationHint: '',
  clueText: '', status: 'draft', tags: [],
  pages: [{ content: '', contentTranslation: '' }],
  vocabularyHighlights: [],
  comprehensionQuestions: [],
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Right panel
  const [expandedSection, setExpandedSection] = useState<'details' | 'content' | null>('details');

  // Dialogs
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState<TextFormData>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [previewPage, setPreviewPage] = useState(0);
  const [tagInput, setTagInput] = useState('');

  // Generate dialog
  const [generateParams, setGenerateParams] = useState({
    topic: '', category: 'book', cefrLevel: 'A1', count: 1, includeClue: false,
  });

  // Bulk selection mode
  const [bulkMode, setBulkMode] = useState(false);

  // Fetch worlds on mount
  useEffect(() => {
    fetch('/api/worlds').then(r => r.ok ? r.json() : []).then(setWorlds).catch(() => {});
  }, []);

  // Fetch texts when world changes
  useEffect(() => {
    if (!selectedWorldId) { setTexts([]); return; }
    fetchTexts();
  }, [selectedWorldId]);

  const fetchTexts = useCallback(async () => {
    if (!selectedWorldId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/worlds/${selectedWorldId}/texts`);
      if (res.ok) setTexts(await res.json());
    } catch (error) {
      console.error('Failed to fetch texts:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedWorldId]);

  // Filtered texts
  const filteredTexts = useMemo(() => {
    let result = texts;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.titleTranslation?.toLowerCase().includes(q) ||
        t.authorName?.toLowerCase().includes(q) ||
        (t.tags as string[] | null)?.some(tag => tag.toLowerCase().includes(q))
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

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(filteredTexts.map(t => t.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  // ─── CRUD Operations ────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!selectedWorldId) return;
    setSaving(true);
    try {
      const selectedWorld = worlds.find(w => w.id === selectedWorldId);
      const payload = {
        ...formData,
        targetLanguage: formData.targetLanguage || selectedWorld?.targetLanguage || '',
      };
      const res = await fetch(`/api/worlds/${selectedWorldId}/texts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create text');
      }
      const newText = await res.json();
      setTexts(prev => [newText, ...prev]);
      setShowCreateDialog(false);
      setFormData({ ...emptyForm });
      toast({ title: "Text created", description: newText.title });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

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

  const handleSaveEdit = async () => {
    if (!selectedText) return;
    setSaving(true);
    try {
      const selectedWorld = worlds.find(w => w.id === selectedWorldId);
      const payload = {
        ...formData,
        targetLanguage: formData.targetLanguage || selectedWorld?.targetLanguage || '',
      };
      const res = await fetch(`/api/texts/${selectedText.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update');
      const updated = await res.json();
      setTexts(prev => prev.map(t => t.id === updated.id ? updated : t));
      setSelectedText(updated);
      setShowEditDialog(false);
      toast({ title: "Text updated", description: updated.title });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

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

  // ─── Bulk Operations ────────────────────────────────────────────────

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    let deleted = 0;
    for (const id of ids) {
      try {
        const res = await fetch(`/api/texts/${id}`, { method: 'DELETE' });
        if (res.ok) deleted++;
      } catch { /* continue */ }
    }
    setTexts(prev => prev.filter(t => !selectedIds.has(t.id)));
    if (selectedText && selectedIds.has(selectedText.id)) setSelectedText(null);
    setSelectedIds(new Set());
    toast({ title: `Deleted ${deleted} text${deleted !== 1 ? 's' : ''}` });
  };

  const handlePublishAllDrafts = async () => {
    const drafts = texts.filter(t => t.status === 'draft');
    if (drafts.length === 0) {
      toast({ title: "No drafts to publish" });
      return;
    }
    let published = 0;
    for (const draft of drafts) {
      try {
        const res = await fetch(`/api/texts/${draft.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'published' }),
        });
        if (res.ok) published++;
      } catch { /* continue */ }
    }
    await fetchTexts();
    toast({ title: `Published ${published} text${published !== 1 ? 's' : ''}` });
  };

  // ─── Generate & Seed ────────────────────────────────────────────────

  const handleGenerate = async () => {
    if (!selectedWorldId) return;
    setGenerating(true);
    try {
      const selectedWorld = worlds.find(w => w.id === selectedWorldId);
      const res = await fetch(`/api/worlds/${selectedWorldId}/texts/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count: generateParams.count,
          category: generateParams.category,
          cefrLevel: generateParams.cefrLevel,
          targetLanguage: selectedWorld?.targetLanguage || 'French',
          theme: generateParams.topic || undefined,
          includeClue: generateParams.includeClue,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Generation failed');
      }
      const result = await res.json();
      setShowGenerateDialog(false);
      await fetchTexts();
      const count = result.created ?? result.texts?.length ?? 0;
      toast({ title: "Texts generated", description: `${count} text${count !== 1 ? 's' : ''} created` });
    } catch (error: any) {
      toast({ title: "Generation failed", description: error.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleSeed = async () => {
    if (!selectedWorldId) return;
    setSeeding(true);
    try {
      const selectedWorld = worlds.find(w => w.id === selectedWorldId);
      const res = await fetch(`/api/worlds/${selectedWorldId}/texts/seed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetLanguage: selectedWorld?.targetLanguage || 'French',
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Seeding failed');
      }
      const result = await res.json();
      await fetchTexts();
      toast({ title: "Templates seeded", description: result.message || `${result.created} texts created` });
    } catch (error: any) {
      toast({ title: "Seeding failed", description: error.message, variant: "destructive" });
    } finally {
      setSeeding(false);
    }
  };

  const openEditDialog = (text: GameText) => {
    setFormData({
      title: text.title,
      titleTranslation: text.titleTranslation || '',
      textCategory: text.textCategory,
      cefrLevel: text.cefrLevel,
      targetLanguage: text.targetLanguage,
      difficulty: text.difficulty || 'beginner',
      authorName: text.authorName || '',
      spawnLocationHint: text.spawnLocationHint || '',
      clueText: text.clueText || '',
      status: text.status || 'draft',
      tags: (text.tags as string[]) || [],
      pages: (text.pages as Array<{ content: string; contentTranslation: string }>) || [{ content: '', contentTranslation: '' }],
      vocabularyHighlights: (text.vocabularyHighlights as Array<{ word: string; translation: string; partOfSpeech: string }>) || [],
      comprehensionQuestions: (text.comprehensionQuestions as Array<{ question: string; questionTranslation: string; options: string[]; correctIndex: number }>) || [],
    });
    setShowEditDialog(true);
  };

  // ─── Left Panel ─────────────────────────────────────────────────────

  const renderLeft = () => (
    <div className="flex flex-col h-full border-r">
      <div className="flex items-center justify-between px-3 py-2.5 border-b bg-muted/30 shrink-0">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Texts</span>
        <div className="flex gap-1">
          {bulkMode ? (
            <>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={selectAll} title="Select all">
                <CheckSquare className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setBulkMode(false); deselectAll(); }} title="Exit bulk mode">
                <X className="w-3.5 h-3.5" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setBulkMode(true)} title="Bulk select" disabled={!selectedWorldId}>
                <Square className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setFormData({ ...emptyForm }); setShowCreateDialog(true); }} title="Create text" disabled={!selectedWorldId}>
                <Plus className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={fetchTexts} title="Refresh" disabled={!selectedWorldId}>
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </>
          )}
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

      {/* Action buttons */}
      {selectedWorldId && (
        <div className="px-2 py-1.5 border-b flex flex-wrap gap-1">
          <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1" onClick={() => setShowGenerateDialog(true)} disabled={generating}>
            <Sparkles className="w-3 h-3" /> Generate
          </Button>
          <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1" onClick={handleSeed} disabled={seeding}>
            <Database className="w-3 h-3" /> {seeding ? 'Seeding...' : 'Seed Templates'}
          </Button>
          {bulkMode && selectedIds.size > 0 && (
            <Button variant="destructive" size="sm" className="h-6 text-[10px] gap-1" onClick={handleBulkDelete}>
              <Trash2 className="w-3 h-3" /> Delete ({selectedIds.size})
            </Button>
          )}
          {bulkMode && (
            <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1" onClick={handlePublishAllDrafts}>
              Publish All Drafts
            </Button>
          )}
        </div>
      )}

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
                      const pages = (text.pages as any[]) || [];
                      return (
                        <div
                          key={text.id}
                          className={`w-full text-left px-5 py-1.5 text-xs rounded-sm transition-colors flex items-center gap-2 cursor-pointer ${
                            isSelected ? 'bg-primary/15 text-primary font-medium' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                          }`}
                          onClick={() => { if (!bulkMode) { setSelectedText(text); setExpandedSection('details'); } else { toggleSelection(text.id); } }}
                        >
                          {bulkMode && (
                            <Checkbox
                              checked={selectedIds.has(text.id)}
                              onCheckedChange={() => toggleSelection(text.id)}
                              className="h-3 w-3"
                            />
                          )}
                          <span className="truncate flex-1">{text.title}</span>
                          <Badge variant="outline" className={`text-[9px] h-3.5 px-1 shrink-0 ${STATUS_COLORS[text.status || 'draft'] || ''}`}>
                            {text.status || 'draft'}
                          </Badge>
                          <Badge variant="outline" className={`text-[9px] h-3.5 px-1 shrink-0 ${CEFR_COLORS[text.cefrLevel] || ''}`}>
                            {text.cefrLevel}
                          </Badge>
                          <span className="text-[9px] opacity-50 shrink-0">{pages.length}p</span>
                        </div>
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
        {bulkMode && selectedIds.size > 0 && ` (${selectedIds.size} selected)`}
      </div>
    </div>
  );

  // ─── Center Panel ───────────────────────────────────────────────────

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
          <div className="flex gap-2 mt-1 text-[10px] text-muted-foreground">
            {selectedText.authorName && <span>by {selectedText.authorName}</span>}
            <span>{DIFFICULTY_LABELS[selectedText.difficulty || 'beginner'] || selectedText.difficulty}</span>
            <span>{pages.length} page{pages.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Actions bar */}
        <div className="px-4 py-2 border-b bg-muted/20 shrink-0 flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => openEditDialog(selectedText)}>
            Edit
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => { setPreviewPage(0); setShowPreview(true); }}>
            <Eye className="w-3 h-3" /> Preview
          </Button>
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

  // ─── Right Panel ────────────────────────────────────────────────────

  const renderRight = () => {
    if (!selectedText) return null;

    type SectionId = 'details' | 'content';
    const sections: { id: SectionId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
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

  // ─── Text Form (shared between Create and Edit) ─────────────────────

  const renderTextForm = () => {
    const selectedWorld = worlds.find(w => w.id === selectedWorldId);
    const defaultLang = selectedWorld?.targetLanguage || '';

    const addPage = () => {
      setFormData(f => ({ ...f, pages: [...f.pages, { content: '', contentTranslation: '' }] }));
    };

    const removePage = (idx: number) => {
      setFormData(f => ({ ...f, pages: f.pages.filter((_, i) => i !== idx) }));
    };

    const updatePage = (idx: number, field: 'content' | 'contentTranslation', value: string) => {
      setFormData(f => {
        const pages = [...f.pages];
        pages[idx] = { ...pages[idx], [field]: value };
        return { ...f, pages };
      });
    };

    const addVocab = () => {
      setFormData(f => ({ ...f, vocabularyHighlights: [...f.vocabularyHighlights, { word: '', translation: '', partOfSpeech: '' }] }));
    };

    const removeVocab = (idx: number) => {
      setFormData(f => ({ ...f, vocabularyHighlights: f.vocabularyHighlights.filter((_, i) => i !== idx) }));
    };

    const updateVocab = (idx: number, field: string, value: string) => {
      setFormData(f => {
        const vocab = [...f.vocabularyHighlights];
        vocab[idx] = { ...vocab[idx], [field]: value };
        return { ...f, vocabularyHighlights: vocab };
      });
    };

    const addQuestion = () => {
      setFormData(f => ({
        ...f,
        comprehensionQuestions: [...f.comprehensionQuestions, { question: '', questionTranslation: '', options: ['', '', '', ''], correctIndex: 0 }],
      }));
    };

    const removeQuestion = (idx: number) => {
      setFormData(f => ({ ...f, comprehensionQuestions: f.comprehensionQuestions.filter((_, i) => i !== idx) }));
    };

    const updateQuestion = (idx: number, field: string, value: any) => {
      setFormData(f => {
        const questions = [...f.comprehensionQuestions];
        questions[idx] = { ...questions[idx], [field]: value };
        return { ...f, comprehensionQuestions: questions };
      });
    };

    const updateQuestionOption = (qIdx: number, oIdx: number, value: string) => {
      setFormData(f => {
        const questions = [...f.comprehensionQuestions];
        const options = [...questions[qIdx].options];
        options[oIdx] = value;
        questions[qIdx] = { ...questions[qIdx], options };
        return { ...f, comprehensionQuestions: questions };
      });
    };

    const addTag = () => {
      const tag = tagInput.trim();
      if (tag && !formData.tags.includes(tag)) {
        setFormData(f => ({ ...f, tags: [...f.tags, tag] }));
        setTagInput('');
      }
    };

    const removeTag = (tag: string) => {
      setFormData(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }));
    };

    return (
      <div className="space-y-4">
        {/* Basic info */}
        <div>
          <label className="text-xs font-medium">Title (target language)</label>
          <Input className="h-8 text-sm mt-1" value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} placeholder="e.g., Le Petit Prince" />
        </div>
        <div>
          <label className="text-xs font-medium">Title Translation (English)</label>
          <Input className="h-8 text-sm mt-1" value={formData.titleTranslation} onChange={e => setFormData(f => ({ ...f, titleTranslation: e.target.value }))} placeholder="e.g., The Little Prince" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium">Document Type</label>
            <Select value={formData.textCategory} onValueChange={v => setFormData(f => ({ ...f, textCategory: v }))}>
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
            <Select value={formData.cefrLevel} onValueChange={v => setFormData(f => ({ ...f, cefrLevel: v }))}>
              <SelectTrigger className="h-8 text-sm mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['A1', 'A2', 'B1', 'B2'].map(l => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium">Target Language</label>
            <Input className="h-8 text-sm mt-1" value={formData.targetLanguage || defaultLang} onChange={e => setFormData(f => ({ ...f, targetLanguage: e.target.value }))} placeholder="French" />
          </div>
          <div>
            <label className="text-xs font-medium">Difficulty</label>
            <Select value={formData.difficulty} onValueChange={v => setFormData(f => ({ ...f, difficulty: v }))}>
              <SelectTrigger className="h-8 text-sm mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(DIFFICULTY_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium">Author Name</label>
            <Input className="h-8 text-sm mt-1" value={formData.authorName} onChange={e => setFormData(f => ({ ...f, authorName: e.target.value }))} placeholder="In-world author" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium">Spawn Location</label>
            <Select value={formData.spawnLocationHint || 'library'} onValueChange={v => setFormData(f => ({ ...f, spawnLocationHint: v }))}>
              <SelectTrigger className="h-8 text-sm mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SPAWN_LOCATIONS.map(l => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium">Status</label>
            <Select value={formData.status} onValueChange={v => setFormData(f => ({ ...f, status: v }))}>
              <SelectTrigger className="h-8 text-sm mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium">Clue Text (optional quest clue)</label>
          <Textarea className="text-sm mt-1" rows={2} value={formData.clueText} onChange={e => setFormData(f => ({ ...f, clueText: e.target.value }))} placeholder="Optional clue for quest progression..." />
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs font-medium">Tags</label>
          <div className="flex gap-1 mt-1">
            <Input className="h-8 text-sm flex-1" value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="Add tag..." onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} />
            <Button variant="outline" size="sm" className="h-8" onClick={addTag}>Add</Button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {formData.tags.map((tag, i) => (
                <Badge key={i} variant="secondary" className="text-xs gap-1">
                  {tag}
                  <X className="w-2.5 h-2.5 cursor-pointer" onClick={() => removeTag(tag)} />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Pages - Multi-page editor */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium">Pages ({formData.pages.length})</label>
            <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={addPage}>+ Add Page</Button>
          </div>
          <div className="space-y-3">
            {formData.pages.map((page, idx) => (
              <div key={idx} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Page {idx + 1}</span>
                  {formData.pages.length > 1 && (
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => removePage(idx)}>
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                <Textarea className="text-sm" rows={3} value={page.content} onChange={e => updatePage(idx, 'content', e.target.value)} placeholder={`Page ${idx + 1} content (target language)...`} />
                <Textarea className="text-sm" rows={2} value={page.contentTranslation} onChange={e => updatePage(idx, 'contentTranslation', e.target.value)} placeholder={`Page ${idx + 1} translation (English)...`} />
              </div>
            ))}
          </div>
        </div>

        {/* Vocabulary Highlights */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium">Vocabulary Highlights ({formData.vocabularyHighlights.length})</label>
            <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={addVocab}>+ Add Word</Button>
          </div>
          {formData.vocabularyHighlights.map((v, idx) => (
            <div key={idx} className="flex gap-2 mb-2 items-start">
              <Input className="h-7 text-xs flex-1" value={v.word} onChange={e => updateVocab(idx, 'word', e.target.value)} placeholder="Word" />
              <Input className="h-7 text-xs flex-1" value={v.translation} onChange={e => updateVocab(idx, 'translation', e.target.value)} placeholder="Translation" />
              <Input className="h-7 text-xs w-24" value={v.partOfSpeech} onChange={e => updateVocab(idx, 'partOfSpeech', e.target.value)} placeholder="POS" />
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeVocab(idx)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>

        {/* Comprehension Questions */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium">Comprehension Questions ({formData.comprehensionQuestions.length})</label>
            <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={addQuestion}>+ Add Question</Button>
          </div>
          {formData.comprehensionQuestions.map((q, qIdx) => (
            <div key={qIdx} className="rounded-lg border p-3 space-y-2 mb-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Question {qIdx + 1}</span>
                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => removeQuestion(qIdx)}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <Input className="h-7 text-xs" value={q.question} onChange={e => updateQuestion(qIdx, 'question', e.target.value)} placeholder="Question (target language)" />
              <Input className="h-7 text-xs" value={q.questionTranslation} onChange={e => updateQuestion(qIdx, 'questionTranslation', e.target.value)} placeholder="Question translation" />
              <div className="space-y-1">
                {q.options.map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-2">
                    <input type="radio" name={`q-${qIdx}-correct`} checked={q.correctIndex === oIdx} onChange={() => updateQuestion(qIdx, 'correctIndex', oIdx)} className="shrink-0" />
                    <Input className="h-6 text-xs flex-1" value={opt} onChange={e => updateQuestionOption(qIdx, oIdx, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + oIdx)}`} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ─── Preview Dialog ─────────────────────────────────────────────────

  const renderPreviewDialog = () => {
    if (!selectedText) return null;
    const pages = (selectedText.pages || []) as Array<{ content: string; contentTranslation: string }>;
    const Icon = CATEGORY_ICONS[selectedText.textCategory] || FileText;

    return (
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          {/* Book-like header */}
          <div className="bg-amber-50 dark:bg-amber-950/30 px-6 py-4 border-b border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 mb-1">
              <Icon className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <Badge variant="outline" className={`text-[10px] ${CEFR_COLORS[selectedText.cefrLevel] || ''}`}>
                {selectedText.cefrLevel}
              </Badge>
            </div>
            <h2 className="text-lg font-serif font-bold text-amber-900 dark:text-amber-100">{selectedText.title}</h2>
            {selectedText.titleTranslation && (
              <p className="text-sm text-amber-700/70 dark:text-amber-300/70 italic">{selectedText.titleTranslation}</p>
            )}
            {selectedText.authorName && (
              <p className="text-xs text-amber-600/60 dark:text-amber-400/60 mt-1">by {selectedText.authorName}</p>
            )}
          </div>

          {/* Page content */}
          <div className="px-6 py-5 min-h-[200px] bg-amber-50/50 dark:bg-amber-950/10">
            {pages.length > 0 ? (
              <>
                <p className="text-sm leading-relaxed font-serif">{pages[previewPage]?.content}</p>
                {pages[previewPage]?.contentTranslation && (
                  <p className="text-xs text-muted-foreground italic mt-4 pt-3 border-t border-amber-200/50 dark:border-amber-800/50">
                    {pages[previewPage].contentTranslation}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No pages</p>
            )}
          </div>

          {/* Page navigation */}
          {pages.length > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t bg-muted/30">
              <Button variant="ghost" size="sm" className="h-7 text-xs" disabled={previewPage === 0} onClick={() => setPreviewPage(p => p - 1)}>
                <ChevronLeft className="w-3 h-3 mr-1" /> Previous
              </Button>
              <span className="text-xs text-muted-foreground">Page {previewPage + 1} of {pages.length}</span>
              <Button variant="ghost" size="sm" className="h-7 text-xs" disabled={previewPage >= pages.length - 1} onClick={() => setPreviewPage(p => p + 1)}>
                Next <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          )}

          {/* Vocabulary at bottom */}
          {selectedText.vocabularyHighlights && (selectedText.vocabularyHighlights as any[]).length > 0 && (
            <div className="px-6 py-3 border-t bg-muted/20">
              <p className="text-[10px] font-semibold text-muted-foreground mb-1.5">VOCABULARY</p>
              <div className="flex flex-wrap gap-1.5">
                {(selectedText.vocabularyHighlights as Array<{ word: string; translation: string; partOfSpeech: string }>).map((v, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px]">
                    {v.word} = {v.translation}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  // ─── Generate Dialog ────────────────────────────────────────────────

  const renderGenerateDialog = () => (
    <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Generate Texts
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium">Topic / Theme (optional)</label>
            <Input className="h-8 text-sm mt-1" value={generateParams.topic} onChange={e => setGenerateParams(p => ({ ...p, topic: e.target.value }))} placeholder="e.g., daily routines, food, travel..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium">Document Type</label>
              <Select value={generateParams.category} onValueChange={v => setGenerateParams(p => ({ ...p, category: v }))}>
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
              <Select value={generateParams.cefrLevel} onValueChange={v => setGenerateParams(p => ({ ...p, cefrLevel: v }))}>
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
              <label className="text-xs font-medium">Count</label>
              <Select value={String(generateParams.count)} onValueChange={v => setGenerateParams(p => ({ ...p, count: parseInt(v) }))}>
                <SelectTrigger className="h-8 text-sm mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 5, 10].map(n => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-xs">
                <Checkbox checked={generateParams.includeClue} onCheckedChange={v => setGenerateParams(p => ({ ...p, includeClue: !!v }))} className="h-3.5 w-3.5" />
                Include quest clue
              </label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>Cancel</Button>
          <Button onClick={handleGenerate} disabled={generating}>
            {generating ? 'Generating...' : `Generate ${generateParams.count} Text${generateParams.count !== 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // ─── Root ───────────────────────────────────────────────────────────

  return (
    <>
      <div className="flex h-[calc(100vh-10rem)] min-h-[480px] rounded-lg border overflow-hidden bg-background">
        <div className="w-64 shrink-0 flex flex-col">
          {renderLeft()}
        </div>
        {renderCenter()}
        {selectedText && renderRight()}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Text</DialogTitle>
          </DialogHeader>
          {renderTextForm()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving || !formData.title}>
              {saving ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Text</DialogTitle>
          </DialogHeader>
          {renderTextForm()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={saving || !formData.title}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {renderGenerateDialog()}
      {renderPreviewDialog()}
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
