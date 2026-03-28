/**
 * Admin API Keys Hub
 *
 * Manage API keys across all worlds. Supports creating, viewing (with
 * show/hide toggle), copying, and revoking keys.
 */

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Check, Copy, Eye, EyeOff, Key, Loader2, Plus, Trash2, RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApiKey {
  id: string;
  key: string;
  name: string;
  worldId: string;
  createdAt: string;
  lastUsedAt?: string;
  requestCount?: number;
  isActive?: boolean;
}

interface World {
  id: string;
  name: string;
}

export function AdminApiKeysHub() {
  const { toast } = useToast();

  // World selector
  const [worlds, setWorlds] = useState<World[]>([]);
  const [selectedWorldId, setSelectedWorldId] = useState<string>('');
  const [loadingWorlds, setLoadingWorlds] = useState(true);

  // API keys
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(false);

  // New key form
  const [newKeyName, setNewKeyName] = useState('');
  const [creatingKey, setCreatingKey] = useState(false);

  // UI state
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Fetch worlds on mount
  useEffect(() => {
    fetch('/api/worlds')
      .then(r => r.ok ? r.json() : [])
      .then((data: World[]) => {
        setWorlds(data);
        if (data.length > 0 && !selectedWorldId) {
          setSelectedWorldId(data[0].id);
        }
      })
      .catch(() => setWorlds([]))
      .finally(() => setLoadingWorlds(false));
  }, []);

  // Fetch keys when world changes
  const fetchKeys = useCallback(() => {
    if (!selectedWorldId) return;
    setLoadingKeys(true);
    fetch(`/api/worlds/${selectedWorldId}/api-keys`)
      .then(r => r.ok ? r.json() : [])
      .then((keys: ApiKey[]) => setApiKeys(keys))
      .catch(() => setApiKeys([]))
      .finally(() => setLoadingKeys(false));
  }, [selectedWorldId]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  // Generate new key
  const handleGenerateKey = async () => {
    if (!selectedWorldId) return;
    setCreatingKey(true);
    try {
      const res = await fetch(`/api/worlds/${selectedWorldId}/api-keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName || 'New API Key', worldId: selectedWorldId }),
      });
      if (!res.ok) throw new Error('Failed to generate key');
      const newKey = await res.json();
      setNewKeyName('');
      // Show the full key immediately after creation
      setVisibleKeys(prev => new Set(prev).add(newKey.id));
      fetchKeys();
      toast({ title: 'API Key Generated', description: 'Copy the key now - it will be masked on next load.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to generate API key.', variant: 'destructive' });
    } finally {
      setCreatingKey(false);
    }
  };

  // Revoke key
  const handleRevokeKey = async (keyId: string) => {
    if (!selectedWorldId) return;
    try {
      const res = await fetch(`/api/worlds/${selectedWorldId}/api-keys/${keyId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to revoke key');
      fetchKeys();
      toast({ title: 'API Key Revoked' });
    } catch {
      toast({ title: 'Error', description: 'Failed to revoke API key.', variant: 'destructive' });
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => {
      const next = new Set(prev);
      if (next.has(keyId)) next.delete(keyId);
      else next.add(keyId);
      return next;
    });
  };

  const copyKey = (key: string, keyId: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (loadingWorlds) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* World selector + refresh */}
      <div className="flex items-center gap-3">
        <div className="flex-1 max-w-xs">
          <Label className="text-xs mb-1 block">World</Label>
          <Select value={selectedWorldId} onValueChange={setSelectedWorldId}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select a world" />
            </SelectTrigger>
            <SelectContent>
              {worlds.map(w => (
                <SelectItem key={w.id} value={w.id}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 mt-5"
          onClick={fetchKeys}
          disabled={loadingKeys}
        >
          <RefreshCw className={`w-4 h-4 ${loadingKeys ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* New key form */}
      <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Generate New API Key
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Key Name</Label>
              <Input
                placeholder="e.g., Production Godot Build"
                value={newKeyName}
                onChange={e => setNewKeyName(e.target.value)}
                className="h-8 text-sm"
                onKeyDown={e => e.key === 'Enter' && handleGenerateKey()}
              />
            </div>
            <Button
              onClick={handleGenerateKey}
              disabled={creatingKey || !selectedWorldId}
              className="h-8 text-xs"
            >
              {creatingKey ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Key className="w-3 h-3 mr-1" />
              )}
              Generate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Keys list */}
      {loadingKeys ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : apiKeys.length === 0 ? (
        <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
          <CardContent className="py-8 text-center text-muted-foreground">
            <Key className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No API keys for this world yet.</p>
            <p className="text-xs mt-1">Generate one above to start receiving telemetry from exported games.</p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="max-h-[500px]">
          <div className="space-y-2">
            {apiKeys.map(apiKey => (
              <Card
                key={apiKey.id}
                className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl"
              >
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{apiKey.name || 'Unnamed Key'}</span>
                        {apiKey.requestCount !== undefined && apiKey.requestCount > 0 && (
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            {apiKey.requestCount} requests
                          </Badge>
                        )}
                      </div>

                      {/* Key display with copy/show */}
                      <div className="flex items-center gap-1.5">
                        <code className="text-xs bg-black/10 dark:bg-white/10 px-2 py-1 rounded font-mono truncate max-w-[300px]">
                          {visibleKeys.has(apiKey.id) ? apiKey.key : `${apiKey.key.slice(0, 12)}${'*'.repeat(20)}`}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 shrink-0"
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                          title={visibleKeys.has(apiKey.id) ? 'Hide key' : 'Show key'}
                        >
                          {visibleKeys.has(apiKey.id) ? (
                            <EyeOff className="w-3 h-3" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 shrink-0"
                          onClick={() => copyKey(apiKey.key, apiKey.id)}
                          title="Copy to clipboard"
                        >
                          {copiedKey === apiKey.id ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>

                      <div className="text-[10px] text-muted-foreground">
                        Created {new Date(apiKey.createdAt).toLocaleDateString()}
                        {apiKey.lastUsedAt && ` · Last used ${new Date(apiKey.lastUsedAt).toLocaleDateString()}`}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 h-8 shrink-0"
                      onClick={() => handleRevokeKey(apiKey.id)}
                      title="Revoke this key"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Revoke
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Usage guide */}
      <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
        <CardHeader className="pb-1">
          <CardTitle className="text-xs text-muted-foreground">Usage</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1.5 pb-3">
          <p>API keys authenticate exported games when they send telemetry data back to Insimul.</p>
          <ol className="list-decimal list-inside space-y-0.5">
            <li>Generate a key here for the target world</li>
            <li>When exporting, expand "Insimul API Configuration" and select the key</li>
            <li>The key will be embedded in the exported project's telemetry client</li>
            <li>Monitor incoming data in the Telemetry dashboard</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
