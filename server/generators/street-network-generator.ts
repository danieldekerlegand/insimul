/**
 * Street Network Topology Generator
 *
 * Generates intra-settlement street networks as polylines with intersection
 * nodes. Supports two layout algorithms:
 *   - grid: orthogonal grid for planned towns (founded after ~1800)
 *   - organic: radial/irregular layout for older villages
 *
 * Seeded by settlement type and founding era for deterministic output.
 */

import { StreetGenerator } from './street-generator';
import { selectStreetPattern as sharedSelectPattern } from '../../shared/street-pattern-selection';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface StreetNode {
  id: string;
  /** World-space x */
  x: number;
  /** World-space z (y in 2D top-down) */
  z: number;
  /** IDs of streets that pass through this node */
  intersectionOf: string[];
}

export interface StreetSegment {
  id: string;
  name: string;
  /** Direction hint for naming / house numbering */
  direction: 'NS' | 'EW';
  /** Ordered node IDs forming the polyline */
  nodeIds: string[];
  /** Ordered world-space waypoints matching nodeIds */
  waypoints: { x: number; z: number }[];
  /** Road width in world units */
  width: number;
}

export interface StreetNetwork {
  nodes: StreetNode[];
  segments: StreetSegment[];
}

export interface StreetNetworkConfig {
  /** Center of the settlement in world space */
  centerX: number;
  centerZ: number;
  /** Settlement type determines scale */
  settlementType: 'dwelling' | 'roadhouse' | 'homestead' | 'landing' | 'forge' | 'chapel' | 'market' | 'hamlet' | 'village' | 'town' | 'city';
  /** Founding year — older settlements get organic layout */
  foundedYear: number;
  /** Seed string for deterministic generation */
  seed: string;
  /** Optional override for layout algorithm */
  layoutOverride?: 'grid' | 'organic';
  /** Target language for localized street names (e.g. 'French', 'Spanish') */
  targetLanguage?: string;
  /** Pre-loaded grammar-generated street names (loaded asynchronously before calling) */
  grammarStreetNames?: string[];
  /**
   * Optional water test function. Returns true if the given world-space
   * coordinate is in water (river, coast, bay, etc.). When provided,
   * street nodes, segments, and lots that overlap water are pruned.
   */
  isWater?: (x: number, z: number) => boolean;
  /** Terrain type for terrain-aware street pattern selection */
  terrain?: 'plains' | 'hills' | 'mountains' | 'coast' | 'river' | 'forest' | 'desert';
  /** Population — used for pattern selection (city ≥10k → grid, city <10k → radial) */
  population?: number;
  /** User-selected street pattern — bypasses terrain-based pattern selection when provided */
  streetPatternOverride?: 'grid' | 'linear' | 'waterfront' | 'hillside' | 'organic' | 'radial';
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const GRID_SPACING: Record<string, number> = {
  dwelling: 20,
  roadhouse: 20,
  homestead: 25,
  landing: 55,
  forge: 30,
  chapel: 30,
  market: 40,
  hamlet: 55,
  village: 50,
  town: 45,
  city: 40,
};

/** Maximum grid size per settlement type (used when population is unknown). */
const MAX_GRID_SIZE: Record<string, number> = {
  dwelling: 2,
  roadhouse: 2,
  homestead: 2,
  landing: 4,
  forge: 2,
  chapel: 2,
  market: 3,
  hamlet: 4,
  village: 4,
  town: 6,
  city: 8,
};

/**
 * Compute grid size from population so small settlements get small grids.
 * Estimates buildings needed (residences + businesses), derives the minimum
 * number of blocks, and returns the grid side length.
 */
function computeGridSize(settlementType: string, population?: number): number {
  const maxSize = MAX_GRID_SIZE[settlementType] ?? 5;
  if (population == null || population <= 0) return maxSize;

  // Estimate buildings: ~1 residence per 2.5 people + 1 business per 10
  const residences = Math.ceil(population / 2.5);
  const businesses = Math.max(1, Math.ceil(population / 10));
  const buildings = residences + businesses;

  // Each block holds ~6 lots (2 rows × 3 cols). Need blocks for buildings + 1 park.
  const lotsPerBlock = 6;
  const blocksNeeded = Math.ceil(buildings / lotsPerBlock) + 1;
  // Grid side length: (gridSize-1)² ≥ blocksNeeded
  const minSide = Math.ceil(Math.sqrt(blocksNeeded)) + 1;

  return Math.max(2, Math.min(minSide, maxSize));
}

const STREET_WIDTH: Record<string, number> = {
  dwelling: 6,
  roadhouse: 6,
  homestead: 6,
  landing: 8,
  forge: 7,
  chapel: 7,
  market: 8,
  hamlet: 8,
  village: 10,
  town: 12,
  city: 14,
};

/** Year threshold: settlements founded before this get organic layout */
const ORGANIC_THRESHOLD_YEAR = 1800;

// ─────────────────────────────────────────────
// Seeded random (same LCG used elsewhere in the codebase)
// ─────────────────────────────────────────────

function createSeededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }
  return () => {
    hash = (hash * 9301 + 49297) % 233280;
    return hash / 233280;
  };
}

// ─────────────────────────────────────────────
// Localized street name pools
// ─────────────────────────────────────────────

export interface StreetNamePool {
  ns: string[];
  ew: string[];
  organic: string[];
  ring: (n: number) => string;
}

