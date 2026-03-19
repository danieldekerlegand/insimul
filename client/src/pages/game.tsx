import { useState, useEffect, useCallback } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { BabylonWorld } from '@/components/3DGame/BabylonWorld';
import { AuthDialog } from '@/components/AuthDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Loader2, Play, Globe, Lock,
} from 'lucide-react';

interface WorldInfo {
  id: string;
  name: string;
  description?: string;
  worldType?: string;
  visibility?: string;
  config?: { worldType?: string };
}

interface Playthrough {
  id: string;
  userId: string;
  worldId: string;
  name?: string;
  status: string;
  lastPlayedAt?: string;
}

type GamePhase = 'world-select' | 'loading' | 'playing';

export default function GamePage() {
  const [, params] = useRoute('/game/:worldId');
  const urlWorldId = params?.worldId;
  const [, navigate] = useLocation();

  const { user, token, login, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [phase, setPhase] = useState<GamePhase>(urlWorldId ? 'loading' : 'world-select');
  const [worlds, setWorlds] = useState<WorldInfo[]>([]);
  const [worldsLoading, setWorldsLoading] = useState(true);
  const [selectedWorldId, setSelectedWorldId] = useState<string | null>(urlWorldId || null);
  const [selectedWorldName, setSelectedWorldName] = useState<string>('');
  const [selectedWorldType, setSelectedWorldType] = useState<string | undefined>();
  const [playthroughId, setPlaythroughId] = useState<string | null>(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available worlds for the selector
  useEffect(() => {
    if (authLoading) return;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    fetch('/api/worlds', { headers })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load worlds');
        return res.json();
      })
      .then((data: WorldInfo[]) => setWorlds(data))
      .catch(() => toast({ title: 'Error', description: 'Failed to load worlds', variant: 'destructive' }))
      .finally(() => setWorldsLoading(false));
  }, [authLoading, token]);

  // Auto-resolve playthrough when a world is selected and user is authenticated
  const resolvePlaythrough = useCallback(async (worldId: string) => {
    if (!token) return;
    setPhase('loading');
    setError(null);

    try {
      // Try to find existing active/paused playthrough
      const res = await fetch(`/api/worlds/${worldId}/playthroughs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load playthroughs');

      const playthroughs: Playthrough[] = await res.json();

      // Prefer active, then paused, sorted by most recently played
      const sorted = playthroughs
        .filter((p) => p.status === 'active' || p.status === 'paused')
        .sort((a, b) => {
          // Active before paused
          if (a.status !== b.status) return a.status === 'active' ? -1 : 1;
          // Most recently played first
          const aDate = a.lastPlayedAt ? new Date(a.lastPlayedAt).getTime() : 0;
          const bDate = b.lastPlayedAt ? new Date(b.lastPlayedAt).getTime() : 0;
          return bDate - aDate;
        });

      if (sorted.length > 0) {
        // Resume the most recent active/paused playthrough
        setPlaythroughId(sorted[0].id);
        setPhase('playing');
        return;
      }

      // No existing playthrough — create one automatically
      const world = worlds.find((w) => w.id === worldId);
      const createRes = await fetch(`/api/worlds/${worldId}/playthroughs/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `${world?.name || 'World'} Playthrough` }),
      });
      if (!createRes.ok) throw new Error('Failed to create playthrough');

      const newPlaythrough = await createRes.json();
      setPlaythroughId(newPlaythrough.id);
      setPhase('playing');
    } catch (err: any) {
      setError(err.message || 'Failed to start game');
      setPhase('world-select');
      toast({ title: 'Error', description: err.message || 'Failed to start game', variant: 'destructive' });
    }
  }, [token, worlds, toast]);

  // When worldId comes from URL, resolve as soon as auth is ready
  useEffect(() => {
    if (authLoading || !urlWorldId) return;
    if (!isAuthenticated) {
      setAuthDialogOpen(true);
      return;
    }
    // Populate world info from loaded worlds
    const world = worlds.find((w) => w.id === urlWorldId);
    if (world) {
      setSelectedWorldName(world.name);
      setSelectedWorldType(world.config?.worldType || world.worldType);
    }
    if (phase === 'loading' && !playthroughId) {
      resolvePlaythrough(urlWorldId);
    }
  }, [authLoading, isAuthenticated, urlWorldId, worlds, phase, playthroughId, resolvePlaythrough]);

  const handleSelectWorld = (world: WorldInfo) => {
    if (!isAuthenticated) {
      setAuthDialogOpen(true);
      return;
    }
    setSelectedWorldId(world.id);
    setSelectedWorldName(world.name);
    setSelectedWorldType(world.config?.worldType || world.worldType);
    navigate(`/game/${world.id}`);
    resolvePlaythrough(world.id);
  };

  const handleBack = () => {
    setPhase('world-select');
    setSelectedWorldId(null);
    setPlaythroughId(null);
    setError(null);
    navigate('/game');
  };

  // --- RENDER: Game is playing ---
  if (phase === 'playing' && selectedWorldId && playthroughId) {
    return (
      <BabylonWorld
        worldId={selectedWorldId}
        worldName={selectedWorldName}
        worldType={selectedWorldType}
        userId={user?.id}
        playthroughId={playthroughId}
        onBack={handleBack}
      />
    );
  }

  // --- RENDER: Loading / resolving playthrough ---
  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Preparing your adventure...</p>
      </div>
    );
  }

  // --- RENDER: World selection ---
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Play a World</h1>
          </div>
          {isAuthenticated && (
            <span className="text-sm text-muted-foreground">
              {user?.displayName || user?.username}
            </span>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {(worldsLoading || authLoading) ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : worlds.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium mb-2">No worlds available</p>
              <p className="text-sm text-muted-foreground">
                Create a world in the editor to start playing.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {worlds.map((world) => (
              <Card
                key={world.id}
                className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all group"
                onClick={() => handleSelectWorld(world)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors truncate">
                      {world.name}
                    </h3>
                    {world.visibility === 'private' && (
                      <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
                    )}
                  </div>
                  {world.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {world.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    {(world.config?.worldType || world.worldType) && (
                      <Badge variant="secondary" className="text-xs">
                        {world.config?.worldType || world.worldType}
                      </Badge>
                    )}
                    <div className="flex-1" />
                    <Play className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-6 text-center">
            <p className="text-sm text-destructive mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={() => setError(null)}>
              Dismiss
            </Button>
          </div>
        )}
      </div>

      <AuthDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        onAuthSuccess={(user, authToken) => {
          login(user, authToken);
          // If a world was already selected, continue the flow
          if (selectedWorldId) {
            resolvePlaythrough(selectedWorldId);
          }
        }}
      />
    </div>
  );
}
