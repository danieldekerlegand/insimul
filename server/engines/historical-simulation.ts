/**
 * Historical Simulation Engine (US-3.01)
 *
 * Implements Talk of the Town's two-phase historical simulation:
 *   Phase 1 — Lo-fi compression: simulates ~140 years of town history by sampling
 *             only a small percentage of timesteps (default 3.6%), running full
 *             lifecycle checks (births, deaths, marriages, etc.) on sampled steps
 *             and abbreviated vital-statistics-only checks on the rest.
 *   Phase 2 — Hi-fi final period: the last 7 in-world days before gameplay begins
 *             are simulated at full tick resolution with complete social dynamics,
 *             knowledge propagation, and Ensemble volition. (Deferred to US-3.02.)
 *
 * Design goals:
 *   - Deterministic replay via seeded PRNG (Mulberry32)
 *   - Pausable / cancellable long-running simulation with progress events
 *   - LLM enrichment tiers so expensive narration is only applied to
 *     high-importance events
 *   - Compatible with the existing unified-engine SimulationContext and
 *     TotT lifecycle / event subsystems
 */

import { EventEmitter } from 'events';
import {
  getEraProbabilities,
  getEraName,
  getEra,
  adjustForPopulation,
  adjustForEconomicConditionsByYear,
  createCustomConfig,
  type EraProbabilities,
  type EraProbabilityConfig,
  type EraDefinition,
} from './era-probability-models';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Configuration for a historical simulation run. */
export interface HistoricalSimConfig {
  /** The world being simulated. */
  worldId: string;

  /** First year of the lo-fi historical window (inclusive). */
  historyStartYear: number;

  /** Last year of the lo-fi historical window (exclusive — gameplay begins here). */
  historyEndYear: number;

  /**
   * Percentage of lo-fi timesteps that receive full simulation (0-100).
   * Talk of the Town uses ~3.6 % so that a 140-year history produces roughly
   * the same number of fully-simulated steps as a single in-game week.
   * @default 3.6
   */
  samplingRate: number;

  /** Seed for the deterministic PRNG. Same seed + same config = same history. */
  seed: number;

  /**
   * When true the PRNG is re-seeded with entropy at certain decision points
   * so that runs are not perfectly reproducible. Set to false for study /
   * regression-test reproducibility.
   * @default true
   */
  allowVariation: boolean;

  /**
   * Which event categories to simulate.  An empty array enables all types.
   * Recognised values: birth, death, marriage, divorce, hiring, retirement,
   * business_founding, business_closure.
   */
  enabledEventTypes: string[];

  /**
   * Controls which events are enriched with LLM-generated narrative prose.
   *   - 'none'  — no LLM calls (fastest)
   *   - 'minor' — only settlement-level and above
   *   - 'major' — only country/world significance
   *   - 'all'   — every event (slow, expensive)
   */
  llmEnrichmentTier: 'none' | 'minor' | 'major' | 'all';

  /**
   * Custom era probability configuration.  If omitted the built-in defaults
   * from `era-probability-models.ts` are used.  Pass the result of
   * {@link createCustomConfig} to override base rates or era multipliers.
   */
  eraProbabilityConfig?: EraProbabilityConfig;

  /**
   * Initial settlement population used as a starting seed for demographic
   * calculations.  The simulation will grow / shrink this organically.
   * @default 200
   */
  initialPopulation?: number;
}

// ---------------------------------------------------------------------------
// Event / Progress types
// ---------------------------------------------------------------------------

/** A single discrete event produced by the simulation. */
export interface SimulationEvent {
  /** Event category (birth, death, marriage, divorce, hiring, retirement, business_founding, business_closure, etc.). */
  type: string;

  /** Calendar year in which the event occurs. */
  year: number;

  /**
   * Month of the year (1-12).  In lo-fi mode this is estimated from the
   * half-year bucket; in hi-fi mode it is exact.
   */
  month: number;

  /** Day of the month (1-31).  Approximated in lo-fi, exact in hi-fi. */
  day: number;

