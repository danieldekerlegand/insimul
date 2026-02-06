import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Database, Globe, BookOpen, Sword, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BaseResourcesManager } from "@/components/BaseResourcesManager";
import { AssetCollectionManager } from "@/components/AssetCollectionManager";

interface AdminPanelProps {
  onBack: () => void;
}

export function AdminPanel({ onBack }: AdminPanelProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [worlds, setWorlds] = useState<any[]>([]);
  const [baseRules, setBaseRules] = useState<any[]>([]);
  const [baseActions, setBaseActions] = useState<any[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<{ type: string; data: any } | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch base resources (global rules and actions)
      const baseRulesRes = await fetch('/api/rules/base');
      if (baseRulesRes.ok) {
        const baseRulesData = await baseRulesRes.json();
        setBaseRules(baseRulesData);
      } else {
        console.warn('Failed to fetch base rules:', baseRulesRes.status);
        setBaseRules([]);
      }

      const baseActionsRes = await fetch('/api/actions/base');
      if (baseActionsRes.ok) {
        const baseActionsData = await baseActionsRes.json();
        setBaseActions(baseActionsData);
      } else {
        console.warn('Failed to fetch base actions:', baseActionsRes.status);
        setBaseActions([]);
      }

      // Fetch all worlds
      const worldsRes = await fetch('/api/worlds');
      const worldsData = await worldsRes.json();
      setWorlds(worldsData);

      toast({
        title: "Data Loaded",
        description: `Loaded ${worldsData.length} world(s), ${baseRules.length} base rules, ${baseActions.length} base actions`
      });
    } catch (error) {
      toast({
        title: "Error Loading Data",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderEntityList = (entities: any[], type: string, icon: React.ReactNode) => {
    if (entities.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No {type} found</p>
        </div>
      );
    }

    return (
      <ScrollArea className="h-[600px]">
        <div className="space-y-2">
          {entities.map((entity) => (
            <Card
              key={entity.id}
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => setSelectedEntity({ type, data: entity })}
            >
              <CardHeader className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{icon}</div>
                    <div>
                      <CardTitle className="text-base">
                        {entity.name || entity.title || entity.firstName + ' ' + entity.lastName || entity.id}
                      </CardTitle>
                      <CardDescription>
                        <Badge variant="outline" className="mt-1">{entity.worldName}</Badge>
                        {entity.description && (
                          <p className="mt-1 text-xs line-clamp-2">{entity.description}</p>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </ScrollArea>
    );
  };

  const renderEntityDetails = () => {
    if (!selectedEntity) {
      return (
        <div className="flex items-center justify-center h-[600px] text-muted-foreground">
          <div className="text-center">
            <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Select an entity to view details</p>
          </div>
        </div>
      );
    }

    const { type, data } = selectedEntity;

    return (
      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{type} Details</h3>
            <Button variant="ghost" size="sm" onClick={() => setSelectedEntity(null)}>
              Close
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                {data.name || data.title || (data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : data.id)}
              </CardTitle>
              <CardDescription>
                <Badge>{data.worldName}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-[500px]">
                {JSON.stringify(data, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">View all database records across all worlds</p>
          </div>
          <Button onClick={fetchAllData} disabled={loading} className="ml-auto">
            {loading ? "Loading..." : "Refresh Data"}
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Worlds</CardDescription>
              <CardTitle className="text-3xl">{worlds.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Base Rules</CardDescription>
              <CardTitle className="text-3xl">{baseRules.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Base Actions</CardDescription>
              <CardTitle className="text-3xl">{baseActions.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <Tabs defaultValue="worlds" className="w-full">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="worlds">Worlds</TabsTrigger>
                <TabsTrigger value="assets">Assets</TabsTrigger>
                <TabsTrigger value="base">Base Rules & Actions</TabsTrigger>
              </TabsList>

              <TabsContent value="worlds" className="mt-4">
                {renderEntityList(worlds, "World", <Globe className="w-5 h-5 text-blue-500" />)}
              </TabsContent>

              <TabsContent value="assets" className="mt-4">
                <AssetCollectionManager onRefresh={fetchAllData} />
              </TabsContent>

              <TabsContent value="base" className="mt-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>Manage Base Rules & Actions:</strong> Create base resources through the main app's 
                    <strong> Import Data</strong> modal or <strong>Create New Rule/Action</strong> dialogs.
                    Delete individual or multiple base resources below.
                  </p>
                </div>

                <Tabs defaultValue="base-rules">
                  <TabsList>
                    <TabsTrigger value="base-rules">Base Rules ({baseRules.length})</TabsTrigger>
                    <TabsTrigger value="base-actions">Base Actions ({baseActions.length})</TabsTrigger>
                  </TabsList>
                  <TabsContent value="base-rules" className="mt-4">
                    <BaseResourcesManager
                      resources={baseRules}
                      resourceType="rule"
                      icon={<BookOpen className="w-5 h-5 text-purple-500" />}
                      onRefresh={fetchAllData}
                    />
                  </TabsContent>
                  <TabsContent value="base-actions" className="mt-4">
                    <BaseResourcesManager
                      resources={baseActions}
                      resourceType="action"
                      icon={<Sword className="w-5 h-5 text-pink-500" />}
                      onRefresh={fetchAllData}
                    />
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>
          </div>

          <div className="col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Details</CardTitle>
                <CardDescription>Selected entity information</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {renderEntityDetails()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

    </div>
  );
}
