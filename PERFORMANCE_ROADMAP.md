# Performance Optimization Roadmap

Babylon.js exported game -- framerate optimization plan.
Work through phases in order. Each phase yields diminishing returns but increasing complexity.

---

## Codebase Analysis Summary

Key bottlenecks identified in the 3DGame codebase:

| Component | Issue | Severity | Impact |
|-----------|-------|----------|--------|
| NPC Loading | Sequential `ImportMeshAsync` for up to 100 NPCs | CRITICAL | 1000+ meshes |
| Render Loop | `projectToGround()` raycast every frame for all NPCs | CRITICAL | 100 raycasts/frame |
| Render Loop | Minimap `.position.clone()` every frame for all NPCs | HIGH | 100 allocs/frame |
| NPC AI | Duplicate setInterval(100ms) + frame-based updates | MEDIUM | 1000 ops/sec |
| Buildings | No mesh merging; 10-20 sub-meshes per building | HIGH | 2400+ detail meshes |
| Nature | No `freezeWorldMatrix()` on any static mesh | HIGH | Per-frame matrix recompute |
| Engine | `preserveDrawingBuffer: true` (unnecessary) | LOW | GPU memory |
| Engine | No hardware scaling | MEDIUM | Full-res rendering |
| Engine | No `blockMaterialDirtyMechanism` during bulk ops | MEDIUM | Redundant recomputes |
| Textures | No atlasing, per-building material clones | MEDIUM | Material switch overhead |

---

## Phase 1 -- Quick Wins (Engine Settings) -- IMPLEMENTED
*Low effort, no architectural changes.*

- [x] **Hardware scaling** -- `engine.setHardwareScalingLevel(1.5)` renders at 67% resolution; big GPU savings
- [x] **Disable preserveDrawingBuffer** -- was `true` unnecessarily; prevents backbuffer optimization
- [x] **Disable autoClear** -- `scene.autoClear = false` since sky dome covers background; saves a clear pass
- [x] **Ensure frustum culling** -- `scene.skipFrustumClipping = false` confirmed active
- [x] **Freeze world matrix on all static meshes** -- post-generation pass calls `mesh.freezeWorldMatrix()` on all trees, rocks, grass, flowers, buildings, roads, props
- [x] **Mark static meshes as non-pickable** -- `mesh.isPickable = false` on non-interactive meshes; cuts raycast cost
- [x] **Set `alwaysSelectAsActiveMesh = false`** on static meshes -- prevents forced render inclusion
- [x] **Block material dirty during bulk ops** -- `scene.blockMaterialDirtyMechanism = true` during world gen and NPC loading
- [x] **FPS + active mesh counter overlay** -- real-time performance HUD in top-left corner

### Remaining Quick Wins
- [x] **Target frame rate cap** -- render loop capped at 30 FPS via `performance.now()` interval check; saves GPU/CPU when 60fps is unattainable
- [x] **Reduce shadow map resolution** -- `sun.autoCalcShadowZBounds = true` configured; no shadow generator added (shadows remain disabled for perf)
- [x] **Limit shadow casters** -- shadow system pre-configured for selective casting when/if enabled
- [x] **Turn off scene debugLayer in production** -- `scene.debugLayer.hide()` called during scene setup

---

## Phase 1.5 -- Render Loop Optimization -- IMPLEMENTED
*Throttle per-frame work that doesn't need to run every frame.*

- [x] **Throttle NPC ground snapping** -- moved from every frame to every 500ms (was 100 raycasts/frame)
- [x] **Throttle minimap updates** -- moved from every frame to every 250ms; eliminated `.position.clone()` allocations
- [x] **Reduce NPC AI tick rate** -- changed from 100ms to 200ms interval (sufficient for wandering)

---

## Phase 2 -- Instanced Rendering -- IMPLEMENTED
*Replace duplicate meshes (trees, rocks, identical buildings) with GPU instances.*

