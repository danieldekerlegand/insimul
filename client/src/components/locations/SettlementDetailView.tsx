import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPinned, MapPin, Building2, Users, Home, Trash2, ChevronRight, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Character } from '@shared/schema';

interface SettlementDetailViewProps {
  settlement: any;
  lots: any[];
  businesses: any[];
  residences: any[];
  characters: Character[];
  onViewCharacter: (character: Character) => void;
  onDeleteSettlement?: () => void;
  onDeleteLot?: (lotId: string) => void;
  onDeleteBusiness?: (businessId: string) => void;
  onDeleteResidence?: (residenceId: string) => void;
  onAddCharacter?: () => void;
  onAddLot?: () => void;
  onAddBusiness?: () => void;
  onAddResidence?: () => void;
}

export function SettlementDetailView({
  settlement,
  lots,
  businesses,
  residences,
  characters,
  onViewCharacter,
  onDeleteSettlement,
  onDeleteLot,
  onDeleteBusiness,
  onDeleteResidence,
  onAddCharacter,
  onAddLot,
  onAddBusiness,
  onAddResidence
}: SettlementDetailViewProps) {
  return (
    <div className="space-y-6">
      {/* Settlement Info Card */}
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <MapPinned className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                {settlement.name}
                <span className="text-sm px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded">
                  {settlement.settlementType}
                </span>
              </CardTitle>
              <CardDescription>{settlement.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Population</span>
              <p className="font-semibold text-lg">{settlement.population?.toLocaleString() || 0}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Terrain</span>
              <p className="font-semibold">{settlement.terrain}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Founded</span>
              <p className="font-semibold">{settlement.foundedYear || 'Unknown'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Generation</span>
              <p className="font-semibold">{settlement.currentGeneration || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Characters Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Characters ({characters.length})
          </h3>
          {onAddCharacter && (
            <Button onClick={onAddCharacter} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Character
            </Button>
          )}
        </div>
        <div className="grid gap-3">
          {characters.slice(0, 10).map((character) => (
            <Card
              key={character.id}
              className="cursor-pointer hover:border-primary hover:shadow-md transition-all"
              onClick={() => onViewCharacter(character)}
            >
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <CardTitle className="text-base">
                        {character.firstName} {character.lastName}
                      </CardTitle>
                      <CardDescription>
                        {character.occupation || 'No occupation'} • Age: {character.birthYear ? new Date().getFullYear() - character.birthYear : 'Unknown'}
                      </CardDescription>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardHeader>
            </Card>
          ))}
          {characters.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="pt-6 pb-6">
                <p className="text-sm text-muted-foreground text-center">
                  No characters yet. Click "Add Character" to create one.
                </p>
              </CardContent>
            </Card>
          )}
          {characters.length > 10 && (
            <p className="text-sm text-muted-foreground text-center">
              Showing 10 of {characters.length} characters. Navigate to Characters view to see all.
            </p>
          )}
        </div>
      </div>

      {/* Lots Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Lots ({lots.length})
          </h3>
          {onAddLot && (
            <Button onClick={onAddLot} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Lot
            </Button>
          )}
        </div>
        <div className="grid gap-3">
          {lots.map((lot) => (
            <Card key={lot.id}>
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{lot.address}</CardTitle>
                    <CardDescription>District: {lot.districtName || 'None'}</CardDescription>
                  </div>
                  {onDeleteLot && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteLot(lot.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))}
          {lots.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="pt-6 pb-6">
                <p className="text-sm text-muted-foreground text-center">
                  No lots yet. Use procedural generation to create lots.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Businesses Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Businesses ({businesses.length})
          </h3>
          {onAddBusiness && (
            <Button onClick={onAddBusiness} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Business
            </Button>
          )}
        </div>
        <div className="grid gap-3">
          {businesses.map((business) => (
            <Card key={business.id}>
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    <div>
                      <CardTitle className="text-base">{business.name}</CardTitle>
                      <CardDescription>{business.businessType}</CardDescription>
                    </div>
                  </div>
                  {onDeleteBusiness && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteBusiness(business.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))}
          {businesses.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="pt-6 pb-6">
                <p className="text-sm text-muted-foreground text-center">
                  No businesses yet. Click "Add Business" to create one.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Residences Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Home className="w-5 h-5 text-primary" />
            Residences ({residences.length})
          </h3>
          {onAddResidence && (
            <Button onClick={onAddResidence} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Residence
            </Button>
          )}
        </div>
        <div className="grid gap-3">
          {residences.map((residence) => (
            <Card key={residence.id}>
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-primary" />
                    <div>
                      <CardTitle className="text-base">{residence.address || 'Residence'}</CardTitle>
                      <CardDescription>
                        {residence.residents?.length || 0} resident{residence.residents?.length !== 1 ? 's' : ''}
                      </CardDescription>
                    </div>
                  </div>
                  {onDeleteResidence && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteResidence(residence.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))}
          {residences.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="pt-6 pb-6">
                <p className="text-sm text-muted-foreground text-center">
                  No residences yet. Click "Add Residence" to create one.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
