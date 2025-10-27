import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TimelineDial } from './TimelineDial';
import { RuleExecutionSequenceView } from './RuleExecutionSequenceView';
import { CharacterStateTimeline } from './CharacterStateTimeline';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Clock, History, Sparkles, Play, Zap, Users } from 'lucide-react';

interface Truth {
  id: string;
  worldId: string;
  timestep: number;
  timestepDuration: number;
  entryType: string;
  title: string;
  content: string;
  relatedCharacterIds: string[];
  tags: string[];
  importance: number;
  source: string;
  sourceData: any;
  createdAt: string;
}

interface Character {
  id: string;
  firstName: string;
  lastName: string;
}

interface RuleExecutionRecord {
  timestep: number;
  ruleId: string;
  ruleName: string;
  ruleType: string;
  conditions: any[];
  effectsExecuted: Array<{
    type: string;
    description: string;
    success: boolean;
  }>;
  charactersAffected: string[];
  narrativeGenerated: string | null;
  timestamp: Date;
}

interface CharacterSnapshot {
  timestep: number;
  characterId: string;
  attributes: {
    firstName: string;
    lastName: string;
    birthYear: number;
    gender: string;
    isAlive: boolean;
    occupation: string | null;
    currentLocation: string | null;
    status: string;
  };
  relationships: {
    spouseId: string | null;
    parentIds: string[];
    childIds: string[];
    friendIds: string[];
  };
  customAttributes: Record<string, any>;
}

interface SimulationTimelineViewProps {
  simulationId: string;
  worldId: string;
  truthsCreated?: string[];
  ruleExecutionSequence?: RuleExecutionRecord[];
  characterSnapshots?: Map<number, Map<string, CharacterSnapshot>>;
}

