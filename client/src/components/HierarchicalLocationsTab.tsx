import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Globe, MapPin, Building2, Home, Plus, ArrowLeft, ChevronRight, Map, MapPinned } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CountryDialog } from './dialogs/CountryDialog';
import { StateDialog } from './dialogs/StateDialog';
import { SettlementDialog } from './dialogs/SettlementDialog';

interface HierarchicalLocationsTabProps {
  worldId: string;
}

type ViewLevel = 'countries' | 'country-detail' | 'state-detail' | 'settlement-detail';

export function HierarchicalLocationsTab({ worldId }: HierarchicalLocationsTabProps) {
  const { toast } = useToast();
  
  // Navigation state
  const [viewLevel, setViewLevel] = useState<ViewLevel>('countries');
  const [selectedCountry, setSelectedCountry] = useState<any | null>(null);
  const [selectedState, setSelectedState] = useState<any | null>(null);
  const [selectedSettlement, setSelectedSettlement] = useState<any | null>(null);
  
  // Data states
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [lots, setLots] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  
  // Dialog states
  const [showCountryDialog, setShowCountryDialog] = useState(false);
  const [showStateDialog, setShowStateDialog] = useState(false);
  const [showSettlementDialog, setShowSettlementDialog] = useState(false);

  // Load countries on mount
  useEffect(() => {
    if (worldId) fetchCountries();
  }, [worldId]);

  // Fetch functions
  const fetchCountries = async () => {
    try {
      const res = await fetch(`/api/worlds/${worldId}/countries`);
      if (res.ok) setCountries(await res.json());
    } catch (error) {
      console.error('Failed to fetch countries:', error);
    }
  };
  
  const fetchStates = async (countryId: string) => {
    try {
      const res = await fetch(`/api/countries/${countryId}/states`);
      if (res.ok) setStates(await res.json());
    } catch (error) {
      console.error('Failed to fetch states:', error);
    }
  };
  
  const fetchSettlements = async (countryId?: string, stateId?: string) => {
    try {
      const url = stateId 
        ? `/api/states/${stateId}/settlements`
        : countryId
        ? `/api/countries/${countryId}/settlements`
        : `/api/worlds/${worldId}/settlements`;
      const res = await fetch(url);
      if (res.ok) setSettlements(await res.json());
    } catch (error) {
      console.error('Failed to fetch settlements:', error);
    }
  };
  
  const fetchLots = async (settlementId: string) => {
    try {
      const res = await fetch(`/api/settlements/${settlementId}/lots`);
      if (res.ok) setLots(await res.json());
    } catch (error) {
      console.error('Failed to fetch lots:', error);
    }
  };
  
  const fetchBusinesses = async (settlementId: string) => {
    try {
      const res = await fetch(`/api/settlements/${settlementId}/businesses`);
      if (res.ok) setBusinesses(await res.json());
    } catch (error) {
      console.error('Failed to fetch businesses:', error);
    }
  };

  // Navigation handlers
  const viewCountryDetail = (country: any) => {
    setSelectedCountry(country);
    setSelectedState(null);
    setSelectedSettlement(null);
    setViewLevel('country-detail');
    fetchStates(country.id);
    fetchSettlements(country.id);
  };

  const viewStateDetail = (state: any) => {
    setSelectedState(state);
    setSelectedSettlement(null);
    setViewLevel('state-detail');
    fetchSettlements(undefined, state.id);
  };

  const viewSettlementDetail = (settlement: any) => {
    setSelectedSettlement(settlement);
    setViewLevel('settlement-detail');
    fetchLots(settlement.id);
    fetchBusinesses(settlement.id);
  };

  const goBack = () => {
    if (viewLevel === 'settlement-detail') {
      if (selectedState) {
        setViewLevel('state-detail');
        setSelectedSettlement(null);
      } else {
        setViewLevel('country-detail');
        setSelectedSettlement(null);
      }
    } else if (viewLevel === 'state-detail') {
      setViewLevel('country-detail');
      setSelectedState(null);
    } else if (viewLevel === 'country-detail') {
      setViewLevel('countries');
      setSelectedCountry(null);
      setStates([]);
      setSettlements([]);
    }
  };

  // Breadcrumb rendering
  const renderBreadcrumb = () => {
    const parts: JSX.Element[] = [];
    
    if (viewLevel !== 'countries') {
      parts.push(
        <Button key="back" variant="ghost" size="sm" onClick={goBack} className="gap-1 hover:bg-primary/10">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      );
    }
    
    parts.push(
      <span key="world" className="text-sm text-muted-foreground font-medium">World</span>
    );
    
    if (selectedCountry) {
      parts.push(<ChevronRight key="sep1" className="w-4 h-4 text-muted-foreground" />);
      parts.push(
        <span key="country" className="text-sm font-semibold text-primary">{selectedCountry.name}</span>
      );
    }
    
    if (selectedState) {
      parts.push(<ChevronRight key="sep2" className="w-4 h-4 text-muted-foreground" />);
      parts.push(
        <span key="state" className="text-sm font-semibold text-primary">{selectedState.name}</span>
      );
    }
    
    if (selectedSettlement) {
      parts.push(<ChevronRight key="sep3" className="w-4 h-4 text-muted-foreground" />);
      parts.push(
        <span key="settlement" className="text-sm font-semibold text-primary">{selectedSettlement.name}</span>
      );
    }
    
    return (
      <div className="flex items-center gap-2 mb-6 p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg border border-primary/10">
        {parts}
      </div>
    );
  };

  return (
    <div className="space-y-4 p-6">
      {renderBreadcrumb()}
      
      {/* Countries List View */}
      {viewLevel === 'countries' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Countries
              </h2>
              <p className="text-muted-foreground mt-1">Click a country to explore its regions and settlements</p>
            </div>
            <Button 
              onClick={() => setShowCountryDialog(true)}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Country
            </Button>
          </div>
          
          <ScrollArea className="h-[600px]">
            <div className="grid gap-4">
              {countries.map((country) => (
                <Card 
                  key={country.id} 
                  className="cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-200 hover:scale-[1.02]" 
                  onClick={() => viewCountryDetail(country)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Globe className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{country.name}</CardTitle>
                          <CardDescription className="mt-1">{country.description}</CardDescription>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Government:</span>
                        <span className="font-medium">{country.governmentType || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Economy:</span>
                        <span className="font-medium">{country.economicSystem || 'Not specified'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {countries.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="pt-12 pb-12">
                    <div className="text-center space-y-3">
                      <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Globe className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-muted-foreground">No countries yet. Click "Add Country" to create one!</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
      
      {/* Country Detail View */}
      {viewLevel === 'country-detail' && selectedCountry && (
        <div className="space-y-6">
          {/* Country Info Card */}
          <Card className="border-2 border-primary/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{selectedCountry.name}</CardTitle>
                  <CardDescription className="mt-1">{selectedCountry.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Government</span>
                  <p className="font-semibold">{selectedCountry.governmentType || 'Not specified'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Economy</span>
                  <p className="font-semibold">{selectedCountry.economicSystem || 'Not specified'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Founded</span>
                  <p className="font-semibold">{selectedCountry.foundedYear || 'Unknown'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <p className="font-semibold">{selectedCountry.isActive ? '✓ Active' : 'Dissolved'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* States Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Map className="w-5 h-5 text-primary" />
                States & Provinces ({states.length})
              </h3>
              <Button onClick={() => setShowStateDialog(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add State
              </Button>
            </div>
            
            <div className="grid gap-4">
              {states.map((state) => (
                <Card 
                  key={state.id} 
                  className="cursor-pointer hover:border-primary hover:shadow-md transition-all" 
                  onClick={() => viewStateDetail(state)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Map className="w-5 h-5 text-primary" />
                        <CardTitle className="text-lg">{state.name}</CardTitle>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <CardDescription>{state.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 text-sm">
                      <span className="px-2 py-1 bg-primary/10 rounded text-primary font-medium">{state.stateType}</span>
                      <span className="text-muted-foreground">{state.terrain}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Settlements Section (Direct) */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Settlements ({settlements.length})
              </h3>
              <Button onClick={() => setShowSettlementDialog(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Settlement
              </Button>
            </div>
            
            <div className="grid gap-4">
              {settlements.map((settlement) => (
                <Card 
                  key={settlement.id} 
                  className="cursor-pointer hover:border-primary hover:shadow-md transition-all" 
                  onClick={() => viewSettlementDetail(settlement)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        <CardTitle className="text-lg">{settlement.name}</CardTitle>
                        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded">
                          {settlement.settlementType}
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Pop: {settlement.population?.toLocaleString() || 0}</span>
                      <span>{settlement.terrain}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* State Detail View */}
      {viewLevel === 'state-detail' && selectedState && (
        <div className="space-y-6">
          <Card className="border-2 border-primary/20">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Map className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{selectedState.name}</CardTitle>
                  <CardDescription>{selectedState.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Type</span>
                  <p className="font-semibold">{selectedState.stateType}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Terrain</span>
                  <p className="font-semibold">{selectedState.terrain}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Founded</span>
                  <p className="font-semibold">{selectedState.foundedYear || 'Unknown'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Settlements ({settlements.length})
              </h3>
              <Button onClick={() => setShowSettlementDialog(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Settlement
              </Button>
            </div>
            
            <div className="grid gap-4">
              {settlements.map((settlement) => (
                <Card 
                  key={settlement.id} 
                  className="cursor-pointer hover:border-primary hover:shadow-md transition-all" 
                  onClick={() => viewSettlementDetail(settlement)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        <CardTitle className="text-lg">{settlement.name}</CardTitle>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Settlement Detail View */}
      {viewLevel === 'settlement-detail' && selectedSettlement && (
        <div className="space-y-6">
          <Card className="border-2 border-primary/20">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <MapPinned className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    {selectedSettlement.name}
                    <span className="text-sm px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded">
                      {selectedSettlement.settlementType}
                    </span>
                  </CardTitle>
                  <CardDescription>{selectedSettlement.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Population</span>
                  <p className="font-semibold text-lg">{selectedSettlement.population?.toLocaleString() || 0}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Terrain</span>
                  <p className="font-semibold">{selectedSettlement.terrain}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Founded</span>
                  <p className="font-semibold">{selectedSettlement.foundedYear || 'Unknown'}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Generation</span>
                  <p className="font-semibold">{selectedSettlement.currentGeneration || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Lots */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Lots ({lots.length})
            </h3>
            <div className="grid gap-3">
              {lots.map((lot) => (
                <Card key={lot.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{lot.address}</CardTitle>
                    <CardDescription>District: {lot.districtName || 'None'}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
              {lots.length === 0 && <p className="text-sm text-muted-foreground">No lots. Use procedural generation.</p>}
            </div>
          </div>
          
          {/* Businesses */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Businesses ({businesses.length})
            </h3>
            <div className="grid gap-3">
              {businesses.map((business) => (
                <Card key={business.id}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      <CardTitle className="text-base">{business.name}</CardTitle>
                    </div>
                    <CardDescription>{business.businessType}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
              {businesses.length === 0 && <p className="text-sm text-muted-foreground">No businesses. Use procedural generation.</p>}
            </div>
          </div>
        </div>
      )}
      
      {/* Dialogs */}
      <CountryDialog 
        open={showCountryDialog}
        onOpenChange={setShowCountryDialog}
        worldId={worldId}
        onSuccess={() => { setShowCountryDialog(false); fetchCountries(); }}
      />
      
      <StateDialog 
        open={showStateDialog}
        onOpenChange={setShowStateDialog}
        worldId={worldId}
        countryId={selectedCountry?.id}
        countryName={selectedCountry?.name}
        onSuccess={() => { setShowStateDialog(false); if (selectedCountry) fetchStates(selectedCountry.id); }}
      />
      
      <SettlementDialog 
        open={showSettlementDialog}
        onOpenChange={setShowSettlementDialog}
        worldId={worldId}
        countryId={selectedCountry?.id}
        stateId={selectedState?.id}
        onSuccess={() => { 
          setShowSettlementDialog(false); 
          if (selectedState) {
            fetchSettlements(undefined, selectedState.id);
          } else if (selectedCountry) {
            fetchSettlements(selectedCountry.id);
          }
        }}
      />
    </div>
  );
}
