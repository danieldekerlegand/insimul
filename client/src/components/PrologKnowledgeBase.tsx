import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Brain, Plus, Search, Trash2, Save, Upload, Download, List, RefreshCw } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PrologKnowledgeBaseProps {
  worldId?: string;
}

interface QueryResult {
  [key: string]: any;
}

export function PrologKnowledgeBase({ worldId }: PrologKnowledgeBaseProps) {
  const [facts, setFacts] = useState<string[]>([]);
  const [newFact, setNewFact] = useState('');
  const [newRule, setNewRule] = useState('');
  const [query, setQuery] = useState('');
  const [queryResults, setQueryResults] = useState<QueryResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load facts on mount
  useEffect(() => {
    loadFacts();
  }, [worldId]);

  const loadFacts = async () => {
    try {
      const params = worldId ? `?worldId=${worldId}` : '';
      const response = await fetch(`/api/prolog/facts${params}`);
      const data = await response.json();

      if (data.status === 'success') {
        setFacts(data.facts);
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to load facts',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load facts',
        variant: 'destructive',
      });
    }
  };

  const addFact = async () => {
    if (!newFact.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/prolog/facts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fact: newFact, worldId }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        toast({
          title: 'Success',
          description: 'Fact added successfully',
        });
        setNewFact('');
        await loadFacts();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to add fact',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add fact',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addRule = async () => {
    if (!newRule.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/prolog/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rule: newRule, worldId }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        toast({
          title: 'Success',
          description: 'Rule added successfully',
        });
        setNewRule('');
        await loadFacts();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to add rule',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add rule',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const executeQuery = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/prolog/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, worldId }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        setQueryResults(data.results);
        toast({
          title: 'Query Executed',
          description: `Found ${data.count} result(s)`,
        });
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to execute query',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to execute query',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearKnowledgeBase = async () => {
    if (!confirm('Are you sure you want to clear the entire knowledge base? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/prolog/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worldId }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        toast({
          title: 'Success',
          description: 'Knowledge base cleared',
        });
        await loadFacts();
        setQueryResults([]);
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to clear knowledge base',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear knowledge base',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveKnowledgeBase = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/prolog/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worldId }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        toast({
          title: 'Success',
          description: 'Knowledge base saved',
        });
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to save knowledge base',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save knowledge base',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadKnowledgeBase = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/prolog/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worldId }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        toast({
          title: 'Success',
          description: 'Knowledge base loaded',
        });
        await loadFacts();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to load knowledge base',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load knowledge base',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const syncFromDatabase = async () => {
    if (!worldId) {
      toast({
        title: 'Error',
        description: 'World ID is required for syncing',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/prolog/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worldId }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        toast({
          title: 'Sync Complete',
          description: `Synced ${data.factsCount} facts from database to Prolog`,
        });
        await loadFacts();
      } else {
        toast({
          title: 'Sync Failed',
          description: data.message || 'Failed to sync from database',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sync from database',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportKnowledgeBase = async () => {
    try {
      const params = worldId ? `?worldId=${worldId}` : '';
      const response = await fetch(`/api/prolog/export${params}`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = worldId ? `knowledge_base_${worldId}.pl` : 'knowledge_base.pl';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: 'Success',
          description: 'Knowledge base exported',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to export knowledge base',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export knowledge base',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Prolog Knowledge Base Manager
          </CardTitle>
          <CardDescription>
            Manage Prolog facts, rules, and execute queries. {facts.length} statements loaded.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Fact Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Add Fact</label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., likes(john, pizza)"
                value={newFact}
                onChange={(e) => setNewFact(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addFact()}
              />
              <Button onClick={addFact} disabled={isLoading}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter a Prolog fact (period is optional)
            </p>
          </div>

          {/* Add Rule Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Add Rule</label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., happy(X) :- likes(X, pizza)"
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addRule()}
              />
              <Button onClick={addRule} disabled={isLoading} variant="secondary">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter a Prolog rule (period is optional)
            </p>
          </div>

          {/* Execute Query Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Execute Query</label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., likes(john, X)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && executeQuery()}
              />
              <Button onClick={executeQuery} disabled={isLoading} variant="default">
                <Search className="h-4 w-4 mr-1" />
                Query
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter a Prolog query (period is optional)
            </p>
          </div>

          {/* Query Results */}
          {queryResults.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Query Results</label>
              <ScrollArea className="h-48 rounded-md border p-4">
                <pre className="text-sm">
                  {JSON.stringify(queryResults, null, 2)}
                </pre>
              </ScrollArea>
            </div>
          )}

          {/* Management Buttons */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Button 
              onClick={syncFromDatabase} 
              variant="default" 
              size="sm"
              disabled={isLoading || !worldId}
              title="Sync world data from database to Prolog"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Sync from DB
            </Button>
            <Button onClick={loadFacts} variant="outline" size="sm">
              <List className="h-4 w-4 mr-1" />
              Refresh Facts
            </Button>
            <Button onClick={exportKnowledgeBase} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button onClick={clearKnowledgeBase} variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </div>

          {/* Facts List */}
          {facts.length > 0 && (
            <div className="space-y-2 pt-4 border-t">
              <label className="text-sm font-medium">
                Current Knowledge Base ({facts.length} statements)
              </label>
              <ScrollArea className="h-64 rounded-md border p-4">
                <div className="space-y-1">
                  {facts.map((fact, index) => (
                    <div key={index} className="text-sm font-mono">
                      <Badge variant={fact.includes(':-') ? 'default' : 'secondary'} className="mr-2">
                        {fact.includes(':-') ? 'Rule' : 'Fact'}
                      </Badge>
                      {fact}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Documentation */}
          <Accordion type="single" collapsible className="border-t pt-4">
            <AccordionItem value="docs">
              <AccordionTrigger>Documentation & Examples</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Sample Facts</h4>
                  <pre className="text-xs bg-muted p-2 rounded">
{`likes(john, pizza).
likes(mary, pasta).
age(john, 25).
age(mary, 30).`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Sample Rules</h4>
                  <pre className="text-xs bg-muted p-2 rounded">
{`happy(X) :- likes(X, pizza).
adult(X) :- age(X, Y), Y >= 18.`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Sample Queries</h4>
                  <pre className="text-xs bg-muted p-2 rounded">
{`likes(john, X)
happy(X)
age(john, Y)`}
                  </pre>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
