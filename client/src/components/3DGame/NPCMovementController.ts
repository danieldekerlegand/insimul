/**
 * NPC Movement Controller
 *
 * Bridges PathfindingSystem with CharacterController to provide high-level
 * movement commands for NPCs: moveTo, queue, interrupt, face-target, and
 * conversation pause/resume.
 */

import { Vector3, Mesh, Scene } from '@babylonjs/core';
import { PathfindingSystem } from './PathfindingSystem';

// --- Types ---

export type MovementSpeed = 'stroll' | 'walk' | 'hurry';

export interface MovementCommand {
  target: Vector3;
  speed: MovementSpeed;
  callback?: () => void;
}

export interface NPCMovementState {
  /** Currently moving toward a waypoint */
  isMoving: boolean;
  /** Paused for conversation */
  isInConversation: boolean;
  /** Current speed tier */
  speed: MovementSpeed;
  /** Final destination of current move */
  destination: Vector3 | null;
}

/** Speed values in m/s for each tier */
const SPEED_VALUES: Record<MovementSpeed, number> = {
  stroll: 1.5,
  walk: 3.0,
  hurry: 5.0,
};

/** Arrival tolerance in world units */
const ARRIVAL_TOLERANCE = 0.5;

/** Smooth turn speed in radians per second */
const TURN_SPEED = 5.0;

/** Minimum angle difference to trigger turning (radians) */
const TURN_THRESHOLD = 0.05;

// --- Minimal CharacterController interface (avoid importing the full 2000-line class) ---

export interface ICharacterController {
  walk(b: boolean): void;
  run(b: boolean): void;
  turnLeft(b: boolean): void;
  turnRight(b: boolean): void;
  setWalkSpeed(n: number): void;
  setRunSpeed(n: number): void;
  start(): void;
  stop(): void;
}

// --- Controller ---

export class NPCMovementController {
  private npcId: string;
  private mesh: Mesh;
  private scene: Scene;
  private pathfinding: PathfindingSystem;
  private controller: ICharacterController;

  /** Queue of pending move commands */
  private moveQueue: MovementCommand[] = [];
  /** Currently executing command */
  private currentCommand: MovementCommand | null = null;
  /** Current waypoint we're walking toward */
  private currentWaypoint: Vector3 | null = null;

  private _isMoving = false;
  private _isInConversation = false;
  private _currentSpeed: MovementSpeed = 'walk';

  /** Stored command to resume after conversation */
  private savedCommand: MovementCommand | null = null;
  private savedQueue: MovementCommand[] = [];

  /** Position of conversation partner to face */
  private faceTarget: Vector3 | null = null;

  constructor(
    npcId: string,
    mesh: Mesh,
    scene: Scene,
    pathfinding: PathfindingSystem,
    controller: ICharacterController
  ) {
    this.npcId = npcId;
    this.mesh = mesh;
    this.scene = scene;
    this.pathfinding = pathfinding;
    this.controller = controller;
  }

  // --- Public API ---

  /**
   * Move NPC to target position along a pathfinding route.
   * If already moving, cancels current movement and reroutes.
   */
  moveTo(target: Vector3, speed?: MovementSpeed, callback?: () => void): void {
    if (this._isInConversation) return;

    // Cancel current movement
    this.cancelCurrentMovement();

    const cmd: MovementCommand = {
      target: target.clone(),
      speed: speed ?? 'walk',
      callback,
    };

    this.startCommand(cmd);
  }

  /**
   * Queue a movement command to execute after current movement completes.
   */
  queueMoveTo(target: Vector3, speed?: MovementSpeed, callback?: () => void): void {
    this.moveQueue.push({
      target: target.clone(),
      speed: speed ?? 'walk',
      callback,
    });
  }

  /**
   * Stop NPC and face the player/partner for conversation.
   * Pauses current movement and queue; resumes after endConversation().
   */
  startConversation(partnerPosition: Vector3): void {
    if (this._isInConversation) return;
    this._isInConversation = true;

    // Save current state for resume
    this.savedCommand = this.currentCommand;
    this.savedQueue = [...this.moveQueue];

    // Stop movement
    this.stopMovement();
    this.currentCommand = null;
    this.moveQueue = [];

    // Face the conversation partner
    this.faceTarget = partnerPosition.clone();
  }

  /**
   * End conversation and resume previous movement if any.
   */
  endConversation(): void {
    if (!this._isInConversation) return;
    this._isInConversation = false;
    this.faceTarget = null;

    // Resume saved movement
    if (this.savedCommand) {
      this.moveQueue = this.savedQueue;
      this.startCommand(this.savedCommand);
      this.savedCommand = null;
      this.savedQueue = [];
    }
  }

  /**
   * Cancel all movement and clear queue.
   */
  cancelAll(): void {
    this.cancelCurrentMovement();
    this.moveQueue = [];
  }

  /**
   * Get current movement state.
   */
  getState(): NPCMovementState {
    return {
      isMoving: this._isMoving,
      isInConversation: this._isInConversation,
      speed: this._currentSpeed,
      destination: this.currentCommand?.target ?? null,
    };
  }