  /** Global timestep counter (monotonically increasing across the run). */
  timestep: number;

  /** IDs of all characters directly involved in this event. */
  characterIds: string[];

  /** Location (settlement / lot / business) where the event takes place, if applicable. */
  locationId?: string;

  /** Human-readable description.  May be template-generated or LLM-enriched. */
  description: string;

  /** Importance on a 1-10 scale.  Used to decide LLM enrichment and UI prominence. */
  importance: number;

  /** Scope at which this event is historically significant. */
  historicalSignificance: 'world' | 'country' | 'state' | 'settlement' | 'family' | 'personal';

  /** Arbitrary key/value bag for event-type-specific data (cause of death, business type, etc.). */
  metadata: Record<string, any>;
}

/** Snapshot of simulation progress, emitted via the 'progress' event. */
export interface SimulationProgress {
  /** Year currently being simulated. */
  currentYear: number;

  /** Total span of years in the simulation window. */
  totalYears: number;

  /** Cumulative number of events generated so far. */
  eventsGenerated: number;

  /** Which phase the engine is in. */
  phase: 'lo-fi' | 'hi-fi' | 'enrichment' | 'complete';

  /** Normalised progress (0 = just started, 1 = finished). */
  progress: number;

  /** Current era name (present during lo-fi and hi-fi phases). */
  era?: string;

  /** Current settlement population (present during lo-fi and hi-fi phases). */
  population?: number;
}

// ---------------------------------------------------------------------------
// Default configuration helpers
// ---------------------------------------------------------------------------

const DEFAULT_SAMPLING_RATE = 3.6;

/** Merge user-provided partial config with sensible defaults. */
function applyDefaults(partial: Partial<HistoricalSimConfig> & Pick<HistoricalSimConfig, 'worldId' | 'seed'>): HistoricalSimConfig {
  return {
    historyStartYear: partial.historyStartYear ?? 1839,
    historyEndYear: partial.historyEndYear ?? 1979,
    samplingRate: partial.samplingRate ?? DEFAULT_SAMPLING_RATE,
    allowVariation: partial.allowVariation ?? true,
    enabledEventTypes: partial.enabledEventTypes ?? [],
    llmEnrichmentTier: partial.llmEnrichmentTier ?? 'none',
    ...partial,
  };
}

// ---------------------------------------------------------------------------
// HistoricalSimulationEngine
// ---------------------------------------------------------------------------

/**
 * Two-phase historical simulation engine.
 *
 * Usage:
 * ```ts
 * const engine = new HistoricalSimulationEngine({
 *   worldId: 'abc',
 *   historyStartYear: 1839,
 *   historyEndYear: 1979,
 *   samplingRate: 3.6,
 *   seed: 42,
 *   allowVariation: true,
 *   enabledEventTypes: [],
 *   llmEnrichmentTier: 'none',
 * });
 *
 * engine.on('progress', (p: SimulationProgress) => console.log(p));
 * engine.on('event', (e: SimulationEvent) => console.log(e));
 *
 * const events = await engine.run();
 * ```
 *
 * Events emitted:
 *   - `'progress'` — {@link SimulationProgress} after every simulated year
 *   - `'event'`    — {@link SimulationEvent} as each event is generated
 */
export class HistoricalSimulationEngine extends EventEmitter {
  private config: HistoricalSimConfig;
  private events: SimulationEvent[] = [];
  private rng: SeededRNG;
  private isPaused = false;
  private isCancelled = false;

  /**
   * Simulated population count.  Grows / shrinks via births, deaths, and
   * migration events.  Used by {@link adjustForPopulation} to keep
   * demographics plausible for different town sizes.
   */
  private population: number;

  /** Resolved era probabilities for the year currently being simulated. */
  private currentEraProbabilities: EraProbabilities | null = null;

  /** Era definition for the year currently being simulated. */
  private currentEra: EraDefinition | null = null;

