import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ZoomIn, ZoomOut, Maximize2, Globe, MapPin, Building2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

type MapScope = 'world' | 'country' | 'settlement';

interface GeographyMapProps {
  worldId: string;
  settlements?: any[];
  countries?: any[];
}

export function GeographyMap({ worldId, settlements: initialSettlements, countries: initialCountries }: GeographyMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scope, setScope] = useState<MapScope>('settlement');
  const [settlements, setSettlements] = useState<any[]>(initialSettlements || []);
  const [countries, setCountries] = useState<any[]>(initialCountries || []);
  const [states, setStates] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedSettlement, setSelectedSettlement] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [worldId, scope, selectedCountry, selectedSettlement]);

  useEffect(() => {
    renderMap();
  }, [scope, countries, states, settlements, selectedCountry, selectedSettlement, zoom, panX, panY]);

  const fetchData = async () => {
    try {
      // Fetch countries if not provided
      if (!initialCountries && countries.length === 0) {
        const countriesRes = await fetch(`/api/worlds/${worldId}/countries`);
        if (countriesRes.ok) {
          const countriesData = await countriesRes.json();
          setCountries(countriesData);
          if (countriesData.length > 0 && !selectedCountry && scope === 'country') {
            setSelectedCountry(countriesData[0].id);
          }
        }
      } else if (initialCountries && initialCountries.length > 0 && !selectedCountry && scope === 'country') {
        setSelectedCountry(initialCountries[0].id);
      }

      // Fetch settlements if not provided
      if (!initialSettlements && settlements.length === 0) {
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

      // Fetch states if country selected
      if (selectedCountry && scope === 'country') {
        const statesRes = await fetch(`/api/countries/${selectedCountry}/states`);
        if (statesRes.ok) {
          const statesData = await statesRes.json();
          setStates(statesData);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const renderMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply transforms
    ctx.save();
    ctx.translate(panX, panY);
    ctx.scale(zoom, zoom);

    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= canvas.width / zoom; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height / zoom);
      ctx.stroke();
    }
    for (let i = 0; i <= canvas.height / zoom; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width / zoom, i);
      ctx.stroke();
    }

    if (scope === 'world') {
      renderWorldMap(ctx, canvas);
    } else if (scope === 'country') {
      renderCountryMap(ctx, canvas);
    } else if (scope === 'settlement') {
      renderSettlementMap(ctx, canvas);
    }

    ctx.restore();
  };

  const renderWorldMap = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const cols = Math.ceil(Math.sqrt(countries.length));
    const itemWidth = 200;
    const itemHeight = 150;
    const padding = 30;

    countries.forEach((country, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = col * (itemWidth + padding) + 50;
      const y = row * (itemHeight + padding) + 50;

      // Draw country box
      ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.fillRect(x, y, itemWidth, itemHeight);
      ctx.strokeRect(x, y, itemWidth, itemHeight);

      // Draw country name
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(country.name, x + itemWidth / 2, y + 30);

      // Draw stats
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#6b7280';
      ctx.fillText(`Government: ${country.governmentType || 'N/A'}`, x + 15, y + 60);
      ctx.fillText(`Economy: ${country.economicSystem || 'N/A'}`, x + 15, y + 80);
      ctx.fillText(`Founded: ${country.foundedYear || 'Unknown'}`, x + 15, y + 100);
    });
  };

  const renderCountryMap = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const items = states.length > 0 ? states : settlements.filter(s => s.countryId === selectedCountry);
    const cols = Math.ceil(Math.sqrt(items.length));
    const itemWidth = 180;
    const itemHeight = 120;
    const padding = 25;

    items.forEach((item, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = col * (itemWidth + padding) + 50;
      const y = row * (itemHeight + padding) + 50;

      // Draw item box
      const isState = 'stateType' in item;
      ctx.fillStyle = isState ? 'rgba(168, 85, 247, 0.2)' : 'rgba(34, 197, 94, 0.2)';
      ctx.strokeStyle = isState ? '#a855f7' : '#22c55e';
      ctx.lineWidth = 2;
      ctx.fillRect(x, y, itemWidth, itemHeight);
      ctx.strokeRect(x, y, itemWidth, itemHeight);

      // Draw name
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.name, x + itemWidth / 2, y + 25);

      // Draw stats
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#6b7280';
      if (isState) {
        ctx.fillText(`Type: ${item.stateType || 'State'}`, x + 10, y + 50);
      } else {
        ctx.fillText(`Type: ${item.settlementType || 'Settlement'}`, x + 10, y + 50);
        ctx.fillText(`Population: ${item.population?.toLocaleString() || 0}`, x + 10, y + 70);
        ctx.fillText(`Terrain: ${item.terrain || 'N/A'}`, x + 10, y + 90);
      }
    });
  };

  const renderSettlementMap = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const settlement = settlements.find(s => s.id === selectedSettlement);
    if (!settlement) return;

    // Draw settlement representation
    const centerX = canvas.width / zoom / 2;
    const centerY = canvas.height / zoom / 2;
    const radius = 150;

    // Draw settlement circle
    ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Draw settlement name
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(settlement.name, centerX, centerY - 20);

    // Draw info
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#6b7280';
    ctx.fillText(`${settlement.settlementType || 'Settlement'}`, centerX, centerY + 10);
    ctx.fillText(`Population: ${settlement.population?.toLocaleString() || 0}`, centerX, centerY + 35);
    ctx.fillText(`Terrain: ${settlement.terrain || 'Unknown'}`, centerX, centerY + 60);

    // Draw surrounding markers for districts/areas
    const markers = [
      { label: 'Residential', angle: 0, color: '#10b981' },
      { label: 'Commercial', angle: Math.PI / 2, color: '#f59e0b' },
      { label: 'Industrial', angle: Math.PI, color: '#6b7280' },
      { label: 'Civic', angle: 3 * Math.PI / 2, color: '#8b5cf6' }
    ];

    markers.forEach(marker => {
      const mx = centerX + Math.cos(marker.angle) * (radius + 80);
      const my = centerY + Math.sin(marker.angle) * (radius + 80);

      ctx.fillStyle = marker.color;
      ctx.beginPath();
      ctx.arc(mx, my, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1f2937';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(marker.label, mx, my + 40);
    });
  };

  const handleZoomIn = () => setZoom(Math.min(zoom * 1.2, 3));
  const handleZoomOut = () => setZoom(Math.max(zoom / 1.2, 0.3));
  const handleReset = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  const getMapTitle = () => {
    if (scope === 'world') return 'World Map';
    if (scope === 'country') {
      const country = countries.find(c => c.id === selectedCountry);
      return country ? `${country.name} Map` : 'Country Map';
    }
    const settlement = settlements.find(s => s.id === selectedSettlement);
    return settlement ? `${settlement.name} Map` : 'Settlement Map';
  };

  const getMapDescription = () => {
    if (scope === 'world') return `${countries.length} countries`;
    if (scope === 'country') {
      const stateCount = states.length || settlements.filter(s => s.countryId === selectedCountry).length;
      return `${stateCount} ${states.length > 0 ? 'states/provinces' : 'settlements'}`;
    }
    const settlement = settlements.find(s => s.id === selectedSettlement);
    return settlement ? `Population: ${settlement.population?.toLocaleString() || 0}` : '';
  };

  if (settlements.length === 0 && countries.length === 0) {
    return (
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Geography Map</CardTitle>
          <CardDescription>
            No geographic data found. Generate a world first.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="flex h-full gap-4">
      <Card className="flex-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{getMapTitle()}</CardTitle>
              <CardDescription>{getMapDescription()}</CardDescription>
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <canvas
            ref={canvasRef}
            width={1200}
            height={800}
            className="border rounded-lg bg-slate-50 dark:bg-slate-900 w-full"
            style={{ cursor: 'grab' }}
          />
        </CardContent>
      </Card>

      <Card className="w-80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Map Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>View Scope</Label>
            <Select value={scope} onValueChange={(v) => setScope(v as MapScope)}>
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

          <div className="pt-4 border-t">
            <h3 className="text-sm font-semibold mb-2">Legend</h3>
            <div className="space-y-2 text-xs">
              {scope === 'world' && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500/20 border-2 border-blue-500 rounded"></div>
                  <span>Countries</span>
                </div>
              )}
              {scope === 'country' && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-500/20 border-2 border-purple-500 rounded"></div>
                    <span>States/Provinces</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500/20 border-2 border-green-500 rounded"></div>
                    <span>Settlements</span>
                  </div>
                </>
              )}
              {scope === 'settlement' && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span>Main Settlement</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <span>Residential</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span>Commercial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                    <span>Industrial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                    <span>Civic</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