const STREET_NAMES: Record<string, StreetNamePool> = {
  English: {
    ns: ['1st St', '2nd St', '3rd St', '4th St', '5th St', '6th St', '7th St', '8th St', '9th St', '10th St', '11th St', '12th St'],
    ew: ['Main St', 'Oak Ave', 'Maple Ave', 'Cedar Ave', 'Pine Ave', 'Elm Ave', 'Washington Ave', 'Lincoln Ave', 'Jefferson Ave', 'Madison Ave', 'Park Ave', 'High St'],
    organic: ['High St', 'Church Ln', 'Mill Rd', 'Market St', 'Bridge St', 'Castle Rd', 'River Ln', 'King St', 'Queen St', 'Abbey Rd', 'Forge Ln', 'Well St'],
    ring: (n) => `Ring ${n}`,
  },
  French: {
    ns: ['1ère Rue', '2ème Rue', '3ème Rue', '4ème Rue', '5ème Rue', '6ème Rue', '7ème Rue', '8ème Rue', '9ème Rue', '10ème Rue', '11ème Rue', '12ème Rue'],
    ew: ['Rue Principale', 'Avenue du Chêne', 'Avenue de l\'Érable', 'Avenue du Cèdre', 'Avenue du Pin', 'Avenue de l\'Orme', 'Boulevard de la Liberté', 'Avenue Victor Hugo', 'Avenue Pasteur', 'Boulevard Voltaire', 'Avenue du Parc', 'Grande Rue'],
    organic: ['Grande Rue', 'Rue de l\'Église', 'Rue du Moulin', 'Rue du Marché', 'Rue du Pont', 'Rue du Château', 'Rue de la Rivière', 'Rue du Roi', 'Rue de la Reine', 'Rue de l\'Abbaye', 'Rue de la Forge', 'Rue du Puits'],
    ring: (n) => `Anneau ${n}`,
  },
  Spanish: {
    ns: ['Calle 1ª', 'Calle 2ª', 'Calle 3ª', 'Calle 4ª', 'Calle 5ª', 'Calle 6ª', 'Calle 7ª', 'Calle 8ª', 'Calle 9ª', 'Calle 10ª', 'Calle 11ª', 'Calle 12ª'],
    ew: ['Calle Principal', 'Avenida del Roble', 'Avenida del Arce', 'Avenida del Cedro', 'Avenida del Pino', 'Avenida del Olmo', 'Avenida de la Libertad', 'Avenida Bolívar', 'Paseo de la Reforma', 'Avenida de la Paz', 'Avenida del Parque', 'Calle Mayor'],
    organic: ['Calle Mayor', 'Calle de la Iglesia', 'Calle del Molino', 'Calle del Mercado', 'Calle del Puente', 'Calle del Castillo', 'Calle del Río', 'Calle del Rey', 'Calle de la Reina', 'Calle de la Abadía', 'Calle de la Fragua', 'Calle del Pozo'],
    ring: (n) => `Anillo ${n}`,
  },
  German: {
    ns: ['1. Straße', '2. Straße', '3. Straße', '4. Straße', '5. Straße', '6. Straße', '7. Straße', '8. Straße', '9. Straße', '10. Straße', '11. Straße', '12. Straße'],
    ew: ['Hauptstraße', 'Eichenallee', 'Ahornweg', 'Zedernstraße', 'Kiefernweg', 'Ulmenallee', 'Freiheitsstraße', 'Goethestraße', 'Schillerstraße', 'Beethovenstraße', 'Parkstraße', 'Marktstraße'],
    organic: ['Marktstraße', 'Kirchgasse', 'Mühlweg', 'Marktplatz', 'Brückenstraße', 'Burgstraße', 'Flussweg', 'Königstraße', 'Königinstraße', 'Klosterstraße', 'Schmiedegasse', 'Brunnenstraße'],
    ring: (n) => `Ring ${n}`,
  },
  Italian: {
    ns: ['1ª Strada', '2ª Strada', '3ª Strada', '4ª Strada', '5ª Strada', '6ª Strada', '7ª Strada', '8ª Strada', '9ª Strada', '10ª Strada', '11ª Strada', '12ª Strada'],
    ew: ['Via Principale', 'Viale delle Querce', 'Via degli Aceri', 'Via dei Cedri', 'Via dei Pini', 'Viale degli Olmi', 'Via della Libertà', 'Via Garibaldi', 'Via Dante', 'Via Mazzini', 'Viale del Parco', 'Via Roma'],
    organic: ['Via Roma', 'Via della Chiesa', 'Via del Mulino', 'Via del Mercato', 'Via del Ponte', 'Via del Castello', 'Via del Fiume', 'Via del Re', 'Via della Regina', 'Via dell\'Abbazia', 'Via della Fucina', 'Via del Pozzo'],
    ring: (n) => `Anello ${n}`,
  },
  Portuguese: {
    ns: ['1ª Rua', '2ª Rua', '3ª Rua', '4ª Rua', '5ª Rua', '6ª Rua', '7ª Rua', '8ª Rua', '9ª Rua', '10ª Rua', '11ª Rua', '12ª Rua'],
    ew: ['Rua Principal', 'Avenida do Carvalho', 'Rua do Bordo', 'Rua do Cedro', 'Rua do Pinheiro', 'Avenida do Olmo', 'Avenida da Liberdade', 'Rua Camões', 'Rua Pessoa', 'Avenida da República', 'Avenida do Parque', 'Rua Direita'],
    organic: ['Rua Direita', 'Rua da Igreja', 'Rua do Moinho', 'Rua do Mercado', 'Rua da Ponte', 'Rua do Castelo', 'Rua do Rio', 'Rua do Rei', 'Rua da Rainha', 'Rua da Abadia', 'Rua da Forja', 'Rua do Poço'],
    ring: (n) => `Anel ${n}`,
  },
  Japanese: {
    ns: ['一番通り', '二番通り', '三番通り', '四番通り', '五番通り', '六番通り', '七番通り', '八番通り', '九番通り', '十番通り', '十一番通り', '十二番通り'],
    ew: ['本町通り', '樫の木通り', '楓通り', '杉通り', '松通り', '楡通り', 'さくら通り', '富士見通り', '平和通り', '中央通り', '公園通り', '大通り'],
    organic: ['大通り', '寺町通り', '水車通り', '市場通り', '橋本通り', '城下通り', '川端通り', '王子通り', '姫路通り', '院前通り', '鍛冶屋小路', '井戸端通り'],
    ring: (n) => `環状${n}号`,
  },
  Korean: {
    ns: ['제1가', '제2가', '제3가', '제4가', '제5가', '제6가', '제7가', '제8가', '제9가', '제10가', '제11가', '제12가'],
    ew: ['중앙로', '참나무길', '단풍길', '삼나무길', '소나무길', '느티나무길', '자유로', '세종대로', '충무로', '을지로', '공원로', '큰길'],
    organic: ['큰길', '성당길', '물레방아길', '시장길', '다리길', '성곽길', '강변길', '왕길', '왕비길', '사찰길', '대장간길', '우물길'],
    ring: (n) => `순환 ${n}`,
  },
  'Mandarin Chinese': {
    ns: ['第一街', '第二街', '第三街', '第四街', '第五街', '第六街', '第七街', '第八街', '第九街', '第十街', '第十一街', '第十二街'],
    ew: ['主街', '橡树大道', '枫叶大道', '雪松大道', '松树大道', '榆树大道', '自由路', '和平路', '中山路', '人民路', '公园路', '大街'],
    organic: ['大街', '寺庙路', '磨坊路', '市场街', '桥头街', '城堡路', '河边路', '国王街', '皇后街', '修道院路', '铁匠巷', '古井街'],
    ring: (n) => `环路 ${n}`,
  },
  Chinese: {
    ns: ['第一街', '第二街', '第三街', '第四街', '第五街', '第六街', '第七街', '第八街', '第九街', '第十街', '第十一街', '第十二街'],
    ew: ['主街', '橡树大道', '枫叶大道', '雪松大道', '松树大道', '榆树大道', '自由路', '和平路', '中山路', '人民路', '公园路', '大街'],
    organic: ['大街', '寺庙路', '磨坊路', '市场街', '桥头街', '城堡路', '河边路', '国王街', '皇后街', '修道院路', '铁匠巷', '古井街'],
    ring: (n) => `环路 ${n}`,
  },
  Arabic: {
    ns: ['شارع ١', 'شارع ٢', 'شارع ٣', 'شارع ٤', 'شارع ٥', 'شارع ٦', 'شارع ٧', 'شارع ٨', 'شارع ٩', 'شارع ١٠', 'شارع ١١', 'شارع ١٢'],
    ew: ['الشارع الرئيسي', 'شارع البلوط', 'شارع القيقب', 'شارع الأرز', 'شارع الصنوبر', 'شارع الدردار', 'شارع الحرية', 'شارع السلام', 'شارع الجمهورية', 'شارع النصر', 'شارع الحديقة', 'الشارع الكبير'],
    organic: ['الشارع الكبير', 'شارع المسجد', 'شارع الطاحونة', 'شارع السوق', 'شارع الجسر', 'شارع القلعة', 'شارع النهر', 'شارع الملك', 'شارع الملكة', 'شارع الدير', 'شارع الحداد', 'شارع البئر'],
    ring: (n) => `الحلقة ${n}`,
  },
  Russian: {
    ns: ['1-я улица', '2-я улица', '3-я улица', '4-я улица', '5-я улица', '6-я улица', '7-я улица', '8-я улица', '9-я улица', '10-я улица', '11-я улица', '12-я улица'],
    ew: ['Главная улица', 'Дубовая аллея', 'Кленовая аллея', 'Кедровая улица', 'Сосновая улица', 'Вязовая аллея', 'Проспект Свободы', 'Улица Пушкина', 'Улица Толстого', 'Улица Чехова', 'Парковая улица', 'Большая улица'],
    organic: ['Большая улица', 'Церковная улица', 'Мельничная улица', 'Рыночная улица', 'Мостовая улица', 'Замковая улица', 'Речная улица', 'Царская улица', 'Императорская улица', 'Монастырская улица', 'Кузнечная улица', 'Колодезная улица'],
    ring: (n) => `Кольцо ${n}`,
  },
};

