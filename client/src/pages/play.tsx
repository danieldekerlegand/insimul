import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { BabylonWorld } from '@/components/3DGame/BabylonWorld';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Play, Plus, Clock, Calendar, Loader2, LogIn, UserPlus, LogOut, Save, MessageSquare, Trash2,
} from 'lucide-react';

interface SaveSummary {
  id: string;
  slotIndex: number;
  name: string;
  status: string;
  totalPlaytime: number;
  saveCount: number;
  createdAt: string;
  lastSavedAt: string;
  worldName?: string;
  conversationCount: number;
}

interface WorldInfo {
  id: string;
  name: string;
  description?: string;
  config?: { worldType?: string };
}

export default function PlayPage() {
  const [, params] = useRoute('/play/:worldId');
  const worldId = params?.worldId || '';

  const { user, token, login, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // World info
  const [world, setWorld] = useState<WorldInfo | null>(null);
  const [worldLoading, setWorldLoading] = useState(true);
  const [worldError, setWorldError] = useState<string | null>(null);

  // Save file state
  const [saves, setSaves] = useState<SaveSummary[]>([]);
  const [savesLoading, setSavesLoading] = useState(false);
  const [activeSaveId, setActiveSaveId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newSaveName, setNewSaveName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<SaveSummary | null>(null);

  // Auth form state
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });

  // Fetch world info
  useEffect(() => {
    if (!worldId) return;
    setWorldLoading(true);
    const headers: Record<string, string> = {};
    const storedToken = localStorage.getItem('insimul_token');
    if (storedToken) headers['Authorization'] = `Bearer ${storedToken}`;
    fetch(`/api/worlds/${encodeURIComponent(worldId)}`, { headers })
      .then(async (res) => {
        if (!res.ok) throw new Error('World not found');
        return res.json();
      })
      .then((data) => setWorld(data))
      .catch(() => setWorldError('This world could not be found or is not accessible.'))
      .finally(() => setWorldLoading(false));
  }, [worldId, isAuthenticated]);

  // Fetch save files when authenticated
  useEffect(() => {
    if (!isAuthenticated || !token || !worldId) return;
    loadSaves();
  }, [isAuthenticated, token, worldId]);

  const loadSaves = async () => {
    if (!token) return;
    try {
      setSavesLoading(true);
      const res = await fetch(`/api/worlds/${worldId}/saves`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSaves(await res.json());
      }
    } catch (err) {
      console.error('Failed to load saves:', err);
    } finally {
      setSavesLoading(false);
    }
  };

  // Auth mutations
  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Login failed');
      }
      return res.json();
    },
    onSuccess: (data) => {
      login(data.user, data.token);
      toast({ title: 'Welcome back!', description: 'Successfully logged in' });
    },
    onError: (error: any) => {
      toast({ title: 'Login failed', description: error.message, variant: 'destructive' });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: { username: string; email: string; password: string; displayName?: string }) => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Registration failed');
      }
      return res.json();
    },
    onSuccess: (data) => {
      login(data.user, data.token);
      toast({ title: 'Welcome!', description: 'Your account has been created' });
    },
    onError: (error: any) => {
      toast({ title: 'Registration failed', description: error.message, variant: 'destructive' });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.username || !loginForm.password) {
      toast({ title: 'Missing fields', description: 'Please enter both username and password', variant: 'destructive' });
      return;
    }
    loginMutation.mutate(loginForm);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.username || !registerForm.email || !registerForm.password) {
      toast({ title: 'Missing fields', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      toast({ title: 'Password mismatch', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (registerForm.password.length < 6) {
      toast({ title: 'Weak password', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    registerMutation.mutate({
      username: registerForm.username,
      email: registerForm.email,
      password: registerForm.password,
      displayName: registerForm.displayName || registerForm.username,
    });
  };

  // Save file actions
  const handleStartNew = async () => {
    if (!token) return;
    try {
      setCreating(true);
      const res = await fetch(`/api/worlds/${worldId}/saves/new-game`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSaveName.trim() || `${world?.name || 'World'} - New Game` }),
      });
      if (res.ok) {
        const save = await res.json();
        setShowNewDialog(false);
        setNewSaveName('');
        setActiveSaveId(save.id);
      } else {
        const err = await res.json().catch(() => ({}));
        toast({ title: 'Error', description: err.error || 'Failed to start new game', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to start new game', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteSave = async () => {
    if (!deleteTarget || !token) return;
    try {
      const res = await fetch(`/api/saves/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSaves(prev => prev.filter(s => s.id !== deleteTarget.id));
        toast({ title: 'Deleted', description: `"${deleteTarget.name}" has been deleted` });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete save', variant: 'destructive' });
    } finally {
      setDeleteTarget(null);
    }
  };

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  // --- RENDER: Loading ---
  if (worldLoading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // --- RENDER: World not found ---
  if (worldError || !world) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">World Not Found</h2>
            <p className="text-muted-foreground">{worldError || 'This world does not exist or is not accessible.'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- RENDER: Game is active ---
  if (isAuthenticated && activeSaveId) {
    return (
      <BabylonWorld
        worldId={worldId}
        worldName={world.name}
        worldType={world.config?.worldType}
        userId={user?.id}
        saveId={activeSaveId}
        onBack={() => {
          setActiveSaveId(null);
          loadSaves(); // Refresh save list after playing
        }}
      />
    );
  }

  // --- RENDER: Auth + Save selection ---
  const activeSaves = saves.filter((s) => s.status === 'active');

  return (
    <div className="min-h-screen bg-background">
      {/* Header bar */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {world.name}
            </h1>
            {world.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{world.description}</p>
            )}
          </div>
          {isAuthenticated && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {user?.displayName || user?.username}
              </span>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-1" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* --- Not authenticated: show login/register --- */}
        {!isAuthenticated && (
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold mb-1">Sign in to Play</h2>
                  <p className="text-sm text-muted-foreground">
                    Log in or create an account to start playing {world.name}
                  </p>
                </div>

                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-username">Username</Label>
                        <Input
                          id="login-username"
                          placeholder="Enter your username"
                          value={loginForm.username}
                          onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                          autoComplete="username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="Enter your password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          autoComplete="current-password"
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                        <LogIn className="w-4 h-4 mr-2" />
                        {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-username">Username *</Label>
                        <Input
                          id="register-username"
                          placeholder="Choose a username"
                          value={registerForm.username}
                          onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                          autoComplete="username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-email">Email *</Label>
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="your@email.com"
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                          autoComplete="email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-displayname">Display Name</Label>
                        <Input
                          id="register-displayname"
                          placeholder="How you'll appear in-game"
                          value={registerForm.displayName}
                          onChange={(e) => setRegisterForm({ ...registerForm, displayName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-password">Password *</Label>
                        <Input
                          id="register-password"
                          type="password"
                          placeholder="At least 6 characters"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                          autoComplete="new-password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-confirm">Confirm Password *</Label>
                        <Input
                          id="register-confirm"
                          type="password"
                          placeholder="Re-enter password"
                          value={registerForm.confirmPassword}
                          onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                          autoComplete="new-password"
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        {registerMutation.isPending ? 'Creating account...' : 'Create Account'}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}

        {/* --- Authenticated: show save file selector --- */}
        {isAuthenticated && !activeSaveId && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Saved Games</h2>
                <p className="text-sm text-muted-foreground">
                  Select a save to resume or start a new game
                </p>
              </div>
              <Button onClick={() => setShowNewDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Game
              </Button>
            </div>

            {savesLoading && (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {!savesLoading && saves.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Play className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-lg font-medium mb-2">No saved games yet</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start a new game to explore {world.name}
                  </p>
                  <Button onClick={() => setShowNewDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Start Playing
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeSaves.length > 0 && (
              <div className="space-y-3">
                {activeSaves.map((save) => (
                  <Card key={save.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-lg truncate">
                              {save.name}
                            </h4>
                            <Badge variant="default">
                              {save.saveCount} save{save.saveCount !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {formatDuration(save.totalPlaytime)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              Started {formatDate(save.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Save className="w-3.5 h-3.5" />
                              Last saved {formatDate(save.lastSavedAt)}
                            </span>
                            {save.conversationCount > 0 && (
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3.5 h-3.5" />
                                {save.conversationCount} conversation{save.conversationCount !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteTarget(save)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" onClick={() => setActiveSaveId(save.id)}>
                            <Play className="w-4 h-4 mr-1" />
                            Resume
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Game Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Game</DialogTitle>
            <DialogDescription>Start a new adventure in {world.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="save-name">Save Name (optional)</Label>
              <Input
                id="save-name"
                value={newSaveName}
                onChange={(e) => setNewSaveName(e.target.value)}
                placeholder={`${world.name} - New Game`}
                onKeyDown={(e) => e.key === 'Enter' && handleStartNew()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
            <Button onClick={handleStartNew} disabled={creating}>
              {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              Start
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Save</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteTarget?.name}"? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteSave}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
