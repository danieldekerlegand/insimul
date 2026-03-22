import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Sparkles, Image as ImageIcon, Users, Briefcase, Package, Crown } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Business, Character, Container, VisualAsset } from '@shared/schema';
import { VisualAssetGeneratorDialog } from './VisualAssetGeneratorDialog';
import { AssetSelect } from './AssetSelect';

interface BusinessSummary {
  business: Business;
  owner: Character | null;
  employeeCount: number;
  employees: Character[];
}

interface EmployeeInfo {
  characterId: string;
  characterName: string;
  vocation: string;
  shift: string;
}

interface BusinessDetailCardProps {
  business: Business;
  showAssets?: boolean;
}

export function BusinessDetailCard({ business, showAssets = true }: BusinessDetailCardProps) {
  const [showAssetGenerator, setShowAssetGenerator] = useState(false);
  const queryClient = useQueryClient();

  // Fetch business visual assets
  const { data: businessAssets = [] } = useQuery<VisualAsset[]>({
    queryKey: ['/api/assets', 'business', business.id],
    enabled: showAssets,
  });

  // Fetch business summary (owner + employees)
  const { data: summary } = useQuery<BusinessSummary>({
    queryKey: ['/api/businesses', business.id, 'summary'],
  });

  // Fetch detailed employee info (with vocation/shift)
  const { data: employees = [] } = useQuery<EmployeeInfo[]>({
    queryKey: ['/api/businesses', business.id, 'employees'],
  });

  // Fetch inventory (containers at this business)
  const { data: containers = [] } = useQuery<Container[]>({
    queryKey: ['business-containers', business.worldId, business.id],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/worlds/${business.worldId}/containers/by-location?businessId=${business.id}`);
      return res.json();
    },
  });

  const ownerName = summary?.owner
    ? `${summary.owner.firstName} ${summary.owner.lastName}`
    : null;

  const totalItems = containers.reduce((sum, c) => {
    const items = c.items as Array<{ itemId: string; itemName: string; quantity: number }> | null;
    return sum + (items?.reduce((s, i) => s + i.quantity, 0) ?? 0);
  }, 0);

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{business.name}</CardTitle>
              <CardDescription>
                <Badge variant="outline" className="mt-1">
                  {business.businessType}
                </Badge>
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Business Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Founded</span>
            <p className="font-medium">{business.foundedYear}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Status</span>
            <p className="font-medium">
              {business.isOutOfBusiness ? (
                <Badge variant="destructive">Out of Business</Badge>
              ) : (
                <Badge variant="default">Active</Badge>
              )}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Owner</span>
            <p className="font-medium flex items-center gap-1">
              <Crown className="h-3 w-3 text-yellow-500" />
              {ownerName ?? 'Unknown'}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Employees</span>
            <p className="font-medium">{employees.length}</p>
          </div>
        </div>

        {/* Employees Section */}
        {employees.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Employees ({employees.length})
            </h4>
            <div className="space-y-1">
              {employees.map((emp) => (
                <div key={emp.characterId} className="flex items-center justify-between text-sm pl-2">
                  <span>{emp.characterName}</span>
                  <Badge variant="secondary" className="text-xs">
                    {emp.vocation} ({emp.shift})
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inventory Section */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Package className="h-4 w-4" />
            Inventory ({totalItems} items in {containers.length} containers)
          </h4>
          {containers.length === 0 ? (
            <p className="text-xs text-muted-foreground pl-2">No containers at this business</p>
          ) : (
            <div className="space-y-2">
              {containers.map((container) => {
                const items = container.items as Array<{ itemId: string; itemName: string; quantity: number }> | null;
                return (
                  <div key={container.id} className="border rounded-md p-2 text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{container.name}</span>
                      <Badge variant="outline" className="text-xs">{container.containerType}</Badge>
                    </div>
                    {!items || items.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Empty</p>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {items.map((item) => (
                          <Badge key={item.itemId} variant="secondary" className="text-xs">
                            {item.itemName} x{item.quantity}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Visual Assets Section */}
        {showAssets && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Visual Assets ({businessAssets.length})
              </h4>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowAssetGenerator(true)}
                  variant="outline"
                  size="sm"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Generate
                </Button>
              </div>
            </div>

            {businessAssets.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Building2 className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground mb-3">No building images yet</p>
                  <Button onClick={() => setShowAssetGenerator(true)} size="sm" variant="outline">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Generate Exterior
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {businessAssets.slice(0, 4).map(asset => (
                  <div key={asset.id} className="relative aspect-video rounded-md overflow-hidden">
                    <img
                      src={`/${asset.filePath}`}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 right-1">
                      <Badge variant="secondary" className="text-xs">
                        {asset.assetType.replace('building_', '')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Asset Generator Dialog */}
        <VisualAssetGeneratorDialog
          open={showAssetGenerator}
          onOpenChange={setShowAssetGenerator}
          entityType="business"
          entityId={business.id}
          entityName={business.name}
          assetType="building_exterior"
          onAssetGenerated={() => {
            queryClient.invalidateQueries({ queryKey: ['/api/assets', 'business', business.id] });
          }}
        />

        {/* Asset Selector */}
        {businessAssets.length > 0 && (
          <div className="space-y-1">
            <h4 className="text-xs font-medium">Browse Assets</h4>
            <AssetSelect
              entityType="business"
              entityId={business.id}
              placeholder="Select an asset to view..."
              className="h-8 text-xs"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
