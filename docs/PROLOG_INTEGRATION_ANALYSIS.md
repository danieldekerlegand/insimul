# Prolog Integration Analysis and Implementation Plan

## Current State Analysis

### 1. Default Mode Execution

The `InsimulSimulationEngine` in `server/engines/unified-engine.ts` has two execution modes:

```typescript
private async executePrologStep(): Promise<SimulationStepResult> {
    // For now, delegate to default engine
    // In the future, this would:
    // 1. Convert rules to Prolog format
    // 2. Execute via PrologManager
    // 3. Parse results and execute effects
    return await this.executeDefaultStep();
}

private async executeDefaultStep(): Promise<SimulationStepResult> {
    // Executes rules that have parsedContent with effects
    for (const [ruleId, rule] of this.rules) {
        const parsedContent = rule.parsedContent as any;
        if (parsedContent && parsedContent.effects) {
            // Execute effects...
        }
    }
}
```

**Finding**: The "default" mode DOES execute rules, but only those with `parsedContent.effects`. It's not that it executes nothing - it's just a simplified JavaScript-based execution that doesn't use full Prolog reasoning.

### 2. Prolog Infrastructure Status

#### ✅ **Already Exists**:
- **`PrologManager`** (`server/prolog-manager.ts`) - Complete Prolog knowledge base management
  - Add/query facts and rules
  - Execute queries via SWI-Prolog
  - Save/load knowledge bases per world
  - Import/export capabilities

- **`PrologKnowledgeBase`** component (`client/src/components/PrologKnowledgeBase.tsx`)
  - UI for viewing facts/rules
  - Add new facts/rules
  - Execute queries
  - Clear knowledge base
  - **NOT CURRENTLY INTEGRATED** into any page

- **Prolog API Endpoints** (`server/routes.ts`)
  - `/api/prolog/facts` - GET/POST facts
  - `/api/prolog/rules` - POST rules
  - `/api/prolog/query` - Execute queries
  - `/api/prolog/clear` - Clear knowledge base
  - `/api/prolog/save` - Save to file
  - `/api/prolog/load` - Load from file
  - `/api/prolog/export` - Export as .pl file
  - `/api/prolog/import` - Import from string

- **Prolog Conversion** (`client/src/lib/unified-syntax.ts`)
  - `generateSwiProlog()` - Converts Insimul rules to Prolog format
  - `convertRuleToProlog()` - Individual rule conversion
  - `convertConditionToProlog()` - Condition conversion
  - `convertEffectToProlog()` - Effect conversion

### 3. Is Insimul Syntax Compatible with Prolog?

**Answer: YES, with caveats**

#### Compatible Aspects:
1. **Predicate-based conditions** map directly to Prolog predicates
   ```insimul
   when (parent_of(?x, ?y) and noble(?x))
   ```
   →
   ```prolog
   parent_of(X, Y), noble(X)
   ```

2. **Variables** use Prolog-style `?` syntax (converted to uppercase)
3. **Logical operators** (and, or, not) map to Prolog `,`, `;`, `\+`
4. **Rules** map to Prolog clauses with heads and bodies

#### Incompatible/Extended Aspects:
1. **Effects** - Prolog is declarative, not imperative
   - Insimul effects like "set_status" or "inherit_title" need special handling
   - Solution: Convert to Prolog assertions/retractions or use an effects queue

2. **Tracery Integration** - Narrative generation is not native to Prolog
   - Solution: Keep as post-processing step after Prolog reasoning

3. **Database Operations** - Insimul writes to MongoDB/PostgreSQL
   - Solution: Prolog reasons about state, then apply changes to database

4. **Time-step simulation** - Prolog doesn't have built-in temporal logic
   - Solution: Pass timestep as context parameter

### 4. Prolog as the Underlying Engine

#### Original Vision (from docs):
> "Insimul would be a complicated wrapper and management engine for Prolog geared towards social simulation and procedural generation of complex worlds."

This makes sense because:
- **Prolog excels at** logical reasoning, relationships, pattern matching
- **Insimul adds** persistence, visualization, narrative generation, temporal simulation
- **Together**: Powerful social simulation with logical consistency

## Implementation Plan

### Phase 1: Data Synchronization
**Goal**: Ensure Insimul data (characters, locations, relationships) maps 1:1 to Prolog facts

1. **Create Prolog Synchronization Service** (`server/prolog-sync.ts`)
   ```typescript
   class PrologSyncService {
     async syncWorldToProlog(worldId: string): Promise<void>
     async syncCharactersToProlog(worldId: string): Promise<void>
     async syncRelationshipsToProlog(worldId: string): Promise<void>
     async syncLocationsToProlog(worldId: string): Promise<void>
   }
   ```

2. **Generate Facts from Database**
   - Characters → `person(john_smith). age(john_smith, 30). gender(john_smith, male).`
   - Relationships → `parent_of(john, mary). married_to(john, jane).`
   - Locations → `at_location(john, tavern). location_type(tavern, social).`
   - Status → `noble(john). occupation(john, blacksmith).`

3. **Auto-sync on Data Changes**
   - When character created/updated → update Prolog facts
   - When relationship changes → update Prolog facts
   - When simulation runs → sync before execution

### Phase 2: Rule Execution via Prolog
**Goal**: Replace `executeDefaultStep()` with actual Prolog reasoning

