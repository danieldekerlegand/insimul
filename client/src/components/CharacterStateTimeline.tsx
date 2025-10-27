import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { User, Heart, ArrowRight, Users } from 'lucide-react';

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

interface CharacterDiff {
  attribute: string;
  oldValue: any;
  newValue: any;
}

interface CharacterStateTimelineProps {
  characterSnapshots: Map<number, Map<string, CharacterSnapshot>>;
  currentTimestep?: number;
}

export function CharacterStateTimeline({
  characterSnapshots,
  currentTimestep
}: CharacterStateTimelineProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [compareFromTimestep, setCompareFromTimestep] = useState<number | null>(null);
  const [compareToTimestep, setCompareToTimestep] = useState<number | null>(null);

  // Get all unique characters across all timesteps
  const allCharacters = new Set<string>();
  characterSnapshots.forEach((timestepMap) => {
    timestepMap.forEach((_, characterId) => {
      allCharacters.add(characterId);
    });
  });

  // Get all timesteps
  const timesteps = Array.from(characterSnapshots.keys()).sort((a, b) => a - b);

  // Get character snapshot at a specific timestep
  const getCharacterSnapshot = (characterId: string, timestep: number): CharacterSnapshot | null => {
    const timestepMap = characterSnapshots.get(timestep);
    return timestepMap?.get(characterId) || null;
  };

  // Calculate diff between two snapshots
  const calculateDiff = (
    from: CharacterSnapshot | null,
    to: CharacterSnapshot | null
  ): CharacterDiff[] => {
    if (!from || !to) return [];

    const diffs: CharacterDiff[] = [];

    // Check attributes
    Object.entries(to.attributes).forEach(([key, newValue]) => {
      const oldValue = (from.attributes as any)[key];
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        diffs.push({ attribute: key, oldValue, newValue });
      }
    });

    // Check relationships
    if (from.relationships.spouseId !== to.relationships.spouseId) {
      diffs.push({
        attribute: 'spouse',
        oldValue: from.relationships.spouseId,
        newValue: to.relationships.spouseId
      });
    }

    // Check custom attributes
    Object.entries(to.customAttributes).forEach(([key, newValue]) => {
      const oldValue = from.customAttributes[key];
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        diffs.push({ attribute: `custom.${key}`, oldValue, newValue });
      }
    });

    return diffs;
  };

  // Get timeline for a specific character
  const getCharacterTimeline = (characterId: string) => {
    return timesteps
      .map(timestep => ({
        timestep,
        snapshot: getCharacterSnapshot(characterId, timestep)
      }))
      .filter(entry => entry.snapshot !== null);
  };

  // Render character snapshot card
  const renderSnapshotCard = (snapshot: CharacterSnapshot) => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="font-semibold">Name:</span>{' '}
          {snapshot.attributes.firstName} {snapshot.attributes.lastName}
        </div>
        <div>
          <span className="font-semibold">Gender:</span> {snapshot.attributes.gender}
        </div>
        <div>
          <span className="font-semibold">Birth Year:</span> {snapshot.attributes.birthYear}
        </div>
        <div>
          <span className="font-semibold">Status:</span>{' '}
          <Badge variant={snapshot.attributes.isAlive ? 'default' : 'destructive'}>
            {snapshot.attributes.isAlive ? 'Alive' : 'Deceased'}
          </Badge>
        </div>
        {snapshot.attributes.occupation && (
          <div>
            <span className="font-semibold">Occupation:</span> {snapshot.attributes.occupation}
          </div>
        )}
        {snapshot.attributes.currentLocation && (
          <div>
            <span className="font-semibold">Location:</span> {snapshot.attributes.currentLocation}
          </div>
        )}
      </div>

      {/* Relationships */}
      {(snapshot.relationships.spouseId ||
        snapshot.relationships.parentIds.length > 0 ||
        snapshot.relationships.childIds.length > 0 ||
        snapshot.relationships.friendIds.length > 0) && (
        <div className="border-t pt-3">
          <div className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Relationships
          </div>
          <div className="space-y-1 text-sm">
            {snapshot.relationships.spouseId && (
              <div>Spouse: {snapshot.relationships.spouseId}</div>
            )}
            {snapshot.relationships.parentIds.length > 0 && (
              <div>Parents: {snapshot.relationships.parentIds.join(', ')}</div>
            )}
            {snapshot.relationships.childIds.length > 0 && (
              <div>Children: {snapshot.relationships.childIds.join(', ')}</div>
            )}
            {snapshot.relationships.friendIds.length > 0 && (
              <div>Friends: {snapshot.relationships.friendIds.join(', ')}</div>
            )}
          </div>
        </div>
      )}

      {/* Custom Attributes */}
      {Object.keys(snapshot.customAttributes).length > 0 && (
        <div className="border-t pt-3">
          <div className="font-semibold text-sm mb-2">Custom Attributes</div>
          <div className="space-y-1 text-sm">
            {Object.entries(snapshot.customAttributes).map(([key, value]) => (
              <div key={key}>
                <span className="font-medium">{key}:</span> {JSON.stringify(value)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (allCharacters.size === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Character State Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No character snapshots captured yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Character State Timeline ({allCharacters.size} characters)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="snapshots" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="snapshots">Snapshots</TabsTrigger>
            <TabsTrigger value="compare">Compare States</TabsTrigger>
          </TabsList>

          <TabsContent value="snapshots" className="mt-4">
            {/* Character selector */}
            <div className="mb-4">
              <label className="text-sm font-semibold mb-2 block">Select Character:</label>
              <select
                className="w-full p-2 border rounded"
                value={selectedCharacter || ''}
                onChange={(e) => setSelectedCharacter(e.target.value || null)}
              >
                <option value="">-- Select a character --</option>
                {Array.from(allCharacters).map((charId) => (
                  <option key={charId} value={charId}>
                    {charId}
                  </option>
                ))}
              </select>
            </div>

            {selectedCharacter && (
              <div className="space-y-3">
                {getCharacterTimeline(selectedCharacter).map(({ timestep, snapshot }) => (
                  <Card key={timestep} className="bg-slate-50 dark:bg-slate-900">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Timestep {timestep}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {snapshot && renderSnapshotCard(snapshot)}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!selectedCharacter && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Select a character to view their timeline.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="compare" className="mt-4">
            <div className="space-y-4">
              {/* Character selector */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Select Character:</label>
                <select
                  className="w-full p-2 border rounded"
                  value={selectedCharacter || ''}
                  onChange={(e) => setSelectedCharacter(e.target.value || null)}
                >
                  <option value="">-- Select a character --</option>
                  {Array.from(allCharacters).map((charId) => (
                    <option key={charId} value={charId}>
                      {charId}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCharacter && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold mb-2 block">From Timestep:</label>
                      <select
                        className="w-full p-2 border rounded"
                        value={compareFromTimestep || ''}
                        onChange={(e) => setCompareFromTimestep(Number(e.target.value) || null)}
                      >
                        <option value="">-- Select --</option>
                        {timesteps.map((t) => (
                          <option key={t} value={t}>
                            t={t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold mb-2 block">To Timestep:</label>
                      <select
                        className="w-full p-2 border rounded"
                        value={compareToTimestep || ''}
                        onChange={(e) => setCompareToTimestep(Number(e.target.value) || null)}
                      >
                        <option value="">-- Select --</option>
                        {timesteps.map((t) => (
                          <option key={t} value={t}>
                            t={t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {compareFromTimestep !== null && compareToTimestep !== null && (
                    (() => {
                      const fromSnapshot = getCharacterSnapshot(selectedCharacter, compareFromTimestep);
                      const toSnapshot = getCharacterSnapshot(selectedCharacter, compareToTimestep);
                      const diffs = calculateDiff(fromSnapshot, toSnapshot);

                      return (
                        <div className="space-y-4">
                          {diffs.length > 0 ? (
                            <Card className="bg-blue-50 dark:bg-blue-900/20">
                              <CardHeader>
                                <CardTitle className="text-base">
                                  Changes Detected ({diffs.length})
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2">
                                  {diffs.map((diff, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center gap-3 p-2 bg-white dark:bg-slate-800 rounded"
                                    >
                                      <Badge variant="outline">{diff.attribute}</Badge>
                                      <div className="flex items-center gap-2 flex-1 text-sm">
                                        <span className="text-red-600 dark:text-red-400">
                                          {JSON.stringify(diff.oldValue)}
                                        </span>
                                        <ArrowRight className="w-4 h-4" />
                                        <span className="text-green-600 dark:text-green-400">
                                          {JSON.stringify(diff.newValue)}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <p>No changes detected between these timesteps.</p>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base">
                                  State at t={compareFromTimestep}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                {fromSnapshot ? renderSnapshotCard(fromSnapshot) : (
                                  <p className="text-muted-foreground">No snapshot available</p>
                                )}
                              </CardContent>
                            </Card>
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base">
                                  State at t={compareToTimestep}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                {toSnapshot ? renderSnapshotCard(toSnapshot) : (
                                  <p className="text-muted-foreground">No snapshot available</p>
                                )}
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      );
                    })()
                  )}

                  {(compareFromTimestep === null || compareToTimestep === null) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Select two timesteps to compare character states.</p>
                    </div>
                  )}
                </>
              )}

              {!selectedCharacter && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Select a character to compare their states across timesteps.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
