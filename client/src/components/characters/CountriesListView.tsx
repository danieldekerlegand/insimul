import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, ChevronRight, Users } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Country {
  id: string;
  name: string;
  description?: string;
  governmentType?: string;
  population?: number;
}

interface CountriesListViewProps {
  countries: Country[];
  onSelectCountry: (country: Country) => void;
}

export function CountriesListView({ countries, onSelectCountry }: CountriesListViewProps) {
  return (
    <div className="space-y-4">
      <ScrollArea className="h-[600px]">
        <div className="grid gap-4">
          {countries.map((country) => (
            <Card
              key={country.id}
              className="cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
              onClick={() => onSelectCountry(country)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Globe className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{country.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {country.governmentType && `${country.governmentType}`}
                        {country.population !== undefined && ` • ${country.population.toLocaleString()} people`}
                      </CardDescription>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-muted-foreground" />
                </div>
              </CardHeader>
              {country.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{country.description}</p>
                </CardContent>
              )}
            </Card>
          ))}

          {countries.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="pt-12 pb-12">
                <div className="text-center space-y-3">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-muted-foreground">No countries found in this world.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
