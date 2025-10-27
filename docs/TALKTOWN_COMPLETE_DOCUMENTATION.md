# Talk of the Town Complete Integration Documentation

## Overview

The Talk of the Town (TotT) integration into Insimul is now **100% complete**. This document provides comprehensive documentation for using and extending the integrated system.

## Architecture

### Core Systems

#### 1. **Database Layer** (Phase 1)
- 5 new tables: `occupations`, `businesses`, `lots`, `residences`, `whereabouts`
- Extended `characters` table with TotT fields
- Extended `worlds` table with time tracking

#### 2. **Type System** (Phase 1)
- Complete TypeScript definitions in `server/types/tott-types.ts`
- 70+ occupation types
- Business types and configurations
- Personality and cognition types

#### 3. **Manager Classes** (Phases 2-7)
Located in `server/managers/`:

- **OccupationManager**: Employment lifecycle
- **BusinessManager**: Company operations
- **HiringManager**: Sophisticated hiring algorithm
- **EventManager**: Life event orchestration
- **PropertyManager**: Real estate management
- **LocationManager**: City layout and districts
- **TimeManager**: Calendar and time progression
- **RoutineManager**: Daily activity scheduling
- **WhereaboutsManager**: Location history tracking
- **MindManager**: Memory and thoughts
- **PersonalityManager**: Big Five traits and behaviors

#### 4. **Event System** (Phase 3)
Located in `server/events/`:

- **BaseEvent**: Abstract event foundation
- **Life Events**: Birth, Death, Marriage, Divorce
- **Employment Events**: Hiring, Retirement, Promotion
- **Residential Events**: Move, HomePurchase, Departure
- **Business Events**: Founding, Closure

#### 5. **Rule Integration** (Phase 8)
- **TotTRuleIntegration** (`server/engines/tott-rule-integration.ts`)
- New conditions and effects for Insimul rules
- Example rules in `server/rules/tott-example-rules.ts`

## API Reference

### Creating a World with TotT Features

```typescript
import { db } from './storage';
import { worlds } from '../shared/schema';
import { LocationManager } from './managers/location-manager';
import { TimeManager } from './managers/time-manager';

// Create world
const [world] = await db.insert(worlds).values({
  name: 'My Town',
  currentYear: 1950,
  currentMonth: 1,
  currentDay: 1,
  timeOfDay: 'day',
  population: 0
}).returning();

// Initialize city layout
const locationManager = new LocationManager(world.id);
await locationManager.initializeCityLayout(10, 20); // 10 streets, 20 lots per street
```

### Managing Characters

```typescript
import { PersonalityManager } from './managers/personality-manager';
import { MindManager } from './managers/mind-manager';

const personalityManager = new PersonalityManager(worldId);
const mindManager = new MindManager(worldId);

// Generate personality
const personality = personalityManager.generatePersonality();

// Create character with personality
const [character] = await db.insert(characters).values({
  worldId,
  firstName: 'Jane',
  lastName: 'Doe',
  age: 25,
  gender: 'female',
  personality,
  memory: 0.7,
  collegeGraduate: true
}).returning();

// Initialize mind
await mindManager.initializeMind(character.id);
```

### Employment System

```typescript
import { BusinessManager } from './managers/business-manager';
import { HiringManager } from './managers/hiring-manager';

const businessManager = new BusinessManager(worldId);
const hiringManager = new HiringManager(worldId);

// Create business
const business = await businessManager.createBusiness({
  name: 'Acme Corp',
  businessType: 'Generic',
  founderId: ownerId,
  foundedYear: 1950,
  initialVacancies: [
    { occupation: 'Manager', shift: 'day', isSupplemental: false },
    { occupation: 'Worker', shift: 'day', isSupplemental: false }
  ]
});

// Hire employee
await hiringManager.hire(
  business.id,
  'Manager',
  'day'
);
```

### Daily Simulation

