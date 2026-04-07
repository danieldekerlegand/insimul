# Talk of the Town Integration - Next Steps

## Immediate Actions (This Week)

### 1. Review & Approve Plan
**Estimated Time**: 2-3 hours  
**Owner**: Project stakeholders

- [ ] Review `TALKTOWN_INTEGRATION_PLAN.md`
- [ ] Review `TALKTOWN_FEATURE_SUMMARY.md`
- [ ] Discuss timeline and resource allocation
- [ ] Approve approach (native integration vs adapter)
- [ ] Identify team members for each phase

### 2. Setup Development Environment
**Estimated Time**: 1-2 hours  
**Owner**: Development team

```bash
# Create feature branch
cd /Users/danieldekerlegand/Development/school/insimul
git checkout -b feature/talktown-integration

# Setup test database
createdb insimul_talktown_test

# Update .env with test database
echo "TEST_DATABASE_URL=postgresql://localhost/insimul_talktown_test" >> .env

# Install any additional dependencies
npm install
```

### 3. Create Project Structure
**Estimated Time**: 1 hour  
**Owner**: Development team

```bash
# Create new directories for TotT managers
mkdir -p server/managers
mkdir -p server/events
mkdir -p server/types

# Create placeholder files
touch server/managers/occupation-manager.ts
touch server/managers/business-manager.ts
touch server/managers/routine-manager.ts
touch server/managers/property-manager.ts
touch server/managers/mind-manager.ts

touch server/events/life-events.ts
touch server/events/employment-events.ts
touch server/events/property-events.ts

touch server/types/occupation-types.ts
touch server/types/business-types.ts
```

## Week 1: Foundation - Schema Design

### Day 1-2: Design & Document Schema Changes
**Owner**: Database architect / Lead developer

#### Task Checklist:
- [ ] Design `occupations` table structure
  - Relationships to characters and businesses
  - Indexes for performance
  - Constraints for data integrity
  
- [ ] Design `businesses` table structure
  - Relationships to characters (owners, employees)
  - Business type enumeration
  - Status tracking
  
- [ ] Design `lots` table structure
  - Address structure
  - Spatial relationships
  - Building connections
  
- [ ] Design `residences` table structure
  - Multi-owner support
  - Resident tracking
  
- [ ] Design `whereabouts` table structure
  - Efficient timestep lookups
  - Occasion enumeration

#### Deliverables:
- Database schema diagram
- Table creation SQL scripts
- Migration plan document

### Day 3-4: Extend Character & World Schemas
**Owner**: Backend developer

#### Task Checklist:
- [ ] Update Character schema in `shared/schema.ts`:
  ```typescript
  // Add fields
  collegeGraduate: boolean
  retired: boolean
  departureYear: integer
  currentOccupationId: varchar (FK to occupations)
  
  // Structure personality
  personality: {
    openness: real,
    conscientiousness: real,
    extroversion: real,
    agreeableness: real,
    neuroticism: real
  }
  
  // Add mind fields
  memory: real (0.0-1.0)
  
  // Add relationship arrays
  coworkerIds: string[]
  friendIds: string[]
  neighborIds: string[]
  immediateFamilyIds: string[]
  extendedFamilyIds: string[]
  ```

- [ ] Update World schema in `shared/schema.ts`:
  ```typescript
  // Add time granularity
  currentMonth: integer (1-12)
  currentDay: integer (1-31)
  timeOfDay: text ('day' | 'night')
  ordinalDate: bigint
  
  // Add tracking arrays
  unemployedCharacterIds: string[]
  vacantLotIds: string[]
  companyIds: string[]
  ```

#### Deliverables:
- Updated `shared/schema.ts`
- TypeScript types for new structures
- Zod validation schemas

### Day 5: Write Migration Scripts
**Owner**: Database administrator

#### Task Checklist:
- [ ] Create migration script: `001_add_occupations_table.sql`
- [ ] Create migration script: `002_add_businesses_table.sql`
- [ ] Create migration script: `003_add_lots_residences_tables.sql`
- [ ] Create migration script: `004_add_whereabouts_table.sql`
- [ ] Create migration script: `005_extend_characters_schema.sql`
- [ ] Create migration script: `006_extend_worlds_schema.sql`
- [ ] Create rollback script for each migration
- [ ] Test migrations on development database

