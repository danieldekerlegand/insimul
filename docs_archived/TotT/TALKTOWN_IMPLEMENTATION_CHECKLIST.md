# Talk of the Town Implementation Checklist

Quick reference for implementing TotT features in Insimul. See `TALKTOWN_INTEGRATION_PLAN.md` for detailed specifications.

## Phase 1: Foundation ✅ = Done, 🔲 = Todo

### Database Schema Extensions
- ✅ Create `occupations` table
  - characterId, businessId, vocation, level
  - startYear, endYear, shift, terminationReason
  - predecessorId, successorId

- ✅ Create `businesses` table
  - worldId, name, businessType, ownerId, founderId
  - isOutOfBusiness

- ✅ Create `lots` table
  - worldId, address, houseNumber, streetName
  - buildingId, buildingType, neighboringLotIds

- ✅ Create `residences` table
  - lotId, ownerIds, residentIds

- ✅ Create `whereabouts` table
  - characterId, location, occasion, timestep

### Character Schema Updates
- ✅ Add structured personality (OCEAN)
- ✅ Add mind fields (memory, mentalModels, thoughts)
- ✅ Add relationship sets (coworkerIds, friendIds, neighborIds)
- ✅ Add collegeGraduate boolean
- ✅ Add retired boolean
- ✅ Add departureYear

### World Schema Updates
- ✅ Add currentMonth, currentDay, timeOfDay
- ✅ Add ordinalDate
- ✅ Add unemployedCharacterIds
- ✅ Add vacantLotIds
- ✅ Add companyIds

## Phase 2: Business & Occupation System

### Business Manager
- ✅ Business creation and registration
- ✅ Employee management (add/remove)
- ✅ Business closure logic
- ✅ Business type registry (Generic, LawFirm, ApartmentComplex)

### Occupation Manager
- ✅ Occupation assignment
- ✅ Level tracking (1-5)
- ✅ Experience calculation (years)
- ✅ Shift management (day/night)
- ✅ Termination with reasons
- ✅ Succession tracking (predecessor/successor)
- ✅ Coworker relationship updates

### Hiring System
- ✅ Candidate assembly
  - From unemployed characters
  - From current employees (internal)
  - Create ex nihilo if needed
- ✅ Qualification checking
  - Age requirements
  - Gender restrictions (historical)
  - College degree requirements
  - Experience prerequisites
- ✅ Candidate scoring
  - Family preference (+2.0 immediate, +1.0 extended)
  - Friend preference (+1.0)
  - Acquaintance preference (+0.5)
  - Enemy dispreference (-2.0)
  - Internal hire preference (+1.0)
  - Level multiplier
- ✅ Top-3 selection algorithm (60% / 30% / 10%)

### Config Manager
- 🔲 Load occupation definitions from config
- 🔲 Job level mappings (60+ occupations)
- 🔲 Qualification predicates
- 🔲 Hiring preferences
- 🔲 Age generator based on job level

### Specialized Occupations
- 🔲 Doctor: deliver_baby() → BirthEvent
- 🔲 Lawyer: file_divorce() → DivorceEvent
- 🔲 Owner: sell_home() → HomePurchaseEvent
- 🔲 Apprentice: promote() → level++

### Business Types
- 🔲 Generic Business
- 🔲 LawFirm (special naming)
- 🔲 ApartmentComplex (units, expand())

## Phase 3: Event System

### Event Base
- ✅ Event registration in world
- ✅ Event numbering
- ✅ Year/timestep tracking
- ✅ Subject tracking

### Life Events
- ✅ BirthEvent
  - Create child Person
  - Set home to mother's home
  - Add to parents' kids sets
  - Add to city residents
  - Record delivery for doctor
- ✅ DeathEvent
  - Set alive = false
  - Move to deceased set
  - Clear location
  - Track cause of death
- ✅ MarriageEvent
  - Set spouse relationships (bidirectional)
  - Merge immediate family sets
  - Update children's family
- ✅ DivorceEvent
  - Clear spouse relationships
  - Remove from immediate family
  - Record case for lawyer

### Residential Events
- ✅ MoveEvent
  - Update home reference
  - Update residence resident sets
  - Move characters to new location
  - Track old home
- ✅ HomePurchaseEvent
  - Transfer ownership
  - Update home.owners
  - Handle seller move-out (optional)
- ✅ DepartureEvent
  - Set departure year
  - Move to departed set
  - Clear location

