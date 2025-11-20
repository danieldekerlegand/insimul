import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Download, FileArchive, Info, Loader2, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { VisualAsset } from '@shared/schema';

interface AssetExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAssets: VisualAsset[];
  collectionId?: string;
  collectionName?: string;
}

interface ExportPreview {
  totalAssets: number;
  totalSize: number;
  assetTypes: Record<string, number>;
  assets: Array<{
    id: string;
    name: string;
    assetType: string;
    fileSize: number | null;
  }>;
}

type ExportFormat = 'original' | 'png' | 'webp' | 'jpeg';

export function AssetExportDialog({
  open,
  onOpenChange,
  selectedAssets,
  collectionId,
  collectionName
}: AssetExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('original');
  const [quality, setQuality] = useState(90);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [preview, setPreview] = useState<ExportPreview | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const { toast } = useToast();

  // Load preview when dialog opens or assets change
  useEffect(() => {
    if (open && selectedAssets.length > 0) {
      loadPreview();
    }
  }, [open, selectedAssets]);

  const loadPreview = async () => {
    setIsLoadingPreview(true);
    try {
      const assetIds = selectedAssets.map(a => a.id);
      const response = await apiRequest('POST', '/api/assets/export/preview', {
        assetIds
      });
      const data = await response.json();
      setPreview(data);
    } catch (error: any) {
      toast({
        title: 'Failed to load preview',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      const assetIds = selectedAssets.map(a => a.id);
      const zipName = collectionName
        ? `${collectionName.replace(/\s+/g, '-')}-${Date.now()}`
        : `asset-export-${Date.now()}`;

      // Create export request
      const response = await fetch('/api/assets/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assetIds,
          format,
          quality,
          includeMetadata,
          zipName
        })
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get the blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${zipName}.zip`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportProgress(100);

      toast({
        title: 'Export successful',
        description: `Downloaded ${selectedAssets.length} asset${selectedAssets.length > 1 ? 's' : ''} as ZIP`
      });

      // Close dialog after successful export
      setTimeout(() => {
        onOpenChange(false);
        setExportProgress(0);
      }, 1000);

    } catch (error: any) {
      toast({
        title: 'Export failed',
        description: error.message,
        variant: 'destructive'
      });
      setExportProgress(0);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCollection = async () => {
    if (!collectionId) return;

    setIsExporting(true);
    setExportProgress(0);

    try {
      const zipName = collectionName
        ? `${collectionName.replace(/\s+/g, '-')}-${Date.now()}`
        : `collection-export-${Date.now()}`;

      // Create export request
      const response = await fetch(`/api/asset-collections/${collectionId}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format,
          quality,
          includeMetadata,
          zipName
        })
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get the blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${zipName}.zip`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportProgress(100);

      toast({
        title: 'Export successful',
        description: `Downloaded collection "${collectionName}" as ZIP`
      });

      // Close dialog after successful export
      setTimeout(() => {
        onOpenChange(false);
        setExportProgress(0);
      }, 1000);

    } catch (error: any) {
      toast({
        title: 'Export failed',
        description: error.message,
        variant: 'destructive'
      });
      setExportProgress(0);
    } finally {
      setIsExporting(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileArchive className="h-5 w-5" />
            Export Assets
          </DialogTitle>
          <DialogDescription>
            {collectionId
              ? `Export collection "${collectionName}" as a ZIP archive`
              : `Export ${selectedAssets.length} selected asset${selectedAssets.length > 1 ? 's' : ''} as a ZIP archive`
            }
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[500px] pr-4">
          <div className="space-y-6">
            {/* Preview Section */}
            {isLoadingPreview ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
              </Card>
            ) : preview ? (
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Export Preview</span>
                    </div>
                    <Badge variant="secondary">
                      {preview.totalAssets} asset{preview.totalAssets > 1 ? 's' : ''}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Size</p>
                      <p className="text-lg font-semibold">{formatBytes(preview.totalSize)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Asset Types</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(preview.assetTypes).map(([type, count]) => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {type}: {count}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Export Options */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="format">Export Format</Label>
                <Select value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
                  <SelectTrigger id="format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="original">Original (preserve format)</SelectItem>
                    <SelectItem value="png">PNG (lossless)</SelectItem>
                    <SelectItem value="webp">WebP (modern)</SelectItem>
                    <SelectItem value="jpeg">JPEG (compatible)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Convert all images to the selected format, or keep original formats
                </p>
              </div>

              {(format === 'webp' || format === 'jpeg') && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="quality">Quality: {quality}%</Label>
                  </div>
                  <Slider
                    id="quality"
                    min={1}
                    max={100}
                    step={1}
                    value={[quality]}
                    onValueChange={(v) => setQuality(v[0])}
                  />
                  <p className="text-xs text-muted-foreground">
                    Higher quality = larger file size
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="metadata">Include Metadata</Label>
                  <p className="text-xs text-muted-foreground">
                    Include a manifest.json with asset metadata
                  </p>
                </div>
                <Switch
                  id="metadata"
                  checked={includeMetadata}
                  onCheckedChange={setIncludeMetadata}
                />
              </div>
            </div>

            {/* Asset List Preview */}
            {preview && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Assets to Export</span>
                    </div>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {preview.assets.map((asset) => (
                          <div
                            key={asset.id}
                            className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{asset.name}</p>
                              <p className="text-xs text-muted-foreground">{asset.assetType}</p>
                            </div>
                            <span className="text-xs text-muted-foreground ml-2">
                              {asset.fileSize ? formatBytes(asset.fileSize) : 'Unknown'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Export Progress */}
            {isExporting && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Exporting...</span>
                      <span className="text-sm text-muted-foreground">{exportProgress}%</span>
                    </div>
                    <Progress value={exportProgress} />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button
            onClick={collectionId ? handleExportCollection : handleExport}
            disabled={isExporting || selectedAssets.length === 0}
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : exportProgress === 100 ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Complete
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export ZIP
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
