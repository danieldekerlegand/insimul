/**
 * BuildingInteriorGenerator
 *
 * Generates building interior rooms at a Y-offset (Y=500+) within the same Babylon scene.
 * Each interior has walls, floor, ceiling, and furniture based on the building type.
 * Furniture uses glTF 3D models when available, falling back to procedural geometry.
 * Used by the door/portal system in BabylonGame.ts.
 */

import {
  Scene,
  Mesh,
  MeshBuilder,
  Vector3,
  StandardMaterial,
  Color3,
} from '@babylonjs/core';
import type { FurnitureModelLoader } from './FurnitureModelLoader';
import type { InteriorTemplateConfig, InteriorLayoutTemplate } from '@shared/game-engine/types';
import {
  INTERIOR_LAYOUT_TEMPLATES,
  getFurnitureSetForRoom,
} from '@shared/game-engine/interior-templates';
import type {
  FurnitureEntry,
  InteriorLayoutTemplate as FurnitureLayoutTemplate,
} from '@shared/game-engine/interior-templates';

/** Describes a sub-room within a multi-room interior */
export interface RoomZone {
  name: string;
  /** Function of the room (living, kitchen, bedroom, shop, storage, office) */
  function: string;
  /** Offset from interior position */
  offsetX: number;
  offsetZ: number;
  /** Y offset for upper floors */
  offsetY: number;
  width: number;
  depth: number;
  /** Floor index: 0 = ground, 1 = upstairs */
  floor: number;
}

export interface InteriorLayout {
  id: string;
  buildingId: string;
  buildingType: string;
  businessType?: string;
  position: Vector3;
  width: number;
  depth: number;
  height: number;
  roomMesh: Mesh;
  furniture: Mesh[];
  doorPosition: Vector3;
  exitPosition: Vector3;
  /** Sub-room zones within this interior */
  rooms: RoomZone[];
  /** Number of floors */
  floorCount: number;
}

export interface FurnitureSpec {
  type: string;
  offsetX: number;
  offsetZ: number;
  width: number;
  height: number;
  depth: number;
  color: Color3;
  rotationY?: number;
}

/** Furniture types that are interactive containers */
const CONTAINER_TYPES = new Set(['chest', 'barrel', 'crate']);

/** Furniture types best represented by a cylinder rather than a box */
const CYLINDER_TYPES = new Set(['barrel', 'pillar', 'stool']);

/** Partition wall thickness */
const PARTITION_THICKNESS = 0.25;

/** Doorway dimensions in partition walls */
const PARTITION_DOOR_WIDTH = 2.0;
const PARTITION_DOOR_HEIGHT = 3.0;

/** Staircase dimensions */
const STAIR_WIDTH = 2.0;
const STAIR_STEP_COUNT = 10;

export class BuildingInteriorGenerator {
  private scene: Scene;
  private interiors: Map<string, InteriorLayout> = new Map();
  private nextSlotIndex: number = 0;
  private furnitureLoader: FurnitureModelLoader | null = null;
  private interiorConfigs: Record<string, InteriorTemplateConfig> = {};

  // When using a dedicated interior scene, interiors are placed at Y=0.
  // When sharing the overworld scene (legacy), they stack at Y=500+.
  private static readonly BASE_Y_OFFSET = 500;
  private static readonly SLOT_SPACING = 50;
  private useDedicatedScene = false;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /** Switch the target scene (used when interiors render in a separate scene). */
  public setTargetScene(scene: Scene, dedicated: boolean = false): void {
    this.scene = scene;
    this.useDedicatedScene = dedicated;
  }

  /** Set the furniture model loader for glTF-based furniture. */
  public setFurnitureLoader(loader: FurnitureModelLoader): void {
    this.furnitureLoader = loader;
  }

  /**
   * Set per-building-type interior configs from asset collection.
   * Keys are business types or building types (e.g., 'tavern', 'residence_large').
   */
  public setInteriorConfigs(configs: Record<string, InteriorTemplateConfig>): void {
    this.interiorConfigs = configs;
  }

  /**
   * Look up interior config for a building/business type.
   * Tries businessType first, then buildingType, then lowercased variants.
   */
  public getInteriorConfig(buildingType: string, businessType?: string): InteriorTemplateConfig | null {
    if (businessType && this.interiorConfigs[businessType]) {
      return this.interiorConfigs[businessType];
    }
    if (this.interiorConfigs[buildingType]) {
      return this.interiorConfigs[buildingType];
    }
    // Try lowercase
    const btLower = buildingType.toLowerCase();
    const bsLower = (businessType || '').toLowerCase();
    if (bsLower && this.interiorConfigs[bsLower]) {
      return this.interiorConfigs[bsLower];
    }
    if (this.interiorConfigs[btLower]) {
      return this.interiorConfigs[btLower];
    }
    return null;
  }

  /**
   * Generate an interior for a building. Returns the layout with entry/exit positions.
   * If an InteriorTemplateConfig is set for this building type, it will be used
   * to override dimensions, colors, room layout, and lighting.
   * If the config mode is 'model', the returned layout will have a `modelPath`
   * in its metadata for the caller to load via InteriorSceneManager.
   */
  public generateInterior(
    buildingId: string,
    buildingType: string,
    businessType?: string,
    overworldDoorPos?: Vector3
  ): InteriorLayout {
    // Return cached interior if already generated
    const existing = this.interiors.get(buildingId);
    if (existing) return existing;

    const config = this.getInteriorConfig(buildingType, businessType);

    // If config specifies 'model' mode, create a minimal layout with model path metadata
    if (config?.mode === 'model' && config.modelPath) {
      return this.createModelInteriorLayout(buildingId, buildingType, businessType, config, overworldDoorPos);
    }

    // Procedural mode: use config overrides or fall back to hardcoded defaults
    const dims = this.getConfiguredDimensions(buildingType, businessType, config);
    const floorCount = config?.floorCount ?? this.getFloorCount(buildingType, businessType);

    // Calculate position for this interior.
    let position: Vector3;
    if (this.useDedicatedScene) {
      position = new Vector3(0, 0, 0);
    } else {
      const slotsNeeded = floorCount > 1 ? 2 : 1;
      const slotY = BuildingInteriorGenerator.BASE_Y_OFFSET +
        this.nextSlotIndex * BuildingInteriorGenerator.SLOT_SPACING;
      position = new Vector3(0, slotY, 0);
      this.nextSlotIndex += slotsNeeded;
    }

    // Generate room zones from config template or hardcoded layout
    const rooms = config?.layoutTemplate
      ? this.generateRoomZonesFromTemplate(config.layoutTemplate, dims.width, dims.depth, dims.height)
      : this.generateRoomZones(buildingType, businessType, dims.width, dims.depth, dims.height, floorCount);

    // Build the room shell with configured colors
    const roomMesh = this.buildRoom(buildingId, position, dims.width, dims.depth, dims.height, buildingType, businessType, config);

    // Build partition walls between rooms
    this.buildPartitions(buildingId, position, rooms, dims.height, buildingType, businessType, config);

    // Build staircase if multi-floor
    const furniture: Mesh[] = [];
    if (floorCount > 1) {
      const stairMesh = this.buildStaircase(buildingId, position, dims.width, dims.depth, dims.height);
      if (stairMesh) furniture.push(stairMesh);
      this.buildUpperFloor(buildingId, position, dims.width, dims.depth, dims.height, buildingType, businessType, config);
    }

    // Generate furniture for each room zone
    const roomFurniture = this.generateMultiRoomFurniture(buildingId, position, rooms, dims.height, buildingType, businessType, config);
    furniture.push(...roomFurniture);

    // Apply lighting preset if configured
    if (config?.lighting) {
      this.applyLightingPreset(config.lighting);
    }

    // Door position (center of south wall, at floor level)
    const doorPosition = new Vector3(
      position.x,
      position.y + 1,
      position.z - dims.depth / 2 + 0.5
    );

    const exitPosition = overworldDoorPos
      ? overworldDoorPos.clone()
      : new Vector3(0, 0, 0);

    const layout: InteriorLayout = {
      id: `interior_${buildingId}`,
      buildingId,
      buildingType,
      businessType,
      position,
      width: dims.width,
      depth: dims.depth,
      height: dims.height,
      roomMesh,
      furniture,
      doorPosition,
      exitPosition,
      rooms,
      floorCount,
    };

    this.interiors.set(buildingId, layout);
    return layout;
  }

