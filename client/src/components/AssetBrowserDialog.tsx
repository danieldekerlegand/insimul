import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Image as ImageIcon, Trash2, Download, Search, Filter, Grid3x3, List, Calendar, Tag, Sparkles, History, CheckCircle2, XCircle, Loader2, Clock, FileArchive, CheckSquare, Square, ArrowUp, Wand2, TrendingUp, Box, Volume2, Play, Pause } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { VisualAsset } from '@shared/schema';
import { format } from 'date-fns';
import { AssetExportDialog } from './AssetExportDialog';
import { ImageUpscaleDialog } from './ImageUpscaleDialog';
import { ImageEnhancementDialog } from './ImageEnhancementDialog';
import { QualityComparisonDialog } from './QualityComparisonDialog';
import { ModelPreview } from './ModelPreview';
import { BulkAssetImportDialog } from './BulkAssetImportDialog';

interface AssetBrowserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worldId?: string;
  collectionId?: string;
  entityType?: 'character' | 'business' | 'settlement' | 'country' | 'state';
  entityId?: string;
  onAssetSelected?: (asset: VisualAsset) => void;
  modelsOnly?: boolean;
}

interface GenerationJob {
  id: string;
  worldId: string;
  jobType: string;
  assetType: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  batchSize: number;
  completedCount: number;
  generatedAssetIds: string[];
  generationProvider?: string;
  errorMessage?: string;
  createdAt: Date;
  completedAt?: Date;
}

