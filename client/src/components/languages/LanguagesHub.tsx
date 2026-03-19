import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useWorldPermissions } from '@/hooks/use-world-permissions';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type {
  WorldLanguage,
  LanguageScopeType,
  ConlangConfig,
  LanguageChatMessage,
} from '@shared/language';
import {
  Globe, Sparkles, MessageCircle, Trash2, Loader2, Plus, ChevronRight, ChevronDown,
  Send, BookOpen, Landmark, Languages, MapPin,
} from 'lucide-react';

interface LanguagesHubProps {
  worldId: string;
}

type LanguageWithDates = WorldLanguage & {
  createdAt: string | Date;
  updatedAt: string | Date;
};

const BASE_LANGUAGE_OPTIONS = [
  { id: 'english', name: 'English' },
  { id: 'japanese', name: 'Japanese' },
  { id: 'spanish', name: 'Spanish' },
  { id: 'mandarin', name: 'Mandarin Chinese' },
];

const SCOPE_LABELS: Record<string, string> = {
  world: 'World',
  country: 'Country',
  state: 'State',
  settlement: 'Settlement',
};

export function LanguagesHub({ worldId }: LanguagesHubProps) {
  const { toast } = useToast();
  const { canEdit, loading: permissionsLoading } = useWorldPermissions(worldId);
  const { token } = useAuth();

  // Data
  const [languages, setLanguages] = useState<LanguageWithDates[]>([]);
  const [languagesLoading, setLanguagesLoading] = useState(false);
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);

  // Selection
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageWithDates | null>(null);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Tree
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['world']));

  // Truths (for cultural context panel)
  const [truths, setTruths] = useState<any[]>([]);

  // Chat
  const [chatMessages, setChatMessages] = useState<LanguageChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSending, setChatSending] = useState(false);

  // Generate dialog
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [geminiConfigured, setGeminiConfigured] = useState<boolean | null>(null);

  // Generation form state
  const [languageName, setLanguageName] = useState('');
  const [mode, setMode] = useState<'offline' | 'llm-hybrid'>('offline');
  const [scopeType, setScopeType] = useState<LanguageScopeType>('world');
  const [countryId, setCountryId] = useState<string | undefined>();
  const [stateId, setStateId] = useState<string | undefined>();
  const [settlementId, setSettlementId] = useState<string | undefined>();
  const [selectedBaseLanguages, setSelectedBaseLanguages] = useState<string[]>(['english']);
  const [phonologyEmphasis, setPhonologyEmphasis] = useState('0.5');
  const [grammarEmphasis, setGrammarEmphasis] = useState('0.3');
  const [vocabularyEmphasis, setVocabularyEmphasis] = useState('0.2');
  const [complexity, setComplexity] = useState<ConlangConfig['complexity']>('moderate');
  const [purpose, setPurpose] = useState<ConlangConfig['purpose']>('fictional');
  const [includeWritingSystem, setIncludeWritingSystem] = useState(true);
  const [includeCulturalContext, setIncludeCulturalContext] = useState(true);
  const [includeAdvancedPhonetics, setIncludeAdvancedPhonetics] = useState(false);
  const [generateSampleTexts, setGenerateSampleTexts] = useState(true);
  const [genDescription, setGenDescription] = useState('');
  const [makePrimary, setMakePrimary] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);


  useEffect(() => {
    loadLanguages();
    loadLocations();
    loadGeminiStatus();
    loadTruths();
  }, [worldId]);

  useEffect(() => {
    if (selectedLanguage) {
      loadChatHistory(selectedLanguage.id);
    } else if (languages.length > 0) {
      setSelectedLanguage(languages[0]);
    }
  }, [languages, selectedLanguage?.id]);

  const authHeaders = useMemo(() => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }, [token]);

  const loadGeminiStatus = async () => {
    try {
      const res = await fetch('/api/gemini/status');
      if (!res.ok) throw new Error('Failed to fetch Gemini status');
      const data = await res.json();
      setGeminiConfigured(Boolean(data.configured));
    } catch {
      setGeminiConfigured(null);
    }
  };

  const loadLanguages = async () => {
    try {
      setLanguagesLoading(true);
      const res = await fetch(`/api/worlds/${worldId}/languages`);
      if (!res.ok) throw new Error('Failed to fetch languages');
      setLanguages(await res.json());
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to load languages', variant: 'destructive' });
    } finally {
      setLanguagesLoading(false);
    }
  };

  const loadLocations = async () => {
    try {
      const [countriesRes, settlementsRes] = await Promise.all([
        fetch(`/api/worlds/${worldId}/countries`),
        fetch(`/api/worlds/${worldId}/settlements`),
      ]);

      if (countriesRes.ok) {
        const countriesData = await countriesRes.json();
        setCountries(countriesData);
        const allStates: any[] = [];
        await Promise.all(
          countriesData.map(async (country: any) => {
            const res = await fetch(`/api/countries/${country.id}/states`);
            if (res.ok) {
              const stateData = await res.json();
              allStates.push(...stateData);
            }
          }),
        );
        setStates(allStates);
      }

      if (settlementsRes.ok) {
        setSettlements(await settlementsRes.json());
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load location data', variant: 'destructive' });
    }
  };

  const loadTruths = async () => {
    try {
      const res = await fetch(`/api/worlds/${worldId}/truths`);
      if (res.ok) setTruths(await res.json());
    } catch {
      // non-critical, ignore
    }
  };

  const loadChatHistory = async (languageId: string) => {
    try {
      setChatLoading(true);
      const res = await fetch(`/api/languages/${languageId}/chat`);
      if (!res.ok) throw new Error('Failed to fetch chat history');
      setChatMessages(await res.json());
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to load chat history', variant: 'destructive' });
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendChat = async () => {
    if (!selectedLanguage || !chatInput.trim()) return;
    try {
      setChatSending(true);
      const res = await fetch(`/api/languages/${selectedLanguage.id}/chat`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          worldId,
          scopeType: selectedLanguage.scopeType,
          scopeId: selectedLanguage.scopeId,
          message: chatInput.trim(),
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to send chat message');
      }
      const data = await res.json();
      if (Array.isArray(data.history)) setChatMessages(data.history);
      setChatInput('');
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to send message', variant: 'destructive' });
    } finally {
      setChatSending(false);
    }
  };

  const handleDeleteLanguage = async (language: LanguageWithDates) => {
    if (!canEdit || permissionsLoading) {
      toast({ title: 'Insufficient permissions', description: 'You do not have permission to edit this world.', variant: 'destructive' });
      return;
    }
    const confirmed = window.confirm(`Delete language "${language.name}"? This cannot be undone.`);
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/languages/${language.id}`, { method: 'DELETE', headers: authHeaders });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to delete language');
      }
      toast({ title: 'Language deleted', description: language.name });
      if (selectedLanguage?.id === language.id) {
        setSelectedLanguage(null);
        setChatMessages([]);
      }
      await loadLanguages();
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to delete language', variant: 'destructive' });
    }
  };

  const resolveScopeId = (): string | undefined => {
    if (scopeType === 'world') return worldId;
    if (scopeType === 'country') return countryId;
    if (scopeType === 'state') return stateId;
    if (scopeType === 'settlement') return settlementId;
    return undefined;
  };

  const handleGenerate = async () => {
    if (!canEdit || permissionsLoading) {
      toast({ title: 'Insufficient permissions', description: 'You do not have permission to edit this world.', variant: 'destructive' });
      return;
    }
    if (!languageName.trim()) {
      toast({ title: 'Language name required', description: 'Please provide a name for the language.', variant: 'destructive' });
      return;
    }
    if (selectedBaseLanguages.length === 0) {
      toast({ title: 'Base languages required', description: 'Select at least one base language.', variant: 'destructive' });
      return;
    }
    const scopeIdValue = resolveScopeId();
    if (!scopeIdValue) {
      toast({ title: 'Location required', description: 'Select a valid scope for the language.', variant: 'destructive' });
      return;
    }

    const phonology = parseFloat(phonologyEmphasis) || 0;
    const grammar = parseFloat(grammarEmphasis) || 0;
    const vocabulary = parseFloat(vocabularyEmphasis) || 0;
    const total = phonology + grammar + vocabulary;

    const config: ConlangConfig = {
      selectedLanguages: selectedBaseLanguages,
      name: languageName,
      emphasis: total > 0
        ? { phonology: phonology / total, grammar: grammar / total, vocabulary: vocabulary / total }
        : { phonology: 0.5, grammar: 0.3, vocabulary: 0.2 },
      complexity,
      purpose,
      includeWritingSystem,
      includeCulturalContext,
      includeAdvancedPhonetics,
      generateSampleTexts,
    };

    try {
      setIsGenerating(true);
      const res = await fetch(`/api/worlds/${worldId}/languages/generate`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ scopeType, scopeId: scopeIdValue, config, description: genDescription || null, makePrimary, mode }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to generate language');
      }
      const created = await res.json();
      toast({ title: 'Language generated', description: created.name });
      setLanguageName('');
      setGenDescription('');
      setSelectedBaseLanguages(['english']);
      setPhonologyEmphasis('0.5');
      setGrammarEmphasis('0.3');
      setVocabularyEmphasis('0.2');
      setMode('offline');
      setMakePrimary(true);
      setShowGenerateDialog(false);
      await loadLanguages();
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to generate language', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  // Group languages by scope for tree
  const languageGroups = useMemo(() => {
    const groups: Record<string, LanguageWithDates[]> = {};
    languages.forEach(lang => {
      const key = lang.scopeType || 'world';
      if (!groups[key]) groups[key] = [];
      groups[key].push(lang);
    });
    // Sort each group: primary first, then alphabetical
    Object.values(groups).forEach(arr => {
      arr.sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return a.name.localeCompare(b.name);
      });
    });
    return groups;
  }, [languages]);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
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
    if (selectedIds.size === languages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(languages.map(l => l.id)));
    }
  };

  const handleBulkDelete = async () => {
    try {
      const res = await fetch(`/api/worlds/${worldId}/languages/bulk-delete`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      if (res.ok) {
        const { deleted } = await res.json();
        toast({ title: `${deleted} language${deleted !== 1 ? 's' : ''} deleted` });
        setSelectedIds(new Set());
        if (selectedIds.has(selectedLanguage?.id || '')) setSelectedLanguage(null);
        loadLanguages();
      } else {
        toast({ title: 'Failed to delete languages', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Failed to delete languages', variant: 'destructive' });
    }
    setBulkDeleteOpen(false);
  };

  const scopeLabelForLanguage = (language: WorldLanguage): string => {
    if (language.scopeType === 'world') return 'World';
    if (language.scopeType === 'country') {
      const country = countries.find((c) => c.id === language.scopeId);
      return country ? country.name : 'Country';
    }
    if (language.scopeType === 'state') {
      const state = states.find((s) => s.id === language.scopeId);
      return state ? state.name : 'State';
    }
    if (language.scopeType === 'settlement') {
      const settlement = settlements.find((s) => s.id === language.scopeId);
      return settlement ? settlement.name : 'Settlement';
    }
    return language.scopeType;
  };

  // Resolve related truths for the selected language
  const relatedTruths = useMemo(() => {
    if (!selectedLanguage || !truths.length) return [];
    const allRelatedIds = new Set([
      ...(selectedLanguage.relatedTruthIds ?? []),
      ...(selectedLanguage.culturalTruthIds ?? []),
      ...(selectedLanguage.historicalTruthIds ?? []),
    ]);
    if (allRelatedIds.size === 0) return [];
    return truths.filter((t: any) => allRelatedIds.has(t.id));
  }, [selectedLanguage, truths]);

  const sortedChatMessages = useMemo(
    () => [...chatMessages].sort((a, b) => {
      const aTime = new Date(a.createdAt as any).getTime();
      const bTime = new Date(b.createdAt as any).getTime();
      return aTime - bTime;
    }),
    [chatMessages],
  );

  return (
    <div className="flex h-[calc(100vh-10rem)] min-h-[480px] gap-0 border border-white/20 dark:border-white/10 rounded-xl overflow-hidden bg-white/40 dark:bg-white/[0.02] backdrop-blur-xl">
      {/* Left Panel - Language Tree */}
      <div className="w-56 flex-shrink-0 border-r border-white/15 dark:border-white/10 flex flex-col">
        <div className="p-3 border-b border-white/15 dark:border-white/10 flex items-center justify-between">
          <span className="text-sm font-semibold">Languages ({languages.length})</span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowGenerateDialog(true)}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        {canEdit && languages.length > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 border-b bg-muted/20">
            <Button variant="ghost" size="sm" className="h-6 text-[10px] px-1.5" onClick={toggleSelectAll}>
              {selectedIds.size === languages.length ? 'Deselect All' : 'Select All'}
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
          {languagesLoading ? (
            <div className="p-3 text-xs text-muted-foreground text-center">Loading...</div>
          ) : languages.length === 0 ? (
            <div className="p-3 text-xs text-muted-foreground text-center">No languages yet</div>
          ) : (
            <div className="p-2 space-y-1">
              {(['world', 'country', 'state', 'settlement'] as const).map(scope => {
                const group = languageGroups[scope];
                if (!group || group.length === 0) return null;
                return (
                  <div key={scope}>
                    <button
                      className="w-full flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors rounded-md"
                      onClick={() => toggleGroup(scope)}
                    >
                      {expandedGroups.has(scope) ? (
                        <ChevronDown className="h-3 w-3 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-3 w-3 flex-shrink-0" />
                      )}
                      <Globe className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{SCOPE_LABELS[scope]}</span>
                      <span className="ml-auto text-[10px] opacity-60">{group.length}</span>
                    </button>

                    {expandedGroups.has(scope) && group.map(lang => (
                      <button
                        key={lang.id}
                        className={`w-full text-left px-5 py-1 text-xs rounded-sm transition-colors break-words flex items-center gap-1.5 ${
                          selectedLanguage?.id === lang.id
                            ? 'bg-primary/15 text-primary font-medium'
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        }`}
                        onClick={() => setSelectedLanguage(lang)}
                      >
                        <Checkbox
                          checked={selectedIds.has(lang.id)}
                          onClick={(e) => e.stopPropagation()}
                          onCheckedChange={() => toggleSelection(lang.id)}
                          className="h-3 w-3 mr-1 flex-shrink-0"
                        />
                        <span className="truncate">{lang.name}</span>
                        {lang.isPrimary && (
                          <Badge variant="default" className="text-[8px] px-1 py-0 h-3.5 flex-shrink-0">P</Badge>
                        )}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Center Panel - Language Detail */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedLanguage ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-white/15 dark:border-white/10">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-semibold truncate">{selectedLanguage.name}</h2>
                    {selectedLanguage.isPrimary && <Badge variant="default" className="text-[10px]">Primary</Badge>}
                    <Badge variant="outline" className="text-[10px]">
                      {selectedLanguage.kind === 'real' ? 'Real' : 'Constructed'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {scopeLabelForLanguage(selectedLanguage)}
                    {selectedLanguage.realCode && ` · Code: ${selectedLanguage.realCode}`}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs text-destructive hover:bg-destructive/10 flex-shrink-0"
                  onClick={() => handleDeleteLanguage(selectedLanguage)}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </div>

            {/* Detail Content */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {/* Description */}
                {selectedLanguage.description && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Description</h3>
                    <p className="text-sm">{selectedLanguage.description}</p>
                  </div>
                )}

                {/* Config Properties */}
                {selectedLanguage.config && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Configuration</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {selectedLanguage.config.complexity && (
                        <div className="p-2 bg-muted/30 rounded-lg">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Complexity</span>
                          <p className="text-sm font-medium capitalize">{selectedLanguage.config.complexity}</p>
                        </div>
                      )}
                      {selectedLanguage.config.purpose && (
                        <div className="p-2 bg-muted/30 rounded-lg">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Purpose</span>
                          <p className="text-sm font-medium capitalize">{selectedLanguage.config.purpose}</p>
                        </div>
                      )}
                      {selectedLanguage.config.selectedLanguages && (
                        <div className="p-2 bg-muted/30 rounded-lg">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Base Languages</span>
                          <p className="text-sm font-medium">{selectedLanguage.config.selectedLanguages.join(', ')}</p>
                        </div>
                      )}
                      {selectedLanguage.config.emphasis && (
                        <>
                          <div className="p-2 bg-muted/30 rounded-lg">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Phonology</span>
                            <p className="text-sm font-medium">{Math.round((selectedLanguage.config.emphasis.phonology || 0) * 100)}%</p>
                          </div>
                          <div className="p-2 bg-muted/30 rounded-lg">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Grammar</span>
                            <p className="text-sm font-medium">{Math.round((selectedLanguage.config.emphasis.grammar || 0) * 100)}%</p>
                          </div>
                          <div className="p-2 bg-muted/30 rounded-lg">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Vocabulary</span>
                            <p className="text-sm font-medium">{Math.round((selectedLanguage.config.emphasis.vocabulary || 0) * 100)}%</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Phonemes */}
                {selectedLanguage.phonemes && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Phonemes</h3>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      {selectedLanguage.phonemes.consonants && (
                        <div className="mb-2">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Consonants</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedLanguage.phonemes.consonants.map((c: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs font-mono">{c}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedLanguage.phonemes.vowels && (
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Vowels</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedLanguage.phonemes.vowels.map((v: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs font-mono">{v}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Grammar */}
                {selectedLanguage.grammar && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Grammar</h3>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <pre className="text-[11px] whitespace-pre-wrap break-all font-mono">
                        {JSON.stringify(selectedLanguage.grammar, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Writing System */}
                {selectedLanguage.writingSystem && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Writing System</h3>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <pre className="text-[11px] whitespace-pre-wrap break-all font-mono">
                        {JSON.stringify(selectedLanguage.writingSystem, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Sample Words */}
                {selectedLanguage.sampleWords && Object.keys(selectedLanguage.sampleWords).length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Sample Words ({Object.keys(selectedLanguage.sampleWords).length} entries)
                    </h3>
                    <div className="p-3 bg-muted/30 rounded-lg max-h-48 overflow-auto">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        {Object.entries(selectedLanguage.sampleWords).slice(0, 50).map(([english, translated]) => (
                          <div key={english} className="flex justify-between">
                            <span className="text-muted-foreground">{english}</span>
                            <span className="font-medium font-mono">{String(translated)}</span>
                          </div>
                        ))}
                      </div>
                      {Object.keys(selectedLanguage.sampleWords).length > 50 && (
                        <p className="text-[10px] text-muted-foreground mt-2">
                          ...and {Object.keys(selectedLanguage.sampleWords).length - 50} more entries
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Cultural Context */}
                {(selectedLanguage.culturalContext || relatedTruths.length > 0 || selectedLanguage.etymology?.length || selectedLanguage.dialectVariations?.length) && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5">
                      <Landmark className="h-3.5 w-3.5 text-primary" />
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cultural Context</h3>
                    </div>

                    {/* Cultural Context Details */}
                    {selectedLanguage.culturalContext && (
                      <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Region</span>
                            <p className="text-sm font-medium">{selectedLanguage.culturalContext.region}</p>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Speakers</span>
                            <p className="text-sm font-medium">{selectedLanguage.culturalContext.speakers.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Status</span>
                            <p className="text-sm font-medium capitalize">{selectedLanguage.culturalContext.status}</p>
                          </div>
                          {selectedLanguage.culturalContext.historicalPeriod && (
                            <div>
                              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Historical Period</span>
                              <p className="text-sm font-medium">{selectedLanguage.culturalContext.historicalPeriod}</p>
                            </div>
                          )}
                          {selectedLanguage.culturalContext.socialStructure && (
                            <div className="col-span-2">
                              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Social Structure</span>
                              <p className="text-sm font-medium">{selectedLanguage.culturalContext.socialStructure}</p>
                            </div>
                          )}
                        </div>
                        {selectedLanguage.culturalContext.culturalNotes && selectedLanguage.culturalContext.culturalNotes.length > 0 && (
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Cultural Notes</span>
                            <ul className="mt-1 space-y-1">
                              {selectedLanguage.culturalContext.culturalNotes.map((note, i) => (
                                <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                                  <span className="text-primary/60 shrink-0">-</span>
                                  <span>{note}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {selectedLanguage.culturalContext.geographicalFeatures && selectedLanguage.culturalContext.geographicalFeatures.length > 0 && (
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Geographical Features</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {selectedLanguage.culturalContext.geographicalFeatures.map((feat, i) => (
                                <Badge key={i} variant="outline" className="text-[10px]">
                                  <MapPin className="h-2.5 w-2.5 mr-0.5" />
                                  {feat}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Related Truths */}
                    {relatedTruths.length > 0 && (
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Linked Truths</span>
                        <div className="mt-1.5 space-y-1.5">
                          {relatedTruths.map((truth: any) => (
                            <div key={truth.id} className="p-2.5 bg-muted/30 rounded-lg border border-white/10">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium">{truth.title || truth.name || 'Untitled Truth'}</span>
                                {truth.era && <Badge variant="secondary" className="text-[10px]">{truth.era}</Badge>}
                                {truth.significance && <Badge variant="outline" className="text-[10px] capitalize">{truth.significance}</Badge>}
                                {truth.category && <Badge variant="outline" className="text-[10px] capitalize">{truth.category}</Badge>}
                              </div>
                              {truth.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{truth.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Etymology */}
                    {selectedLanguage.etymology && selectedLanguage.etymology.length > 0 && (
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Etymology</span>
                        <div className="mt-1.5 space-y-1.5">
                          {selectedLanguage.etymology.map((etym, i) => (
                            <div key={i} className="p-2.5 bg-muted/30 rounded-lg">
                              <div className="flex items-baseline gap-2">
                                <span className="text-sm font-medium font-mono">{etym.word}</span>
                                <span className="text-xs text-muted-foreground">- {etym.meaning}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">Origin: {etym.origin}</p>
                              {etym.evolution.length > 0 && (
                                <div className="flex items-center gap-1 mt-1 text-[11px] font-mono text-muted-foreground">
                                  {etym.evolution.map((step, j) => (
                                    <span key={j} className="flex items-center gap-1">
                                      {j > 0 && <span className="text-primary/50">{'->'}</span>}
                                      <span>{step}</span>
                                    </span>
                                  ))}
                                </div>
                              )}
                              {etym.cognates && Object.keys(etym.cognates).length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {Object.entries(etym.cognates).map(([lang, word]) => (
                                    <Badge key={lang} variant="secondary" className="text-[10px] font-mono">
                                      {lang}: {word}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dialect Variations */}
                    {selectedLanguage.dialectVariations && selectedLanguage.dialectVariations.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Languages className="h-3 w-3 text-primary/70" />
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Dialect Variations</span>
                        </div>
                        <div className="space-y-1.5">
                          {selectedLanguage.dialectVariations.map((dialect, i) => (
                            <div key={i} className="p-2.5 bg-muted/30 rounded-lg">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{dialect.name}</span>
                                <Badge variant="outline" className="text-[10px]">
                                  <MapPin className="h-2.5 w-2.5 mr-0.5" />
                                  {dialect.region}
                                </Badge>
                              </div>
                              {dialect.differences.phonological && dialect.differences.phonological.length > 0 && (
                                <div className="mt-1">
                                  <span className="text-[10px] text-muted-foreground">Phonological:</span>
                                  <span className="text-xs text-muted-foreground ml-1">{dialect.differences.phonological.join(', ')}</span>
                                </div>
                              )}
                              {dialect.differences.grammatical && dialect.differences.grammatical.length > 0 && (
                                <div className="mt-0.5">
                                  <span className="text-[10px] text-muted-foreground">Grammatical:</span>
                                  <span className="text-xs text-muted-foreground ml-1">{dialect.differences.grammatical.join(', ')}</span>
                                </div>
                              )}
                              {dialect.differences.lexical && Object.keys(dialect.differences.lexical).length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {Object.entries(dialect.differences.lexical).map(([word, variant]) => (
                                    <Badge key={word} variant="secondary" className="text-[10px] font-mono">
                                      {word} {'<->'} {variant}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center space-y-2">
              <Globe className="h-10 w-10 mx-auto opacity-20" />
              <p className="text-sm">Select a language to view details</p>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowGenerateDialog(true)}>
                <Sparkles className="h-3 w-3 mr-1" />
                Generate a Language
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Chat & Samples stacked */}
      {selectedLanguage && (
        <div className="w-72 flex-shrink-0 border-l border-white/15 dark:border-white/10 flex flex-col">
          {/* Chat Section */}
          <div className="flex flex-col flex-1 min-h-0">
            <div className="p-3 border-b border-white/15 dark:border-white/10 flex items-center gap-1.5">
              <MessageCircle className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold">Chat</span>
              <span className="text-[10px] text-muted-foreground ml-auto">{sortedChatMessages.length}</span>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-2">
                {chatLoading ? (
                  <div className="text-xs text-muted-foreground text-center py-4">Loading chat...</div>
                ) : sortedChatMessages.length === 0 ? (
                  <div className="text-xs text-muted-foreground text-center py-4">
                    No messages yet. Ask about this language below.
                  </div>
                ) : (
                  sortedChatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg px-2.5 py-1.5 text-xs ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <div>{msg.content}</div>
                        {msg.inLanguage && (
                          <div className="mt-1 text-[10px] opacity-80 font-mono">{msg.inLanguage}</div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
            <div className="p-2 border-t border-white/15 dark:border-white/10 flex gap-1.5">
              <Textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                rows={2}
                placeholder="Ask about this language..."
                className="resize-none text-xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendChat();
                  }
                }}
              />
              <Button
                size="icon"
                className="shrink-0 h-8 w-8 self-end"
                onClick={handleSendChat}
                disabled={chatSending || !chatInput.trim()}
              >
                {chatSending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
              </Button>
            </div>
          </div>

          {/* Samples Section */}
          {selectedLanguage.sampleTexts && selectedLanguage.sampleTexts.length > 0 && (
            <div className="border-t border-white/15 dark:border-white/10 max-h-[200px] flex flex-col">
              <div className="p-3 border-b border-white/15 dark:border-white/10 flex items-center gap-1.5 shrink-0">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold">Samples</span>
                <span className="text-[10px] text-muted-foreground ml-auto">{selectedLanguage.sampleTexts.length}</span>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-3 space-y-2">
                  {selectedLanguage.sampleTexts.map((sample: any, idx: number) => (
                    <div key={idx} className="p-2 bg-muted/30 rounded-lg text-xs space-y-1">
                      <Badge variant="outline" className="text-[10px]">{sample.type}</Badge>
                      <div className="font-medium">{sample.english}</div>
                      <div className="text-muted-foreground font-mono">{sample.language}</div>
                      {sample.transliteration && (
                        <div className="text-muted-foreground italic">{sample.transliteration}</div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      )}

      {/* Generate Language Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Generate Language
            </DialogTitle>
            <DialogDescription>
              Configure and generate a new language procedurally or with LLM enrichment.
            </DialogDescription>
          </DialogHeader>

          {geminiConfigured === false && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              Gemini AI is not configured. LLM-hybrid generation will fall back to offline behavior.
            </div>
          )}

          <div className="space-y-4">
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Language name</label>
                <Input value={languageName} onChange={(e) => setLanguageName(e.target.value)} placeholder="e.g., Elytharin" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Mode</label>
                <Select value={mode} onValueChange={(v: 'offline' | 'llm-hybrid') => setMode(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="offline">Offline only</SelectItem>
                    <SelectItem value="llm-hybrid">Offline + LLM enrichment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Scope</label>
                <Select value={scopeType} onValueChange={(v: LanguageScopeType) => {
                  setScopeType(v);
                  setCountryId(undefined);
                  setStateId(undefined);
                  setSettlementId(undefined);
                }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="world">World</SelectItem>
                    <SelectItem value="country">Country</SelectItem>
                    <SelectItem value="state">State</SelectItem>
                    <SelectItem value="settlement">Settlement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {scopeType === 'country' && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Country</label>
                  <Select value={countryId} onValueChange={setCountryId}>
                    <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {scopeType === 'state' && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">State</label>
                  <Select value={stateId} onValueChange={setStateId}>
                    <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent>
                      {states.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {scopeType === 'settlement' && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Settlement</label>
                  <Select value={settlementId} onValueChange={setSettlementId}>
                    <SelectTrigger><SelectValue placeholder="Select settlement" /></SelectTrigger>
                    <SelectContent>
                      {settlements.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Base languages</label>
              <div className="grid grid-cols-4 gap-2">
                {BASE_LANGUAGE_OPTIONS.map((opt) => {
                  const checked = selectedBaseLanguages.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedBaseLanguages(prev => checked ? prev.filter(id => id !== opt.id) : [...prev, opt.id])}
                      className={`flex items-center gap-2 rounded-md border px-2 py-1 text-sm transition-colors ${
                        checked ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'
                      }`}
                    >
                      <Checkbox checked={checked} className="pointer-events-none" />
                      <span>{opt.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 grid-cols-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Phonology weight</label>
                <Input type="number" min="0" max="1" step="0.1" value={phonologyEmphasis} onChange={(e) => setPhonologyEmphasis(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Grammar weight</label>
                <Input type="number" min="0" max="1" step="0.1" value={grammarEmphasis} onChange={(e) => setGrammarEmphasis(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Vocabulary weight</label>
                <Input type="number" min="0" max="1" step="0.1" value={vocabularyEmphasis} onChange={(e) => setVocabularyEmphasis(e.target.value)} />
              </div>
            </div>

            <div className="grid gap-4 grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Complexity</label>
                <Select value={complexity} onValueChange={(v: ConlangConfig['complexity']) => setComplexity(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">Simple</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="complex">Complex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Purpose</label>
                <Select value={purpose} onValueChange={(v: ConlangConfig['purpose']) => setPurpose(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="artistic">Artistic</SelectItem>
                    <SelectItem value="auxiliary">Auxiliary</SelectItem>
                    <SelectItem value="experimental">Experimental</SelectItem>
                    <SelectItem value="fictional">Fictional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 mt-6">
                <Checkbox checked={makePrimary} onCheckedChange={(v) => setMakePrimary(Boolean(v))} id="gen-make-primary" />
                <label htmlFor="gen-make-primary" className="text-sm">Make primary</label>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="flex items-center gap-2">
                <Checkbox checked={includeWritingSystem} onCheckedChange={(v) => setIncludeWritingSystem(Boolean(v))} id="gen-writing" />
                <label htmlFor="gen-writing" className="text-xs">Writing system</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={includeCulturalContext} onCheckedChange={(v) => setIncludeCulturalContext(Boolean(v))} id="gen-cultural" />
                <label htmlFor="gen-cultural" className="text-xs">Cultural context</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={includeAdvancedPhonetics} onCheckedChange={(v) => setIncludeAdvancedPhonetics(Boolean(v))} id="gen-phonetics" />
                <label htmlFor="gen-phonetics" className="text-xs">Advanced phonetics</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={generateSampleTexts} onCheckedChange={(v) => setGenerateSampleTexts(Boolean(v))} id="gen-samples" />
                <label htmlFor="gen-samples" className="text-xs">Sample texts</label>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description (optional)</label>
              <Textarea value={genDescription} onChange={(e) => setGenDescription(e.target.value)} rows={2} placeholder="Describe the language's vibe, culture, or usage." />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>Cancel</Button>
            <Button onClick={handleGenerate} disabled={isGenerating || permissionsLoading || !canEdit}>
              {isGenerating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} Language{selectedIds.size !== 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the selected languages. This action cannot be undone.
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
