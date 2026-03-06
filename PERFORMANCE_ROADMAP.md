# Performance Optimization Roadmap

Babylon.js exported game — framerate optimization plan.
Work through phases in order. Each phase yields diminishing returns but increasing complexity.

---

## Phase 1 — Quick Wins (Engine Settings)
*Low effort, no architectural changes. Do these first.*

- [ ] **Hardware scaling** — call `engine.setHardwareScalingLevel(1.5)` to render at 67% native resolution; barely visible, big GPU savings
- [ ] **Target frame rate cap** — `engine.setAnimationFrameRate(30)` if 60 fps is unattainable; halves GPU load
- [ ] **Disable auto-clear on unused render targets** — `scene.autoClear = true` only when sky is visible; disable for interior/dungeon scenes
- [ ] **Turn off scene debugLayer in production** — ensure `scene.debugLayer` is never active in shipped builds
- [ ] **Freeze world matrix on all static meshes** — call `mesh.freezeWorldMatrix()` on every building, road, tree, and ground mesh after placement; eliminates per-frame matrix recomputation
- [ ] **Mark static meshes as non-pickable** — `mesh.isPickable = false` on anything the player can't interact with; cuts pick raycast cost
- [ ] **Reduce shadow map resolution** — use 512×512 or 1024×1024 shadow maps instead of 2048+; `shadowGenerator.mapSize = 1024`
- [ ] **Limit shadow casters** — only the player, active NPCs, and nearby objects should cast shadows; call `shadowGenerator.addShadowCaster(mesh)` selectively
- [ ] **Use `DirectionalLight` instead of `SpotLight`/`PointLight` for sun** — directional is far cheaper; point lights multiply draw calls
- [ ] **Disable `scene.skipFrustumClipping` = false** — ensure Babylon's built-in frustum culling is active (it is by default but can be accidentally disabled)
- [ ] **Set `mesh.alwaysSelectAsActiveMesh = false`** on all meshes — prevents forced inclusion in render loop

---

## Phase 2 — Instanced Rendering
*Replace duplicate meshes (trees, rocks, identical buildings) with GPU instances.*

- [ ] **Audit repeated geometry** — identify the top 10 mesh types placed more than ~5 times (trees, fence posts, building variants, road segments)
- [ ] **Convert `ProceduralNatureGenerator` to instances** — replace `mesh.clone()` calls with `sourceMesh.createInstance(name)`; each instance adds ~zero draw call cost
- [ ] **Convert `ProceduralBuildingGenerator` same-type buildings to instances** — buildings of the same role (e.g. all `house_A`) should share a source mesh; only vary position/rotation
- [ ] **Convert road segments to instances** — road tiles of the same width/type are ideal instance candidates
- [ ] **Merge remaining non-instanced static geometry** — use `Mesh.MergeMeshes([...meshes], true, true)` for heterogeneous static objects that share a material; reduces draw calls to 1 per material
- [ ] **Use `ThinInstanceMesh` for ultra-dense objects** (grass patches, pebbles) — even cheaper than standard instances; positions updated via float32 buffer

---

## Phase 3 — Spatial Chunk System
*Only activate meshes within the player's visible range.*

- [ ] **Define chunk grid** — divide the world into `N×N` tiles (suggest 64–128 world units per chunk); store which meshes belong to each chunk
- [ ] **Implement `ChunkManager` class**
  - Tracks player's current chunk `(cx, cy)`
  - Maintains a configurable render radius (suggest 2–3 chunks in each direction)
  - On chunk change: enable meshes in new chunks, disable meshes in exiting chunks
