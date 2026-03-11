/**
 * Building Sign Manager
 *
 * Creates bilingual signs on buildings that adapt to the player's fluency level.
 * Also handles interactive object labels that teach vocabulary on hover/click.
 *
 * Fluency tiers:
 *   Beginner (0-30):     "Boulangerie (Bakery)"
 *   Intermediate (30-60): "Boulangerie"
 *   Advanced (60+):       "Boulangerie artisanale"
 */

import {
  AbstractMesh,
  ActionManager,
  DynamicTexture,
  ExecuteCodeAction,
  Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
} from '@babylonjs/core';
import type { VocabularyEntry } from '@shared/language-progress';

export interface BuildingSignData {
  buildingId: string;
  nativeName: string;       // English name (e.g. "Bakery")
  targetName: string;       // Target language name (e.g. "Boulangerie")
  targetDetail?: string;    // Advanced detail in target language
  buildingType: string;     // 'business' | 'residence' | 'municipal'
  businessType?: string;    // 'Tavern', 'Blacksmith', etc.
}

export interface InteractiveObjectData {
  objectId: string;
  nativeWord: string;
  targetWord: string;
  category?: string;
}

type FluencyTier = 'beginner' | 'intermediate' | 'advanced';

const SIGN_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  business:  { bg: 'rgba(60, 40, 20, 0.85)', border: '#c9a14a', text: '#f5e6c8' },
  residence: { bg: 'rgba(30, 40, 60, 0.85)', border: '#6888a8', text: '#c8d8e8' },
  municipal: { bg: 'rgba(50, 30, 50, 0.85)', border: '#a868a8', text: '#e0c0e0' },
};

export class BuildingSignManager {
  private scene: Scene;
  private signMeshes: Map<string, Mesh> = new Map();
  private objectLabels: Map<string, { mesh: Mesh; visible: boolean }> = new Map();
  private playerFluency: number = 0;

  // Callbacks
  private onSignClicked: ((data: BuildingSignData) => void) | null = null;
  private onObjectInteracted: ((data: InteractiveObjectData) => void) | null = null;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  public setPlayerFluency(fluency: number): void {
    this.playerFluency = fluency;
  }

  private getFluencyTier(): FluencyTier {
    if (this.playerFluency >= 60) return 'advanced';
    if (this.playerFluency >= 30) return 'intermediate';
    return 'beginner';
  }

