import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowLeft, Globe, BookOpen, Sword, AlertCircle, ChevronDown, Eye, Lock, Calendar, Hash, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BaseResourcesManager } from "@/components/BaseResourcesManager";
import { AssetCollectionManager } from "@/components/AssetCollectionManager";
import { format } from "date-fns";

interface AdminPanelProps {
  onBack: () => void;
}

export function AdminPanel({ onBack }: AdminPanelProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [worlds, setWorlds] = useState<any[]>([]);
  const [baseRules, setBaseRules] = useState<any[]>([]);
  const [baseActions, setBaseActions] = useState<any[]>([]);
  const [expandedWorldId, setExpandedWorldId] = useState<string | null>(null);
  
  // Pagination state for base rules
  const [rulesPage, setRulesPage] = useState(1);
  const [rulesLimit] = useState(50);
  const [rulesTotal, setRulesTotal] = useState<number | null>(null);
  const [rulesHasMore, setRulesHasMore] = useState(false);
  
  // Pagination state for base actions
  const [actionsPage, setActionsPage] = useState(1);
  const [actionsLimit] = useState(50);
  const [actionsTotal, setActionsTotal] = useState<number | null>(null);
  const [actionsHasMore, setActionsHasMore] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async (page: number = 1) => {
    setLoading(true);
    try {
      // Fetch base rules with pagination
      const baseRulesRes = await fetch(`/api/rules/base?page=${page}&limit=${rulesLimit}`);
      if (baseRulesRes.ok) {
        const baseRulesData = await baseRulesRes.json();
        if (baseRulesData.rules) {
          // Paginated response
          setBaseRules(baseRulesData.rules);
          setRulesHasMore(baseRulesData.pagination?.hasMore || false);
          if (page === 1) {
            setRulesTotal(baseRulesData.rules.length); // We don't have total count, so estimate
          }
        } else {
          // Non-paginated response (fallback)
          setBaseRules(baseRulesData);
          setRulesHasMore(false);
          setRulesTotal(baseRulesData.length);
        }
      } else {
        console.warn('Failed to fetch base rules:', baseRulesRes.status);
        setBaseRules([]);
        setRulesHasMore(false);
      }

      // Fetch base actions (similar pagination)
      const baseActionsRes = await fetch(`/api/actions/base?page=${page}&limit=${actionsLimit}`);
      if (baseActionsRes.ok) {
        const baseActionsData = await baseActionsRes.json();
        if (baseActionsData.rules) {
          setBaseActions(baseActionsData.rules);
          setActionsHasMore(baseActionsData.pagination?.hasMore || false);
          if (page === 1) {
            setActionsTotal(baseActionsData.rules.length);
          }
        } else {
          setBaseActions(baseActionsData);
          setActionsHasMore(false);
          setActionsTotal(baseActionsData.length);
        }
      } else {
        console.warn('Failed to fetch base actions:', baseActionsRes.status);
        setBaseActions([]);
        setActionsHasMore(false);
      }

      const worldsRes = await fetch('/api/worlds');
      const worldsData = await worldsRes.json();
      setWorlds(worldsData);

      setLoading(false);
      
      toast({
        title: "Data Loaded",
        description: `Loaded ${worldsData.length} world(s), ${baseRules.length} base rules, ${baseActions.length} base actions`
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setLoading(false);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive"
      });
    }
  };

  const handleRulesPageChange = (newPage: number) => {
    setRulesPage(newPage);
    fetchAllData(newPage);
  };

  const handleActionsPageChange = (newPage: number) => {
    setActionsPage(newPage);
    fetchAllData(newPage);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Glass Header */}
        <div className="flex items-center gap-4 px-5 py-4 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-lg shadow-black/5">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl hover:bg-white/50 dark:hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">Manage worlds, assets, and base resources</p>
          </div>
          <Button
            onClick={fetchAllData}
            disabled={loading}
            variant="ghost"
            size="sm"
            className="gap-2 rounded-xl hover:bg-white/50 dark:hover:bg-white/10"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>

        {/* Full-width Tabs */}
        <Tabs defaultValue="worlds" className="w-full">
          <TabsList className="w-full bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-xl p-1 h-auto">
            <TabsTrigger
              value="worlds"
              className="flex-1 rounded-lg py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm transition-all"
            >
              <Globe className="w-4 h-4 mr-2" />
              Worlds
              <Badge variant="secondary" className="ml-2 text-xs px-1.5 py-0 h-5">{worlds.length}</Badge>
            </TabsTrigger>
            <TabsTrigger
              value="assets"
              className="flex-1 rounded-lg py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm transition-all"
            >
              Assets
            </TabsTrigger>
            <TabsTrigger
              value="base"
              className="flex-1 rounded-lg py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm transition-all"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Rules & Actions
              <Badge variant="secondary" className="ml-2 text-xs px-1.5 py-0 h-5">{baseRules.length + baseActions.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Worlds Tab */}
          <TabsContent value="worlds" className="mt-4">
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-lg shadow-black/5 p-1">
              <ScrollArea className="h-[calc(100vh-280px)]">
                {worlds.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No worlds found</p>
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {worlds.map((world) => {
                      const isExpanded = expandedWorldId === world.id;
                      const worldType = world.config?.worldType || world.config?.worldTypeLabel;
                      const gameType = world.config?.gameType;

                      return (
                        <Collapsible
                          key={world.id}
                          open={isExpanded}
                          onOpenChange={(open) => setExpandedWorldId(open ? world.id : null)}
                        >
                          <CollapsibleTrigger asChild>
                            <div
                              className={`
                                cursor-pointer rounded-xl p-4 flex items-center gap-4
                                transition-all duration-200
                                hover:bg-white/80 dark:hover:bg-white/10
                                ${isExpanded ? 'bg-white/70 dark:bg-white/[0.08] shadow-sm' : ''}
                              `}
                            >
                              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 shrink-0">
                                <Globe className="w-5 h-5 text-blue-500" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm">{world.name}</div>
                                {!isExpanded && world.description && (
                                  <p className="text-xs text-muted-foreground truncate mt-0.5">{world.description}</p>
                                )}
                              </div>

                              <div className="flex gap-1.5 shrink-0">
                                {worldType && (
                                  <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0 hover:bg-primary/10">
                                    {worldType}
                                  </Badge>
                                )}
                                {world.visibility && world.visibility !== 'private' && (
                                  <Badge variant="outline" className="text-xs gap-1">
                                    <Eye className="w-3 h-3" />
                                    {world.visibility}
                                  </Badge>
                                )}
                                {world.requiresAuth && (
                                  <Badge variant="outline" className="text-xs gap-1">
                                    <Lock className="w-3 h-3" />
                                    Auth
                                  </Badge>
                                )}
                              </div>

                              <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                          </CollapsibleTrigger>

                          <CollapsibleContent>
                            <div className="px-4 pb-4 ml-[52px] space-y-4">
                              <div className="border-t border-black/5 dark:border-white/10" />

                              {world.description && (
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {world.description}
                                </p>
                              )}

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {world.createdAt && (
                                  <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      Created
                                    </div>
                                    <div className="text-sm font-medium">
                                      {format(new Date(world.createdAt), 'MMM d, yyyy')}
                                    </div>
                                  </div>
                                )}
                                {world.version && (
                                  <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Hash className="w-3 h-3" />
                                      Version
                                    </div>
                                    <div className="text-sm font-medium">v{world.version}</div>
                                  </div>
                                )}
                                {gameType && (
                                  <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground">Game Type</div>
                                    <div className="text-sm font-medium capitalize">{gameType}</div>
                                  </div>
                                )}
                                {world.visibility && (
                                  <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground">Visibility</div>
                                    <div className="text-sm font-medium capitalize">{world.visibility}</div>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-1.5">
                                {world.targetLanguage && (
                                  <Badge variant="outline" className="text-xs">
                                    Target: {world.targetLanguage}
                                  </Badge>
                                )}
                                {world.isTemplate && (
                                  <Badge variant="secondary" className="text-xs">Template</Badge>
                                )}
                                {world.maxPlayers && (
                                  <Badge variant="outline" className="text-xs">
                                    Max {world.maxPlayers} players
                                  </Badge>
                                )}
                              </div>

                              <div className="text-xs text-muted-foreground/60 font-mono select-all">
                                {world.id}
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Assets Tab */}
          <TabsContent value="assets" className="mt-4">
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-lg shadow-black/5 p-4">
              <AssetCollectionManager onRefresh={fetchAllData} />
            </div>
          </TabsContent>

          {/* Base Rules & Actions Tab */}
          <TabsContent value="base" className="mt-4">
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-lg shadow-black/5 p-4 space-y-4">
              <div className="p-3 bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent rounded-xl border border-blue-500/10">
                <p className="text-sm text-muted-foreground">
                  <strong>Manage Base Rules & Actions:</strong> Create base resources through the main app's
                  <strong> Import Data</strong> modal or <strong>Create New Rule/Action</strong> dialogs.
                  Delete individual or multiple base resources below.
                </p>
              </div>

              <Tabs defaultValue="base-rules">
                <TabsList className="bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-lg p-0.5">
                  <TabsTrigger value="base-rules" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm">
                    <BookOpen className="w-4 h-4 mr-2 text-purple-500" />
                    Base Rules
                    <Badge variant="secondary" className="ml-2 text-xs px-1.5 py-0 h-5">{baseRules.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="base-actions" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm">
                    <Sword className="w-4 h-4 mr-2 text-pink-500" />
                    Base Actions
                    <Badge variant="secondary" className="ml-2 text-xs px-1.5 py-0 h-5">{baseActions.length}</Badge>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="base-rules" className="mt-4">
                  <div className="space-y-4">
                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Showing {baseRules.length} rules {rulesTotal && `of ~${rulesTotal}`}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (rulesPage > 1) {
                              handleRulesPageChange(rulesPage - 1);
                            }
                          }}
                          disabled={rulesPage <= 1}
                        >
                          Previous
                        </Button>
                        <span className="text-sm font-medium px-2">
                          Page {rulesPage}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (rulesHasMore) {
                              handleRulesPageChange(rulesPage + 1);
                            }
                          }}
                          disabled={!rulesHasMore}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                    <BaseResourcesManager
                      resources={baseRules}
                      resourceType="rule"
                      icon={<BookOpen className="w-5 h-5 text-purple-500" />}
                      onRefresh={() => fetchAllData(rulesPage)}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="base-actions" className="mt-4">
                  <div className="space-y-4">
                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Showing {baseActions.length} actions {actionsTotal && `of ~${actionsTotal}`}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (actionsPage > 1) {
                              handleActionsPageChange(actionsPage - 1);
                            }
                          }}
                          disabled={actionsPage <= 1}
                        >
                          Previous
                        </Button>
                        <span className="text-sm font-medium px-2">
                          Page {actionsPage}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (actionsHasMore) {
                              handleActionsPageChange(actionsPage + 1);
                            }
                          }}
                          disabled={!actionsHasMore}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                    <BaseResourcesManager
                      resources={baseActions}
                      resourceType="action"
                      icon={<Sword className="w-5 h-5 text-pink-500" />}
                      onRefresh={() => fetchAllData(actionsPage)}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
