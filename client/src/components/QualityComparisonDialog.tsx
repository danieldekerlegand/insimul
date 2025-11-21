import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { ArrowRight, Maximize2, TrendingUp, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import type { VisualAsset } from '@shared/schema';

interface QualityComparisonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalAsset: VisualAsset;
  processedAsset: VisualAsset;
}

interface QualityMetrics {
  resolution: { width: number; height: number };
  fileSize: number;
  estimatedQuality: 'low' | 'medium' | 'high' | 'ultra';
  sharpness: number;
  suggestions: string[];
}

interface ComparisonData {
  original: QualityMetrics;
  processed: QualityMetrics;
  improvements: string[];
}

export function QualityComparisonDialog({
  open,
  onOpenChange,
  originalAsset,
  processedAsset
}: QualityComparisonDialogProps) {
  const [sliderValue, setSliderValue] = useState(50);
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadComparison();
    }
  }, [open, originalAsset.id, processedAsset.id]);

  const loadComparison = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest('GET', `/api/assets/compare/${originalAsset.id}/${processedAsset.id}`);
      const data = await response.json();
      setComparison(data);
    } catch (error) {
      console.error('Failed to load comparison:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getQualityBadgeVariant = (quality: string) => {
    switch (quality) {
      case 'ultra': return 'default';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      default: return 'destructive';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quality Comparison
          </DialogTitle>
          <DialogDescription>
            Before and after comparison of image processing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Comparison Slider */}
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            <div className="absolute inset-0">
              <img
                src={`/${processedAsset.filePath}`}
                alt={processedAsset.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div
              className="absolute inset-0"
              style={{
                clipPath: `inset(0 ${100 - sliderValue}% 0 0)`
              }}
            >
              <img
                src={`/${originalAsset.filePath}`}
                alt={originalAsset.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
              style={{
                left: `${sliderValue}%`,
                transform: 'translateX(-50%)'
              }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Slider Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <Label>Before</Label>
              <Label>After</Label>
            </div>
            <Slider
              min={0}
              max={100}
              step={1}
              value={[sliderValue]}
              onValueChange={([v]) => setSliderValue(v)}
            />
          </div>

          {/* Metrics Comparison */}
          {isLoading ? (
            <Card>
              <CardContent className="pt-6 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ) : comparison ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                {/* Original Metrics */}
                <Card>
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Original</h3>
                      <Badge variant={getQualityBadgeVariant(comparison.original.estimatedQuality)}>
                        {comparison.original.estimatedQuality}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Resolution</span>
                        <span className="font-medium">
                          {comparison.original.resolution.width}x{comparison.original.resolution.height}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">File Size</span>
                        <span className="font-medium">{formatBytes(comparison.original.fileSize)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Sharpness</span>
                        <span className="font-medium">{comparison.original.sharpness}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Total Pixels</span>
                        <span className="font-medium">
                          {(comparison.original.resolution.width * comparison.original.resolution.height / 1000000).toFixed(1)}MP
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Processed Metrics */}
                <Card>
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Processed</h3>
                      <Badge variant={getQualityBadgeVariant(comparison.processed.estimatedQuality)}>
                        {comparison.processed.estimatedQuality}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Resolution</span>
                        <span className="font-medium text-green-600">
                          {comparison.processed.resolution.width}x{comparison.processed.resolution.height}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">File Size</span>
                        <span className="font-medium">{formatBytes(comparison.processed.fileSize)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Sharpness</span>
                        <span className="font-medium">{comparison.processed.sharpness}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Total Pixels</span>
                        <span className="font-medium">
                          {(comparison.processed.resolution.width * comparison.processed.resolution.height / 1000000).toFixed(1)}MP
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Improvements */}
              {comparison.improvements.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Improvements
                    </h3>
                    <ul className="space-y-2">
                      {comparison.improvements.map((improvement, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5" />
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          ) : null}

          {/* Fullscreen Tip */}
          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
            <Maximize2 className="h-3 w-3" />
            Drag the slider to compare before and after
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
