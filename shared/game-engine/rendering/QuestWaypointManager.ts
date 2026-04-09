/**
 * Quest Waypoint Manager
 *
 * Creates visual waypoint markers (beams of light with floating icons) to guide
 * players to quest objectives. Different colors for different objective types.
 * Supports distance-based fading and per-frame updates.
 */

import { Scene, Mesh, MeshBuilder, StandardMaterial, Color3, Vector3, Animation, DynamicTexture } from '@babylonjs/core';
import { computeWaypointAlpha } from '@shared/game-engine/logic/waypointFading';

/** Color mapping for objective types */
export function getWaypointColor(objectiveType: string): Color3 {
  switch (objectiveType) {
    case 'defeat_enemies':
    case 'combat':
      return new Color3(1, 0, 0); // Red
    case 'reach_location':
    case 'discover_location':
    case 'visit_location':
    case 'exploration':
      return new Color3(0, 1, 1); // Cyan
    case 'talk_to_npc':
    case 'social':
    case 'conversation':
    case 'complete_conversation':
    case 'introduce_self':
    case 'build_friendship':
      return new Color3(0, 1, 0); // Green
    case 'collect_item':
    case 'collect_items':
    case 'collection':
      return new Color3(1, 0.84, 0); // Gold
    case 'craft_item':
    case 'crafting':
      return new Color3(1, 0.5, 0); // Orange
    case 'order_food':
    case 'haggle_price':
      return new Color3(1, 0.6, 0); // Orange for commerce
    case 'escort_npc':
    case 'deliver_item':
    case 'escort':
    case 'delivery':
      return new Color3(0.5, 0, 1); // Purple
    case 'use_vocabulary':
    case 'pronunciation_check':
    case 'translation_challenge':
    case 'listening_comprehension':
      return new Color3(0.2, 0.6, 1); // Blue for language
    case 'complete_assessment':
    case 'arrival_reading':
    case 'arrival_writing':
    case 'arrival_listening':
    case 'arrival_initiate_conversation':
    case 'arrival_conversation':
    case 'departure_reading':
    case 'departure_writing':
    case 'departure_listening':
    case 'departure_conversation':
    case 'periodic_conversational':
      return new Color3(1, 0.84, 0); // Gold for assessments
    default:
      return new Color3(1, 1, 1); // White
  }
}

export class QuestWaypointManager {
  private scene: Scene;
  private waypoints: Map<string, Mesh> = new Map();
  private waypointBaseAlphas: Map<string, number> = new Map();

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Create a waypoint marker for a quest objective
   */
  public createWaypoint(
    objectiveId: string,
    position: Vector3,
    color: Color3 = new Color3(1, 0.8, 0),
    _height: number = 4
  ): void {
    if (this.waypoints.has(objectiveId)) {
      this.removeWaypoint(objectiveId);
    }

    // Floating exclamation point billboard
    const size = 1.2;
    const plane = MeshBuilder.CreatePlane(
      `waypoint_${objectiveId}`,
      { width: size, height: size },
      this.scene
    );

    plane.position = position.clone();
    plane.position.y += _height;
    plane.billboardMode = Mesh.BILLBOARDMODE_ALL;

    // Draw "!" on a dynamic texture
    const texSize = 128;
    const tex = new DynamicTexture(`waypoint_tex_${objectiveId}`, texSize, this.scene, false);
    const ctx2d = tex.getContext();

    // Background circle
    const cx = texSize / 2;
    const cy = texSize / 2;
    const radius = texSize * 0.42;
    ctx2d.beginPath();
    ctx2d.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx2d.fillStyle = `rgb(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)})`;
    ctx2d.fill();
    ctx2d.lineWidth = 3;
    ctx2d.strokeStyle = '#FFFFFF';
    ctx2d.stroke();

    // Exclamation mark
    ctx2d.font = 'bold 80px Arial';
    ctx2d.fillStyle = '#000000';
    (ctx2d as any).textAlign = 'center';
    (ctx2d as any).textBaseline = 'middle';
    ctx2d.fillText('!', cx, cy + 2);
    tex.update();
    tex.hasAlpha = true;

    const mat = new StandardMaterial(`waypoint_mat_${objectiveId}`, this.scene);
    mat.diffuseTexture = tex;
    mat.emissiveColor = new Color3(0.5, 0.5, 0.5);
    mat.useAlphaFromDiffuseTexture = true;
    mat.disableLighting = true;
    mat.backFaceCulling = false;
    plane.material = mat;

    // Bobbing animation (float up and down)
    const bobAnim = new Animation(
      `waypoint_bob_${objectiveId}`,
      'position.y',
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );
    const baseY = plane.position.y;
    bobAnim.setKeys([
      { frame: 0, value: baseY },
      { frame: 30, value: baseY + 0.4 },
      { frame: 60, value: baseY },
    ]);
    plane.animations.push(bobAnim);
    this.scene.beginAnimation(plane, 0, 60, true);

    this.waypoints.set(objectiveId, plane);
    this.waypointBaseAlphas.set(objectiveId, 1.0);
  }

