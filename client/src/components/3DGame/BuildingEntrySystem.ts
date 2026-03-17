/**
 * BuildingEntrySystem
 *
 * Manages player entry/exit from buildings with door proximity detection,
 * floating UI prompts, fade transitions, and NPC movement pausing.
 */

import {
  Scene,
  Vector3,
  Mesh,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Observer,
  DynamicTexture,
} from '@babylonjs/core';
import { BuildingInteriorGenerator, InteriorLayout } from './BuildingInteriorGenerator';
import type { InteriorNPCManager, BuildingMetadata } from './InteriorNPCManager';

/** Data for a registered building */
export interface BuildingEntryData {
  id: string;
  position: Vector3;
  rotation: number;
  width: number;
  depth: number;
  buildingType: string;
  businessType?: string;
  buildingName?: string;
  mesh: Mesh;
  /** Building metadata for NPC placement (ownerId, employees, occupants, etc.) */
  metadata?: BuildingMetadata;
}

/** Callback interface for BuildingEntrySystem events */
export interface BuildingEntryCallbacks {
  /** Called to teleport the player mesh to a position */
  onTeleportPlayer: (position: Vector3) => void;
  /** Called to get the current player position */
  getPlayerPosition: () => Vector3 | null;
  /** Called when entering a building (for NPC pausing, etc.) */
  onEnterBuilding?: (buildingId: string, interior: InteriorLayout) => void;
  /** Called when exiting a building (for NPC resuming, etc.) */
  onExitBuilding?: () => void;
  /** Called to show a toast notification */
  onShowToast?: (title: string, description?: string, duration?: number) => void;
}

/** Door entry point for a building */
interface DoorEntryPoint {
  buildingId: string;
  worldPosition: Vector3;
  buildingData: BuildingEntryData;
}

/** Proximity detection radius for door prompts (meters) */
const DOOR_PROXIMITY_RADIUS = 2.0;

/** Fade transition duration in milliseconds */
const FADE_DURATION_MS = 500;

export class BuildingEntrySystem {
  private scene: Scene;
  private interiorGenerator: BuildingInteriorGenerator;
  private callbacks: BuildingEntryCallbacks;

  // Registered buildings and their door positions
  private buildings: Map<string, BuildingEntryData> = new Map();
  private doorEntryPoints: Map<string, DoorEntryPoint> = new Map();

  // State
  private isInsideBuilding = false;
  private activeInterior: InteriorLayout | null = null;
  private savedOverworldPosition: Vector3 | null = null;
  private activeBuildingId: string | null = null;

  // UI elements
  private promptMesh: Mesh | null = null;
  private promptMaterial: StandardMaterial | null = null;
  private buildingNameMesh: Mesh | null = null;
  private buildingNameMaterial: StandardMaterial | null = null;
  private nearestDoorBuildingId: string | null = null;

  // Observers
  private renderObserver: Observer<Scene> | null = null;
  private keyboardHandler: ((event: KeyboardEvent) => void) | null = null;

  // NPC pause tracking
  private npcPauseCallbacks: Array<{ pause: () => void; resume: () => void }> = [];

  // Interior NPC management
  private interiorNPCManager: InteriorNPCManager | null = null;
  private npcDataSource: (() => Map<string, { mesh: Mesh; characterData?: any }>) | null = null;
  private playerCharacterIdSource: (() => string | undefined) | null = null;

  /** Override fade transition for testing — set to a function that returns a resolved Promise */
  public _fadeOverride: ((fadeOut: boolean) => Promise<void>) | null = null;

  constructor(
    scene: Scene,
    interiorGenerator: BuildingInteriorGenerator,
    callbacks: BuildingEntryCallbacks
  ) {
    this.scene = scene;
    this.interiorGenerator = interiorGenerator;
    this.callbacks = callbacks;

    this.setupRenderLoop();
    this.setupKeyboard();
  }

