import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Search,
  Download,
  Sparkles,
  Grid3x3,
  List,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Heart,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface SketchfabSearchResult {
  uid: string;
  name: string;
  description: string;
  tags: string[];
  categories: string[];
  viewCount: number;
  likeCount: number;
  downloadCount: number;
  faceCount: number;
  vertexCount: number;
  isDownloadable: boolean;
  license: string | null;
  user: string;
  thumbnailUrl: string | null;
}

interface SketchfabSearchResponse {
  results: SketchfabSearchResult[];
  cursors: { next: string | null; previous: string | null };
  totalCount: number;
}

interface SketchfabBrowserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectionId?: string;
  collectionType?: string;
  worldType?: string;
  onAssetsSelected?: (assets: SketchfabSearchResult[]) => void;
}

export function SketchfabBrowserDialog({
  open,
  onOpenChange,
  collectionId,
  collectionType,
  worldType,
  onAssetsSelected,
}: SketchfabBrowserDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [selectedAssets, setSelectedAssets] = useState<Map<string, SketchfabSearchResult>>(new Map());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'browse' | 'auto'>('browse');

  const { toast } = useToast();

  // Check Sketchfab integration status
  const { data: status } = useQuery<{ configured: boolean; searchAvailable: boolean; downloadAvailable: boolean }>({
    queryKey: ['/api/sketchfab/status'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/sketchfab/status');
      return response.json();
    },
    enabled: open,
  });

  // Search Sketchfab models
  const { data: searchData, isLoading: isSearching } = useQuery<SketchfabSearchResponse>({
    queryKey: ['/api/sketchfab/search', submittedQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        q: submittedQuery,
        sort_by: 'likeCount',
        count: '24',
      });
      const response = await apiRequest('GET', `/api/sketchfab/search?${params.toString()}`);
      return response.json();
    },
    enabled: open && activeTab === 'browse' && submittedQuery.length > 0,
  });

  // Auto-select models
  const autoSelectMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/sketchfab/auto-select', { worldType });
      return response.json() as Promise<SketchfabSearchResult[]>;
    },
    onSuccess: (models) => {
      const newSelection = new Map<string, SketchfabSearchResult>();
      models.forEach((m) => newSelection.set(m.uid, m));
      setSelectedAssets(newSelection);
      toast({
        title: 'Models Auto-Selected',
        description: `Found ${models.length} Sketchfab models for ${worldType}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Auto-selection failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const [isImporting, setIsImporting] = useState(false);

  const results = searchData?.results || [];

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setSubmittedQuery(searchTerm.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleSelection = (model: SketchfabSearchResult) => {
    const next = new Map(selectedAssets);
    if (next.has(model.uid)) {
      next.delete(model.uid);
    } else {
      next.set(model.uid, model);
    }
    setSelectedAssets(next);
  };

  const handleConfirm = async () => {
    const assets = Array.from(selectedAssets.values());
    if (assets.length === 0) return;

    setIsImporting(true);
    let succeeded = 0;
    let failed = 0;

    for (const model of assets) {
      try {
        await apiRequest('POST', '/api/sketchfab/download-and-register', {
          sketchfabUid: model.uid,
          assetType: 'model_building',
          name: model.name,
          description: model.description || `Sketchfab: ${model.uid}`,
          collectionId,
          tags: ['sketchfab', ...model.tags.slice(0, 5)],
        });
        succeeded++;
      } catch (err: any) {
        console.error(`[Sketchfab] Failed to import ${model.name}:`, err);
        failed++;
      }
    }

    setIsImporting(false);

    if (succeeded > 0) {
      onAssetsSelected?.(assets);
    }

    toast({
      title: failed === 0 ? 'Import Complete' : 'Import Partially Complete',
      description: `Imported ${succeeded} of ${assets.length} model${assets.length !== 1 ? 's' : ''}${failed > 0 ? ` (${failed} failed)` : ''}`,
      variant: failed > 0 ? 'destructive' : 'default',
    });

    if (succeeded > 0) {
      onOpenChange(false);
    }
  };

  const formatNumber = (n: number): string => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Browse Sketchfab Models
          </DialogTitle>
          <DialogDescription>
            Search and import 3D models from Sketchfab's library of 1M+ free models
          </DialogDescription>
        </DialogHeader>

        {/* Status banner */}
        {status && !status.downloadAvailable && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md text-sm">
            <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Search works</strong>, but downloads require a Sketchfab API token.
              Add <code className="text-xs bg-muted px-1 rounded">SKETCHFAB_API_TOKEN</code> to
              your <code className="text-xs bg-muted px-1 rounded">.env</code> file.{' '}
              <a
                href="https://sketchfab.com/settings/password"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-amber-700 dark:text-amber-400"
              >
                Get token →
              </a>
            </span>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'browse' | 'auto')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">
              <Search className="h-4 w-4 mr-2" />
              Search Models
            </TabsTrigger>
            <TabsTrigger value="auto">
              <Sparkles className="h-4 w-4 mr-2" />
              Auto-Select
            </TabsTrigger>
          </TabsList>

          {/* ── Browse Tab ── */}
          <TabsContent value="browse" className="space-y-4 mt-4">
            {/* Search bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search models (e.g. &quot;medieval tavern&quot;, &quot;fantasy castle&quot;)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-9"
                />
              </div>
              <Button onClick={handleSearch} disabled={!searchTerm.trim()}>
                Search
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3x3 className="h-4 w-4" />}
              </Button>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {submittedQuery
                  ? `${searchData?.totalCount ?? '...'} results for "${submittedQuery}" • ${selectedAssets.size} selected`
                  : 'Enter a search term to find models'}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedAssets(new Map())}
                disabled={selectedAssets.size === 0}
              >
                Clear Selection
              </Button>
            </div>

            {/* Results */}
            <ScrollArea className="h-[420px]">
              {isSearching ? (
                <div className="flex items-center justify-center h-full gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <p className="text-muted-foreground">Searching Sketchfab...</p>
                </div>
              ) : !submittedQuery ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Search className="h-10 w-10 mb-3 opacity-30" />
                  <p>Search for 3D models to get started</p>
                  <p className="text-xs mt-1">Try: "medieval building", "fantasy tree", "stone wall"</p>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-3 gap-3' : 'space-y-2'}>
                  {results.map((model) => (
                    <Card
                      key={model.uid}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedAssets.has(model.uid) ? 'border-primary ring-2 ring-primary' : ''
                      }`}
                      onClick={() => toggleSelection(model)}
                    >
                      <CardContent className="p-3">
                        {/* Thumbnail */}
                        {model.thumbnailUrl && viewMode === 'grid' && (
                          <div className="relative mb-2 rounded-md overflow-hidden bg-muted aspect-video">
                            <img
                              src={model.thumbnailUrl}
                              alt={model.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            {selectedAssets.has(model.uid) && (
                              <div className="absolute top-1 right-1">
                                <CheckCircle2 className="h-5 w-5 text-primary drop-shadow" />
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-start gap-2">
                          {viewMode === 'list' && (
                            <Checkbox
                              checked={selectedAssets.has(model.uid)}
                              onCheckedChange={() => toggleSelection(model)}
                              onClick={(e) => e.stopPropagation()}
                              className="mt-1"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{model.name}</h4>
                            <p className="text-xs text-muted-foreground truncate">{model.user}</p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1 mt-1 mb-1">
                              {model.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-[10px] px-1 py-0">
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            {/* Stats row */}
                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                              <span className="flex items-center gap-0.5">
                                <Heart className="h-3 w-3" />
                                {formatNumber(model.likeCount)}
                              </span>
                              <span className="flex items-center gap-0.5">
                                <Eye className="h-3 w-3" />
                                {formatNumber(model.viewCount)}
                              </span>
                              <span className="flex items-center gap-0.5">
                                <Download className="h-3 w-3" />
                                {formatNumber(model.downloadCount)}
                              </span>
                              {model.faceCount > 0 && (
                                <span>{formatNumber(model.faceCount)} faces</span>
                              )}
                            </div>

                            {/* License */}
                            {model.license && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0 mt-1">
                                {model.license}
                              </Badge>
                            )}
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="flex-shrink-0 h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://sketchfab.com/3d-models/${model.uid}`, '_blank');
                            }}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {results.length === 0 && submittedQuery && !isSearching && (
                    <div className="col-span-3 text-center text-muted-foreground py-8">
                      No downloadable models found for "{submittedQuery}"
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* ── Auto-Select Tab ── */}
          <TabsContent value="auto" className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Auto-Select Models</h3>
                    <p className="text-sm text-muted-foreground">
                      Automatically find the most popular downloadable Sketchfab models based on your
                      world type. Models are filtered for game-ready polygon counts.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <div className="text-sm font-medium">Collection Type</div>
                      <div className="text-sm text-muted-foreground">{collectionType || 'Not specified'}</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">World Type</div>
                      <div className="text-sm text-muted-foreground">{worldType || 'Not specified'}</div>
                    </div>
                  </div>

                  <Button
                    onClick={() => autoSelectMutation.mutate()}
                    disabled={!worldType || autoSelectMutation.isPending}
                    className="w-full"
                  >
                    {autoSelectMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Searching Sketchfab...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Auto-Select Models
                      </>
                    )}
                  </Button>

                  {selectedAssets.size > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm p-3 bg-primary/10 rounded-lg">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span className="font-medium">{selectedAssets.size} models selected</span>
                      </div>

                      {/* Preview auto-selected models */}
                      <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto">
                        {Array.from(selectedAssets.values()).map((m) => (
                          <div key={m.uid} className="flex items-center gap-2 p-2 bg-muted/50 rounded text-xs">
                            {m.thumbnailUrl && (
                              <img src={m.thumbnailUrl} alt={m.name} className="w-8 h-8 rounded object-cover" />
                            )}
                            <span className="truncate">{m.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isImporting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedAssets.size === 0 || (status && !status.downloadAvailable) || isImporting}
          >
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Import {selectedAssets.size} Model{selectedAssets.size !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