  /**
   * Create a layout for model-based interiors. The layout contains a modelPath
   * in metadata so the caller (BabylonGame) can delegate to InteriorSceneManager.
   */
  private createModelInteriorLayout(
    buildingId: string,
    buildingType: string,
    businessType: string | undefined,
    config: InteriorTemplateConfig,
    overworldDoorPos?: Vector3,
  ): InteriorLayout {
    const width = config.width ?? 10;
    const depth = config.depth ?? 10;
    const height = config.height ?? 4;

    let position: Vector3;
    if (this.useDedicatedScene) {
      position = new Vector3(0, 0, 0);
    } else {
      const slotY = BuildingInteriorGenerator.BASE_Y_OFFSET +
        this.nextSlotIndex * BuildingInteriorGenerator.SLOT_SPACING;
      position = new Vector3(0, slotY, 0);
      this.nextSlotIndex += 1;
    }

    // Create a minimal placeholder mesh (model loading is handled externally)
    const roomMesh = new Mesh(`interior_${buildingId}_model_placeholder`, this.scene);
    roomMesh.metadata = { modelPath: config.modelPath, interiorMode: 'model' };

    const doorPosition = new Vector3(position.x, position.y + 1, position.z - depth / 2 + 0.5);
    const exitPosition = overworldDoorPos ? overworldDoorPos.clone() : new Vector3(0, 0, 0);

    const layout: InteriorLayout = {
      id: `interior_${buildingId}`,
      buildingId,
      buildingType,
      businessType,
      position,
      width,
      depth,
      height,
      roomMesh,
      furniture: [],
      doorPosition,
      exitPosition,
      rooms: [],
      floorCount: 1,
    };

    this.interiors.set(buildingId, layout);
    return layout;
  }

  /**
   * Get dimensions from config or fall back to hardcoded defaults.
   */
  private getConfiguredDimensions(
    buildingType: string,
    businessType: string | undefined,
    config: InteriorTemplateConfig | null,
  ): { width: number; depth: number; height: number } {
    if (config?.layoutTemplate) {
      return {
        width: config.layoutTemplate.totalWidth,
        depth: config.layoutTemplate.totalDepth,
        height: config.layoutTemplate.totalHeight,
      };
    }
    const base = this.getRoomDimensions(buildingType, businessType);
    return {
      width: config?.width ?? base.width,
      depth: config?.depth ?? base.depth,
      height: config?.height ?? base.height,
    };
  }

  /**
   * Generate room zones from an InteriorLayoutTemplate.
   */
  private generateRoomZonesFromTemplate(
    template: InteriorLayoutTemplate,
    totalWidth: number,
    totalDepth: number,
    totalHeight: number,
  ): RoomZone[] {
    const rooms: RoomZone[] = [];

    for (const rt of template.rooms) {
      // Interpret relativeWidth/Depth: if <= 1, treat as fraction; if > 1, absolute
      const roomWidth = rt.relativeWidth <= 1 ? rt.relativeWidth * totalWidth : rt.relativeWidth;
      const roomDepth = rt.relativeDepth <= 1 ? rt.relativeDepth * totalDepth : rt.relativeDepth;
      const offsetY = rt.floor * totalHeight;

      // Auto-layout: stack rooms front-to-back on the same floor
      const sameFloorRooms = rooms.filter(r => r.floor === rt.floor);
      let offsetZ = 0;
      if (sameFloorRooms.length > 0) {
        // Place after existing rooms
        const lastRoom = sameFloorRooms[sameFloorRooms.length - 1];
        offsetZ = lastRoom.offsetZ + lastRoom.depth / 2 + roomDepth / 2;
      } else {
        offsetZ = -totalDepth / 2 + roomDepth / 2;
      }

      rooms.push({
        name: rt.name,
        function: rt.function,
        offsetX: 0,
        offsetZ,
        offsetY,
        width: roomWidth,
        depth: roomDepth,
        floor: rt.floor,
      });
    }

    return rooms;
  }

  /**
   * Apply lighting preset to the current scene.
   */
  private applyLightingPreset(lighting: import('@shared/game-engine/types').InteriorLightingPreset): void {
    const scene = this.scene;

    // Update hemispheric (ambient) light
    const ambient = scene.getLightByName?.('interior_ambient');
    if (ambient) {
      ambient.intensity = lighting.ambientIntensity;
      (ambient as any).diffuse = new Color3(lighting.ambientColor.r, lighting.ambientColor.g, lighting.ambientColor.b);
      if (lighting.groundColor) {
        (ambient as any).groundColor = new Color3(lighting.groundColor.r, lighting.groundColor.g, lighting.groundColor.b);
      }
    }

    // Update center point light
    const centerLight = scene.getLightByName?.('interior_center_light');
    if (centerLight) {
      centerLight.intensity = lighting.pointLightIntensity;
      (centerLight as any).diffuse = new Color3(lighting.pointLightColor.r, lighting.pointLightColor.g, lighting.pointLightColor.b);
      if (lighting.pointLightRange !== undefined) {
        (centerLight as any).range = lighting.pointLightRange;
      }
    }
  }

  /**
   * Get interior layout for a building if it exists.
   */
  public getInterior(buildingId: string): InteriorLayout | undefined {
    return this.interiors.get(buildingId);
  }

  /**
   * Get room dimensions based on building type.
   */
  private getRoomDimensions(
    buildingType: string,
    businessType?: string
  ): { width: number; depth: number; height: number } {
    const bt = (businessType || buildingType || '').toLowerCase();

    if (bt.includes('tavern') || bt.includes('inn') || bt.includes('bar')) {
      return { width: 18, depth: 16, height: 5 };
    } else if (bt.includes('shop') || bt.includes('store') || bt.includes('market')) {
      return { width: 14, depth: 14, height: 4.5 };
    } else if (bt.includes('blacksmith') || bt.includes('forge') || bt.includes('workshop')) {
      return { width: 16, depth: 14, height: 5 };
    } else if (bt.includes('temple') || bt.includes('church') || bt.includes('shrine')) {
      return { width: 20, depth: 24, height: 8 };
    } else if (bt.includes('guild') || bt.includes('hall') || bt.includes('office')) {
      return { width: 18, depth: 18, height: 5 };
    } else if (bt.includes('residence_large') || bt.includes('mansion')) {
      return { width: 16, depth: 16, height: 4.5 };
    } else if (bt.includes('residence_medium')) {
      return { width: 12, depth: 12, height: 4 };
    } else if (bt.includes('residence') || bt.includes('house') || bt.includes('home')) {
      return { width: 9, depth: 9, height: 3.5 };
    } else if (bt.includes('warehouse') || bt.includes('storage')) {
      return { width: 20, depth: 16, height: 6 };
    }

    // Default
    return { width: 10, depth: 10, height: 4 };
  }

  /**
   * Build the room shell: floor, 4 walls, ceiling.
   */
  private buildRoom(
    buildingId: string,
    position: Vector3,
    width: number,
    depth: number,
    height: number,
    buildingType: string,
    businessType?: string,
    config?: InteriorTemplateConfig | null,
  ): Mesh {
    const prefix = `interior_${buildingId}`;
    const parent = new Mesh(`${prefix}_room`, this.scene);
    parent.position = position;

    const colors = this.getConfiguredColors(buildingType, businessType, config);

    // Floor
    const floor = MeshBuilder.CreateGround(
      `${prefix}_floor`,
      { width, height: depth },
      this.scene
    );
    floor.parent = parent;
    floor.checkCollisions = true;
    const floorMat = new StandardMaterial(`${prefix}_floor_mat`, this.scene);
    floorMat.diffuseColor = colors.floor;
    floorMat.specularColor = new Color3(0.1, 0.1, 0.1);
    floor.material = floorMat;

    // Ceiling
    const ceiling = MeshBuilder.CreateGround(
      `${prefix}_ceiling`,
      { width, height: depth },
      this.scene
    );
    ceiling.position.y = height;
    ceiling.rotation.x = Math.PI;
    ceiling.parent = parent;
    const ceilingMat = new StandardMaterial(`${prefix}_ceiling_mat`, this.scene);
    ceilingMat.diffuseColor = colors.ceiling;
    ceiling.material = ceilingMat;
    ceiling.checkCollisions = true;

    // Walls
    const wallMat = new StandardMaterial(`${prefix}_wall_mat`, this.scene);
    wallMat.diffuseColor = colors.wall;
    wallMat.specularColor = new Color3(0.05, 0.05, 0.05);

    // Back wall (north)
    const backWall = MeshBuilder.CreatePlane(
      `${prefix}_wall_back`,
      { width, height },
      this.scene
    );
    backWall.position = new Vector3(0, height / 2, depth / 2);
    backWall.parent = parent;
    backWall.material = wallMat;
    backWall.checkCollisions = true;

    // Left wall (west)
    const leftWall = MeshBuilder.CreatePlane(
      `${prefix}_wall_left`,
      { width: depth, height },
      this.scene
    );
    leftWall.position = new Vector3(-width / 2, height / 2, 0);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.parent = parent;
    leftWall.material = wallMat;
    leftWall.checkCollisions = true;

    // Right wall (east)
    const rightWall = MeshBuilder.CreatePlane(
      `${prefix}_wall_right`,
      { width: depth, height },
      this.scene
    );
    rightWall.position = new Vector3(width / 2, height / 2, 0);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.parent = parent;
    rightWall.material = wallMat;
    rightWall.checkCollisions = true;

    // Front wall (south) — with door opening (two panels leaving a gap)
    const doorWidth = 2;
    const leftPanelWidth = (width - doorWidth) / 2;
    const rightPanelWidth = leftPanelWidth;

    // Left panel
    const frontLeft = MeshBuilder.CreatePlane(
      `${prefix}_wall_front_left`,
      { width: leftPanelWidth, height },
      this.scene
    );
    frontLeft.position = new Vector3(
      -(doorWidth / 2 + leftPanelWidth / 2),
      height / 2,
      -depth / 2
    );
    frontLeft.rotation.y = Math.PI;
    frontLeft.parent = parent;
    frontLeft.material = wallMat;
    frontLeft.checkCollisions = true;

    // Right panel
    const frontRight = MeshBuilder.CreatePlane(
      `${prefix}_wall_front_right`,
      { width: rightPanelWidth, height },
      this.scene
    );
    frontRight.position = new Vector3(
      doorWidth / 2 + rightPanelWidth / 2,
      height / 2,
      -depth / 2
    );
    frontRight.rotation.y = Math.PI;
    frontRight.parent = parent;
    frontRight.material = wallMat;
    frontRight.checkCollisions = true;

    // Door lintel (above door)
    const lintelHeight = height - 3;
    if (lintelHeight > 0) {
      const lintel = MeshBuilder.CreatePlane(
        `${prefix}_wall_front_lintel`,
        { width: doorWidth, height: lintelHeight },
        this.scene
      );
      lintel.position = new Vector3(
        0,
        3 + lintelHeight / 2,
        -depth / 2
      );
      lintel.rotation.y = Math.PI;
      lintel.parent = parent;
      lintel.material = wallMat;
    }

    // Door frame marker (clickable exit zone)
    const doorFrame = MeshBuilder.CreateBox(
      `${prefix}_exit_door`,
      { width: doorWidth, height: 3, depth: 0.3 },
      this.scene
    );
    doorFrame.position = new Vector3(0, 1.5, -depth / 2);
    doorFrame.parent = parent;
    const doorMat = new StandardMaterial(`${prefix}_door_mat`, this.scene);
    doorMat.diffuseColor = new Color3(0.45, 0.3, 0.15);
    doorMat.alpha = 0.7;
    doorFrame.material = doorMat;
    doorFrame.isPickable = true;
    doorFrame.metadata = {
      interiorExit: true,
      buildingId,
      interiorId: `interior_${buildingId}`
    };

    return parent;
  }

