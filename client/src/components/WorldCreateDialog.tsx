import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Globe, Plus, Sparkles, FileText, Map, Cpu, ChevronDown, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertWorldSchema, type InsertWorld } from "@shared/schema";
import { z } from "zod";
import { getDefaultModulesForGenre } from "@shared/feature-modules/genre-bundles";

const createWorldFormSchema = insertWorldSchema.extend({
  name: z.string().min(1, "World name is required"),
  description: z.string().optional(),
});

type CreateWorldForm = z.infer<typeof createWorldFormSchema>;

export const WORLD_TYPES = [
  { value: 'historical-ancient', label: 'Ancient Civilizations', description: 'Rome, Greece, Egypt, or other ancient cultures' },
  { value: 'creole-colonial', label: 'Creole Colonial', description: 'New Orleans French Quarter — ironwork balconies, stucco facades, live oaks' },
  { value: 'cyberpunk', label: 'Cyberpunk', description: 'High tech, low life, corporate dystopia' },
  { value: 'dark-fantasy', label: 'Dark Fantasy', description: 'Gothic horror with supernatural elements' },
  { value: 'dieselpunk', label: 'Dieselpunk', description: '1920s-1950s aesthetic with advanced diesel tech' },
  { value: 'high-fantasy', label: 'High Fantasy', description: 'Epic quests, multiple races, powerful magic' },
  { value: 'historical-medieval', label: 'Historical Medieval', description: 'Realistic medieval Europe or Asia' },
  { value: 'horror', label: 'Horror', description: 'Supernatural terrors and psychological dread' },
  { value: 'low-fantasy', label: 'Low Fantasy', description: 'Realistic with subtle magical elements' },
  { value: 'medieval-fantasy', label: 'Medieval Fantasy', description: 'Knights, castles, magic, and dragons' },
  { value: 'modern-realistic', label: 'Modern Realistic', description: 'Contemporary world with real-world issues' },
  { value: 'mythological', label: 'Mythological', description: 'Gods, myths, and legendary creatures' },
  { value: 'post-apocalyptic', label: 'Post-Apocalyptic', description: 'Survival in a devastated world' },
  { value: 'historical-renaissance', label: 'Renaissance', description: 'Art, science, and political intrigue' },
  { value: 'solarpunk', label: 'Solarpunk', description: 'Optimistic future with sustainable technology' },
  { value: 'sci-fi-space', label: 'Space Opera', description: 'Interstellar travel, alien civilizations, galactic empires' },
  { value: 'steampunk', label: 'Steampunk', description: 'Victorian era with advanced steam technology' },
  { value: 'superhero', label: 'Superhero', description: 'Powered individuals protecting society' },
  { value: 'tropical-pirate', label: 'Tropical Pirate', description: 'Caribbean port towns, treasure hunts, and sea adventures' },
  { value: 'urban-fantasy', label: 'Urban Fantasy', description: 'Modern city with hidden magical world' },
  { value: 'historical-victorian', label: 'Victorian Era', description: 'Industrial revolution, colonialism, social change' },
  { value: 'wild-west', label: 'Wild West', description: 'Cowboys, outlaws, frontier towns' },
];