```typescript
import { TimeManager } from './managers/time-manager';
import { RoutineManager } from './managers/routine-manager';
import { WhereaboutsManager } from './managers/whereabouts-manager';

const timeManager = new TimeManager(worldId);
const routineManager = new RoutineManager(worldId);
const whereaboutsManager = new WhereaboutsManager(worldId);

// Simulate a day
async function simulateDay() {
  // Morning
  await timeManager.advanceTime();
  await routineManager.enactAllRoutines();
  await whereaboutsManager.trackAllWhereabouts();
  
  // Evening
  await timeManager.advanceTime();
  await routineManager.enactAllRoutines();
  await whereaboutsManager.trackAllWhereabouts();
}
```

### Event System

```typescript
import { EventManager } from './managers/event-manager';

const eventManager = new EventManager(worldId);

// Life events
await eventManager.birth(motherId, fatherId);
await eventManager.marry(spouse1Id, spouse2Id);
await eventManager.death(characterId, 'natural causes');

// Employment events
await eventManager.hire(characterId, businessId, 'Doctor', 'day');
await eventManager.promote(characterId);
await eventManager.retire(characterId);

// Property events
await eventManager.purchaseHome(buyerId, residenceId, sellerId, 75000);
await eventManager.move(characterId, fromResidenceId, toResidenceId);
```

### Rule Integration

```typescript
// Example TotT rule in Insimul format
const successionRule = {
  name: "family_succession",
  content: `
    rule family_succession {
      when (
        owns_business(?owner, ?business) and
        age(?owner, ?age) and ?age > 65 and
        has_child(?owner, ?child) and
        occupation_level(?child, 3)
      )
      then {
        hire(?business, ?child, "Owner", "day")
        retire(?owner)
        add_thought(?owner, "Passing on the family business", "proud")
      }
      priority: 8
      likelihood: 0.7
    }
  `,
  systemType: "tott",
  ruleType: "action"
};
```

## Configuration

### Hiring Preferences

```typescript
const hiringPreferences = {
  preferenceToHireFromWithinCompany: 1.0,
  preferenceToHireImmediateFamily: 2.0,
  preferenceToHireExtendedFamily: 1.0,
  preferenceToHireFriend: 1.0,
  preferenceToHireAcquaintance: 0.5,
  dispreferenceToHireEnemy: -2.0,
  unemploymentOccupationLevel: 0.8
};
```

### Occupation Configuration

```typescript
const occupationConfig = {
  vocation: 'Doctor',
  baseLevel: 5,
  qualifications: {
    minAge: 25,
    requiresCollegeDegree: true,
    requiresExperience: ['Nurse', 'Apprentice']
  },
  availableShifts: ['day', 'night'],
  specialActions: ['deliver_baby', 'treat_patient']
};
```

## Query Examples

### Find Characters by Occupation

```typescript
const doctors = await db.select()
  .from(occupations)
  .innerJoin(characters, eq(occupations.characterId, characters.id))
  .where(
    and(
      eq(occupations.worldId, worldId),
      eq(occupations.vocation, 'Doctor'),
      isNull(occupations.endYear)
    )
  );
```

### Get Neighborhood Relationships

```typescript
const locationManager = new LocationManager(worldId);
const neighbors = await locationManager.getCharacterNeighbors(characterId);
```

### Track Daily Patterns

```typescript
const whereaboutsManager = new WhereaboutsManager(worldId);
const stats = await whereaboutsManager.getWhereaboutsStatistics(
  characterId,
  startTimestep,
  endTimestep
);

console.log(`Home: ${stats.homePercentage}%`);
console.log(`Work: ${stats.workPercentage}%`);
```

### Memory and Thoughts

```typescript
const mindManager = new MindManager(worldId);

// Add thought
await mindManager.addThought(
  characterId,
  "What a beautiful day!",
  "happy",
  []
);

// Check if remembers someone
const remembers = await mindManager.remembersCharacter(characterId, targetId);

// Update beliefs
await mindManager.updateMentalModel(
  observerId,
  targetId,
  { trustworthy: true, competent: true },
  0.8
);
```

## Best Practices