  /**
   * Determine how many floors a building should have.
   */
  private getFloorCount(buildingType: string, businessType?: string): number {
    const bt = (businessType || buildingType || '').toLowerCase();
    if (bt.includes('residence_large') || bt.includes('mansion')) return 2;
    if (bt.includes('residence_medium')) return 2;
    if (bt.includes('tavern') || bt.includes('inn')) return 2;
    if (bt.includes('shop') || bt.includes('store') || bt.includes('market')) return 2;
    if (bt.includes('guild') || bt.includes('hall')) return 2;
    // Single floor: small residences, temples, blacksmiths, warehouses
    return 1;
  }

  /**
   * Generate room zones for a multi-room interior layout.
   */
  private generateRoomZones(
    buildingType: string,
    businessType: string | undefined,
    width: number,
    depth: number,
    height: number,
    floorCount: number,
  ): RoomZone[] {
    const bt = (businessType || buildingType || '').toLowerCase();
    const rooms: RoomZone[] = [];

    // Partition depth: front room gets 60%, back room gets 40%
    const frontDepth = depth * 0.6;
    const backDepth = depth * 0.4;
    const frontCenterZ = -depth / 2 + frontDepth / 2;
    const backCenterZ = depth / 2 - backDepth / 2;

    if (bt.includes('residence_large') || bt.includes('mansion') || bt.includes('residence_medium')) {
      // Ground floor: living room (front) + kitchen (back)
      rooms.push({
        name: 'living_room', function: 'living',
        offsetX: 0, offsetZ: frontCenterZ, offsetY: 0,
        width, depth: frontDepth, floor: 0,
      });
      rooms.push({
        name: 'kitchen', function: 'kitchen',
        offsetX: 0, offsetZ: backCenterZ, offsetY: 0,
        width, depth: backDepth, floor: 0,
      });
      if (floorCount > 1) {
        // Upstairs: bedroom(s)
        rooms.push({
          name: 'bedroom', function: 'bedroom',
          offsetX: -width / 4, offsetZ: 0, offsetY: height,
          width: width / 2, depth, floor: 1,
        });
        rooms.push({
          name: 'bedroom2', function: 'bedroom',
          offsetX: width / 4, offsetZ: 0, offsetY: height,
          width: width / 2, depth, floor: 1,
        });
      }
    } else if (bt.includes('residence') || bt.includes('house') || bt.includes('home')) {
      // Small residence: single floor, living area + kitchen nook
      rooms.push({
        name: 'living_room', function: 'living',
        offsetX: 0, offsetZ: frontCenterZ, offsetY: 0,
        width, depth: frontDepth, floor: 0,
      });
      rooms.push({
        name: 'kitchen', function: 'kitchen',
        offsetX: 0, offsetZ: backCenterZ, offsetY: 0,
        width, depth: backDepth, floor: 0,
      });
    } else if (bt.includes('shop') || bt.includes('store') || bt.includes('market')) {
      // Ground floor: shop area (front) + storage (back)
      rooms.push({
        name: 'shop_floor', function: 'shop',
        offsetX: 0, offsetZ: frontCenterZ, offsetY: 0,
        width, depth: frontDepth, floor: 0,
      });
      rooms.push({
        name: 'storage', function: 'storage',
        offsetX: 0, offsetZ: backCenterZ, offsetY: 0,
        width, depth: backDepth, floor: 0,
      });
      if (floorCount > 1) {
        // Upstairs: living quarters
        rooms.push({
          name: 'living_quarters', function: 'living',
          offsetX: 0, offsetZ: 0, offsetY: height,
          width, depth, floor: 1,
        });
      }
    } else if (bt.includes('tavern') || bt.includes('inn') || bt.includes('bar')) {
      // Ground floor: common room (front) + kitchen/bar back (back)
      rooms.push({
        name: 'common_room', function: 'tavern_main',
        offsetX: 0, offsetZ: frontCenterZ, offsetY: 0,
        width, depth: frontDepth, floor: 0,
      });
      rooms.push({
        name: 'kitchen', function: 'tavern_kitchen',
        offsetX: 0, offsetZ: backCenterZ, offsetY: 0,
        width, depth: backDepth, floor: 0,
      });
      if (floorCount > 1) {
        // Upstairs: guest rooms
        rooms.push({
          name: 'guest_room1', function: 'bedroom',
          offsetX: -width / 4, offsetZ: 0, offsetY: height,
          width: width / 2, depth, floor: 1,
        });
        rooms.push({
          name: 'guest_room2', function: 'bedroom',
          offsetX: width / 4, offsetZ: 0, offsetY: height,
          width: width / 2, depth, floor: 1,
        });
      }
    } else if (bt.includes('guild') || bt.includes('hall') || bt.includes('office')) {
      rooms.push({
        name: 'main_hall', function: 'guild_main',
        offsetX: 0, offsetZ: frontCenterZ, offsetY: 0,
        width, depth: frontDepth, floor: 0,
      });
      rooms.push({
        name: 'office', function: 'office',
        offsetX: 0, offsetZ: backCenterZ, offsetY: 0,
        width, depth: backDepth, floor: 0,
      });
      if (floorCount > 1) {
        rooms.push({
          name: 'library', function: 'library',
          offsetX: 0, offsetZ: 0, offsetY: height,
          width, depth, floor: 1,
        });
      }
    } else if (bt.includes('blacksmith') || bt.includes('forge') || bt.includes('workshop')) {
      rooms.push({
        name: 'workshop', function: 'workshop',
        offsetX: 0, offsetZ: frontCenterZ, offsetY: 0,
        width, depth: frontDepth, floor: 0,
      });
      rooms.push({
        name: 'storage', function: 'storage',
        offsetX: 0, offsetZ: backCenterZ, offsetY: 0,
        width, depth: backDepth, floor: 0,
      });
    } else if (bt.includes('temple') || bt.includes('church') || bt.includes('shrine')) {
      // Temples are a single large nave — no partition
      rooms.push({
        name: 'nave', function: 'temple',
        offsetX: 0, offsetZ: 0, offsetY: 0,
        width, depth, floor: 0,
      });
    } else if (bt.includes('warehouse') || bt.includes('storage')) {
      rooms.push({
        name: 'main_storage', function: 'warehouse',
        offsetX: 0, offsetZ: 0, offsetY: 0,
        width, depth, floor: 0,
      });
    } else {
      // Default: single room
      rooms.push({
        name: 'main', function: 'general',
        offsetX: 0, offsetZ: 0, offsetY: 0,
        width, depth, floor: 0,
      });
    }

    return rooms;
  }