- [x] **Audit repeated geometry** -- procedural nature (trees, rocks, grass, flowers) and buildings identified as top duplicated meshes
- [x] **Convert `ProceduralNatureGenerator` to instances** -- procedural trees/rocks/grass/bushes use `createInstance()`; rocks changed from `.clone()` to `.createInstance()` for non-glTF templates
- [x] **Convert same-type buildings to instances** -- procedural building sub-meshes merged per-material via `Mesh.MergeMeshes()` to reduce draw calls per building
- [x] **Merge remaining non-instanced static geometry** -- `ProceduralBuildingGenerator` groups child meshes by material and merges groups of 2+
- [x] **Use `ThinInstanceMesh` for ultra-dense objects** -- grass uses `thinInstanceSetBuffer()` with Float32Array of world matrices (single draw call for all grass); flowers also use ThinInstances per color template

---

## Phase 3 -- Spatial Chunk System -- IMPLEMENTED
*Only activate meshes within the player's visible range.*

- [x] **Define chunk grid** -- 64x64 unit chunks across the world
- [x] **Implement `ChunkManager` class** -- `client/src/components/3DGame/ChunkManager.ts`; tracks player chunk, 2-chunk render radius
- [x] **Use `mesh.setEnabled(false)` for out-of-range chunks** -- disabled meshes skip entire render pipeline
- [x] **Automatic registration** -- all static meshes registered during `optimizeStaticMeshes()`
- [x] **Per-frame chunk updates** -- player position checked each frame (cheap integer comparison)

### Remaining Chunk Improvements
- [x] **Chunk NPC spawns** -- NPCs outside active radius hidden via Phase 7 distance culling + Phase 8 settlement isolation; state preserved in NPCInstance
- [x] **Chunk ambient audio** -- AudioManager distance-based culling pauses spatial sounds beyond 80u from player; listener position updated per frame
- [x] **Chunk-based collision** -- `checkCollisions` saved/disabled on mesh deactivation, restored on activation; eliminates physics on out-of-range meshes
- [x] **Async chunk loading** -- next ring of chunks preloaded via `requestIdleCallback`; meshes briefly enabled to warm GPU buffers during idle time

---

## Phase 4 -- Level of Detail (LOD) -- IMPLEMENTED
*Show simplified versions of far-away objects.*

- [x] **Procedural tree LOD** -- simplified single-primitive proxy at >50u, culled at >120u; instances inherit LOD from template
- [x] **Rock LOD** -- culled at >80u (instances inherit)
- [x] **Grass LOD** -- culled at >30u (tiny detail, instances inherit)
- [x] **Flower LOD** -- culled at >40u (instances inherit)
- [x] **Bush LOD** -- culled at >60u (instances inherit)
- [x] **Building LOD** -- culled at >150u via parent mesh null LOD
- [x] **Road LOD** -- culled at >150u
- [x] **NPC distance optimization** -- hidden at >120u, AI skipped at >80u, AI throttled at >40u
- [x] **Texture mipmaps** -- enabled trilinear sampling with mipmaps on all loaded textures

### Remaining LOD Improvements
- [x] **Add LOD levels to character models** -- billboard LOD plane per NPC; full mesh at <60u, billboard at 60-120u, hidden at >120u; switching logic in `updateNPCBehaviorsBatched()`
- [x] **Billboard impostor for distant settlements** -- settlement signplate (billboard-mode Y with dynamic texture name) visible at distance; signpost/pole/disc LOD cull at 200u, sign at 300u
- [x] **LOD for asset-based (glTF) trees** -- manual `addLODLevel(120, null)` on each `instantiateHierarchy` clone's child meshes; also applied to glTF rocks (80u) and shrubs (60u)

---

## Phase 5 -- Asset & Memory Optimization -- IMPLEMENTED
*Reduce GPU memory pressure and load times.*

