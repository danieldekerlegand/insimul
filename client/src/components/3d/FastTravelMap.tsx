import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { X, MapPin, Building, Home, Users } from 'lucide-react';

interface FastTravelMapProps {
  worldData: any;
  currentLocation: any;
  onClose: () => void;
  onTravel: (position: { x: number; y: number; z: number }, location: any) => void;
}

export function FastTravelMap({ worldData, currentLocation, onClose, onTravel }: FastTravelMapProps) {
  const handleTravelToSettlement = (settlement: any, index: number) => {
    const settlements = worldData.settlements || [];
    const spacing = 100;
    const gridSize = Math.ceil(Math.sqrt(settlements.length));
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;

    const x = (col - gridSize / 2) * spacing;
    const z = (row - gridSize / 2) * spacing;

    const state = worldData.states?.find((s: any) => s.id === settlement.stateId);
    const country = worldData.countries?.find((c: any) => c.id === settlement.countryId);

    onTravel({ x, y: 0, z }, { settlement, state, country });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <Card className="w-[90vw] h-[90vh] max-w-6xl bg-background/95 backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <MapPin className="w-6 h-6" />
              Fast Travel Map
            </CardTitle>
            <CardDescription>Select a location to travel to instantly</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>

        <CardContent className="h-[calc(100%-8rem)]">
          <Tabs defaultValue="settlements" className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="settlements">
                <Building className="w-4 h-4 mr-2" />
                Settlements
              </TabsTrigger>
              <TabsTrigger value="countries">
                <MapPin className="w-4 h-4 mr-2" />
                Countries
              </TabsTrigger>
              <TabsTrigger value="characters">
                <Users className="w-4 h-4 mr-2" />
                Characters
              </TabsTrigger>
            </TabsList>

            <TabsContent value="settlements" className="h-[calc(100%-3rem)]">
              <ScrollArea className="h-full pr-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {worldData.settlements.map((settlement: any, index: number) => {
                    const state = worldData.states?.find((s: any) => s.id === settlement.stateId);
                    const country = worldData.countries?.find((c: any) => c.id === settlement.countryId);
                    const isCurrentLocation = currentLocation.settlement?.id === settlement.id;
                    const businesses = worldData.businesses?.filter((b: any) => b.settlementId === settlement.id) || [];
                    const characters = worldData.characters?.filter((c: any) => {
                      const residence = worldData.residences?.find((r: any) =>
                        r.settlementId === settlement.id && r.residentIds?.includes(c.id)
                      );
                      return residence;
                    }) || [];

                    return (
                      <Card
                        key={settlement.id}
                        className={`cursor-pointer transition-all hover:shadow-lg ${
                          isCurrentLocation ? 'border-2 border-primary' : ''
                        }`}
                        onClick={() => handleTravelToSettlement(settlement, index)}
                      >
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            {settlement.name}
                            {isCurrentLocation && <MapPin className="w-4 h-4 text-primary" />}
                          </CardTitle>
                          <CardDescription>
                            {settlement.settlementType.toUpperCase()}
                            {state && ` - ${state.name}`}
                            {country && `, ${country.name}`}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-1 text-sm">
                            <p>🏘️ Population: {settlement.population || 'Unknown'}</p>
                            <p>🏢 Businesses: {businesses.length}</p>
                            <p>👥 Characters: {characters.length}</p>
                            {settlement.terrain && <p>🌍 Terrain: {settlement.terrain}</p>}
                          </div>
                          {!isCurrentLocation && (
                            <Button className="w-full mt-4" size="sm">
                              Travel Here
                            </Button>
                          )}
                          {isCurrentLocation && (
                            <p className="text-center text-sm text-muted-foreground mt-4">
                              Current Location
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="countries" className="h-[calc(100%-3rem)]">
              <ScrollArea className="h-full pr-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {worldData.countries.map((country: any) => {
                    const states = worldData.states?.filter((s: any) => s.countryId === country.id) || [];
                    const settlements = worldData.settlements?.filter((s: any) =>
                      s.countryId === country.id || states.some((st: any) => st.id === s.stateId)
                    ) || [];

                    return (
                      <Card key={country.id}>
                        <CardHeader>
                          <CardTitle>{country.name}</CardTitle>
                          <CardDescription>{country.description || 'A country in this world'}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p className="text-sm">🗺️ States: {states.length}</p>
                            <p className="text-sm">🏘️ Settlements: {settlements.length}</p>
                            {settlements.length > 0 && (
                              <div className="mt-4">
                                <p className="text-sm font-semibold mb-2">Major Settlements:</p>
                                <div className="space-y-1">
                                  {settlements.slice(0, 5).map((settlement: any, idx: number) => (
                                    <Button
                                      key={settlement.id}
                                      variant="outline"
                                      size="sm"
                                      className="w-full justify-start"
                                      onClick={() => handleTravelToSettlement(
                                        settlement,
                                        worldData.settlements.indexOf(settlement)
                                      )}
                                    >
                                      {settlement.name}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="characters" className="h-[calc(100%-3rem)]">
              <ScrollArea className="h-full pr-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {worldData.characters.slice(0, 50).map((character: any) => {
                    const residence = worldData.residences?.find((r: any) =>
                      r.residentIds?.includes(character.id)
                    );
                    const settlement = residence
                      ? worldData.settlements?.find((s: any) => s.id === residence.settlementId)
                      : null;

                    if (!settlement) return null;

                    return (
                      <Card
                        key={character.id}
                        className="cursor-pointer hover:shadow-lg transition-all"
                        onClick={() => {
                          const index = worldData.settlements.indexOf(settlement);
                          handleTravelToSettlement(settlement, index);
                        }}
                      >
                        <CardHeader>
                          <CardTitle className="text-base">
                            {character.firstName} {character.lastName}
                          </CardTitle>
                          <CardDescription>
                            {character.occupation || 'Resident'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-1 text-sm">
                            {character.age && <p>Age: {character.age}</p>}
                            {character.gender && <p>Gender: {character.gender}</p>}
                            {settlement && (
                              <p className="flex items-center gap-1 mt-2">
                                <MapPin className="w-3 h-3" />
                                {settlement.name}
                              </p>
                            )}
                          </div>
                          <Button className="w-full mt-4" size="sm">
                            Visit
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
