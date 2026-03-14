import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { useWorldPermissions } from '@/hooks/use-world-permissions';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Globe, ChevronRight, ChevronDown, MapPinned, Plus, Users, Home, Briefcase, GitBranch } from 'lucide-react';
import type { Character } from '@shared/schema';
import { CountryDialog } from '../dialogs/CountryDialog';
import { SettlementDialog } from '../dialogs/SettlementDialog';
import { BusinessDialog } from '../dialogs/BusinessDialog';
import { ResidenceDialog } from '../dialogs/ResidenceDialog';
import { LotDialog } from '../dialogs/LotDialog';
import { CharacterDetailView } from '../characters/CharacterDetailView';
import { CharacterEditDialog } from '../CharacterEditDialog';
import { CharacterChatDialog } from '../CharacterChatDialog';
import { FamilyTreeFlow } from '../visualization/FamilyTreeFlow';
import { LocationMapPreview, type ViewLevel } from './LocationMapPreview';

interface SettlementHubProps {
  worldId: string;
}

export function SettlementHub({ worldId }: SettlementHubProps) {
  const { toast } = useToast();
  const { canEdit } = useWorldPermissions(worldId);

  // Location tree
  const [countries, setCountries] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set());

  // Navigation: world → country → settlement
  const [viewLevel, setViewLevel] = useState<ViewLevel>('world');
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [selectedSettlement, setSelectedSettlement] = useState<any>(null);

  // Settlement detail data
  const [lots, setLots] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [residences, setResidences] = useState<any[]>([]);
  const [residents, setResidents] = useState<Character[]>([]);

  // All characters (for CharacterDetailView)
  const [allCharacters, setAllCharacters] = useState<Character[]>([]);
  const [truths, setTruths] = useState<any[]>([]);
  const [waterFeatures, setWaterFeatures] = useState<any[]>([]);

  // Character sidebar
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [editChar, setEditChar] = useState<Character | null>(null);
  const [chatChar, setChatChar] = useState<Character | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Family tree
  const [showFamilyTree, setShowFamilyTree] = useState(false);

  // Dialogs
  const [showCountryDialog, setShowCountryDialog] = useState(false);
  const [addSettlementCountryId, setAddSettlementCountryId] = useState<string | null>(null);
  const [showLotDialog, setShowLotDialog] = useState(false);
  const [showBusinessDialog, setShowBusinessDialog] = useState(false);
  const [showResidenceDialog, setShowResidenceDialog] = useState(false);

  useEffect(() => {
    fetchCountries();
    fetchAllSettlements();
    fetchAllCharacters();
    fetchTruths();
    fetchWaterFeatures();
  }, [worldId]);

  useEffect(() => {
    if (selectedSettlement) {
      fetchLots(selectedSettlement.id);
      fetchBusinesses(selectedSettlement.id);
      fetchResidences(selectedSettlement.id);
      fetchResidents(selectedSettlement.id);
    } else {
      setLots([]);
      setBusinesses([]);
      setResidences([]);
      setResidents([]);
    }
  }, [selectedSettlement?.id]);

  const fetchCountries = async () => {
    try {
      const res = await fetch(`/api/worlds/${worldId}/countries`);
      if (res.ok) {
        const data = await res.json();
        setCountries(data);
        setExpandedCountries(new Set(data.map((c: any) => c.id)));
      }
    } catch (e) {
      console.error('Failed to fetch countries:', e);
    }
  };

  const fetchAllSettlements = async () => {
    try {
      const res = await fetch(`/api/worlds/${worldId}/settlements`);
      if (res.ok) setSettlements(await res.json());
    } catch (e) {
      console.error('Failed to fetch settlements:', e);
    }
  };

  const fetchAllCharacters = async () => {
    try {
      const res = await fetch(`/api/worlds/${worldId}/characters`);
      if (res.ok) setAllCharacters(await res.json());
    } catch { setAllCharacters([]); }
  };

  const fetchTruths = async () => {
    try {
      const res = await fetch(`/api/worlds/${worldId}/truths`);
      if (res.ok) setTruths(await res.json());
    } catch { setTruths([]); }
  };

  const fetchWaterFeatures = async () => {
    try {
      const res = await fetch(`/api/worlds/${worldId}/water-features`);
      if (res.ok) setWaterFeatures(await res.json());
    } catch { setWaterFeatures([]); }
  };

  const fetchLots = async (id: string) => {
    try {
      const res = await fetch(`/api/settlements/${id}/lots`);
      setLots(res.ok ? await res.json() : []);
    } catch { setLots([]); }
  };

  const fetchBusinesses = async (id: string) => {
    try {
      const res = await fetch(`/api/settlements/${id}/businesses`);
      setBusinesses(res.ok ? await res.json() : []);
    } catch { setBusinesses([]); }
  };

  const fetchResidences = async (id: string) => {
    try {
      const res = await fetch(`/api/settlements/${id}/residences`);
      setResidences(res.ok ? await res.json() : []);
    } catch { setResidences([]); }
  };

  const fetchResidents = async (settlementId: string) => {
    // Filter from allCharacters if available, otherwise fetch
    if (allCharacters.length > 0) {
      setResidents(
        allCharacters.filter((c: any) => c.settlementId === settlementId || c.currentLocation === settlementId)
      );
      return;
    }
    try {
      const res = await fetch(`/api/worlds/${worldId}/characters`);
      if (res.ok) {
        const all: Character[] = await res.json();
        setAllCharacters(all);
        setResidents(
          all.filter((c: any) => c.settlementId === settlementId || c.currentLocation === settlementId)
        );
      }
    } catch { setResidents([]); }
  };

  const settlementsByCountry = useMemo(() => {
    const map = new Map<string | null, any[]>();
    settlements.forEach(s => {
      const key = s.countryId ?? null;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    });
    return map;
  }, [settlements]);

  const toggleCountry = (id: string) => {
    setExpandedCountries(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectCountry = (country: any) => {
    setSelectedCountry(country);
    setSelectedSettlement(null);
    setViewLevel('country');
  };

  const selectSettlement = (settlement: any) => {
    setSelectedSettlement(settlement);
    // Also ensure the parent country is set
    if (settlement.countryId) {
      const country = countries.find(c => c.id === settlement.countryId);
      if (country) setSelectedCountry(country);
    }
    setViewLevel('settlement');
  };

  const selectWorld = () => {
    setSelectedCountry(null);
    setSelectedSettlement(null);
    setViewLevel('world');
  };

  const settlementTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'city': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'town': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'village': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  // ─── Left panel ────────────────────────────────────────────────────────────

  const unaffiliated = settlementsByCountry.get(null) ?? [];

  const renderTree = () => (
    <div className="flex flex-col h-full border-r">
      <div className="flex items-center justify-between px-3 py-2.5 border-b bg-muted/30 shrink-0">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Locations</span>
        {canEdit && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setShowCountryDialog(true)}
            title="Add country"
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {/* World root node */}
          <button
            className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium text-left transition-colors ${
              viewLevel === 'world'
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-muted text-foreground'
            }`}
            onClick={selectWorld}
          >
            <Globe className="w-3.5 h-3.5 shrink-0 text-primary" />
            <span className="truncate">World</span>
            <span className="ml-auto text-xs text-muted-foreground">{settlements.length}</span>
          </button>

          {/* Countries */}
          <div className="ml-3 space-y-0.5">
            {countries.map(country => {
              const countrySettlements = settlementsByCountry.get(country.id) ?? [];
              const isExpanded = expandedCountries.has(country.id);
              const isSelected = viewLevel === 'country' && selectedCountry?.id === country.id;
              return (
                <div key={country.id}>
                  <div className="flex items-center">
                    <button
                      className="p-1 hover:bg-muted rounded shrink-0"
                      onClick={(e) => { e.stopPropagation(); toggleCountry(country.id); }}
                      title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded
                        ? <ChevronDown className="w-3 h-3 text-muted-foreground" />
                        : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                    </button>
                    <button
                      className={`flex-1 flex items-center gap-1.5 px-1.5 py-1.5 rounded-md text-sm font-medium text-left transition-colors ${
                        isSelected
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => selectCountry(country)}
                    >
                      <Globe className="w-3.5 h-3.5 shrink-0 text-primary/70" />
                      <span className="break-words">{country.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{countrySettlements.length}</span>
                    </button>
                  </div>
                  {isExpanded && (
                    <div className="ml-6 mt-0.5 space-y-0.5">
                      {countrySettlements.map(s => (
                        <button
                          key={s.id}
                          className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm text-left transition-colors ${
                            selectedSettlement?.id === s.id
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                          onClick={() => selectSettlement(s)}
                        >
                          <MapPinned className="w-3.5 h-3.5 shrink-0" />
                          <span className="break-words">{s.name}</span>
                        </button>
                      ))}
                      {canEdit && (
                        <button
                          className="w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-primary hover:bg-muted"
                          onClick={() => setAddSettlementCountryId(country.id)}
                        >
                          <Plus className="w-3 h-3" />
                          Add settlement
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Unaffiliated settlements */}
            {unaffiliated.length > 0 && (
              <div>
                <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider mt-2">
                  Unaffiliated
                </div>
                {unaffiliated.map(s => (
                  <button
                    key={s.id}
                    className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm text-left transition-colors ${
                      selectedSettlement?.id === s.id
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                    onClick={() => selectSettlement(s)}
                  >
                    <MapPinned className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{s.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {countries.length === 0 && settlements.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              <p>No locations yet.</p>
              {canEdit && (
                <Button
                  variant="link"
                  size="sm"
                  className="mt-1"
                  onClick={() => setShowCountryDialog(true)}
                >
                  Add a country
                </Button>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  // ─── Center panel ──────────────────────────────────────────────────────────

  const renderBreadcrumb = () => {
    const crumbs: { label: string; onClick: () => void }[] = [
      { label: 'World', onClick: selectWorld },
    ];
    if (selectedCountry && (viewLevel === 'country' || viewLevel === 'settlement')) {
      crumbs.push({ label: selectedCountry.name, onClick: () => selectCountry(selectedCountry) });
    }
    if (selectedSettlement && viewLevel === 'settlement') {
      crumbs.push({ label: selectedSettlement.name, onClick: () => {} });
    }

    return (
      <div className="flex items-center gap-1 px-4 py-2 border-b bg-muted/30 text-sm shrink-0">
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
            {i < crumbs.length - 1 ? (
              <button
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={crumb.onClick}
              >
                {crumb.label}
              </button>
            ) : (
              <span className="font-medium">{crumb.label}</span>
            )}
          </span>
        ))}
      </div>
    );
  };

  const renderCenter = () => (
    <div className="flex-1 flex flex-col min-h-0">
      {renderBreadcrumb()}

      {/* Settlement header when at settlement level */}
      {viewLevel === 'settlement' && selectedSettlement && (
        <div className="px-4 py-3 border-b shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold">{selectedSettlement.name}</h2>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${settlementTypeColor(selectedSettlement.settlementType)}`}>
              {selectedSettlement.settlementType}
            </span>
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>Pop: <strong className="text-foreground">{selectedSettlement.population?.toLocaleString() ?? '—'}</strong></span>
            <span>Terrain: <strong className="text-foreground">{selectedSettlement.terrain ?? '—'}</strong></span>
            <span>Founded: <strong className="text-foreground">{selectedSettlement.foundedYear ?? 'Unknown'}</strong></span>
          </div>
        </div>
      )}

      {/* Country header when at country level */}
      {viewLevel === 'country' && selectedCountry && (
        <div className="px-4 py-3 border-b shrink-0">
          <h2 className="text-lg font-bold">{selectedCountry.name}</h2>
          <p className="text-xs text-muted-foreground">
            {(settlementsByCountry.get(selectedCountry.id) ?? []).length} settlements
          </p>
        </div>
      )}

      {/* 3D Map */}
      <LocationMapPreview
        viewLevel={viewLevel}
        countries={countries}
        settlements={settlements}
        lots={lots}
        businesses={businesses}
        residences={residences}
        waterFeatures={waterFeatures}
        selectedCountryId={selectedCountry?.id}
        worldId={worldId}
        onSettlementClick={selectSettlement}
        onCountryClick={selectCountry}
        className="flex-1 min-h-0"
      />
    </div>
  );

  // ─── Right panel ───────────────────────────────────────────────────────────

  const renderRight = () => {
    if (viewLevel !== 'settlement' || !selectedSettlement) {
      return (
        <div className="w-72 shrink-0 border-l flex items-center justify-center p-4 text-center text-sm text-muted-foreground">
          Select a settlement to browse its residents, businesses, and lots
        </div>
      );
    }

    return (
      <div className="w-72 shrink-0 border-l flex flex-col min-h-0">
        {/* Residents section */}
        <div className="flex flex-col min-h-0 max-h-[40%]">
          <div className="flex items-center gap-1.5 px-3 py-2 border-b bg-muted/30 shrink-0">
            <Users className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">People</span>
            <span className="ml-auto text-xs text-muted-foreground">{residents.length}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 ml-1"
              onClick={() => setShowFamilyTree(true)}
              title="View family tree"
            >
              <GitBranch className="w-3 h-3" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-0.5">
              {residents.length === 0
                ? <p className="text-sm text-muted-foreground text-center py-4">No residents</p>
                : residents.map(c => (
                  <button
                    key={c.id}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted text-left"
                    onClick={() => setSelectedChar(c)}
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                      {(c.firstName ?? '?')[0]}{(c.lastName ?? '')[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{c.firstName} {c.lastName}</p>
                      {c.occupation && (
                        <p className="text-xs text-muted-foreground truncate">{c.occupation}</p>
                      )}
                    </div>
                  </button>
                ))
              }
            </div>
          </ScrollArea>
        </div>

        {/* Businesses section */}
        <div className="flex flex-col min-h-0 max-h-[30%] border-t">
          <div className="flex items-center gap-1.5 px-3 py-2 border-b bg-muted/30 shrink-0">
            <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Businesses</span>
            <span className="ml-auto text-xs text-muted-foreground">{businesses.length}</span>
            {canEdit && (
              <Button variant="ghost" size="icon" className="h-5 w-5 ml-1" onClick={() => setShowBusinessDialog(true)}>
                <Plus className="w-3 h-3" />
              </Button>
            )}
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-0.5">
              {businesses.length === 0
                ? <p className="text-sm text-muted-foreground text-center py-4">No businesses</p>
                : businesses.map(b => (
                  <div key={b.id} className="px-2 py-1.5 rounded-md hover:bg-muted">
                    <p className="text-sm font-medium">{b.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-muted-foreground">{b.businessType}</span>
                      {b.isOutOfBusiness && (
                        <Badge variant="secondary" className="text-xs py-0 h-4">Closed</Badge>
                      )}
                    </div>
                  </div>
                ))
              }
            </div>
          </ScrollArea>
        </div>

        {/* Lots section */}
        <div className="flex flex-col min-h-0 flex-1 border-t">
          <div className="flex items-center gap-1.5 px-3 py-2 border-b bg-muted/30 shrink-0">
            <Home className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lots</span>
            <span className="ml-auto text-xs text-muted-foreground">{lots.length}</span>
            {canEdit && (
              <Button variant="ghost" size="icon" className="h-5 w-5 ml-1" onClick={() => setShowLotDialog(true)}>
                <Plus className="w-3 h-3" />
              </Button>
            )}
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-0.5">
              {lots.length === 0
                ? <p className="text-sm text-muted-foreground text-center py-4">No lots</p>
                : lots.map(l => (
                  <div key={l.id} className="px-2 py-1.5 rounded-md hover:bg-muted">
                    <p className="text-sm font-medium">{l.address}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {l.districtName && (
                        <span className="text-xs text-muted-foreground">{l.districtName}</span>
                      )}
                      {l.buildingType && (
                        <Badge variant="outline" className="text-xs py-0 h-4">{l.buildingType}</Badge>
                      )}
                    </div>
                  </div>
                ))
              }
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  };

  // ─── Dialogs ───────────────────────────────────────────────────────────────

  const renderDialogs = () => (
    <>
      <CountryDialog
        open={showCountryDialog}
        onOpenChange={setShowCountryDialog}
        worldId={worldId}
        onSuccess={() => { setShowCountryDialog(false); fetchCountries(); fetchAllSettlements(); }}
      />
      <SettlementDialog
        open={!!addSettlementCountryId}
        onOpenChange={open => { if (!open) setAddSettlementCountryId(null); }}
        worldId={worldId}
        countryId={addSettlementCountryId ?? undefined}
        onSuccess={() => { setAddSettlementCountryId(null); fetchAllSettlements(); }}
      />
      {selectedSettlement && (
        <>
          <BusinessDialog
            open={showBusinessDialog}
            onOpenChange={setShowBusinessDialog}
            settlementId={selectedSettlement.id}
            onSubmit={async (data) => {
              try {
                const res = await fetch(`/api/settlements/${selectedSettlement.id}/businesses`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data),
                });
                if (res.ok) { fetchBusinesses(selectedSettlement.id); toast({ title: 'Business created' }); }
                else toast({ title: 'Failed to create business', variant: 'destructive' });
              } catch { toast({ title: 'Failed to create business', variant: 'destructive' }); }
            }}
          />
          <ResidenceDialog
            open={showResidenceDialog}
            onOpenChange={setShowResidenceDialog}
            settlementId={selectedSettlement.id}
            onSubmit={async (data) => {
              try {
                const res = await fetch(`/api/settlements/${selectedSettlement.id}/residences`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data),
                });
                if (res.ok) { fetchResidences(selectedSettlement.id); toast({ title: 'Residence created' }); }
                else toast({ title: 'Failed to create residence', variant: 'destructive' });
              } catch { toast({ title: 'Failed to create residence', variant: 'destructive' }); }
            }}
          />
          <LotDialog
            open={showLotDialog}
            onOpenChange={setShowLotDialog}
            settlementId={selectedSettlement.id}
            onSubmit={async (data) => {
              try {
                const res = await fetch(`/api/settlements/${selectedSettlement.id}/lots`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data),
                });
                if (res.ok) { fetchLots(selectedSettlement.id); toast({ title: 'Lot created' }); }
                else toast({ title: 'Failed to create lot', variant: 'destructive' });
              } catch { toast({ title: 'Failed to create lot', variant: 'destructive' }); }
            }}
          />
        </>
      )}
    </>
  );

  // ─── Root ──────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="flex h-[640px] rounded-lg border overflow-hidden bg-background">
        {/* Left: tree */}
        <div className="w-56 shrink-0 flex flex-col">
          {renderTree()}
        </div>

        {/* Center: breadcrumb + map */}
        {renderCenter()}

        {/* Right: stacked sections */}
        {renderRight()}
      </div>

      {renderDialogs()}

      {/* Character detail slide-over */}
      <Sheet open={!!selectedChar} onOpenChange={open => { if (!open) setSelectedChar(null); }}>
        <SheetContent side="right" className="w-[420px] sm:max-w-[420px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {selectedChar ? `${selectedChar.firstName} ${selectedChar.lastName}` : ''}
            </SheetTitle>
          </SheetHeader>
          {selectedChar && (
            <div className="mt-4">
              <CharacterDetailView
                character={selectedChar}
                allCharacters={allCharacters}
                onEditCharacter={(c) => { setEditChar(c); setShowEdit(true); }}
                onChatWithCharacter={(c) => { setChatChar(c); setShowChat(true); }}
                onViewCharacter={setSelectedChar}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Character edit dialog */}
      <CharacterEditDialog
        open={showEdit}
        onOpenChange={setShowEdit}
        character={editChar}
        onCharacterUpdated={() => { fetchAllCharacters(); setShowEdit(false); }}
        onCharacterDeleted={() => { fetchAllCharacters(); setShowEdit(false); setSelectedChar(null); }}
      />

      {/* Character chat dialog */}
      <CharacterChatDialog
        open={showChat}
        onOpenChange={setShowChat}
        character={chatChar as any}
        truths={chatChar ? truths.filter(t => t.characterId === chatChar.id) : []}
      />

      {/* Family tree dialog */}
      <Dialog open={showFamilyTree} onOpenChange={setShowFamilyTree}>
        <DialogContent className="max-w-[90vw] w-[90vw] h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Family Tree</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            {showFamilyTree && (
              <FamilyTreeFlow worldId={worldId} countries={countries} settlements={settlements} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
