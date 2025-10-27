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
import { Globe, Plus, Sparkles, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertWorldSchema, type InsertWorld } from "@shared/schema";
import { z } from "zod";

const createWorldFormSchema = insertWorldSchema.extend({
  name: z.string().min(1, "World name is required"),
  description: z.string().optional(),
});

type CreateWorldForm = z.infer<typeof createWorldFormSchema>;

const WORLD_TYPES = [
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

interface WorldCreateDialogProps {
  onCreateWorld: (data: InsertWorld, generateContent?: boolean, worldType?: string, customPrompt?: string) => void;
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
  const [customPrompt, setCustomPrompt] = useState('');
  
  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const form = useForm<CreateWorldForm>({
    resolver: zodResolver(createWorldFormSchema),
    defaultValues: {
      name: "",
      description: "",
      systemTypes: ["insimul"],
      config: {},
      worldData: {},
      historicalEvents: [],
      generationConfig: {},
    },
  });

  const handleSubmit = (data: CreateWorldForm) => {
    const generateContent = creationMode === 'procedural';
    const worldType = inputMode === 'preset' ? selectedWorldType : undefined;
    const prompt = inputMode === 'custom' ? customPrompt : undefined;
    
    onCreateWorld(data, generateContent, worldType, prompt);
    setOpen(false);
    form.reset();
    setCreationMode('blank');
    setInputMode('preset');
    setSelectedWorldType(WORLD_TYPES[0].value);
    setCustomPrompt('');
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Only render trigger when not controlled (no open prop provided) */}
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
          {/* Creation Mode Selection */}
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
                        <div className="text-sm text-muted-foreground">Auto-generate societies, rules, actions, and quests</div>
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

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

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              data-testid="textarea-world-description"
              placeholder="Describe your world's setting, theme, and key characteristics..."
              rows={3}
            />
          </div>

          {/* Procedural Generation Options */}
          {creationMode === 'procedural' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Generation Settings</CardTitle>
                <CardDescription>Choose a preset or describe your ideal world</CardDescription>
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
                  
                  <TabsContent value="custom" className="space-y-2">
                    <Label>Custom World Description</Label>
                    <Textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Describe the type of world you want to generate. For example: 'A maritime world where pirate guilds control trade routes and sea monsters are real...'"
                      rows={4}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
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
              disabled={isLoading}
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