  constructor(config: HistoricalSimConfig) {
    super();
    this.config = config;
    this.rng = new SeededRNG(config.seed);
    this.population = config.initialPopulation ?? 200;
  }

  // -----------------------------------------------------------------------
  // Era probability helpers (internal)
  // -----------------------------------------------------------------------

  /**
   * Refresh cached era probabilities for the given year.
   * Called once per simulated year so individual event checks don't repeat
   * the lookup.
   */
  private refreshEraProbabilities(year: number): void {
    this.currentEra = getEra(year, this.config.eraProbabilityConfig);
    this.currentEraProbabilities = getEraProbabilities(year, this.config.eraProbabilityConfig);
  }

  /**
   * Get the effective probability for a given channel, accounting for era,
   * population, and economic-condition adjustments.
   */
  private getEffectiveProbability(channel: keyof EraProbabilities, year: number): number {
    if (!this.currentEraProbabilities) {
      this.refreshEraProbabilities(year);
    }
    let prob = this.currentEraProbabilities![channel];

    // Apply population adjustment
    prob = adjustForPopulation(prob, this.population);

    // Layer on economic condition adjustment
    prob = adjustForEconomicConditionsByYear(prob, year, channel, this.config.eraProbabilityConfig);

    return prob;
  }

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  /**
   * Run the full two-phase simulation.
   *
   * @returns All {@link SimulationEvent}s produced across both phases.
   */
  async run(): Promise<SimulationEvent[]> {
    this.events = [];
    this.isPaused = false;
    this.isCancelled = false;

    // Phase 1: Lo-fi historical compression
    await this.runLoFiSimulation();

    // Phase 2: Hi-fi final period (last 7 days before gameplay)
    // Deferred to US-3.02 — will use full tick resolution with social dynamics,
    // knowledge propagation, Ensemble volition, and Kismet narrative triggers.
    // await this.runHiFiSimulation();

    this.emit('progress', {
      currentYear: this.config.historyEndYear,
      totalYears: this.config.historyEndYear - this.config.historyStartYear,
      eventsGenerated: this.events.length,
      phase: 'complete',
      progress: 1,
    } as SimulationProgress);

    return this.events;
  }

  /** Pause simulation at the next yield point (between years). */
  pause(): void {
    this.isPaused = true;
  }

  /** Resume a paused simulation. */
  resume(): void {
    this.isPaused = false;
  }

  /** Cancel the simulation.  Already-generated events are retained. */
  cancel(): void {
    this.isCancelled = true;
  }

  /** Return all events accumulated so far (useful while simulation is running). */
  getEvents(): ReadonlyArray<SimulationEvent> {
    return this.events;
  }

  /** Return the current configuration (read-only copy). */
  getConfig(): Readonly<HistoricalSimConfig> {
    return { ...this.config };
  }

  // -----------------------------------------------------------------------
  // Phase 1 — Lo-fi historical compression
  // -----------------------------------------------------------------------