#### Deliverables:
- Complete migration script set
- Rollback scripts
- Migration execution log

## Week 2: Foundation - Core Types & Managers

### Day 1-2: Create Type Definitions
**Owner**: Backend developer

#### Task Checklist:
- [ ] Create `server/types/occupation-types.ts`:
  ```typescript
  export interface Occupation {
    id: string;
    characterId: string;
    businessId: string;
    vocation: OccupationType;
    level: number; // 1-5
    shift: 'day' | 'night';
    startYear: number;
    endYear: number | null;
    yearsExperience: number;
    terminationReason: string | null;
    predecessorId: string | null;
    successorId: string | null;
    isSupplemental: boolean;
    hiredAsFavor: boolean;
  }
  
  export type OccupationType = 
    'Owner' | 'Manager' | 'Worker' | 'Doctor' | 
    'Lawyer' | 'Apprentice' | /* ...60+ more */ ;
  ```

- [ ] Create `server/types/business-types.ts`:
  ```typescript
  export interface Business {
    id: string;
    worldId: string;
    name: string;
    businessType: BusinessType;
    ownerId: string;
    founderId: string;
    isOutOfBusiness: boolean;
    foundedYear: number;
    closedYear: number | null;
  }
  
  export type BusinessType = 
    'Generic' | 'LawFirm' | 'ApartmentComplex' | 
    'Bakery' | 'Hospital' | /* ... */ ;
  ```

- [ ] Create `server/types/property-types.ts`:
  ```typescript
  export interface Lot {
    id: string;
    worldId: string;
    address: string;
    houseNumber: number;
    streetName: string;
    buildingId: string | null;
    buildingType: 'residence' | 'business' | null;
    neighboringLotIds: string[];
  }
  
  export interface Residence {
    id: string;
    lotId: string;
    ownerIds: string[];
    residentIds: string[];
  }
  ```

#### Deliverables:
- Complete type definitions
- JSDoc documentation for all types
- Type export from index file

### Day 3-5: Stub Manager Classes
**Owner**: Backend developer

#### Task Checklist:
- [ ] Create `server/managers/occupation-manager.ts`:
  ```typescript
  export class OccupationManager {
    async createOccupation(data: CreateOccupationData): Promise<Occupation>
    async terminateOccupation(id: string, reason: string): Promise<void>
    async getOccupation(id: string): Promise<Occupation | null>
    async getCharacterOccupation(characterId: string): Promise<Occupation | null>
    async getBusinessEmployees(businessId: string): Promise<Occupation[]>
    calculateYearsExperience(startYear: number, currentYear: number): number
    // ... more methods
  }
  ```

- [ ] Create `server/managers/business-manager.ts`:
  ```typescript
  export class BusinessManager {
    async createBusiness(data: CreateBusinessData): Promise<Business>
    async closeBusiness(id: string, reason: string): Promise<void>
    async getBusiness(id: string): Promise<Business | null>
    async getWorldBusinesses(worldId: string): Promise<Business[]>
    async getBusinessesByType(worldId: string, type: BusinessType): Promise<Business[]>
    // ... more methods
  }
  ```

- [ ] Create `server/managers/hiring-manager.ts`:
  ```typescript
  export class HiringManager {
    async assembleCandidates(businessId: string, occupation: OccupationType): Promise<string[]>
    async checkQualifications(characterId: string, occupation: OccupationType): Promise<boolean>
    async scoreCandidates(candidateIds: string[], businessId: string): Promise<Map<string, number>>
    async selectCandidate(scores: Map<string, number>): Promise<string>
    async hire(businessId: string, candidateId: string, occupation: OccupationType): Promise<Occupation>
    // ... more methods
  }
  ```

#### Deliverables:
- Manager class stubs with method signatures
- Unit test scaffolding for each manager
- Integration with unified-engine.ts