  /**
   * Build partition walls between room zones with doorway cutouts.
   */
  private buildPartitions(
    buildingId: string,
    position: Vector3,
    rooms: RoomZone[],
    height: number,
    buildingType: string,
    businessType?: string,
    config?: InteriorTemplateConfig | null,
  ): void {
    const prefix = `interior_${buildingId}`;
    const colors = this.getConfiguredColors(buildingType, businessType, config);
    const wallMat = new StandardMaterial(`${prefix}_partition_mat`, this.scene);
    wallMat.diffuseColor = colors.wall;
    wallMat.specularColor = new Color3(0.05, 0.05, 0.05);

    // Find ground floor rooms — if there are exactly 2 on floor 0, build a partition
    const groundRooms = rooms.filter(r => r.floor === 0);
    if (groundRooms.length === 2) {
      const front = groundRooms[0];
      const back = groundRooms[1];
      // Partition runs along Z boundary between front and back rooms
      const partitionZ = front.offsetZ + front.depth / 2;
      const totalWidth = Math.max(front.width, back.width);

      this.buildPartitionWall(
        prefix, position, totalWidth, height, partitionZ, 'z', wallMat
      );
    }

    // Build partition between upstairs rooms if there are 2 on floor 1
    const upperRooms = rooms.filter(r => r.floor === 1);
    if (upperRooms.length === 2) {
      // Vertical partition along X center dividing left/right rooms
      const partitionX = (upperRooms[0].offsetX + upperRooms[0].width / 2 +
                          upperRooms[1].offsetX - upperRooms[1].width / 2) / 2;
      const totalDepth = Math.max(upperRooms[0].depth, upperRooms[1].depth);

      this.buildPartitionWall(
        prefix, new Vector3(position.x, position.y + height, position.z),
        totalDepth, height, partitionX, 'x', wallMat
      );
    }
  }

  /**
   * Build a single partition wall with a doorway cutout.
   * @param axis 'z' for east-west wall (spans width), 'x' for north-south wall (spans depth)
   */
  private buildPartitionWall(
    prefix: string,
    position: Vector3,
    span: number,
    height: number,
    offset: number,
    axis: 'x' | 'z',
    material: StandardMaterial,
  ): void {
    const leftPanelWidth = (span - PARTITION_DOOR_WIDTH) / 2;
    const rightPanelWidth = leftPanelWidth;

    if (axis === 'z') {
      // Wall runs east-west at Z=offset
      // Left panel
      const left = MeshBuilder.CreateBox(
        `${prefix}_partition_left`, {
          width: leftPanelWidth,
          height,
          depth: PARTITION_THICKNESS,
        }, this.scene
      );
      left.position = new Vector3(
        position.x - (PARTITION_DOOR_WIDTH / 2 + leftPanelWidth / 2),
        position.y + height / 2,
        position.z + offset,
      );
      left.material = material;
      left.checkCollisions = true;

      // Right panel
      const right = MeshBuilder.CreateBox(
        `${prefix}_partition_right`, {
          width: rightPanelWidth,
          height,
          depth: PARTITION_THICKNESS,
        }, this.scene
      );
      right.position = new Vector3(
        position.x + (PARTITION_DOOR_WIDTH / 2 + rightPanelWidth / 2),
        position.y + height / 2,
        position.z + offset,
      );
      right.material = material;
      right.checkCollisions = true;

      // Lintel above door
      const lintelH = height - PARTITION_DOOR_HEIGHT;
      if (lintelH > 0) {
        const lintel = MeshBuilder.CreateBox(
          `${prefix}_partition_lintel`, {
            width: PARTITION_DOOR_WIDTH,
            height: lintelH,
            depth: PARTITION_THICKNESS,
          }, this.scene
        );
        lintel.position = new Vector3(
          position.x,
          position.y + PARTITION_DOOR_HEIGHT + lintelH / 2,
          position.z + offset,
        );
        lintel.material = material;
        lintel.checkCollisions = true;
      }
    } else {
      // Wall runs north-south at X=offset
      const left = MeshBuilder.CreateBox(
        `${prefix}_partition_x_left`, {
          width: PARTITION_THICKNESS,
          height,
          depth: leftPanelWidth,
        }, this.scene
      );
      left.position = new Vector3(
        position.x + offset,
        position.y + height / 2,
        position.z - (PARTITION_DOOR_WIDTH / 2 + leftPanelWidth / 2),
      );
      left.material = material;
      left.checkCollisions = true;

      const right = MeshBuilder.CreateBox(
        `${prefix}_partition_x_right`, {
          width: PARTITION_THICKNESS,
          height,
          depth: rightPanelWidth,
        }, this.scene
      );
      right.position = new Vector3(
        position.x + offset,
        position.y + height / 2,
        position.z + (PARTITION_DOOR_WIDTH / 2 + rightPanelWidth / 2),
      );
      right.material = material;
      right.checkCollisions = true;

      const lintelH = height - PARTITION_DOOR_HEIGHT;
      if (lintelH > 0) {
        const lintel = MeshBuilder.CreateBox(
          `${prefix}_partition_x_lintel`, {
            width: PARTITION_THICKNESS,
            height: lintelH,
            depth: PARTITION_DOOR_WIDTH,
          }, this.scene
        );
        lintel.position = new Vector3(
          position.x + offset,
          position.y + PARTITION_DOOR_HEIGHT + lintelH / 2,
          position.z,
        );
        lintel.material = material;
        lintel.checkCollisions = true;
      }
    }
  }

  /**
   * Build a staircase connecting ground floor to upper floor.
   * Placed against the east wall to minimize obstruction.
   */
  private buildStaircase(
    buildingId: string,
    position: Vector3,
    width: number,
    _depth: number,
    height: number,
  ): Mesh | null {
    const prefix = `interior_${buildingId}`;
    const parent = new Mesh(`${prefix}_staircase`, this.scene);

    const stairMat = new StandardMaterial(`${prefix}_stair_mat`, this.scene);
    stairMat.diffuseColor = new Color3(0.4, 0.3, 0.18);
    stairMat.specularColor = new Color3(0.05, 0.05, 0.05);

    const stepHeight = height / STAIR_STEP_COUNT;
    const stepDepth = (height * 0.8) / STAIR_STEP_COUNT; // stairs span 80% of height horizontally

    for (let i = 0; i < STAIR_STEP_COUNT; i++) {
      const step = MeshBuilder.CreateBox(
        `${prefix}_step_${i}`,
        { width: STAIR_WIDTH, height: stepHeight, depth: stepDepth },
        this.scene,
      );
      step.position = new Vector3(
        position.x + width / 2 - STAIR_WIDTH / 2 - 0.5,
        position.y + stepHeight * (i + 0.5),
        position.z - (STAIR_STEP_COUNT / 2 - i) * stepDepth,
      );
      step.material = stairMat;
      step.checkCollisions = true;
      step.parent = parent;
    }

    // Stair railing (thin box along the open side)
    const railingHeight = 1.0;
    const railingLength = Math.sqrt(height * height + (STAIR_STEP_COUNT * stepDepth) * (STAIR_STEP_COUNT * stepDepth));
    const railing = MeshBuilder.CreateBox(
      `${prefix}_railing`,
      { width: 0.08, height: railingHeight, depth: railingLength * 0.6 },
      this.scene,
    );
    railing.position = new Vector3(
      position.x + width / 2 - STAIR_WIDTH - 0.5,
      position.y + height / 2 + railingHeight / 2,
      position.z,
    );
    railing.material = stairMat;
    railing.checkCollisions = true;
    railing.parent = parent;

    return parent;
  }

