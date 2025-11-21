import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wand2, Sun, Contrast, Droplets, Focus, Wind, Loader2, CheckCircle2, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { VisualAsset } from '@shared/schema';

interface ImageEnhancementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: VisualAsset;
  onEnhanceComplete?: (newAssetId: string) => void;
}

interface EnhancementParams {
  brightness: number;
  contrast: number;
  saturation: number;
  sharpness: number;
  denoise: number;
}

export function ImageEnhancementDialog({
  open,
  onOpenChange,
  asset,
  onEnhanceComplete
}: ImageEnhancementDialogProps) {
  const [params, setParams] = useState<EnhancementParams>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    sharpness: 0,
    denoise: 0
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const { toast } = useToast();

  const updateParam = <K extends keyof EnhancementParams>(
    key: K,
    value: number
  ) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const resetParams = () => {
    setParams({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      sharpness: 0,
      denoise: 0
    });
  };

  const hasChanges = Object.values(params).some(v => v !== 0);

  const handleEnhance = async () => {
    if (!hasChanges) {
      toast({
        title: 'No changes',
        description: 'Please adjust at least one parameter',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 15;
      });
    }, 300);

    try {
      const response = await apiRequest('POST', `/api/assets/${asset.id}/enhance`, params);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Enhancement failed');
      }

      clearInterval(progressInterval);
      setProgress(100);

      toast({
        title: 'Enhancement complete',
        description: 'Image has been enhanced successfully'
      });

      if (onEnhanceComplete && data.newAssetId) {
        onEnhanceComplete(data.newAssetId);
      }

      // Close dialog after a short delay
      setTimeout(() => {
        onOpenChange(false);
        setProgress(0);
        resetParams();
      }, 1000);
    } catch (error: any) {
      clearInterval(progressInterval);
      toast({
        title: 'Enhancement failed',
        description: error.message,
        variant: 'destructive'
      });
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const presets = {
    'Brighten': { brightness: 20, contrast: 10, saturation: 5, sharpness: 10, denoise: 0 },
    'Vivid': { brightness: 5, contrast: 15, saturation: 25, sharpness: 15, denoise: 0 },
    'Sharpen': { brightness: 0, contrast: 5, saturation: 0, sharpness: 30, denoise: 0 },
    'Smooth': { brightness: 0, contrast: -5, saturation: 0, sharpness: 0, denoise: 20 },
    'Dramatic': { brightness: -5, contrast: 30, saturation: 10, sharpness: 20, denoise: 0 }
  };

  const applyPreset = (presetName: keyof typeof presets) => {
    setParams(presets[presetName]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Enhance Image
          </DialogTitle>
          <DialogDescription>
            Apply filters and adjustments to {asset.name}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Adjustments</TabsTrigger>
            <TabsTrigger value="presets">Quick Presets</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-6 mt-4">
            {/* Brightness */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  Brightness
                </Label>
                <span className="text-sm text-muted-foreground">{params.brightness > 0 ? '+' : ''}{params.brightness}</span>
              </div>
              <Slider
                min={-100}
                max={100}
                step={1}
                value={[params.brightness]}
                onValueChange={([v]) => updateParam('brightness', v)}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Darker</span>
                <span>Brighter</span>
              </div>
            </div>

            {/* Contrast */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Contrast className="h-4 w-4" />
                  Contrast
                </Label>
                <span className="text-sm text-muted-foreground">{params.contrast > 0 ? '+' : ''}{params.contrast}</span>
              </div>
              <Slider
                min={-100}
                max={100}
                step={1}
                value={[params.contrast]}
                onValueChange={([v]) => updateParam('contrast', v)}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Less contrast</span>
                <span>More contrast</span>
              </div>
            </div>

            {/* Saturation */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Droplets className="h-4 w-4" />
                  Saturation
                </Label>
                <span className="text-sm text-muted-foreground">{params.saturation > 0 ? '+' : ''}{params.saturation}</span>
              </div>
              <Slider
                min={-100}
                max={100}
                step={1}
                value={[params.saturation]}
                onValueChange={([v]) => updateParam('saturation', v)}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Muted</span>
                <span>Vibrant</span>
              </div>
            </div>

            {/* Sharpness */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Focus className="h-4 w-4" />
                  Sharpness
                </Label>
                <span className="text-sm text-muted-foreground">{params.sharpness}</span>
              </div>
              <Slider
                min={0}
                max={100}
                step={1}
                value={[params.sharpness]}
                onValueChange={([v]) => updateParam('sharpness', v)}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Soft</span>
                <span>Sharp</span>
              </div>
            </div>

            {/* Denoise */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Wind className="h-4 w-4" />
                  Denoise
                </Label>
                <span className="text-sm text-muted-foreground">{params.denoise}</span>
              </div>
              <Slider
                min={0}
                max={100}
                step={1}
                value={[params.denoise]}
                onValueChange={([v]) => updateParam('denoise', v)}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>None</span>
                <span>Maximum</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="presets" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(presets).map((presetName) => (
                <Card
                  key={presetName}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => applyPreset(presetName as keyof typeof presets)}
                >
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{presetName}</h3>
                    <div className="text-xs text-muted-foreground space-y-1">
                      {Object.entries(presets[presetName as keyof typeof presets]).map(([key, value]) =>
                        value !== 0 && (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key}</span>
                            <span>{value > 0 ? '+' : ''}{value}</span>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Click a preset to apply its settings, then switch to Manual tab to fine-tune
            </p>
          </TabsContent>
        </Tabs>

        {/* Progress */}
        {isProcessing && (
          <Card>
            <CardContent className="pt-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Enhancing...</span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} />
            </CardContent>
          </Card>
        )}

        <DialogFooter className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetParams}
            disabled={!hasChanges || isProcessing}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleEnhance} disabled={!hasChanges || isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : progress === 100 ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Complete
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Apply Enhancements
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
