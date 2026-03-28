import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useWorldPermissions } from '@/hooks/use-world-permissions';
import {
  FileText, Plus, ChevronRight, ChevronDown, Edit, Save, X, Trash2,
  BookOpen, Mail, ScrollText, UtensilsCrossed, Megaphone, NotebookPen, Loader2, Sparkles,
} from 'lucide-react';

interface TextsHubProps {
  worldId: string;
}

const CATEGORY_META: Record<string, { label: string; icon: any; color: string }> = {
  book: { label: 'Books', icon: BookOpen, color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  journal: { label: 'Journals', icon: NotebookPen, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  letter: { label: 'Letters', icon: Mail, color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  flyer: { label: 'Flyers', icon: Megaphone, color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  recipe: { label: 'Recipes', icon: UtensilsCrossed, color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  notice: { label: 'Notices', icon: ScrollText, color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' },
};

const CEFR_COLORS: Record<string, string> = {
  A1: 'bg-green-500/10 text-green-500',
  A2: 'bg-lime-500/10 text-lime-600',
  B1: 'bg-yellow-500/10 text-yellow-600',
  B2: 'bg-orange-500/10 text-orange-500',
};

export function TextsHub({ worldId }: TextsHubProps) {
  const { toast } = useToast();
  const { canEdit } = useWorldPermissions(worldId);

  const [texts, setTexts] = useState<any[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [selectedText, setSelectedText] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!worldId) return;
    setLoading(true);
    fetch(`/api/worlds/${worldId}/texts`)
      .then(r => r.ok ? r.json() : [])
      .then(setTexts)
      .catch(() => setTexts([]))
      .finally(() => setLoading(false));
  }, [worldId]);

  const grouped = useMemo(() => {
    const groups: Record<string, any[]> = {};
    for (const cat of Object.keys(CATEGORY_META)) {
      groups[cat] = [];
    }
    for (const t of texts) {
      const cat = t.textCategory || 'book';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(t);
    }
    return groups;
  }, [texts]);

  const toggleGroup = (cat: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch(`/api/worlds/${worldId}/texts/seed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      toast({ title: 'Texts seeded', description: `Created ${data.created || 0} texts` });
      const refreshed = await fetch(`/api/worlds/${worldId}/texts`).then(r => r.json());
      setTexts(refreshed);
    } catch {
      toast({ title: 'Error', description: 'Failed to seed texts', variant: 'destructive' });
    } finally {
      setSeeding(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/worlds/${worldId}/texts/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      toast({ title: 'Texts generated', description: `Created ${data.created || 0} texts` });
      const refreshed = await fetch(`/api/worlds/${worldId}/texts`).then(r => r.json());
      setTexts(refreshed);
    } catch {
      toast({ title: 'Error', description: 'Failed to generate texts', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/worlds/${worldId}/texts/${id}`, { method: 'DELETE' });
      setTexts(prev => prev.filter(t => t.id !== id));
      if (selectedText?.id === id) setSelectedText(null);
      toast({ title: 'Deleted' });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    }
  };

  const startEdit = () => {
    if (!selectedText) return;
    setEditForm({
      title: selectedText.title,
      titleTranslation: selectedText.titleTranslation || '',
      textCategory: selectedText.textCategory,
      cefrLevel: selectedText.cefrLevel,
      spawnLocationHint: selectedText.spawnLocationHint || '',
      clueText: selectedText.clueText || '',
      authorName: selectedText.authorName || '',
    });
    setIsEditing(true);
  };

  const saveEdit = async () => {
    if (!selectedText) return;
    try {
      const res = await fetch(`/api/worlds/${worldId}/texts/${selectedText.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setTexts(prev => prev.map(t => t.id === updated.id ? updated : t));
        setSelectedText(updated);
        setIsEditing(false);
        toast({ title: 'Saved' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to save', variant: 'destructive' });
    }
  };

  const wordCount = (text: any) => {
    if (!text?.pages?.length) return 0;
    return text.pages.reduce((sum: number, p: any) => sum + (p.content || '').split(/\s+/).length, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)]">
      {/* Left: Category Tree */}
      <div className="w-80 flex-shrink-0 border rounded-lg bg-card">
        <div className="p-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="font-medium text-sm">Texts ({texts.length})</span>
          </div>
          {canEdit && (
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={handleSeed} disabled={seeding}>
                {seeding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                <span className="ml-1 text-xs">Seed</span>
              </Button>
              <Button size="sm" variant="outline" onClick={handleGenerate} disabled={generating}>
                {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                <span className="ml-1 text-xs">Generate</span>
              </Button>
            </div>
          )}
        </div>
        <ScrollArea className="h-[calc(100%-3.5rem)]">
          <div className="p-2">
            {Object.entries(CATEGORY_META).map(([cat, meta]) => {
              const items = grouped[cat] || [];
              const isExpanded = expandedGroups.has(cat);
              const Icon = meta.icon;
              return (
                <div key={cat}>
                  <button
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 text-sm"
                    onClick={() => toggleGroup(cat)}
                  >
                    {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    <Icon className="w-4 h-4" />
                    <span className="flex-1 text-left">{meta.label}</span>
                    <Badge variant="secondary" className="text-xs">{items.length}</Badge>
                  </button>
                  {isExpanded && items.map(t => (
                    <button
                      key={t.id}
                      className={`w-full flex items-center gap-2 px-6 py-1 rounded text-xs hover:bg-muted/50 ${
                        selectedText?.id === t.id ? 'bg-primary/10 text-primary' : ''
                      }`}
                      onClick={() => { setSelectedText(t); setIsEditing(false); }}
                    >
                      <span className="flex-1 text-left truncate">{t.title}</span>
                      <Badge className={`text-[10px] px-1 ${CEFR_COLORS[t.cefrLevel] || ''}`}>
                        {t.cefrLevel}
                      </Badge>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Right: Detail Panel */}
      <div className="flex-1 border rounded-lg bg-card overflow-auto">
        {!selectedText ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Select a text document to view details
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">{selectedText.title}</h2>
                {selectedText.titleTranslation && (
                  <p className="text-sm text-muted-foreground">{selectedText.titleTranslation}</p>
                )}
              </div>
              <div className="flex gap-2">
                {canEdit && !isEditing && (
                  <>
                    <Button size="sm" variant="outline" onClick={startEdit}>
                      <Edit className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(selectedText.id)}>
                      <Trash2 className="w-3 h-3 mr-1" /> Delete
                    </Button>
                  </>
                )}
                {isEditing && (
                  <>
                    <Button size="sm" onClick={saveEdit}><Save className="w-3 h-3 mr-1" /> Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                      <X className="w-3 h-3 mr-1" /> Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Metadata badges */}
            <div className="flex flex-wrap gap-2">
              <Badge className={CATEGORY_META[selectedText.textCategory]?.color || ''}>
                {CATEGORY_META[selectedText.textCategory]?.label || selectedText.textCategory}
              </Badge>
              <Badge className={CEFR_COLORS[selectedText.cefrLevel] || ''}>
                {selectedText.cefrLevel}
              </Badge>
              <Badge variant="outline">{wordCount(selectedText)} words</Badge>
              <Badge variant="outline">{selectedText.pages?.length || 0} pages</Badge>
              {selectedText.spawnLocationHint && (
                <Badge variant="outline">Location: {selectedText.spawnLocationHint}</Badge>
              )}
              {selectedText.clueText && (
                <Badge className="bg-red-500/10 text-red-500">Contains Clue</Badge>
              )}
              {selectedText.authorName && (
                <Badge variant="outline">By: {selectedText.authorName}</Badge>
              )}
            </div>

            {/* Edit Form */}
            {isEditing && (
              <div className="grid grid-cols-2 gap-3 p-4 bg-muted/30 rounded-lg">
                <div>
                  <label className="text-xs font-medium">Title</label>
                  <input
                    className="w-full mt-1 px-2 py-1 border rounded text-sm bg-background"
                    value={editForm.title}
                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Title Translation</label>
                  <input
                    className="w-full mt-1 px-2 py-1 border rounded text-sm bg-background"
                    value={editForm.titleTranslation}
                    onChange={e => setEditForm({ ...editForm, titleTranslation: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Category</label>
                  <select
                    className="w-full mt-1 px-2 py-1 border rounded text-sm bg-background"
                    value={editForm.textCategory}
                    onChange={e => setEditForm({ ...editForm, textCategory: e.target.value })}
                  >
                    {Object.entries(CATEGORY_META).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium">CEFR Level</label>
                  <select
                    className="w-full mt-1 px-2 py-1 border rounded text-sm bg-background"
                    value={editForm.cefrLevel}
                    onChange={e => setEditForm({ ...editForm, cefrLevel: e.target.value })}
                  >
                    {['A1', 'A2', 'B1', 'B2'].map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium">Spawn Location</label>
                  <input
                    className="w-full mt-1 px-2 py-1 border rounded text-sm bg-background"
                    value={editForm.spawnLocationHint}
                    onChange={e => setEditForm({ ...editForm, spawnLocationHint: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Author Name</label>
                  <input
                    className="w-full mt-1 px-2 py-1 border rounded text-sm bg-background"
                    value={editForm.authorName}
                    onChange={e => setEditForm({ ...editForm, authorName: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium">Clue Text</label>
                  <input
                    className="w-full mt-1 px-2 py-1 border rounded text-sm bg-background"
                    value={editForm.clueText}
                    onChange={e => setEditForm({ ...editForm, clueText: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Pages content */}
            {selectedText.pages?.map((page: any, i: number) => (
              <div key={i} className="border rounded-lg p-4 space-y-2">
                <div className="text-xs font-medium text-muted-foreground">
                  Page {i + 1} of {selectedText.pages.length}
                </div>
                <div className="text-sm whitespace-pre-wrap">{page.content}</div>
                {page.contentTranslation && (
                  <div className="text-sm text-muted-foreground italic border-t pt-2 mt-2">
                    {page.contentTranslation}
                  </div>
                )}
              </div>
            ))}

            {/* Vocabulary */}
            {selectedText.vocabularyHighlights?.length > 0 && (
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">Vocabulary ({selectedText.vocabularyHighlights.length})</h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedText.vocabularyHighlights.map((v: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="font-medium">{v.word}</span>
                      {v.partOfSpeech && <span className="text-muted-foreground">({v.partOfSpeech})</span>}
                      <span className="text-muted-foreground">— {v.translation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comprehension Questions */}
            {selectedText.comprehensionQuestions?.length > 0 && (
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">Comprehension Questions</h3>
                {selectedText.comprehensionQuestions.map((q: any, i: number) => (
                  <div key={i} className="mb-3">
                    <p className="text-sm font-medium">{q.question}</p>
                    <div className="mt-1 space-y-1">
                      {q.options?.map((opt: string, j: number) => (
                        <div key={j} className={`text-xs px-2 py-0.5 rounded ${
                          j === q.correctIndex ? 'bg-green-500/10 text-green-600 font-medium' : 'text-muted-foreground'
                        }`}>
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Clue text */}
            {selectedText.clueText && (
              <div className="border border-red-500/20 rounded-lg p-4 bg-red-500/5">
                <h3 className="text-sm font-medium text-red-500 mb-1">Mystery Clue</h3>
                <p className="text-sm">{selectedText.clueText}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