export const GAME_TYPES = [
  { value: 'action', label: 'Action', description: 'Fast-paced combat and reflexes' },
  { value: 'adventure', label: 'Adventure', description: 'Exploration and narrative-focused gameplay' },
  { value: 'city-building', label: 'City-Building', description: 'Urban planning and infrastructure management' },
  { value: 'educational', label: 'Educational', description: 'Learning through interactive experiences' },
  { value: 'fighting', label: 'Fighting', description: 'One-on-one combat with various characters' },
  { value: 'language-learning', label: 'Language Learning', description: 'Vocabulary, grammar, and cultural immersion for any language' },
  { value: 'platformer', label: 'Platformer', description: 'Jumping and navigating through levels' },
  { value: 'puzzle', label: 'Puzzle', description: 'Logic and problem-solving challenges' },
  { value: 'roguelike', label: 'Roguelike', description: 'Procedural generation with permadeath' },
  { value: 'rpg', label: 'RPG', description: 'Character progression, quests, and story-driven gameplay' },
  { value: 'sandbox', label: 'Sandbox', description: 'Open-world exploration and creativity' },
  { value: 'shooter', label: 'Shooter', description: 'Ranged combat and precision aiming' },
  { value: 'simulation', label: 'Simulation', description: 'Realistic systems and life simulation' },
  { value: 'strategy', label: 'Strategy', description: 'Tactical decision-making and resource management' },
  { value: 'survival', label: 'Survival', description: 'Resource gathering, crafting, and staying alive' },
];

export const LANGUAGES = [
  'Arabic', 'Bengali', 'Chinese (Mandarin)', 'Czech', 'Danish', 'Dutch', 'Finnish', 'French',
  'German', 'Greek', 'Hebrew', 'Hindi', 'Hungarian', 'Indonesian', 'Italian', 'Japanese',
  'Korean', 'Norwegian', 'Polish', 'Portuguese', 'Romanian', 'Russian', 'Spanish', 'Swahili',
  'Swedish', 'Thai', 'Turkish', 'Vietnamese'
];

// --- Per-Country Configuration ---

type SettlementType = 'hamlet' | 'village' | 'town' | 'city';

const POPULATION_BY_TYPE: Record<SettlementType, number> = {
  hamlet: 50,
  village: 100,
  town: 1000,
  city: 5000,
};

const BASE_FAMILIES: Record<SettlementType, number> = {
  hamlet: 3,
  village: 5,
  town: 15,
  city: 50,
};

const YEARS_PER_GENERATION = 25;

function computeGenealogy(type: SettlementType, foundedYear: number): { foundingFamilies: number; generations: number } {
  const currentYear = new Date().getFullYear();
  const yearsOld = Math.max(0, currentYear - foundedYear);
  const generations = Math.max(1, Math.min(6, Math.floor(yearsOld / YEARS_PER_GENERATION)));
  const baseFamilies = BASE_FAMILIES[type];
  const generationScale = Math.max(0.5, 2.0 - (generations - 1) * 0.3);
  const foundingFamilies = Math.max(2, Math.min(60, Math.round(baseFamilies * generationScale)));
  return { foundingFamilies, generations };
}

interface CountryConfig {
  terrain: 'plains' | 'hills' | 'mountains' | 'coast' | 'river' | 'forest' | 'desert';
  foundedYear: number;
  numHamlets: number;
  numVillages: number;
  numTowns: number;
  numCities: number;
}

const DEFAULT_COUNTRY_CONFIG: CountryConfig = {
  terrain: 'plains',
  foundedYear: 1850,
  numHamlets: 0,
  numVillages: 0,
  numTowns: 1,
  numCities: 0,
};

// --- Country Config Panel ---