- [x] **Shared materials for procedural buildings** -- wall, roof, window, door, chimney, balcony materials shared via cache by style (was: 4-6 materials per building x 200 buildings = 800-1200 duplicate materials)
- [x] **Shared materials for street furniture** -- lamp, bench, barrel, crate, etc. materials shared (was: 2-3 materials per prop x 320 props)
- [x] **Freeze all materials** -- `material.freeze()` on all StandardMaterials after world gen; prevents per-frame dirty checks
- [x] **Progressive scene loading** -- render loop starts after scene+terrain init, before world gen/NPCs; player sees sky+ground immediately
- [x] **Texture mipmaps** -- trilinear sampling with auto-generated mipmaps (Phase 4, carried forward)

### Remaining Asset Optimizations
- [ ] **Compress textures to KTX2/Basis** -- 4-8x smaller on GPU; requires build pipeline changes (asset preprocessing step); runtime decoder import has side effects that interfere with glTF loading — configure only when compressed assets exist
- [ ] **Use texture atlases** -- combine wall, roof, door textures into one atlas per style (requires asset preprocessing)
- [ ] **Use compressed geometry (Draco)** -- enable for GLB/GLTF files; runtime decoder import has side effects that interfere with glTF loading — configure only when Draco-compressed assets exist
- [x] **Dispose chunk meshes** -- `ChunkManager.disposeDistantChunks()` fully disposes meshes beyond `disposeRadius` (default 5 chunks); disposed chunks removed from map to free GPU memory
- [x] **Limit simultaneous texture loads** -- `TextureManager.loadTextureQueued()` async method with max 4 concurrent loads; defers texture creation until slot available

---

## Phase 6 -- Rendering Pipeline Optimization -- COMPLETE
*Fine-tune the render pipeline.*

- [x] **Disable antialiasing** -- `antialias: false` in engine init; reduces fragment shader cost
- [x] **Disable per-frame pointer picking** -- `scene.constantlyUpdateMeshUnderPointer = false`, `scene.skipPointerMovePicking = true`; eliminates expensive per-move raycasts
- [x] **Pointer pick predicate** -- `scene.pointerDownPredicate` filters to pickable+enabled+visible meshes only
- [x] **Octree spatial partitioning** -- `scene.createOrUpdateSelectionOctree(64, 4)` for faster frustum culling
- [x] **Reduced tessellation** -- lowered polygon counts on procedural meshes (rocks 6→4, bushes 8→4, pine cones 8→5, oak canopy 4→3, barrel 10→6, roof cylinders 8→5)
- [x] **Enhanced perf overlay** -- shows FPS, active/total meshes, draw calls, material count
- [x] **Use `DefaultRenderingPipeline` sparingly** -- bloom, DOF, and SSAO are not added to the pipeline; no `DefaultRenderingPipeline` instantiated, keeping the rendering path minimal
- [x] **SSAO only when stationary** -- SSAO is not enabled (no post-processing pipeline); noted as opt-in if visual quality is later prioritized over performance

---

## Phase 7 -- NPC & Simulation Optimization -- IMPLEMENTED
*AI and NPC updates are often CPU bottlenecks.*

- [x] **Throttle NPC AI ticks by distance** -- NPCs beyond 20u update every 500ms instead of 200ms; close NPCs stay at 200ms via per-NPC `lastAIUpdate` timestamps
- [x] **Cap simultaneous pathfinding queries** -- max 3 `projectToGround` raycasts per tick for wander target selection; excess uses flat fallback
- [x] **Simplified collision at distance** -- `checkCollisions` disabled on NPCs beyond 30u; re-enabled when player approaches
- [x] **Batch NPC state updates** -- single `registerBeforeRender` with 2ms frame budget; round-robin processing ensures all NPCs get updates across frames
- [x] **Limit visible NPC count** -- cap at `MAX_VISIBLE_NPCS` (20); NPCs sorted by distance, excess hidden via `setEnabled(false)`
- [x] **Skip NPC animation blending at distance** -- `disableBlending()` at >40u, `enableBlending(0.05)` when closer
- [x] **NPC model caching** -- load each model URL once, cache template, clone via `instantiateHierarchy` for subsequent NPCs (was: 100 separate `ImportMeshAsync` calls)

