/**
 * Direction Quest Generator
 *
 * Generates direction steps with target-language instructions for
 * follow_directions and navigate_language quest objectives.
 * Pure logic — no Babylon.js or server dependencies.
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface DirectionStep {
  /** Instruction text in the target language */
  instruction: string;
  /** English translation (shown as hint if requested) */
  englishHint: string;
  /** Target position the player should reach */
  targetPosition: Position;
  /** Radius within which the step counts as reached */
  radius: number;
}

export interface LocationInfo {
  name: string;
  position: Position;
}

export interface DirectionQuestConfig {
  /** Number of direction steps to generate */
  stepCount: number;
  /** Starting position (usually player's current position) */
  startPosition: Position;
  /** Available locations/landmarks in the world */
  locations: LocationInfo[];
  /** Target language name (e.g., "Chitimacha", "French") */
  targetLanguage: string;
  /** Difficulty: beginner = simpler directions, advanced = complex */
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// ── Cardinal direction vocabulary ────────────────────────────────────────────

/** Direction vocabulary templates keyed by language, with fallback to generic. */
const DIRECTION_VOCABULARY: Record<string, DirectionVocab> = {
  _default: {
    goStraight: 'Go straight',
    turnLeft: 'Turn left',
    turnRight: 'Turn right',
    goTo: 'Go to',
    walkToward: 'Walk toward',
    near: 'near',
    past: 'past',
    until: 'until you reach',
    north: 'north',
    south: 'south',
    east: 'east',
    west: 'west',
  },
  french: {
    goStraight: 'Allez tout droit',
    turnLeft: 'Tournez à gauche',
    turnRight: 'Tournez à droite',
    goTo: 'Allez à',
    walkToward: 'Marchez vers',
    near: 'près de',
    past: 'après',
    until: "jusqu'à",
    north: 'nord',
    south: 'sud',
    east: 'est',
    west: 'ouest',
  },
  spanish: {
    goStraight: 'Siga derecho',
    turnLeft: 'Gire a la izquierda',
    turnRight: 'Gire a la derecha',
    goTo: 'Vaya a',
    walkToward: 'Camine hacia',
    near: 'cerca de',
    past: 'pasando',
    until: 'hasta llegar a',
    north: 'norte',
    south: 'sur',
    east: 'este',
    west: 'oeste',
  },
};

interface DirectionVocab {
  goStraight: string;
  turnLeft: string;
  turnRight: string;
  goTo: string;
  walkToward: string;
  near: string;
  past: string;
  until: string;
  north: string;
  south: string;
  east: string;
  west: string;
}

function getVocab(targetLanguage: string): DirectionVocab {
  const key = targetLanguage.toLowerCase();
  return DIRECTION_VOCABULARY[key] ?? DIRECTION_VOCABULARY._default;
}

// ── Geometry helpers ─────────────────────────────────────────────────────────

function distance2D(a: Position, b: Position): number {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dz * dz);
}

/** Get cardinal direction from a to b. */
function getCardinalDirection(
  from: Position,
  to: Position,
  vocab: DirectionVocab,
): string {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const angle = Math.atan2(dx, dz) * (180 / Math.PI);

  // 8-direction compass (N=0°, E=90°, S=180°, W=-90°)
  if (angle >= -22.5 && angle < 22.5) return vocab.north;
  if (angle >= 22.5 && angle < 67.5) return `${vocab.north}-${vocab.east}`;
  if (angle >= 67.5 && angle < 112.5) return vocab.east;
  if (angle >= 112.5 && angle < 157.5) return `${vocab.south}-${vocab.east}`;
  if (angle >= 157.5 || angle < -157.5) return vocab.south;
  if (angle >= -157.5 && angle < -112.5) return `${vocab.south}-${vocab.west}`;
  if (angle >= -112.5 && angle < -67.5) return vocab.west;
  return `${vocab.north}-${vocab.west}`;
}

/** Get relative turn direction (left/right) from previous heading to next target. */
function getRelativeDirection(
  from: Position,
  via: Position,
  to: Position,
  vocab: DirectionVocab,
): string {
  // Cross product of (via-from) and (to-via) in XZ plane
  const v1x = via.x - from.x;
  const v1z = via.z - from.z;
  const v2x = to.x - via.x;
  const v2z = to.z - via.z;
  const cross = v1x * v2z - v1z * v2x;

  if (Math.abs(cross) < 0.01) return vocab.goStraight;
  return cross > 0 ? vocab.turnRight : vocab.turnLeft;
}

// ── Step generation ──────────────────────────────────────────────────────────

/**
 * Select waypoint locations for direction steps.
 * Picks locations that form a reasonable path (not backtracking too much).
 */