  /**
   * Build the upper floor platform, ceiling, and walls for a multi-story building.
   */
  private buildUpperFloor(
    buildingId: string,
    position: Vector3,
    width: number,
    depth: number,
    height: number,
    buildingType: string,
    businessType?: string,
    config?: InteriorTemplateConfig | null,
  ): void {
    const prefix = `interior_${buildingId}`;
    const colors = this.getConfiguredColors(buildingType, businessType, config);

    const floorMat = new StandardMaterial(`${prefix}_upper_floor_mat`, this.scene);
    floorMat.diffuseColor = colors.floor;
    floorMat.specularColor = new Color3(0.1, 0.1, 0.1);

    // Upper floor (with stairwell hole near east wall)
    const stairwellWidth = STAIR_WIDTH + 1.0;
    const stairwellDepth = (height * 0.8) + 1.0;
    const floorWithoutStairwell = width - stairwellWidth;

    // Main floor section (west side, full depth)
    const mainFloor = MeshBuilder.CreateGround(
      `${prefix}_upper_floor_main`,
      { width: floorWithoutStairwell, height: depth },
      this.scene,
    );
    mainFloor.position = new Vector3(
      position.x - stairwellWidth / 2,
      position.y + height,
      position.z,
    );
    mainFloor.material = floorMat;
    mainFloor.checkCollisions = true;

    // Small floor strip north of stairwell
    const stripDepth = (depth - stairwellDepth) / 2;
    if (stripDepth > 0.5) {
      const northStrip = MeshBuilder.CreateGround(
        `${prefix}_upper_floor_north`,
        { width: stairwellWidth, height: stripDepth },
        this.scene,
      );
      northStrip.position = new Vector3(
        position.x + (width - stairwellWidth) / 2,
        position.y + height,
        position.z + (depth - stripDepth) / 2,
      );
      northStrip.material = floorMat;
      northStrip.checkCollisions = true;

      const southStrip = MeshBuilder.CreateGround(
        `${prefix}_upper_floor_south`,
        { width: stairwellWidth, height: stripDepth },
        this.scene,
      );
      southStrip.position = new Vector3(
        position.x + (width - stairwellWidth) / 2,
        position.y + height,
        position.z - (depth - stripDepth) / 2,
      );
      southStrip.material = floorMat;
      southStrip.checkCollisions = true;
    }

    // Upper ceiling
    const ceilingMat = new StandardMaterial(`${prefix}_upper_ceiling_mat`, this.scene);
    ceilingMat.diffuseColor = colors.ceiling;

    const upperCeiling = MeshBuilder.CreateGround(
      `${prefix}_upper_ceiling`,
      { width, height: depth },
      this.scene,
    );
    upperCeiling.position = new Vector3(
      position.x,
      position.y + height * 2,
      position.z,
    );
    upperCeiling.rotation.x = Math.PI;
    upperCeiling.material = ceilingMat;
    upperCeiling.checkCollisions = true;

    // Extend outer walls up for the upper floor
    const wallMat = new StandardMaterial(`${prefix}_upper_wall_mat`, this.scene);
    wallMat.diffuseColor = colors.wall;
    wallMat.specularColor = new Color3(0.05, 0.05, 0.05);

    const upperWalls = [
      { name: 'back', pos: new Vector3(0, height + height / 2, depth / 2), w: width, h: height },
      { name: 'left', pos: new Vector3(-width / 2, height + height / 2, 0), w: depth, h: height, rotY: Math.PI / 2 },
      { name: 'right', pos: new Vector3(width / 2, height + height / 2, 0), w: depth, h: height, rotY: -Math.PI / 2 },
      { name: 'front', pos: new Vector3(0, height + height / 2, -depth / 2), w: width, h: height, rotY: Math.PI },
    ];

    for (const w of upperWalls) {
      const wall = MeshBuilder.CreatePlane(
        `${prefix}_upper_wall_${w.name}`,
        { width: w.w, height: w.h },
        this.scene,
      );
      wall.position = new Vector3(
        position.x + w.pos.x,
        position.y + w.pos.y,
        position.z + w.pos.z,
      );
      if (w.rotY) wall.rotation.y = w.rotY;
      wall.material = wallMat;
      wall.checkCollisions = true;
    }
  }

  /**
   * Generate furniture for all room zones in the multi-room layout.
   */
  private generateMultiRoomFurniture(
    buildingId: string,
    position: Vector3,
    rooms: RoomZone[],
    height: number,
    buildingType: string,
    businessType?: string,
    config?: InteriorTemplateConfig | null,
  ): Mesh[] {
    const allFurniture: Mesh[] = [];
    const prefix = `interior_${buildingId}`;

    // Resolve furniture set template if configured
    const furnitureTemplate = this.resolveFurnitureTemplate(config);

    for (const room of rooms) {
      const specs = furnitureTemplate
        ? this.getFurnitureFromTemplate(furnitureTemplate, room)
        : this.getFurnitureForRoom(room);
      const roomPos = new Vector3(
        position.x + room.offsetX,
        position.y + room.offsetY,
        position.z + room.offsetZ,
      );

      for (let i = 0; i < specs.length; i++) {
        const spec = specs[i];
        const meshName = `${prefix}_${room.name}_furn_${i}_${spec.type}`;
        const mesh = this.createFurnitureMesh(meshName, spec);
        mesh.position = new Vector3(
          roomPos.x + spec.offsetX,
          roomPos.y + spec.height / 2,
          roomPos.z + spec.offsetZ,
        );
        if (spec.rotationY) {
          mesh.rotation.y = spec.rotationY;
        }
        if (mesh.metadata?.isContainer) {
          mesh.metadata.buildingId = buildingId;
          mesh.metadata.businessType = businessType;
          mesh.metadata.containerId = `${prefix}_${room.name}_container_${i}`;
          mesh.metadata.roomName = room.name;
        }
        allFurniture.push(mesh);
      }
    }

    return allFurniture;
  }

  /**
   * Get furniture specs for a specific room based on its function.
   */
  private getFurnitureForRoom(room: RoomZone): FurnitureSpec[] {
    const w = room.width;
    const d = room.depth;

    switch (room.function) {
      case 'living': return this.getLivingRoomFurniture(w, d);
      case 'kitchen': return this.getKitchenFurniture(w, d);
      case 'bedroom': return this.getBedroomFurniture(w, d);
      case 'shop': return this.getShopFloorFurniture(w, d);
      case 'storage': return this.getStorageRoomFurniture(w, d);
      case 'office': return this.getOfficeFurniture(w, d);
      case 'library': return this.getLibraryFurniture(w, d);
      case 'tavern_main': return this.getTavernMainFurniture(w, d);
      case 'tavern_kitchen': return this.getTavernKitchenFurniture(w, d);
      case 'guild_main': return this.getGuildMainFurniture(w, d);
      case 'workshop': return this.getWorkshopRoomFurniture(w, d);
      case 'temple': return this.getTempleFurniture(w, d);
      case 'warehouse': return this.getWarehouseFurniture(w, d);
      default: return this.getLivingRoomFurniture(w, d);
    }
  }

  /**
   * Resolve a furniture template from config's furnitureSet field.
   * Returns the matching InteriorLayoutTemplate or undefined if none found.
   */
  private resolveFurnitureTemplate(
    config?: InteriorTemplateConfig | null,
  ): FurnitureLayoutTemplate | undefined {
    if (!config?.furnitureSet) return undefined;
    return INTERIOR_LAYOUT_TEMPLATES.find(
      t => t.id === config.furnitureSet || t.buildingType === config.furnitureSet,
    );
  }

  /**
   * Get furniture specs for a room from a furniture set template.
   * Converts FurnitureEntry (fractional offsets) to FurnitureSpec (absolute offsets).
   */
  private getFurnitureFromTemplate(
    template: FurnitureLayoutTemplate,
    room: RoomZone,
  ): FurnitureSpec[] {
    let entries = getFurnitureSetForRoom(template, room.function);
    // Fall back to the first furniture set in the template if no match for this room function
    if (entries.length === 0 && template.furnitureSets.length > 0) {
      entries = template.furnitureSets[0].furniture;
    }
    // If still nothing, fall back to hardcoded furniture
    if (entries.length === 0) {
      return this.getFurnitureForRoom(room);
    }
    return entries.map(entry => this.convertFurnitureEntry(entry, room));
  }

  /**
   * Convert a FurnitureEntry (template data with fractional offsets) to a FurnitureSpec
   * (absolute offsets used by the mesh generator).
   */
  private convertFurnitureEntry(entry: FurnitureEntry, room: RoomZone): FurnitureSpec {
    return {
      type: entry.type,
      offsetX: entry.offsetXFraction * room.width,
      offsetZ: entry.offsetZFraction * room.depth,
      width: entry.width,
      height: entry.height,
      depth: entry.depth,
      color: new Color3(entry.color.r, entry.color.g, entry.color.b),
      rotationY: entry.rotationY,
    };
  }

  /**
   * Get room colors using config overrides if available, otherwise hardcoded defaults.
   */
  private getConfiguredColors(
    buildingType: string,
    businessType: string | undefined,
    config?: InteriorTemplateConfig | null,
  ): { floor: Color3; wall: Color3; ceiling: Color3 } {
    const base = this.getRoomColors(buildingType, businessType);
    if (!config) return base;
    return {
      floor: config.floorColor
        ? new Color3(config.floorColor.r, config.floorColor.g, config.floorColor.b)
        : base.floor,
      wall: config.wallColor
        ? new Color3(config.wallColor.r, config.wallColor.g, config.wallColor.b)
        : base.wall,
      ceiling: config.ceilingColor
        ? new Color3(config.ceilingColor.r, config.ceilingColor.g, config.ceilingColor.b)
        : base.ceiling,
    };
  }