  /**
   * Simulate the long historical window at low fidelity.
   *
   * Each year is divided into two half-year timesteps. Only
   * {@link HistoricalSimConfig.samplingRate}% of timesteps receive the full
   * battery of checks (marriages, divorces, business events, etc.).
   * Non-sampled timesteps still run birth and death checks so that the
   * population curve remains plausible.
   *
   * This mirrors Talk of the Town's approach where the 140-year history
   * is compressed by simulating only ~3.6% of all possible timesteps,
   * producing a manageable event count while preserving demographic realism.
   */
  private async runLoFiSimulation(): Promise<void> {
    const { historyStartYear, historyEndYear, samplingRate } = this.config;
    const totalYears = historyEndYear - historyStartYear;

    for (let year = historyStartYear; year < historyEndYear; year++) {
      if (this.isCancelled) break;

      // Yield to the event loop and honour pause requests
      while (this.isPaused) {
        await this.sleep(100);
      }

      // Refresh era probabilities once per year (avoids per-event lookup)
      this.refreshEraProbabilities(year);

      // Two timesteps per year in lo-fi (first half / second half)
      for (let halfYear = 0; halfYear < 2; halfYear++) {
        if (this.isCancelled) break;

        const timestep = (year - historyStartYear) * 2 + halfYear;
        const month = halfYear === 0 ? 3 : 9; // approximate: Mar / Sep
        const day = 15; // mid-month placeholder

        const isSampled = this.rng.random() * 100 <= samplingRate;

        if (!isSampled) {
          // Non-sampled timestep: only vital statistics so population stays realistic
          this.checkBirths(year, month, day, timestep);
          this.checkDeaths(year, month, day, timestep);
          this.checkMigration(year, month, day, timestep);
          continue;
        }

        // Fully-sampled timestep: run all enabled event generators
        this.checkBirths(year, month, day, timestep);
        this.checkDeaths(year, month, day, timestep);
        this.checkMarriages(year, month, day, timestep);
        this.checkDivorces(year, month, day, timestep);
        this.checkBusinessEvents(year, month, day, timestep);
        this.checkRetirements(year, month, day, timestep);
        this.checkJobSeeking(year, month, day, timestep);
        this.checkMigration(year, month, day, timestep);
        this.checkConstruction(year, month, day, timestep);
        this.checkTechnologyAdoption(year, month, day, timestep);
        this.checkEducationChanges(year, month, day, timestep);
        this.checkCulturalEvents(year, month, day, timestep);
      }

      // Emit progress after each year
      const progress = (year - historyStartYear + 1) / totalYears;
      this.emit('progress', {
        currentYear: year,
        totalYears,
        eventsGenerated: this.events.length,
        phase: 'lo-fi',
        progress,
        era: this.currentEra!.name,
        population: this.population,
      } as SimulationProgress);
    }
  }

  // -----------------------------------------------------------------------
  // Event generators — era-probability-driven (US-3.02)
  //
  // Each method uses the era probability models to determine how many events
  // of its type fire for this timestep.  The population-level approach works
  // by computing "expected events = probability × eligible pool size" and
  // then sampling a Poisson-like count via the PRNG.
  //
  // When the full character roster is loaded (future US), these methods will
  // iterate individual characters.  For now they operate at the aggregate
  // population level so the demographic curves are correct even without a
  // character list.
  // -----------------------------------------------------------------------

  /**
   * Estimate a discrete event count from a per-capita probability and pool
   * size using a Poisson-approximation approach.  For small expected values
   * (< 20) each unit is rolled individually; for larger pools we use the
   * normal approximation to Poisson.
   */
  private sampleEventCount(probability: number, poolSize: number): number {
    if (poolSize <= 0 || probability <= 0) return 0;

    const expected = probability * poolSize;

    if (expected < 20) {
      // Individual rolls — exact but O(poolSize)
      let count = 0;
      const limit = Math.min(poolSize, 200); // cap iterations for very large pools
      for (let i = 0; i < limit; i++) {
        if (this.rng.chance(probability)) count++;
      }
      // Scale up if we capped
      if (limit < poolSize) {
        count = Math.round((count / limit) * poolSize);
      }
      return count;
    }

    // Normal approximation to Poisson: N(expected, expected)
    // Box-Muller for a single normal variate
    const u1 = this.rng.random();
    const u2 = this.rng.random();
    const z = Math.sqrt(-2 * Math.log(Math.max(u1, 1e-10))) * Math.cos(2 * Math.PI * u2);
    const sampled = expected + z * Math.sqrt(expected);
    return Math.max(0, Math.round(sampled));
  }

  /**
   * Check for and generate birth events.
   *
   * Uses the era-adjusted birth rate applied against an estimated pool of
   * couples of childbearing age (~25 % of population).  Each birth
   * increments the tracked population.
   */
  private checkBirths(year: number, month: number, day: number, timestep: number): void {
    if (!this.isEventTypeEnabled('birth')) return;

    const prob = this.getEffectiveProbability('birthRate', year);
    // Approximate eligible couples: ~25% of population (married adults of childbearing age)
    const eligibleCouples = Math.floor(this.population * 0.25);
    const births = this.sampleEventCount(prob, eligibleCouples);

    for (let i = 0; i < births; i++) {
      this.population++;
      this.addEvent({
        type: 'birth',
        year, month, day, timestep,
        characterIds: [],
        description: `A child is born in the settlement (pop. ${this.population}).`,
        importance: 2,
        historicalSignificance: 'family',
        metadata: { era: this.currentEra!.name, population: this.population },
      });
    }
  }