export function SimulationTimelineView({
  simulationId,
  worldId,
  truthsCreated = [],
  ruleExecutionSequence = [],
  characterSnapshots = new Map()
}: SimulationTimelineViewProps) {
  const [currentTimestep, setCurrentTimestep] = useState(0);

  // Fetch all truths for this world
  const { data: allTruths = [] } = useQuery<Truth[]>({
    queryKey: ['/api/worlds', worldId, 'truth'],
    enabled: !!worldId,
  });

  // Fetch characters for name display
  const { data: characters = [] } = useQuery<Character[]>({
    queryKey: ['/api/worlds', worldId, 'characters'],
    enabled: !!worldId,
  });

  // Filter truths to only those created by this simulation
  const simulationTruths = allTruths.filter(truth =>
    truth.source === 'simulation_generated' &&
    truth.sourceData?.simulationId === simulationId
  );

  // Calculate timestep range from simulation truths
  const timesteps = simulationTruths.map(t => t.timestep);
  const minTimestep = timesteps.length > 0 ? Math.min(...timesteps) : 0;
  const maxTimestep = timesteps.length > 0 ? Math.max(...timesteps) : 10;

  // Filter truths by timeline position relative to current timestep
  const pastTruths: Truth[] = [];
  const presentTruths: Truth[] = [];
  const futureTruths: Truth[] = [];

  simulationTruths.forEach(entry => {
    const entryEndTimestep = entry.timestep + (entry.timestepDuration || 1) - 1;

    if (entryEndTimestep < currentTimestep) {
      pastTruths.push(entry);
    } else if (entry.timestep > currentTimestep) {
      futureTruths.push(entry);
    } else {
      presentTruths.push(entry);
    }
  });

  // Sort truths
  pastTruths.sort((a, b) => b.timestep - a.timestep);
  presentTruths.sort((a, b) => a.timestep - b.timestep);
  futureTruths.sort((a, b) => a.timestep - b.timestep);

  // Helper to get character name
  const getCharacterName = (characterId: string) => {
    const char = characters.find(c => c.id === characterId);
    return char ? `${char.firstName} ${char.lastName}` : 'Unknown';
  };

  // Helper to get entry type icon and color
  const getEntryTypeInfo = (entryType: string) => {
    const typeMap: Record<string, { icon: string; color: string }> = {
      event: { icon: '⚡', color: 'bg-blue-100 text-blue-800' },
      backstory: { icon: '📜', color: 'bg-amber-100 text-amber-800' },
      relationship: { icon: '💔', color: 'bg-pink-100 text-pink-800' },
      achievement: { icon: '🏆', color: 'bg-yellow-100 text-yellow-800' },
      milestone: { icon: '🎯', color: 'bg-purple-100 text-purple-800' },
      prophecy: { icon: '🔮', color: 'bg-indigo-100 text-indigo-800' },
      plan: { icon: '📋', color: 'bg-green-100 text-green-800' },
    };
    return typeMap[entryType] || { icon: '📝', color: 'bg-gray-100 text-gray-800' };
  };

  // Render a truth entry card
  const renderTruthCard = (truth: Truth) => {
    const typeInfo = getEntryTypeInfo(truth.entryType);

    return (
      <Card key={truth.id} className="mb-3">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">{typeInfo.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold">{truth.title}</h4>
                <Badge variant="outline" className={typeInfo.color}>
                  {truth.entryType}
                </Badge>
                {truth.sourceData?.grammarName && (
                  <Badge variant="secondary" className="text-xs">
                    {truth.sourceData.grammarName}
                  </Badge>
                )}
              </div>

              <div className="text-sm text-muted-foreground mb-2">
                <span className="font-mono">t={truth.timestep}</span>
                {truth.timestepDuration > 1 && (
                  <span className="ml-2">
                    (duration: {truth.timestepDuration})
                  </span>
                )}
              </div>

              <p className="text-sm whitespace-pre-wrap mb-3">{truth.content}</p>

              {truth.relatedCharacterIds.length > 0 && (
                <div className="text-xs text-muted-foreground mb-2">
                  <strong>Related:</strong>{' '}
                  {truth.relatedCharacterIds.map(getCharacterName).join(', ')}
                </div>
              )}

              {truth.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {truth.tags.filter(tag => tag !== 'simulation').map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (simulationTruths.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            Simulation Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No timeline events recorded yet.</p>
            <p className="text-sm mt-2">
              Run a simulation with rules that use <code className="bg-muted px-1 rounded">tracery_generate()</code> to generate narrative events.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="w-5 h-5" />
          Simulation Timeline ({simulationTruths.length} events)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <TimelineDial
            currentTimestep={currentTimestep}
            onTimestepChange={setCurrentTimestep}
            minTimestep={minTimestep}
            maxTimestep={maxTimestep}
          />
        </div>

        <Tabs defaultValue="present" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="past" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Past ({pastTruths.length})
            </TabsTrigger>
            <TabsTrigger value="present" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Present ({presentTruths.length})
            </TabsTrigger>
            <TabsTrigger value="future" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Future ({futureTruths.length})
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Rules ({ruleExecutionSequence.length})
            </TabsTrigger>
            <TabsTrigger value="characters" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Characters
            </TabsTrigger>
          </TabsList>

          <TabsContent value="past" className="mt-4">
            {pastTruths.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No events in the past at this timestep.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pastTruths.map(renderTruthCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="present" className="mt-4">
            {presentTruths.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No events occurring at timestep {currentTimestep}.</p>
                <p className="text-sm mt-2">Use the timeline dial to navigate to different timesteps.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {presentTruths.map(renderTruthCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="future" className="mt-4">
            {futureTruths.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No events in the future from this timestep.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {futureTruths.map(renderTruthCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rules" className="mt-4">
            <RuleExecutionSequenceView
              ruleExecutionSequence={ruleExecutionSequence}
              currentTimestep={currentTimestep}
            />
          </TabsContent>

          <TabsContent value="characters" className="mt-4">
            <CharacterStateTimeline
              characterSnapshots={characterSnapshots}
              currentTimestep={currentTimestep}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
