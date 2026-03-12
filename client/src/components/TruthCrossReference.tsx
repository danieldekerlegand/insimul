/**
 * Truth Cross-Reference Badge (US-1.02)
 *
 * A reusable component that shows truth cross-references for any entity
 * (rule, action, quest, character, item, grammar, language).
 * Displays a small badge with count, expandable to show linked truths.
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { BookOpen, ChevronRight, Link2, MapPin, User } from 'lucide-react';

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

interface TruthCrossReferenceProps {
  /** World ID to fetch truths from */
  worldId: string;
  /** Entity ID to find related truths for (character, location, etc.) */
  entityId?: string;
  /** Entity type for context */
  entityType?: 'character' | 'location' | 'item' | 'rule' | 'action' | 'quest' | 'grammar' | 'language';
  /** Tags to match truths by */
  matchTags?: string[];
  /** Show as inline badge (default) or expanded panel */
  variant?: 'badge' | 'panel';
  /** Maximum truths to show in expanded view */
  maxDisplay?: number;
  /** Callback when a truth is clicked */
  onTruthClick?: (truthId: string) => void;
}

export function TruthCrossReference({
  worldId,
  entityId,
  entityType,
  matchTags = [],
  variant = 'badge',
  maxDisplay = 10,
  onTruthClick,
}: TruthCrossReferenceProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: allTruths = [] } = useQuery<Truth[]>({
    queryKey: ['/api/worlds', worldId, 'truth'],
    enabled: !!worldId,
  });

  // Find truths related to this entity
  const relatedTruths = allTruths.filter(truth => {
    // Match by character/location ID in related arrays
    if (entityId) {
      if (entityType === 'character' && truth.relatedCharacterIds?.includes(entityId)) {
        return true;
      }
      if (entityType === 'location' && truth.relatedLocationIds?.includes(entityId)) {
        return true;
      }
    }

    // Match by tags
    if (matchTags.length > 0 && truth.tags) {
      const truthTagsLower = truth.tags.map(t => t.toLowerCase());
      for (const tag of matchTags) {
        if (truthTagsLower.includes(tag.toLowerCase())) {
          return true;
        }
      }
    }

    return false;
  });

  if (relatedTruths.length === 0) {
    return null; // Don't render anything if no cross-references
  }

  if (variant === 'panel') {
    return (
      <TruthPanel
        truths={relatedTruths.slice(0, maxDisplay)}
        totalCount={relatedTruths.length}
        onTruthClick={onTruthClick}
      />
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 gap-1 text-xs text-muted-foreground hover:text-primary"
        >
          <BookOpen className="w-3 h-3" />
          <span>{relatedTruths.length} truth{relatedTruths.length !== 1 ? 's' : ''}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="px-3 py-2 border-b border-white/10">
          <h4 className="text-xs font-semibold">
            Related Truths ({relatedTruths.length})
          </h4>
        </div>
        <ScrollArea className="max-h-[240px]">
          <div className="p-1">
            {relatedTruths.slice(0, maxDisplay).map(truth => (
              <button
                key={truth.id}
                className="w-full flex items-start gap-2 px-2 py-1.5 rounded-md text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                onClick={() => {
                  onTruthClick?.(truth.id);
                  setIsOpen(false);
                }}
              >
                <Link2 className="w-3 h-3 mt-0.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium truncate">{truth.title}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {truth.timeYear && (
                      <span className="text-[10px] text-muted-foreground">{truth.timeYear}</span>
                    )}
                    {truth.historicalEra && (
                      <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5">
                        {truth.historicalEra.replace(/_/g, ' ')}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3.5">
                      {truth.entryType}
                    </Badge>
                  </div>
                </div>
                <ChevronRight className="w-3 h-3 mt-0.5 shrink-0 text-muted-foreground/40" />
              </button>
            ))}
          </div>
        </ScrollArea>
        {relatedTruths.length > maxDisplay && (
          <div className="px-3 py-1.5 border-t border-white/10 text-center">
            <span className="text-[10px] text-muted-foreground">
              +{relatedTruths.length - maxDisplay} more
            </span>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

/** Expanded panel variant for embedding in detail views */
function TruthPanel({
  truths,
  totalCount,
  onTruthClick,
}: {
  truths: Truth[];
  totalCount: number;
  onTruthClick?: (truthId: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
        <BookOpen className="w-3.5 h-3.5" />
        Related Truths ({totalCount})
      </h4>
      {truths.map(truth => (
        <button
          key={truth.id}
          className="w-full flex items-start gap-2 p-2 rounded-lg text-left bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 border border-white/10 transition-colors"
          onClick={() => onTruthClick?.(truth.id)}
        >
          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
            (truth.importance ?? 5) >= 8 ? 'bg-red-500' :
            (truth.importance ?? 5) >= 5 ? 'bg-primary' : 'bg-muted-foreground/40'
          }`} />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium">{truth.title}</div>
            <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">
              {truth.content}
            </p>
            <div className="flex items-center gap-1 mt-1">
              {truth.timeYear && (
                <span className="text-[10px] text-muted-foreground">{truth.timeYear}</span>
              )}
              {truth.historicalEra && (
                <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5">
                  {truth.historicalEra.replace(/_/g, ' ')}
                </Badge>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

/**
 * Small inline badge showing truth count — for use in table rows / list items.
 * Does not fetch data itself; pass the count directly.
 */
export function TruthCountBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 gap-0.5">
      <BookOpen className="w-2.5 h-2.5" />
      {count}
    </Badge>
  );
}
