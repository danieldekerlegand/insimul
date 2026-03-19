import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Brain, Compass, TestTube2,
  ChevronDown, Info,
} from 'lucide-react';

import { TruthTab } from './TruthTab';
import { PrologKnowledgeBase } from './PrologKnowledgeBase';
import { PrologSimulationPanel } from './prolog/PrologSimulationPanel';
import { SimulationsView } from './SimulationsView';

interface WorldIntelligenceTabProps {
  worldId: string;
  characters: any[];
}

type SubView = 'world-history' | 'knowledge-base' | 'prolog-sim' | 'simulations';
type RightPanel = 'overview' | 'details';

const SUB_VIEW_META: Record<SubView, { label: string; icon: typeof Brain; group: string }> = {
  'world-history':   { label: 'World History',     icon: Compass,   group: 'History' },
  'knowledge-base':  { label: 'Knowledge Base',    icon: Brain,     group: 'Prolog' },
  'prolog-sim':      { label: 'Prolog Simulation', icon: TestTube2, group: 'Prolog' },
  'simulations':     { label: 'Simulations',       icon: TestTube2, group: 'Execution' },
};

const GROUPS = ['History', 'Prolog', 'Execution'];

/** Read `view` query parameter from URL */
function getSubViewFromUrl(): SubView | null {
  const params = new URLSearchParams(window.location.search);
  const view = params.get('view');
  // Map legacy values
  if (view === 'history' || view === 'truth-manager' || view === 'history-timeline' || view === 'history-editor' || view === 'history-truths') return 'world-history';
  if (view && view in SUB_VIEW_META) return view as SubView;
  return null;
}

/** Update `view` query parameter in URL without page reload */
function setSubViewInUrl(view: SubView): void {
  const url = new URL(window.location.href);
  url.searchParams.set('view', view);
  window.history.replaceState({}, '', url.toString());
}

export function WorldIntelligenceTab({ worldId, characters }: WorldIntelligenceTabProps) {
  const [activeSubView, setActiveSubView] = useState<SubView>(() => getSubViewFromUrl() ?? 'world-history');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(GROUPS));
  const [expandedSection, setExpandedSection] = useState<RightPanel | null>('overview');

  const handleSubViewChange = useCallback((view: SubView) => {
    setActiveSubView(view);
    setSubViewInUrl(view);
  }, []);

  // Fetch truth count for badge
  const { data: truths = [] } = useQuery<any[]>({
    queryKey: ['/api/worlds', worldId, 'truth'],
    enabled: !!worldId,
  });

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  // ─── Left panel: navigation tree ─────────────────────────────────────────

  const renderTree = () => (
    <div className="flex flex-col h-full border-r">
      <div className="flex items-center justify-between px-3 py-2.5 border-b bg-muted/30 shrink-0">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Intelligence</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="py-1">
          {GROUPS.map(group => {
            const items = (Object.entries(SUB_VIEW_META) as [SubView, typeof SUB_VIEW_META[SubView]][])
              .filter(([, meta]) => meta.group === group);

            return (
              <div key={group}>
                <button
                  className="flex items-center gap-1 w-full px-3 py-1.5 hover:bg-muted/50 text-left"
                  onClick={() => toggleGroup(group)}
                >
                  {expandedGroups.has(group) ? (
                    <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0 -rotate-90" />
                  )}
                  <span className="text-xs font-medium">{group}</span>
                  <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">{items.length}</Badge>
                </button>

                {expandedGroups.has(group) && items.map(([id, meta]) => {
                  const Icon = meta.icon;
                  const isActive = activeSubView === id;
                  return (
                    <button
                      key={id}
                      className={`w-full text-left flex items-center gap-2 px-6 py-1.5 text-xs hover:bg-muted/50 transition-colors ${
                        isActive ? 'bg-primary/15 text-primary font-medium' : ''
                      }`}
                      onClick={() => handleSubViewChange(id)}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{meta.label}</span>
                      {id === 'world-history' && truths.length > 0 && (
                        <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">{truths.length}</Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );

  // ─── Center panel: content ───────────────────────────────────────────────

  const renderCenter = () => {
    const meta = SUB_VIEW_META[activeSubView];
    const Icon = meta.icon;

    return (
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        {/* Header */}
        <div className="px-4 py-3 border-b shrink-0">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-primary" />
            <h2 className="text-lg font-bold">{meta.label}</h2>
            <Badge variant="outline" className="text-[10px]">{meta.group}</Badge>
          </div>
        </div>

        {/* Sub-view content */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            {activeSubView === 'world-history' && (
              <TruthTab worldId={worldId} characters={characters} />
            )}
            {activeSubView === 'knowledge-base' && (
              <PrologKnowledgeBase worldId={worldId} />
            )}
            {activeSubView === 'prolog-sim' && (
              <PrologSimulationPanel worldId={worldId} />
            )}
            {activeSubView === 'simulations' && (
              <SimulationsView worldId={worldId} />
            )}
          </div>
        </ScrollArea>
      </div>
    );
  };

  // ─── Right panel: collapsible sections ───────────────────────────────────

  const renderRight = () => {
    const sections: { id: RightPanel; label: string; icon: typeof Info }[] = [
      { id: 'overview', label: 'Overview', icon: Brain },
      { id: 'details', label: 'Details', icon: Info },
    ];

    return (
      <div className="w-64 shrink-0 border-l flex flex-col min-h-0">
        {sections.map((section, idx) => {
          const isExpanded = expandedSection === section.id;
          const Icon = section.icon;

          return (
            <div
              key={section.id}
              className={`flex flex-col min-h-0 ${idx > 0 ? 'border-t' : ''} ${isExpanded ? 'flex-1' : ''}`}
            >
              <button
                className="flex items-center gap-1.5 px-3 py-2 border-b bg-muted/30 shrink-0 hover:bg-muted/50 transition-colors text-left"
                onClick={() => setExpandedSection(isExpanded ? null : section.id)}
              >
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.label}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground ml-auto transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
              </button>

              {isExpanded && (
                <div className="flex-1 min-h-0 flex flex-col">
                  <ScrollArea className="flex-1">
                    <div className="p-3 space-y-3">
                      {section.id === 'overview' && (
                        <>
                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Truths</span>
                            <p className="text-lg font-bold">{truths.length}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Characters</span>
                            <p className="text-lg font-bold">{characters.length}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Active View</span>
                            <p className="text-sm font-medium">{SUB_VIEW_META[activeSubView].label}</p>
                          </div>
                        </>
                      )}

                      {section.id === 'details' && (
                        <>
                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Description</span>
                            <p className="text-xs text-muted-foreground mt-1">
                              {activeSubView === 'world-history' && 'Browse, create, and edit world truths — historical events, backstory, relationships, and prophecies. Filter by era, significance, and importance.'}
                              {activeSubView === 'knowledge-base' && 'View and manage the Prolog knowledge base containing world facts, rules, and relationships.'}
                              {activeSubView === 'prolog-sim' && 'Run Prolog queries and simulations against the world knowledge base.'}
                              {activeSubView === 'simulations' && 'Configure and run world simulations to advance the timeline and generate events.'}
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Category</span>
                            <div className="mt-1">
                              <Badge variant="outline">{SUB_VIEW_META[activeSubView].group}</Badge>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ─── Root ────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-[calc(100vh-10rem)] min-h-[480px] rounded-lg border overflow-hidden bg-background">
      <div className="w-56 shrink-0 flex flex-col">
        {renderTree()}
      </div>
      {renderCenter()}
      {renderRight()}
    </div>
  );
}
