import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Sword, Package, Loader2 } from "lucide-react";

interface BaseResourcesConfigProps {
  worldId: string;
}

interface BaseResource {
  id: string;
  name: string;
  description?: string;
  category?: string;
  ruleType?: string;
  actionType?: string;
  itemType?: string;
}

interface Config {
  enabledBaseRules: string[];
  disabledBaseRules: string[];
  enabledBaseActions: string[];
  disabledBaseActions: string[];
  enabledBaseItems: string[];
  disabledBaseItems: string[];
}

export function BaseResourcesConfig({ worldId }: BaseResourcesConfigProps) {
  const [baseRules, setBaseRules] = useState<BaseResource[]>([]);
  const [baseActions, setBaseActions] = useState<BaseResource[]>([]);
  const [baseItems, setBaseItems] = useState<BaseResource[]>([]);
  const [config, setConfig] = useState<Config>({
    enabledBaseRules: [],
    disabledBaseRules: [],
    enabledBaseActions: [],
    disabledBaseActions: [],
    enabledBaseItems: [],
    disabledBaseItems: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [worldId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch base rules
      const rulesRes = await fetch('/api/rules/base');
      if (rulesRes.ok) {
        const rulesData = await rulesRes.json();
        setBaseRules(Array.isArray(rulesData) ? rulesData : []);
      } else {
        console.warn('Failed to fetch base rules:', rulesRes.status);
        setBaseRules([]);
      }

      // Fetch base actions
      const actionsRes = await fetch('/api/actions/base');
      if (actionsRes.ok) {
        const actionsData = await actionsRes.json();
        setBaseActions(Array.isArray(actionsData) ? actionsData : []);
      } else {
        console.warn('Failed to fetch base actions:', actionsRes.status);
        setBaseActions([]);
      }

      // Fetch base items
      const itemsRes = await fetch('/api/items/base');
      if (itemsRes.ok) {
        const itemsData = await itemsRes.json();
        setBaseItems(Array.isArray(itemsData) ? itemsData : []);
      } else {
        console.warn('Failed to fetch base items:', itemsRes.status);
        setBaseItems([]);
      }

      // Fetch world config
      const configRes = await fetch(`/api/worlds/${worldId}/base-resources/config`);
      if (configRes.ok) {
        const configData = await configRes.json();
        setConfig(configData);
      } else {
        console.warn('Failed to fetch base resources config:', configRes.status);
        // Keep default config
      }
    } catch (error) {
      console.error('Error loading base resources:', error);
      toast({
        title: "Error",
        description: "Failed to load base resources configuration",
        variant: "destructive"
      });
      // Ensure arrays are set even on error
      setBaseRules([]);
      setBaseActions([]);
      setBaseItems([]);
    } finally {
      setLoading(false);
    }
  };

  const isEnabled = (resourceId: string, resourceType: 'rule' | 'action' | 'item'): boolean => {
    if (resourceType === 'rule') {
      if (config.disabledBaseRules.includes(resourceId)) return false;
      return config.enabledBaseRules.includes(resourceId) || config.enabledBaseRules.length === 0;
    } else if (resourceType === 'action') {
      if (config.disabledBaseActions.includes(resourceId)) return false;
      return config.enabledBaseActions.includes(resourceId) || config.enabledBaseActions.length === 0;
    } else {
      if (config.disabledBaseItems.includes(resourceId)) return false;
      return config.enabledBaseItems.includes(resourceId) || config.enabledBaseItems.length === 0;
    }
  };

  const handleToggle = async (resourceId: string, resourceType: 'rule' | 'action' | 'item', enabled: boolean) => {
    try {
      const response = await fetch(`/api/worlds/${worldId}/base-resources/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId, resourceType, enabled })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle resource');
      }

      const { config: newConfig } = await response.json();
      setConfig(newConfig);

      toast({
        title: "Success",
        description: `Base ${resourceType} ${enabled ? 'enabled' : 'disabled'} for this world`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update base resource configuration",
        variant: "destructive"
      });
    }
  };

  const renderResourceList = (resources: BaseResource[], resourceType: 'rule' | 'action' | 'item') => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      );
    }

    if (resources.length === 0) {
      return (
        <div className="text-center p-8 text-muted-foreground">
          <p>No base {resourceType}s available</p>
          <p className="text-sm mt-2">Create base resources in the Admin Panel</p>
        </div>
      );
    }

    return (
      <ScrollArea className="h-[500px]">
        <div className="space-y-2 pr-4">
          {resources.map(resource => {
            const enabled = isEnabled(resource.id, resourceType);
            return (
              <Card key={resource.id} className={!enabled ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{resource.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          Global
                        </Badge>
                        {resource.category && (
                          <Badge variant="secondary" className="text-xs">
                            {resource.category}
                          </Badge>
                        )}
                        {resource.ruleType && (
                          <Badge variant="secondary" className="text-xs">
                            {resource.ruleType}
                          </Badge>
                        )}
                        {resource.actionType && (
                          <Badge variant="secondary" className="text-xs">
                            {resource.actionType}
                          </Badge>
                        )}
                        {resource.itemType && (
                          <Badge variant="secondary" className="text-xs">
                            {resource.itemType}
                          </Badge>
                        )}
                      </div>
                      {resource.description && (
                        <p className="text-sm text-muted-foreground">{resource.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {enabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) => handleToggle(resource.id, resourceType, checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Base Resources Configuration
        </CardTitle>
        <CardDescription>
          Enable or disable global rules, actions, and items for this world.
          By default, all base resources are enabled.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="rules">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rules" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Base Rules ({baseRules.length})
            </TabsTrigger>
            <TabsTrigger value="actions" className="gap-2">
              <Sword className="w-4 h-4" />
              Base Actions ({baseActions.length})
            </TabsTrigger>
            <TabsTrigger value="items" className="gap-2">
              <Package className="w-4 h-4" />
              Base Items ({baseItems.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="rules" className="mt-4">
            {renderResourceList(baseRules, 'rule')}
          </TabsContent>
          <TabsContent value="actions" className="mt-4">
            {renderResourceList(baseActions, 'action')}
          </TabsContent>
          <TabsContent value="items" className="mt-4">
            {renderResourceList(baseItems, 'item')}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