  /**
   * Check for and generate death events.
   *
   * Uses the era-adjusted death rate against the full population.  Each
   * death decrements the tracked population.  The era multiplier already
   * encodes historical mortality trends (pre-antibiotic, wartime, etc.);
   * individual age-based mortality will be layered on when the character
   * roster is available.
   */
  private checkDeaths(year: number, month: number, day: number, timestep: number): void {
    if (!this.isEventTypeEnabled('death')) return;

    const prob = this.getEffectiveProbability('deathRate', year);
    const deaths = this.sampleEventCount(prob, this.population);

    for (let i = 0; i < deaths; i++) {
      if (this.population <= 1) break; // prevent extinction
      this.population--;
      this.addEvent({
        type: 'death',
        year, month, day, timestep,
        characterIds: [],
        description: `A resident passes away (pop. ${this.population}).`,
        importance: 3,
        historicalSignificance: 'family',
        metadata: { era: this.currentEra!.name, population: this.population },
      });
    }
  }

  /**
   * Check for and generate marriage events.
   *
   * Applies the era-adjusted marriage rate against an estimated pool of
   * unmarried adults (~30 % of population).
   */
  private checkMarriages(year: number, month: number, day: number, timestep: number): void {
    if (!this.isEventTypeEnabled('marriage')) return;

    const prob = this.getEffectiveProbability('marriageRate', year);
    // Approximate eligible singles: ~30% of population
    const eligibleSingles = Math.floor(this.population * 0.30);
    // Each marriage consumes two singles, so cap at half the pool
    const marriages = Math.min(
      this.sampleEventCount(prob, eligibleSingles),
      Math.floor(eligibleSingles / 2),
    );

    for (let i = 0; i < marriages; i++) {
      this.addEvent({
        type: 'marriage',
        year, month, day, timestep,
        characterIds: [],
        description: `A couple marries in the ${this.currentEra!.name}.`,
        importance: 3,
        historicalSignificance: 'family',
        metadata: { era: this.currentEra!.name },
      });
    }
  }

  /**
   * Check for and generate divorce events.
   *
   * Divorce probability varies dramatically by era — near-zero before 1900,
   * peaking in the 1970s–1980s.  Applied against estimated married couples
   * (~35 % of population).
   */
  private checkDivorces(year: number, month: number, day: number, timestep: number): void {
    if (!this.isEventTypeEnabled('divorce')) return;

    const prob = this.getEffectiveProbability('divorceRate', year);
    // Approximate married couples: ~35% of population (as pairs)
    const marriedCouples = Math.floor(this.population * 0.35 / 2);
    const divorces = this.sampleEventCount(prob, marriedCouples);

    for (let i = 0; i < divorces; i++) {
      this.addEvent({
        type: 'divorce',
        year, month, day, timestep,
        characterIds: [],
        description: `A couple divorces during the ${this.currentEra!.name}.`,
        importance: 3,
        historicalSignificance: 'family',
        metadata: { era: this.currentEra!.name },
      });
    }
  }

