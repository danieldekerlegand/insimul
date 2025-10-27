import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, ChevronRight, Users } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface State {
  id: string;
  name: string;
  description?: string;
  population?: number;
}

interface StatesListViewProps {
  states: State[];
  onSelectState: (state: State) => void;
}

export function StatesListView({ states, onSelectState }: StatesListViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            States & Provinces
          </h2>
          <p className="text-muted-foreground mt-1">Select a state to view its settlements and characters</p>
        </div>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="grid gap-4">
          {states.map((state) => (
            <Card
              key={state.id}
              className="cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
              onClick={() => onSelectState(state)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{state.name}</CardTitle>
                      {state.population !== undefined && (
                        <CardDescription className="mt-1">
                          {state.population.toLocaleString()} people
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-muted-foreground" />
                </div>
              </CardHeader>
              {state.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{state.description}</p>
                </CardContent>
              )}
            </Card>
          ))}

          {states.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="pt-12 pb-12">
                <div className="text-center space-y-3">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-muted-foreground">No states or provinces found.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
