/**
 * BuildingInteriorGenerator
 *
 * Generates building interior rooms at a Y-offset (Y=500+) within the same Babylon scene.
 * Each interior has walls, floor, ceiling, and furniture based on the building type.
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
}

interface FurnitureSpec {
  type: string;
  offsetX: number;
  offsetZ: number;
  width: number;
  height: number;
  depth: number;
  color: Color3;
  rotationY?: number;
}

export class BuildingInteriorGenerator {
  private scene: Scene;
  private interiors: Map<string, InteriorLayout> = new Map();
  private nextSlotIndex: number = 0;

  // Interior offset: each interior is placed at Y=500 + slotIndex * 50
  // to keep them separated vertically
  private static readonly BASE_Y_OFFSET = 500;
  private static readonly SLOT_SPACING = 50;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Generate an interior for a building. Returns the layout with entry/exit positions.
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

    // Determine room dimensions based on building type
    const dims = this.getRoomDimensions(buildingType, businessType);

    // Calculate position for this interior (Y-offset slot)
    const slotY = BuildingInteriorGenerator.BASE_Y_OFFSET +
      this.nextSlotIndex * BuildingInteriorGenerator.SLOT_SPACING;
    const position = new Vector3(0, slotY, 0);
    this.nextSlotIndex++;

    // Build the room shell (floor, walls, ceiling)
    const roomMesh = this.buildRoom(buildingId, position, dims.width, dims.depth, dims.height, buildingType, businessType);

    // Generate furniture based on building/business type
    const furniture = this.generateFurniture(buildingId, position, dims.width, dims.depth, dims.height, buildingType, businessType);

    // Door position (center of south wall, at floor level)
    const doorPosition = new Vector3(
      position.x,
      position.y + 1,
      position.z - dims.depth / 2 + 0.5
    );

    // Exit position is where the player returns to in the overworld
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
      exitPosition
    };

    this.interiors.set(buildingId, layout);
    return layout;
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
      return { width: 14, depth: 12, height: 5 };
    } else if (bt.includes('shop') || bt.includes('store') || bt.includes('market')) {
      return { width: 10, depth: 10, height: 4.5 };
    } else if (bt.includes('blacksmith') || bt.includes('forge') || bt.includes('workshop')) {
      return { width: 12, depth: 10, height: 5 };
    } else if (bt.includes('temple') || bt.includes('church') || bt.includes('shrine')) {
      return { width: 16, depth: 20, height: 8 };
    } else if (bt.includes('guild') || bt.includes('hall') || bt.includes('office')) {
      return { width: 14, depth: 14, height: 5 };
    } else if (bt.includes('residence_large') || bt.includes('mansion')) {
      return { width: 12, depth: 12, height: 4.5 };
    } else if (bt.includes('residence_medium')) {
      return { width: 8, depth: 8, height: 4 };
    } else if (bt.includes('residence') || bt.includes('house') || bt.includes('home')) {
      return { width: 6, depth: 6, height: 3.5 };
    } else if (bt.includes('warehouse') || bt.includes('storage')) {
      return { width: 16, depth: 12, height: 6 };
    }

    // Default
    return { width: 8, depth: 8, height: 4 };
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
    businessType?: string
  ): Mesh {
    const prefix = `interior_${buildingId}`;
    const parent = new Mesh(`${prefix}_room`, this.scene);
    parent.position = position;

    const colors = this.getRoomColors(buildingType, businessType);

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

  /**
   * Generate furniture for the interior based on building/business type.
   */
  private generateFurniture(
    buildingId: string,
    position: Vector3,
    width: number,
    depth: number,
    height: number,
    buildingType: string,
    businessType?: string
  ): Mesh[] {
    const bt = (businessType || buildingType || '').toLowerCase();
    let specs: FurnitureSpec[] = [];

    if (bt.includes('tavern') || bt.includes('inn') || bt.includes('bar')) {
      specs = this.getTavernFurniture(width, depth);
    } else if (bt.includes('shop') || bt.includes('store') || bt.includes('market')) {
      specs = this.getShopFurniture(width, depth);
    } else if (bt.includes('blacksmith') || bt.includes('forge') || bt.includes('workshop')) {
      specs = this.getWorkshopFurniture(width, depth);
    } else if (bt.includes('temple') || bt.includes('church') || bt.includes('shrine')) {
      specs = this.getTempleFurniture(width, depth);
    } else if (bt.includes('guild') || bt.includes('hall') || bt.includes('office')) {
      specs = this.getGuildFurniture(width, depth);
    } else if (bt.includes('residence')) {
      specs = this.getResidenceFurniture(width, depth);
    } else if (bt.includes('warehouse') || bt.includes('storage')) {
      specs = this.getWarehouseFurniture(width, depth);
    } else {
      specs = this.getResidenceFurniture(width, depth);
    }

    const furniture: Mesh[] = [];
    const prefix = `interior_${buildingId}`;

    for (let i = 0; i < specs.length; i++) {
      const spec = specs[i];
      const mesh = this.createFurnitureMesh(`${prefix}_furn_${i}_${spec.type}`, spec);
      mesh.position = new Vector3(
        position.x + spec.offsetX,
        position.y + spec.height / 2,
        position.z + spec.offsetZ
      );
      if (spec.rotationY) {
        mesh.rotation.y = spec.rotationY;
      }
      furniture.push(mesh);
    }

    return furniture;
  }

  /**
   * Create a single furniture mesh from spec.
   */
  private createFurnitureMesh(name: string, spec: FurnitureSpec): Mesh {
    const mesh = MeshBuilder.CreateBox(
      name,
      { width: spec.width, height: spec.height, depth: spec.depth },
      this.scene
    );
    const mat = new StandardMaterial(`${name}_mat`, this.scene);
    mat.diffuseColor = spec.color;
    mat.specularColor = new Color3(0.05, 0.05, 0.05);
    mesh.material = mat;
    mesh.isPickable = false;
    mesh.checkCollisions = true;
    return mesh;
  }

  // ── Furniture layouts per building type ──

  private getTavernFurniture(w: number, d: number): FurnitureSpec[] {
    const specs: FurnitureSpec[] = [];
    const wood = new Color3(0.4, 0.28, 0.15);
    const darkWood = new Color3(0.3, 0.2, 0.1);

    // Bar counter along back wall
    specs.push({
      type: 'counter', offsetX: 0, offsetZ: d / 2 - 1.5,
      width: w * 0.6, height: 1.2, depth: 1.0, color: darkWood
    });

    // Tables with stools (2 rows)
    for (let i = -1; i <= 1; i += 2) {
      for (let j = -1; j <= 1; j += 2) {
        specs.push({
          type: 'table', offsetX: i * (w * 0.2), offsetZ: j * (d * 0.15),
          width: 1.5, height: 0.8, depth: 1.5, color: wood
        });
        // Stools around each table
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

    // Barrel in corner
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

  private getShopFurniture(w: number, d: number): FurnitureSpec[] {
    const specs: FurnitureSpec[] = [];
    const wood = new Color3(0.5, 0.4, 0.3);

    // Counter near front
    specs.push({
      type: 'counter', offsetX: 0, offsetZ: -d * 0.2,
      width: w * 0.5, height: 1.0, depth: 0.8, color: wood
    });

    // Shelves along side walls
    specs.push({
      type: 'shelf', offsetX: -w / 2 + 0.5, offsetZ: 0,
      width: 0.6, height: 2.0, depth: d * 0.6, color: wood,
      rotationY: 0
    });
    specs.push({
      type: 'shelf', offsetX: w / 2 - 0.5, offsetZ: 0,
      width: 0.6, height: 2.0, depth: d * 0.6, color: wood,
      rotationY: 0
    });

    // Display table in center-back
    specs.push({
      type: 'display_table', offsetX: 0, offsetZ: d * 0.2,
      width: 2, height: 0.9, depth: 1.5, color: new Color3(0.45, 0.35, 0.25)
    });

    // Crate
    specs.push({
      type: 'crate', offsetX: w / 2 - 1.2, offsetZ: d / 2 - 1,
      width: 0.8, height: 0.8, depth: 0.8, color: new Color3(0.4, 0.32, 0.2)
    });

    return specs;
  }

  private getWorkshopFurniture(w: number, d: number): FurnitureSpec[] {
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

    // Barrel of water
    specs.push({
      type: 'barrel', offsetX: w / 2 - 1, offsetZ: -d * 0.2,
      width: 0.8, height: 1.0, depth: 0.8, color: new Color3(0.3, 0.25, 0.18)
    });

    // Forge (represented as a glowing box)
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

  private getGuildFurniture(w: number, d: number): FurnitureSpec[] {
    const specs: FurnitureSpec[] = [];
    const wood = new Color3(0.45, 0.32, 0.2);

    // Large meeting table in center
    specs.push({
      type: 'table', offsetX: 0, offsetZ: 0,
      width: w * 0.5, height: 0.85, depth: d * 0.35, color: wood
    });

    // Chairs around the table
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

    // Bookshelf along back wall
    specs.push({
      type: 'bookshelf', offsetX: 0, offsetZ: d / 2 - 0.5,
      width: w * 0.7, height: 2.5, depth: 0.6, color: new Color3(0.35, 0.25, 0.15)
    });

    return specs;
  }

  private getResidenceFurniture(w: number, d: number): FurnitureSpec[] {
    const specs: FurnitureSpec[] = [];
    const wood = new Color3(0.45, 0.35, 0.25);

    // Bed against back wall
    specs.push({
      type: 'bed', offsetX: -w * 0.25, offsetZ: d / 2 - 1.2,
      width: 1.8, height: 0.6, depth: 2.2, color: new Color3(0.55, 0.4, 0.3)
    });

    // Table with chair
    specs.push({
      type: 'table', offsetX: w * 0.2, offsetZ: 0,
      width: 1.2, height: 0.8, depth: 1.0, color: wood
    });
    specs.push({
      type: 'chair', offsetX: w * 0.2, offsetZ: -0.8,
      width: 0.5, height: 0.9, depth: 0.5, color: wood
    });

    // Chest
    specs.push({
      type: 'chest', offsetX: w / 2 - 1, offsetZ: d / 2 - 0.8,
      width: 1.0, height: 0.6, depth: 0.7, color: new Color3(0.4, 0.3, 0.15)
    });

    // Wardrobe / cabinet
    specs.push({
      type: 'wardrobe', offsetX: -w / 2 + 0.6, offsetZ: 0,
      width: 0.8, height: 2.2, depth: 1.5, color: wood
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
