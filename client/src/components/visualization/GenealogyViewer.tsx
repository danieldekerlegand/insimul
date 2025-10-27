import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2, Download, Globe, MapPin, Building2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// Helper function to draw rounded rectangles
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

type GenealogyScope = 'world' | 'country' | 'settlement';

interface GenealogyViewerProps {
  worldId: string;
  countries?: any[];
  settlements?: any[];
}

interface Character {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  birthYear: number | null;
  isAlive: boolean | null;
  spouseId: string | null;
  parentIds: string[] | null;
  childIds: string[] | null;
  socialAttributes?: any;
  countryId?: string;
  settlementId?: string;
}

export function GenealogyViewer({ worldId, countries: initialCountries, settlements: initialSettlements }: GenealogyViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scope, setScope] = useState<GenealogyScope>('settlement');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [filteredCharacters, setFilteredCharacters] = useState<Character[]>([]);
  const [countries, setCountries] = useState<any[]>(initialCountries || []);
  const [settlements, setSettlements] = useState<any[]>(initialSettlements || []);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedSettlement, setSelectedSettlement] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);

  useEffect(() => {
    fetchData();
  }, [worldId]);

  useEffect(() => {
    fetchCharacters();
  }, [worldId, scope, selectedCountry, selectedSettlement]);

  useEffect(() => {
    if (filteredCharacters.length > 0) {
      renderGenealogyTree();
    }
  }, [filteredCharacters, zoom, panX, panY]);

  const fetchData = async () => {
    try {
      // Fetch countries if not provided
      if (!initialCountries) {
        const countriesRes = await fetch(`/api/worlds/${worldId}/countries`);
        if (countriesRes.ok) {
          const countriesData = await countriesRes.json();
          setCountries(countriesData);
        }
      }

      // Fetch settlements if not provided
      if (!initialSettlements) {
        const settlementsRes = await fetch(`/api/worlds/${worldId}/settlements`);
        if (settlementsRes.ok) {
          const settlementsData = await settlementsRes.json();
          setSettlements(settlementsData);
          if (settlementsData.length > 0 && !selectedSettlement && scope === 'settlement') {
            setSelectedSettlement(settlementsData[0].id);
          }
        }
      } else if (initialSettlements && initialSettlements.length > 0 && !selectedSettlement && scope === 'settlement') {
        setSelectedSettlement(initialSettlements[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const fetchCharacters = async () => {
    try {
      const response = await fetch(`/api/worlds/${worldId}/characters`);
      if (response.ok) {
        const data = await response.json();
        setCharacters(data);
        filterCharacters(data);
      }
    } catch (error) {
      console.error('Failed to fetch characters:', error);
    }
  };

  const filterCharacters = (chars: Character[]) => {
    let filtered = chars;

    if (scope === 'country' && selectedCountry) {
      filtered = chars.filter(c => c.countryId === selectedCountry);
    } else if (scope === 'settlement' && selectedSettlement) {
      filtered = chars.filter(c => c.settlementId === selectedSettlement);
    }

    setFilteredCharacters(filtered);
  };

  useEffect(() => {
    filterCharacters(characters);
  }, [scope, selectedCountry, selectedSettlement, characters]);

  const renderGenealogyTree = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Group characters by generation
    const generations = new Map<number, Character[]>();
    filteredCharacters.forEach(char => {
      const gen = char.socialAttributes?.generation || 0;
      if (!generations.has(gen)) {
        generations.set(gen, []);
      }
      generations.get(gen)!.push(char);
    });

    const maxGeneration = Math.max(...Array.from(generations.keys()));
    const levelHeight = 120;
    const nodeWidth = 120;
    const nodeHeight = 60;

    ctx.save();
    ctx.translate(panX, panY);
    ctx.scale(zoom, zoom);

    // Draw each generation
    for (let gen = 0; gen <= maxGeneration; gen++) {
      const chars = generations.get(gen) || [];
      const y = gen * levelHeight + 50;
      const totalWidth = chars.length * (nodeWidth + 20);
      const startX = (canvas.width / zoom - totalWidth) / 2;

      chars.forEach((char, idx) => {
        const x = startX + idx * (nodeWidth + 20);

        // Draw connections to parents
        if (char.parentIds && char.parentIds.length > 0) {
          const parent1 = filteredCharacters.find(c => c.id === char.parentIds![0]);
          const parent2 = filteredCharacters.find(c => c.id === char.parentIds![1]);
          
          if (parent1) {
            const parentGen = parent1.socialAttributes?.generation || 0;
            const parentChars = generations.get(parentGen) || [];
            const parentIdx = parentChars.indexOf(parent1);
            if (parentIdx >= 0) {
              const parentY = parentGen * levelHeight + 50;
              const parentStartX = (canvas.width / zoom - parentChars.length * (nodeWidth + 20)) / 2;
              const parentX = parentStartX + parentIdx * (nodeWidth + 20);

              ctx.strokeStyle = '#888';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(x + nodeWidth / 2, y);
              ctx.lineTo(parentX + nodeWidth / 2, parentY + nodeHeight);
              ctx.stroke();
            }
          }
        }

        // Draw character node
        const isAlive = char.isAlive !== false;
        ctx.fillStyle = isAlive ? (char.gender === 'male' ? '#3b82f6' : '#ec4899') : '#6b7280';
        ctx.strokeStyle = selectedChar?.id === char.id ? '#fbbf24' : '#1f2937';
        ctx.lineWidth = selectedChar?.id === char.id ? 3 : 1;

        // Draw rounded rectangle
        roundRect(ctx, x, y, nodeWidth, nodeHeight, 8);
        ctx.fill();
        ctx.stroke();

        // Draw text
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(char.firstName, x + nodeWidth / 2, y + 25);
        ctx.fillText(char.lastName, x + nodeWidth / 2, y + 40);
        if (char.birthYear) {
          ctx.font = '10px sans-serif';
          ctx.fillStyle = '#e5e7eb';
          ctx.fillText(`b. ${char.birthYear}`, x + nodeWidth / 2, y + 53);
        }

        // Make clickable
        canvas.addEventListener('click', (e) => {
          const rect = canvas.getBoundingClientRect();
          const clickX = (e.clientX - rect.left - panX) / zoom;
          const clickY = (e.clientY - rect.top - panY) / zoom;
          
          if (clickX >= x && clickX <= x + nodeWidth && clickY >= y && clickY <= y + nodeHeight) {
            setSelectedChar(char);
          }
        });
      });
    }

    ctx.restore();
  };

  const handleZoomIn = () => setZoom(Math.min(zoom * 1.2, 3));
  const handleZoomOut = () => setZoom(Math.max(zoom / 1.2, 0.3));
  const handleReset = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  const getScopeLabel = () => {
    if (scope === 'world') return 'World';
    if (scope === 'country') {
      const country = countries.find(c => c.id === selectedCountry);
      return country ? country.name : 'Country';
    }
    const settlement = settlements.find(s => s.id === selectedSettlement);
    return settlement ? settlement.name : 'Settlement';
  };

  return (
    <div className="flex h-full gap-4">
      <Card className="flex-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Family Tree - {getScopeLabel()}</CardTitle>
              <CardDescription>
                Showing {filteredCharacters.length} characters
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleZoomIn}>
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleZoomOut}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleReset}>
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCharacters.length === 0 ? (
            <div className="border rounded-lg bg-slate-50 dark:bg-slate-900 p-12 text-center">
              <p className="text-muted-foreground">
                No characters found for this selection. Try changing the scope or generate more characters.
              </p>
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              width={1200}
              height={800}
              className="border rounded-lg bg-slate-50 dark:bg-slate-900 w-full"
              style={{ cursor: 'grab' }}
            />
          )}
        </CardContent>
      </Card>

      <Card className="w-80">
        <CardHeader>
          <CardTitle>Genealogy Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>View Scope</Label>
            <Select value={scope} onValueChange={(v) => setScope(v as GenealogyScope)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="world">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    World View
                  </div>
                </SelectItem>
                <SelectItem value="country" disabled={countries.length === 0}>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Country View
                  </div>
                </SelectItem>
                <SelectItem value="settlement" disabled={settlements.length === 0}>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Settlement View
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {scope === 'country' && countries.length > 0 && (
            <div className="space-y-2">
              <Label>Select Country</Label>
              <Select value={selectedCountry || ''} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(country => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {scope === 'settlement' && settlements.length > 0 && (
            <div className="space-y-2">
              <Label>Select Settlement</Label>
              <Select value={selectedSettlement || ''} onValueChange={setSelectedSettlement}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a settlement" />
                </SelectTrigger>
                <SelectContent>
                  {settlements.map(settlement => (
                    <SelectItem key={settlement.id} value={settlement.id}>
                      {settlement.name} ({settlement.settlementType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedChar && (
            <div className="pt-4 border-t space-y-2">
              <div className="font-semibold text-lg">
                {selectedChar.firstName} {selectedChar.lastName}
              </div>
              <div className="text-sm text-muted-foreground">
                {selectedChar.gender === 'male' ? '♂' : '♀'} Generation {selectedChar.socialAttributes?.generation || 0}
              </div>
              <div className="space-y-1 text-sm">
                <div>
                  <strong>Born:</strong> {selectedChar.birthYear || 'Unknown'}
                </div>
                <div>
                  <strong>Status:</strong> {selectedChar.isAlive !== false ? 'Alive' : 'Deceased'}
                </div>
                {selectedChar.spouseId && (
                  <div>
                    <strong>Spouse:</strong>{' '}
                    {characters.find(c => c.id === selectedChar.spouseId)?.firstName || 'Unknown'}
                  </div>
                )}
                {selectedChar.parentIds && selectedChar.parentIds.length > 0 && (
                  <div>
                    <strong>Parents:</strong>
                    <ul className="ml-4 list-disc">
                      {selectedChar.parentIds.map(pid => {
                        const parent = characters.find(c => c.id === pid);
                        return parent ? (
                          <li key={pid}>{parent.firstName} {parent.lastName}</li>
                        ) : null;
                      })}
                    </ul>
                  </div>
                )}
                {selectedChar.childIds && selectedChar.childIds.length > 0 && (
                  <div>
                    <strong>Children:</strong> {selectedChar.childIds.length}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