  /**
   * Create a bilingual sign above a building mesh
   */
  public createBuildingSign(buildingMesh: AbstractMesh, data: BuildingSignData): Mesh | null {
    const tier = this.getFluencyTier();
    const signText = this.formatSignText(data, tier);

    // Calculate label position above building
    const bounds = buildingMesh.getBoundingInfo();
    const meshHeight = bounds
      ? (bounds.boundingBox.maximumWorld.y - bounds.boundingBox.minimumWorld.y)
      : 4;
    const labelY = meshHeight + 1.2;

    // Texture dimensions
    const texW = 512;
    const texH = tier === 'beginner' ? 128 : 96;

    const texture = new DynamicTexture(
      `sign_tex_${data.buildingId}`,
      { width: texW, height: texH },
      this.scene,
      false
    );

    const colors = SIGN_COLORS[data.buildingType] || SIGN_COLORS.business;
    this.renderSignTexture(texture, signText, colors, texW, texH, tier);

    // Billboard plane
    const planeW = 3.2;
    const planeH = planeW * (texH / texW);
    const plane = MeshBuilder.CreatePlane(
      `building_sign_${data.buildingId}`,
      { width: planeW, height: planeH },
      this.scene
    );

    const mat = new StandardMaterial(`sign_mat_${data.buildingId}`, this.scene);
    mat.diffuseTexture = texture;
    mat.emissiveTexture = texture;
    mat.disableLighting = true;
    mat.backFaceCulling = false;
    mat.useAlphaFromDiffuseTexture = true;
    plane.material = mat;

    plane.position = new Vector3(0, labelY, 0);
    plane.parent = buildingMesh;
    plane.billboardMode = Mesh.BILLBOARDMODE_ALL;
    plane.isPickable = true;

    // Click to add word to vocabulary
    if (!plane.actionManager) {
      plane.actionManager = new ActionManager(this.scene);
    }
    plane.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
        this.onSignClicked?.(data);
      })
    );

    this.signMeshes.set(data.buildingId, plane);
    return plane;
  }

  private formatSignText(data: BuildingSignData, tier: FluencyTier): { primary: string; secondary?: string } {
    switch (tier) {
      case 'beginner':
        return {
          primary: data.targetName,
          secondary: data.nativeName,
        };
      case 'intermediate':
        return { primary: data.targetName };
      case 'advanced':
        return { primary: data.targetDetail || data.targetName };
    }
  }

  private renderSignTexture(
    texture: DynamicTexture,
    text: { primary: string; secondary?: string },
    colors: { bg: string; border: string; text: string },
    w: number,
    h: number,
    tier: FluencyTier
  ): void {
    const ctx = texture.getContext() as unknown as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = colors.bg;
    this.roundRect(ctx, 4, 4, w - 8, h - 8, 10);
    ctx.fill();

    // Border
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 2;
    this.roundRect(ctx, 4, 4, w - 8, h - 8, 10);
    ctx.stroke();

    // Primary text (target language)
    ctx.fillStyle = colors.text;
    ctx.textAlign = 'center';

    if (text.secondary) {
      // Two-line: target language big, English smaller
      ctx.font = 'bold 30px serif';
      ctx.textBaseline = 'middle';
      ctx.fillText(text.primary, w / 2, h / 2 - 14, w - 24);

      ctx.font = '20px sans-serif';
      ctx.fillStyle = 'rgba(200, 200, 200, 0.7)';
      ctx.fillText(`(${text.secondary})`, w / 2, h / 2 + 18, w - 24);
    } else {
      ctx.font = 'bold 30px serif';
      ctx.textBaseline = 'middle';
      ctx.fillText(text.primary, w / 2, h / 2, w - 24);
    }

    texture.update();
    texture.hasAlpha = true;
  }

  /**
   * Create an interactive hover label for a world object
   */
  public registerInteractiveObject(
    objectMesh: AbstractMesh,
    data: InteractiveObjectData
  ): void {
    const tier = this.getFluencyTier();
    const labelText = tier === 'beginner'
      ? `${data.targetWord} (${data.nativeWord})`
      : data.targetWord;

    const texW = 256;
    const texH = 64;
    const texture = new DynamicTexture(
      `obj_label_tex_${data.objectId}`,
      { width: texW, height: texH },
      this.scene,
      false
    );

    const ctx = texture.getContext() as unknown as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, texW, texH);

    ctx.fillStyle = 'rgba(20, 20, 40, 0.8)';
    this.roundRect(ctx, 2, 2, texW - 4, texH - 4, 8);
    ctx.fill();

    ctx.strokeStyle = '#68a8d8';
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, 2, 2, texW - 4, texH - 4, 8);
    ctx.stroke();

    ctx.fillStyle = '#e0f0ff';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(labelText, texW / 2, texH / 2, texW - 16);

    texture.update();
    texture.hasAlpha = true;

    const planeW = 1.8;
    const planeH = planeW * (texH / texW);
    const plane = MeshBuilder.CreatePlane(
      `obj_label_${data.objectId}`,
      { width: planeW, height: planeH },
      this.scene
    );

    const mat = new StandardMaterial(`obj_label_mat_${data.objectId}`, this.scene);
    mat.diffuseTexture = texture;
    mat.emissiveTexture = texture;
    mat.disableLighting = true;
    mat.backFaceCulling = false;
    mat.useAlphaFromDiffuseTexture = true;
    plane.material = mat;

    // Position above object
    const bounds = objectMesh.getBoundingInfo();
    const objHeight = bounds
      ? (bounds.boundingBox.maximumWorld.y - bounds.boundingBox.minimumWorld.y)
      : 1;
    plane.position = new Vector3(0, objHeight + 0.8, 0);
    plane.parent = objectMesh;
    plane.billboardMode = Mesh.BILLBOARDMODE_ALL;
    plane.isPickable = true;

    // Start hidden — show on hover
    plane.isVisible = false;

    // Hover to show label
    if (!objectMesh.actionManager) {
      objectMesh.actionManager = new ActionManager(this.scene);
    }
    objectMesh.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
        plane.isVisible = true;
      })
    );
    objectMesh.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
        plane.isVisible = false;
      })
    );

    // Click to add to vocabulary
    objectMesh.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
        this.onObjectInteracted?.(data);
      })
    );

    this.objectLabels.set(data.objectId, { mesh: plane, visible: false });
  }

  /**
   * Refresh all signs when fluency changes (e.g., after a conversation)
   */
  public refreshSigns(signDataMap: Map<string, BuildingSignData>): void {
    // Remove old signs
    this.signMeshes.forEach((mesh) => {
      const parent = mesh.parent;
      mesh.dispose();
      if (parent && parent instanceof AbstractMesh) {
        const data = signDataMap.get((parent as Mesh).metadata?.buildingId);
        if (data) {
          this.createBuildingSign(parent as AbstractMesh, data);
        }
      }
    });
  }

  // --- Callbacks ---

  public setOnSignClicked(cb: (data: BuildingSignData) => void): void {
    this.onSignClicked = cb;
  }

  public setOnObjectInteracted(cb: (data: InteractiveObjectData) => void): void {
    this.onObjectInteracted = cb;
  }

  // --- Helpers ---

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number, r: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  public dispose(): void {
    this.signMeshes.forEach(m => m.dispose());
    this.signMeshes.clear();
    this.objectLabels.forEach(({ mesh }) => mesh.dispose());
    this.objectLabels.clear();
  }
}
