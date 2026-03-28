# Talk of the Town Integration Plan for Insimul

## Executive Summary

This document analyzes the Talk of the Town (TotT) TypeScript implementation in `/server/engines/talktown/` and identifies features that are not yet integrated into the main Insimul unified engine. The goal is to develop a comprehensive plan for incorporating all TotT features directly within Insimul to create a complete social simulation platform.

## Current State Analysis

### Talk of the Town Features (Implemented in `/server/engines/talktown/`)

#### Core Systems
1. **Game** (`Game.ts`)
   - Simulation orchestration with time tracking
   - Year, month, day, and time-of-day (day/night) cycles
   - Event registry and numbering
   - Date formatting and advancement
   - Connection to City and configuration

2. **Person** (`Person.ts`)
   - Individual characters with comprehensive attributes
   - Age, gender, alive/departed status
   - Home and current location tracking
   - Occupation and occupation history
   - Social relationships (coworkers, friends, neighbors, family)
   - Personality, mind, routine, and whereabouts systems
   - Marriage and family (spouse, kids)
   - College education status

3. **Business** (`Business.ts`)
   - Company ownership and founding
   - Employee and former employee tracking
   - Sophisticated hiring system with candidate scoring
   - Job vacancy management (day/night shifts)
   - Qualification checking based on config rules
   - Business closure handling
   - Specialized business types:
     - **LawFirm**: Law practice with naming conventions
     - **ApartmentComplex**: Multi-unit housing with expansion

4. **Occupation** (`Occupation.ts`)
   - Job positions with hierarchy levels
   - Experience tracking (years in position)
   - Start/end dates and termination reasons
   - Succession tracking (preceded_by, succeeded_by)
   - Shift system (day/night)
   - Coworker relationship management
   - Specialized occupations:
     - **Owner**: Can sell homes
     - **Doctor**: Delivers babies
     - **Lawyer**: Files divorces
     - **Apprentice**: Level-based progression

5. **Events** (`events/Events.ts`)
   - **MoveEvent**: Residential relocation
   - **DeathEvent**: Character death with cause tracking
   - **MarriageEvent**: Spousal bonding and family merging
   - **DepartureEvent**: Leaving the city
   - **HiringEvent**: Employment commencement
   - **BirthEvent**: Child creation and family assignment
   - **DivorceEvent**: Spousal separation
   - **HomePurchaseEvent**: Property ownership transfer
   - **RetirementEvent**: Occupation termination and retirement status

6. **City** (`City.ts`)
   - Resident population management
   - Company registry
   - Departed and deceased tracking
   - Lot management (vacant and occupied)
   - Unemployment tracking
   - Distance calculations from downtown

7. **Lot** (`Lot.ts`)
   - Land parcels with addresses
   - Street assignments
   - Building placement
   - Neighboring lot relationships
   - Historical building tracking

8. **Residence** (`Residence.ts`)
   - Housing with owners and residents
   - Address information
   - Connection to lots

9. **Personality** (`Personality.ts`)
   - Big Five personality traits (OCEAN):
     - Openness to experience
     - Conscientiousness
     - Extroversion
     - Agreeableness
     - Neuroticism
   - Derived traits (gregarious, cold)
   - Component strength descriptions

10. **Mind** (`Mind.ts`)
    - Memory capacity
    - Mental models of other characters
    - Thought tracking and history

11. **Routine** (`Routine.ts`)
    - Daily activity scheduling
    - Location decision-making based on:
      - Age (adult/child)
      - Occupation and shift
      - Personality (extroversion affects leisure)
    - Working status tracking

12. **Whereabouts** (`Whereabouts.ts`)
    - Location history tracking by date and time
    - Historical whereabouts queries
    - Occasion recording (work, home, leisure, school)

13. **Config** (`Config.ts`)
    - Extensive occupation configuration:
      - Job levels for 60+ occupations
      - Gender-based hiring restrictions (historical accuracy)
      - Year-based employment rules
      - Experience prerequisites
      - College degree requirements
    - Hiring preferences:
      - Family (immediate/extended)
      - Friends and acquaintances
      - Internal promotion
      - Enemy dispreference
    - Age generation based on job level