function getStreetNames(targetLanguage?: string, grammarNames?: string[]): StreetNamePool {
  // If grammar-generated street names are available, split them into pool categories
  if (grammarNames && grammarNames.length >= 6) {
    const half = Math.ceil(grammarNames.length / 2);
    const ns = grammarNames.slice(0, half);
    const ew = grammarNames.slice(half);
    return {
      ns,
      ew,
      organic: grammarNames, // use full set for organic layouts
      ring: (n) => {
        // Use target language ring template if available
        const langPool = targetLanguage && STREET_NAMES[targetLanguage]
          ? STREET_NAMES[targetLanguage]
          : STREET_NAMES.English;
        return langPool.ring(n);
      },
    };
  }
  if (targetLanguage && STREET_NAMES[targetLanguage]) {
    return STREET_NAMES[targetLanguage];
  }
  return STREET_NAMES.English;
}

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────

export type StreetPatternType = 'organic' | 'grid' | 'radial' | 'linear' | 'hillside' | 'waterfront';

/**
 * Select street pattern based on terrain, settlement type, and founding era.
 * Delegates to shared/street-pattern-selection.ts for consistency with client.
 */
export function selectStreetPattern(config: StreetNetworkConfig): StreetPatternType {
  return sharedSelectPattern({
    terrain: config.terrain ?? 'plains',
    settlementType: config.settlementType,
    foundedYear: config.foundedYear,
    population: config.population,
  });
}

/**
 * Choose layout algorithm based on settlement type and founding era.
 */
export function chooseLayout(
  settlementType: string,
  foundedYear: number,
  layoutOverride?: 'grid' | 'organic',
): 'grid' | 'organic' {
  if (layoutOverride) return layoutOverride;
  return 'grid';
}

/**
 * Generate a street network for a settlement.
 *
 * When `terrain` is set in config, selects from 6 terrain-aware patterns
 * (grid, organic, linear, waterfront, hillside, radial). Otherwise falls
 * back to grid/organic based on founding year.
 *
 * Returns the network and the pattern name used.
 */
export function generateStreetNetwork(config: StreetNetworkConfig): StreetNetwork & { pattern?: string } {
  // Use user-selected pattern override, or fall back to terrain-based selection
  if (config.streetPatternOverride || config.terrain) {
    const pattern = config.streetPatternOverride || selectStreetPattern(config);

    // Grid and organic are handled by the existing generators
    if (pattern === 'grid') {
      return { ...generateGridNetwork(config), pattern };
    }
    if (pattern === 'organic') {
      return { ...generateOrganicNetwork(config), pattern };
    }

    // Non-grid patterns: use StreetGenerator and convert via adapter
    const gen = new StreetGenerator();

    const sType = config.settlementType;
    const dynSize = computeGridSize(sType, config.population);
    const radius = (dynSize * (GRID_SPACING[sType] || 60)) / 2;

    const genConfig = {
      center: { x: config.centerX, z: config.centerZ },
      radius,
      settlementType: config.settlementType,
      seed: config.seed,
    };

    const geographyConfig = {
      worldId: '',
      settlementId: '',
      settlementName: '',
      settlementType: config.settlementType as 'dwelling' | 'roadhouse' | 'homestead' | 'landing' | 'forge' | 'chapel' | 'market' | 'hamlet' | 'village' | 'town' | 'city',
      population: config.population ?? 500,
      foundedYear: config.foundedYear,
      terrain: config.terrain as 'plains' | 'hills' | 'mountains' | 'coast' | 'river' | 'forest' | 'desert',
    };

    const { network: edgeNetwork } = gen.generate(genConfig, geographyConfig);

    // Assign names before conversion
    gen.assignStreetNames(edgeNetwork, config.seed);

    // Convert edge-based output to segment-based output
    const names = getStreetNames(config.targetLanguage, config.grammarStreetNames);
    const converted = convertEdgesToSegments(edgeNetwork, names);

    return { ...converted, pattern };
  }

  // Legacy path: no terrain, use founding year to pick grid vs organic
  const layout = chooseLayout(
    config.settlementType,
    config.foundedYear,
    config.layoutOverride,
  );

  if (layout === 'grid') {
    return { ...generateGridNetwork(config), pattern: 'grid' };
  }
  return { ...generateOrganicNetwork(config), pattern: 'organic' };
}

// ─────────────────────────────────────────────
// Grid layout
// ─────────────────────────────────────────────