### Employment Events
- ✅ HiringEvent
  - Create Occupation
  - Terminate old occupation
  - Add to company employees
  - Update coworkers
- ✅ RetirementEvent
  - Set retired = true
  - Terminate occupation
  - Clear coworkers
- ✅ PromotionEvent
  - Increase occupation level
  - Update professional record
- ✅ BusinessFoundingEvent
  - Create new business
  - Set founder as owner
- ✅ BusinessClosureEvent
  - Terminate all employees
  - Mark business as closed

## Phase 4: Routine & Whereabouts

### Time System
- ✅ Month/day tracking
- ✅ Time-of-day (day/night)
- ✅ advance_time() implementation
  - Toggle day/night
  - Increment day on night→day
  - Update month/year on rollover
- ✅ Date formatting (e.g., "Day of June 15, 1985")

### Routine System
- ✅ Routine.enact() for each character
- ✅ Decision logic:
  - Children: school (day) / home (night)
  - Employed: work (on shift) / home (off shift)
  - Unemployed: personality-based leisure
- ✅ Personality factors:
  - Extroversion affects leaving home
  - Openness affects location variety
- ✅ Working status tracking

### Whereabouts Tracking
- ✅ Record location after each enact
- ✅ Store timestep + time-of-day
- ✅ Occasion tracking (work, home, leisure, school)
- ✅ Historical query methods
- ✅ Recent whereabouts retrieval

### Simulation Loop Integration
- 🔲 Call routine.enact() for all characters each step
- 🔲 Record whereabouts after enact
- 🔲 Update location predicates in social state

## Phase 5: Location & Property

### Lot System
- ✅ Lot creation with addresses
- ✅ Street assignment
- ✅ Block organization
- ✅ Neighboring lot tracking
- ✅ Vacant lot management
- ✅ Distance from downtown calculation

### Residence System
- ✅ Residence creation on lots
- ✅ Multi-owner support
- ✅ Resident tracking
- ✅ Address inheritance from lot
- ✅ Home purchase mechanics

### Building System
- ✅ Building placement on lots
- ✅ Building type tracking
- ✅ Former building history
- ✅ Building destruction

### City Management
- ✅ Lot registry
- ✅ Vacant lot list
- ✅ Company registry
- ✅ businesses_of_type() query
- ✅ dist_from_downtown() calculation

### Apartment Complexes
- ✅ Unit creation (4 initial units)
- ✅ Unit resident tracking
- ✅ expand() method (+2 units)
- ✅ Landlord occupation integration

## Phase 6: Mind & Cognition

### Memory System
- ✅ Memory capacity attribute (0.0-1.0)
- ✅ Normal distribution generation
- ✅ Memory decay over time
- ✅ Memory strength tracking

### Mental Models
- ✅ Beliefs about other characters
- ✅ Relationship quality estimates
- ✅ Belief updates on interaction
- ✅ Personality inference

### Thought System
- ✅ Thought generation
- ✅ Thought storage with timestamps
- ✅ recent_thoughts() query (last 5)
- ✅ Thought-driven behavior

### Event Integration
- ✅ Generate thoughts on events
- ✅ Update mental models on interaction
- ✅ Memory formation on important events

## Phase 7: Personality Integration

### Structure
- ✅ Enforce Big Five (OCEAN) structure
- ✅ Normal distribution (-1 to +1)
- ✅ Component strength labels:
  - very high (>0.7)
  - high (0.4-0.7)
  - somewhat high (0.1-0.4)
  - neutral (-0.1-0.1)
  - somewhat low (-0.4--0.1)
  - low (-0.7--0.4)
  - very low (<-0.7)

### Derived Traits
- ✅ gregarious = E>0.4 && A>0.4 && N<-0.2
- ✅ cold = E<-0.4 && A<0 && C>0.4

### Behavior Integration
- ✅ Routine: extroversion affects leisure
- ✅ Hiring: personality affects evaluation
- ✅ Relationships: similarity/complementarity

## Phase 8: Rule Integration

### New Condition Types
- ✅ `has_occupation(?person, ?occupation)`
- ✅ `occupation_level(?person, ?level)`
- ✅ `works_at(?person, ?business)`
- ✅ `at_location(?person, ?location)`
- ✅ `at_home(?person)`
- ✅ `at_work(?person)`
- ✅ `owns_business(?person, ?business)`
- ✅ `employs(?business, ?person)`
- ✅ `has_vacancy(?business, ?occupation)`