  /**
   * Register a building for entry detection.
   * Must be called for each building that supports entry.
   */
  registerBuilding(data: BuildingEntryData): void {
    this.buildings.set(data.id, data);

    // Calculate door world position (front face center, offset outward)
    const cos = Math.cos(data.rotation);
    const sin = Math.sin(data.rotation);
    // Door is at front face (positive Z in local space), offset slightly outward
    const localDoorZ = data.depth / 2 + 0.5;
    const doorWorldPos = new Vector3(
      data.position.x + sin * localDoorZ,
      data.position.y,
      data.position.z + cos * localDoorZ
    );

    this.doorEntryPoints.set(data.id, {
      buildingId: data.id,
      worldPosition: doorWorldPos,
      buildingData: data,
    });
  }

  /**
   * Unregister a building.
   */
  unregisterBuilding(buildingId: string): void {
    this.buildings.delete(buildingId);
    this.doorEntryPoints.delete(buildingId);
  }

  /**
   * Register NPC pause/resume callbacks for when player enters/exits buildings.
   */
  registerNPCPauseCallback(pause: () => void, resume: () => void): void {
    this.npcPauseCallbacks.push({ pause, resume });
  }

  /**
   * Wire an InteriorNPCManager for automatic NPC placement on building entry/exit.
   * @param manager The InteriorNPCManager instance
   * @param getNPCs Function that returns the current NPC mesh map
   * @param getPlayerCharacterId Optional function returning the player's character ID
   */
  setInteriorNPCManager(
    manager: InteriorNPCManager,
    getNPCs: () => Map<string, { mesh: Mesh; characterData?: any }>,
    getPlayerCharacterId?: () => string | undefined
  ): void {
    this.interiorNPCManager = manager;
    this.npcDataSource = getNPCs;
    this.playerCharacterIdSource = getPlayerCharacterId ?? null;
  }

  /**
   * Get the wired InteriorNPCManager, if any.
   */
  getInteriorNPCManager(): InteriorNPCManager | null {
    return this.interiorNPCManager;
  }

  /**
   * Whether the player is currently inside a building.
   */
  get isInside(): boolean {
    return this.isInsideBuilding;
  }

  /**
   * Get the active interior layout if inside a building.
   */
  getActiveInterior(): InteriorLayout | null {
    return this.activeInterior;
  }

  /**
   * Get the active building ID.
   */
  getActiveBuildingId(): string | null {
    return this.activeBuildingId;
  }

  /**
   * Enter a building by ID. Can be called externally (e.g., from pointer click).
   */
  async enterBuilding(buildingId: string): Promise<void> {
    if (this.isInsideBuilding) return;

    const data = this.buildings.get(buildingId);
    if (!data) return;

    const doorEntry = this.doorEntryPoints.get(buildingId);
    const doorWorldPos = doorEntry?.worldPosition ?? data.position.clone();

    // Save overworld position
    const playerPos = this.callbacks.getPlayerPosition();
    if (playerPos) {
      this.savedOverworldPosition = playerPos.clone();
    }

    // Generate or retrieve interior
    const interior = this.interiorGenerator.generateInterior(
      buildingId,
      data.buildingType,
      data.businessType,
      doorWorldPos
    );
    this.activeInterior = interior;
    this.activeBuildingId = buildingId;

    // Hide door prompt during transition
    this.hidePrompt();

    // Fade to black
    await this.performFadeTransition(true);

    // Teleport player to interior door position (facing into the room = +Z direction)
    this.callbacks.onTeleportPlayer(interior.doorPosition.clone());
    this.isInsideBuilding = true;

    // Pause overworld NPC movement
    for (const cb of this.npcPauseCallbacks) {
      cb.pause();
    }

    // Populate interior with NPCs via wired InteriorNPCManager
    if (this.interiorNPCManager && this.npcDataSource) {
      const metadata: BuildingMetadata = data.metadata ?? {
        buildingType: data.buildingType,
        businessType: data.businessType,
      };
      const npcMap = this.npcDataSource();
      const playerCharId = this.playerCharacterIdSource?.();
      this.interiorNPCManager.populateInterior(
        buildingId,
        interior,
        metadata,
        npcMap,
        playerCharId
      );
    }

    // Notify callback
    this.callbacks.onEnterBuilding?.(buildingId, interior);

    // Show building name indicator
    const label = data.buildingName || data.businessType || data.buildingType || 'Building';
    this.showBuildingNameIndicator(label);

    this.callbacks.onShowToast?.(
      `Entered ${label}`,
      'Press E or click the door to exit',
      2500
    );

    // Fade back in
    await this.performFadeTransition(false);
  }

