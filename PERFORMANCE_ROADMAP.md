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
- [ ] **Target frame rate cap** -- `engine.setAnimationFrameRate(30)` if 60 fps is unattainable
- [ ] **Reduce shadow map resolution** -- use 512x512 or 1024x1024 if shadows are added
- [ ] **Limit shadow casters** -- only player, active NPCs, nearby objects
- [ ] **Turn off scene debugLayer in production** -- ensure never active in shipped builds

---

## Phase 1.5 -- Render Loop Optimization -- IMPLEMENTED
*Throttle per-frame work that doesn't need to run every frame.*

- [x] **Throttle NPC ground snapping** -- moved from every frame to every 500ms (was 100 raycasts/frame)
- [x] **Throttle minimap updates** -- moved from every frame to every 250ms; eliminated `.position.clone()` allocations
- [x] **Reduce NPC AI tick rate** -- changed from 100ms to 200ms interval (sufficient for wandering)

---

## Phase 2 -- Instanced Rendering
*Replace duplicate meshes (trees, rocks, identical buildings) with GPU instances.*

- [ ] **Audit repeated geometry** -- identify the top 10 mesh types placed more than ~5 times
- [ ] **Convert `ProceduralNatureGenerator` to instances** -- procedural trees/rocks/grass already use `createInstance()`; asset-based trees use `instantiateHierarchy` which is less efficient
- [ ] **Convert same-type buildings to instances** -- buildings of the same role should share a source mesh
- [ ] **Merge remaining non-instanced static geometry** -- use `Mesh.MergeMeshes()` for heterogeneous static objects sharing a material
- [ ] **Use `ThinInstanceMesh` for ultra-dense objects** (grass patches, pebbles) -- positions via float32 buffer

---

## Phase 3 -- Spatial Chunk System -- IMPLEMENTED
*Only activate meshes within the player's visible range.*

- [x] **Define chunk grid** -- 64x64 unit chunks across the world
- [x] **Implement `ChunkManager` class** -- `client/src/components/3DGame/ChunkManager.ts`; tracks player chunk, 2-chunk render radius
- [x] **Use `mesh.setEnabled(false)` for out-of-range chunks** -- disabled meshes skip entire render pipeline
- [x] **Automatic registration** -- all static meshes registered during `optimizeStaticMeshes()`
- [x] **Per-frame chunk updates** -- player position checked each frame (cheap integer comparison)

### Remaining Chunk Improvements
- [ ] **Chunk NPC spawns** -- NPCs outside active radius despawned (state preserved)
- [ ] **Chunk ambient audio** -- only play sounds within active chunks
- [ ] **Chunk-based collision** -- disable physics impostors on out-of-range meshes
- [ ] **Async chunk loading** -- load next ring during idle frames to avoid stutter

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
- [ ] **Add LOD levels to character models** -- half-poly at <60u, billboard at <150u
- [ ] **Billboard impostor for distant settlements** -- single sprite beyond active chunk radius
- [ ] **LOD for asset-based (glTF) trees** -- instantiateHierarchy doesn't inherit LOD; needs separate approach

---

## Phase 5 -- Asset & Memory Optimization -- IMPLEMENTED
*Reduce GPU memory pressure and load times.*

- [x] **Shared materials for procedural buildings** -- wall, roof, window, door, chimney, balcony materials shared via cache by style (was: 4-6 materials per building x 200 buildings = 800-1200 duplicate materials)
- [x] **Shared materials for street furniture** -- lamp, bench, barrel, crate, etc. materials shared (was: 2-3 materials per prop x 320 props)
- [x] **Freeze all materials** -- `material.freeze()` on all StandardMaterials after world gen; prevents per-frame dirty checks
- [x] **Progressive scene loading** -- render loop starts after scene+terrain init, before world gen/NPCs; player sees sky+ground immediately
- [x] **Texture mipmaps** -- trilinear sampling with auto-generated mipmaps (Phase 4, carried forward)

