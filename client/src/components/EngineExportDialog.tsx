import { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Download, Package, CheckCircle2, AlertCircle, Loader2, Code2, Database, Settings, Cpu, Cloud, ChevronDown, ChevronRight, Globe, Key } from 'lucide-react';
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
  const [localAIStatus, setLocalAIStatus] = useState<{
    available: boolean;
    missing: string[];
    llm: { found: boolean; sizeBytes: number };
    tts: { found: boolean; voiceCount: number; totalSizeBytes: number };
    stt: { found: boolean; sizeBytes: number };
  } | null>(null);
  const [localAIChecked, setLocalAIChecked] = useState(false);

  // Build executable option (Electron only)
  const [buildExecutable, setBuildExecutable] = useState(false);

  // Unity version selector
  const [unityVersion, setUnityVersion] = useState('6000.0.38f1');

  // Insimul API configuration (for telemetry in exported games)
  const [apiConfigExpanded, setApiConfigExpanded] = useState(false);
  const [apiServerUrl, setApiServerUrl] = useState('');
  const [apiKeyId, setApiKeyId] = useState('');
  const [apiKeys, setApiKeys] = useState<{ id: string; key: string; name: string }[]>([]);
  const [apiKeysLoaded, setApiKeysLoaded] = useState(false);

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

  // Check local AI availability when dialog opens
  useEffect(() => {
    if (open && !localAIChecked) {
      fetch('/api/export/local-ai-status')
        .then(r => r.json())
        .then(status => {
          setLocalAIStatus(status);
          setLocalAIChecked(true);
        })
        .catch(() => {
          setLocalAIStatus(null);
          setLocalAIChecked(true);
        });
    }
    if (!open) {
      setLocalAIChecked(false);
    }
  }, [open, localAIChecked]);

  // Fetch API keys when config section is expanded
  useEffect(() => {
    if (apiConfigExpanded && worldId && !apiKeysLoaded) {
      fetch(`/api/worlds/${worldId}/api-keys`)
        .then(res => res.ok ? res.json() : [])
        .then((keys: { id: string; key: string; name: string }[]) => {
          setApiKeys(keys);
          if (keys.length > 0 && !apiKeyId) {
            setApiKeyId(keys[0].id);
          }
          setApiKeysLoaded(true);
        })
        .catch(() => {
          setApiKeys([]);
          setApiKeysLoaded(true);
        });
    }
  }, [apiConfigExpanded, worldId, apiKeysLoaded, apiKeyId]);

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
      // Save to disk instead of downloading as ZIP (avoids ZIP corruption)
      if (selectedEngine === 'babylon') {
        body.format = 'directory';
      }
      if (selectedEngine === 'unity') {
        body.unityVersion = unityVersion;
      }
      // Pass Insimul API config overrides (server falls back to defaults if empty)
      if (apiServerUrl) {
        body.telemetryServerUrl = apiServerUrl;
      }
      if (apiKeyId) {
        body.telemetryApiKeyId = apiKeyId;
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

      // Check if response is JSON (directory export) or binary (ZIP download)
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        // Directory export — server wrote files to disk
        const json = await response.json();
        if (json.outputDir) {
          setStats({ totalFiles: 0, totalSizeBytes: 0, generationTimeMs: 0 });
          toast({ title: 'Export Complete', description: `Saved to: ${json.outputDir}` });
          setIsDone(true);
        } else {
          throw new Error(json.error || 'Export failed');
        }
        return;
      } else {
        // ZIP download
        const blob = await response.blob();
        const safeName = worldName
          .split(/[^a-zA-Z0-9]+/)
          .filter(Boolean)
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join('') || 'InsimulWorld';
        const engineLabel = selectedEngine.charAt(0).toUpperCase() + selectedEngine.slice(1);
        const modeLabel = selectedEngine === 'babylon' ? (babylonMode === 'electron' ? 'Electron' : 'Web') : '';
        const aiLabel = aiProvider === 'local' ? 'Local' : 'Cloud';
        const filename = `${safeName}${engineLabel}${modeLabel}${aiLabel}.zip`;

        // Validate ZIP magic bytes (PK = 0x50 0x4B)
        const header = new Uint8Array(await blob.slice(0, 2).arrayBuffer());
        const isZip = header[0] === 0x50 && header[1] === 0x4B;

        if (!isZip) {
          const text = await blob.text();
          console.error('[Export] Response is not a ZIP. Content:', text.substring(0, 200));
          try {
            const json = JSON.parse(text);
            if (json.stats) setStats(json.stats);
          } catch { /* ignore */ }
          throw new Error('Server returned data instead of a ZIP file. Please restart the server and try again.');
        }

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

        setStats({ totalFiles: 0, totalSizeBytes: blob.size, generationTimeMs: 0 });
      }

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

          {/* Unity Version Selector */}
          {selectedEngine === 'unity' && !isExporting && !isDone && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Unity Version</label>
              <Select value={unityVersion} onValueChange={setUnityVersion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6000.0.38f1">
                    Unity 6 LTS (6000.0.38f1)
                  </SelectItem>
                  <SelectItem value="2022.3.18f1">
                    Unity 2022.3 LTS (2022.3.18f1)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The exported project will target this Unity editor version.
              </p>
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
                  <SelectItem value="local" disabled={localAIStatus !== null && !localAIStatus.available}>
                    <span className="flex items-center gap-2">
                      <Cpu className="w-4 h-4" />
                      <span>Local (llama.cpp + Piper + Whisper)</span>
                      {localAIStatus === null ? (
                        <span className="text-xs text-muted-foreground ml-1">— Checking...</span>
                      ) : localAIStatus.available ? (
                        <span className="text-xs text-green-600 ml-1">— Ready</span>
                      ) : (
                        <span className="text-xs text-red-500 ml-1">— Models not installed</span>
                      )}
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              {aiProvider === 'local' && localAIStatus?.available && (
                <p className="text-xs text-muted-foreground">
                  Bundling local AI models (~{Math.round((localAIStatus.llm.sizeBytes + localAIStatus.tts.totalSizeBytes + localAIStatus.stt.sizeBytes) / 1024 / 1024 / 1024 * 10) / 10} GB): LLM + {localAIStatus.tts.voiceCount} TTS voices + Whisper STT.
                </p>
              )}
              {localAIStatus !== null && !localAIStatus.available && (
                <div className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 rounded p-2 space-y-1">
                  <p className="font-medium">Local AI models not installed. Run:</p>
                  <code className="block bg-amber-100 dark:bg-amber-900/40 rounded px-2 py-1 font-mono text-[11px]">./scripts/setup-local-ai.sh</code>
                  {localAIStatus.missing.length > 0 && (
                    <ul className="list-disc list-inside text-[11px] opacity-80">
                      {localAIStatus.missing.map((m, i) => <li key={i}>{m}</li>)}
                    </ul>
                  )}
                </div>
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

          {/* Insimul API Configuration (collapsible) */}
          {!isExporting && !isDone && (
            <div className="space-y-2">
              <Separator />
              <button
                type="button"
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full"
                onClick={() => setApiConfigExpanded(!apiConfigExpanded)}
              >
                {apiConfigExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                <Globe className="w-3.5 h-3.5" />
                Insimul API Configuration
                {!apiConfigExpanded && (apiServerUrl || apiKeyId) && (
                  <Badge variant="secondary" className="text-[10px] ml-auto">Configured</Badge>
                )}
              </button>

              {apiConfigExpanded && (
                <div className="space-y-3 pl-1 border-l-2 border-muted ml-1.5">
                  <p className="text-xs text-muted-foreground pl-3">
                    Optional. The exported game's telemetry client will use these settings to report analytics. Leave blank to use the current server.
                  </p>
                  <div className="space-y-1.5 pl-3">
                    <Label htmlFor="api-server-url" className="text-xs">Production API URL</Label>
                    <Input
                      id="api-server-url"
                      value={apiServerUrl}
                      onChange={(e) => setApiServerUrl(e.target.value)}
                      placeholder={window.location.origin}
                      className="h-8 text-sm font-mono"
                    />
                  </div>
                  <div className="space-y-1.5 pl-3">
                    <Label htmlFor="api-key-select" className="text-xs flex items-center gap-1.5">
                      <Key className="w-3 h-3" />
                      API Key
                    </Label>
                    {!apiKeysLoaded ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground py-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Loading API keys...
                      </div>
                    ) : apiKeys.length > 0 ? (
                      <Select value={apiKeyId} onValueChange={setApiKeyId}>
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Select an API key" />
                        </SelectTrigger>
                        <SelectContent>
                          {apiKeys.map(k => (
                            <SelectItem key={k.id} value={k.id}>
                              <span className="flex items-center gap-2">
                                <span>{k.name || 'Unnamed Key'}</span>
                                <span className="text-xs text-muted-foreground font-mono">{k.key.slice(0, 16)}...</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-xs text-muted-foreground py-1">
                        No API keys for this world. Create one in Admin Panel &rarr; API Keys.
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
              disabled={isExporting || (aiProvider === 'local' && localAIStatus !== null && !localAIStatus.available)}
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