  /**
   * Check for and generate business lifecycle events (founding and closure).
   *
   * Founding rate is per-capita; closure rate is per-business (estimated as
   * ~1 business per 20 residents).  Both are heavily modulated by economic
   * conditions via the era model.
   */
  private checkBusinessEvents(year: number, month: number, day: number, timestep: number): void {
    // Business founding
    if (this.isEventTypeEnabled('business_founding')) {
      const foundingProb = this.getEffectiveProbability('businessFoundingRate', year);
      const foundings = this.sampleEventCount(foundingProb, this.population);

      for (let i = 0; i < foundings; i++) {
        this.addEvent({
          type: 'business_founding',
          year, month, day, timestep,
          characterIds: [],
          description: `A new business opens during the ${this.currentEra!.name}.`,
          importance: 4,
          historicalSignificance: 'settlement',
          metadata: { era: this.currentEra!.name, economicCondition: this.currentEra!.economicCondition },
        });
      }
    }

    // Business closure
    if (this.isEventTypeEnabled('business_closure')) {
      const closureProb = this.getEffectiveProbability('businessClosureRate', year);
      // Estimate ~1 business per 20 residents
      const estimatedBusinesses = Math.max(1, Math.floor(this.population / 20));
      const closures = this.sampleEventCount(closureProb, estimatedBusinesses);

      for (let i = 0; i < closures; i++) {
        this.addEvent({
          type: 'business_closure',
          year, month, day, timestep,
          characterIds: [],
          description: `A business closes during the ${this.currentEra!.name}.`,
          importance: 4,
          historicalSignificance: 'settlement',
          metadata: { era: this.currentEra!.name, economicCondition: this.currentEra!.economicCondition },
        });
      }
    }
  }

  /**
   * Check for and generate retirement events.
   *
   * Retirement probability is applied to an estimated pool of workers aged
   * 65+ (~8 % of population).  The era model does not currently scale
   * retirement rates, but the population adjustment ensures small towns
   * don't lose their entire workforce.
   */
  private checkRetirements(year: number, month: number, day: number, timestep: number): void {
    if (!this.isEventTypeEnabled('retirement')) return;

    // ~8% of population is 65+, ~70% of those are still working
    const eligibleWorkers = Math.floor(this.population * 0.08 * 0.70);
    // Base retirement probability: ~20% per half-year for 65+ (high to ensure turnover)
    const retirementProb = 0.10;
    const retirements = this.sampleEventCount(retirementProb, eligibleWorkers);

    for (let i = 0; i < retirements; i++) {
      this.addEvent({
        type: 'retirement',
        year, month, day, timestep,
        characterIds: [],
        description: `A worker retires during the ${this.currentEra!.name}.`,
        importance: 2,
        historicalSignificance: 'personal',
        metadata: { era: this.currentEra!.name },
      });
    }
  }

  /**
   * Check for and generate job-seeking / hiring events.
   *
   * Applied to an estimated pool of unemployed adults (~10 % of population).
   * Hiring probability is inversely related to business closure rate in the
   * era model.
   */
  private checkJobSeeking(year: number, month: number, day: number, timestep: number): void {
    if (!this.isEventTypeEnabled('hiring')) return;

    // ~10% of population is unemployed and seeking
    const jobSeekers = Math.floor(this.population * 0.10);
    // Hiring probability inversely tracks business closures: good economy = more hiring
    const closureProb = this.getEffectiveProbability('businessClosureRate', year);
    // Invert: low closure → high hiring; base ~30% hiring rate
    const hiringProb = Math.max(0.05, 0.30 - closureProb);
    const hires = this.sampleEventCount(hiringProb, jobSeekers);

    for (let i = 0; i < hires; i++) {
      this.addEvent({
        type: 'hiring',
        year, month, day, timestep,
        characterIds: [],
        description: `A resident finds employment during the ${this.currentEra!.name}.`,
        importance: 2,
        historicalSignificance: 'personal',
        metadata: { era: this.currentEra!.name },
      });
    }
  }