### Remaining Asset Optimizations
- [ ] **Compress textures to KTX2/Basis** -- 4-8x smaller on GPU; requires build tooling
- [ ] **Use texture atlases** -- combine wall, roof, door textures into one atlas per style
- [ ] **Use compressed geometry (Draco)** -- enable for GLB/GLTF files
- [ ] **Dispose chunk meshes** -- fully dispose (not just disable) meshes in very distant chunks
- [ ] **Limit simultaneous texture loads** -- queue to max 4 in-flight

---

## Phase 6 -- Rendering Pipeline Optimization -- IMPLEMENTED
*Fine-tune the render pipeline.*

- [x] **Disable antialiasing** -- `antialias: false` in engine init; reduces fragment shader cost
- [x] **Disable per-frame pointer picking** -- `scene.constantlyUpdateMeshUnderPointer = false`, `scene.skipPointerMovePicking = true`; eliminates expensive per-move raycasts
- [x] **Pointer pick predicate** -- `scene.pointerDownPredicate` filters to pickable+enabled+visible meshes only
- [x] **Octree spatial partitioning** -- `scene.createOrUpdateSelectionOctree(64, 4)` for faster frustum culling
- [x] **Reduced tessellation** -- lowered polygon counts on procedural meshes (rocks 6→4, bushes 8→4, pine cones 8→5, oak canopy 4→3, barrel 10→6, roof cylinders 8→5)
- [x] **Enhanced perf overlay** -- shows FPS, active/total meshes, draw calls, material count
- [ ] **Use `DefaultRenderingPipeline` sparingly** -- disable bloom and DOF by default (not currently used)
- [ ] **SSAO only when stationary** -- expensive; skip when camera moves (not currently used)

---

## Phase 7 -- NPC & Simulation Optimization
*AI and NPC updates are often CPU bottlenecks.*

- [ ] **Throttle NPC AI ticks by distance** -- NPCs beyond 20u update every 500ms instead of 200ms
- [ ] **Cap simultaneous pathfinding queries** -- max 3 NPCs recompute paths per frame
- [ ] **Simplified collision at distance** -- grid-based repulsion for distant NPCs
- [ ] **Batch NPC state updates** -- single `registerBeforeRender` with frame budget (max 2ms)
- [ ] **Limit visible NPC count** -- cap at `MAX_VISIBLE_NPCS` (15-20); beyond = name marker only
- [ ] **Skip NPC animation blending at distance** -- snap to target animation at >40u
- [x] **NPC model caching** -- load each model URL once, cache template, clone via `instantiateHierarchy` for subsequent NPCs (was: 100 separate `ImportMeshAsync` calls)

---

## Phase 8 -- Settlement Scene Isolation
*Last resort if the open world approach is fundamentally too heavy.*

- [ ] **Settlement portal system** -- invisible trigger zones initiate scene transitions
- [ ] **`SceneManager`** -- manages loading/unloading of overworld and settlement scenes
- [ ] **Suspend overworld during settlement visits** -- pause render, freeze meshes, stop physics
- [ ] **Self-contained settlement scenes** -- only load own buildings, NPCs, assets
- [ ] **Transition UX** -- loading screen / fade during scene swap (<1s target)

---

## Measurement & Profiling

- [x] **FPS overlay** -- displays `engine.getFps()` in corner HUD
- [x] **Active mesh counter** -- displays `scene.getActiveMeshes().length` alongside FPS
- [ ] **Use Babylon Inspector** -- `scene.debugLayer.show()` in dev mode
- [ ] **Add frame time logging** -- log slow frames (>33ms) with breakdown
- [ ] **Profile before each phase** -- record baseline FPS/draw calls before and after

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
| 12 | Texture compression (KTX2) | Low-Medium | Future |
| 13 | Settlement scene isolation | High (if needed) | Future |
