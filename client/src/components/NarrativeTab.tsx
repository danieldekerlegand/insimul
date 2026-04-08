/**
 * Narrative Tab — View and edit the generated narrative for the "Missing Writer" main quest.
 *
 * Displays the narrative outline: chapter summaries, key characters, mystery arc,
 * clue list, and revelation. Each element is editable. Includes a "Regenerate" button.
 */

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  BookOpen, RefreshCw, Save, AlertTriangle,
  ChevronDown, ChevronRight, User, MapPin, Search, ScrollText, ExternalLink,
} from 'lucide-react';

interface NarrativeTabProps {
  worldId: string;
}

interface ClueDescription {
  clueId: string;
  text: string;
  locationId?: string;
  npcRole?: string;
}

interface ChapterNarrative {
  chapterId: string;
  chapterNumber: number;
  title: string;
  introNarrative: string;
  outroNarrative: string;
  mysteryDetails: string;
  clueDescriptions: ClueDescription[];
}

interface RedHerring {
  description: string;
  source: string;
}

interface NarrativeData {
  writerName: string;
  writerFirstName: string;
  writerLastName: string;
  writerBackstory: string;
  disappearanceReason: string;
  chapters: ChapterNarrative[];
  redHerrings: RedHerring[];
  finalRevelation: string;
}