  /**
   * Check for migration events (in and out).
   *
   * In-migration adds to population; out-migration subtracts.  Both are
   * era-adjusted — e.g. high in-migration during immigration waves, high
   * out-migration during Dust Bowl.
   */
  private checkMigration(year: number, month: number, day: number, timestep: number): void {
    // In-migration
    if (this.isEventTypeEnabled('migration_in')) {
      const inProb = this.getEffectiveProbability('migrationInRate', year);
      const arrivals = this.sampleEventCount(inProb, this.population);

      for (let i = 0; i < arrivals; i++) {
        this.population++;
        this.addEvent({
          type: 'migration_in',
          year, month, day, timestep,
          characterIds: [],
          description: `A new resident arrives in the settlement (pop. ${this.population}).`,
          importance: 2,
          historicalSignificance: 'personal',
          metadata: { era: this.currentEra!.name, population: this.population },
        });
      }
    }

    // Out-migration
    if (this.isEventTypeEnabled('migration_out')) {
      const outProb = this.getEffectiveProbability('migrationOutRate', year);
      const departures = this.sampleEventCount(outProb, this.population);

      for (let i = 0; i < departures; i++) {
        if (this.population <= 10) break; // prevent ghost town
        this.population--;
        this.addEvent({
          type: 'migration_out',
          year, month, day, timestep,
          characterIds: [],
          description: `A resident leaves the settlement (pop. ${this.population}).`,
          importance: 1,
          historicalSignificance: 'personal',
          metadata: { era: this.currentEra!.name, population: this.population },
        });
      }
    }
  }

  /**
   * Check for new construction events.
   *
   * Construction rate is per-settlement (not per-capita) and heavily
   * influenced by era — booming in post-war suburbanization, depressed
   * during the Great Depression.
   */
  private checkConstruction(year: number, month: number, day: number, timestep: number): void {
    if (!this.isEventTypeEnabled('construction')) return;

    const prob = this.getEffectiveProbability('constructionRate', year);
    // Construction is settlement-level: use 1 as pool (it's a per-settlement rate)
    // but scale by population demand (more people = more building needed)
    const demandFactor = Math.max(1, Math.floor(this.population / 100));
    const constructions = this.sampleEventCount(prob, demandFactor);

    for (let i = 0; i < constructions; i++) {
      this.addEvent({
        type: 'construction',
        year, month, day, timestep,
        characterIds: [],
        description: `New construction begins during the ${this.currentEra!.name}.`,
        importance: 4,
        historicalSignificance: 'settlement',
        metadata: { era: this.currentEra!.name },
      });
    }
  }

  /**
   * Check for technology adoption events.
   *
   * Models the diffusion of new technologies through the settlement — slow
   * in pre-industrial, exponentially faster in contemporary era.
   */
  private checkTechnologyAdoption(year: number, month: number, day: number, timestep: number): void {
    if (!this.isEventTypeEnabled('technology_adoption')) return;

    const prob = this.getEffectiveProbability('technologyAdoptionRate', year);
    const adoptions = this.sampleEventCount(prob, this.population);

    if (adoptions > 0) {
      // Aggregate into a single settlement-level event
      this.addEvent({
        type: 'technology_adoption',
        year, month, day, timestep,
        characterIds: [],
        description: `New technology spreads through the settlement during the ${this.currentEra!.name}.`,
        importance: 5,
        historicalSignificance: 'settlement',
        metadata: { era: this.currentEra!.name, adopters: adoptions },
      });
    }
  }

  /**
   * Check for education-level changes.
   *
   * Models increasing educational attainment across eras — from limited
   * schooling in pre-industrial to near-universal high school and widespread
   * college in modern era.
   */
  private checkEducationChanges(year: number, month: number, day: number, timestep: number): void {
    if (!this.isEventTypeEnabled('education_change')) return;

    const prob = this.getEffectiveProbability('educationChangeRate', year);
    const changes = this.sampleEventCount(prob, this.population);

    if (changes > 0) {
      this.addEvent({
        type: 'education_change',
        year, month, day, timestep,
        characterIds: [],
        description: `Educational attainment shifts in the settlement during the ${this.currentEra!.name}.`,
        importance: 3,
        historicalSignificance: 'settlement',
        metadata: { era: this.currentEra!.name, affected: changes },
      });
    }
  }

