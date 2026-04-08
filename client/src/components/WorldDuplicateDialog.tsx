import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Copy, Loader2 } from "lucide-react";
import { LANGUAGES } from './WorldCreateDialog';
import { useToast } from '@/hooks/use-toast';

interface WorldDuplicateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worldId: string;
  worldName: string;
  onDuplicateComplete?: (newWorldId: string) => void;
}

export function WorldDuplicateDialog({
  open,
  onOpenChange,
  worldId,
  worldName,
  onDuplicateComplete,
}: WorldDuplicateDialogProps) {
  const [newName, setNewName] = useState(`${worldName} (Copy)`);
  const [targetLanguage, setTargetLanguage] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [duplicating, setDuplicating] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setNewName(`${worldName} (Copy)`);
      setTargetLanguage('');
      setAdditionalInstructions('');
      setDuplicating(false);
      setTaskId(null);
      setProgress(0);
      setProgressMessage('');
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [open, worldName]);

  // Poll for progress
  useEffect(() => {
    if (!taskId) return;
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/progress/${taskId}`);
        if (!res.ok) return;
        const data = await res.json();
        setProgress(data.progress || 0);
        setProgressMessage(data.message || '');
        if (data.completed) {
          if (pollRef.current) clearInterval(pollRef.current);
          setDuplicating(false);
          if (data.error) {
            toast({ title: 'Duplication failed', description: data.error, variant: 'destructive' });
          } else {
            toast({ title: 'World duplicated', description: `"${newName}" is ready.` });
            onOpenChange(false);
            if (data.details?.newWorldId) {
              onDuplicateComplete?.(data.details.newWorldId);
            }
          }
        }
      } catch {
        // ignore polling errors
      }
    }, 1500);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [taskId]);

  const handleDuplicate = async () => {
    setDuplicating(true);
    setProgress(0);
    setProgressMessage('Starting duplication...');
    try {
      const res = await fetch(`/api/worlds/${worldId}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newName,
          targetLanguage: targetLanguage || undefined,
          additionalInstructions: additionalInstructions || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to start duplication');
      }
      const data = await res.json();
      setTaskId(data.taskId);
    } catch (error: any) {
      setDuplicating(false);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={duplicating ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="w-5 h-5" />
            Duplicate World
          </DialogTitle>
          <DialogDescription>
            Create a copy of "{worldName}" with optional modifications.
            Use target language to translate all world content via AI.
          </DialogDescription>
        </DialogHeader>

        {duplicating ? (
          <div className="py-6 space-y-4">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">{progressMessage}</p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="duplicate-name">New World Name</Label>
              <Input
                id="duplicate-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter name for the duplicated world"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-language">Target Language (optional)</Label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Keep original language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Keep original language</SelectItem>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                AI will translate character names, place names, descriptions, items, quests, and more.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional-instructions">Additional Instructions (optional)</Label>
              <Textarea
                id="additional-instructions"
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                placeholder="e.g., Set all characters in Mexico City instead of Paris, change the time period to modern day..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Give the AI specific instructions for how to modify the world content beyond language.
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={duplicating}>
            Cancel
          </Button>
          <Button onClick={handleDuplicate} disabled={duplicating || !newName.trim()}>
            {duplicating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Duplicating...
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
