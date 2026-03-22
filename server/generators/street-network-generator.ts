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
  settlementType: 'village' | 'town' | 'city';
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
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const GRID_SPACING: Record<string, number> = {
  village: 50,
  town: 45,
  city: 40,
};

const GRID_SIZE: Record<string, number> = {
  village: 4,
  town: 5,
  city: 7,
};

const STREET_WIDTH: Record<string, number> = {
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

interface StreetNamePool {
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

/**
 * Choose layout algorithm based on settlement type and founding era.
 */
export function chooseLayout(
  settlementType: string,
  foundedYear: number,
  layoutOverride?: 'grid' | 'organic',
): 'grid' | 'organic' {
  if (layoutOverride) return layoutOverride;
  // Default to grid — it's the most recognisable street layout and
  // matches what users see in the Society preview.  Organic can be
  // requested explicitly via layoutOverride (future UI option).
  return 'grid';
}

/**
 * Generate a street network for a settlement.
 */
export function generateStreetNetwork(config: StreetNetworkConfig): StreetNetwork {
  const layout = chooseLayout(
    config.settlementType,
    config.foundedYear,
    config.layoutOverride,
  );

  if (layout === 'grid') {
    return generateGridNetwork(config);
  }
  return generateOrganicNetwork(config);
}

// ─────────────────────────────────────────────
// Grid layout
// ─────────────────────────────────────────────

function generateGridNetwork(config: StreetNetworkConfig): StreetNetwork {
  const rand = createSeededRandom(`${config.seed}_streets_grid`);
  const spacing = GRID_SPACING[config.settlementType] || 35;
  const size = GRID_SIZE[config.settlementType] || 5;
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
  const size = GRID_SIZE[config.settlementType] || 5;
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
}

// ─── Lot sizing by settlement type ────────────────────────────────────────────

const TARGET_LOT_WIDTHS: Record<string, number> = { village: 15, town: 12, city: 10 };
const MIN_LOT_DEPTHS: Record<string, number> = { village: 28, town: 24, city: 20 };

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
    // Bounding streets (for addressing)
    leftStreet: StreetLine;  rightStreet: StreetLine;
    topStreet: StreetLine;   bottomStreet: StreetLine;
  }
  const blocks: Block[] = [];

  for (let ci = 0; ci < nsLines.length - 1; ci++) {
    for (let ri = 0; ri < ewLines.length - 1; ri++) {
      const left = nsLines[ci];
      const right = nsLines[ci + 1];
      const top = ewLines[ri];
      const bottom = ewLines[ri + 1];

      blocks.push({
        minX: left.coord + left.width / 2,
        maxX: right.coord - right.width / 2,
        minZ: top.coord + top.width / 2,
        maxZ: bottom.coord - bottom.width / 2,
        leftStreet: left, rightStreet: right,
        topStreet: top, bottomStreet: bottom,
      });
    }
  }

  // Subdivide each block into lots
  let houseNum = 1;

  for (const block of blocks) {
    const blockW = block.maxX - block.minX; // width (along X, frontage on NS streets)
    const blockD = block.maxZ - block.minZ; // depth (along Z, frontage on EW streets)

    if (blockW < 2 || blockD < 2) continue;

    // Skip blocks whose center is in water
    if (isWater) {
      const blockCenterX = (block.minX + block.maxX) / 2;
      const blockCenterZ = (block.minZ + block.maxZ) / 2;
      if (isWater(blockCenterX, blockCenterZ)) continue;
    }

    // Two rows of lots: top row faces the top EW street, bottom row faces the bottom
    const rowDepth = blockD / 2;

    // Number of lot columns along the X axis (frontage on EW streets)
    const numColsEW = Math.max(1, Math.round(blockW / targetLotWidth));
    const colWidthEW = blockW / numColsEW;

    // ── Lots facing EW streets (top and bottom rows) ──────────────────
    for (let col = 0; col < numColsEW; col++) {
      if (placements.length >= lotCount) break;

      const lotW = colWidthEW;
      const lotD = Math.max(rowDepth, minLotDepth);
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