- [ ] **Use `mesh.setEnabled(false)` for out-of-range chunks** — disabled meshes are skipped by the entire render pipeline (geometry, shadows, physics)
- [ ] **Chunk NPC spawns** — NPCs outside the active chunk radius are despawned entirely and re-spawned on entry (store their state, don't destroy their data)
- [ ] **Chunk ambient audio** — only play ambient sound sources within the active chunk radius
- [ ] **Chunk-based collision** — disable physics impostors on out-of-range meshes; physics updates dominate CPU cost at high mesh counts
- [ ] **Async chunk loading** — load the next ring of chunks in a background task during idle frames (`scene.registerBeforeRender` with time budgeting) to avoid stutter on chunk crossings

---

## Phase 4 — Level of Detail (LOD)
*Show simplified versions of far-away objects.*

- [ ] **Add LOD levels to character models** — `mesh.addLODLevel(distanceFromCamera, simplifiedMesh)` with 3 tiers: full (< 20u), half-poly (< 60u), billboard (< 150u)
- [ ] **Add LOD levels to buildings** — at > 80 units, swap building to a flat-shaded low-poly proxy; at > 200 units, use a single colored billboard quad
- [ ] **Implement billboard impostor for distant settlements** — beyond the active chunk radius, render each settlement as a single sprite/billboard showing a generic skyline silhouette; use `Sprite` or a flat `PlaneBuilder` mesh with the world forward direction
- [ ] **Add LOD to nature meshes** — trees at distance > 50u become simple cones/cylinders; rocks become cubes; at > 150u, use a `PointsCloudSystem` dot
- [ ] **Use `AbstractMesh.useLODScreenCoverage`** — Babylon can compute LOD transitions based on screen area rather than distance, which is more accurate at varying field-of-view
- [ ] **LOD for textures** — ensure all textures have generated mipmaps (`texture.generateMipMaps = true`); Babylon uses them automatically at distance
- [ ] **Cull NPC animation at distance** — beyond 30 units, reduce NPC `AnimationGroup` frame rate to every other frame; beyond 80 units, pause animation entirely

---

## Phase 5 — Asset & Memory Optimization
*Reduce GPU memory pressure and load times.*

- [ ] **Compress textures to KTX2/Basis** — KTX2 textures are 4–8× smaller on GPU memory and decode on upload; Babylon supports them natively with `BasisTools`
- [ ] **Use texture atlases for building materials** — combine wall, roof, door textures into one atlas; eliminates material switches between building parts
- [ ] **Dispose unused assets immediately** — after chunk unload, call `mesh.dispose()` on meshes that will not be re-used; call `texture.dispose()` if the texture won't appear again
- [ ] **Implement an asset pool** — instead of creating/disposing identical meshes (e.g. tree type A), maintain a pool of hidden instances and re-enable them on demand
- [ ] **Limit simultaneous texture loads** — queue texture loads so no more than 4 are in-flight at a time; prevents GPU upload stalls that cause frame spikes
- [ ] **Use compressed geometry (Draco)** — enable `@babylonjs/loaders` Draco decompressor for GLB/GLTF files; reduces file size and load time
- [ ] **Stream large scenes progressively** — load world data in priority order: terrain → buildings → NPCs → decorations; show the world as soon as terrain loads rather than waiting for all assets

---

## Phase 6 — Rendering Pipeline Optimization
*Fine-tune the render pipeline itself.*

- [ ] **Use `DefaultRenderingPipeline` sparingly** — anti-aliasing (FXAA), bloom, and depth-of-field each cost 1–2 ms per frame; disable bloom and DOF by default, expose as quality setting
- [ ] **Switch to `SSAO2RenderingPipeline` only when stationary** — SSAO is expensive; only compute it on frames where the camera hasn't moved
- [ ] **Reduce post-process chain** — audit all active post-processes and disable any that are not visually essential
- [ ] **Use `FastBuildLevelExtension`** for terrain — Babylon's groundMesh with subdivisions scales badly; prefer a low-subdivision ground with a normal map for detail illusion
- [ ] **Enable `scene.blockMaterialDirtyMechanism`** during bulk operations — prevents redundant material state recomputation when spawning many objects; re-enable afterward
- [ ] **Use `scene.getActiveMeshes().data.length` as a real-time budget gauge** — log this each second during testing; target < 300 active meshes per frame
- [ ] **Enable WebGL2 / WebGPU** — ensure the engine is initialized with `{ antialias: false }` and forced to WebGL2 for instancing/compute shader support

---

## Phase 7 — NPC & Simulation Optimization
*AI and NPC updates are often CPU bottlenecks.*

- [ ] **Throttle NPC AI ticks** — NPCs beyond 20 units update their pathfinding every 500ms instead of every frame
- [ ] **Cap simultaneous pathfinding queries** — allow at most 3 NPCs to recompute paths per frame; queue the rest
- [ ] **Use simplified collision avoidance at distance** — nearby NPCs use full physics avoidance; distant NPCs use a cheap grid-based repulsion
- [ ] **Batch NPC state updates** — consolidate all NPC state machine ticks into a single `scene.registerBeforeRender` callback with a frame budget (e.g. max 2ms per frame)
- [ ] **Limit visible NPC count** — cap simultaneous rendered NPCs at a configurable `MAX_VISIBLE_NPCS` (suggest 15–20); beyond that, NPCs are represented by a name marker only
- [ ] **Skip NPC animation blending at distance** — animation cross-fades are expensive; snap to target animation immediately for NPCs beyond 40 units

---

## Phase 8 — Settlement Scene Isolation
*Last resort if the open world approach is fundamentally too heavy.*

- [ ] **Design settlement "portal" system** — each settlement has an invisible trigger zone; crossing it initiates a scene transition
- [ ] **Implement `SceneManager`** — manages loading/unloading of the overworld scene and individual settlement scenes; only one scene is fully active at a time
- [ ] **Overworld scene during settlement visit** — suspend (not dispose) the overworld scene: pause render loop, freeze all meshes, stop physics; resume on exit
- [ ] **Settlement scenes are self-contained** — each settlement scene loads only its own buildings, NPCs, and assets; re-uses shared materials via `SharedMaterial` references
- [ ] **Use `Scene.createDefaultCamera` with culling mask** — settlement scene camera only renders settlement layer; overworld camera only renders overworld layer; no overlap
- [ ] **Persist player state across scenes** — serialize player position, inventory, quest state to a lightweight state object before transition; restore on return
- [ ] **Transition UX** — show a loading screen or "entering [settlement name]" fade during the scene swap; target < 1 second load time for pre-cached settlement data

---

## Measurement & Profiling
*Cannot optimize what you cannot measure.*

- [ ] **Add FPS overlay** — display `engine.getFps().toFixed()` in a corner HUD element; always visible during development
- [ ] **Add active mesh counter** — display `scene.getActiveMeshes().length` alongside FPS
- [ ] **Use Babylon Inspector** — `scene.debugLayer.show()` in dev mode; profile draw calls, material counts, and texture sizes in the Statistics tab
- [ ] **Add frame time logging** — log slow frames (> 33ms) to console with a breakdown: `scene.onAfterRenderObservable`
- [ ] **Profile before each phase** — record baseline FPS/draw call count before starting each phase; record after; track gains

---

## Priority Order (Recommended Start)

| Priority | Item | Expected Gain |
|----------|------|--------------|
| 1 | Freeze world matrices on static meshes | Medium |
| 2 | Instanced rendering for trees/buildings | High |
| 3 | `setEnabled(false)` beyond chunk radius | High |
| 4 | Shadow map size + caster reduction | Medium |
| 5 | LOD for buildings and characters | High |
| 6 | NPC AI throttling | Medium |
| 7 | Hardware scaling level | Medium |
| 8 | Texture compression (KTX2) | Low-Medium |
| 9 | Settlement scene isolation | High (if needed) |