export function NarrativeTab({ worldId }: NarrativeTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set([1]));
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [editData, setEditData] = useState<NarrativeData | null>(null);
  const [hasEdits, setHasEdits] = useState(false);

  const { data: narrative, isLoading } = useQuery<NarrativeData | null>({
    queryKey: ['/api/worlds', worldId, 'narrative'],
    queryFn: async () => {
      const res = await fetch(`/api/worlds/${worldId}/narrative`);
      if (!res.ok) throw new Error('Failed to fetch narrative');
      const data = await res.json();
      return data;
    },
  });

  // Load quests to show corresponding main quest for each chapter
  const { data: quests = [] } = useQuery<any[]>({
    queryKey: ['/api/worlds', worldId, 'quests'],
    queryFn: async () => {
      const res = await fetch(`/api/worlds/${worldId}/quests`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Load gametexts for linked texts display
  const { data: gametexts = [] } = useQuery<any[]>({
    queryKey: ['/api/worlds', worldId, 'texts'],
    queryFn: async () => {
      const res = await fetch(`/api/worlds/${worldId}/texts`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const mainQuests = quests.filter((q: any) => q.questType === 'main_quest' || q.tags?.includes('main_quest'));
  const getQuestForChapter = (chapterId: string) =>
    mainQuests.find((q: any) => q.tags?.includes(`chapterId:${chapterId}`));
  const getTextsForChapter = (chapterId: string) =>
    gametexts.filter((t: any) =>
      t.narrativeChapterId === chapterId ||
      t.tags?.includes(`chapterId:${chapterId}`)
    );

  const data = editData ?? narrative;

  const updateField = (updater: (d: NarrativeData) => NarrativeData) => {
    if (!data) return;
    setEditData(updater(structuredClone(data)));
    setHasEdits(true);
  };

  const toggleChapter = (num: number) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  };

  const handleSave = async () => {
    if (!editData) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/worlds/${worldId}/narrative`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      if (!res.ok) throw new Error('Failed to save');
      setHasEdits(false);
      queryClient.invalidateQueries({ queryKey: ['/api/worlds', worldId, 'narrative'] });
      toast({ title: 'Narrative saved' });
    } catch {
      toast({ title: 'Failed to save narrative', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const res = await fetch(`/api/worlds/${worldId}/narrative/regenerate`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to regenerate');
      const newNarrative = await res.json();
      setEditData(newNarrative);
      setHasEdits(true);
      queryClient.invalidateQueries({ queryKey: ['/api/worlds', worldId, 'narrative'] });
      toast({ title: 'Narrative regenerated' });
    } catch {
      toast({ title: 'Failed to regenerate narrative', variant: 'destructive' });
    } finally {
      setIsRegenerating(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading narrative...</div>;
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <BookOpen className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground">No narrative has been generated for this world yet.</p>
        <Button onClick={handleRegenerate} disabled={isRegenerating}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
          Generate Narrative
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Narrative: The Missing Writer
          </h2>
          <p className="text-muted-foreground mt-1">Main quest narrative outline for this world</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRegenerate} disabled={isRegenerating}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
          {hasEdits && (
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          )}
        </div>
      </div>

      {/* Writer Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            The Missing Writer
          </CardTitle>
          <CardDescription>The central figure of the investigation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">First Name</label>
              <Input
                value={data.writerFirstName}
                onChange={(e) => updateField(d => ({ ...d, writerFirstName: e.target.value, writerName: `${e.target.value} ${d.writerLastName}` }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Last Name</label>
              <Input
                value={data.writerLastName}
                onChange={(e) => updateField(d => ({ ...d, writerLastName: e.target.value, writerName: `${d.writerFirstName} ${e.target.value}` }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <Input value={data.writerName} disabled className="bg-muted" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Backstory</label>
            <Textarea
              value={data.writerBackstory}
              onChange={(e) => updateField(d => ({ ...d, writerBackstory: e.target.value }))}
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Reason for Disappearance</label>
            <Textarea
              value={data.disappearanceReason}
              onChange={(e) => updateField(d => ({ ...d, disappearanceReason: e.target.value }))}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Chapters */}
      <Card>
        <CardHeader>
          <CardTitle>Chapter Narratives</CardTitle>
          <CardDescription>Each chapter's mystery details and clues</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.chapters.map(ch => {
            const isExpanded = expandedChapters.has(ch.chapterNumber);
            return (
              <div key={ch.chapterId} className="border rounded-lg">
                <button
                  className="w-full flex items-center justify-between p-3 hover:bg-accent/50 transition-colors"
                  onClick={() => toggleChapter(ch.chapterNumber)}
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    <Badge variant="outline">Ch. {ch.chapterNumber}</Badge>
                    <span className="font-medium">{ch.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const quest = getQuestForChapter(ch.chapterId);
                      return quest ? (
                        <Badge variant="secondary" className="text-[10px] gap-1">
                          <ScrollText className="w-3 h-3" />
                          {quest.title}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">No quest</Badge>
                      );
                    })()}
                    <Badge>{ch.clueDescriptions.length} clues</Badge>
                  </div>
                </button>
                {isExpanded && (
                  <div className="p-4 pt-0 space-y-3">
                    <div>
                      <label className="text-sm font-medium">Intro Narrative</label>
                      <Textarea
                        value={ch.introNarrative}
                        onChange={(e) => updateField(d => {
                          const idx = d.chapters.findIndex(c => c.chapterId === ch.chapterId);
                          if (idx >= 0) d.chapters[idx].introNarrative = e.target.value;
                          return d;
                        })}
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Mystery Details</label>
                      <Textarea
                        value={ch.mysteryDetails}
                        onChange={(e) => updateField(d => {
                          const idx = d.chapters.findIndex(c => c.chapterId === ch.chapterId);
                          if (idx >= 0) d.chapters[idx].mysteryDetails = e.target.value;
                          return d;
                        })}
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Outro Narrative</label>
                      <Textarea
                        value={ch.outroNarrative}
                        onChange={(e) => updateField(d => {
                          const idx = d.chapters.findIndex(c => c.chapterId === ch.chapterId);
                          if (idx >= 0) d.chapters[idx].outroNarrative = e.target.value;
                          return d;
                        })}
                        rows={3}
                      />
                    </div>
                    {/* Linked Quest */}
                    {(() => {
                      const quest = getQuestForChapter(ch.chapterId);
                      if (!quest) return null;
                      return (
                        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium flex items-center gap-1">
                              <ScrollText className="w-3.5 h-3.5" /> Linked Quest
                            </label>
                            <Badge variant={quest.status === 'completed' ? 'default' : quest.status === 'active' ? 'secondary' : 'outline'} className="text-[10px]">
                              {quest.status}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium">{quest.title}</p>
                          {quest.description && <p className="text-xs text-muted-foreground mt-1">{quest.description}</p>}
                          {quest.objectives?.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {quest.objectives.map((obj: any, oi: number) => (
                                <div key={oi} className="flex items-center gap-2 text-xs">
                                  <span className={obj.completed ? 'text-green-500' : 'text-muted-foreground'}>
                                    {obj.completed ? '✓' : '○'}
                                  </span>
                                  <span className={obj.completed ? 'line-through text-muted-foreground' : ''}>
                                    {obj.description || obj.title || obj.id}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          {quest.experienceReward && (
                            <p className="text-[10px] text-muted-foreground mt-2">Reward: {quest.experienceReward} XP</p>
                          )}
                        </div>
                      );
                    })()}

                    {/* Linked Texts (journal entries, clue letters) */}
                    {(() => {
                      const chapterTexts = getTextsForChapter(ch.chapterId);
                      if (chapterTexts.length === 0) return null;
                      return (
                        <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                          <label className="text-sm font-medium flex items-center gap-1 mb-2">
                            <BookOpen className="w-3.5 h-3.5" /> Linked Texts ({chapterTexts.length})
                          </label>
                          <div className="space-y-1.5">
                            {chapterTexts.map((text: any) => (
                              <div key={text.id} className="flex items-start gap-2 text-xs">
                                <Badge variant="outline" className={`text-[9px] shrink-0 ${
                                  text.textCategory === 'journal' ? 'text-amber-500 border-amber-500/30' :
                                  text.textCategory === 'letter' ? 'text-blue-500 border-blue-500/30' :
                                  'text-muted-foreground'
                                }`}>{text.textCategory}</Badge>
                                <div className="flex-1">
                                  <span className="font-medium">{text.title}</span>
                                  {text.clueText && (
                                    <p className="text-muted-foreground mt-0.5">{text.clueText}</p>
                                  )}
                                </div>
                                <Badge variant="outline" className="text-[9px]">{text.cefrLevel}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Clue Descriptions */}
                    <div>
                      <label className="text-sm font-medium flex items-center gap-1">
                        <Search className="w-3 h-3" /> Clues
                      </label>
                      <div className="space-y-2 mt-1">
                        {ch.clueDescriptions.map((clue, ci) => (
                          <div key={clue.clueId} className="flex items-start gap-2 p-2 bg-muted/50 rounded">
                            <div className="flex-1">
                              <Textarea
                                value={clue.text}
                                onChange={(e) => updateField(d => {
                                  const chIdx = d.chapters.findIndex(c => c.chapterId === ch.chapterId);
                                  if (chIdx >= 0) d.chapters[chIdx].clueDescriptions[ci].text = e.target.value;
                                  return d;
                                })}
                                rows={2}
                              />
                            </div>
                            <div className="flex flex-col gap-1 min-w-[120px]">
                              {clue.locationId && (
                                <Badge variant="secondary" className="text-xs">
                                  <MapPin className="w-3 h-3 mr-1" />{clue.locationId}
                                </Badge>
                              )}
                              {clue.npcRole && (
                                <Badge variant="secondary" className="text-xs">
                                  <User className="w-3 h-3 mr-1" />{clue.npcRole}
                                </Badge>
                              )}
                              {(() => {
                                // NPC-based clues are delivered via conversation, not text
                                if (clue.npcRole) {
                                  return (
                                    <Badge variant="outline" className="text-xs text-cyan-500 border-cyan-500/30">
                                      💬 NPC conversation
                                    </Badge>
                                  );
                                }
                                // Location-based clues should have a linked text
                                const chapterTexts = getTextsForChapter(ch.chapterId);
                                const linkedText = chapterTexts.find((t: any) =>
                                  t.tags?.includes('clue') && (
                                    (clue.locationId && t.spawnLocationHint === clue.locationId) ||
                                    t.clueText
                                  )
                                );
                                return linkedText ? (
                                  <Badge variant="outline" className="text-xs text-green-500 border-green-500/30">
                                    <BookOpen className="w-3 h-3 mr-1" /> Text linked
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs text-amber-500 border-amber-500/30">
                                    No text
                                  </Badge>
                                );
                              })()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Red Herrings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Red Herrings
          </CardTitle>
          <CardDescription>False leads to keep the investigation interesting</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.redHerrings.map((rh, i) => (
            <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="flex-1">
                <Textarea
                  value={rh.description}
                  onChange={(e) => updateField(d => {
                    d.redHerrings[i].description = e.target.value;
                    return d;
                  })}
                  rows={2}
                />
              </div>
              <div className="flex flex-col gap-1 min-w-[120px]">
                <Badge variant="outline">{rh.source}</Badge>
                {(() => {
                  const src = rh.source.toLowerCase();
                  const isNPC = src.includes('gossip') || src.includes('rumor') || src.includes('anonymous') || src.includes('source');
                  if (isNPC) {
                    return <Badge variant="outline" className="text-[10px] text-cyan-500 border-cyan-500/30">💬 NPC</Badge>;
                  }
                  // Check if a text exists for this red herring
                  const linkedText = gametexts.find((t: any) => t.tags?.includes('red_herring'));
                  return linkedText ? (
                    <Badge variant="outline" className="text-[10px] text-green-500 border-green-500/30">
                      <BookOpen className="w-3 h-3 mr-1" /> Text linked
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30">📄 No text</Badge>
                  );
                })()}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Final Revelation */}
      <Card>
        <CardHeader>
          <CardTitle>Final Revelation</CardTitle>
          <CardDescription>The culminating moment when the truth is revealed</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={data.finalRevelation}
            onChange={(e) => updateField(d => ({ ...d, finalRevelation: e.target.value }))}
            rows={4}
          />
        </CardContent>
      </Card>
    </div>
  );
}
