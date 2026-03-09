/**
 * Prolog Simulation Panel
 *
 * Main panel combining all Prolog testing and simulation tools:
 * - Scenario testing
 * - What-if queries
 * - Consistency checking
 * - Coverage reports
 * - Predicate usage analytics
 * - Predicate relationship graph
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  TestTube2, FlaskConical, ShieldCheck, FileSearch, BarChart3, Network,
} from 'lucide-react';

import { PrologScenarioTester } from './PrologScenarioTester';
import { PrologWhatIfQuery } from './PrologWhatIfQuery';
import { PrologConsistencyChecker } from './PrologConsistencyChecker';
import { PrologCoverageReport } from './PrologCoverageReport';
import { PredicateUsageAnalytics } from './PredicateUsageAnalytics';
import { PredicateRelationshipGraph } from './PredicateRelationshipGraph';

interface PrologSimulationPanelProps {
  worldId: string;
}

export function PrologSimulationPanel({ worldId }: PrologSimulationPanelProps) {
  return (
    <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm rounded-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <TestTube2 className="h-5 w-5 text-blue-500" />
          Prolog Simulation & Testing
        </CardTitle>
        <CardDescription>
          Test scenarios, check consistency, and analyze predicate usage in your world's knowledge base
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="scenarios" className="w-full">
          <TabsList className="grid w-full grid-cols-6 h-9">
            <TabsTrigger value="scenarios" className="text-[11px] gap-1">
              <TestTube2 className="w-3 h-3" />
              Tests
            </TabsTrigger>
            <TabsTrigger value="whatif" className="text-[11px] gap-1">
              <FlaskConical className="w-3 h-3" />
              What-If
            </TabsTrigger>
            <TabsTrigger value="consistency" className="text-[11px] gap-1">
              <ShieldCheck className="w-3 h-3" />
              Check
            </TabsTrigger>
            <TabsTrigger value="coverage" className="text-[11px] gap-1">
              <FileSearch className="w-3 h-3" />
              Coverage
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-[11px] gap-1">
              <BarChart3 className="w-3 h-3" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="graph" className="text-[11px] gap-1">
              <Network className="w-3 h-3" />
              Graph
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scenarios" className="mt-4">
            <PrologScenarioTester worldId={worldId} />
          </TabsContent>

          <TabsContent value="whatif" className="mt-4">
            <PrologWhatIfQuery worldId={worldId} />
          </TabsContent>

          <TabsContent value="consistency" className="mt-4">
            <PrologConsistencyChecker worldId={worldId} />
          </TabsContent>

          <TabsContent value="coverage" className="mt-4">
            <PrologCoverageReport worldId={worldId} />
          </TabsContent>

          <TabsContent value="analytics" className="mt-4">
            <div className="h-[400px] border rounded-lg overflow-hidden">
              <PredicateUsageAnalytics worldId={worldId} />
            </div>
          </TabsContent>

          <TabsContent value="graph" className="mt-4">
            <PredicateRelationshipGraph worldId={worldId} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