  /**
   * Create waypoint with objective type auto-coloring
   */
  public createWaypointForObjectiveType(
    objectiveId: string,
    position: Vector3,
    objectiveType: string
  ): void {
    this.createWaypoint(objectiveId, position, getWaypointColor(objectiveType));
  }

  /**
   * Update visibility of all waypoints based on distance to player.
   * Call this per-frame or on a throttled interval.
   */
  /** Max alpha for beam materials (translucent light columns) */
  private static readonly BEAM_MAX_ALPHA = 0.6;

  public updateDistanceFading(playerPosition: Vector3): void {
    this.waypoints.forEach((beam, id) => {
      const dist = Vector3.Distance(
        new Vector3(playerPosition.x, 0, playerPosition.z),
        new Vector3(beam.position.x, 0, beam.position.z)
      );

      // Shared fading curve scaled to beam max alpha
      const alpha = computeWaypointAlpha(dist) * QuestWaypointManager.BEAM_MAX_ALPHA;

      const beamMat = beam.material as StandardMaterial;
      if (beamMat) beamMat.alpha = alpha;

      // Update marker alpha too
      const children = beam.getChildren ? beam.getChildren() : [];
      for (const child of children) {
        if (child instanceof Mesh && child.material) {
          (child.material as StandardMaterial).alpha = Math.min(1, alpha * 1.5);
        }
      }

      this.waypointBaseAlphas.set(id, alpha);
    });
  }

  /**
   * Remove a waypoint
   */
  public removeWaypoint(objectiveId: string): void {
    const waypoint = this.waypoints.get(objectiveId);
    if (waypoint) {
      this.scene.stopAnimation(waypoint);

      if (waypoint.getChildren) {
        waypoint.getChildren().forEach(child => {
          if (child instanceof Mesh) {
            this.scene.stopAnimation(child);
            child.dispose();
          }
        });
      }

      waypoint.dispose();
      this.waypoints.delete(objectiveId);
      this.waypointBaseAlphas.delete(objectiveId);

    }
  }

  /**
   * Update waypoint position (useful for moving objectives)
   */
  public updateWaypointPosition(objectiveId: string, position: Vector3): void {
    const waypoint = this.waypoints.get(objectiveId);
    if (waypoint) {
      const height = waypoint.scaling.y;
      waypoint.position = position.clone();
      waypoint.position.y += height / 2;
    }
  }

  public hasWaypoint(objectiveId: string): boolean {
    return this.waypoints.has(objectiveId);
  }

  public getWaypoint(objectiveId: string): Mesh | undefined {
    return this.waypoints.get(objectiveId);
  }

  /** Get all active waypoint IDs */
  public getWaypointIds(): string[] {
    return Array.from(this.waypoints.keys());
  }

  public clearAll(): void {
    const ids = Array.from(this.waypoints.keys());
    for (const id of ids) {
      this.removeWaypoint(id);
    }
  }

  public getWaypointCount(): number {
    return this.waypoints.size;
  }

  public dispose(): void {
    this.clearAll();
  }
}
