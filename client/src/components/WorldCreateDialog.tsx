import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Globe, Plus, Sparkles, FileText, TreePine, Users, Map, Building, Anchor, Cpu, Wand2, Clock, ChevronDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertWorldSchema, type InsertWorld } from "@shared/schema";
import { z } from "zod";

const createWorldFormSchema = insertWorldSchema.extend({
  name: z.string().min(1, "World name is required"),
  description: z.string().optional(),
});

type CreateWorldForm = z.infer<typeof createWorldFormSchema>;

export const WORLD_TYPES = [
  { value: 'medieval-fantasy', label: 'Medieval Fantasy', description: 'Knights, castles, magic, and dragons' },
  { value: 'high-fantasy', label: 'High Fantasy', description: 'Epic quests, multiple races, powerful magic' },
  { value: 'low-fantasy', label: 'Low Fantasy', description: 'Realistic with subtle magical elements' },
  { value: 'dark-fantasy', label: 'Dark Fantasy', description: 'Gothic horror with supernatural elements' },
  { value: 'urban-fantasy', label: 'Urban Fantasy', description: 'Modern city with hidden magical world' },
  { value: 'sci-fi-space', label: 'Space Opera', description: 'Interstellar travel, alien civilizations, galactic empires' },
  { value: 'cyberpunk', label: 'Cyberpunk', description: 'High tech, low life, corporate dystopia' },
  { value: 'post-apocalyptic', label: 'Post-Apocalyptic', description: 'Survival in a devastated world' },
  { value: 'steampunk', label: 'Steampunk', description: 'Victorian era with advanced steam technology' },
  { value: 'dieselpunk', label: 'Dieselpunk', description: '1920s-1950s aesthetic with advanced diesel tech' },
  { value: 'historical-ancient', label: 'Ancient Civilizations', description: 'Rome, Greece, Egypt, or other ancient cultures' },
  { value: 'historical-medieval', label: 'Historical Medieval', description: 'Realistic medieval Europe or Asia' },
  { value: 'historical-renaissance', label: 'Renaissance', description: 'Art, science, and political intrigue' },
  { value: 'historical-victorian', label: 'Victorian Era', description: 'Industrial revolution, colonialism, social change' },
  { value: 'wild-west', label: 'Wild West', description: 'Cowboys, outlaws, frontier towns' },
  { value: 'modern-realistic', label: 'Modern Realistic', description: 'Contemporary world with real-world issues' },
  { value: 'superhero', label: 'Superhero', description: 'Powered individuals protecting society' },
  { value: 'horror', label: 'Horror', description: 'Supernatural terrors and psychological dread' },
  { value: 'mythological', label: 'Mythological', description: 'Gods, myths, and legendary creatures' },
  { value: 'solarpunk', label: 'Solarpunk', description: 'Optimistic future with sustainable technology' },
];

export const GAME_TYPES = [
  { value: 'rpg', label: 'RPG', description: 'Character progression, quests, and story-driven gameplay' },
  { value: 'action', label: 'Action', description: 'Fast-paced combat and reflexes' },
  { value: 'fighting', label: 'Fighting', description: 'One-on-one combat with various characters' },
  { value: 'platformer', label: 'Platformer', description: 'Jumping and navigating through levels' },
  { value: 'strategy', label: 'Strategy', description: 'Tactical decision-making and resource management' },
  { value: 'survival', label: 'Survival', description: 'Resource gathering, crafting, and staying alive' },
  { value: 'shooter', label: 'Shooter', description: 'Ranged combat and precision aiming' },
  { value: 'sandbox', label: 'Sandbox', description: 'Open-world exploration and creativity' },
  { value: 'city-building', label: 'City-Building', description: 'Urban planning and infrastructure management' },
  { value: 'simulation', label: 'Simulation', description: 'Realistic systems and life simulation' },
  { value: 'puzzle', label: 'Puzzle', description: 'Logic and problem-solving challenges' },
  { value: 'language-learning', label: 'Language Learning', description: 'Vocabulary, grammar, and cultural immersion for any language' },
  { value: 'educational', label: 'Educational', description: 'Learning through interactive experiences' },
  { value: 'adventure', label: 'Adventure', description: 'Exploration and narrative-focused gameplay' },
  { value: 'roguelike', label: 'Roguelike', description: 'Procedural generation with permadeath' },
];