  /**
   * Called every frame to update NPC position along the pathfinding route.
   * Should be called from the game loop.
   */
  update(deltaTime: number): void {
    // Update dynamic obstacle position for this NPC
    this.pathfinding.setDynamicObstacle(this.npcId, this.mesh.position);

    if (this._isInConversation) {
      this.updateFaceTarget(deltaTime);
      return;
    }

    if (!this._isMoving || !this.currentWaypoint) return;

    const position = this.mesh.position;
    const target = this.currentWaypoint;

    // Horizontal direction to waypoint
    const dx = target.x - position.x;
    const dz = target.z - position.z;
    const distXZ = Math.sqrt(dx * dx + dz * dz);

    // Check arrival at current waypoint
    if (distXZ < ARRIVAL_TOLERANCE) {
      // Advance to next waypoint
      const next = this.pathfinding.advanceWaypoint(this.npcId);
      if (next) {
        this.currentWaypoint = next;
      } else {
        // Reached final destination
        this.arriveAtDestination();
      }
      return;
    }

    // Rotate NPC to face movement direction (smooth slerp)
    const targetAngle = Math.atan2(dx, dz);
    this.smoothRotateToward(targetAngle, deltaTime);

    // Apply avoidance steering
    const heading = new Vector3(
      Math.sin(this.mesh.rotation.y),
      0,
      Math.cos(this.mesh.rotation.y)
    );
    const avoidance = this.pathfinding.getAvoidanceOffset(
      this.npcId,
      position,
      heading
    );

    // Move forward via CharacterController walk/run
    const speedValue = SPEED_VALUES[this._currentSpeed];
    if (this._currentSpeed === 'hurry') {
      this.controller.setRunSpeed(speedValue);
      this.controller.run(true);
      this.controller.walk(false);
    } else {
      this.controller.setWalkSpeed(speedValue);
      this.controller.walk(true);
      this.controller.run(false);
    }

    // Apply avoidance offset directly to mesh position (small lateral nudge)
    if (avoidance.length() > 0.01) {
      const avoidStep = avoidance.scale(deltaTime);
      this.mesh.position.addInPlace(avoidStep);
    }
  }

  /**
   * Dispose resources.
   */
  dispose(): void {
    this.cancelAll();
    this.pathfinding.removeDynamicObstacle(this.npcId);
    this.pathfinding.clearActivePath(this.npcId);
    this.pathfinding.cancelRequest(this.npcId);
  }

  // --- Private helpers ---

  private startCommand(cmd: MovementCommand): void {
    this.currentCommand = cmd;
    this._currentSpeed = cmd.speed;

    // Request path from pathfinding system
    this.pathfinding.requestPath(
      this.npcId,
      this.mesh.position.clone(),
      cmd.target,
      (path: Vector3[]) => {
        this.onPathComputed(path, cmd);
      },
      5 // medium priority
    );
  }

  private onPathComputed(path: Vector3[], cmd: MovementCommand): void {
    // If command was cancelled in the meantime, ignore
    if (this.currentCommand !== cmd) return;

    if (path.length === 0) {
      // No path found — skip to callback and process queue
      this.currentCommand = null;
      if (cmd.callback) cmd.callback();
      this.processQueue();
      return;
    }

    // Set active path in pathfinding system for tracking
    this.pathfinding.setActivePath(this.npcId, path, cmd.target);
    this.currentWaypoint = path[0];
    this._isMoving = true;
  }

  private arriveAtDestination(): void {
    const cmd = this.currentCommand;
    this.stopMovement();
    this.currentCommand = null;

    if (cmd?.callback) {
      cmd.callback();
    }

    this.processQueue();
  }

  private processQueue(): void {
    if (this.moveQueue.length === 0) return;
    const next = this.moveQueue.shift()!;
    this.startCommand(next);
  }

  private cancelCurrentMovement(): void {
    this.stopMovement();
    this.pathfinding.cancelRequest(this.npcId);
    this.pathfinding.clearActivePath(this.npcId);
    this.currentCommand = null;
    this.currentWaypoint = null;
  }

  private stopMovement(): void {
    this._isMoving = false;
    this.currentWaypoint = null;
    this.controller.walk(false);
    this.controller.run(false);
    this.controller.turnLeft(false);
    this.controller.turnRight(false);
  }

  /**
   * Smoothly rotate mesh toward target angle using slerp-like interpolation.
   */
  private smoothRotateToward(targetAngle: number, deltaTime: number): void {
    let current = this.mesh.rotation.y;

    // Normalize angles to [-PI, PI]
    let diff = targetAngle - current;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;

    if (Math.abs(diff) < TURN_THRESHOLD) {
      this.controller.turnLeft(false);
      this.controller.turnRight(false);
      return;
    }

    // Smooth interpolation
    const step = TURN_SPEED * deltaTime;
    if (Math.abs(diff) <= step) {
      this.mesh.rotation.y = targetAngle;
    } else {
      this.mesh.rotation.y += Math.sign(diff) * step;
    }

    // Normalize result
    while (this.mesh.rotation.y > Math.PI) this.mesh.rotation.y -= Math.PI * 2;
    while (this.mesh.rotation.y < -Math.PI) this.mesh.rotation.y += Math.PI * 2;
  }

  /**
   * Face toward conversation partner while in conversation.
   */
  private updateFaceTarget(deltaTime: number): void {
    if (!this.faceTarget) return;

    const dx = this.faceTarget.x - this.mesh.position.x;
    const dz = this.faceTarget.z - this.mesh.position.z;
    const targetAngle = Math.atan2(dx, dz);
    this.smoothRotateToward(targetAngle, deltaTime);
  }
}