### Insimul Engine Features (Implemented in `/server/engines/unified-engine.ts`)

#### Current Capabilities
1. **Rule System**
   - Multi-syntax support (Ensemble, Kismet, TotT, Insimul)
   - Rule compilation and validation
   - Priority-based execution
   - Likelihood/probability support

2. **Social State Management**
   - Predicate storage (category|first|second → value)
   - Relationship tracking
   - Event logging
   - Timestep tracking

3. **Pattern Matching**
   - Kismet-style pattern definitions
   - Variable binding and substitution
   - Condition evaluation

4. **Genealogy System**
   - Parent/child relationships
   - Generation calculation
   - Sibling detection
   - Basic family tree structure

5. **Character System** (from `schema.ts`)
   - Basic attributes (name, age, gender, alive)
   - Personality (as JSON object)
   - Physical and mental traits
   - Skills
   - Relationships
   - Genealogy data
   - Parent/child/spouse IDs
   - Current location (text)
   - Occupation (text)

6. **World System** (from `schema.ts`)
   - Founded year and current year
   - Population
   - Generation tracking
   - Government and economic systems
   - Locations, buildings, landmarks (as JSON arrays)
   - Cultural values
   - Historical events

7. **Tracery Integration**
   - Grammar storage and loading
   - Template-based narrative generation

8. **Prolog Engine Integration**
   - SWI Prolog execution
   - Fallback to default execution

9. **Truth/Timeline System**
   - Timestep-based event tracking
   - Past/present/future support
   - Character and world-level truths

## Feature Gap Analysis

### 🔴 Critical Missing Features

#### 1. **Occupation & Employment System**
**Status**: Not Implemented  
**TotT Implementation**: Full occupation hierarchy with levels, experience, shifts, termination  
**Insimul Status**: Only has `occupation: text` field on Character  
**Impact**: HIGH - Core to TotT's simulation dynamics

**What's Missing**:
- No occupation hierarchy or levels
- No experience tracking
- No shift system (day/night)
- No succession tracking
- No specialized occupation behaviors (Doctor.deliver_baby, Lawyer.file_divorce)
- No occupation termination with reasons
- No coworker relationship management

#### 2. **Business & Company System**
**Status**: Not Implemented  
**TotT Implementation**: Full business management with hiring, employees, vacancies  
**Insimul Status**: No business entities at all  
**Impact**: HIGH - Essential for economic simulation

**What's Missing**:
- No business/company entities
- No employee/employer relationships
- No hiring system
- No candidate scoring and selection
- No job vacancies (supplemental or regular)
- No business closure mechanics
- No specialized business types (LawFirm, ApartmentComplex)

#### 3. **Daily Routine & Whereabouts System**
**Status**: Not Implemented  
**TotT Implementation**: Personality-driven daily schedules with location tracking  
**Insimul Status**: Has `currentLocation: text` but no routine logic  
**Impact**: MEDIUM-HIGH - Important for behavioral realism

**What's Missing**:
- No time-of-day cycles (day/night)
- No routine decision-making
- No whereabouts history
- No personality-driven location choices
- No work/leisure/home/school activities
- No occasion tracking

#### 4. **Mind & Cognition System**
**Status**: Not Implemented  
**TotT Implementation**: Memory, mental models, thought tracking  
**Insimul Status**: Has `mentalTraits` JSON but no cognitive simulation  
**Impact**: MEDIUM - Adds depth to character simulation

**What's Missing**:
- No memory capacity modeling
- No mental models of other characters
- No thought generation or tracking
- No belief systems

#### 5. **Detailed Event System**
**Status**: Partially Implemented  
**TotT Implementation**: 10 specific event types with side effects  
**Insimul Status**: Generic event tracking, no specialized events  
**Impact**: MEDIUM-HIGH - Events drive narrative and state changes

