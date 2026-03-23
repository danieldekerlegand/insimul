import { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Download, Package, CheckCircle2, AlertCircle, Loader2, FileText, Code2, Database, Settings, Radio, Cpu, Cloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type EngineType = 'babylon' | 'unreal' | 'unity' | 'godot';
type BabylonMode = 'web' | 'electron';
type AIProviderChoice = 'cloud' | 'local';

interface ExportStep {
  label: string;
  status: 'pending' | 'active' | 'done' | 'error';
}

interface ExportStats {
  totalFiles: number;
  totalSizeBytes: number;
  generationTimeMs: number;
  cppFiles?: number;
  csharpFiles?: number;
  gdscriptFiles?: number;
  dataFiles?: number;
  configFiles?: number;
}

const ENGINE_OPTIONS: { value: EngineType; label: string; description: string; icon: string; color: string }[] = [
  { value: 'babylon', label: 'Babylon.js', description: 'Full TypeScript web app with Vite', icon: '🌐', color: 'bg-amber-500/10 text-amber-700 border-amber-500/30' },
  { value: 'unreal', label: 'Unreal Engine 5', description: 'Full C++ project with DataTables', icon: '🎮', color: 'bg-blue-500/10 text-blue-700 border-blue-500/30' },
  { value: 'unity', label: 'Unity', description: 'C# project with Resources/Data', icon: '🔷', color: 'bg-slate-500/10 text-slate-700 border-slate-500/30' },
  { value: 'godot', label: 'Godot 4', description: 'GDScript project with .tscn scene', icon: '🤖', color: 'bg-cyan-500/10 text-cyan-700 border-cyan-500/30' },
];

function getStepsForEngine(engine: EngineType): ExportStep[] {
  const base: ExportStep[] = [
    { label: 'Generating Intermediate Representation...', status: 'pending' },
  ];

  switch (engine) {
    case 'babylon':
      return [
        ...base,
        { label: 'Generating TypeScript game files...', status: 'pending' },
        { label: 'Generating JSON data files...', status: 'pending' },
        { label: 'Generating project configs & scene builder...', status: 'pending' },
        { label: 'Packaging ZIP archive...', status: 'pending' },
      ];
    case 'unreal':
      return [
        ...base,
        { label: 'Generating C++ headers & source files...', status: 'pending' },
        { label: 'Generating DataTable JSON files...', status: 'pending' },
        { label: 'Generating project configs & level descriptor...', status: 'pending' },
        { label: 'Packaging ZIP archive...', status: 'pending' },
      ];
    case 'unity':
      return [
        ...base,
        { label: 'Generating C# scripts...', status: 'pending' },
        { label: 'Generating Resources/Data JSON files...', status: 'pending' },
        { label: 'Generating project settings & scene descriptor...', status: 'pending' },
        { label: 'Packaging ZIP archive...', status: 'pending' },
      ];
    case 'godot':
      return [
        ...base,
        { label: 'Generating GDScript files...', status: 'pending' },
        { label: 'Generating data JSON files...', status: 'pending' },
        { label: 'Generating .tscn scene & project.godot...', status: 'pending' },
        { label: 'Packaging ZIP archive...', status: 'pending' },
      ];
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface EngineExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worldId: string;
  worldName: string;
  initialEngine?: EngineType;
}

interface TelemetryApiKey {
  id: string;
  name: string;
  key: string;
}

export function EngineExportDialog({ open, onOpenChange, worldId, worldName, initialEngine }: EngineExportDialogProps) {
  const [selectedEngine, setSelectedEngine] = useState<EngineType>(initialEngine || 'unreal');
  const [babylonMode, setBabylonMode] = useState<BabylonMode>('web');
  const [isExporting, setIsExporting] = useState(false);
  const [steps, setSteps] = useState<ExportStep[]>([]);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<ExportStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);
  const { toast } = useToast();

  // AI provider choice
  const [aiProvider, setAiProvider] = useState<AIProviderChoice>('cloud');

  // Build executable option (Electron only)
  const [buildExecutable, setBuildExecutable] = useState(false);

  // Telemetry configuration state
  const [telemetryEnabled, setTelemetryEnabled] = useState(false);
  const [telemetryServerUrl, setTelemetryServerUrl] = useState(window.location.origin);
  const [telemetryApiKeyId, setTelemetryApiKeyId] = useState<string>('');
  const [telemetryApiKeys, setTelemetryApiKeys] = useState<TelemetryApiKey[]>([]);
  const [loadingApiKeys, setLoadingApiKeys] = useState(false);

  // Fetch API keys when telemetry is enabled
  useEffect(() => {
    if (telemetryEnabled && worldId) {
      setLoadingApiKeys(true);
      fetch(`/api/worlds/${worldId}/api-keys`)
        .then(res => res.ok ? res.json() : [])
        .then((keys: TelemetryApiKey[]) => {
          setTelemetryApiKeys(keys);
          if (keys.length > 0 && !telemetryApiKeyId) {
            setTelemetryApiKeyId(keys[0].id);
          }
        })
        .catch(() => setTelemetryApiKeys([]))
        .finally(() => setLoadingApiKeys(false));
    }
  }, [telemetryEnabled, worldId]);

  const reset = useCallback(() => {
    setIsExporting(false);
    setSteps([]);
    setProgress(0);
    setStats(null);
    setError(null);
    setIsDone(false);
  }, []);

  // Sync selected engine when dialog opens with a new initialEngine
  useEffect(() => {
    if (open && initialEngine) {
      setSelectedEngine(initialEngine);
      reset();
    }
  }, [open, initialEngine, reset]);

  // Reset Babylon mode when switching engines
  const handleEngineChange = useCallback((engine: EngineType) => {
    if (!isExporting) {
      reset();
      setSelectedEngine(engine);
      if (engine !== 'babylon') {
        setBabylonMode('web');
      }
    }
  }, [isExporting, reset]);

  const advanceSteps = useCallback((stepsState: ExportStep[], toIndex: number) => {
    return stepsState.map((s, i) => {
      if (i < toIndex) return { ...s, status: 'done' as const };
      if (i === toIndex) return { ...s, status: 'active' as const };
      return s;
    });
  }, []);

  const handleExport = useCallback(async () => {
    reset();
    setIsExporting(true);

    const initialSteps = getStepsForEngine(selectedEngine);
    const totalSteps = initialSteps.length;
    setSteps(initialSteps);

    // Simulate step progression while the request is in flight
    let currentStep = 0;
    setSteps(prev => advanceSteps(prev, 0));
    setProgress(5);

    const stepInterval = setInterval(() => {
      currentStep++;
      if (currentStep < totalSteps - 1) {
        setSteps(prev => advanceSteps(prev, currentStep));
        setProgress(Math.min(90, (currentStep / totalSteps) * 100));
      }
    }, 800);

    try {
      const body: any = { format: 'zip' };
      if (selectedEngine === 'babylon') {
        body.mode = babylonMode;
      }
      if (aiProvider !== 'cloud') {
        body.aiProvider = aiProvider;
      }
      if (buildExecutable && selectedEngine === 'babylon') {
        body.buildExecutable = true;
      }
      if (telemetryEnabled) {
        body.telemetry = {
          enabled: true,
          serverUrl: telemetryServerUrl,
          apiKeyId: telemetryApiKeyId,
        };
      }
      
      const response = await fetch(`/api/worlds/${worldId}/export/${selectedEngine}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Export failed' }));
        throw new Error(err.error || `Export failed with status ${response.status}`);
      }

      // Mark all steps done
      setSteps(prev => prev.map(s => ({ ...s, status: 'done' as const })));
      setProgress(100);

      // Read response as blob regardless of content-type
      const blob = await response.blob();
      const modeSuffix = selectedEngine === 'babylon' && babylonMode === 'electron' ? 'Electron' : selectedEngine;
      const filename = `InsimulExport_${worldName.replace(/[^a-zA-Z0-9]/g, '')}_${modeSuffix}.zip`;

      // Validate ZIP magic bytes (PK = 0x50 0x4B)
      const header = new Uint8Array(await blob.slice(0, 2).arrayBuffer());
      const isZip = header[0] === 0x50 && header[1] === 0x4B;

      if (!isZip) {
        // Response was likely JSON, not ZIP — try to parse and show error
        const text = await blob.text();
        console.error('[Export] Response is not a ZIP. Content:', text.substring(0, 200));
        try {
          const json = JSON.parse(text);
          if (json.stats) {
            setStats(json.stats);
          }
        } catch { /* ignore parse errors */ }
        throw new Error('Server returned data instead of a ZIP file. Please restart the server and try again.');
      }

      // Valid ZIP — trigger download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = blobUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 1000);

      setStats({
        totalFiles: 0,
        totalSizeBytes: blob.size,
        generationTimeMs: 0,
      });

      toast({
        title: 'Export Complete',
        description: `${filename} (${formatBytes(blob.size)}) — download started.`,
      });

      setIsDone(true);
    } catch (err: any) {
      clearInterval(stepInterval);
      setError(err.message || 'Export failed');
      setSteps(prev => {
        const next = [...prev];
        const activeIdx = next.findIndex(s => s.status === 'active');
        if (activeIdx >= 0) next[activeIdx] = { ...next[activeIdx], status: 'error' };
        return next;
      });
      setProgress(0);

      toast({
        title: 'Export Failed',
        description: err.message || 'Something went wrong during export.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  }, [selectedEngine, babylonMode, aiProvider, buildExecutable, worldId, worldName, reset, advanceSteps, toast]);

  const engineInfo = ENGINE_OPTIONS.find(e => e.value === selectedEngine)!;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isExporting) { reset(); onOpenChange(v); } }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Export Game Project
          </DialogTitle>
          <DialogDescription>
            Generate a complete game project for <strong>{worldName}</strong> ready to open in your chosen engine.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Engine Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Engine</label>
            <Select
              value={selectedEngine}
              onValueChange={(v) => handleEngineChange(v as EngineType)}
              disabled={isExporting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENGINE_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className="flex items-center gap-2">
                      <span>{opt.icon}</span>
                      <span>{opt.label}</span>
                      <span className="text-xs text-muted-foreground ml-1">— {opt.description}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Babylon Mode Selector */}
          {selectedEngine === 'babylon' && !isExporting && !isDone && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Export Type</label>
              <Select value={babylonMode} onValueChange={(v) => setBabylonMode(v as BabylonMode)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web">
                    <span className="flex items-center gap-2">
                      <span>🌐</span>
                      <span>Web App</span>
                      <span className="text-xs text-muted-foreground ml-1">— Runs in browser</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="electron">
                    <span className="flex items-center gap-2">
                      <span>🖥️</span>
                      <span>Electron Desktop</span>
                      <span className="text-xs text-muted-foreground ml-1">— Standalone app</span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* AI Provider Selector */}
          {!isExporting && !isDone && (
            <div className="space-y-2">
              <label className="text-sm font-medium">AI Provider</label>
              <Select value={aiProvider} onValueChange={(v) => setAiProvider(v as AIProviderChoice)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cloud">
                    <span className="flex items-center gap-2">
                      <Cloud className="w-4 h-4" />
                      <span>Cloud (Gemini API)</span>
                      <span className="text-xs text-muted-foreground ml-1">— Requires internet</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="local">
                    <span className="flex items-center gap-2">
                      <Cpu className="w-4 h-4" />
                      <span>Local (llama.cpp + Piper + Whisper)</span>
                      <span className="text-xs text-muted-foreground ml-1">— Fully offline</span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              {aiProvider === 'local' && (
                <p className="text-xs text-muted-foreground">
                  The exported game will bundle local AI models for text generation, TTS, and STT. This increases export size by ~2.5 GB.
                </p>
              )}
            </div>
          )}

          {/* Build Executable Toggle (Electron only) */}
          {selectedEngine === 'babylon' && babylonMode === 'electron' && !isExporting && !isDone && (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="build-executable" className="text-sm font-medium flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" />
                  Build Executable
                </Label>
                <p className="text-xs text-muted-foreground">
                  Compile and package the app (slower export, but verifies the build works)
                </p>
              </div>
              <Switch
                id="build-executable"
                checked={buildExecutable}
                onCheckedChange={setBuildExecutable}
              />
            </div>
          )}

          {/* Telemetry Configuration */}
          {!isExporting && !isDone && (
            <div className="space-y-3">
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="telemetry-toggle" className="text-sm font-medium flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5" />
                    Enable Telemetry
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Include a telemetry client in the exported project
                  </p>
                </div>
                <Switch
                  id="telemetry-toggle"
                  checked={telemetryEnabled}
                  onCheckedChange={setTelemetryEnabled}
                />
              </div>

              {telemetryEnabled && (
                <div className="space-y-3 pl-1 border-l-2 border-muted ml-1.5">
                  <div className="space-y-1.5 pl-3">
                    <Label htmlFor="telemetry-server-url" className="text-xs">Server URL</Label>
                    <Input
                      id="telemetry-server-url"
                      value={telemetryServerUrl}
                      onChange={(e) => setTelemetryServerUrl(e.target.value)}
                      placeholder="https://your-server.example.com"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 pl-3">
                    <Label htmlFor="telemetry-api-key" className="text-xs">API Key</Label>
                    {loadingApiKeys ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground py-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Loading API keys...
                      </div>
                    ) : telemetryApiKeys.length > 0 ? (
                      <Select
                        value={telemetryApiKeyId}
                        onValueChange={setTelemetryApiKeyId}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Select an API key" />
                        </SelectTrigger>
                        <SelectContent>
                          {telemetryApiKeys.map(k => (
                            <SelectItem key={k.id} value={k.id}>
                              <span className="flex items-center gap-2">
                                <span>{k.name || 'Unnamed Key'}</span>
                                <span className="text-xs text-muted-foreground font-mono">{k.key}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-xs text-muted-foreground py-1">
                        No API keys configured for this world. Create one in the Telemetry settings.
                      </p>
                    )}
                  </div>
                </div>
              )}
              <Separator />
            </div>
          )}

          {/* Engine Info Card */}
          {!isExporting && !isDone && (
            <Card className={`border ${engineInfo.color}`}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{engineInfo.icon}</span>
                  <div>
                    <p className="font-medium text-sm">{engineInfo.label}</p>
                    <p className="text-xs text-muted-foreground">{engineInfo.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedEngine === 'babylon' && (
                        <>
                          <Badge variant="outline" className="text-xs"><Code2 className="w-3 h-3 mr-1" />TypeScript</Badge>
                          <Badge variant="outline" className="text-xs"><Database className="w-3 h-3 mr-1" />JSON Data</Badge>
                          <Badge variant="outline" className="text-xs"><Settings className="w-3 h-3 mr-1" />{babylonMode === 'electron' ? 'Electron' : 'Vite'} Config</Badge>
                          {babylonMode === 'electron' && (
                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-300">
                              📦 Desktop App
                            </Badge>
                          )}
                        </>
                      )}
                      {selectedEngine === 'unreal' && (
                        <>
                          <Badge variant="outline" className="text-xs"><Code2 className="w-3 h-3 mr-1" />C++</Badge>
                          <Badge variant="outline" className="text-xs"><Database className="w-3 h-3 mr-1" />DataTables</Badge>
                          <Badge variant="outline" className="text-xs"><Settings className="w-3 h-3 mr-1" />UE5 Configs</Badge>
                        </>
                      )}
                      {selectedEngine === 'unity' && (
                        <>
                          <Badge variant="outline" className="text-xs"><Code2 className="w-3 h-3 mr-1" />C#</Badge>
                          <Badge variant="outline" className="text-xs"><Database className="w-3 h-3 mr-1" />JSON Data</Badge>
                          <Badge variant="outline" className="text-xs"><Settings className="w-3 h-3 mr-1" />ProjectSettings</Badge>
                        </>
                      )}
                      {selectedEngine === 'godot' && (
                        <>
                          <Badge variant="outline" className="text-xs"><Code2 className="w-3 h-3 mr-1" />GDScript</Badge>
                          <Badge variant="outline" className="text-xs"><Database className="w-3 h-3 mr-1" />JSON Data</Badge>
                          <Badge variant="outline" className="text-xs"><Settings className="w-3 h-3 mr-1" />.tscn Scene</Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress Steps */}
          {(isExporting || isDone || error) && (
            <div className="space-y-3">
              <Progress value={progress} className="h-2" />
              <div className="space-y-1.5">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {step.status === 'pending' && <div className="w-4 h-4 rounded-full border-2 border-muted" />}
                    {step.status === 'active' && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                    {step.status === 'done' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    {step.status === 'error' && <AlertCircle className="w-4 h-4 text-destructive" />}
                    <span className={
                      step.status === 'active' ? 'font-medium' :
                      step.status === 'done' ? 'text-muted-foreground' :
                      step.status === 'error' ? 'text-destructive font-medium' :
                      'text-muted-foreground'
                    }>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="py-3 px-4">
                <p className="text-sm text-destructive font-medium">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Stats (on success) */}
          {isDone && stats && (
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Export Successful</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground">
                  {stats.totalFiles > 0 && (
                    <div>
                      <span className="block font-medium text-foreground">{stats.totalFiles}</span>
                      Files generated
                    </div>
                  )}
                  <div>
                    <span className="block font-medium text-foreground">{formatBytes(stats.totalSizeBytes)}</span>
                    Archive size
                  </div>
                  {stats.generationTimeMs > 0 && (
                    <div>
                      <span className="block font-medium text-foreground">{stats.generationTimeMs}ms</span>
                      Generation time
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => { reset(); onOpenChange(false); }}
            disabled={isExporting}
          >
            {isDone ? 'Close' : 'Cancel'}
          </Button>
          {!isDone && (
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="gap-2"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export {engineInfo.label}
                </>
              )}
            </Button>
          )}
          {isDone && !error && (
            <Button onClick={handleExport} className="gap-2">
              <Download className="w-4 h-4" />
              Export Again
            </Button>
          )}
          {error && (
            <Button onClick={handleExport} variant="destructive" className="gap-2">
              <AlertCircle className="w-4 h-4" />
              Retry
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
