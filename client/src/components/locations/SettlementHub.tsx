import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { useWorldPermissions } from '@/hooks/use-world-permissions';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Globe, ChevronRight, ChevronDown, MapPinned, Plus, Users, Home, Briefcase, GitBranch, Trash2, RefreshCw, Building2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Character } from '@shared/schema';
import { useAuth } from '@/contexts/AuthContext';
import { CountryDialog } from '../dialogs/CountryDialog';
import { SettlementDialog } from '../dialogs/SettlementDialog';
import { BusinessDialog } from '../dialogs/BusinessDialog';
import { ResidenceDialog } from '../dialogs/ResidenceDialog';
import { LotDialog } from '../dialogs/LotDialog';
import { CharacterDetailView } from '../characters/CharacterDetailView';
import { ResidenceDetailView } from './ResidenceDetailView';
import { CharacterChatDialog } from '../CharacterChatDialog';
import { FamilyTreeFlow } from '../visualization/FamilyTreeFlow';
import { LocationMapPreview, type ViewLevel } from './LocationMapPreview';
import { MapLayersPanel, ALL_LAYERS, type MapLayer } from './MapLayersPanel';
import { BuildingModelPreview } from './BuildingModelPreview';
import { getInteriorModelPath } from '@/components/3DGame/InteriorSceneManager';

interface SettlementHubProps {
  worldId: string;
}

