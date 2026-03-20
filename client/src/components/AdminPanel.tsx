import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Globe, Layers, BookOpen, Sword, Package, FileText, Eye, Lock, Calendar, Hash, ChevronRight, ChevronDown, Search, Info, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdminAssetsHub } from "@/components/admin/AdminAssetsHub";
import { AdminRulesActionsHub } from "@/components/admin/AdminRulesActionsHub";
import { AdminItemsHub } from "@/components/admin/AdminItemsHub";
import { AdminTextsHub } from "@/components/admin/AdminTextsHub";
import { format } from "date-fns";

interface AdminPanelProps {
  onBack: () => void;
}

type Section = 'worlds' | 'assets' | 'items' | 'texts' | 'rules' | 'actions';

export function AdminPanel({ onBack }: AdminPanelProps) {
  const [activeSection, setActiveSection] = useState<Section>('assets');

  const sections: { id: Section; label: string; icon: React.ReactNode }[] = [
    { id: 'worlds', label: 'Worlds', icon: <Globe className="w-3.5 h-3.5" /> },
    { id: 'assets', label: 'Assets', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'items', label: 'Items', icon: <Package className="w-3.5 h-3.5" /> },
    { id: 'texts', label: 'Texts', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'rules', label: 'Rules', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'actions', label: 'Actions', icon: <Sword className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="max-w-[1600px] mx-auto space-y-3">
        {/* Compact Header */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-xl shadow-sm">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 rounded-lg hover:bg-white/50 dark:hover:bg-white/10">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-lg font-bold">Admin Panel</h1>

          {/* Section tabs */}
          <div className="flex gap-1 ml-4 bg-muted/50 rounded-lg p-0.5">
            {sections.map(s => (
              <button
                key={s.id}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeSection === s.id
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveSection(s.id)}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {activeSection === 'worlds' && <AdminWorldsSection />}
        {activeSection === 'assets' && <AdminAssetsHub />}
        {activeSection === 'items' && <AdminItemsHub />}
        {activeSection === 'texts' && <AdminTextsHub />}
        {activeSection === 'rules' && <AdminRulesActionsHub mode="rules" />}
        {activeSection === 'actions' && <AdminRulesActionsHub mode="actions" />}
      </div>
    </div>
  );
}

// ─── Worlds Section (three-column) ──────────────────────────────────────────

function AdminWorldsSection() {
  const { toast } = useToast();
  const [worlds, setWorlds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorld, setSelectedWorld] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSection, setExpandedSection] = useState<'details' | 'config' | null>('details');

  useEffect(() => { fetchWorlds(); }, []);

  const fetchWorlds = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/worlds');
      if (res.ok) setWorlds(await res.json());
    } catch (error) {
      console.error('Failed to fetch worlds:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredWorlds = useMemo(() => {
    if (!searchQuery) return worlds;
    const q = searchQuery.toLowerCase();
    return worlds.filter(w =>
      w.name.toLowerCase().includes(q) ||
      w.description?.toLowerCase().includes(q) ||
      w.config?.worldType?.toLowerCase().includes(q)
    );
  }, [worlds, searchQuery]);

  // Left panel
  const renderLeft = () => (
    <div className="flex flex-col h-full border-r">
      <div className="flex items-center justify-between px-3 py-2.5 border-b bg-muted/30 shrink-0">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Worlds</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={fetchWorlds} title="Refresh">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="px-2 py-2 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search worlds..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 text-xs pl-7"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {loading ? (
            <p className="text-xs text-muted-foreground text-center py-8">Loading...</p>
          ) : filteredWorlds.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No worlds found</p>
          ) : (
            <div className="space-y-0.5">
              {filteredWorlds.map(world => {
                const isSelected = selectedWorld?.id === world.id;
                const worldType = world.config?.worldType || world.config?.worldTypeLabel;
                return (
                  <button
                    key={world.id}
                    className={`w-full text-left px-3 py-2 text-xs rounded-sm transition-colors ${
                      isSelected
                        ? 'bg-primary/15 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                    onClick={() => setSelectedWorld(world)}
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate flex-1">{world.name}</span>
                      {worldType && (
                        <Badge variant="secondary" className="text-[10px] h-4 shrink-0">{worldType}</Badge>
                      )}
                    </div>
                    {world.description && !isSelected && (
                      <p className="text-[10px] text-muted-foreground/70 truncate mt-0.5 pl-[22px]">{world.description}</p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="px-3 py-2 border-t text-[10px] text-muted-foreground">
        {filteredWorlds.length} world{filteredWorlds.length !== 1 ? 's' : ''}
      </div>
    </div>
  );

  // Center panel
  const renderCenter = () => {
    if (!selectedWorld) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <Globe className="w-10 h-10 opacity-20" />
          <p className="text-sm">Select a world from the list</p>
        </div>
      );
    }

    const worldType = selectedWorld.config?.worldType || selectedWorld.config?.worldTypeLabel;
    const gameType = selectedWorld.config?.gameType;

    return (
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="px-4 py-3 border-b shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold">{selectedWorld.name}</h2>
            {worldType && (
              <Badge variant="secondary" className="text-xs">{worldType}</Badge>
            )}
            {selectedWorld.visibility && selectedWorld.visibility !== 'private' && (
              <Badge variant="outline" className="text-xs gap-1">
                <Eye className="w-3 h-3" /> {selectedWorld.visibility}
              </Badge>
            )}
            {selectedWorld.requiresAuth && (
              <Badge variant="outline" className="text-xs gap-1">
                <Lock className="w-3 h-3" /> Auth
              </Badge>
            )}
          </div>
          {selectedWorld.description && (
            <p className="text-sm text-muted-foreground">{selectedWorld.description}</p>
          )}
        </div>

        {/* Stats */}
        <div className="px-4 py-3 border-b shrink-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {selectedWorld.createdAt && (
              <div>
                <div className="text-[10px] text-muted-foreground flex items-center gap-1 mb-0.5">
                  <Calendar className="w-3 h-3" /> Created
                </div>
                <div className="text-sm font-medium">{format(new Date(selectedWorld.createdAt), 'MMM d, yyyy')}</div>
              </div>
            )}
            {selectedWorld.version && (
              <div>
                <div className="text-[10px] text-muted-foreground flex items-center gap-1 mb-0.5">
                  <Hash className="w-3 h-3" /> Version
                </div>
                <div className="text-sm font-medium">v{selectedWorld.version}</div>
              </div>
            )}
            {gameType && (
              <div>
                <div className="text-[10px] text-muted-foreground mb-0.5">Game Type</div>
                <div className="text-sm font-medium capitalize">{gameType}</div>
              </div>
            )}
            {selectedWorld.visibility && (
              <div>
                <div className="text-[10px] text-muted-foreground mb-0.5">Visibility</div>
                <div className="text-sm font-medium capitalize">{selectedWorld.visibility}</div>
              </div>
            )}
          </div>
        </div>

        {/* Badges and metadata */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 space-y-4">
            <div className="flex flex-wrap gap-1.5">
              {selectedWorld.targetLanguage && (
                <Badge variant="outline" className="text-xs">Target: {selectedWorld.targetLanguage}</Badge>
              )}
              {selectedWorld.isTemplate && (
                <Badge variant="secondary" className="text-xs">Template</Badge>
              )}
              {selectedWorld.maxPlayers && (
                <Badge variant="outline" className="text-xs">Max {selectedWorld.maxPlayers} players</Badge>
              )}
            </div>

            {/* World config summary */}
            {selectedWorld.config && (
              <div className="rounded-lg border p-3 space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground">Configuration</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(selectedWorld.config).map(([key, value]) => {
                    if (typeof value === 'object') return null;
                    return (
                      <div key={key}>
                        <span className="text-muted-foreground">{key}: </span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground/60 font-mono select-all">
              {selectedWorld.id}
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  };

  // Right panel
  const renderRight = () => {
    if (!selectedWorld) return null;

    const sections = [
      { id: 'details' as const, label: 'Details', icon: Info },
      { id: 'config' as const, label: 'Config', icon: Globe },
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
                        <DetailField label="ID" value={selectedWorld.id} mono />
                        <DetailField label="Name" value={selectedWorld.name} />
                        <DetailField label="Visibility" value={selectedWorld.visibility || 'private'} />
                        <DetailField label="Auth Required" value={selectedWorld.requiresAuth ? 'Yes' : 'No'} />
                        {selectedWorld.targetLanguage && (
                          <DetailField label="Target Language" value={selectedWorld.targetLanguage} />
                        )}
                        {selectedWorld.maxPlayers && (
                          <DetailField label="Max Players" value={String(selectedWorld.maxPlayers)} />
                        )}
                        <DetailField label="Template" value={selectedWorld.isTemplate ? 'Yes' : 'No'} />
                      </>
                    )}
                    {section.id === 'config' && selectedWorld.config && (
                      <>
                        {Object.entries(selectedWorld.config).map(([key, value]) => (
                          <DetailField
                            key={key}
                            label={key}
                            value={typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value ?? '')}
                            mono={typeof value === 'object'}
                          />
                        ))}
                      </>
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

  return (
    <div className="flex h-[calc(100vh-10rem)] min-h-[480px] rounded-lg border overflow-hidden bg-background">
      <div className="w-64 shrink-0 flex flex-col">
        {renderLeft()}
      </div>
      {renderCenter()}
      {selectedWorld && renderRight()}
    </div>
  );
}

function DetailField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={`text-xs break-words ${mono ? 'font-mono select-all text-[10px] whitespace-pre-wrap' : ''}`}>{value}</p>
    </div>
  );
}