export const LANGUAGES = [
  'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Dutch', 'Russian', 'Polish',
  'Chinese (Mandarin)', 'Japanese', 'Korean', 'Arabic', 'Hebrew', 'Hindi', 'Bengali',
  'Turkish', 'Greek', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Czech', 'Hungarian',
  'Romanian', 'Thai', 'Vietnamese', 'Indonesian', 'Swahili'
];

// --- Per-Country Configuration ---

interface CountryConfig {
  terrain: 'plains' | 'hills' | 'mountains' | 'coast' | 'river' | 'forest' | 'desert';
  foundedYear: number;
  generateStates: boolean;
  numStatesPerCountry: number;
  numCitiesPerState: number;
  numTownsPerState: number;
  numVillagesPerState: number;
  numFoundingFamilies: number;
  generations: number;
  marriageRate: number;
  fertilityRate: number;
  deathRate: number;
}

const DEFAULT_COUNTRY_CONFIG: CountryConfig = {
  terrain: 'plains',
  foundedYear: 1850,
  generateStates: true,
  numStatesPerCountry: 1,
  numCitiesPerState: 0,
  numTownsPerState: 1,
  numVillagesPerState: 0,
  numFoundingFamilies: 10,
  generations: 4,
  marriageRate: 0.7,
  fertilityRate: 0.6,
  deathRate: 0.3,
};

const COUNTRY_PRESETS: Record<string, { label: string; icon: React.ReactNode; config: CountryConfig }> = {
  medieval: {
    label: 'Medieval',
    icon: <TreePine className="w-4 h-4 mr-1" />,
    config: {
      terrain: 'plains',
      foundedYear: 1200,
      generateStates: true,
      numStatesPerCountry: 1,
      numCitiesPerState: 0,
      numTownsPerState: 0,
      numVillagesPerState: 1,
      numFoundingFamilies: 8,
      generations: 5,
      marriageRate: 0.8,
      fertilityRate: 0.7,
      deathRate: 0.4,
    },
  },
  colonial: {
    label: 'Colonial',
    icon: <Anchor className="w-4 h-4 mr-1" />,
    config: {
      terrain: 'coast',
      foundedYear: 1650,
      generateStates: true,
      numStatesPerCountry: 1,
      numCitiesPerState: 0,
      numTownsPerState: 1,
      numVillagesPerState: 0,
      numFoundingFamilies: 12,
      generations: 4,
      marriageRate: 0.75,
      fertilityRate: 0.65,
      deathRate: 0.35,
    },
  },
  modern: {
    label: 'Modern',
    icon: <Building className="w-4 h-4 mr-1" />,
    config: {
      terrain: 'plains',
      foundedYear: 1950,
      generateStates: true,
      numStatesPerCountry: 2,
      numCitiesPerState: 1,
      numTownsPerState: 1,
      numVillagesPerState: 1,
      numFoundingFamilies: 20,
      generations: 3,
      marriageRate: 0.6,
      fertilityRate: 0.5,
      deathRate: 0.2,
    },
  },
  fantasy: {
    label: 'Fantasy',
    icon: <Wand2 className="w-4 h-4 mr-1" />,
    config: {
      terrain: 'forest',
      foundedYear: 1000,
      generateStates: true,
      numStatesPerCountry: 1,
      numCitiesPerState: 0,
      numTownsPerState: 1,
      numVillagesPerState: 1,
      numFoundingFamilies: 15,
      generations: 6,
      marriageRate: 0.7,
      fertilityRate: 0.6,
      deathRate: 0.3,
    },
  },
};