function generateGridNetwork(config: StreetNetworkConfig): StreetNetwork {
  const rand = createSeededRandom(`${config.seed}_streets_grid`);
  const spacing = GRID_SPACING[config.settlementType] || 35;
  const size = computeGridSize(config.settlementType, config.population);
  const width = STREET_WIDTH[config.settlementType] || 2.5;
  const names = getStreetNames(config.targetLanguage, config.grammarStreetNames);

  const cols = size;     // number of NS streets
  const rows = size;     // number of EW streets
  const halfW = ((cols - 1) * spacing) / 2;
  const halfH = ((rows - 1) * spacing) / 2;

  // Create intersection nodes as a 2D grid
  const nodeGrid: StreetNode[][] = [];
  const allNodes: StreetNode[] = [];

  for (let r = 0; r < rows; r++) {
    nodeGrid[r] = [];
    for (let c = 0; c < cols; c++) {
      // No jitter — grid nodes must be perfectly aligned so streets stay
      // straight and lot blocks tile without gaps.
      const node: StreetNode = {
        id: `node_${r}_${c}`,
        x: config.centerX - halfW + c * spacing,
        z: config.centerZ - halfH + r * spacing,
        intersectionOf: [],
      };
      nodeGrid[r][c] = node;
      allNodes.push(node);
    }
  }

  const segments: StreetSegment[] = [];

  // Track which nodes are in water so we can prune segments
  const isWater = config.isWater;
  const waterNodes = new Set<string>();
  if (isWater) {
    for (const node of allNodes) {
      if (isWater(node.x, node.z)) {
        waterNodes.add(node.id);
      }
    }
  }

  // NS streets (columns): traverse rows top-to-bottom for each column
  for (let c = 0; c < cols; c++) {
    const segId = `street_ns_${c}`;
    const name = names.ns[c % names.ns.length];
    const nodeIds: string[] = [];
    const waypoints: { x: number; z: number }[] = [];

    for (let r = 0; r < rows; r++) {
      const node = nodeGrid[r][c];
      if (waterNodes.has(node.id)) continue; // skip water nodes
      node.intersectionOf.push(segId);
      nodeIds.push(node.id);
      waypoints.push({ x: node.x, z: node.z });
    }

    // Only keep segments with at least 2 land nodes
    if (nodeIds.length >= 2) {
      segments.push({ id: segId, name, direction: 'NS', nodeIds, waypoints, width });
    }
  }

  // EW streets (rows): traverse columns left-to-right for each row
  for (let r = 0; r < rows; r++) {
    const segId = `street_ew_${r}`;
    const name = names.ew[r % names.ew.length];
    const nodeIds: string[] = [];
    const waypoints: { x: number; z: number }[] = [];

    for (let c = 0; c < cols; c++) {
      const node = nodeGrid[r][c];
      if (waterNodes.has(node.id)) continue; // skip water nodes
      node.intersectionOf.push(segId);
      nodeIds.push(node.id);
      waypoints.push({ x: node.x, z: node.z });
    }

    if (nodeIds.length >= 2) {
      segments.push({ id: segId, name, direction: 'EW', nodeIds, waypoints, width });
    }
  }

  // Remove water nodes from the final output
  const landNodes = allNodes.filter(n => !waterNodes.has(n.id));

  return { nodes: landNodes, segments };
}

// ─────────────────────────────────────────────
// Organic / radial layout
// ─────────────────────────────────────────────

function generateOrganicNetwork(config: StreetNetworkConfig): StreetNetwork {
  const rand = createSeededRandom(`${config.seed}_streets_organic`);
  const size = computeGridSize(config.settlementType, config.population);
  const spacing = GRID_SPACING[config.settlementType] || 35;
  const width = STREET_WIDTH[config.settlementType] || 2.5;
  const names = getStreetNames(config.targetLanguage, config.grammarStreetNames);

  // Number of radial spokes and ring roads
  const spokeCount = Math.max(3, Math.floor(size * 0.8) + 1);
  const ringCount = Math.max(1, Math.floor(size / 2));
  const maxRadius = (size * spacing) / 2;

  const allNodes: StreetNode[] = [];
  const nodeMap = new Map<string, StreetNode>();
  const segments: StreetSegment[] = [];

  // Center node
  const centerNode: StreetNode = {
    id: 'node_center',
    x: config.centerX,
    z: config.centerZ,
    intersectionOf: [],
  };
  allNodes.push(centerNode);
  nodeMap.set(centerNode.id, centerNode);

  // Create ring nodes at each spoke × ring intersection
  const ringNodes: StreetNode[][] = []; // [ring][spoke]
  for (let ring = 0; ring < ringCount; ring++) {
    ringNodes[ring] = [];
    const radius = maxRadius * ((ring + 1) / ringCount);

    for (let spoke = 0; spoke < spokeCount; spoke++) {
      const baseAngle = (spoke / spokeCount) * 2 * Math.PI;
      // Add organic jitter to angle and radius
      const angleJitter = (rand() - 0.5) * (Math.PI / spokeCount) * 0.4;
      const radiusJitter = (rand() - 0.5) * spacing * 0.3;

      const angle = baseAngle + angleJitter;
      const r = radius + radiusJitter;

      const node: StreetNode = {
        id: `node_r${ring}_s${spoke}`,
        x: config.centerX + Math.cos(angle) * r,
        z: config.centerZ + Math.sin(angle) * r,
        intersectionOf: [],
      };
      ringNodes[ring][spoke] = node;
      allNodes.push(node);
      nodeMap.set(node.id, node);
    }
  }

  // Track which nodes are in water
  const isWater = config.isWater;
  const waterNodes = new Set<string>();
  if (isWater) {
    for (const node of allNodes) {
      if (isWater(node.x, node.z)) {
        waterNodes.add(node.id);
      }
    }
  }

  // Radial streets (spokes): center → ring0 → ring1 → ...
  for (let spoke = 0; spoke < spokeCount; spoke++) {
    const segId = `street_spoke_${spoke}`;
    const name = names.organic[spoke % names.organic.length];
    const nodeIds: string[] = [];
    const waypoints: { x: number; z: number }[] = [];

    if (!waterNodes.has(centerNode.id)) {
      centerNode.intersectionOf.push(segId);
      nodeIds.push(centerNode.id);
      waypoints.push({ x: centerNode.x, z: centerNode.z });
    }

    for (let ring = 0; ring < ringCount; ring++) {
      const node = ringNodes[ring][spoke];
      if (waterNodes.has(node.id)) continue;
      node.intersectionOf.push(segId);
      nodeIds.push(node.id);
      waypoints.push({ x: node.x, z: node.z });
    }

    if (nodeIds.length >= 2) {
      segments.push({ id: segId, name, direction: 'NS', nodeIds, waypoints, width });
    }
  }

  // Ring streets: connect nodes around each ring
  for (let ring = 0; ring < ringCount; ring++) {
    const segId = `street_ring_${ring}`;
    const name = names.ring(ring + 1);
    const nodeIds: string[] = [];
    const waypoints: { x: number; z: number }[] = [];

    for (let spoke = 0; spoke < spokeCount; spoke++) {
      const node = ringNodes[ring][spoke];
      if (waterNodes.has(node.id)) continue;
      node.intersectionOf.push(segId);
      nodeIds.push(node.id);
      waypoints.push({ x: node.x, z: node.z });
    }
    // Close the ring if first node is on land
    const firstNode = ringNodes[ring][0];
    if (!waterNodes.has(firstNode.id) && nodeIds.length > 0) {
      nodeIds.push(firstNode.id);
      waypoints.push({ x: firstNode.x, z: firstNode.z });
    }

    if (nodeIds.length >= 2) {
      segments.push({ id: segId, name, direction: 'EW', nodeIds, waypoints, width });
    }
  }

  // Remove water nodes from the final output
  const landNodes = allNodes.filter(n => !waterNodes.has(n.id));

  return { nodes: landNodes, segments };
}

