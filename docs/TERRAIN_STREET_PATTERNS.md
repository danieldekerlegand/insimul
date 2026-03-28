# Terrain-Aware Street Pattern Integration

## Problem

Settlements always generate with a grid layout regardless of terrain type. Two parallel street generation systems exist in the codebase but were never unified:

| | `street-network-generator.ts` (active) | `street-generator.ts` (orphaned) |
|---|---|---|
| **Output type** | `{ nodes: StreetNode[], segments: StreetSegment[] }` (local type) | `{ nodes: StreetNode[], edges: StreetEdge[] }` (from `shared/game-engine/types.ts`) |
| **Patterns** | Grid only (hardcoded at line 239) | Grid, organic, linear, waterfront, hillside, radial |
| **Pattern selection** | None | `selectStreetPattern()` based on terrain + settlement type |
| **Lot placement** | `placeLots()` — 3×2 sub-grid per block, park in center | None (lots are created separately by geography-generator) |
| **Used by** | `geography-generator.ts` line 214 | Nothing |

## Pattern Selection Rules (`street-generator.ts:1455-1466`)

```
coast         → waterfront (curved streets along shoreline)
river         → linear     (buildings along a central main road)
mountains     → hillside   (terraced rows stepping up the slope)
city ≥10k pop → grid       (square blocks)
city <10k pop → radial     (streets radiating from central plaza)
village       → organic    (winding medieval streets)
pre-1800      → organic
default       → grid
```

## Key Files

- **`server/generators/street-network-generator.ts`** — Active grid-only system. Exports `generateStreetNetwork()`, `placeLots()`, `StreetNetwork`, `StreetNetworkConfig`, `LotPlacement`. The geography generator imports and uses these directly.
- **`server/generators/street-generator.ts`** — Orphaned terrain-aware system. Contains `StreetGenerator` class with `generate()` dispatcher and pattern-specific methods: `generateGrid()`, `generateOrganic()`, `generateLinear()`, `generateWaterfront()`, `generateHillside()`, `generateRadial()`. Uses different node/edge types from `shared/game-engine/types.ts`.
- **`server/generators/geography-generator.ts`** — Orchestrator. Calls `generateStreetNetwork()` at line 214, then `placeLots()` to get lot positions, then `persistLotsAndBuildings()` to write to DB. Also has an unused `this.generateStreetNetwork()` instance method (line 358) that calls `StreetGenerator.generate()`.
- **`shared/game-engine/rendering/StreetAlignedPlacement.ts`** — Client-side lot placement (fallback when DB positions absent). Also grid-only with 3×2 lots per block.
- **`shared/game-engine/logic/StreetNetworkLayout.ts`** — Client-side street rendering. Grid-only.
- **`client/src/components/dialogs/SettlementDialog.tsx`** — SVG preview showing expected layout per terrain/type combo.

## Type Incompatibility

The two systems use different output types:

### `street-network-generator.ts` (active)
```typescript
interface StreetNetwork {
  nodes: StreetNode[];     // { id, x, z, intersectionOf }
  segments: StreetSegment[]; // { id, name, waypoints, direction, width, nodeIds }
}
```

### `shared/game-engine/types.ts` (used by StreetGenerator)
```typescript
interface StreetNetwork {
  nodes: StreetNode[];     // { id, x, z, type, connections }
  edges: StreetEdge[];     // { id, fromNodeId, toNodeId, waypoints, ... }
}
```

The `segments` vs `edges` distinction is the main difference. Both carry waypoints; segments are standalone polylines while edges reference node IDs.

## Lot Placement Concern

Currently `placeLots()` in `street-network-generator.ts` subdivides rectangular grid blocks into a 3×2 lot grid. Non-grid patterns (organic, radial, linear, etc.) produce irregular blocks that can't be subdivided the same way. `street-generator.ts` does NOT include lot placement — that logic would need to be written for each non-grid pattern, placing lots along street edges using the edge geometry.

## Integration Strategy

1. **Adapter approach**: Keep `street-network-generator.ts` as the canonical output format. Write an adapter that converts `StreetGenerator`'s `{ nodes, edges }` output into `{ nodes, segments }` format. This avoids changing downstream consumers.

2. **Wire in pattern selection**: In `geography-generator.ts`, pass terrain to `generateStreetNetwork()`. Inside that function, call `StreetGenerator.generate()` for non-grid patterns and convert the output.

3. **Lot placement per pattern**: Extend `placeLots()` to handle non-rectangular block shapes. For linear/waterfront, place lots along street edges. For organic/radial, compute block polygons from the street graph and fill them.

4. **Client-side rendering**: Update `StreetAlignedPlacement.ts` and `StreetNetworkLayout.ts` to handle non-grid stored street data (they already accept `existingNetwork` from DB, so this may work automatically if the stored data has correct waypoints).

5. **SVG preview**: Already implemented in `SettlementDialog.tsx` — shows the expected pattern per terrain/type combo.
