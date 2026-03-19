import { useState, useMemo, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import Editor, { type Monaco, type OnMount } from '@monaco-editor/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Download, FileCode, Search, RefreshCw, ChevronDown } from 'lucide-react';

interface KBSection {
  name: string;
  filename: string;
  content: string;
}

interface KBData {
  worldId: string;
  totalLines: number;
  sections: KBSection[];
}

interface PrologKnowledgeBaseProps {
  worldId: string;
}

// Register Prolog language with Monaco (called once)
function registerPrologLanguage(monaco: Monaco) {
  if (monaco.languages.getLanguages().some((l: { id: string }) => l.id === 'prolog')) return;

  monaco.languages.register({ id: 'prolog', extensions: ['.pl', '.pro'], aliases: ['Prolog'] });

  monaco.languages.setMonarchTokensProvider('prolog', {
    defaultToken: '',
    tokenPostfix: '.prolog',

    keywords: ['is', 'mod', 'not', 'true', 'false', 'fail', 'halt', 'dynamic', 'discontiguous', 'module', 'use_module', 'ensure_loaded'],
    builtins: ['write', 'writeln', 'nl', 'read', 'assert', 'retract', 'asserta', 'assertz', 'retractall', 'findall', 'bagof', 'setof', 'forall', 'between', 'succ', 'plus', 'length', 'append', 'member', 'msort', 'sort', 'reverse', 'nth0', 'nth1', 'last', 'atom', 'number', 'integer', 'float', 'compound', 'var', 'nonvar', 'ground', 'atom_string', 'atom_chars', 'number_chars', 'char_code', 'sub_atom', 'atom_length', 'atom_concat', 'copy_term', 'functor', 'arg', 'call', 'once', 'ignore', 'catch', 'throw'],

    operators: [':-', '-->', '\\+', '->', ';', ',', '.', '|', '=', '\\=', '==', '\\==', '<', '>', '=<', '>=', '=:=', '=\\=', '+', '-', '*', '/', '//', 'rem'],

    symbols: /[=><!~?:&|+\-*\/\^%]+/,

    tokenizer: {
      root: [
        // Line comment
        [/%.*$/, 'comment'],
        // Block comment
        [/\/\*/, 'comment', '@comment'],

        // Directive
        [/:-\s*dynamic/, 'keyword'],
        [/:-\s*discontiguous/, 'keyword'],
        [/:-\s*module/, 'keyword'],
        [/:-\s*use_module/, 'keyword'],

        // Strings
        [/"([^"\\]|\\.)*$/, 'string.invalid'],
        [/"/, 'string', '@string_double'],
        [/'([^'\\]|\\.)*$/, 'string.invalid'],
        [/'/, 'string', '@string_single'],

        // Numbers
        [/\d+\.\d+/, 'number.float'],
        [/0x[0-9a-fA-F]+/, 'number.hex'],
        [/0o[0-7]+/, 'number.octal'],
        [/0b[01]+/, 'number.binary'],
        [/\d+/, 'number'],

        // Variables (uppercase or _)
        [/[A-Z_][A-Za-z0-9_]*/, 'variable'],

        // Atoms / identifiers
        [/[a-z][A-Za-z0-9_]*/, {
          cases: {
            '@keywords': 'keyword',
            '@builtins': 'predefined',
            '@default': 'identifier',
          },
        }],

        // Operators
        [/:-|-->/, 'keyword.operator'],
        [/\\[+=]/, 'keyword.operator'],
        [/[=<>!]+/, 'keyword.operator'],
        [/[+\-*\/]/, 'keyword.operator'],

        // Punctuation
        [/[().\[\]{},;|]/, 'delimiter'],
      ],

      comment: [
        [/[^/*]+/, 'comment'],
        [/\*\//, 'comment', '@pop'],
        [/[/*]/, 'comment'],
      ],

      string_double: [
        [/[^\\"]+/, 'string'],
        [/\\./, 'string.escape'],
        [/"/, 'string', '@pop'],
      ],

      string_single: [
        [/[^\\']+/, 'string'],
        [/\\./, 'string.escape'],
        [/'/, 'string', '@pop'],
      ],
    },
  });

  // Prolog-specific dark theme
  monaco.editor.defineTheme('prolog-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'C586C0' },
      { token: 'keyword.operator', foreground: 'D4D4D4' },
      { token: 'predefined', foreground: 'DCDCAA' },
      { token: 'variable', foreground: '9CDCFE' },
      { token: 'identifier', foreground: '4EC9B0' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'string.escape', foreground: 'D7BA7D' },
      { token: 'number', foreground: 'B5CEA8' },
      { token: 'number.float', foreground: 'B5CEA8' },
      { token: 'delimiter', foreground: 'D4D4D4' },
    ],
    colors: {
      'editor.background': '#1e1e2e',
    },
  });
}

export function PrologKnowledgeBase({ worldId }: PrologKnowledgeBaseProps) {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Facts', 'Rules', 'System']));
  const editorRef = useRef<any>(null);

  const { data, isLoading, refetch } = useQuery<KBData>({
    queryKey: ['/api/worlds', worldId, 'knowledge-base'],
    queryFn: async () => {
      const res = await fetch(`/api/worlds/${worldId}/knowledge-base`);
      if (!res.ok) throw new Error('Failed to load knowledge base');
      return res.json();
    },
    enabled: !!worldId,
  });

  const sections = data?.sections || [];

  // Group sections into categories
  const grouped = useMemo(() => {
    const facts: KBSection[] = [];
    const rules: KBSection[] = [];
    const system: KBSection[] = [];

    for (const s of sections) {
      const lower = s.name.toLowerCase();
      if (lower.includes('facts') || lower === 'header') {
        facts.push(s);
      } else if (lower.includes('rules') || lower.includes('predicates') || lower.includes('actions') || lower.includes('quests')) {
        rules.push(s);
      } else {
        system.push(s);
      }
    }

    return { Facts: facts, Rules: rules, System: system };
  }, [sections]);

  // Currently selected section
  const activeSection = sections.find(s => s.filename === selectedFile) || sections[0] || null;

  // Search across all files
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.trim().toLowerCase();
    const results: { section: KBSection; lineNumber: number; line: string }[] = [];
    for (const s of sections) {
      const lines = s.content.split('\n');
      lines.forEach((line, idx) => {
        if (line.toLowerCase().includes(q)) {
          results.push({ section: s, lineNumber: idx + 1, line: line.trim() });
        }
      });
    }
    return results;
  }, [sections, searchQuery]);

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const handleExport = () => {
    if (!data) return;
    const fullContent = sections.map(s => `% === ${s.name} ===\n${s.content}`).join('\n\n');
    const blob = new Blob([fullContent], { type: 'text/x-prolog' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `knowledge_base_${worldId}.pl`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast({ title: 'Exported', description: `Downloaded knowledge_base_${worldId}.pl` });
  };

  const handleExportSection = (section: KBSection) => {
    const blob = new Blob([`% === ${section.name} ===\n${section.content}`], { type: 'text/x-prolog' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = section.filename;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleEditorMount: OnMount = (editor, _monaco) => {
    editorRef.current = editor;
  };

  const handleBeforeMount = useCallback((monaco: Monaco) => {
    registerPrologLanguage(monaco);
  }, []);

  // Jump to a specific line when clicking search results
  const jumpToLine = (filename: string, lineNumber: number) => {
    setSelectedFile(filename);
    setSearchQuery('');
    // Give Monaco a tick to update content, then reveal line
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.revealLineInCenter(lineNumber);
        editorRef.current.setPosition({ lineNumber, column: 1 });
        editorRef.current.focus();
      }
    }, 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
        Generating knowledge base...
      </div>
    );
  }

  if (!data || sections.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileCode className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No knowledge base data available</p>
        <p className="text-xs mt-1">Add characters, truths, rules, or actions to populate the knowledge base.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Regenerate
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0 -m-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b bg-muted/20">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search across all files..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="h-7 pl-8 text-xs"
          />
        </div>
        <Badge variant="secondary" className="text-[10px] shrink-0">
          {sections.length} files &middot; {data.totalLines.toLocaleString()} lines
        </Badge>
        <div className="ml-auto flex gap-1.5">
          <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={() => refetch()}>
            <RefreshCw className="w-3 h-3 mr-1" />
            Refresh
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={handleExport}>
            <Download className="w-3 h-3 mr-1" />
            Export All
          </Button>
        </div>
      </div>

      {/* Search results overlay */}
      {searchResults && (
        <div className="border-b bg-muted/30 max-h-[180px] overflow-auto">
          {searchResults.length === 0 ? (
            <p className="px-4 py-2 text-xs text-muted-foreground">No matches found</p>
          ) : (
            <div className="divide-y divide-border/50">
              {searchResults.slice(0, 50).map((r, i) => (
                <button
                  key={i}
                  className="w-full text-left px-4 py-1.5 hover:bg-muted/50 flex items-baseline gap-2"
                  onClick={() => jumpToLine(r.section.filename, r.lineNumber)}
                >
                  <Badge variant="outline" className="text-[10px] shrink-0">{r.section.filename}</Badge>
                  <span className="text-[10px] text-muted-foreground shrink-0">:{r.lineNumber}</span>
                  <span className="text-xs font-mono truncate">{r.line}</span>
                </button>
              ))}
              {searchResults.length > 50 && (
                <p className="px-4 py-1.5 text-[10px] text-muted-foreground">
                  ...and {searchResults.length - 50} more matches
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* File browser + editor */}
      <div className="flex min-h-0 flex-1" style={{ height: 'calc(100vh - 22rem)' }}>
        {/* File tree */}
        <div className="w-48 shrink-0 border-r flex flex-col bg-[#1e1e2e]">
          <ScrollArea className="flex-1">
            <div className="py-1">
              {Object.entries(grouped).map(([group, items]) => {
                if (items.length === 0) return null;
                return (
                  <div key={group}>
                    <button
                      className="flex items-center gap-1 w-full px-3 py-1.5 hover:bg-white/5 text-left"
                      onClick={() => toggleGroup(group)}
                    >
                      <ChevronDown className={`w-3 h-3 text-gray-500 shrink-0 transition-transform ${expandedGroups.has(group) ? '' : '-rotate-90'}`} />
                      <span className="text-xs font-medium text-gray-300">{group}</span>
                      <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 bg-white/10 text-gray-400 border-0">{items.length}</Badge>
                    </button>
                    {expandedGroups.has(group) && items.map(s => {
                      const isActive = (activeSection?.filename === s.filename && !selectedFile) || selectedFile === s.filename;
                      return (
                        <button
                          key={s.filename}
                          className={`w-full text-left flex items-center gap-1.5 px-5 py-1 text-[11px] hover:bg-white/5 transition-colors ${
                            isActive ? 'bg-white/10 text-white font-medium' : 'text-gray-400'
                          }`}
                          onClick={() => setSelectedFile(s.filename)}
                        >
                          <FileCode className="w-3 h-3 shrink-0" />
                          <span className="truncate">{s.filename}</span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Monaco editor */}
        <div className="flex-1 flex flex-col min-w-0">
          {activeSection && (
            <>
              {/* Tab bar */}
              <div className="flex items-center justify-between px-3 py-1 border-b bg-[#252536] shrink-0">
                <div className="flex items-center gap-2">
                  <FileCode className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-300">{activeSection.filename}</span>
                  <Badge variant="outline" className="text-[10px] border-gray-600 text-gray-500">
                    {activeSection.content.split('\n').length} lines
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] px-2 text-gray-400 hover:text-gray-200"
                  onClick={() => handleExportSection(activeSection)}
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              </div>

              {/* Editor */}
              <div className="flex-1 min-h-0">
                <Editor
                  language="prolog"
                  theme="prolog-dark"
                  value={activeSection.content}
                  beforeMount={handleBeforeMount}
                  onMount={handleEditorMount}
                  options={{
                    readOnly: true,
                    minimap: { enabled: true, scale: 1 },
                    fontSize: 13,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    wordWrap: 'off',
                    folding: true,
                    foldingStrategy: 'indentation',
                    renderLineHighlight: 'line',
                    matchBrackets: 'always',
                    automaticLayout: true,
                    scrollbar: {
                      verticalScrollbarSize: 10,
                      horizontalScrollbarSize: 10,
                    },
                    padding: { top: 8, bottom: 8 },
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