### New Effect Types
- ✅ `hire(?business, ?person, ?occupation)`
- ✅ `fire(?person, reason)`
- ✅ `promote(?person)`
- ✅ `retire(?person)`
- ✅ `move_to(?person, ?location)`
- ✅ `purchase_home(?person, ?home, ?seller)`
- ✅ `found_business(?person, ?type)`
- ✅ `close_business(?business, ?reason)`

### Rule Type Extensions
- 🔲 Employment rules
- 🔲 Business rules
- 🔲 Routine rules
- 🔲 Real estate rules

### Example Rule Sets
- 🔲 Hiring pipeline
- 🔲 Succession planning
- 🔲 Urban development
- 🔲 Economic cycles

## Phase 9: Testing & Validation

### Unit Tests
- 🔲 Occupation system tests
- 🔲 Business system tests
- 🔲 Event side effect tests
- 🔲 Hiring algorithm tests
- 🔲 Routine logic tests
- 🔲 Whereabouts tracking tests

### Integration Tests
- 🔲 Demo tutorial equivalent
- 🔲 Multi-step workflows
- 🔲 Rule-driven behaviors
- 🔲 End-to-end simulation

### Performance Tests
- 🔲 100 characters × 100 timesteps benchmark
- 🔲 Database query profiling
- 🔲 Hot path optimization
- 🔲 Memory usage analysis

### Migration Tests
- 🔲 Schema migration scripts
- 🔲 Data migration validation
- 🔲 Backward compatibility checks
- 🔲 Rule compilation regression

## Phase 10: Documentation & Examples

### API Documentation
- 🔲 Database schema reference
- 🔲 Occupation system guide
- 🔲 Business mechanics overview
- 🔲 Event type reference
- 🔲 Config system documentation

### Tutorials
- 🔲 Port demo_tutorial.ts to Insimul
- 🔲 Step-by-step setup guide
- 🔲 Rule integration examples
- 🔲 Custom occupation creation

### Sample Worlds
- 🔲 Medieval town with guilds
- 🔲 Modern city with corporations
- 🔲 Small town with family businesses
- 🔲 Historical 1800s settlement

### Rule Library
- 🔲 Common hiring patterns
- 🔲 Business lifecycle rules
- 🔲 Urban development scenarios
- 🔲 Economic simulation rules

## Quick Reference: File Locations

### TotT Source Files (Reference)
```
server/engines/talktown/src/
├── Game.ts              - Main simulation orchestrator
├── Person.ts            - Character with full attributes
├── Business.ts          - Company with hiring system
├── Occupation.ts        - Job positions with levels
├── City.ts              - Town/city management
├── Lot.ts               - Land parcels
├── Residence.ts         - Housing
├── Personality.ts       - Big Five traits
├── Mind.ts              - Memory and thoughts
├── Routine.ts           - Daily schedules
├── Whereabouts.ts       - Location history
├── Config.ts            - Occupation config
└── events/
    └── Events.ts        - All event types
```

### Insimul Target Files (To Modify)
```
shared/
└── schema.ts            - Add new tables

server/
├── engines/
│   └── unified-engine.ts  - Integrate TotT features
├── managers/            - Create new managers
│   ├── occupation-manager.ts
│   ├── business-manager.ts
│   ├── routine-manager.ts
│   ├── property-manager.ts
│   └── mind-manager.ts
└── routes.ts            - Add new API endpoints
```

## Development Commands

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run specific test suite
npm test -- occupation-system

# Build for production
npm run build

# Database migration
npm run db:migrate

# Type checking
npm run type-check

# Linting
npm run lint
```

## Success Criteria

- ✅ All checkboxes completed
- ✅ All tests passing (>80% coverage)
- ✅ Demo tutorial runs successfully
- ✅ Performance: 100 chars × 100 steps < 5s
- ✅ Documentation complete
- ✅ Zero regression in existing features

## Timeline Summary

- **Phase 1-3** (Weeks 1-7): Critical features - Foundation, Business, Events
- **Phase 4-5** (Weeks 8-11): Important features - Routine, Location
- **Phase 6-7** (Weeks 12-15): Enhancement features - Mind, Personality
- **Phase 8-10** (Weeks 16-20): Polish - Rules, Testing, Docs

**Total Estimated Time**: 20 weeks

## Notes

- Start with Phase 1 database schema
- Test each feature in isolation before integration
- Maintain backward compatibility throughout
- Update this checklist as you complete tasks
- Reference `TALKTOWN_INTEGRATION_PLAN.md` for details
