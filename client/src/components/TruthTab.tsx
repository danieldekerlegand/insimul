import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Clock, Calendar, User, History, Compass, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from '@/lib/queryClient';
import { TimelineDial } from './TimelineDial';

interface Truth {
  id: string;
  worldId: string;
  characterId: string | null;
  title: string;
  content: string;
  entryType: string;
  timestep: number;
  timestepDuration: number | null;
  timeYear: number | null;
  timeSeason: string | null;
  timeDescription: string | null;
  relatedCharacterIds: string[] | null;
  tags: string[] | null;
  importance: number | null;
  isPublic: boolean | null;
  source: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Character {
  id: string;
  firstName: string;
  lastName: string;
}

interface TruthTabProps {
  worldId: string;
  characters: Character[];
}

export function TruthTab({ worldId, characters }: TruthTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Truth | null>(null);
  const [currentTimestep, setCurrentTimestep] = useState(0);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [entryType, setEntryType] = useState('event');
  const [characterId, setCharacterId] = useState<string>('');
  const [timestep, setTimestep] = useState('0');
  const [timestepDuration, setTimestepDuration] = useState('1');
  const [timeYear, setTimeYear] = useState<string>('');
  const [timeSeason, setTimeSeason] = useState('');
  const [importance, setImportance] = useState('5');

  // Fetch Truths
  const { data: truths = [] } = useQuery<Truth[]>({
    queryKey: ['/api/worlds', worldId, 'truth'],
    enabled: !!worldId,
  });

  // Calculate timestep range
  const { minTimestep, maxTimestep } = useMemo(() => {
    if (truths.length === 0) return { minTimestep: -50, maxTimestep: 50 };

    const timesteps = truths.map(e => e.timestep);
    const min = Math.min(...timesteps, -50);
    const max = Math.max(...timesteps, 50);

    return { minTimestep: min, maxTimestep: max };
  }, [truths]);

  // Categorize entries by temporal relation to current timestep
  const { pastEntries, presentEntries, futureEntries } = useMemo(() => {
    const past: Truth[] = [];
    const present: Truth[] = [];
    const future: Truth[] = [];

    truths.forEach(entry => {
      const entryEndTimestep = entry.timestep + (entry.timestepDuration || 1) - 1;

      if (entryEndTimestep < currentTimestep) {
        past.push(entry);
      } else if (entry.timestep > currentTimestep) {
        future.push(entry);
      } else {
        present.push(entry);
      }
    });

    return {
      pastEntries: past.sort((a, b) => b.timestep - a.timestep),
      presentEntries: present.sort((a, b) => b.timestep - a.timestep),
      futureEntries: future.sort((a, b) => a.timestep - b.timestep),
    };
  }, [truths, currentTimestep]);

  // Create truth entry mutation
  const createEntryMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', `/api/worlds/${worldId}/truth`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/worlds', worldId, 'truth'] });
      toast({ title: "Truth entry created successfully" });
      resetForm();
      setDialogOpen(false);
    },
  });

  // Update truth entry mutation
  const updateEntryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest('PUT', `/api/truth/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/worlds', worldId, 'truth'] });
      toast({ title: "Truth entry updated successfully" });
      resetForm();
      setDialogOpen(false);
    },
  });

  // Delete truth entry mutation
  const deleteEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/truth/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/worlds', worldId, 'truth'] });
      toast({ title: "Truth entry deleted" });
    },
  });

  const resetForm = () => {
    setTitle('');
    setContent('');
    setEntryType('event');
    setCharacterId('');
    setTimestep('0');
    setTimestepDuration('1');
    setTimeYear('');
    setTimeSeason('');
    setImportance('5');
    setEditingEntry(null);
  };

  const handleSubmit = () => {
    const data = {
      title,
      content,
      entryType,
      characterId: characterId || null,
      timestep: parseInt(timestep),
      timestepDuration: parseInt(timestepDuration),
      timeYear: timeYear ? parseInt(timeYear) : null,
      timeSeason: timeSeason || null,
      importance: parseInt(importance),
    };

    if (editingEntry) {
      updateEntryMutation.mutate({ id: editingEntry.id, data });
    } else {
      createEntryMutation.mutate(data);
    }
  };

  const handleEdit = (entry: Truth) => {
    setEditingEntry(entry);
    setTitle(entry.title);
    setContent(entry.content);
    setEntryType(entry.entryType);
    setCharacterId(entry.characterId || '');
    setTimestep(entry.timestep.toString());
    setTimestepDuration(entry.timestepDuration?.toString() || '1');
    setTimeYear(entry.timeYear?.toString() || '');
    setTimeSeason(entry.timeSeason || '');
    setImportance(entry.importance?.toString() || '5');
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this truth entry?')) {
      deleteEntryMutation.mutate(id);
    }
  };

  const getCharacterName = (charId: string | null) => {
    if (!charId) return 'World Event';
    const char = characters.find(c => c.id === charId);
    return char ? `${char.firstName} ${char.lastName}` : 'Unknown Character';
  };

  const renderEntryCard = (entry: Truth) => (
    <Card key={entry.id} className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold">{entry.title}</h3>
            <Badge variant="outline">{entry.entryType}</Badge>
            {entry.characterId && (
              <Badge variant="secondary" className="text-xs">
                <User className="w-3 h-3 mr-1" />
                {getCharacterName(entry.characterId)}
              </Badge>
            )}
            {(entry.source === 'imported_ensemble' || entry.source === 'imported_ensemble_history') && (
              <Badge variant="secondary" className="text-xs">Imported</Badge>
            )}
          </div>

          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span className="font-mono">t={entry.timestep}</span>
              {entry.timestepDuration && entry.timestepDuration > 1 && (
                <span className="text-xs">({entry.timestepDuration} steps)</span>
              )}
            </div>
            {(entry.timeYear || entry.timeSeason) && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {entry.timeYear && <span>Year {entry.timeYear}</span>}
                {entry.timeSeason && <span className="capitalize">{entry.timeSeason}</span>}
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {entry.content}
          </p>

          {entry.tags && entry.tags.length > 0 && (
            <div className="flex gap-1 mt-2">
              {entry.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(entry)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(entry.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Compass className="w-5 h-5" />
                World Truth ({truths.length})
              </CardTitle>
              <CardDescription>
                Past, present, and future truths about the world and its characters
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button size="sm" disabled>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Truth
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingEntry ? 'Edit' : 'Create'} Truth Entry</DialogTitle>
                    <DialogDescription>
                      {editingEntry ? 'Update' : 'Add'} a truth about the past, present, or future
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="The Battle of Ravenshollow"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="entryType">Entry Type</Label>
                        <Select value={entryType} onValueChange={setEntryType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="event">Event</SelectItem>
                            <SelectItem value="backstory">Backstory</SelectItem>
                            <SelectItem value="relationship">Relationship</SelectItem>
                            <SelectItem value="achievement">Achievement</SelectItem>
                            <SelectItem value="milestone">Milestone</SelectItem>
                            <SelectItem value="prophecy">Prophecy</SelectItem>
                            <SelectItem value="plan">Plan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="character">Character (Optional)</Label>
                        <Select value={characterId} onValueChange={setCharacterId}>
                          <SelectTrigger>
                            <SelectValue placeholder="World event" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">World Event</SelectItem>
                            {characters.map(char => (
                              <SelectItem key={char.id} value={char.id}>
                                {char.firstName} {char.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="timestep">Timestep</Label>
                        <Input
                          id="timestep"
                          type="number"
                          value={timestep}
                          onChange={(e) => setTimestep(e.target.value)}
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <Label htmlFor="timestepDuration">Duration (steps)</Label>
                        <Input
                          id="timestepDuration"
                          type="number"
                          min="1"
                          value={timestepDuration}
                          onChange={(e) => setTimestepDuration(e.target.value)}
                          placeholder="1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="importance">Importance (1-10)</Label>
                        <Input
                          id="importance"
                          type="number"
                          min="1"
                          max="10"
                          value={importance}
                          onChange={(e) => setImportance(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="timeYear">Year (Optional)</Label>
                        <Input
                          id="timeYear"
                          type="number"
                          value={timeYear}
                          onChange={(e) => setTimeYear(e.target.value)}
                          placeholder="1200"
                        />
                      </div>

                      <div>
                        <Label htmlFor="timeSeason">Season (Optional)</Label>
                        <Select value={timeSeason} onValueChange={setTimeSeason}>
                          <SelectTrigger>
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Any</SelectItem>
                            <SelectItem value="spring">Spring</SelectItem>
                            <SelectItem value="summer">Summer</SelectItem>
                            <SelectItem value="fall">Fall</SelectItem>
                            <SelectItem value="winter">Winter</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Describe the event, prophecy, or truth..."
                        className="min-h-[200px]"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={createEntryMutation.isPending || updateEntryMutation.isPending || !title || !content}
                      >
                        {editingEntry ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Timeline Navigation */}
          <TimelineDial
            currentTimestep={currentTimestep}
            minTimestep={minTimestep}
            maxTimestep={maxTimestep}
            onTimestepChange={setCurrentTimestep}
          />

          {/* Past/Present/Future Tabs */}
          <Tabs defaultValue="present" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="past" className="gap-2">
                <History className="w-4 h-4" />
                Past ({pastEntries.length})
              </TabsTrigger>
              <TabsTrigger value="present" className="gap-2">
                <Clock className="w-4 h-4" />
                Present ({presentEntries.length})
              </TabsTrigger>
              <TabsTrigger value="future" className="gap-2">
                <Sparkles className="w-4 h-4" />
                Future ({futureEntries.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="past" className="mt-4">
              <ScrollArea className="h-[500px]">
                {pastEntries.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No past truths recorded</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pastEntries.map(renderEntryCard)}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="present" className="mt-4">
              <ScrollArea className="h-[500px]">
                {presentEntries.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No current truths at this timestep</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {presentEntries.map(renderEntryCard)}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="future" className="mt-4">
              <ScrollArea className="h-[500px]">
                {futureEntries.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No future truths or prophecies</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {futureEntries.map(renderEntryCard)}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
