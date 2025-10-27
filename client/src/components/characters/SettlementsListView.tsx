import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, ChevronRight, Users } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Settlement {
  id: string;
  name: string;
  settlementType?: string;
  population?: number;
  terrain?: string;
}

interface SettlementsListViewProps {
  settlements: Settlement[];
  onSelectSettlement: (settlement: Settlement) => void;
}

export function SettlementsListView({ settlements, onSelectSettlement }: SettlementsListViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Settlements
          </h2>
          <p className="text-muted-foreground mt-1">Select a settlement to view its characters</p>
        </div>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="grid gap-4">
          {settlements.map((settlement) => (
            <Card
              key={settlement.id}
              className="cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
              onClick={() => onSelectSettlement(settlement)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{settlement.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {settlement.settlementType && `${settlement.settlementType.charAt(0).toUpperCase() + settlement.settlementType.slice(1)}`}
                        {settlement.population !== undefined && ` • ${settlement.population.toLocaleString()} people`}
                        {settlement.terrain && ` • ${settlement.terrain}`}
                      </CardDescription>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-muted-foreground" />
                </div>
              </CardHeader>
            </Card>
          ))}

          {settlements.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="pt-12 pb-12">
                <div className="text-center space-y-3">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-muted-foreground">No settlements found.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