// ─────────────────────────────────────────────
// Lot overlap detection (Separating Axis Theorem for 2D oriented rectangles)
// ─────────────────────────────────────────────

/**
 * Test whether two oriented 2D rectangles overlap using SAT.
 * Each lot is defined by center (x,z), half-extents (hw, hd), and rotation angle.
 * A small padding is subtracted so lots that share an exact edge aren't rejected.
 */
function lotsOverlap(
  x1: number, z1: number, w1: number, d1: number, a1: number,
  x2: number, z2: number, w2: number, d2: number, a2: number,
  padding: number = 0.5,
): boolean {
  const hw1 = w1 / 2 - padding, hd1 = d1 / 2 - padding;
  const hw2 = w2 / 2 - padding, hd2 = d2 / 2 - padding;
  if (hw1 <= 0 || hd1 <= 0 || hw2 <= 0 || hd2 <= 0) return false;

  // Local axes for each rectangle
  const cos1 = Math.cos(a1), sin1 = Math.sin(a1);
  const cos2 = Math.cos(a2), sin2 = Math.sin(a2);

  // 4 potential separating axes: 2 edge normals per rectangle
  const axes = [
    { x: cos1, z: sin1 },
    { x: -sin1, z: cos1 },
    { x: cos2, z: sin2 },
    { x: -sin2, z: cos2 },
  ];

  const dx = x2 - x1, dz = z2 - z1;

  for (const ax of axes) {
    // Project center-to-center distance onto axis
    const dist = Math.abs(dx * ax.x + dz * ax.z);
    // Project half-extents of each rectangle onto axis
    const proj1 = hw1 * Math.abs(cos1 * ax.x + sin1 * ax.z)
                + hd1 * Math.abs(-sin1 * ax.x + cos1 * ax.z);
    const proj2 = hw2 * Math.abs(cos2 * ax.x + sin2 * ax.z)
                + hd2 * Math.abs(-sin2 * ax.x + cos2 * ax.z);
    if (dist > proj1 + proj2) return false; // separating axis found
  }
  return true; // no separating axis → overlap
}

/**
 * Remove overlapping lots from a placement array (keeps the first-placed lot).
 * O(n²) but n is small (< 200 lots per settlement).
 */
function removeOverlappingLots(placements: LotPlacement[]): LotPlacement[] {
  const kept: LotPlacement[] = [];
  for (const p of placements) {
    let overlaps = false;
    for (const k of kept) {
      if (lotsOverlap(p.x, p.z, p.lotWidth, p.lotDepth, p.facingAngle,
                       k.x, k.z, k.lotWidth, k.lotDepth, k.facingAngle)) {
        overlaps = true;
        break;
      }
    }
    if (!overlaps) kept.push(p);
  }
  return kept;
}

// ─────────────────────────────────────────────
// Lot placement along streets
// ─────────────────────────────────────────────

export interface LotPlacement {
  /** World-space position (center of lot) */
  x: number;
  z: number;
  /** Street this lot faces */
  streetId: string;
  streetName: string;
  /** House number */
  houseNumber: number;
  /** Which side of the street ('left' or 'right') */
  side: 'left' | 'right';
  /** Facing angle in radians (building faces the street) */
  facingAngle: number;
  /** Lot width along the street frontage */
  lotWidth: number;
  /** Lot depth perpendicular to the street */
  lotDepth: number;
  /** Zone classification — 'park' lots are green space, not buildings */
  zone?: 'commercial' | 'residential' | 'park';
}

// ─── Lot sizing by settlement type ────────────────────────────────────────────

const TARGET_LOT_WIDTHS: Record<string, number> = { landing: 10, hamlet: 18, village: 15, town: 12, city: 10 };
const MIN_LOT_DEPTHS: Record<string, number> = { landing: 14, hamlet: 30, village: 28, town: 24, city: 20 };

/**
 * Place lots by subdividing the rectangular blocks formed by the street grid.
 *
 * Algorithm:
 *   1. Extract sorted NS (x) and EW (z) street centerline coordinates
 *   2. Each pair of adjacent NS streets × pair of adjacent EW streets defines a block
 *   3. Inset each block by the street half-widths to get the buildable interior
 *   4. Subdivide the interior into 2 rows of lots (one facing each EW street)
 *   5. Each row is divided into columns whose width ≈ target lot width
 *   6. Lots tile the block perfectly — no overlap, no gaps, no road intrusion
 */
