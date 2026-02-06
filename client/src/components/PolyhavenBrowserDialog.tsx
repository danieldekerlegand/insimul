import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Download, Sparkles, Grid3x3, List, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface PolyhavenAsset {
  id: string;
  name: string;
  categories: string[];
  tags: string[];
  download_count: number;
  type: 'models' | 'hdris' | 'textures';
}

interface PolyhavenBrowserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectionId?: string;
  collectionType?: string;
  worldType?: string;
  onAssetsSelected?: (assetIds: string[]) => void;
}

export function PolyhavenBrowserDialog({
  open,
  onOpenChange,
  collectionId,
  collectionType,
  worldType,
  onAssetsSelected
}: PolyhavenBrowserDialogProps) {
  console.log('[PolyhavenBrowser] Props received:', { collectionId, collectionType, worldType });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'browse' | 'auto'>('browse');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch Polyhaven assets
  const { data: assets = [], isLoading } = useQuery<PolyhavenAsset[]>({
    queryKey: ['/api/polyhaven/assets', 'models'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/polyhaven/assets?type=models');
      return response.json();
    },
    enabled: open && activeTab === 'browse'
  });

  // Auto-select assets
  const autoSelectMutation = useMutation({
    mutationFn: async () => {
      console.log('[PolyhavenBrowser] Auto-selecting with:', { collectionType, worldType });
      const response = await apiRequest('POST', '/api/polyhaven/auto-select', {
        collectionType,
        worldType
      });
      return response.json();
    },
    onSuccess: (autoSelectedAssets: PolyhavenAsset[]) => {
      console.log('[PolyhavenBrowser] Auto-select success:', autoSelectedAssets.length, 'assets');
      const assetIds = new Set(autoSelectedAssets.map(a => a.id));
      setSelectedAssets(assetIds);
      toast({
        title: 'Assets Auto-Selected',
        description: `Selected ${autoSelectedAssets.length} assets based on your collection type`
      });
    },
    onError: (error: any) => {
      console.error('[PolyhavenBrowser] Auto-select error:', error);
      toast({
        title: 'Auto-selection failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const filteredAssets = assets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase())) ||
    asset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleAssetSelection = (assetId: string) => {
    const newSelection = new Set(selectedAssets);
    if (newSelection.has(assetId)) {
      newSelection.delete(assetId);
    } else {
      newSelection.add(assetId);
    }
    setSelectedAssets(newSelection);
  };

  const handleConfirm = () => {
    const assetIds = Array.from(selectedAssets);
    onAssetsSelected?.(assetIds);
    toast({
      title: 'Assets Selected',
      description: `Selected ${assetIds.length} Polyhaven assets`
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Browse Polyhaven Assets
          </DialogTitle>
          <DialogDescription>
            Select 3D models from Polyhaven's free asset library
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'browse' | 'auto')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">
              <Grid3x3 className="h-4 w-4 mr-2" />
              Browse Assets
            </TabsTrigger>
            <TabsTrigger value="auto">
              <Sparkles className="h-4 w-4 mr-2" />
              Auto-Select
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4 mt-4">
            {/* Search */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
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
                {filteredAssets.length} assets • {selectedAssets.size} selected
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedAssets(new Set())}
                disabled={selectedAssets.size === 0}
              >
                Clear Selection
              </Button>
            </div>

            {/* Asset Grid */}
            <ScrollArea className="h-[400px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Loading assets...</p>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-3 gap-4' : 'space-y-2'}>
                  {filteredAssets.map((asset) => (
                    <Card
                      key={asset.id}
                      className={`cursor-pointer transition-all ${
                        selectedAssets.has(asset.id) ? 'border-primary ring-2 ring-primary' : ''
                      }`}
                      onClick={() => toggleAssetSelection(asset.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Checkbox
                                checked={selectedAssets.has(asset.id)}
                                onCheckedChange={() => toggleAssetSelection(asset.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <h4 className="font-medium truncate">{asset.name}</h4>
                              {selectedAssets.has(asset.id) && (
                                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {asset.categories.slice(0, 3).map((cat) => (
                                <Badge key={cat} variant="secondary" className="text-xs">
                                  {cat}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Download className="h-3 w-3" />
                              {asset.download_count.toLocaleString()} downloads
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://polyhaven.com/a/${asset.id}`, '_blank');
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="auto" className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Auto-Select Assets</h3>
                    <p className="text-sm text-muted-foreground">
                      Automatically select the most popular Polyhaven assets based on your collection's world type.
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
                    <Sparkles className="h-4 w-4 mr-2" />
                    {autoSelectMutation.isPending ? 'Selecting...' : 'Auto-Select Assets'}
                  </Button>

                  {selectedAssets.size > 0 && (
                    <div className="p-4 bg-primary/10 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span className="font-medium">{selectedAssets.size} assets selected</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Switch to Browse tab to review or modify your selection
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={selectedAssets.size === 0}>
            Add {selectedAssets.size} Asset{selectedAssets.size !== 1 ? 's' : ''} to Collection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
