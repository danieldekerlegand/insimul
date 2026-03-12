import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Brain, Compass, History, Radio, TestTube2, Edit, GitBranch } from 'lucide-react';

import { TruthTab } from './TruthTab';
import { PrologKnowledgeBase } from './PrologKnowledgeBase';
import { PrologSimulationPanel } from './prolog/PrologSimulationPanel';
import { HistoryTimelineView } from './HistoryTimelineView';
import { ManualHistoryEditor } from './history/ManualHistoryEditor';
import { FamilyTreeView } from './history/FamilyTreeView';
import { SimulationsView } from './SimulationsView';
import { TelemetryMonitorDashboard } from './TelemetryMonitorDashboard';

interface WorldIntelligenceTabProps {
  worldId: string;
  characters: any[];
}

type SubView = 'history' | 'knowledge-base' | 'simulations' | 'truth-manager' | 'telemetry';

/** Read `view` query parameter from URL */
function getSubViewFromUrl(): SubView | null {
  const params = new URLSearchParams(window.location.search);
  const view = params.get('view');
  if (view && ['history', 'knowledge-base', 'simulations', 'truth-manager', 'telemetry'].includes(view)) {
    return view as SubView;
  }
  return null;
}

/** Update `view` query parameter in URL without page reload */
function setSubViewInUrl(view: SubView): void {
  const url = new URL(window.location.href);
  url.searchParams.set('view', view);
  window.history.replaceState({}, '', url.toString());
}

function HistorySubTabs({ worldId, characters }: { worldId: string; characters: any[] }) {
  const [historyView, setHistoryView] = useState<'timeline' | 'editor' | 'family-tree'>('timeline');

  return (
    <Tabs value={historyView} onValueChange={v => setHistoryView(v as any)} className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="timeline" className="gap-1.5">
          <History className="w-3.5 h-3.5" />
          Timeline
        </TabsTrigger>
        <TabsTrigger value="editor" className="gap-1.5">
          <Edit className="w-3.5 h-3.5" />
          Editor
        </TabsTrigger>
        <TabsTrigger value="family-tree" className="gap-1.5">
          <GitBranch className="w-3.5 h-3.5" />
          Family Tree
        </TabsTrigger>
      </TabsList>

      <TabsContent value="timeline">
        <HistoryTimelineView worldId={worldId} characters={characters} />
      </TabsContent>

      <TabsContent value="editor">
        <ManualHistoryEditor worldId={worldId} characters={characters} />
      </TabsContent>

      <TabsContent value="family-tree">
        <div className="h-[600px]">
          <FamilyTreeView characters={characters} />
        </div>
      </TabsContent>
    </Tabs>
  );
}

export function WorldIntelligenceTab({ worldId, characters }: WorldIntelligenceTabProps) {
  const [activeSubView, setActiveSubView] = useState<SubView>(() => getSubViewFromUrl() ?? 'history');

  // Sync URL when sub-view changes
  const handleSubViewChange = useCallback((view: string) => {
    const sv = view as SubView;
    setActiveSubView(sv);
    setSubViewInUrl(sv);
  }, []);

  // Fetch truth count for badge
  const { data: truths = [] } = useQuery<any[]>({
    queryKey: ['/api/worlds', worldId, 'truth'],
    enabled: !!worldId,
  });

  return (
    <div className="space-y-4 p-6">
      <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            World Intelligence
          </CardTitle>
          <CardDescription className="mt-1">
            Knowledge base, simulations, truth system, historical timeline, and telemetry monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeSubView}
            onValueChange={handleSubViewChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-5 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-xl p-1 h-auto">
              <TabsTrigger value="history" className="gap-2">
                <History className="w-4 h-4" />
                History
              </TabsTrigger>
              <TabsTrigger value="knowledge-base" className="gap-2">
                <Brain className="w-4 h-4" />
                Knowledge Base
              </TabsTrigger>
              <TabsTrigger value="simulations" className="gap-2">
                <TestTube2 className="w-4 h-4" />
                Simulations
              </TabsTrigger>
              <TabsTrigger value="truth-manager" className="gap-2">
                <Compass className="w-4 h-4" />
                Truths
                {truths.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                    {truths.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="telemetry" className="gap-2">
                <Radio className="w-4 h-4" />
                Telemetry
              </TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="mt-4">
              <HistorySubTabs worldId={worldId} characters={characters} />
            </TabsContent>

            <TabsContent value="knowledge-base" className="mt-4 space-y-4">
              <PrologKnowledgeBase worldId={worldId} />
              <PrologSimulationPanel worldId={worldId} />
            </TabsContent>

            <TabsContent value="simulations" className="mt-4">
              <SimulationsView worldId={worldId} />
            </TabsContent>

            <TabsContent value="truth-manager" className="mt-4">
              <TruthTab worldId={worldId} characters={characters} />
            </TabsContent>

            <TabsContent value="telemetry" className="mt-4">
              <TelemetryMonitorDashboard worldId={worldId} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
