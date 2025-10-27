import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface ProgressUpdate {
  taskId: string;
  stage: string;
  message: string;
  progress: number;
  details?: Record<string, any>;
  completed: boolean;
  error?: string;
  timestamp: Date;
}

interface GenerationProgressDialogProps {
  open: boolean;
  taskId: string | null;
  onComplete: (success: boolean) => void;
}

export function GenerationProgressDialog({ open, taskId, onComplete }: GenerationProgressDialogProps) {
  const [progress, setProgress] = useState<ProgressUpdate | null>(null);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (!open || !taskId) {
      setProgress(null);
      setPolling(false);
      return;
    }

    setPolling(true);
    
    // Poll for progress updates
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/progress/${taskId}`);
        if (response.ok) {
          const data = await response.json();
          setProgress(data);
          
          if (data.completed) {
            setPolling(false);
            clearInterval(pollInterval);
            // Give user time to see completion message
            setTimeout(() => {
              onComplete(!data.error);
            }, 2000);
          }
        } else if (response.status === 404) {
          // Task not found yet, keep polling
        }
      } catch (error) {
        console.error('Failed to fetch progress:', error);
      }
    }, 1000); // Poll every second

    return () => {
      clearInterval(pollInterval);
    };
  }, [open, taskId, onComplete]);

  if (!open) return null;

  const getStageIcon = () => {
    if (progress?.error) {
      return <XCircle className="w-6 h-6 text-red-500" />;
    }
    if (progress?.completed) {
      return <CheckCircle2 className="w-6 h-6 text-green-500" />;
    }
    return <Loader2 className="w-6 h-6 animate-spin text-blue-500" />;
  };

  const getStageDescription = (stage: string) => {
    const stages: Record<string, string> = {
      'initializing': '🔧 Initializing',
      'geography': '🗺️ Creating Geography',
      'geography-complete': '✅ Geography Complete',
      'truths': '📖 Creating Character Truths',
      'truths-complete': '✅ Character Truths Complete',
      'rules': '📜 Generating Rules',
      'rules-complete': '✅ Rules Complete',
      'actions': '⚔️ Generating Actions',
      'actions-complete': '✅ Actions Complete',
      'quests': '🎯 Generating Quests',
      'quests-complete': '✅ Quests Complete',
      'completed': '🎉 Generation Complete!',
      'failed': '❌ Generation Failed',
    };
    return stages[stage] || stage;
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStageIcon()}
            Generating World
          </DialogTitle>
          <DialogDescription>
            {progress?.error ? 'An error occurred during generation' : 'Please wait while we create your world...'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">
                {progress ? getStageDescription(progress.stage) : 'Initializing...'}
              </span>
              <span className="text-muted-foreground">{progress?.progress || 0}%</span>
            </div>
            <Progress value={progress?.progress || 0} className="h-2" />
          </div>

          <div className="text-sm text-muted-foreground">
            {progress?.message || 'Starting generation...'}
          </div>

          {progress?.error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
              <p className="font-medium">Error:</p>
              <p>{progress.error}</p>
            </div>
          )}

          {progress?.details && Object.keys(progress.details).length > 0 && (
            <div className="rounded-md bg-blue-50 p-3 text-sm">
              {Object.entries(progress.details).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-blue-900 font-medium">{key}:</span>
                  <span className="text-blue-700">{String(value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
