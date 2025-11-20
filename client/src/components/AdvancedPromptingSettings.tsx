import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronUp, Info, Sparkles, Shuffle, Copy, Trash2, Plus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { NEGATIVE_PROMPT_TEMPLATES } from '@shared/style-presets';

export interface AdvancedPromptingParams {
  seed?: number;
  guidanceScale?: number;
  steps?: number;
  loras?: Array<{
    model: string;
    weight: number;
  }>;
}

interface AdvancedPromptingSettingsProps {
  provider: string;
  params: AdvancedPromptingParams;
  onParamsChange: (params: AdvancedPromptingParams) => void;
  negativePrompt: string;
  onNegativePromptChange: (prompt: string) => void;
}

export function AdvancedPromptingSettings({
  provider,
  params,
  onParamsChange,
  negativePrompt,
  onNegativePromptChange
}: AdvancedPromptingSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loraInputs, setLoraInputs] = useState<{ model: string; weight: number }[]>(
    params.loras || []
  );

  const updateParam = <K extends keyof AdvancedPromptingParams>(
    key: K,
    value: AdvancedPromptingParams[K]
  ) => {
    onParamsChange({ ...params, [key]: value });
  };

  const generateRandomSeed = () => {
    const randomSeed = Math.floor(Math.random() * 2147483647);
    updateParam('seed', randomSeed);
  };

  const copySeed = () => {
    if (params.seed !== undefined) {
      navigator.clipboard.writeText(params.seed.toString());
    }
  };

  const clearSeed = () => {
    updateParam('seed', undefined);
  };

  const addNegativeTemplate = (template: string) => {
    const currentPrompts = negativePrompt.split(',').map(s => s.trim()).filter(Boolean);
    const templatePrompts = template.split(',').map(s => s.trim()).filter(Boolean);

    // Merge without duplicates
    const merged = [...new Set([...currentPrompts, ...templatePrompts])];
    onNegativePromptChange(merged.join(', '));
  };

  const addLoraModel = () => {
    const newLora = { model: '', weight: 0.5 };
    const updated = [...loraInputs, newLora];
    setLoraInputs(updated);
    updateParam('loras', updated.filter(l => l.model.trim() !== ''));
  };

  const updateLoraModel = (index: number, field: 'model' | 'weight', value: string | number) => {
    const updated = [...loraInputs];
    updated[index] = { ...updated[index], [field]: value };
    setLoraInputs(updated);
    updateParam('loras', updated.filter(l => l.model.trim() !== ''));
  };

  const removeLoraModel = (index: number) => {
    const updated = loraInputs.filter((_, i) => i !== index);
    setLoraInputs(updated);
    updateParam('loras', updated.filter(l => l.model.trim() !== ''));
  };

  // Provider-specific defaults and limits
  const providerLimits = {
    'stable-diffusion': {
      guidanceScaleMin: 1,
      guidanceScaleMax: 30,
      guidanceScaleDefault: 7.5,
      stepsMin: 20,
      stepsMax: 150,
      stepsDefault: 50,
      supportsLora: true,
      supportsControlNet: true
    },
    'flux': {
      guidanceScaleMin: 1,
      guidanceScaleMax: 20,
      guidanceScaleDefault: 3.5,
      stepsMin: 20,
      stepsMax: 100,
      stepsDefault: 28,
      supportsLora: false,
      supportsControlNet: false
    },
    'dalle': {
      guidanceScaleMin: 0,
      guidanceScaleMax: 0,
      guidanceScaleDefault: 0,
      stepsMin: 0,
      stepsMax: 0,
      stepsDefault: 0,
      supportsLora: false,
      supportsControlNet: false
    },
    'gemini-imagen': {
      guidanceScaleMin: 0,
      guidanceScaleMax: 0,
      guidanceScaleDefault: 0,
      stepsMin: 0,
      stepsMax: 0,
      stepsDefault: 0,
      supportsLora: false,
      supportsControlNet: false
    }
  };

  const limits = providerLimits[provider as keyof typeof providerLimits] || providerLimits['stable-diffusion'];
  const supportsAdvanced = limits.stepsMax > 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Advanced Prompting Settings
          </span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-4">
        <Tabs defaultValue="parameters" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
            <TabsTrigger value="negative">Negative Prompts</TabsTrigger>
          </TabsList>

          <TabsContent value="parameters" className="space-y-4">
            {/* Seed Control */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  Seed Control
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Use the same seed to reproduce exact images</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
                <CardDescription>
                  Set a specific seed for reproducible results
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Random"
                    value={params.seed !== undefined ? params.seed : ''}
                    onChange={(e) => updateParam('seed', e.target.value ? parseInt(e.target.value) : undefined)}
                    min={0}
                    max={2147483647}
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={generateRandomSeed}>
                          <Shuffle className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Generate random seed</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {params.seed !== undefined && (
                    <>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" onClick={copySeed}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy seed</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" onClick={clearSeed}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Clear seed</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {supportsAdvanced && (
              <>
                {/* Guidance Scale */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      Guidance Scale (CFG)
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>Controls how closely the model follows your prompt. Higher = more strict adherence (7-12 recommended)</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                    <CardDescription>
                      Current: {params.guidanceScale || limits.guidanceScaleDefault}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Slider
                      min={limits.guidanceScaleMin}
                      max={limits.guidanceScaleMax}
                      step={0.5}
                      value={[params.guidanceScale || limits.guidanceScaleDefault]}
                      onValueChange={([value]) => updateParam('guidanceScale', value)}
                    />
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>Less strict</span>
                      <span>More strict</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Steps Count */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      Inference Steps
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>Number of denoising steps. More steps = better quality but slower (30-50 recommended)</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                    <CardDescription>
                      Current: {params.steps || limits.stepsDefault}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Slider
                      min={limits.stepsMin}
                      max={limits.stepsMax}
                      step={1}
                      value={[params.steps || limits.stepsDefault]}
                      onValueChange={([value]) => updateParam('steps', value)}
                    />
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>Faster</span>
                      <span>Better quality</span>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* LoRA Models */}
            {limits.supportsLora && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 justify-between">
                    <span className="flex items-center gap-2">
                      LoRA Models
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>Low-Rank Adaptation models for style control (Stable Diffusion only)</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </span>
                    <Badge variant="secondary">Experimental</Badge>
                  </CardTitle>
                  <CardDescription>
                    Add LoRA models for specialized styles
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loraInputs.map((lora, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="LoRA model name or URL"
                          value={lora.model}
                          onChange={(e) => updateLoraModel(index, 'model', e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLoraModel(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Weight: {lora.weight.toFixed(2)}</Label>
                        <Slider
                          min={0}
                          max={1}
                          step={0.05}
                          value={[lora.weight]}
                          onValueChange={([value]) => updateLoraModel(index, 'weight', value)}
                        />
                      </div>
                      <Separator />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addLoraModel}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add LoRA Model
                  </Button>
                </CardContent>
              </Card>
            )}

            {!supportsAdvanced && (
              <Card className="border-dashed">
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <p className="text-sm">Advanced parameters are not supported by {provider}</p>
                  <p className="text-xs mt-1">Try using Stable Diffusion or Flux for more control</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="negative" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Negative Prompt Templates</CardTitle>
                <CardDescription>
                  Quick add common negative prompts to improve quality
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(NEGATIVE_PROMPT_TEMPLATES).map(([key, template]) => (
                    <Button
                      key={key}
                      variant="outline"
                      size="sm"
                      onClick={() => addNegativeTemplate(template)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {key}
                    </Button>
                  ))}
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Current Negative Prompt</Label>
                  <div className="p-3 bg-muted rounded-md text-sm min-h-[60px]">
                    {negativePrompt || <span className="text-muted-foreground">No negative prompts added</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CollapsibleContent>
    </Collapsible>
  );
}