export function AssetBrowserDialog({
  open,
  onOpenChange,
  worldId,
  collectionId,
  entityType,
  entityId,
  onAssetSelected,
  modelsOnly = false
}: AssetBrowserDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [assetTypeFilter, setAssetTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAsset, setSelectedAsset] = useState<VisualAsset | null>(null);
  const [activeTab, setActiveTab] = useState<'assets' | 'history'>('assets');
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showUpscaleDialog, setShowUpscaleDialog] = useState(false);
  const [showEnhanceDialog, setShowEnhanceDialog] = useState(false);
  const [showComparisonDialog, setShowComparisonDialog] = useState(false);
  const [assetForUpscale, setAssetForUpscale] = useState<VisualAsset | null>(null);
  const [assetForEnhance, setAssetForEnhance] = useState<VisualAsset | null>(null);
  const [comparisonAssets, setComparisonAssets] = useState<{ original: VisualAsset | null; processed: VisualAsset | null }>({ original: null, processed: null });
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [showBulkImport, setShowBulkImport] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch assets
  const { data: assets = [], isLoading } = useQuery<VisualAsset[]>({
    queryKey: entityId && entityType
      ? ['/api/assets', entityType, entityId]
      : worldId
        ? ['/api/worlds', worldId, 'assets', ...(assetTypeFilter !== 'all' ? [`?assetType=${assetTypeFilter}`] : [])]
        : ['/api/assets'],
    enabled: open
  });

  // Fetch generation jobs (only if worldId is provided)
  const { data: generationJobs = [] } = useQuery<GenerationJob[]>({
    queryKey: ['/api/worlds', worldId, 'generation-jobs'],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/worlds/${worldId}/generation-jobs`);
      return response.json();
    },
    enabled: open && !!worldId && activeTab === 'history',
    refetchInterval: (query) => {
      const jobs = query.state.data || [];
      return jobs.some(j => j.status === 'processing') ? 3000 : false;
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (assetId: string) => {
      await apiRequest('DELETE', `/api/assets/${assetId}`, undefined);
    },
    onSuccess: () => {
      toast({
        title: 'Asset deleted',
        description: 'The visual asset has been removed.'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/worlds'] });
      setSelectedAsset(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const isImageAsset = (asset: VisualAsset): boolean => {
    if (asset.mimeType && asset.mimeType.startsWith('image/')) {
      return true;
    }
    const filePath = asset.filePath?.toLowerCase?.() || '';
    return filePath.endsWith('.png') || filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') || filePath.endsWith('.webp');
  };

  const isModelAsset = (asset: VisualAsset): boolean => {
    const type = asset.assetType || '';
    if (type.startsWith('model_')) {
      return true;
    }
    const mime = asset.mimeType || '';
    if (mime === 'model/gltf-binary') {
      return true;
    }
    const filePath = asset.filePath?.toLowerCase?.() || '';
    return filePath.endsWith('.glb') || filePath.endsWith('.gltf');
  };

  const isAudioAsset = (asset: VisualAsset): boolean => {
    const type = asset.assetType || '';
    if (type.startsWith('audio_')) {
      return true;
    }
    const mime = asset.mimeType || '';
    if (mime.startsWith('audio/')) {
      return true;
    }
    const filePath = asset.filePath?.toLowerCase?.() || '';
    return filePath.endsWith('.mp3') || filePath.endsWith('.wav') || filePath.endsWith('.ogg') || filePath.endsWith('.m4a');
  };

  const handleAudioPlayPause = (e: React.MouseEvent, asset: VisualAsset) => {
    e.stopPropagation();
    const audioId = `audio-${asset.id}`;
    const audioElement = document.getElementById(audioId) as HTMLAudioElement;
    
    if (audioElement) {
      if (playingAudioId === asset.id) {
        audioElement.pause();
        setPlayingAudioId(null);
      } else {
        // Stop any currently playing audio
        if (playingAudioId) {
          const currentAudio = document.getElementById(`audio-${playingAudioId}`) as HTMLAudioElement;
          if (currentAudio) currentAudio.pause();
        }
        audioElement.play();
        setPlayingAudioId(asset.id);
        // Reset when audio ends
        audioElement.onended = () => setPlayingAudioId(null);
      }
    }
  };

  const visibleAssets = assets.filter(asset => !modelsOnly || isModelAsset(asset));

  const filteredAssets = visibleAssets.filter(asset => {
    const matchesSearch = searchTerm === '' ||
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = assetTypeFilter === 'all' || asset.assetType === assetTypeFilter;

    return matchesSearch && matchesType;
  });

  const assetTypes = Array.from(new Set(visibleAssets.map(a => a.assetType)));

  const handleDownload = (asset: VisualAsset) => {
    const link = document.createElement('a');
    link.href = `/${asset.filePath}`;
    link.download = asset.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAssetTypeBadgeColor = (type: string): "default" | "secondary" | "destructive" | "outline" => {
    if (type.startsWith('character_')) return 'default';
    if (type.startsWith('building_')) return 'secondary';
    if (type.startsWith('map_')) return 'outline';
    return 'default';
  };

  const getJobStatusIcon = (status: GenerationJob['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'queued':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getJobStatusBadge = (status: GenerationJob['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'processing':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Bulk selection handlers
  const toggleAssetSelection = (assetId: string) => {
    const newSelection = new Set(selectedAssets);
    if (newSelection.has(assetId)) {
      newSelection.delete(assetId);
    } else {
      newSelection.add(assetId);
    }
    setSelectedAssets(newSelection);
  };

  const selectAll = () => {
    const allIds = new Set(filteredAssets.map(a => a.id));
    setSelectedAssets(allIds);
  };

  const clearSelection = () => {
    setSelectedAssets(new Set());
  };

  const getSelectedAssetsData = (): VisualAsset[] => {
    return assets.filter(a => selectedAssets.has(a.id));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Visual Assets Browser
            </DialogTitle>
            <DialogDescription>
              {entityId ? `Showing assets for selected entity` : worldId ? `Showing assets for this world` : 'Browse all visual assets'}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'assets' | 'history')}>
            {worldId && (
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="assets">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Assets ({assets.length})
                </TabsTrigger>
                <TabsTrigger value="history">
                  <History className="h-4 w-4 mr-2" />
                  Generation History ({generationJobs.length})
                </TabsTrigger>
              </TabsList>
            )}

            <TabsContent value="assets" className="space-y-4 mt-4">
            {/* Search and Filters */}
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
              <Select value={assetTypeFilter} onValueChange={setAssetTypeFilter}>
                <SelectTrigger className="w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {assetTypes.map(type => (
                    <SelectItem key={type} value={type}>{type.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3x3 className="h-4 w-4" />}
              </Button>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              {worldId && (
                <Button
                  variant="outline"
                  onClick={() => setShowBulkImport(true)}
                >
                  <ArrowUp className="h-4 w-4 mr-2" />
                  Bulk Import
                </Button>
              )}
              <Button
                onClick={() => {
                  toast({
                    title: "Generate Coming Soon", 
                    description: "Use the Generate Assets button on the collection card to create new assets",
                  });
                }}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Assets
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-4 text-sm text-muted-foreground">
              <div>{filteredAssets.length} assets found</div>
              <div>•</div>
              <div>{assetTypes.length} types</div>
            </div>

            {/* Bulk Selection Toolbar */}
            {filteredAssets.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectedAssets.size === filteredAssets.length ? clearSelection : selectAll}
                  >
                    {selectedAssets.size === filteredAssets.length ? (
                      <>
                        <Square className="h-4 w-4 mr-2" />
                        Deselect All
                      </>
                    ) : (
                      <>
                        <CheckSquare className="h-4 w-4 mr-2" />
                        Select All
                      </>
                    )}
                  </Button>
                  {selectedAssets.size > 0 && (
                    <>
                      <Separator orientation="vertical" className="h-6" />
                      <span className="text-sm font-medium">
                        {selectedAssets.size} selected
                      </span>
                    </>
                  )}
                </div>
                {selectedAssets.size > 0 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearSelection}
                    >
                      Clear
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setShowExportDialog(true)}
                    >
                      <FileArchive className="h-4 w-4 mr-2" />
                      Export ({selectedAssets.size})
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Asset Grid/List */}
            <ScrollArea className="h-[500px] pr-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Loading assets...</p>
                </div>
              ) : filteredAssets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">No assets found</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-3 gap-4">
                  {filteredAssets.map(asset => (
                    <Card
                      key={asset.id}
                      className={`cursor-pointer transition-colors ${
                        selectedAssets.has(asset.id)
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-primary'
                      }`}
                      onClick={() => setSelectedAsset(asset)}
                    >
                      <CardContent className="p-0">
                        <div className="relative aspect-square">
                          {isImageAsset(asset) ? (
                            <img
                              src={`/${asset.filePath}`}
                              alt={asset.name}
                              className="w-full h-full object-cover rounded-t-lg"
                            />
                          ) : isAudioAsset(asset) ? (
                            <div className="flex flex-col h-full w-full items-center justify-center rounded-t-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                              <Volume2 className="h-10 w-10 text-purple-500 mb-2" />
                              <button
                                onClick={(e) => handleAudioPlayPause(e, asset)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                              >
                                {playingAudioId === asset.id ? (
                                  <><Pause className="h-4 w-4" /> Pause</>
                                ) : (
                                  <><Play className="h-4 w-4" /> Play</>
                                )}
                              </button>
                              <audio id={`audio-${asset.id}`} src={`/${asset.filePath}`} preload="none" />
                            </div>
                          ) : isModelAsset(asset) ? (
                            <ModelPreview
                              modelPath={asset.filePath}
                              className="h-full w-full"
                              showControls={false}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center rounded-t-lg bg-muted">
                              <Box className="h-8 w-8 text-muted-foreground mr-2" />
                              <span className="text-xs text-muted-foreground">Unknown</span>
                            </div>
                          )}
                          <div className="absolute top-2 left-2">
                            <Checkbox
                              checked={selectedAssets.has(asset.id)}
                              onCheckedChange={() => {
                                toggleAssetSelection(asset.id);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="bg-white border-2"
                            />
                          </div>
                          <div className="absolute top-2 right-2">
                            <Badge variant={getAssetTypeBadgeColor(asset.assetType)}>
                              {asset.assetType.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                        </div>
                        <div className="p-3 space-y-1">
                          <p className="font-medium text-sm truncate">{asset.name}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {asset.createdAt && format(new Date(asset.createdAt), 'MMM d, yyyy')}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAssets.map(asset => (
                    <Card
                      key={asset.id}
                      className={`cursor-pointer transition-colors ${
                        selectedAssets.has(asset.id)
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-primary'
                      }`}
                      onClick={() => setSelectedAsset(asset)}
                    >
                      <CardContent className="p-4 flex items-center gap-4">
                        <Checkbox
                          checked={selectedAssets.has(asset.id)}
                          onCheckedChange={() => {
                            toggleAssetSelection(asset.id);
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        {isImageAsset(asset) ? (
                          <img
                            src={`/${asset.filePath}`}
                            alt={asset.name}
                            className="w-20 h-20 object-cover rounded"
                          />
                        ) : isAudioAsset(asset) ? (
                          <div className="flex h-20 w-20 items-center justify-center rounded bg-gradient-to-br from-purple-500/20 to-pink-500/20 relative">
                            <Volume2 className="h-6 w-6 text-purple-500" />
                            <button
                              onClick={(e) => handleAudioPlayPause(e, asset)}
                              className="absolute bottom-1 right-1 p-1 rounded-full bg-purple-500 text-white hover:bg-purple-600"
                            >
                              {playingAudioId === asset.id ? (
                                <Pause className="h-3 w-3" />
                              ) : (
                                <Play className="h-3 w-3" />
                              )}
                            </button>
                            <audio id={`audio-${asset.id}`} src={`/${asset.filePath}`} preload="none" />
                          </div>
                        ) : isModelAsset(asset) ? (
                          <ModelPreview
                            modelPath={asset.filePath}
                            className="h-20 w-20 rounded"
                            showControls={false}
                          />
                        ) : (
                          <div className="flex h-20 w-20 items-center justify-center rounded bg-muted">
                            <Box className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 space-y-1">
                          <p className="font-medium">{asset.name}</p>
                          {asset.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">{asset.description}</p>
                          )}
                          <div className="flex gap-2 items-center">
                            <Badge variant={getAssetTypeBadgeColor(asset.assetType)} className="text-xs">
                              {asset.assetType.replace(/_/g, ' ')}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {asset.width}x{asset.height}
                            </span>
                            {asset.generationProvider && (
                              <Badge variant="outline" className="text-xs">
                                <Sparkles className="h-3 w-3 mr-1" />
                                {asset.generationProvider}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(asset);
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
            </TabsContent>

            {/* Generation History Tab */}
            <TabsContent value="history" className="space-y-4 mt-4">
              <ScrollArea className="h-[500px] pr-4">
                {generationJobs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    <History className="h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No generation history</p>
                    <p className="text-sm text-muted-foreground">Generated assets will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {generationJobs.map((job) => (
                      <Card key={job.id}>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2 flex-1">
                                {getJobStatusIcon(job.status)}
                                <div className="flex-1">
                                  <p className="font-medium">
                                    {job.assetType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {job.jobType === 'batch_generation' ? 'Batch Generation' : 'Single Asset'}
                                  </p>
                                </div>
                              </div>
                              <Badge variant={getJobStatusBadge(job.status)}>
                                {job.status}
                              </Badge>
                            </div>

                            {/* Progress */}
                            {job.status === 'processing' && (
                              <div className="space-y-1">
                                <Progress value={job.progress * 100} className="h-2" />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>{job.completedCount} / {job.batchSize} completed</span>
                                  <span>{Math.round(job.progress * 100)}%</span>
                                </div>
                              </div>
                            )}

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Provider</p>
                                <Badge variant="outline" className="mt-1">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  {job.generationProvider || 'N/A'}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Created</p>
                                <p className="font-medium mt-1">
                                  {job.createdAt && format(new Date(job.createdAt), 'MMM d, HH:mm')}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Assets Generated</p>
                                <p className="font-medium mt-1">{job.generatedAssetIds.length}</p>
                              </div>
                            </div>

                            {/* Error Message */}
                            {job.errorMessage && (
                              <div className="p-2 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                                {job.errorMessage}
                              </div>
                            )}

                            {/* Completed Info */}
                            {job.status === 'completed' && job.completedAt && (
                              <div className="text-xs text-muted-foreground">
                                Completed {format(new Date(job.completedAt), 'MMM d, yyyy HH:mm:ss')}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Asset Detail Dialog */}
      <Dialog open={!!selectedAsset} onOpenChange={(open) => !open && setSelectedAsset(null)}>
        <DialogContent className="max-w-4xl">
          {selectedAsset && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedAsset.name}</DialogTitle>
                <DialogDescription>{selectedAsset.description}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="relative">
                  {isImageAsset(selectedAsset) ? (
                    <img
                      src={`/${selectedAsset.filePath}`}
                      alt={selectedAsset.name}
                      className="w-full rounded-lg border"
                    />
                  ) : (
                    <div className="flex h-64 items-center justify-center rounded-lg border bg-muted">
                      <Box className="h-10 w-10 text-muted-foreground mr-2" />
                      <span className="text-sm text-muted-foreground">3D model asset</span>
                    </div>
                  )}
                </div>

                <Tabs defaultValue="details">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="generation">Generation Info</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Type</p>
                        <p className="font-medium">{selectedAsset.assetType.replace(/_/g, ' ')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Dimensions</p>
                        <p className="font-medium">{selectedAsset.width}x{selectedAsset.height}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">File Size</p>
                        <p className="font-medium">
                          {selectedAsset.fileSize ? `${(selectedAsset.fileSize / 1024).toFixed(2)} KB` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Format</p>
                        <p className="font-medium">{selectedAsset.mimeType}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Purpose</p>
                        <p className="font-medium">{selectedAsset.purpose || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Context</p>
                        <p className="font-medium">{selectedAsset.usageContext || 'N/A'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground">File Path</p>
                        <p className="font-mono text-xs break-all">{selectedAsset.filePath}</p>
                      </div>
                    </div>

                    {selectedAsset.tags && selectedAsset.tags.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedAsset.tags.map(tag => (
                            <Badge key={tag} variant="outline">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="generation" className="space-y-4">
                    {selectedAsset.generationProvider ? (
                      <>
                        <div>
                          <p className="text-sm text-muted-foreground">Provider</p>
                          <Badge variant="outline" className="mt-1">
                            <Sparkles className="h-3 w-3 mr-1" />
                            {selectedAsset.generationProvider}
                          </Badge>
                        </div>

                        {selectedAsset.generationPrompt && (
                          <div>
                            <p className="text-sm text-muted-foreground">Prompt</p>
                            <p className="text-sm mt-1 p-3 bg-muted rounded-lg">
                              {selectedAsset.generationPrompt}
                            </p>
                          </div>
                        )}

                        {selectedAsset.generationParams && Object.keys(selectedAsset.generationParams).length > 0 && (
                          <div>
                            <p className="text-sm text-muted-foreground">Parameters</p>
                            <pre className="text-xs mt-1 p-3 bg-muted rounded-lg overflow-auto">
                              {JSON.stringify(selectedAsset.generationParams, null, 2)}
                            </pre>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">This asset was not generated by AI.</p>
                    )}
                  </TabsContent>
                </Tabs>

                <div className="space-y-3">
                  {/* Quality Tools */}
                  {isImageAsset(selectedAsset) && (
                    <Card>
                      <CardContent className="pt-4">
                        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          Quality Tools
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setAssetForUpscale(selectedAsset);
                              setShowUpscaleDialog(true);
                            }}
                          >
                            <ArrowUp className="h-4 w-4 mr-2" />
                            Upscale
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setAssetForEnhance(selectedAsset);
                              setShowEnhanceDialog(true);
                            }}
                          >
                            <Wand2 className="h-4 w-4 mr-2" />
                            Enhance
                          </Button>
                          {selectedAsset.parentAssetId && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                const parentAsset = assets.find(a => a.id === selectedAsset.parentAssetId);
                                if (parentAsset) {
                                  setComparisonAssets({ original: parentAsset, processed: selectedAsset });
                                  setShowComparisonDialog(true);
                                }
                              }}
                            >
                              <TrendingUp className="h-4 w-4 mr-2" />
                              Compare
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => handleDownload(selectedAsset)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    {onAssetSelected && (
                      <Button onClick={() => {
                        onAssetSelected(selectedAsset);
                        setSelectedAsset(null);
                        onOpenChange(false);
                      }}>
                        Select This Asset
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Asset?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{selectedAsset.name}". This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(selectedAsset.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Asset Export Dialog */}
      <AssetExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        selectedAssets={getSelectedAssetsData()}
      />

      {/* Image Upscale Dialog */}
      {assetForUpscale && (
        <ImageUpscaleDialog
          open={showUpscaleDialog}
          onOpenChange={setShowUpscaleDialog}
          asset={assetForUpscale}
          onUpscaleComplete={(newAssetId) => {
            queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
            queryClient.invalidateQueries({ queryKey: ['/api/worlds'] });
            setShowUpscaleDialog(false);
            setAssetForUpscale(null);
          }}
        />
      )}

      {/* Image Enhancement Dialog */}
      {assetForEnhance && (
        <ImageEnhancementDialog
          open={showEnhanceDialog}
          onOpenChange={setShowEnhanceDialog}
          asset={assetForEnhance}
          onEnhanceComplete={(newAssetId) => {
            queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
            queryClient.invalidateQueries({ queryKey: ['/api/worlds'] });
            setShowEnhanceDialog(false);
            setAssetForEnhance(null);
          }}
        />
      )}

      {/* Quality Comparison Dialog */}
      {comparisonAssets.original && comparisonAssets.processed && (
        <QualityComparisonDialog
          open={showComparisonDialog}
          onOpenChange={setShowComparisonDialog}
          originalAsset={comparisonAssets.original}
          processedAsset={comparisonAssets.processed}
        />
      )}

      {/* Bulk Asset Import Dialog */}
      {worldId && (
        <BulkAssetImportDialog
          open={showBulkImport}
          onOpenChange={setShowBulkImport}
          worldId={worldId}
          collectionId={collectionId}
        />
      )}
    </>
  );
}
