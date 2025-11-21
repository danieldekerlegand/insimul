import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ArrowUp, Sparkles, Zap, AlertTriangle, CheckCircle2, Info, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { VisualAsset } from '@shared/schema';

interface ImageUpscaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: VisualAsset;
  onUpscaleComplete?: (newAssetId: string) => void;
}

interface QualityMetrics {
  resolution: { width: number; height: number };
  fileSize: number;
  estimatedQuality: 'low' | 'medium' | 'high' | 'ultra';
  sharpness: number;
  suggestions: string[];
}

export function ImageUpscaleDialog({
  open,
  onOpenChange,
  asset,
  onUpscaleComplete
}: ImageUpscaleDialogProps) {
  const [scale, setScale] = useState<'2' | '4' | '8'>('2');
  const [model, setModel] = useState<'sharp' | 'real-esrgan' | 'gfpgan' | 'codeformer'>('sharp');
  const [faceEnhancement, setFaceEnhancement] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);

  const { toast } = useToast();

  // Load quality metrics when dialog opens
  useEffect(() => {
    if (open && asset) {
      loadQualityMetrics();
    }
  }, [open, asset]);

  const loadQualityMetrics = async () => {
    setIsLoadingMetrics(true);
    try {
      const response = await apiRequest('GET', `/api/assets/${asset.id}/quality`);
      const metrics = await response.json();
      setQualityMetrics(metrics);
    } catch (error: any) {
      console.error('Failed to load quality metrics:', error);
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  const handleUpscale = async () => {
    setIsProcessing(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    try {
      const response = await apiRequest('POST', `/api/assets/${asset.id}/upscale`, {
        scale: parseInt(scale),
        model: model !== 'sharp' ? model : undefined,
        faceEnhancement
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Upscale failed');
      }

      clearInterval(progressInterval);
      setProgress(100);

      toast({
        title: 'Upscale complete',
        description: `Image has been upscaled ${scale}x successfully`
      });

      if (onUpscaleComplete && data.newAssetId) {
        onUpscaleComplete(data.newAssetId);
      }

      // Close dialog after a short delay
      setTimeout(() => {
        onOpenChange(false);
        setProgress(0);
      }, 1000);
    } catch (error: any) {
      clearInterval(progressInterval);
      toast({
        title: 'Upscale failed',
        description: error.message,
        variant: 'destructive'
      });
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const scaleOptions = [
    { value: '2', label: '2x', description: 'Double resolution', fast: true },
    { value: '4', label: '4x', description: 'Quadruple resolution', fast: false },
    { value: '8', label: '8x', description: '8x resolution (very slow)', fast: false }
  ];

  const modelOptions = [
    {
      value: 'sharp',
      label: 'Fast (Lanczos)',
      description: 'Quick bicubic upscaling',
      free: true,
      quality: 'medium'
    },
    {
      value: 'real-esrgan',
      label: 'Real-ESRGAN',
      description: 'AI upscaling for general images',
      free: false,
      quality: 'high'
    },
    {
      value: 'gfpgan',
      label: 'GFPGAN',
      description: 'AI face restoration',
      free: false,
      quality: 'ultra'
    },
    {
      value: 'codeformer',
      label: 'CodeFormer',
      description: 'Advanced face enhancement',
      free: false,
      quality: 'ultra'
    }
  ];

  const getNewResolution = () => {
    const multiplier = parseInt(scale);
    return {
      width: (asset.width || 512) * multiplier,
      height: (asset.height || 512) * multiplier
    };
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const estimatedFileSize = (qualityMetrics?.fileSize || 1000000) * Math.pow(parseInt(scale), 2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUp className="h-5 w-5" />
            Upscale Image
          </DialogTitle>
          <DialogDescription>
            Increase resolution of {asset.name} using AI upscaling
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quality Metrics */}
          {isLoadingMetrics ? (
            <Card>
              <CardContent className="pt-6 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ) : qualityMetrics ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Current Quality
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Resolution</p>
                    <p className="font-semibold">
                      {qualityMetrics.resolution.width}x{qualityMetrics.resolution.height}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Quality Level</p>
                    <Badge variant={
                      qualityMetrics.estimatedQuality === 'ultra' ? 'default' :
                      qualityMetrics.estimatedQuality === 'high' ? 'secondary' :
                      qualityMetrics.estimatedQuality === 'medium' ? 'outline' : 'destructive'
                    }>
                      {qualityMetrics.estimatedQuality}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">File Size</p>
                    <p className="font-semibold">{formatBytes(qualityMetrics.fileSize)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sharpness</p>
                    <p className="font-semibold">{qualityMetrics.sharpness}%</p>
                  </div>
                </div>

                {qualityMetrics.suggestions.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1">
                        {qualityMetrics.suggestions.map((suggestion, i) => (
                          <li key={i} className="text-sm">{suggestion}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ) : null}

          {/* Scale Selection */}
          <div className="space-y-3">
            <Label>Upscale Factor</Label>
            <RadioGroup value={scale} onValueChange={(v) => setScale(v as any)}>
              {scaleOptions.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`scale-${option.value}`} />
                  <Label
                    htmlFor={`scale-${option.value}`}
                    className="flex-1 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <span className="font-medium">{option.label}</span>
                      <span className="text-sm text-muted-foreground ml-2">{option.description}</span>
                    </div>
                    {option.fast && <Badge variant="secondary"><Zap className="h-3 w-3 mr-1" />Fast</Badge>}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Model Selection */}
          <div className="space-y-3">
            <Label>Upscaling Method</Label>
            <RadioGroup value={model} onValueChange={(v) => setModel(v as any)}>
              {modelOptions.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`model-${option.value}`} />
                  <Label
                    htmlFor={`model-${option.value}`}
                    className="flex-1 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <span className="font-medium">{option.label}</span>
                      <span className="text-sm text-muted-foreground ml-2">{option.description}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {option.free ? (
                        <Badge variant="outline">Free</Badge>
                      ) : (
                        <Badge variant="secondary"><Sparkles className="h-3 w-3 mr-1" />AI</Badge>
                      )}
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Face Enhancement */}
          {(model === 'gfpgan' || model === 'codeformer') && (
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label htmlFor="face-enhance">Face Enhancement</Label>
                <p className="text-xs text-muted-foreground">
                  Optimize for character portraits and faces
                </p>
              </div>
              <Switch
                id="face-enhance"
                checked={faceEnhancement}
                onCheckedChange={setFaceEnhancement}
              />
            </div>
          )}

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Result Preview</CardTitle>
              <CardDescription>Estimated output specifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">New Resolution</p>
                  <p className="font-semibold text-green-600">
                    {getNewResolution().width}x{getNewResolution().height}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Est. File Size</p>
                  <p className="font-semibold">{formatBytes(estimatedFileSize)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress */}
          {isProcessing && (
            <Card>
              <CardContent className="pt-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Upscaling...</span>
                  <span className="text-sm text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} />
              </CardContent>
            </Card>
          )}

          {!process.env.REPLICATE_API_KEY && model !== 'sharp' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                AI upscaling requires Replicate API key. Using fast method instead.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handleUpscale} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Upscaling...
              </>
            ) : progress === 100 ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Complete
              </>
            ) : (
              <>
                <ArrowUp className="h-4 w-4 mr-2" />
                Upscale {scale}x
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