// --- Country Config Panel ---

function CountryConfigPanel({
  config,
  index,
  onChange,
}: {
  config: CountryConfig;
  index: number;
  onChange: (updated: CountryConfig) => void;
}) {
  const update = (partial: Partial<CountryConfig>) => onChange({ ...config, ...partial });

  return (
    <div className="space-y-4">
      {/* Presets */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(COUNTRY_PRESETS).map(([key, preset]) => (
          <Button
            key={key}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange({ ...preset.config })}
          >
            {preset.icon}
            {preset.label}
          </Button>
        ))}
      </div>

      {/* Terrain + Founded Year */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs">Terrain</Label>
          <Select value={config.terrain} onValueChange={(v: any) => update({ terrain: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="plains">Plains</SelectItem>
              <SelectItem value="hills">Hills</SelectItem>
              <SelectItem value="mountains">Mountains</SelectItem>
              <SelectItem value="coast">Coast</SelectItem>
              <SelectItem value="river">River</SelectItem>
              <SelectItem value="forest">Forest</SelectItem>
              <SelectItem value="desert">Desert</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Founded Year</Label>
          <Input
            type="number"
            value={config.foundedYear}
            onChange={(e) => update({ foundedYear: parseInt(e.target.value) || 1850 })}
          />
        </div>
      </div>

      {/* States + Settlement Counts */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`gen-states-${index}`}
            checked={config.generateStates}
            onCheckedChange={(checked) => update({ generateStates: checked as boolean })}
          />
          <Label htmlFor={`gen-states-${index}`} className="cursor-pointer text-sm">
            Generate states / provinces
          </Label>
        </div>

        {config.generateStates && (
          <div className="space-y-3 pl-4 border-l-2 border-muted">
            <div className="space-y-2">
              <Label className="text-xs">States per country: {config.numStatesPerCountry}</Label>
              <Slider
                value={[config.numStatesPerCountry]}
                onValueChange={([v]) => update({ numStatesPerCountry: v })}
                min={1}
                max={5}
                step={1}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Cities: {config.numCitiesPerState}</Label>
                <Slider
                  value={[config.numCitiesPerState]}
                  onValueChange={([v]) => update({ numCitiesPerState: v })}
                  min={0}
                  max={3}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Towns: {config.numTownsPerState}</Label>
                <Slider
                  value={[config.numTownsPerState]}
                  onValueChange={([v]) => update({ numTownsPerState: v })}
                  min={0}
                  max={5}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Villages: {config.numVillagesPerState}</Label>
                <Slider
                  value={[config.numVillagesPerState]}
                  onValueChange={([v]) => update({ numVillagesPerState: v })}
                  min={0}
                  max={10}
                  step={1}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Population Settings */}
      <div className="space-y-3 pt-2 border-t">
        <Label className="text-xs font-medium flex items-center gap-1">
          <Users className="w-3 h-3" />
          Population
        </Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs">Founding Families: {config.numFoundingFamilies}</Label>
            <Slider
              value={[config.numFoundingFamilies]}
              onValueChange={([v]) => update({ numFoundingFamilies: v })}
              min={2}
              max={30}
              step={1}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Generations: {config.generations}</Label>
            <Slider
              value={[config.generations]}
              onValueChange={([v]) => update({ generations: v })}
              min={1}
              max={10}
              step={1}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-xs">Marriage: {(config.marriageRate * 100).toFixed(0)}%</Label>
            <Slider
              value={[config.marriageRate * 100]}
              onValueChange={([v]) => update({ marriageRate: v / 100 })}
              min={20}
              max={100}
              step={5}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Fertility: {(config.fertilityRate * 100).toFixed(0)}%</Label>
            <Slider
              value={[config.fertilityRate * 100]}
              onValueChange={([v]) => update({ fertilityRate: v / 100 })}
              min={20}
              max={100}
              step={5}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Death: {(config.deathRate * 100).toFixed(0)}%</Label>
            <Slider
              value={[config.deathRate * 100]}
              onValueChange={([v]) => update({ deathRate: v / 100 })}
              min={10}
              max={80}
              step={5}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Dialog ---

interface WorldCreateDialogProps {
  onCreateWorld: (data: InsertWorld, generateContent?: boolean, worldType?: string, customPrompt?: string, gameType?: string, customLabel?: string, generateWorldMap?: boolean) => void;
  isLoading?: boolean;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function WorldCreateDialog({ onCreateWorld, isLoading = false, children, open: controlledOpen, onOpenChange }: WorldCreateDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [creationMode, setCreationMode] = useState<'blank' | 'procedural'>('blank');
  const [inputMode, setInputMode] = useState<'preset' | 'custom'>('preset');
  const [selectedWorldType, setSelectedWorldType] = useState(WORLD_TYPES[0].value);
  const [selectedGameType, setSelectedGameType] = useState<string | undefined>(undefined);
  const [worldLanguages, setWorldLanguages] = useState<string[]>([]);
  const [learningTargetLanguage, setLearningTargetLanguage] = useState<string | undefined>(undefined);
  const [customPrompt, setCustomPrompt] = useState('');
  const [customLabel, setCustomLabel] = useState('');

  // Time configuration
  const [timestepUnit, setTimestepUnit] = useState('year');
  const [gameplayTimestepUnit, setGameplayTimestepUnit] = useState('day');
  const [historyStartYear, setHistoryStartYear] = useState('');
  const [historyEndYear, setHistoryEndYear] = useState('');
  const [timeConfigOpen, setTimeConfigOpen] = useState(false);

  // Generation options (world-level)
  const [generateGeography, setGenerateGeography] = useState(true);
  const [generateGenealogy, setGenerateGenealogy] = useState(true);
  const [generateWorldMap, setGenerateWorldMap] = useState(true);

  // Per-country configs
  const [numCountries, setNumCountries] = useState(1);
  const [countryConfigs, setCountryConfigs] = useState<CountryConfig[]>([{ ...DEFAULT_COUNTRY_CONFIG }]);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const form = useForm<CreateWorldForm>({
    resolver: zodResolver(createWorldFormSchema),
    defaultValues: {
      name: "",
      description: "",
      config: {},
      generationConfig: {},
    },
  });

  // Sync countryConfigs array length with numCountries
  const handleNumCountriesChange = (count: number) => {
    setNumCountries(count);
    setCountryConfigs((prev) => {
      if (count > prev.length) {
        return [...prev, ...Array(count - prev.length).fill(null).map(() => ({ ...DEFAULT_COUNTRY_CONFIG }))];
      }
      return prev.slice(0, count);
    });
  };

  const updateCountryConfig = (index: number, updated: CountryConfig) => {
    setCountryConfigs((prev) => {
      const next = [...prev];
      next[index] = updated;
      return next;
    });
  };

  // Validation: language-learning worlds must have a learning target language
  const missingLearningTarget = selectedGameType === 'language-learning' && !learningTargetLanguage;

  const handleSubmit = (data: CreateWorldForm) => {
    if (missingLearningTarget) return;

    const generateContent = creationMode === 'procedural';
    const worldType = inputMode === 'preset' ? selectedWorldType : undefined;
    const prompt = inputMode === 'custom' ? customPrompt : undefined;
    const label = inputMode === 'custom' ? customLabel : undefined;

    // For blank worlds with custom description, store it as description
    if (creationMode === 'blank' && inputMode === 'custom' && customPrompt && !data.description) {
      data.description = customPrompt;
    }

    // For procedural worlds with custom description, store as description too
    if (creationMode === 'procedural' && inputMode === 'custom' && customPrompt) {
      data.description = customPrompt;
    }

    // Add target language for language-learning worlds (deprecated field, kept for backward compat)
    if (selectedGameType === 'language-learning' && learningTargetLanguage) {
      data.targetLanguage = learningTargetLanguage;
    }

    // Add procedural generation config
    if (generateContent) {
      data.generationConfig = {
        generateGeography,
        generateGenealogy,
        generateWorldMap,
        gameType: selectedGameType,
        countries: countryConfigs,
        // World languages to create as WorldLanguage records
        worldLanguages: worldLanguages.length > 0 ? worldLanguages : undefined,
        // For language-learning worlds, specify which language is the learning target
        learningTargetLanguage: selectedGameType === 'language-learning' ? learningTargetLanguage : undefined,
      };
    }

    // Time configuration
    data.timestepUnit = timestepUnit;
    data.gameplayTimestepUnit = gameplayTimestepUnit;
    if (historyStartYear) data.historyStartYear = parseInt(historyStartYear, 10);
    if (historyEndYear) data.historyEndYear = parseInt(historyEndYear, 10);

    onCreateWorld(data, generateContent, worldType, prompt, selectedGameType, label, generateWorldMap);
    setOpen(false);
    form.reset();
    // Reset all state
    setCreationMode('blank');
    setInputMode('preset');
    setSelectedWorldType(WORLD_TYPES[0].value);
    setSelectedGameType(undefined);
    setWorldLanguages([]);
    setLearningTargetLanguage(undefined);
    setCustomPrompt('');
    setCustomLabel('');
    setGenerateGeography(true);
    setGenerateGenealogy(true);
    setGenerateWorldMap(true);
    setNumCountries(1);
    setCountryConfigs([{ ...DEFAULT_COUNTRY_CONFIG }]);
    setTimestepUnit('year');
    setGameplayTimestepUnit('day');
    setHistoryStartYear('');
    setHistoryEndYear('');
    setTimeConfigOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          {children || (
            <Button size="sm" data-testid="button-create-world" className="shrink-0">
              <Plus className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Create World</span>
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Create New World
          </DialogTitle>
          <DialogDescription>
            Create a new world to contain your narratives, characters, and simulations.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Creation Mode */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Creation Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={creationMode} onValueChange={(v) => setCreationMode(v as any)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="blank" id="blank" />
                  <Label htmlFor="blank" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <div>
                        <div className="font-medium">Blank World</div>
                        <div className="text-sm text-muted-foreground">Start with an empty world and add content manually</div>
                      </div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 mt-3">
                  <RadioGroupItem value="procedural" id="procedural" />
                  <Label htmlFor="procedural" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <div>
                        <div className="font-medium">Procedurally Generated</div>
                        <div className="text-sm text-muted-foreground">Auto-generate societies, rules, actions, quests, and grammars</div>
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* World Name */}
          <div className="space-y-2">
            <Label htmlFor="name">World Name *</Label>
            <Input
              id="name"
              {...form.register("name")}
              data-testid="input-world-name"
              placeholder="e.g., Medieval Kingdom, Futuristic Colony"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
            )}
          </div>

          {/* World Theme (merged with Description) */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">World Theme</CardTitle>
              <CardDescription>
                {creationMode === 'procedural'
                  ? 'Choose a preset genre or describe your world — this guides AI content generation'
                  : 'Describe your world\'s setting, theme, and key characteristics'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as any)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preset">Preset World Types</TabsTrigger>
                  <TabsTrigger value="custom">Custom Description</TabsTrigger>
                </TabsList>

                <TabsContent value="preset" className="space-y-2">
                  <Label>World Type</Label>
                  <Select value={selectedWorldType} onValueChange={setSelectedWorldType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {WORLD_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-muted-foreground">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TabsContent>

                <TabsContent value="custom" className="space-y-3">
                  {creationMode === 'procedural' && (
                    <div className="space-y-2">
                      <Label>Custom World Type Label</Label>
                      <Input
                        value={customLabel}
                        onChange={(e) => setCustomLabel(e.target.value)}
                        placeholder="e.g., Maritime Pirate World, Steampunk Western"
                      />
                      <p className="text-xs text-muted-foreground">
                        A short label for your custom world type (used for grammar generation)
                      </p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>{creationMode === 'procedural' ? 'Custom World Description' : 'Description'}</Label>
                    <Textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder={creationMode === 'procedural'
                        ? "Describe the type of world you want to generate. For example: 'A maritime world where pirate guilds control trade routes and sea monsters are real...'"
                        : "Describe your world's setting, theme, and key characteristics..."
                      }
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      {creationMode === 'procedural'
                        ? 'Detailed description guiding AI generation of names, cultures, and content'
                        : 'This description will be stored with your world'}
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Game Type */}
          {creationMode === 'procedural' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Game Type (Optional)</CardTitle>
                <CardDescription>Select the type of game or simulation this world is designed for</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Label>Game Type</Label>
                <Select value={selectedGameType} onValueChange={setSelectedGameType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a game type (optional)" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {GAME_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedGameType === 'language-learning' && (
                  <div className="mt-3">
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm text-muted-foreground">
                        Language Learning worlds feature immersive vocabulary and grammar practice. Set the learning target language in the <strong>World Languages</strong> section below.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* World Languages (optional, all game types) */}
          {creationMode === 'procedural' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  World Languages
                </CardTitle>
                <CardDescription>
                  Languages spoken in this world. NPCs will use these in dialogue.
                  {selectedGameType === 'language-learning' && ' Mark one language as the learning target.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Select
                      value=""
                      onValueChange={(lang) => {
                        if (lang && !worldLanguages.includes(lang)) {
                          const updated = [...worldLanguages, lang];
                          setWorldLanguages(updated);
                          // Auto-select first language as learning target for language-learning worlds
                          if (selectedGameType === 'language-learning' && !learningTargetLanguage) {
                            setLearningTargetLanguage(lang);
                          }
                        }
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Add a language..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {LANGUAGES.filter(l => !worldLanguages.includes(l)).map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {lang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {worldLanguages.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {worldLanguages.map((lang) => (
                        <span
                          key={lang}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm ${
                            selectedGameType === 'language-learning' && learningTargetLanguage === lang
                              ? 'bg-primary/20 border border-primary'
                              : 'bg-muted'
                          }`}
                        >
                          {selectedGameType === 'language-learning' && (
                            <button
                              type="button"
                              className="mr-1 text-xs"
                              title="Set as learning target"
                              onClick={() => setLearningTargetLanguage(lang)}
                            >
                              {learningTargetLanguage === lang ? '🎯' : '○'}
                            </button>
                          )}
                          {lang}
                          {selectedGameType === 'language-learning' && learningTargetLanguage === lang && (
                            <span className="text-xs text-primary ml-1">(target)</span>
                          )}
                          <button
                            type="button"
                            className="ml-1 text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              const updated = worldLanguages.filter(l => l !== lang);
                              setWorldLanguages(updated);
                              // If removing the learning target, auto-select the next one
                              if (learningTargetLanguage === lang) {
                                setLearningTargetLanguage(updated[0] || undefined);
                              }
                            }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  {worldLanguages.length === 0 && (
                    <p className={`text-xs ${missingLearningTarget ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                      {selectedGameType === 'language-learning'
                        ? 'Add at least one language and mark it as the learning target.'
                        : 'No world languages selected. NPCs will speak English by default.'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Procedural: Country Count + Country Configs + Generation Options */}
          {creationMode === 'procedural' && (
            <div className="space-y-4">
              {/* Country Count */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Political Geography
                  </CardTitle>
                  <CardDescription>How many countries to generate</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label>Countries: {numCountries}</Label>
                    <Slider
                      value={[numCountries]}
                      onValueChange={([v]) => handleNumCountriesChange(v)}
                      min={1}
                      max={5}
                      step={1}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Per-Country Configuration Accordion */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Map className="w-4 h-4" />
                    Country Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure terrain, settlements, and population for each country
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion
                    type="multiple"
                    defaultValue={['country-0']}
                  >
                    {countryConfigs.map((config, i) => (
                      <AccordionItem key={i} value={`country-${i}`}>
                        <AccordionTrigger className="text-sm py-3">
                          Country {i + 1}
                          <span className="text-xs text-muted-foreground ml-2 font-normal">
                            {config.terrain} &middot; {config.foundedYear} &middot;{' '}
                            {(config.generateStates ? config.numStatesPerCountry : 0)} state(s) &middot;{' '}
                            {config.numCitiesPerState}C/{config.numTownsPerState}T/{config.numVillagesPerState}V per state
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <CountryConfigPanel
                            config={config}
                            index={i}
                            onChange={(updated) => updateCountryConfig(i, updated)}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>

              {/* Generation Options */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Generation Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="gen-geography"
                      checked={generateGeography}
                      onCheckedChange={(checked) => setGenerateGeography(checked as boolean)}
                    />
                    <Label htmlFor="gen-geography" className="cursor-pointer text-sm">
                      Generate geography (districts, lots, buildings)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="gen-genealogy"
                      checked={generateGenealogy}
                      onCheckedChange={(checked) => setGenerateGenealogy(checked as boolean)}
                    />
                    <Label htmlFor="gen-genealogy" className="cursor-pointer text-sm">
                      Generate genealogy (families, characters, relationships)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="gen-worldmap"
                      checked={generateWorldMap}
                      onCheckedChange={(checked) => setGenerateWorldMap(checked as boolean)}
                    />
                    <Label htmlFor="gen-worldmap" className="cursor-pointer text-sm flex items-center gap-1">
                      <Map className="w-3 h-3" />
                      Generate world map (AI-generated overview map)
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Time Configuration (collapsible) */}
          <Collapsible open={timeConfigOpen} onOpenChange={setTimeConfigOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-6 py-3 text-left hover:bg-white/5 transition-colors rounded-t-lg"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Time Configuration</span>
                    <span className="text-xs text-muted-foreground">(optional)</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${timeConfigOpen ? 'rotate-180' : ''}`} />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4 pt-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="create-timestep-unit" className="text-xs">History Timestep</Label>
                      <Select value={timestepUnit} onValueChange={setTimestepUnit}>
                        <SelectTrigger id="create-timestep-unit">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="year">Year</SelectItem>
                          <SelectItem value="day">Day</SelectItem>
                          <SelectItem value="hour">Hour</SelectItem>
                          <SelectItem value="minute">Minute</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="create-gameplay-timestep" className="text-xs">Gameplay Timestep</Label>
                      <Select value={gameplayTimestepUnit} onValueChange={setGameplayTimestepUnit}>
                        <SelectTrigger id="create-gameplay-timestep">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="year">Year</SelectItem>
                          <SelectItem value="day">Day</SelectItem>
                          <SelectItem value="hour">Hour</SelectItem>
                          <SelectItem value="minute">Minute</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="create-history-start" className="text-xs">History Start Year</Label>
                      <Input
                        id="create-history-start"
                        type="number"
                        placeholder="e.g., 1839"
                        value={historyStartYear}
                        onChange={(e) => setHistoryStartYear(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="create-history-end" className="text-xs">History End Year</Label>
                      <Input
                        id="create-history-end"
                        type="number"
                        placeholder="e.g., 1979"
                        value={historyEndYear}
                        onChange={(e) => setHistoryEndYear(e.target.value)}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Historical simulation runs from start to end year at the history timestep. Gameplay begins after the end year at the gameplay timestep.
                  </p>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              data-testid="button-cancel-world"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || missingLearningTarget}
              data-testid="button-submit-world"
            >
              {isLoading ? "Creating..." : "Create World"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