export function SettlementHub({ worldId }: SettlementHubProps) {
  const { toast } = useToast();
  const { token } = useAuth();
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

  // Map layers
  const [visibleLayers, setVisibleLayers] = useState<Set<MapLayer>>(() => new Set(ALL_LAYERS));

  const toggleLayer = (layer: MapLayer) => {
    setVisibleLayers(prev => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });
  };

  // Character sidebar
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [chatChar, setChatChar] = useState<Character | null>(null);
  const [showChat, setShowChat] = useState(false);

  // Building preview sidebar
  const [selectedBuilding, setSelectedBuilding] = useState<{
    type: 'business' | 'residence' | 'lot';
    data: any;
    lot?: any;
    modelPath?: string | null;
    /** The model role resolved from building/business type (e.g. 'tavern', 'smallResidence') */
    resolvedRole?: string;
    /** How the model was matched: 'exact' if the role had a direct asset, 'fallback' if using 'default', 'none' if no model */
    matchType?: 'exact' | 'fallback' | 'none';
    /** Display name of the asset being shown */
    assetName?: string;
  } | null>(null);

  // Cache of resolved building model info from 3D config: role → { filePath, assetName }
  const [buildingModelInfo, setBuildingModelInfo] = useState<Record<string, { filePath: string; assetName: string }>>({});
  // Procedural building config from the asset collection (for preview rendering)
  const [proceduralBuildingConfig, setProceduralBuildingConfig] = useState<any>(null);

  // Fetch building model paths when world changes
  useEffect(() => {
    if (!worldId) return;
    (async () => {
      try {
        const [configRes, assetsRes] = await Promise.all([
          fetch(`/api/worlds/${worldId}/3d-config`),
          fetch(`/api/worlds/${worldId}/assets`),
        ]);
        if (!configRes.ok || !assetsRes.ok) return;
        const config3D = await configRes.json();
        const assets: any[] = await assetsRes.json();
        // Store procedural building config for preview rendering
        if (config3D?.proceduralBuildings) {
          setProceduralBuildingConfig(config3D.proceduralBuildings);
        }
        if (!config3D?.buildingModels) return;
        const info: Record<string, { filePath: string; assetName: string }> = {};
        for (const [role, assetId] of Object.entries(config3D.buildingModels)) {
          const asset = assets.find((a: any) => a.id === assetId);
          if (asset?.filePath) {
            info[role as string] = {
              filePath: asset.filePath,
              assetName: asset.name || asset.originalName || asset.filePath.split('/').pop() || 'Unknown',
            };
          }
        }
        setBuildingModelInfo(info);
      } catch { /* ignore */ }
    })();
  }, [worldId]);

  // Resolve a building's model role to a file path
  const getBuildingModelRole = (buildingType: string, businessType?: string): string => {
    if (buildingType === 'residence') {
      if (businessType === 'residence_large') return 'largeResidence';
      if (businessType === 'residence_mansion') return 'mansion';
      return 'smallResidence';
    }
    if (buildingType === 'business' && businessType) {
      const bt = businessType.toLowerCase();
      if (bt === 'tavern' || bt === 'inn') return 'tavern';
      if (bt === 'shop' || bt === 'market') return 'shop';
      if (bt === 'blacksmith') return 'blacksmith';
      if (bt === 'church') return 'church';
      if (bt === 'library') return 'library';
      if (bt === 'hospital') return 'hospital';
      if (bt === 'school') return 'school';
      if (bt === 'bank') return 'bank';
      if (bt === 'theater') return 'theater';
      if (bt === 'windmill') return 'windmill';
      if (bt === 'watermill') return 'watermill';
      if (bt.includes('lumber')) return 'lumbermill';
      if (bt.includes('barrack') || bt.includes('military')) return 'barracks';
      if (bt.includes('mine') || bt.includes('mining')) return 'mine';
      return 'default';
    }
    return 'default';
  };

  const selectBuilding = (type: 'business' | 'residence' | 'lot', data: any) => {
    // Find the associated lot
    const lot = type === 'lot' ? data : lots.find(l => l.id === data.lotId);
    const biz = type === 'business' ? data : (lot ? businesses.find(b => b.lotId === lot?.id) : null);
    const res = type === 'residence' ? data : (lot ? residences.find(r => r.lotId === lot?.id) : null);

    const buildingType = biz ? 'business' : res ? 'residence' : 'vacant';
    const businessType = biz?.businessType || (res ? 'residence_small' : undefined);
    const role = getBuildingModelRole(buildingType, businessType);

    let modelPath: string | null = null;
    let matchType: 'exact' | 'fallback' | 'none' = 'none';
    let assetName: string | undefined;
    if (buildingModelInfo[role]) {
      modelPath = buildingModelInfo[role].filePath;
      assetName = buildingModelInfo[role].assetName;
      matchType = 'exact';
    } else if (buildingModelInfo['default']) {
      modelPath = buildingModelInfo['default'].filePath;
      assetName = buildingModelInfo['default'].assetName;
      matchType = 'fallback';
    }

    setSelectedBuilding({ type, data, lot, modelPath, resolvedRole: role, matchType, assetName });
  };

  // Family tree
  const [showFamilyTree, setShowFamilyTree] = useState(false);

  // Dialogs
  const [showCountryDialog, setShowCountryDialog] = useState(false);
  const [addSettlementCountryId, setAddSettlementCountryId] = useState<string | null>(null);
  const [showLotDialog, setShowLotDialog] = useState(false);
  const [showBusinessDialog, setShowBusinessDialog] = useState(false);
  const [showResidenceDialog, setShowResidenceDialog] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'country' | 'settlement' | 'character' | 'business' | 'residence';
    id: string;
    name: string;
  } | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;
    const endpoints: Record<string, string> = {
      country: `/api/countries/${id}`,
      settlement: `/api/settlements/${id}`,
      character: `/api/characters/${id}`,
      business: `/api/businesses/${id}`,
      residence: `/api/residences/${id}`,
    };
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(endpoints[type], { method: 'DELETE', headers });
      if (res.ok || res.status === 204) {
        toast({ title: `${type.charAt(0).toUpperCase() + type.slice(1)} deleted` });
        if (type === 'country') {
          fetchCountries();
          fetchAllSettlements();
          if (selectedCountry?.id === id) selectWorld();
        } else if (type === 'settlement') {
          fetchAllSettlements();
          if (selectedSettlement?.id === id) {
            setSelectedSettlement(null);
            setViewLevel(selectedCountry ? 'country' : 'world');
          }
        } else if (type === 'character') {
          fetchAllCharacters();
          if (selectedSettlement) fetchResidents(selectedSettlement.id);
        } else if (type === 'business') {
          if (selectedSettlement) fetchBusinesses(selectedSettlement.id);
        } else if (type === 'residence') {
          if (selectedSettlement) fetchResidences(selectedSettlement.id);
        }
      } else {
        const data = await res.json().catch(() => ({}));
        toast({ title: `Failed to delete ${type}`, description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: `Failed to delete ${type}`, variant: 'destructive' });
    }
    setDeleteTarget(null);
  };

  // Regeneration
  const [regenerateTarget, setRegenerateTarget] = useState<{
    type: 'world' | 'country' | 'settlement';
    id: string;
    name: string;
  } | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerate = async () => {
    if (!regenerateTarget) return;
    setIsRegenerating(true);
    const { type, id } = regenerateTarget;
    const endpoints: Record<string, string> = {
      world: `/api/worlds/${worldId}/society/regenerate`,
      country: `/api/countries/${id}/regenerate`,
      settlement: `/api/settlements/${id}/regenerate`,
    };
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(endpoints[type], { method: 'POST', headers });
      if (res.ok) {
        const data = await res.json();
        const createdInfo = type === 'settlement'
          ? `${data.created?.characters || 0} characters`
          : `${data.created?.numSettlements || 0} settlements, ${data.created?.totalPopulation || 0} characters`;
        toast({ title: `${type.charAt(0).toUpperCase() + type.slice(1)} regenerated`, description: `Created ${createdInfo}` });
        fetchCountries();
        fetchAllSettlements();
        fetchAllCharacters();
        if (type === 'country' && selectedCountry?.id === id) selectWorld();
        if (type === 'settlement' && selectedSettlement?.id === id) {
          fetchLots(id);
          fetchBusinesses(id);
          fetchResidences(id);
          fetchResidents(id);
        }
      } else {
        const data = await res.json().catch(() => ({}));
        toast({ title: `Failed to regenerate ${type}`, description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: `Failed to regenerate ${type}`, variant: 'destructive' });
    } finally {
      setIsRegenerating(false);
      setRegenerateTarget(null);
    }
  };

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

  const handleResidenceTypeChange = async (residenceId: string, newType: string) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`/api/residences/${residenceId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ residenceType: newType }),
      });
      if (res.ok) {
        const updated = await res.json();
        setResidences(prev => prev.map(r => r.id === residenceId ? updated : r));
        if (selectedBuilding?.type === 'residence' && selectedBuilding.data.id === residenceId) {
          setSelectedBuilding({ ...selectedBuilding, data: updated });
        }
        toast({ title: 'Residence type updated' });
      } else {
        const data = await res.json().catch(() => ({}));
        toast({ title: 'Failed to update residence type', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Failed to update residence type', variant: 'destructive' });
    }
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
    <div className="flex flex-col h-full border-r overflow-hidden">
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
          <div
            className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium text-left transition-colors group ${
              viewLevel === 'world'
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-muted text-foreground'
            }`}
          >
            <button className="flex items-center gap-1.5 flex-1 min-w-0" onClick={selectWorld}>
              <Globe className="w-3.5 h-3.5 shrink-0 text-primary" />
              <span className="truncate">World</span>
            </button>
            <span className="text-xs text-muted-foreground">{settlements.length}</span>
            {canEdit && (
              <span
                role="button"
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-primary transition-opacity"
                onClick={() => setRegenerateTarget({ type: 'world', id: worldId, name: 'World Society' })}
                title="Regenerate all society data"
              >
                <RefreshCw className="w-3 h-3" />
              </span>
            )}
          </div>

          {/* Countries */}
          <div className="ml-3 space-y-0.5">
            {countries.map(country => {
              const countrySettlements = settlementsByCountry.get(country.id) ?? [];
              const isExpanded = expandedCountries.has(country.id);
              const isSelected = viewLevel === 'country' && selectedCountry?.id === country.id;
              return (
                <div key={country.id}>
                  <div className="flex items-center min-w-0">
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
                      className={`flex-1 min-w-0 flex items-center gap-1.5 px-1.5 py-1.5 rounded-md text-sm font-medium text-left transition-colors group ${
                        isSelected
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => selectCountry(country)}
                      title={country.name}
                    >
                      <Globe className="w-3.5 h-3.5 shrink-0 text-primary/70" />
                      <span className="truncate">{country.name}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{countrySettlements.length}</span>
                      {canEdit && (
                        <>
                          <span
                            role="button"
                            className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-primary transition-opacity"
                            onClick={(e) => { e.stopPropagation(); setRegenerateTarget({ type: 'country', id: country.id, name: country.name }); }}
                            title="Regenerate country"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </span>
                          <span
                            role="button"
                            className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-destructive transition-opacity"
                            onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: 'country', id: country.id, name: country.name }); }}
                            title="Delete country"
                          >
                            <Trash2 className="w-3 h-3" />
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                  {isExpanded && (
                    <div className="ml-6 mt-0.5 space-y-0.5">
                      {countrySettlements.map(s => (
                        <button
                          key={s.id}
                          className={`w-full min-w-0 flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm text-left transition-colors group ${
                            selectedSettlement?.id === s.id
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                          onClick={() => selectSettlement(s)}
                          title={s.name}
                        >
                          <MapPinned className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{s.name}</span>
                          {canEdit && (
                            <span className="ml-auto flex items-center gap-0.5">
                              <span
                                role="button"
                                className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-primary transition-opacity"
                                onClick={(e) => { e.stopPropagation(); setRegenerateTarget({ type: 'settlement', id: s.id, name: s.name }); }}
                                title="Regenerate settlement"
                              >
                                <RefreshCw className="w-3 h-3" />
                              </span>
                              <span
                                role="button"
                                className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-destructive transition-opacity"
                                onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: 'settlement', id: s.id, name: s.name }); }}
                                title="Delete settlement"
                              >
                                <Trash2 className="w-3 h-3" />
                              </span>
                            </span>
                          )}
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
                    className={`w-full min-w-0 flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm text-left transition-colors group ${
                      selectedSettlement?.id === s.id
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                    onClick={() => selectSettlement(s)}
                    title={s.name}
                  >
                    <MapPinned className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{s.name}</span>
                    {canEdit && (
                      <span className="ml-auto flex items-center gap-0.5">
                        <span
                          role="button"
                          className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-primary transition-opacity"
                          onClick={(e) => { e.stopPropagation(); setRegenerateTarget({ type: 'settlement', id: s.id, name: s.name }); }}
                          title="Regenerate settlement"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </span>
                        <span
                          role="button"
                          className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-destructive transition-opacity"
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: 'settlement', id: s.id, name: s.name }); }}
                          title="Delete settlement"
                        >
                          <Trash2 className="w-3 h-3" />
                        </span>
                      </span>
                    )}
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
            {canEdit && (
              <div className="ml-auto flex items-center gap-1">
                <button
                  className="p-1 rounded hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"
                  onClick={() => setRegenerateTarget({ type: 'settlement', id: selectedSettlement.id, name: selectedSettlement.name })}
                  title="Regenerate settlement"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  className="p-1 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                  onClick={() => setDeleteTarget({ type: 'settlement', id: selectedSettlement.id, name: selectedSettlement.name })}
                  title="Delete settlement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
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
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">{selectedCountry.name}</h2>
            {canEdit && (
              <div className="ml-auto flex items-center gap-1">
                <button
                  className="p-1 rounded hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"
                  onClick={() => setRegenerateTarget({ type: 'country', id: selectedCountry.id, name: selectedCountry.name })}
                  title="Regenerate country"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  className="p-1 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                  onClick={() => setDeleteTarget({ type: 'country', id: selectedCountry.id, name: selectedCountry.name })}
                  title="Delete country"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {(settlementsByCountry.get(selectedCountry.id) ?? []).length} settlements
          </p>
        </div>
      )}

      {/* 3D Map with mini-map and layers panel */}
      <div className="relative flex-1 min-h-0">
        <LocationMapPreview
          viewLevel={viewLevel}
          countries={countries}
          settlements={settlements}
          lots={lots}
          businesses={businesses}
          residences={residences}
          streets={selectedSettlement?.streets ?? []}
          waterFeatures={waterFeatures}
          selectedCountryId={selectedCountry?.id}
          worldId={worldId}
          onSettlementClick={selectSettlement}
          onCountryClick={selectCountry}
          onBuildingClick={(lotId) => {
            const lot = lots.find(l => l.id === lotId);
            if (!lot) return;
            // If it has a business, open as business; if residence, open as residence; else as lot
            const biz = businesses.find(b => b.lotId === lotId);
            const res = residences.find(r => r.lotId === lotId);
            if (biz) selectBuilding('business', biz);
            else if (res) selectBuilding('residence', res);
            else selectBuilding('lot', lot);
          }}
          visibleLayers={visibleLayers}
          className="w-full h-full"
        />
        <MapLayersPanel
          viewLevel={viewLevel}
          visibleLayers={visibleLayers}
          onToggleLayer={toggleLayer}
        />
      </div>
    </div>
  );

  // Right panel section state
  const [expandedSection, setExpandedSection] = useState<'people' | 'businesses' | 'residences' | 'lots' | null>(null);

  // ─── Right panel ───────────────────────────────────────────────────────────

  const renderRight = () => {
    if (viewLevel !== 'settlement' || !selectedSettlement) {
      return (
        <div className="w-72 shrink-0 border-l flex items-center justify-center p-4 text-center text-sm text-muted-foreground">
          Select a settlement to browse its residents, businesses, residences, and lots
        </div>
      );
    }

    const sections = [
      { id: 'people' as const, icon: Users, label: 'People', count: residents.length, data: residents },
      { id: 'businesses' as const, icon: Briefcase, label: 'Businesses', count: businesses.length, data: businesses },
      { id: 'residences' as const, icon: Home, label: 'Residences', count: residences.length, data: residences },
      { id: 'lots' as const, icon: Home, label: 'Lots', count: lots.length, data: lots },
    ];

    return (
      <div className="w-72 shrink-0 border-l flex flex-col min-h-0">
        {sections.map((section, idx) => {
          const isExpanded = expandedSection === section.id;
          const Icon = section.icon;

          return (
            <div
              key={section.id}
              className={`flex flex-col min-h-0 ${idx > 0 ? 'border-t' : ''} ${isExpanded ? 'flex-1' : ''}`}
            >
              {/* Section header */}
              <button
                className="flex items-center gap-1.5 px-3 py-2 border-b bg-muted/30 shrink-0 hover:bg-muted/50 transition-colors text-left"
                onClick={() => setExpandedSection(isExpanded ? null : section.id)}
              >
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.label}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">{section.count}</span>
                {section.id === 'people' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 ml-1"
                    onClick={(e) => { e.stopPropagation(); setShowFamilyTree(true); }}
                    title="View family tree"
                  >
                    <GitBranch className="w-3 h-3" />
                  </Button>
                )}
                {canEdit && (section.id === 'businesses' || section.id === 'residences' || section.id === 'lots') && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 ml-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (section.id === 'businesses') setShowBusinessDialog(true);
                      else if (section.id === 'residences') setShowResidenceDialog(true);
                      else if (section.id === 'lots') setShowLotDialog(true);
                    }}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                )}
                <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
              </button>

              {/* Section content */}
              {isExpanded && (
                <ScrollArea className="flex-1">
                  <div className="p-2 space-y-0.5">
                    {section.count === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No {section.label.toLowerCase()}</p>
                    ) : section.id === 'people' ? (
                      residents.map(c => (
                        <div
                          key={c.id}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted group"
                        >
                          <button
                            className="flex items-center gap-2 flex-1 min-w-0 text-left"
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
                          {canEdit && (
                            <button
                              className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-opacity shrink-0"
                              onClick={() => setDeleteTarget({ type: 'character', id: c.id, name: `${c.firstName} ${c.lastName}` })}
                              title="Delete character"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))
                    ) : section.id === 'businesses' ? (
                      businesses.map(b => (
                        <div key={b.id} className="px-2 py-1.5 rounded-md hover:bg-muted flex items-start gap-1 group cursor-pointer"
                          onClick={() => selectBuilding('business', b)}
                        >
                          <div className="w-5 h-5 rounded bg-orange-500/20 flex items-center justify-center shrink-0 mt-0.5">
                            <Building2 className="w-3 h-3 text-orange-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{b.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-xs text-muted-foreground">{b.businessType}</span>
                              {b.isOutOfBusiness && (
                                <Badge variant="secondary" className="text-xs py-0 h-4">Closed</Badge>
                              )}
                            </div>
                          </div>
                          {canEdit && (
                            <button
                              className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-opacity shrink-0 mt-0.5"
                              onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: 'business', id: b.id, name: b.name }); }}
                              title="Delete business"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))
                    ) : section.id === 'residences' ? (
                      residences.map(r => (
                        <div key={r.id} className="px-2 py-1.5 rounded-md hover:bg-muted flex items-start gap-1 group cursor-pointer"
                          onClick={() => selectBuilding('residence', r)}
                        >
                          <div className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                            <Home className="w-3 h-3 text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{r.address || 'Unnamed Residence'}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {r.residenceType && (
                                <span className="text-xs text-muted-foreground">{r.residenceType}</span>
                              )}
                              {r.occupantCount !== undefined && (
                                <Badge variant="outline" className="text-xs py-0 h-4">{r.occupantCount} occupants</Badge>
                              )}
                            </div>
                          </div>
                          {canEdit && (
                            <button
                              className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-opacity shrink-0 mt-0.5"
                              onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: 'residence', id: r.id, name: r.address || 'Unnamed Residence' }); }}
                              title="Delete residence"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      lots.map(l => (
                        <div key={l.id} className="px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer flex items-start gap-1"
                          onClick={() => selectBuilding('lot', l)}
                        >
                          <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 ${
                            l.buildingType === 'business' ? 'bg-orange-500/20' :
                            l.buildingType === 'residence' ? 'bg-blue-500/20' :
                            'bg-gray-500/20'
                          }`}>
                            <Building2 className={`w-3 h-3 ${
                              l.buildingType === 'business' ? 'text-orange-500' :
                              l.buildingType === 'residence' ? 'text-blue-500' :
                              'text-gray-500'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
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
                        </div>
                      ))
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
                const h: Record<string, string> = { 'Content-Type': 'application/json' };
                if (token) h['Authorization'] = `Bearer ${token}`;
                const res = await fetch(`/api/settlements/${selectedSettlement.id}/businesses`, {
                  method: 'POST', headers: h, body: JSON.stringify(data),
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
                const h: Record<string, string> = { 'Content-Type': 'application/json' };
                if (token) h['Authorization'] = `Bearer ${token}`;
                const res = await fetch(`/api/settlements/${selectedSettlement.id}/residences`, {
                  method: 'POST', headers: h, body: JSON.stringify(data),
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
                const h: Record<string, string> = { 'Content-Type': 'application/json' };
                if (token) h['Authorization'] = `Bearer ${token}`;
                const res = await fetch(`/api/settlements/${selectedSettlement.id}/lots`, {
                  method: 'POST', headers: h, body: JSON.stringify(data),
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
      <div className="flex h-[calc(100vh-10rem)] min-h-[480px] rounded-lg border overflow-hidden bg-background">
        {/* Left: tree */}
        <div className="w-56 shrink-0 min-w-0 flex flex-col overflow-hidden">
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
                onCharacterUpdated={() => fetchAllCharacters()}
                onCharacterDeleted={() => { fetchAllCharacters(); setSelectedChar(null); }}
                onChatWithCharacter={(c) => { setChatChar(c); setShowChat(true); }}
                onViewCharacter={setSelectedChar}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Building detail slide-over */}
      <Sheet open={!!selectedBuilding} onOpenChange={open => { if (!open) setSelectedBuilding(null); }}>
        <SheetContent side="right" className="w-[420px] sm:max-w-[420px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {selectedBuilding?.type === 'business' ? selectedBuilding.data.name :
               selectedBuilding?.type === 'residence' ? (selectedBuilding.data.address || 'Residence') :
               (selectedBuilding?.data.address || 'Lot')}
            </SheetTitle>
          </SheetHeader>
          {selectedBuilding && (
            <div className="mt-4 space-y-4">
              {/* 3D Building Preview */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">3D Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <BuildingModelPreview
                    modelPath={selectedBuilding.modelPath}
                    interiorModelPath={getInteriorModelPath(
                      selectedBuilding.type,
                      selectedBuilding.type === 'business'
                        ? selectedBuilding.data.businessType
                        : selectedBuilding.type === 'residence'
                          ? (selectedBuilding.data.residenceType || 'residence')
                          : undefined
                    )}
                    tintColor={
                      selectedBuilding.type === 'business'
                        ? { r: 0.55, g: 0.4, b: 0.25 }
                        : selectedBuilding.type === 'residence'
                          ? { r: 0.4, g: 0.45, b: 0.6 }
                          : { r: 0.35, g: 0.35, b: 0.3 }
                    }
                    buildingType={
                      selectedBuilding.type === 'business'
                        ? selectedBuilding.data.businessType
                        : selectedBuilding.type === 'residence'
                          ? selectedBuilding.data.residenceType
                          : selectedBuilding.data.buildingType
                    }
                    businessType={
                      selectedBuilding.type === 'business'
                        ? selectedBuilding.data.businessType
                        : undefined
                    }
                    proceduralConfig={proceduralBuildingConfig}
                    zone={selectedBuilding.type === 'business' ? 'commercial' : 'residential'}
                    className="h-52"
                  />
                  {/* Asset resolution explanation */}
                  <div className="text-xs text-muted-foreground bg-muted/50 rounded px-2.5 py-1.5 space-y-0.5">
                    {selectedBuilding.assetName && (
                      <p className="font-medium text-foreground">
                        Asset: {selectedBuilding.assetName}
                      </p>
                    )}
                    {selectedBuilding.matchType === 'exact' ? (
                      <p>
                        Matched role <Badge variant="outline" className="text-xs py-0 h-4 mx-0.5">{selectedBuilding.resolvedRole}</Badge> from
                        {selectedBuilding.type === 'business'
                          ? ` business type "${selectedBuilding.data.businessType}"`
                          : selectedBuilding.type === 'residence'
                            ? ` residence type "${selectedBuilding.data.residenceType || 'standard'}"`
                            : ` building type "${selectedBuilding.data.buildingType || 'vacant'}"`}
                      </p>
                    ) : selectedBuilding.matchType === 'fallback' ? (
                      <>
                        <p>
                          Resolved role <Badge variant="outline" className="text-xs py-0 h-4 mx-0.5">{selectedBuilding.resolvedRole}</Badge> from
                          {selectedBuilding.type === 'business'
                            ? ` business type "${selectedBuilding.data.businessType}"`
                            : selectedBuilding.type === 'residence'
                              ? ` residence type "${selectedBuilding.data.residenceType || 'standard'}"`
                              : ` building type "${selectedBuilding.data.buildingType || 'vacant'}"`}
                        </p>
                        <p className="text-muted-foreground/70">
                          No model assigned for "{selectedBuilding.resolvedRole}" — using <Badge variant="secondary" className="text-xs py-0 h-4 mx-0.5">default</Badge> building model.
                        </p>
                      </>
                    ) : (
                      <p>No building models configured in this world's asset collection. Showing placeholder.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Building details (business/lot only; residence uses ResidenceDetailView) */}
              {selectedBuilding.type !== 'residence' && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {selectedBuilding.type === 'business' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name</span>
                        <span className="font-medium">{selectedBuilding.data.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type</span>
                        <Badge variant="outline">{selectedBuilding.data.businessType}</Badge>
                      </div>
                      {selectedBuilding.data.isOutOfBusiness && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status</span>
                          <Badge variant="secondary">Closed</Badge>
                        </div>
                      )}
                      {selectedBuilding.data.ownerName && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Owner</span>
                          <span className="font-medium">{selectedBuilding.data.ownerName}</span>
                        </div>
                      )}
                    </>
                  )}
                  {selectedBuilding.type === 'lot' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Address</span>
                        <span className="font-medium">{selectedBuilding.data.address || '—'}</span>
                      </div>
                      {selectedBuilding.data.buildingType && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Building</span>
                          <Badge variant="outline">{selectedBuilding.data.buildingType}</Badge>
                        </div>
                      )}
                      {selectedBuilding.data.districtName && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">District</span>
                          <span className="font-medium">{selectedBuilding.data.districtName}</span>
                        </div>
                      )}
                    </>
                  )}
                  {/* Lot info (shown for all types if lot is available) */}
                  {selectedBuilding.lot && (
                    <>
                      {selectedBuilding.lot.streetName && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Street</span>
                          <span className="font-medium">{selectedBuilding.lot.streetName}</span>
                        </div>
                      )}
                      {selectedBuilding.lot.lotWidth && selectedBuilding.lot.lotDepth && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Lot Size</span>
                          <span className="font-medium">{selectedBuilding.lot.lotWidth} x {selectedBuilding.lot.lotDepth}</span>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
              )}

              {/* Residents/Employees */}
              {selectedBuilding.type === 'business' && (() => {
                const employees = allCharacters.filter((c: any) => c.employerId === selectedBuilding.data.id);
                return employees.length > 0 ? (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Employees ({employees.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      {employees.map((c: Character) => (
                        <button
                          key={c.id}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted text-left"
                          onClick={() => { setSelectedBuilding(null); setSelectedChar(c); }}
                        >
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                            {(c.firstName ?? '?')[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm truncate">{c.firstName} {c.lastName}</p>
                            {c.occupation && <p className="text-xs text-muted-foreground truncate">{c.occupation}</p>}
                          </div>
                        </button>
                      ))}
                    </CardContent>
                  </Card>
                ) : null;
              })()}
              {selectedBuilding.type === 'residence' && (
                <ResidenceDetailView
                  residence={selectedBuilding.data}
                  characters={allCharacters}
                  lots={lots}
                  canEdit={canEdit}
                  onViewCharacter={(c) => { setSelectedBuilding(null); setSelectedChar(c); }}
                  onResidenceTypeChange={handleResidenceTypeChange}
                />
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

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

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.type}?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
              {deleteTarget?.type === 'country' && ' This will also delete all states and settlements within it.'}
              {deleteTarget?.type === 'settlement' && ' This will also delete all associated businesses, residences, and lots.'}
              {' '}This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Regenerate confirmation */}
      <AlertDialog open={!!regenerateTarget} onOpenChange={(open) => { if (!open && !isRegenerating) setRegenerateTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate {regenerateTarget?.type}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete and regenerate all society data for <strong>{regenerateTarget?.name}</strong>.
              {regenerateTarget?.type === 'world' && ' All countries, settlements, and characters will be replaced. Rules, quests, actions, items, and other editor data will NOT be affected.'}
              {regenerateTarget?.type === 'country' && ' The country and all its settlements and characters will be replaced with newly generated ones.'}
              {regenerateTarget?.type === 'settlement' && ' All characters, businesses, and residences in this settlement will be replaced with newly generated ones.'}
              {' '}This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRegenerating}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRegenerate} disabled={isRegenerating}>
              {isRegenerating ? (
                <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Regenerating...</>
              ) : (
                'Regenerate'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