  /**
   * Check for cultural events.
   *
   * Models community gatherings, cultural milestones, and social movements
   * — from barn raisings and church socials in pre-industrial to protests
   * and festivals in the counterculture era.
   */
  private checkCulturalEvents(year: number, month: number, day: number, timestep: number): void {
    if (!this.isEventTypeEnabled('cultural_event')) return;

    const prob = this.getEffectiveProbability('culturalEventRate', year);
    // Cultural events are settlement-level
    if (this.rng.chance(prob)) {
      this.addEvent({
        type: 'cultural_event',
        year, month, day, timestep,
        characterIds: [],
        description: `A cultural event takes place in the settlement during the ${this.currentEra!.name}.`,
        importance: 4,
        historicalSignificance: 'settlement',
        metadata: { era: this.currentEra!.name },
      });
    }
  }

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  /** Returns true if the given event type is enabled in the current config. */
  private isEventTypeEnabled(type: string): boolean {
    if (this.config.enabledEventTypes.length === 0) return true;
    return this.config.enabledEventTypes.includes(type);
  }

  /**
   * Record an event, store it internally, and emit it to listeners.
   *
   * Subclasses and future event generators should call this rather than
   * pushing to `this.events` directly so that the `'event'` EventEmitter
   * notification is always fired.
   */
  protected addEvent(event: SimulationEvent): void {
    if (!this.isEventTypeEnabled(event.type)) return;
    this.events.push(event);
    this.emit('event', event);
  }

  /** Determine whether an event qualifies for LLM narrative enrichment. */
  protected shouldEnrich(event: SimulationEvent): boolean {
    switch (this.config.llmEnrichmentTier) {
      case 'none':
        return false;
      case 'all':
        return true;
      case 'minor':
        return ['world', 'country', 'state', 'settlement'].includes(event.historicalSignificance);
      case 'major':
        return ['world', 'country'].includes(event.historicalSignificance);
      default:
        return false;
    }
  }

  /** Non-blocking sleep used to yield control during pause loops. */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ---------------------------------------------------------------------------
// SeededRNG — Mulberry32
// ---------------------------------------------------------------------------

/**
 * Seeded pseudo-random number generator using the Mulberry32 algorithm.
 *
 * Mulberry32 is a simple 32-bit PRNG with good statistical properties and
 * negligible overhead.  It is used here to guarantee deterministic replay:
 * given the same seed and the same simulation config, the engine will
 * produce the identical event sequence.
 */
export class SeededRNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed;
  }

  /**
   * Return a pseudo-random floating-point number in [0, 1).
   */
  random(): number {
    this.state |= 0;
    this.state = this.state + 0x6D2B79F5 | 0;
    let t = Math.imul(this.state ^ this.state >>> 15, 1 | this.state);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }

  /**
   * Return a pseudo-random integer in the inclusive range [min, max].
   */
  randomInt(min: number, max: number): number {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  /**
   * Return `true` with the given probability (0 = never, 1 = always).
   */
  chance(probability: number): boolean {
    return this.random() < probability;
  }

  /**
   * Uniformly pick one element from the given array.
   * Returns `undefined` if the array is empty.
   */
  pick<T>(items: readonly T[]): T | undefined {
    if (items.length === 0) return undefined;
    return items[this.randomInt(0, items.length - 1)];
  }

  /**
   * Shuffle an array in place using Fisher-Yates and return it.
   */
  shuffle<T>(items: T[]): T[] {
    for (let i = items.length - 1; i > 0; i--) {
      const j = this.randomInt(0, i);
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  }
}

// ---------------------------------------------------------------------------
// Convenience factory
// ---------------------------------------------------------------------------

/**
 * Create a {@link HistoricalSimulationEngine} with sensible defaults.
 *
 * Only `worldId` and `seed` are required; all other fields fall back to
 * production defaults (140-year window, 3.6 % sampling, no LLM enrichment).
 */
export function createHistoricalSimulation(
  config: Partial<HistoricalSimConfig> & Pick<HistoricalSimConfig, 'worldId' | 'seed'>,
): HistoricalSimulationEngine {
  return new HistoricalSimulationEngine(applyDefaults(config));
}
