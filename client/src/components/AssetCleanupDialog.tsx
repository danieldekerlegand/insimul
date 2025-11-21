import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, AlertTriangle, Loader2, CheckCircle2, HardDrive } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface AssetCleanupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worldId?: string;
}

interface CleanupResult {
  deletedCount: number;
  freedSpace: number;
  assets: string[];
}

export function AssetCleanupDialog({
  open,
  onOpenChange,
  worldId
}: AssetCleanupDialogProps) {
  const [status, setStatus] = useState<'failed' | 'archived' | 'all'>('failed');
  const [olderThanDays, setOlderThanDays] = useState<number>(30);
  const [dryRun, setDryRun] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<CleanupResult | null>(null);

  const { toast } = useToast();

  const handleCleanup = async () => {
    setIsProcessing(true);
    setResult(null);

    try {
      const response = await apiRequest('POST', '/api/assets/cleanup', {
        worldId,
        status: status === 'all' ? undefined : status,
        olderThanDays,
        dryRun
      });

      const data = await response.json();
      setResult(data);

      toast({
        title: dryRun ? 'Cleanup preview complete' : 'Cleanup complete',
        description: dryRun
          ? `Found ${data.deletedCount} assets that would be deleted`
          : `Deleted ${data.deletedCount} assets, freed ${formatBytes(data.freedSpace)}`
      });
    } catch (error: any) {
      toast({
        title: 'Cleanup failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleReset = () => {
    setResult(null);
    setDryRun(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Asset Cleanup
          </DialogTitle>
          <DialogDescription>
            Clean up old, failed, or archived assets to free up storage space
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Warning */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> This action cannot be undone. Always run in dry-run mode first to preview what will be deleted.
            </AlertDescription>
          </Alert>

          {/* Cleanup Options */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Asset Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="failed">Failed generations only</SelectItem>
                  <SelectItem value="archived">Archived assets only</SelectItem>
                  <SelectItem value="all">All assets</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="days">Older than (days)</Label>
              <Input
                id="days"
                type="number"
                min={1}
                max={365}
                value={olderThanDays}
                onChange={(e) => setOlderThanDays(parseInt(e.target.value) || 30)}
              />
              <p className="text-xs text-muted-foreground">
                Only delete assets created more than this many days ago
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dryRun">Dry Run Mode</Label>
                <p className="text-xs text-muted-foreground">
                  Preview changes without actually deleting anything
                </p>
              </div>
              <Switch
                id="dryRun"
                checked={dryRun}
                onCheckedChange={setDryRun}
              />
            </div>
          </div>

          {/* Results */}
          {result && (
            <Card className={dryRun ? 'border-yellow-500' : 'border-green-500'}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  {dryRun ? (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                  <h3 className="font-semibold">
                    {dryRun ? 'Preview Results' : 'Cleanup Results'}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      {dryRun ? 'Assets to delete' : 'Assets deleted'}
                    </p>
                    <p className="text-2xl font-bold">{result.deletedCount}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      {dryRun ? 'Space to free' : 'Space freed'}
                    </p>
                    <p className="text-2xl font-bold flex items-center gap-2">
                      <HardDrive className="h-5 w-5" />
                      {formatBytes(result.freedSpace)}
                    </p>
                  </div>
                </div>

                {dryRun && result.deletedCount > 0 && (
                  <Alert>
                    <AlertDescription>
                      This is a preview. Turn off dry-run mode and run cleanup again to actually delete these assets.
                    </AlertDescription>
                  </Alert>
                )}

                {!dryRun && result.deletedCount > 0 && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      Successfully deleted {result.deletedCount} assets and freed {formatBytes(result.freedSpace)} of storage.
                    </AlertDescription>
                  </Alert>
                )}

                {result.deletedCount === 0 && (
                  <Alert>
                    <AlertDescription>
                      No assets found matching the specified criteria.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          {result ? (
            <>
              <Button variant="outline" onClick={handleReset}>
                New Cleanup
              </Button>
              <Button onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
                Cancel
              </Button>
              <Button
                onClick={handleCleanup}
                disabled={isProcessing}
                variant={dryRun ? 'default' : 'destructive'}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : dryRun ? (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Preview Cleanup
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Run Cleanup
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
