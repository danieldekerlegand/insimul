import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Mic,
  FileText,
  Clock,
  User,
  Bot,
  Monitor,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface TranscriptEntry {
  role: 'player' | 'npc' | 'system';
  text: string;
  timestamp: number;
  phaseId: string;
  taskId?: string;
}

interface PhaseTranscript {
  phaseId: string;
  entries: TranscriptEntry[];
  startedAt?: string;
  completedAt?: string;
}

interface TranscriptResponse {
  sessionId: string;
  transcripts: PhaseTranscript[];
}

interface RecordingRef {
  storageKey: string;
  mimeType: string;
  durationSeconds?: number;
  phaseId: string;
  taskId?: string;
  recordedAt: string;
}

interface RecordingsResponse {
  sessionId: string;
  recordings: RecordingRef[];
  phaseRecordings: RecordingRef[];
}

// ─── Phase label mapping ─────────────────────────────────────────────────────

const PHASE_LABELS: Record<string, { label: string; icon: typeof MessageSquare; color: string }> = {
  conversational: { label: 'Conversational', icon: MessageSquare, color: 'text-blue-500' },
  listening: { label: 'Listening', icon: Mic, color: 'text-emerald-500' },
  writing: { label: 'Writing', icon: FileText, color: 'text-amber-500' },
  visual: { label: 'Visual', icon: Monitor, color: 'text-violet-500' },
};

function getPhaseLabel(phaseId: string) {
  for (const [key, meta] of Object.entries(PHASE_LABELS)) {
    if (phaseId.toLowerCase().includes(key)) return meta;
  }
  return { label: phaseId, icon: FileText, color: 'text-gray-500' };
}

// ─── Role icon ───────────────────────────────────────────────────────────────

const ROLE_ICONS: Record<string, { icon: typeof User; color: string; bg: string }> = {
  player: { icon: User, color: 'text-blue-600', bg: 'bg-blue-500/10' },
  npc: { icon: Bot, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
  system: { icon: Monitor, color: 'text-gray-500', bg: 'bg-gray-500/10' },
};

// ─── Transcript Entry Row ────────────────────────────────────────────────────

function TranscriptEntryRow({ entry }: { entry: TranscriptEntry }) {
  const role = ROLE_ICONS[entry.role] || ROLE_ICONS.system;
  const Icon = role.icon;

  return (
    <div className="flex gap-3 py-2">
      <div className={`p-1.5 rounded-lg ${role.bg} flex-shrink-0 mt-0.5`}>
        <Icon className={`w-3.5 h-3.5 ${role.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-medium capitalize">{entry.role}</span>
          {entry.taskId && (
            <Badge variant="outline" className="text-[10px] h-4 px-1">{entry.taskId}</Badge>
          )}
          <span className="text-[10px] text-muted-foreground ml-auto">
            {new Date(entry.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <p className="text-sm whitespace-pre-wrap break-words">{entry.text}</p>
      </div>
    </div>
  );
}

// ─── Phase Section ───────────────────────────────────────────────────────────

function PhaseSection({ phase }: { phase: PhaseTranscript }) {
  const [expanded, setExpanded] = useState(true);
  const meta = getPhaseLabel(phase.phaseId);
  const Icon = meta.icon;

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
      >
        <div className="text-muted-foreground">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
        <Icon className={`w-4 h-4 ${meta.color}`} />
        <span className="font-medium text-sm">{meta.label}</span>
        <Badge variant="secondary" className="text-xs">{phase.entries.length} entries</Badge>
        {phase.startedAt && phase.completedAt && (
          <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(phase.startedAt).toLocaleTimeString()} — {new Date(phase.completedAt).toLocaleTimeString()}
          </span>
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-white/5 space-y-1 divide-y divide-white/5">
          {phase.entries.map((entry, i) => (
            <TranscriptEntryRow key={`${entry.phaseId}-${i}`} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Recording Card ──────────────────────────────────────────────────────────

function RecordingCard({ recording }: { recording: RecordingRef }) {
  const meta = getPhaseLabel(recording.phaseId);

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/20 text-sm">
      <Mic className={`w-4 h-4 ${meta.color} flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        <span className="font-medium truncate block">{recording.storageKey}</span>
        <span className="text-xs text-muted-foreground">{recording.mimeType}</span>
      </div>
      {recording.durationSeconds != null && (
        <span className="text-xs text-muted-foreground flex-shrink-0">
          {Math.floor(recording.durationSeconds / 60)}:{String(recording.durationSeconds % 60).padStart(2, '0')}
        </span>
      )}
      <span className="text-xs text-muted-foreground flex-shrink-0">
        {new Date(recording.recordedAt).toLocaleString()}
      </span>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface AssessmentTranscriptViewerProps {
  sessionId: string;
}

export function AssessmentTranscriptViewer({ sessionId }: AssessmentTranscriptViewerProps) {
  const { data: transcriptData, isLoading: transcriptLoading } = useQuery<TranscriptResponse>({
    queryKey: ['/api/assessments', sessionId, 'transcripts'],
    queryFn: async () => {
      const res = await fetch(`/api/assessments/${sessionId}/transcripts`);
      if (!res.ok) throw new Error('Failed to fetch transcripts');
      return res.json();
    },
    enabled: !!sessionId,
  });

  const { data: recordingsData, isLoading: recordingsLoading } = useQuery<RecordingsResponse>({
    queryKey: ['/api/assessments', sessionId, 'recordings-list'],
    queryFn: async () => {
      const res = await fetch(`/api/assessments/${sessionId}/recordings-list`);
      if (!res.ok) throw new Error('Failed to fetch recordings');
      return res.json();
    },
    enabled: !!sessionId,
  });

  const isLoading = transcriptLoading || recordingsLoading;

  if (isLoading) {
    return <div className="text-sm text-muted-foreground py-4">Loading transcripts...</div>;
  }

  const hasTranscripts = transcriptData && transcriptData.transcripts.length > 0;
  const allRecordings = [
    ...(recordingsData?.recordings || []),
    ...(recordingsData?.phaseRecordings || []),
  ];
  const hasRecordings = allRecordings.length > 0;

  if (!hasTranscripts && !hasRecordings) {
    return (
      <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-xl">
        <CardContent className="py-8 text-center">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No transcripts or recordings for this session.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Transcripts */}
      {hasTranscripts && (
        <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Phase Transcripts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {transcriptData!.transcripts.map(phase => (
              <PhaseSection key={phase.phaseId} phase={phase} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recordings */}
      {hasRecordings && (
        <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Mic className="w-4 h-4" />
              Recordings ({allRecordings.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {allRecordings.map((rec, i) => (
              <RecordingCard key={`${rec.storageKey}-${i}`} recording={rec} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