  /**
   * Get room color palette based on building type.
   */
  private getRoomColors(
    buildingType: string,
    businessType?: string
  ): { floor: Color3; wall: Color3; ceiling: Color3 } {
    const bt = (businessType || buildingType || '').toLowerCase();

    if (bt.includes('tavern') || bt.includes('inn') || bt.includes('bar')) {
      return {
        floor: new Color3(0.35, 0.22, 0.12),
        wall: new Color3(0.5, 0.35, 0.2),
        ceiling: new Color3(0.3, 0.2, 0.12)
      };
    } else if (bt.includes('shop') || bt.includes('store') || bt.includes('market')) {
      return {
        floor: new Color3(0.45, 0.4, 0.35),
        wall: new Color3(0.65, 0.6, 0.5),
        ceiling: new Color3(0.55, 0.5, 0.45)
      };
    } else if (bt.includes('blacksmith') || bt.includes('forge')) {
      return {
        floor: new Color3(0.25, 0.22, 0.2),
        wall: new Color3(0.35, 0.3, 0.25),
        ceiling: new Color3(0.2, 0.18, 0.15)
      };
    } else if (bt.includes('temple') || bt.includes('church')) {
      return {
        floor: new Color3(0.55, 0.52, 0.48),
        wall: new Color3(0.7, 0.68, 0.62),
        ceiling: new Color3(0.6, 0.58, 0.55)
      };
    } else if (bt.includes('guild') || bt.includes('hall')) {
      return {
        floor: new Color3(0.4, 0.32, 0.22),
        wall: new Color3(0.55, 0.45, 0.35),
        ceiling: new Color3(0.45, 0.38, 0.3)
      };
    } else if (bt.includes('residence')) {
      return {
        floor: new Color3(0.42, 0.35, 0.25),
        wall: new Color3(0.6, 0.55, 0.48),
        ceiling: new Color3(0.55, 0.5, 0.45)
      };
    } else if (bt.includes('warehouse') || bt.includes('storage')) {
      return {
        floor: new Color3(0.3, 0.3, 0.3),
        wall: new Color3(0.4, 0.38, 0.35),
        ceiling: new Color3(0.35, 0.33, 0.3)
      };
    }

    // Default
    return {
      floor: new Color3(0.4, 0.35, 0.3),
      wall: new Color3(0.55, 0.5, 0.45),
      ceiling: new Color3(0.5, 0.45, 0.4)
    };
  }

  // (furniture generation handled by generateMultiRoomFurniture + getFurnitureForRoom)

  /**
   * Create a single furniture mesh from spec.
   * Tries to use a glTF model from the furniture loader first,
   * then falls back to procedural geometry (cylinders for round objects, boxes otherwise).
   */
  private createFurnitureMesh(name: string, spec: FurnitureSpec): Mesh {
    // Try glTF model first
    const modelMesh = this.tryCreateFromModel(name, spec);
    if (modelMesh) {
      this.applyFurnitureProperties(modelMesh, spec);
      return modelMesh;
    }

    // Procedural fallback with shape-appropriate geometry
    const mesh = this.createProceduralFurniture(name, spec);
    this.applyFurnitureProperties(mesh, spec);
    return mesh;
  }

  /** Attempt to clone a glTF model for the furniture type. */
  private tryCreateFromModel(name: string, spec: FurnitureSpec): Mesh | null {
    // In dedicated scene mode, furniture model templates live in the overworld
    // scene. Cloning them would place geometry in the wrong scene. Use
    // procedural fallback instead until templates are migrated.
    if (this.useDedicatedScene) return null;
    if (!this.furnitureLoader) return null;
    return this.furnitureLoader.cloneForFurniture(
      spec.type, name, spec.width, spec.height, spec.depth,
    );
  }

  /** Create procedural geometry matching the furniture shape. */
  private createProceduralFurniture(name: string, spec: FurnitureSpec): Mesh {
    let mesh: Mesh;

    if (CYLINDER_TYPES.has(spec.type)) {
      // Cylinders for barrels, pillars, stools
      const diameter = Math.min(spec.width, spec.depth);
      mesh = MeshBuilder.CreateCylinder(
        name,
        { diameter, height: spec.height, tessellation: 16 },
        this.scene,
      );
    } else if (spec.type === 'forge') {
      // Forge: truncated cone with emissive glow
      mesh = MeshBuilder.CreateCylinder(
        name,
        {
          diameterTop: Math.min(spec.width, spec.depth) * 0.7,
          diameterBottom: Math.min(spec.width, spec.depth),
          height: spec.height,
          tessellation: 12,
        },
        this.scene,
      );
      const mat = new StandardMaterial(`${name}_mat`, this.scene);
      mat.diffuseColor = spec.color;
      mat.emissiveColor = new Color3(0.4, 0.1, 0.02);
      mat.specularColor = new Color3(0.1, 0.05, 0.02);
      mesh.material = mat;
      return mesh;
    } else if (spec.type === 'anvil') {
      // Anvil: a T-shape built from two merged boxes
      const base = MeshBuilder.CreateBox(
        `${name}_base`,
        { width: spec.width, height: spec.height * 0.5, depth: spec.depth },
        this.scene,
      );
      const top = MeshBuilder.CreateBox(
        `${name}_top`,
        { width: spec.width * 1.3, height: spec.height * 0.5, depth: spec.depth * 0.6 },
        this.scene,
      );
      top.position.y = spec.height * 0.5;
      mesh = Mesh.MergeMeshes([base, top], true, true, undefined, false, true) as Mesh;
      mesh.name = name;
    } else if (spec.type === 'altar') {
      // Altar: stepped platform
      const base = MeshBuilder.CreateBox(
        `${name}_base`,
        { width: spec.width, height: spec.height * 0.4, depth: spec.depth },
        this.scene,
      );
      const top = MeshBuilder.CreateBox(
        `${name}_top`,
        { width: spec.width * 0.7, height: spec.height * 0.6, depth: spec.depth * 0.7 },
        this.scene,
      );
      top.position.y = spec.height * 0.5;
      mesh = Mesh.MergeMeshes([base, top], true, true, undefined, false, true) as Mesh;
      mesh.name = name;
    } else if (spec.type === 'pew') {
      // Pew: bench seat with a backrest
      const seat = MeshBuilder.CreateBox(
        `${name}_seat`,
        { width: spec.width, height: spec.height * 0.4, depth: spec.depth },
        this.scene,
      );
      const back = MeshBuilder.CreateBox(
        `${name}_back`,
        { width: spec.width, height: spec.height * 0.6, depth: spec.depth * 0.15 },
        this.scene,
      );
      back.position.y = spec.height * 0.5;
      back.position.z = -spec.depth * 0.4;
      mesh = Mesh.MergeMeshes([seat, back], true, true, undefined, false, true) as Mesh;
      mesh.name = name;
    } else if (spec.type === 'bed') {
      // Bed: mattress slab with headboard
      const mattress = MeshBuilder.CreateBox(
        `${name}_mattress`,
        { width: spec.width, height: spec.height * 0.5, depth: spec.depth },
        this.scene,
      );
      const headboard = MeshBuilder.CreateBox(
        `${name}_headboard`,
        { width: spec.width, height: spec.height * 0.8, depth: spec.depth * 0.08 },
        this.scene,
      );
      headboard.position.y = spec.height * 0.3;
      headboard.position.z = spec.depth * 0.46;
      mesh = Mesh.MergeMeshes([mattress, headboard], true, true, undefined, false, true) as Mesh;
      mesh.name = name;
    } else if (spec.type === 'chair') {
      // Chair: seat + backrest
      const seat = MeshBuilder.CreateBox(
        `${name}_seat`,
        { width: spec.width, height: spec.height * 0.45, depth: spec.depth },
        this.scene,
      );
      const back = MeshBuilder.CreateBox(
        `${name}_back`,
        { width: spec.width, height: spec.height * 0.55, depth: spec.depth * 0.15 },
        this.scene,
      );
      back.position.y = spec.height * 0.5;
      back.position.z = -spec.depth * 0.42;
      mesh = Mesh.MergeMeshes([seat, back], true, true, undefined, false, true) as Mesh;
      mesh.name = name;
    } else if (spec.type === 'workbench' || spec.type === 'counter') {
      // Workbench/counter: thick top slab on a slightly recessed base
      const top = MeshBuilder.CreateBox(
        `${name}_top`,
        { width: spec.width, height: spec.height * 0.2, depth: spec.depth },
        this.scene,
      );
      top.position.y = spec.height * 0.4;
      const base = MeshBuilder.CreateBox(
        `${name}_base`,
        { width: spec.width * 0.9, height: spec.height * 0.8, depth: spec.depth * 0.9 },
        this.scene,
      );
      mesh = Mesh.MergeMeshes([base, top], true, true, undefined, false, true) as Mesh;
      mesh.name = name;
    } else {
      // Default box for any other type
      mesh = MeshBuilder.CreateBox(
        name,
        { width: spec.width, height: spec.height, depth: spec.depth },
        this.scene,
      );
    }

    // Apply material
    const mat = new StandardMaterial(`${name}_mat`, this.scene);
    mat.diffuseColor = spec.color;
    mat.specularColor = new Color3(0.05, 0.05, 0.05);
    mesh.material = mat;
    return mesh;
  }

  /** Apply collision and interactivity properties to a furniture mesh. */
  private applyFurnitureProperties(mesh: Mesh, spec: FurnitureSpec): void {
    mesh.checkCollisions = true;

    // Tag container-type furniture as interactive
    if (CONTAINER_TYPES.has(spec.type)) {
      mesh.isPickable = true;
      mesh.metadata = {
        isContainer: true,
        containerType: spec.type,
      };
      // Propagate to child meshes (for glTF hierarchies)
      mesh.getChildMeshes().forEach((child) => {
        child.isPickable = true;
        child.metadata = {
          ...(child.metadata || {}),
          isContainer: true,
          containerType: spec.type,
        };
      });
    } else {
      mesh.isPickable = false;
    }
  }