  /**
   * Exit the current building.
   */
  async exitBuilding(): Promise<void> {
    if (!this.isInsideBuilding || !this.activeInterior) return;

    // Fade to black
    await this.performFadeTransition(true);

    // Teleport player back to overworld
    if (this.savedOverworldPosition) {
      this.callbacks.onTeleportPlayer(this.savedOverworldPosition.clone());
    } else {
      this.callbacks.onTeleportPlayer(this.activeInterior.exitPosition.clone());
    }

    this.isInsideBuilding = false;
    this.activeInterior = null;
    this.activeBuildingId = null;
    this.savedOverworldPosition = null;

    // Hide building name indicator
    this.hideBuildingNameIndicator();

    // Clear interior NPCs via wired InteriorNPCManager
    this.interiorNPCManager?.clearInterior();

    // Resume overworld NPC movement
    for (const cb of this.npcPauseCallbacks) {
      cb.resume();
    }

    // Notify callback
    this.callbacks.onExitBuilding?.();

    this.callbacks.onShowToast?.('Exited building', '', 1500);

    // Fade back in
    await this.performFadeTransition(false);
  }

  /**
   * Setup per-frame door proximity checks.
   */
  private setupRenderLoop(): void {
    this.renderObserver = this.scene.onBeforeRenderObservable.add(() => {
      if (this.isInsideBuilding) return;
      this.updateDoorProximity();
    });
  }

  /**
   * Setup E key handler for building entry/exit.
   */
  private setupKeyboard(): void {
    this.keyboardHandler = (event: KeyboardEvent) => {
      if (event.code !== 'KeyE' || event.repeat) return;
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;

      if (this.isInsideBuilding) {
        // Exit building
        event.preventDefault();
        this.exitBuilding();
      } else if (this.nearestDoorBuildingId) {
        // Enter the building we're near
        event.preventDefault();
        this.enterBuilding(this.nearestDoorBuildingId);
      }
    };
    window.addEventListener('keydown', this.keyboardHandler);
  }

  /**
   * Check player proximity to all registered doors and show/hide prompt.
   */
  private updateDoorProximity(): void {
    const playerPos = this.callbacks.getPlayerPosition();
    if (!playerPos) {
      this.hidePrompt();
      this.nearestDoorBuildingId = null;
      return;
    }

    let nearestId: string | null = null;
    let nearestDist = Infinity;
    let nearestDoor: DoorEntryPoint | null = null;

    const entries = Array.from(this.doorEntryPoints.entries());
    for (const [id, door] of entries) {
      // Use horizontal distance only (ignore Y)
      const dx = playerPos.x - door.worldPosition.x;
      const dz = playerPos.z - door.worldPosition.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < DOOR_PROXIMITY_RADIUS && dist < nearestDist) {
        nearestDist = dist;
        nearestId = id;
        nearestDoor = door;
      }
    }