### 1. Initialize World Properly
Always set up time and location before creating characters:
```typescript
const timeManager = new TimeManager(worldId);
await timeManager.setTime(1950, 1, 1, 'day');

const locationManager = new LocationManager(worldId);
await locationManager.initializeCityLayout(10, 20);
```

### 2. Maintain Relationship Consistency
When creating relationships, update both sides:
```typescript
// When marrying, both spouses are updated automatically
await eventManager.marry(spouse1Id, spouse2Id);
```

### 3. Use Events for Major Changes
Events handle cascading effects automatically:
```typescript
// Don't manually update death - use event
await eventManager.death(characterId); // Handles all cleanup
```

### 4. Personality-Driven Decisions
Always consider personality when making decisions:
```typescript
const personalityManager = new PersonalityManager(worldId);
const probability = await personalityManager.modifyDecisionProbability(
  characterId,
  'socialize',
  0.5
);
```

### 5. Track Whereabouts After Routines
```typescript
await routineManager.enactRoutine(characterId);
await whereaboutsManager.recordRoutineWhereabouts(characterId);
```

## Performance Considerations

### Batch Operations
```typescript
// Good - batch all routines
const decisions = await routineManager.enactAllRoutines();

// Bad - individual calls in loop
for (const char of characters) {
  await routineManager.enactRoutine(char.id);
}
```

### Indexing
Ensure indexes on frequently queried fields:
- `characters.worldId`
- `occupations.characterId`
- `businesses.worldId`
- `whereabouts.characterId, timestep`

### Memory Management
```typescript
// Apply memory decay periodically
await mindManager.applyMemoryDecay(characterId, timestepsPassed);
```

## Troubleshooting

### Common Issues

1. **Missing Relationships**
   - Ensure coworker relationships update on hiring
   - Check neighbor relationships after moves

2. **Time Synchronization**
   - Always use TimeManager for time updates
   - Ensure whereabouts timestep matches world time

3. **Occupation Conflicts**
   - Terminate old occupation before creating new
   - Check for supplemental vs primary occupations

4. **Memory Leaks**
   - Apply memory decay regularly
   - Limit thought history based on memory capacity

## Extension Points

### Custom Occupations
```typescript
// Add to OccupationVocation type
type CustomOccupation = OccupationVocation | 'Programmer';

// Add to job levels
jobLevels['Programmer'] = 3;

// Add qualifications
const programmerQualifications = {
  minAge: 20,
  requiresCollegeDegree: true
};
```

### Custom Business Types
```typescript
// Extend BusinessType
type CustomBusinessType = BusinessType | 'TechStartup';

// Add business-specific logic
if (businessType === 'TechStartup') {
  // Custom hiring preferences
  // Remote work options
  // Stock options
}
```

### Custom Events
```typescript
// Extend BaseEvent
class GraduationEvent extends BaseEvent {
  constructor(worldId: string, characterId: string) {
    super(worldId, 'graduation', [characterId], 'Character graduates');
  }
  
  protected async executeEvent(): Promise<void> {
    // Set collegeGraduate flag
    // Update qualifications
    // Trigger job search
  }
}
```

## Migration Guide

### From Original TotT to Insimul

1. **Data Structure Changes**
   - TotT: Object-oriented with direct references
   - Insimul: Relational database with IDs

2. **Time System**
   - TotT: Game class manages time
   - Insimul: TimeManager handles world time

3. **Rule Integration**
   - TotT: Hardcoded behaviors
   - Insimul: Rule-driven with conditions/effects

4. **Personality System**
   - TotT: Personality class
   - Insimul: JSON in characters table

## Conclusion

The Talk of the Town integration brings rich behavioral simulation to Insimul. With sophisticated employment, daily routines, spatial reasoning, and cognitive modeling, you can create living worlds where characters have jobs, homes, relationships, and memories.

The modular architecture allows easy extension while maintaining performance. The rule integration enables complex emergent behaviors through simple declarative rules.

For questions or support, refer to the example implementations and test files.