export function placeLots(
  network: StreetNetwork,
  lotCount: number,
  seed: string,
  settlementType: string = 'town',
  isWater?: (x: number, z: number) => boolean,
): LotPlacement[] {
  const placements: LotPlacement[] = [];
  const segments = network.segments;
  if (segments.length === 0 || lotCount <= 0) return placements;

  const targetLotWidth = TARGET_LOT_WIDTHS[settlementType] || 12;
  const minLotDepth = MIN_LOT_DEPTHS[settlementType] || 24;

  // Collect street centerline positions per direction.
  // For grid networks each NS street has a consistent X; each EW street a consistent Z.
  const nsSegments = segments.filter(s => s.direction === 'NS');
  const ewSegments = segments.filter(s => s.direction === 'EW');

  // Compute representative coordinate for each street
  interface StreetLine { coord: number; name: string; id: string; width: number }
  const nsLines: StreetLine[] = nsSegments.map(s => ({
    coord: s.waypoints.reduce((sum, w) => sum + w.x, 0) / s.waypoints.length,
    name: s.name, id: s.id, width: s.width || 2.5,
  }));
  const ewLines: StreetLine[] = ewSegments.map(s => ({
    coord: s.waypoints.reduce((sum, w) => sum + w.z, 0) / s.waypoints.length,
    name: s.name, id: s.id, width: s.width || 2.5,
  }));

  nsLines.sort((a, b) => a.coord - b.coord);
  ewLines.sort((a, b) => a.coord - b.coord);

  if (nsLines.length < 2 || ewLines.length < 2) return placements;

  // Enumerate blocks: each rectangle between adjacent NS and EW streets
  interface Block {
    // Buildable interior (inset from street centerlines by half-widths)
    minX: number; maxX: number;
    minZ: number; maxZ: number;
    // Grid indices for park selection
    col: number; row: number;
    // Bounding streets (for addressing)
    leftStreet: StreetLine;  rightStreet: StreetLine;
    topStreet: StreetLine;   bottomStreet: StreetLine;
  }
  const blocks: Block[] = [];

  const numBlockCols = nsLines.length - 1;
  const numBlockRows = ewLines.length - 1;

  for (let ci = 0; ci < numBlockCols; ci++) {
    for (let ri = 0; ri < numBlockRows; ri++) {
      const left = nsLines[ci];
      const right = nsLines[ci + 1];
      const top = ewLines[ri];
      const bottom = ewLines[ri + 1];

      blocks.push({
        minX: left.coord + left.width / 2,
        maxX: right.coord - right.width / 2,
        minZ: top.coord + top.width / 2,
        maxZ: bottom.coord - bottom.width / 2,
        col: ci, row: ri,
        leftStreet: left, rightStreet: right,
        topStreet: top, bottomStreet: bottom,
      });
    }
  }

  // Identify the center block as a park (town square).
  // For even block counts, pick the block just below/right of center.
  const parkCol = Math.floor(numBlockCols / 2);
  const parkRow = Math.floor(numBlockRows / 2);

  // Subdivide each block into lots
  let houseNum = 1;

  for (const block of blocks) {
    const blockW = block.maxX - block.minX; // width (along X, frontage on NS streets)
    const blockD = block.maxZ - block.minZ; // depth (along Z, frontage on EW streets)

    if (blockW < 2 || blockD < 2) continue;

    // Skip blocks whose center is in water
    const blockCenterX = (block.minX + block.maxX) / 2;
    const blockCenterZ = (block.minZ + block.maxZ) / 2;
    if (isWater && isWater(blockCenterX, blockCenterZ)) continue;

    // Center block becomes the town park/square — a single lot spanning the whole block
    if (block.col === parkCol && block.row === parkRow) {
      // Determine the nearest street for addressing
      const nearestStreet = block.topStreet;
      placements.push({
        x: blockCenterX,
        z: blockCenterZ,
        streetId: nearestStreet.id,
        streetName: nearestStreet.name,
        houseNumber: 0,
        side: 'right',
        facingAngle: Math.PI,
        lotWidth: blockW,
        lotDepth: blockD,
        zone: 'park',
      });
      continue;
    }

    // Two rows of lots: top row faces the top EW street, bottom row faces the bottom.
    // Each row gets exactly half the block depth — never more, to prevent overlap.
    const rowDepth = blockD / 2;

    // Skip blocks that are too shallow for usable lots
    if (rowDepth < 5) continue;

    // Number of lot columns along the X axis (frontage on EW streets)
    const numColsEW = Math.max(1, Math.round(blockW / targetLotWidth));
    const colWidthEW = blockW / numColsEW;

    // ── Lots facing EW streets (top and bottom rows) ──────────────────
    for (let col = 0; col < numColsEW; col++) {
      if (placements.length >= lotCount) break;

      const lotW = colWidthEW;
      const lotD = rowDepth;
      const lotCenterX = block.minX + (col + 0.5) * colWidthEW;

      // Top row: faces the top EW street (building door faces -Z)
      const topZ = block.minZ + rowDepth / 2;
      if (!isWater || !isWater(lotCenterX, topZ)) {
        placements.push({
          x: lotCenterX,
          z: topZ,
          streetId: block.topStreet.id,
          streetName: block.topStreet.name,
          houseNumber: houseNum++,
          side: 'right', // right side of the EW street (below it)
          facingAngle: Math.PI, // faces -Z (toward the top street)
          lotWidth: lotW,
          lotDepth: lotD,
        });
      }

      if (placements.length >= lotCount) break;

      // Bottom row: faces the bottom EW street (building door faces +Z)
      const botZ = block.maxZ - rowDepth / 2;
      if (!isWater || !isWater(lotCenterX, botZ)) {
        placements.push({
          x: lotCenterX,
          z: botZ,
          streetId: block.bottomStreet.id,
          streetName: block.bottomStreet.name,
          houseNumber: houseNum++,
          side: 'left', // left side of the EW street (above it)
          facingAngle: 0, // faces +Z (toward the bottom street)
          lotWidth: lotW,
          lotDepth: lotD,
        });
      }
    }

    // NS-facing lots omitted: the 2-row EW layout perfectly tiles each block.
  }

  return removeOverlappingLots(placements);
}

/**
 * Place lots along street edges for non-grid patterns (linear, waterfront,
 * organic, radial, hillside). Each lot sits beside a street edge, offset
 * perpendicular to the street centerline.
 *
 * Works for any StreetNetwork regardless of topology — places lots at regular
 * intervals along each segment's waypoints, on both sides of the street.
 *
 * The `pattern` hint influences park placement:
 *   - linear: park at center of main street
 *   - radial: park at center (plaza)
 *   - waterfront: park near waterfront
 *   - hillside: park on the middle terrace
 *   - organic: park near the network center
 */
