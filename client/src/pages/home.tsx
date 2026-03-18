import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { WorldSelectionScreen } from '@/components/WorldSelectionScreen';
import { ModernNavbar } from '@/components/ModernNavbar';
import { RulesHub } from '@/components/rules/RulesHub';
import { UnifiedWorldExplorerTab } from '@/components/UnifiedWorldExplorerTab';
import { ActionsHub } from '@/components/actions/ActionsHub';
import { WorldManagementTab } from '@/components/WorldManagementTab';
import { QuestsHub } from '@/components/quests/QuestsHub';
import { ItemsHub } from '@/components/items/ItemsHub';
import { WorldIntelligenceTab } from '@/components/WorldIntelligenceTab';
import { GrammarsHub } from '@/components/grammars/GrammarsHub';
import { LanguagesHub } from '@/components/languages/LanguagesHub';
import { ExportDialog } from '@/components/ExportDialog';
import { EngineExportDialog } from '@/components/EngineExportDialog';
import { ImportDialog } from '@/components/ImportDialog';
import { BabylonWorld } from '@/components/3DGame/BabylonWorld';
import { AuthDialog } from '@/components/AuthDialog';
import { AdminPanel } from '@/components/AdminPanel';
import { PlaythroughsList } from '@/components/PlaythroughsList';
import { PlaythroughSelector } from '@/components/PlaythroughSelector';
import { PlaythroughAnalytics } from '@/components/PlaythroughAnalytics';
import { ResearcherDashboard } from '@/components/ResearcherDashboard';
import { PlayerAssessmentDetail } from '@/components/PlayerAssessmentDetail';
import { AssessmentDashboard } from '@/components/AssessmentDashboard';
import { WorldBrowser } from '@/components/WorldBrowser';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { InsimulRuleCompiler } from '@/lib/unified-syntax';

interface Character {
  id: string;
  firstName: string;
  lastName: string;
}

