/**
 * Babylon Minimap
 *
 * Displays a minimap showing player position, settlements, NPCs, and quest objectives
 */

import { Scene, Vector3, Mesh } from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';

export interface MinimapMarker {
  id: string;
  position: Vector3;
  type: 'player' | 'settlement' | 'npc' | 'quest' | 'building';
  label?: string;
  color?: string;
}

export class BabylonMinimap {
  private scene: Scene;
  private advancedTexture: GUI.AdvancedDynamicTexture;
  private container: GUI.Rectangle | null = null;
  private mapContainer: GUI.Rectangle | null = null;
  private titleBlock: GUI.TextBlock | null = null;
  private isVisible: boolean = false;
  private _expanded: boolean = true;

  private markers: Map<string, MinimapMarker> = new Map();
  private markerElements: Map<string, GUI.Ellipse> = new Map();

  // Minimap configuration
  private mapSize: number = 50; // Size in pixels
  private worldSize: number = 1024; // World size in game units
  private mapScale: number = 1; // Pixels per game unit

  constructor(scene: Scene, advancedTexture: GUI.AdvancedDynamicTexture, worldSize: number = 1024) {
    this.scene = scene;
    this.advancedTexture = advancedTexture;
    this.worldSize = worldSize;
    this.mapScale = this.mapSize / this.worldSize;

    this.createMinimap();
  }

  /**
   * Create the minimap UI
   */
  private createMinimap(): void {
    const containerW = this.mapSize + 14;

    // Main container (background)
    this.container = new GUI.Rectangle('minimapContainer');
    this.container.width = `${containerW}px`;
    this.container.height = `${this.mapSize + 20}px`;
    this.container.cornerRadius = 6;
    this.container.color = 'rgba(255, 255, 255, 0.6)';
    this.container.thickness = 1;
    this.container.background = 'rgba(0, 0, 0, 0.7)';
    this.container.isPointerBlocker = true;
    this.advancedTexture.addControl(this.container);

    // Position in top-right corner
    this.container.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    this.container.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    this.container.left = '-8px';
    this.container.top = '8px';

    // Title — click to collapse/expand
    const title = new GUI.TextBlock('minimapTitle');
    title.text = '▼ Map';
    title.height = '16px';
    title.fontSize = 9;
    title.fontWeight = 'bold';
    title.color = 'white';
    title.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    title.top = '2px';
    this.container.addControl(title);
    this.titleBlock = title;

    // Click container to toggle collapse
    this.container.onPointerClickObservable.add(() => {
      this._expanded = !this._expanded;
      if (this._expanded) {
        this.container!.height = `${this.mapSize + 20}px`;
        if (this.mapContainer) this.mapContainer.isVisible = true;
        title.text = '▼ Map';
      } else {
        this.container!.height = '20px';
        if (this.mapContainer) this.mapContainer.isVisible = false;
        title.text = '▶ Map';
      }
    });

    // Map container (the actual map area)
    this.mapContainer = new GUI.Rectangle('minimapMap');
    this.mapContainer.width = `${this.mapSize}px`;
    this.mapContainer.height = `${this.mapSize}px`;
    this.mapContainer.thickness = 1;
    this.mapContainer.color = 'rgba(100, 100, 100, 0.5)';
    this.mapContainer.background = 'rgba(20, 20, 20, 0.8)';
    this.mapContainer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    this.mapContainer.top = '18px';
    this.container.addControl(this.mapContainer);

    // Initially hidden
    this.container.isVisible = false;
  }

  /** Total width of the minimap container in pixels. */
  public get containerWidth(): number {
    return this.mapSize + 14;
  }

  /** Total height of the minimap container in pixels. */
  public get containerHeight(): number {
    return this._expanded ? this.mapSize + 20 : 20;
  }

  /**
   * Show the minimap
   */
  public show(): void {
    if (this.container) {
      this.container.isVisible = true;
      this.isVisible = true;
    }
  }

  /**
   * Hide the minimap
   */
  public hide(): void {
    if (this.container) {
      this.container.isVisible = false;
      this.isVisible = false;
    }
  }

  /**
   * Toggle minimap visibility
   */
  public toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Add or update a marker on the minimap
   */
  public addMarker(marker: MinimapMarker): void {
    // Early return if minimap is not initialized
    if (!this.mapContainer) return;

    this.markers.set(marker.id, marker);

    // Create visual marker if it doesn't exist
    if (!this.markerElements.has(marker.id)) {
      const markerElement = new GUI.Ellipse(`minimap_marker_${marker.id}`);

      // Size based on type
      const size = marker.type === 'player' ? 6 :
                   marker.type === 'settlement' ? 8 :
                   marker.type === 'quest' ? 7 :
                   marker.type === 'building' ? 3 : 4;

      markerElement.width = `${size}px`;
      markerElement.height = `${size}px`;

      // Color based on type
      const color = marker.color || this.getDefaultColor(marker.type);
      markerElement.background = color;
      markerElement.color = color;
      markerElement.thickness = marker.type === 'player' ? 2 : 0;

      this.mapContainer.addControl(markerElement);
      this.markerElements.set(marker.id, markerElement);
    }

    // Update position
    this.updateMarkerPosition(marker.id);
  }

  /**
   * Remove a marker from the minimap
   */
  public removeMarker(markerId: string): void {
    this.markers.delete(markerId);

    const markerElement = this.markerElements.get(markerId);
    if (markerElement && this.mapContainer) {
      this.mapContainer.removeControl(markerElement);
      markerElement.dispose();
      this.markerElements.delete(markerId);
    }
  }

  /**
   * Update marker position
   */
  private updateMarkerPosition(markerId: string): void {
    const marker = this.markers.get(markerId);
    const markerElement = this.markerElements.get(markerId);

    if (!marker || !markerElement || !this.mapContainer) return;

    // Convert world position to minimap position
    // World coordinates: (-worldSize/2, worldSize/2) maps to (0, mapSize)
    const worldHalf = this.worldSize / 2;
    const mapHalf = this.mapSize / 2;

    const mapX = ((marker.position.x + worldHalf) / this.worldSize) * this.mapSize - mapHalf;
    const mapY = ((marker.position.z + worldHalf) / this.worldSize) * this.mapSize - mapHalf;

    markerElement.left = `${mapX}px`;
    markerElement.top = `${mapY}px`;
  }

  /**
   * Update all marker positions (call from render loop)
   */
  public update(): void {
    if (!this.isVisible) return;

    // Update positions for all markers
    for (const markerId of this.markers.keys()) {
      this.updateMarkerPosition(markerId);
    }
  }

  /**
   * Get default color for marker type
   */
  private getDefaultColor(type: string): string {
    switch (type) {
      case 'player':
        return 'cyan';
      case 'settlement':
        return 'orange';
      case 'npc':
        return 'yellow';
      case 'quest':
        return 'magenta';
      case 'building':
        return 'gray';
      default:
        return 'white';
    }
  }

  /**
   * Clear all markers
   */
  public clearMarkers(): void {
    // Remove all marker elements
    for (const [markerId, markerElement] of this.markerElements.entries()) {
      if (this.mapContainer) {
        this.mapContainer.removeControl(markerElement);
      }
      markerElement.dispose();
    }

    this.markers.clear();
    this.markerElements.clear();
  }

  /**
   * Dispose the minimap
   */
  public dispose(): void {
    this.clearMarkers();

    if (this.container) {
      this.advancedTexture.removeControl(this.container);
      this.container.dispose();
      this.container = null;
    }

    this.mapContainer = null;
  }
}