  // ── Room-function-based furniture layouts ──

  private getLivingRoomFurniture(w: number, d: number): FurnitureSpec[] {
    const specs: FurnitureSpec[] = [];
    const wood = new Color3(0.45, 0.35, 0.25);

    // Sofa/bench along back wall
    specs.push({
      type: 'bench', offsetX: 0, offsetZ: d / 2 - 1,
      width: w * 0.4, height: 0.7, depth: 1.0, color: new Color3(0.5, 0.35, 0.25)
    });

    // Coffee table in center
    specs.push({
      type: 'table', offsetX: 0, offsetZ: 0,
      width: 1.5, height: 0.5, depth: 1.0, color: wood
    });

    // Chairs flanking the table
    specs.push({
      type: 'chair', offsetX: -w * 0.2, offsetZ: 0,
      width: 0.5, height: 0.9, depth: 0.5, color: wood
    });
    specs.push({
      type: 'chair', offsetX: w * 0.2, offsetZ: 0,
      width: 0.5, height: 0.9, depth: 0.5, color: wood
    });

    // Bookshelf on side wall
    specs.push({
      type: 'bookshelf', offsetX: -w / 2 + 0.5, offsetZ: d * 0.1,
      width: 0.6, height: 2.2, depth: 1.5, color: new Color3(0.35, 0.25, 0.15)
    });

    // Chest in corner
    specs.push({
      type: 'chest', offsetX: w / 2 - 0.8, offsetZ: d / 2 - 0.8,
      width: 1.0, height: 0.6, depth: 0.7, color: new Color3(0.4, 0.3, 0.15)
    });

    return specs;
  }

  private getKitchenFurniture(w: number, d: number): FurnitureSpec[] {
    const specs: FurnitureSpec[] = [];
    const wood = new Color3(0.45, 0.35, 0.25);
    const metal = new Color3(0.35, 0.35, 0.38);

    // Stove/hearth against back wall
    specs.push({
      type: 'forge', offsetX: 0, offsetZ: d / 2 - 1,
      width: 1.5, height: 1.0, depth: 1.0, color: new Color3(0.5, 0.2, 0.1)
    });

    // Kitchen table
    specs.push({
      type: 'table', offsetX: 0, offsetZ: -d * 0.15,
      width: 2.0, height: 0.85, depth: 1.2, color: wood
    });

    // Chairs around table
    specs.push({
      type: 'chair', offsetX: -1.2, offsetZ: -d * 0.15,
      width: 0.5, height: 0.9, depth: 0.5, color: wood
    });
    specs.push({
      type: 'chair', offsetX: 1.2, offsetZ: -d * 0.15,
      width: 0.5, height: 0.9, depth: 0.5, color: wood
    });

    // Shelves with dishes on side wall
    specs.push({
      type: 'shelf', offsetX: -w / 2 + 0.5, offsetZ: 0,
      width: 0.5, height: 2.0, depth: d * 0.5, color: wood
    });

    // Barrel (water/food storage)
    specs.push({
      type: 'barrel', offsetX: w / 2 - 0.8, offsetZ: d / 2 - 0.8,
      width: 0.7, height: 1.0, depth: 0.7, color: new Color3(0.3, 0.25, 0.18)
    });

    return specs;
  }

  private getBedroomFurniture(w: number, d: number): FurnitureSpec[] {
    const specs: FurnitureSpec[] = [];
    const wood = new Color3(0.45, 0.35, 0.25);

    // Bed against back wall
    specs.push({
      type: 'bed', offsetX: -w * 0.2, offsetZ: d / 2 - 1.2,
      width: 1.8, height: 0.6, depth: 2.2, color: new Color3(0.55, 0.4, 0.3)
    });

    // Nightstand beside bed
    specs.push({
      type: 'table', offsetX: -w * 0.2 + 1.5, offsetZ: d / 2 - 0.8,
      width: 0.5, height: 0.6, depth: 0.5, color: wood
    });

    // Wardrobe against side wall
    specs.push({
      type: 'wardrobe', offsetX: w / 2 - 0.6, offsetZ: 0,
      width: 0.8, height: 2.2, depth: 1.5, color: wood
    });

    // Small chest at foot of bed
    specs.push({
      type: 'chest', offsetX: -w * 0.2, offsetZ: d / 2 - 2.5,
      width: 1.2, height: 0.5, depth: 0.6, color: new Color3(0.4, 0.3, 0.15)
    });

    return specs;
  }

  private getShopFloorFurniture(w: number, d: number): FurnitureSpec[] {
    const specs: FurnitureSpec[] = [];
    const wood = new Color3(0.5, 0.4, 0.3);

    // Display counter near entrance
    specs.push({
      type: 'counter', offsetX: 0, offsetZ: -d * 0.25,
      width: w * 0.5, height: 1.0, depth: 0.8, color: wood
    });

    // Shelves along both side walls with merchandise
    specs.push({
      type: 'shelf', offsetX: -w / 2 + 0.5, offsetZ: 0,
      width: 0.6, height: 2.0, depth: d * 0.6, color: wood
    });
    specs.push({
      type: 'shelf', offsetX: w / 2 - 0.5, offsetZ: 0,
      width: 0.6, height: 2.0, depth: d * 0.6, color: wood
    });

    // Display table center
    specs.push({
      type: 'display_table', offsetX: 0, offsetZ: d * 0.15,
      width: 2.0, height: 0.9, depth: 1.5, color: new Color3(0.45, 0.35, 0.25)
    });

    return specs;
  }

  private getStorageRoomFurniture(w: number, d: number): FurnitureSpec[] {
    const specs: FurnitureSpec[] = [];
    const wood = new Color3(0.4, 0.32, 0.2);

    // Crates and barrels
    specs.push({
      type: 'crate', offsetX: -w * 0.25, offsetZ: 0,
      width: 1.0, height: 1.0, depth: 1.0, color: wood
    });
    specs.push({
      type: 'crate', offsetX: -w * 0.25, offsetZ: d * 0.25,
      width: 0.8, height: 0.8, depth: 0.8, color: wood
    });
    specs.push({
      type: 'barrel', offsetX: w * 0.2, offsetZ: 0,
      width: 0.8, height: 1.2, depth: 0.8, color: new Color3(0.35, 0.22, 0.1)
    });
    specs.push({
      type: 'barrel', offsetX: w * 0.2, offsetZ: d * 0.25,
      width: 0.7, height: 1.0, depth: 0.7, color: new Color3(0.3, 0.25, 0.18)
    });

    // Shelf along back wall
    specs.push({
      type: 'shelf', offsetX: 0, offsetZ: d / 2 - 0.5,
      width: w * 0.6, height: 2.0, depth: 0.5, color: wood
    });

    return specs;
  }

  private getOfficeFurniture(w: number, d: number): FurnitureSpec[] {
    const specs: FurnitureSpec[] = [];
    const wood = new Color3(0.4, 0.3, 0.2);

    // Desk
    specs.push({
      type: 'workbench', offsetX: 0, offsetZ: d * 0.2,
      width: w * 0.5, height: 0.85, depth: 1.0, color: wood
    });

    // Chair behind desk
    specs.push({
      type: 'chair', offsetX: 0, offsetZ: d * 0.2 + 0.8,
      width: 0.5, height: 1.0, depth: 0.5, color: wood
    });

    // Bookshelf on wall
    specs.push({
      type: 'bookshelf', offsetX: -w / 2 + 0.5, offsetZ: 0,
      width: 0.6, height: 2.5, depth: d * 0.6, color: new Color3(0.35, 0.25, 0.15)
    });

    // Chest
    specs.push({
      type: 'chest', offsetX: w / 2 - 0.8, offsetZ: d / 2 - 0.8,
      width: 1.0, height: 0.6, depth: 0.7, color: new Color3(0.4, 0.3, 0.15)
    });

    return specs;
  }

  private getLibraryFurniture(w: number, d: number): FurnitureSpec[] {
    const specs: FurnitureSpec[] = [];
    const wood = new Color3(0.35, 0.25, 0.15);

    // Bookshelves along walls
    specs.push({
      type: 'bookshelf', offsetX: -w / 2 + 0.5, offsetZ: 0,
      width: 0.6, height: 2.5, depth: d * 0.7, color: wood
    });
    specs.push({
      type: 'bookshelf', offsetX: w / 2 - 0.5, offsetZ: 0,
      width: 0.6, height: 2.5, depth: d * 0.7, color: wood
    });
    specs.push({
      type: 'bookshelf', offsetX: 0, offsetZ: d / 2 - 0.5,
      width: w * 0.5, height: 2.5, depth: 0.6, color: wood
    });

    // Reading table
    specs.push({
      type: 'table', offsetX: 0, offsetZ: -d * 0.1,
      width: 2.0, height: 0.85, depth: 1.2, color: new Color3(0.45, 0.35, 0.25)
    });

    // Chairs
    specs.push({
      type: 'chair', offsetX: -1.2, offsetZ: -d * 0.1,
      width: 0.5, height: 1.0, depth: 0.5, color: wood
    });
    specs.push({
      type: 'chair', offsetX: 1.2, offsetZ: -d * 0.1,
      width: 0.5, height: 1.0, depth: 0.5, color: wood
    });

    return specs;
  }

