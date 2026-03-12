/**
 * Truth Context Panel (US-2.06)
 *
 * Collapsible panel that shows truths relevant to whatever entity is being edited.
 * Embeds into any content editor (rules, actions, quests, items, grammars, languages).
 */

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  BookOpen, ChevronDown, ChevronRight, Link2, Plus, Search, X,
} from 'lucide-react';

interface Truth {
  id: string;
  title: string;
  content: string;
  entryType: string;
  timeYear?: number;
  historicalEra?: string;
  historicalSignificance?: string;
  importance?: number;
  tags?: string[];
  relatedCharacterIds?: string[];
  relatedLocationIds?: string[];
}

interface TruthContextPanelProps {
  worldId: string;
  /** The entity being edited */
  entityId?: string;
  entityType: 'rule' | 'action' | 'quest' | 'item' | 'grammar' | 'language' | 'character';
  entityName?: string;
  /** Tags to match truths by */
  entityTags?: string[];
  /** Whether the panel starts collapsed (default: true) */
  defaultCollapsed?: boolean;
  /** Callback when user wants to navigate to a truth */
  onNavigateToTruth?: (truthId: string) => void;
}

export function TruthContextPanel({
  worldId,
  entityId,
  entityType,
  entityName,
  entityTags = [],
  defaultCollapsed = true,
  onNavigateToTruth,
}: TruthContextPanelProps) {
  const [isOpen, setIsOpen] = useState(!defaultCollapsed);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: allTruths = [] } = useQuery<Truth[]>({
    queryKey: ['/api/worlds', worldId, 'truth'],
    enabled: !!worldId,
  });

  // Find related truths
  const relatedTruths = useMemo(() => {
    return allTruths.filter(truth => {
      // Match by character/location reference
      if (entityId && entityType === 'character') {
        if (truth.relatedCharacterIds?.includes(entityId)) return true;
      }

      // Match by tags
      if (entityTags.length > 0 && truth.tags) {
        const truthTagsLower = truth.tags.map(t => t.toLowerCase());
        for (const tag of entityTags) {
          if (truthTagsLower.includes(tag.toLowerCase())) return true;
        }
      }

      // Match by entity name in content
      if (entityName && truth.content.toLowerCase().includes(entityName.toLowerCase())) {
        return true;
      }

      return false;
    });
  }, [allTruths, entityId, entityType, entityTags, entityName]);

  // Search truths
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allTruths
      .filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.content.toLowerCase().includes(q) ||
        t.tags?.some(tag => tag.toLowerCase().includes(q))
      )
      .filter(t => !relatedTruths.some(r => r.id === t.id))
      .slice(0, 10);
  }, [allTruths, searchQuery, relatedTruths]);

  // Create related truth
  const createTruth = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/worlds/${worldId}/truth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worldId,
          title: `Truth about ${entityName ?? entityType}`,
          content: '',
          entryType: 'backstory',
          timestep: 0,
          tags: entityTags,
          relatedCharacterIds: entityType === 'character' && entityId ? [entityId] : [],
          importance: 5,
          isPublic: true,
        }),
      });
      if (!response.ok) throw new Error('Failed to create truth');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/worlds', worldId, 'truth'] });
      onNavigateToTruth?.(data.id);
    },
  });

  const totalCount = relatedTruths.length;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/40 dark:bg-white/5 border border-white/10 hover:bg-white/60 dark:hover:bg-white/10 transition-colors text-left">
          {isOpen ? (
            <ChevronDown className="w-4 h-4 shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 shrink-0" />
          )}
          <BookOpen className="w-4 h-4 shrink-0 text-muted-foreground" />
          <span className="text-xs font-medium flex-1">Truth Context</span>
          {totalCount > 0 && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {totalCount}
            </Badge>
          )}
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <Card className="mt-1 bg-white/40 dark:bg-white/5 border border-white/10 rounded-lg">
          <CardContent className="p-3 space-y-3">
            {/* Related truths */}
            {relatedTruths.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Related Truths
                </h4>
                <ScrollArea className="max-h-[200px]">
                  {relatedTruths.map(truth => (
                    <button
                      key={truth.id}
                      className="w-full flex items-start gap-2 px-2 py-1.5 rounded-md text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      onClick={() => onNavigateToTruth?.(truth.id)}
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        (truth.importance ?? 5) >= 8 ? 'bg-red-500' :
                        (truth.importance ?? 5) >= 5 ? 'bg-primary' : 'bg-muted-foreground/30'
                      }`} />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium truncate">{truth.title}</div>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">
                          {truth.content}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5">
                            {truth.entryType}
                          </Badge>
                          {truth.timeYear && (
                            <span className="text-[9px] text-muted-foreground">{truth.timeYear}</span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </ScrollArea>
              </div>
            )}

            {relatedTruths.length === 0 && (
              <p className="text-[10px] text-muted-foreground text-center py-2">
                No truths linked to this {entityType}
              </p>
            )}

            {/* Search */}
            <div className="space-y-1">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <Input
                  placeholder="Search truths to link..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="h-7 pl-7 pr-7 text-xs"
                />
                {searchQuery && (
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                )}
              </div>

              {searchResults.length > 0 && (
                <ScrollArea className="max-h-[150px]">
                  {searchResults.map(truth => (
                    <button
                      key={truth.id}
                      className="w-full flex items-center gap-2 px-2 py-1 rounded-md text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      onClick={() => onNavigateToTruth?.(truth.id)}
                    >
                      <Link2 className="w-3 h-3 shrink-0 text-muted-foreground" />
                      <span className="text-xs truncate">{truth.title}</span>
                      <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 ml-auto shrink-0">
                        {truth.entryType}
                      </Badge>
                    </button>
                  ))}
                </ScrollArea>
              )}
            </div>

            {/* Create button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full h-7 text-xs"
              onClick={() => createTruth.mutate()}
              disabled={createTruth.isPending}
            >
              <Plus className="w-3 h-3 mr-1" />
              Create Related Truth
            </Button>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}