## Week 3-5: Business & Occupation Implementation

### Priority Tasks:
1. Implement full hiring system with scoring
2. Implement occupation lifecycle (create, terminate, succession)
3. Implement business lifecycle (found, close)
4. Create config loader for occupation rules
5. Add coworker relationship management

### Deliverables:
- Fully functional occupation system
- Fully functional business system
- Complete hiring algorithm
- Config-based qualification checking
- Unit tests for all functionality

## Quick Decision Tree

### Should I start this week?
**YES**, if:
- ✅ Plan is reviewed and approved
- ✅ Team has 1-2 developers available
- ✅ Test database is available
- ✅ Development environment is ready

**NO**, if:
- ❌ Plan needs significant revisions
- ❌ No developers available
- ❌ Database infrastructure not ready
- ❌ Other critical priorities

### Which phase should I prioritize?
- **Phase 1-3** (Weeks 1-7): If you need core TotT features ASAP
- **Phase 4-5** (Weeks 8-11): If you need behavioral realism
- **Phase 6-7** (Weeks 12-15): If you need cognitive depth
- **Phase 8-10** (Weeks 16-20): If you need polish and docs

## Resources & References

### Primary Documents:
1. **TALKTOWN_INTEGRATION_PLAN.md** - Complete specification
2. **TALKTOWN_IMPLEMENTATION_CHECKLIST.md** - Task-by-task guide
3. **TALKTOWN_FEATURE_SUMMARY.md** - Quick feature overview

### Reference Code:
- `server/engines/talktown/src/` - Original TotT TypeScript implementation
- `server/engines/unified-engine.ts` - Current Insimul engine
- `shared/schema.ts` - Current database schema

### Testing Reference:
- `server/engines/talktown/src/demo_tutorial.ts` - TotT demo to replicate

## Communication Plan

### Weekly Check-ins:
- **Monday**: Review previous week's progress
- **Wednesday**: Mid-week blocker resolution
- **Friday**: Demo completed features, plan next week

### Documentation Updates:
- Update checklist after each completed task
- Add notes to integration plan for decisions made
- Keep timeline updated with actuals

### Git Workflow:
```bash
# Feature branches for each phase
feature/talktown-phase-1-foundation
feature/talktown-phase-2-business
feature/talktown-phase-3-events
# ... etc

# Merge to main after phase completion and testing
git checkout main
git merge feature/talktown-phase-1-foundation
```

## Success Criteria for Week 1

- ✅ Database schema designed and documented
- ✅ Migration scripts written and tested
- ✅ Character/World schemas extended
- ✅ Type definitions created
- ✅ Manager stubs created
- ✅ All tests passing
- ✅ No regression in existing features

## Red Flags / Stop Conditions

🚩 **Stop and reassess if**:
- Performance degrades significantly (>2x slower)
- More than 50% of existing tests fail
- Database migrations cause data loss
- Team velocity drops below 50% of estimate
- Critical bugs introduced in existing features

## Questions to Answer Before Starting

1. **Do we have database admin approval for schema changes?**
2. **Is the test database environment ready?**
3. **Do we have bandwidth for 20 weeks of development?**
4. **Are we okay with potential temporary disruption?**
5. **Do we have rollback procedures ready?**
6. **Is monitoring/alerting setup to catch issues?**

## Contact & Support

- **Technical Questions**: Review `TALKTOWN_INTEGRATION_PLAN.md`
- **Implementation Questions**: Check `TALKTOWN_IMPLEMENTATION_CHECKLIST.md`
- **Reference Implementation**: See `server/engines/talktown/src/`
- **Blockers**: Document in project issue tracker

## Final Checklist Before Starting

- [ ] All planning documents reviewed
- [ ] Team assigned and available
- [ ] Development environment setup
- [ ] Test database created
- [ ] Migration plan approved
- [ ] Rollback plan documented
- [ ] Communication plan established
- [ ] Success criteria defined
- [ ] Timeline approved
- [ ] Budget approved (if applicable)

---

**Ready to begin? Start with Week 1, Day 1 tasks above! 🚀**