  private getTavernMainFurniture(w: number, d: number): FurnitureSpec[] {
    const specs: FurnitureSpec[] = [];
    const wood = new Color3(0.4, 0.28, 0.15);
    const darkWood = new Color3(0.3, 0.2, 0.1);

    // Bar counter along the partition wall side
    specs.push({
      type: 'counter', offsetX: 0, offsetZ: d / 2 - 1.2,
      width: w * 0.6, height: 1.2, depth: 1.0, color: darkWood
    });

    // Tables with stools (2x2 grid)
    for (let i = -1; i <= 1; i += 2) {
      for (let j = -1; j <= 1; j += 2) {
        specs.push({
          type: 'table', offsetX: i * (w * 0.2), offsetZ: j * (d * 0.15),
          width: 1.5, height: 0.8, depth: 1.5, color: wood
        });
        specs.push({
          type: 'stool', offsetX: i * (w * 0.2) + 1, offsetZ: j * (d * 0.15),
          width: 0.4, height: 0.5, depth: 0.4, color: wood
        });
        specs.push({
          type: 'stool', offsetX: i * (w * 0.2) - 1, offsetZ: j * (d * 0.15),
          width: 0.4, height: 0.5, depth: 0.4, color: wood
        });
      }
    }

    // Barrels in corners
    specs.push({
      type: 'barrel', offsetX: w / 2 - 1, offsetZ: d / 2 - 1,
      width: 0.8, height: 1.2, depth: 0.8, color: new Color3(0.35, 0.22, 0.1)
    });
    specs.push({
      type: 'barrel', offsetX: -w / 2 + 1, offsetZ: d / 2 - 1,
      width: 0.8, height: 1.2, depth: 0.8, color: new Color3(0.35, 0.22, 0.1)
    });

    return specs;
  }

  private getTavernKitchenFurniture(w: number, d: number): FurnitureSpec[] {
    const specs: FurnitureSpec[] = [];
    const wood = new Color3(0.4, 0.28, 0.15);

    // Hearth/stove
    specs.push({
      type: 'forge', offsetX: 0, offsetZ: d / 2 - 1,
      width: 1.8, height: 1.0, depth: 1.2, color: new Color3(0.5, 0.2, 0.1)
    });

    // Prep table
    specs.push({
      type: 'workbench', offsetX: -w * 0.2, offsetZ: -d * 0.1,
      width: 2.0, height: 0.9, depth: 1.0, color: wood
    });

    // Shelves
    specs.push({
      type: 'shelf', offsetX: w / 2 - 0.5, offsetZ: 0,
      width: 0.5, height: 2.0, depth: d * 0.6, color: wood
    });

    // Barrels
    specs.push({
      type: 'barrel', offsetX: -w / 2 + 0.8, offsetZ: d / 2 - 0.8,
      width: 0.8, height: 1.2, depth: 0.8, color: new Color3(0.35, 0.22, 0.1)
    });
    specs.push({
      type: 'barrel', offsetX: -w / 2 + 0.8, offsetZ: d * 0.1,
      width: 0.7, height: 1.0, depth: 0.7, color: new Color3(0.3, 0.25, 0.18)
    });

    return specs;
  }

  private getGuildMainFurniture(w: number, d: number): FurnitureSpec[] {
    const specs: FurnitureSpec[] = [];
    const wood = new Color3(0.45, 0.32, 0.2);

    // Large meeting table
    specs.push({
      type: 'table', offsetX: 0, offsetZ: 0,
      width: w * 0.5, height: 0.85, depth: d * 0.35, color: wood
    });

    // Chairs around table
    for (let i = -2; i <= 2; i++) {
      specs.push({
        type: 'chair', offsetX: i * 1.5, offsetZ: -d * 0.25,
        width: 0.5, height: 1.0, depth: 0.5, color: wood
      });
      specs.push({
        type: 'chair', offsetX: i * 1.5, offsetZ: d * 0.25,
        width: 0.5, height: 1.0, depth: 0.5, color: wood
      });
    }

    // Bookshelf along back
    specs.push({
      type: 'bookshelf', offsetX: 0, offsetZ: d / 2 - 0.5,
      width: w * 0.7, height: 2.5, depth: 0.6, color: new Color3(0.35, 0.25, 0.15)
    });

    return specs;
  }

  private getWorkshopRoomFurniture(w: number, d: number): FurnitureSpec[] {
    const specs: FurnitureSpec[] = [];
    const metal = new Color3(0.35, 0.35, 0.38);
    const wood = new Color3(0.35, 0.25, 0.15);

    // Anvil
    specs.push({
      type: 'anvil', offsetX: 0, offsetZ: d * 0.15,
      width: 1.0, height: 0.8, depth: 0.6, color: metal
    });

    // Workbench along back wall
    specs.push({
      type: 'workbench', offsetX: 0, offsetZ: d / 2 - 1,
      width: w * 0.6, height: 1.0, depth: 1.0, color: wood
    });

    // Tool rack on wall
    specs.push({
      type: 'tool_rack', offsetX: -w / 2 + 0.5, offsetZ: d * 0.1,
      width: 0.3, height: 2.0, depth: 2.0, color: wood
    });

    // Barrel
    specs.push({
      type: 'barrel', offsetX: w / 2 - 1, offsetZ: -d * 0.2,
      width: 0.8, height: 1.0, depth: 0.8, color: new Color3(0.3, 0.25, 0.18)
    });

    // Forge
    specs.push({
      type: 'forge', offsetX: w / 2 - 1.5, offsetZ: d / 2 - 1,
      width: 1.5, height: 1.2, depth: 1.5, color: new Color3(0.6, 0.25, 0.1)
    });

    return specs;
  }

  private getTempleFurniture(w: number, d: number): FurnitureSpec[] {
    const specs: FurnitureSpec[] = [];
    const stone = new Color3(0.55, 0.53, 0.5);
    const wood = new Color3(0.45, 0.35, 0.25);

    // Altar at the back
    specs.push({
      type: 'altar', offsetX: 0, offsetZ: d / 2 - 2,
      width: 2.5, height: 1.2, depth: 1.5, color: stone
    });

    // Pews (rows of benches)
    for (let row = 0; row < 4; row++) {
      specs.push({
        type: 'pew', offsetX: -w * 0.2, offsetZ: -d * 0.15 + row * 2.5,
        width: w * 0.25, height: 0.8, depth: 0.6, color: wood
      });
      specs.push({
        type: 'pew', offsetX: w * 0.2, offsetZ: -d * 0.15 + row * 2.5,
        width: w * 0.25, height: 0.8, depth: 0.6, color: wood
      });
    }

    // Pillars
    specs.push({
      type: 'pillar', offsetX: -w * 0.35, offsetZ: 0,
      width: 0.6, height: 7, depth: 0.6, color: stone
    });
    specs.push({
      type: 'pillar', offsetX: w * 0.35, offsetZ: 0,
      width: 0.6, height: 7, depth: 0.6, color: stone
    });

    return specs;
  }


  private getWarehouseFurniture(w: number, d: number): FurnitureSpec[] {
    const specs: FurnitureSpec[] = [];
    const wood = new Color3(0.4, 0.32, 0.2);

    // Rows of crates and barrels
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const isCrate = (row + col) % 2 === 0;
        specs.push({
          type: isCrate ? 'crate' : 'barrel',
          offsetX: -w * 0.3 + col * (w * 0.3),
          offsetZ: -d * 0.2 + row * (d * 0.25),
          width: isCrate ? 1.0 : 0.8,
          height: isCrate ? 1.0 : 1.2,
          depth: isCrate ? 1.0 : 0.8,
          color: wood
        });
      }
    }

    // Shelf along one wall
    specs.push({
      type: 'shelf', offsetX: -w / 2 + 0.5, offsetZ: 0,
      width: 0.6, height: 2.5, depth: d * 0.5, color: wood
    });

    return specs;
  }

  /**
   * Dispose a single interior by building ID and remove it from the cache.
   * Used when the player exits a building in dedicated-scene mode so the
   * interior scene can be cleared.
   */
  public disposeInterior(buildingId: string): void {
    const layout = this.interiors.get(buildingId);
    if (!layout) return;
    layout.furniture.forEach((f) => { if (!f.isDisposed()) f.dispose(); });
    if (!layout.roomMesh.isDisposed()) layout.roomMesh.dispose(false, true);
    this.interiors.delete(buildingId);
  }

  /**
   * Dispose all generated interiors.
   */
  public dispose(): void {
    this.interiors.forEach((layout) => {
      layout.furniture.forEach((f) => f.dispose());
      layout.roomMesh.dispose(false, true);
    });
    this.interiors.clear();
    this.nextSlotIndex = 0;
  }
}