function selectWaypoints(
  config: DirectionQuestConfig,
): LocationInfo[] {
  const { startPosition, locations, stepCount } = config;

  if (locations.length === 0) return [];

  const count = Math.min(stepCount, locations.length);
  const selected: LocationInfo[] = [];
  const used = new Set<number>();

  let currentPos = startPosition;

  for (let i = 0; i < count; i++) {
    // Find closest unused location (greedy nearest-neighbor)
    let bestIdx = -1;
    let bestDist = Infinity;

    for (let j = 0; j < locations.length; j++) {
      if (used.has(j)) continue;
      const d = distance2D(currentPos, locations[j].position);
      // Skip locations that are too close (< 5 units)
      if (d < 5) continue;
      if (d < bestDist) {
        bestDist = d;
        bestIdx = j;
      }
    }

    if (bestIdx === -1) break;

    used.add(bestIdx);
    selected.push(locations[bestIdx]);
    currentPos = locations[bestIdx].position;
  }

  return selected;
}

/**
 * Build a single direction instruction for a step.
 */
function buildInstruction(
  fromPos: Position,
  prevPos: Position | null,
  target: LocationInfo,
  vocab: DirectionVocab,
  difficulty: string,
): { instruction: string; englishHint: string } {
  const defaultVocab = DIRECTION_VOCABULARY._default;
  const cardinal = getCardinalDirection(fromPos, target.position, vocab);
  const englishCardinal = getCardinalDirection(fromPos, target.position, defaultVocab);

  if (difficulty === 'beginner') {
    // Simple: "Go to [location]"
    return {
      instruction: `${vocab.goTo} ${target.name}`,
      englishHint: `${defaultVocab.goTo} ${target.name}`,
    };
  }

  if (prevPos) {
    // Use relative directions (turn left/right)
    const turn = getRelativeDirection(prevPos, fromPos, target.position, vocab);
    const englishTurn = getRelativeDirection(prevPos, fromPos, target.position, defaultVocab);

    if (difficulty === 'advanced') {
      return {
        instruction: `${turn}, ${vocab.walkToward} ${target.name} (${cardinal})`,
        englishHint: `${englishTurn}, ${defaultVocab.walkToward} ${target.name} (${englishCardinal})`,
      };
    }

    // Intermediate
    return {
      instruction: `${turn} ${vocab.until} ${target.name}`,
      englishHint: `${englishTurn} ${defaultVocab.until} ${target.name}`,
    };
  }

  // First step — use cardinal direction
  return {
    instruction: `${vocab.walkToward} ${target.name} (${cardinal})`,
    englishHint: `${defaultVocab.walkToward} ${target.name} (${englishCardinal})`,
  };
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate direction steps for a follow_directions quest.
 *
 * @param config - Generation parameters
 * @returns Array of direction steps with target-language instructions
 */
export function generateDirectionSteps(
  config: DirectionQuestConfig,
): DirectionStep[] {
  const vocab = getVocab(config.targetLanguage);
  const waypoints = selectWaypoints(config);
  const steps: DirectionStep[] = [];

  let currentPos = config.startPosition;
  let prevPos: Position | null = null;

  const baseRadius = config.difficulty === 'beginner' ? 8
    : config.difficulty === 'intermediate' ? 6
    : 4;

  for (const waypoint of waypoints) {
    const { instruction, englishHint } = buildInstruction(
      currentPos,
      prevPos,
      waypoint,
      vocab,
      config.difficulty,
    );

    steps.push({
      instruction,
      englishHint,
      targetPosition: waypoint.position,
      radius: baseRadius,
    });

    prevPos = currentPos;
    currentPos = waypoint.position;
  }

  return steps;
}

/**
 * Generate navigation waypoints for a navigate_language quest.
 * Similar to direction steps but with a single destination and multiple waypoints along the route.
 *
 * @param startPosition - Player's starting position
 * @param destination - Final destination location
 * @param intermediateLocations - Landmarks along the way (used for instruction context)
 * @param targetLanguage - Target language for instructions
 * @param difficulty - Quest difficulty level
 * @returns Array of direction steps forming a route to the destination
 */
export function generateNavigationRoute(
  startPosition: Position,
  destination: LocationInfo,
  intermediateLocations: LocationInfo[],
  targetLanguage: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced' = 'advanced',
): DirectionStep[] {
  // Build a route through intermediates to the destination
  const allLocations = [...intermediateLocations, destination];

  return generateDirectionSteps({
    stepCount: allLocations.length,
    startPosition,
    locations: allLocations,
    targetLanguage,
    difficulty,
  });
}

/**
 * Check if a position is within a direction step's target radius.
 */
export function isWithinStepRadius(
  playerPosition: Position,
  step: DirectionStep,
): boolean {
  return distance2D(playerPosition, step.targetPosition) <= step.radius;
}