function CountryConfigPanel({
  config,
  onChange,
  onRemove,
  canRemove,
}: {
  config: CountryConfig;
  onChange: (updated: CountryConfig) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const update = (partial: Partial<CountryConfig>) => onChange({ ...config, ...partial });

  // Show a summary of computed population
  const totalSettlements = config.numHamlets + config.numVillages + config.numTowns + config.numCities;
  const estimatedPop =
    config.numHamlets * POPULATION_BY_TYPE.hamlet +
    config.numVillages * POPULATION_BY_TYPE.village +
    config.numTowns * POPULATION_BY_TYPE.town +
    config.numCities * POPULATION_BY_TYPE.city;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-2 gap-4 flex-1">
          <div className="space-y-2">
            <Label className="text-xs">Terrain</Label>
            <Select value={config.terrain} onValueChange={(v: any) => update({ terrain: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="coast">Coast</SelectItem>
                <SelectItem value="desert">Desert</SelectItem>
                <SelectItem value="forest">Forest</SelectItem>
                <SelectItem value="hills">Hills</SelectItem>
                <SelectItem value="mountains">Mountains</SelectItem>
                <SelectItem value="plains">Plains</SelectItem>
                <SelectItem value="river">River</SelectItem>
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
        {canRemove && (
          <Button type="button" variant="ghost" size="icon" className="ml-2 mt-5 text-muted-foreground hover:text-destructive" onClick={onRemove}>
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Settlement Counts */}
      <div className="space-y-3">
        <Label className="text-xs font-medium">Settlements</Label>
        <div className="grid grid-cols-4 gap-3">
          <div className="space-y-2">
            <Label className="text-xs">Hamlets: {config.numHamlets}</Label>
            <Slider
              value={[config.numHamlets]}
              onValueChange={([v]) => update({ numHamlets: v })}
              min={0}
              max={10}
              step={1}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Villages: {config.numVillages}</Label>
            <Slider
              value={[config.numVillages]}
              onValueChange={([v]) => update({ numVillages: v })}
              min={0}
              max={10}
              step={1}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Towns: {config.numTowns}</Label>
            <Slider
              value={[config.numTowns]}
              onValueChange={([v]) => update({ numTowns: v })}
              min={0}
              max={5}
              step={1}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Cities: {config.numCities}</Label>
            <Slider
              value={[config.numCities]}
              onValueChange={([v]) => update({ numCities: v })}
              min={0}
              max={3}
              step={1}
            />
          </div>
        </div>
        {totalSettlements > 0 && (
          <p className="text-xs text-muted-foreground">
            {totalSettlements} settlement{totalSettlements !== 1 ? 's' : ''} — ~{estimatedPop.toLocaleString()} estimated population
          </p>
        )}
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
  const [selectedWorldType, setSelectedWorldType] = useState(WORLD_TYPES[0].value);
  const [selectedGameType, setSelectedGameType] = useState<string | undefined>(undefined);
  const [enabledModules, setEnabledModules] = useState<string[]>([]);
  const [showModulePicker, setShowModulePicker] = useState(false);
  const [worldLanguages, setWorldLanguages] = useState<string[]>([]);
  const [learningTargetLanguage, setLearningTargetLanguage] = useState<string | undefined>(undefined);
  const [customPrompt, setCustomPrompt] = useState('');
  const [customLabel, setCustomLabel] = useState('');

  // Generation options (world-level)
  const [worldScale, setWorldScale] = useState<'compact' | 'standard' | 'expansive'>('standard');

  // Per-country configs
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

  const addCountry = () => {
    setCountryConfigs((prev) => [...prev, { ...DEFAULT_COUNTRY_CONFIG }]);
  };

  const removeCountry = (index: number) => {
    setCountryConfigs((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCountryConfig = (index: number, updated: CountryConfig) => {
    setCountryConfigs((prev) => {
      const next = [...prev];
      next[index] = updated;
      return next;
    });
  };

  // Auto-populate modules when game type changes
  const handleGameTypeChange = (gameType: string) => {
    setSelectedGameType(gameType);
    const defaults = getDefaultModulesForGenre(gameType);
    setEnabledModules(defaults);
  };

  const toggleModule = (moduleId: string) => {
    setEnabledModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(m => m !== moduleId)
        : [...prev, moduleId]
    );
  };

  // Validation: language-learning worlds must have a learning target language
  const missingLearningTarget = selectedGameType === 'language-learning' && !learningTargetLanguage;

  const handleSubmit = (data: CreateWorldForm) => {
    if (missingLearningTarget) return;

    const generateContent = creationMode === 'procedural';
    const worldType = selectedWorldType;
    const prompt = customPrompt || undefined;
    const label = customLabel || undefined;

    // Store custom description as world description
    if (customPrompt && !data.description) {
      data.description = customPrompt;
    }

    // Add target language for language-learning worlds (deprecated field, kept for backward compat)
    if (selectedGameType === 'language-learning' && learningTargetLanguage) {
      data.targetLanguage = learningTargetLanguage;
    }

    // Add procedural generation config
    if (generateContent) {
      // Convert simplified country configs to server-compatible format
      // Compute genealogy per settlement type using the same logic as SettlementDialog
      const serverCountries = countryConfigs.map((cc) => {
        // Use the largest settlement type's genealogy as the country-level default
        const settlementTypes: SettlementType[] = [];
        if (cc.numCities > 0) settlementTypes.push('city');
        if (cc.numTowns > 0) settlementTypes.push('town');
        if (cc.numVillages > 0) settlementTypes.push('village');
        if (cc.numHamlets > 0) settlementTypes.push('hamlet');
        const primaryType = settlementTypes[0] || 'town';
        const { foundingFamilies, generations } = computeGenealogy(primaryType, cc.foundedYear);

        return {
          terrain: cc.terrain,
          foundedYear: cc.foundedYear,
          generateStates: true,
          numStatesPerCountry: 1,
          numHamletsPerState: cc.numHamlets,
          numVillagesPerState: cc.numVillages,
          numTownsPerState: cc.numTowns,
          numCitiesPerState: cc.numCities,
          numFoundingFamilies: foundingFamilies,
          generations,
          marriageRate: 0.7,
          fertilityRate: 0.6,
          deathRate: 0.3,
        };
      });

      data.generationConfig = {
        generateGeography: true,
        generateGenealogy: true,
        generateWorldMap: true,
        worldScale,
        gameType: selectedGameType,
        countries: serverCountries,
        // World languages to create as WorldLanguage records
        worldLanguages: worldLanguages.length > 0 ? worldLanguages : undefined,
        // For language-learning worlds, specify which language is the learning target
        learningTargetLanguage: selectedGameType === 'language-learning' ? learningTargetLanguage : undefined,
      };
    }

    // Feature modules
    if (enabledModules.length > 0) {
      data.enabledModules = enabledModules;
    }

    onCreateWorld(data, generateContent, worldType, prompt, selectedGameType, label, true);
    setOpen(false);
    form.reset();
    // Reset all state
    setCreationMode('blank');
    setSelectedWorldType(WORLD_TYPES[0].value);
    setSelectedGameType(undefined);
    setEnabledModules([]);
    setShowModulePicker(false);
    setWorldLanguages([]);
    setLearningTargetLanguage(undefined);
    setCustomPrompt('');
    setCustomLabel('');
    setWorldScale('standard');
    setCountryConfigs([{ ...DEFAULT_COUNTRY_CONFIG }]);
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

          {/* World Theme */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">World Theme</CardTitle>
              <CardDescription>
                {creationMode === 'procedural'
                  ? 'Choose a preset genre and optionally add a custom description to guide AI content generation'
                  : 'Choose a world type and describe your world\'s setting, theme, and key characteristics'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
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
              </div>
              <div className="space-y-2">
                <Label>World Type Label</Label>
                <Input
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="e.g., Maritime Pirate World, Steampunk Western"
                />
                <p className="text-xs text-muted-foreground">
                  A more specific name for your world's theme — refines the selected genre for richer generation
                </p>
              </div>
              <div className="space-y-2">
                <Label>{creationMode === 'procedural' ? 'World Description' : 'Description'}</Label>
                <Textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder={creationMode === 'procedural'
                    ? "Describe your world in detail. For example: 'A maritime world where pirate guilds control trade routes and sea monsters are real...'"
                    : "Describe your world's setting, theme, and key characteristics..."
                  }
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {creationMode === 'procedural'
                    ? 'Detailed description to guide AI generation of names, cultures, and content'
                    : 'This description will be stored with your world'}
                </p>
              </div>
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
                <Select value={selectedGameType} onValueChange={handleGameTypeChange}>
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

          {/* Feature Modules (shown after game type is selected) */}
          {creationMode === 'procedural' && selectedGameType && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  Feature Modules
                </CardTitle>
                <CardDescription>
                  Customize which gameplay features are active. Defaults are set by the selected game type.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Collapsible open={showModulePicker} onOpenChange={setShowModulePicker}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full justify-between">
                      <span>{enabledModules.length} modules enabled</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showModulePicker ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { id: 'knowledge-acquisition', label: 'Knowledge Tracking', desc: 'Track learnable entries with mastery' },
                        { id: 'proficiency', label: 'Proficiency', desc: 'Multi-dimension skill tracking' },
                        { id: 'pattern-recognition', label: 'Pattern Recognition', desc: 'Track recurring patterns' },
                        { id: 'gamification', label: 'XP & Levels', desc: 'XP, achievements, daily challenges' },
                        { id: 'skill-tree', label: 'Skill Tree', desc: 'Unlockable skill progression' },
                        { id: 'adaptive-difficulty', label: 'Adaptive Difficulty', desc: 'Dynamic challenge scaling' },
                        { id: 'assessment', label: 'Assessment', desc: 'Multi-phase evaluations' },
                        { id: 'npc-exams', label: 'NPC Exams', desc: 'NPC-administered quizzes' },
                        { id: 'performance-scoring', label: 'Performance Scoring', desc: 'Grade player output' },
                        { id: 'voice', label: 'Voice Interaction', desc: 'Speech recognition & TTS' },
                        { id: 'world-lore', label: 'World Lore', desc: 'Rich lore & language systems' },
                        { id: 'conversation-analytics', label: 'Conversation Analytics', desc: 'Track dialogue metrics' },
                        { id: 'onboarding', label: 'Onboarding', desc: 'Guided tutorial sequence' },
                      ] as const).map(mod => (
                        <div key={mod.id} className="flex items-start gap-2 p-2 rounded border">
                          <Checkbox
                            id={`mod-${mod.id}`}
                            checked={enabledModules.includes(mod.id)}
                            onCheckedChange={() => toggleModule(mod.id)}
                          />
                          <label htmlFor={`mod-${mod.id}`} className="cursor-pointer leading-tight">
                            <div className="text-xs font-medium">{mod.label}</div>
                            <div className="text-[10px] text-muted-foreground">{mod.desc}</div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
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

          {/* Procedural: Countries + World Scale */}
          {creationMode === 'procedural' && (
            <div className="space-y-4">
              {/* Per-Country Configuration */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Map className="w-4 h-4" />
                    Countries
                  </CardTitle>
                  <CardDescription>
                    Configure terrain and settlements for each country
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                            {config.numCities}C/{config.numTowns}T/{config.numVillages}V/{config.numHamlets}H
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <CountryConfigPanel
                            config={config}
                            onChange={(updated) => updateCountryConfig(i, updated)}
                            onRemove={() => removeCountry(i)}
                            canRemove={countryConfigs.length > 1}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                  {countryConfigs.length < 5 && (
                    <Button type="button" variant="outline" size="sm" onClick={addCountry} className="w-full">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Country
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* World Scale */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">World Scale</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1.5">
                    <div className="flex gap-2">
                      {(['compact', 'standard', 'expansive'] as const).map(scale => (
                        <button
                          key={scale}
                          type="button"
                          onClick={() => setWorldScale(scale)}
                          className={`flex-1 px-3 py-1.5 text-xs rounded-md border transition-colors ${
                            worldScale === scale
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-muted/50 border-border hover:bg-muted'
                          }`}
                        >
                          {scale.charAt(0).toUpperCase() + scale.slice(1)}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {worldScale === 'compact' ? 'Small game world — settlements close together' :
                       worldScale === 'expansive' ? 'Large game world — vast distances between settlements' :
                       'Balanced distances between settlements'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

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