1. **Convert Rules to Prolog Format**
   ```typescript
   async function convertRulesToProlog(rules: Rule[]): Promise<string> {
     const compiler = new InsimulRuleCompiler();
     const insimulRules = rules.map(r => compiler.compile(r.content, 'insimul'));
     return compiler.generateSwiProlog(insimulRules.flat());
   }
   ```

2. **Execute via PrologManager**
   ```typescript
   private async executePrologStep(): Promise<SimulationStepResult> {
     // 1. Sync world state to Prolog
     await this.prologSync.syncWorldToProlog(this.context.worldId);
     
     // 2. Add rules to knowledge base
     const prologRules = await this.convertRulesToProlog([...this.rules.values()]);
     await this.prologManager.addRule(prologRules);
     
     // 3. Query for triggered rules
     const triggeredRules = await this.prologManager.query('triggered_rule(Rule)');
     
     // 4. Execute effects from triggered rules
     for (const ruleResult of triggeredRules) {
       await this.applyPrologEffects(ruleResult);
     }
     
     // 5. Apply effects back to database
     await this.applyDatabaseUpdates();
     
     return result;
   }
   ```

3. **Effects Handling**
   - Prolog reasons about WHAT should happen
   - JavaScript applies effects to database
   - Tracery generates narratives from effects

### Phase 3: UI Integration
**Goal**: Make Prolog visible and accessible to users

1. **Add Prolog Tab to Modern UI**
   ```typescript
   // In ModernNavbar.tsx
   const truthItems = [
     { id: 'truth', label: 'Truth System', icon: BookOpen },
     { id: 'prolog', label: 'Prolog Knowledge Base', icon: Brain }, // NEW
   ];
   ```

2. **Integrate PrologKnowledgeBase Component**
   ```typescript
   // In pages/modern.tsx
   {activeTab === 'prolog' && selectedWorld && (
     <PrologKnowledgeBase worldId={selectedWorld} />
   )}
   ```

3. **Add Prolog View to Simulation Results**
   - Show facts used in simulation
   - Show rules that fired
   - Show Prolog queries executed
   - Allow user to manually query

4. **Character Detail → Show Prolog Facts**
   - When viewing a character, show their Prolog representation
   - Example:
     ```prolog
     person(john_smith).
     age(john_smith, 30).
     gender(john_smith, male).
     noble(john_smith).
     parent_of(john_smith, mary_smith).
     at_location(john_smith, castle).
     ```

### Phase 4: Remove "Default" Mode (Optional)
**Goal**: Make Prolog the only execution engine

**Before removing, verify**:
1. All rule types can be converted to Prolog
2. Effects can be properly handled
3. Performance is acceptable
4. Fallback exists for when SWI-Prolog unavailable

**If verified, then**:
- Remove `executeDefaultStep()` method
- Rename `executePrologStep()` to `executeStep()`
- Update all callers
- Add clear error messages if Prolog not available

## Benefits of Full Prolog Integration

1. **Logical Consistency**: Prolog ensures rules are logically sound
2. **Powerful Reasoning**: Complex queries like "find all potential heirs" are trivial
3. **Explainability**: Prolog can explain WHY a rule fired
4. **Debugging**: Users can query the knowledge base directly
5. **Extensibility**: Users can add custom Prolog predicates
6. **Standards-Based**: Leverages decades of logic programming research

## Risks and Mitigations

### Risk 1: Performance
- **Mitigation**: Profile Prolog execution, optimize queries, cache results
- **Fallback**: Keep default mode for large-scale simulations

### Risk 2: SWI-Prolog Dependency
- **Mitigation**: Check availability, provide clear installation instructions
- **Fallback**: Gracefully degrade to default mode if unavailable

### Risk 3: Learning Curve
- **Mitigation**: Hide Prolog complexity behind Insimul syntax
- **Advanced**: Expose for power users who want it

### Risk 4: Effect Execution
- **Mitigation**: Keep effects in JavaScript, use Prolog only for reasoning
- **Hybrid**: Prolog decides WHAT, JavaScript decides HOW

## Recommended Approach

### Short Term (Next Sprint)
1. ✅ Integrate PrologKnowledgeBase component into UI
2. ✅ Add Prolog tab to Truth section
3. ✅ Create PrologSyncService for data synchronization
4. ✅ Auto-sync characters on simulation start

### Medium Term (2-3 Sprints)
1. Replace executePrologStep() with actual Prolog execution
2. Test with existing rules
3. Add Prolog view to simulation results
4. Add "View as Prolog" to character details

### Long Term (Future)
1. Benchmark and optimize Prolog execution
2. Consider removing default mode if Prolog proves superior
3. Add advanced Prolog features (constraints, DCGs, etc.)
4. Explore Prolog-native narrative generation

## Conclusion

**Should we make Prolog the default and only engine?**

**Answer: Yes, but gradually**

1. **Phase 1**: Add Prolog as visible alternative (keeps default mode)
2. **Phase 2**: Make Prolog default, keep fallback (test with users)
3. **Phase 3**: Remove default mode only after Prolog proves reliable

The infrastructure already exists. We just need to:
1. Wire it together
2. Make it visible to users
3. Ensure data synchronization
4. Test thoroughly

This aligns with the original vision and leverages Prolog's strengths while preserving Insimul's usability and features.