    if (nearestId && nearestDoor) {
      this.nearestDoorBuildingId = nearestId;
      const label = nearestDoor.buildingData.buildingName ||
        nearestDoor.buildingData.businessType ||
        nearestDoor.buildingData.buildingType ||
        'Building';
      this.showPrompt(nearestDoor.worldPosition, `Enter ${label} [E]`);
    } else {
      this.nearestDoorBuildingId = null;
      this.hidePrompt();
    }
  }

  /**
   * Show a floating "Enter [Building Name]" prompt at the door position.
   */
  private showPrompt(position: Vector3, text: string): void {
    if (!this.promptMesh) {
      this.promptMesh = MeshBuilder.CreatePlane('entry_prompt', { width: 3, height: 0.6 }, this.scene);
      this.promptMesh.billboardMode = Mesh.BILLBOARDMODE_ALL;
      this.promptMesh.isPickable = false;
      this.promptMesh.renderingGroupId = 2;

      this.promptMaterial = new StandardMaterial('entry_prompt_mat', this.scene);
      this.promptMaterial.disableLighting = true;
      this.promptMaterial.backFaceCulling = false;
      this.promptMesh.material = this.promptMaterial;
    }

    // Position prompt above door
    this.promptMesh.position.x = position.x;
    this.promptMesh.position.y = position.y + 3.5;
    this.promptMesh.position.z = position.z;
    this.promptMesh.isVisible = true;

    // Use a colored material as a visual indicator
    // (Full text rendering would require AdvancedDynamicTexture, but a colored billboard
    //  with the toast system handles the text display)
    this.promptMaterial!.emissiveColor = new Color3(0.2, 0.8, 0.2);
    this.promptMaterial!.alpha = 0.7;

    // Create a text plane using dynamic texture
    this.updatePromptText(text);
  }

  /**
   * Update the prompt text using a dynamic texture.
   */
  private updatePromptText(text: string): void {
    if (!this.promptMesh || !this.scene) return;

    // Use Babylon.js DynamicTexture for text rendering on the billboard
    // DynamicTexture imported at top level
    const existingTexture = (this.promptMaterial as any)?._dynamicTexture;
    if (existingTexture) {
      existingTexture.dispose();
    }

    const textureWidth = 512;
    const textureHeight = 96;
    const dynamicTexture = new DynamicTexture('entry_prompt_tex', { width: textureWidth, height: textureHeight }, this.scene);
    dynamicTexture.hasAlpha = true;

    const ctx = dynamicTexture.getContext() as any;
    ctx.clearRect(0, 0, textureWidth, textureHeight);

    // Background with rounded appearance
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(4, 4, textureWidth - 8, textureHeight - 8, 12);
    else ctx.fillRect(4, 4, textureWidth - 8, textureHeight - 8);
    ctx.fill();

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, textureWidth / 2, textureHeight / 2);

    dynamicTexture.update();

    this.promptMaterial!.diffuseTexture = dynamicTexture;
    this.promptMaterial!.emissiveColor = Color3.White();
    this.promptMaterial!.alpha = 1;
    this.promptMaterial!.useAlphaFromDiffuseTexture = true;
    (this.promptMaterial as any)._dynamicTexture = dynamicTexture;
  }

  /**
   * Hide the door entry prompt.
   */
  private hidePrompt(): void {
    if (this.promptMesh) {
      this.promptMesh.isVisible = false;
    }
  }

  /**
   * Show building name indicator while inside.
   */
  private showBuildingNameIndicator(name: string): void {
    if (!this.scene) return;

    // Reuse or create the building name overlay
    if (!this.buildingNameMesh) {
      this.buildingNameMesh = MeshBuilder.CreatePlane('building_name_indicator', { width: 4, height: 0.5 }, this.scene);
      this.buildingNameMesh.billboardMode = Mesh.BILLBOARDMODE_ALL;
      this.buildingNameMesh.isPickable = false;
      this.buildingNameMesh.renderingGroupId = 3;

      this.buildingNameMaterial = new StandardMaterial('building_name_mat', this.scene);
      this.buildingNameMaterial.disableLighting = true;
      this.buildingNameMaterial.backFaceCulling = false;
      this.buildingNameMesh.material = this.buildingNameMaterial;
    }

    // Position in upper area relative to camera — will be updated per frame
    this.buildingNameMesh.isVisible = true;

    // Render text via dynamic texture
    // DynamicTexture imported at top level
    const texW = 512;
    const texH = 64;
    const tex = new DynamicTexture('building_name_tex', { width: texW, height: texH }, this.scene);
    tex.hasAlpha = true;
    const ctx = tex.getContext() as any;
    ctx.clearRect(0, 0, texW, texH);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(4, 4, texW - 8, texH - 8, 8);
    else ctx.fillRect(4, 4, texW - 8, texH - 8);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, texW / 2, texH / 2);
    tex.update();

    this.buildingNameMaterial!.diffuseTexture = tex;
    this.buildingNameMaterial!.emissiveColor = Color3.White();
    this.buildingNameMaterial!.alpha = 1;
    this.buildingNameMaterial!.useAlphaFromDiffuseTexture = true;

    // Update position every frame to track camera
    if (!this._nameTrackObserver) {
      this._nameTrackObserver = this.scene.onBeforeRenderObservable.add(() => {
        if (!this.buildingNameMesh?.isVisible || !this.scene?.activeCamera) return;
        const cam = this.scene.activeCamera;
        const forward = cam.getForwardRay().direction.normalize();
        // Place in upper-center of view
        this.buildingNameMesh.position = cam.position.add(forward.scale(5)).add(new Vector3(0, 2, 0));
      });
    }
  }

  private _nameTrackObserver: Observer<Scene> | null = null;

  /**
   * Hide the building name indicator.
   */
  private hideBuildingNameIndicator(): void {
    if (this.buildingNameMesh) {
      this.buildingNameMesh.isVisible = false;
    }
    if (this._nameTrackObserver) {
      this.scene.onBeforeRenderObservable.remove(this._nameTrackObserver);
      this._nameTrackObserver = null;
    }
  }

  /**
   * Fade-to-black / fade-from-black transition.
   * Duration configurable via FADE_DURATION_MS (0.5s per acceptance criteria).
   */
  private performFadeTransition(fadeOut: boolean): Promise<void> {
    if (this._fadeOverride) return this._fadeOverride(fadeOut);
    return new Promise((resolve) => {
      if (!this.scene) { resolve(); return; }

      const overlay = MeshBuilder.CreatePlane('entry_fade_overlay', { size: 500 }, this.scene);
      overlay.position = this.scene.activeCamera
        ? this.scene.activeCamera.position.clone()
        : Vector3.Zero();
      overlay.billboardMode = Mesh.BILLBOARDMODE_ALL;
      overlay.renderingGroupId = 3;
      overlay.isPickable = false;

      const mat = new StandardMaterial('entry_fade_mat', this.scene);
      mat.diffuseColor = Color3.Black();
      mat.emissiveColor = Color3.Black();
      mat.disableLighting = true;
      mat.backFaceCulling = false;
      mat.alpha = fadeOut ? 0 : 1;
      overlay.material = mat;

      const startTime = Date.now();
      const startAlpha = fadeOut ? 0 : 1;
      const endAlpha = fadeOut ? 1 : 0;

      const observer = this.scene.onBeforeRenderObservable.add(() => {
        const elapsed = Date.now() - startTime;
        const t = Math.min(elapsed / FADE_DURATION_MS, 1);
        mat.alpha = startAlpha + (endAlpha - startAlpha) * t;

        // Keep overlay in front of camera
        if (this.scene?.activeCamera) {
          const cam = this.scene.activeCamera;
          const forward = cam.getForwardRay().direction.normalize();
          overlay.position = cam.position.add(forward.scale(1));
        }

        if (t >= 1) {
          if (this.scene) {
            this.scene.onBeforeRenderObservable.remove(observer);
          }
          overlay.dispose();
          mat.dispose();
          resolve();
        }
      });
    });
  }

  /**
   * Clean up all resources.
   */
  dispose(): void {
    if (this.renderObserver) {
      this.scene.onBeforeRenderObservable.remove(this.renderObserver);
      this.renderObserver = null;
    }

    if (this.keyboardHandler) {
      window.removeEventListener('keydown', this.keyboardHandler);
      this.keyboardHandler = null;
    }

    if (this._nameTrackObserver) {
      this.scene.onBeforeRenderObservable.remove(this._nameTrackObserver);
      this._nameTrackObserver = null;
    }

    // Dispose prompt
    if (this.promptMesh) {
      const tex = (this.promptMaterial as any)?._dynamicTexture;
      if (tex) tex.dispose();
      this.promptMaterial?.dispose();
      this.promptMesh.dispose();
      this.promptMesh = null;
      this.promptMaterial = null;
    }

    // Dispose building name indicator
    if (this.buildingNameMesh) {
      const tex = this.buildingNameMaterial?.diffuseTexture;
      if (tex) tex.dispose();
      this.buildingNameMaterial?.dispose();
      this.buildingNameMesh.dispose();
      this.buildingNameMesh = null;
      this.buildingNameMaterial = null;
    }

    this.buildings.clear();
    this.doorEntryPoints.clear();
    this.npcPauseCallbacks = [];
    this.interiorNPCManager = null;
    this.npcDataSource = null;
    this.playerCharacterIdSource = null;
    this.isInsideBuilding = false;
    this.activeInterior = null;
    this.savedOverworldPosition = null;
    this.activeBuildingId = null;
    this.nearestDoorBuildingId = null;
  }
}