export function placeLotsAlongStreets(
  network: StreetNetwork,
  lotCount: number,
  seed: string,
  settlementType: string = 'town',
  pattern?: string,
  isWater?: (x: number, z: number) => boolean,
): LotPlacement[] {
  const placements: LotPlacement[] = [];
  if (network.segments.length === 0 || lotCount <= 0) return placements;

  const targetLotWidth = TARGET_LOT_WIDTHS[settlementType] || 12;
  const lotDepth = MIN_LOT_DEPTHS[settlementType] || 24;

  // Compute network centroid for park placement
  let sumX = 0, sumZ = 0, wpCount = 0;
  for (const seg of network.segments) {
    for (const wp of seg.waypoints) {
      sumX += wp.x;
      sumZ += wp.z;
      wpCount++;
    }
  }
  const centroidX = wpCount > 0 ? sumX / wpCount : 0;
  const centroidZ = wpCount > 0 ? sumZ / wpCount : 0;

  // Track placed lots for OBB overlap rejection
  const placedLots: { x: number; z: number; w: number; d: number; a: number }[] = [];

  function isTooClose(x: number, z: number, w: number, d: number, a: number): boolean {
    for (const p of placedLots) {
      if (lotsOverlap(x, z, w, d, a, p.x, p.z, p.w, p.d, p.a)) return true;
    }
    return false;
  }

  let houseNum = 1;
  let parkPlaced = false;

  // Sort segments by width (wider = more important streets, place lots first)
  const sortedSegments = [...network.segments].sort((a, b) => (b.width || 6) - (a.width || 6));

  for (const seg of sortedSegments) {
    if (placements.length >= lotCount) break;
    if (seg.waypoints.length < 2) continue;

    const totalLen = polylineLen(seg.waypoints);
    if (totalLen < targetLotWidth) continue;

    // Number of lots along this segment (each side)
    const numLots = Math.max(1, Math.floor(totalLen / targetLotWidth));

    for (let li = 0; li < numLots; li++) {
      if (placements.length >= lotCount) break;

      const t = (li + 0.5) / numLots;
      const pos = interpolatePolyline(seg.waypoints, t);
      const tangent = polylineTangent(seg.waypoints, t);

      // Perpendicular direction (rotated 90°)
      const perpX = -tangent.z;
      const perpZ = tangent.x;

      // Facing angle: toward the street
      const streetAngle = Math.atan2(tangent.z, tangent.x);

      // Place lots on both sides of the street
      for (const side of ['left', 'right'] as const) {
        if (placements.length >= lotCount) break;

        const sideSign = side === 'left' ? -1 : 1;
        const offset = (seg.width || 6) / 2 + lotDepth / 2;
        const lotX = pos.x + perpX * sideSign * offset;
        const lotZ = pos.z + perpZ * sideSign * offset;

        if (isWater && isWater(lotX, lotZ)) continue;

        const lotAngle = streetAngle + (sideSign === 1 ? Math.PI : 0);

        // Check if this should be the park lot (near centroid, on a wide street)
        const distToCenter = Math.sqrt((lotX - centroidX) ** 2 + (lotZ - centroidZ) ** 2);
        if (!parkPlaced && distToCenter < targetLotWidth * 3 && (seg.width || 6) >= 6) {
          const parkW = targetLotWidth * 2;
          const parkD = lotDepth * 2;
          if (isTooClose(lotX, lotZ, parkW, parkD, lotAngle)) continue;
          parkPlaced = true;
          placements.push({
            x: lotX, z: lotZ,
            streetId: seg.id, streetName: seg.name,
            houseNumber: 0,
            side,
            facingAngle: lotAngle,
            lotWidth: parkW,
            lotDepth: parkD,
            zone: 'park',
          });
          placedLots.push({ x: lotX, z: lotZ, w: parkW, d: parkD, a: lotAngle });
          continue;
        }

        if (isTooClose(lotX, lotZ, targetLotWidth, lotDepth, lotAngle)) continue;

        placements.push({
          x: lotX, z: lotZ,
          streetId: seg.id, streetName: seg.name,
          houseNumber: houseNum++,
          side,
          facingAngle: lotAngle,
          lotWidth: targetLotWidth,
          lotDepth,
        });
        placedLots.push({ x: lotX, z: lotZ, w: targetLotWidth, d: lotDepth, a: lotAngle });
      }
    }
  }

  // If no park was placed, convert the lot closest to center into a park
  if (!parkPlaced && placements.length > 0) {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < placements.length; i++) {
      if (placements[i].zone === 'park') continue;
      const d = Math.sqrt((placements[i].x - centroidX) ** 2 + (placements[i].z - centroidZ) ** 2);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    }
    placements[bestIdx].zone = 'park';
    placements[bestIdx].houseNumber = 0;
    placements[bestIdx].lotWidth = targetLotWidth * 2;
    placements[bestIdx].lotDepth = lotDepth * 2;
  }

  return placements;
}

/** Minimum distance from a point to a polyline (series of line segments). */
function pointToPolylineDist(px: number, pz: number, waypoints: { x: number; z: number }[]): number {
  let minDist = Infinity;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const ax = waypoints[i].x, az = waypoints[i].z;
    const bx = waypoints[i + 1].x, bz = waypoints[i + 1].z;
    const dx = bx - ax, dz = bz - az;
    const lenSq = dx * dx + dz * dz;
    let t = lenSq > 0 ? ((px - ax) * dx + (pz - az) * dz) / lenSq : 0;
    t = Math.max(0, Math.min(1, t));
    const cx = ax + t * dx, cz = az + t * dz;
    const dist = Math.sqrt((px - cx) ** 2 + (pz - cz) ** 2);
    if (dist < minDist) minDist = dist;
  }
  return minDist;
}

/** Total polyline length. */
function polylineLen(points: { x: number; z: number }[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dz = points[i].z - points[i - 1].z;
    total += Math.sqrt(dx * dx + dz * dz);
  }
  return total;
}

// ─────────────────────────────────────────────
// Geometry helpers
// ─────────────────────────────────────────────

/** Interpolate a position along a polyline at parameter t ∈ [0, 1]. */
function interpolatePolyline(
  points: { x: number; z: number }[],
  t: number,
): { x: number; z: number } {
  if (points.length === 0) return { x: 0, z: 0 };
  if (points.length === 1 || t <= 0) return { ...points[0] };
  if (t >= 1) return { ...points[points.length - 1] };

  // Calculate cumulative distances
  const dists: number[] = [0];
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dz = points[i].z - points[i - 1].z;
    dists.push(dists[i - 1] + Math.sqrt(dx * dx + dz * dz));
  }
  const totalLen = dists[dists.length - 1];
  if (totalLen === 0) return { ...points[0] };

  const targetDist = t * totalLen;

  // Find the segment containing targetDist
  for (let i = 1; i < dists.length; i++) {
    if (dists[i] >= targetDist) {
      const segLen = dists[i] - dists[i - 1];
      const segT = segLen > 0 ? (targetDist - dists[i - 1]) / segLen : 0;
      return {
        x: points[i - 1].x + (points[i].x - points[i - 1].x) * segT,
        z: points[i - 1].z + (points[i].z - points[i - 1].z) * segT,
      };
    }
  }
  return { ...points[points.length - 1] };
}

// ─────────────────────────────────────────────
// Adapter: StreetGenerator edges → StreetNetwork segments
// ─────────────────────────────────────────────

import type {
  StreetNode as SharedStreetNode,
  StreetEdge,
  StreetNetwork as SharedStreetNetwork,
} from '../../shared/game-engine/types';

/**
 * Convert a StreetGenerator output ({nodes, edges} from shared/game-engine/types)
 * into the StreetNetwork format used by street-network-generator ({nodes, segments}).
 *
 * This adapter bridges the orphaned terrain-aware StreetGenerator patterns
 * (organic, linear, waterfront, hillside, radial) into the active format
 * consumed by geography-generator, placeLots, and the DB persistence layer.
 */
