import React from 'react';
import { ChevronLeft, ChevronRight, FastForward, Rewind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';

interface TimelineDialProps {
  currentTimestep: number;
  minTimestep: number;
  maxTimestep: number;
  onTimestepChange: (timestep: number) => void;
}

export function TimelineDial({
  currentTimestep,
  minTimestep,
  maxTimestep,
  onTimestepChange
}: TimelineDialProps) {
  const handlePrevious = () => {
    if (currentTimestep > minTimestep) {
      onTimestepChange(currentTimestep - 1);
    }
  };

  const handleNext = () => {
    if (currentTimestep < maxTimestep) {
      onTimestepChange(currentTimestep + 1);
    }
  };

  const handleJumpBackward = () => {
    onTimestepChange(Math.max(minTimestep, currentTimestep - 10));
  };

  const handleJumpForward = () => {
    onTimestepChange(Math.min(maxTimestep, currentTimestep + 10));
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Timeline</span>
          <span className="text-sm text-muted-foreground">
            Timestep: <span className="font-mono font-semibold">{currentTimestep}</span>
          </span>
        </div>

        {/* Timeline Slider */}
        <div className="space-y-2">
          <Slider
            value={[currentTimestep]}
            min={minTimestep}
            max={maxTimestep}
            step={1}
            onValueChange={(value) => onTimestepChange(value[0])}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Past ({minTimestep})</span>
            <span>Present</span>
            <span>Future ({maxTimestep})</span>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleJumpBackward}
            disabled={currentTimestep <= minTimestep}
            title="Jump backward 10 steps"
          >
            <Rewind className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentTimestep <= minTimestep}
            title="Previous step"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="px-4 py-2 bg-primary/10 rounded-md min-w-[100px] text-center">
            <span className="font-mono font-bold text-primary">{currentTimestep}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={currentTimestep >= maxTimestep}
            title="Next step"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleJumpForward}
            disabled={currentTimestep >= maxTimestep}
            title="Jump forward 10 steps"
          >
            <FastForward className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