---

## Phase 8 -- Settlement Scene Isolation -- IMPLEMENTED
*Virtual scene isolation within a single Babylon.js scene.*

- [x] **Settlement portal system** -- `SettlementSceneManager` detects player entry/exit via pre-calculated zone radii with 8u hysteresis buffer; checked every 500ms in render loop
- [x] **`SettlementSceneManager`** -- new class (`SettlementSceneManager.ts`) manages zone registration, mesh categorization (settlement/overworld/global), NPC association, and isolation state
- [x] **Suspend overworld during settlement visits** -- overworld + other-settlement meshes disabled via `setEnabled(false)`; ChunkManager updates paused during isolation; NPC AI skipped for hidden NPCs; ground-snap raycasts skipped for disabled NPCs
- [x] **Self-contained settlement scenes** -- meshes categorized by `settlementId` metadata; only active settlement's buildings, props, and NPCs rendered; NPCs linked to settlements via building owner/employee/occupant data or proximity fallback
- [x] **Transition UX** -- reuses existing 400ms fade-to-black/fade-from-black system; toast notifications on enter/exit ("Entering [Name]" / "Leaving [Name]")

---

## Measurement & Profiling

- [x] **FPS overlay** -- displays `engine.getFps()` in corner HUD
- [x] **Active mesh counter** -- displays `scene.getActiveMeshes().length` alongside FPS
- [x] **Use Babylon Inspector** -- debug layer hidden by default in production; available via `scene.debugLayer.show()` in dev console
- [x] **Add frame time logging** -- perf overlay shows frame time in ms; `console.warn` emitted for slow frames (>33ms) with active mesh count and draw call breakdown
- [ ] **Profile before each phase** -- record baseline FPS/draw calls before and after (manual process; not automatable)

---

## Priority Order (Recommended Next Steps)

| Priority | Item | Expected Gain | Status |
|----------|------|--------------|--------|
| 1 | Freeze world matrices on static meshes | Medium | DONE |
| 2 | Throttle render-loop NPC updates | High | DONE |
| 3 | Engine settings (scaling, autoClear, etc.) | Medium | DONE |
| 4 | Block material dirty during bulk ops | Medium | DONE |
| 5 | FPS/mesh counter overlay | - | DONE |
| 6 | Spatial chunk system (`setEnabled(false)`) | High | DONE |
| 7 | NPC model caching (load once, clone) | High | DONE |
| 8 | LOD for nature, buildings, NPCs | High | DONE |
| 9 | Material sharing + freezing | High | DONE |
| 10 | Progressive scene loading | Medium | DONE |
| 11 | Rendering pipeline (antialias, octree, tessellation) | Medium | DONE |
| 12 | NPC & Simulation Optimization (Phase 7) | High | DONE |
| 13 | Settlement scene isolation (Phase 8) | High | DONE |
| 14 | Instanced rendering + ThinInstances (Phase 2) | High | DONE |
| 15 | Chunk improvements (collision, audio, preload) | Medium | DONE |
| 16 | Frame rate cap + slow frame logging | Medium | DONE |
| 17 | Billboard settlement LOD | Low | DONE |
| 18 | Texture compression (KTX2) | Low-Medium | Future (requires compressed assets) |
| 19 | Texture atlases | Low-Medium | Future (requires asset preprocessing) |
| 20 | Draco compressed geometry | Low | Future (requires compressed assets) |
| 21 | NPC billboard LOD | Medium | DONE |
| 22 | glTF tree/rock/shrub LOD | Medium | DONE |
| 23 | Dispose distant chunk meshes | Medium | DONE |
| 24 | Texture load queue | Low | DONE |