export function convertEdgesToSegments(
  input: SharedStreetNetwork,
  streetNames?: StreetNamePool,
): StreetNetwork {
  const nodeMap = new Map<string, SharedStreetNode>();
  for (const n of input.nodes) nodeMap.set(n.id, n);

  // Group edges into continuous street chains (edges sharing nodes in sequence).
  // Each chain becomes one StreetSegment.
  const edgeUsed = new Set<string>();
  const chains: StreetEdge[][] = [];

  // Build adjacency: node → edges
  const nodeEdges = new Map<string, StreetEdge[]>();
  for (const edge of input.edges) {
    if (!nodeEdges.has(edge.fromNodeId)) nodeEdges.set(edge.fromNodeId, []);
    if (!nodeEdges.has(edge.toNodeId)) nodeEdges.set(edge.toNodeId, []);
    nodeEdges.get(edge.fromNodeId)!.push(edge);
    nodeEdges.get(edge.toNodeId)!.push(edge);
  }

  // Chain edges that share the same streetType and form a continuous path
  for (const edge of input.edges) {
    if (edgeUsed.has(edge.id)) continue;

    const chain: StreetEdge[] = [edge];
    edgeUsed.add(edge.id);

    // Extend forward from toNodeId
    let currentNodeId = edge.toNodeId;
    while (true) {
      const candidates = (nodeEdges.get(currentNodeId) ?? []).filter(
        e => !edgeUsed.has(e.id) && e.streetType === edge.streetType,
      );
      if (candidates.length !== 1) break; // Stop at intersections or dead ends
      const next = candidates[0];
      edgeUsed.add(next.id);
      // Orient the edge so it continues from currentNodeId
      if (next.fromNodeId === currentNodeId) {
        chain.push(next);
        currentNodeId = next.toNodeId;
      } else {
        chain.push(next);
        currentNodeId = next.fromNodeId;
      }
    }

    // Extend backward from fromNodeId
    currentNodeId = edge.fromNodeId;
    while (true) {
      const candidates = (nodeEdges.get(currentNodeId) ?? []).filter(
        e => !edgeUsed.has(e.id) && e.streetType === edge.streetType,
      );
      if (candidates.length !== 1) break;
      const prev = candidates[0];
      edgeUsed.add(prev.id);
      if (prev.toNodeId === currentNodeId) {
        chain.unshift(prev);
        currentNodeId = prev.fromNodeId;
      } else {
        chain.unshift(prev);
        currentNodeId = prev.toNodeId;
      }
    }

    chains.push(chain);
  }

  // Convert each chain to a StreetSegment
  const segments: StreetSegment[] = [];
  const convertedNodes: StreetNode[] = [];
  const nodeIdSet = new Set<string>();

  // Default name pools
  const defaultNames = streetNames ?? getStreetNames();

  for (let ci = 0; ci < chains.length; ci++) {
    const chain = chains[ci];
    const firstEdge = chain[0];

    // Collect ordered waypoints and node IDs from the chain
    const waypoints: { x: number; z: number }[] = [];
    const nodeIds: string[] = [];

    for (let ei = 0; ei < chain.length; ei++) {
      const e = chain[ei];
      // For each edge, add from-node waypoint (skip if already added from previous edge)
      const fromNode = nodeMap.get(e.fromNodeId);
      const toNode = nodeMap.get(e.toNodeId);

      if (ei === 0) {
        // First edge: add from-node
        if (fromNode) {
          waypoints.push({ x: fromNode.position.x, z: fromNode.position.z });
          nodeIds.push(fromNode.id);
        }
      }

      // Add intermediate waypoints (skip first and last which are node positions)
      if (e.waypoints.length > 2) {
        for (let wi = 1; wi < e.waypoints.length - 1; wi++) {
          waypoints.push({ x: e.waypoints[wi].x, z: e.waypoints[wi].z });
        }
      }

      // Add to-node
      if (toNode) {
        waypoints.push({ x: toNode.position.x, z: toNode.position.z });
        nodeIds.push(toNode.id);
      }
    }

    // Determine direction from the dominant axis of the chain
    const dx = Math.abs(waypoints[waypoints.length - 1]?.x - waypoints[0]?.x);
    const dz = Math.abs(waypoints[waypoints.length - 1]?.z - waypoints[0]?.z);
    const direction: 'NS' | 'EW' = dz >= dx ? 'NS' : 'EW';

    // Assign name from pool
    const namePool = direction === 'NS' ? defaultNames.ns : defaultNames.ew;
    const name = firstEdge.name || namePool[ci % namePool.length];

    const segId = `street_${ci}`;

    segments.push({
      id: segId,
      name,
      direction,
      nodeIds,
      waypoints,
      width: firstEdge.width,
    });

    // Collect unique nodes for output
    for (const nid of nodeIds) {
      if (nodeIdSet.has(nid)) continue;
      nodeIdSet.add(nid);
      const sn = nodeMap.get(nid);
      if (sn) {
        convertedNodes.push({
          id: sn.id,
          x: sn.position.x,
          z: sn.position.z,
          intersectionOf: [],
        });
      }
    }
  }

  // Populate intersectionOf for each node
  for (const seg of segments) {
    for (const nid of seg.nodeIds) {
      const node = convertedNodes.find(n => n.id === nid);
      if (node) node.intersectionOf.push(seg.id);
    }
  }

  return { nodes: convertedNodes, segments };
}

/** Get the normalized tangent direction at parameter t along a polyline. */
function polylineTangent(
  points: { x: number; z: number }[],
  t: number,
): { x: number; z: number } {
  if (points.length < 2) return { x: 1, z: 0 };

  // Find which segment we're on
  const dists: number[] = [0];
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dz = points[i].z - points[i - 1].z;
    dists.push(dists[i - 1] + Math.sqrt(dx * dx + dz * dz));
  }
  const totalLen = dists[dists.length - 1];
  if (totalLen === 0) return { x: 1, z: 0 };

  const targetDist = Math.min(Math.max(t, 0), 1) * totalLen;

  for (let i = 1; i < dists.length; i++) {
    if (dists[i] >= targetDist || i === dists.length - 1) {
      const dx = points[i].x - points[i - 1].x;
      const dz = points[i].z - points[i - 1].z;
      const len = Math.sqrt(dx * dx + dz * dz);
      if (len === 0) return { x: 1, z: 0 };
      return { x: dx / len, z: dz / len };
    }
  }
  return { x: 1, z: 0 };
}

// ─────────────────────────────────────────────
// Street pruning — remove streets with no buildings
// ─────────────────────────────────────────────

/**
 * Remove street segments that have no lots/buildings near them.
 * A street is "occupied" if at least one lot's streetName matches the segment name,
 * or if any lot center is within `proximityThreshold` world units of the segment polyline.
 *
 * Also removes orphaned nodes (nodes not referenced by any remaining segment).
 */
export function pruneUnusedStreets(
  network: StreetNetwork,
  lotStreetNames: string[],
  lotPositions: { x: number; z: number }[],
  proximityThreshold: number = 30,
): StreetNetwork {
  const usedNames = new Set(lotStreetNames.map(n => n.toLowerCase()));

  const keptSegments = network.segments.filter(seg => {
    // Keep if any lot references this street by name
    if (usedNames.has(seg.name.toLowerCase())) return true;

    // Keep if any lot center is close to this street polyline
    for (const pos of lotPositions) {
      const dist = pointToPolylineDist(pos.x, pos.z, seg.waypoints);
      if (dist <= proximityThreshold) return true;
    }

    return false;
  });

  // Collect node IDs still referenced by kept segments
  const usedNodeIds = new Set<string>();
  for (const seg of keptSegments) {
    for (const nid of seg.nodeIds) usedNodeIds.add(nid);
  }

  const keptNodes = network.nodes.filter(n => usedNodeIds.has(n.id));

  return { nodes: keptNodes, segments: keptSegments };
}