**What's Missing**:
- No specialized event classes (BirthEvent, HomePurchaseEvent, etc.)
- No automatic side effects (e.g., birth adding child to parents' kids set)
- No event-driven relationship updates
- No retirement mechanics
- No home ownership transfers

#### 6. **Location & Property System**
**Status**: Partially Implemented  
**TotT Implementation**: Lot, Residence, Building hierarchy with addresses  
**Insimul Status**: Has `locations` JSON array, no structured system  
**Impact**: MEDIUM - Important for spatial reasoning

**What's Missing**:
- No Lot entities with addresses
- No Residence entities with owners/residents
- No building placement on lots
- No vacant lot tracking
- No neighboring lot relationships
- No distance calculations
- No apartment unit management

#### 7. **Configuration-Based Behavior**
**Status**: Not Implemented  
**TotT Implementation**: Extensive config-driven occupation rules  
**Insimul Status**: Generic `config` JSON field  
**Impact**: MEDIUM - Enables historical accuracy and customization

**What's Missing**:
- No occupation qualification predicates
- No historical gender/year restrictions
- No experience prerequisites
- No college degree requirements
- No hiring preference configuration
- No age-based job assignment

### 🟡 Partially Implemented Features

#### 8. **Personality System**
**Status**: Partially Implemented  
**TotT Implementation**: Big Five with derived traits and component descriptions  
**Insimul Status**: Has `personality` JSON field, not structured  
**Impact**: LOW-MEDIUM - Structure exists but not utilized

**Gaps**:
- No Big Five structure enforcement
- No derived trait calculations (gregarious, cold)
- No personality-driven behavior in rules
- No component strength descriptions

#### 9. **Time Management**
**Status**: Partially Implemented  
**TotT Implementation**: Year/month/day/time-of-day cycles  
**Insimul Status**: Has `currentYear`, `foundedYear`, generic `timestep`  
**Impact**: LOW-MEDIUM - Basic temporal tracking exists

**Gaps**:
- No month/day granularity
- No time-of-day (day/night) cycles
- No date formatting
- No ordinal date calculations

#### 10. **Family & Genealogy**
**Status**: Partially Implemented  
**TotT Implementation**: Parent/child/spouse tracking with family sets  
**Insimul Status**: Has parentIds, childIds, spouseId, genealogy system  
**Impact**: LOW - Core structure exists, needs relationship management

**Gaps**:
- No automatic family set updates on marriage
- No extended family tracking
- No immediate family vs extended family distinction
- No kids_at_home calculation

### ✅ Well-Implemented Features

#### 11. **Basic Character Attributes**
**Status**: Well Implemented  
Both systems have comprehensive character attributes (name, age, gender, alive status)

#### 12. **Rule Engine**
**Status**: Well Implemented  
Insimul's rule engine is more sophisticated than TotT (which has minimal rule system)

#### 13. **World-Level State**
**Status**: Well Implemented  
Insimul has robust world management exceeding TotT's City implementation

## Integration Architecture

### Approach 1: Native Integration (Recommended)
**Description**: Implement TotT features directly in Insimul's unified engine and schema  
**Pros**:
- Seamless integration with existing rule system
- Better performance (no separate process)
- Unified data model
- Easier to extend and maintain

**Cons**:
- Requires significant refactoring
- More upfront development time

### Approach 2: Adapter Pattern
**Description**: Create adapters to translate between TotT and Insimul models  
**Pros**:
- Preserves existing TotT code
- Faster initial implementation
- Can run both systems side-by-side

**Cons**:
- Dual maintenance burden
- Performance overhead
- Data synchronization complexity

**Recommendation**: Use **Approach 1 (Native Integration)** for long-term maintainability and performance.

## Implementation Plan

### Phase 1: Foundation (Weeks 1-2)
**Priority**: Critical  
**Goal**: Establish core TotT data structures in Insimul schema

#### Tasks:
1. **Extend Database Schema** (`shared/schema.ts`)
   - Add `occupations` table:
     ```typescript
     - characterId, businessId, vocation, level
     - startYear, endYear, shift (day/night)
     - yearsExperience, terminationReason
     - predecessorId, successorId
     ```
   - Add `businesses` table:
     ```typescript
     - worldId, name, businessType
     - ownerId, founderId
     - isOutOfBusiness
     ```
   - Add `lots` table:
     ```typescript
     - worldId, address, houseNumber, streetName
     - buildingId, buildingType (residence/business)
     - neighboringLotIds
     ```
   - Add `residences` table:
     ```typescript
     - lotId, ownerIds, residentIds
     ```
   - Add `whereabouts` table:
     ```typescript
     - characterId, location, occasion
     - timestep, dateDescription
     ```

2. **Extend Character Schema**
   - Add structured personality (OCEAN model):
     ```typescript
     personality: {
       openness: number,
       conscientiousness: number,
       extroversion: number,
       agreeableness: number,
       neuroticism: number
     }
     ```
   - Add mind fields:
     ```typescript
     memory: number,
     mentalModels: Map<characterId, beliefs>,
     thoughts: array
     ```
   - Add relationship sets:
     ```typescript
     coworkerIds, friendIds, neighborIds,
     immediateFamilyIds, extendedFamilyIds
     ```

3. **Update World Schema**
   - Add day/night cycle:
     ```typescript
     currentMonth, currentDay, timeOfDay
     ordinalDate
     ```
   - Add unemployment tracking:
     ```typescript
     unemployedCharacterIds
     vacantLotIds
     ```

### Phase 2: Business & Occupation System (Weeks 3-5)
**Priority**: Critical  
**Goal**: Implement full employment simulation

#### Tasks:
1. **Create Business Manager**
   - Business creation and registration
   - Owner/founder tracking
   - Employee list management
   - Business closure logic

2. **Create Occupation Manager**
   - Occupation assignment
   - Level and experience tracking
   - Shift management
   - Termination handling
   - Succession tracking
   - Coworker relationship updates

3. **Implement Hiring System**
   - Candidate assembly from unemployed and employed
   - Qualification checking (from Config)
   - Candidate scoring:
     - Family preference
     - Friend/acquaintance bonus
     - Current employee bonus
     - Enemy penalty
     - Level multiplier
   - Top-3 selection algorithm
   - Person ex nihilo creation for vacancies

4. **Create Config Manager**
   - Load occupation definitions
   - Job level mappings
   - Qualification predicates:
     - Gender restrictions (historical)
     - Year-based rules
     - Experience requirements
     - College degree requirements
   - Hiring preferences configuration

5. **Implement Specialized Occupations**
   - Doctor occupation:
     - deliver_baby() → BirthEvent
   - Lawyer occupation:
     - file_divorce() → DivorceEvent
   - Owner occupation:
     - sell_home() → HomePurchaseEvent
   - Apprentice occupation:
     - promote() → level increment

6. **Add Business Types**
   - Generic Business
   - LawFirm (with naming)
   - ApartmentComplex (with units and expansion)

### Phase 3: Event System (Weeks 6-7)
**Priority**: Critical  
**Goal**: Implement all TotT event types with side effects

#### Tasks:
1. **Create Event Base Class**
   - Event registration in Game
   - Event numbering
   - Year tracking
   - Subject tracking

2. **Implement Life Events**
   - **BirthEvent**:
     - Create new Person
     - Set home to mother's home
     - Add to parents' kids sets
     - Add to city residents
   - **DeathEvent**:
     - Set alive = false
     - Remove from city residents
     - Add to city deceased
     - Clear location
   - **MarriageEvent**:
     - Set spouse relationships
     - Merge immediate family sets
     - Update children's family connections
   - **DivorceEvent**:
     - Clear spouse relationships
     - Remove from immediate family

3. **Implement Residential Events**
   - **MoveEvent**:
     - Update home reference
     - Update residence resident sets
     - Move characters to new location
   - **HomePurchaseEvent**:
     - Transfer ownership
     - Update home.owners set
     - Handle seller move-out
   - **DepartureEvent**:
     - Set departure year
     - Remove from residents
     - Add to city departed set
     - Clear location

4. **Implement Employment Events**
   - **HiringEvent**:
     - Create Occupation instance
     - Terminate old occupation if exists
     - Add to company employees
     - Update coworkers
   - **RetirementEvent**:
     - Set retired = true
     - Terminate occupation
     - Clear coworkers

### Phase 4: Routine & Whereabouts (Weeks 8-9)
**Priority**: Medium-High  
**Goal**: Implement daily activity simulation

#### Tasks:
1. **Extend Time System**
   - Add month/day tracking
   - Add time-of-day (day/night)
   - Implement advance_time():
     - Toggle day/night
     - Increment day on night→day
     - Update month/year on rollover
   - Date formatting

2. **Implement Routine System**
   - Routine.enact():
     - Children: school during day, home at night
     - Employed adults: work during shift, home otherwise
     - Unemployed: personality-based leisure decisions
   - Decision factors:
     - Age (adult check)
     - Occupation and shift
     - Personality (extroversion + openness)
   - Working status tracking

3. **Implement Whereabouts Tracking**
   - Record location on each routine enact
   - Store with timestep and time-of-day
   - Occasion tracking (work, home, leisure, school)
   - Historical query methods

4. **Integrate with Simulation Loop**
   - Call routine.enact() for all characters each timestep
   - Record whereabouts after each enact
   - Update location-based predicates

### Phase 5: Location & Property (Weeks 10-11)
**Priority**: Medium  
**Goal**: Implement spatial simulation infrastructure

#### Tasks:
1. **Create Lot System**
   - Lot creation with addresses
   - Street assignment
   - Block organization
   - Neighboring lot tracking
   - Vacant lot management
   - Distance calculations

2. **Create Residence System**
   - Residence creation on lots
   - Owner tracking (multiple owners possible)
   - Resident tracking
   - Home purchase mechanics
   - Address inheritance from lot

3. **Implement Building System**
   - Building placement on lots
   - Building type (residence/business)
   - Former building tracking
   - Building destruction

4. **Create City Management**
   - Lot registry
   - Vacant lot tracking
   - Company registry
   - businesses_of_type() query
   - Downtown distance calculations

5. **Implement Apartment Complexes**
   - Unit creation
   - Unit resident tracking
   - Expansion mechanics
   - Landlord occupation

### Phase 6: Mind & Cognition (Weeks 12-13)
**Priority**: Medium  
**Goal**: Add cognitive depth to characters

#### Tasks:
1. **Implement Memory System**
   - Memory capacity attribute
   - Normal distribution generation
   - Memory decay over time
   - Memory strength tracking

2. **Implement Mental Models**
   - Character beliefs about others
   - Relationship quality tracking
   - Belief updates based on interactions
   - Personality inference

3. **Implement Thought System**
   - Thought generation
   - Thought storage with timestamps
   - Recent thoughts query
   - Thought-driven behavior

4. **Integrate with Events**
   - Generate thoughts on significant events
   - Update mental models on interactions
   - Memory formation on important moments

### Phase 7: Personality Integration (Weeks 14-15)
**Priority**: Medium  
**Goal**: Make personality drive behavior

#### Tasks:
1. **Standardize Personality Structure**
   - Enforce Big Five (OCEAN) structure
   - Normal distribution generation
   - Component strength labels
   - Derived trait calculations:
     - gregarious = high E, high A, low N
     - cold = low E, low A, high C

2. **Personality-Driven Routines**
   - Extroversion affects leisure frequency
   - Conscientiousness affects work dedication
   - Openness affects location variety

3. **Personality in Hiring**
   - Agreeableness affects candidate evaluation
   - Conscientiousness affects qualification strictness
   - Openness affects nepotism vs meritocracy

4. **Personality in Relationships**
   - Similar personalities attract
   - Complementary traits create interest
   - Personality clash detection

### Phase 8: Rule Integration (Weeks 16-17)
**Priority**: High  
**Goal**: Make TotT features accessible to Insimul rules

#### Tasks:
1. **Extend Rule Conditions**
   - Add occupation predicates:
     - `has_occupation(?person, ?occupation)`
     - `occupation_level(?person, ?level)`
     - `works_at(?person, ?business)`
   - Add location predicates:
     - `at_location(?person, ?location)`
     - `at_home(?person)`
     - `at_work(?person)`
   - Add business predicates:
     - `owns_business(?person, ?business)`
     - `employs(?business, ?person)`
     - `has_vacancy(?business, ?occupation)`

2. **Extend Rule Effects**
   - Add occupation effects:
     - `hire(?business, ?person, ?occupation)`
     - `fire(?person, reason)`
     - `promote(?person)`
     - `retire(?person)`
   - Add location effects:
     - `move_to(?person, ?location)`
     - `purchase_home(?person, ?home, ?seller)`
   - Add business effects:
     - `found_business(?person, ?type)`
     - `close_business(?business, ?reason)`

3. **Add TotT-Specific Rule Types**
   - Employment rules (hiring, firing, promotion)
   - Business rules (founding, closure, expansion)
   - Routine rules (location decisions)
   - Real estate rules (home purchases, moves)

4. **Create Example Rule Sets**
   - Hiring pipeline rules
   - Succession planning rules
   - Urban development rules
   - Economic cycle rules

### Phase 9: Testing & Validation (Weeks 18-19)
**Priority**: Critical  
**Goal**: Ensure feature parity with TotT implementation

#### Tasks:
1. **Unit Tests**
   - Test each TotT feature independently
   - Verify event side effects
   - Validate hiring algorithm
   - Check routine logic

2. **Integration Tests**
   - Run TotT demo_tutorial equivalent
   - Verify multi-step workflows
   - Test rule-driven behaviors

3. **Performance Testing**
   - Benchmark simulation speed
   - Profile database queries
   - Optimize hot paths

4. **Migration Testing**
   - Test data migration from current schema
   - Validate backward compatibility
   - Ensure rule compilation still works

### Phase 10: Documentation & Examples (Week 20)
**Priority**: Medium  
**Goal**: Enable users to leverage TotT features

#### Tasks:
1. **API Documentation**
   - Document new database tables
   - Explain occupation system
   - Describe business mechanics
   - Detail event types

2. **Tutorial Creation**
   - Port demo_tutorial.ts to Insimul
   - Create step-by-step guide
   - Show rule integration examples

3. **Sample Worlds**
   - Medieval town with guilds
   - Modern city with corporations
   - Small town with family businesses

4. **Rule Library**
   - Common hiring patterns
   - Business lifecycle rules
   - Urban development scenarios

## Priority Matrix

### Must Have (Phase 1-3)
- Database schema extensions
- Occupation system
- Business system
- Event system
- Hiring mechanics

### Should Have (Phase 4-5)
- Routine system
- Whereabouts tracking
- Location system
- Property management

### Nice to Have (Phase 6-7)
- Mind system
- Personality integration
- Cognitive modeling

### Enhancement (Phase 8-10)
- Rule integration
- Testing
- Documentation

## Success Metrics

1. **Feature Completeness**: 100% of TotT features implemented
2. **Performance**: Simulation of 100 characters for 100 timesteps < 5 seconds
3. **Rule Integration**: All TotT features accessible via Insimul rules
4. **Backward Compatibility**: Existing worlds continue to work
5. **Test Coverage**: >80% unit test coverage for new features

## Risks & Mitigations

### Risk 1: Schema Migration Complexity
**Mitigation**: Create migration scripts with rollback capability, test on copy of production data

### Risk 2: Performance Degradation
**Mitigation**: Profile early and often, use database indexes, consider caching layer

### Risk 3: Scope Creep
**Mitigation**: Stick to feature parity with TotT, defer enhancements to Phase 11+

### Risk 4: Backward Compatibility
**Mitigation**: Make all new features optional, provide default values, maintain legacy endpoints

## Next Steps

1. **Review and Approve**: Present this plan to stakeholders
2. **Setup Development Environment**: Create feature branch, setup test database
3. **Begin Phase 1**: Start with schema extensions
4. **Weekly Check-ins**: Review progress, adjust timeline as needed

## Conclusion

Integrating Talk of the Town features into Insimul will transform it from a rule-based social simulation platform into a comprehensive procedural narrative generation system. The phased approach ensures critical features are implemented first while maintaining system stability. The estimated timeline is 20 weeks for complete integration, with core features (Phases 1-3) available in 7 weeks.

The native integration approach will yield a unified system that is easier to maintain, more performant, and more powerful than running separate engines. This investment will position Insimul as a best-in-class social simulation platform combining the strengths of Ensemble, Kismet, and Talk of the Town.
