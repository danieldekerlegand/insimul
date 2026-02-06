/**
 * Quest Waypoint Manager
 *
 * Creates visual waypoint markers (beams of light with floating icons) to guide
 * players to quest objectives. Different colors for different objective types.
 */

import { Scene, Mesh, MeshBuilder, StandardMaterial, Color3, Vector3, Animation } from '@babylonjs/core';

export class QuestWaypointManager {
  private scene: Scene;
  private waypoints: Map<string, Mesh> = new Map();

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Create a waypoint marker for a quest objective
   * @param objectiveId - Unique identifier for the objective
   * @param position - World position for the waypoint
   * @param color - Color of the waypoint beam (default: gold)
   * @param height - Height of the beam (default: 20)
   */
  public createWaypoint(
    objectiveId: string,
    position: Vector3,
    color: Color3 = new Color3(1, 0.8, 0),
    height: number = 20
  ): void {
    // Remove existing waypoint if one exists
    if (this.waypoints.has(objectiveId)) {
      this.removeWaypoint(objectiveId);
    }

    // Create beam of light (cylinder)
    const beam = MeshBuilder.CreateCylinder(
      `waypoint_beam_${objectiveId}`,
      { height, diameter: 0.5 },
      this.scene
    );

    beam.position = position.clone();
    beam.position.y += height / 2;

    // Create glowing material for beam
    const beamMat = new StandardMaterial(`waypoint_mat_${objectiveId}`, this.scene);
    beamMat.emissiveColor = color;
    beamMat.alpha = 0.6;
    beam.material = beamMat;

    // Create floating marker at top of beam
    const marker = MeshBuilder.CreateSphere(
      `waypoint_marker_${objectiveId}`,
      { diameter: 2, segments: 16 },
      this.scene
    );

    marker.position = new Vector3(0, height / 2 + 1, 0);
    marker.parent = beam;

    // Create glowing material for marker
    const markerMat = new StandardMaterial(`waypoint_marker_mat_${objectiveId}`, this.scene);
    markerMat.emissiveColor = color;
    markerMat.diffuseColor = color;
    marker.material = markerMat;

    // Add pulsing animation to marker
    const pulseAnim = new Animation(
      `waypoint_pulse_${objectiveId}`,
      'scaling',
      30,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    pulseAnim.setKeys([
      { frame: 0, value: new Vector3(1, 1, 1) },
      { frame: 30, value: new Vector3(1.3, 1.3, 1.3) },
      { frame: 60, value: new Vector3(1, 1, 1) },
    ]);

    marker.animations.push(pulseAnim);
    this.scene.beginAnimation(marker, 0, 60, true);

    // Add gentle rotation to beam
    const rotateAnim = new Animation(
      `waypoint_rotate_${objectiveId}`,
      'rotation.y',
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    rotateAnim.setKeys([
      { frame: 0, value: 0 },
      { frame: 120, value: Math.PI * 2 },
    ]);

    beam.animations.push(rotateAnim);
    this.scene.beginAnimation(beam, 0, 120, true);

    // Store waypoint reference
    this.waypoints.set(objectiveId, beam);

    console.log(`[QuestWaypointManager] Created waypoint for objective: ${objectiveId}`);
  }

  /**
   * Create waypoint with objective type auto-coloring
   * @param objectiveId - Unique identifier for the objective
   * @param position - World position for the waypoint
   * @param objectiveType - Type of objective (determines color)
   */
  public createWaypointForObjectiveType(
    objectiveId: string,
    position: Vector3,
    objectiveType: string
  ): void {
    let color = new Color3(1, 0.8, 0); // Gold default

    // Color code by objective type
    switch (objectiveType) {
      case 'defeat_enemies':
      case 'combat':
        color = new Color3(1, 0, 0); // Red for combat
        break;

      case 'reach_location':
      case 'discover_location':
      case 'visit_location':
      case 'exploration':
        color = new Color3(0, 1, 1); // Cyan for exploration
        break;

      case 'talk_to_npc':
      case 'social':
      case 'conversation':
        color = new Color3(0, 1, 0); // Green for social
        break;

      case 'collect_item':
      case 'collect_items':
      case 'collection':
        color = new Color3(1, 0.84, 0); // Gold for collection
        break;

      case 'craft_item':
      case 'crafting':
        color = new Color3(1, 0.5, 0); // Orange for crafting
        break;

      case 'escort_npc':
      case 'deliver_item':
      case 'escort':
      case 'delivery':
        color = new Color3(0.5, 0, 1); // Purple for escort/delivery
        break;

      default:
        color = new Color3(1, 1, 1); // White for unknown
    }

    this.createWaypoint(objectiveId, position, color);
  }

  /**
   * Remove a waypoint
   * @param objectiveId - The objective ID whose waypoint to remove
   */
  public removeWaypoint(objectiveId: string): void {
    const waypoint = this.waypoints.get(objectiveId);
    if (waypoint) {
      this.scene.stopAnimation(waypoint);

      // Dispose children (marker)
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

      console.log(`[QuestWaypointManager] Removed waypoint for objective: ${objectiveId}`);
    }
  }

  /**
   * Update waypoint position (useful for moving objectives)
   * @param objectiveId - The objective ID whose waypoint to update
   * @param position - New world position
   */
  public updateWaypointPosition(objectiveId: string, position: Vector3): void {
    const waypoint = this.waypoints.get(objectiveId);
    if (waypoint) {
      const height = waypoint.scaling.y;
      waypoint.position = position.clone();
      waypoint.position.y += height / 2;
    }
  }

  /**
   * Check if a waypoint exists for an objective
   * @param objectiveId - The objective ID to check
   */
  public hasWaypoint(objectiveId: string): boolean {
    return this.waypoints.has(objectiveId);
  }

  /**
   * Get waypoint mesh for an objective
   * @param objectiveId - The objective ID
   */
  public getWaypoint(objectiveId: string): Mesh | undefined {
    return this.waypoints.get(objectiveId);
  }

  /**
   * Clear all waypoints
   */
  public clearAll(): void {
    this.waypoints.forEach((waypoint, id) => {
      this.removeWaypoint(id);
    });
  }

  /**
   * Get count of active waypoints
   */
  public getWaypointCount(): number {
    return this.waypoints.size;
  }

  /**
   * Dispose of all waypoints and clean up resources
   */
  public dispose(): void {
    this.clearAll();
    console.log('[QuestWaypointManager] Disposed all waypoints');
  }
}
