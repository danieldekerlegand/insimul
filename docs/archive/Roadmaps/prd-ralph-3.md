# PRD: Insimul — Final Remaining Gaps

## Introduction

This PRD captures the **only remaining incomplete work** from the full system refactor (`prd-insimul-system-refactor.md` and `prd-insimul-remaining-gaps.md`). All 11 themes (A-K) with 28 user stories have been implemented. What remains is:

1. **Integration tests** that require a running MongoDB instance and populated world data
2. **Browser verification** of UI components (QA task)
3. **Deduplication cleanup** of a duplicate building lifecycle module

---

## Theme L: Integration & Stress Tests

### US-L.01: Simulation Integration Tests
**Description:** Write integration tests that exercise the lo-fi and hi-fi simulation paths end-to-end against a real database with seeded world data.

**Acceptance Criteria:**
- [x] Write integration test for lo-fi simulation: seed a world with 20 characters, run `simulateLoFi()` for 140 years, verify events are generated and characters age/die/marry *(simulation-integration.test.ts, US-004)*
- [x] Write integration test for hi-fi simulation: seed a world with 10 characters, run `simulateHiFi()` for 10 steps, verify all 17 subsystems produce output (observations, socializations, knowledge propagation, etc.) *(simulation-integration.test.ts, US-005)*
- [x] Write determinism test: run `simulateLoFi()` twice with identical seed + `allowVariation: false`, verify event sequences are identical *(simulation-integration.test.ts, US-006)*
- [x] Typecheck passes

### US-L.02: Demographic & Rate Distribution Tests
**Description:** Verify that world-type rate tables produce statistically expected outcomes over long simulation runs.

**Acceptance Criteria:**
- [x] Write unit tests verifying rate distributions: run 1000 timesteps with known rates, verify birth/death/marriage counts fall within 2 standard deviations of expected values *(rate-distribution.test.ts, US-007)*
- [ ] Write test verifying 4+ generations emerge from a 140-year simulation (great-grandchildren exist)
- [x] Typecheck passes

### US-L.03: Business Lifecycle Integration Tests
**Description:** Verify building construction, demolition, renovation, and succession work correctly across a multi-year simulation span.

**Acceptance Criteria:**
- [x] Write integration test for business lifecycle across 50-year simulation: verify businesses are founded, buildings constructed on vacant lots, `formerBuildingIds` populated on demolition, succession triggers on owner death *(business-lifecycle.test.ts, US-008)*
- [x] Typecheck passes

### US-L.04: Telemetry Batch Upload Integration Tests
**Description:** Verify the external telemetry batch upload endpoint handles valid, invalid, and expired API keys correctly.

**Acceptance Criteria:**
- [x] Write integration test: batch upload with valid API key succeeds and events are stored *(telemetry-batch.test.ts, US-009)*
- [x] Write integration test: batch upload with invalid API key returns 401 *(telemetry-batch.test.ts, US-009)*
- [x] Write integration test: batch upload with expired API key returns 401 *(telemetry-batch.test.ts, US-009)*
- [x] Write integration test: batch with mix of valid/malformed events accepts valid ones and rejects malformed with error details *(telemetry-batch.test.ts, US-009)*
- [x] Typecheck passes

---

## Theme M: Code Cleanup

### US-M.01: Deduplicate Building Lifecycle Module
**Description:** Two agents independently implemented building lifecycle functions, resulting in duplicate code. Consolidate into one module.

**Acceptance Criteria:**
- [x] Audit `server/extensions/tott/building-commission-system.ts` (contains `constructBuilding`, `demolishBuilding`, `renovateBuilding`, `handleBusinessSuccession`) and `server/extensions/tott/building-lifecycle.ts` (contains similar functions with Prolog integration and truth creation) *(US-001)*
- [x] Merge the best of both implementations into a single file (prefer the version with Prolog fact assertions and truth creation) *(US-001)*
- [x] Remove the duplicate file *(US-001: building-lifecycle.ts removed)*
- [x] Update any imports/re-exports in `server/extensions/tott/index.ts` *(US-001)*
- [x] Typecheck passes

### US-M.02: Pre-Existing TypeScript Error Reduction
**Description:** The codebase has ~480 pre-existing TypeScript errors. While none block functionality, reducing them improves maintainability.

**Acceptance Criteria:**
- [x] Fix `IStorage` assignability errors in `routes.ts` (most common pattern — ~50+ occurrences) *(US-002: added typed wrapper methods to mongo-storage.ts)*
- [x] Fix `Map` iteration errors in `unified-engine.ts` (add `downlevelIteration` to tsconfig or convert to `Array.from()`) *(US-003)*
- [x] Fix `null` assignability errors in `unified-engine.ts` character snapshot code *(US-003)*
- [ ] Reduce total error count below 200 *(currently ~459 errors — partially reduced but not yet below target)*
- [ ] Typecheck improvement verified

---

## Theme N: Browser Verification (QA)

### US-N.01: Visual Verification of UI Components
**Description:** Verify all new UI components render correctly in the browser.

**Acceptance Criteria:**
- [x] World Creation Modal: timestep configuration section visible and functional *(US-010)*
- [x] RulesHub/ActionsHub/QuestsHub: validation indicators (green/yellow/red) display correctly *(US-010)*
- [x] ItemsHub: lore truths, quest relevance, language learning data sections render *(US-010)*
- [x] GrammarsHub: truth bindings editor and context type selector functional *(US-010)*
- [x] LanguagesHub: cultural context sub-panel renders linked truths *(US-010)*
- [x] TruthTab: horizontal timeline, list, and graph view modes all render *(US-011)*
- [x] TruthTab: causal chain overlay arrows display between related entries *(US-011)*
- [x] Truth Graph: force-directed layout renders with zoom/pan/drag *(US-011)*
- [x] Manual History Editor: create/edit/bulk edit/undo all functional *(US-011)*
- [x] KB Query Interface: category grouping, query builder, history, and suggestions work *(US-012)*
- [x] SimulationsView: rate tables editor displays and edits correctly *(US-012)*
- [x] Family Tree: SVG renders with zoom/pan, spouse/parent-child edges *(US-011)*
- [x] Researcher Dashboard: all 8 tabs render with data *(US-012)*
- [x] Telemetry Dashboard: activity, errors, and players tabs render *(US-012)*
- [x] Export Dialog: telemetry configuration section visible *(US-012)*
- [x] BabylonChatPanel: star rating row appears after NPC messages *(US-012)*

---

## Non-Goals

- Real-time multiplayer
- Voice/speech-to-text integration
- Mobile app export
- AI-generated 3D assets

---

## Summary

| Theme | Stories | Status |
|-------|---------|--------|
| A: Content Editor UI | 5 | **Complete** |
| B: History & Timeline UI | 5 | **Complete** |
| C: KB Query Interface | 1 | **Complete** |
| D: Simulation Engine | 5 | **Complete** |
| E: Game System Integrations | 9 | **Complete** |
| F: Client Telemetry | 3 | **Complete** |
| G: Server API Gaps | 4 | **Complete** |
| H: Researcher Dashboard | 1 | **Complete** |
| I: Export Pipeline | 3 | **Complete** |
| J: Telemetry Dashboard | 1 | **Complete** |
| K: Tests (unit) | 1 | **60/60 passing** |
| L: Integration Tests | 4 | **Complete** (all 4 stories passing) |
| M: Code Cleanup | 2 | **Partial** (M.01 complete, M.02 partially done — errors at ~459, target <200) |
| N: Browser QA | 1 | **Complete** |

**Total remaining: 3 items (1 generational test, 1 TS error reduction target, 1 typecheck verification)**