export default function Home() {
  const [selectedWorld, setSelectedWorld] = useState<string>('');
  const [activeTab, setActiveTab] = useState('home');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [engineExportDialogOpen, setEngineExportDialogOpen] = useState(false);
  const [exportEngine, setExportEngine] = useState<'babylon' | 'unreal' | 'unity' | 'godot'>('unreal');
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [worldSettingsOpen, setWorldSettingsOpen] = useState(false);
  const [worldDeleteDialogOpen, setWorldDeleteDialogOpen] = useState(false);
  const [worldEditDialogOpen, setWorldEditDialogOpen] = useState(false);
  const [assessmentPlayerId, setAssessmentPlayerId] = useState<string | null>(null);
  const [selectedPlaythroughId, setSelectedPlaythroughId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const ruleCompiler = new InsimulRuleCompiler();
  const { toast } = useToast();
  const { user, login, isAuthenticated } = useAuth();

  // Fetch characters for tabs that need them (WorldIntelligenceTab, ExportDialog)
  const { data: characters = [] } = useQuery<Character[]>({
    queryKey: ['/api/worlds', selectedWorld, 'characters'],
    enabled: !!selectedWorld,
  });

  // Fetch rules for export
  const { data: rules = [] } = useQuery<any[]>({
    queryKey: ['/api/worlds', selectedWorld, 'rules'],
    enabled: !!selectedWorld,
  });

  // Fetch actions for export
  const { data: actions = [] } = useQuery<any[]>({
    queryKey: ['/api/worlds', selectedWorld, 'actions'],
    enabled: !!selectedWorld,
  });

  // Fetch worlds for world name
  const { data: worlds = [] } = useQuery<any[]>({
    queryKey: ['/api/worlds'],
  });

  // Show admin panel if open
  if (adminPanelOpen) {
    return <AdminPanel onBack={() => setAdminPanelOpen(false)} />;
  }

  // Show world selection if no world selected
  if (!selectedWorld) {
    return (
      <WorldSelectionScreen
        onWorldSelected={setSelectedWorld}
        onOpenAuth={() => setAuthDialogOpen(true)}
        onOpenAdminPanel={() => setAdminPanelOpen(true)}
      />
    );
  }

  const currentWorld = worlds.find(w => w.id === selectedWorld) || { id: selectedWorld, name: 'Selected World' };

  return (
    <div className="min-h-screen bg-background">
      <ModernNavbar
        currentWorld={currentWorld}
        activeTab={activeTab}
        onOpenAdminPanel={() => setAdminPanelOpen(true)}
        onExportGame={(engine) => { setExportEngine(engine); setEngineExportDialogOpen(true); }}
        onEditWorld={() => setWorldEditDialogOpen(true)}
        onOpenSettings={() => setWorldSettingsOpen(true)}
        onDeleteWorld={() => setWorldDeleteDialogOpen(true)}
        onTabChange={(tab) => {
          // Handle special tabs
          if (tab === 'import') {
            setImportDialogOpen(true);
            return;
          }
          if (tab === 'export') {
            setExportDialogOpen(true);
            return;
          }
          if (tab === 'export-game') {
            setEngineExportDialogOpen(true);
            return;
          }
          // Require authentication for 3D game
          if (tab === '3d-game' && !isAuthenticated) {
            setAuthDialogOpen(true);
            toast({
              title: 'Authentication required',
              description: 'Please sign in to play the 3D game',
            });
            return;
          }
          if (tab !== '3d-game') {
            setSelectedPlaythroughId(null);
          }
          setActiveTab(tab);
        }}
        onChangeWorld={() => { setSelectedWorld(''); setSelectedPlaythroughId(null); }}
        onOpenAuth={() => setAuthDialogOpen(true)}
      />

      {/* Society Tab - full width, outside max-w constraint */}
      {activeTab === 'society' && selectedWorld && (
        <div className="px-6 py-4">
          <UnifiedWorldExplorerTab worldId={selectedWorld} />
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6">
        {/* Rules Tab */}
        {activeTab === 'rules' && selectedWorld && (
          <div className="px-2 py-4">
            <RulesHub worldId={selectedWorld} />
          </div>
        )}

        {/* Actions Tab */}
        {activeTab === 'actions' && selectedWorld && (
          <div className="px-2 py-4">
            <ActionsHub worldId={selectedWorld} />
          </div>
        )}

        {/* World Intelligence Tab — Merged History, KB, Simulations, Truth */}
        {activeTab === 'world-intelligence' && selectedWorld && (
          <WorldIntelligenceTab worldId={selectedWorld} characters={characters} />
        )}

        {/* Quests Tab */}
        {activeTab === 'quests' && selectedWorld && (
          <div className="px-2 py-4">
            <QuestsHub worldId={selectedWorld} />
          </div>
        )}

        {/* Items Tab */}
        {activeTab === 'items' && selectedWorld && (
          <div className="px-2 py-4">
            <ItemsHub worldId={selectedWorld} />
          </div>
        )}

        {/* Grammars Tab */}
        {activeTab === 'grammars' && selectedWorld && (
          <div className="px-2 py-4">
            <GrammarsHub worldId={selectedWorld} />
          </div>
        )}

        {/* Languages Tab */}
        {activeTab === 'languages' && selectedWorld && (
          <div className="px-2 py-4">
            <LanguagesHub worldId={selectedWorld} />
          </div>
        )}

        {/* 3D Game Tab - Playthrough Selection then Game */}
        {activeTab === '3d-game' && selectedWorld && isAuthenticated && !selectedPlaythroughId && (
          <PlaythroughSelector
            worldId={selectedWorld}
            worldName={currentWorld?.name || 'Unknown World'}
            onSelectPlaythrough={(playthroughId) => setSelectedPlaythroughId(playthroughId)}
            onBack={() => { setActiveTab('home'); }}
          />
        )}
        {activeTab === '3d-game' && selectedWorld && isAuthenticated && selectedPlaythroughId && (
          <BabylonWorld
            worldId={selectedWorld}
            worldName={currentWorld?.name || 'Unknown World'}
            worldType={currentWorld?.config?.worldType}
            userId={user?.id}
            playthroughId={selectedPlaythroughId}
            onBack={() => { setSelectedPlaythroughId(null); }}
          />
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && selectedWorld && (
          <PlaythroughAnalytics worldId={selectedWorld} />
        )}

        {/* Research Dashboard Tab */}
        {activeTab === 'research' && selectedWorld && !assessmentPlayerId && (
          <ResearcherDashboard worldId={selectedWorld} onViewPlayerDetail={setAssessmentPlayerId} />
        )}

        {/* Player Assessment Detail (drills down from Research Dashboard) */}
        {activeTab === 'research' && selectedWorld && assessmentPlayerId && (
          <PlayerAssessmentDetail
            playerId={assessmentPlayerId}
            worldId={selectedWorld}
            onBack={() => setAssessmentPlayerId(null)}
          />
        )}

        {/* Assessment Dashboard Tab */}
        {activeTab === 'assessments' && selectedWorld && (
          <AssessmentDashboard worldId={selectedWorld} />
        )}

        {/* My Playthroughs Tab */}
        {activeTab === 'my-playthroughs' && (
          <PlaythroughsList
            onResumePlaythrough={(worldId, playthroughId) => {
              setSelectedWorld(worldId);
              setSelectedPlaythroughId(playthroughId);
              setActiveTab('3d-game');
            }}
          />
        )}

        {/* Browse Worlds Tab */}
        {activeTab === 'browse-worlds' && (
          <WorldBrowser
            onPlayWorld={(worldId) => {
              setSelectedWorld(worldId);
              setActiveTab('3d-game');
            }}
          />
        )}

        {/* World Home Tab — always mounted so Edit/Settings/Delete dialogs work from any tab */}
        {selectedWorld && (
          <div style={{ display: (activeTab === 'home' || activeTab === 'worlds') ? undefined : 'none' }}>
          <WorldManagementTab
            worldId={selectedWorld}
            worldName={currentWorld.name}
            worldDescription={currentWorld.description}
            onWorldDeleted={() => setSelectedWorld('')}
            onWorldUpdated={() => {
              queryClient.invalidateQueries({ queryKey: ['/api/worlds'] });
              queryClient.invalidateQueries({ queryKey: ['/api/worlds', selectedWorld] });
            }}
            showSettingsDialog={worldSettingsOpen}
            onSettingsDialogChange={setWorldSettingsOpen}
            showDeleteDialog={worldDeleteDialogOpen}
            onDeleteDialogChange={setWorldDeleteDialogOpen}
            showEditDialog={worldEditDialogOpen}
            onEditDialogChange={setWorldEditDialogOpen}
            onNavigate={(tab) => {
              if (tab === 'import') {
                setImportDialogOpen(true);
                return;
              }
              if (tab === 'export') {
                setExportDialogOpen(true);
                return;
              }
              if (tab === 'export-game') {
                setEngineExportDialogOpen(true);
                return;
              }
              if (tab === '3d-game' && !isAuthenticated) {
                setAuthDialogOpen(true);
                toast({
                  title: 'Authentication required',
                  description: 'Please sign in to play the 3D game',
                });
                return;
              }
              setActiveTab(tab);
            }}
          />
          </div>
        )}
      </div>

      {/* Engine Export Dialog */}
      {selectedWorld && (
        <EngineExportDialog
          open={engineExportDialogOpen}
          onOpenChange={setEngineExportDialogOpen}
          worldId={selectedWorld}
          worldName={currentWorld?.name || 'world'}
          initialEngine={exportEngine}
        />
      )}

      {/* Export Dialog */}
      {selectedWorld && (
        <ExportDialog
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          rules={rules.flatMap(file => {
            try {
              return ruleCompiler.compile(file.content, file.sourceFormat as any);
            } catch (error) {
              console.warn(`Failed to compile rules from ${file.name}:`, error);
              return [];
            }
          })}
          worldName={worlds.find(w => w.id === selectedWorld)?.name || 'world'}
          characters={characters}
          actions={actions}
          includeCharacters={true}
          includeActions={false}
        />
      )}

      {/* Import Dialog */}
      {selectedWorld && (
        <ImportDialog
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
          worldId={selectedWorld}
          onImportComplete={() => {
            // Refresh all data after import
            queryClient.invalidateQueries({ queryKey: ['/api/worlds', selectedWorld, 'rules'] });
            queryClient.invalidateQueries({ queryKey: ['/api/worlds', selectedWorld, 'characters'] });
            queryClient.invalidateQueries({ queryKey: ['/api/worlds', selectedWorld, 'actions'] });
          }}
        />
      )}

      {/* Auth Dialog */}
      <AuthDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        onAuthSuccess={(user, token) => {
          login(user, token);
          setActiveTab('3d-game');
        }}
      />

    </div>
  );
}
